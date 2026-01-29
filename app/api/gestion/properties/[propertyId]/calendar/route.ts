import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/properties/[propertyId]/calendar
 * Get reservations for a property for calendar view
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    // Verify property ownership and get billing config
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      },
      select: {
        id: true,
        name: true,
        city: true,
        profileImage: true,
        billingConfig: {
          select: {
            id: true,
            commissionValue: true,
            commissionType: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
                type: true
              }
            }
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    if (!property.billingConfig) {
      return NextResponse.json(
        { error: 'Configure la facturación de la propiedad primero' },
        { status: 400 }
      )
    }

    // Get start and end of month
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)

    // Get reservations that overlap with this month
    const reservations = await prisma.reservation.findMany({
      where: {
        billingConfigId: property.billingConfig.id,
        OR: [
          // Starts in this month
          {
            checkIn: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          // Ends in this month
          {
            checkOut: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          // Spans this month
          {
            checkIn: { lt: startOfMonth },
            checkOut: { gt: endOfMonth }
          }
        ],
        status: { not: 'CANCELLED' }
      },
      orderBy: { checkIn: 'asc' },
      select: {
        id: true,
        confirmationCode: true,
        platform: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        nights: true,
        hostEarnings: true,
        cleaningFee: true,
        ownerAmount: true,
        managerAmount: true,
        cleaningAmount: true,
        status: true,
        invoiced: true,
        invoiceItemId: true,
        payments: {
          select: {
            id: true,
            amount: true,
            paymentType: true,
            category: true,
            billingAction: true,
            paymentDate: true
          }
        }
      }
    })

    // Calculate month totals
    const totals = {
      reservations: reservations.length,
      nights: 0,
      hostEarnings: 0,
      ownerAmount: 0,
      managerAmount: 0,
      cleaningAmount: 0,
      invoiced: 0,
      pending: 0
    }

    const formattedReservations = reservations.map(r => {
      totals.nights += r.nights
      totals.hostEarnings += Number(r.hostEarnings) || 0
      totals.ownerAmount += Number(r.ownerAmount) || 0
      totals.managerAmount += Number(r.managerAmount) || 0
      totals.cleaningAmount += Number(r.cleaningAmount) || 0

      if (r.invoiced) {
        totals.invoiced++
      } else {
        totals.pending++
      }

      return {
        id: r.id,
        confirmationCode: r.confirmationCode,
        platform: r.platform,
        guestName: r.guestName,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        hostEarnings: Number(r.hostEarnings) || 0,
        cleaningFee: Number(r.cleaningFee) || 0,
        ownerAmount: Number(r.ownerAmount) || 0,
        managerAmount: Number(r.managerAmount) || 0,
        cleaningAmount: Number(r.cleaningAmount) || 0,
        status: r.status,
        invoiced: r.invoiced,
        invoiceItemId: r.invoiceItemId,
        payments: r.payments.map(p => ({
          id: p.id,
          amount: Number(p.amount),
          paymentType: p.paymentType,
          category: p.category,
          billingAction: p.billingAction,
          paymentDate: p.paymentDate.toISOString()
        }))
      }
    })

    // Round totals
    totals.hostEarnings = Math.round(totals.hostEarnings * 100) / 100
    totals.ownerAmount = Math.round(totals.ownerAmount * 100) / 100
    totals.managerAmount = Math.round(totals.managerAmount * 100) / 100
    totals.cleaningAmount = Math.round(totals.cleaningAmount * 100) / 100

    // Get owner name
    const owner = property.billingConfig.owner
    const ownerName = owner
      ? owner.type === 'EMPRESA'
        ? owner.companyName
        : `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
      : null

    return NextResponse.json({
      property: {
        id: property.id,
        name: property.name,
        city: property.city,
        profileImage: property.profileImage,
        ownerName,
        commissionValue: Number(property.billingConfig.commissionValue),
        commissionType: property.billingConfig.commissionType
      },
      year,
      month,
      reservations: formattedReservations,
      totals
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
