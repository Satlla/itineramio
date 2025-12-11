import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const article = await prisma.blogPost.findFirst({
    where: {
      OR: [
        { slug: { contains: 'revenue' } },
        { title: { contains: 'Revenue' } }
      ]
    },
    select: { id: true, slug: true, title: true, content: true }
  });

  if (!article) {
    console.log('No se encontró el artículo');
    return;
  }

  console.log('Artículo encontrado:');
  console.log('Slug:', article.slug);
  console.log('Título:', article.title);
  console.log('\nBuscando enlaces rotos...\n');

  const brokenLinks = [
    'optimizacion-operativa-airbnb',
    'automatizacion-mensajeria-airbnb',
    'metricas-clave-anfitrion-profesional',
    'calendario-eventos-espana-2025'
  ];

  for (const link of brokenLinks) {
    if (article.content.includes(link)) {
      console.log(`✗ Encontrado: ${link}`);
    } else {
      console.log(`  No encontrado: ${link}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
