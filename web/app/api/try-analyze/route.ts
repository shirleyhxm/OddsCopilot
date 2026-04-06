import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildDecisionAnalysisPrompt, AIDecisionAnalysis } from '@/lib/ai/prompt';

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

    const anthropic = new Anthropic({ apiKey });

    const decisionWithCategory = category
      ? `Category: ${category}\n\n${decision}`
      : decision;

    const prompt = buildDecisionAnalysisPrompt(decisionWithCategory);

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
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

    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error('Error in try-analyze:', error);
    return NextResponse.json(
      { error: 'Failed to analyze decision', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
