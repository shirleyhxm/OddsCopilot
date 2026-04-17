import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name: string, value: string, options: any) {
          let cookieString = `${name}=${value}`

          // Force SameSite=None for cross-site redirects (email confirmation)
          cookieString += '; SameSite=None; Secure'

          if (options?.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`
          }

          cookieString += '; Path=/'

          document.cookie = cookieString
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=None; Secure`
        },
      },
    }
  )
}
