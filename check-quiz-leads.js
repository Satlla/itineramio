const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const leads = await prisma.quizLead.findMany({
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        fullName: true,
        score: true,
        level: true,
        completedAt: true,
        emailVerified: true,
        converted: true
      }
    });

    console.log('\n📊 Total leads encontrados: ' + leads.length + '\n');

    if (leads.length > 0) {
      leads.forEach(function(lead, i) {
        console.log((i+1) + '. ' + lead.email);
        console.log('   Nombre: ' + (lead.fullName || 'N/A'));
        console.log('   Score: ' + lead.score + ' | Nivel: ' + lead.level);
        console.log('   Verificado: ' + (lead.emailVerified ? 'SI' : 'NO') + ' | Convertido: ' + (lead.converted ? 'SI' : 'NO'));
        console.log('   Fecha: ' + lead.completedAt.toLocaleString('es-ES') + '\n');
      });
    } else {
      console.log('No hay leads registrados aun.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
