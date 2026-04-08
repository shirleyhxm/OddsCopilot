'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type LifeStage = 'early-career' | 'mid-career' | 'senior' | 'transitioning' | 'other'
type RiskTolerance = 'conservative' | 'moderate' | 'growth-oriented'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null)
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance | null>(null)
  const [context, setContext] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)

        // Load profile from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Failed to load profile:', profileError)
          router.push('/welcome')
          return
        }

        if (profileData) {
          setName(profileData.name || '')
          setLifeStage(profileData.life_stage)
          setRiskTolerance(profileData.risk_tolerance)
          setContext(profileData.context || '')
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        router.push('/welcome')
      }
    }

    loadProfile()
  }, [router, supabase])

  const handleSave = async () => {
    if (!lifeStage || !riskTolerance || !userId) {
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: name || 'Friend',
          life_stage: lifeStage,
          risk_tolerance: riskTolerance,
          context: context,
        })

      if (updateError) throw updateError

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile')
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset all your data? This will delete your account, profile, and all decision history. You will be signed out.')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete all decisions first (due to foreign key constraints)
      await supabase
        .from('decisions')
        .delete()
        .eq('user_id', user.id)

      // Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      // Sign out
      await supabase.auth.signOut()

      // Clear any local storage
      localStorage.clear()
      sessionStorage.clear()

      router.push('/login')
    } catch (err) {
      console.error('Error resetting data:', err)
      alert('Failed to reset data. Please try again.')
    }
  }

  const lifeStages: { value: LifeStage; label: string }[] = [
    { value: 'early-career', label: 'Early-career' },
    { value: 'mid-career', label: 'Mid-career' },
    { value: 'senior', label: 'Senior' },
    { value: 'transitioning', label: 'Transitioning' },
    { value: 'other', label: 'Other' },
  ]

  const riskOptions: { value: RiskTolerance; label: string; description: string; icon: string }[] = [
    {
      value: 'conservative',
      label: 'Conservative',
      description: 'Protect what I have',
      icon: '🛡️',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: 'Calculated bets',
      icon: '⚖️',
    },
    {
      value: 'growth-oriented',
      label: 'Growth-oriented',
      description: 'Optimize for upside',
      icon: '🚀',
    },
  ]

  const canSubmit = lifeStage && riskTolerance

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text3">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
            ODDSMERA
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-text3 text-sm hover:text-text2 transition-colors"
            >
              ← Back to dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-text3 text-sm hover:text-text2 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-text mb-3">
            Your profile
          </h1>
          <p className="text-text2 text-sm">
            Update your information to help me give you better-calibrated scenarios.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Name (Optional) */}
          <div>
            <label className="block text-text3 text-xs uppercase tracking-wider mb-3">
              What should I call you? <span className="text-text3 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-bg3 border border-border text-text px-4 py-3 rounded-lg focus:outline-none focus:border-amber/50 transition-colors text-sm"
            />
          </div>

          {/* Life Stage */}
          <div>
            <label className="block text-text3 text-xs uppercase tracking-wider mb-3">
              Life stage
            </label>
            <div className="flex flex-wrap gap-2">
              {lifeStages.map((stage) => (
                <button
                  key={stage.value}
                  onClick={() => setLifeStage(stage.value)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    lifeStage === stage.value
                      ? 'bg-amber/10 border-amber text-amber'
                      : 'bg-bg2 border-border text-text2 hover:border-border2'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Tolerance */}
          <div>
            <label className="block text-text3 text-xs uppercase tracking-wider mb-3">
              Risk tolerance
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {riskOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRiskTolerance(option.value)}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    riskTolerance === option.value
                      ? 'bg-amber/5 border-amber'
                      : 'bg-bg2 border-border hover:border-border2'
                  }`}
                >
                  <div className="text-3xl mb-3">{option.icon}</div>
                  <div
                    className={`text-sm font-medium mb-1 ${
                      riskTolerance === option.value ? 'text-amber' : 'text-text'
                    }`}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-text3">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Life Context */}
          <div>
            <label className="block text-text3 text-xs uppercase tracking-wider mb-3">
              Life context <span className="text-text3 normal-case">(optional but helpful)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g. Two kids, mortgage, ~$80k savings. Want to stay in tech. Partner works full-time. Willing to take moderate career risk but not financial risk."
              rows={4}
              className="w-full bg-bg3 border border-border text-text px-4 py-3 rounded-lg focus:outline-none focus:border-amber/50 transition-colors text-sm resize-none"
            />
            <div className="text-text3 text-xs mt-2">
              This helps me generate more relevant scenarios for your decisions.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-dim border border-red/30 rounded-lg p-3">
              <p className="text-red text-sm">{error}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!canSubmit || isSaving}
            className={`w-full py-4 rounded-lg font-medium transition-all ${
              canSubmit && !isSaving
                ? 'bg-amber hover:bg-amber/90 text-bg'
                : 'bg-bg3 text-text3 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>

          {/* Danger Zone */}
          <div className="pt-8 border-t border-border">
            <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
              Danger Zone
            </h3>
            <button
              onClick={handleResetData}
              className="px-6 py-3 rounded-lg border border-red/30 text-red hover:bg-red/10 transition-all text-sm"
            >
              Reset all data
            </button>
            <p className="text-text3 text-xs mt-2">
              This will permanently delete your profile and all decision history.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
