import { NextRequest, NextResponse } from 'next/server';
import { buildDecisionAnalysisPrompt, AIDecisionAnalysis } from '@/lib/ai/prompt';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { decision, category } = await request.json();

    if (!decision) {
      return NextResponse.json(
        { error: 'Decision text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const decisionWithCategory = category
      ? `Category: ${category}\n\n${decision}`
      : decision;

    const prompt = buildDecisionAnalysisPrompt(decisionWithCategory);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: 'Failed to call Anthropic API', details: errorData.error?.message || 'Unknown error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.type === 'text'
      ? data.content[0].text
      : '';

    let analysis: AIDecisionAnalysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    if (!analysis.scenarios || !Array.isArray(analysis.scenarios)) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI' },
        { status: 500 }
      );
    }

    // Save trial decision to database (works across browsers)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: trialDecision, error: dbError } = await supabase
          .from('trial_decisions')
          .insert({
            question: decision,
            category,
            decision_summary: analysis.decisionSummary,
            context: analysis.context,
            insider_prompt: analysis.insiderPrompt,
            scenarios: analysis.scenarios,
            key_factors: analysis.keyFactors,
            expected_value_score: analysis.expectedValueScore,
            sensitivity_note: analysis.sensitivityNote,
          })
          .select('id')
          .single();

        if (!dbError && trialDecision) {
          // Return both analysis and trial decision ID
          return NextResponse.json({
            analysis,
            trialDecisionId: trialDecision.id
          });
        }
      } catch (dbError) {
        console.error('Error saving trial decision to database:', dbError);
        // Continue without saving to DB - return just the analysis
      }
    }

    // Fallback: return just the analysis if DB save failed
    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error('Error in try-analyze:', error);
    return NextResponse.json(
      { error: 'Failed to analyze decision', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
