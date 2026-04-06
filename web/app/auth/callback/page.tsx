'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Supabase automatically parses the hash and sets the session
    // We just need to wait for it to complete and then redirect

    const handleAuthCallback = async () => {
      // Check for errors in URL params
      const urlParams = new URLSearchParams(window.location.search)
      const errorDescription = urlParams.get('error_description')

      if (errorDescription) {
        setError(errorDescription)
        setTimeout(() => router.push('/login'), 3000)
        return
      }

      // Wait a moment for Supabase to parse the hash
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check if we have a session now
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // User is authenticated, redirect to welcome
        router.push('/welcome')
      } else {
        // No session established, something went wrong
        setError('Failed to establish session')
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
