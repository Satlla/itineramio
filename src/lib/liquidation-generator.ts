/**
 * Liquidation PDF Generator
 * Genera HTML profesional para liquidaciones mensuales a propietarios
 * Soporta vista agrupada por apartamento para conjuntos (BillingUnitGroups)
 */

interface ReservationItem {
  confirmationCode: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  platform: string
  hostEarnings: number
  cleaningAmount: number
  property: string
}

interface ExpenseItem {
  date: string
  concept: string
  category: string
  amount: number
  vatAmount: number
  property: string
}

interface PropertyBreakdown {
  property: string
  reservations: ReservationItem[]
  expenses: ExpenseItem[]
  subtotalIncome: number
  subtotalExpenses: number
}

interface LiquidationData {
  id: string
  year: number
  month: number
  status: string
  createdAt: string
  owner: {
    name: string
    nif: string
    email?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
    iban?: string
  }
  manager: {
    businessName: string
    nif: string
    address: string
    city: string
    postalCode: string
    country: string
    email?: string
    phone?: string
    logoUrl?: string
    iban?: string
    bic?: string
    bankName?: string
  }
  totals: {
    totalIncome: number
    totalCommission: number
    totalCommissionVat: number
    totalCleaning: number
    totalExpenses: number
    totalAmount: number
  }
  reservations: ReservationItem[]
  expenses: ExpenseItem[]
  notes?: string
  groupName?: string
  isGrouped?: boolean
  incomeReceiver?: string
  commissionRate?: number
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const EXPENSE_CATEGORIES: Record<string, string> = {
  MAINTENANCE: 'Mantenimiento',
  SUPPLIES: 'Suministros',
  REPAIR: 'Reparaciones',
  CLEANING: 'Limpieza',
  FURNITURE: 'Mobiliario',
  TAXES: 'Impuestos',
  INSURANCE: 'Seguros',
  OTHER: 'Otros',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatIBAN(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim()
}

function groupByProperty(data: LiquidationData): PropertyBreakdown[] {
  const map = new Map<string, PropertyBreakdown>()
  for (const res of data.reservations) {
    const ex = map.get(res.property)
    if (ex) { ex.reservations.push(res); ex.subtotalIncome += res.hostEarnings }
    else map.set(res.property, { property: res.property, reservations: [res], expenses: [], subtotalIncome: res.hostEarnings, subtotalExpenses: 0 })
  }
  for (const exp of data.expenses) {
    const ex = map.get(exp.property)
    if (ex) { ex.expenses.push(exp); ex.subtotalExpenses += exp.amount + exp.vatAmount }
    else map.set(exp.property, { property: exp.property, reservations: [], expenses: [exp], subtotalIncome: 0, subtotalExpenses: exp.amount + exp.vatAmount })
  }
  return Array.from(map.values())
}

// ─── Shared design constants ─────────────────────────────────────
const ACCENT = '#1e3a5f'

function getCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica Neue, Arial, sans-serif;
      color: #1f2937;
      line-height: 1.5;
      font-size: 11px;
      background: #fff;
    }
    .page { max-width: 940px; margin: 0 auto; padding: 32px 36px; }

    /* ── HEADER ─────────────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 18px;
      border-bottom: 3px solid ${ACCENT};
      margin-bottom: 20px;
    }
    .logo { max-height: 54px; max-width: 180px; object-fit: contain; display: block; margin-bottom: 6px; }
    .manager-name { font-size: 17px; font-weight: 800; color: ${ACCENT}; margin-bottom: 3px; }
    .manager-detail { font-size: 9.5px; color: #6b7280; margin-bottom: 1px; }
    .header-right { text-align: right; }
    .doc-type { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #9ca3af; margin-bottom: 4px; }
    .doc-period { font-size: 24px; font-weight: 800; color: ${ACCENT}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .doc-group { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 3px; }
    .doc-meta { font-size: 9.5px; color: #9ca3af; }

    /* ── PARTIES GRID ───────────────────────────────── */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 22px;
    }
    .party-card {
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3px solid ${ACCENT};
      border-radius: 4px;
    }
    .party-card .p-label {
      font-size: 8.5px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: ${ACCENT}; margin-bottom: 5px;
    }
    .party-card .p-name { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 3px; }
    .party-card .p-detail { font-size: 9.5px; color: #6b7280; margin-bottom: 1px; }
    .party-card .p-iban { font-size: 9.5px; color: #374151; margin-top: 5px; font-family: monospace; }

    /* ── STATS ROW ──────────────────────────────────── */
    .stats-row {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .stat-card {
      flex: 1;
      padding: 10px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      text-align: center;
    }
    .stat-label { font-size: 8.5px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .stat-value { font-size: 15px; font-weight: 700; color: ${ACCENT}; }
    .stat-unit { font-size: 9px; color: #6b7280; margin-top: 1px; }

    /* ── SECTION TITLE ──────────────────────────────── */
    .section-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: ${ACCENT}; margin-bottom: 6px; margin-top: 20px;
    }

    /* ── TABLES ─────────────────────────────────────── */
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 4px; }
    thead th {
      background: ${ACCENT};
      color: #fff;
      padding: 7px 9px;
      font-weight: 600;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
    }
    tbody tr:nth-child(even) td { background: #f9fafb; }
    td {
      padding: 5.5px 9px;
      border-bottom: 1px solid #f1f5f9;
      color: #374151;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .subtotal-row td {
      background: #eef2f7 !important;
      border-top: 2px solid #94a3b8;
      border-bottom: none;
      font-weight: 700;
      color: #1f2937;
    }
    .property-header-row td {
      background: #e8edf5 !important;
      font-size: 10.5px; font-weight: 700;
      padding: 7px 9px;
      color: ${ACCENT};
      border-bottom: 1px solid #c7d2e4;
    }

    /* ── SUMMARY BOX ────────────────────────────────── */
    .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }
    .summary-box { min-width: 330px; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; }
    .summary-header {
      background: ${ACCENT}; color: #fff;
      padding: 8px 16px;
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
    }
    .s-row { display: flex; justify-content: space-between; align-items: center; padding: 5.5px 16px; border-bottom: 1px solid #f3f4f6; }
    .s-row .s-label { font-size: 10.5px; color: #6b7280; }
    .s-row .s-value { font-size: 10.5px; font-weight: 600; color: #1f2937; min-width: 90px; text-align: right; }
    .s-sep { height: 1px; background: #e5e7eb; margin: 3px 0; }
    .s-section { padding: 4px 16px 0; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; }
    .s-row.s-total { background: #eff6ff; padding: 8px 16px; border-bottom: none; }
    .s-row.s-total .s-label { font-size: 11px; font-weight: 700; color: ${ACCENT}; }
    .s-row.s-total .s-value { font-size: 14px; font-weight: 800; color: ${ACCENT}; }
    .s-row.s-grand { background: ${ACCENT}; padding: 10px 16px; border-bottom: none; }
    .s-row.s-grand .s-label { font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,0.8); }
    .s-row.s-grand .s-value { font-size: 15px; font-weight: 800; color: #fff; }

    /* ── PAYMENT BOX ────────────────────────────────── */
    .payment-box {
      margin-top: 20px; padding: 12px 16px;
      background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 4px;
    }
    .payment-box .pay-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: ${ACCENT}; margin-bottom: 6px; }
    .payment-box p { font-size: 10.5px; color: #374151; margin-bottom: 2px; }
    .payment-box strong { color: ${ACCENT}; }
    .payment-box .iban { font-family: monospace; font-size: 11px; letter-spacing: 0.5px; color: #1f2937; }

    /* ── FOOTER ─────────────────────────────────────── */
    .footer {
      margin-top: 32px; padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer p { font-size: 9px; color: #9ca3af; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 20px 24px; }
      tbody tr:nth-child(even) td { background: #f9fafb !important; }
      .subtotal-row td { background: #eef2f7 !important; }
      .property-header-row td { background: #e8edf5 !important; }
      .s-row.s-total { background: #eff6ff !important; }
    }
  `
}

function buildHeader(data: LiquidationData, docType: string, periodLabel: string, groupName?: string): string {
  const managerDetails = [
    data.manager.nif ? `NIF: ${data.manager.nif}` : '',
    [data.manager.address, data.manager.postalCode, data.manager.city].filter(Boolean).join(' · '),
    data.manager.email || '',
    data.manager.phone ? `Tel: ${data.manager.phone}` : '',
  ].filter(Boolean)

  return `
  <div class="header">
    <div class="header-left">
      ${data.manager.logoUrl ? `<img src="${data.manager.logoUrl}" class="logo" alt="Logo" />` : ''}
      <div class="manager-name">${data.manager.businessName}</div>
      ${managerDetails.map(d => `<div class="manager-detail">${d}</div>`).join('')}
    </div>
    <div class="header-right">
      <div class="doc-type">${docType}</div>
      <div class="doc-period">${periodLabel}</div>
      ${groupName ? `<div class="doc-group">${groupName}</div>` : ''}
      <div class="doc-meta">Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>`
}

function buildPartiesGrid(data: LiquidationData, isOwnerModel: boolean): string {
  const managerDetails = [
    data.manager.nif ? `NIF: ${data.manager.nif}` : '',
    [data.manager.address, data.manager.postalCode, data.manager.city].filter(Boolean).join(' · '),
    data.manager.email || '',
  ].filter(Boolean)

  const ownerDetails = [
    data.owner.nif ? `NIF: ${data.owner.nif}` : '',
    [data.owner.address, data.owner.postalCode, data.owner.city].filter(Boolean).join(' · '),
    data.owner.email || '',
  ].filter(Boolean)

  // In OWNER model: owner is on left (billed party), manager on right (billing party)
  // In MANAGER model: manager on left (billing party), owner on right (billed party)
  const leftCard = isOwnerModel ? `
    <div class="party-card">
      <div class="p-label">Propietario</div>
      <div class="p-name">${data.owner.name}</div>
      ${ownerDetails.map(d => `<div class="p-detail">${d}</div>`).join('')}
    </div>` : `
    <div class="party-card">
      <div class="p-label">Gestor</div>
      <div class="p-name">${data.manager.businessName}</div>
      ${managerDetails.map(d => `<div class="p-detail">${d}</div>`).join('')}
      ${data.manager.iban ? `<div class="p-iban">IBAN: ${formatIBAN(data.manager.iban)}</div>` : ''}
    </div>`

  const rightCard = isOwnerModel ? `
    <div class="party-card">
      <div class="p-label">Gestor</div>
      <div class="p-name">${data.manager.businessName}</div>
      ${managerDetails.map(d => `<div class="p-detail">${d}</div>`).join('')}
      ${data.manager.iban ? `<div class="p-iban">IBAN: ${formatIBAN(data.manager.iban)}</div>` : ''}
    </div>` : `
    <div class="party-card">
      <div class="p-label">Propietario</div>
      <div class="p-name">${data.owner.name}</div>
      ${ownerDetails.map(d => `<div class="p-detail">${d}</div>`).join('')}
      ${data.owner.iban ? `<div class="p-iban">IBAN: ${formatIBAN(data.owner.iban)}</div>` : ''}
    </div>`

  return `<div class="parties-grid">${leftCard}${rightCard}</div>`
}

function buildFooter(data: LiquidationData): string {
  return `
  <div class="footer">
    <p>${data.manager.businessName} · NIF: ${data.manager.nif}</p>
    <p>Documento generado automáticamente · ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>`
}

// ─── OWNER MODEL ─────────────────────────────────────────────────
/**
 * OWNER: propietario cobra de Airbnb/Booking y paga comisión+limpieza al gestor
 * Formato tipo Excel: tabla de reservas + resumen de lo que paga al gestor
 */
function generateOwnerHTML(data: LiquidationData): string {
  const monthName = MONTHS[data.month - 1]
  const periodLabel = `${monthName} ${data.year}`
  const daysInMonth = new Date(data.year, data.month, 0).getDate()

  const uniqueProperties = new Set(data.reservations.map(r => r.property))
  const useGroupedView = data.isGrouped || uniqueProperties.size > 1
  const propertyBreakdowns = useGroupedView ? groupByProperty(data) : []

  const totalNights = data.reservations.reduce((sum, r) => sum + r.nights, 0)
  const totalCleaning = data.reservations.reduce((sum, r) => sum + r.cleaningAmount, 0)
  const totalWithoutCleaning = data.totals.totalIncome - totalCleaning
  const avgPricePerNight = totalNights > 0 ? totalWithoutCleaning / totalNights : 0
  const occupancyRate = daysInMonth > 0 ? Math.min(Math.round((totalNights / daysInMonth) * 1000) / 10, 100) : 0
  const totalToPay = data.totals.totalCommission + data.totals.totalCleaning + data.totals.totalExpenses

  // Reservation table rows
  function ownerRows(reservations: ReservationItem[], propName?: string): string {
    const propNights = reservations.reduce((s, r) => s + r.nights, 0)
    const propIncome = reservations.reduce((s, r) => s + r.hostEarnings, 0)
    const propCleaning = reservations.reduce((s, r) => s + r.cleaningAmount, 0)
    const propNet = propIncome - propCleaning
    const propCommission = data.commissionRate ? propNet * (data.commissionRate / 100) : 0

    const rows = reservations.map(r => {
      const net = r.hostEarnings - r.cleaningAmount
      const commission = data.commissionRate ? net * (data.commissionRate / 100) : 0
      const neto = net - commission
      return `
        <tr>
          <td>${r.guestName}</td>
          <td class="text-center">${formatDate(r.checkIn)}&nbsp;→&nbsp;${formatDate(r.checkOut)}</td>
          <td class="text-center">${r.platform}</td>
          <td class="text-center">${r.nights}</td>
          <td class="text-right">${formatCurrency(r.cleaningAmount)}</td>
          <td class="text-right">${formatCurrency(r.hostEarnings)}</td>
          <td class="text-right">${formatCurrency(net)}</td>
          <td class="text-right">${formatCurrency(commission)}</td>
          <td class="text-right font-bold">${formatCurrency(neto)}</td>
        </tr>`
    }).join('')

    return `
      ${propName ? `<tr class="property-header-row"><td colspan="9">${propName}</td></tr>` : ''}
      ${rows}
      <tr class="subtotal-row">
        <td colspan="3" class="text-right">Subtotal</td>
        <td class="text-center">${propNights}</td>
        <td class="text-right">${formatCurrency(propCleaning)}</td>
        <td class="text-right">${formatCurrency(propIncome)}</td>
        <td class="text-right">${formatCurrency(propNet)}</td>
        <td class="text-right">${formatCurrency(propCommission)}</td>
        <td class="text-right font-bold">${formatCurrency(propNet - propCommission)}</td>
      </tr>`
  }

  let tableBody = ''
  if (useGroupedView && propertyBreakdowns.length > 0) {
    for (const bd of propertyBreakdowns) {
      tableBody += ownerRows(bd.reservations, bd.property)
    }
  } else {
    tableBody = ownerRows(data.reservations)
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facturación ${periodLabel} · ${data.owner.name}</title>
  <style>${getCSS()}</style>
</head>
<body>
<div class="page">

  ${buildHeader(data, 'Liquidación Mensual', periodLabel, data.groupName)}
  ${buildPartiesGrid(data, true)}

  ${totalNights > 0 ? `
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-label">Noches Reservadas</div>
      <div class="stat-value">${totalNights}</div>
      <div class="stat-unit">de ${daysInMonth} disponibles</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ocupación</div>
      <div class="stat-value">${occupancyRate}%</div>
      <div class="stat-unit">${monthName} ${data.year}</div>
    </div>
    ${data.commissionRate ? `
    <div class="stat-card">
      <div class="stat-label">% Comisión Gestión</div>
      <div class="stat-value">${data.commissionRate}%</div>
      <div class="stat-unit">sobre ingresos netos</div>
    </div>` : ''}
    <div class="stat-card">
      <div class="stat-label">Precio Medio / Noche</div>
      <div class="stat-value">${formatCurrency(avgPricePerNight)}</div>
      <div class="stat-unit">sin limpieza</div>
    </div>
  </div>` : ''}

  ${data.reservations.length > 0 ? `
  <div class="section-title">Detalle de Reservas</div>
  <table>
    <thead>
      <tr>
        <th>Huésped</th>
        <th class="text-center">Periodo</th>
        <th class="text-center">Plataforma</th>
        <th class="text-center">Noches</th>
        <th class="text-right">Limpieza</th>
        <th class="text-right">Total</th>
        <th class="text-right">Sin Limp.</th>
        <th class="text-right">Comisión</th>
        <th class="text-right">Neto Prop.</th>
      </tr>
    </thead>
    <tbody>${tableBody}</tbody>
  </table>` : ''}

  ${data.expenses.length > 0 ? `
  <div class="section-title">Gastos Repercutidos</div>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Concepto</th>
        <th>Categoría</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${data.expenses.map(e => `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.concept}</td>
        <td>${EXPENSE_CATEGORIES[e.category] || e.category}</td>
        <td class="text-right">${formatCurrency(e.amount + e.vatAmount)}</td>
      </tr>`).join('')}
    </tbody>
  </table>` : ''}

  <!-- Summary -->
  <div class="summary-wrapper">
    <div class="summary-box">
      <div class="summary-header">Resumen de Liquidación</div>

      <div class="s-section" style="padding-top:8px;">Ingresos</div>
      <div class="s-row">
        <span class="s-label">Total ingresos brutos</span>
        <span class="s-value">${formatCurrency(data.totals.totalIncome)}</span>
      </div>
      ${totalNights > 0 ? `
      <div class="s-row">
        <span class="s-label">Noches · Ocupación</span>
        <span class="s-value">${totalNights} noches · ${occupancyRate}%</span>
      </div>` : ''}

      <div class="s-sep"></div>
      <div class="s-section">Comisión de Gestión</div>
      ${data.commissionRate ? `
      <div class="s-row">
        <span class="s-label">% Comisión</span>
        <span class="s-value">${data.commissionRate}%</span>
      </div>` : ''}
      <div class="s-row">
        <span class="s-label">Total comisión</span>
        <span class="s-value">${formatCurrency(data.totals.totalCommission)}</span>
      </div>

      ${data.totals.totalCleaning > 0 ? `
      <div class="s-sep"></div>
      <div class="s-section">Limpieza</div>
      <div class="s-row">
        <span class="s-label">Total limpieza</span>
        <span class="s-value">${formatCurrency(data.totals.totalCleaning)}</span>
      </div>` : ''}

      ${data.totals.totalExpenses > 0 ? `
      <div class="s-sep"></div>
      <div class="s-section">Gastos</div>
      <div class="s-row">
        <span class="s-label">Total gastos</span>
        <span class="s-value">${formatCurrency(data.totals.totalExpenses)}</span>
      </div>` : ''}

      <div class="s-sep"></div>
      <div class="s-row s-total">
        <span class="s-label">Total a Transferir</span>
        <span class="s-value">${formatCurrency(totalToPay)}</span>
      </div>
      <div class="s-row s-grand">
        <span class="s-label">TOTAL INGRESOS</span>
        <span class="s-value">${formatCurrency(data.totals.totalIncome)}</span>
      </div>
    </div>
  </div>

  ${data.manager.iban ? `
  <div class="payment-box">
    <div class="pay-title">Datos para Transferencia</div>
    <p><strong>Beneficiario:</strong> ${data.manager.businessName}</p>
    <p class="iban"><strong>IBAN:</strong> ${formatIBAN(data.manager.iban)}${data.manager.bic ? ` &nbsp;·&nbsp; <strong>BIC:</strong> ${data.manager.bic}` : ''}${data.manager.bankName ? ` &nbsp;·&nbsp; ${data.manager.bankName}` : ''}</p>
    <p><strong>Concepto:</strong> Liquidación gestión ${periodLabel}${data.groupName ? ` · ${data.groupName}` : ''}</p>
  </div>` : ''}

  ${buildFooter(data)}
</div>
</body>
</html>`
}

// ─── MANAGER MODEL ────────────────────────────────────────────────
/**
 * MANAGER: gestor cobra de Airbnb/Booking y transfiere neto al propietario
 * Formato clásico: tabla de reservas + desglose de deducciones + a transferir
 */
export function generateLiquidationHTML(data: LiquidationData): string {
  if (data.incomeReceiver === 'OWNER') {
    return generateOwnerHTML(data)
  }

  const monthName = MONTHS[data.month - 1]
  const periodLabel = `${monthName} ${data.year}`
  const daysInMonth = new Date(data.year, data.month, 0).getDate()

  const uniqueProperties = new Set(data.reservations.map(r => r.property))
  const useGroupedView = data.isGrouped || uniqueProperties.size > 1
  const propertyBreakdowns = useGroupedView ? groupByProperty(data) : []

  const totalNights = data.reservations.reduce((sum, r) => sum + r.nights, 0)
  const totalCleaning = data.reservations.reduce((sum, r) => sum + r.cleaningAmount, 0)
  const avgPricePerNight = totalNights > 0 ? (data.totals.totalIncome - totalCleaning) / totalNights : 0
  const occupancyRate = daysInMonth > 0 ? Math.min(Math.round((totalNights / daysInMonth) * 1000) / 10, 100) : 0

  function managerRows(reservations: ReservationItem[], propName?: string): string {
    const propNights = reservations.reduce((s, r) => s + r.nights, 0)
    const propIncome = reservations.reduce((s, r) => s + r.hostEarnings, 0)
    const propCleaning = reservations.reduce((s, r) => s + r.cleaningAmount, 0)
    const propAvg = propNights > 0 ? (propIncome - propCleaning) / propNights : 0

    const rows = reservations.map(r => {
      const net = r.hostEarnings - r.cleaningAmount
      const ppn = r.nights > 0 ? net / r.nights : 0
      return `
        <tr>
          <td>${r.guestName}</td>
          <td class="text-center">${formatDate(r.checkIn)}&nbsp;→&nbsp;${formatDate(r.checkOut)}</td>
          <td class="text-center">${r.platform}</td>
          <td class="text-center">${r.nights}</td>
          <td class="text-right">${formatCurrency(r.hostEarnings)}</td>
          <td class="text-right">${formatCurrency(r.cleaningAmount)}</td>
          <td class="text-right">${formatCurrency(ppn)}</td>
        </tr>`
    }).join('')

    return `
      ${propName ? `<tr class="property-header-row"><td colspan="7">${propName}</td></tr>` : ''}
      ${rows}
      <tr class="subtotal-row">
        <td colspan="3" class="text-right">Subtotal</td>
        <td class="text-center">${propNights}</td>
        <td class="text-right">${formatCurrency(propIncome)}</td>
        <td class="text-right">${formatCurrency(propCleaning)}</td>
        <td class="text-right">${formatCurrency(propAvg)}</td>
      </tr>`
  }

  let tableBody = ''
  if (useGroupedView && propertyBreakdowns.length > 0) {
    for (const bd of propertyBreakdowns) {
      tableBody += managerRows(bd.reservations, bd.property)
    }
  } else {
    tableBody = managerRows(data.reservations)
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liquidación ${periodLabel} · ${data.owner.name}</title>
  <style>${getCSS()}</style>
</head>
<body>
<div class="page">

  ${buildHeader(data, 'Liquidación Mensual', periodLabel, data.groupName)}
  ${buildPartiesGrid(data, false)}

  ${totalNights > 0 ? `
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-label">Noches Reservadas</div>
      <div class="stat-value">${totalNights}</div>
      <div class="stat-unit">de ${daysInMonth} disponibles</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ocupación</div>
      <div class="stat-value">${occupancyRate}%</div>
      <div class="stat-unit">${monthName} ${data.year}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Precio Medio / Noche</div>
      <div class="stat-value">${formatCurrency(avgPricePerNight)}</div>
      <div class="stat-unit">sin limpieza</div>
    </div>
  </div>` : ''}

  ${data.reservations.length > 0 ? `
  <div class="section-title">Detalle de Reservas</div>
  <table>
    <thead>
      <tr>
        <th>Huésped</th>
        <th class="text-center">Periodo</th>
        <th class="text-center">Plataforma</th>
        <th class="text-center">Noches</th>
        <th class="text-right">Importe</th>
        <th class="text-right">Limpieza</th>
        <th class="text-right">€ / Noche</th>
      </tr>
    </thead>
    <tbody>${tableBody}</tbody>
  </table>` : ''}

  ${data.expenses.length > 0 ? `
  <div class="section-title">Gastos Repercutidos</div>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Concepto</th>
        <th>Categoría</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${data.expenses.map(e => `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.concept}</td>
        <td>${EXPENSE_CATEGORIES[e.category] || e.category}</td>
        <td class="text-right">${formatCurrency(e.amount + e.vatAmount)}</td>
      </tr>`).join('')}
    </tbody>
  </table>` : ''}

  <!-- Summary -->
  <div class="summary-wrapper">
    <div class="summary-box">
      <div class="summary-header">Resumen de Liquidación</div>

      <div class="s-section" style="padding-top:8px;">Ingresos Recibidos</div>
      <div class="s-row">
        <span class="s-label">Total ingresos brutos</span>
        <span class="s-value">${formatCurrency(data.totals.totalIncome)}</span>
      </div>
      ${totalNights > 0 ? `
      <div class="s-row">
        <span class="s-label">Noches · Ocupación</span>
        <span class="s-value">${totalNights} noches · ${occupancyRate}%</span>
      </div>` : ''}

      <div class="s-sep"></div>
      <div class="s-section">Deducciones</div>
      <div class="s-row">
        <span class="s-label">Comisión de gestión${data.commissionRate ? ` (${data.commissionRate}%)` : ''}</span>
        <span class="s-value">−${formatCurrency(data.totals.totalCommission)}</span>
      </div>
      ${data.totals.totalCommissionVat > 0 ? `
      <div class="s-row">
        <span class="s-label">IVA comisión (21%)</span>
        <span class="s-value">−${formatCurrency(data.totals.totalCommissionVat)}</span>
      </div>` : ''}
      ${data.totals.totalCleaning > 0 ? `
      <div class="s-row">
        <span class="s-label">Limpiezas</span>
        <span class="s-value">−${formatCurrency(data.totals.totalCleaning)}</span>
      </div>` : ''}
      ${data.totals.totalExpenses > 0 ? `
      <div class="s-row">
        <span class="s-label">Gastos repercutidos</span>
        <span class="s-value">−${formatCurrency(data.totals.totalExpenses)}</span>
      </div>` : ''}

      <div class="s-sep"></div>
      <div class="s-row s-total">
        <span class="s-label">Neto a Transferir</span>
        <span class="s-value">${formatCurrency(data.totals.totalAmount)}</span>
      </div>
    </div>
  </div>

  ${data.owner.iban ? `
  <div class="payment-box">
    <div class="pay-title">Datos para Transferencia</div>
    <p><strong>Beneficiario:</strong> ${data.owner.name}</p>
    <p class="iban"><strong>IBAN:</strong> ${formatIBAN(data.owner.iban)}</p>
    <p><strong>Concepto:</strong> Liquidación ${periodLabel}${data.groupName ? ` · ${data.groupName}` : ''}</p>
  </div>` : ''}

  ${buildFooter(data)}
</div>
</body>
</html>`
}

export type { LiquidationData, ReservationItem, ExpenseItem, PropertyBreakdown }
