import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating test invoice...')

  // Find a user
  const user = await prisma.user.findFirst({
    where: { email: 'vedako2008@hosintoy.com' }
  })

  if (!user) {
    console.error('User not found')
    return
  }

  // Create a test invoice
  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      invoiceNumber: `INV-TEST-${Date.now()}`,
      amount: 100,
      discountAmount: 0,
      finalAmount: 100,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: JSON.stringify({
        properties: [{ id: 'test-prop-1', name: 'Test Property' }],
        months: 1
      })
    }
  })

  console.log('Created test invoice:', invoice.id)
  console.log('Invoice number:', invoice.invoiceNumber)
  console.log('Status:', invoice.status)
  console.log('Amount:', invoice.finalAmount)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })