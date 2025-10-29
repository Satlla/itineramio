import { prisma } from '../src/lib/prisma'

async function createTestInvoiceWithProperty() {
  try {
    // Find a property to include in the invoice
    const property = await prisma.property.findFirst({
      where: {
        status: { not: 'ACTIVE' }
      },
      include: {
        host: true
      }
    })

    if (!property) {
      console.log('No inactive properties found. Creating a test property...')
      
      // Find a user to be the host
      const user = await prisma.user.findFirst({
        where: { 
          email: { 
            contains: '@' 
          } 
        }
      })
      
      if (!user) {
        console.error('No users found in database')
        return
      }

      // Create a test property
      const testProperty = await prisma.property.create({
        data: {
          hostId: user.id,
          name: 'Test Property for Invoice',
          description: 'Property created for testing invoice payment flow',
          street: 'Calle Test 123',
          city: 'Madrid',
          state: 'Madrid',
          country: 'España',
          postalCode: '28001',
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          maxGuests: 4,
          status: 'PENDING',
          isPublished: false,
          hostContactName: user.name || 'Test Host',
          hostContactPhone: '+34600000000',
          hostContactEmail: user.email || 'test@example.com',
          hostContactLanguage: 'es'
        }
      })

      console.log('Created test property:', testProperty.id)
      
      // Create invoice with this property
      const invoice = await createInvoice(user, testProperty)
      console.log('\n✅ Test invoice created successfully!')
      console.log('Invoice ID:', invoice.id)
      console.log('Invoice Number:', invoice.invoiceNumber)
      console.log('User:', user.email)
      console.log('Property:', testProperty.name)
      console.log('\nUse this invoice ID to test payment confirmation')
      
    } else {
      console.log('Found property:', property.name)
      console.log('Host:', property.host.email)
      
      // Create invoice with existing property
      const invoice = await createInvoice(property.host, property)
      console.log('\n✅ Test invoice created successfully!')
      console.log('Invoice ID:', invoice.id)
      console.log('Invoice Number:', invoice.invoiceNumber)
      console.log('User:', property.host.email)
      console.log('Property:', property.name)
      console.log('\nUse this invoice ID to test payment confirmation')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function createInvoice(user: any, property: any) {
  // Generate invoice number
  const invoiceNumber = `INV-TEST-${Date.now()}`
  
  // Create invoice with property data in notes field (as JSON)
  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      invoiceNumber,
      amount: 299,
      discountAmount: 0,
      finalAmount: 299,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: JSON.stringify({
        properties: [{
          id: property.id,
          name: property.name,
          type: property.type
        }],
        months: 3,
        plan: 'Growth',
        description: 'Test invoice with property for payment confirmation'
      })
    }
  })

  return invoice
}

createTestInvoiceWithProperty()