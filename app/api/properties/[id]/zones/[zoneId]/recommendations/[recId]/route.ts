import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../../../../src/lib/auth'
import { prisma } from '../../../../../../../../src/lib/prisma'

/**
 * DELETE /api/properties/[id]/zones/[zoneId]/recommendations/[recId]
 * Remove a single recommendation and reorder remaining.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string; recId: string }> }
) {
  try {
    const { id, zoneId, recId } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId

    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { id: true },
    })
    if (!property) {
      return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 })
    }

    // Verify rec belongs to this zone
    const rec = await prisma.recommendation.findFirst({
      where: { id: recId, zoneId },
    })
    if (!rec) {
      return NextResponse.json({ success: false, error: 'Recomendación no encontrada' }, { status: 404 })
    }

    await prisma.recommendation.delete({ where: { id: recId } })

    // Reorder remaining
    const remaining = await prisma.recommendation.findMany({
      where: { zoneId },
      orderBy: { order: 'asc' },
    })
    if (remaining.length > 0) {
      await prisma.$transaction(
        remaining.map((r, i) =>
          prisma.recommendation.update({ where: { id: r.id }, data: { order: i } })
        )
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recommendation:', error)
    return NextResponse.json({ success: false, error: 'Error al eliminar recomendación' }, { status: 500 })
  }
}

/**
 * PATCH /api/properties/[id]/zones/[zoneId]/recommendations/[recId]
 * Update a recommendation's description.
 * Body: { description?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string; recId: string }> }
) {
  try {
    const { id, zoneId, recId } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId

    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { id: true },
    })
    if (!property) {
      return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 })
    }

    const rec = await prisma.recommendation.findFirst({
      where: { id: recId, zoneId },
    })
    if (!rec) {
      return NextResponse.json({ success: false, error: 'Recomendación no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const updated = await prisma.recommendation.update({
      where: { id: recId },
      data: {
        ...(body.description !== undefined && { description: body.description }),
      },
      include: { place: true },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating recommendation:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar recomendación' }, { status: 500 })
  }
}
