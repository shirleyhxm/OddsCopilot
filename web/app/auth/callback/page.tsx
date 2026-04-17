'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (errorParam || errorDescription) {
          console.error('Auth error from URL:', errorParam, errorDescription)
          router.push(`/login?error=${errorParam || 'auth_failed'}`)
          return
        }

        if (code) {
          console.log('📧 Email confirmation code received, exchanging for session...')

          // Exchange code for session (client-side, can access cookies)
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Client-side code exchange error:', exchangeError)
            setError(exchangeError.message)
            router.push(`/login?error=exchange_failed`)
            return
          }

          if (data.session) {
            console.log('✅ Client-side session established:', data.session.user.email)

            // Get trial decision ID from user metadata
            const trialId = data.session.user.user_metadata?.trial_decision_id
            console.log('🔍 Trial ID from user metadata:', trialId)

            // Check if user has a profile (existing user vs new user)
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', data.session.user.id)
              .single()

            if (profile) {
              // Existing user - redirect to dashboard
              router.push('/dashboard')
            } else {
              // New user - redirect to welcome page with trial ID if present
              const welcomeUrl = trialId ? `/welcome?trial=${trialId}` : '/welcome'
              router.push(welcomeUrl)
            }
            return
          }
        }

        // If no code, redirect to login
        router.push('/login')
      } catch (err: any) {
        console.error('Callback error:', err)
        setError(err.message)
        router.push('/login?error=callback_failed')
      }
    }

    handleCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-amber text-xs font-medium tracking-[0.3em] uppercase mb-6">
          ODDSMERA
        </div>
        {error ? (
          <div>
            <p className="text-red text-sm mb-4">Authentication failed</p>
            <p className="text-text3 text-xs">{error}</p>
          </div>
        ) : (
          <div>
            <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text2 text-sm">Confirming your email...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text3 text-sm">Loading...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
