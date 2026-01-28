import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import {
  matchProperty,
  extractPropertyNameFromSubject
} from '@/lib/property-matcher'

interface PropertyConfig {
  id: string
  propertyId: string
  propertyName: string
  airbnbNames: string[]
  bookingNames: string[]
  vrboNames: string[]
}

interface EmailDetail {
  id: string
  confirmationCode: string | null
  guestName: string | null
  checkIn: string | null
  checkOut: string | null
  nights: number | null
  adults: number | null
  children: number | null
  babies: number | null
  cleaningFee: number | null
  roomTotal: number | null
  hostEarnings: number | null
  propertyName: string | null
  subject: string
  emailType: string
  receivedAt: string
}

interface DetectedProperty {
  name: string
  emailCount: number
  emailIds: string[]
  emails: EmailDetail[] // Add email details
  autoMatch: {
    configId: string
    propertyId: string
    propertyName: string
    confidence: number
  } | null
  suggestions: Array<{
    configId: string
    propertyId: string
    propertyName: string
    confidence: number
    matchType: string
  }>
}

/**
 * GET /api/integrations/gmail/detect-properties
 * Analyze pending emails and detect property names with match suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Get Gmail integration
    const integration = await prisma.gmailIntegration.findUnique({
      where: { userId }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Gmail no conectado' },
        { status: 400 }
      )
    }

    // Get pending emails (only those with financial impact)
    const pendingEmails = await prisma.gmailSyncedEmail.findMany({
      where: {
        gmailIntegrationId: integration.id,
        status: 'PENDING',
        emailType: {
          in: ['RESERVATION_CONFIRMED', 'PAYOUT_SENT', 'RESERVATION_CANCELLED', 'REIMBURSEMENT', 'RESOLUTION_PAYOUT']
        }
      },
      select: {
        id: true,
        subject: true,
        parsedData: true,
        emailType: true,
        receivedAt: true
      },
      orderBy: { receivedAt: 'desc' }
    })

    // Get all user properties (with or without billing configs)
    const properties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        billingConfig: {
          select: {
            id: true,
            airbnbNames: true,
            bookingNames: true,
            vrboNames: true
          }
        }
      }
    })

    // Convert to PropertyConfig format (only those with billingConfig for matching)
    const propertyConfigs: PropertyConfig[] = properties
      .filter(p => p.billingConfig)
      .map(p => ({
        id: p.billingConfig!.id,
        propertyId: p.id,
        propertyName: p.name,
        airbnbNames: p.billingConfig!.airbnbNames || [],
        bookingNames: p.billingConfig!.bookingNames || [],
        vrboNames: p.billingConfig!.vrboNames || []
      }))

    // Also create configs for properties without one (for matching by name)
    const propertiesWithoutConfig = properties.filter(p => !p.billingConfig)
    for (const prop of propertiesWithoutConfig) {
      propertyConfigs.push({
        id: `pending-${prop.id}`, // Mark as pending
        propertyId: prop.id,
        propertyName: prop.name,
        airbnbNames: [],
        bookingNames: [],
        vrboNames: []
      })
    }

    // Group emails by detected property name
    const propertyGroups = new Map<string, {
      emails: typeof pendingEmails
      propertyName: string
    }>()

    for (const email of pendingEmails) {
      const parsedData = email.parsedData as any

      // Try to extract property name from various sources
      let propertyName: string | null = null

      // 1. First try parsed data propertyName (if it looks valid)
      if (parsedData?.propertyName) {
        const parsed = parsedData.propertyName as string
        // Validate: must be reasonable length, not start with common words, not be a confirmation code
        if (parsed.length > 3 && parsed.length < 80 &&
            !parsed.toLowerCase().includes('airbnb') &&
            !parsed.toLowerCase().includes('envía un mensaje') &&
            !parsed.toLowerCase().includes('identidad verificada') &&
            !parsed.match(/^(el|la|los|las|de|del|en|con|y|a|para|por|que|un|una|hola|soy)\s/i) &&
            !/^\d/.test(parsed) &&
            !/^HM[A-Z0-9]+$/i.test(parsed)) {
          propertyName = parsed
        }
      }

      // 2. Try to extract from subject
      if (!propertyName) {
        propertyName = extractPropertyNameFromSubject(email.subject)
      }

      // 3. If still no valid name, group by confirmation code
      // This ensures each reservation is shown separately for manual assignment
      if (!propertyName) {
        const code = parsedData?.confirmationCode
        const guestName = parsedData?.guestName
        if (code) {
          // Use a unique key per reservation so user can assign each one
          propertyName = `__UNIDENTIFIED__${code}`
        } else {
          propertyName = `__UNIDENTIFIED__${email.id}`
        }
      }

      if (!propertyGroups.has(propertyName)) {
        propertyGroups.set(propertyName, {
          emails: [],
          propertyName
        })
      }
      propertyGroups.get(propertyName)!.emails.push(email)
    }

    // Build response with match suggestions for each property
    const detectedProperties: DetectedProperty[] = []

    for (const [name, group] of propertyGroups) {
      const matches = matchProperty(name, propertyConfigs, 'airbnb')

      // Auto-match only if exact or alias match (100% confidence)
      const autoMatch = matches.find(m => m.confidence === 100)

      // Build email details for display
      const emailDetails: EmailDetail[] = group.emails.map(e => {
        const data = e.parsedData as any
        return {
          id: e.id,
          confirmationCode: data?.confirmationCode || null,
          guestName: data?.guestName || null,
          checkIn: data?.checkIn || null,
          checkOut: data?.checkOut || null,
          nights: data?.nights || null,
          adults: data?.adults || null,
          children: data?.children || null,
          babies: data?.babies || null,
          cleaningFee: data?.cleaningFee || null,
          roomTotal: data?.roomTotal || null,
          hostEarnings: data?.hostEarnings || null,
          propertyName: data?.propertyName || null,
          subject: e.subject,
          emailType: e.emailType,
          receivedAt: e.receivedAt.toISOString()
        }
      })

      detectedProperties.push({
        name,
        emailCount: group.emails.length,
        emailIds: group.emails.map(e => e.id),
        emails: emailDetails,
        autoMatch: autoMatch ? {
          configId: autoMatch.configId,
          propertyId: autoMatch.propertyId,
          propertyName: autoMatch.propertyName,
          confidence: autoMatch.confidence
        } : null,
        suggestions: matches.slice(0, 5).map(m => ({
          configId: m.configId,
          propertyId: m.propertyId,
          propertyName: m.propertyName,
          confidence: m.confidence,
          matchType: m.matchType
        }))
      })
    }

    // Sort: unmatched first, then by email count
    detectedProperties.sort((a, b) => {
      if (a.autoMatch && !b.autoMatch) return 1
      if (!a.autoMatch && b.autoMatch) return -1
      return b.emailCount - a.emailCount
    })

    // Summary stats
    const totalEmails = pendingEmails.length
    const autoMatchedEmails = detectedProperties
      .filter(p => p.autoMatch)
      .reduce((sum, p) => sum + p.emailCount, 0)
    const needsReviewEmails = totalEmails - autoMatchedEmails

    return NextResponse.json({
      success: true,
      summary: {
        totalEmails,
        autoMatchedEmails,
        needsReviewEmails,
        propertiesDetected: detectedProperties.length,
        propertiesConfigured: propertyConfigs.length
      },
      detectedProperties,
      availableProperties: properties.map(p => ({
        id: p.id,
        name: p.name,
        hasConfig: !!p.billingConfig,
        configId: p.billingConfig?.id || `pending-${p.id}` // Use pending prefix for properties without config
      }))
    })
  } catch (error) {
    console.error('Error detecting properties:', error)
    return NextResponse.json(
      { error: 'Error al detectar propiedades' },
      { status: 500 }
    )
  }
}
