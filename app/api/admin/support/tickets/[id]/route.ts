import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../../src/lib/admin-auth'

// GET - Return ticket with ALL messages (including internal)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedAdmin: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            admin: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    )
  }
}

// PATCH - Update ticket status, priority, aiEnabled, assignedTo
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params
    const body = await req.json()

    // Verify ticket exists
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, status: true, priority: true, aiEnabled: true, assignedTo: true }
    })

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Build update data - only include fields that are provided
    const updateData: Record<string, unknown> = {}

    if (body.status !== undefined) {
      const validStatuses = ['OPEN', 'WAITING_ADMIN', 'RESOLVED', 'CLOSED']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (body.priority !== undefined) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: 'Invalid priority' },
          { status: 400 }
        )
      }
      updateData.priority = body.priority
    }

    if (body.aiEnabled !== undefined) {
      updateData.aiEnabled = Boolean(body.aiEnabled)
    }

    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'support_ticket_updated',
      targetType: 'support_ticket',
      targetId: id,
      description: `Ticket actualizado: ${Object.keys(updateData).join(', ')}`,
      metadata: updateData as Record<string, unknown>,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    )
  }
}
