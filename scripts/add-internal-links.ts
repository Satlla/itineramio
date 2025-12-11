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

// Definición de los artículos huérfanos y dónde agregar enlaces
interface LinkPlacement {
  targetSlug: string; // El artículo huérfano al que queremos darle visibilidad
  targetTitle: string;
  placements: Array<{
    sourceSlug: string; // El artículo donde vamos a agregar el enlace
    searchText: string; // Texto a buscar en el artículo fuente
    linkText: string;   // Texto que se convertirá en enlace
    contextBefore?: string; // Texto adicional antes (opcional)
    contextAfter?: string;  // Texto adicional después (opcional)
  }>;
}

const linkPlacements: LinkPlacement[] = [
  // 1. Del Modo Bombero al Modo CEO: Framework
  {
    targetSlug: 'del-modo-bombero-al-modo-ceo-framework',
    targetTitle: 'Del Modo Bombero al Modo CEO: Framework',
    placements: [
      {
        sourceSlug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa',
        searchText: 'Laura dejó de apagar fuegos',
        linkText: 'dejó de apagar fuegos',
      },
      {
        sourceSlug: 'automatizacion-anfitriones-airbnb',
        searchText: 'gestión eficiente',
        linkText: 'gestión eficiente',
      },
      {
        sourceSlug: 'operaciones-check-in-sin-estres',
        searchText: 'operaciones escalables',
        linkText: 'operaciones escalables',
      },
    ],
  },

  // 2. Automatización Airbnb: Recupera 8 Horas
  {
    targetSlug: 'automatizacion-airbnb-recupera-8-horas-semanales',
    targetTitle: 'Automatización Airbnb: Recupera 8 Horas Semanales',
    placements: [
      {
        sourceSlug: 'mensajes-automaticos-airbnb',
        searchText: 'automatización completa',
        linkText: 'automatización completa',
      },
      {
        sourceSlug: 'stack-tecnologico-completo-gestion-alquiler-turistico',
        searchText: 'automatizar Airbnb',
        linkText: 'automatizar Airbnb',
      },
      {
        sourceSlug: 'primer-mes-como-anfitrion',
        searchText: 'automatización',
        linkText: 'automatización',
      },
    ],
  },

  // 3. RevPAR vs Ocupación: La Métrica que Cambia Todo
  {
    targetSlug: 'revpar-vs-ocupacion-metrica-que-cambia-todo',
    targetTitle: 'RevPAR vs Ocupación: La Métrica que Cambia Todo',
    placements: [
      {
        sourceSlug: 'como-optimizar-precio-apartamento-turistico-2025',
        searchText: 'métrica más importante',
        linkText: 'métrica más importante',
      },
      {
        sourceSlug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa',
        searchText: 'optimizar ingresos',
        linkText: 'optimizar ingresos',
      },
      {
        sourceSlug: '10-trucos-marketing-aumentar-reservas',
        searchText: 'revenue management',
        linkText: 'revenue management',
      },
    ],
  },

  // 4. Metodología y Fuentes de Datos de Itineramio
  {
    targetSlug: 'metodologia-fuentes-datos-itineramio',
    targetTitle: 'Metodología y Fuentes de Datos de Itineramio',
    placements: [
      {
        sourceSlug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa',
        searchText: 'datos del sector',
        linkText: 'datos del sector',
      },
      {
        sourceSlug: 'revpar-vs-ocupacion-metrica-que-cambia-todo',
        searchText: 'estadísticas',
        linkText: 'estadísticas',
      },
      {
        sourceSlug: 'como-optimizar-precio-apartamento-turistico-2025',
        searchText: 'análisis de datos',
        linkText: 'análisis de datos',
      },
    ],
  },

  // 5. Automatización para Anfitriones: Ahorra 15 Horas
  {
    targetSlug: 'automatizacion-anfitriones-airbnb',
    targetTitle: 'Automatización para Anfitriones: Ahorra 15 Horas',
    placements: [
      {
        sourceSlug: 'mensajes-automaticos-booking',
        searchText: 'sistemas automatizados',
        linkText: 'sistemas automatizados',
      },
      {
        sourceSlug: 'stack-tecnologico-completo-gestion-alquiler-turistico',
        searchText: 'automatización total',
        linkText: 'automatización total',
      },
      {
        sourceSlug: 'operaciones-check-in-sin-estres',
        searchText: 'procesos automatizados',
        linkText: 'procesos automatizados',
      },
    ],
  },
];

/**
 * Crea un enlace HTML con los estilos especificados
 */
function createLink(url: string, text: string): string {
  return `<a href="/blog/${url}" style="color: ${LINK_COLOR}; text-decoration: underline;">${text}</a>`;
}

/**
 * Encuentra y reemplaza texto en el contenido HTML
 * Evita reemplazar texto que ya está dentro de enlaces
 */
function insertLink(content: string, searchText: string, linkHtml: string): string {
  const $ = load(content, { decodeEntities: false });

  // Buscar en todos los elementos de texto (p, h2, h3, li, etc.)
  const textElements = $('p, li, h2, h3, h4, blockquote');

  let replaced = false;

  textElements.each((_, element) => {
    const $element = $(element);

    // Solo reemplazar si el elemento no contiene ya un enlace con ese texto
    if ($element.find('a').length === 0) {
      const html = $element.html();
      if (html && html.includes(searchText)) {
        const newHtml = html.replace(searchText, linkHtml);
        $element.html(newHtml);
        replaced = true;
        return false; // Salir del loop después del primer reemplazo
      }
    }
  });

  // Si no se encontró el texto exacto, intentar una búsqueda más flexible
  if (!replaced) {
    textElements.each((_, element) => {
      const $element = $(element);

      if ($element.find('a').length === 0) {
        const html = $element.html();
        if (html) {
          // Buscar variaciones (mayúsculas, minúsculas)
          const regex = new RegExp(searchText, 'i');
          if (regex.test(html)) {
            const match = html.match(regex);
            if (match) {
              const matchedText = match[0];
              const linkWithMatchedCase = linkHtml.replace(searchText, matchedText);
              const newHtml = html.replace(matchedText, linkWithMatchedCase);
              $element.html(newHtml);
              replaced = true;
              return false;
            }
          }
        }
      }
    });
  }

  return $.html();
}

/**
 * Agrega una sección de artículos relacionados al final del contenido
 */
function addRelatedArticlesSection(content: string, targetSlug: string, targetTitle: string): string {
  const relatedSection = `
<div style="margin-top: 3rem; padding: 1.5rem; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid ${LINK_COLOR};">
  <h3 style="margin-top: 0; color: #1f2937; font-size: 1.25rem;">📚 Artículo Relacionado</h3>
  <p style="margin-bottom: 0;">
    <a href="/blog/${targetSlug}" style="color: ${LINK_COLOR}; text-decoration: underline; font-weight: 600;">${targetTitle}</a>
  </p>
</div>`;

  return content + relatedSection;
}

/**
 * Proceso principal para agregar enlaces internos
 */
async function addInternalLinks() {
  console.log('🔗 AGREGANDO ENLACES INTERNOS ESTRATÉGICOS\n');
  console.log('='.repeat(80));
  console.log('\n📋 Configuración:');
  console.log(`   - Artículos huérfanos a promocionar: ${linkPlacements.length}`);
  console.log(`   - Total de enlaces a agregar: ${linkPlacements.reduce((sum, lp) => sum + lp.placements.length, 0)}`);
  console.log(`   - Color de enlaces: ${LINK_COLOR}\n`);
  console.log('='.repeat(80));
  console.log('');

  let totalLinksAdded = 0;
  let totalArticlesModified = 0;
  const errors: string[] = [];

  for (const linkPlacement of linkPlacements) {
    console.log(`\n🎯 Procesando: ${linkPlacement.targetTitle}`);
    console.log(`   Slug: ${linkPlacement.targetSlug}`);
    console.log(`   Enlaces a agregar: ${linkPlacement.placements.length}\n`);

    for (const placement of linkPlacement.placements) {
      try {
        // Buscar el artículo fuente
        const sourceArticle = await prisma.blogPost.findUnique({
          where: { slug: placement.sourceSlug },
          select: { id: true, title: true, content: true },
        });

        if (!sourceArticle) {
          errors.push(`   ❌ No se encontró el artículo: ${placement.sourceSlug}`);
          continue;
        }

        console.log(`   📝 ${sourceArticle.title}`);

        // Verificar si ya existe un enlace al artículo objetivo
        if (sourceArticle.content.includes(`/blog/${linkPlacement.targetSlug}`)) {
          console.log(`      ⏭️  Ya contiene enlace al artículo objetivo, omitiendo...`);
          continue;
        }

        // Intentar insertar el enlace contextual
        const linkHtml = createLink(linkPlacement.targetSlug, placement.linkText);
        let updatedContent = insertLink(sourceArticle.content, placement.searchText, linkHtml);

        // Si no se pudo insertar contextualmente, agregar sección relacionada al final
        if (updatedContent === sourceArticle.content) {
          console.log(`      ⚠️  No se encontró "${placement.searchText}", agregando sección relacionada...`);
          updatedContent = addRelatedArticlesSection(
            sourceArticle.content,
            linkPlacement.targetSlug,
            linkPlacement.targetTitle
          );
        }

        // Actualizar el artículo
        await prisma.blogPost.update({
          where: { id: sourceArticle.id },
          data: { content: updatedContent },
        });

        console.log(`      ✅ Enlace agregado exitosamente`);
        totalLinksAdded++;
        totalArticlesModified++;
      } catch (error) {
        const errorMsg = `   ❌ Error en ${placement.sourceSlug}: ${error}`;
        errors.push(errorMsg);
        console.log(errorMsg);
      }
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RESUMEN FINAL\n');
  console.log(`✅ Enlaces agregados: ${totalLinksAdded}`);
  console.log(`📝 Artículos modificados: ${totalArticlesModified}`);
  console.log(`❌ Errores: ${errors.length}\n`);

  if (errors.length > 0) {
    console.log('⚠️  ERRORES ENCONTRADOS:\n');
    errors.forEach(error => console.log(error));
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('\n🎉 Proceso completado!\n');
}

/**
 * Función para analizar artículos huérfanos actuales (opcional)
 */
async function analyzeOrphans() {
  console.log('👻 ANALIZANDO ARTÍCULOS HUÉRFANOS\n');
  console.log('='.repeat(80));
  console.log('');

  // Obtener todos los artículos publicados
  const articles = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, slug: true, title: true, content: true, views: true },
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
    .sort((a, b) => b.views - a.views);

  console.log(`👻 Artículos huérfanos encontrados: ${orphans.length}\n`);

  if (orphans.length > 0) {
    console.log('LISTA DE ARTÍCULOS HUÉRFANOS (ordenados por vistas):\n');
    orphans.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Vistas: ${article.views}`);
      console.log('');
    });
  }

  console.log('='.repeat(80));
}

/**
 * Main
 */
async function main() {
  try {
    // Descomentar para analizar artículos huérfanos primero
    // await analyzeOrphans();
    // console.log('\n');

    // Agregar enlaces internos
    await addInternalLinks();
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main();
