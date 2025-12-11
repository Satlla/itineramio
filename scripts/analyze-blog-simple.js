/**
 * Versión simplificada del análisis de blog en JavaScript puro
 * No requiere compilación de TypeScript
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function analyzeContent(content) {
  // Detect format
  const hasHTMLTags = /<[^>]+>/g.test(content);
  const hasMarkdown = /^#{1,6}\s|^\*\*|^-\s|\[.*\]\(.*\)/m.test(content);

  let format = 'UNKNOWN';
  if (hasHTMLTags && hasMarkdown) format = 'MIXED';
  else if (hasHTMLTags) format = 'HTML';
  else if (hasMarkdown) format = 'MARKDOWN';

  // Check for class= attribute (could be unconverted Tailwind)
  const hasClassAttribute = /class=["'][^"']*["']/g.test(content);

  // Count Tailwind classes
  const tailwindMatches = content.match(/class=["']([^"']*)["']/g) || [];
  const tailwindClassCount = tailwindMatches.length;

  // Check for visible HTML
  const hasVisibleHTML = /&lt;|&gt;|&amp;lt;|&amp;gt;/.test(content);

  // Extract images
  const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["']/g) || [];
  const mdImgMatches = content.match(/!\[.*?\]\((.*?)\)/g) || [];

  const imageUrls = [];

  imgMatches.forEach(match => {
    const srcMatch = match.match(/src=["']([^"']+)["']/);
    if (srcMatch) imageUrls.push(srcMatch[1]);
  });

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

async function main() {
  console.log('🔍 Fetching all blog articles from database...\n');

  const articles = await prisma.blogPost.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`📊 Found ${articles.length} articles. Analyzing...\n`);

  const analyses = [];

  for (const article of articles) {
    const contentAnalysis = await analyzeContent(article.content);
    const excerptLength = article.excerpt?.length || 0;
    const metaDescriptionLength = article.metaDescription?.length || 0;

    const missingMetaData = [];
    if (!article.metaTitle) missingMetaData.push('metaTitle');
    if (!article.metaDescription) missingMetaData.push('metaDescription');
    if (!article.excerpt) missingMetaData.push('excerpt');
    if (!article.coverImage) missingMetaData.push('coverImage');
    if (article.keywords.length === 0) missingMetaData.push('keywords');

    const formatIssues = [];
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

  // Generate summary
  const totalArticles = analyses.length;

  const statusCounts = {};
  analyses.forEach(a => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / totalArticles) * 100)
  }));

  const categoryMap = new Map();
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

  const byCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    count: stats.count,
    published: stats.published,
    draft: stats.draft,
    avgLength: Math.round(stats.totalLength / stats.count),
    avgViews: Math.round(stats.totalViews / stats.count),
    totalViews: stats.totalViews
  }));

  const summary = {
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

  // Save JSON
  const jsonReport = {
    generatedAt: new Date().toISOString(),
    summary,
    articles: analyses
  };

  fs.writeFileSync('/tmp/blog-articles-analysis.json', JSON.stringify(jsonReport, null, 2), 'utf-8');
  console.log('✅ JSON report generated: /tmp/blog-articles-analysis.json');

  // Generate Markdown (simplified version)
  const lines = [];
  lines.push('# Reporte de Artículos del Blog de Itineramio');
  lines.push('');
  lines.push(`**Generado:** ${new Date().toLocaleString('es-ES')}`);
  lines.push('');
  lines.push('## Resumen');
  lines.push('');
  lines.push(`- Total de artículos: ${summary.totalArticles}`);
  lines.push(`- Longitud promedio: ${summary.avgContentLength.toLocaleString()} caracteres`);
  lines.push(`- Vistas totales: ${summary.totalViews.toLocaleString()}`);
  lines.push(`- Artículos con problemas: ${summary.articlesWithIssues}`);
  lines.push('');

  fs.writeFileSync('/tmp/blog-articles-report.md', lines.join('\n'), 'utf-8');
  console.log('✅ Markdown report generated: /tmp/blog-articles-report.md');

  console.log('\n✨ Analysis complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Total articles: ${summary.totalArticles}`);
  console.log(`   - Published: ${byStatus.find(s => s.status === 'PUBLISHED')?.count || 0}`);
  console.log(`   - Draft: ${byStatus.find(s => s.status === 'DRAFT')?.count || 0}`);
  console.log(`   - Articles with issues: ${summary.articlesWithIssues}`);
  console.log(`   - Average length: ${summary.avgContentLength.toLocaleString()} characters`);

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
