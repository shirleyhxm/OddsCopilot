'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Category = 'career' | 'financial' | 'personal' | 'health' | 'relocation' | 'education'

const categories: { value: Category; label: string; icon: string }[] = [
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'financial', label: 'Financial', icon: '💰' },
  { value: 'personal', label: 'Personal', icon: '✨' },
  { value: 'health', label: 'Health', icon: '🏃' },
  { value: 'relocation', label: 'Relocation', icon: '🏠' },
  { value: 'education', label: 'Education', icon: '📚' },
]

const exampleDecisions: Record<Category, string> = {
  career: 'Should I leave my stable FAANG job to join an early-stage startup as employee #5?',
  financial: 'Should I invest my $50k savings in index funds or use it as a down payment on a rental property?',
  personal: 'Should I move across the country to be closer to family, even though I love my current city?',
  health: 'Should I invest in preventive health screenings now or wait until I have symptoms?',
  relocation: 'Should I move to a lower cost-of-living city to save money, or stay in my expensive city for career opportunities?',
  education: 'Should I pursue a part-time MBA while working, or wait until I can do it full-time?',
}

export default function NewDecisionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [category, setCategory] = useState<Category | null>(null)
  const [decision, setDecision] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initialize = async () => {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)
    }

    initialize()
  }, [router, supabase])

  const handleLoadExample = () => {
    if (category) {
      setDecision(exampleDecisions[category])
    }
  }

  const handleAnalyze = async () => {
    if (!decision.trim()) {
      setError('Please describe your decision')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      if (!userId) {
        throw new Error('Not authenticated')
      }

      // Load user profile for context from Supabase
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      let profileContext = ''
      if (profileData) {
        profileContext = `User context: ${profileData.life_stage} professional, ${profileData.risk_tolerance} risk tolerance. ${profileData.context || ''}`
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: decision + '\n\n' + profileContext,
          category,
        }),
      })

      // Read response as text first
      const responseText = await response.text()

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        // If we can't parse JSON, show the text response
        throw new Error(`Server error: ${responseText.substring(0, 200)}`)
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze decision')
      }

      // Save decision to Supabase
      const { data: savedDecision, error: saveError } = await supabase
        .from('decisions')
        .insert({
          user_id: userId,
          question: decision,
          category,
          decision_summary: data.analysis.decisionSummary,
          context: data.analysis.context,
          insider_prompt: data.analysis.insiderPrompt,
          scenarios: data.analysis.scenarios,
          key_factors: data.analysis.keyFactors,
          expected_value_score: data.analysis.expectedValueScore,
          sensitivity_note: data.analysis.sensitivityNote,
        })
        .select()
        .single()

      if (saveError) throw saveError

      // Save to sessionStorage for analysis page
      sessionStorage.setItem('currentAnalysis', JSON.stringify(data.analysis))
      sessionStorage.setItem('currentDecisionId', savedDecision.id)

      // Navigate to analysis page
      router.push(`/decision/${savedDecision.id}`)
    } catch (err: any) {
      console.error('Error analyzing decision:', err)
      setError(err.message || 'Failed to analyze decision')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const charCount = decision.length
  const maxChars = 500

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
            ODDSMERA
          </Link>
          <Link
            href="/dashboard"
            className="text-text3 text-sm hover:text-text2 transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-text mb-3">
            What are you deciding?
          </h1>
          <p className="text-text2 text-sm">
            I'll help you think through the probabilities and expected outcomes.
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <label className="block text-text3 text-xs uppercase tracking-wider mb-4">
            Category <span className="text-text3 normal-case">(optional)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  category === cat.value
                    ? 'bg-amber/5 border-amber'
                    : 'bg-bg2 border-border hover:border-border2'
                }`}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div
                  className={`text-sm font-medium ${
                    category === cat.value ? 'text-amber' : 'text-text'
                  }`}
                >
                  {cat.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Decision Input */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-text3 text-xs uppercase tracking-wider">
              Describe your decision
            </label>
            {category && (
              <button
                onClick={handleLoadExample}
                className="text-amber text-xs hover:underline"
              >
                Load example
              </button>
            )}
          </div>
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="E.g., Should I accept the job offer at the startup, or stay at my current company?"
            rows={6}
            maxLength={maxChars}
            className="w-full bg-bg3 border border-border text-text px-4 py-3 rounded-lg focus:outline-none focus:border-amber/50 transition-colors text-sm resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-text3 text-xs">
              Be as specific as possible about your situation and constraints.
            </div>
            <div className={`text-xs ${charCount > maxChars * 0.9 ? 'text-amber' : 'text-text3'}`}>
              {charCount}/{maxChars}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-dim border border-red/30 rounded-lg p-4">
            <div className="text-red text-sm">{error}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !decision.trim()}
          className={`w-full py-4 rounded-lg font-medium transition-all ${
            isAnalyzing || !decision.trim()
              ? 'bg-bg3 text-text3 cursor-not-allowed'
              : 'bg-amber hover:bg-amber/90 text-bg'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
              Analyzing probabilities...
            </span>
          ) : (
            'Analyze decision →'
          )}
        </button>
      </div>
    </div>
  )
}
