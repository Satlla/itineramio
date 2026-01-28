import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import {
  searchAirbnbEmails,
  getEmailMessage,
  parseEmailHeaders,
  getEmailBodyText,
  refreshAccessToken,
} from '@/lib/gmail/client'
import { parseAirbnbEmail, EmailType } from '@/lib/gmail/parser'
import { decryptToken, encryptToken } from '@/lib/gmail/encryption'

/**
 * POST /api/integrations/gmail/sync
 * Sync Airbnb emails from Gmail
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

    if (!integration.isActive) {
      return NextResponse.json(
        { error: 'Integración desactivada' },
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
      console.error('Failed to decrypt Gmail tokens:', error)
      return NextResponse.json(
        { error: 'Error de seguridad. Reconecta Gmail.' },
        { status: 500 }
      )
    }

    // Check if we need to refresh token
    if (new Date() >= integration.tokenExpiry) {
      try {
        const newTokens = await refreshAccessToken(refreshToken)
        accessToken = newTokens.access_token || accessToken

        // Update tokens in DB (encrypted)
        await prisma.gmailIntegration.update({
          where: { id: integration.id },
          data: {
            accessToken: encryptToken(accessToken),
            tokenExpiry: new Date(newTokens.expiry_date || Date.now() + 3600 * 1000),
          },
        })
      } catch (error) {
        console.error('Failed to refresh Gmail token:', error)
        await prisma.gmailIntegration.update({
          where: { id: integration.id },
          data: {
            isActive: false,
            syncErrors: { increment: 1 },
          },
        })
        return NextResponse.json(
          { error: 'Token expirado. Reconecta Gmail.' },
          { status: 401 }
        )
      }
    }

    // Search for Airbnb emails (last 30 days by default)
    const afterDate = integration.lastSyncAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const messages = await searchAirbnbEmails(accessToken, refreshToken, afterDate, 100)

    const results = {
      found: messages.length,
      newEmails: 0,
      parsed: 0,
      errors: 0,
      reservationsCreated: 0,
    }

    // Process each message
    for (const message of messages) {
      if (!message.id) continue

      try {
        // Check if already synced
        const existing = await prisma.gmailSyncedEmail.findUnique({
          where: {
            gmailIntegrationId_messageId: {
              gmailIntegrationId: integration.id,
              messageId: message.id,
            },
          },
        })

        if (existing) continue
        results.newEmails++

        // Get full message
        const fullMessage = await getEmailMessage(accessToken, refreshToken, message.id)
        if (!fullMessage.payload) continue

        // Parse headers
        const headers = parseEmailHeaders(fullMessage.payload.headers || [])
        const subject = headers['subject'] || ''
        const fromEmail = headers['from'] || ''
        const dateStr = headers['date']
        const receivedAt = dateStr ? new Date(dateStr) : new Date()

        // Get body
        const body = getEmailBodyText(fullMessage.payload)

        // Parse email
        const { type, data } = parseAirbnbEmail(subject, body)

        // Save synced email
        const syncedEmail = await prisma.gmailSyncedEmail.create({
          data: {
            gmailIntegrationId: integration.id,
            messageId: message.id,
            threadId: message.threadId || null,
            subject,
            fromEmail,
            receivedAt,
            emailType: type,
            parsedData: data || undefined,
            status: data ? 'PENDING' : 'SKIPPED',
          },
        })

        if (data) {
          results.parsed++
        }
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error)
        results.errors++
      }
    }

    // Update last sync time
    await prisma.gmailIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        syncErrors: 0,
      },
    })

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error syncing Gmail:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar emails' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/integrations/gmail/sync
 * Get synced emails list
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const integration = await prisma.gmailIntegration.findUnique({
      where: { userId },
    })

    if (!integration) {
      return NextResponse.json({ emails: [], total: 0 })
    }

    const where: any = {
      gmailIntegrationId: integration.id,
    }

    if (status) {
      where.status = status
    }

    const [emails, total] = await Promise.all([
      prisma.gmailSyncedEmail.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          messageId: true,
          subject: true,
          fromEmail: true,
          receivedAt: true,
          emailType: true,
          parsedData: true,
          status: true,
          errorMessage: true,
          reservationId: true,
          createdAt: true,
        },
      }),
      prisma.gmailSyncedEmail.count({ where }),
    ])

    return NextResponse.json({
      emails: emails.map(e => ({
        ...e,
        receivedAt: e.receivedAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching synced emails:', error)
    return NextResponse.json(
      { error: 'Error al obtener emails' },
      { status: 500 }
    )
  }
}
