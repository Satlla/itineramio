/**
 * Script para crear la secuencia de nurturing para leads de la Academia
 * y conectar los QuizLead existentes con el sistema de email sequences
 *
 * Ejecutar con: DATABASE_URL="..." node scripts/setup-academia-sequence.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const academiaSequenceConfig = {
  name: 'Academia: Quiz Completado',
  description: 'Secuencia de nurturing para leads que completan el quiz de la academia. Enfocada en educación y conversión a cursos.',
  triggerEvent: 'QUIZ_COMPLETED',
  targetSource: 'academia-quiz',
  targetTags: ['academia', 'quiz_completed'],
  priority: 50,
  steps: [
    {
      name: 'Bienvenida + Resultados del Quiz',
      subject: '🎓 Tu perfil de anfitrión y recursos personalizados',
      templateName: 'academia-quiz-day0-results',
      delayDays: 0,
      delayHours: 0,
      order: 1
    },
    {
      name: 'Primer consejo según nivel',
      subject: 'El error más común de los anfitriones de tu nivel',
      templateName: 'academia-quiz-day2-tip',
      delayDays: 2,
      delayHours: 0,
      order: 2
    },
    {
      name: 'Recurso educativo gratuito',
      subject: '🎁 Mini-guía: Mejora tu gestión en 7 días',
      templateName: 'academia-quiz-day4-resource',
      delayDays: 4,
      delayHours: 0,
      order: 3
    },
    {
      name: 'Caso de éxito de la academia',
      subject: 'De principiante a Superhost en 3 meses (historia real)',
      templateName: 'academia-quiz-day7-case',
      delayDays: 7,
      delayHours: 0,
      order: 4
    },
    {
      name: 'Invitación a la Academia',
      subject: '¿Listo para dar el siguiente paso?',
      templateName: 'academia-quiz-day10-invite',
      delayDays: 10,
      delayHours: 0,
      order: 5
    },
    {
      name: 'Oferta especial Academia',
      subject: '🎓 Acceso especial a la Academia (solo hoy)',
      templateName: 'academia-quiz-day14-offer',
      delayDays: 14,
      delayHours: 0,
      order: 6
    }
  ]
};

async function setupAcademiaSequence() {
  console.log('\n========================================');
  console.log('🎓 CONFIGURACIÓN DE SECUENCIA ACADEMIA');
  console.log('========================================\n');

  // 1. Verificar si la secuencia ya existe
  console.log('1️⃣ Verificando secuencia existente...');

  let sequence = await prisma.emailSequence.findFirst({
    where: {
      OR: [
        { name: academiaSequenceConfig.name },
        { triggerEvent: 'QUIZ_COMPLETED' }
      ]
    },
    include: { steps: true }
  });

  if (sequence) {
    console.log(`   ⚠️  Ya existe una secuencia para QUIZ_COMPLETED: "${sequence.name}"`);
    console.log(`   Pasos configurados: ${sequence.steps.length}`);
  } else {
    console.log('   ℹ️  No existe secuencia para QUIZ_COMPLETED, creando...');

    sequence = await prisma.emailSequence.create({
      data: {
        name: academiaSequenceConfig.name,
        description: academiaSequenceConfig.description,
        triggerEvent: academiaSequenceConfig.triggerEvent,
        targetSource: academiaSequenceConfig.targetSource,
        targetTags: academiaSequenceConfig.targetTags,
        priority: academiaSequenceConfig.priority,
        isActive: true,
        steps: {
          create: academiaSequenceConfig.steps
        }
      },
      include: { steps: true }
    });

    console.log(`   ✅ Secuencia creada: "${sequence.name}"`);
    console.log(`   📧 ${sequence.steps.length} pasos configurados:`);
    for (const step of sequence.steps.sort((a, b) => a.order - b.order)) {
      console.log(`      ${step.order}. [Día ${step.delayDays}] ${step.name}`);
    }
  }

  // 2. Obtener todos los QuizLead que no están conectados a EmailSubscriber
  console.log('\n2️⃣ Analizando QuizLeads sin EmailSubscriber...');

  const quizLeads = await prisma.quizLead.findMany({
    orderBy: { completedAt: 'desc' }
  });

  console.log(`   Total QuizLeads: ${quizLeads.length}`);

  let createdSubscribers = 0;
  let alreadyExists = 0;
  let enrolledCount = 0;

  for (const lead of quizLeads) {
    // Verificar si ya existe como EmailSubscriber
    let subscriber = await prisma.emailSubscriber.findUnique({
      where: { email: lead.email.toLowerCase() }
    });

    if (subscriber) {
      alreadyExists++;
      console.log(`   📧 ${lead.email} - Ya existe como subscriber`);
    } else {
      // Crear EmailSubscriber
      subscriber = await prisma.emailSubscriber.create({
        data: {
          email: lead.email.toLowerCase(),
          name: lead.name || null,
          source: 'academia-quiz',
          archetype: null,
          nivel: lead.level,
          tags: ['academia', 'quiz_completed'],
          status: 'active',
          sourceMetadata: {
            quizLeadId: lead.id,
            quizCompletedAt: lead.completedAt,
            quizLevel: lead.level,
            marketingConsent: lead.marketingConsent
          }
        }
      });
      createdSubscribers++;
      console.log(`   ✅ ${lead.email} - Subscriber creado`);
    }

    // 3. Verificar si ya está inscrito en la secuencia
    const existingEnrollment = await prisma.sequenceEnrollment.findFirst({
      where: {
        subscriberId: subscriber.id,
        sequenceId: sequence.id
      }
    });

    if (!existingEnrollment) {
      // Inscribir en la secuencia
      await prisma.sequenceEnrollment.create({
        data: {
          subscriberId: subscriber.id,
          sequenceId: sequence.id,
          status: 'active',
          currentStepOrder: 1,
          metadata: {
            source: 'academia-quiz',
            level: lead.level,
            enrolledVia: 'setup-script'
          }
        }
      });
      enrolledCount++;
      console.log(`   📋 ${lead.email} - Inscrito en secuencia`);

      // Actualizar contador de la secuencia
      await prisma.emailSequence.update({
        where: { id: sequence.id },
        data: {
          subscribersEnrolled: { increment: 1 },
          subscribersActive: { increment: 1 }
        }
      });
    }
  }

  // 4. Resumen
  console.log('\n========================================');
  console.log('📊 RESUMEN');
  console.log('========================================');
  console.log(`QuizLeads procesados: ${quizLeads.length}`);
  console.log(`Subscribers existentes: ${alreadyExists}`);
  console.log(`Subscribers creados: ${createdSubscribers}`);
  console.log(`Inscritos en secuencia: ${enrolledCount}`);

  // 5. Mostrar estado actual de la secuencia
  const updatedSequence = await prisma.emailSequence.findUnique({
    where: { id: sequence.id },
    include: { steps: true, enrollments: true }
  });

  console.log('\n📧 Estado de la secuencia:');
  console.log(`   Nombre: ${updatedSequence.name}`);
  console.log(`   Trigger: ${updatedSequence.triggerEvent}`);
  console.log(`   Activa: ${updatedSequence.isActive ? '✅' : '❌'}`);
  console.log(`   Inscritos: ${updatedSequence.subscribersEnrolled}`);
  console.log(`   Activos: ${updatedSequence.subscribersActive}`);
  console.log(`   Enrollments: ${updatedSequence.enrollments.length}`);

  console.log('\n✨ Configuración completada!\n');
}

setupAcademiaSequence()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
