# OddsCopilot Development Guide

This document contains important technical notes and constraints for the OddsCopilot project.

## Cloudflare Pages Deployment Constraints

### Edge Runtime Requirement

**IMPORTANT:** This project is deployed to Cloudflare Pages, which **requires all dynamic routes to use Edge runtime**.

### Anthropic API Integration

**DO NOT use the `@anthropic-ai/sdk` package in API routes.**

The Anthropic SDK has compatibility issues with Edge runtime:
- It imports Node.js built-in modules like `async_hooks` which are not available in Cloudflare Workers
- Using the SDK causes runtime errors: "No such module async_hooks"

**Solution:** Use direct `fetch` calls to the Anthropic API instead:

```typescript
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  // Extract response from data.content[0].text
}
```

### All API Routes Must Use Edge Runtime

All routes in `/app/api/` must have:
```typescript
export const runtime = 'edge';
```

Routes without this declaration or using `nodejs` runtime will fail during Cloudflare Pages deployment.

## Related Files

- `/web/app/api/analyze/route.ts` - Decision analysis endpoint
- `/web/app/api/generate-insight/route.ts` - Insight generation endpoint
- `/web/app/api/test-connection/route.ts` - API key validation endpoint
- `wrangler.toml` - Cloudflare configuration

## Build Process

- **Local development:** `npm run dev`
- **Cloudflare build:** `npm run build:cloudflare`
- Build tool: `@opennextjs/cloudflare`
- Output directory: `web/.open-next`
