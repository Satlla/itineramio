import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

/**
 * GET /api/gestion/reservations
 * Get all reservations for the user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
    const status = searchParams.get('status') || undefined
    const platform = searchParams.get('platform') || undefined
    const propertyId = searchParams.get('propertyId') || undefined

    // Build where clause
    const where: Prisma.ReservationWhereInput = {
      userId,
      checkIn: {
        gte: new Date(year, month ? month - 1 : 0, 1),
        lt: new Date(year, month ? month : 12, 1)
      }
    }

    if (status) {
      where.status = status as any
    }

    if (platform) {
      where.platform = platform as any
    }

    if (propertyId) {
      where.billingConfig = {
        propertyId
      }
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { checkIn: 'desc' },
      include: {
        billingConfig: {
          select: {
            id: true,
            commissionValue: true,
            cleaningValue: true,
            property: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        },
        liquidation: {
          select: {
            id: true,
            status: true
          }
        },
        guest: {
          select: {
            id: true,
            name: true,
            totalStays: true,
            notes: true,
            tags: true
          }
        }
      }
    })

    // Calculate totals
    const totals = reservations.reduce((acc, r) => ({
      count: acc.count + 1,
      earnings: acc.earnings + Number(r.hostEarnings),
      nights: acc.nights + r.nights,
      confirmed: acc.confirmed + (r.status === 'CONFIRMED' ? 1 : 0),
      pending: acc.pending + (r.status === 'PENDING' ? 1 : 0),
      cancelled: acc.cancelled + (r.status === 'CANCELLED' ? 1 : 0)
    }), { count: 0, earnings: 0, nights: 0, confirmed: 0, pending: 0, cancelled: 0 })

    return NextResponse.json({
      reservations,
      totals
    })
  } catch (error: any) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/reservations
 * Create a new manual reservation
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
      billingConfigId,
      platform,
      confirmationCode,
      guestName,
      guestEmail,
      guestPhone,
      guestCountry,
      checkIn,
      checkOut,
      hostEarnings,
      roomTotal,
      cleaningFee,
      hostServiceFee,
      internalNotes
    } = body

    // Validate required fields
    if (!billingConfigId || !guestName || !checkIn || !checkOut || hostEarnings === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    let finalBillingConfigId = billingConfigId
    let billingConfig

    // Check if we need to create a new billing config (format: "new:propertyId")
    if (billingConfigId.startsWith('new:')) {
      const propertyId = billingConfigId.replace('new:', '')

      // Verify property belongs to user
      const property = await prisma.property.findFirst({
        where: { id: propertyId, hostId: userId }
      })

      if (!property) {
        return NextResponse.json(
          { error: 'Propiedad no encontrada' },
          { status: 404 }
        )
      }

      // Create billing config with defaults
      billingConfig = await prisma.propertyBillingConfig.create({
        data: {
          propertyId,
          commissionType: 'PERCENTAGE',
          commissionValue: 20, // 20% default
          commissionVat: 21,
          cleaningType: 'FIXED_PER_RESERVATION',
          cleaningValue: 0,
          cleaningVatIncluded: true,
          cleaningFeeRecipient: 'MANAGER',
          incomeReceiver: 'OWNER',
          defaultVatRate: 21,
          defaultRetentionRate: 0
        }
      })
      finalBillingConfigId = billingConfig.id
    } else {
      // Verify billing config belongs to user
      billingConfig = await prisma.propertyBillingConfig.findFirst({
        where: {
          id: billingConfigId,
          property: { hostId: userId }
        }
      })

      if (!billingConfig) {
        return NextResponse.json(
          { error: 'Configuración de propiedad no encontrada' },
          { status: 404 }
        )
      }
      finalBillingConfigId = billingConfig.id
    }

    // Calculate nights
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    if (nights < 1) {
      return NextResponse.json(
        { error: 'Las fechas no son válidas' },
        { status: 400 }
      )
    }

    // Generate confirmation code if not provided
    const finalConfirmationCode = confirmationCode || `MAN-${Date.now().toString(36).toUpperCase()}`

    // Calculate amounts based on billing config
    const earnings = Number(hostEarnings)
    const cleaning = cleaningFee !== undefined ? Number(cleaningFee) : Number(billingConfig.cleaningValue)
    const serviceFee = hostServiceFee !== undefined ? Number(hostServiceFee) : 0
    const room = roomTotal !== undefined ? Number(roomTotal) : earnings + serviceFee - cleaning

    // Calculate owner/manager split
    const commissionPct = Number(billingConfig.commissionValue) / 100
    const managerAmount = (earnings - cleaning) * commissionPct
    const ownerAmount = earnings - managerAmount

    // === GUEST CRM: Find or create guest ===
    let guestId: string | null = null
    let existingGuest = null

    // First, try to find by email if provided
    if (guestEmail) {
      existingGuest = await prisma.guest.findFirst({
        where: { userId, email: guestEmail }
      })
    }

    // If not found by email, try to find by exact name match
    if (!existingGuest && guestName) {
      existingGuest = await prisma.guest.findFirst({
        where: {
          userId,
          name: { equals: guestName, mode: 'insensitive' },
          email: null // Only match if no email (to avoid wrong matches)
        }
      })
    }

    if (existingGuest) {
      guestId = existingGuest.id
      // Update guest info if we have more data
      await prisma.guest.update({
        where: { id: existingGuest.id },
        data: {
          phone: guestPhone || existingGuest.phone,
          country: guestCountry || existingGuest.country,
          email: guestEmail || existingGuest.email
        }
      })
    } else {
      // Create new guest
      const newGuest = await prisma.guest.create({
        data: {
          userId,
          name: guestName,
          email: guestEmail || null,
          phone: guestPhone || null,
          country: guestCountry || null
        }
      })
      guestId = newGuest.id
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        billingConfigId: finalBillingConfigId,
        guestId, // Link to guest
        platform: platform || 'OTHER',
        confirmationCode: finalConfirmationCode,
        guestName,
        guestEmail,
        guestPhone,
        guestCountry,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        hostEarnings: earnings,
        roomTotal: room,
        cleaningFee: cleaning,
        hostServiceFee: serviceFee,
        guestServiceFee: 0,
        status: 'CONFIRMED',
        importSource: 'MANUAL',
        internalNotes,
        ownerAmount,
        managerAmount,
        cleaningAmount: cleaning
      },
      include: {
        billingConfig: {
          select: {
            property: {
              select: { id: true, name: true }
            }
          }
        },
        guest: {
          select: {
            id: true,
            name: true,
            totalStays: true,
            notes: true
          }
        }
      }
    })

    // Update guest statistics
    if (guestId) {
      const guestReservations = await prisma.reservation.findMany({
        where: { guestId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        select: { checkIn: true, nights: true, hostEarnings: true }
      })

      const totalStays = guestReservations.length
      const totalSpent = guestReservations.reduce((sum, r) => sum + Number(r.hostEarnings), 0)
      const totalNights = guestReservations.reduce((sum, r) => sum + r.nights, 0)
      const dates = guestReservations.map(r => r.checkIn).sort((a, b) => a.getTime() - b.getTime())

      await prisma.guest.update({
        where: { id: guestId },
        data: {
          totalStays,
          totalSpent,
          averageStay: totalStays > 0 ? totalNights / totalStays : 0,
          firstStayAt: dates[0] || null,
          lastStayAt: dates[dates.length - 1] || null
        }
      })
    }

    return NextResponse.json({
      reservation,
      isReturningGuest: !!existingGuest,
      guestHistory: existingGuest ? {
        totalStays: existingGuest.totalStays,
        notes: existingGuest.notes
      } : null
    })
  } catch (error: any) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Error al crear la reserva' },
      { status: 500 }
    )
  }
}
