import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAuthUser } from '../../../../../src/lib/auth'
import { sendTicketEscalatedEmail } from '../../../../../src/lib/email-improved'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const body = await request.json()
    const { ticketId, email } = body

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ticketId is required' },
        { status: 400 }
      )
    }

    // Verify ticket exists and belongs to user/email
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        userId: true,
        email: true,
        subject: true,
        status: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { sender: true, content: true },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (user && ticket.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (!user && ticket.email !== email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update ticket status
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'WAITING_ADMIN', priority: 'HIGH' },
    })

    // Create system message
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: 'AI',
        content: 'El usuario ha solicitado hablar con un agente. Un miembro del equipo revisará tu consulta lo antes posible.',
        aiConfidence: 1,
      },
    })

    // Send email to admin (fire-and-forget)
    sendTicketEscalatedEmail({
      ticketId: ticket.id,
      ticketSubject: ticket.subject,
      userName: user?.email || undefined,
      userEmail: ticket.email || undefined,
      reason: 'manual',
      recentMessages: ticket.messages.reverse(),
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Ticket escalado. Un agente revisará tu consulta pronto.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
