/**
 * Script para actualizar la secuencia del Checklist de Limpieza al embudo optimizado de 5 dias
 *
 * ANTES (8 dias):
 * - Day 0: Entrega
 * - Day 2: Errores comunes
 * - Day 4: Protocolo inspeccion
 * - Day 6: Test de perfil
 * - Day 8: Oferta
 *
 * DESPUES (5 dias):
 * - Day 0: Entrega
 * - Day 1: Quick win (3 puntos que mas se olvidan)
 * - Day 3: El problema (huespedes necesitan instrucciones)
 * - Day 4: La solucion (Itineramio)
 * - Day 5: Oferta con urgencia
 *
 * Ejecutar con: npx tsx scripts/update-checklist-sequence.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const newSteps = [
  {
    name: 'Entrega del recurso',
    subject: '✅ Tu Checklist de Limpieza esta listo',
    templateName: 'tool-checklist-day0-delivery',
    delayDays: 0,
    delayHours: 0,
    order: 1
  },
  {
    name: 'Quick win - 3 puntos olvidados',
    subject: 'Los 3 puntos que mas se olvidan (y cuestan resenas)',
    templateName: 'tool-checklist-day1-quickwin',
    delayDays: 1,
    delayHours: 0,
    order: 2
  },
  {
    name: 'El problema real',
    subject: 'El checklist es para ti. Y tus huespedes?',
    templateName: 'tool-checklist-day3-problem',
    delayDays: 3,
    delayHours: 0,
    order: 3
  },
  {
    name: 'La solucion',
    subject: 'Como reducir mensajes de huespedes un 70%',
    templateName: 'tool-checklist-day4-solution',
    delayDays: 4,
    delayHours: 0,
    order: 4
  },
  {
    name: 'Oferta final',
    subject: '15 dias gratis + codigo 20% (ultimo email)',
    templateName: 'tool-checklist-day5-offer',
    delayDays: 5,
    delayHours: 0,
    order: 5
  }
]

async function updateChecklistSequence() {
  console.log('🔄 Actualizando secuencia del Checklist de Limpieza...\n')

  // Find the existing sequence
  const sequence = await prisma.emailSequence.findFirst({
    where: { name: 'Tool: Checklist de Limpieza' },
    include: { steps: true }
  })

  if (!sequence) {
    console.log('❌ No se encontro la secuencia "Tool: Checklist de Limpieza"')
    console.log('   Creando nueva secuencia...\n')

    // Create new sequence
    const newSequence = await prisma.emailSequence.create({
      data: {
        name: 'Tool: Checklist de Limpieza',
        description: 'Embudo optimizado de 5 dias para usuarios que descargan el checklist de limpieza. Conexion clara: checklist (tu equipo) -> manual digital (huespedes).',
        triggerEvent: 'SUBSCRIBER_CREATED',
        targetSource: 'tool_checklist-limpieza',
        targetTags: ['tool_checklist-limpieza'],
        isActive: true,
        priority: 100,
        steps: {
          create: newSteps.map(step => ({
            ...step,
            sendAtHour: 10, // Enviar a las 10:00 AM
            isActive: true
          }))
        }
      },
      include: { steps: true }
    })

    console.log(`✅ Secuencia creada con ${newSequence.steps.length} pasos\n`)
    printSequence(newSequence)
    return
  }

  console.log(`📋 Secuencia encontrada: ${sequence.name}`)
  console.log(`   ID: ${sequence.id}`)
  console.log(`   Pasos actuales: ${sequence.steps.length}`)
  console.log('')

  // Show current steps
  console.log('📧 Pasos actuales (se eliminaran):')
  for (const step of sequence.steps.sort((a, b) => a.order - b.order)) {
    console.log(`   ${step.order}. [Dia ${step.delayDays}] ${step.name}`)
  }
  console.log('')

  // Delete all existing steps
  console.log('🗑️  Eliminando pasos antiguos...')
  await prisma.emailSequenceStep.deleteMany({
    where: { sequenceId: sequence.id }
  })

  // Create new steps
  console.log('➕ Creando nuevos pasos...')
  for (const step of newSteps) {
    await prisma.emailSequenceStep.create({
      data: {
        sequenceId: sequence.id,
        name: step.name,
        subject: step.subject,
        templateName: step.templateName,
        delayDays: step.delayDays,
        delayHours: step.delayHours,
        sendAtHour: 10,
        order: step.order,
        isActive: true
      }
    })
    console.log(`   ✅ ${step.order}. [Dia ${step.delayDays}] ${step.name}`)
  }

  // Update sequence description
  await prisma.emailSequence.update({
    where: { id: sequence.id },
    data: {
      description: 'Embudo optimizado de 5 dias para usuarios que descargan el checklist de limpieza. Conexion clara: checklist (tu equipo) -> manual digital (huespedes).'
    }
  })

  console.log('\n✨ Secuencia actualizada correctamente!\n')

  // Show final state
  const updatedSequence = await prisma.emailSequence.findUnique({
    where: { id: sequence.id },
    include: { steps: true }
  })

  if (updatedSequence) {
    printSequence(updatedSequence)
  }
}

function printSequence(sequence: any) {
  console.log('📋 Estado final de la secuencia:')
  console.log('─'.repeat(60))
  console.log(`Nombre: ${sequence.name}`)
  console.log(`Descripcion: ${sequence.description}`)
  console.log(`Trigger: ${sequence.triggerEvent}`)
  console.log(`Source: ${sequence.targetSource}`)
  console.log(`Activa: ${sequence.isActive ? 'Si' : 'No'}`)
  console.log(`\nPasos (${sequence.steps.length}):`)
  for (const step of sequence.steps.sort((a: any, b: any) => a.order - b.order)) {
    console.log(`   ${step.order}. [Dia ${step.delayDays}] ${step.name}`)
    console.log(`      Subject: ${step.subject}`)
    console.log(`      Template: ${step.templateName}`)
  }
}

updateChecklistSequence()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
