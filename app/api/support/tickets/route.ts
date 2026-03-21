import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: authResult.userId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    )
  }
}
