'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function TryPage() {
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [decision, setDecision] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

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
      const response = await fetch('/api/try-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, category }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze decision')
      }

      // Store trial decision ID if provided (for cross-browser signup)
      if (data.trialDecisionId) {
        localStorage.setItem('trialDecisionId', data.trialDecisionId)
      }

      // Also store in localStorage as fallback (persists in same browser)
      localStorage.setItem('tryAnalysis', JSON.stringify({
        question: decision,
        category,
        analysis: data.analysis,
        trialDecisionId: data.trialDecisionId,
      }))

      router.push('/try/result')
    } catch (err: any) {
      console.error('Error analyzing decision:', err)
      setError(err.message || 'Failed to analyze decision. Please try again.')
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
          <Link href="/" className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
            ODDSMERA
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-text3 text-sm hover:text-text2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login?signup=true&from=try"
              className="bg-amber hover:bg-amber/90 text-bg text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 fade-in">
        {/* Title */}
        <div className="mb-10">
          <div className="inline-block bg-amber-dim border border-amber/20 text-amber text-xs font-medium tracking-wider uppercase px-3 py-1 rounded-full mb-4">
            Free preview
          </div>
          <h1 className="font-serif text-4xl text-text mb-3">
            What are you deciding?
          </h1>
          <p className="text-text2 text-sm">
            Describe your decision and get a probability breakdown — no sign up required.
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

        <p className="text-text3 text-xs text-center mt-4">
          Sign up to save decisions, adjust probabilities, and unlock the full insight.{' '}
          <Link href="/login?signup=true&from=try" className="text-amber hover:underline">
            Create free account →
          </Link>
        </p>
      </div>
    </div>
  )
}
