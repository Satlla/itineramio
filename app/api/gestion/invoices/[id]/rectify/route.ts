import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getOrCreateDefaultSeries, getNextInvoiceNumber } from '@/lib/invoice-numbering'
import { RectifyingType } from '@prisma/client'

/**
 * POST /api/gestion/invoices/[id]/rectify
 * Create a rectifying invoice for an issued invoice
 */
export async function POST(
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

    const body = await request.json()
    const {
      rectifyingType,
      reason,
      items,
      issueImmediately = false
    } = body

    // Validate required fields
    if (!rectifyingType || !['SUBSTITUTION', 'DIFFERENCE'].includes(rectifyingType)) {
      return NextResponse.json(
        { error: 'Tipo de rectificativa requerido (SUBSTITUTION o DIFFERENCE)' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Motivo de rectificación requerido' },
        { status: 400 }
      )
    }

    // Get original invoice
    const original = await prisma.clientInvoice.findFirst({
      where: {
        id,
        userId
      },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!original) {
      return NextResponse.json(
        { error: 'Factura original no encontrada' },
        { status: 404 }
      )
    }

    // Validate original is issued (not draft)
    if (original.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'No se puede rectificar una factura en borrador. Edítela directamente.' },
        { status: 400 }
      )
    }

    // Get or create rectifying series
    let rectifyingSeriesId: string
    try {
      rectifyingSeriesId = await getOrCreateDefaultSeries(userId, 'RECTIFYING')
    } catch (err) {
      return NextResponse.json(
        { error: 'Error obteniendo serie de rectificativas' },
        { status: 500 }
      )
    }

    // Prepare items based on type
    let rectifyingItems: any[]
    let subtotal = 0
    let totalVat = 0

    if (rectifyingType === 'SUBSTITUTION') {
      // For substitution: new items must be provided
      if (!items || items.length === 0) {
        return NextResponse.json(
          { error: 'Debe proporcionar las nuevas líneas para la factura rectificativa por sustitución' },
          { status: 400 }
        )
      }

      rectifyingItems = items.map((item: any, index: number) => {
        const quantity = Number(item.quantity) || 1
        const unitPrice = Number(item.unitPrice) || 0
        const vatRate = Number(item.vatRate) || 21
        const lineTotal = quantity * unitPrice
        const lineVat = lineTotal * (vatRate / 100)

        subtotal += lineTotal
        totalVat += lineVat

        return {
          concept: item.concept,
          quantity,
          unitPrice,
          vatRate,
          total: lineTotal + lineVat,
          order: index
        }
      })
    } else {
      // For difference: calculate difference from original
      if (!items || items.length === 0) {
        return NextResponse.json(
          { error: 'Debe proporcionar las líneas de diferencia' },
          { status: 400 }
        )
      }

      rectifyingItems = items.map((item: any, index: number) => {
        const quantity = Number(item.quantity) || 1
        const unitPrice = Number(item.unitPrice) || 0 // Can be negative for reductions
        const vatRate = Number(item.vatRate) || 21
        const lineTotal = quantity * unitPrice
        const lineVat = lineTotal * (vatRate / 100)

        subtotal += lineTotal
        totalVat += lineVat

        return {
          concept: item.concept,
          quantity,
          unitPrice,
          vatRate,
          total: lineTotal + lineVat,
          order: index
        }
      })
    }

    const total = subtotal + totalVat

    // Create the rectifying invoice (number assigned on emission)
    const rectifyingInvoice = await prisma.$transaction(async (tx) => {
      // Create rectifying invoice as draft (no number yet)
      const invoice = await tx.clientInvoice.create({
        data: {
          userId,
          ownerId: original.ownerId,
          seriesId: rectifyingSeriesId,
          // number and fullNumber assigned when issued
          issueDate: new Date(),
          dueDate: original.dueDate,
          subtotal,
          totalVat,
          total,
          status: 'DRAFT',
          isLocked: false,
          isRectifying: true,
          rectifyingType: rectifyingType as RectifyingType,
          rectifiesId: original.id,
          rectifyingReason: reason,
          originalTotal: original.total,
          paymentMethodUsed: original.paymentMethodUsed,
          notes: `Factura rectificativa de ${original.fullNumber}. Motivo: ${reason}`,
          items: {
            create: rectifyingItems
          }
        },
        include: {
          owner: {
            select: {
              id: true,
              type: true,
              firstName: true,
              lastName: true,
              companyName: true
            }
          },
          series: {
            select: {
              id: true,
              name: true,
              prefix: true
            }
          },
          items: {
            orderBy: { order: 'asc' }
          },
          rectifies: {
            select: {
              id: true,
              fullNumber: true
            }
          }
        }
      })

      // If issueImmediately, assign number and issue
      if (issueImmediately) {
        const numberResult = await getNextInvoiceNumber(rectifyingSeriesId)
        return tx.clientInvoice.update({
          where: { id: invoice.id },
          data: {
            number: numberResult.number,
            fullNumber: numberResult.fullNumber,
            status: 'ISSUED',
            isLocked: true,
            issuedAt: new Date()
          },
          include: {
            owner: {
              select: {
                id: true,
                type: true,
                firstName: true,
                lastName: true,
                companyName: true
              }
            },
            series: {
              select: {
                id: true,
                name: true,
                prefix: true
              }
            },
            items: {
              orderBy: { order: 'asc' }
            },
            rectifies: {
              select: {
                id: true,
                fullNumber: true
              }
            }
          }
        })
      }

      return invoice
    })

    return NextResponse.json({
      success: true,
      invoice: {
        id: rectifyingInvoice.id,
        number: rectifyingInvoice.number,
        fullNumber: rectifyingInvoice.fullNumber,
        issueDate: rectifyingInvoice.issueDate.toISOString(),
        issuedAt: rectifyingInvoice.issuedAt?.toISOString(),
        dueDate: rectifyingInvoice.dueDate?.toISOString(),
        subtotal: Number(rectifyingInvoice.subtotal),
        totalVat: Number(rectifyingInvoice.totalVat),
        total: Number(rectifyingInvoice.total),
        status: rectifyingInvoice.status,
        isLocked: rectifyingInvoice.isLocked,
        isRectifying: rectifyingInvoice.isRectifying,
        rectifyingType: rectifyingInvoice.rectifyingType,
        rectifyingReason: rectifyingInvoice.rectifyingReason,
        originalTotal: Number(rectifyingInvoice.originalTotal),
        owner: rectifyingInvoice.owner,
        series: rectifyingInvoice.series,
        rectifies: rectifyingInvoice.rectifies,
        items: rectifyingInvoice.items.map(i => ({
          id: i.id,
          concept: i.concept,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          vatRate: Number(i.vatRate),
          total: Number(i.total)
        }))
      }
    })
  } catch (error) {
    console.error('Error creating rectifying invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
