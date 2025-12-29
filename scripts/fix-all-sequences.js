const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    ARREGLANDO SECUENCIAS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Fix template name: tool-qr-day2-uses -> tool-qr-day2-mistakes
  console.log('1. Arreglando nombre de template tool-qr-day2-uses...');
  const fixedSteps = await prisma.emailSequenceStep.updateMany({
    where: { templateName: 'tool-qr-day2-uses' },
    data: { templateName: 'tool-qr-day2-mistakes' }
  });
  console.log('   ✅ Steps actualizados:', fixedSteps.count);

  const fixedEmails = await prisma.scheduledEmail.updateMany({
    where: { templateName: 'tool-qr-day2-uses' },
    data: { templateName: 'tool-qr-day2-mistakes' }
  });
  console.log('   ✅ ScheduledEmails actualizados:', fixedEmails.count);

  // 2. Remove .tsx from template names
  console.log('\n2. Quitando .tsx de nombres de templates...');
  const templatesWithTsx = await prisma.emailSequenceStep.findMany({
    where: { templateName: { endsWith: '.tsx' } }
  });

  for (const step of templatesWithTsx) {
    const newName = step.templateName.replace('.tsx', '');
    await prisma.emailSequenceStep.update({
      where: { id: step.id },
      data: { templateName: newName }
    });
    console.log('   ✅', step.templateName, '->', newName);
  }

  // Also fix scheduled emails
  const scheduledWithTsx = await prisma.scheduledEmail.findMany({
    where: { templateName: { endsWith: '.tsx' } }
  });

  for (const email of scheduledWithTsx) {
    const newName = email.templateName.replace('.tsx', '');
    await prisma.scheduledEmail.update({
      where: { id: email.id },
      data: { templateName: newName }
    });
  }
  console.log('   ✅ ScheduledEmails con .tsx actualizados:', scheduledWithTsx.length);

  // 3. Configure targetSource for tool sequences
  console.log('\n3. Configurando targetSource para herramientas...');
  const triggerMappings = [
    { name: 'Tool: Generador de QR', trigger: 'generador-qr' },
    { name: 'Tool: Tarjeta WiFi', trigger: 'plantilla-wifi' },
    { name: 'Tool: Checklist de Limpieza', trigger: 'checklist-limpieza' },
    { name: 'Tool: Calculadora de Precios', trigger: 'calculadora-precios' },
    { name: 'Tool: Calculadora de ROI', trigger: 'calculadora-roi' },
    { name: 'tool-house-rules', trigger: 'house-rules' },
    { name: 'Tool: Plantilla Reviews', trigger: 'plantilla-reviews' },
    { name: 'Onboarding Genérico', trigger: 'onboarding-generic' },
    { name: 'Onboarding por Nivel', trigger: 'onboarding-nivel' },
    { name: 'Post-Test Nurturing', trigger: 'post-test' },
    { name: 'Post-Trial Nurturing', trigger: 'post-trial' }
  ];

  for (const mapping of triggerMappings) {
    const updated = await prisma.emailSequence.updateMany({
      where: { name: mapping.name },
      data: { targetSource: mapping.trigger }
    });
    if (updated.count > 0) {
      console.log('   ✅', mapping.name, '->', mapping.trigger);
    }
  }

  // 4. Reactivate Post-Trial Nurturing
  console.log('\n4. Reactivando Post-Trial Nurturing...');
  const reactivated = await prisma.emailSequence.updateMany({
    where: { name: 'Post-Trial Nurturing' },
    data: { isActive: true }
  });
  console.log('   ✅ Secuencias reactivadas:', reactivated.count);

  // 5. Reset failed emails to pending so they can be retried
  console.log('\n5. Reseteando emails fallidos para reintentar...');
  const resetEmails = await prisma.scheduledEmail.updateMany({
    where: {
      status: 'failed',
      templateName: { not: { endsWith: '.tsx' } }
    },
    data: {
      status: 'pending',
      sendAttempts: 0,
      errorMessage: null,
      failedAt: null
    }
  });
  console.log('   ✅ Emails reseteados a pending:', resetEmails.count);

  // 6. Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                         RESUMEN');
  console.log('═══════════════════════════════════════════════════════════════');

  const sequences = await prisma.emailSequence.findMany({
    select: { name: true, isActive: true, targetSource: true }
  });

  sequences.forEach(s => {
    const status = s.isActive ? '✅' : '❌';
    const trigger = s.targetSource || '⚠️ sin trigger';
    console.log(status + ' ' + s.name + ' -> ' + trigger);
  });

  await prisma.$disconnect();
  console.log('\n✅ Todos los arreglos completados');
}

main().catch(console.error);
