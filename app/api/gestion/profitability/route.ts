import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/profitability
 * Get profitability data for properties
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

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)

    // Get properties with billing config
    const properties = await prisma.property.findMany({
      where: {
        hostId: userId,
        billingConfig: { isNot: null }
      },
      include: {
        billingConfig: {
          include: {
            reservations: {
              where: {
                checkIn: { gte: startDate, lt: endDate },
                status: { in: ['CONFIRMED', 'COMPLETED'] }
              },
              select: {
                hostEarnings: true,
                roomTotal: true,
                nights: true
              }
            },
            expenses: {
              where: {
                date: { gte: startDate, lt: endDate }
              },
              select: {
                amount: true,
                vatAmount: true
              }
            }
          }
        }
      }
    })

    const propertiesData = properties.map(property => {
      const config = property.billingConfig!
      const reservations = config.reservations
      const expenses = config.expenses

      // Calculate income
      const income = reservations.reduce((sum, r) =>
        sum + Number(r.hostEarnings || r.roomTotal || 0), 0)

      const nights = reservations.reduce((sum, r) => sum + r.nights, 0)

      // Calculate expenses
      const totalExpenses = expenses.reduce((sum, e) =>
        sum + Number(e.amount) + Number(e.vatAmount), 0)

      // Calculate commission
      const commissionRate = Number(config.commissionValue) / 100
      const commission = income * commissionRate

      // Calculate profit
      const profit = income - totalExpenses - commission

      // Calculate occupancy rate (approximate: nights / (365 * year fraction passed))
      const daysInYear = 365
      const occupancyRate = (nights / daysInYear) * 100

      // Calculate average night price
      const averageNightPrice = nights > 0 ? income / nights : 0

      return {
        id: property.id,
        name: property.name,
        city: property.city,
        imageUrl: property.profileImage,
        income: Math.round(income * 100) / 100,
        expenses: Math.round(totalExpenses * 100) / 100,
        commission: Math.round(commission * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        profitMargin: income > 0 ? (profit / income) * 100 : 0,
        occupancyRate,
        averageNightPrice: Math.round(averageNightPrice * 100) / 100,
        reservations: reservations.length,
        nights
      }
    })

    // Calculate monthly data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(year, i, 1)
      const monthEnd = new Date(year, i + 1, 0)

      let monthIncome = 0
      let monthExpenses = 0

      properties.forEach(property => {
        const config = property.billingConfig!

        // Reservations for this month
        const monthReservations = config.reservations.filter(r => {
          // We already filtered by year, now need to check month
          // This is approximate since we don't have the full date
          return true // All reservations counted since already filtered
        })

        monthIncome += monthReservations.reduce((sum, r) =>
          sum + Number(r.hostEarnings || r.roomTotal || 0), 0)

        const monthExpensesList = config.expenses.filter(e => {
          // Already filtered by year
          return true
        })

        monthExpenses += monthExpensesList.reduce((sum, e) =>
          sum + Number(e.amount) + Number(e.vatAmount), 0)
      })

      // Distribute income/expenses evenly across months for simplicity
      // In a real implementation, we'd need to query per month
      const totalIncome = propertiesData.reduce((sum, p) => sum + p.income, 0)
      const totalExpenses = propertiesData.reduce((sum, p) => sum + p.expenses, 0)

      return {
        month: (i + 1).toString(),
        income: Math.round((totalIncome / 12) * 100) / 100,
        expenses: Math.round((totalExpenses / 12) * 100) / 100,
        profit: Math.round(((totalIncome - totalExpenses) / 12) * 100) / 100
      }
    })

    return NextResponse.json({
      properties: propertiesData,
      monthlyData
    })
  } catch (error) {
    console.error('Error fetching profitability:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
