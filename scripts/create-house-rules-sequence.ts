import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createHouseRulesSequence() {
  console.log('Creating house-rules email sequence...')

  // Check if sequence already exists
  const existing = await prisma.emailSequence.findFirst({
    where: { name: 'tool-house-rules' }
  })

  if (existing) {
    console.log('Sequence already exists, deleting and recreating...')
    // Delete existing steps first
    await prisma.emailSequenceStep.deleteMany({
      where: { sequenceId: existing.id }
    })
    await prisma.emailSequence.delete({
      where: { id: existing.id }
    })
  }

  // Create the sequence
  const sequence = await prisma.emailSequence.create({
    data: {
      name: 'tool-house-rules',
      description: 'Secuencia para usuarios del Generador de Normas del Apartamento',
      triggerEvent: 'SUBSCRIBER_CREATED',
      targetSource: 'tool_house-rules-generator',
      targetTags: ['tool_house-rules-generator'],
      isActive: true,
      priority: 10,
      steps: {
        create: [
          {
            order: 0,
            name: 'Bienvenida + Consejos',
            subject: 'Tus Normas del Apartamento - 3 consejos para que funcionen',
            templateName: 'tool-house-rules-day0-delivery',
            delayDays: 0,
            delayHours: 0,
            sendAtHour: null,
            isActive: true
          },
          {
            order: 1,
            name: '5 Errores que Anulan tus Normas',
            subject: '5 errores que hacen que los huéspedes ignoren tus normas',
            templateName: 'tool-house-rules-day2-mistakes',
            delayDays: 2,
            delayHours: 0,
            sendAtHour: 10,
            isActive: true
          },
          {
            order: 2,
            name: 'Plantilla Pre-Llegada',
            subject: 'Plantilla: Mensaje pre-llegada con tus normas (copia y pega)',
            templateName: 'tool-house-rules-day4-prearrivals',
            delayDays: 2,
            delayHours: 0,
            sendAtHour: 10,
            isActive: true
          },
          {
            order: 3,
            name: 'Qué Hacer ante Incumplimientos',
            subject: 'Huésped incumple una norma: protocolo de 3 pasos',
            templateName: 'tool-house-rules-day6-violations',
            delayDays: 2,
            delayHours: 0,
            sendAtHour: 10,
            isActive: true
          },
          {
            order: 4,
            name: 'CTA Itineramio',
            subject: '¿Y si todo esto fuera automático?',
            templateName: 'tool-house-rules-day8-offer',
            delayDays: 2,
            delayHours: 0,
            sendAtHour: 10,
            isActive: true
          }
        ]
      }
    },
    include: { steps: true }
  })

  console.log('Sequence created successfully!')
  console.log(`ID: ${sequence.id}`)
  console.log(`Name: ${sequence.name}`)
  console.log(`Steps: ${sequence.steps.length}`)
  sequence.steps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step.name} (Day ${step.delayDays * (i + 1)})`)
  })

  await prisma.$disconnect()
}

createHouseRulesSequence().catch(console.error)
