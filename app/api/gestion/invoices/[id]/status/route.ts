import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ClientInvoiceStatus } from '@prisma/client'

/**
 * Valid state transitions for invoices
 * DRAFT → PROFORMA (preview without number)
 * PROFORMA → DRAFT (back to editing)
 * DRAFT/PROFORMA → ISSUED (via /issue endpoint, not here)
 * ISSUED → SENT, PAID, OVERDUE
 * SENT → PAID, OVERDUE
 * OVERDUE → PAID
 * PAID → (no transitions allowed)
 */
const VALID_TRANSITIONS: Record<ClientInvoiceStatus, ClientInvoiceStatus[]> = {
  DRAFT: ['PROFORMA'], // Can convert to proforma
  PROFORMA: ['DRAFT'], // Can go back to draft for editing
  ISSUED: ['SENT', 'PAID', 'OVERDUE'],
  SENT: ['PAID', 'OVERDUE'],
  OVERDUE: ['PAID'],
  PAID: []
}

/**
 * PUT /api/gestion/invoices/[id]/status
 * Update invoice status (with validation of allowed transitions)
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

    const existing = await prisma.clientInvoice.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status value
    const validStatuses: ClientInvoiceStatus[] = ['DRAFT', 'PROFORMA', 'ISSUED', 'SENT', 'PAID', 'OVERDUE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      )
    }

    // Check if transition is allowed
    const currentStatus = existing.status as ClientInvoiceStatus
    const allowedTransitions = VALID_TRANSITIONS[currentStatus]

    if (!allowedTransitions.includes(status)) {
      // Special message for DRAFT -> ISSUED
      if (currentStatus === 'DRAFT' && status === 'ISSUED') {
        return NextResponse.json(
          { error: 'Para emitir una factura, use el endpoint /issue' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: `No se puede cambiar de ${currentStatus} a ${status}` },
        { status: 400 }
      )
    }

    const invoice = await prisma.clientInvoice.update({
      where: { id },
      data: { status },
      include: {
        owner: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true
          }
        }
      }
    })

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        fullNumber: invoice.fullNumber,
        status: invoice.status,
        owner: invoice.owner
      }
    })
  } catch (error) {
    console.error('Error updating invoice status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
