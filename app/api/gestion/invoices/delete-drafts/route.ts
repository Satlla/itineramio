import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/gestion/invoices/delete-drafts
 * Delete all draft invoices for a property
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Se requiere propertyId' },
        { status: 400 }
      )
    }

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    // Find all draft invoices for this property
    const draftInvoices = await prisma.clientInvoice.findMany({
      where: {
        propertyId,
        userId,
        status: 'DRAFT'
      },
      select: { id: true }
    })

    if (draftInvoices.length === 0) {
      return NextResponse.json({
        deleted: 0,
        message: 'No hay borradores de factura'
      })
    }

    const invoiceIds = draftInvoices.map(i => i.id)

    // Delete invoice items first
    await prisma.clientInvoiceItem.deleteMany({
      where: { invoiceId: { in: invoiceIds } }
    })

    // Delete the draft invoices
    const result = await prisma.clientInvoice.deleteMany({
      where: { id: { in: invoiceIds } }
    })

    return NextResponse.json({
      deleted: result.count,
      message: `${result.count} borradores eliminados`
    })
  } catch (error) {
    console.error('Error deleting draft invoices:', error)
    return NextResponse.json(
      { error: 'Error al eliminar borradores' },
      { status: 500 }
    )
  }
}
