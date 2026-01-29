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
 * POST /api/integrations/gmail/reparse
 * Re-fetch and re-parse pending emails from Gmail with improved parser
 */
export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'Gmail no conectado' },
        { status: 400 }
      )
    }

    // Decrypt tokens
    let accessToken: string
    let refreshToken: string

    try {
      accessToken = decryptToken(integration.accessToken)
      refreshToken = decryptToken(integration.refreshToken)
    } catch (error) {
      return NextResponse.json(
        { error: 'Error de seguridad. Reconecta Gmail.' },
        { status: 500 }
      )
    }

    // Refresh token if needed
    if (new Date() >= integration.tokenExpiry) {
      try {
        const newTokens = await refreshAccessToken(refreshToken)
        accessToken = newTokens.access_token || accessToken

        await prisma.gmailIntegration.update({
          where: { id: integration.id },
          data: {
            accessToken: encryptToken(accessToken),
            tokenExpiry: new Date(newTokens.expiry_date || Date.now() + 3600 * 1000),
          },
        })
      } catch (error) {
        return NextResponse.json(
          { error: 'Token expirado. Reconecta Gmail.' },
          { status: 401 }
        )
      }
    }

    // Get body params
    const body = await request.json().catch(() => ({}))
    const { includeProcessed = false, emailIds = [] } = body as { includeProcessed?: boolean; emailIds?: string[] }

    // Get emails to reparse
    const whereClause: any = {
      gmailIntegrationId: integration.id,
    }

    if (emailIds.length > 0) {
      // Reparse specific emails
      whereClause.id = { in: emailIds }
    } else if (includeProcessed) {
      // Reparse all emails (PENDING and PROCESSED)
      whereClause.status = { in: ['PENDING', 'PROCESSED'] }
    } else {
      // Only PENDING emails
      whereClause.status = 'PENDING'
    }

    const pendingEmails = await prisma.gmailSyncedEmail.findMany({
      where: whereClause,
      select: {
        id: true,
        messageId: true,
        subject: true,
        emailType: true,
        parsedData: true,
        reservationId: true,
      },
    })

    const results = {
      total: pendingEmails.length,
      reparsed: 0,
      propertyNamesFound: 0,
      financialsFound: 0,
      reservationsUpdated: 0,
      errors: 0,
    }

    // Re-parse each email
    for (const email of pendingEmails) {
      try {
        // Fetch full message from Gmail
        const fullMessage = await getEmailMessage(accessToken, refreshToken, email.messageId)
        if (!fullMessage.payload) continue

        // Get body
        const emailBody = getEmailBodyText(fullMessage.payload)

        // Re-parse with improved parser
        const { type, data } = parseAirbnbEmail(email.subject || '', emailBody)

        if (data) {
          // Update parsed data and type
          await prisma.gmailSyncedEmail.update({
            where: { id: email.id },
            data: {
              parsedData: data,
              emailType: type,
            },
          })

          results.reparsed++
          if (data.propertyName) {
            results.propertyNamesFound++
          }

          // Check if we found financial data
          const hasFinancials = data.hostEarnings || data.roomTotal || data.cleaningFee
          if (hasFinancials) {
            results.financialsFound++

            // If this email has a linked reservation with 0 amounts, update it
            if (email.reservationId) {
              const reservation = await prisma.reservation.findUnique({
                where: { id: email.reservationId }
              })

              if (reservation && Number(reservation.hostEarnings) === 0 && data.hostEarnings) {
                await prisma.reservation.update({
                  where: { id: email.reservationId },
                  data: {
                    hostEarnings: data.hostEarnings,
                    roomTotal: data.roomTotal || 0,
                    cleaningFee: data.cleaningFee || 0,
                    hostServiceFee: data.hostServiceFee || 0,
                  }
                })
                results.reservationsUpdated++
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error reparsing email ${email.id}:`, error)
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error reparsing emails:', error)
    return NextResponse.json(
      { error: 'Error al reprocesar emails' },
      { status: 500 }
    )
  }
}
