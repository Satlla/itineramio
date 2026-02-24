import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * GET /api/gestion/liquidations/[id]/excel
 * Export liquidation as CSV (Excel-compatible)
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

    const liquidation = await prisma.liquidation.findFirst({
      where: { id, userId },
      include: {
        owner: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
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

    const ownerName = liquidation.owner.type === 'EMPRESA'
      ? liquidation.owner.companyName
      : `${liquidation.owner.firstName} ${liquidation.owner.lastName}`

    const periodLabel = `${MONTHS[liquidation.month - 1]} ${liquidation.year}`
    const daysInMonth = new Date(liquidation.year, liquidation.month, 0).getDate()

    // Group reservations by property
    const reservationsByProperty = new Map<string, typeof liquidation.reservations>()
    for (const res of liquidation.reservations) {
      const propName = res.billingUnit?.name || res.billingConfig?.property?.name || 'N/A'
      const existing = reservationsByProperty.get(propName) || []
      reservationsByProperty.set(propName, [...existing, res])
    }

    // Build CSV content
    const lines: string[] = []

    // Header info
    lines.push(`Liquidación ${periodLabel}`)
    lines.push(`Propietario: ${ownerName}`)
    lines.push(`Días del mes: ${daysInMonth}`)
    lines.push('')

    // Reservations table
    lines.push('RESERVAS')
    lines.push('Apartamento;Plataforma;Huésped;Check-in;Check-out;Noches;Importe;Limpieza;Precio Neto;Comisión;IVA Comisión;Neto Propietario')

    for (const [property, reservations] of reservationsByProperty) {
      const totalNights = reservations.reduce((sum, r) => sum + r.nights, 0)
      const occupancy = Math.min(Math.round((totalNights / daysInMonth) * 100), 100)

      for (const res of reservations) {
        const hostEarnings = Number(res.hostEarnings)
        const cleaning = Number(res.cleaningFee || 0)
        const netPrice = hostEarnings - cleaning
        // Approximate commission (would need billing config for exact)
        const commission = Number(liquidation.totalCommission) / liquidation.reservations.length
        const commissionVat = Number(liquidation.totalCommissionVat) / liquidation.reservations.length
        const netToOwner = hostEarnings - cleaning - commission - commissionVat

        lines.push([
          property,
          res.platform,
          res.guestName,
          new Date(res.checkIn).toLocaleDateString('es-ES'),
          new Date(res.checkOut).toLocaleDateString('es-ES'),
          res.nights.toString(),
          hostEarnings.toFixed(2),
          cleaning.toFixed(2),
          netPrice.toFixed(2),
          commission.toFixed(2),
          commissionVat.toFixed(2),
          netToOwner.toFixed(2)
        ].join(';'))
      }

      // Subtotal for property
      const subtotalIncome = reservations.reduce((sum, r) => sum + Number(r.hostEarnings), 0)
      const subtotalCleaning = reservations.reduce((sum, r) => sum + Number(r.cleaningFee || 0), 0)
      lines.push(`Subtotal ${property} (${occupancy}% ocupación);;;;;${totalNights};${subtotalIncome.toFixed(2)};${subtotalCleaning.toFixed(2)};${(subtotalIncome - subtotalCleaning).toFixed(2)};;;`)
      lines.push('')
    }

    // Expenses
    if (liquidation.expenses.length > 0) {
      lines.push('')
      lines.push('GASTOS')
      lines.push('Apartamento;Fecha;Concepto;Categoría;Base;IVA;Total')

      for (const exp of liquidation.expenses) {
        const propName = exp.billingUnit?.name || exp.billingConfig?.property?.name || 'N/A'
        lines.push([
          propName,
          new Date(exp.date).toLocaleDateString('es-ES'),
          exp.concept,
          exp.category,
          Number(exp.amount).toFixed(2),
          Number(exp.vatAmount).toFixed(2),
          (Number(exp.amount) + Number(exp.vatAmount)).toFixed(2)
        ].join(';'))
      }
    }

    // Summary
    lines.push('')
    lines.push('RESUMEN')
    lines.push(`Total Ingresos;${Number(liquidation.totalIncome).toFixed(2)}`)
    lines.push(`Total Limpieza;-${Number(liquidation.totalCleaning).toFixed(2)}`)
    lines.push(`Total Comisión;-${Number(liquidation.totalCommission).toFixed(2)}`)
    lines.push(`IVA Comisión;-${Number(liquidation.totalCommissionVat).toFixed(2)}`)
    lines.push(`Total Gastos;-${Number(liquidation.totalExpenses).toFixed(2)}`)
    if (Number(liquidation.totalRetention) > 0) {
      lines.push(`Retención IRPF;${Number(liquidation.totalRetention).toFixed(2)}`)
    }
    lines.push(`NETO A TRANSFERIR;${Number(liquidation.totalAmount).toFixed(2)}`)

    const csv = lines.join('\n')
    const filename = `liquidacion_${ownerName?.replace(/\s+/g, '_')}_${MONTHS[liquidation.month - 1]}_${liquidation.year}.csv`

    // Add BOM for Excel to recognize UTF-8
    const bom = '\uFEFF'

    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    })
  } catch (error) {
    console.error('Error exporting liquidation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
