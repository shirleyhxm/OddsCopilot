import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Let @supabase/ssr handle cookies automatically
  // It will use the right cookie settings for PKCE to work
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
