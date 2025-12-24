const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('=== VERIFICACIÓN DE ENROLLMENTS PARA alejandrosatlla@gmail.com ===\n');

  // Buscar el subscriber
  const sub = await prisma.emailSubscriber.findUnique({
    where: { email: 'alejandrosatlla@gmail.com' }
  });

  if (!sub) {
    console.log('No encontrado');
    await prisma.$disconnect();
    return;
  }

  console.log('Subscriber ID:', sub.id);
  console.log('Source:', sub.source);
  console.log('Tags:', sub.tags);

  // Buscar enrollments
  const enrollments = await prisma.sequenceEnrollment.findMany({
    where: { subscriberId: sub.id },
    include: { sequence: true }
  });

  console.log('\nEnrollments:', enrollments.length);
  enrollments.forEach(e => {
    console.log('  -', e.sequence?.name, '| Status:', e.status, '| Step:', e.currentStepOrder);
  });

  // Buscar emails programados
  const emails = await prisma.scheduledEmail.findMany({
    where: { subscriberId: sub.id },
    orderBy: { scheduledFor: 'asc' }
  });

  console.log('\nEmails programados:', emails.length);
  emails.forEach(e => {
    console.log('  -', e.status, '|', (e.subject || '').substring(0,40), '|', e.scheduledFor.toISOString().split('T')[0]);
  });

  await prisma.$disconnect();
}
check().catch(console.error);
