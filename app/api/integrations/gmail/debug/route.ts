import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import {
  getEmailMessage,
  getEmailBodyText,
  refreshAccessToken,
} from '@/lib/gmail/client'
import { parseAirbnbEmail } from '@/lib/gmail/parser'
import { decryptToken, encryptToken } from '@/lib/gmail/encryption'

/**
 * GET /api/integrations/gmail/debug
 * Debug endpoint to see what's being extracted from emails
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Get integration
    const integration = await prisma.gmailIntegration.findUnique({
      where: { userId },
    })

    if (!integration) {
      return NextResponse.json({ error: 'Gmail no conectado' }, { status: 400 })
    }

    // Decrypt tokens
    let accessToken = decryptToken(integration.accessToken)
    let refreshToken = decryptToken(integration.refreshToken)

    // Refresh token if needed
    if (new Date() >= integration.tokenExpiry) {
      const newTokens = await refreshAccessToken(refreshToken)
      accessToken = newTokens.access_token || accessToken
      await prisma.gmailIntegration.update({
        where: { id: integration.id },
        data: {
          accessToken: encryptToken(accessToken),
          tokenExpiry: new Date(newTokens.expiry_date || Date.now() + 3600 * 1000),
        },
      })
    }

    // Get first pending email
    const pendingEmail = await prisma.gmailSyncedEmail.findFirst({
      where: {
        gmailIntegrationId: integration.id,
        status: 'PENDING',
      },
      orderBy: { receivedAt: 'desc' },
    })

    if (!pendingEmail) {
      return NextResponse.json({ error: 'No hay emails pendientes' }, { status: 404 })
    }

    // Fetch full message from Gmail
    const fullMessage = await getEmailMessage(accessToken, refreshToken, pendingEmail.messageId)
    if (!fullMessage.payload) {
      return NextResponse.json({ error: 'No se pudo obtener el mensaje' }, { status: 500 })
    }

    // Get body
    const body = getEmailBodyText(fullMessage.payload)

    // Parse with improved parser
    const { type, data } = parseAirbnbEmail(pendingEmail.subject || '', body)

    return NextResponse.json({
      emailId: pendingEmail.id,
      subject: pendingEmail.subject,
      emailType: type,
      parsedData: data,
      bodyPreview: body.substring(0, 2000), // First 2000 chars
      bodyLength: body.length,
      currentParsedData: pendingEmail.parsedData,
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
