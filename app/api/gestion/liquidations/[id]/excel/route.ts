import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import * as XLSX from 'xlsx'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

function fmt(n: number): number {
  return Math.round(n * 100) / 100
}

function fmtShortDate(d: Date): string {
  const day = d.getUTCDate()
  const month = MONTHS_SHORT[d.getUTCMonth()]
  return `${day} ${month}`
}

// ── Style helpers ────────────────────────────────────────────────────────────

const COLORS = {
  navyBg:     '1F3A5F',
  headerBg:   '2E5EA8',
  subheadBg:  '4472C4',
  altRowBg:   'EBF0FA',
  subtotalBg: 'D9E1F2',
  totalBg:    '2E5EA8',
  grandBg:    '1F3A5F',
  accentBg:   'C6EFCE',
  white:      'FFFFFFFF',
  dark:       'FF1F3A5F',
  black:      'FF000000',
  labelBg:    'F2F2F2',
}

function border(style: 'thin' | 'medium' = 'thin') {
  const b = { style, color: { rgb: 'FF000000' } }
  return { top: b, bottom: b, left: b, right: b }
}

function cellStyle(opts: {
  bold?: boolean
  italic?: boolean
  sz?: number
  color?: string
  bgColor?: string
  halign?: 'left' | 'center' | 'right'
  valign?: 'top' | 'center' | 'bottom'
  numFmt?: string
  borderStyle?: 'thin' | 'medium' | 'none'
  wrap?: boolean
}) {
  const s: any = {}

  if (opts.bgColor) {
    s.fill = { fgColor: { rgb: opts.bgColor }, patternType: 'solid' }
  }

  s.font = {
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    sz: opts.sz ?? 10,
    color: { rgb: opts.color ?? 'FF000000' },
    name: 'Calibri',
  }

  s.alignment = {
    horizontal: opts.halign ?? 'left',
    vertical: opts.valign ?? 'center',
    wrapText: opts.wrap ?? false,
  }

  if (opts.borderStyle && opts.borderStyle !== 'none') {
    s.border = border(opts.borderStyle)
  }

  if (opts.numFmt) {
    s.numFmt = opts.numFmt
  }

  return s
}

function applyStyle(ws: XLSX.WorkSheet, addr: string, style: any) {
  if (!ws[addr]) return
  ws[addr].s = style
}

function applyRowStyle(ws: XLSX.WorkSheet, row: number, cols: number, style: any, startCol = 0) {
  for (let c = startCol; c < startCol + cols; c++) {
    const addr = XLSX.utils.encode_cell({ r: row, c })
    if (!ws[addr]) ws[addr] = { t: 'z', v: null }
    ws[addr].s = style
  }
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

    // Resolve incomeReceiver
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

    // Parse notes metadata
    let metadata: any = {}
    try {
      if (liquidation.notes) metadata = JSON.parse(liquidation.notes)
    } catch { /* ignore */ }

    // Get commission rate for OWNER model
    let commissionRate: number | undefined
    if (incomeReceiver === 'OWNER') {
      if (metadata.billingUnitGroupId) {
        const grp = await prisma.billingUnitGroup.findUnique({
          where: { id: metadata.billingUnitGroupId },
          select: { commissionValue: true, commissionType: true }
        })
        if (grp?.commissionType === 'PERCENTAGE') commissionRate = Number(grp.commissionValue)
      } else {
        const firstRes = liquidation.reservations[0]
        if (firstRes?.billingUnit) {
          const unit = await prisma.billingUnit.findUnique({
            where: { id: firstRes.billingUnit.id },
            select: { commissionValue: true, commissionType: true }
          })
          if (unit?.commissionType === 'PERCENTAGE') commissionRate = Number(unit.commissionValue)
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

    // Get group name if applicable
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
    const totalWithoutCleaningAll = totalIncomeAll - totalCleaningAll
    const avgPricePerNight = totalNightsAll > 0 ? totalWithoutCleaningAll / totalNightsAll : 0
    const occupancyAll = daysInMonth > 0 ? Math.min(Math.round((totalNightsAll / daysInMonth) * 1000) / 10, 100) : 0

    const NUM_COLS_OWNER = 9   // A–I
    const NUM_COLS_MGR   = 7   // A–G

    // ========================================================================
    // BUILD WORKSHEET DATA
    // ========================================================================
    const wsData: (string | number | null)[][] = []
    const merges: XLSX.Range[] = []

    // Track row indices for styling
    const styleMap: Record<number, string> = {} // rowIdx → style key

    if (isOwnerModel) {
      // ── OWNER MODEL ─────────────────────────────────────────────────────
      const displayName = groupName || ownerName || 'Propiedad'
      const title = `${displayName} — ${periodLabel}`

      // Row 0: Title
      wsData.push([title, null, null, null, null, null, null, null, null])
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } })
      styleMap[0] = 'title'

      // Row 1: empty
      wsData.push([null, null, null, null, null, null, null, null, null])
      styleMap[1] = 'empty'

      // Row 2: Headers
      wsData.push(['Reserva', 'Fecha', 'Plataforma', 'Duración', 'Limpieza', 'Total', 'Total Sin Limpieza', 'Comisión', '€/Noche'])
      styleMap[2] = 'header'

      // Reservation rows
      const ownerEntries = Array.from(reservationsByProperty.entries())
      let dataRowCount = 0
      for (const [property, reservations] of ownerEntries) {
        const multiProperty = reservationsByProperty.size > 1

        if (multiProperty) {
          const propIdx = wsData.length
          wsData.push([property, null, null, null, null, null, null, null, null])
          merges.push({ s: { r: propIdx, c: 0 }, e: { r: propIdx, c: 8 } })
          styleMap[propIdx] = 'subhead'
        }

        for (const res of reservations) {
          const hostEarnings = Number(res.hostEarnings)
          const cleaning = Number(res.cleaningAmount || res.cleaningFee || 0)
          const withoutCleaning = hostEarnings - cleaning
          const commission = commissionRate ? withoutCleaning * (commissionRate / 100) : 0
          const pricePerNight = res.nights > 0 ? withoutCleaning / res.nights : 0

          const rowIdx = wsData.length
          wsData.push([
            res.guestName,
            `${fmtShortDate(new Date(res.checkIn))} - ${fmtShortDate(new Date(res.checkOut))}`,
            res.platform,
            res.nights,
            fmt(cleaning),
            fmt(hostEarnings),
            fmt(withoutCleaning),
            fmt(commission),
            fmt(pricePerNight)
          ])
          styleMap[rowIdx] = dataRowCount % 2 === 0 ? 'dataEven' : 'dataOdd'
          dataRowCount++
        }

        // Subtotal per property (multi-property)
        if (multiProperty) {
          const propNights = reservations.reduce((sum, r) => sum + r.nights, 0)
          const propIncome = reservations.reduce((sum, r) => sum + Number(r.hostEarnings), 0)
          const propCleaning = reservations.reduce((sum, r) => sum + Number(r.cleaningAmount || r.cleaningFee || 0), 0)
          const propWithout = propIncome - propCleaning
          const propCommission = commissionRate ? propWithout * (commissionRate / 100) : 0
          const propAvgPerNight = propNights > 0 ? propWithout / propNights : 0
          const stIdx = wsData.length
          wsData.push(['Subtotal', null, null, propNights, fmt(propCleaning), fmt(propIncome), fmt(propWithout), fmt(propCommission), fmt(propAvgPerNight)])
          styleMap[stIdx] = 'subtotal'
        }
      }

      // Grand total row (multi-property)
      if (reservationsByProperty.size > 1) {
        const totalWithout = totalIncomeAll - totalCleaningAll
        const totalCommission = commissionRate ? totalWithout * (commissionRate / 100) : Number(liquidation.totalCommission)
        const totalAvg = totalNightsAll > 0 ? totalWithout / totalNightsAll : 0
        const stIdx = wsData.length
        wsData.push(['TOTAL', null, null, totalNightsAll, fmt(totalCleaningAll), fmt(totalIncomeAll), fmt(totalWithout), fmt(totalCommission), fmt(totalAvg)])
        styleMap[stIdx] = 'total'
      }

      // Expenses section
      if (liquidation.expenses.length > 0) {
        const emptyIdx = wsData.length
        wsData.push([null, null, null, null, null, null, null, null, null])
        styleMap[emptyIdx] = 'empty'

        const expTitleIdx = wsData.length
        wsData.push(['GASTOS REPERCUTIDOS', null, null, null, null, null, null, null, null])
        merges.push({ s: { r: expTitleIdx, c: 0 }, e: { r: expTitleIdx, c: 8 } })
        styleMap[expTitleIdx] = 'expTitle'

        const expHeaderIdx = wsData.length
        wsData.push(['Apartamento', 'Fecha', 'Concepto', 'Categoría', 'Base', 'IVA', 'Total', null, null])
        styleMap[expHeaderIdx] = 'header'

        let expRowCount = 0
        for (const exp of liquidation.expenses) {
          const propName = exp.billingUnit?.name || exp.billingConfig?.property?.name || 'N/A'
          const rowIdx = wsData.length
          wsData.push([
            propName,
            fmtShortDate(new Date(exp.date)),
            exp.concept,
            exp.category,
            fmt(Number(exp.amount)),
            fmt(Number(exp.vatAmount)),
            fmt(Number(exp.amount) + Number(exp.vatAmount)),
            null, null
          ])
          styleMap[rowIdx] = expRowCount % 2 === 0 ? 'dataEven' : 'dataOdd'
          expRowCount++
        }
      }

      // ── Summary section ──────────────────────────────────────────────────
      const emptyIdx1 = wsData.length
      wsData.push([null, null, null, null, null, null, null, null, null])
      styleMap[emptyIdx1] = 'empty'
      const emptyIdx2 = wsData.length
      wsData.push([null, null, null, null, null, null, null, null, null])
      styleMap[emptyIdx2] = 'empty'

      // Summary rows: label in col G (7), value in col H (8)
      const summaryRows: { label: string; value: string | number; style: string }[] = []

      if (commissionRate !== undefined) {
        summaryRows.push({ label: '% Comisión', value: `${commissionRate}%`, style: 'summaryRow' })
      }
      summaryRows.push({ label: 'Noches Reservadas', value: totalNightsAll, style: 'summaryRow' })
      summaryRows.push({ label: '% Ocupación', value: `${occupancyAll}%`, style: 'summaryRow' })
      summaryRows.push({ label: 'P/M Noche', value: fmt(avgPricePerNight), style: 'summaryRow' })
      summaryRows.push({ label: 'Total Gestión', value: fmt(Number(liquidation.totalCommission)), style: 'summaryRow' })
      if (Number(liquidation.totalCleaning) > 0) {
        summaryRows.push({ label: 'Total Limpieza', value: fmt(Number(liquidation.totalCleaning)), style: 'summaryRow' })
      }
      if (Number(liquidation.totalExpenses) > 0) {
        summaryRows.push({ label: 'Gastos', value: fmt(Number(liquidation.totalExpenses)), style: 'summaryRow' })
      }

      const totalToPay = Number(liquidation.totalCommission) + Number(liquidation.totalCleaning) + Number(liquidation.totalExpenses)
      summaryRows.push({ label: 'Total a Pagar', value: fmt(totalToPay), style: 'summaryTotal' })
      summaryRows.push({ label: 'TOTAL FACTURACIÓN', value: fmt(totalIncomeAll), style: 'summaryGrand' })

      for (const sr of summaryRows) {
        const rowIdx = wsData.length
        wsData.push([null, null, null, null, null, null, null, sr.label, sr.value])
        styleMap[rowIdx] = sr.style
      }

    } else {
      // ── MANAGER MODEL ────────────────────────────────────────────────────
      const title = groupName
        ? `LIQUIDACIÓN ${groupName.toUpperCase()} — ${periodLabel.toUpperCase()}`
        : `LIQUIDACIÓN ${periodLabel.toUpperCase()}`

      wsData.push([title, null, null, null, null, null, null])
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } })
      styleMap[0] = 'title'

      wsData.push([`Propietario: ${ownerName}`, null, null, null, null, null, null])
      merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 6 } })
      styleMap[1] = 'subtitle'

      wsData.push([])
      styleMap[2] = 'empty'

      const headerIdx = wsData.length
      wsData.push(['Huésped', 'Fecha', 'Plataforma', 'Noches', 'Importe', 'Limpieza', '€/Noche'])
      styleMap[headerIdx] = 'header'

      const mgrEntries = Array.from(reservationsByProperty.entries())
      let dataRowCount = 0
      for (const [property, reservations] of mgrEntries) {
        const multiProperty = reservationsByProperty.size > 1

        if (multiProperty) {
          const propIdx = wsData.length
          wsData.push([property, null, null, null, null, null, null])
          merges.push({ s: { r: propIdx, c: 0 }, e: { r: propIdx, c: 6 } })
          styleMap[propIdx] = 'subhead'
        }

        for (const res of reservations) {
          const hostEarnings = Number(res.hostEarnings)
          const cleaning = Number(res.cleaningAmount || res.cleaningFee || 0)
          const netPrice = hostEarnings - cleaning
          const pricePerNight = res.nights > 0 ? netPrice / res.nights : 0

          const rowIdx = wsData.length
          wsData.push([
            res.guestName,
            `${fmtShortDate(new Date(res.checkIn))} - ${fmtShortDate(new Date(res.checkOut))}`,
            res.platform,
            res.nights,
            fmt(hostEarnings),
            fmt(cleaning),
            fmt(pricePerNight)
          ])
          styleMap[rowIdx] = dataRowCount % 2 === 0 ? 'dataEven' : 'dataOdd'
          dataRowCount++
        }

        if (multiProperty) {
          const propNights = reservations.reduce((sum, r) => sum + r.nights, 0)
          const propIncome = reservations.reduce((sum, r) => sum + Number(r.hostEarnings), 0)
          const propCleaning = reservations.reduce((sum, r) => sum + Number(r.cleaningAmount || r.cleaningFee || 0), 0)
          const propAvg = propNights > 0 ? (propIncome - propCleaning) / propNights : 0
          const stIdx = wsData.length
          wsData.push(['Subtotal', null, null, propNights, fmt(propIncome), fmt(propCleaning), fmt(propAvg)])
          styleMap[stIdx] = 'subtotal'
        }
      }

      if (liquidation.expenses.length > 0) {
        const emptyIdx = wsData.length
        wsData.push([])
        styleMap[emptyIdx] = 'empty'

        const expTitleIdx = wsData.length
        wsData.push(['GASTOS REPERCUTIDOS', null, null, null, null, null, null])
        merges.push({ s: { r: expTitleIdx, c: 0 }, e: { r: expTitleIdx, c: 6 } })
        styleMap[expTitleIdx] = 'expTitle'

        const expHeaderIdx = wsData.length
        wsData.push(['Apartamento', 'Fecha', 'Concepto', 'Categoría', 'Base', 'IVA', 'Total'])
        styleMap[expHeaderIdx] = 'header'

        let expRowCount = 0
        for (const exp of liquidation.expenses) {
          const propName = exp.billingUnit?.name || exp.billingConfig?.property?.name || 'N/A'
          const rowIdx = wsData.length
          wsData.push([
            propName,
            fmtShortDate(new Date(exp.date)),
            exp.concept,
            exp.category,
            fmt(Number(exp.amount)),
            fmt(Number(exp.vatAmount)),
            fmt(Number(exp.amount) + Number(exp.vatAmount))
          ])
          styleMap[rowIdx] = expRowCount % 2 === 0 ? 'dataEven' : 'dataOdd'
          expRowCount++
        }
      }

      const emptyIdx1 = wsData.length
      wsData.push([])
      styleMap[emptyIdx1] = 'empty'
      const emptyIdx2 = wsData.length
      wsData.push([])
      styleMap[emptyIdx2] = 'empty'

      const mgrSummaryRows: { label: string; value: string | number; style: string }[] = [
        { label: 'Noches Reservadas', value: totalNightsAll, style: 'summaryRow' },
        { label: '% Ocupación', value: `${occupancyAll}%`, style: 'summaryRow' },
        { label: 'P/M Noche', value: fmt(avgPricePerNight), style: 'summaryRow' },
        { label: 'Total Ingresos', value: fmt(totalIncomeAll), style: 'summaryRow' },
        { label: 'Comisión gestión', value: fmt(Number(liquidation.totalCommission)), style: 'summaryRow' },
      ]
      if (Number(liquidation.totalCleaning) > 0) {
        mgrSummaryRows.push({ label: 'Limpiezas', value: fmt(Number(liquidation.totalCleaning)), style: 'summaryRow' })
      }
      if (Number(liquidation.totalExpenses) > 0) {
        mgrSummaryRows.push({ label: 'Gastos', value: fmt(Number(liquidation.totalExpenses)), style: 'summaryRow' })
      }
      mgrSummaryRows.push({ label: 'NETO A TRANSFERIR', value: fmt(Number(liquidation.totalAmount)), style: 'summaryGrand' })

      for (const sr of mgrSummaryRows) {
        const rowIdx = wsData.length
        wsData.push([null, null, null, null, null, sr.label, sr.value])
        styleMap[rowIdx] = sr.style
      }
    }

    // ========================================================================
    // CREATE WORKBOOK & APPLY STYLES
    // ========================================================================
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    ws['!merges'] = merges

    const numCols = isOwnerModel ? NUM_COLS_OWNER : NUM_COLS_MGR
    const lastColIdx = numCols - 1

    // Define reusable style objects
    const S = {
      title: cellStyle({ bold: true, sz: 16, color: 'FFFFFFFF', bgColor: COLORS.navyBg, halign: 'center', valign: 'center', borderStyle: 'medium' }),
      subtitle: cellStyle({ bold: false, sz: 11, color: 'FF1F3A5F', bgColor: 'FFDCE4F0', halign: 'left', valign: 'center' }),
      header: cellStyle({ bold: true, sz: 10, color: 'FFFFFFFF', bgColor: COLORS.headerBg, halign: 'center', valign: 'center', borderStyle: 'thin' }),
      subhead: cellStyle({ bold: true, sz: 10, color: 'FF1F3A5F', bgColor: 'FFD9E1F2', halign: 'left', borderStyle: 'thin' }),
      dataEven: cellStyle({ sz: 10, bgColor: 'FFFFFFFF', borderStyle: 'thin' }),
      dataOdd: cellStyle({ sz: 10, bgColor: COLORS.altRowBg, borderStyle: 'thin' }),
      dataEvenRight: cellStyle({ sz: 10, bgColor: 'FFFFFFFF', halign: 'right', borderStyle: 'thin' }),
      dataOddRight: cellStyle({ sz: 10, bgColor: COLORS.altRowBg, halign: 'right', borderStyle: 'thin' }),
      subtotal: cellStyle({ bold: true, sz: 10, bgColor: COLORS.subtotalBg, halign: 'right', borderStyle: 'thin' }),
      subtotalLeft: cellStyle({ bold: true, sz: 10, bgColor: COLORS.subtotalBg, halign: 'left', borderStyle: 'thin' }),
      total: cellStyle({ bold: true, sz: 10, color: 'FFFFFFFF', bgColor: COLORS.totalBg, halign: 'right', borderStyle: 'medium' }),
      totalLeft: cellStyle({ bold: true, sz: 10, color: 'FFFFFFFF', bgColor: COLORS.totalBg, halign: 'left', borderStyle: 'medium' }),
      expTitle: cellStyle({ bold: true, sz: 11, color: 'FFFFFFFF', bgColor: '7F7F7F', halign: 'left', borderStyle: 'thin' }),
      summaryRow: cellStyle({ sz: 10, bgColor: COLORS.labelBg, borderStyle: 'thin' }),
      summaryRowRight: cellStyle({ bold: true, sz: 10, bgColor: COLORS.labelBg, halign: 'right', borderStyle: 'thin' }),
      summaryLabel: cellStyle({ sz: 10, bgColor: COLORS.labelBg, halign: 'right', borderStyle: 'thin' }),
      summaryTotal: cellStyle({ bold: true, sz: 11, bgColor: COLORS.subtotalBg, borderStyle: 'medium' }),
      summaryTotalRight: cellStyle({ bold: true, sz: 11, bgColor: COLORS.subtotalBg, halign: 'right', borderStyle: 'medium' }),
      summaryGrand: cellStyle({ bold: true, sz: 12, color: 'FFFFFFFF', bgColor: COLORS.navyBg, borderStyle: 'medium' }),
      summaryGrandRight: cellStyle({ bold: true, sz: 12, color: 'FFFFFFFF', bgColor: COLORS.navyBg, halign: 'right', borderStyle: 'medium' }),
      empty: cellStyle({ bgColor: 'FFFFFFFF' }),
    }

    // Apply row styles
    for (const [rowStr, styleKey] of Object.entries(styleMap)) {
      const rowIdx = parseInt(rowStr)
      const row = wsData[rowIdx]
      if (!row) continue

      for (let c = 0; c < numCols; c++) {
        const addr = XLSX.utils.encode_cell({ r: rowIdx, c })
        if (!ws[addr]) ws[addr] = { t: 'z', v: null }

        // Determine if this is a numeric column (right-align data cols)
        const isNumericCol = c >= 3 && styleKey.startsWith('data')
        const isSubtotalLabel = c === 0 && styleKey === 'subtotal'
        const isTotalLabel = c === 0 && styleKey === 'total'
        const isSummaryLabelCol = isOwnerModel ? c === 7 : c === 5
        const isSummaryValueCol = isOwnerModel ? c === 8 : c === 6

        let s = S[styleKey as keyof typeof S] || S.dataEven

        if (styleKey === 'dataEven' || styleKey === 'dataOdd') {
          if (isNumericCol) {
            s = styleKey === 'dataEven' ? S.dataEvenRight : S.dataOddRight
          }
        } else if (styleKey === 'subtotal') {
          s = isSubtotalLabel ? S.subtotalLeft : S.subtotal
        } else if (styleKey === 'total') {
          s = isTotalLabel ? S.totalLeft : S.total
        } else if (styleKey === 'summaryRow') {
          s = isSummaryLabelCol ? S.summaryLabel : (isSummaryValueCol ? S.summaryRowRight : S.summaryRow)
        } else if (styleKey === 'summaryTotal') {
          s = isSummaryValueCol ? S.summaryTotalRight : S.summaryTotal
        } else if (styleKey === 'summaryGrand') {
          s = isSummaryValueCol ? S.summaryGrandRight : S.summaryGrand
        }

        ws[addr].s = s
      }
    }

    // Set column widths
    if (isOwnerModel) {
      ws['!cols'] = [
        { wch: 20 },  // Reserva
        { wch: 22 },  // Fecha
        { wch: 11 },  // Plataforma
        { wch: 9  },  // Duración
        { wch: 11 },  // Limpieza
        { wch: 11 },  // Total
        { wch: 18 },  // Total Sin Limpieza
        { wch: 18 },  // Comisión / Summary label
        { wch: 14 },  // €/Noche / Summary value
      ]
    } else {
      ws['!cols'] = [
        { wch: 20 },  // Huésped
        { wch: 22 },  // Fecha
        { wch: 11 },  // Plataforma
        { wch: 8  },  // Noches
        { wch: 11 },  // Importe
        { wch: 18 },  // Limpieza / Summary label
        { wch: 14 },  // €/noche / Summary value
      ]
    }

    // Row heights
    const rowHeights: XLSX.RowInfo[] = []
    for (let i = 0; i < wsData.length; i++) {
      const sk = styleMap[i]
      if (sk === 'title') rowHeights[i] = { hpt: 32 }
      else if (sk === 'header') rowHeights[i] = { hpt: 20 }
      else if (sk === 'summaryGrand') rowHeights[i] = { hpt: 22 }
      else rowHeights[i] = { hpt: 18 }
    }
    ws['!rows'] = rowHeights

    const sheetName = isOwnerModel ? 'Facturación' : 'Liquidación'
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Write with cell styles enabled
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellStyles: true })

    const safeName = (ownerName || 'propietario').replace(/\s+/g, '_')
    const filename = `liquidacion_${safeName}_${MONTHS[liquidation.month - 1]}_${liquidation.year}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
