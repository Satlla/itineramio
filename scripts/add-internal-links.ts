import { prisma } from '../src/lib/prisma'

const internalLinks = [
  {
    slug: 'mensajes-automaticos-airbnb',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [Mensajes Automáticos para Booking.com](/blog/mensajes-automaticos-booking) - Plantillas profesionales para Booking\n- [Automatización para Airbnb: Recupera 8 Horas](/blog/automatizacion-airbnb-recupera-8-horas-semanales) - Guía completa de automatización'
  },
  {
    slug: 'mensajes-automaticos-booking',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [Mensajes Automáticos para Airbnb](/blog/mensajes-automaticos-airbnb) - Plantillas copy-paste para Airbnb\n- [Automatización para Anfitriones](/blog/automatizacion-anfitriones-airbnb) - Ahorra 15 horas semanales'
  },
  {
    slug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [RevPAR vs Ocupación: La Métrica que Cambia Todo](/blog/revpar-vs-ocupacion-metrica-que-cambia-todo) - Entiende las métricas que Laura utilizó\n- [Del Modo Bombero al Modo CEO](/blog/del-modo-bombero-al-modo-ceo-framework) - Estrategia para escalar tu negocio\n- [Automatización para Airbnb](/blog/automatizacion-airbnb-recupera-8-horas-semanales) - Recupera tiempo para optimizar'
  },
  {
    slug: 'revpar-vs-ocupacion-metrica-que-cambia-todo',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [Cómo Optimizar el Precio de tu Apartamento](/blog/como-optimizar-precio-apartamento-turistico-2025) - Estrategias de pricing avanzado\n- [Caso Laura: De 2,540€ a 3,600€/mes](/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa) - Caso real de optimización de métricas'
  },
  {
    slug: 'del-modo-bombero-al-modo-ceo-framework',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [Automatización para Anfitriones: Ahorra 15 Horas](/blog/automatizacion-anfitriones-airbnb) - Implementa sistemas escalables\n- [Operaciones Eficientes: Check-in Sin Estrés](/blog/operaciones-check-in-sin-estres) - Optimiza tus operaciones\n- [Caso Laura: De 2,540€ a 3,600€/mes](/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa) - Ejemplo de transformación operativa'
  },
  {
    slug: 'automatizacion-airbnb-recupera-8-horas-semanales',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [Mensajes Automáticos para Airbnb](/blog/mensajes-automaticos-airbnb) - Plantillas listas para usar\n- [Del Modo Bombero al Modo CEO](/blog/del-modo-bombero-al-modo-ceo-framework) - Deja de apagar fuegos\n- [Manual Digital para Apartamentos](/blog/manual-digital-apartamentos-guia-definitiva) - Reduce consultas de huéspedes'
  },
  {
    slug: 'automatizacion-anfitriones-airbnb',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [Mensajes Automáticos para Booking](/blog/mensajes-automaticos-booking) - Automatiza Booking.com\n- [QR Code para Apartamentos](/blog/qr-code-apartamento-turistico-guia-generador) - Digitaliza información'
  },
  {
    slug: 'como-optimizar-precio-apartamento-turistico-2025',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [RevPAR vs Ocupación](/blog/revpar-vs-ocupacion-metrica-que-cambia-todo) - La métrica clave para pricing\n- [10 Trucos de Marketing](/blog/10-trucos-marketing-aumentar-reservas) - Aumenta tus reservas'
  },
  {
    slug: 'manual-digital-apartamentos-guia-definitiva',
    linkToAdd: '\n\n## Artículos Relacionados\n\n- [Plantilla Check-in Remoto Airbnb](/blog/plantilla-check-in-remoto-airbnb) - Descarga gratis\n- [Instrucciones WiFi para Huéspedes](/blog/instrucciones-wifi-huespedes-apartamento-turistico) - Elimina llamadas 3 AM\n- [QR Code para Apartamentos](/blog/qr-code-apartamento-turistico-guia-generador) - Acceso digital instantáneo'
  }
]

async function addLinks() {
  console.log('🔗 AÑADIENDO ENLACES INTERNOS\n')
  console.log('='.repeat(80))

  for (const { slug, linkToAdd } of internalLinks) {
    const article = await prisma.blogPost.findUnique({
      where: { slug },
      select: { content: true, title: true }
    })

    if (!article) {
      console.log(`❌ No encontrado: ${slug}`)
      continue
    }

    const updatedContent = article.content + linkToAdd

    await prisma.blogPost.update({
      where: { slug },
      data: { content: updatedContent }
    })

    console.log(`✅ ${article.title}`)
    console.log(`   Enlaces añadidos: ${linkToAdd.match(/\[.*?\]/g)?.length || 0}`)
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n🎉 Enlaces internos añadidos a ${internalLinks.length} artículos\n`)

  await prisma.$disconnect()
}

addLinks()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
