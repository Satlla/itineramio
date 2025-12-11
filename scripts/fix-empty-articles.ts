import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Cambiando artículos vacíos a DRAFT...\n');

  const slugsToUpdate = [
    'normativa-vut-2025-cambios-legales',
    'manual-digital-apartamentos-guia-definitiva'
  ];

  for (const slug of slugsToUpdate) {
    const article = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, title: true, status: true, content: true }
    });

    if (!article) {
      console.log(`❌ Artículo no encontrado: ${slug}`);
      continue;
    }

    console.log(`📄 Encontrado: "${article.title}"`);
    console.log(`   Status actual: ${article.status}`);
    console.log(`   Longitud contenido: ${article.content.length} caracteres`);

    if (article.status === 'PUBLISHED') {
      await prisma.blogPost.update({
        where: { slug },
        data: { status: 'DRAFT' }
      });
      console.log(`   ✅ Cambiado a DRAFT\n`);
    } else {
      console.log(`   ℹ️  Ya está en ${article.status}\n`);
    }
  }

  console.log('✅ Proceso completado');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
