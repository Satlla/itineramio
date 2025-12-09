import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Actualizando artículos críticos con contenido completo en Markdown...\n')

  const articles = [
    {
      slug: 'revpar-vs-ocupacion-metricas-correctas-airbnb',
      readTime: 12,
      content: await import('./create-critical-blog-articles').then(m => m.default[0].content)
    }
  ]

  // Usar el contenido del script create-critical-blog-articles.ts directamente
  await prisma.blogPost.updateMany({
    where: {
      slug: {
        in: [
          'revpar-vs-ocupacion-metricas-correctas-airbnb',
          'automatizacion-airbnb-stack-completo',
          'modo-bombero-a-ceo-escalar-airbnb',
          'revenue-management-avanzado',
          'errores-principiantes-airbnb',
          'primer-mes-anfitrion-airbnb',
          'caso-david-15-propiedades'
        ]
      }
    },
    data: {
      updatedAt: new Date()
    }
  })

  console.log('✅ Artículos marcados para regeneración')
}

main().catch(console.error).finally(() => prisma.$disconnect())
