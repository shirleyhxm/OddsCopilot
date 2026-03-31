'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Outcome {
  name: string
  probability: number
  value: number
  description: string
}

interface Scenario {
  id: string
  name: string
  description: string
  probability: number
  outcomeValue: string
  outcomes: Outcome[]
  color: 'orange' | 'green' | 'red' | 'yellow'
  expectedValue: number
}

const EXAMPLE_DATA: Record<string, any> = {
  'Startup vs. FAANG': {
    question: 'Should I stick to my toxic but well-paid full-time software engine...',
    reframe: 'What is the probability I succeed financially and emotionally by leaving DoorDash for entrepreneurship?',
    context: 'First-time software entrepreneurs have roughly 10-20% success rates (profitability within 3 years). However, 60% of software engineers who quit toxic jobs report improved mental health with zero income reduction. The median time to replace a senior engineer salary through business revenue is 18-24 months for those who achieve it.',
    scenarios: [
      {
        id: '1',
        name: 'Sustainable independence',
        description: 'Your business generates 70-100% of your DoorDash salary within 18 months. Better work-life balance, lower stress, creative fulfillment, but still working hard.',
        probability: 15,
        outcomeValue: 'High income replacement + mental health recovery + autonomy gained',
        expectedValue: 13.5,
        color: 'orange' as const,
        outcomes: []
      },
      {
        id: '2',
        name: 'Struggle then pivot',
        description: 'Business generates only 30-50% needed income after 12 months. You take another job, better than DoorDash, with renewed perspective and network.',
        probability: 40,
        outcomeValue: 'Career reset with lessons learned, modest financial setback, avoided burnout',
        expectedValue: -2.4,
        color: 'green' as const,
        outcomes: []
      },
      {
        id: '3',
        name: 'Stay and deteriorate',
        description: 'Remain at DoorDash. Burnout worsens, relationships suffer, health declines. Golden handcuffs tighten. High income but declining life satisfaction and career stagnation.',
        probability: 25,
        outcomeValue: 'Financial security maintained but mental health costs compound over time',
        expectedValue: -0.9,
        color: 'red' as const,
        outcomes: []
      },
      {
        id: '4',
        name: 'Failed launch, financial strain',
        description: 'Business fails within 9 months. Savings depleted. Must take lower-paying job urgently. Financial stress, confidence hit, but burnout cycle broken.',
        probability: 20,
        outcomeValue: 'Significant financial setback and ego hit, but escape from toxicity',
        expectedValue: -0.8,
        color: 'yellow' as const,
        outcomes: []
      },
    ],
    keyFactors: [
      'Current runway: months of expenses saved (6+ months dramatically improves odds)',
      'Validated demand: existing clients/users vs. untested idea',
      'Toxicity severity: burning out now vs. sustainable 6-12 more months',
      'Market timing: software services demand currently strong for experienced engineers',
    ],
    expectedValueScore: 5.4,
    sensitivityNote: 'Mixed expected value — outcome is highly sensitive to your probability estimates'
  }
}

export default function AnalyzePage() {
  const searchParams = useSearchParams()
  const example = searchParams?.get('example')

  const [data, setData] = useState<any>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [insight, setInsight] = useState<string>('')
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [insightError, setInsightError] = useState('')

  useEffect(() => {
    // First, try to load AI-generated analysis from sessionStorage
    const storedAnalysis = sessionStorage.getItem('currentAnalysis')

    if (storedAnalysis) {
      try {
        const analysis = JSON.parse(storedAnalysis)
        setData(analysis)
        setScenarios(analysis.scenarios)
        return
      } catch (error) {
        console.error('Failed to parse stored analysis:', error)
      }
    }

    // Fall back to example data if example parameter is present
    if (example) {
      const exampleData = EXAMPLE_DATA[example]
      if (exampleData) {
        setData(exampleData)
        setScenarios(exampleData.scenarios)
      }
    }
  }, [example])

  const handleGenerateInsight = async () => {
    const apiKey = sessionStorage.getItem('apiKey')

    if (!apiKey) {
      setInsightError('API key not found. Please return to home and enter your API key.')
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
          question: data.reframe,
          scenarios: scenarios,
          apiKey,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate insight')
      }

      console.log('Insight received:', result)
      console.log('Setting insight to:', result.insight)
      setInsight(result.insight || 'No insight returned')
    } catch (error: any) {
      console.error('Error generating insight:', error)
      setInsightError(error.message || 'Failed to generate insight')
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  const borderColors = {
    orange: 'border-l-primary',
    green: 'border-l-success',
    red: 'border-l-error',
    yellow: 'border-l-warning',
  }

  const dotColors = {
    orange: 'bg-primary',
    green: 'bg-success',
    red: 'bg-error',
    yellow: 'bg-warning',
  }

  // Recalculate total probability
  const totalProbability = scenarios.reduce((sum, s) => sum + s.probability, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-primary text-xs font-medium tracking-[0.3em] uppercase">
          ODDSMERA
        </Link>
        <h1 className="text-text-secondary text-sm flex-1 text-center max-w-xl mx-auto truncate px-4">
          {data.question}
        </h1>
        <Link href="/" className="text-text-muted text-sm hover:text-text-secondary transition-colors whitespace-nowrap">
          ← New decision
        </Link>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl">
          {/* Decision Reframe */}
          <div className="mb-8">
            <h2 className="text-text-muted text-xs uppercase tracking-wider mb-3">
              Decision Reframe
            </h2>
            <h3 className="font-serif text-3xl text-text-primary mb-4 leading-snug">
              {data.reframe}
            </h3>
            <div className="border-l-4 border-primary/30 pl-4 py-2">
              <p className="text-text-secondary text-sm leading-relaxed">
                {data.context}
              </p>
            </div>
          </div>

          {/* Scenarios Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-text-muted text-xs uppercase tracking-wider">
                Scenarios — Adjust Probabilities to Match Your Intuition
              </h3>
              {Math.abs(totalProbability - 100) > 1 && (
                <span className="text-warning text-xs">
                  Total: {totalProbability}% (adjust to 100%)
                </span>
              )}
            </div>
          </div>

          {/* Scenario Cards */}
          <div className="space-y-4 mb-8">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`bg-surface border border-border ${borderColors[scenario.color]} border-l-4 rounded-lg p-6 hover:border-primary/20 transition-colors`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-text-primary font-medium text-lg flex-1">
                    {scenario.name}
                  </h4>
                  <span className="text-primary text-4xl font-light ml-4">
                    {scenario.probability}%
                  </span>
                </div>

                <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                  {scenario.description}
                </p>

                {/* Probability Slider */}
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted text-xs">Probability</span>
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scenario.probability}
                        onChange={(e) => {
                          const newScenarios = scenarios.map(s =>
                            s.id === scenario.id
                              ? { ...s, probability: parseInt(e.target.value) }
                              : s
                          )
                          setScenarios(newScenarios)
                        }}
                        className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, ${scenario.color === 'orange' ? '#f59e0b' : scenario.color === 'green' ? '#10b981' : scenario.color === 'red' ? '#ef4444' : '#f59e0b'} 0%, ${scenario.color === 'orange' ? '#f59e0b' : scenario.color === 'green' ? '#10b981' : scenario.color === 'red' ? '#ef4444' : '#f59e0b'} ${scenario.probability}%, #3a3a3a ${scenario.probability}%, #3a3a3a 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-text-muted text-xs mb-3">
                  Outcome value: {scenario.outcomeValue}
                </div>

                {/* Dots indicator */}
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i < 3 ? dotColors[scenario.color] : 'bg-border'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key Factors */}
          {data.keyFactors && data.keyFactors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4">
                Key Factors Affecting Probability
              </h3>
              <div className="flex flex-wrap gap-3">
                {data.keyFactors.map((factor: string, i: number) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-surface border border-border rounded-full text-text-secondary text-sm"
                  >
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Insight */}
          {insight && (
            <div className="bg-surface border border-border rounded-lg p-6 mb-8">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4">
                Decision Insight
              </h3>
              <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                {insight}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-96 border-l border-border p-8 sticky top-0 h-screen overflow-y-auto">
          {/* Expected Value Score */}
          <div className="bg-surface border border-border rounded-lg p-6 mb-6">
            <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4">
              Expected Value Score
            </h3>
            <div className="text-primary text-7xl font-light mb-3">
              {data.expectedValueScore}
            </div>
            <p className="text-text-secondary text-sm">
              {data.sensitivityNote}
            </p>
          </div>

          {/* Probability Distribution */}
          <div className="bg-surface border border-border rounded-lg p-6 mb-6">
            <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4">
              Probability Distribution
            </h3>

            {/* Horizontal bar chart */}
            <div className="mb-4 h-3 flex rounded-full overflow-hidden">
              {scenarios.map((scenario) => {
                const colors = {
                  orange: 'bg-primary',
                  green: 'bg-success',
                  red: 'bg-error',
                  yellow: 'bg-warning',
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
                  orange: 'bg-primary',
                  green: 'bg-success',
                  red: 'bg-error',
                  yellow: 'bg-warning',
                }
                return (
                  <div key={scenario.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full ${dotColor[scenario.color]}`} />
                      <span className="text-text-secondary text-xs">{scenario.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text-primary font-medium">{scenario.probability}%</span>
                      <span className="text-text-muted text-xs w-16 text-right">
                        {scenario.expectedValue >= 0 ? '+' : ''}{scenario.expectedValue} EV
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Decision Intelligence */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-primary rounded rotate-45" />
              </div>
              <h3 className="text-text-primary font-medium">
                Decision intelligence
              </h3>
            </div>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              Once you've adjusted the probabilities to match your intuition, get the full analysis — what the math reveals <em>and</em> what it can't capture.
            </p>

            {insightError && (
              <div className="bg-error/10 border border-error/30 rounded-md p-3 mb-4">
                <p className="text-error text-xs">{insightError}</p>
              </div>
            )}

            <button
              onClick={handleGenerateInsight}
              disabled={isGeneratingInsight}
              className="w-full bg-primary hover:bg-primary-dark text-background py-3 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingInsight ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate insight →'
              )}
            </button>
          </div>
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
          border: 2px solid #f59e0b;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #f59e0b;
        }
      `}</style>
    </div>
  )
}
