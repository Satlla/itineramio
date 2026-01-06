/**
 * Test completo del sistema de email sequences
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST COMPLETO DEL SISTEMA DE EMAIL SEQUENCES');
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;
  const issues = [];

  // TEST 1: Verificar secuencias activas
  console.log('📋 TEST 1: Secuencias activas');
  console.log('-'.repeat(40));

  const activeSequences = await prisma.emailSequence.findMany({
    where: { isActive: true },
    include: { steps: { orderBy: { order: 'asc' } } }
  });

  if (activeSequences.length === 3) {
    console.log('   ✅ Hay exactamente 3 secuencias activas');
    passed++;
  } else {
    console.log('   ❌ Se esperaban 3 secuencias, hay ' + activeSequences.length);
    failed++;
    issues.push('Número incorrecto de secuencias activas');
  }

  // Verificar triggers
  const triggers = activeSequences.map(s => s.triggerEvent).sort();
  const expectedTriggers = ['QUIZ_COMPLETED', 'SUBSCRIBER_CREATED', 'TEST_COMPLETED'];
  
  if (JSON.stringify(triggers) === JSON.stringify(expectedTriggers)) {
    console.log('   ✅ Triggers correctos: ' + triggers.join(', '));
    passed++;
  } else {
    console.log('   ❌ Triggers incorrectos. Esperados: ' + expectedTriggers.join(', '));
    console.log('      Encontrados: ' + triggers.join(', '));
    failed++;
    issues.push('Triggers incorrectos');
  }

  // TEST 2: Verificar que Onboarding Universal es catch-all
  console.log('\n📋 TEST 2: Onboarding Universal es catch-all');
  console.log('-'.repeat(40));

  const onboarding = activeSequences.find(s => s.name === 'Onboarding Universal');
  
  if (onboarding) {
    if (onboarding.targetSource === null || onboarding.targetSource === '') {
      console.log('   ✅ targetSource es null (catch-all)');
      passed++;
    } else {
      console.log('   ❌ targetSource no es null: ' + onboarding.targetSource);
      failed++;
      issues.push('Onboarding no es catch-all');
    }

    if (onboarding.priority <= 10) {
      console.log('   ✅ Prioridad baja (' + onboarding.priority + ')');
      passed++;
    } else {
      console.log('   ⚠️ Prioridad alta (' + onboarding.priority + '), debería ser baja');
    }
  } else {
    console.log('   ❌ No se encontró "Onboarding Universal"');
    failed++;
    issues.push('Falta Onboarding Universal');
  }

  // TEST 3: Verificar pasos de cada secuencia
  console.log('\n📋 TEST 3: Pasos de secuencias');
  console.log('-'.repeat(40));

  for (const seq of activeSequences) {
    if (seq.steps.length >= 5) {
      console.log('   ✅ ' + seq.name + ': ' + seq.steps.length + ' pasos');
      passed++;
    } else {
      console.log('   ❌ ' + seq.name + ': solo ' + seq.steps.length + ' pasos (mínimo 5)');
      failed++;
      issues.push(seq.name + ' tiene pocos pasos');
    }
  }

  // TEST 4: Verificar templates existentes
  console.log('\n📋 TEST 4: Templates de secuencias activas');
  console.log('-'.repeat(40));

  const templateNames = [];
  for (const seq of activeSequences) {
    for (const step of seq.steps) {
      templateNames.push({ name: step.templateName, sequence: seq.name });
    }
  }

  // Los templates están en archivos, verificar cuáles existen
  const fs = require('fs');
  const path = require('path');
  const templatesDir = path.join(__dirname, '..', 'src', 'emails', 'templates');
  const toolsDir = path.join(templatesDir, 'tools');

  let missingTemplates = [];
  
  for (const t of templateNames) {
    const baseName = t.name.replace('.tsx', '');
    const possiblePaths = [
      path.join(templatesDir, baseName + '.tsx'),
      path.join(toolsDir, baseName + '.tsx')
    ];
    
    const exists = possiblePaths.some(p => fs.existsSync(p));
    
    if (exists) {
      // No mostrar cada uno para no saturar
    } else {
      missingTemplates.push({ template: baseName, sequence: t.sequence });
    }
  }

  if (missingTemplates.length === 0) {
    console.log('   ✅ Todos los templates existen');
    passed++;
  } else {
    console.log('   ❌ Templates faltantes:');
    for (const m of missingTemplates) {
      console.log('      - ' + m.template + ' (usado en ' + m.sequence + ')');
    }
    failed++;
    issues.push('Faltan ' + missingTemplates.length + ' templates');
  }

  // TEST 5: Verificar enrollments activos
  console.log('\n📋 TEST 5: Enrollments activos');
  console.log('-'.repeat(40));

  const enrollments = await prisma.sequenceEnrollment.findMany({
    where: { status: 'active' },
    include: { sequence: true }
  });

  // Contar por secuencia
  const enrollmentsBySeq = {};
  for (const e of enrollments) {
    const name = e.sequence?.name || 'Desconocida';
    enrollmentsBySeq[name] = (enrollmentsBySeq[name] || 0) + 1;
  }

  console.log('   Enrollments por secuencia:');
  for (const [name, count] of Object.entries(enrollmentsBySeq)) {
    const seq = activeSequences.find(s => s.name === name);
    const status = seq ? '✅' : '⚠️ (secuencia inactiva)';
    console.log('      ' + status + ' ' + name + ': ' + count);
  }

  // Verificar si hay enrollments en secuencias inactivas
  const enrollsInInactive = enrollments.filter(e => {
    return !activeSequences.find(s => s.id === e.sequenceId);
  });

  if (enrollsInInactive.length > 0) {
    console.log('   ⚠️ ' + enrollsInInactive.length + ' enrollments en secuencias inactivas');
    issues.push('Enrollments huérfanos en secuencias inactivas');
  }

  // TEST 6: Verificar emails programados
  console.log('\n📋 TEST 6: Emails programados');
  console.log('-'.repeat(40));

  const emailsByStatus = await prisma.scheduledEmail.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  for (const stat of emailsByStatus) {
    const icon = stat.status === 'sent' ? '✅' : stat.status === 'failed' ? '❌' : '⏳';
    console.log('   ' + icon + ' ' + stat.status + ': ' + stat._count.id);
  }

  // Verificar emails pendientes de secuencias inactivas
  const pendingEmails = await prisma.scheduledEmail.findMany({
    where: { status: 'pending' },
    include: {
      enrollment: {
        include: { sequence: true }
      }
    }
  });

  const pendingInInactive = pendingEmails.filter(e => {
    return e.enrollment?.sequence?.isActive === false;
  });

  if (pendingInInactive.length > 0) {
    console.log('   ⚠️ ' + pendingInInactive.length + ' emails pendientes de secuencias INACTIVAS');
    issues.push(pendingInInactive.length + ' emails pendientes de secuencias inactivas');
  }

  // TEST 7: Verificar errores comunes en emails fallidos
  console.log('\n📋 TEST 7: Análisis de emails fallidos');
  console.log('-'.repeat(40));

  const failedEmails = await prisma.scheduledEmail.findMany({
    where: { status: 'failed' },
    select: { errorMessage: true, templateName: true }
  });

  if (failedEmails.length > 0) {
    const errorTypes = {};
    for (const e of failedEmails) {
      const msg = e.errorMessage || 'Sin mensaje';
      const shortMsg = msg.substring(0, 50);
      errorTypes[shortMsg] = (errorTypes[shortMsg] || 0) + 1;
    }

    console.log('   Tipos de errores:');
    for (const [msg, count] of Object.entries(errorTypes)) {
      console.log('      ' + count + 'x - ' + msg);
    }
  } else {
    console.log('   ✅ No hay emails fallidos');
    passed++;
  }

  // RESUMEN
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE TESTS');
  console.log('='.repeat(60));
  console.log('   ✅ Pasados: ' + passed);
  console.log('   ❌ Fallados: ' + failed);
  
  if (issues.length > 0) {
    console.log('\n⚠️ ISSUES A RESOLVER:');
    for (let i = 0; i < issues.length; i++) {
      console.log('   ' + (i + 1) + '. ' + issues[i]);
    }
  }

  console.log('\n');
  return { passed, failed, issues };
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
