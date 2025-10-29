import { prisma } from '../src/lib/prisma'

async function testPaymentConfirm() {
  try {
    // Get an invoice to test with
    const invoice = await prisma.invoice.findFirst({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!invoice) {
      console.log('No pending invoices found')
      return
    }

    console.log('Testing with invoice:', invoice.id)
    console.log('Invoice notes:', invoice.notes)
    
    // Parse notes to see properties
    if (invoice.notes) {
      try {
        const notesData = JSON.parse(invoice.notes)
        console.log('Parsed notes:', notesData)
        console.log('Properties in notes:', notesData.properties)
        
        // Check if properties exist
        if (notesData.properties && notesData.properties.length > 0) {
          for (const prop of notesData.properties) {
            const property = await prisma.property.findUnique({
              where: { id: prop.id }
            })
            console.log(`Property ${prop.id}:`, property ? 'Found' : 'NOT FOUND')
            if (property) {
              console.log(`  - Owner: ${property.hostId}`)
              console.log(`  - Invoice user: ${invoice.userId}`)
              console.log(`  - Match: ${property.hostId === invoice.userId}`)
            }
          }
        }
      } catch (e) {
        console.error('Error parsing notes:', e)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPaymentConfirm()