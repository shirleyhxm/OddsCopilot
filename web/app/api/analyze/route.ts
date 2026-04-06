import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildDecisionAnalysisPrompt, AIDecisionAnalysis } from '@/lib/ai/prompt';

// Use Node.js runtime for better SDK compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { decision, apiKey } = await request.json();

    if (!decision || !apiKey) {
      return NextResponse.json(
        { error: 'Decision text and API key are required' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client with user's API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Build the prompt
    const prompt = buildDecisionAnalysisPrompt(decision);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the JSON from the response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse JSON response
    let analysis: AIDecisionAnalysis;
    try {
      // Try to find JSON in the response (in case Claude adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          details: responseText.substring(0, 500)
        },
        { status: 500 }
      );
    }

    // Validate the structure
    if (!analysis.scenarios || !Array.isArray(analysis.scenarios)) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error('Error calling Anthropic API:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to analyze decision',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
