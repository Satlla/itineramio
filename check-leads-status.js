const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('=== VERIFICACIÓN DE LEADS Y SECUENCIAS ===\n');

  // 1. Leads generales
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('📥 Últimos 10 Leads:', leads.length);
  leads.forEach(l => console.log('  -', l.email, '|', l.source, '|', l.createdAt.toISOString().split('T')[0]));

  // 2. Subscribers de herramientas
  const subs = await prisma.emailSubscriber.findMany({
    where: { source: { startsWith: 'tool_' } },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('\n📧 EmailSubscribers de herramientas:', subs.length);
  subs.forEach(s => console.log('  -', s.email, '|', s.source, '|', (s.tags || []).join(', ')));

  // 3. Todos los subscribers recientes
  const allSubs = await prisma.emailSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('\n📧 Últimos 10 EmailSubscribers (todos):');
  allSubs.forEach(s => console.log('  -', s.email, '|', s.source, '|', s.createdAt.toISOString().split('T')[0]));

  // 4. Secuencias activas
  const sequences = await prisma.emailSequence.findMany({
    include: { steps: true }
  });
  console.log('\n📋 Todas las secuencias:');
  sequences.forEach(seq => console.log('  -', seq.name, '| Pasos:', seq.steps.length, '| Activa:', seq.isActive));

  // 5. Enrollments
  const enrollments = await prisma.sequenceEnrollment.findMany({
    include: { sequence: true, subscriber: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('\n🎯 Últimos enrollments:', enrollments.length);
  enrollments.forEach(e => console.log('  -', e.subscriber?.email, '→', e.sequence?.name, '| Status:', e.status));

  // 6. Emails programados
  const scheduled = await prisma.scheduledEmail.findMany({
    where: { status: 'pending' },
    orderBy: { scheduledFor: 'asc' },
    take: 10
  });
  console.log('\n📬 Emails programados (pending):', scheduled.length);
  scheduled.forEach(e => console.log('  -', e.recipientEmail, '|', (e.subject || '').substring(0,40), '|', e.scheduledFor.toISOString()));

  await prisma.$disconnect();
}
check().catch(console.error);
