import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { question, scenarios } = await request.json();

    if (!question || !scenarios) {
      return NextResponse.json(
        { error: 'Question and scenarios are required' },
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

    const scenarioSummary = scenarios
      .map((s: any) => `${s.name} (${s.probability}%): ${s.description}`)
      .join('\n');

    const prompt = `You are a probability copilot helping someone understand a decision they're facing.

DECISION: ${question}

SCENARIOS (with probabilities they've set):
${scenarioSummary}

Generate a thoughtful, balanced insight about this decision. Your insight should:

1. Highlight what the math reveals (expected values, probability distributions)
2. Point out key uncertainties or sensitivities
3. Mention important non-quantifiable factors
4. Be supportive but not prescriptive - help them think, don't tell them what to do
5. Be 2-3 paragraphs, conversational but substantive

Remember: Your role is to make the probability math visible and help them think clearly, not to make the decision for them.

Return ONLY the insight text, no JSON or formatting.`;

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
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        {
          error: 'Failed to call Anthropic API',
          details: errorData.error?.message || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const insight = data.content?.[0]?.type === 'text' ? data.content[0].text : '';

    return NextResponse.json({ insight });

  } catch (error: any) {
    console.error('Error generating insight:', error);
    return NextResponse.json(
      { error: 'Failed to generate insight', details: error?.message },
      { status: 500 }
    );
  }
}
