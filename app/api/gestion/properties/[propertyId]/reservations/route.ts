import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/properties/[propertyId]/reservations
 * Get all reservations for a property with financial breakdown
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { propertyId } = await params

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
    const status = searchParams.get('status') // COMPLETED, CONFIRMED, CANCELLED, all
    const invoiced = searchParams.get('invoiced') // true, false, all

    // Verify property ownership and get billing config
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        hostId: true,
        name: true,
        street: true,
        city: true,
        billingConfig: {
          select: {
            id: true,
            ownerId: true,
            commissionType: true,
            commissionValue: true,
            commissionVat: true,
            cleaningType: true,
            cleaningValue: true,
            cleaningFeeRecipient: true,
            invoiceDetailLevel: true,
            owner: {
              select: {
                id: true,
                type: true,
                firstName: true,
                lastName: true,
                companyName: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!property || property.hostId !== userId) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    if (!property.billingConfig) {
      return NextResponse.json({
        property: {
          id: property.id,
          name: property.name,
          address: property.street ? `${property.street}, ${property.city}` : property.city
        },
        billingConfig: null,
        reservations: [],
        summary: null,
        message: 'Configura la facturación de esta propiedad primero'
      })
    }

    // Build date range filter
    const dateFilter: any = {}
    if (year && month) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)
      dateFilter.checkOut = {
        gte: startDate,
        lte: endDate
      }
    } else if (year) {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31, 23, 59, 59)
      dateFilter.checkOut = {
        gte: startDate,
        lte: endDate
      }
    }

    // Build where clause
    const where: any = {
      billingConfigId: property.billingConfig.id,
      ...dateFilter
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (invoiced === 'true') {
      where.invoiced = true
    } else if (invoiced === 'false') {
      where.invoiced = false
    }

    // Get reservations
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        invoiceItem: {
          select: {
            id: true,
            invoice: {
              select: {
                id: true,
                fullNumber: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { checkIn: 'desc' }
    })

    // Calculate summary
    const summary = {
      totalReservations: reservations.length,
      totalNights: 0,
      pendingInvoice: 0,
      invoiced: 0,
      // Financial totals
      totalRoomRevenue: 0,
      totalCleaningFee: 0,
      totalHostServiceFee: 0,
      totalHostEarnings: 0,
      totalOwnerAmount: 0,
      totalManagerAmount: 0,
      totalCleaningAmount: 0,
      // By status
      byStatus: {
        CONFIRMED: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        PENDING: 0,
        NO_SHOW: 0
      }
    }

    const formattedReservations = reservations.map(r => {
      // Update summary
      summary.totalNights += r.nights
      summary.totalRoomRevenue += Number(r.roomTotal) || 0
      summary.totalCleaningFee += Number(r.cleaningFee) || 0
      summary.totalHostServiceFee += Number(r.hostServiceFee) || 0
      summary.totalHostEarnings += Number(r.hostEarnings) || 0
      summary.totalOwnerAmount += Number(r.ownerAmount) || 0
      summary.totalManagerAmount += Number(r.managerAmount) || 0
      summary.totalCleaningAmount += Number(r.cleaningAmount) || 0

      if (r.invoiced) {
        summary.invoiced++
      } else if (r.status !== 'CANCELLED') {
        summary.pendingInvoice++
      }

      if (r.status in summary.byStatus) {
        summary.byStatus[r.status as keyof typeof summary.byStatus]++
      }

      return {
        id: r.id,
        platform: r.platform,
        confirmationCode: r.confirmationCode,
        guestName: r.guestName,
        guestCountry: r.guestCountry,
        guestEmail: r.guestEmail,
        travelers: r.travelers,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        status: r.status,
        // Financial
        roomTotal: Number(r.roomTotal) || 0,
        cleaningFee: Number(r.cleaningFee) || 0,
        hostServiceFee: Number(r.hostServiceFee) || 0,
        hostEarnings: Number(r.hostEarnings) || 0,
        // Split amounts
        ownerAmount: Number(r.ownerAmount) || 0,
        managerAmount: Number(r.managerAmount) || 0,
        cleaningAmount: Number(r.cleaningAmount) || 0,
        // Invoice status
        invoiced: r.invoiced,
        invoice: r.invoiceItem?.invoice || null,
        // Dates
        createdAt: r.createdAt.toISOString()
      }
    })

    // Round summary values
    summary.totalRoomRevenue = Math.round(summary.totalRoomRevenue * 100) / 100
    summary.totalCleaningFee = Math.round(summary.totalCleaningFee * 100) / 100
    summary.totalHostServiceFee = Math.round(summary.totalHostServiceFee * 100) / 100
    summary.totalHostEarnings = Math.round(summary.totalHostEarnings * 100) / 100
    summary.totalOwnerAmount = Math.round(summary.totalOwnerAmount * 100) / 100
    summary.totalManagerAmount = Math.round(summary.totalManagerAmount * 100) / 100
    summary.totalCleaningAmount = Math.round(summary.totalCleaningAmount * 100) / 100

    return NextResponse.json({
      property: {
        id: property.id,
        name: property.name,
        address: property.street ? `${property.street}, ${property.city}` : property.city
      },
      billingConfig: {
        id: property.billingConfig.id,
        ownerId: property.billingConfig.ownerId,
        owner: property.billingConfig.owner,
        commissionType: property.billingConfig.commissionType,
        commissionValue: Number(property.billingConfig.commissionValue),
        commissionVat: Number(property.billingConfig.commissionVat),
        cleaningType: property.billingConfig.cleaningType,
        cleaningValue: Number(property.billingConfig.cleaningValue),
        cleaningFeeRecipient: property.billingConfig.cleaningFeeRecipient,
        invoiceDetailLevel: property.billingConfig.invoiceDetailLevel
      },
      reservations: formattedReservations,
      summary
    })
  } catch (error) {
    console.error('Error fetching property reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
