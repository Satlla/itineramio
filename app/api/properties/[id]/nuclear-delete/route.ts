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

    // Soft-delete: set deletedAt instead of deleting
    const result = await prisma.$executeRaw`
      UPDATE properties SET "deletedAt" = NOW()
      WHERE id = ${id} AND "hostId" = ${userId} AND "deletedAt" IS NULL
    `

    if (result === 0) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no autorizada'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Propiedad movida a la papelera'
    })

  } catch (error) {
    console.error('Error soft-deleting property:', error)

    return NextResponse.json({
      success: false,
      error: 'Error al eliminar la propiedad',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
