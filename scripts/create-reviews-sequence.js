const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Creando secuencia de emails para Plantilla Reviews...')

  // Crear la secuencia
  const sequence = await prisma.emailSequence.create({
    data: {
      name: 'Tool: Plantilla Reviews',
      description: 'Secuencia de nurturing para usuarios que descargan la plantilla de reviews/reseñas',
      triggerEvent: 'SUBSCRIBER_CREATED',
      targetSource: 'plantilla-reviews',
      isActive: true,
      priority: 10,
      steps: {
        create: [
          {
            name: 'Entrega de plantilla',
            subject: 'Tu Guía Rápida de Reseñas - Plantilla PRO',
            templateName: 'tool-reviews-day0-delivery',
            delayDays: 0,
            delayHours: 0,
            sendAtHour: null, // Envío inmediato
            order: 1,
            isActive: true
          },
          {
            name: 'Errores que arruinan reseñas',
            subject: '5 errores que están arruinando tus reseñas (y cómo evitarlos)',
            templateName: 'tool-reviews-day2-mistakes',
            delayDays: 2,
            delayHours: 0,
            sendAtHour: 10,
            order: 2,
            isActive: true
          },
          {
            name: 'Caso de éxito',
            subject: 'Cómo María pasó de 4.2 a 4.9 estrellas en 3 meses',
            templateName: 'tool-reviews-day4-case',
            delayDays: 4,
            delayHours: 0,
            sendAtHour: 10,
            order: 3,
            isActive: true
          },
          {
            name: 'Recurso extra - Responder reseñas negativas',
            subject: 'Plantilla GRATIS: Cómo responder a reseñas negativas',
            templateName: 'tool-reviews-day6-negative',
            delayDays: 6,
            delayHours: 0,
            sendAtHour: 10,
            order: 4,
            isActive: true
          },
          {
            name: 'Oferta - Automatiza comunicación',
            subject: 'Automatiza tu comunicación con huéspedes (última oportunidad)',
            templateName: 'tool-reviews-day8-offer',
            delayDays: 8,
            delayHours: 0,
            sendAtHour: 10,
            order: 5,
            isActive: true
          }
        ]
      }
    },
    include: { steps: true }
  })

  console.log('✅ Secuencia creada:', sequence.name)
  console.log('   ID:', sequence.id)
  console.log('   Steps:', sequence.steps.length)
  sequence.steps.forEach(s => {
    console.log(`   - Day ${s.delayDays}: ${s.templateName}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
