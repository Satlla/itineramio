import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { verifyAdminToken } from '../../../../../src/lib/admin-auth'
import { cookies } from 'next/headers'

/**
 * GET /api/admin/academia/quiz-leads
 * Obtiene todos los quiz leads para el admin
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get all quiz leads
    const leads = await prisma.quizLead.findMany({
      orderBy: {
        completedAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        score: true,
        level: true,
        timeElapsed: true,
        converted: true,
        completedAt: true,
        source: true,
        academyUserId: true,
        emailVerified: true,
        verifiedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length
    })

  } catch (error) {
    console.error('Error fetching quiz leads:', error)
    return NextResponse.json(
      { error: 'Error al obtener los leads' },
      { status: 500 }
    )
  }
}
