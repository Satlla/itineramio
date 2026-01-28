import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/guests
 * List all guests with optional search
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { userId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    const guests = await prisma.guest.findMany({
      where,
      orderBy: { lastStayAt: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { reservations: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      guests: guests.map(g => ({
        ...g,
        reservationCount: g._count.reservations
      }))
    })
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/guests
 * Create a new guest
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { email, name, phone, country, notes, tags } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }

    // Check if guest with same email already exists (if email provided)
    if (email) {
      const existing = await prisma.guest.findFirst({
        where: { userId, email }
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe un huésped con este email', existingGuest: existing },
          { status: 409 }
        )
      }
    }

    const guest = await prisma.guest.create({
      data: {
        userId,
        email: email || null,
        name,
        phone: phone || null,
        country: country || null,
        notes: notes || null,
        tags: tags || []
      }
    })

    return NextResponse.json({ success: true, guest })
  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json(
      { error: 'Error al crear el huésped' },
      { status: 500 }
    )
  }
}
