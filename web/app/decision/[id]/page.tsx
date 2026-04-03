'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

interface Decision {
  id: string
  question: string
  category?: string
  createdAt: string
  decisionSummary: string
  context: string
  insiderPrompt?: string
  scenarios: Scenario[]
  keyFactors?: string[]
  expectedValueScore: number
  sensitivityNote?: string
  outcome?: {
    selectedScenario: string
    actualDate: string
    notes: string
  }
  insight?: string
}

export default function DecisionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const decisionId = params?.id as string

  const [decision, setDecision] = useState<Decision | null>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [baselineScenarios, setBaselineScenarios] = useState<Scenario[]>([])
  const [insight, setInsight] = useState<string>('')
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [insightError, setInsightError] = useState('')

  // Outcome logging state
  const [isLoggingOutcome, setIsLoggingOutcome] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [outcomeNotes, setOutcomeNotes] = useState('')

  useEffect(() => {
    if (!decisionId) return

    const loadDecision = async () => {
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Load decision from Supabase
        const { data: decisionData, error } = await supabase
          .from('decisions')
          .select('*')
          .eq('id', decisionId)
          .eq('user_id', user.id)
          .single()

        if (error || !decisionData) {
          console.error('Failed to load decision:', error)
          router.push('/dashboard')
          return
        }

        const formattedDecision: Decision = {
          id: decisionData.id,
          question: decisionData.question,
          category: decisionData.category,
          createdAt: decisionData.created_at,
          decisionSummary: decisionData.decision_summary,
          context: decisionData.context,
          insiderPrompt: decisionData.insider_prompt,
          scenarios: decisionData.scenarios || [],
          keyFactors: decisionData.key_factors,
          expectedValueScore: decisionData.expected_value_score,
          sensitivityNote: decisionData.sensitivity_note,
          outcome: decisionData.outcome,
          insight: decisionData.insight,
        }

        setDecision(formattedDecision)
        setScenarios(formattedDecision.scenarios || [])
        setBaselineScenarios(JSON.parse(JSON.stringify(formattedDecision.scenarios || [])))
        setInsight(formattedDecision.insight || '')
      } catch (error) {
        console.error('Error loading decision:', error)
        router.push('/dashboard')
      }
    }

    loadDecision()
  }, [decisionId, router, supabase])

  const handleGenerateInsight = async () => {
    const apiKey = sessionStorage.getItem('apiKey')

    if (!apiKey) {
      setInsightError('API key not found. Please return to dashboard and create a new decision.')
      return
    }

    setIsGeneratingInsight(true)
    setInsightError('')

    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: decision?.decisionSummary,
          scenarios: scenarios,
          apiKey,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate insight')
      }

      const newInsight = result.insight || 'No insight returned'
      setInsight(newInsight)

      // Save insight to decision
      updateDecision({ insight: newInsight })
    } catch (error: any) {
      console.error('Error generating insight:', error)
      setInsightError(error.message || 'Failed to generate insight')
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  const handleLogOutcome = () => {
    if (!selectedScenario) {
      return
    }

    const outcome = {
      selectedScenario,
      actualDate: new Date().toISOString(),
      notes: outcomeNotes,
    }

    updateDecision({ outcome })
    setIsLoggingOutcome(false)
  }

  const updateDecision = async (updates: Partial<Decision>) => {
    if (!decision) return

    try {
      // Map Decision interface fields to database column names
      const dbUpdates: any = {}
      if (updates.scenarios !== undefined) dbUpdates.scenarios = updates.scenarios
      if (updates.insight !== undefined) dbUpdates.insight = updates.insight
      if (updates.outcome !== undefined) dbUpdates.outcome = updates.outcome

      const { error } = await supabase
        .from('decisions')
        .update(dbUpdates)
        .eq('id', decisionId)

      if (error) throw error

      // Update local state
      setDecision({ ...decision, ...updates })
    } catch (error) {
      console.error('Failed to update decision:', error)
    }
  }

  const handleProbabilityChange = (index: number, newValue: number) => {
    const newScenarios = scenarios.map((s, i) =>
      i === index ? { ...s, probability: newValue } : s
    )
    setScenarios(newScenarios)
    updateDecision({ scenarios: newScenarios })
  }

  if (!decision) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text3">Loading...</div>
      </div>
    )
  }

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

  const totalProbability = scenarios.reduce((sum, s) => sum + s.probability, 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStars = (value: number = 5) => {
    const filled = Math.round(value / 2)
    return '●'.repeat(filled) + '○'.repeat(5 - filled)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
          ODDSMERA
        </Link>
        <h1 className="text-text2 text-sm flex-1 text-center max-w-xl mx-auto truncate px-4">
          {decision.question}
        </h1>
        <Link href="/dashboard" className="text-text3 text-sm hover:text-text2 transition-colors whitespace-nowrap">
          ← Dashboard
        </Link>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl">
          {/* Decision Reframe */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-text3 text-xs uppercase tracking-wider">
                Decision Reframe
              </h2>
              <span className="text-text3 text-xs">
                {formatDate(decision.createdAt)}
              </span>
            </div>
            <h3 className="font-serif text-3xl text-text mb-4 leading-snug">
              {decision.decisionSummary}
            </h3>
            <div className="border-l-4 border-amber/30 pl-4 py-2">
              <p className="text-text2 text-sm leading-relaxed">
                {decision.context}
              </p>
            </div>
          </div>

          {/* Outcome Display (if logged) */}
          {decision.outcome ? (
            <div className="mb-8 bg-green-dim border border-green/30 rounded-lg p-6">
              <h3 className="text-green text-xs uppercase tracking-wider mb-3">
                Outcome Logged
              </h3>
              <div className="text-text text-sm mb-2">
                <strong>What actually happened:</strong> {decision.outcome.selectedScenario}
              </div>
              <div className="text-text3 text-xs mb-2">
                Logged on {formatDate(decision.outcome.actualDate)}
              </div>
              {decision.outcome.notes && (
                <div className="text-text2 text-sm mt-3 pt-3 border-t border-green/20">
                  <div className="text-text3 text-xs mb-1">Reflection:</div>
                  {decision.outcome.notes}
                </div>
              )}
            </div>
          ) : (
            // Outcome Logging Form
            !isLoggingOutcome ? (
              <div className="mb-8 bg-amber-glow border border-amber/20 rounded-lg p-6">
                <h3 className="text-amber text-xs uppercase tracking-wider mb-3">
                  Ready to log outcome?
                </h3>
                <p className="text-text3 text-sm mb-4">
                  If it's been 3+ months, log which scenario actually happened to improve your calibration score.
                </p>
                <button
                  onClick={() => setIsLoggingOutcome(true)}
                  className="text-amber text-sm hover:underline"
                >
                  Log outcome →
                </button>
              </div>
            ) : (
              <div className="mb-8 bg-bg2 border border-border rounded-lg p-6">
                <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
                  What actually happened?
                </h3>
                <div className="space-y-3 mb-4">
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario.name)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedScenario === scenario.name
                          ? 'bg-amber/5 border-amber'
                          : 'bg-bg3 border-border hover:border-border2'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        selectedScenario === scenario.name ? 'text-amber' : 'text-text'
                      }`}>
                        {scenario.name}
                      </div>
                      <div className="text-text3 text-xs">{scenario.description}</div>
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-text3 text-xs uppercase tracking-wider mb-2">
                    Reflection notes <span className="normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    placeholder="What surprised you? What would you do differently?"
                    rows={3}
                    className="w-full bg-bg3 border border-border text-text px-4 py-3 rounded-lg focus:outline-none focus:border-amber/50 transition-colors text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleLogOutcome}
                    disabled={!selectedScenario}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      selectedScenario
                        ? 'bg-amber hover:bg-amber/90 text-bg'
                        : 'bg-bg3 text-text3 cursor-not-allowed'
                    }`}
                  >
                    Save outcome
                  </button>
                  <button
                    onClick={() => setIsLoggingOutcome(false)}
                    className="px-6 py-3 rounded-lg border border-border text-text3 hover:text-text2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          )}

          {/* Probability Estimate Section */}
          <div className="mb-6">
            <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
              Probability Estimate
            </h3>

            {/* Insider Prompt */}
            {decision.insiderPrompt && (
              <div className="mb-5">
                <p className="text-text2 text-[13px] leading-relaxed mb-3 font-light">
                  Based on base rates and your profile, here are my probability estimates for each scenario. Each number is grounded in real data — see the reasoning below each one.
                </p>
                <div className="bg-amber-dim border border-amber/25 rounded-lg p-3.5 text-[13px] text-text2 leading-snug">
                  <strong className="text-amber font-medium">Do you know something I don't?</strong> {decision.insiderPrompt}
                </div>
              </div>
            )}
          </div>

          {/* Scenario Cards */}
          <div className="space-y-4 mb-8">
            {scenarios.map((scenario, index) => {
              const baseline = baselineScenarios[index]
              const delta = scenario.probability - (baseline?.probability || 0)
              const showDelta = Math.abs(delta) >= 2

              return (
                <div
                  key={scenario.id}
                  className={`bg-bg2 border border-border ${borderColors[scenario.color]} border-l-4 rounded-lg p-6`}
                >
                  <div className="mb-4">
                    <h4 className="text-text font-medium text-lg mb-2">
                      {scenario.name}
                    </h4>
                    <p className="text-text2 text-sm leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  {/* AI Estimate Row */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-[10px] tracking-widest uppercase bg-bg3 border border-border2 rounded-md px-2 py-0.5 text-text3">
                      My estimate
                    </span>
                    <span className={`font-serif text-[28px] font-light leading-none ${mainColors[scenario.color]}`}>
                      {baseline?.probability || scenario.probability}%
                    </span>
                  </div>

                  {/* AI Reasoning */}
                  {scenario.probabilityReasoning && (
                    <p className="text-text2 text-xs leading-relaxed mb-3 italic">
                      {scenario.probabilityReasoning}
                    </p>
                  )}

                  {/* Divider */}
                  <hr className="border-0 border-t border-border my-3" />

                  {/* Your Estimate Label */}
                  <div className="text-[10px] tracking-widest uppercase text-text3 mb-1.5">
                    Your informed estimate
                  </div>

                  {/* Estimate Row with Slider and Delta */}
                  {!decision.outcome && (
                    <div className="flex items-center gap-2.5">
                      <span className={`font-serif text-xl font-light min-w-[44px] ${mainColors[scenario.color]}`}>
                        {scenario.probability}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scenario.probability}
                        onChange={(e) => handleProbabilityChange(index, parseInt(e.target.value))}
                        className="flex-1 h-1 bg-border rounded-lg appearance-none cursor-pointer slider"
                      />
                      {showDelta && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                          delta > 0
                            ? 'bg-green-dim text-green'
                            : 'bg-red-dim text-red'
                        }`}>
                          {delta > 0 ? '+' : ''}{delta}% from my estimate
                        </span>
                      )}
                    </div>
                  )}

                  {/* Value Row */}
                  {scenario.valueLabel && (
                    <div className="flex items-center justify-between mt-2.5 text-xs">
                      <span className="text-text3">{scenario.valueLabel}</span>
                      <span className={mainColors[scenario.color]}>
                        {getStars(scenario.value)}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Key Factors */}
          {decision.keyFactors && decision.keyFactors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
                What drives these estimates
              </h3>
              <div className="flex flex-wrap gap-3">
                {decision.keyFactors.map((factor: string, i: number) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-bg2 border border-border rounded-full text-text2 text-sm"
                  >
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Insight */}
          {insight && (
            <div className="bg-bg2 border border-border rounded-lg p-6 mb-8">
              <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
                Decision Insight
              </h3>
              <div className="text-text2 text-sm leading-relaxed whitespace-pre-line">
                {insight}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-96 border-l border-border p-8 sticky top-0 h-screen overflow-y-auto">
          {/* Expected Value Score */}
          <div className="bg-bg2 border border-border rounded-lg p-6 mb-6">
            <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
              Expected Value Score
            </h3>
            <div className="text-amber text-7xl font-light mb-3">
              {decision.expectedValueScore}
            </div>
            {decision.sensitivityNote && (
              <p className="text-text2 text-sm">
                {decision.sensitivityNote}
              </p>
            )}
          </div>

          {/* Probability Distribution */}
          <div className="bg-bg2 border border-border rounded-lg p-6 mb-6">
            <h3 className="text-text3 text-xs uppercase tracking-wider mb-4">
              Probability Distribution
            </h3>

            {/* Horizontal bar chart */}
            <div className="mb-4 h-3 flex rounded-full overflow-hidden">
              {scenarios.map((scenario) => {
                const colors = {
                  orange: 'bg-amber',
                  green: 'bg-green',
                  red: 'bg-red',
                  yellow: 'bg-amber',
                }
                return (
                  <div
                    key={scenario.id}
                    className={`${colors[scenario.color]} transition-all`}
                    style={{ width: `${scenario.probability}%` }}
                  />
                )
              })}
            </div>

            {/* Scenario list */}
            <div className="space-y-3">
              {scenarios.map((scenario) => {
                const dotColor = {
                  orange: 'bg-amber',
                  green: 'bg-green',
                  red: 'bg-red',
                  yellow: 'bg-amber',
                }
                return (
                  <div key={scenario.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full ${dotColor[scenario.color]}`} />
                      <span className="text-text2 text-xs">{scenario.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text font-medium">{scenario.probability}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Decision Intelligence */}
          {!decision.outcome && (
            <div className="bg-bg2 border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-amber rounded rotate-45" />
                </div>
                <h3 className="text-text font-medium">
                  Decision intelligence
                </h3>
              </div>
              <p className="text-text2 text-sm mb-4 leading-relaxed">
                Review the estimates above — adjust any you disagree with — then get the full analysis of what the math reveals and what it misses.
              </p>

              {insightError && (
                <div className="bg-red-dim border border-red/30 rounded-md p-3 mb-4">
                  <p className="text-red text-xs">{insightError}</p>
                </div>
              )}

              <button
                onClick={handleGenerateInsight}
                disabled={isGeneratingInsight}
                className="w-full bg-amber hover:bg-amber/90 text-bg py-3 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingInsight ? (
                  <>
                    <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate insight →'
                )}
              </button>
            </div>
          )}
        </aside>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #E8A038;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #E8A038;
        }
      `}</style>
    </div>
  )
}
