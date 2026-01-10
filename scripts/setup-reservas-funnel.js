/**
 * Setup del embudo "Más Reservas"
 *
 * Trigger: TIME_CALCULATOR_COMPLETED (cuando alguien usa la calculadora de tiempo)
 *
 * Secuencia:
 * - Día 0: El error invisible que mata tus reservas
 * - Día 2: Tu perfil oculto de anfitrión (arquetipo + checklist limpieza)
 * - Día 4: De 3.8 a Superhost en 90 días (caso María)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupReservasFunnel() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 CONFIGURANDO EMBUDO "MÁS RESERVAS"');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. Verificar si ya existe la secuencia
    const existing = await prisma.emailSequence.findFirst({
      where: { name: 'Más Reservas' }
    });

    if (existing) {
      console.log('⚠️  La secuencia "Más Reservas" ya existe');
      console.log('   ID:', existing.id);
      console.log('   Estado:', existing.isActive ? 'Activa' : 'Inactiva');

      // Preguntar si quiere recrearla
      console.log('\n   Para recrearla, primero elimina la existente.');
      return;
    }

    // 2. Crear la secuencia
    console.log('📋 Creando secuencia "Más Reservas"...');

    const sequence = await prisma.emailSequence.create({
      data: {
        name: 'Más Reservas',
        description: 'Embudo para leads que quieren conseguir más reservas. Entry point: Calculadora de Tiempo. Focus: experiencia de huésped → reseñas → visibilidad.',
        triggerEvent: 'SUBSCRIBER_CREATED',
        targetSource: 'tool_time-calculator', // Solo para leads de la calculadora de tiempo
        isActive: true,
        priority: 100, // Alta prioridad
        steps: {
          create: [
            {
              name: 'Email 1 - El error invisible',
              order: 0,
              delayDays: 0,
              delayHours: 0,
              sendAtHour: null, // Envío inmediato
              subject: 'El error que el 73% de anfitriones comete (y cómo evitarlo)',
              templateName: 'reservas-day0-error-invisible',
              isActive: true
            },
            {
              name: 'Email 2 - Arquetipo + Checklist',
              order: 1,
              delayDays: 2,
              delayHours: 0,
              sendAtHour: 10, // 10 AM
              subject: 'Descubre qué tipo de anfitrión eres (test de 3 min)',
              templateName: 'reservas-day2-arquetipo-checklist',
              isActive: true
            },
            {
              name: 'Email 3 - Caso María Superhost',
              order: 2,
              delayDays: 4,
              delayHours: 0,
              sendAtHour: 10, // 10 AM
              subject: 'María pasó de 3.8 estrellas a Superhost en 90 días',
              templateName: 'reservas-day4-caso-maria',
              isActive: true
            }
          ]
        }
      },
      include: {
        steps: true
      }
    });

    console.log('✅ Secuencia creada:', sequence.name);
    console.log('   ID:', sequence.id);
    console.log('   Trigger:', sequence.triggerEvent);
    console.log('   Target Source:', sequence.targetSource);
    console.log('   Pasos:', sequence.steps.length);

    console.log('\n📧 Emails de la secuencia:');
    for (const step of sequence.steps) {
      console.log(`   ${step.order}. ${step.name}`);
      console.log(`      Delay: ${step.delayDays}d ${step.delayHours}h`);
      console.log(`      Subject: ${step.subject}`);
      console.log(`      Template: ${step.templateName}`);
      console.log('');
    }

    // 3. Mostrar resumen
    console.log('='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('='.repeat(60));
    console.log(`
Embudo "Más Reservas" configurado correctamente.

Entry Point: Calculadora de Tiempo (/hub/tools/time-calculator)
Target Source: tool_time-calculator

Flujo:
┌─────────────────────────────────────────────────────────┐
│  Usuario usa Calculadora de Tiempo                      │
│              ↓                                          │
│  Se crea EmailSubscriber con source='time_calculator'   │
│              ↓                                          │
│  Se enrolla automáticamente en "Más Reservas"           │
│              ↓                                          │
│  Día 0: Email sobre el error invisible                  │
│              ↓                                          │
│  Día 2: Email con test arquetipo + checklist limpieza   │
│              ↓                                          │
│  Día 4: Email con caso de éxito (María)                 │
└─────────────────────────────────────────────────────────┘

Próximos pasos:
1. Verificar que la API de time-calculator guarde source='time_calculator'
2. Añadir más emails a la secuencia si es necesario (días 7, 10, 14)
3. Crear embudo de limpieza para quienes descarguen el checklist
`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// También mostrar las secuencias activas actuales
async function showActiveSequences() {
  console.log('\n📋 SECUENCIAS ACTIVAS ACTUALES:');
  console.log('-'.repeat(40));

  const sequences = await prisma.emailSequence.findMany({
    where: { isActive: true },
    include: {
      steps: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { priority: 'desc' }
  });

  for (const seq of sequences) {
    console.log(`\n${seq.name} (prioridad: ${seq.priority})`);
    console.log(`   Trigger: ${seq.triggerEvent}`);
    console.log(`   Target: ${seq.targetSource || 'todos'}`);
    console.log(`   Pasos: ${seq.steps.length}`);
  }
}

async function main() {
  await setupReservasFunnel();
  await showActiveSequences();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
