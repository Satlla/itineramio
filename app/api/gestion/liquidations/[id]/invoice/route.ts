import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getOrCreateDefaultSeries, getNextInvoiceNumber } from '@/lib/invoice-numbering'
import { Decimal } from '@prisma/client/runtime/library'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * POST /api/gestion/liquidations/[id]/invoice
 * Genera una factura (ClientInvoice) a partir de una liquidación
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
    const { seriesId: providedSeriesId, issueDate, dueDate } = body

    // Obtener la liquidación con todos sus datos
    const liquidation = await prisma.liquidation.findFirst({
      where: { id, userId },
      include: {
        owner: {
          select: {
            id: true,
            type: true,
            retentionRate: true,
            firstName: true,
            lastName: true,
            companyName: true,
            nif: true,
            cif: true,
            email: true
          }
        },
        reservations: {
          include: {
            billingUnit: { select: { id: true, name: true } },
            billingConfig: {
              include: {
                property: { select: { id: true, name: true } }
              }
            }
          },
          orderBy: { checkIn: 'asc' }
        },
        expenses: {
          include: {
            billingUnit: { select: { id: true, name: true } },
            billingConfig: {
              include: {
                property: { select: { id: true, name: true } }
              }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    })

    if (!liquidation) {
      return NextResponse.json(
        { error: 'Liquidación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la liquidación no esté cancelada
    if (liquidation.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'No se puede crear factura de una liquidación cancelada' },
        { status: 400 }
      )
    }

    // Obtener o crear serie de facturación
    let finalSeriesId = providedSeriesId
    if (!finalSeriesId) {
      try {
        finalSeriesId = await getOrCreateDefaultSeries(userId, 'STANDARD')
      } catch (err) {
        return NextResponse.json(
          { error: 'Configure su perfil de gestor y series de facturación primero' },
          { status: 400 }
        )
      }
    }

    // Verificar que la serie pertenece al usuario
    const series = await prisma.invoiceSeries.findFirst({
      where: {
        id: finalSeriesId,
        invoiceConfig: { userId }
      }
    })

    if (!series) {
      return NextResponse.json(
        { error: 'Serie de facturación no encontrada' },
        { status: 404 }
      )
    }

    // Parse metadata from liquidation notes to get mode and group info
    let metadata: any = {}
    try {
      if (liquidation.notes) {
        metadata = JSON.parse(liquidation.notes)
      }
    } catch (e) {
      // Notes might not be JSON
    }

    // Determinar el billingUnitGroupId si aplica
    const billingUnitGroupId = metadata.billingUnitGroupId || null

    // Crear líneas de factura basadas en la liquidación
    const items: any[] = []
    let order = 0
    const periodLabel = `${MONTHS[liquidation.month - 1]} ${liquidation.year}`

    // Agrupar reservas por propiedad para el detalle
    const reservationsByProperty = new Map<string, { name: string; earnings: number; count: number }>()
    for (const res of liquidation.reservations) {
      const propName = res.billingUnit?.name || res.billingConfig?.property?.name || 'N/A'
      const existing = reservationsByProperty.get(propName)
      if (existing) {
        existing.earnings += Number(res.hostEarnings)
        existing.count++
      } else {
        reservationsByProperty.set(propName, {
          name: propName,
          earnings: Number(res.hostEarnings),
          count: 1
        })
      }
    }

    // Si es modo GROUP o hay múltiples propiedades, crear líneas por propiedad
    const useDetailedMode = reservationsByProperty.size > 1 || metadata.invoiceFormat === 'detailed'

    if (useDetailedMode && reservationsByProperty.size > 0) {
      // Líneas detalladas por propiedad
      for (const [propName, data] of reservationsByProperty) {
        items.push({
          concept: `Ingresos alquiler - ${propName}`,
          description: `${data.count} reservas - ${periodLabel}`,
          quantity: 1,
          unitPrice: data.earnings,
          vatRate: 0, // Los ingresos del propietario no llevan IVA
          retentionRate: 0,
          total: data.earnings,
          order: order++
        })
      }
    } else if (liquidation.reservations.length > 0) {
      // Línea única de ingresos
      items.push({
        concept: 'Ingresos por alquiler turístico',
        description: `${liquidation.reservations.length} reservas - ${periodLabel}`,
        quantity: 1,
        unitPrice: Number(liquidation.totalIncome),
        vatRate: 0,
        retentionRate: 0,
        total: Number(liquidation.totalIncome),
        order: order++
      })
    }

    // Línea de comisión de gestión (negativa)
    if (Number(liquidation.totalCommission) > 0) {
      // Use owner's retentionRate if set, otherwise default (15% for EMPRESA, 0% for PERSONA_FISICA)
      const retentionRate = liquidation.owner.retentionRate !== null
        ? Number(liquidation.owner.retentionRate)
        : (liquidation.owner.type === 'EMPRESA' ? 15 : 0)
      items.push({
        concept: 'Comisión de gestión',
        description: periodLabel,
        quantity: 1,
        unitPrice: -Number(liquidation.totalCommission),
        vatRate: 21, // La comisión sí lleva IVA
        retentionRate,
        total: -Number(liquidation.totalCommission) * 1.21,
        order: order++
      })
    }

    // Línea de limpiezas (si aplica)
    if (Number(liquidation.totalCleaning) > 0) {
      items.push({
        concept: 'Servicios de limpieza',
        description: periodLabel,
        quantity: 1,
        unitPrice: -Number(liquidation.totalCleaning),
        vatRate: 0,
        retentionRate: 0,
        total: -Number(liquidation.totalCleaning),
        order: order++
      })
    }

    // Líneas de gastos repercutidos (si aplica)
    if (liquidation.expenses.length > 0) {
      for (const expense of liquidation.expenses) {
        const expTotal = Number(expense.amount) + Number(expense.vatAmount || 0)
        items.push({
          concept: expense.concept,
          description: new Date(expense.date).toLocaleDateString('es-ES'),
          quantity: 1,
          unitPrice: -expTotal,
          vatRate: 0,
          retentionRate: 0,
          total: -expTotal,
          order: order++
        })
      }
    }

    // Calcular totales de la factura
    let subtotal = new Decimal(0)
    let totalVat = new Decimal(0)
    let totalRetention = new Decimal(0)

    const processedItems = items.map((item) => {
      const lineBase = new Decimal(item.quantity).times(item.unitPrice)
      const lineVat = lineBase.times(item.vatRate).dividedBy(100)
      const lineRetention = lineBase.abs().times(item.retentionRate).dividedBy(100)

      subtotal = subtotal.plus(lineBase)
      totalVat = totalVat.plus(lineVat)
      totalRetention = totalRetention.plus(lineRetention)

      return {
        ...item,
        total: Number(lineBase.plus(lineVat))
      }
    })

    const total = subtotal.plus(totalVat).minus(totalRetention)

    // Obtener siguiente número de factura
    const numberResult = await getNextInvoiceNumber(finalSeriesId)

    // Crear la factura
    const invoice = await prisma.clientInvoice.create({
      data: {
        userId,
        ownerId: liquidation.ownerId,
        seriesId: finalSeriesId,
        billingUnitGroupId,
        periodMonth: liquidation.month,
        periodYear: liquidation.year,
        number: numberResult.number,
        fullNumber: numberResult.fullNumber,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal: Number(subtotal),
        totalVat: Number(totalVat),
        retentionRate: liquidation.owner.retentionRate !== null
          ? Number(liquidation.owner.retentionRate)
          : (liquidation.owner.type === 'EMPRESA' ? 15 : 0),
        retentionAmount: Number(totalRetention),
        total: Number(total),
        status: 'DRAFT',
        isLocked: false,
        notes: `Generada desde liquidación ${MONTHS[liquidation.month - 1]} ${liquidation.year}`,
        items: {
          create: processedItems
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
        items: true
      }
    })

    // Link the invoice to the liquidation (liquidation stays in DRAFT until explicitly sent)
    // The liquidation becomes "locked" (cannot edit) based on invoiceId presence
    await prisma.liquidation.update({
      where: { id: liquidation.id },
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.fullNumber,
        invoiceDate: invoice.issueDate
      }
    })

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        number: invoice.number,
        fullNumber: invoice.fullNumber,
        issueDate: invoice.issueDate.toISOString(),
        subtotal: Number(invoice.subtotal),
        totalVat: Number(invoice.totalVat),
        retentionAmount: Number(invoice.retentionAmount),
        total: Number(invoice.total),
        status: invoice.status,
        owner: invoice.owner,
        series: invoice.series,
        itemsCount: invoice.items.length
      }
    })
  } catch (error) {
    console.error('Error creating invoice from liquidation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
