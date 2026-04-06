'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Guest — show landing page
        setChecking(false)
        return
      }

      // Authenticated user — redirect to dashboard or welcome
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

    checkAuth()
  }, [router, supabase])

  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text3 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
            ODDSMERA
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-text3 text-sm hover:text-text2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/try"
              className="bg-amber hover:bg-amber/90 text-bg text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Try it free →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 fade-in">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block bg-amber-dim border border-amber/20 text-amber text-xs font-medium tracking-wider uppercase px-3 py-1.5 rounded-full mb-8">
            Decision Intelligence
          </div>

          <h1 className="font-serif text-5xl md:text-6xl text-text mb-6 leading-tight">
            Make better decisions<br />with probability
          </h1>

          <p className="text-text2 text-lg leading-relaxed mb-12 max-w-xl mx-auto">
            Stop guessing. OddsMera turns your life decisions into probability problems —
            mapping scenarios, estimating outcomes, and revealing what the math says.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/try"
              className="w-full sm:w-auto bg-amber hover:bg-amber/90 text-bg font-medium px-8 py-4 rounded-lg transition-colors text-center"
            >
              Try your first decision →
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-bg2 hover:bg-bg3 border border-border text-text2 font-medium px-8 py-4 rounded-lg transition-colors text-center"
            >
              Sign in
            </Link>
          </div>

          <p className="text-text3 text-xs mt-6">
            No account required to try. See real analysis in seconds.
          </p>
        </div>
      </main>

      {/* How it works */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-text3 text-xs uppercase tracking-wider text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe your decision',
                body: "Tell OddsMera what you're weighing — a career move, financial choice, relocation, anything with real stakes.",
              },
              {
                step: '02',
                title: 'See the probability map',
                body: 'AI generates 2–4 realistic scenarios with base-rate probabilities and expected value scores grounded in real data.',
              },
              {
                step: '03',
                title: 'Get the full insight',
                body: 'Adjust estimates with your insider knowledge, then unlock a full analysis of what the math reveals and what it misses.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-bg2 border border-border rounded-lg p-6">
                <div className="text-amber text-xs font-medium tracking-widest mb-4">
                  {item.step}
                </div>
                <h3 className="text-text font-medium mb-3">{item.title}</h3>
                <p className="text-text2 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/try"
              className="inline-block bg-amber hover:bg-amber/90 text-bg font-medium px-8 py-4 rounded-lg transition-colors"
            >
              Try it free — no sign up needed →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-amber text-xs font-medium tracking-[0.3em] uppercase">
            ODDSMERA
          </div>
          <div className="text-text3 text-xs">
            Probability-first decision making
          </div>
        </div>
      </footer>
    </div>
  )
}
