import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle errors from Supabase
  if (error || errorDescription) {
    console.error('Auth error:', error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error || 'auth_failed'}`)
  }

  if (code) {
    const cookieStore = await cookies()

    // Debug: Log all cookies to see if PKCE verifier is present
    const allCookies = cookieStore.getAll()
    console.log('🍪 All cookies in callback:', allCookies.map(c => c.name).join(', '))
    const pkceVerifier = allCookies.find(c => c.name.includes('code-verifier'))
    console.log('🔍 PKCE verifier cookie:', pkceVerifier ? 'FOUND ✅' : 'MISSING ❌')

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value
            if (name.includes('code-verifier')) {
              console.log(`🔍 Getting ${name}:`, value ? 'exists' : 'missing')
            }
            return value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Cookie set error:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.error('Cookie remove error:', error)
            }
          },
        },
      }
    )

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Server-side code exchange error:', exchangeError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=exchange_failed`)
    }

    if (data.session) {
      console.log('✅ Server-side session established:', data.session.user.email)

      // Get trial decision ID from user metadata
      const trialId = data.session.user.user_metadata?.trial_decision_id
      console.log('🔍 Full user metadata:', JSON.stringify(data.session.user.user_metadata, null, 2))
      console.log('🔍 Trial ID from user metadata:', trialId)

      // Check if user has a profile (existing user vs new user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.session.user.id)
        .single()

      if (profile) {
        // Existing user - redirect to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      } else {
        // New user - redirect to welcome page with trial ID if present
        const welcomeUrl = trialId
          ? `${requestUrl.origin}/welcome?trial=${trialId}`
          : `${requestUrl.origin}/welcome`

        return NextResponse.redirect(welcomeUrl)
      }
    }
  }

  // If no code or exchange failed, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
