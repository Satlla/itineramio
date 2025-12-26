import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Actualiza las secuencias de herramientas con horarios escalonados
 * para evitar que lleguen múltiples emails a la misma hora
 */
async function updateToolSequenceHours() {
  console.log('Updating tool sequence hours...\n')

  // Map sequence name to hour for nurturing emails
  const sequenceHours: Record<string, number> = {
    'Tool: Generador de QR': 9,
    'Tool: Calculadora de ROI': 10,
    'Tool: Calculadora de Precios': 11,
    'Tool: Checklist de Limpieza': 13,
    'tool-house-rules': 15,
    'Tool: Tarjeta WiFi': 17,
    'Onboarding Genérico': 10,
    'Onboarding por Nivel': 10,
    'Post-Test Nurturing': 10
  }

  for (const [sequenceName, hour] of Object.entries(sequenceHours)) {
    const sequence = await prisma.emailSequence.findFirst({
      where: { name: sequenceName },
      include: { steps: true }
    })

    if (!sequence) {
      console.log(`❌ Sequence not found: ${sequenceName}`)
      continue
    }

    console.log(`\n📧 ${sequence.name}`)

    for (const step of sequence.steps) {
      // Day 0 (order 0): Keep immediate for tool delivery emails
      if (step.order === 0 && sequenceName.startsWith('Tool:')) {
        console.log(`  ✓ Step ${step.order}: ${step.name} - IMMEDIATE (delivery)`)
        continue
      }

      // Update sendAtHour for all other emails
      await prisma.emailSequenceStep.update({
        where: { id: step.id },
        data: { sendAtHour: hour }
      })
      console.log(`  ✓ Step ${step.order}: ${step.name} - Set to ${hour}:00`)
    }
  }

  // Update pending scheduled emails with new hours
  console.log('\n\nUpdating pending scheduled emails...')

  const pendingEmails = await prisma.scheduledEmail.findMany({
    where: { status: 'pending' },
    include: {
      step: true,
      enrollment: { include: { sequence: true } }
    }
  })

  let updated = 0
  for (const email of pendingEmails) {
    const sequenceName = email.enrollment?.sequence?.name || ''
    const hour = sequenceHours[sequenceName]

    if (hour !== undefined) {
      // Skip day 0 for tool sequences
      if (email.step?.order === 0 && sequenceName.startsWith('Tool:')) {
        continue
      }

      const newScheduledFor = new Date(email.scheduledFor)
      const currentHour = newScheduledFor.getHours()

      // Only update if hour is different
      if (currentHour !== hour) {
        newScheduledFor.setHours(hour, 0, 0, 0)

        // If new time is in the past, move to next day
        if (newScheduledFor <= new Date()) {
          newScheduledFor.setDate(newScheduledFor.getDate() + 1)
        }

        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: { scheduledFor: newScheduledFor }
        })
        updated++
        console.log(`  Updated: ${email.step?.name} → ${newScheduledFor.toISOString()}`)
      }
    }
  }

  console.log(`\nUpdated ${updated} pending emails with new hours`)

  await prisma.$disconnect()
  console.log('\n✅ Done!')
}

updateToolSequenceHours().catch(console.error)
