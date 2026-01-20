import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * GET /api/facturacion/properties/[propertyId]
 * Obtener detalle de una propiedad con años/meses de facturación
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

    // Get property with billing config
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
      include: {
        billingConfig: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
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

    // Get all reservations for this property, grouped by year
    const reservations = await prisma.reservation.findMany({
      where: {
        propertyId,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      select: {
        id: true,
        checkIn: true,
        nights: true,
        hostEarnings: true,
        roomTotal: true,
        cleaningFee: true
      },
      orderBy: { checkIn: 'desc' }
    })

    // Get all liquidations for this property
    const liquidations = await prisma.liquidation.findMany({
      where: {
        userId,
        reservations: {
          some: { propertyId }
        }
      },
      select: {
        id: true,
        year: true,
        month: true,
        status: true,
        invoiceNumber: true,
        totalAmount: true
      }
    })

    // Get expenses for this property
    const expenses = await prisma.expense.findMany({
      where: { billingConfigId: property.billingConfig?.id },
      select: {
        id: true,
        amount: true,
        date: true
      }
    })

    // Group reservations by year and month
    const yearMap = new Map<number, Map<number, { reservations: number; income: number; nights: number; cleaning: number }>>()

    reservations.forEach(reservation => {
      const date = new Date(reservation.checkIn)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      if (!yearMap.has(year)) {
        yearMap.set(year, new Map())
      }
      const monthMap = yearMap.get(year)!

      if (!monthMap.has(month)) {
        monthMap.set(month, { reservations: 0, income: 0, nights: 0, cleaning: 0 })
      }

      const monthData = monthMap.get(month)!
      monthData.reservations += 1
      monthData.income += Number(reservation.hostEarnings || reservation.roomTotal || 0)
      monthData.nights += reservation.nights || 0
      monthData.cleaning += Number(reservation.cleaningFee || 0)
    })

    // Group expenses by year and month
    const expenseMap = new Map<string, number>()
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      expenseMap.set(key, (expenseMap.get(key) || 0) + Number(expense.amount))
    })

    // Build year data structure
    const years = Array.from(yearMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, monthMap]) => {
        const months = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1
          const monthData = monthMap.get(month) || { reservations: 0, income: 0, nights: 0, cleaning: 0 }
          const expenseKey = `${year}-${month}`
          const expenseAmount = expenseMap.get(expenseKey) || 0

          // Find liquidation for this month
          const liquidation = liquidations.find(l => l.year === year && l.month === month)

          // Calculate commission based on billing config
          const commissionRate = property.billingConfig?.commissionValue || 0
          const commission = (monthData.income * Number(commissionRate)) / 100

          return {
            month,
            monthName: monthNames[i],
            reservations: monthData.reservations,
            income: Math.round(monthData.income * 100) / 100,
            nights: monthData.nights,
            commission: Math.round(commission * 100) / 100,
            cleaning: Math.round(monthData.cleaning * 100) / 100,
            expenses: Math.round(expenseAmount * 100) / 100,
            liquidation: liquidation ? {
              id: liquidation.id,
              status: liquidation.status,
              totalAmount: Number(liquidation.totalAmount),
              invoiceNumber: liquidation.invoiceNumber
            } : null
          }
        })

        // Calculate year totals
        const totals = months.reduce((acc, m) => ({
          reservations: acc.reservations + m.reservations,
          income: acc.income + m.income,
          nights: acc.nights + m.nights,
          commission: acc.commission + m.commission
        }), { reservations: 0, income: 0, nights: 0, commission: 0 })

        // Calculate occupancy (assuming 365 days per year)
        const daysInYear = year === new Date().getFullYear()
          ? Math.ceil((new Date().getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
          : 365
        const occupancyRate = daysInYear > 0 ? (totals.nights / daysInYear) * 100 : 0

        return {
          year,
          months,
          totals: {
            ...totals,
            occupancyRate: Math.min(occupancyRate, 100),
            averageNightPrice: totals.nights > 0 ? totals.income / totals.nights : 0
          }
        }
      })

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        name: property.name,
        city: property.city || '',
        imageUrl: property.mainImage || property.images?.[0] || null,
        owner: property.billingConfig?.owner || null,
        billingConfig: property.billingConfig ? {
          commissionType: property.billingConfig.commissionType,
          commissionValue: Number(property.billingConfig.commissionValue),
          incomeReceiver: property.billingConfig.incomeReceiver,
          cleaningValue: Number(property.billingConfig.cleaningValue)
        } : null
      },
      years
    })
  } catch (error) {
    console.error('Error fetching property facturacion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
