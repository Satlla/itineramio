/**
 * Client Invoice Generator - Estilo Holded
 * Genera HTML para facturas de gestor a propietarios
 */

interface PaymentMethod {
  type: string
  enabled: boolean
}

interface InvoiceItem {
  concept: string       // Título del concepto
  description?: string  // Descripción adicional
  quantity: number
  unitPrice: number
  vatRate: number
  retentionRate?: number
  subtotal: number      // unitPrice * quantity
  total: number         // subtotal + IVA
}

interface ClientInvoiceData {
  // Invoice info
  fullNumber?: string
  status: string
  type: 'STANDARD' | 'RECTIFYING'
  issueDate: Date | string
  dueDate?: Date | string

  // Rectifying info
  rectifyingType?: 'SUBSTITUTION' | 'DIFFERENCE'
  rectifyingReason?: string
  originalInvoice?: {
    fullNumber: string
    issueDate: Date | string
    total?: number
  }

  // Issuer (gestor)
  issuer: {
    businessName: string
    nif: string
    address: string
    city: string
    postalCode: string
    country: string
    email?: string
    phone?: string
    logoUrl?: string
  }

  // Recipient (propietario)
  recipient: {
    name: string
    nif: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
  }

  // Items
  items: InvoiceItem[]

  // Totals
  subtotal: number      // Base imponible total
  vatAmount: number     // IVA total
  retentionAmount?: number
  total: number         // Total factura

  // Payment
  iban?: string
  paymentNote?: string
}

/**
 * Formatea moneda en EUR (formato español: 1.234,56€)
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '€'
}

/**
 * Formatea fecha en formato DD/MM/YYYY
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Genera HTML para factura estilo Holded
 */
export function generateClientInvoiceHTML(data: ClientInvoiceData): string {
  const isRectifying = data.type === 'RECTIFYING'
  const isDraft = data.status === 'DRAFT' || data.status === 'PROFORMA'
  const displayNumber = isDraft ? 'BORRADOR' : (data.fullNumber || 'SIN NÚMERO')

  // Generar filas de la tabla de conceptos
  const itemsRows = data.items.map(item => `
    <tr>
      <td class="concept-cell">
        <div class="concept-title">${item.concept}</div>
        ${item.description ? `<div class="concept-desc">${item.description}</div>` : ''}
      </td>
      <td class="price-cell">${formatCurrency(item.unitPrice)}</td>
      <td class="qty-cell">${item.quantity}</td>
      <td class="subtotal-cell">${formatCurrency(item.subtotal)}</td>
      <td class="vat-cell">${item.vatRate}%</td>
      <td class="total-cell">${formatCurrency(item.total)}</td>
    </tr>
  `).join('')

  // Calcular desglose de IVA por tipo
  const vatBreakdown: Record<number, { base: number; vat: number }> = {}
  data.items.forEach(item => {
    if (!vatBreakdown[item.vatRate]) {
      vatBreakdown[item.vatRate] = { base: 0, vat: 0 }
    }
    vatBreakdown[item.vatRate].base += item.subtotal
    vatBreakdown[item.vatRate].vat += item.total - item.subtotal
  })

  // Generar filas del resumen de impuestos
  const taxRows = Object.entries(vatBreakdown).map(([rate, { base, vat }]) => `
    <tr>
      <td>${formatCurrency(base)}</td>
      <td>IVA ${rate}%</td>
      <td>${formatCurrency(vat)}</td>
      <td>${formatCurrency(base + vat)}</td>
    </tr>
  `).join('')

  // Banner de rectificativa
  const rectifyingBanner = isRectifying ? `
    <div class="rectifying-banner">
      <strong>FACTURA RECTIFICATIVA</strong>
      ${data.rectifyingType === 'SUBSTITUTION' ? ' - Por sustitución' : ' - Por diferencias'}
      ${data.originalInvoice ? `<br>Rectifica a: <strong>${data.originalInvoice.fullNumber}</strong> del ${formatDate(data.originalInvoice.issueDate)}` : ''}
      ${data.rectifyingReason ? `<br>Motivo: ${data.rectifyingReason}` : ''}
    </div>
  ` : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${displayNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      color: #333;
      line-height: 1.4;
      background: #fff;
    }

    .invoice {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
      min-height: 297mm;
      position: relative;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .logo {
      max-width: 180px;
      max-height: 60px;
    }

    .logo-text {
      font-size: 28pt;
      font-weight: 900;
      letter-spacing: -1px;
    }

    .issuer-info {
      text-align: right;
      font-size: 10pt;
      color: #333;
      line-height: 1.5;
    }

    /* Invoice Title Section */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 25px 0;
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }

    .invoice-title {
      font-size: 14pt;
      font-weight: 700;
      color: #000;
    }

    .invoice-dates {
      text-align: right;
      font-size: 10pt;
    }

    /* Client & Total Section */
    .client-total {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
    }

    .client-info {
      font-size: 10pt;
      line-height: 1.5;
    }

    .client-name {
      font-weight: 700;
      font-size: 11pt;
      margin-bottom: 2px;
    }

    .total-highlight {
      text-align: right;
    }

    .total-highlight span {
      font-size: 24pt;
      font-weight: 400;
      color: #000;
    }

    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 10pt;
    }

    .items-table th {
      text-align: left;
      padding: 12px 8px;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 600;
      font-size: 9pt;
      text-transform: uppercase;
      color: #333;
    }

    .items-table th:not(:first-child) {
      text-align: right;
    }

    .items-table td {
      padding: 14px 8px;
      vertical-align: top;
    }

    .items-table td:not(:first-child) {
      text-align: right;
    }

    .concept-cell {
      width: 40%;
    }

    .concept-title {
      font-weight: 600;
      color: #000;
      margin-bottom: 2px;
    }

    .concept-desc {
      font-size: 9pt;
      color: #666;
    }

    .price-cell, .subtotal-cell, .total-cell {
      white-space: nowrap;
    }

    .qty-cell {
      text-align: center !important;
    }

    .items-table th.qty-header {
      text-align: center;
    }

    /* Tax Summary */
    .tax-summary {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 10pt;
    }

    .tax-summary th {
      text-align: center;
      padding: 10px 12px;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 600;
      font-size: 9pt;
      text-transform: uppercase;
      color: #333;
    }

    .tax-summary td {
      text-align: center;
      padding: 10px 12px;
    }

    /* Final Totals */
    .final-totals {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding-top: 10px;
      font-weight: 700;
      font-size: 11pt;
    }

    /* Retention */
    .retention-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
      color: #c00;
      font-size: 10pt;
    }

    .retention-row span:first-child {
      margin-right: 30px;
    }

    /* Footer */
    .footer {
      position: absolute;
      bottom: 20mm;
      left: 20mm;
      right: 20mm;
      text-align: center;
      font-size: 9pt;
      color: #333;
    }

    .payment-info {
      margin-bottom: 10px;
    }

    .iban {
      font-size: 12pt;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .page-number {
      position: absolute;
      bottom: 15mm;
      right: 20mm;
      font-size: 9pt;
      color: #999;
    }

    /* Rectifying banner */
    .rectifying-banner {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 10pt;
      color: #856404;
    }

    /* Draft watermark */
    .draft-watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120pt;
      font-weight: 900;
      color: rgba(200, 200, 200, 0.3);
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
      letter-spacing: 20px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .invoice { padding: 0; min-height: auto; }
      .footer { position: fixed; }
    }
  </style>
</head>
<body>
  ${isDraft ? '<div class="draft-watermark">BORRADOR</div>' : ''}
  <div class="invoice">
    ${rectifyingBanner}

    <!-- Header: Logo + Issuer Info -->
    <div class="header">
      <div class="logo-section">
        ${data.issuer.logoUrl
          ? `<img src="${data.issuer.logoUrl}" alt="Logo" class="logo">`
          : `<div class="logo-text">${data.issuer.businessName.split(' ')[0].toUpperCase()}</div>`
        }
      </div>
      <div class="issuer-info">
        ${data.issuer.businessName}<br>
        ${data.issuer.nif}<br>
        ${data.issuer.address}<br>
        ${data.issuer.city} (${data.issuer.postalCode}), ${data.issuer.city.split(',')[0]}, ${data.issuer.country}<br>
        ${data.issuer.email || ''}<br>
        ${data.issuer.phone || ''}
      </div>
    </div>

    <!-- Invoice Title + Dates -->
    <div class="invoice-header">
      <div class="invoice-title">FACTURA #${displayNumber}</div>
      <div class="invoice-dates">
        Fecha: ${formatDate(data.issueDate)}<br>
        ${data.dueDate ? `Vencimiento: ${formatDate(data.dueDate)}` : ''}
      </div>
    </div>

    <!-- Client Info + Total Highlight -->
    <div class="client-total">
      <div class="client-info">
        <div class="client-name">${data.recipient.name}</div>
        ${data.recipient.nif}<br>
        ${data.recipient.address || ''}<br>
        ${data.recipient.city ? `${data.recipient.city} (${data.recipient.postalCode || ''}), ${data.recipient.city.split(',')[0]}, ${data.recipient.country || 'España'}` : ''}
      </div>
      <div class="total-highlight">
        <span>Total ${formatCurrency(data.total)}</span>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>CONCEPTO</th>
          <th>PRECIO</th>
          <th class="qty-header">UNIDADES</th>
          <th>SUBTOTAL</th>
          <th>IVA</th>
          <th>TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Tax Summary -->
    <table class="tax-summary">
      <thead>
        <tr>
          <th>BASE IMPONIBLE</th>
          <th>IMPUESTO</th>
          <th>TOTAL IMPUESTO</th>
          <th>TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${taxRows}
      </tbody>
    </table>

    <!-- Final Totals -->
    <div class="final-totals">
      <span>${formatCurrency(data.subtotal)}</span>
      <span>${formatCurrency(data.total)}</span>
    </div>

    ${data.retentionAmount && data.retentionAmount > 0 ? `
    <div class="retention-row">
      <span>Retención IRPF</span>
      <span>-${formatCurrency(data.retentionAmount)}</span>
    </div>
    ` : ''}

    <!-- Footer with Payment Info -->
    ${data.iban ? `
    <div class="footer">
      <div class="payment-info">
        Pagar por transferencia bancaria al siguiente número de cuenta
      </div>
      <div class="iban">${data.iban}</div>
    </div>
    ` : ''}

    <div class="page-number">1/1</div>
  </div>
</body>
</html>`
}

export type { ClientInvoiceData, InvoiceItem, PaymentMethod }
