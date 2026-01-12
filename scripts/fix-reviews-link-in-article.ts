import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
    }
  }
});

// Mapa de correcciones de enlaces
const linkCorrections: Record<string, string> = {
  // Enlaces de blog rotos
  '/blog/como-responder-resenas-negativas': '/blog/metodo-4-pasos-convertir-quejas-en-5-estrellas',
  '/blog/conseguir-resenas-5-estrellas': '/blog/como-conseguir-resenas-5-estrellas-sin-parecer-desesperado',

  // Enlace a herramienta incorrecto (QR -> Plantilla Reviews)
  '/hub/tools/qr-generator': '/recursos/plantilla-reviews',
  'https://www.itineramio.com/hub/tools/qr-generator': '/recursos/plantilla-reviews',
};

async function fixBrokenLinks() {
  console.log('🔧 Corrigiendo enlaces rotos en artículo de automatización...\n');

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'automatizacion-anfitriones-airbnb' },
    select: { id: true, title: true, content: true }
  });

  if (!article) {
    console.log('❌ Artículo no encontrado');
    return;
  }

  console.log(`📝 Artículo: ${article.title}\n`);

  let updatedContent = article.content;
  let totalFixes = 0;

  for (const [wrongUrl, correctUrl] of Object.entries(linkCorrections)) {
    const regex = new RegExp(wrongUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const occurrences = (article.content.match(regex) || []).length;

    if (occurrences > 0) {
      console.log(`🔄 ${wrongUrl}`);
      console.log(`   → ${correctUrl}`);
      console.log(`   (${occurrences} ocurrencias)\n`);

      updatedContent = updatedContent.replace(regex, correctUrl);
      totalFixes += occurrences;
    }
  }

  if (totalFixes === 0) {
    console.log('✅ No hay enlaces que corregir');
    return;
  }

  // Actualizar en la base de datos
  await prisma.blogPost.update({
    where: { id: article.id },
    data: { content: updatedContent }
  });

  console.log(`\n🎉 ¡Corregidos ${totalFixes} enlaces!`);
}

async function main() {
  try {
    await fixBrokenLinks();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
