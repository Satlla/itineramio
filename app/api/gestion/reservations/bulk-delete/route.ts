import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/gestion/reservations/bulk-delete
 * Delete reservations by month/property or billingUnit
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { propertyId, year, month, deleteAll, isUnit } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Se requiere propertyId' },
        { status: 400 }
      )
    }

    if (!deleteAll && (!year || !month)) {
      return NextResponse.json(
        { error: 'Se requiere year y month, o deleteAll=true' },
        { status: 400 }
      )
    }

    console.log('Bulk delete request:', { propertyId, deleteAll, isUnit, userId })

    // Build where clause based on property type
    let whereClause: any = { userId }

    if (isUnit) {
      // Handle BillingUnit (new model)
      const billingUnit = await prisma.billingUnit.findFirst({
        where: { id: propertyId, userId }
      })

      if (!billingUnit) {
        return NextResponse.json(
          { error: 'Apartamento no encontrado' },
          { status: 404 }
        )
      }

      whereClause.billingUnitId = billingUnit.id
    } else {
      // Handle legacy Property with BillingConfig
      const billingConfig = await prisma.propertyBillingConfig.findFirst({
        where: {
          propertyId,
          property: { hostId: userId }
        }
      })

      if (!billingConfig) {
        return NextResponse.json(
          { error: 'Propiedad no encontrada' },
          { status: 404 }
        )
      }

      whereClause.billingConfigId = billingConfig.id
    }

    if (!deleteAll && year && month) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)
      whereClause.checkIn = {
        gte: startDate,
        lte: endDate
      }
    }

    console.log('Where clause:', JSON.stringify(whereClause))

    // Find reservations that can be deleted
    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      select: {
        id: true,
        confirmationCode: true,
        liquidationId: true,
        invoiced: true
      }
    })

    console.log('Found reservations:', reservations.length)

    // Check for reservations that can't be deleted (those with liquidation or invoiced)
    const inLiquidation = reservations.filter(r => r.liquidationId)
    const invoiced = reservations.filter(r => r.invoiced && !r.liquidationId)
    const deletable = reservations.filter(r => !r.liquidationId && !r.invoiced)

    console.log('In liquidation:', inLiquidation.length, 'Invoiced:', invoiced.length, 'Deletable:', deletable.length)

    if (deletable.length === 0) {
      return NextResponse.json({
        deleted: 0,
        skipped: reservations.length,
        message: 'No hay reservas que se puedan eliminar',
        details: {
          invoiced: invoiced.length,
          inLiquidation: inLiquidation.length
        }
      })
    }

    // Delete the reservations
    const result = await prisma.reservation.deleteMany({
      where: {
        id: { in: deletable.map(r => r.id) }
      }
    })

    return NextResponse.json({
      deleted: result.count,
      skipped: inLiquidation.length + invoiced.length,
      message: `${result.count} reservas eliminadas`,
      details: {
        invoiced: invoiced.length,
        inLiquidation: inLiquidation.length
      }
    })
  } catch (error) {
    console.error('Error bulk deleting reservations:', error)
    return NextResponse.json(
      { error: 'Error al eliminar reservas' },
      { status: 500 }
    )
  }
}
