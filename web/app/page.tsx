'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // No authenticated user, redirect to login
        router.push('/login')
        return
      }

      // Check if user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // User has profile, redirect to dashboard
        router.push('/dashboard')
      } else {
        // New user, redirect to welcome to create profile
        router.push('/welcome')
      }
    }

    checkAuth()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-text3">Loading...</div>
    </div>
  )
}
