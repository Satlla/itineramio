import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * GET /api/owner/[token]
 * Public endpoint - Get owner summary data using magic link token
 * No authentication required - token IS the auth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { searchParams } = new URL(request.url)

    // Default to current month
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // Find owner by magic link token
    const owner = await prisma.propertyOwner.findFirst({
      where: {
        magicLinkToken: token,
        magicLinkTokenExpiry: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Enlace inválido o expirado', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }

    // Update last access timestamp
    await prisma.propertyOwner.update({
      where: { id: owner.id },
      data: { magicLinkLastAccess: new Date() }
    })

    // Get owner's billing units
    const billingUnits = await prisma.billingUnit.findMany({
      where: {
        ownerId: owner.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        city: true
      }
    })

    // Get reservations for the period
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const reservations = await prisma.reservation.findMany({
      where: {
        billingUnit: {
          ownerId: owner.id
        },
        checkOut: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED']
        }
      },
      include: {
        billingUnit: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { checkIn: 'asc' }
    })

    // Get liquidation for the period if exists
    const liquidation = await prisma.liquidation.findFirst({
      where: {
        ownerId: owner.id,
        year,
        month
      }
    })

    // Get invoices for the period
    const invoices = await prisma.clientInvoice.findMany({
      where: {
        ownerId: owner.id,
        OR: [
          { periodYear: year, periodMonth: month },
          {
            issueDate: {
              gte: startDate,
              lte: endDate
            }
          }
        ],
        status: {
          in: ['ISSUED', 'SENT', 'PAID']
        }
      },
      select: {
        id: true,
        fullNumber: true,
        issueDate: true,
        total: true,
        status: true,
        publicToken: true
      },
      orderBy: { issueDate: 'desc' }
    })

    // Calculate summary
    const totalIncome = reservations.reduce((sum, r) => sum + Number(r.roomTotal || 0), 0)
    const totalNights = reservations.reduce((sum, r) => sum + (r.nights || 0), 0)
    const totalReservations = reservations.length

    // Format reservations for response
    const formattedReservations = reservations.map(r => ({
      id: r.id,
      property: r.billingUnit?.name || 'Sin asignar',
      guestName: r.guestName || 'Huésped',
      checkIn: r.checkIn.toISOString().split('T')[0],
      checkOut: r.checkOut.toISOString().split('T')[0],
      nights: r.nights,
      platform: r.platform,
      roomTotal: Number(r.roomTotal || 0),
      cleaningFee: Number(r.cleaningFee || 0),
      hostEarnings: Number(r.hostEarnings || 0),
      ownerAmount: Number(r.ownerAmount || 0)
    }))

    // Get owner display name
    const ownerName = owner.type === 'EMPRESA'
      ? owner.companyName
      : `${owner.firstName || ''} ${owner.lastName || ''}`.trim()

    return NextResponse.json({
      owner: {
        name: ownerName,
        email: owner.email
      },
      manager: {
        name: owner.user.name
      },
      period: {
        month,
        monthName: MONTH_NAMES[month],
        year
      },
      properties: billingUnits,
      summary: {
        totalReservations,
        totalNights,
        totalIncome,
        liquidationAmount: liquidation ? Number(liquidation.totalAmount) : null,
        commission: liquidation ? Number(liquidation.totalCommission) : null,
        retention: liquidation ? Number(liquidation.totalRetention) : null
      },
      reservations: formattedReservations,
      liquidation: liquidation ? {
        id: liquidation.id,
        status: liquidation.status,
        totalIncome: Number(liquidation.totalIncome),
        totalCommission: Number(liquidation.totalCommission),
        totalCommissionVat: Number(liquidation.totalCommissionVat),
        totalRetention: Number(liquidation.totalRetention),
        totalCleaning: Number(liquidation.totalCleaning),
        totalExpenses: Number(liquidation.totalExpenses),
        totalAmount: Number(liquidation.totalAmount)
      } : null,
      invoices: invoices.map(inv => ({
        id: inv.id,
        fullNumber: inv.fullNumber,
        issueDate: inv.issueDate.toISOString().split('T')[0],
        total: Number(inv.total),
        status: inv.status,
        pdfUrl: inv.publicToken ? `/factura/${inv.publicToken}` : null
      }))
    })
  } catch (error) {
    console.error('Error fetching owner portal data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
