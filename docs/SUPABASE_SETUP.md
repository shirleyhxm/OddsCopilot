# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/sign in
3. Click "New Project"
4. Fill in:
   - **Name**: oddsmera (or your choice)
   - **Database Password**: (save this somewhere safe)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your project dashboard, click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long key under "Project API keys")

## Step 3: Add Environment Variables

1. In your project root, copy `.env.local.example` to `.env.local`:
   ```bash
   cp web/.env.local.example web/.env.local
   ```

2. Edit `web/.env.local` and add your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Run Database Schema

1. In Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `web/supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned"

## Step 5: Configure Email Authentication

1. Click "Authentication" in the left sidebar
2. Click "Providers"
3. Find "Email" and make sure it's enabled (should be by default)
4. (Optional) Click "Email Templates" to customize signup/reset emails

## Step 6: Restart Your Dev Server

```bash
cd web
npm run dev
```

## Step 7: Test It Out!

1. Go to http://localhost:3000
2. You should be redirected to `/login`
3. Try signing up with an email and password
4. Check your email for confirmation link
5. Click the link to confirm
6. You should be redirected to `/welcome`

## Troubleshooting

### "Invalid API key"
- Double-check your `.env.local` file
- Make sure you're using the **anon public** key, not the service_role key
- Restart your dev server after adding env variables

### "Email not confirmed"
- Check your spam folder
- In Supabase dashboard: Authentication > Users > find your user > click "..." > Confirm User

### "Database error"
- Make sure you ran the entire `supabase-schema.sql` file
- Check the SQL editor for error messages
- Try running it again (it's safe to re-run)

### "Localhost redirect not working"
- In Supabase dashboard: Authentication > URL Configuration
- Add `http://localhost:3000/**` to "Redirect URLs"

## Next Steps

Once everything is working:
- Your users can sign up and log in
- Their data is automatically saved to Supabase
- Data syncs across devices when they log in
- You can view/manage users in the Supabase dashboard

## Free Tier Limits

- 500MB database storage
- 2GB bandwidth/month
- 50,000 monthly active users
- Project pauses after 1 week of inactivity (auto-resumes)

This should be plenty for initial development and early users!

## Migration Status

### ✅ Fully Migrated to Supabase

All application features now use Supabase for data persistence. **localStorage is no longer used for storing user data.**

**Authentication:**
- Email/password authentication via Supabase Auth
- Email confirmation flow
- Session management with cookies

**Pages Updated:**
1. **Root page (`/`)** - Auth check and routing
2. **Login page (`/login`)** - Sign up and sign in with Supabase
3. **Auth callback (`/auth/callback`)** - Email confirmation handler
4. **Welcome page (`/welcome`)** - Saves profile to Supabase
5. **Dashboard (`/dashboard`)** - Loads profile and decisions from Supabase
6. **Profile page (`/profile`)** - Loads and updates profile in Supabase
7. **New decision (`/new-decision`)** - Saves new decisions to Supabase
8. **Decision detail (`/decision/[id]`)** - Loads and updates decisions in Supabase

**Features:**
- User profiles stored in `profiles` table
- Decisions stored in `decisions` table
- Probability adjustments saved to database
- Outcome logging saved to database
- Insight generation saved to database
- Profile reset deletes all user data and signs out

### Database Schema

Two main tables with Row Level Security (RLS):

**`profiles`**
- Stores user profile information (name, life_stage, risk_tolerance, context)
- RLS: Users can only access their own profile

**`decisions`**
- Stores all decision records with scenarios, outcomes, and insights
- JSONB fields for flexible scenario and outcome data
- RLS: Users can only access their own decisions

### Security

- All database access goes through Supabase RLS policies
- Users can only read/write their own data
- API keys stored in sessionStorage (never in database)
- Publishable API key is safe for client-side use
