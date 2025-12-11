import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para consultar artículos específicos del blog
 * Uso: npx ts-node scripts/query-blog-articles.ts [comando] [opciones]
 */

async function listByStatus(status: string) {
  console.log(`\n📋 Artículos con status: ${status}\n`);

  const articles = await prisma.blogPost.findMany({
    where: { status: status as any },
    orderBy: { createdAt: 'desc' },
    select: {
      slug: true,
      title: true,
      category: true,
      views: true,
      createdAt: true,
      publishedAt: true
    }
  });

  console.log(`Total: ${articles.length}\n`);

  articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Categoría: ${article.category}`);
    console.log(`   Vistas: ${article.views}`);
    console.log(`   Creado: ${article.createdAt.toLocaleDateString('es-ES')}`);
    if (article.publishedAt) {
      console.log(`   Publicado: ${article.publishedAt.toLocaleDateString('es-ES')}`);
    }
    console.log('');
  });
}

async function listByCategory(category: string) {
  console.log(`\n📂 Artículos de categoría: ${category}\n`);

  const articles = await prisma.blogPost.findMany({
    where: { category: category as any },
    orderBy: { views: 'desc' },
    select: {
      slug: true,
      title: true,
      status: true,
      views: true,
      uniqueViews: true,
      publishedAt: true
    }
  });

  console.log(`Total: ${articles.length}\n`);

  articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   Status: ${article.status}`);
    console.log(`   Vistas: ${article.views} (únicas: ${article.uniqueViews})`);
    console.log('');
  });
}

async function findShortArticles(minLength = 5000) {
  console.log(`\n📏 Artículos con menos de ${minLength} caracteres\n`);

  const articles = await prisma.blogPost.findMany({
    select: {
      slug: true,
      title: true,
      category: true,
      status: true,
      content: true
    }
  });

  const shortArticles = articles
    .filter(a => a.content.length < minLength)
    .sort((a, b) => a.content.length - b.content.length);

  console.log(`Total: ${shortArticles.length}\n`);

  shortArticles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Longitud: ${article.content.length.toLocaleString()} caracteres`);
    console.log(`   Status: ${article.status}`);
    console.log('');
  });
}

async function findMissingMetadata() {
  console.log('\n🔍 Artículos sin metadata completa\n');

  const articles = await prisma.blogPost.findMany({
    select: {
      slug: true,
      title: true,
      status: true,
      metaTitle: true,
      metaDescription: true,
      excerpt: true,
      coverImage: true,
      keywords: true
    }
  });

  const missing = articles.filter(a => {
    return !a.metaTitle || !a.metaDescription || !a.excerpt || !a.coverImage || a.keywords.length === 0;
  });

  console.log(`Total: ${missing.length}\n`);

  missing.forEach((article, i) => {
    const missingFields = [];
    if (!article.metaTitle) missingFields.push('metaTitle');
    if (!article.metaDescription) missingFields.push('metaDescription');
    if (!article.excerpt) missingFields.push('excerpt');
    if (!article.coverImage) missingFields.push('coverImage');
    if (article.keywords.length === 0) missingFields.push('keywords');

    console.log(`${i + 1}. ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Status: ${article.status}`);
    console.log(`   Falta: ${missingFields.join(', ')}`);
    console.log('');
  });
}

async function topArticles(limit = 10) {
  console.log(`\n🏆 Top ${limit} artículos más vistos\n`);

  const articles = await prisma.blogPost.findMany({
    orderBy: { views: 'desc' },
    take: limit,
    select: {
      slug: true,
      title: true,
      category: true,
      views: true,
      uniqueViews: true,
      likes: true,
      shares: true,
      publishedAt: true
    }
  });

  articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   Vistas: ${article.views.toLocaleString()} (únicas: ${article.uniqueViews.toLocaleString()})`);
    console.log(`   Likes: ${article.likes} | Shares: ${article.shares}`);
    console.log(`   Categoría: ${article.category}`);
    console.log('');
  });
}

async function getArticleDetail(slug: string) {
  console.log(`\n📄 Detalle del artículo: ${slug}\n`);

  const article = await prisma.blogPost.findUnique({
    where: { slug }
  });

  if (!article) {
    console.log('❌ Artículo no encontrado');
    return;
  }

  console.log('Información General:');
  console.log(`  Título: ${article.title}`);
  console.log(`  Subtítulo: ${article.subtitle || 'N/A'}`);
  console.log(`  Categoría: ${article.category}`);
  console.log(`  Status: ${article.status}`);
  console.log(`  Featured: ${article.featured ? 'Sí' : 'No'}`);
  console.log('');

  console.log('Contenido:');
  console.log(`  Longitud: ${article.content.length.toLocaleString()} caracteres`);
  console.log(`  Excerpt: ${article.excerpt ? article.excerpt.length : 0} caracteres`);
  console.log(`  Tiempo de lectura: ${article.readTime} minutos`);
  console.log('');

  console.log('SEO:');
  console.log(`  Meta Title: ${article.metaTitle || 'No definido'}`);
  console.log(`  Meta Description: ${article.metaDescription || 'No definido'}`);
  if (article.metaDescription) {
    console.log(`    Longitud: ${article.metaDescription.length} caracteres`);
  }
  console.log(`  Keywords: ${article.keywords.join(', ') || 'Ninguna'}`);
  console.log(`  Tags: ${article.tags.join(', ') || 'Ninguno'}`);
  console.log('');

  console.log('Métricas:');
  console.log(`  Vistas: ${article.views.toLocaleString()}`);
  console.log(`  Vistas únicas: ${article.uniqueViews.toLocaleString()}`);
  console.log(`  Likes: ${article.likes}`);
  console.log(`  Shares: ${article.shares}`);
  console.log('');

  console.log('Imagen:');
  console.log(`  Cover: ${article.coverImage || 'No definida'}`);
  console.log(`  Alt: ${article.coverImageAlt || 'No definido'}`);
  console.log('');

  console.log('Fechas:');
  console.log(`  Creado: ${article.createdAt.toLocaleString('es-ES')}`);
  console.log(`  Actualizado: ${article.updatedAt.toLocaleString('es-ES')}`);
  console.log(`  Publicado: ${article.publishedAt?.toLocaleString('es-ES') || 'No publicado'}`);
  console.log(`  Programado: ${article.scheduledFor?.toLocaleString('es-ES') || 'No programado'}`);
  console.log('');

  console.log('Autor:');
  console.log(`  Nombre: ${article.authorName}`);
  console.log(`  ID: ${article.authorId}`);
  console.log(`  Imagen: ${article.authorImage || 'No definida'}`);
  console.log('');
}

async function searchArticles(query: string) {
  console.log(`\n🔎 Buscando: "${query}"\n`);

  const articles = await prisma.blogPost.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { subtitle: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      slug: true,
      title: true,
      category: true,
      status: true,
      views: true
    }
  });

  console.log(`Resultados: ${articles.length}\n`);

  articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Categoría: ${article.category} | Status: ${article.status}`);
    console.log(`   Vistas: ${article.views}`);
    console.log('');
  });
}

async function showStats() {
  console.log('\n📊 Estadísticas Generales del Blog\n');

  const total = await prisma.blogPost.count();
  const published = await prisma.blogPost.count({ where: { status: 'PUBLISHED' } });
  const draft = await prisma.blogPost.count({ where: { status: 'DRAFT' } });
  const featured = await prisma.blogPost.count({ where: { featured: true } });

  const allArticles = await prisma.blogPost.findMany({
    select: {
      views: true,
      uniqueViews: true,
      content: true,
      category: true
    }
  });

  const totalViews = allArticles.reduce((sum, a) => sum + a.views, 0);
  const totalUniqueViews = allArticles.reduce((sum, a) => sum + a.uniqueViews, 0);
  const avgLength = Math.round(allArticles.reduce((sum, a) => sum + a.content.length, 0) / total);

  console.log('Totales:');
  console.log(`  Artículos: ${total}`);
  console.log(`  Publicados: ${published} (${Math.round(published / total * 100)}%)`);
  console.log(`  Borrador: ${draft} (${Math.round(draft / total * 100)}%)`);
  console.log(`  Featured: ${featured}`);
  console.log('');

  console.log('Vistas:');
  console.log(`  Totales: ${totalViews.toLocaleString()}`);
  console.log(`  Únicas: ${totalUniqueViews.toLocaleString()}`);
  console.log(`  Promedio por artículo: ${Math.round(totalViews / total).toLocaleString()}`);
  console.log('');

  console.log('Contenido:');
  console.log(`  Longitud promedio: ${avgLength.toLocaleString()} caracteres`);
  console.log('');

  // Por categoría
  const categories = new Map();
  allArticles.forEach(a => {
    categories.set(a.category, (categories.get(a.category) || 0) + 1);
  });

  console.log('Por Categoría:');
  Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} artículos`);
    });
  console.log('');
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'status':
      await listByStatus(arg || 'PUBLISHED');
      break;
    case 'category':
      await listByCategory(arg || 'GUIAS');
      break;
    case 'short':
      await findShortArticles(parseInt(arg) || 5000);
      break;
    case 'missing':
      await findMissingMetadata();
      break;
    case 'top':
      await topArticles(parseInt(arg) || 10);
      break;
    case 'detail':
      if (!arg) {
        console.log('❌ Uso: npx ts-node scripts/query-blog-articles.ts detail [slug]');
      } else {
        await getArticleDetail(arg);
      }
      break;
    case 'search':
      if (!arg) {
        console.log('❌ Uso: npx ts-node scripts/query-blog-articles.ts search [query]');
      } else {
        await searchArticles(arg);
      }
      break;
    case 'stats':
      await showStats();
      break;
    default:
      console.log('\n📚 Herramienta de consulta de artículos del blog\n');
      console.log('Uso: npx ts-node scripts/query-blog-articles.ts [comando] [opciones]\n');
      console.log('Comandos disponibles:');
      console.log('  status [STATUS]          - Listar artículos por status (PUBLISHED, DRAFT, etc.)');
      console.log('  category [CATEGORY]      - Listar artículos por categoría');
      console.log('  short [MIN_LENGTH]       - Encontrar artículos cortos (default: 5000)');
      console.log('  missing                  - Encontrar artículos sin metadata completa');
      console.log('  top [LIMIT]              - Top artículos más vistos (default: 10)');
      console.log('  detail [SLUG]            - Ver detalle completo de un artículo');
      console.log('  search [QUERY]           - Buscar artículos por texto');
      console.log('  stats                    - Estadísticas generales del blog');
      console.log('');
      console.log('Ejemplos:');
      console.log('  npx ts-node scripts/query-blog-articles.ts status PUBLISHED');
      console.log('  npx ts-node scripts/query-blog-articles.ts category GUIAS');
      console.log('  npx ts-node scripts/query-blog-articles.ts detail mi-articulo');
      console.log('  npx ts-node scripts/query-blog-articles.ts search "airbnb"');
      console.log('  npx ts-node scripts/query-blog-articles.ts stats');
      console.log('');
  }

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
