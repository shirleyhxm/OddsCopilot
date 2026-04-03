import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    console.log('[Auth Callback] Starting - code present:', !!code)

    if (!code) {
      console.log('[Auth Callback] No code provided')
      return NextResponse.redirect(`${origin}/login?error=no_code`)
    }

    // Track cookies to be set
    const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = []

    console.log('[Auth Callback] Creating Supabase client')

    // Create Supabase client for edge runtime
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookiesToSet.push({ name, value, options })
          },
          remove(name: string, options: CookieOptions) {
            cookiesToSet.push({ name, value: '', options })
          },
        },
      }
    )

    console.log('[Auth Callback] Exchanging code for session')
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback] Exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    console.log('[Auth Callback] Session exchange successful, getting user')

    // Check if user has a profile
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('[Auth Callback] Get user error:', userError)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(userError.message)}`)
    }

    if (!user) {
      console.error('[Auth Callback] No user after auth exchange')
      return NextResponse.redirect(`${origin}/login?error=no_user`)
    }

    console.log('[Auth Callback] User retrieved, checking profile')

    // Check if profile exists
    let redirectTo = '/welcome'
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected for new users
        console.error('[Auth Callback] Profile query error:', profileError)
      }

      redirectTo = profile ? '/dashboard' : '/welcome'
      console.log('[Auth Callback] Redirecting to:', redirectTo)
    } catch (profileCheckError) {
      console.error('[Auth Callback] Profile check failed:', profileCheckError)
      // Continue with welcome page redirect
    }

    // Create redirect response
    const redirectResponse = NextResponse.redirect(`${origin}${redirectTo}`)

    // Apply all cookies that were set during auth operations
    console.log('[Auth Callback] Applying', cookiesToSet.length, 'cookies')
    cookiesToSet.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options)
    })

    return redirectResponse
  } catch (error) {
    console.error('[Auth Callback] Fatal error:', error, 'Stack:', error instanceof Error ? error.stack : 'no stack')
    try {
      const { origin } = new URL(request.url)
      const errorMessage = error instanceof Error ? error.message : String(error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
    } catch (redirectError) {
      // If even the redirect fails, return a basic response
      console.error('[Auth Callback] Redirect failed:', redirectError)
      return new NextResponse('Authentication callback failed', { status: 500 })
    }
  }
}
