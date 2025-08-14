import { prisma } from '../src/lib/prisma'

async function checkInvoiceStatus() {
  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
      }
    })

    console.log('Invoice statuses in database:')
    const statusCounts = {} as Record<string, number>
    
    for (const invoice of invoices) {
      console.log(`- ${invoice.invoiceNumber}: "${invoice.status}"`)
      statusCounts[invoice.status] = (statusCounts[invoice.status] || 0) + 1
    }
    
    console.log('\nStatus summary:')
    for (const [status, count] of Object.entries(statusCounts)) {
      console.log(`  ${status}: ${count} invoices`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkInvoiceStatus()