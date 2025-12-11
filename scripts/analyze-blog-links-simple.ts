import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
    }
  }
});

interface Link {
  url: string;
  text: string;
  type: 'internal-blog' | 'internal-other' | 'external';
  targetSlug?: string;
}

interface ArticleLinks {
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  articleStatus: string;
  publishedAt: Date | null;
  links: Link[];
}

interface LinkAnalysis {
  allArticles: ArticleLinks[];
  brokenLinks: Array<{
    sourceArticleSlug: string;
    sourceArticleTitle: string;
    targetSlug: string;
    linkText: string;
    reason: string;
  }>;
  orphanArticles: Array<{
    slug: string;
    title: string;
    status: string;
  }>;
  articlesWithoutOutgoingLinks: Array<{
    slug: string;
    title: string;
    status: string;
  }>;
  linkMatrix: Record<string, string[]>; // sourceSlug -> targetSlugs[]
  incomingLinksCount: Record<string, number>; // slug -> count
  outgoingLinksCount: Record<string, number>; // slug -> count
}

// Simple HTML link parser using regex
function parseLinks(html: string): Array<{ href: string; text: string }> {
  const links: Array<{ href: string; text: string }> = [];

  // Match <a> tags with href attribute
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]*>/g, '').trim(); // Remove HTML tags from text
    links.push({ href, text });
  }

  return links;
}

async function analyzeLinks(): Promise<LinkAnalysis> {
  console.log('📊 Iniciando análisis de enlaces del blog...\n');

  // 1. Obtener todos los artículos
  console.log('1️⃣ Obteniendo todos los artículos...');
  const articles = await prisma.blogPost.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      status: true,
      publishedAt: true,
    },
  });

  console.log(`   ✅ ${articles.length} artículos encontrados\n`);

  // 2. Extraer enlaces de cada artículo
  console.log('2️⃣ Extrayendo enlaces de cada artículo...');
  const allArticlesLinks: ArticleLinks[] = [];

  for (const article of articles) {
    const htmlLinks = parseLinks(article.content);
    const links: Link[] = [];

    for (const { href, text } of htmlLinks) {
      if (!href) continue;

      // Determinar tipo de enlace
      let type: Link['type'];
      let targetSlug: string | undefined;

      if (href.startsWith('/blog/')) {
        type = 'internal-blog';
        targetSlug = href.replace('/blog/', '').replace(/\/$/, '').split('#')[0].split('?')[0];
      } else if (href.startsWith('/') || href.includes('itineramio.com')) {
        type = 'internal-other';
      } else if (href.startsWith('http')) {
        type = 'external';
      } else {
        continue; // Ignorar enlaces relativos o anclas
      }

      links.push({
        url: href,
        text,
        type,
        targetSlug,
      });
    }

    allArticlesLinks.push({
      articleId: article.id,
      articleSlug: article.slug,
      articleTitle: article.title,
      articleStatus: article.status,
      publishedAt: article.publishedAt,
      links,
    });
  }

  console.log(`   ✅ Enlaces extraídos\n`);

  // 3. Verificar enlaces rotos
  console.log('3️⃣ Verificando enlaces rotos...');
  const brokenLinks: LinkAnalysis['brokenLinks'] = [];
  const slugSet = new Set(articles.map(a => a.slug));

  for (const article of allArticlesLinks) {
    for (const link of article.links) {
      if (link.type === 'internal-blog' && link.targetSlug) {
        if (!slugSet.has(link.targetSlug)) {
          brokenLinks.push({
            sourceArticleSlug: article.articleSlug,
            sourceArticleTitle: article.articleTitle,
            targetSlug: link.targetSlug,
            linkText: link.text,
            reason: 'El slug no existe en la base de datos',
          });
        } else {
          // Verificar si el artículo de destino está publicado
          const targetArticle = articles.find(a => a.slug === link.targetSlug);
          if (targetArticle && targetArticle.status !== 'PUBLISHED' && article.articleStatus === 'PUBLISHED') {
            brokenLinks.push({
              sourceArticleSlug: article.articleSlug,
              sourceArticleTitle: article.articleTitle,
              targetSlug: link.targetSlug,
              linkText: link.text,
              reason: `El artículo de destino está en estado ${targetArticle.status}`,
            });
          }
        }
      }
    }
  }

  console.log(`   ⚠️  ${brokenLinks.length} enlaces rotos encontrados\n`);

  // 4. Construir matriz de enlaces
  console.log('4️⃣ Construyendo matriz de enlaces...');
  const linkMatrix: Record<string, string[]> = {};
  const incomingLinksCount: Record<string, number> = {};
  const outgoingLinksCount: Record<string, number> = {};

  // Inicializar contadores
  for (const article of articles) {
    incomingLinksCount[article.slug] = 0;
    outgoingLinksCount[article.slug] = 0;
  }

  for (const article of allArticlesLinks) {
    const blogLinks = article.links.filter(l => l.type === 'internal-blog' && l.targetSlug);
    const targetSlugs = [...new Set(blogLinks.map(l => l.targetSlug!))];

    linkMatrix[article.articleSlug] = targetSlugs;
    outgoingLinksCount[article.articleSlug] = targetSlugs.length;

    for (const targetSlug of targetSlugs) {
      if (incomingLinksCount[targetSlug] !== undefined) {
        incomingLinksCount[targetSlug]++;
      }
    }
  }

  console.log(`   ✅ Matriz construida\n`);

  // 5. Identificar artículos huérfanos (sin enlaces entrantes)
  console.log('5️⃣ Identificando artículos huérfanos...');
  const orphanArticles = articles
    .filter(a => incomingLinksCount[a.slug] === 0 && a.status === 'PUBLISHED')
    .map(a => ({
      slug: a.slug,
      title: a.title,
      status: a.status,
    }));

  console.log(`   👻 ${orphanArticles.length} artículos huérfanos encontrados\n`);

  // 6. Identificar artículos sin enlaces salientes
  console.log('6️⃣ Identificando artículos sin enlaces salientes...');
  const articlesWithoutOutgoingLinks = articles
    .filter(a => outgoingLinksCount[a.slug] === 0 && a.status === 'PUBLISHED')
    .map(a => ({
      slug: a.slug,
      title: a.title,
      status: a.status,
    }));

  console.log(`   🚫 ${articlesWithoutOutgoingLinks.length} artículos sin enlaces salientes encontrados\n`);

  return {
    allArticles: allArticlesLinks,
    brokenLinks,
    orphanArticles,
    articlesWithoutOutgoingLinks,
    linkMatrix,
    incomingLinksCount,
    outgoingLinksCount,
  };
}

function generateMarkdownReport(analysis: LinkAnalysis): string {
  const report: string[] = [];

  report.push('# 📊 Análisis de Enlaces Internos del Blog de Itineramio\n');
  report.push(`**Generado:** ${new Date().toLocaleString('es-ES')}\n`);
  report.push('---\n');

  // Resumen ejecutivo
  report.push('## 📈 Resumen Ejecutivo\n');
  report.push(`- **Total de artículos analizados:** ${analysis.allArticles.length}`);
  report.push(`- **Enlaces rotos encontrados:** ${analysis.brokenLinks.length}`);
  report.push(`- **Artículos huérfanos (sin enlaces entrantes):** ${analysis.orphanArticles.length}`);
  report.push(`- **Artículos sin enlaces salientes:** ${analysis.articlesWithoutOutgoingLinks.length}\n`);

  // Enlaces rotos
  report.push('---\n');
  report.push('## 🔗 Enlaces Rotos\n');
  if (analysis.brokenLinks.length === 0) {
    report.push('✅ **¡No se encontraron enlaces rotos!**\n');
  } else {
    report.push('⚠️ Se encontraron los siguientes enlaces rotos:\n');
    for (const broken of analysis.brokenLinks) {
      report.push(`### \`${broken.sourceArticleSlug}\``);
      report.push(`- **Artículo origen:** ${broken.sourceArticleTitle}`);
      report.push(`- **Slug de destino:** \`${broken.targetSlug}\``);
      report.push(`- **Texto del enlace:** "${broken.linkText}"`);
      report.push(`- **Razón:** ${broken.reason}\n`);
    }
  }

  // Artículos huérfanos
  report.push('---\n');
  report.push('## 👻 Artículos Huérfanos (Sin Enlaces Entrantes)\n');
  if (analysis.orphanArticles.length === 0) {
    report.push('✅ **¡Todos los artículos publicados tienen al menos un enlace entrante!**\n');
  } else {
    report.push('⚠️ Estos artículos no reciben enlaces de otros artículos:\n');
    for (const orphan of analysis.orphanArticles) {
      report.push(`- **[\`${orphan.slug}\`]** - ${orphan.title}`);
    }
    report.push('');
  }

  // Artículos sin enlaces salientes
  report.push('---\n');
  report.push('## 🚫 Artículos Sin Enlaces Salientes\n');
  if (analysis.articlesWithoutOutgoingLinks.length === 0) {
    report.push('✅ **¡Todos los artículos publicados tienen enlaces salientes!**\n');
  } else {
    report.push('⚠️ Estos artículos no enlazan a otros artículos del blog:\n');
    for (const article of analysis.articlesWithoutOutgoingLinks) {
      report.push(`- **[\`${article.slug}\`]** - ${article.title}`);
    }
    report.push('');
  }

  // Ranking de artículos por enlaces entrantes
  report.push('---\n');
  report.push('## 🏆 Ranking: Artículos Más Enlazados\n');
  const sortedByIncoming = Object.entries(analysis.incomingLinksCount)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sortedByIncoming.length > 0) {
    report.push('| Posición | Artículo | Enlaces Entrantes |');
    report.push('|----------|----------|-------------------|');
    sortedByIncoming.forEach(([slug, count], index) => {
      const article = analysis.allArticles.find(a => a.articleSlug === slug);
      const title = article ? article.articleTitle.substring(0, 50) : slug;
      report.push(`| ${index + 1} | ${title} | ${count} |`);
    });
    report.push('');
  }

  // Ranking de artículos por enlaces salientes
  report.push('---\n');
  report.push('## 🔗 Ranking: Artículos Más Conectores\n');
  const sortedByOutgoing = Object.entries(analysis.outgoingLinksCount)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sortedByOutgoing.length > 0) {
    report.push('| Posición | Artículo | Enlaces Salientes |');
    report.push('|----------|----------|-------------------|');
    sortedByOutgoing.forEach(([slug, count], index) => {
      const article = analysis.allArticles.find(a => a.articleSlug === slug);
      const title = article ? article.articleTitle.substring(0, 50) : slug;
      report.push(`| ${index + 1} | ${title} | ${count} |`);
    });
    report.push('');
  }

  // Matriz completa de conexiones
  report.push('---\n');
  report.push('## 🗺️ Matriz de Conexiones\n');
  report.push('Conexiones entre artículos del blog:\n');

  const articlesWithLinks = Object.entries(analysis.linkMatrix)
    .filter(([_, targets]) => targets.length > 0)
    .sort(([, a], [, b]) => b.length - a.length);

  if (articlesWithLinks.length > 0) {
    for (const [sourceSlug, targetSlugs] of articlesWithLinks) {
      const sourceArticle = analysis.allArticles.find(a => a.articleSlug === sourceSlug);
      report.push(`### \`${sourceSlug}\``);
      report.push(`**${sourceArticle?.articleTitle || sourceSlug}**`);
      report.push(`**Enlaces salientes (${targetSlugs.length}):**\n`);
      for (const targetSlug of targetSlugs) {
        const targetArticle = analysis.allArticles.find(a => a.articleSlug === targetSlug);
        report.push(`- [\`${targetSlug}\`] - ${targetArticle?.articleTitle || 'Título no encontrado'}`);
      }
      report.push('');
    }
  } else {
    report.push('⚠️ No se encontraron conexiones entre artículos.\n');
  }

  // Estadísticas por tipo de enlace
  report.push('---\n');
  report.push('## 📊 Estadísticas Generales\n');

  const totalBlogLinks = analysis.allArticles.reduce(
    (sum, article) => sum + article.links.filter(l => l.type === 'internal-blog').length,
    0
  );
  const totalOtherLinks = analysis.allArticles.reduce(
    (sum, article) => sum + article.links.filter(l => l.type === 'internal-other').length,
    0
  );
  const totalExternalLinks = analysis.allArticles.reduce(
    (sum, article) => sum + article.links.filter(l => l.type === 'external').length,
    0
  );

  const publishedArticles = analysis.allArticles.filter(a => a.articleStatus === 'PUBLISHED').length;

  report.push(`- **Total de artículos publicados:** ${publishedArticles}`);
  report.push(`- **Total de enlaces a otros artículos del blog:** ${totalBlogLinks}`);
  report.push(`- **Total de enlaces a otras páginas de Itineramio:** ${totalOtherLinks}`);
  report.push(`- **Total de enlaces externos:** ${totalExternalLinks}`);
  report.push(`- **Promedio de enlaces por artículo:** ${(totalBlogLinks / analysis.allArticles.length).toFixed(2)}`);

  // Recomendaciones
  report.push('\n---\n');
  report.push('## 💡 Recomendaciones\n');

  if (analysis.orphanArticles.length > 0) {
    report.push('### Artículos Huérfanos');
    report.push('Se recomienda añadir enlaces desde otros artículos relevantes hacia:\n');
    for (const orphan of analysis.orphanArticles.slice(0, 5)) {
      report.push(`- **${orphan.title}** (\`${orphan.slug}\`)`);
    }
    report.push('');
  }

  if (analysis.articlesWithoutOutgoingLinks.length > 0) {
    report.push('### Artículos Sin Enlaces Salientes');
    report.push('Se recomienda añadir enlaces a artículos relacionados desde:\n');
    for (const article of analysis.articlesWithoutOutgoingLinks.slice(0, 5)) {
      report.push(`- **${article.title}** (\`${article.slug}\`)`);
    }
    report.push('');
  }

  if (analysis.brokenLinks.length > 0) {
    report.push('### Enlaces Rotos');
    report.push('Se deben corregir o eliminar los siguientes enlaces rotos:\n');
    const uniqueBrokenSources = [...new Set(analysis.brokenLinks.map(b => b.sourceArticleSlug))];
    for (const slug of uniqueBrokenSources.slice(0, 5)) {
      const count = analysis.brokenLinks.filter(b => b.sourceArticleSlug === slug).length;
      report.push(`- **\`${slug}\`** (${count} enlaces rotos)`);
    }
    report.push('');
  }

  report.push('### Estrategia de Linking Interno');
  report.push('1. Priorizar enlaces desde artículos con mayor tráfico hacia artículos huérfanos');
  report.push('2. Crear "hub articles" que agrupen contenido relacionado');
  report.push('3. Mantener un mínimo de 2-3 enlaces internos por artículo');
  report.push('4. Revisar y actualizar enlaces regularmente\n');

  // Detalles adicionales
  report.push('---\n');
  report.push('## 📋 Detalle de Enlaces por Artículo\n');

  const publishedArticlesWithLinks = analysis.allArticles
    .filter(a => a.articleStatus === 'PUBLISHED')
    .sort((a, b) => b.links.filter(l => l.type === 'internal-blog').length - a.links.filter(l => l.type === 'internal-blog').length);

  for (const article of publishedArticlesWithLinks) {
    const blogLinks = article.links.filter(l => l.type === 'internal-blog');
    const otherLinks = article.links.filter(l => l.type === 'internal-other');
    const externalLinks = article.links.filter(l => l.type === 'external');
    const incoming = analysis.incomingLinksCount[article.articleSlug] || 0;

    report.push(`### ${article.articleTitle}`);
    report.push(`**Slug:** \`${article.articleSlug}\``);
    report.push(`**Enlaces entrantes:** ${incoming}`);
    report.push(`**Enlaces salientes a blog:** ${blogLinks.length}`);
    report.push(`**Enlaces a otras páginas:** ${otherLinks.length}`);
    report.push(`**Enlaces externos:** ${externalLinks.length}\n`);

    if (blogLinks.length > 0) {
      report.push('**Enlaces a artículos del blog:**');
      for (const link of blogLinks) {
        report.push(`- [${link.text || 'Sin texto'}](${link.url})`);
      }
      report.push('');
    }
  }

  return report.join('\n');
}

async function main() {
  try {
    const analysis = await analyzeLinks();
    const report = generateMarkdownReport(analysis);

    // Guardar reporte
    const fs = require('fs');
    const reportPath = '/tmp/blog-internal-links-report.md';
    fs.writeFileSync(reportPath, report, 'utf-8');

    console.log('✅ Análisis completado!');
    console.log(`📄 Reporte guardado en: ${reportPath}\n`);
    console.log('📊 Resumen:');
    console.log(`   - Total de artículos: ${analysis.allArticles.length}`);
    console.log(`   - Enlaces rotos: ${analysis.brokenLinks.length}`);
    console.log(`   - Artículos huérfanos: ${analysis.orphanArticles.length}`);
    console.log(`   - Sin enlaces salientes: ${analysis.articlesWithoutOutgoingLinks.length}`);
  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
