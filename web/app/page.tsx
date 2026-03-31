'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a profile
    const storedProfile = localStorage.getItem('userProfile')

    if (storedProfile) {
      // User has profile, redirect to dashboard
      router.push('/dashboard')
    } else {
      // New user, redirect to welcome
      router.push('/welcome')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-text3">Loading...</div>
    </div>
  )
}
