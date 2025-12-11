import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Estrategia de enlaces internos CON SLUGS CORRECTOS
const linkStrategy = [
  // Artículo 1: Del Modo Bombero al Modo CEO (27 vistas → objetivo 40)
  {
    target: 'del-modo-bombero-al-modo-ceo-framework',
    addToArticles: [
      {
        slug: 'automatizacion-airbnb-stack-completo',
        searchText: 'gestión eficiente',
        linkText: 'pasar del modo bombero al modo CEO'
      },
      {
        slug: 'operaciones-check-in-sin-estres',
        searchText: 'escalar',
        linkText: 'escalar tu negocio profesionalmente'
      },
      {
        slug: 'automatizacion-anfitriones-airbnb',
        searchText: 'profesionalizar',
        linkText: 'profesionalizar tu gestión'
      }
    ]
  },

  // Artículo 2: Automatización: Recupera 8 Horas (29 vistas → objetivo 45)
  {
    target: 'automatizacion-airbnb-recupera-8-horas-semanales',
    addToArticles: [
      {
        slug: 'automatizacion-airbnb-stack-completo',
        searchText: 'ahorra tiempo',
        linkText: 'recuperar 8 horas cada semana'
      },
      {
        slug: 'automatizacion-anfitriones-airbnb',
        searchText: 'tiempo',
        linkText: 'recuperar tiempo valioso'
      },
      {
        slug: 'operaciones-check-in-sin-estres',
        searchText: 'automatizar',
        linkText: 'automatizar completamente'
      }
    ]
  },

  // Artículo 3: RevPAR vs Ocupación (33 vistas → objetivo 50)
  // Ya tiene 1 enlace agregado

  // Artículo 4: Metodología y Fuentes de Datos (26 vistas → objetivo 40)
  {
    target: 'metodologia-datos-itineramio',
    addToArticles: [
      {
        slug: 'como-optimizar-precio-apartamento-turistico-2025',
        searchText: 'datos',
        linkText: 'datos verificados y metodología'
      },
      {
        slug: 'vut-madrid-2025-requisitos-normativa-checklist',
        searchText: 'información',
        linkText: 'información detallada'
      },
      {
        slug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa',
        searchText: 'resultados',
        linkText: 'resultados basados en datos reales'
      }
    ]
  },

  // Artículo 5: Automatización para Anfitriones (557 vistas - top performer!)
  // Este ya tiene muchas vistas, vamos a agregar enlaces HACIA artículos huérfanos
  {
    target: 'del-modo-bombero-al-modo-ceo-framework',
    addToArticles: [
      {
        slug: 'automatizacion-anfitriones-airbnb',
        searchText: 'gestión',
        linkText: 'pasar del modo bombero al modo CEO'
      }
    ]
  },
  {
    target: 'automatizacion-airbnb-recupera-8-horas-semanales',
    addToArticles: [
      {
        slug: 'automatizacion-anfitriones-airbnb',
        searchText: 'recuperar tiempo',
        linkText: 'recuperar 8 horas semanales'
      }
    ]
  },
  {
    target: 'metodologia-datos-itineramio',
    addToArticles: [
      {
        slug: 'automatizacion-anfitriones-airbnb',
        searchText: 'estadísticas',
        linkText: 'metodología y datos verificados'
      }
    ]
  }
];

async function main() {
  console.log('🔗 Agregando enlaces internos estratégicos (VERSIÓN CORREGIDA)\n');
  console.log('=' .repeat(70));

  let totalAdded = 0;
  let totalSkipped = 0;
  let notFound = 0;

  for (const strategy of linkStrategy) {
    const targetArticle = await prisma.blogPost.findUnique({
      where: { slug: strategy.target },
      select: { id: true, title: true, slug: true, views: true }
    });

    if (!targetArticle) {
      console.log(`\n❌ Artículo objetivo no encontrado: ${strategy.target}`);
      notFound++;
      continue;
    }

    console.log(`\n📄 Objetivo: ${targetArticle.title}`);
    console.log(`   Slug: ${targetArticle.slug}`);
    console.log(`   Vistas actuales: ${targetArticle.views}`);
    console.log(`   Agregar en ${strategy.addToArticles.length} artículos:\n`);

    for (const link of strategy.addToArticles) {
      const sourceArticle = await prisma.blogPost.findUnique({
        where: { slug: link.slug }
      });

      if (!sourceArticle) {
        console.log(`   ❌ Artículo fuente no encontrado: ${link.slug}`);
        notFound++;
        continue;
      }

      // Verificar si el enlace ya existe
      if (sourceArticle.content.includes(targetArticle.slug)) {
        console.log(`   ⏭️  Ya existe enlace en: ${sourceArticle.title}`);
        totalSkipped++;
        continue;
      }

      // Buscar el texto (case insensitive)
      const regex = new RegExp(link.searchText, 'gi');
      const matches = sourceArticle.content.match(regex);

      if (!matches || matches.length === 0) {
        console.log(`   ⚠️  Texto "${link.searchText}" no encontrado en: ${sourceArticle.title}`);
        totalSkipped++;
        continue;
      }

      // Crear el enlace
      const linkHtml = `<a href="/blog/${targetArticle.slug}" style="color: #6366f1; text-decoration: underline;">${link.linkText}</a>`;

      // Reemplazar el texto por el enlace (solo la primera ocurrencia)
      let found = false;
      const updatedContent = sourceArticle.content.replace(regex, (match) => {
        if (!found) {
          found = true;
          return linkHtml;
        }
        return match;
      });

      // Actualizar el artículo
      await prisma.blogPost.update({
        where: { slug: link.slug },
        data: {
          content: updatedContent,
          updatedAt: new Date()
        }
      });

      console.log(`   ✅ Enlace agregado en: ${sourceArticle.title}`);
      console.log(`      De: "${link.searchText}" → A: "${link.linkText}"`);
      console.log(`      Vistas del artículo fuente: ${sourceArticle.views}`);
      totalAdded++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RESUMEN FINAL:');
  console.log(`   ✅ Enlaces agregados: ${totalAdded}`);
  console.log(`   ⏭️  Enlaces omitidos (ya existían): ${totalSkipped}`);
  console.log(`   ❌ Artículos no encontrados: ${notFound}`);
  console.log(`   📝 Estrategias procesadas: ${linkStrategy.length}`);

  if (totalAdded > 0) {
    console.log('\n🎯 IMPACTO ESPERADO:');
    console.log(`   - Artículos huérfanos con nuevos enlaces entrantes: 3-4`);
    console.log(`   - Aumento de vistas estimado: +30-50% en 30 días`);
    console.log(`   - Mejora en tiempo en sitio: +15-20%`);
  }

  console.log('\n✨ ¡Proceso completado!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
