import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/reservations/pending
 * Get reservations pending to be liquidated, grouped by owner
 *
 * Query params:
 * - ownerId: filter by owner
 * - propertyId: filter by property
 * - year: filter by checkIn year
 * - month: filter by checkIn month (1-12)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    console.log('[pending API] userId:', userId)

    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    const propertyId = searchParams.get('propertyId')
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    // Date range for period
    let startDate: Date | undefined
    let endDate: Date | undefined

    if (yearParam && monthParam) {
      const year = parseInt(yearParam)
      const month = parseInt(monthParam)
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59, 999)
    }

    // Get all owners
    const owners = await prisma.propertyOwner.findMany({
      where: {
        userId,
        ...(ownerId ? { id: ownerId } : {})
      }
    })
    console.log('[pending API] Found owners:', owners.length)

    // Calculate days in month for occupancy
    const daysInMonth = yearParam && monthParam
      ? new Date(parseInt(yearParam), parseInt(monthParam), 0).getDate()
      : 30

    // Process each owner
    const ownersWithPending = []

    for (const owner of owners) {
      // Query billing units directly (same pattern as preview endpoint)
      const units = await prisma.billingUnit.findMany({
        where: { userId, ownerId: owner.id },
        select: { id: true, name: true, city: true }
      })

      // Also get units from groups owned by this owner
      const groups = await prisma.billingUnitGroup.findMany({
        where: { userId, ownerId: owner.id },
        include: {
          billingUnits: { select: { id: true, name: true, city: true } }
        }
      })

      const billingUnitIds = [
        ...units.map(u => u.id),
        ...groups.flatMap(g => g.billingUnits.map(u => u.id))
      ]

      // Also check legacy PropertyBillingConfig for this owner
      const billingConfigs = await prisma.propertyBillingConfig.findMany({
        where: { ownerId: owner.id, isActive: true },
        select: { id: true, property: { select: { id: true, name: true, city: true } } }
      })
      const billingConfigIds = billingConfigs.map(bc => bc.id)
      console.log(`[pending API] Owner ${owner.firstName}: units=${billingUnitIds.length}, configs=${billingConfigIds.length}`)

      // Build property map for quick lookup
      const propertyMap = new Map<string, { id: string; name: string; city: string | null }>()

      for (const unit of units) {
        propertyMap.set(`unit-${unit.id}`, { id: unit.id, name: unit.name, city: unit.city })
      }
      for (const group of groups) {
        for (const unit of group.billingUnits) {
          propertyMap.set(`unit-${unit.id}`, { id: unit.id, name: unit.name, city: unit.city })
        }
      }
      for (const config of billingConfigs) {
        if (config.property) {
          propertyMap.set(`config-${config.id}`, {
            id: config.property.id,
            name: config.property.name,
            city: config.property.city
          })
        }
      }

      // Get reservations from billing units
      const billingUnitReservations = billingUnitIds.length > 0 ? await prisma.reservation.findMany({
        where: {
          billingUnitId: { in: billingUnitIds },
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          liquidationId: null,
          ...(startDate && endDate ? {
            checkIn: {
              gte: startDate,
              lte: endDate,
            }
          } : {})
        },
        include: {
          billingUnit: {
            select: { id: true, name: true, city: true }
          }
        },
        orderBy: { checkIn: 'asc' }
      }) : []
      console.log(`[pending API] billingUnitReservations: ${billingUnitReservations.length}`)

      // Get reservations from legacy billing configs
      const configReservations = billingConfigIds.length > 0 ? await prisma.reservation.findMany({
        where: {
          billingConfigId: { in: billingConfigIds },
          billingUnitId: null,
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          liquidationId: null,
          ...(startDate && endDate ? {
            checkIn: {
              gte: startDate,
              lte: endDate,
            }
          } : {})
        },
        include: {
          billingConfig: {
            include: {
              property: { select: { id: true, name: true, city: true } }
            }
          }
        },
        orderBy: { checkIn: 'asc' }
      }) : []
      console.log(`[pending API] configReservations: ${configReservations.length}`)

      // Get expenses from billing units
      const billingUnitExpenses = billingUnitIds.length > 0 && startDate && endDate ? await prisma.propertyExpense.findMany({
        where: {
          billingUnitId: { in: billingUnitIds },
          chargeToOwner: true,
          liquidationId: null,
          date: {
            gte: startDate,
            lte: endDate,
          }
        },
        include: {
          billingUnit: {
            select: { id: true, name: true }
          }
        },
        orderBy: { date: 'desc' }
      }) : []

      // Get expenses from legacy billing configs
      const configExpenses = billingConfigIds.length > 0 && startDate && endDate ? await prisma.propertyExpense.findMany({
        where: {
          billingConfigId: { in: billingConfigIds },
          billingUnitId: null,
          chargeToOwner: true,
          liquidationId: null,
          date: {
            gte: startDate,
            lte: endDate,
          }
        },
        include: {
          billingConfig: {
            include: {
              property: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { date: 'desc' }
      }) : []

      // Group by property
      const propertiesMap = new Map<string, {
        property: { id: string; name: string; city: string | null }
        reservations: any[]
        expenses: any[]
        totals: {
          count: number
          nights: number
          hostEarnings: number
          netEarnings: number
          totalExpenses: number
          occupancyPercent: number
        }
      }>()

      // Process billing unit reservations
      for (const r of billingUnitReservations) {
        const propertyId = r.billingUnitId || 'unknown'
        const property = r.billingUnit || { id: propertyId, name: 'N/A', city: null }

        if (!propertiesMap.has(propertyId)) {
          propertiesMap.set(propertyId, {
            property: { id: property.id, name: property.name, city: property.city },
            reservations: [],
            expenses: [],
            totals: { count: 0, nights: 0, hostEarnings: 0, netEarnings: 0, totalExpenses: 0, occupancyPercent: 0 }
          })
        }

        const group = propertiesMap.get(propertyId)!
        const hostEarnings = Number(r.hostEarnings) || 0
        const cleaningAmount = Number(r.cleaningAmount) || 0
        const netEarnings = hostEarnings - cleaningAmount

        group.reservations.push({
          id: r.id,
          confirmationCode: r.confirmationCode,
          platform: r.platform,
          guestName: r.guestName,
          checkIn: r.checkIn.toISOString(),
          checkOut: r.checkOut.toISOString(),
          nights: r.nights,
          hostEarnings,
          netEarnings,
          cleaningAmount
        })

        group.totals.count++
        group.totals.nights += r.nights
        group.totals.hostEarnings += hostEarnings
        group.totals.netEarnings += netEarnings
      }

      // Process config reservations
      for (const r of configReservations) {
        const propertyId = r.billingConfig?.propertyId || 'unknown'
        const property = r.billingConfig?.property || { id: propertyId, name: 'N/A', city: null }

        if (!propertiesMap.has(propertyId)) {
          propertiesMap.set(propertyId, {
            property: { id: property.id, name: property.name, city: property.city },
            reservations: [],
            expenses: [],
            totals: { count: 0, nights: 0, hostEarnings: 0, netEarnings: 0, totalExpenses: 0, occupancyPercent: 0 }
          })
        }

        const group = propertiesMap.get(propertyId)!
        const hostEarnings = Number(r.hostEarnings) || 0
        const cleaningAmount = Number(r.cleaningAmount) || 0
        const netEarnings = hostEarnings - cleaningAmount

        group.reservations.push({
          id: r.id,
          confirmationCode: r.confirmationCode,
          platform: r.platform,
          guestName: r.guestName,
          checkIn: r.checkIn.toISOString(),
          checkOut: r.checkOut.toISOString(),
          nights: r.nights,
          hostEarnings,
          netEarnings,
          cleaningAmount
        })

        group.totals.count++
        group.totals.nights += r.nights
        group.totals.hostEarnings += hostEarnings
        group.totals.netEarnings += netEarnings
      }

      // Process billing unit expenses
      for (const e of billingUnitExpenses) {
        const propertyId = e.billingUnitId || 'unknown'

        if (!propertiesMap.has(propertyId)) {
          const property = e.billingUnit || { id: propertyId, name: 'N/A', city: null }
          propertiesMap.set(propertyId, {
            property: { id: property.id, name: property.name, city: null },
            reservations: [],
            expenses: [],
            totals: { count: 0, nights: 0, hostEarnings: 0, netEarnings: 0, totalExpenses: 0, occupancyPercent: 0 }
          })
        }

        const group = propertiesMap.get(propertyId)!
        const amount = Number(e.amount) || 0
        const vat = Number((e as any).vatAmount) || 0

        group.expenses.push({
          id: e.id,
          date: e.date.toISOString(),
          concept: e.concept,
          category: e.category,
          amount,
          vat
        })

        group.totals.totalExpenses += amount + vat
      }

      // Process config expenses
      for (const e of configExpenses) {
        const propertyId = e.billingConfig?.propertyId || 'unknown'

        if (!propertiesMap.has(propertyId)) {
          const property = e.billingConfig?.property || { id: propertyId, name: 'N/A' }
          propertiesMap.set(propertyId, {
            property: { id: property.id, name: property.name, city: null },
            reservations: [],
            expenses: [],
            totals: { count: 0, nights: 0, hostEarnings: 0, netEarnings: 0, totalExpenses: 0, occupancyPercent: 0 }
          })
        }

        const group = propertiesMap.get(propertyId)!
        const amount = Number(e.amount) || 0
        const vat = Number((e as any).vatAmount) || 0

        group.expenses.push({
          id: e.id,
          date: e.date.toISOString(),
          concept: e.concept,
          category: e.category,
          amount,
          vat
        })

        group.totals.totalExpenses += amount + vat
      }

      // Calculate occupancy and totals
      const properties = Array.from(propertiesMap.values())
      let ownerTotals = {
        count: 0,
        nights: 0,
        hostEarnings: 0,
        netEarnings: 0,
        totalExpenses: 0
      }

      for (const prop of properties) {
        prop.totals.occupancyPercent = Math.round((prop.totals.nights / daysInMonth) * 100)
        prop.totals.hostEarnings = Math.round(prop.totals.hostEarnings * 100) / 100
        prop.totals.netEarnings = Math.round(prop.totals.netEarnings * 100) / 100
        prop.totals.totalExpenses = Math.round(prop.totals.totalExpenses * 100) / 100

        ownerTotals.count += prop.totals.count
        ownerTotals.nights += prop.totals.nights
        ownerTotals.hostEarnings += prop.totals.hostEarnings
        ownerTotals.netEarnings += prop.totals.netEarnings
        ownerTotals.totalExpenses += prop.totals.totalExpenses
      }

      // Only include owners with pending reservations
      if (properties.some(p => p.reservations.length > 0)) {
        ownersWithPending.push({
          owner: {
            id: owner.id,
            type: owner.type,
            firstName: owner.firstName,
            lastName: owner.lastName,
            companyName: owner.companyName
          },
          properties: properties.filter(p => p.reservations.length > 0),
          totals: {
            ...ownerTotals,
            hostEarnings: Math.round(ownerTotals.hostEarnings * 100) / 100,
            netEarnings: Math.round(ownerTotals.netEarnings * 100) / 100,
            totalExpenses: Math.round(ownerTotals.totalExpenses * 100) / 100
          }
        })
      }
    }

    // Sort by net earnings descending
    ownersWithPending.sort((a, b) => b.totals.netEarnings - a.totals.netEarnings)

    const totalPending = ownersWithPending.reduce((sum, o) => sum + o.totals.count, 0)

    return NextResponse.json({
      owners: ownersWithPending,
      totalPending,
      totalAmount: Math.round(ownersWithPending.reduce((sum, o) => sum + o.totals.netEarnings, 0) * 100) / 100,
      daysInMonth,
      year: yearParam ? parseInt(yearParam) : null,
      month: monthParam ? parseInt(monthParam) : null
    })
  } catch (error) {
    console.error('Error fetching pending reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
