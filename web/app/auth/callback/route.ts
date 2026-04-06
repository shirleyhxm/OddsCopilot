import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const runtime = 'edge';

// Redirect to a client component to handle auth callback
// This avoids edge runtime compatibility issues with @supabase/ssr
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Redirect to client-side callback handler
  return NextResponse.redirect(`${origin}/auth/confirm?code=${code || ''}`)
}
