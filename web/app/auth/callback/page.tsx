'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for errors in URL params first
        const urlParams = new URLSearchParams(window.location.search)
        const errorDescription = urlParams.get('error_description')
        const errorCode = urlParams.get('error')

        if (errorDescription || errorCode) {
          setError(errorDescription || errorCode || 'Authentication failed')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        // Supabase automatically handles the token exchange from URL hash
        // Wait a bit for the SDK to process it
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check if we have an authenticated session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Failed to get session')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        if (session) {
          console.log('Session established, user:', session.user.email)
          // User is authenticated, redirect to welcome
          router.push('/welcome')
        } else {
          // No session, check if there's a token in the hash that we can use
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')

          if (accessToken) {
            console.log('Found access token in hash, waiting longer...')
            // Token exists but session not ready, wait a bit more
            await new Promise(resolve => setTimeout(resolve, 1500))

            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              router.push('/welcome')
              return
            }
          }

          console.error('No session established')
          setError('Authentication failed - please try logging in')
          setTimeout(() => router.push('/login'), 3000)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [router, supabase])

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
