'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('This email is already registered. Please sign in instead.')
        } else {
          setMessage('Check your email for the confirmation link!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // Check if user has profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profile) {
            router.push('/dashboard')
          } else {
            router.push('/welcome')
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-amber text-xs font-medium tracking-[0.3em] uppercase mb-6">
            ODDSMERA
          </div>
          <h1 className="font-serif text-4xl text-text mb-3 leading-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-text2 text-sm">
            {isSignUp
              ? 'Sign up to sync your decisions across devices'
              : 'Sign in to access your decision history'
            }
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-text3 text-xs uppercase tracking-wider mb-3">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-bg3 border border-border text-text px-4 py-3 rounded-lg focus:outline-none focus:border-amber/50 transition-colors text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-text3 text-xs uppercase tracking-wider mb-3">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full bg-bg3 border border-border text-text px-4 py-3 rounded-lg focus:outline-none focus:border-amber/50 transition-colors text-sm"
            />
            {isSignUp && (
              <div className="text-text3 text-xs mt-2">
                Minimum 6 characters
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-dim border border-red/30 rounded-lg p-3">
              <p className="text-red text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-dim border border-green/30 rounded-lg p-3">
              <p className="text-green text-sm">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-medium transition-all ${
              loading
                ? 'bg-bg3 text-text3 cursor-not-allowed'
                : 'bg-amber hover:bg-amber/90 text-bg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>

          {/* Toggle Sign In/Sign Up */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setMessage('')
              }}
              className="text-text3 text-sm hover:text-text2 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        {/* Privacy Note */}
        <div className="mt-8 text-center text-text3 text-xs">
          <p>Your data is encrypted and secure.</p>
          <p>We never share your personal information.</p>
        </div>
      </div>
    </div>
  )
}
