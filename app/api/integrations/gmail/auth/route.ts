import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getAuthUrl } from '@/lib/gmail/client'

/**
 * GET /api/integrations/gmail/auth
 * Initiate Gmail OAuth flow with CSRF protection
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Check if Google credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Gmail integration not configured. Contact support.' },
        { status: 500 }
      )
    }

    // Generate auth URL with CSRF state token
    const authUrl = getAuthUrl(userId, request.url)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error initiating Gmail auth:', error)
    return NextResponse.json(
      { error: 'Error al iniciar autenticación' },
      { status: 500 }
    )
  }
}
