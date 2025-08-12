import { invoiceGeneratorAirbnb } from '../src/lib/invoice-generator-airbnb'
import { writeFileSync } from 'fs'

async function generateInvoicePreview() {
  try {
    console.log('📄 Generando preview de factura...')
    
    const invoiceId = 'cme81rmqh00017c1voih8z5f0'
    const html = await invoiceGeneratorAirbnb.generateInvoicePDF(invoiceId)
    
    if (html) {
      writeFileSync('/Users/alejandrosatlla/Documents/itineramio/factura-preview.html', html)
      console.log('✅ Preview generado en: factura-preview.html')
      console.log('🔍 Abre el archivo en el navegador para ver la factura')
    } else {
      console.log('❌ No se pudo generar la factura')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

generateInvoicePreview()