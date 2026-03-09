import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../../../src/lib/admin-auth'
import { createNotification } from '../../../../../../../src/lib/notifications'
import { sendEmail, emailTemplates } from '../../../../../../../src/lib/email-improved'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params
    const body = await req.json()
    const { content, isInternal = false } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: {
        id: true, userId: true, email: true, status: true, subject: true,
        user: { select: { email: true } }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Create admin message
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: 'ADMIN',
        content: content.trim(),
        adminId: authResult.adminId,
        isInternal,
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // If not internal, notify + email the user
    if (!isInternal) {
      // In-app notification for registered users
      if (ticket.userId) {
        await createNotification({
          userId: ticket.userId,
          type: 'info',
          title: 'Nueva respuesta en tu ticket de soporte',
          message: `Hemos respondido a tu consulta: "${ticket.subject}"`,
          actionUrl: `/help-center/tickets/${ticket.id}`,
        })
      }

      // Email to anyone with an email (registered or visitor)
      const recipientEmail = ticket.user?.email || ticket.email
      if (recipientEmail) {
        sendEmail({
          to: recipientEmail,
          subject: `Respuesta a tu consulta: ${ticket.subject}`,
          html: emailTemplates.supportAdminReply({
            ticketSubject: ticket.subject,
            adminMessage: content.trim(),
          }),
        }).catch(err => console.error('Error sending reply email:', err))
      }
    }

    // If ticket was WAITING_ADMIN and this is not internal, set to OPEN
    if (!isInternal && ticket.status === 'WAITING_ADMIN') {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: 'OPEN' }
      })
    }

    // Update lastMessageAt
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { lastMessageAt: new Date() }
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'support_message_sent',
      targetType: 'support_ticket',
      targetId: ticket.id,
      description: isInternal
        ? `Nota interna añadida al ticket: ${ticket.subject}`
        : `Respuesta enviada al ticket: ${ticket.subject}`,
      metadata: { isInternal },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending admin message:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    )
  }
}
