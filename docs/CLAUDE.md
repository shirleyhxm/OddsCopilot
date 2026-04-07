# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ODDSMERA** is a probability copilot that helps users make better-informed decisions by making probability math visible and transparent. The core philosophy: not "AI tells you what to decide," but "AI makes the probability math visible so you can decide better."

## Commands

```bash
# Development
cd web && npm run dev        # Start dev server (localhost:3000)
cd web && npm run build      # Production build
cd web && npm start          # Start production server
cd web && npm run lint       # Run Next.js linter

# Legacy CLI (in root, not actively used)
npm run build               # Build TypeScript CLI
npm run dev                 # Run CLI demo
```

## Architecture

### Tech Stack
- **Next.js 14** with App Router (file-based routing)
- **TypeScript** throughout
- **Tailwind CSS** with custom design system
- **Anthropic Claude API** (Haiku 4.5 model: `claude-haiku-4-5-20251001`)
- **Supabase** - PostgreSQL database with authentication and Row Level Security
- **Data persistence** - Supabase for user data, sessionStorage for API keys

### Application Flow

1. **Authentication** (`/login`) → Sign up or sign in
2. **Welcome Flow** (`/welcome`) → Profile Setup (new users only)
3. **Dashboard** (`/dashboard`) → Decision History
4. **New Decision** (`/new-decision`) → Decision Input
5. **Analysis** (`/decision/[id]`) → Probability Estimation & Insight Generation

### Key Directories

**`web/app/`** - Next.js App Router pages
- `page.tsx` - Root redirect (checks auth and profile)
- `login/` - Authentication (sign up/sign in)
- `auth/callback/` - Email confirmation handler
- `welcome/` - Profile onboarding
- `dashboard/` - Decision history and stats
- `new-decision/` - Decision input form
- `decision/[id]/` - Analysis page with probability sliders
- `profile/` - Profile management
- `analyze/` - (Legacy, may still be referenced)

**`web/app/api/`** - Server-side API routes
- `analyze/route.ts` - Main analysis endpoint (calls Claude API)
- `generate-insight/route.ts` - Deeper insight generation
- `test-connection/route.ts` - API key validation

**`web/lib/`**
- `ai/prompt.ts` - Claude prompt templates and interfaces
- `supabase/client.ts` - Browser-side Supabase client
- `supabase/server.ts` - Server-side Supabase client with cookie handling
- `models/` - Decision, Scenario, Outcome classes (legacy CLI)
- `engine/` - EV calculator, comparison engine (legacy CLI)

**Database Schema** (`web/supabase-schema.sql`)**
- Complete PostgreSQL schema with Row Level Security
- Auto-generated UUIDs and timestamps
- JSONB fields for flexible data storage

### Data Model

**User Profile** (Supabase: `profiles` table):
```typescript
{
  name: string
  lifeStage: 'early-career' | 'mid-career' | 'senior' | 'transitioning' | 'other'
  riskTolerance: 'conservative' | 'moderate' | 'growth-oriented'
  context: string
  createdAt: string
}
```

**Decision** (Supabase: `decisions` table):
```typescript
{
  id: string
  question: string
  category?: string
  createdAt: string
  decisionSummary: string        // AI-generated reframe
  context: string                // Base rate context
  insiderPrompt: string          // Personalized question about insider knowledge
  scenarios: Scenario[]
  keyFactors: string[]
  expectedValueScore: number
  sensitivityNote: string
  outcome?: {                    // Logged 3+ months later
    selectedScenario: string
    actualDate: string
    notes: string
  }
  insight?: string               // Generated after probability adjustment
}
```

**Scenario**:
```typescript
{
  id: string
  name: string                   // 4 words max
  description: string            // 20 words, 3-year outcome
  probability: number            // 0-100 (not 0-1 fraction)
  probabilityReasoning: string   // Why this probability (base rate/data)
  value: number                  // 0-10 scale
  valueLabel: string             // Why this value
  color: 'orange' | 'green' | 'red' | 'yellow'
}
```

### AI Integration Pattern

1. **Analysis Request** → `/api/analyze`
   - User provides decision + profile context
   - Calls Claude with `buildDecisionAnalysisPrompt()`
   - Returns JSON with scenarios, reasoning, insider prompt
   - Model: `claude-haiku-4-5-20251001`, max_tokens: 1200

2. **Insight Generation** → `/api/generate-insight`
   - After user adjusts probabilities
   - Generates 2-3 paragraph non-prescriptive analysis
   - Model: `claude-haiku-4-5-20251001`, max_tokens: 1024

### Prompt Engineering

Located in `web/lib/ai/prompt.ts`:

**Key principles:**
- Concise prompt (simplified from original verbose version)
- Requests raw JSON (no markdown fences)
- Demands base rate reasoning for each probability
- Includes `insiderPrompt` to personalize insider knowledge question
- 2-4 scenarios, probabilities sum to 100%

### State Management

**Supabase Database** (persistent, server-side):
- `profiles` table - User profile data with RLS
- `decisions` table - All decision records with RLS
- Row Level Security ensures users only access their own data

**sessionStorage** (temporary, client-side):
- `apiKey` - Anthropic API key (never persisted to database)
- `currentAnalysis` - Current analysis data (for navigation)
- `currentDecisionId` - Current decision ID (for navigation)

**Authentication:**
- Cookie-based sessions via Supabase Auth
- Email/password authentication with email confirmation
- Automatic session refresh

### UI Architecture: Decision Analysis Page

The decision detail page (`/decision/[id]`) implements a **baseline vs. adjusted** pattern:

1. **Baseline Scenarios**: AI's original estimates (never mutated)
2. **Current Scenarios**: User's adjusted estimates
3. **Delta Pills**: Show `+X%` or `-X%` when user adjusts ≥2% from baseline
4. **Insider Prompt**: Contextual question asking what private knowledge user has

Example flow:
```
AI estimates: 35% probability for "Sustainable independence"
↓ (User has insider knowledge about team quality)
User adjusts: 50% probability
→ Shows: "+15% from my estimate" (green pill)
```

### Design System

**Colors** (Tailwind custom):
```
bg: #0C0D0E       bg2: #141517      bg3: #1C1E21      bg4: #212428
border: rgba(255,255,255,0.07)     border2: rgba(255,255,255,0.13)
text: #F0EDE8     text2: #9B9791    text3: #5E5C59
amber: #E8A038    green: #5DC48A    red: #E05A5A      blue: #6EA8D4
```

**Typography**:
- Body: DM Sans (Google Fonts)
- Headings: Fraunces (Google Fonts, serif)
- Labels: Uppercase with tracking-wider

**Brand**: "ODDSMERA" (all caps, amber, letter-spacing: 0.3em)

### Calibration Tracking

Users can log outcomes 3+ months after decisions:
1. Select which scenario actually happened
2. Add reflection notes
3. System calculates calibration score (placeholder logic currently)

This enables tracking prediction accuracy over time.

### Legacy CLI

The root `src/` directory contains a TypeScript CLI implementation with:
- Probability models (Outcome, Scenario, Decision)
- Expected value calculator
- Comparison engine
- Example decisions

**Note**: This is mostly unused. The web interface is the primary application.

## Important Conventions

### API Key Handling
- Always stored in sessionStorage (never localStorage)
- Passed directly to Anthropic API (never logged or persisted server-side)
- User must re-enter after closing browser

### Probability Format
- UI displays as integers (0-100%)
- AI generates integers (not 0-1 fractions)
- Sliders use 0-100 range

### Scenario Colors
- Distribute across: orange, green, red, yellow
- Used for left border accent and text colors
- No semantic meaning (not tied to positive/negative)

### Decision Storage
- All decisions stored in localStorage array
- No backend database
- Each decision gets unique timestamp-based ID

## Common Patterns

### Adding a New Page
1. Create `app/your-route/page.tsx`
2. Use `'use client'` directive for interactivity
3. Import consistent header with "ODDSMERA" link
4. Check for authentication and redirect to `/login` if not authenticated
5. Load user data from Supabase using `supabase.auth.getUser()`

### Modifying AI Prompts
1. Edit `web/lib/ai/prompt.ts`
2. Update `AIDecisionAnalysis` or `AIScenario` interfaces
3. Test with reduced `max_tokens` to control cost
4. Verify JSON parsing in API route

### Updating Design System
1. Modify `web/tailwind.config.ts` for new colors
2. Update `web/app/globals.css` for global styles
3. Maintain consistency with existing text sizes and spacing

### Supabase Configuration

**Environment Variables** (`web/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-api-key
```

**Client-side usage:**
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Get authenticated user
const { data: { user } } = await supabase.auth.getUser()

// Query with automatic RLS
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

**Server-side usage** (for API routes or Server Components):
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()

// Same API, but with cookie-based session
```

**Setup Instructions:**
See `docs/SUPABASE_SETUP.md` for complete setup guide including:
- Creating a Supabase project
- Running the database schema
- Configuring email authentication
- Environment variable setup
- Vercel deployment configuration

### Email Confirmation Flow

**Solution**: Client-side callback handler that works reliably:

1. **Supabase Email Template** uses `{{ .ConfirmationURL }}`
   - Confirms email server-side on Supabase
   - Redirects to app with session token in URL hash

2. **Client Callback Page** (`web/app/auth/callback/page.tsx`)
   - Waits for Supabase SDK to parse hash and establish session
   - Verifies session exists before redirecting
   - Shows errors if auth fails

3. **Environment Setup**
   - `NEXT_PUBLIC_SITE_URL` in `.env.production` must be production URL
   - Supabase Site URL must match (no trailing `/welcome` or other paths)
   - Redirect URLs must include exact `/auth/callback` path

**Key Learnings**:
- Don't use preview deployment URLs (they change per deploy)
- `{{ .ConfirmationURL }}` is required for proper email verification
- Client-side flow avoids PKCE code verifier cross-device issues
- Always wait ~1000ms for Supabase SDK to process hash tokens

### Working with Decisions
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Load decisions for current user
const { data: { user } } = await supabase.auth.getUser()
const { data: decisions } = await supabase
  .from('decisions')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// Update specific decision
const { error } = await supabase
  .from('decisions')
  .update({ scenarios: updatedScenarios })
  .eq('id', decisionId)

// Insert new decision
const { data, error } = await supabase
  .from('decisions')
  .insert({
    user_id: user.id,
    question: 'Should I...',
    scenarios: [...],
    // ... other fields
  })
  .select()
  .single()
```

## Philosophy (Critical for AI Development)

When modifying prompts or UI:

**DO:**
- Make probability math transparent and visible
- Cite base rates and research in AI reasoning
- Acknowledge uncertainty explicitly
- Respect user's judgment and insider knowledge
- Present options without prescribing choices

**DON'T:**
- Tell users what to decide
- Pretend to have precision beyond what's realistic
- Ignore non-quantifiable factors
- Replace human judgment with pure math
- Use confident language without evidence

This isn't a typical "AI recommends best option" tool. It's a **thinking tool** that surfaces probability math so humans can decide better.
