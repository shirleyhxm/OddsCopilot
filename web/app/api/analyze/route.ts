import { NextRequest, NextResponse } from 'next/server';
import { buildDecisionAnalysisPrompt, AIDecisionAnalysis } from '@/lib/ai/prompt';

// Use Edge runtime for optimal Vercel performance
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { decision, apiKey } = await request.json();

    if (!decision || !apiKey) {
      return NextResponse.json(
        { error: 'Decision text and API key are required' },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = buildDecisionAnalysisPrompt(decision);

    // Call Claude API directly using fetch (works with Edge runtime)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to call Anthropic API',
          details: errorData.error?.message || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the JSON from the response
    const responseText = data.content?.[0]?.type === 'text'
      ? data.content[0].text
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

    return NextResponse.json(
      {
        error: 'Failed to analyze decision',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
