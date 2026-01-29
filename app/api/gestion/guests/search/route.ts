import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/guests/search
 * Search for guests by email or name (for autocomplete)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const email = searchParams.get('email')

    if (!q && !email) {
      return NextResponse.json({ guests: [] })
    }

    let where: any = { userId }

    // If searching by exact email
    if (email) {
      where.email = email
    } else if (q && q.length >= 2) {
      // Search by name, email or phone
      // Note: contains on nullable fields returns false if null, which is fine
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } }
      ]
    } else {
      return NextResponse.json({ guests: [] })
    }

    const guests = await prisma.guest.findMany({
      where,
      orderBy: [
        { lastStayAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' }
      ],
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        notes: true,
        totalStays: true,
        lastStayAt: true,
        tags: true,
        _count: {
          select: { reservations: true }
        }
      }
    })

    return NextResponse.json({
      guests: guests.map(g => ({
        ...g,
        reservationCount: g._count.reservations
      }))
    })
  } catch (error: any) {
    console.error('Error searching guests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
