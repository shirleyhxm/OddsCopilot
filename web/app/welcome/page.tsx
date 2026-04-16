'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type LifeStage = 'early-career' | 'mid-career' | 'senior' | 'transitioning' | 'other'
type RiskTolerance = 'conservative' | 'moderate' | 'growth-oriented'

function WelcomeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null)
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance | null>(null)
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasTryAnalysis, setHasTryAnalysis] = useState(false)
  const [trialDecisionId, setTrialDecisionId] = useState<string | null>(null)

  useEffect(() => {
    // Check for trial decision ID in URL params (works cross-browser)
    const trialId = searchParams.get('trial')
    console.log('Welcome page - trial ID from URL:', trialId)
    if (trialId) {
      console.log('✅ Found trial ID in URL params')
      setTrialDecisionId(trialId)
      setHasTryAnalysis(true)
    } else {
      // Fallback: check localStorage for same-browser scenario
      const tryAnalysisData = localStorage.getItem('tryAnalysis')
      const storedTrialId = localStorage.getItem('trialDecisionId')
      console.log('Welcome page - checking localStorage:', { tryAnalysisData: !!tryAnalysisData, storedTrialId })
      if (tryAnalysisData || storedTrialId) {
        setHasTryAnalysis(true)
        if (storedTrialId) {
          console.log('✅ Found trial ID in localStorage')
          setTrialDecisionId(storedTrialId)
        }
      }
    }
  }, [searchParams])

  const handleSubmit = async () => {
    if (!lifeStage || !riskTolerance) return

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Save profile to Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name || 'Friend',
          life_stage: lifeStage,
          risk_tolerance: riskTolerance,
          context: context,
        })

      if (profileError) throw profileError

      // Check if there's a trial decision to claim (prioritize server-side ID)
      let claimedDecisionId: string | null = null

      if (trialDecisionId) {
        console.log('Attempting to claim trial decision:', trialDecisionId)
        // Method 1: Claim trial decision from database (works cross-browser)
        try {
          // First, fetch the trial decision
          const { data: trialDecision, error: fetchError } = await supabase
            .from('trial_decisions')
            .select('*')
            .eq('id', trialDecisionId)
            .is('claimed_by_user_id', null)
            .single()

          console.log('Trial decision fetch result:', { trialDecision, fetchError })

          if (!fetchError && trialDecision) {
            // Save the trial decision as a real decision
            const { data: savedDecision, error: saveError } = await supabase
              .from('decisions')
              .insert({
                user_id: user.id,
                question: trialDecision.question,
                category: trialDecision.category,
                decision_summary: trialDecision.decision_summary,
                context: trialDecision.context,
                insider_prompt: trialDecision.insider_prompt,
                scenarios: trialDecision.scenarios,
                key_factors: trialDecision.key_factors,
                expected_value_score: trialDecision.expected_value_score,
                sensitivity_note: trialDecision.sensitivity_note,
              })
              .select()
              .single()

            console.log('Save decision result:', { savedDecision, saveError })

            if (!saveError && savedDecision) {
              // Mark the trial decision as claimed
              const { error: claimError } = await supabase
                .from('trial_decisions')
                .update({
                  claimed_by_user_id: user.id,
                  claimed_at: new Date().toISOString()
                })
                .eq('id', trialDecisionId)

              console.log('Claim trial decision result:', { claimError })

              claimedDecisionId = savedDecision.id

              // Clear localStorage
              localStorage.removeItem('tryAnalysis')
              localStorage.removeItem('trialDecisionId')

              console.log('✅ Trial decision claimed successfully! Redirecting to:', savedDecision.id)
            } else {
              console.error('Failed to save decision:', saveError)
            }
          } else {
            console.log('Trial decision not found or already claimed:', { fetchError })
          }
        } catch (err) {
          console.error('Error claiming trial decision:', err)
        }
      } else {
        console.log('No trial decision ID found')
      }

      // Method 2: Fallback to localStorage (same browser scenario)
      if (!claimedDecisionId) {
        const tryAnalysisData = localStorage.getItem('tryAnalysis')
        if (tryAnalysisData) {
          try {
            const tryAnalysis = JSON.parse(tryAnalysisData)

            const { data: savedDecision, error: saveError } = await supabase
              .from('decisions')
              .insert({
                user_id: user.id,
                question: tryAnalysis.question,
                category: tryAnalysis.category,
                decision_summary: tryAnalysis.analysis.decisionSummary,
                context: tryAnalysis.analysis.context,
                insider_prompt: tryAnalysis.analysis.insiderPrompt,
                scenarios: tryAnalysis.analysis.scenarios,
                key_factors: tryAnalysis.analysis.keyFactors,
                expected_value_score: tryAnalysis.analysis.expectedValueScore,
                sensitivity_note: tryAnalysis.analysis.sensitivityNote,
              })
              .select()
              .single()

            if (!saveError && savedDecision) {
              claimedDecisionId = savedDecision.id
              localStorage.removeItem('tryAnalysis')
              localStorage.removeItem('trialDecisionId')
            }
          } catch (err) {
            console.error('Error processing trial decision from localStorage:', err)
          }
        }
      }

      // Redirect to the claimed decision if available
      if (claimedDecisionId) {
        router.push(`/decision/${claimedDecisionId}`)
        return
      }

      // Redirect to dashboard (if no trial decision or if saving failed)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const canSubmit = lifeStage && riskTolerance

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl fade-in">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
              ODDSMERA
            </div>
            <button
              onClick={handleLogout}
              className="text-text3 text-xs hover:text-text2 transition-colors"
            >
              Log out
            </button>
          </div>
          <h1 className="font-serif text-5xl text-text mb-3 leading-tight">
            Your <em className="text-amber">personal</em> probability advisor.
          </h1>
          <p className="text-text2 text-sm">
            Help me understand your context so I can give you better-calibrated scenarios.
          </p>
          {hasTryAnalysis && (
            <div className="mt-4 bg-green-dim border border-green/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="text-green text-lg">✓</div>
                <div>
                  <div className="text-green text-sm font-medium mb-1">
                    Your trial decision will be saved!
                  </div>
                  <div className="text-text2 text-xs leading-relaxed">
                    Complete your profile and we'll save your decision analysis so you can access it anytime.
                  </div>
                </div>
              </div>
            </div>
          )}
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
              placeholder="e.g. Two kids, mortgage, ~$80k savings. Want to stay in tech. Partner works full-time. Willing to take moderate career risk but not financial risk."
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={`w-full py-4 rounded-lg font-medium transition-all ${
              canSubmit && !loading
                ? 'bg-amber hover:bg-amber/90 text-bg'
                : 'bg-bg3 text-text3 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                Saving profile...
              </span>
            ) : canSubmit ? (
              'Start advising me →'
            ) : (
              'Please select life stage and risk tolerance'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text3 text-sm">Loading...</div>
      </div>
    }>
      <WelcomeForm />
    </Suspense>
  )
}
