import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import * as XLSX from 'xlsx'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function fmt(n: number): number {
  return Math.round(n * 100) / 100
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * GET /api/gestion/liquidations/[id]/excel
 * Export liquidation as real .xlsx file
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

    // Resolve incomeReceiver for old liquidations
    let incomeReceiver = liquidation.incomeReceiver || 'MANAGER'
    if (!liquidation.incomeReceiver) {
      const firstRes = liquidation.reservations[0]
      if (firstRes?.billingUnit) {
        const unit = await prisma.billingUnit.findUnique({
          where: { id: firstRes.billingUnit.id },
          select: { incomeReceiver: true, groupId: true }
        })
        if (unit?.groupId) {
          const grp = await prisma.billingUnitGroup.findUnique({
            where: { id: unit.groupId },
            select: { incomeReceiver: true }
          })
          incomeReceiver = grp?.incomeReceiver || unit?.incomeReceiver || 'MANAGER'
        } else {
          incomeReceiver = unit?.incomeReceiver || 'MANAGER'
        }
      }
    }

    // Get commission rate for OWNER model
    let commissionRate: number | undefined
    let metadata: any = {}
    try {
      if (liquidation.notes) {
        metadata = JSON.parse(liquidation.notes)
      }
    } catch { /* notes might not be JSON */ }

    if (incomeReceiver === 'OWNER') {
      if (metadata.billingUnitGroupId) {
        const grp = await prisma.billingUnitGroup.findUnique({
          where: { id: metadata.billingUnitGroupId },
          select: { commissionValue: true, commissionType: true }
        })
        if (grp?.commissionType === 'PERCENTAGE') {
          commissionRate = Number(grp.commissionValue)
        }
      } else {
        const firstRes = liquidation.reservations[0]
        if (firstRes?.billingUnit) {
          const unit = await prisma.billingUnit.findUnique({
            where: { id: firstRes.billingUnit.id },
            select: { commissionValue: true, commissionType: true }
          })
          if (unit?.commissionType === 'PERCENTAGE') {
            commissionRate = Number(unit.commissionValue)
          }
        }
      }
    }

    // Group reservations by property
    const reservationsByProperty = new Map<string, typeof liquidation.reservations>()
    for (const res of liquidation.reservations) {
      const propName = res.billingUnit?.name || res.billingConfig?.property?.name || 'N/A'
      const existing = reservationsByProperty.get(propName) || []
      reservationsByProperty.set(propName, [...existing, res])
    }

    // Check if grouped view
    const groupName = metadata.billingUnitGroupId
      ? (await prisma.billingUnitGroup.findUnique({
          where: { id: metadata.billingUnitGroupId },
          select: { name: true }
        }))?.name
      : undefined

    const isOwnerModel = incomeReceiver === 'OWNER'

    // Global stats
    const totalNightsAll = liquidation.reservations.reduce((sum, r) => sum + r.nights, 0)
    const totalCleaningAll = liquidation.reservations.reduce((sum, r) => sum + Number(r.cleaningAmount || r.cleaningFee || 0), 0)
    const totalIncomeAll = Number(liquidation.totalIncome)
    const avgPricePerNight = totalNightsAll > 0 ? (totalIncomeAll - totalCleaningAll) / totalNightsAll : 0
    const occupancyAll = daysInMonth > 0 ? Math.min(Math.round((totalNightsAll / daysInMonth) * 1000) / 10, 100) : 0

    // Build worksheet data
    const wsData: (string | number | null)[][] = []
    const merges: XLSX.Range[] = []
    const boldRows: number[] = []
    const headerRows: number[] = []
    const subtotalRows: number[] = []
    const totalRows: number[] = []
    const grandTotalRows: number[] = []

    if (isOwnerModel) {
      // ==================== OWNER MODEL ====================
      const title = groupName
        ? `FACTURACIÓN ${groupName.toUpperCase()} ${periodLabel.toUpperCase()}`
        : `FACTURACIÓN ${periodLabel.toUpperCase()}`

      // Title row
      wsData.push([title, null, null, null, null, null, null, null, null])
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } })
      boldRows.push(0)

      // Empty row
      wsData.push([])

      // Headers
      const headerIdx = wsData.length
      wsData.push(['Reserva', 'Fecha', 'Plataforma', 'Duración', 'Limpieza', 'Total', 'Total Sin Limp', 'Comisión', 'Neto'])
      headerRows.push(headerIdx)

      // Reservation rows per property
      const ownerEntries = Array.from(reservationsByProperty.entries())
      for (const [property, reservations] of ownerEntries) {
        const multiProperty = reservationsByProperty.size > 1

        if (multiProperty) {
          const propIdx = wsData.length
          wsData.push([property, null, null, null, null, null, null, null, null])
          merges.push({ s: { r: propIdx, c: 0 }, e: { r: propIdx, c: 8 } })
          boldRows.push(propIdx)
        }

        for (const res of reservations) {
          const hostEarnings = Number(res.hostEarnings)
          const cleaning = Number(res.cleaningAmount || res.cleaningFee || 0)
          const withoutCleaning = hostEarnings - cleaning
          const commission = commissionRate ? withoutCleaning * (commissionRate / 100) : 0
          const netAfterCommission = withoutCleaning - commission

          wsData.push([
            res.guestName,
            `${fmtDate(new Date(res.checkIn))} - ${fmtDate(new Date(res.checkOut))}`,
            res.platform,
            res.nights,
            fmt(cleaning),
            fmt(hostEarnings),
            fmt(withoutCleaning),
            fmt(commission),
            fmt(netAfterCommission)
          ])
        }

        // Subtotal per property
        if (multiProperty) {
          const propNights = reservations.reduce((sum, r) => sum + r.nights, 0)
          const propIncome = reservations.reduce((sum, r) => sum + Number(r.hostEarnings), 0)
          const propCleaning = reservations.reduce((sum, r) => sum + Number(r.cleaningAmount || r.cleaningFee || 0), 0)
          const propWithout = propIncome - propCleaning
          const propCommission = commissionRate ? propWithout * (commissionRate / 100) : 0
          const stIdx = wsData.length
          wsData.push(['Subtotal', null, null, propNights, fmt(propCleaning), fmt(propIncome), fmt(propWithout), fmt(propCommission), fmt(propWithout - propCommission)])
          subtotalRows.push(stIdx)
        }
      }

      // Grand subtotal (if multi-property)
      if (reservationsByProperty.size > 1) {
        const totalWithout = totalIncomeAll - totalCleaningAll
        const totalCommission = commissionRate ? totalWithout * (commissionRate / 100) : Number(liquidation.totalCommission)
        const stIdx = wsData.length
        wsData.push(['TOTAL', null, null, totalNightsAll, fmt(totalCleaningAll), fmt(totalIncomeAll), fmt(totalWithout), fmt(totalCommission), fmt(totalWithout - totalCommission)])
        totalRows.push(stIdx)
      }

      // Expenses section
      if (liquidation.expenses.length > 0) {
        wsData.push([])
        const expTitleIdx = wsData.length
        wsData.push(['GASTOS REPERCUTIDOS', null, null, null, null, null, null, null, null])
        merges.push({ s: { r: expTitleIdx, c: 0 }, e: { r: expTitleIdx, c: 8 } })
        boldRows.push(expTitleIdx)

        const expHeaderIdx = wsData.length
        wsData.push(['Apartamento', 'Fecha', 'Concepto', 'Categoría', 'Base', 'IVA', 'Total', null, null])
        headerRows.push(expHeaderIdx)

        for (const exp of liquidation.expenses) {
          const propName = exp.billingUnit?.name || exp.billingConfig?.property?.name || 'N/A'
          wsData.push([
            propName,
            fmtDate(new Date(exp.date)),
            exp.concept,
            exp.category,
            fmt(Number(exp.amount)),
            fmt(Number(exp.vatAmount)),
            fmt(Number(exp.amount) + Number(exp.vatAmount)),
            null, null
          ])
        }
      }

      // Summary section
      wsData.push([])
      wsData.push([])
      const summaryStartIdx = wsData.length

      if (commissionRate) {
        wsData.push([null, null, null, null, null, null, null, '% Comisión', `${commissionRate}%`])
      }
      wsData.push([null, null, null, null, null, null, null, 'Noches Reservadas', totalNightsAll])
      wsData.push([null, null, null, null, null, null, null, '% Ocupación', `${occupancyAll}%`])
      wsData.push([null, null, null, null, null, null, null, 'P/M Noche', fmt(avgPricePerNight)])

      wsData.push([null, null, null, null, null, null, null, 'Total Gestión', fmt(Number(liquidation.totalCommission))])

      if (Number(liquidation.totalCleaning) > 0) {
        wsData.push([null, null, null, null, null, null, null, 'Total Limpieza', fmt(Number(liquidation.totalCleaning))])
      }
      if (Number(liquidation.totalExpenses) > 0) {
        wsData.push([null, null, null, null, null, null, null, 'Gastos', fmt(Number(liquidation.totalExpenses))])
      }

      const totalToPay = Number(liquidation.totalCommission) + Number(liquidation.totalCleaning) + Number(liquidation.totalExpenses)
      const toPayIdx = wsData.length
      wsData.push([null, null, null, null, null, null, null, 'Total a Pagar', fmt(totalToPay)])
      totalRows.push(toPayIdx)

      const grandIdx = wsData.length
      wsData.push([null, null, null, null, null, null, null, 'TOTAL FACTURACIÓN', fmt(totalIncomeAll)])
      grandTotalRows.push(grandIdx)

    } else {
      // ==================== MANAGER MODEL ====================
      const title = groupName
        ? `LIQUIDACIÓN ${groupName.toUpperCase()} — ${periodLabel.toUpperCase()}`
        : `LIQUIDACIÓN ${periodLabel.toUpperCase()}`

      // Title row
      wsData.push([title, null, null, null, null, null, null])
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } })
      boldRows.push(0)

      // Subtitle
      wsData.push([`Propietario: ${ownerName}`, null, null, null, null, null, null])
      merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 6 } })

      // Empty row
      wsData.push([])

      // Headers
      const headerIdx = wsData.length
      wsData.push(['Huésped', 'Fecha', 'Plataforma', 'Noches', 'Importe', 'Limpieza', '€/noche'])
      headerRows.push(headerIdx)

      // Reservation rows per property
      const mgrEntries = Array.from(reservationsByProperty.entries())
      for (const [property, reservations] of mgrEntries) {
        const multiProperty = reservationsByProperty.size > 1

        if (multiProperty) {
          const propIdx = wsData.length
          wsData.push([property, null, null, null, null, null, null])
          merges.push({ s: { r: propIdx, c: 0 }, e: { r: propIdx, c: 6 } })
          boldRows.push(propIdx)
        }

        for (const res of reservations) {
          const hostEarnings = Number(res.hostEarnings)
          const cleaning = Number(res.cleaningAmount || res.cleaningFee || 0)
          const netPrice = hostEarnings - cleaning
          const pricePerNight = res.nights > 0 ? netPrice / res.nights : 0

          wsData.push([
            res.guestName,
            `${fmtDate(new Date(res.checkIn))} - ${fmtDate(new Date(res.checkOut))}`,
            res.platform,
            res.nights,
            fmt(hostEarnings),
            fmt(cleaning),
            fmt(pricePerNight)
          ])
        }

        // Subtotal per property
        if (multiProperty) {
          const propNights = reservations.reduce((sum, r) => sum + r.nights, 0)
          const propIncome = reservations.reduce((sum, r) => sum + Number(r.hostEarnings), 0)
          const propCleaning = reservations.reduce((sum, r) => sum + Number(r.cleaningAmount || r.cleaningFee || 0), 0)
          const propAvg = propNights > 0 ? (propIncome - propCleaning) / propNights : 0
          const stIdx = wsData.length
          wsData.push(['Subtotal', null, null, propNights, fmt(propIncome), fmt(propCleaning), fmt(propAvg)])
          subtotalRows.push(stIdx)
        }
      }

      // Expenses section
      if (liquidation.expenses.length > 0) {
        wsData.push([])
        const expTitleIdx = wsData.length
        wsData.push(['GASTOS REPERCUTIDOS', null, null, null, null, null, null])
        merges.push({ s: { r: expTitleIdx, c: 0 }, e: { r: expTitleIdx, c: 6 } })
        boldRows.push(expTitleIdx)

        const expHeaderIdx = wsData.length
        wsData.push(['Apartamento', 'Fecha', 'Concepto', 'Categoría', 'Base', 'IVA', 'Total'])
        headerRows.push(expHeaderIdx)

        for (const exp of liquidation.expenses) {
          const propName = exp.billingUnit?.name || exp.billingConfig?.property?.name || 'N/A'
          wsData.push([
            propName,
            fmtDate(new Date(exp.date)),
            exp.concept,
            exp.category,
            fmt(Number(exp.amount)),
            fmt(Number(exp.vatAmount)),
            fmt(Number(exp.amount) + Number(exp.vatAmount))
          ])
        }
      }

      // Summary section
      wsData.push([])
      wsData.push([])

      wsData.push([null, null, null, null, null, 'Noches Reservadas', totalNightsAll])
      wsData.push([null, null, null, null, null, '% Ocupación', `${occupancyAll}%`])
      wsData.push([null, null, null, null, null, 'P/M Noche', fmt(avgPricePerNight)])
      wsData.push([null, null, null, null, null, 'Total Ingresos', fmt(totalIncomeAll)])
      wsData.push([null, null, null, null, null, 'Comisión gestión', fmt(Number(liquidation.totalCommission))])

      if (Number(liquidation.totalCleaning) > 0) {
        wsData.push([null, null, null, null, null, 'Limpiezas', fmt(Number(liquidation.totalCleaning))])
      }
      if (Number(liquidation.totalExpenses) > 0) {
        wsData.push([null, null, null, null, null, 'Gastos', fmt(Number(liquidation.totalExpenses))])
      }

      const netoIdx = wsData.length
      wsData.push([null, null, null, null, null, 'NETO A TRANSFERIR', fmt(Number(liquidation.totalAmount))])
      grandTotalRows.push(netoIdx)
    }

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Apply merges
    ws['!merges'] = merges

    // Set column widths
    if (isOwnerModel) {
      ws['!cols'] = [
        { wch: 22 },  // Reserva / Guest name
        { wch: 24 },  // Fecha
        { wch: 12 },  // Plataforma
        { wch: 10 },  // Duración
        { wch: 12 },  // Limpieza
        { wch: 12 },  // Total
        { wch: 14 },  // Total Sin Limp
        { wch: 16 },  // Comisión / Summary label
        { wch: 14 },  // Neto / Summary value
      ]
    } else {
      ws['!cols'] = [
        { wch: 22 },  // Huésped
        { wch: 24 },  // Fecha
        { wch: 12 },  // Plataforma
        { wch: 10 },  // Noches
        { wch: 12 },  // Importe
        { wch: 16 },  // Limpieza / Summary label
        { wch: 14 },  // €/noche / Summary value
      ]
    }

    // Apply cell styles (xlsx 0.18.5 community edition has limited styling support)
    // We use !rows for row heights
    ws['!rows'] = [{ hpt: 24 }] // Title row taller

    const sheetName = isOwnerModel ? 'Facturación' : 'Liquidación'
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const filename = `liquidacion_${ownerName?.replace(/\s+/g, '_')}_${MONTHS[liquidation.month - 1]}_${liquidation.year}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
