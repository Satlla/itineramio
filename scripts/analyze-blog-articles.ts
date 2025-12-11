import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ArticleAnalysis {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  status: string;
  featured: boolean;

  // Content analysis
  contentLength: number;
  excerptLength: number;
  hasExcerpt: boolean;
  contentFormat: 'HTML' | 'MARKDOWN' | 'MIXED' | 'UNKNOWN';

  // Format issues
  hasUnconvertedTailwind: boolean;
  hasVisibleHTML: boolean;
  hasClassAttribute: boolean;
  tailwindClassCount: number;

  // Images
  coverImage: string | null;
  coverImageAlt: string | null;
  imagesInContent: number;
  imageUrls: string[];

  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  keywords: string[];
  tags: string[];

  // Performance
  views: number;
  uniqueViews: number;
  readTime: number;
  likes: number;
  shares: number;

  // Dates
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  scheduledFor: Date | null;

  // Author
  authorId: string;
  authorName: string;
  authorImage: string | null;

  // Quality flags
  isTooShort: boolean;
  missingMetaData: string[];
  formatIssues: string[];
}

interface CategoryStats {
  category: string;
  count: number;
  published: number;
  draft: number;
  avgLength: number;
  avgViews: number;
  totalViews: number;
}

interface StatusStats {
  status: string;
  count: number;
  percentage: number;
}

interface ReportSummary {
  totalArticles: number;
  byStatus: StatusStats[];
  byCategory: CategoryStats[];
  avgContentLength: number;
  articlesWithIssues: number;
  articlesWithoutMetaDescription: number;
  articlesWithoutExcerpt: number;
  shortArticles: number;
  articlesWithTailwindIssues: number;
  articlesWithHTMLIssues: number;
  totalViews: number;
  avgViews: number;
}

async function analyzeContent(content: string): Promise<{
  format: 'HTML' | 'MARKDOWN' | 'MIXED' | 'UNKNOWN';
  hasUnconvertedTailwind: boolean;
  hasVisibleHTML: boolean;
  hasClassAttribute: boolean;
  tailwindClassCount: number;
  imagesCount: number;
  imageUrls: string[];
}> {
  // Detect format
  const hasHTMLTags = /<[^>]+>/g.test(content);
  const hasMarkdown = /^#{1,6}\s|^\*\*|^-\s|\[.*\]\(.*\)/m.test(content);

  let format: 'HTML' | 'MARKDOWN' | 'MIXED' | 'UNKNOWN' = 'UNKNOWN';
  if (hasHTMLTags && hasMarkdown) format = 'MIXED';
  else if (hasHTMLTags) format = 'HTML';
  else if (hasMarkdown) format = 'MARKDOWN';

  // Check for class= attribute (could be unconverted Tailwind)
  const hasClassAttribute = /class=["'][^"']*["']/g.test(content);

  // Count Tailwind classes (common patterns)
  const tailwindMatches = content.match(/class=["']([^"']*)["']/g) || [];
  const tailwindClassCount = tailwindMatches.length;

  // Check for visible HTML (HTML shown as text)
  const hasVisibleHTML = /&lt;|&gt;|&amp;lt;|&amp;gt;/.test(content);

  // Extract images
  const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["']/g) || [];
  const mdImgMatches = content.match(/!\[.*?\]\((.*?)\)/g) || [];

  const imageUrls: string[] = [];

  // Extract HTML img src
  imgMatches.forEach(match => {
    const srcMatch = match.match(/src=["']([^"']+)["']/);
    if (srcMatch) imageUrls.push(srcMatch[1]);
  });

  // Extract Markdown img src
  mdImgMatches.forEach(match => {
    const srcMatch = match.match(/!\[.*?\]\((.*?)\)/);
    if (srcMatch) imageUrls.push(srcMatch[1]);
  });

  return {
    format,
    hasUnconvertedTailwind: hasClassAttribute && tailwindClassCount > 0,
    hasVisibleHTML,
    hasClassAttribute,
    tailwindClassCount,
    imagesCount: imageUrls.length,
    imageUrls
  };
}

async function analyzeArticles() {
  console.log('🔍 Fetching all blog articles from database...\n');

  const articles = await prisma.blogPost.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`📊 Found ${articles.length} articles. Analyzing...\n`);

  const analyses: ArticleAnalysis[] = [];

  for (const article of articles) {
    const contentAnalysis = await analyzeContent(article.content);
    const excerptLength = article.excerpt?.length || 0;
    const metaDescriptionLength = article.metaDescription?.length || 0;

    const missingMetaData: string[] = [];
    if (!article.metaTitle) missingMetaData.push('metaTitle');
    if (!article.metaDescription) missingMetaData.push('metaDescription');
    if (!article.excerpt) missingMetaData.push('excerpt');
    if (!article.coverImage) missingMetaData.push('coverImage');
    if (article.keywords.length === 0) missingMetaData.push('keywords');

    const formatIssues: string[] = [];
    if (contentAnalysis.hasUnconvertedTailwind) formatIssues.push('Unconverted Tailwind classes');
    if (contentAnalysis.hasVisibleHTML) formatIssues.push('Visible HTML entities');
    if (article.content.length < 5000) formatIssues.push('Content too short');
    if (metaDescriptionLength > 160) formatIssues.push('Meta description too long');
    if (metaDescriptionLength < 120 && metaDescriptionLength > 0) formatIssues.push('Meta description too short');

    analyses.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      subtitle: article.subtitle,
      category: article.category,
      status: article.status,
      featured: article.featured,

      contentLength: article.content.length,
      excerptLength,
      hasExcerpt: !!article.excerpt,
      contentFormat: contentAnalysis.format,

      hasUnconvertedTailwind: contentAnalysis.hasUnconvertedTailwind,
      hasVisibleHTML: contentAnalysis.hasVisibleHTML,
      hasClassAttribute: contentAnalysis.hasClassAttribute,
      tailwindClassCount: contentAnalysis.tailwindClassCount,

      coverImage: article.coverImage,
      coverImageAlt: article.coverImageAlt,
      imagesInContent: contentAnalysis.imagesCount,
      imageUrls: contentAnalysis.imageUrls,

      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      hasMetaTitle: !!article.metaTitle,
      hasMetaDescription: !!article.metaDescription,
      metaDescriptionLength,
      keywords: article.keywords,
      tags: article.tags,

      views: article.views,
      uniqueViews: article.uniqueViews,
      readTime: article.readTime,
      likes: article.likes,
      shares: article.shares,

      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      scheduledFor: article.scheduledFor,

      authorId: article.authorId,
      authorName: article.authorName,
      authorImage: article.authorImage,

      isTooShort: article.content.length < 5000,
      missingMetaData,
      formatIssues
    });
  }

  // Generate summary statistics
  const totalArticles = analyses.length;

  // By status
  const statusCounts = analyses.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byStatus: StatusStats[] = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / totalArticles) * 100)
  }));

  // By category
  const categoryMap = new Map<string, {
    count: number;
    published: number;
    draft: number;
    totalLength: number;
    totalViews: number;
  }>();

  analyses.forEach(a => {
    const existing = categoryMap.get(a.category) || {
      count: 0,
      published: 0,
      draft: 0,
      totalLength: 0,
      totalViews: 0
    };

    categoryMap.set(a.category, {
      count: existing.count + 1,
      published: existing.published + (a.status === 'PUBLISHED' ? 1 : 0),
      draft: existing.draft + (a.status === 'DRAFT' ? 1 : 0),
      totalLength: existing.totalLength + a.contentLength,
      totalViews: existing.totalViews + a.views
    });
  });

  const byCategory: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    count: stats.count,
    published: stats.published,
    draft: stats.draft,
    avgLength: Math.round(stats.totalLength / stats.count),
    avgViews: Math.round(stats.totalViews / stats.count),
    totalViews: stats.totalViews
  }));

  const summary: ReportSummary = {
    totalArticles,
    byStatus,
    byCategory,
    avgContentLength: Math.round(analyses.reduce((sum, a) => sum + a.contentLength, 0) / totalArticles),
    articlesWithIssues: analyses.filter(a => a.formatIssues.length > 0).length,
    articlesWithoutMetaDescription: analyses.filter(a => !a.hasMetaDescription).length,
    articlesWithoutExcerpt: analyses.filter(a => !a.hasExcerpt).length,
    shortArticles: analyses.filter(a => a.isTooShort).length,
    articlesWithTailwindIssues: analyses.filter(a => a.hasUnconvertedTailwind).length,
    articlesWithHTMLIssues: analyses.filter(a => a.hasVisibleHTML).length,
    totalViews: analyses.reduce((sum, a) => sum + a.views, 0),
    avgViews: Math.round(analyses.reduce((sum, a) => sum + a.views, 0) / totalArticles)
  };

  return { analyses, summary };
}

async function generateJSONReport(analyses: ArticleAnalysis[], summary: ReportSummary) {
  const outputPath = '/tmp/blog-articles-analysis.json';

  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    articles: analyses
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report generated: ${outputPath}`);
}

async function generateMarkdownReport(analyses: ArticleAnalysis[], summary: ReportSummary) {
  const outputPath = '/tmp/blog-articles-report.md';

  const lines: string[] = [];

  lines.push('# Reporte Completo de Artículos del Blog de Itineramio');
  lines.push('');
  lines.push(`**Generado:** ${new Date().toLocaleString('es-ES')}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Summary
  lines.push('## Resumen Ejecutivo');
  lines.push('');
  lines.push(`- **Total de artículos:** ${summary.totalArticles}`);
  lines.push(`- **Longitud promedio:** ${summary.avgContentLength.toLocaleString()} caracteres`);
  lines.push(`- **Vistas totales:** ${summary.totalViews.toLocaleString()}`);
  lines.push(`- **Vistas promedio por artículo:** ${summary.avgViews.toLocaleString()}`);
  lines.push('');

  // Status breakdown
  lines.push('## Artículos por Estado');
  lines.push('');
  lines.push('| Estado | Cantidad | Porcentaje |');
  lines.push('|--------|----------|------------|');
  summary.byStatus.forEach(s => {
    lines.push(`| ${s.status} | ${s.count} | ${s.percentage}% |`);
  });
  lines.push('');

  // Category breakdown
  lines.push('## Artículos por Categoría');
  lines.push('');
  lines.push('| Categoría | Total | Publicados | Borrador | Long. Promedio | Vistas Promedio | Vistas Totales |');
  lines.push('|-----------|-------|------------|----------|----------------|-----------------|----------------|');
  summary.byCategory.forEach(c => {
    lines.push(`| ${c.category} | ${c.count} | ${c.published} | ${c.draft} | ${c.avgLength.toLocaleString()} | ${c.avgViews.toLocaleString()} | ${c.totalViews.toLocaleString()} |`);
  });
  lines.push('');

  // Issues summary
  lines.push('## Problemas Detectados');
  lines.push('');
  lines.push(`- **Artículos con problemas de formato:** ${summary.articlesWithIssues}`);
  lines.push(`- **Artículos sin meta description:** ${summary.articlesWithoutMetaDescription}`);
  lines.push(`- **Artículos sin excerpt:** ${summary.articlesWithoutExcerpt}`);
  lines.push(`- **Artículos muy cortos (< 5000 caracteres):** ${summary.shortArticles}`);
  lines.push(`- **Artículos con clases Tailwind sin convertir:** ${summary.articlesWithTailwindIssues}`);
  lines.push(`- **Artículos con HTML visible como texto:** ${summary.articlesWithHTMLIssues}`);
  lines.push('');

  // Articles with format issues
  const articlesWithFormatIssues = analyses.filter(a => a.formatIssues.length > 0);
  if (articlesWithFormatIssues.length > 0) {
    lines.push('## Artículos con Problemas de Formato');
    lines.push('');
    lines.push('| Título | Slug | Estado | Problemas |');
    lines.push('|--------|------|--------|-----------|');
    articlesWithFormatIssues.forEach(a => {
      lines.push(`| ${a.title} | \`${a.slug}\` | ${a.status} | ${a.formatIssues.join(', ')} |`);
    });
    lines.push('');
  }

  // Articles without meta description
  const articlesWithoutMeta = analyses.filter(a => !a.hasMetaDescription);
  if (articlesWithoutMeta.length > 0) {
    lines.push('## Artículos sin Meta Description');
    lines.push('');
    lines.push('| Título | Slug | Estado | Categoría |');
    lines.push('|--------|------|--------|-----------|');
    articlesWithoutMeta.forEach(a => {
      lines.push(`| ${a.title} | \`${a.slug}\` | ${a.status} | ${a.category} |`);
    });
    lines.push('');
  }

  // Articles without excerpt
  const articlesWithoutExcerpt = analyses.filter(a => !a.hasExcerpt);
  if (articlesWithoutExcerpt.length > 0) {
    lines.push('## Artículos sin Excerpt');
    lines.push('');
    lines.push('| Título | Slug | Estado | Categoría |');
    lines.push('|--------|------|--------|-----------|');
    articlesWithoutExcerpt.forEach(a => {
      lines.push(`| ${a.title} | \`${a.slug}\` | ${a.status} | ${a.category} |`);
    });
    lines.push('');
  }

  // Short articles
  const shortArticles = analyses.filter(a => a.isTooShort);
  if (shortArticles.length > 0) {
    lines.push('## Artículos Muy Cortos (< 5000 caracteres)');
    lines.push('');
    lines.push('| Título | Slug | Estado | Longitud | Categoría |');
    lines.push('|--------|------|--------|----------|-----------|');
    shortArticles.forEach(a => {
      lines.push(`| ${a.title} | \`${a.slug}\` | ${a.status} | ${a.contentLength.toLocaleString()} | ${a.category} |`);
    });
    lines.push('');
  }

  // Articles with Tailwind issues
  const articlesWithTailwind = analyses.filter(a => a.hasUnconvertedTailwind);
  if (articlesWithTailwind.length > 0) {
    lines.push('## Artículos con Clases Tailwind Sin Convertir');
    lines.push('');
    lines.push('| Título | Slug | Estado | Clases Encontradas |');
    lines.push('|--------|------|--------|--------------------|');
    articlesWithTailwind.forEach(a => {
      lines.push(`| ${a.title} | \`${a.slug}\` | ${a.status} | ${a.tailwindClassCount} |`);
    });
    lines.push('');
  }

  // Top performing articles
  const topArticles = [...analyses]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  if (topArticles.length > 0) {
    lines.push('## Top 10 Artículos Más Vistos');
    lines.push('');
    lines.push('| Posición | Título | Slug | Vistas | Vistas Únicas | Categoría |');
    lines.push('|----------|--------|------|--------|---------------|-----------|');
    topArticles.forEach((a, i) => {
      lines.push(`| ${i + 1} | ${a.title} | \`${a.slug}\` | ${a.views.toLocaleString()} | ${a.uniqueViews.toLocaleString()} | ${a.category} |`);
    });
    lines.push('');
  }

  // Detailed article list
  lines.push('## Lista Completa de Artículos');
  lines.push('');
  lines.push('| Título | Slug | Estado | Categoría | Longitud | Vistas | Fecha Creación |');
  lines.push('|--------|------|--------|-----------|----------|--------|----------------|');
  analyses.forEach(a => {
    const createdDate = new Date(a.createdAt).toLocaleDateString('es-ES');
    lines.push(`| ${a.title} | \`${a.slug}\` | ${a.status} | ${a.category} | ${a.contentLength.toLocaleString()} | ${a.views} | ${createdDate} |`);
  });
  lines.push('');

  // Content format analysis
  lines.push('## Análisis de Formato de Contenido');
  lines.push('');
  const formatCounts = analyses.reduce((acc, a) => {
    acc[a.contentFormat] = (acc[a.contentFormat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  lines.push('| Formato | Cantidad |');
  lines.push('|---------|----------|');
  Object.entries(formatCounts).forEach(([format, count]) => {
    lines.push(`| ${format} | ${count} |`);
  });
  lines.push('');

  // Image analysis
  lines.push('## Análisis de Imágenes');
  lines.push('');
  const articlesWithCoverImage = analyses.filter(a => a.coverImage).length;
  const articlesWithAltText = analyses.filter(a => a.coverImageAlt).length;
  const avgImagesPerArticle = Math.round(analyses.reduce((sum, a) => sum + a.imagesInContent, 0) / analyses.length);

  lines.push(`- **Artículos con imagen de portada:** ${articlesWithCoverImage} / ${summary.totalArticles}`);
  lines.push(`- **Artículos con texto alternativo en portada:** ${articlesWithAltText} / ${articlesWithCoverImage}`);
  lines.push(`- **Promedio de imágenes por artículo:** ${avgImagesPerArticle}`);
  lines.push('');

  // Recommendations
  lines.push('## Recomendaciones');
  lines.push('');
  lines.push('### Prioridad Alta');
  lines.push('');
  if (summary.articlesWithoutMetaDescription > 0) {
    lines.push(`- ✅ Agregar meta description a ${summary.articlesWithoutMetaDescription} artículos`);
  }
  if (summary.articlesWithoutExcerpt > 0) {
    lines.push(`- ✅ Agregar excerpt a ${summary.articlesWithoutExcerpt} artículos`);
  }
  if (summary.articlesWithTailwindIssues > 0) {
    lines.push(`- ✅ Convertir clases Tailwind en ${summary.articlesWithTailwindIssues} artículos`);
  }
  lines.push('');

  lines.push('### Prioridad Media');
  lines.push('');
  if (summary.shortArticles > 0) {
    lines.push(`- 📝 Expandir contenido de ${summary.shortArticles} artículos cortos`);
  }
  if (articlesWithCoverImage < summary.totalArticles) {
    lines.push(`- 🖼️ Agregar imagen de portada a ${summary.totalArticles - articlesWithCoverImage} artículos`);
  }
  if (articlesWithAltText < articlesWithCoverImage) {
    lines.push(`- ♿ Agregar texto alternativo a ${articlesWithCoverImage - articlesWithAltText} imágenes de portada`);
  }
  lines.push('');

  lines.push('### Prioridad Baja');
  lines.push('');
  lines.push('- 📊 Revisar keywords en artículos sin ellas');
  lines.push('- 🏷️ Agregar tags relevantes a artículos');
  lines.push('- 🔄 Actualizar artículos con bajo engagement');
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push(`*Reporte generado automáticamente el ${new Date().toLocaleString('es-ES')}*`);

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`✅ Markdown report generated: ${outputPath}`);
}

async function main() {
  try {
    const { analyses, summary } = await analyzeArticles();

    await generateJSONReport(analyses, summary);
    await generateMarkdownReport(analyses, summary);

    console.log('\n✨ Analysis complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Total articles: ${summary.totalArticles}`);
    console.log(`   - Published: ${summary.byStatus.find(s => s.status === 'PUBLISHED')?.count || 0}`);
    console.log(`   - Draft: ${summary.byStatus.find(s => s.status === 'DRAFT')?.count || 0}`);
    console.log(`   - Articles with issues: ${summary.articlesWithIssues}`);
    console.log(`   - Average length: ${summary.avgContentLength.toLocaleString()} characters`);
    console.log(`   - Total views: ${summary.totalViews.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error analyzing articles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
