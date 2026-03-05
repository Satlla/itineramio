import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/reservations/pending
 * Get reservations pending to be liquidated, grouped by owner
 * Optimized: uses batched queries instead of per-owner loops
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const ownerIdFilter = searchParams.get('ownerId')
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    let startDate: Date | undefined
    let endDate: Date | undefined
    if (yearParam && monthParam) {
      const year = parseInt(yearParam)
      const month = parseInt(monthParam)
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59, 999)
    }

    const daysInMonth = yearParam && monthParam
      ? new Date(parseInt(yearParam), parseInt(monthParam), 0).getDate()
      : 30

    // --- Batch 1: Load all structural data in parallel ---
    const [owners, allUnits, allGroups, allConfigs] = await Promise.all([
      prisma.propertyOwner.findMany({
        where: { userId, ...(ownerIdFilter ? { id: ownerIdFilter } : {}) },
        select: { id: true, type: true, firstName: true, lastName: true, companyName: true }
      }),
      prisma.billingUnit.findMany({
        where: { userId, ownerId: { not: null } },
        select: { id: true, name: true, city: true, ownerId: true }
      }),
      prisma.billingUnitGroup.findMany({
        where: { userId },
        include: { billingUnits: { select: { id: true, name: true, city: true } } }
      }),
      prisma.propertyBillingConfig.findMany({
        where: { isActive: true, ownerId: { not: null } },
        select: { id: true, ownerId: true, property: { select: { id: true, name: true, city: true } } }
      })
    ])

    // Build owner → billingUnitIds and owner → billingConfigIds maps
    const ownerUnitIds = new Map<string, Set<string>>()
    const unitInfoMap = new Map<string, { name: string; city: string | null }>()

    for (const unit of allUnits) {
      if (!unit.ownerId) continue
      if (!ownerUnitIds.has(unit.ownerId)) ownerUnitIds.set(unit.ownerId, new Set())
      ownerUnitIds.get(unit.ownerId)!.add(unit.id)
      unitInfoMap.set(unit.id, { name: unit.name, city: unit.city })
    }
    for (const group of allGroups) {
      if (!group.ownerId) continue
      if (!ownerUnitIds.has(group.ownerId)) ownerUnitIds.set(group.ownerId, new Set())
      for (const unit of group.billingUnits) {
        ownerUnitIds.get(group.ownerId)!.add(unit.id)
        unitInfoMap.set(unit.id, { name: unit.name, city: unit.city })
      }
    }

    const ownerConfigIds = new Map<string, Set<string>>()
    const configPropertyMap = new Map<string, { id: string; name: string; city: string | null }>()

    for (const config of allConfigs) {
      if (!config.ownerId) continue
      if (!ownerConfigIds.has(config.ownerId)) ownerConfigIds.set(config.ownerId, new Set())
      ownerConfigIds.get(config.ownerId)!.add(config.id)
      if (config.property) {
        configPropertyMap.set(config.id, { id: config.property.id, name: config.property.name, city: config.property.city })
      }
    }

    // Collect ALL billingUnit IDs and config IDs across all owners
    const allBillingUnitIds = [...new Set([...ownerUnitIds.values()].flatMap(s => [...s]))]
    const allBillingConfigIds = [...new Set([...ownerConfigIds.values()].flatMap(s => [...s]))]

    const dateFilter = startDate && endDate
      ? { checkIn: { gte: startDate, lte: endDate } }
      : {}

    // --- Batch 2: Load all reservations + count of other-month pending in parallel ---
    const [unitReservations, configReservations, otherMonthCount] = await Promise.all([
      allBillingUnitIds.length > 0 ? prisma.reservation.findMany({
        where: {
          billingUnitId: { in: allBillingUnitIds },
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          liquidationId: null,
          ...dateFilter
        },
        select: {
          id: true, billingUnitId: true, confirmationCode: true, platform: true,
          guestName: true, checkIn: true, checkOut: true, nights: true,
          hostEarnings: true, cleaningAmount: true
        },
        orderBy: { checkIn: 'asc' }
      }) : [],
      allBillingConfigIds.length > 0 ? prisma.reservation.findMany({
        where: {
          billingConfigId: { in: allBillingConfigIds },
          billingUnitId: null,
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          liquidationId: null,
          ...dateFilter
        },
        select: {
          id: true, billingConfigId: true, confirmationCode: true, platform: true,
          guestName: true, checkIn: true, checkOut: true, nights: true,
          hostEarnings: true, cleaningAmount: true
        },
        orderBy: { checkIn: 'asc' }
      }) : [],
      // Count pending reservations from OTHER months (for the notice)
      startDate && endDate ? prisma.reservation.count({
        where: {
          userId,
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          liquidationId: null,
          OR: [
            { checkIn: { lt: startDate } },
            { checkIn: { gt: endDate } }
          ]
        }
      }) : Promise.resolve(0)
    ])

    // --- Group reservations by owner in memory ---
    // Build billingUnitId → ownerId reverse lookup
    const unitToOwner = new Map<string, string>()
    for (const [ownerId, unitIds] of ownerUnitIds) {
      for (const unitId of unitIds) unitToOwner.set(unitId, ownerId)
    }
    const configToOwner = new Map<string, string>()
    for (const [ownerId, configIds] of ownerConfigIds) {
      for (const configId of configIds) configToOwner.set(configId, ownerId)
    }

    // owner → property → reservations
    type PropertyGroup = {
      property: { id: string; name: string; city: string | null }
      totals: { count: number; nights: number; hostEarnings: number; netEarnings: number }
    }
    const ownerProperties = new Map<string, Map<string, PropertyGroup>>()

    for (const r of unitReservations) {
      const ownerId = unitToOwner.get(r.billingUnitId!)
      if (!ownerId) continue

      if (!ownerProperties.has(ownerId)) ownerProperties.set(ownerId, new Map())
      const propMap = ownerProperties.get(ownerId)!
      const propId = r.billingUnitId!
      if (!propMap.has(propId)) {
        const info = unitInfoMap.get(propId)
        propMap.set(propId, {
          property: { id: propId, name: info?.name || 'N/A', city: info?.city || null },
          totals: { count: 0, nights: 0, hostEarnings: 0, netEarnings: 0 }
        })
      }
      const group = propMap.get(propId)!
      const hostEarnings = Number(r.hostEarnings) || 0
      const cleaningAmount = Number(r.cleaningAmount) || 0
      group.totals.count++
      group.totals.nights += r.nights
      group.totals.hostEarnings += hostEarnings
      group.totals.netEarnings += hostEarnings - cleaningAmount
    }

    for (const r of configReservations) {
      const ownerId = configToOwner.get(r.billingConfigId!)
      if (!ownerId) continue

      if (!ownerProperties.has(ownerId)) ownerProperties.set(ownerId, new Map())
      const propMap = ownerProperties.get(ownerId)!
      const configProp = configPropertyMap.get(r.billingConfigId!)
      const propId = configProp?.id || r.billingConfigId!
      if (!propMap.has(propId)) {
        propMap.set(propId, {
          property: { id: propId, name: configProp?.name || 'N/A', city: configProp?.city || null },
          totals: { count: 0, nights: 0, hostEarnings: 0, netEarnings: 0 }
        })
      }
      const group = propMap.get(propId)!
      const hostEarnings = Number(r.hostEarnings) || 0
      const cleaningAmount = Number(r.cleaningAmount) || 0
      group.totals.count++
      group.totals.nights += r.nights
      group.totals.hostEarnings += hostEarnings
      group.totals.netEarnings += hostEarnings - cleaningAmount
    }

    // --- Build response ---
    const ownersWithPending = []
    for (const owner of owners) {
      const propMap = ownerProperties.get(owner.id)
      if (!propMap || propMap.size === 0) continue

      const properties = [...propMap.values()].map(p => ({
        property: p.property,
        totals: {
          count: p.totals.count,
          nights: p.totals.nights
        }
      }))

      const ownerTotals = {
        count: 0, nights: 0, hostEarnings: 0, netEarnings: 0, totalExpenses: 0
      }
      for (const p of propMap.values()) {
        ownerTotals.count += p.totals.count
        ownerTotals.nights += p.totals.nights
        ownerTotals.hostEarnings += p.totals.hostEarnings
        ownerTotals.netEarnings += p.totals.netEarnings
      }

      ownersWithPending.push({
        owner: {
          id: owner.id,
          type: owner.type,
          firstName: owner.firstName,
          lastName: owner.lastName,
          companyName: owner.companyName
        },
        properties,
        totals: {
          count: ownerTotals.count,
          nights: ownerTotals.nights,
          hostEarnings: Math.round(ownerTotals.hostEarnings * 100) / 100,
          netEarnings: Math.round(ownerTotals.netEarnings * 100) / 100,
          totalExpenses: 0
        }
      })
    }

    ownersWithPending.sort((a, b) => b.totals.netEarnings - a.totals.netEarnings)
    const totalPending = ownersWithPending.reduce((sum, o) => sum + o.totals.count, 0)

    const response = {
      owners: ownersWithPending,
      totalPending,
      totalAmount: Math.round(ownersWithPending.reduce((sum, o) => sum + o.totals.netEarnings, 0) * 100) / 100,
      otherMonthsPending: otherMonthCount,
      daysInMonth,
      year: yearParam ? parseInt(yearParam) : null,
      month: monthParam ? parseInt(monthParam) : null,
      _debug: {
        ownerCount: owners.length,
        unitsWithOwner: allUnits.length,
        groups: allGroups.length,
        configs: allConfigs.length,
        allBillingUnitIds,
        allBillingConfigIds,
        unitReservationsCount: unitReservations.length,
        configReservationsCount: configReservations.length,
        dateFilter: { startDate, endDate }
      }
    }
    console.log('[pending] response:', JSON.stringify(response._debug))
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching pending reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
