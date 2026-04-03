import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/welcome'

    if (code) {
      // Create response to set cookies
      const response = NextResponse.next()

      // Create Supabase client for edge runtime using request/response cookies
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              response.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              response.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      // Check if user has a profile
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('Get user error:', userError)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(userError.message)}`)
      }

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile query error:', profileError)
          // Profile might not exist yet, redirect to welcome
        }

        // Redirect to dashboard if profile exists, welcome if not
        const redirectTo = profile ? '/dashboard' : '/welcome'
        const redirectResponse = NextResponse.redirect(`${origin}${redirectTo}`)

        // Copy cookies from response to redirect response
        response.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie)
        })

        return redirectResponse
      }
    }

    // Return to login if something went wrong
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  } catch (error) {
    console.error('Callback route error:', error)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(String(error))}`)
  }
}
