import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const article = await prisma.blogPost.findUnique({
    where: { slug: 'primer-mes-anfitrion-airbnb' }
  });

  if (!article) {
    console.error('❌ Artículo no encontrado');
    return;
  }

  console.log('Buscando todas las ocurrencias de class="..." en el contenido:\n');

  // Encontrar todas las clases
  const classMatches = article.content.match(/class="[^"]*"/g);

  if (classMatches) {
    console.log(`Encontradas ${classMatches.length} atributos class:\n`);

    classMatches.forEach((match, index) => {
      if (index < 20) { // Mostrar las primeras 20
        console.log(`${index + 1}. ${match}`);
      }
    });

    if (classMatches.length > 20) {
      console.log(`\n... y ${classMatches.length - 20} más`);
    }
  } else {
    console.log('No se encontraron atributos class en el contenido');
  }

  console.log('\n---\nPrimeros 3000 caracteres del contenido:\n');
  console.log(article.content.substring(0, 3000));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
