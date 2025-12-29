const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get failed emails with details
  const failedEmails = await prisma.scheduledEmail.findMany({
    where: { status: 'failed' },
    select: {
      templateName: true,
      errorMessage: true,
      recipientEmail: true,
      scheduledFor: true,
      enrollment: {
        select: {
          sequence: { select: { name: true } }
        }
      }
    },
    orderBy: { scheduledFor: 'desc' }
  });

  console.log('════════════════════════════════════════════════════════════════');
  console.log('              ❌ EMAILS FALLIDOS (' + failedEmails.length + ' total)');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Group by template name
  const byTemplate = {};
  failedEmails.forEach(e => {
    if (!byTemplate[e.templateName]) {
      byTemplate[e.templateName] = { count: 0, error: e.errorMessage };
    }
    byTemplate[e.templateName].count++;
  });

  console.log('📊 AGRUPADO POR TEMPLATE:\n');
  Object.entries(byTemplate).forEach(([template, data]) => {
    console.log('  ' + template + ': ' + data.count + ' fallidos');
    console.log('     Error: ' + (data.error || 'sin mensaje'));
    console.log('');
  });

  await prisma.$disconnect();
}

main();
