'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')

      if (!code) {
        setError('No authentication code provided')
        setTimeout(() => router.push('/login?error=no_code'), 2000)
        return
      }

      try {
        // Exchange code for session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('Auth exchange error:', exchangeError)
          setError(exchangeError.message)
          setTimeout(() => router.push(`/login?error=${encodeURIComponent(exchangeError.message)}`), 2000)
          return
        }

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('Get user error:', userError)
          setError(userError?.message || 'Failed to get user')
          setTimeout(() => router.push('/login?error=user_fetch_failed'), 2000)
          return
        }

        // Check if user has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // Redirect based on profile existence
        const redirectTo = profile ? '/dashboard' : '/welcome'
        router.push(redirectTo)
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setTimeout(() => router.push('/login?error=callback_failed'), 2000)
      }
    }

    handleAuthCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="text-amber text-xs font-medium tracking-[0.3em] uppercase mb-6">
          ODDSMERA
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="text-red text-lg">Authentication Error</div>
            <div className="text-text2 text-sm">{error}</div>
            <div className="text-text3 text-xs">Redirecting to login...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-text text-lg">Confirming your email...</div>
            <div className="w-12 h-12 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
