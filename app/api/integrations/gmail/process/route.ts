import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

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

  // Base amount for commission calculation (hostEarnings includes cleaning)
  const accommodationEarnings = hostEarnings - cleaningFee

  // Calculate manager commission based on type
  let managerCommission = 0
  if (config.commissionType === 'PERCENTAGE') {
    managerCommission = accommodationEarnings * (commissionValue / 100)
  } else if (config.commissionType === 'FIXED_PER_RESERVATION') {
    managerCommission = commissionValue
  }

  // Calculate cleaning distribution
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

  // Final amounts
  const managerAmount = managerCommission + managerCleaningAmount
  const ownerAmount = hostEarnings - managerAmount

  return {
    ownerAmount: Math.round(ownerAmount * 100) / 100,
    managerAmount: Math.round(managerAmount * 100) / 100,
    cleaningAmount: Math.round(managerCleaningAmount * 100) / 100
  }
}

/**
 * POST /api/integrations/gmail/process
 * Process pending emails and create reservations
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { emailIds, billingConfigId } = body

    if (!billingConfigId) {
      return NextResponse.json(
        { error: 'Selecciona una propiedad' },
        { status: 400 }
      )
    }

    // Verify billing config belongs to user
    const billingConfig = await prisma.propertyBillingConfig.findFirst({
      where: {
        id: billingConfigId,
        property: {
          hostId: userId,
        },
      },
      select: {
        id: true,
        commissionType: true,
        commissionValue: true,
        cleaningFeeRecipient: true,
        cleaningFeeSplitPct: true,
      }
    })

    if (!billingConfig) {
      return NextResponse.json(
        { error: 'Configuración de propiedad no encontrada' },
        { status: 404 }
      )
    }

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

    // Get emails to process - everything that affects income
    // Include: Confirmed reservations, payouts, cancellations, reimbursements
    // Exclude: RESERVATION_REQUEST (solicitudes), UNKNOWN
    const whereClause: any = {
      gmailIntegrationId: integration.id,
      status: 'PENDING',
      emailType: {
        in: [
          'RESERVATION_CONFIRMED',
          'PAYOUT_SENT',
          'RESERVATION_CANCELLED',
          'REIMBURSEMENT',
          'RESOLUTION_PAYOUT'
        ]
      }
    }

    if (emailIds && emailIds.length > 0) {
      whereClause.id = { in: emailIds }
    }

    const emails = await prisma.gmailSyncedEmail.findMany({
      where: whereClause,
      orderBy: { receivedAt: 'asc' },
    })

    // Automatically skip RESERVATION_REQUEST (solicitudes) - NOT financial
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
      errors: [] as Array<{ emailId: string; error: string }>,
    }

    // Group emails by confirmation code to merge data
    const emailsByCode = new Map<string, typeof emails>()

    for (const email of emails) {
      const data = email.parsedData as any
      if (!data?.confirmationCode) {
        results.skipped++
        await prisma.gmailSyncedEmail.update({
          where: { id: email.id },
          data: {
            status: 'SKIPPED',
            errorMessage: 'No confirmation code found',
          },
        })
        continue
      }

      const code = data.confirmationCode
      if (!emailsByCode.has(code)) {
        emailsByCode.set(code, [])
      }
      emailsByCode.get(code)!.push(email)
    }

    // Process each unique confirmation code
    for (const [confirmationCode, codeEmails] of emailsByCode) {
      try {
        // Check for duplicate
        const existing = await prisma.reservation.findFirst({
          where: {
            userId,
            confirmationCode,
            platform: 'AIRBNB',
          },
        })

        if (existing) {
          // Check if any email is a cancellation
          const hasCancellation = codeEmails.some(e => e.emailType === 'RESERVATION_CANCELLED')

          // Check if any email has financial data (payout/reimbursement)
          const latestEmail = codeEmails[codeEmails.length - 1]
          const data = latestEmail.parsedData as any

          const updateData: any = {}

          // Handle cancellation - update status
          if (hasCancellation && existing.status !== 'CANCELLED') {
            updateData.status = 'CANCELLED'
          }

          // Handle financial updates (from payout or reimbursement emails)
          if (data.hostEarnings && (!existing.hostEarnings || Number(existing.hostEarnings) === 0)) {
            const financials = calculateFinancialSplit(
              Number(data.hostEarnings) || 0,
              Number(data.cleaningFee) || 0,
              billingConfig
            )

            updateData.hostEarnings = new Decimal(data.hostEarnings)
            updateData.roomTotal = data.roomTotal ? new Decimal(data.roomTotal) : undefined
            updateData.cleaningFee = data.cleaningFee ? new Decimal(data.cleaningFee) : undefined
            updateData.hostServiceFee = data.hostServiceFee ? new Decimal(data.hostServiceFee) : undefined
            updateData.ownerAmount = financials.ownerAmount
            updateData.managerAmount = financials.managerAmount
            updateData.cleaningAmount = financials.cleaningAmount
          }

          // Apply updates if any
          if (Object.keys(updateData).length > 0) {
            await prisma.reservation.update({
              where: { id: existing.id },
              data: updateData,
            })
            results.updated++
            if (updateData.status === 'CANCELLED') {
              results.cancelled++
            }
          }

          // Mark emails as processed
          for (const email of codeEmails) {
            await prisma.gmailSyncedEmail.update({
              where: { id: email.id },
              data: {
                status: 'PROCESSED',
                reservationId: existing.id,
              },
            })
          }

          results.processed += codeEmails.length
          continue
        }

        // Merge data from all emails
        let mergedData: any = {}
        for (const email of codeEmails) {
          const data = email.parsedData as any
          mergedData = {
            ...mergedData,
            ...data,
            // Prefer non-null values
            confirmationCode: data.confirmationCode || mergedData.confirmationCode,
            guestName: data.guestName || mergedData.guestName,
            checkIn: data.checkIn || mergedData.checkIn,
            checkOut: data.checkOut || mergedData.checkOut,
            nights: data.nights || mergedData.nights,
            hostEarnings: data.hostEarnings || mergedData.hostEarnings,
            roomTotal: data.roomTotal || mergedData.roomTotal,
            cleaningFee: data.cleaningFee || mergedData.cleaningFee,
            hostServiceFee: data.hostServiceFee || mergedData.hostServiceFee,
          }
        }

        // Validate required fields
        if (!mergedData.checkIn || !mergedData.checkOut) {
          for (const email of codeEmails) {
            await prisma.gmailSyncedEmail.update({
              where: { id: email.id },
              data: {
                status: 'ERROR',
                errorMessage: 'Missing check-in/check-out dates',
              },
            })
          }
          results.errors.push({
            emailId: codeEmails[0].id,
            error: 'Fechas incompletas',
          })
          continue
        }

        // Determine status based on email types
        const hasCancellation = codeEmails.some(e => e.emailType === 'RESERVATION_CANCELLED')
        const reservationStatus = hasCancellation ? 'CANCELLED' : 'CONFIRMED'

        // Calculate financial split
        const hostEarnings = Number(mergedData.hostEarnings) || 0
        const cleaningFee = Number(mergedData.cleaningFee) || 0
        const financials = calculateFinancialSplit(hostEarnings, cleaningFee, billingConfig)

        // Determine type based on email types
        const hasReimbursement = codeEmails.some(e =>
          e.emailType === 'REIMBURSEMENT' || e.emailType === 'RESOLUTION_PAYOUT'
        )
        const reservationType = hasReimbursement ? 'ADJUSTMENT' : 'BOOKING'

        // Create reservation
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
              babies: mergedData.babies || 0,
            },
            roomTotal: new Decimal(mergedData.roomTotal || 0),
            cleaningFee: new Decimal(cleaningFee),
            hostServiceFee: new Decimal(mergedData.hostServiceFee || 0),
            hostEarnings: new Decimal(hostEarnings),
            currency: mergedData.currency || 'EUR',
            status: reservationStatus,
            type: reservationType,
            importSource: 'EMAIL',
            rawEmailData: JSON.stringify(codeEmails.map(e => ({
              id: e.id,
              subject: e.subject,
              emailType: e.emailType,
              receivedAt: e.receivedAt,
            }))),
            // Financial split
            ownerAmount: financials.ownerAmount,
            managerAmount: financials.managerAmount,
            cleaningAmount: financials.cleaningAmount,
          },
        })

        // Mark emails as processed
        for (const email of codeEmails) {
          await prisma.gmailSyncedEmail.update({
            where: { id: email.id },
            data: {
              status: 'PROCESSED',
              reservationId: reservation.id,
            },
          })
        }

        results.processed += codeEmails.length
        results.created++
        if (reservationStatus === 'CANCELLED') {
          results.cancelled++
        }
      } catch (error) {
        console.error(`Error processing code ${confirmationCode}:`, error)
        for (const email of codeEmails) {
          await prisma.gmailSyncedEmail.update({
            where: { id: email.id },
            data: {
              status: 'ERROR',
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            },
          })
        }
        results.errors.push({
          emailId: codeEmails[0].id,
          error: error instanceof Error ? error.message : 'Error desconocido',
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error processing emails:', error)
    return NextResponse.json(
      { error: 'Error al procesar emails' },
      { status: 500 }
    )
  }
}
