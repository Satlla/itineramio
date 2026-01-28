import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { exchangeCodeForTokens, getGmailUserEmail, verifyStateToken, getOAuth2Client } from '@/lib/gmail/client'
import { encryptToken } from '@/lib/gmail/encryption'

/**
 * GET /api/integrations/gmail/callback
 * Handle OAuth callback from Google with CSRF verification
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login?redirect=/gestion/integraciones', request.url))
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(
        new URL('/gestion/integraciones?error=gmail_auth_denied', request.url)
      )
    }

    // CSRF Protection: Verify state token
    if (!state) {
      console.error('Gmail OAuth: Missing state token')
      return NextResponse.redirect(
        new URL('/gestion/integraciones?error=gmail_invalid_state', request.url)
      )
    }

    const stateUserId = verifyStateToken(state)
    if (!stateUserId || stateUserId !== userId) {
      console.error('Gmail OAuth: Invalid state token or user mismatch')
      return NextResponse.redirect(
        new URL('/gestion/integraciones?error=gmail_invalid_state', request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/gestion/integraciones?error=gmail_no_code', request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, request.url)

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('Missing tokens from Google:', tokens)
      return NextResponse.redirect(
        new URL('/gestion/integraciones?error=gmail_missing_tokens', request.url)
      )
    }

    // Get user's Gmail email
    const gmailEmail = await getGmailUserEmail(tokens.access_token, tokens.refresh_token)

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000))

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(tokens.access_token)
    const encryptedRefreshToken = encryptToken(tokens.refresh_token)

    // Save or update integration with encrypted tokens
    await prisma.gmailIntegration.upsert({
      where: { userId },
      create: {
        userId,
        email: gmailEmail,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry,
        isActive: true,
      },
      update: {
        email: gmailEmail,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry,
        isActive: true,
        syncErrors: 0,
      },
    })

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      new URL('/gestion/integraciones?success=gmail_connected', request.url)
    )
  } catch (error) {
    console.error('Error handling Gmail callback:', error)
    return NextResponse.redirect(
      new URL('/gestion/integraciones?error=gmail_callback_failed', request.url)
    )
  }
}
