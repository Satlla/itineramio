const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixSubscription() {
  try {
    console.log('🔍 Buscando usuario colaboracionesbnb@gmail.co...')

    // Buscar usuario (probando con y sin 'm' en .com)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'colaboracionesbnb@gmail.co' },
          { email: 'colaboracionesbnb@gmail.com' }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true
      }
    })

    if (!user) {
      console.error('❌ Usuario no encontrado')
      return
    }

    console.log('\n✅ Usuario encontrado:')
    console.log('   Email:', user.email)
    console.log('   Nombre:', user.name)
    console.log('   Plan actual:', user.subscription)

    // Buscar TODAS las solicitudes para ver los importes
    console.log('\n🔍 Buscando todas las solicitudes del usuario...')
    const allRequests = await prisma.subscriptionRequest.findMany({
      where: {
        userId: user.id
      },
      include: {
        plan: true
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    console.log('\n📋 Solicitudes encontradas:', allRequests.length)
    allRequests.forEach((req, idx) => {
      console.log(`\n   ${idx + 1}. ID: ${req.id.slice(-8)}`)
      console.log(`      Importe: €${req.totalAmount}`)
      console.log(`      Estado: ${req.status}`)
      console.log(`      Plan: ${req.plan?.name || 'N/A'}`)
      console.log(`      Fecha: ${req.requestedAt.toLocaleDateString()}`)
      if (req.metadata) {
        console.log(`      Metadata:`, JSON.stringify(req.metadata))
      }
    })

    // Buscar solicitud de ~156€ (con tolerancia)
    let request = await prisma.subscriptionRequest.findFirst({
      where: {
        userId: user.id,
        status: 'APPROVED',
        totalAmount: {
          gte: 155,
          lte: 157
        }
      },
      include: {
        plan: true
      },
      orderBy: {
        approvedAt: 'desc'
      }
    })

    if (!request) {
      console.log('\n⚠️  No se encontró solicitud aprobada de ~156€')
      console.log('Mostrando la última solicitud aprobada...')

      request = await prisma.subscriptionRequest.findFirst({
        where: {
          userId: user.id,
          status: 'APPROVED'
        },
        include: {
          plan: true
        },
        orderBy: {
          approvedAt: 'desc'
        }
      })

      if (!request) {
        console.error('❌ No se encontró ninguna solicitud aprobada')
        return
      }

      console.log('\n✅ Usando última solicitud aprobada')
    }

    console.log('\n✅ Solicitud encontrada:')
    console.log('   ID:', request.id)
    console.log('   Importe:', request.totalAmount)
    console.log('   Plan:', request.plan?.name)
    console.log('   Metadata:', JSON.stringify(request.metadata, null, 2))
    console.log('   Admin Notes:', request.adminNotes)

    // Buscar suscripción activa
    console.log('\n🔍 Buscando suscripción activa...')
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!subscription) {
      console.error('❌ No se encontró suscripción activa')
      return
    }

    console.log('\n✅ Suscripción activa encontrada:')
    console.log('   ID:', subscription.id)
    console.log('   Plan:', subscription.plan?.name)
    console.log('   Inicio:', subscription.startDate)
    console.log('   Fin:', subscription.endDate)
    console.log('   Notas:', subscription.notes)

    // Extraer billing period de las notas
    let currentBillingPeriod = 'Desconocido'
    if (subscription.notes) {
      const match = subscription.notes.match(/Período:\s*(Mensual|Semestral|Anual)/i)
      if (match) {
        currentBillingPeriod = match[1]
      }
    }

    console.log('   Período detectado:', currentBillingPeriod)

    // Calcular duración real de la suscripción
    const startDate = new Date(subscription.startDate)
    const endDate = new Date(subscription.endDate)
    const durationDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
    const durationMonths = Math.round(durationDays / 30)

    console.log('   Duración:', durationDays, 'días (~', durationMonths, 'meses)')

    // Determinar si necesita corrección
    const needsCorrection = currentBillingPeriod !== 'Semestral' || durationMonths < 5

    if (!needsCorrection) {
      console.log('\n✅ La suscripción ya está correcta')
      return
    }

    console.log('\n⚠️  CORRECCIÓN NECESARIA:')
    console.log('   - Período actual:', currentBillingPeriod)
    console.log('   - Período correcto: Semestral')
    console.log('   - Duración actual:', durationMonths, 'meses')
    console.log('   - Duración correcta: 6 meses')

    // APLICAR CORRECCIÓN
    console.log('\n🔧 Aplicando corrección...')

    // Calcular nueva fecha de fin (6 meses desde inicio)
    const newEndDate = new Date(startDate)
    newEndDate.setMonth(newEndDate.getMonth() + 6)

    // Actualizar notas para incluir "Período: Semestral"
    const currentNotes = subscription.notes || ''
    let newNotes = currentNotes

    // Si ya tiene "Período: Mensual", reemplazarlo
    if (currentNotes.includes('Período:')) {
      newNotes = currentNotes.replace(/Período:\s*\w+/, 'Período: Semestral')
    } else {
      // Si no tiene período, agregarlo al principio
      newNotes = `Período: Semestral | ${currentNotes}`.trim()
    }

    console.log('\n   Notas antiguas:', currentNotes)
    console.log('   Notas nuevas:', newNotes)
    console.log('   Fecha fin antigua:', subscription.endDate)
    console.log('   Fecha fin nueva:', newEndDate)

    // Confirmar antes de actualizar
    console.log('\n❓ ¿Aplicar esta corrección? (Ejecuta el script con --apply para aplicar)')

    if (process.argv.includes('--apply')) {
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          endDate: newEndDate,
          notes: newNotes
        }
      })

      console.log('\n✅ SUSCRIPCIÓN CORREGIDA EXITOSAMENTE')
      console.log('   - Período actualizado a: Semestral')
      console.log('   - Fecha de fin actualizada a:', newEndDate)
    } else {
      console.log('\n⚠️  NO SE APLICARON CAMBIOS (usa --apply para aplicar)')
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSubscription()
