import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'
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
  commissionType: string
  commissionValue: any
  cleaningFeeRecipient: string
  cleaningFeeSplitPct: any
}

/**
 * Pick the best amount - prefers non-zero values
 */
function pickBestAmount(newVal: number | undefined, existingVal: number | undefined): number | undefined {
  const newNum = Number(newVal) || 0
  const existingNum = Number(existingVal) || 0

  // If new value is greater than 0, prefer it
  if (newNum > 0) return newNum
  // Otherwise keep existing if it's greater than 0
  if (existingNum > 0) return existingNum
  // Both are 0 or undefined
  return undefined
}

/**
 * Calculate financial split between owner and manager
 */
function calculateFinancialSplit(
  hostEarnings: number,
  cleaningFee: number,
  config: {
    commissionType: string
    commissionValue: any
    cleaningFeeRecipient: string
    cleaningFeeSplitPct: any
  }
): {
  ownerAmount: number
  managerAmount: number
  cleaningAmount: number
} {
  const commissionValue = Number(config.commissionValue) || 0
  const cleaningFeeSplitPct = Number(config.cleaningFeeSplitPct) || 0

  const accommodationEarnings = hostEarnings - cleaningFee

  let managerCommission = 0
  if (config.commissionType === 'PERCENTAGE') {
    managerCommission = accommodationEarnings * (commissionValue / 100)
  } else if (config.commissionType === 'FIXED_PER_RESERVATION') {
    managerCommission = commissionValue
  }

  let managerCleaningAmount = 0
  switch (config.cleaningFeeRecipient) {
    case 'MANAGER':
      managerCleaningAmount = cleaningFee
      break
    case 'OWNER':
      managerCleaningAmount = 0
      break
    case 'SPLIT':
      managerCleaningAmount = cleaningFee * (cleaningFeeSplitPct / 100)
      break
  }

  const managerAmount = managerCommission + managerCleaningAmount
  const ownerAmount = hostEarnings - managerAmount

  return {
    ownerAmount: Math.round(ownerAmount * 100) / 100,
    managerAmount: Math.round(managerAmount * 100) / 100,
    cleaningAmount: Math.round(managerCleaningAmount * 100) / 100
  }
}

/**
 * POST /api/integrations/gmail/process-all
 * Process all pending emails with auto-matching
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const {
      processAutoMatchedOnly = false, // Only process 100% matches
      confirmMatches = [],  // Array of { propertyName, billingConfigId } for manual confirmations
      autoCreateProperties = true // Auto-create properties when not found
    } = body

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

    // Get all properties with configs
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
            vrboNames: true,
            commissionType: true,
            commissionValue: true,
            cleaningFeeRecipient: true,
            cleaningFeeSplitPct: true
          }
        }
      }
    })

    // Process pending configs from confirmMatches (create billingConfig if needed)
    const resolvedConfigs = new Map<string, string>() // Map pending-id to actual id
    for (const confirm of confirmMatches) {
      if (confirm.billingConfigId?.startsWith('pending-')) {
        const propertyId = confirm.billingConfigId.replace('pending-', '')
        const property = properties.find(p => p.id === propertyId)
        if (property && !property.billingConfig) {
          // Create billing config with defaults
          const newConfig = await prisma.propertyBillingConfig.create({
            data: {
              propertyId,
              ownerId: null,
              incomeReceiver: 'MANAGER',
              commissionType: 'PERCENTAGE',
              commissionValue: 0,
              cleaningFeeRecipient: 'MANAGER',
              airbnbNames: confirm.propertyName ? [confirm.propertyName] : [],
              bookingNames: [],
              vrboNames: []
            }
          })
          resolvedConfigs.set(confirm.billingConfigId, newConfig.id)
        }
      }
    }

    // Refresh properties after creating new configs
    const refreshedProperties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        billingConfig: {
          select: {
            id: true,
            airbnbNames: true,
            bookingNames: true,
            vrboNames: true,
            commissionType: true,
            commissionValue: true,
            cleaningFeeRecipient: true,
            cleaningFeeSplitPct: true
          }
        }
      }
    })

    const propertyConfigs: PropertyConfig[] = refreshedProperties
      .filter(p => p.billingConfig)
      .map(p => ({
        id: p.billingConfig!.id,
        propertyId: p.id,
        propertyName: p.name,
        airbnbNames: p.billingConfig!.airbnbNames || [],
        bookingNames: p.billingConfig!.bookingNames || [],
        vrboNames: p.billingConfig!.vrboNames || [],
        commissionType: p.billingConfig!.commissionType,
        commissionValue: p.billingConfig!.commissionValue,
        cleaningFeeRecipient: p.billingConfig!.cleaningFeeRecipient,
        cleaningFeeSplitPct: p.billingConfig!.cleaningFeeSplitPct
      }))

    // Build manual confirmations map
    const manualMatches = new Map<string, string>()
    for (const confirm of confirmMatches) {
      manualMatches.set(confirm.propertyName, confirm.billingConfigId)
    }

    // Get pending emails
    const pendingEmails = await prisma.gmailSyncedEmail.findMany({
      where: {
        gmailIntegrationId: integration.id,
        status: 'PENDING',
        emailType: {
          in: ['RESERVATION_CONFIRMED', 'PAYOUT_SENT', 'RESERVATION_CANCELLED', 'REIMBURSEMENT', 'RESOLUTION_PAYOUT']
        }
      },
      orderBy: { receivedAt: 'asc' }
    })

    // Skip solicitudes automatically
    await prisma.gmailSyncedEmail.updateMany({
      where: {
        gmailIntegrationId: integration.id,
        status: 'PENDING',
        emailType: 'RESERVATION_REQUEST'
      },
      data: {
        status: 'SKIPPED',
        errorMessage: 'Solicitud ignorada - solo se procesan reservas confirmadas'
      }
    })

    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      cancelled: 0,
      skipped: 0,
      needsReview: 0,
      propertiesCreated: 0,
      aliasesAdded: [] as string[],
      errors: [] as Array<{ emailId: string; error: string }>
    }

    // Group emails by confirmation code
    const emailsByCode = new Map<string, {
      emails: typeof pendingEmails
      propertyName: string | null
      billingConfigId: string | null
    }>()

    for (const email of pendingEmails) {
      const data = email.parsedData as any
      if (!data?.confirmationCode) {
        results.skipped++
        await prisma.gmailSyncedEmail.update({
          where: { id: email.id },
          data: { status: 'SKIPPED', errorMessage: 'Sin código de confirmación' }
        })
        continue
      }

      const code = data.confirmationCode

      // Detect property name
      let propertyName = data?.propertyName || extractPropertyNameFromSubject(email.subject)

      // Find billing config
      let billingConfigId: string | null = null

      // 1. Check manual confirmations
      if (propertyName && manualMatches.has(propertyName)) {
        billingConfigId = manualMatches.get(propertyName)!
      }

      // 2. Check auto-match
      if (!billingConfigId && propertyName) {
        const matches = matchProperty(propertyName, propertyConfigs, 'airbnb')
        const exactMatch = matches.find(m => m.confidence === 100)

        if (exactMatch) {
          billingConfigId = exactMatch.configId
        } else if (!processAutoMatchedOnly && matches.length > 0 && matches[0].confidence >= 90) {
          // High confidence match - auto-link and save alias
          billingConfigId = matches[0].configId
          const config = propertyConfigs.find(c => c.id === billingConfigId)
          if (config && !config.airbnbNames.includes(propertyName)) {
            await prisma.propertyBillingConfig.update({
              where: { id: billingConfigId },
              data: { airbnbNames: { push: propertyName } }
            })
            results.aliasesAdded.push(propertyName)
          }
        } else if (autoCreateProperties && !processAutoMatchedOnly) {
          // No match found - auto-create property and billing config
          try {
            const newProperty = await prisma.property.create({
              data: {
                hostId: userId,
                name: propertyName,
                propertyType: 'APARTMENT',
                maxGuests: 4,
                bedrooms: 1,
                beds: 1,
                bathrooms: 1,
                address: '',
                city: '',
                country: 'España',
                isActive: true,
              }
            })

            const newConfig = await prisma.propertyBillingConfig.create({
              data: {
                propertyId: newProperty.id,
                ownerId: null,
                incomeReceiver: 'MANAGER',
                commissionType: 'PERCENTAGE',
                commissionValue: 0,
                cleaningFeeRecipient: 'MANAGER',
                airbnbNames: [propertyName],
                bookingNames: [],
                vrboNames: []
              }
            })

            // Add to property configs for this session
            propertyConfigs.push({
              id: newConfig.id,
              propertyId: newProperty.id,
              propertyName: propertyName,
              airbnbNames: [propertyName],
              bookingNames: [],
              vrboNames: [],
              commissionType: 'PERCENTAGE',
              commissionValue: 0,
              cleaningFeeRecipient: 'MANAGER',
              cleaningFeeSplitPct: 0
            })

            billingConfigId = newConfig.id
            results.propertiesCreated++
            results.aliasesAdded.push(`NUEVA PROPIEDAD: ${propertyName}`)
          } catch (createError) {
            console.error(`Error creating property ${propertyName}:`, createError)
          }
        }
      }

      if (!emailsByCode.has(code)) {
        emailsByCode.set(code, { emails: [], propertyName, billingConfigId })
      }
      const group = emailsByCode.get(code)!
      group.emails.push(email)
      // Use the best available billing config
      if (billingConfigId && !group.billingConfigId) {
        group.billingConfigId = billingConfigId
      }
    }

    // Process each confirmation code
    for (const [confirmationCode, group] of emailsByCode) {
      try {
        if (!group.billingConfigId) {
          // Skip if no match found - needs manual review
          results.needsReview += group.emails.length
          continue
        }

        const billingConfig = propertyConfigs.find(c => c.id === group.billingConfigId)
        if (!billingConfig) {
          results.needsReview += group.emails.length
          continue
        }

        // Check for existing reservation
        const existing = await prisma.reservation.findFirst({
          where: { userId, confirmationCode, platform: 'AIRBNB' }
        })

        if (existing) {
          const hasCancellation = group.emails.some(e => e.emailType === 'RESERVATION_CANCELLED')
          const latestData = (group.emails[group.emails.length - 1].parsedData as any)

          const updateData: any = {}
          if (hasCancellation && existing.status !== 'CANCELLED') {
            updateData.status = 'CANCELLED'
          }

          if (latestData?.hostEarnings && (!existing.hostEarnings || Number(existing.hostEarnings) === 0)) {
            const financials = calculateFinancialSplit(
              Number(latestData.hostEarnings) || 0,
              Number(latestData.cleaningFee) || 0,
              billingConfig
            )
            updateData.hostEarnings = new Decimal(latestData.hostEarnings)
            updateData.roomTotal = latestData.roomTotal ? new Decimal(latestData.roomTotal) : undefined
            updateData.cleaningFee = latestData.cleaningFee ? new Decimal(latestData.cleaningFee) : undefined
            updateData.hostServiceFee = latestData.hostServiceFee ? new Decimal(latestData.hostServiceFee) : undefined
            updateData.ownerAmount = financials.ownerAmount
            updateData.managerAmount = financials.managerAmount
            updateData.cleaningAmount = financials.cleaningAmount
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.reservation.update({ where: { id: existing.id }, data: updateData })
            results.updated++
            if (updateData.status === 'CANCELLED') results.cancelled++
          }

          for (const email of group.emails) {
            await prisma.gmailSyncedEmail.update({
              where: { id: email.id },
              data: { status: 'PROCESSED', reservationId: existing.id }
            })
          }
          results.processed += group.emails.length
          continue
        }

        // Merge email data - prefer non-zero/non-null values
        let mergedData: any = {}
        for (const email of group.emails) {
          const data = email.parsedData as any
          if (!data) continue

          mergedData = {
            ...mergedData,
            ...data,
            confirmationCode: data.confirmationCode ?? mergedData.confirmationCode,
            guestName: data.guestName ?? mergedData.guestName,
            checkIn: data.checkIn ?? mergedData.checkIn,
            checkOut: data.checkOut ?? mergedData.checkOut,
            nights: data.nights ?? mergedData.nights,
            // For financial fields, prefer the higher non-zero value
            hostEarnings: pickBestAmount(data.hostEarnings, mergedData.hostEarnings),
            roomTotal: pickBestAmount(data.roomTotal, mergedData.roomTotal),
            cleaningFee: pickBestAmount(data.cleaningFee, mergedData.cleaningFee),
            hostServiceFee: pickBestAmount(data.hostServiceFee, mergedData.hostServiceFee)
          }
        }

        if (!mergedData.checkIn || !mergedData.checkOut) {
          for (const email of group.emails) {
            await prisma.gmailSyncedEmail.update({
              where: { id: email.id },
              data: { status: 'ERROR', errorMessage: 'Fechas incompletas' }
            })
          }
          results.errors.push({ emailId: group.emails[0].id, error: 'Fechas incompletas' })
          continue
        }

        const hasCancellation = group.emails.some(e => e.emailType === 'RESERVATION_CANCELLED')
        const hasReimbursement = group.emails.some(e => e.emailType === 'REIMBURSEMENT' || e.emailType === 'RESOLUTION_PAYOUT')

        const hostEarnings = Number(mergedData.hostEarnings) || 0
        const cleaningFee = Number(mergedData.cleaningFee) || 0
        const financials = calculateFinancialSplit(hostEarnings, cleaningFee, billingConfig)

        const reservation = await prisma.reservation.create({
          data: {
            userId,
            billingConfigId: billingConfig.id,
            platform: 'AIRBNB',
            confirmationCode,
            guestName: mergedData.guestName || 'Huésped',
            checkIn: new Date(mergedData.checkIn),
            checkOut: new Date(mergedData.checkOut),
            nights: mergedData.nights || 1,
            travelers: {
              adults: mergedData.adults || 1,
              children: mergedData.children || 0,
              babies: mergedData.babies || 0
            },
            roomTotal: new Decimal(mergedData.roomTotal || 0),
            cleaningFee: new Decimal(cleaningFee),
            hostServiceFee: new Decimal(mergedData.hostServiceFee || 0),
            hostEarnings: new Decimal(hostEarnings),
            currency: mergedData.currency || 'EUR',
            status: hasCancellation ? 'CANCELLED' : 'CONFIRMED',
            type: hasReimbursement ? 'ADJUSTMENT' : 'BOOKING',
            importSource: 'EMAIL',
            rawEmailData: JSON.stringify(group.emails.map(e => ({
              id: e.id, subject: e.subject, emailType: e.emailType, receivedAt: e.receivedAt
            }))),
            ownerAmount: financials.ownerAmount,
            managerAmount: financials.managerAmount,
            cleaningAmount: financials.cleaningAmount
          }
        })

        for (const email of group.emails) {
          await prisma.gmailSyncedEmail.update({
            where: { id: email.id },
            data: { status: 'PROCESSED', reservationId: reservation.id }
          })
        }

        results.processed += group.emails.length
        results.created++
        if (hasCancellation) results.cancelled++

      } catch (error) {
        console.error(`Error processing ${confirmationCode}:`, error)
        for (const email of group.emails) {
          await prisma.gmailSyncedEmail.update({
            where: { id: email.id },
            data: { status: 'ERROR', errorMessage: error instanceof Error ? error.message : 'Unknown' }
          })
        }
        results.errors.push({
          emailId: group.emails[0].id,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error in process-all:', error)
    return NextResponse.json({ error: 'Error al procesar emails' }, { status: 500 })
  }
}
