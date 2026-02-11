import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * GET /api/facturacion/properties/[propertyId]
 * Obtener detalle de una propiedad o BillingUnit con años/meses de facturación
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
    const type = searchParams.get('type') // 'unit', 'group', or null (legacy property)

    let propertyData: any = null
    let reservations: any[] = []
    let expenses: any[] = []
    let ownerId: string | null = null
    let commissionValue = 0
    let unitCount = 0

    if (type === 'group') {
      // Handle BillingUnitGroup (conjunto)
      const group = await prisma.billingUnitGroup.findFirst({
        where: { id: propertyId, userId },
        include: {
          owner: {
            select: {
              id: true,
              type: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true
            }
          },
          billingUnits: {
            where: { isActive: true },
            include: {
              reservations: {
                where: {
                  status: { in: ['CONFIRMED', 'COMPLETED'] }
                },
                select: {
                  id: true,
                  checkIn: true,
                  nights: true,
                  hostEarnings: true,
                  roomTotal: true,
                  cleaningFee: true
                }
              },
              expenses: {
                select: {
                  id: true,
                  amount: true,
                  date: true
                }
              }
            }
          }
        }
      })

      if (!group) {
        return NextResponse.json(
          { error: 'Conjunto no encontrado' },
          { status: 404 }
        )
      }

      const owner = group.owner
      propertyData = {
        id: group.id,
        name: group.name,
        city: group.billingUnits[0]?.city || '',
        imageUrl: group.billingUnits.find(u => u.imageUrl)?.imageUrl || null,
        type: 'group',
        unitCount: group.billingUnits.length,
        units: group.billingUnits.map(u => ({ id: u.id, name: u.name })),
        owner: owner ? {
          id: owner.id,
          name: owner.type === 'EMPRESA'
            ? owner.companyName
            : `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
          email: owner.email
        } : null,
        billingConfig: {
          commissionType: group.commissionType || 'PERCENTAGE',
          commissionValue: Number(group.commissionValue),
          incomeReceiver: group.incomeReceiver || 'OWNER',
          cleaningValue: Number(group.cleaningValue)
        }
      }

      // Aggregate reservations and expenses from all units
      reservations = group.billingUnits.flatMap(u => u.reservations || [])
      expenses = group.billingUnits.flatMap(u => u.expenses || [])
      ownerId = group.ownerId
      commissionValue = Number(group.commissionValue)
      unitCount = group.billingUnits.length
    } else if (type === 'unit') {
      // Handle BillingUnit
      const billingUnit = await prisma.billingUnit.findFirst({
        where: { id: propertyId, userId },
        include: {
          owner: {
            select: {
              id: true,
              type: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true
            }
          },
          reservations: {
            where: {
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
          },
          expenses: {
            select: {
              id: true,
              amount: true,
              date: true
            }
          }
        }
      })

      if (!billingUnit) {
        return NextResponse.json(
          { error: 'Apartamento no encontrado' },
          { status: 404 }
        )
      }

      const owner = billingUnit.owner
      propertyData = {
        id: billingUnit.id,
        name: billingUnit.name,
        city: billingUnit.city || '',
        imageUrl: billingUnit.imageUrl || null,
        owner: owner ? {
          id: owner.id,
          name: owner.type === 'EMPRESA'
            ? owner.companyName
            : `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
          email: owner.email
        } : null,
        billingConfig: {
          commissionType: billingUnit.commissionType || 'PERCENTAGE',
          commissionValue: Number(billingUnit.commissionValue),
          incomeReceiver: billingUnit.incomeReceiver || 'OWNER',
          cleaningValue: Number(billingUnit.cleaningValue)
        }
      }

      reservations = billingUnit.reservations || []
      expenses = billingUnit.expenses || []
      ownerId = billingUnit.ownerId
      commissionValue = Number(billingUnit.commissionValue)
    } else {
      // Handle legacy Property
      const property = await prisma.property.findFirst({
        where: { id: propertyId, hostId: userId },
        include: {
          billingConfig: {
            include: {
              owner: {
                select: {
                  id: true,
                  type: true,
                  firstName: true,
                  lastName: true,
                  companyName: true,
                  email: true
                }
              },
              reservations: {
                where: {
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
              },
              expenses: {
                select: {
                  id: true,
                  amount: true,
                  date: true
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

      const owner = property.billingConfig?.owner
      propertyData = {
        id: property.id,
        name: property.name,
        city: property.city || '',
        imageUrl: property.profileImage || null,
        owner: owner ? {
          id: owner.id,
          name: owner.type === 'EMPRESA'
            ? owner.companyName
            : `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
          email: owner.email
        } : null,
        billingConfig: property.billingConfig ? {
          commissionType: property.billingConfig.commissionType,
          commissionValue: Number(property.billingConfig.commissionValue),
          incomeReceiver: property.billingConfig.incomeReceiver,
          cleaningValue: Number(property.billingConfig.cleaningValue)
        } : null
      }

      reservations = property.billingConfig?.reservations || []
      expenses = property.billingConfig?.expenses || []
      ownerId = property.billingConfig?.ownerId || null
      commissionValue = Number(property.billingConfig?.commissionValue || 0)
    }

    // Get all liquidations for this owner
    const liquidations = ownerId ? await prisma.liquidation.findMany({
      where: {
        userId,
        ownerId
      },
      select: {
        id: true,
        year: true,
        month: true,
        status: true,
        invoiceNumber: true,
        totalAmount: true
      }
    }) : []

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
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const key = `${year}-${month}`
      expenseMap.set(key, (expenseMap.get(key) || 0) + Number(expense.amount))

      // Also add year to yearMap if not exists (so years with only expenses show up)
      if (!yearMap.has(year)) {
        yearMap.set(year, new Map())
      }
    })

    // Also add current year if not present (so users can always access current month)
    const currentYear = new Date().getFullYear()
    if (!yearMap.has(currentYear)) {
      yearMap.set(currentYear, new Map())
    }

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
          const commission = (monthData.income * commissionValue) / 100

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
          commission: acc.commission + m.commission,
          expenses: acc.expenses + m.expenses
        }), { reservations: 0, income: 0, nights: 0, commission: 0, expenses: 0 })

        // Calculate occupancy (assuming 365 days per year, multiplied by unit count for groups)
        const daysInYear = year === new Date().getFullYear()
          ? Math.ceil((new Date().getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
          : 365
        const totalAvailableDays = daysInYear * (unitCount || 1)
        const occupancyRate = totalAvailableDays > 0 ? (totals.nights / totalAvailableDays) * 100 : 0

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
      property: propertyData,
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
