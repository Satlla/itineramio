import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Hard-delete: verificar ownership y borrar permanentemente.
    // Las relaciones con onDelete: Cascade se borran automáticamente.
    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { id: true }
    })

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no autorizada'
      }, { status: 404 })
    }

    await prisma.property.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Propiedad eliminada permanentemente'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error al eliminar la propiedad',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
