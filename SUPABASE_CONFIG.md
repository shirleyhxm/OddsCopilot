# Supabase Configuration for Cloudflare Pages

## Required Settings

### 1. Email Templates (Authentication → Email Templates)

Update the **Confirm signup** email template to use Supabase's confirmation URL:

**Redirect URL:**
```
{{ .ConfirmationURL }}
```

This uses Supabase's server-side confirmation endpoint which will handle the email verification and then redirect to your callback URL.

### 2. Redirect URLs (Authentication → URL Configuration)

Add the following allowed redirect URLs:

Production:
- `https://odds-copilot.pages.dev/auth/callback`

Local development:
- `http://localhost:3000/auth/callback`

### 3. Site URL

Set the **Site URL** to your production URL:
```
https://odds-copilot.pages.dev
```

## Why Implicit Flow?

The PKCE (code) flow stores a code verifier in localStorage during signup. When users click the email confirmation link on a different device or browser, that verifier isn't available, causing errors.

The implicit flow (#access_token in URL hash) works across devices because the token is directly in the URL, not requiring any previously stored state.

## Testing

After making these changes:

1. Sign up with a new email
2. Click the confirmation link in your email
3. You should be redirected to `/welcome` with an authenticated session
