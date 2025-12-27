import { prisma } from './prisma'

interface InvoiceData {
  invoice: {
    id: string
    invoiceNumber: string
    amount: number
    discountAmount: number
    finalAmount: number
    status: string
    paymentMethod: string
    dueDate: Date
    paidDate?: Date
    createdAt: Date
    notes?: string
  }
  user: {
    name: string
    email: string
    phone?: string
    companyName?: string
    billingAddress?: string
    billingCity?: string
    billingCountry?: string
    billingPostalCode?: string
    vatNumber?: string
  }
  companySettings: {
    companyName: string
    companyTaxId: string
    companyEmail: string
    companyPhone: string
    companyAddress: string
    companyCity: string
    companyPostalCode: string
    companyCountry: string
    companyWebsite: string
    companyBankAccount?: string
    companyBic?: string
    companyLogoUrl?: string
    companyAdditionalInfo?: string
  }
  properties?: Array<{
    id: string
    name: string
  }>
}

export class InvoiceGenerator {
  private static instance: InvoiceGenerator

  private constructor() {}

  static getInstance(): InvoiceGenerator {
    if (!InvoiceGenerator.instance) {
      InvoiceGenerator.instance = new InvoiceGenerator()
    }
    return InvoiceGenerator.instance
  }

  private async getCompanySettings(): Promise<any> {
    try {
      const settings = await prisma.systemSetting.findFirst()
      if (settings?.value) {
        const parsedSettings = JSON.parse(settings.value)
        return {
          companyName: parsedSettings.companyName || 'Itineramio',
          companyTaxId: parsedSettings.companyTaxId || '',
          companyEmail: parsedSettings.companyEmail || 'facturacion@itineramio.com',
          companyPhone: parsedSettings.companyPhone || '+34 900 000 000',
          companyAddress: parsedSettings.companyAddress || '',
          companyCity: parsedSettings.companyCity || '',
          companyPostalCode: parsedSettings.companyPostalCode || '',
          companyCountry: parsedSettings.companyCountry || 'España',
          companyWebsite: parsedSettings.companyWebsite || 'https://itineramio.com',
          companyBankAccount: parsedSettings.companyBankAccount || '',
          companyBic: parsedSettings.companyBic || '',
          companyLogoUrl: parsedSettings.companyLogoUrl || '',
          companyAdditionalInfo: parsedSettings.companyAdditionalInfo || ''
        }
      }
    } catch (error) {
      console.error('Error loading company settings:', error)
    }

    // Default settings if none found
    return {
      companyName: 'Itineramio',
      companyTaxId: '',
      companyEmail: 'facturacion@itineramio.com',
      companyPhone: '+34 900 000 000',
      companyAddress: '',
      companyCity: '',
      companyPostalCode: '',
      companyCountry: 'España',
      companyWebsite: 'https://itineramio.com',
      companyBankAccount: '',
      companyBic: '',
      companyLogoUrl: '',
      companyAdditionalInfo: ''
    }
  }

  async getInvoiceData(invoiceId: string): Promise<InvoiceData | null> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              companyName: true,
              billingAddress: true,
              billingCity: true,
              billingCountry: true,
              billingPostalCode: true,
              vatNumber: true
            }
          }
        }
      })

      if (!invoice) {
        return null
      }

      const companySettings = await this.getCompanySettings()

      // Parse properties from notes
      let properties = []
      try {
        if (invoice.notes) {
          const notesData = JSON.parse(invoice.notes)
          properties = notesData.properties || []
        }
      } catch (e) {
        console.error('Error parsing invoice notes:', e)
      }

      return {
        invoice: {
          ...invoice,
          amount: Number(invoice.amount),
          discountAmount: Number(invoice.discountAmount),
          finalAmount: Number(invoice.finalAmount),
          paymentMethod: invoice.paymentMethod || 'TRANSFER',
          notes: invoice.notes || undefined,
          paidDate: invoice.paidDate || undefined
        },
        user: {
          ...invoice.user,
          phone: invoice.user.phone || undefined,
          companyName: invoice.user.companyName || undefined,
          billingAddress: invoice.user.billingAddress || undefined,
          billingCity: invoice.user.billingCity || undefined,
          billingCountry: invoice.user.billingCountry || undefined,
          billingPostalCode: invoice.user.billingPostalCode || undefined,
          vatNumber: invoice.user.vatNumber || undefined
        },
        companySettings,
        properties
      }
    } catch (error) {
      console.error('Error fetching invoice data:', error)
      return null
    }
  }

  generateInvoiceHTML(data: InvoiceData): string {
    const { invoice, user, companySettings, properties = [] } = data
    
    // Calculate months from notes
    let months = 1
    try {
      if (invoice.notes) {
        const notesData = JSON.parse(invoice.notes)
        months = notesData.months || 1
      }
    } catch (e) {
      months = 1
    }

    // Calcular IVA y totales
    const subtotal = Number(invoice.amount)
    const discount = Number(invoice.discountAmount) || 0
    const baseImponible = subtotal - discount
    const iva = baseImponible * 0.21
    const total = baseImponible + iva

    const logoSection = companySettings.companyLogoUrl 
      ? `<img src="${companySettings.companyLogoUrl}" alt="Logo" style="max-height: 48px; max-width: 200px; object-fit: contain;" onerror="this.style.display='none'">`
      : ''

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #222222;
      line-height: 1.4;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 48px 64px;
    }
    
    /* Header estilo Airbnb */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 1px solid #EBEBEB;
    }
    
    .logo-section {
      flex: 1;
    }
    
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #FF385C;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    
    .logo-subtitle {
      font-size: 14px;
      color: #717171;
      font-weight: 400;
    }
    
    .invoice-number-section {
      text-align: right;
      flex: 1;
    }
    
    .invoice-label {
      font-size: 14px;
      color: #717171;
      margin-bottom: 4px;
      font-weight: 400;
    }
    
    .invoice-number {
      font-size: 20px;
      font-weight: 600;
      color: #222222;
      margin-bottom: 16px;
    }
    
    .invoice-date {
      font-size: 14px;
      color: #717171;
      margin-bottom: 2px;
    }
    
    /* Status Badge estilo Airbnb */
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 12px;
    }
    
    .status-pending {
      background: #FFF8E5;
      color: #C13515;
      border: 1px solid #FFE0B2;
    }
    
    .status-paid {
      background: #E8F5E9;
      color: #0B8043;
      border: 1px solid #C8E6C9;
    }
    
    /* Billing sections */
    .billing-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      margin-bottom: 48px;
    }
    
    .billing-block h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #717171;
      margin-bottom: 16px;
    }
    
    .billing-block p {
      font-size: 14px;
      color: #222222;
      margin-bottom: 4px;
      line-height: 1.5;
    }
    
    .billing-block p strong {
      font-weight: 600;
      color: #222222;
    }
    
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      background-color: #fff;
      border: 1px solid #e5e7eb;
    }
    
    .details-table th {
      background-color: #dc2626;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      font-size: 13px;
    }
    
    .details-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    
    .details-table tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    .amount-right {
      text-align: right;
      font-weight: bold;
    }
    
    .totals-section {
      margin-top: 20px;
      text-align: right;
    }
    
    .totals-table {
      display: inline-block;
      border-collapse: collapse;
      margin-left: auto;
    }
    
    .totals-table td {
      padding: 8px 15px;
      border: none;
    }
    
    .totals-table .label {
      text-align: right;
      font-weight: bold;
      color: #374151;
    }
    
    .totals-table .amount {
      text-align: right;
      font-weight: bold;
      min-width: 100px;
    }
    
    .total-final {
      background-color: #dc2626;
      color: white;
      font-size: 16px;
    }
    
    .payment-info {
      background-color: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    
    .payment-info h3 {
      color: #0c4a6e;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .payment-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      font-size: 13px;
    }
    
    .payment-item {
      display: flex;
      justify-content: space-between;
    }
    
    .payment-item strong {
      color: #0c4a6e;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    .status-paid {
      background-color: #d1fae5;
      color: #065f46;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    }
    
    .additional-info {
      background-color: #f9fafb;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
      font-size: 12px;
      color: #4b5563;
    }
    
    @media print {
      .container {
        max-width: none;
        padding: 20px;
      }
      
      .info-section {
        page-break-inside: avoid;
      }
      
      .details-table {
        page-break-inside: auto;
      }
      
      .payment-info {
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
        ${logoSection}
      </div>
      <div class="company-info">
        <div class="company-name">${companySettings.companyName}</div>
        <div class="company-details">
          ${companySettings.companyTaxId ? `NIF/CIF: ${companySettings.companyTaxId}<br>` : ''}
          ${companySettings.companyAddress ? `${companySettings.companyAddress}<br>` : ''}
          ${companySettings.companyPostalCode || companySettings.companyCity ? `${companySettings.companyPostalCode} ${companySettings.companyCity}<br>` : ''}
          ${companySettings.companyCountry}<br>
          ${companySettings.companyEmail}<br>
          ${companySettings.companyPhone}
          ${companySettings.companyWebsite ? `<br>${companySettings.companyWebsite}` : ''}
        </div>
      </div>
    </div>

    <!-- Invoice Title -->
    <div class="invoice-title">
      <h1>FACTURA</h1>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
    </div>

    <!-- Info Section -->
    <div class="info-section">
      <div class="info-block">
        <h3>Facturar a:</h3>
        <div class="info-content">
          <strong>${user.name}</strong><br>
          ${user.companyName ? `${user.companyName}<br>` : ''}
          ${user.vatNumber ? `NIF/CIF: ${user.vatNumber}<br>` : ''}
          ${user.email}<br>
          ${user.phone ? `${user.phone}<br>` : ''}
          ${user.billingAddress ? `${user.billingAddress}<br>` : ''}
          ${user.billingPostalCode || user.billingCity ? `${user.billingPostalCode || ''} ${user.billingCity || ''}<br>` : ''}
          ${user.billingCountry || 'España'}
        </div>
      </div>
      
      <div class="info-block">
        <h3>Datos de la factura:</h3>
        <div class="info-content">
          <strong>Fecha:</strong> ${invoice.createdAt.toLocaleDateString('es-ES')}<br>
          <strong>Vencimiento:</strong> ${invoice.dueDate.toLocaleDateString('es-ES')}<br>
          <strong>Estado:</strong> 
          <span class="status-badge ${invoice.status === 'PAID' ? 'status-paid' : 'status-pending'}">
            ${invoice.status === 'PAID' ? 'Pagado' : 'Pendiente'}
          </span><br>
          ${invoice.paidDate ? `<strong>Fecha de pago:</strong> ${invoice.paidDate.toLocaleDateString('es-ES')}<br>` : ''}
          <strong>Método:</strong> ${invoice.paymentMethod === 'BIZUM' ? 'Bizum' : 'Transferencia'}
        </div>
      </div>
    </div>

    <!-- Details Table -->
    <table class="details-table">
      <thead>
        <tr>
          <th>Concepto</th>
          <th style="text-align: center;">Cantidad</th>
          <th style="text-align: center;">Precio/mes</th>
          <th style="text-align: center;">Meses</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Suscripción Itineramio - Plan Growth</strong><br>
            <small>Propiedades: ${properties.map(p => p.name).join(', ') || 'N/A'}</small>
          </td>
          <td style="text-align: center;">${properties.length || 1}</td>
          <td class="amount-right">€${Number(invoice.amount / (properties.length || 1) / months).toFixed(2)}</td>
          <td style="text-align: center;">${months}</td>
          <td class="amount-right">€${Number(invoice.amount).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals Section -->
    <div class="totals-section">
      <table class="totals-table">
        <tr>
          <td class="label">Subtotal:</td>
          <td class="amount">€${Number(invoice.amount).toFixed(2)}</td>
        </tr>
        ${invoice.discountAmount > 0 ? `
        <tr>
          <td class="label">Descuento:</td>
          <td class="amount" style="color: #dc2626;">-€${Number(invoice.discountAmount).toFixed(2)}</td>
        </tr>` : ''}
        <tr class="total-final">
          <td class="label">TOTAL:</td>
          <td class="amount">€${Number(invoice.finalAmount).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <!-- Payment Info -->
    ${invoice.status !== 'PAID' ? `
    <div class="payment-info">
      <h3>Información de Pago</h3>
      <div class="payment-details">
        ${invoice.paymentMethod === 'BIZUM' ? `
        <div class="payment-item">
          <span>Bizum:</span>
          <strong>+34652656440</strong>
        </div>
        <div class="payment-item">
          <span>Concepto:</span>
          <strong>${invoice.invoiceNumber}</strong>
        </div>
        ` : `
        <div class="payment-item">
          <span>IBAN:</span>
          <strong>${companySettings.companyBankAccount || 'ES82 0182 0304 8102 0158 7248'}</strong>
        </div>
        <div class="payment-item">
          <span>Beneficiario:</span>
          <strong>${companySettings.companyName}</strong>
        </div>
        <div class="payment-item">
          <span>BIC:</span>
          <strong>${companySettings.companyBic || 'BBVAESMM'}</strong>
        </div>
        <div class="payment-item">
          <span>Concepto:</span>
          <strong>${invoice.invoiceNumber}</strong>
        </div>
        `}
      </div>
      <div style="margin-top: 15px; font-weight: bold; color: #0c4a6e;">
        ⚠️ Importante: Incluir el número de factura ${invoice.invoiceNumber} en el concepto del pago
      </div>
    </div>
    ` : ''}

    <!-- Additional Info -->
    ${companySettings.companyAdditionalInfo ? `
    <div class="additional-info">
      ${companySettings.companyAdditionalInfo}
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p>Esta factura ha sido generada automáticamente por el sistema ${companySettings.companyName}.</p>
      <p>Para cualquier consulta, contacta con nosotros en ${companySettings.companyEmail}</p>
      ${companySettings.companyWebsite ? `<p>Visítanos en ${companySettings.companyWebsite}</p>` : ''}
    </div>
  </div>
</body>
</html>
    `
  }

  // Method to generate PDF (would require a PDF library like Puppeteer or similar)
  // For now, we'll return HTML that can be converted to PDF
  async generateInvoicePDF(invoiceId: string): Promise<string | null> {
    const invoiceData = await this.getInvoiceData(invoiceId)
    if (!invoiceData) {
      return null
    }

    return this.generateInvoiceHTML(invoiceData)
  }
}

export const invoiceGenerator = InvoiceGenerator.getInstance()