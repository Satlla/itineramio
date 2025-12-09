/**
 * Script para poblar la base de datos con secuencias de email base
 *
 * Ejecutar con:
 * DATABASE_URL="..." npx tsx scripts/seed-email-sequences.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding email sequences...')

  // ============================================
  // SECUENCIA 1: Onboarding Genérico (5 emails)
  // ============================================

  const onboardingSequence = await prisma.emailSequence.upsert({
    where: { id: 'onboarding-generic' },
    update: {},
    create: {
      id: 'onboarding-generic',
      name: 'Onboarding Genérico',
      description: 'Secuencia de bienvenida para todos los nuevos subscribers',
      triggerEvent: 'SUBSCRIBER_CREATED',
      targetArchetype: null, // Para todos los arquetipos
      targetSource: null, // Para todas las fuentes
      targetTags: [],
      isActive: true,
      priority: 1
    }
  })

  console.log(`✅ Secuencia creada: ${onboardingSequence.name}`)

  // Emails de la secuencia
  const steps = [
    {
      id: 'onboarding-1-welcome',
      sequenceId: onboardingSequence.id,
      name: 'Email 1: Bienvenida + Entrega de guía',
      subject: '¡Bienvenido a Itineramio! 🎉 Aquí está tu guía',
      templateName: 'welcome-test.tsx',
      templateData: {},
      delayDays: 0,
      delayHours: 0,
      sendAtHour: null,
      order: 1,
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    },
    {
      id: 'onboarding-2-value',
      sequenceId: onboardingSequence.id,
      name: 'Email 2: Primer valor educativo',
      subject: 'El secreto de los anfitriones que ganan más ⭐',
      templateName: 'onboarding-day1-stats.tsx',
      templateData: {},
      delayDays: 1,
      delayHours: 0,
      sendAtHour: 10, // 10 AM
      order: 2,
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    },
    {
      id: 'onboarding-2.5-personalized',
      sequenceId: onboardingSequence.id,
      name: 'Email 2.5: Contenido personalizado por arquetipo',
      subject: 'Dynamic - set per archetype', // Se establece dinámicamente según arquetipo
      templateName: 'sequence-day2-personalized.tsx',
      templateData: {},
      delayDays: 2,
      delayHours: 0,
      sendAtHour: 10,
      order: 2.5, // Entre día 1 y día 3
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    },
    {
      id: 'onboarding-3-mistakes',
      sequenceId: onboardingSequence.id,
      name: 'Email 3: 3 errores comunes',
      subject: '3 errores que están costando valoraciones negativas',
      templateName: 'sequence-day3-mistakes.tsx',
      templateData: {},
      delayDays: 3,
      delayHours: 0,
      sendAtHour: 10,
      order: 3,
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    },
    {
      id: 'onboarding-4-case-study',
      sequenceId: onboardingSequence.id,
      name: 'Email 4: Caso de estudio',
      subject: 'Cómo Laura pasó de 4.2⭐ a 4.9⭐ en 60 días',
      templateName: 'sequence-day7-case-study.tsx',
      templateData: {},
      delayDays: 7,
      delayHours: 0,
      sendAtHour: 10,
      order: 4,
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    },
    {
      id: 'onboarding-5-trial',
      sequenceId: onboardingSequence.id,
      name: 'Email 5: Invitación trial',
      subject: '15 días gratis para probar Itineramio 🚀',
      templateName: 'sequence-day10-trial.tsx',
      templateData: {},
      delayDays: 10,
      delayHours: 0,
      sendAtHour: 10,
      order: 5,
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    }
  ]

  for (const step of steps) {
    await prisma.emailSequenceStep.upsert({
      where: { id: step.id },
      update: step,
      create: step
    })
    console.log(`  ✅ Step creado: ${step.name}`)
  }

  // ============================================
  // SECUENCIA 2: Nurturing Post-Trial
  // ============================================

  const postTrialSequence = await prisma.emailSequence.upsert({
    where: { id: 'post-trial-nurturing' },
    update: {},
    create: {
      id: 'post-trial-nurturing',
      name: 'Post-Trial Nurturing',
      description: 'Secuencia para usuarios que completaron el trial pero no se convirtieron',
      triggerEvent: 'SUBSCRIBER_CREATED', // Cambiar a trigger específico de trial
      targetArchetype: null,
      targetSource: null,
      targetTags: ['trial_completed'],
      isActive: false, // Desactivada por defecto, activar cuando esté listo
      priority: 2
    }
  })

  console.log(`✅ Secuencia creada: ${postTrialSequence.name}`)

  const postTrialSteps = [
    {
      id: 'post-trial-1-feedback',
      sequenceId: postTrialSequence.id,
      name: 'Email 1: Solicitar feedback',
      subject: '¿Qué te pareció Itineramio? Nos encantaría saberlo',
      templateName: 'welcome-test.tsx', // TODO: Crear template específico
      templateData: {},
      delayDays: 1,
      delayHours: 0,
      sendAtHour: 10,
      order: 1,
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    },
    {
      id: 'post-trial-2-objection',
      sequenceId: postTrialSequence.id,
      name: 'Email 2: Manejar objeciones',
      subject: '¿Tienes dudas sobre Itineramio? Te ayudamos',
      templateName: 'welcome-test.tsx', // TODO: Crear template específico
      templateData: {},
      delayDays: 3,
      delayHours: 0,
      sendAtHour: 10,
      order: 2,
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    },
    {
      id: 'post-trial-3-special-offer',
      sequenceId: postTrialSequence.id,
      name: 'Email 3: Oferta especial',
      subject: 'Última oportunidad: 20% de descuento solo hoy',
      templateName: 'sequence-day14-urgency.tsx',
      templateData: {},
      delayDays: 7,
      delayHours: 0,
      sendAtHour: 10,
      order: 3,
      requiresPreviousOpen: false,
      requiresPreviousClick: false,
      isActive: true
    }
  ]

  for (const step of postTrialSteps) {
    await prisma.emailSequenceStep.upsert({
      where: { id: step.id },
      update: step,
      create: step
    })
    console.log(`  ✅ Step creado: ${step.name}`)
  }

  console.log('\n🎉 Seed completed!')
  console.log('\n📊 Resumen:')
  console.log(`- ${steps.length} steps creados en Onboarding Genérico`)
  console.log(`- ${postTrialSteps.length} steps creados en Post-Trial Nurturing`)
  console.log('\n💡 Próximos pasos:')
  console.log('1. Crear los templates de email faltantes')
  console.log('2. Configurar el cron job en Vercel: vercel.json')
  console.log('3. Configurar webhook de Resend: https://resend.com/webhooks')
  console.log('4. Probar con un subscriber de prueba')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
