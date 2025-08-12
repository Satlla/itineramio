import { prisma } from '../src/lib/prisma'

async function createTestInvoice() {
  try {
    console.log('🔍 Verificando usuarios existentes...')
    
    // Verificar usuarios existentes
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      },
      take: 5
    })
    
    console.log('👥 Usuarios encontrados:', existingUsers.length)
    existingUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`)
    })
    
    if (existingUsers.length === 0) {
      console.log('⚠️ No hay usuarios. Creando usuario de prueba...')
      
      // Crear usuario de prueba
      const testUser = await prisma.user.create({
        data: {
          email: 'test.factura@itineramio.com',
          name: 'Usuario Prueba Factura',
          phone: '+34612345678',
          isVerified: true,
          emailVerified: new Date()
        }
      })
      
      console.log('✅ Usuario de prueba creado:', testUser.id)
      existingUsers.push(testUser)
    }
    
    const targetUser = existingUsers[0]
    console.log(`🎯 Usando usuario: ${targetUser.name} (${targetUser.id})`)
    
    // Verificar si el usuario ya tiene una propiedad
    let userProperty = await prisma.property.findFirst({
      where: { hostId: targetUser.id }
    })
    
    if (!userProperty) {
      console.log('🏠 Creando propiedad de prueba...')
      userProperty = await prisma.property.create({
        data: {
          hostId: targetUser.id,
          name: 'Apartamento de Prueba Facturación',
          description: 'Propiedad creada para testing de facturas',
          street: 'Calle Prueba 123',
          city: 'Madrid',
          state: 'Madrid',
          country: 'España',
          postalCode: '28001',
          type: 'APARTMENT',
          bedrooms: 2,
          bathrooms: 1,
          maxGuests: 4,
          hostContactName: targetUser.name,
          hostContactPhone: targetUser.phone || '+34612345678',
          hostContactEmail: targetUser.email,
          status: 'DRAFT',
          slug: `apartamento-prueba-${Date.now()}`
        }
      })
      console.log('✅ Propiedad creada:', userProperty.id)
    }
    
    // Verificar facturas existentes
    const existingInvoices = await prisma.invoice.findMany({
      where: { userId: targetUser.id },
      take: 3
    })
    
    console.log(`📄 Facturas existentes para ${targetUser.name}: ${existingInvoices.length}`)
    
    if (existingInvoices.length === 0) {
      console.log('💰 Creando factura de prueba...')
      
      // Crear factura de prueba
      const testInvoice = await prisma.invoice.create({
        data: {
          userId: targetUser.id,
          invoiceNumber: `INV-${Date.now()}`,
          amount: 2.50,
          discountAmount: 0,
          finalAmount: 2.50,
          status: 'PENDING',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          notes: 'Factura de prueba - Plan Growth - Apartamento de Prueba Facturación'
        }
      })
      
      console.log('✅ Factura de prueba creada!')
      console.log(`📄 Número de factura: ${testInvoice.invoiceNumber}`)
      console.log(`💶 Importe: €${testInvoice.finalAmount}`)
      console.log(`🔗 ID: ${testInvoice.id}`)
      console.log(`👤 Usuario: ${targetUser.name} (${targetUser.email})`)
      
      // Crear notificación para el usuario
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          type: 'INVOICE_CREATED',
          title: 'Nueva factura generada',
          message: `Se ha generado la factura ${testInvoice.invoiceNumber} por €${testInvoice.finalAmount}`,
          data: {
            invoiceId: testInvoice.id,
            invoiceNumber: testInvoice.invoiceNumber,
            amount: testInvoice.finalAmount
          }
        }
      })
      
      return {
        invoice: testInvoice,
        user: targetUser,
        property: userProperty
      }
    } else {
      console.log('ℹ️ Ya existen facturas para este usuario')
      return {
        invoice: existingInvoices[0],
        user: targetUser,
        property: userProperty
      }
    }
    
  } catch (error) {
    console.error('❌ Error creando factura de prueba:', error)
    throw error
  }
}

createTestInvoice()
  .then((result) => {
    console.log('\n🎉 ¡Datos de prueba creados exitosamente!')
    console.log('\n📋 RESUMEN:')
    console.log(`👤 Usuario: ${result.user.name}`)
    console.log(`📧 Email: ${result.user.email}`)
    console.log(`📄 Factura: ${result.invoice.invoiceNumber}`)
    console.log(`💰 Importe: €${result.invoice.finalAmount}`)
    console.log(`🏠 Propiedad: ${result.property.name}`)
    console.log(`\n🔗 URLs útiles:`)
    console.log(`📊 Admin Pagos: https://www.itineramio.com/admin/payments`)
    console.log(`👥 Admin Usuarios: https://www.itineramio.com/admin/users`)
    console.log(`📄 Ver Factura: https://www.itineramio.com/api/invoices/${result.invoice.id}/view`)
    
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error:', error)
    process.exit(1)
  })