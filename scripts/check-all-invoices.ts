import { prisma } from '../src/lib/prisma'

async function checkAllInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        userId: true,
        notes: true,
        status: true,
        createdAt: true
      }
    })

    console.log(`Found ${invoices.length} pending invoices\n`)
    
    for (const invoice of invoices) {
      console.log(`Invoice: ${invoice.id}`)
      console.log(`Created: ${invoice.createdAt}`)
      console.log(`Notes: ${invoice.notes}`)
      
      if (invoice.notes) {
        try {
          const parsed = JSON.parse(invoice.notes)
          console.log('✅ Valid JSON:', parsed)
        } catch (e) {
          console.log('❌ Invalid JSON - contains plain text')
        }
      }
      console.log('---')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllInvoices()