import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    // Get all published update IDs
    const publishedUpdates = await prisma.productUpdate.findMany({
      where: { isPublished: true },
      select: { id: true },
    })

    if (publishedUpdates.length === 0) {
      return NextResponse.json({ unreadCount: 0 })
    }

    // Get read update IDs for this user
    const readUpdates = await prisma.productUpdateRead.findMany({
      where: {
        userId: authResult.userId,
        productUpdateId: { in: publishedUpdates.map(u => u.id) },
      },
      select: { productUpdateId: true },
    })

    const readIds = new Set(readUpdates.map(r => r.productUpdateId))
    const unreadCount = publishedUpdates.filter(u => !readIds.has(u.id)).length

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { error: 'Error al obtener conteo de no leídos' },
      { status: 500 }
    )
  }
}
