import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAcademySession, removeAcademyAuthCookie } from '../../../../../src/lib/academy/auth'

export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getAcademySession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Delete user and all related data (cascades will handle relations)
    await prisma.academyUser.delete({
      where: { id: session.userId }
    })

    // Remove auth cookie
    await removeAcademyAuthCookie()

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    })

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la cuenta' },
      { status: 500 }
    )
  }
}
