import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/gestion/reservations/bulk-delete-ids
 * Delete reservations by array of IDs
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de IDs' },
        { status: 400 }
      )
    }

    // Verify all reservations belong to user
    const reservations = await prisma.reservation.findMany({
      where: {
        id: { in: ids },
        userId
      },
      select: {
        id: true,
        liquidationId: true,
        liquidation: {
          select: { status: true }
        }
      }
    })

    // Only block deletion if liquidation is ISSUED or PAID (locked)
    // DRAFT liquidations allow reservation deletion (unlink first)
    const deletableIds: string[] = []
    const lockedIds: string[] = []

    for (const r of reservations) {
      if (r.liquidationId && r.liquidation && ['SENT', 'PAID'].includes(r.liquidation.status)) {
        lockedIds.push(r.id)
      } else {
        deletableIds.push(r.id)
      }
    }

    const skipped = ids.length - deletableIds.length

    if (deletableIds.length === 0) {
      return NextResponse.json({
        error: lockedIds.length > 0
          ? `No se pueden eliminar: ${lockedIds.length} reservas están en una liquidación emitida o pagada`
          : 'No hay reservas que se puedan eliminar',
        deleted: 0,
        skipped
      }, { status: 400 })
    }

    // Unlink from DRAFT liquidations before deleting
    await prisma.reservation.updateMany({
      where: { id: { in: deletableIds }, liquidationId: { not: null } },
      data: { liquidationId: null }
    })

    // Delete the reservations
    const result = await prisma.reservation.deleteMany({
      where: {
        id: { in: deletableIds }
      }
    })

    return NextResponse.json({
      deleted: result.count,
      skipped,
      message: `${result.count} reservas eliminadas`
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar reservas' },
      { status: 500 }
    )
  }
}
