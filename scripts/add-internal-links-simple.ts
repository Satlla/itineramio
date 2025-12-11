import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Estrategia de enlaces internos
const linkStrategy = [
  // Artículo 1: Del Modo Bombero al Modo CEO
  {
    target: 'del-modo-bombero-al-modo-ceo-framework',
    addToArticles: [
      {
        slug: 'stack-automatizacion-completo-airbnb',
        searchText: 'gestión eficiente',
        linkText: 'gestión eficiente de operaciones'
      },
      {
        slug: 'operaciones-eficientes-check-in-sin-estres',
        searchText: 'escalar tu negocio',
        linkText: 'escalar tu negocio de alojamiento'
      },
      {
        slug: 'automatizacion-anfitriones-ahorra-15-horas',
        searchText: 'profesionalizar',
        linkText: 'profesionalizar tu gestión'
      }
    ]
  },

  // Artículo 2: Automatización: Recupera 8 Horas
  {
    target: 'automatizacion-airbnb-recupera-8-horas',
    addToArticles: [
      {
        slug: 'stack-automatizacion-completo-airbnb',
        searchText: 'ahorra tiempo',
        linkText: 'ahorra tiempo cada semana'
      },
      {
        slug: 'automatizacion-anfitriones-ahorra-15-horas',
        searchText: 'procesos automáticos',
        linkText: 'procesos automáticos eficientes'
      },
      {
        slug: 'operaciones-eficientes-check-in-sin-estres',
        searchText: 'automatizar',
        linkText: 'automatizar operaciones diarias'
      }
    ]
  },

  // Artículo 3: RevPAR vs Ocupación
  {
    target: 'revpar-vs-ocupacion-metrica-que-cambia-todo',
    addToArticles: [
      {
        slug: 'revenue-management-avanzado',
        searchText: 'métricas clave',
        linkText: 'métricas clave de rentabilidad'
      },
      {
        slug: 'optimizar-precio-apartamento-turistico',
        searchText: 'estrategia de pricing',
        linkText: 'estrategia de pricing efectiva'
      },
      {
        slug: 'como-calcular-rentabilidad-airbnb',
        searchText: 'medir la rentabilidad',
        linkText: 'medir correctamente la rentabilidad'
      }
    ]
  },

  // Artículo 4: Metodología y Fuentes de Datos
  {
    target: 'metodologia-fuentes-datos-itineramio',
    addToArticles: [
      {
        slug: 'revenue-management-avanzado',
        searchText: 'datos',
        linkText: 'datos y estadísticas'
      },
      {
        slug: 'como-calcular-rentabilidad-airbnb',
        searchText: 'análisis',
        linkText: 'análisis de datos'
      },
      {
        slug: 'optimizar-precio-apartamento-turistico',
        searchText: 'información',
        linkText: 'información detallada'
      }
    ]
  },

  // Artículo 5: Automatización: Ahorra 15 Horas
  {
    target: 'automatizacion-anfitriones-ahorra-15-horas',
    addToArticles: [
      {
        slug: 'stack-automatizacion-completo-airbnb',
        searchText: 'tiempo',
        linkText: 'tiempo cada semana'
      },
      {
        slug: 'operaciones-eficientes-check-in-sin-estres',
        searchText: 'eficiencia',
        linkText: 'eficiencia operativa'
      },
      {
        slug: 'automatizacion-airbnb-recupera-8-horas',
        searchText: 'automatización',
        linkText: 'automatización completa'
      }
    ]
  }
];

async function main() {
  console.log('🔗 Agregando enlaces internos estratégicos\n');
  console.log('=' .repeat(60));

  let totalAdded = 0;
  let totalSkipped = 0;

  for (const strategy of linkStrategy) {
    const targetArticle = await prisma.blogPost.findUnique({
      where: { slug: strategy.target },
      select: { id: true, title: true, slug: true }
    });

    if (!targetArticle) {
      console.log(`\n❌ Artículo objetivo no encontrado: ${strategy.target}`);
      continue;
    }

    console.log(`\n📄 Objetivo: ${targetArticle.title}`);
    console.log(`   Slug: ${targetArticle.slug}`);
    console.log(`   Agregar en ${strategy.addToArticles.length} artículos:\n`);

    for (const link of strategy.addToArticles) {
      const sourceArticle = await prisma.blogPost.findUnique({
        where: { slug: link.slug }
      });

      if (!sourceArticle) {
        console.log(`   ⚠️  Artículo fuente no encontrado: ${link.slug}`);
        totalSkipped++;
        continue;
      }

      // Verificar si el enlace ya existe
      if (sourceArticle.content.includes(targetArticle.slug)) {
        console.log(`   ⏭️  Ya existe enlace en: ${sourceArticle.title}`);
        totalSkipped++;
        continue;
      }

      // Buscar el texto (case insensitive)
      const regex = new RegExp(link.searchText, 'i');
      if (!regex.test(sourceArticle.content)) {
        console.log(`   ⚠️  Texto "${link.searchText}" no encontrado en: ${sourceArticle.title}`);
        totalSkipped++;
        continue;
      }

      // Crear el enlace
      const linkHtml = `<a href="/blog/${targetArticle.slug}" style="color: #6366f1; text-decoration: underline;">${link.linkText}</a>`;

      // Reemplazar el texto por el enlace (solo la primera ocurrencia)
      const updatedContent = sourceArticle.content.replace(regex, linkHtml);

      // Actualizar el artículo
      await prisma.blogPost.update({
        where: { slug: link.slug },
        data: {
          content: updatedContent,
          updatedAt: new Date()
        }
      });

      console.log(`   ✅ Enlace agregado en: ${sourceArticle.title}`);
      console.log(`      Texto: "${link.searchText}" → "${link.linkText}"`);
      totalAdded++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Enlaces agregados: ${totalAdded}`);
  console.log(`   ⏭️  Enlaces omitidos: ${totalSkipped}`);
  console.log(`   📝 Artículos objetivo: ${linkStrategy.length}`);
  console.log('\n✨ ¡Proceso completado!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
