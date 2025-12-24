/**
 * Script para crear secuencias de email específicas por herramienta
 *
 * Ejecutar con: npx tsx scripts/seed-tool-sequences.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ToolSequenceConfig {
  toolSlug: string
  toolName: string
  description: string
  steps: {
    name: string
    subject: string
    templateName: string
    delayDays: number
    delayHours?: number
  }[]
}

const toolSequences: ToolSequenceConfig[] = [
  {
    toolSlug: 'checklist-limpieza',
    toolName: 'Checklist de Limpieza',
    description: 'Secuencia para usuarios que descargan el checklist de limpieza. Enfocada en operaciones y procesos.',
    steps: [
      {
        name: 'Entrega del recurso',
        subject: '✅ Tu Checklist de Limpieza está listo',
        templateName: 'tool-checklist-day0-delivery',
        delayDays: 0,
        delayHours: 0
      },
      {
        name: 'Errores comunes',
        subject: '3 errores de limpieza que cuestan reseñas (y cómo evitarlos)',
        templateName: 'tool-checklist-day2-mistakes',
        delayDays: 2
      },
      {
        name: 'Recurso complementario',
        subject: '🎁 Protocolo de Inspección Pre-huésped (plantilla)',
        templateName: 'tool-checklist-day4-resource',
        delayDays: 4
      },
      {
        name: 'Invitación al test',
        subject: '¿Qué tipo de anfitrión eres? (90 segundos)',
        templateName: 'tool-checklist-day6-test',
        delayDays: 6
      },
      {
        name: 'Oferta trial',
        subject: 'Automatiza la gestión de tu limpieza',
        templateName: 'tool-checklist-day8-offer',
        delayDays: 8
      }
    ]
  },
  {
    toolSlug: 'calculadora-precios',
    toolName: 'Calculadora de Precios',
    description: 'Secuencia para usuarios de la calculadora de precios. Enfocada en revenue y pricing.',
    steps: [
      {
        name: 'Entrega del análisis',
        subject: '📊 Tu análisis de precios está listo',
        templateName: 'tool-pricing-day0-delivery',
        delayDays: 0,
        delayHours: 0
      },
      {
        name: 'Error pricing',
        subject: 'El error #1 en pricing de Airbnb (y cómo evitarlo)',
        templateName: 'tool-pricing-day2-mistakes',
        delayDays: 2
      },
      {
        name: 'Calendario temporadas',
        subject: '🗓️ Calendario de temporadas y eventos 2025',
        templateName: 'tool-pricing-day4-resource',
        delayDays: 4
      },
      {
        name: 'Invitación al test',
        subject: 'Descubre tu perfil como anfitrión (test rápido)',
        templateName: 'tool-pricing-day6-test',
        delayDays: 6
      },
      {
        name: 'Oferta trial',
        subject: 'Optimiza tu pricing automáticamente',
        templateName: 'tool-pricing-day8-offer',
        delayDays: 8
      }
    ]
  },
  {
    toolSlug: 'wifi-card',
    toolName: 'Tarjeta WiFi',
    description: 'Secuencia para usuarios de la tarjeta WiFi. Enfocada en experiencia del huésped.',
    steps: [
      {
        name: 'Entrega del recurso',
        subject: '📶 Tu Tarjeta WiFi profesional está lista',
        templateName: 'tool-wifi-day0-delivery',
        delayDays: 0,
        delayHours: 0
      },
      {
        name: 'Detalles que importan',
        subject: '5 pequeños detalles que generan reseñas de 5 estrellas',
        templateName: 'tool-wifi-day2-details',
        delayDays: 2
      },
      {
        name: 'Welcome pack',
        subject: '🎁 Template: Welcome Pack que impresiona',
        templateName: 'tool-wifi-day4-resource',
        delayDays: 4
      },
      {
        name: 'Invitación al test',
        subject: '¿Cuál es tu superpoder como anfitrión?',
        templateName: 'tool-wifi-day6-test',
        delayDays: 6
      },
      {
        name: 'Oferta trial',
        subject: 'Automatiza los detalles que enamoran huéspedes',
        templateName: 'tool-wifi-day8-offer',
        delayDays: 8
      }
    ]
  },
  {
    toolSlug: 'qr-generator',
    toolName: 'Generador de QR',
    description: 'Secuencia para usuarios del generador QR. Enfocada en eficiencia y comunicación.',
    steps: [
      {
        name: 'Entrega del recurso',
        subject: '🔲 Tu código QR está listo para usar',
        templateName: 'tool-qr-day0-delivery',
        delayDays: 0,
        delayHours: 0
      },
      {
        name: 'Usos creativos',
        subject: '7 usos creativos de QR codes en tu alojamiento',
        templateName: 'tool-qr-day2-uses',
        delayDays: 2
      },
      {
        name: 'Guía check-in',
        subject: '🎁 Guía de Check-in Digital (template)',
        templateName: 'tool-qr-day4-resource',
        delayDays: 4
      },
      {
        name: 'Invitación al test',
        subject: 'Test: ¿Qué tipo de anfitrión eres?',
        templateName: 'tool-qr-day6-test',
        delayDays: 6
      },
      {
        name: 'Oferta trial',
        subject: 'Digitaliza toda tu operación',
        templateName: 'tool-qr-day8-offer',
        delayDays: 8
      }
    ]
  },
  {
    toolSlug: 'roi-calculator',
    toolName: 'Calculadora de ROI',
    description: 'Secuencia para usuarios de la calculadora de ROI. Enfocada en inversión y rentabilidad.',
    steps: [
      {
        name: 'Entrega del análisis',
        subject: '💰 Tu análisis de rentabilidad está listo',
        templateName: 'tool-roi-day0-delivery',
        delayDays: 0,
        delayHours: 0
      },
      {
        name: 'Maximizar ROI',
        subject: 'Cómo los mejores anfitriones maximizan su ROI',
        templateName: 'tool-roi-day2-maximize',
        delayDays: 2
      },
      {
        name: 'Caso de estudio',
        subject: '📈 Caso: De 12% a 24% de rentabilidad en 6 meses',
        templateName: 'tool-roi-day4-case',
        delayDays: 4
      },
      {
        name: 'Invitación al test',
        subject: 'Descubre tu estilo de gestión (90 seg)',
        templateName: 'tool-roi-day6-test',
        delayDays: 6
      },
      {
        name: 'Oferta trial',
        subject: 'Optimiza tu inversión con datos reales',
        templateName: 'tool-roi-day8-offer',
        delayDays: 8
      }
    ]
  }
]

async function seedToolSequences() {
  console.log('🌱 Iniciando seed de secuencias por herramienta...\n')

  for (const config of toolSequences) {
    console.log(`📧 Procesando: ${config.toolName}`)

    // Check if sequence already exists
    const existing = await prisma.emailSequence.findFirst({
      where: { name: `Tool: ${config.toolName}` }
    })

    if (existing) {
      console.log(`   ⚠️  Ya existe, saltando...\n`)
      continue
    }

    // Create the sequence
    const sequence = await prisma.emailSequence.create({
      data: {
        name: `Tool: ${config.toolName}`,
        description: config.description,
        triggerEvent: 'SUBSCRIBER_CREATED',
        targetSource: `tool_${config.toolSlug}`,
        targetTags: [`tool_${config.toolSlug}`],
        isActive: true,
        priority: 100, // Alta prioridad para secuencias de herramientas
        steps: {
          create: config.steps.map((step, index) => ({
            name: step.name,
            subject: step.subject,
            templateName: step.templateName,
            delayDays: step.delayDays,
            delayHours: step.delayHours || 0,
            sendAtHour: 10, // Enviar a las 10:00 AM
            order: index + 1
          }))
        }
      },
      include: { steps: true }
    })

    console.log(`   ✅ Creada secuencia con ${sequence.steps.length} pasos`)
    console.log(`   📌 targetSource: tool_${config.toolSlug}`)
    console.log(`   📌 targetTags: [tool_${config.toolSlug}]\n`)
  }

  console.log('✨ Seed completado!\n')

  // Mostrar resumen
  const allSequences = await prisma.emailSequence.findMany({
    where: { name: { startsWith: 'Tool:' } },
    include: { steps: true }
  })

  console.log('📋 Secuencias de herramientas activas:')
  console.log('─'.repeat(60))
  for (const seq of allSequences) {
    console.log(`\n${seq.name}`)
    console.log(`   Trigger: ${seq.triggerEvent}`)
    console.log(`   Source: ${seq.targetSource}`)
    console.log(`   Tags: ${seq.targetTags?.join(', ')}`)
    console.log(`   Pasos: ${seq.steps.length}`)
    for (const step of seq.steps.sort((a, b) => a.order - b.order)) {
      console.log(`      ${step.order}. [Día ${step.delayDays}] ${step.name}`)
    }
  }
}

seedToolSequences()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
