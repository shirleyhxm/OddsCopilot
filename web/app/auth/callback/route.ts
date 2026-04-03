import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/welcome'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has a profile
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // Redirect to dashboard if profile exists, welcome if not
        const redirectTo = profile ? '/dashboard' : '/welcome'
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  // Return to login if something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
