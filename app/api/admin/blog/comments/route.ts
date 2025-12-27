import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    // Build where clause
    const where = status === 'ALL' ? {} : { status }

    // Get comments
    const comments = await prisma.blogComment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        post: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Error al cargar comentarios' },
      { status: 500 }
    )
  }
}
