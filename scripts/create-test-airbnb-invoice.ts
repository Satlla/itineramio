import { prisma } from '../src/lib/prisma'
import { invoiceGeneratorAirbnb } from '../src/lib/invoice-generator-airbnb'
import { writeFileSync } from 'fs'

async function createTestInvoice() {
  try {
    // Find an existing user
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('❌ No users found in database')
      return
    }
    
    // Create test invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber: `INV-AIRBNB-${Date.now()}`,
        amount: 15.99,
        discountAmount: 0,
        finalAmount: 15.99,
        status: 'PENDING',
        paymentMethod: 'TRANSFER',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: JSON.stringify({
          months: 1,
          properties: [
            { id: 'prop-1', name: 'Villa Mediterránea', monthlyFee: 15.99 }
          ],
          billingData: {
            name: 'Demo User Airbnb',
            email: 'demo-airbnb@itineramio.com',
            phone: '+34 612 345 678',
            address: 'Calle de Ejemplo 45, 3º B',
            city: 'Madrid',
            country: 'España',
            postalCode: '28004',
            vatNumber: '12345678Z'
          }
        })
      }
    })
    
    console.log(`✅ Test invoice created: ${invoice.id}`)
    console.log(`📄 Invoice number: ${invoice.invoiceNumber}`)
    
    // Generate Airbnb-style invoice preview
    const html = await invoiceGeneratorAirbnb.generateInvoicePDF(invoice.id)
    if (html) {
      writeFileSync('./airbnb-invoice-preview.html', html)
      console.log('✅ Airbnb invoice preview generated: airbnb-invoice-preview.html')
    }
    
    return invoice.id
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createTestInvoice()