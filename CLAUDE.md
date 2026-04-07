# OddsCopilot Development Guide

This document contains important technical notes and constraints for the OddsCopilot project.

## Vercel Deployment

**IMPORTANT:** This project is deployed to Vercel, which natively supports Next.js and Edge runtime without any build adapters.

### Why Vercel?

- ✅ Native Next.js support (no adapters needed)
- ✅ Full Edge runtime compatibility
- ✅ No async_hooks issues
- ✅ Automatic deployments from GitHub
- ✅ Built-in analytics and monitoring

### Anthropic API Integration

**Use direct `fetch` calls instead of the `@anthropic-ai/sdk` package in Edge runtime routes.**

Why: The Anthropic SDK has compatibility issues with Edge runtime in some deployment environments.

**Solution:** Use direct `fetch` calls to the Anthropic API:

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

### API Routes Configuration

All routes in `/app/api/` use Edge runtime for optimal performance:
```typescript
export const runtime = 'edge';
```

## Related Files

- `/web/app/api/analyze/route.ts` - Decision analysis endpoint
- `/web/app/api/generate-insight/route.ts` - Insight generation endpoint
- `/web/app/api/test-connection/route.ts` - API key validation endpoint
- `vercel.json` - Vercel configuration

## Deployment

### Environment Variables

Set these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - Your production URL

### Deploy to Vercel

1. **Via Vercel CLI:**
   ```bash
   npx vercel
   ```

2. **Via GitHub Integration:**
   - Connect your repository to Vercel
   - Automatic deployments on every push to main

### Local Development

```bash
cd web
npm install
npm run dev
```

## Build Process

- **Local development:** `cd web && npm run dev`
- **Production build:** `cd web && npm run build`
- **Framework:** Next.js with native Vercel deployment
