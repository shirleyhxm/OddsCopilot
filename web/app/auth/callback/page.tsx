'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if there's a hash with token data (implicit flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (type === 'signup' && accessToken && refreshToken) {
      // Email confirmed successfully, redirect to welcome
      router.push('/welcome')
    } else if (type === 'recovery') {
      // Password recovery flow
      router.push('/reset-password')
    } else {
      // Check URL params for error
      const urlParams = new URLSearchParams(window.location.search)
      const errorDescription = urlParams.get('error_description')

      if (errorDescription) {
        setError(errorDescription)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        // No token in hash, redirect to welcome anyway
        router.push('/welcome')
      }
    }
  }, [router])

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
