'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Scenario {
  id: string
  name: string
  description: string
  probability: number
  probabilityReasoning?: string
  value?: number
  valueLabel?: string
  color: 'orange' | 'green' | 'red' | 'yellow'
}

interface TryAnalysis {
  question: string
  category: string | null
  analysis: {
    decisionSummary: string
    context: string
    insiderPrompt?: string
    scenarios: Scenario[]
    keyFactors?: string[]
    expectedValueScore: number
    sensitivityNote?: string
  }
}

export default function TryResultPage() {
  const router = useRouter()
  const [tryData, setTryData] = useState<TryAnalysis | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('tryAnalysis')
    if (!stored) {
      router.push('/try')
      return
    }
    try {
      setTryData(JSON.parse(stored))
      // Show signup modal after a short delay so user sees the partial results first
      const timer = setTimeout(() => setShowModal(true), 2200)
      return () => clearTimeout(timer)
    } catch {
      router.push('/try')
    }
  }, [router])

  if (!tryData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text3 text-sm">Loading analysis...</div>
      </div>
    )
  }

  const { analysis } = tryData
  const visibleScenarios = analysis.scenarios.slice(0, 1)
  const lockedScenarios = analysis.scenarios.slice(1)

  const borderColors = {
    orange: 'border-l-amber',
    green: 'border-l-green',
    red: 'border-l-red',
    yellow: 'border-l-amber',
  }

  const mainColors = {
    orange: 'text-amber',
    green: 'text-green',
    red: 'text-red',
    yellow: 'text-amber',
  }

  const getStars = (value: number = 5) => {
    const filled = Math.round(value / 2)
    return '●'.repeat(filled) + '○'.repeat(5 - filled)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
            ODDSMERA
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/try"
              className="text-text3 text-sm hover:text-text2 transition-colors"
            >
              ← Try another
            </Link>
            <Link
              href="/login?signup=true"
              className="bg-amber hover:bg-amber/90 text-bg text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Sign up to unlock →
            </Link>
          </div>
        </div>
      </header>

      <div className="flex px-6 max-w-5xl mx-auto fade-in">
        {/* Main content */}
        <main className="flex-1 p-8 min-w-0">
          {/* Decision Reframe */}
          <div className="mb-8">
            <h2 className="text-text3 text-xs uppercase tracking-wider mb-3">
              Decision Reframe
            </h2>
            <h3 className="font-serif text-3xl text-text mb-4 leading-snug">
              {analysis.decisionSummary}
            </h3>
            <div className="border-l-4 border-amber/30 pl-4 py-2">
              <p className="text-text2 text-sm leading-relaxed">
                {analysis.context}
              </p>
            </div>
          </div>

          {/* Insider prompt */}
          {analysis.insiderPrompt && (
            <div className="mb-6">
              <p className="text-text2 text-[13px] leading-relaxed mb-3 font-light">
                Based on base rates, here are probability estimates for each scenario. Each number is grounded in real data — see the reasoning below.
              </p>
              <div className="bg-amber-dim border border-amber/25 rounded-lg p-3.5 text-[13px] text-text2 leading-snug">
                <strong className="text-amber font-medium">Do you know something I don't?</strong>{' '}
                {analysis.insiderPrompt}
              </div>
            </div>
          )}

          <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
            Probability Estimate
          </h3>

          {/* Visible scenario (first one) */}
          <div className="space-y-4 mb-4">
            {visibleScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`bg-bg2 border border-border ${borderColors[scenario.color]} border-l-4 rounded-lg p-6`}
              >
                <div className="mb-4">
                  <h4 className="text-text font-medium text-lg mb-2">{scenario.name}</h4>
                  <p className="text-text2 text-sm leading-relaxed">{scenario.description}</p>
                </div>

                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-[10px] tracking-widest uppercase bg-bg3 border border-border2 rounded-md px-2 py-0.5 text-text3">
                    Probability estimate
                  </span>
                  <span className={`font-serif text-[28px] font-light leading-none ${mainColors[scenario.color]}`}>
                    {scenario.probability}%
                  </span>
                </div>

                {scenario.probabilityReasoning && (
                  <p className="text-text2 text-xs leading-relaxed italic">
                    {scenario.probabilityReasoning}
                  </p>
                )}

                {scenario.valueLabel && (
                  <div className="flex items-center justify-between mt-3 text-xs border-t border-border pt-3">
                    <span className="text-text3">{scenario.valueLabel}</span>
                    <span className={mainColors[scenario.color]}>
                      {getStars(scenario.value)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Locked scenarios — blurred with gate overlay */}
          {lockedScenarios.length > 0 && (
            <div className="relative mb-8">
              <div className="space-y-4 select-none" style={{ filter: 'blur(6px)', pointerEvents: 'none' }}>
                {lockedScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`bg-bg2 border border-border ${borderColors[scenario.color]} border-l-4 rounded-lg p-6`}
                  >
                    <div className="mb-4">
                      <h4 className="text-text font-medium text-lg mb-2">{scenario.name}</h4>
                      <p className="text-text2 text-sm leading-relaxed">{scenario.description}</p>
                    </div>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="text-[10px] tracking-widest uppercase bg-bg3 border border-border2 rounded-md px-2 py-0.5 text-text3">
                        Probability estimate
                      </span>
                      <span className={`font-serif text-[28px] font-light leading-none ${mainColors[scenario.color]}`}>
                        {scenario.probability}%
                      </span>
                    </div>
                    {scenario.probabilityReasoning && (
                      <p className="text-text2 text-xs leading-relaxed italic">
                        {scenario.probabilityReasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Gate overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-bg via-bg/80 to-transparent rounded-lg">
                <div className="text-center px-6 py-8">
                  <div className="text-amber text-2xl mb-3">🔒</div>
                  <h4 className="text-text font-medium mb-2">
                    {lockedScenarios.length} more scenario{lockedScenarios.length > 1 ? 's' : ''} hidden
                  </h4>
                  <p className="text-text2 text-sm mb-5">
                    Sign up free to see all scenarios, adjust probabilities, and unlock the full insight.
                  </p>
                  <Link
                    href="/login?signup=true"
                    className="inline-block bg-amber hover:bg-amber/90 text-bg font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Sign up to unlock →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Key factors — blurred */}
          {analysis.keyFactors && analysis.keyFactors.length > 0 && (
            <div className="mb-8 relative">
              <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
                What drives these estimates
              </h3>
              <div className="flex flex-wrap gap-3 select-none" style={{ filter: 'blur(5px)', pointerEvents: 'none' }}>
                {analysis.keyFactors.map((factor, i) => (
                  <div key={i} className="px-4 py-2 bg-bg2 border border-border rounded-full text-text2 text-sm">
                    {factor}
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/login?signup=true"
                  className="text-amber text-sm hover:underline font-medium"
                >
                  Sign up to see key factors →
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="w-72 flex-shrink-0 border-l border-border p-8 sticky top-0 h-screen overflow-y-auto">
          {/* EV Score */}
          <div className="bg-bg2 border border-border rounded-lg p-6 mb-6">
            <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
              Expected Value Score
            </h3>
            <div className="text-amber text-7xl font-light mb-3">
              {analysis.expectedValueScore}
            </div>
            {analysis.sensitivityNote && (
              <p className="text-text2 text-sm">{analysis.sensitivityNote}</p>
            )}
          </div>

          {/* Probability Distribution */}
          <div className="bg-bg2 border border-border rounded-lg p-6 mb-6">
            <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
              Probability Distribution
            </h3>
            <div className="mb-4 h-3 flex rounded-full overflow-hidden">
              {analysis.scenarios.map((scenario) => {
                const colors = { orange: 'bg-amber', green: 'bg-green', red: 'bg-red', yellow: 'bg-amber' }
                return (
                  <div
                    key={scenario.id}
                    className={`${colors[scenario.color]} transition-all`}
                    style={{ width: `${scenario.probability}%` }}
                  />
                )
              })}
            </div>
            <div className="space-y-3">
              {analysis.scenarios.map((scenario, i) => {
                const dotColor = { orange: 'bg-amber', green: 'bg-green', red: 'bg-red', yellow: 'bg-amber' }
                const isLocked = i > 0
                return (
                  <div key={scenario.id} className={`flex items-center justify-between text-sm ${isLocked ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full ${dotColor[scenario.color]}`} />
                      <span className="text-text2 text-xs">{scenario.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLocked && <span className="text-text3 text-xs">🔒</span>}
                      <span className="text-text font-medium">{isLocked ? '—' : `${scenario.probability}%`}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Decision Intelligence — locked */}
          <div className="bg-bg2 border border-amber/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-amber rounded rotate-45" />
              </div>
              <h3 className="text-text font-medium">Decision intelligence</h3>
            </div>
            <p className="text-text2 text-sm mb-4 leading-relaxed">
              Sign up to adjust probability estimates and get a full analysis of what the math reveals — and what it misses.
            </p>
            <Link
              href="/login?signup=true"
              className="block w-full bg-amber hover:bg-amber/90 text-bg py-3 rounded-md font-medium text-sm transition-colors text-center"
            >
              Unlock full insight →
            </Link>
            <p className="text-text3 text-xs text-center mt-3">Free account, no credit card</p>
          </div>
        </aside>
      </div>

      {/* Signup modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-bg2 border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl fade-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-text3 hover:text-text2 text-xl leading-none"
            >
              ×
            </button>

            <div className="text-amber text-xs font-medium tracking-[0.3em] uppercase mb-4">
              ODDSMERA
            </div>

            <h2 className="font-serif text-3xl text-text mb-3 leading-tight">
              You just saw the tip of the iceberg
            </h2>
            <p className="text-text2 text-sm leading-relaxed mb-6">
              Sign up free to unlock all scenarios, adjust probabilities with your insider knowledge,
              and get the full decision insight.
            </p>

            <div className="space-y-3 mb-6">
              {[
                'See all probability scenarios',
                'Adjust estimates with your knowledge',
                'Unlock AI-generated decision insight',
                'Save and track decisions over time',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-full bg-green-dim border border-green/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green" />
                  </div>
                  <span className="text-text2">{benefit}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login?signup=true"
              className="block w-full bg-amber hover:bg-amber/90 text-bg font-medium py-4 rounded-lg transition-colors text-center mb-3"
            >
              Create free account →
            </Link>
            <button
              onClick={() => setShowModal(false)}
              className="block w-full text-text3 text-sm text-center hover:text-text2 transition-colors py-2"
            >
              Continue with limited preview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
