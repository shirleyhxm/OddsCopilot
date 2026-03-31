'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type LifeStage = 'early-career' | 'mid-career' | 'senior' | 'transitioning' | 'other'
type RiskTolerance = 'conservative' | 'moderate' | 'growth-oriented'

export default function WelcomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null)
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance | null>(null)
  const [context, setContext] = useState('')

  const handleSubmit = () => {
    // Save profile to localStorage
    const profile = {
      name: name || 'Friend',
      lifeStage,
      riskTolerance,
      context,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('userProfile', JSON.stringify(profile))
    localStorage.setItem('decisions', JSON.stringify([]))

    // Redirect to dashboard
    router.push('/dashboard')
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

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl fade-in">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="text-amber text-xs font-medium tracking-[0.3em] uppercase mb-6">
            ODDSMERA
          </div>
          <h1 className="font-serif text-5xl text-text mb-3 leading-tight">
            Your <em className="text-amber">personal</em> probability advisor.
          </h1>
          <p className="text-text2 text-sm">
            Help me understand your context so I can give you better-calibrated scenarios.
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
              placeholder="e.g. Two kids, mortgage, ~$80k savings. Want to stay in tech. Partner works full-time. Willing to take moderate career risk but not financial risk."
              rows={4}
              className="w-full bg-bg3 border border-border text-text px-4 py-3 rounded-lg focus:outline-none focus:border-amber/50 transition-colors text-sm resize-none"
            />
            <div className="text-text3 text-xs mt-2">
              This helps me generate more relevant scenarios for your decisions.
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-lg font-medium transition-all ${
              canSubmit
                ? 'bg-amber hover:bg-amber/90 text-bg'
                : 'bg-bg3 text-text3 cursor-not-allowed'
            }`}
          >
            {canSubmit ? 'Start advising me →' : 'Please select life stage and risk tolerance'}
          </button>
        </div>
      </div>
    </div>
  )
}
