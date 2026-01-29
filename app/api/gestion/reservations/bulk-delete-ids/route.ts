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

    // Verify all reservations belong to user and are not in a liquidation
    const reservations = await prisma.reservation.findMany({
      where: {
        id: { in: ids },
        userId
      },
      select: {
        id: true,
        liquidationId: true
      }
    })

    // Filter out reservations that can't be deleted (those with liquidation)
    const deletableIds = reservations
      .filter(r => !r.liquidationId)
      .map(r => r.id)

    const skipped = ids.length - deletableIds.length

    if (deletableIds.length === 0) {
      return NextResponse.json({
        deleted: 0,
        skipped,
        message: 'No hay reservas que se puedan eliminar'
      })
    }

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
    console.error('Error bulk deleting reservations:', error)
    return NextResponse.json(
      { error: 'Error al eliminar reservas' },
      { status: 500 }
    )
  }
}
