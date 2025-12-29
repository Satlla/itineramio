const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('                    AUDITORÍA COMPLETA DE EMBUDOS');
  console.log('════════════════════════════════════════════════════════════════\n');

  // 1. Get all sequences
  const sequences = await prisma.emailSequence.findMany({
    include: { steps: { orderBy: { order: 'asc' } } },
    orderBy: { name: 'asc' }
  });

  console.log('📊 RESUMEN GENERAL');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('Total secuencias:', sequences.length);
  console.log('Activas:', sequences.filter(s => s.isActive).length);
  console.log('Inactivas:', sequences.filter(s => !s.isActive).length);
  console.log('');

  // 2. Check each sequence
  const issues = [];

  for (const seq of sequences) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 ' + seq.name);
    console.log('   ID: ' + seq.id);
    console.log('   Activo: ' + (seq.isActive ? '✅' : '❌'));
    console.log('   Trigger: ' + (seq.triggerSource || '⚠️ NO CONFIGURADO'));
    console.log('   Steps: ' + seq.steps.length);

    if (!seq.triggerSource) {
      issues.push('Secuencia "' + seq.name + '" sin triggerSource');
    }

    if (!seq.isActive) {
      issues.push('Secuencia "' + seq.name + '" está INACTIVA');
    }

    // Check days sequence
    const days = seq.steps.map(s => s.delayDays);
    const expectedDays = [0, 2, 4, 6, 8];
    const daysMatch = JSON.stringify(days) === JSON.stringify(expectedDays.slice(0, days.length));

    if (!daysMatch && seq.steps.length === 5) {
      issues.push('Secuencia "' + seq.name + '" días incorrectos: ' + days.join(',') + ' (esperado: 0,2,4,6,8)');
    }

    console.log('   Días: ' + days.join(', ') + (daysMatch || seq.steps.length !== 5 ? '' : ' ⚠️'));

    for (const step of seq.steps) {
      console.log('      Day ' + step.delayDays + ': ' + step.templateName);
    }
    console.log('');
  }

  // 3. Check for duplicates
  const names = sequences.map(s => s.name);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length > 0) {
    issues.push('Secuencias duplicadas: ' + duplicates.join(', '));
  }

  // 4. Get enrollment stats
  const enrollments = await prisma.sequenceEnrollment.groupBy({
    by: ['sequenceId', 'status'],
    _count: true
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 ESTADÍSTICAS DE ENROLLMENTS');
  console.log('─────────────────────────────────────────────────────────────────');

  for (const seq of sequences) {
    const seqEnrollments = enrollments.filter(e => e.sequenceId === seq.id);
    const total = seqEnrollments.reduce((acc, e) => acc + e._count, 0);
    if (total > 0) {
      const active = seqEnrollments.find(e => e.status === 'active')?._count || 0;
      const completed = seqEnrollments.find(e => e.status === 'completed')?._count || 0;
      console.log(seq.name + ': ' + total + ' total (' + active + ' active, ' + completed + ' completed)');
    }
  }

  // 5. Check scheduled emails status
  const emailStats = await prisma.scheduledEmail.groupBy({
    by: ['status'],
    _count: true
  });

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📬 ESTADÍSTICAS DE EMAILS PROGRAMADOS');
  console.log('─────────────────────────────────────────────────────────────────');
  emailStats.forEach(s => {
    const icon = s.status === 'sent' ? '✅' : s.status === 'failed' ? '❌' : '⏳';
    console.log(icon + ' ' + s.status + ': ' + s._count);
  });

  // 6. Check failed emails
  const failedEmails = await prisma.scheduledEmail.findMany({
    where: { status: 'failed' },
    select: { templateName: true, error: true },
    take: 10
  });

  if (failedEmails.length > 0) {
    console.log('');
    console.log('❌ EMAILS FALLIDOS (últimos 10):');
    failedEmails.forEach(e => {
      console.log('   - ' + e.templateName + ': ' + (e.error || 'sin error'));
    });
  }

  // 7. Show issues
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  PROBLEMAS DETECTADOS');
  console.log('─────────────────────────────────────────────────────────────────');
  if (issues.length === 0) {
    console.log('✅ No se detectaron problemas');
  } else {
    issues.forEach((issue, i) => console.log((i+1) + '. ' + issue));
  }

  await prisma.$disconnect();
}

main();
