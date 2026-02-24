import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/reservations/[id]
 * Get a single reservation
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

    const reservation = await prisma.reservation.findFirst({
      where: { id, userId },
      include: {
        billingUnit: {
          select: {
            id: true,
            name: true,
            commissionValue: true,
            cleaningValue: true
          }
        },
        billingConfig: {
          select: {
            id: true,
            commissionValue: true,
            cleaningValue: true,
            property: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/reservations/[id]
 * Update a reservation
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

    // Verify reservation exists and belongs to user
    const existing = await prisma.reservation.findFirst({
      where: { id, userId },
      include: {
        billingUnit: true,
        billingConfig: true,
        liquidation: {
          select: { status: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Only block if in a PAID liquidation
    if (existing.liquidation?.status === 'PAID') {
      return NextResponse.json(
        { error: 'No se puede editar una reserva en una liquidación pagada' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      hostEarnings,
      roomTotal,
      cleaningFee,
      hostServiceFee,
      internalNotes,
      status
    } = body

    // Calculate nights if dates changed
    let nights = existing.nights
    const checkInDate = checkIn ? new Date(checkIn) : existing.checkIn
    const checkOutDate = checkOut ? new Date(checkOut) : existing.checkOut

    if (checkIn || checkOut) {
      nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      if (nights < 1) {
        return NextResponse.json(
          { error: 'Las fechas no son válidas' },
          { status: 400 }
        )
      }
    }

    // Recalculate amounts if earnings changed
    const earnings = hostEarnings !== undefined ? Number(hostEarnings) : Number(existing.hostEarnings)
    const cleaning = cleaningFee !== undefined ? Number(cleaningFee) : Number(existing.cleaningFee)

    // Get commission value from billingUnit or billingConfig
    const commissionValue = existing.billingUnit?.commissionValue
      ?? existing.billingConfig?.commissionValue
      ?? 0
    const commissionPct = Number(commissionValue) / 100
    const managerAmount = (earnings - cleaning) * commissionPct
    const ownerAmount = earnings - managerAmount

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        guestName: guestName ?? existing.guestName,
        guestEmail: guestEmail ?? existing.guestEmail,
        guestPhone: guestPhone ?? existing.guestPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        hostEarnings: earnings,
        roomTotal: roomTotal !== undefined ? Number(roomTotal) : Number(existing.roomTotal),
        cleaningFee: cleaning,
        hostServiceFee: hostServiceFee !== undefined ? Number(hostServiceFee) : Number(existing.hostServiceFee),
        internalNotes: internalNotes ?? existing.internalNotes,
        status: status ?? existing.status,
        ownerAmount,
        managerAmount,
        cleaningAmount: cleaning
      },
      include: {
        billingUnit: {
          select: { id: true, name: true }
        },
        billingConfig: {
          select: {
            property: { select: { id: true, name: true } }
          }
        }
      }
    })

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la reserva' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/reservations/[id]
 * Delete a reservation
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

    // Verify reservation exists and belongs to user
    const existing = await prisma.reservation.findFirst({
      where: { id, userId },
      include: {
        liquidation: {
          select: { status: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Only block if in a PAID liquidation
    if (existing.liquidation?.status === 'PAID') {
      return NextResponse.json(
        { error: 'No se puede eliminar una reserva en una liquidación pagada' },
        { status: 400 }
      )
    }

    await prisma.reservation.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la reserva' },
      { status: 500 }
    )
  }
}
