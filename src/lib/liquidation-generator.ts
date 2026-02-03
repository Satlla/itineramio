/**
 * Liquidation PDF Generator
 * Genera HTML para liquidaciones mensuales a propietarios
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
  // Info liquidación
  id: string
  year: number
  month: number
  status: string
  createdAt: string

  // Propietario
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

  // Gestor
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

  // Totales
  totals: {
    totalIncome: number
    totalCommission: number
    totalCommissionVat: number
    totalCleaning: number
    totalExpenses: number
    totalAmount: number
  }

  // Detalle
  reservations: ReservationItem[]
  expenses: ExpenseItem[]

  // Notas
  notes?: string

  // Información de conjunto (si aplica)
  groupName?: string // Nombre del BillingUnitGroup
  isGrouped?: boolean // Si es liquidación de conjunto
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
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
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatIBAN(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Group reservations and expenses by property for breakdown view
 */
function groupByProperty(data: LiquidationData): PropertyBreakdown[] {
  const propertyMap = new Map<string, PropertyBreakdown>()

  // Group reservations
  for (const res of data.reservations) {
    const existing = propertyMap.get(res.property)
    if (existing) {
      existing.reservations.push(res)
      existing.subtotalIncome += res.hostEarnings
    } else {
      propertyMap.set(res.property, {
        property: res.property,
        reservations: [res],
        expenses: [],
        subtotalIncome: res.hostEarnings,
        subtotalExpenses: 0
      })
    }
  }

  // Group expenses
  for (const exp of data.expenses) {
    const existing = propertyMap.get(exp.property)
    if (existing) {
      existing.expenses.push(exp)
      existing.subtotalExpenses += exp.amount + exp.vatAmount
    } else {
      propertyMap.set(exp.property, {
        property: exp.property,
        reservations: [],
        expenses: [exp],
        subtotalIncome: 0,
        subtotalExpenses: exp.amount + exp.vatAmount
      })
    }
  }

  return Array.from(propertyMap.values())
}

/**
 * Generate HTML section for a single property breakdown
 */
function generatePropertySection(breakdown: PropertyBreakdown, index: number): string {
  const reservationRows = breakdown.reservations.map((r) => `
    <tr>
      <td>${r.confirmationCode}</td>
      <td>${r.guestName}</td>
      <td>${formatDate(r.checkIn)}</td>
      <td>${formatDate(r.checkOut)}</td>
      <td class="text-center">${r.nights}</td>
      <td class="text-right">${formatCurrency(r.hostEarnings)}</td>
    </tr>
  `).join('')

  const expenseRows = breakdown.expenses.map((e) => `
    <tr>
      <td>${formatDate(e.date)}</td>
      <td>${e.concept}</td>
      <td>${EXPENSE_CATEGORIES[e.category] || e.category}</td>
      <td class="text-right">${formatCurrency(e.amount + e.vatAmount)}</td>
    </tr>
  `).join('')

  return `
    <div class="property-section ${index > 0 ? 'page-break-before' : ''}">
      <div class="property-header">
        <h3>${breakdown.property}</h3>
      </div>

      ${breakdown.reservations.length > 0 ? `
      <div class="section">
        <h4 class="section-subtitle">Reservas (${breakdown.reservations.length})</h4>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Huésped</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th class="text-center">Noches</th>
              <th class="text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${reservationRows}
          </tbody>
          <tfoot>
            <tr class="subtotal-row">
              <td colspan="5" class="text-right"><strong>Subtotal reservas:</strong></td>
              <td class="text-right"><strong>${formatCurrency(breakdown.subtotalIncome)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      ` : ''}

      ${breakdown.expenses.length > 0 ? `
      <div class="section">
        <h4 class="section-subtitle">Gastos (${breakdown.expenses.length})</h4>
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
            ${expenseRows}
          </tbody>
          <tfoot>
            <tr class="subtotal-row">
              <td colspan="3" class="text-right"><strong>Subtotal gastos:</strong></td>
              <td class="text-right"><strong>${formatCurrency(breakdown.subtotalExpenses)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      ` : ''}
    </div>
  `
}

export function generateLiquidationHTML(data: LiquidationData): string {
  const monthName = MONTHS[data.month - 1]
  const periodLabel = `${monthName} ${data.year}`

  // Check if we should use grouped view (multiple properties)
  const uniqueProperties = new Set(data.reservations.map(r => r.property))
  const useGroupedView = data.isGrouped || uniqueProperties.size > 1

  // Generate property breakdowns for grouped view
  const propertyBreakdowns = useGroupedView ? groupByProperty(data) : []

  // Generar filas de reservas (for flat view)
  const reservationRows = data.reservations.map((r) => `
    <tr>
      <td>${r.property}</td>
      <td>${r.confirmationCode}</td>
      <td>${r.guestName}</td>
      <td>${formatDate(r.checkIn)}</td>
      <td>${formatDate(r.checkOut)}</td>
      <td class="text-center">${r.nights}</td>
      <td class="text-right">${formatCurrency(r.hostEarnings)}</td>
    </tr>
  `).join('')

  // Generar filas de gastos (for flat view)
  const expenseRows = data.expenses.map((e) => `
    <tr>
      <td>${e.property}</td>
      <td>${formatDate(e.date)}</td>
      <td>${e.concept}</td>
      <td>${EXPENSE_CATEGORIES[e.category] || e.category}</td>
      <td class="text-right">${formatCurrency(e.amount)}</td>
      <td class="text-right">${formatCurrency(e.vatAmount)}</td>
      <td class="text-right">${formatCurrency(e.amount + e.vatAmount)}</td>
    </tr>
  `).join('')

  // Determinar si el propietario debe pagar o recibir
  const isPositive = data.totals.totalAmount >= 0
  const amountLabel = isPositive ? 'A transferir al propietario' : 'A pagar por el propietario'
  const amountClass = isPositive ? 'positive' : 'negative'

  // Generate property sections for grouped view
  const propertySectionsHTML = propertyBreakdowns.map((breakdown, index) =>
    generatePropertySection(breakdown, index)
  ).join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liquidación ${periodLabel} - ${data.owner.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      line-height: 1.5;
      font-size: 12px;
      background: #fff;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px 40px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo-img {
      max-width: 70px;
      max-height: 70px;
      object-fit: contain;
    }

    .company-info h1 {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }

    .company-info p {
      font-size: 11px;
      color: #6b7280;
    }

    .document-info {
      text-align: right;
    }

    .document-title {
      font-size: 22px;
      font-weight: 700;
      color: #7c3aed;
      margin-bottom: 5px;
    }

    .document-period {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }

    .document-date {
      font-size: 11px;
      color: #6b7280;
      margin-top: 5px;
    }

    /* Parties */
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .party-box {
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .party-box h3 {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 10px;
    }

    .party-box p {
      font-size: 12px;
      color: #374151;
      margin-bottom: 3px;
    }

    .party-box p strong {
      color: #111827;
    }

    /* Tables */
    .section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }

    th {
      background: #f3f4f6;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #f3f4f6;
      color: #4b5563;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    /* Summary */
    .summary {
      margin-top: 30px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
    }

    .summary-row.subtotal {
      border-top: 1px solid #e5e7eb;
      margin-top: 10px;
      padding-top: 15px;
    }

    .summary-row .label {
      color: #6b7280;
    }

    .summary-row .value {
      font-weight: 500;
      color: #374151;
    }

    .summary-row .value.negative {
      color: #dc2626;
    }

    .summary-row.total {
      border-top: 2px solid #7c3aed;
      margin-top: 15px;
      padding-top: 15px;
    }

    .summary-row.total .label,
    .summary-row.total .value {
      font-size: 16px;
      font-weight: 700;
    }

    .summary-row.total .value.positive {
      color: #059669;
    }

    .summary-row.total .value.negative {
      color: #dc2626;
    }

    /* Payment info */
    .payment-info {
      margin-top: 25px;
      padding: 15px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
    }

    .payment-info h4 {
      font-size: 12px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 10px;
    }

    .payment-info p {
      font-size: 12px;
      color: #1e40af;
      margin-bottom: 3px;
    }

    /* Notes */
    .notes {
      margin-top: 20px;
      padding: 15px;
      background: #fefce8;
      border: 1px solid #fde047;
      border-radius: 8px;
    }

    .notes h4 {
      font-size: 12px;
      font-weight: 600;
      color: #854d0e;
      margin-bottom: 8px;
    }

    .notes p {
      font-size: 12px;
      color: #713f12;
      white-space: pre-wrap;
    }

    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
    }

    /* Property sections for grouped view */
    .property-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px dashed #e5e7eb;
    }

    .property-section:last-child {
      border-bottom: none;
    }

    .property-header {
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      color: white;
      padding: 12px 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .property-header h3 {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }

    .section-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .subtotal-row td {
      background: #f3f4f6;
      border-top: 2px solid #e5e7eb;
      padding: 10px;
    }

    /* Group badge */
    .group-badge {
      display: inline-block;
      background: #ede9fe;
      color: #7c3aed;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 5px;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .container {
        padding: 20px;
      }

      .page-break-before {
        page-break-before: always;
      }

      .property-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        ${data.manager.logoUrl
          ? `<img src="${data.manager.logoUrl}" alt="Logo" class="logo-img" onerror="this.style.display='none'">`
          : ''}
        <div class="company-info">
          <h1>${data.manager.businessName}</h1>
          <p>NIF: ${data.manager.nif}</p>
          <p>${data.manager.address}</p>
          <p>${data.manager.postalCode} ${data.manager.city}</p>
        </div>
      </div>
      <div class="document-info">
        <div class="document-title">LIQUIDACIÓN</div>
        <div class="document-period">${periodLabel}</div>
        ${data.groupName ? `<div class="group-badge">${data.groupName}</div>` : ''}
        <div class="document-date">Generada: ${formatDate(data.createdAt)}</div>
      </div>
    </div>

    <!-- Parties -->
    <div class="parties">
      <div class="party-box">
        <h3>Gestor</h3>
        <p><strong>${data.manager.businessName}</strong></p>
        <p>NIF: ${data.manager.nif}</p>
        <p>${data.manager.address}</p>
        <p>${data.manager.postalCode} ${data.manager.city}</p>
        ${data.manager.email ? `<p>${data.manager.email}</p>` : ''}
        ${data.manager.phone ? `<p>${data.manager.phone}</p>` : ''}
      </div>
      <div class="party-box">
        <h3>Propietario</h3>
        <p><strong>${data.owner.name}</strong></p>
        <p>NIF: ${data.owner.nif}</p>
        ${data.owner.address ? `<p>${data.owner.address}</p>` : ''}
        ${data.owner.postalCode || data.owner.city ? `<p>${data.owner.postalCode || ''} ${data.owner.city || ''}</p>` : ''}
        ${data.owner.email ? `<p>${data.owner.email}</p>` : ''}
      </div>
    </div>

    <!-- Grouped View: Property Sections -->
    ${useGroupedView && propertyBreakdowns.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Desglose por Apartamento</h2>
      ${propertySectionsHTML}
    </div>
    ` : ''}

    <!-- Flat View: Reservations -->
    ${!useGroupedView && data.reservations.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Reservas del Período (${data.reservations.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Código</th>
            <th>Huésped</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th class="text-center">Noches</th>
            <th class="text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${reservationRows}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Flat View: Expenses -->
    ${!useGroupedView && data.expenses.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Gastos Repercutidos (${data.expenses.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Categoría</th>
            <th class="text-right">Base</th>
            <th class="text-right">IVA</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${expenseRows}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Summary -->
    <div class="summary">
      <div class="summary-row">
        <span class="label">Total ingresos por reservas</span>
        <span class="value">${formatCurrency(data.totals.totalIncome)}</span>
      </div>
      <div class="summary-row">
        <span class="label">Comisión de gestión</span>
        <span class="value negative">- ${formatCurrency(data.totals.totalCommission)}</span>
      </div>
      <div class="summary-row">
        <span class="label">IVA comisión</span>
        <span class="value negative">- ${formatCurrency(data.totals.totalCommissionVat)}</span>
      </div>
      ${data.totals.totalCleaning > 0 ? `
      <div class="summary-row">
        <span class="label">Limpiezas</span>
        <span class="value negative">- ${formatCurrency(data.totals.totalCleaning)}</span>
      </div>
      ` : ''}
      ${data.totals.totalExpenses > 0 ? `
      <div class="summary-row">
        <span class="label">Gastos repercutidos</span>
        <span class="value negative">- ${formatCurrency(data.totals.totalExpenses)}</span>
      </div>
      ` : ''}
      <div class="summary-row total">
        <span class="label">${amountLabel}</span>
        <span class="value ${amountClass}">${formatCurrency(Math.abs(data.totals.totalAmount))}</span>
      </div>
    </div>

    <!-- Payment info -->
    ${isPositive && data.owner.iban ? `
    <div class="payment-info">
      <h4>Datos para la transferencia</h4>
      <p><strong>Beneficiario:</strong> ${data.owner.name}</p>
      <p><strong>IBAN:</strong> ${formatIBAN(data.owner.iban)}</p>
      <p><strong>Concepto:</strong> Liquidación ${periodLabel}</p>
    </div>
    ` : ''}

    ${!isPositive && data.manager.iban ? `
    <div class="payment-info">
      <h4>Datos para el pago</h4>
      <p><strong>Beneficiario:</strong> ${data.manager.businessName}</p>
      ${data.manager.bankName ? `<p><strong>Banco:</strong> ${data.manager.bankName}</p>` : ''}
      <p><strong>IBAN:</strong> ${formatIBAN(data.manager.iban)}</p>
      ${data.manager.bic ? `<p><strong>BIC:</strong> ${data.manager.bic}</p>` : ''}
      <p><strong>Concepto:</strong> Liquidación ${periodLabel}</p>
    </div>
    ` : ''}

    <!-- Notes -->
    ${data.notes ? `
    <div class="notes">
      <h4>Observaciones</h4>
      <p>${data.notes}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p>Documento generado automáticamente - ${data.manager.businessName}</p>
      ${data.manager.email ? `<p>${data.manager.email}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `
}

export type { LiquidationData, ReservationItem, ExpenseItem, PropertyBreakdown }
