const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeFunnels() {
  console.log('\n========================================');
  console.log('📊 ANÁLISIS COMPLETO DE EMBUDOS Y SECUENCIAS');
  console.log('========================================\n');

  // 1. Analizar todas las secuencias de email
  console.log('📧 SECUENCIAS DE EMAIL:');
  console.log('------------------------');

  const sequences = await prisma.emailSequence.findMany({
    include: {
      steps: {
        orderBy: { order: 'asc' }
      },
      _count: {
        select: {
          enrollments: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (sequences.length === 0) {
    console.log('⚠️ No hay secuencias de email configuradas\n');
  } else {
    for (const seq of sequences) {
      console.log(`\n📌 ${seq.name}`);
      console.log(`   ID: ${seq.id}`);
      console.log(`   Trigger: ${seq.triggerEvent}`);
      console.log(`   Activa: ${seq.isActive ? '✅' : '❌'}`);
      console.log(`   Target Archetype: ${seq.targetArchetype || 'Todos'}`);
      console.log(`   Target Source: ${seq.targetSource || 'Todos'}`);
      console.log(`   Target Tags: ${seq.targetTags?.length > 0 ? seq.targetTags.join(', ') : 'Ninguno'}`);
      console.log(`   Prioridad: ${seq.priority}`);
      console.log(`   Inscritos: ${seq.subscribersEnrolled}`);
      console.log(`   Activos: ${seq.subscribersActive}`);
      console.log(`   Completados: ${seq.subscribersCompleted}`);
      console.log(`   Pasos: ${seq.steps.length}`);

      if (seq.steps.length > 0) {
        console.log('\n   📝 Pasos de la secuencia:');
        for (const step of seq.steps) {
          console.log(`      ${step.order}. ${step.name}`);
          console.log(`         Template: ${step.templateName}`);
          console.log(`         Delay: ${step.delayDays}d ${step.delayHours}h`);
          console.log(`         Enviados: ${step.emailsSent} | Opens: ${step.emailsOpened} | Clicks: ${step.emailsClicked}`);
        }
      }
    }
  }

  // 2. Analizar subscribers
  console.log('\n\n📬 SUBSCRIBERS DE EMAIL:');
  console.log('------------------------');

  const subscriberStats = await prisma.emailSubscriber.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  console.log('Por estado:');
  for (const stat of subscriberStats) {
    console.log(`   ${stat.status}: ${stat._count.id}`);
  }

  const subscribersBySource = await prisma.emailSubscriber.groupBy({
    by: ['source'],
    _count: { id: true }
  });

  console.log('\nPor fuente:');
  for (const stat of subscribersBySource) {
    console.log(`   ${stat.source || 'desconocido'}: ${stat._count.id}`);
  }

  const subscribersByArchetype = await prisma.emailSubscriber.groupBy({
    by: ['archetype'],
    _count: { id: true }
  });

  console.log('\nPor arquetipo:');
  for (const stat of subscribersByArchetype) {
    console.log(`   ${stat.archetype || 'sin arquetipo'}: ${stat._count.id}`);
  }

  // 3. Analizar enrollments
  console.log('\n\n📋 ENROLLMENTS (Inscripciones):');
  console.log('--------------------------------');

  const enrollmentStats = await prisma.sequenceEnrollment.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  for (const stat of enrollmentStats) {
    console.log(`   ${stat.status}: ${stat._count.id}`);
  }

  // 4. Analizar emails programados
  console.log('\n\n📤 EMAILS PROGRAMADOS:');
  console.log('----------------------');

  const emailStats = await prisma.scheduledEmail.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  for (const stat of emailStats) {
    console.log(`   ${stat.status}: ${stat._count.id}`);
  }

  // 5. Analizar Quiz Leads (Academia)
  console.log('\n\n🎓 QUIZ LEADS (ACADEMIA):');
  console.log('-------------------------');

  const quizLeads = await prisma.quizLead.findMany({
    orderBy: { completedAt: 'desc' },
    take: 10
  });

  const quizLeadCount = await prisma.quizLead.count();
  const convertedCount = await prisma.quizLead.count({ where: { converted: true } });
  const verifiedCount = await prisma.quizLead.count({ where: { emailVerified: true } });

  console.log(`Total leads: ${quizLeadCount}`);
  console.log(`Convertidos: ${convertedCount}`);
  console.log(`Email verificado: ${verifiedCount}`);

  const levelStats = await prisma.quizLead.groupBy({
    by: ['level'],
    _count: { id: true }
  });

  console.log('\nPor nivel:');
  for (const stat of levelStats) {
    console.log(`   ${stat.level}: ${stat._count.id}`);
  }

  // 6. Verificar si hay conexión entre QuizLead y EmailSubscriber
  console.log('\n\n🔗 CONEXIÓN QUIZ LEAD → EMAIL SUBSCRIBER:');
  console.log('------------------------------------------');

  // Buscar quiz leads que también son email subscribers
  const quizEmails = await prisma.quizLead.findMany({
    select: { email: true }
  });

  const quizEmailSet = new Set(quizEmails.map(q => q.email.toLowerCase()));

  const subscribersWithQuiz = await prisma.emailSubscriber.findMany({
    where: {
      email: {
        in: Array.from(quizEmailSet)
      }
    }
  });

  console.log(`Quiz leads con email subscriber: ${subscribersWithQuiz.length} de ${quizEmailSet.size}`);

  if (subscribersWithQuiz.length === 0 && quizEmailSet.size > 0) {
    console.log('⚠️ Los quiz leads NO están conectados al sistema de email sequences');
    console.log('   Se necesita crear un proceso para inscribirlos automáticamente');
  }

  // 7. Analizar Lead Magnets / Tools
  console.log('\n\n🧲 LEAD MAGNETS / TOOLS:');
  console.log('------------------------');

  // Check ToolDownload table if exists
  try {
    const toolDownloads = await prisma.toolDownload.groupBy({
      by: ['toolType'],
      _count: { id: true }
    });

    console.log('Descargas por herramienta:');
    for (const stat of toolDownloads) {
      console.log(`   ${stat.toolType}: ${stat._count.id}`);
    }
  } catch (e) {
    console.log('Tabla ToolDownload no encontrada o vacía');
  }

  // 8. Resumen y recomendaciones
  console.log('\n\n📊 RESUMEN Y RECOMENDACIONES:');
  console.log('==============================');

  console.log('\n🔴 PROBLEMAS DETECTADOS:');

  if (quizLeadCount > 0 && subscribersWithQuiz.length === 0) {
    console.log('   1. Quiz Leads no conectados a secuencias de email');
    console.log('      → Solución: Crear EmailSubscriber cuando completan quiz');
    console.log('      → Inscribir en secuencia con trigger QUIZ_COMPLETED');
  }

  const activeSequences = sequences.filter(s => s.isActive);
  const quizSequence = sequences.find(s => s.triggerEvent === 'QUIZ_COMPLETED');

  if (!quizSequence) {
    console.log('   2. No existe secuencia para QUIZ_COMPLETED');
    console.log('      → Solución: Crear secuencia de nurturing para academia');
  }

  console.log('\n✅ TRIGGERS CONFIGURADOS:');
  const configuredTriggers = [...new Set(sequences.map(s => s.triggerEvent))];
  for (const trigger of configuredTriggers) {
    const count = sequences.filter(s => s.triggerEvent === trigger).length;
    console.log(`   ${trigger}: ${count} secuencia(s)`);
  }

  const missingTriggers = ['QUIZ_COMPLETED', 'COURSE_ENROLLED'].filter(t => !configuredTriggers.includes(t));
  if (missingTriggers.length > 0) {
    console.log('\n⚠️ TRIGGERS SIN SECUENCIA:');
    for (const trigger of missingTriggers) {
      console.log(`   ${trigger}`);
    }
  }

  console.log('\n========================================\n');

  // 9. ANÁLISIS PROFUNDO - Templates faltantes
  console.log('\n🔴 TEMPLATES FALTANTES:');
  console.log('------------------------');

  const allTemplateNames = new Set();
  for (const seq of sequences) {
    for (const step of seq.steps) {
      allTemplateNames.add(step.templateName);
    }
  }

  const existingTemplates = await prisma.emailTemplate.findMany({
    select: { name: true }
  });
  const existingSet = new Set(existingTemplates.map(t => t.name));

  let missingCount = 0;
  for (const name of allTemplateNames) {
    if (existingSet.has(name) === false) {
      console.log(`   ❌ ${name}`);
      missingCount++;
    }
  }
  if (missingCount === 0) {
    console.log('   ✅ Todos los templates existen');
  }

  // 10. Subscribers sin secuencia activa
  console.log('\n\n👻 SUBSCRIBERS SIN SECUENCIA:');
  console.log('------------------------------');

  const allSubs = await prisma.emailSubscriber.findMany({
    where: { status: 'active' },
    select: { id: true, email: true, source: true }
  });

  const enrolledIds = new Set();
  const allEnrollments = await prisma.sequenceEnrollment.findMany({
    where: { status: 'active' },
    select: { subscriberId: true }
  });
  for (const e of allEnrollments) {
    enrolledIds.add(e.subscriberId);
  }

  const orphans = allSubs.filter(s => enrolledIds.has(s.id) === false);
  console.log(`   Subscribers activos: ${allSubs.length}`);
  console.log(`   Con secuencia: ${enrolledIds.size}`);
  console.log(`   Sin secuencia (huérfanos): ${orphans.length}`);

  if (orphans.length > 0) {
    console.log('\n   Detalle huérfanos:');
    for (const s of orphans.slice(0, 10)) {
      console.log(`      - ${s.email} (${s.source})`);
    }
  }

  // 11. Secuencias sin uso
  console.log('\n\n💀 SECUENCIAS SIN INSCRITOS:');
  console.log('-----------------------------');

  const emptySeqs = sequences.filter(s => s.subscribersEnrolled === 0);
  console.log(`   ${emptySeqs.length} de ${sequences.length} secuencias sin nadie inscrito:`);
  for (const s of emptySeqs) {
    console.log(`      - ${s.name} (trigger: ${s.triggerEvent})`);
  }

  // 12. Análisis de duplicación
  console.log('\n\n⚠️ DUPLICACIÓN DE SECUENCIAS:');
  console.log('-------------------------------');

  const byTrigger = {};
  for (const s of sequences) {
    byTrigger[s.triggerEvent] = byTrigger[s.triggerEvent] || [];
    byTrigger[s.triggerEvent].push(s.name);
  }

  for (const [trigger, names] of Object.entries(byTrigger)) {
    if (names.length > 1) {
      console.log(`   ${trigger}: ${names.length} secuencias`);
      for (const n of names) {
        console.log(`      - ${n}`);
      }
    }
  }

  console.log('\n========================================');
  console.log('🎯 RECOMENDACIÓN ESTRATÉGICA');
  console.log('========================================\n');

  const subscriberCount = allSubs.length;
  const sequenceCount = sequences.length;

  if (sequenceCount > 5 && subscriberCount < 50) {
    console.log('⚠️ TIENES DEMASIADAS SECUENCIAS PARA TU VOLUMEN');
    console.log('');
    console.log('Con ' + subscriberCount + ' subscribers y ' + sequenceCount + ' secuencias:');
    console.log('- Demasiada complejidad para mantener');
    console.log('- Templates que nadie ve');
    console.log('- Recursos desperdiciados');
    console.log('');
    console.log('✅ RECOMENDACIÓN: Consolidar en 2-3 secuencias:');
    console.log('   1. ONBOARDING UNIVERSAL - Para todos los nuevos');
    console.log('   2. POST-TEST - Después del test de personalidad');
    console.log('   3. ACADEMIA - Para quiz leads (ya creada)');
  }
}

analyzeFunnels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
