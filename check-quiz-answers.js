const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lead = await prisma.quizLead.findFirst({
      orderBy: { completedAt: 'desc' },
      select: {
        email: true,
        answers: true
      }
    });

    if (lead && lead.answers) {
      console.log('\nEmail:', lead.email);
      console.log('\nEstructura de answers (primer elemento):');
      const answers = lead.answers;
      if (Array.isArray(answers) && answers.length > 0) {
        const firstAnswer = answers[0];
        console.log('Campos disponibles:', Object.keys(firstAnswer));
        console.log('\nTiene selectedOptions?', 'selectedOptions' in firstAnswer);
        console.log('Tiene userAnswers?', 'userAnswers' in firstAnswer);
        console.log('Tiene earnedPoints?', 'earnedPoints' in firstAnswer);
        console.log('Tiene score?', 'score' in firstAnswer);
        console.log('\nPrimer answer completo:');
        console.log(JSON.stringify(firstAnswer, null, 2));
      }
    } else {
      console.log('No hay leads con answers');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
