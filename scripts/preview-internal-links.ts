import { PrismaClient } from '@prisma/client';
import { load } from 'cheerio';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
    }
  }
});

// Color del enlace para consistencia
const LINK_COLOR = '#6366f1';

// Configuración simplificada para preview
const linkPlacements = [
  {
    targetSlug: 'del-modo-bombero-al-modo-ceo-framework',
    targetTitle: 'Del Modo Bombero al Modo CEO: Framework',
    placements: [
      {
        sourceSlug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa',
        searchText: 'dejó de apagar fuegos',
        linkText: 'dejó de apagar fuegos',
      },
      {
        sourceSlug: 'automatizacion-anfitriones-airbnb',
        searchText: 'gestión eficiente',
        linkText: 'gestión eficiente',
      },
    ],
  },
  {
    targetSlug: 'automatizacion-airbnb-recupera-8-horas-semanales',
    targetTitle: 'Automatización Airbnb: Recupera 8 Horas Semanales',
    placements: [
      {
        sourceSlug: 'mensajes-automaticos-airbnb',
        searchText: 'automatización completa',
        linkText: 'automatización completa',
      },
    ],
  },
];

/**
 * Preview del script sin hacer cambios en la base de datos
 */
async function previewInternalLinks() {
  console.log('👁️  PREVIEW: ENLACES INTERNOS ESTRATÉGICOS\n');
  console.log('='.repeat(80));
  console.log('\n⚠️  MODO PREVIEW: No se harán cambios en la base de datos\n');
  console.log('📋 Configuración:');
  console.log(`   - Artículos huérfanos a promocionar: ${linkPlacements.length}`);
  console.log(`   - Total de enlaces a agregar: ${linkPlacements.reduce((sum, lp) => sum + lp.placements.length, 0)}`);
  console.log(`   - Color de enlaces: ${LINK_COLOR}\n`);
  console.log('='.repeat(80));
  console.log('');

  let totalPossibleLinks = 0;
  let totalArticlesFound = 0;
  let totalArticlesNotFound = 0;
  let totalTextMatches = 0;

  for (const linkPlacement of linkPlacements) {
    console.log(`\n🎯 Artículo Objetivo: ${linkPlacement.targetTitle}`);
    console.log(`   Slug: ${linkPlacement.targetSlug}`);
    console.log(`   Enlaces a agregar: ${linkPlacement.placements.length}\n`);

    // Verificar que el artículo objetivo existe
    const targetArticle = await prisma.blogPost.findUnique({
      where: { slug: linkPlacement.targetSlug },
      select: { id: true, title: true, status: true, views: true },
    });

    if (!targetArticle) {
      console.log(`   ❌ ADVERTENCIA: El artículo objetivo no existe en la BD\n`);
      continue;
    }

    console.log(`   ✅ Artículo objetivo encontrado`);
    console.log(`      Estado: ${targetArticle.status}`);
    console.log(`      Vistas: ${targetArticle.views}\n`);

    for (const placement of linkPlacement.placements) {
      try {
        // Buscar el artículo fuente
        const sourceArticle = await prisma.blogPost.findUnique({
          where: { slug: placement.sourceSlug },
          select: {
            id: true,
            title: true,
            content: true,
            status: true,
            views: true,
          },
        });

        if (!sourceArticle) {
          console.log(`   ❌ Artículo fuente NO ENCONTRADO: ${placement.sourceSlug}\n`);
          totalArticlesNotFound++;
          continue;
        }

        totalArticlesFound++;
        console.log(`   📝 Artículo Fuente: ${sourceArticle.title}`);
        console.log(`      Slug: ${placement.sourceSlug}`);
        console.log(`      Estado: ${sourceArticle.status}`);
        console.log(`      Vistas: ${sourceArticle.views}`);

        // Verificar si ya existe un enlace al artículo objetivo
        if (sourceArticle.content.includes(`/blog/${linkPlacement.targetSlug}`)) {
          console.log(`      ⏭️  Ya contiene enlace al artículo objetivo`);
          console.log(`      Acción: OMITIR\n`);
          continue;
        }

        // Buscar el texto en el contenido
        const $ = load(sourceArticle.content, { decodeEntities: false });
        const textElements = $('p, li, h2, h3, h4, blockquote');

        let textFound = false;
        let contextSnippet = '';

        textElements.each((_, element) => {
          const $element = $(element);
          const text = $element.text();

          if (text.toLowerCase().includes(placement.searchText.toLowerCase())) {
            textFound = true;
            // Extraer contexto (50 caracteres antes y después)
            const index = text.toLowerCase().indexOf(placement.searchText.toLowerCase());
            const start = Math.max(0, index - 50);
            const end = Math.min(text.length, index + placement.searchText.length + 50);
            contextSnippet = text.substring(start, end);
            return false; // Salir del loop
          }
        });

        if (textFound) {
          totalTextMatches++;
          console.log(`      ✅ Texto encontrado: "${placement.searchText}"`);
          console.log(`      Contexto: "...${contextSnippet}..."`);
          console.log(`      Acción: AGREGAR ENLACE CONTEXTUAL`);
          console.log(`      Enlace: <a href="/blog/${linkPlacement.targetSlug}" style="color: ${LINK_COLOR}; text-decoration: underline;">${placement.linkText}</a>`);
        } else {
          console.log(`      ⚠️  Texto NO encontrado: "${placement.searchText}"`);
          console.log(`      Acción: AGREGAR SECCIÓN RELACIONADA AL FINAL`);
        }

        totalPossibleLinks++;
        console.log('');

      } catch (error) {
        console.log(`   ❌ Error al procesar ${placement.sourceSlug}: ${error}\n`);
      }
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RESUMEN DEL PREVIEW\n');
  console.log(`✅ Artículos fuente encontrados: ${totalArticlesFound}`);
  console.log(`❌ Artículos fuente NO encontrados: ${totalArticlesNotFound}`);
  console.log(`📝 Enlaces posibles a agregar: ${totalPossibleLinks}`);
  console.log(`🔍 Textos encontrados para inserción contextual: ${totalTextMatches}`);
  console.log(`📌 Secciones relacionadas a agregar: ${totalPossibleLinks - totalTextMatches}`);
  console.log('');
  console.log('='.repeat(80));
  console.log('\n💡 SIGUIENTE PASO:\n');
  console.log('   Para ejecutar el script real y hacer los cambios:');
  console.log('   npx tsx scripts/add-internal-links.ts\n');
}

/**
 * Análisis rápido de artículos huérfanos
 */
async function quickOrphanAnalysis() {
  console.log('\n\n👻 ANÁLISIS RÁPIDO DE ARTÍCULOS HUÉRFANOS\n');
  console.log('='.repeat(80));
  console.log('');

  // Obtener todos los artículos publicados
  const articles = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      slug: true,
      title: true,
      content: true,
      views: true,
      category: true,
    },
  });

  console.log(`📚 Total de artículos publicados: ${articles.length}\n`);

  // Construir mapa de enlaces entrantes
  const incomingLinks: Record<string, number> = {};
  articles.forEach(article => {
    incomingLinks[article.slug] = 0;
  });

  // Contar enlaces entrantes
  for (const article of articles) {
    const $ = load(article.content);
    $('a[href*="/blog/"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const targetSlug = href.replace('/blog/', '').replace(/\/$/, '');
        if (incomingLinks[targetSlug] !== undefined) {
          incomingLinks[targetSlug]++;
        }
      }
    });
  }

  // Encontrar huérfanos
  const orphans = articles
    .filter(article => incomingLinks[article.slug] === 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10); // Top 10

  console.log(`👻 Top 10 artículos huérfanos (de ${articles.filter(a => incomingLinks[a.slug] === 0).length} totales):\n`);

  orphans.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Categoría: ${article.category}`);
    console.log(`   Vistas: ${article.views}`);
    console.log(`   Enlaces entrantes: 0`);
    console.log('');
  });

  console.log('='.repeat(80));
}

/**
 * Main
 */
async function main() {
  try {
    await previewInternalLinks();
    await quickOrphanAnalysis();
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main();
