import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Make a minimal API call to test the connection using fetch
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Respond with: API connection successful',
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 401 }
        );
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        {
          success: false,
          error: 'Connection failed',
          details: errorData.error?.message || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.type === 'text'
      ? data.content[0].text
      : '';

    return NextResponse.json({
      success: true,
      message: 'API connection successful',
      response: responseText
    });

  } catch (error: any) {
    console.error('API test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Connection failed',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
