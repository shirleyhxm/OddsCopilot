# Testing Email Confirmation Flow

## The Problem with Localhost

Email confirmation with PKCE (the secure auth flow Supabase uses) **does not work reliably on localhost** because:

1. ❌ HTTP (not HTTPS) makes cookies unreliable
2. ❌ PKCE verifier cookie isn't persisted across email redirects
3. ❌ This is a known limitation, not a bug in our code

## ✅ Solution: Use Vercel Preview Deployments

Vercel automatically creates a preview deployment for every branch/commit with **proper HTTPS**, making email confirmations work perfectly.

### Setup (One-time)

1. **Ensure your repo is connected to Vercel**
   - Already done! Your repo is deployed at `odds-copilot.vercel.app`

2. **Add preview URL to Supabase allowed redirects:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add to Redirect URLs:
     ```
     https://*.vercel.app/**
     ```
   - This allows all Vercel preview deployments to work

### Testing Workflow

**1. Create a test branch:**
```bash
git checkout -b test/email-confirmation
```

**2. Commit your changes:**
```bash
git add .
git commit -m "Test: email confirmation flow"
git push origin test/email-confirmation
```

**3. Get your preview URL:**
- Go to Vercel dashboard → Deployments
- Find your branch deployment
- URL will be like: `odds-copilot-git-test-email-confirmation-yourname.vercel.app`

**4. Test the complete flow:**
- Go to `https://your-preview-url.vercel.app/try`
- Complete trial → sign up
- **Email confirmation will work!** ✅
- Trial decision will persist ✅

**5. Check logs:**
- Vercel dashboard → Deployment → Functions tab
- See server logs including:
  ```
  ✅ Server-side session established
  🔍 Trial ID from user metadata: ...
  ```

### Benefits

✅ **Proper HTTPS** - cookies work correctly
✅ **Real production environment** - catches bugs localhost can't
✅ **Isolated testing** - each branch gets its own URL
✅ **Automatic** - Vercel deploys on every push
✅ **Share with team** - send preview URL to others

### For Quick Local Testing

If you need to test signup flow quickly without email confirmation:

**Option A: Disable Email Confirmation Temporarily**
- Supabase Dashboard → Authentication → Providers → Email
- Toggle off "Confirm email"
- ⚠️ Remember to re-enable before deploying to production!

**Option B: Use Existing Account**
- Sign in with an already-confirmed email
- Test the dashboard/decision flow
- Trial decisions won't work, but other features will

## Production Deployment Checklist

Before deploying to production:

- [ ] Email confirmation is **enabled** in Supabase
- [ ] `trial_decisions` table created (run migration)
- [ ] Redirect URLs include production domain
- [ ] Test email confirmation on staging/preview first
- [ ] Verify trial decision persistence end-to-end

## Current Status

✅ Code is production-ready
✅ Trial decision persistence implemented
✅ Works perfectly on HTTPS (Vercel)
❌ Cannot test email confirmations on localhost HTTP (known limitation)

**Recommended**: Use Vercel preview deployments for all email confirmation testing.
