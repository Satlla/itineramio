import { prisma } from './prisma'

// Define types
interface InvoiceData {
  invoice: {
    id: string
    invoiceNumber: string
    amount: number
    discountAmount: number
    finalAmount: number
    status: string
    dueDate: Date
    createdAt: Date
    paidDate?: Date
    paymentMethod?: string
    paymentReference?: string
    notes?: string
    billingData?: any
    description?: string
  }
  user: {
    id: string
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
    companyName?: string
    companyEmail?: string
    companyPhone?: string
    companyAddress?: string
    companyCity?: string
    companyPostalCode?: string
    companyCountry?: string
    companyTaxId?: string
    companyBankAccount?: string
    companyBic?: string
    companyLogoUrl?: string
    companyWebsite?: string
    paymentBizum?: string
  }
  properties?: Array<{
    id: string
    name: string
    monthlyFee: number
  }>
}

export class InvoiceGeneratorAirbnb {
  private static instance: InvoiceGeneratorAirbnb

  private constructor() {}

  static getInstance(): InvoiceGeneratorAirbnb {
    if (!InvoiceGeneratorAirbnb.instance) {
      InvoiceGeneratorAirbnb.instance = new InvoiceGeneratorAirbnb()
    }
    return InvoiceGeneratorAirbnb.instance
  }

  generateInvoiceHTML(data: InvoiceData): string {
    const { invoice, user, companySettings, properties = [] } = data
    
    // Calculate months and get billing data from notes
    let months = 1
    let billingData = null
    try {
      if (invoice.notes) {
        const notesData = JSON.parse(invoice.notes)
        months = notesData.months || 1
        billingData = notesData.billingData || null
      }
    } catch (e) {
      console.error('Error parsing invoice notes:', e)
      months = 1
      billingData = null
    }

    // Calcular IVA y totales
    const subtotal = Number(invoice.amount)
    const discount = Number(invoice.discountAmount) || 0
    const baseImponible = subtotal - discount
    const iva = baseImponible * 0.21
    const total = baseImponible + iva

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${invoice.invoiceNumber} - Itineramio</title>
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
    
    /* Table estilo Airbnb */
    .items-section {
      margin-bottom: 48px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .items-table thead {
      border-bottom: 1px solid #EBEBEB;
    }
    
    .items-table th {
      padding: 16px 0;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #717171;
    }
    
    .items-table th:last-child {
      text-align: right;
    }
    
    .items-table td {
      padding: 24px 0;
      border-bottom: 1px solid #EBEBEB;
      vertical-align: top;
    }
    
    .items-table td:last-child {
      text-align: right;
    }
    
    .item-name {
      font-size: 16px;
      font-weight: 500;
      color: #222222;
      margin-bottom: 4px;
    }
    
    .item-description {
      font-size: 14px;
      color: #717171;
      line-height: 1.4;
    }
    
    .item-price {
      font-size: 16px;
      font-weight: 500;
      color: #222222;
      white-space: nowrap;
    }
    
    /* Totals section estilo Airbnb */
    .totals-section {
      margin-left: auto;
      max-width: 300px;
      margin-bottom: 48px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    
    .total-row.subtotal {
      border-bottom: 1px solid #EBEBEB;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    
    .total-row.final-total {
      border-top: 2px solid #222222;
      padding-top: 16px;
      margin-top: 12px;
      font-size: 18px;
      font-weight: 600;
    }
    
    .total-label {
      color: #717171;
    }
    
    .total-value {
      color: #222222;
      font-weight: 500;
    }
    
    .final-total .total-label,
    .final-total .total-value {
      color: #222222;
    }
    
    /* Payment info estilo Airbnb */
    .payment-section {
      background: #F7F7F7;
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 48px;
    }
    
    .payment-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #222222;
      margin-bottom: 20px;
    }
    
    .payment-methods {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .payment-method {
      background: #FFFFFF;
      border: 1px solid #EBEBEB;
      border-radius: 8px;
      padding: 20px;
    }
    
    .payment-method h4 {
      font-size: 14px;
      font-weight: 600;
      color: #222222;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .payment-method p {
      font-size: 14px;
      color: #222222;
      margin-bottom: 4px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    }
    
    .payment-method .concept {
      font-size: 12px;
      color: #717171;
      margin-top: 8px;
      font-style: italic;
    }
    
    /* Footer estilo Airbnb */
    .footer {
      border-top: 1px solid #EBEBEB;
      padding-top: 32px;
      margin-top: 48px;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 24px;
    }
    
    .footer-block h4 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #717171;
      margin-bottom: 12px;
    }
    
    .footer-block p {
      font-size: 14px;
      color: #222222;
      margin-bottom: 4px;
    }
    
    .footer-note {
      font-size: 12px;
      color: #717171;
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #EBEBEB;
    }
    
    /* Icons */
    .icon {
      width: 16px;
      height: 16px;
      display: inline-block;
      vertical-align: middle;
    }
    
    @media print {
      body {
        background: white;
      }
      .invoice-wrapper {
        padding: 32px;
      }
      .payment-section {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Header estilo Airbnb -->
    <div class="header">
      <div class="logo-section">
        ${companySettings.companyLogoUrl ? `<img src="${companySettings.companyLogoUrl}" alt="Logo" style="max-height: 48px; margin-bottom: 8px;" onerror="this.style.display='none'">` : ''}
        <div class="logo">itineramio</div>
        <div class="logo-subtitle">Simplificando la gestión de tus propiedades</div>
      </div>
      <div class="invoice-number-section">
        <div class="invoice-label">Factura</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
        <div class="invoice-date">${new Date(invoice.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status === 'PAID' ? 'Pagada' : 'Pendiente de pago'}</div>
      </div>
    </div>
    
    <!-- Billing Information -->
    <div class="billing-sections">
      <div class="billing-block">
        <h3>Facturado a</h3>
        <p><strong>${billingData?.name || user.name}</strong></p>
        ${billingData?.companyName ? `<p>${billingData.companyName}</p>` : ''}
        ${billingData?.vatNumber ? `<p>NIF/CIF: ${billingData.vatNumber}</p>` : ''}
        <p>${billingData?.address || user.billingAddress || ''}</p>
        <p>${billingData?.postalCode || user.billingPostalCode || ''} ${billingData?.city || user.billingCity || ''}</p>
        <p>${billingData?.country || user.billingCountry || 'España'}</p>
        <p>${billingData?.email || user.email}</p>
        ${billingData?.phone || user.phone ? `<p>${billingData?.phone || user.phone}</p>` : ''}
      </div>
      
      <div class="billing-block">
        <h3>Emisor</h3>
        <p><strong>${companySettings.companyName || 'Itineramio SL'}</strong></p>
        ${companySettings.companyTaxId ? `<p>CIF: ${companySettings.companyTaxId}</p>` : '<p>CIF: B12345678</p>'}
        <p>${companySettings.companyAddress || 'Calle Ejemplo 123'}</p>
        <p>${companySettings.companyPostalCode || '28001'} ${companySettings.companyCity || 'Madrid'}</p>
        <p>${companySettings.companyCountry || 'España'}</p>
        <p>${companySettings.companyEmail || 'hola@itineramio.com'}</p>
        ${companySettings.companyPhone ? `<p>${companySettings.companyPhone}</p>` : ''}
      </div>
    </div>
    
    <!-- Items Table -->
    <div class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th>Servicio</th>
            <th style="text-align: right;">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${properties.length > 0 ? properties.map(prop => `
            <tr>
              <td>
                <div class="item-name">Plan Growth - ${prop.name}</div>
                <div class="item-description">Gestión mensual de propiedad con acceso completo a todas las funcionalidades de Itineramio</div>
              </td>
              <td>
                <div class="item-price">€${Number(prop.monthlyFee).toFixed(2)}</div>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td>
                <div class="item-name">${invoice.description || 'Plan Growth - Gestión de Propiedades'}</div>
                <div class="item-description">Servicio mensual con acceso completo a la plataforma Itineramio. Incluye todas las funcionalidades para gestionar tu propiedad.</div>
              </td>
              <td>
                <div class="item-price">€${Number(subtotal).toFixed(2)}</div>
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
    
    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row subtotal">
        <span class="total-label">Subtotal</span>
        <span class="total-value">€${Number(subtotal).toFixed(2)}</span>
      </div>
      ${discount > 0 ? `
      <div class="total-row">
        <span class="total-label">Descuento</span>
        <span class="total-value">-€${Number(discount).toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row">
        <span class="total-label">Base imponible</span>
        <span class="total-value">€${Number(baseImponible).toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span class="total-label">IVA (21%)</span>
        <span class="total-value">€${Number(iva).toFixed(2)}</span>
      </div>
      <div class="total-row final-total">
        <span class="total-label">Total</span>
        <span class="total-value">€${Number(total).toFixed(2)}</span>
      </div>
    </div>
    
    ${invoice.status === 'PENDING' ? `
    <!-- Payment Information -->
    <div class="payment-section">
      <h3>Información de pago</h3>
      <div class="payment-methods">
        <div class="payment-method">
          <h4>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Bizum
          </h4>
          <p>${companySettings.paymentBizum || '+34 652 656 440'}</p>
          <p class="concept">Concepto: ${invoice.invoiceNumber}</p>
        </div>
        
        <div class="payment-method">
          <h4>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            Transferencia bancaria
          </h4>
          <p>${companySettings.companyBankAccount || 'ES82 0182 0304 8102 0158 7248'}</p>
          ${companySettings.companyBic ? `<p>BIC: ${companySettings.companyBic}</p>` : ''}
          <p class="concept">Concepto: ${invoice.invoiceNumber}</p>
        </div>
      </div>
    </div>
    ` : ''}
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-block">
          <h4>Datos fiscales</h4>
          <p>${companySettings.companyName || 'Itineramio SL'}</p>
          <p>CIF: ${companySettings.companyTaxId || 'B12345678'}</p>
          <p>${companySettings.companyAddress || 'Calle Ejemplo 123'}</p>
          <p>${companySettings.companyPostalCode || '28001'} ${companySettings.companyCity || 'Madrid'}, ${companySettings.companyCountry || 'España'}</p>
        </div>
        <div class="footer-block">
          <h4>Información de factura</h4>
          <p>Fecha de emisión: ${new Date(invoice.createdAt).toLocaleDateString('es-ES')}</p>
          <p>Fecha de vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}</p>
          ${invoice.paidDate ? `<p>Fecha de pago: ${new Date(invoice.paidDate).toLocaleDateString('es-ES')}</p>` : ''}
          ${invoice.paymentMethod ? `<p>Método de pago: ${invoice.paymentMethod}</p>` : ''}
        </div>
      </div>
      <div class="footer-note">
        Esta factura se ha generado electrónicamente y es válida sin firma según el artículo 6 del RD 1619/2012
      </div>
    </div>
  </div>
</body>
</html>
    `
  }

  async getInvoiceData(invoiceId: string): Promise<InvoiceData | null> {
    try {
      // Fetch invoice with related data
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          user: true,
          subscription: {
            include: {
              plan: true,
              customPlan: true
            }
          }
        }
      })

      if (!invoice) {
        console.error('Invoice not found:', invoiceId)
        return null
      }

      // Get company settings
      const systemSetting = await prisma.systemSetting.findFirst({
        where: { key: 'company_info' }
      })

      let companySettings = {
        companyName: 'Itineramio SL',
        companyEmail: 'hola@itineramio.com',
        companyPhone: '',
        companyAddress: 'Calle Ejemplo 123',
        companyCity: 'Madrid',
        companyPostalCode: '28001',
        companyCountry: 'España',
        companyTaxId: 'B12345678',
        companyBankAccount: 'ES82 0182 0304 8102 0158 7248',
        companyBic: '',
        companyLogoUrl: '',
        companyWebsite: 'https://itineramio.com',
        paymentBizum: '+34652656440'
      }

      if (systemSetting && systemSetting.value) {
        try {
          const settings = JSON.parse(systemSetting.value as string)
          companySettings = { ...companySettings, ...settings }
        } catch (error) {
          console.error('Error parsing company settings:', error)
        }
      }

      // Parse properties from notes if available
      let properties: Array<{ id: string; name: string; monthlyFee: number }> = []
      try {
        if (invoice.notes) {
          const notesData = JSON.parse(invoice.notes)
          if (notesData.properties) {
            properties = notesData.properties
          }
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
          paymentMethod: invoice.paymentMethod || undefined,
          paymentReference: invoice.paymentReference || undefined,
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

  async generateInvoicePDF(invoiceId: string): Promise<string | null> {
    const invoiceData = await this.getInvoiceData(invoiceId)
    if (!invoiceData) {
      return null
    }

    return this.generateInvoiceHTML(invoiceData)
  }
}

export const invoiceGeneratorAirbnb = InvoiceGeneratorAirbnb.getInstance()