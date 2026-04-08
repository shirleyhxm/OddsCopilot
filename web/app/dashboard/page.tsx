'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  name: string
  lifeStage: string
  riskTolerance: string
  context: string
  createdAt: string
}

interface Decision {
  id: string
  question: string
  category?: string
  createdAt: string
  scenarios?: any[]
  outcome?: {
    selectedScenario: string
    actualDate: string
    notes: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [calibrationScore, setCalibrationScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

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
          setProfile({
            name: profileData.name || 'Friend',
            lifeStage: profileData.life_stage,
            riskTolerance: profileData.risk_tolerance,
            context: profileData.context || '',
            createdAt: profileData.created_at,
          })
        }

        // Load decisions from Supabase
        const { data: decisionsData, error: decisionsError } = await supabase
          .from('decisions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (decisionsError) {
          console.error('Failed to load decisions:', decisionsError)
        } else if (decisionsData) {
          const formattedDecisions = decisionsData.map((d) => ({
            id: d.id,
            question: d.question,
            category: d.category,
            createdAt: d.created_at,
            scenarios: d.scenarios,
            outcome: d.outcome,
          }))
          setDecisions(formattedDecisions)

          // Calculate calibration score
          const decisionsWithOutcomes = formattedDecisions.filter((d) => d.outcome)
          if (decisionsWithOutcomes.length > 0) {
            // TODO: Implement proper calibration logic
            // For now, just show a placeholder
            setCalibrationScore(75)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const pendingOutcomes = decisions.filter(d => !d.outcome && d.scenarios)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getLifeStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'early-career': 'bg-green-dim text-green',
      'mid-career': 'bg-blue-dim text-blue',
      'senior': 'bg-purple/10 text-purple',
      'transitioning': 'bg-amber-dim text-amber',
      'other': 'bg-bg3 text-text3',
    }
    return colors[stage] || colors['other']
  }

  if (loading || !profile) {
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
            ODDSMERA
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-text3 text-sm hover:text-text2 transition-colors"
            >
              Profile
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Main Content */}
          <main className="flex-1">
            {/* Greeting */}
            <div className="mb-12">
              <h1 className="font-serif text-4xl text-text mb-2">
                Hello, {profile.name}
              </h1>
              <p className="text-text2 text-sm">
                Ready to think probabilistically about your next decision?
              </p>
            </div>

            {/* New Decision Button */}
            <Link
              href="/new-decision"
              className="block w-full bg-amber hover:bg-amber/90 text-bg py-4 rounded-lg font-medium transition-all mb-12 text-center"
            >
              Analyze new decision →
            </Link>

            {/* Decision History */}
            <div>
              <h2 className="text-text3 text-xs uppercase tracking-wider mb-6">
                Decision History
              </h2>

              {decisions.length === 0 ? (
                <div className="bg-bg2 border border-border rounded-lg p-12 text-center">
                  <div className="text-text3 text-sm mb-4">No decisions yet</div>
                  <p className="text-text3 text-xs max-w-md mx-auto">
                    Start by analyzing your first decision. I'll help you think through the probabilities and expected outcomes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {decisions.map((decision) => (
                    <Link
                      key={decision.id}
                      href={`/decision/${decision.id}`}
                      className="block bg-bg2 border border-border hover:border-border2 rounded-lg p-5 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-text group-hover:text-amber transition-colors text-sm font-medium flex-1 pr-4">
                          {decision.question}
                        </h3>
                        {decision.outcome ? (
                          <span className="px-2 py-1 rounded text-xs bg-green-dim text-green">
                            Outcome logged
                          </span>
                        ) : decision.scenarios ? (
                          <span className="px-2 py-1 rounded text-xs bg-amber-dim text-amber">
                            Pending
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text3">
                        <span>{formatDate(decision.createdAt)}</span>
                        {decision.category && (
                          <span className="px-2 py-0.5 rounded bg-bg3 text-text3">
                            {decision.category}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-80 space-y-6">
            {/* Stats */}
            <div className="bg-bg2 border border-border rounded-lg p-6">
              <h3 className="text-text3 text-xs uppercase tracking-wider mb-6">
                Your Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-text text-3xl font-light mb-1">
                    {decisions.length}
                  </div>
                  <div className="text-text3 text-xs">Decisions analyzed</div>
                </div>

                {calibrationScore !== null && (
                  <div>
                    <div className="text-amber text-3xl font-light mb-1">
                      {calibrationScore}%
                    </div>
                    <div className="text-text3 text-xs">Calibration score</div>
                  </div>
                )}

                <div>
                  <div className="text-text text-3xl font-light mb-1">
                    {pendingOutcomes.length}
                  </div>
                  <div className="text-text3 text-xs">Pending outcomes</div>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-bg2 border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text3 text-xs uppercase tracking-wider">
                  Profile
                </h3>
                <Link
                  href="/profile"
                  className="text-amber text-xs hover:underline"
                >
                  Edit
                </Link>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-text2 text-sm mb-1">{profile.name}</div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getLifeStageBadgeColor(profile.lifeStage)}`}>
                      {profile.lifeStage}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-bg3 text-text3">
                      {profile.riskTolerance}
                    </span>
                  </div>
                </div>

                {profile.context && (
                  <div className="text-text3 text-xs leading-relaxed pt-3 border-t border-border">
                    {profile.context.substring(0, 120)}
                    {profile.context.length > 120 && '...'}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Outcomes */}
            {pendingOutcomes.length > 0 && (
              <div className="bg-amber-glow border border-amber/20 rounded-lg p-6">
                <h3 className="text-amber text-xs uppercase tracking-wider mb-3">
                  Pending Check-ins
                </h3>
                <p className="text-text3 text-xs mb-4">
                  You have {pendingOutcomes.length} decision{pendingOutcomes.length !== 1 ? 's' : ''} waiting for outcome logging.
                </p>
                <Link
                  href={`/decision/${pendingOutcomes[0].id}`}
                  className="text-amber text-sm hover:underline"
                >
                  Log outcome →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
