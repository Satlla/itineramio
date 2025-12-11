import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const article = await prisma.blogPost.findUnique({
    where: { slug: 'revenue-management-avanzado' }
  });

  if (!article) {
    console.log('❌ Artículo no encontrado');
    return;
  }

  console.log('📄 Artículo encontrado:', article.title);
  console.log('📏 Longitud original:', article.content.length, 'caracteres\n');

  let content = article.content;

  // Enlaces rotos a remover
  const brokenLinks = [
    { slug: 'optimizacion-operativa-airbnb', text: 'optimización operativa' },
    { slug: 'automatizacion-mensajeria-airbnb', text: 'automatización de mensajería' },
    { slug: 'metricas-clave-anfitrion-profesional', text: 'métricas clave' },
    { slug: 'calendario-eventos-espana-2025', text: 'calendario de eventos' }
  ];

  for (const link of brokenLinks) {
    // Patrones comunes de enlaces en HTML y Markdown
    const patterns = [
      new RegExp(`<a[^>]*href=['"](?:/blog/)?${link.slug}['"][^>]*>([^<]*)</a>`, 'gi'),
      new RegExp(`\\[([^\\]]*)\\]\\((?:/blog/)?${link.slug}\\)`, 'gi'),
    ];

    let found = false;
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        found = true;
        // Reemplazar el enlace por solo el texto
        content = content.replace(pattern, '$1');
        console.log(`✓ Removido enlace: ${link.slug}`);
      }
    }

    if (!found) {
      console.log(`  ℹ️  No se encontró patrón de enlace para: ${link.slug}`);
    }
  }

  console.log('\n📏 Longitud después:', content.length, 'caracteres');
  console.log('💾 Guardando cambios...\n');

  await prisma.blogPost.update({
    where: { slug: 'revenue-management-avanzado' },
    data: { content, updatedAt: new Date() }
  });

  console.log('✅ Enlaces rotos removidos exitosamente');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
