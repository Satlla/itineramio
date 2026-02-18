import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Restore: set deletedAt to null, only if owned by user and currently deleted
    const result = await prisma.$executeRaw`
      UPDATE properties SET "deletedAt" = NULL
      WHERE id = ${id} AND "hostId" = ${userId} AND "deletedAt" IS NOT NULL
    `

    if (result === 0) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada en la papelera'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Propiedad restaurada correctamente'
    })
  } catch (error) {
    console.error('Error restoring property:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al restaurar la propiedad'
    }, { status: 500 })
  }
}
