import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/guests/[id]
 * Get a guest with full history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const guest = await prisma.guest.findFirst({
      where: { id, userId },
      include: {
        reservations: {
          orderBy: { checkIn: 'desc' },
          take: 20,
          include: {
            billingConfig: {
              select: {
                property: {
                  select: { id: true, name: true, profileImage: true }
                }
              }
            }
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Huésped no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ guest })
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/guests/[id]
 * Update a guest
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const existing = await prisma.guest.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Huésped no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, email, phone, country, notes, tags, preferences } = body

    // Check if new email conflicts with another guest
    if (email && email !== existing.email) {
      const conflict = await prisma.guest.findFirst({
        where: { userId, email, id: { not: id } }
      })
      if (conflict) {
        return NextResponse.json(
          { error: 'Ya existe otro huésped con este email' },
          { status: 409 }
        )
      }
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        country: country !== undefined ? country : existing.country,
        notes: notes !== undefined ? notes : existing.notes,
        tags: tags !== undefined ? tags : existing.tags,
        preferences: preferences !== undefined ? preferences : existing.preferences
      }
    })

    return NextResponse.json({ success: true, guest })
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el huésped' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/guests/[id]
 * Delete a guest (only if no reservations)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const guest = await prisma.guest.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { reservations: true } }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Huésped no encontrado' },
        { status: 404 }
      )
    }

    if (guest._count.reservations > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un huésped con reservas asociadas' },
        { status: 400 }
      )
    }

    await prisma.guest.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el huésped' },
      { status: 500 }
    )
  }
}
