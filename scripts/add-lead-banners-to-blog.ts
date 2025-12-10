import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Banner templates optimizados para conversión
const banners = {
  // Banner principal - prueba gratis
  trial: `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 2rem; margin: 3rem 0; text-align: center; color: white;">
  <h3 style="margin-top: 0; font-size: 1.5rem; color: white;">✨ Crea tu Manual Digital en 5 Minutos</h3>
  <p style="font-size: 1.1rem; margin: 1rem 0; opacity: 0.95;">Reduce consultas de huéspedes en un 60% con Itineramio</p>
  <a href="/register" style="display: inline-block; background-color: white; color: #667eea; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; margin-top: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Prueba Gratis 15 Días →</a>
  <p style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.8;">Sin tarjeta • Configuración en minutos</p>
</div>`,

  // Banner de caso de éxito
  caseStudy: `
<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 2rem; margin: 3rem 0; border-radius: 8px;">
  <h3 style="margin-top: 0; color: #15803d;">💰 Caso Real: +€1,400/mes Ahorrando 8h/semana</h3>
  <p style="color: #166534; font-size: 1.05rem; margin: 1rem 0;">Laura implementó Itineramio y pasó de gestionar 3 propiedades manualmente a escalar a 5 sin contratar a nadie.</p>
  <a href="/register" style="display: inline-block; background-color: #22c55e; color: white; padding: 0.875rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">Empieza tu Transformación →</a>
</div>`,

  // Banner de herramienta específica
  toolFocus: `
<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 2rem; margin: 3rem 0; border-radius: 8px;">
  <h3 style="margin-top: 0; color: #92400e;">🎯 Automatiza tu Check-in en 3 Clicks</h3>
  <p style="color: #78350f; font-size: 1.05rem; margin: 1rem 0;">Manual digital + QR code + Instrucciones multiidioma. Todo lo que necesitas para check-ins sin contacto.</p>
  <a href="/register" style="display: inline-block; background-color: #f59e0b; color: white; padding: 0.875rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">Prueba Gratis →</a>
</div>`,

  // Banner de urgencia/escasez
  urgency: `
<div style="background-color: #eff6ff; border: 2px solid #3b82f6; padding: 2rem; margin: 3rem 0; border-radius: 12px; text-align: center;">
  <p style="color: #1e40af; font-size: 0.875rem; font-weight: 600; margin: 0 0 0.5rem 0; text-transform: uppercase; letter-spacing: 0.05em;">Oferta Limitada</p>
  <h3 style="margin: 0 0 1rem 0; color: #1e3a8a; font-size: 1.5rem;">15 Días Gratis + Soporte Prioritario</h3>
  <p style="color: #1e40af; font-size: 1.05rem; margin: 0 0 1.5rem 0;">Únete a +500 anfitriones que ya gestionan sus propiedades en piloto automático</p>
  <a href="/register" style="display: inline-block; background-color: #3b82f6; color: white; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem;">Comenzar Ahora →</a>
</div>`,

  // Banner de checklist/recurso
  resource: `
<div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 2rem; margin: 3rem 0; border-radius: 8px;">
  <h3 style="margin-top: 0; color: #6b21a8;">📋 Checklist Completo Incluido</h3>
  <p style="color: #7e22ce; font-size: 1.05rem; margin: 1rem 0;">Accede a plantillas, checklists y guías paso a paso para implementar esto en tu propiedad hoy mismo.</p>
  <a href="/register" style="display: inline-block; background-color: #a855f7; color: white; padding: 0.875rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">Descargar Recursos Gratis →</a>
</div>`
}

// Mapeo de artículos a banners específicos
const articleBanners: Record<string, { mid: string; end: string }> = {
  // Artículos de casos de éxito -> Banner de caso + trial
  'caso-david-15-propiedades': { mid: banners.caseStudy, end: banners.trial },
  'caso-laura-de-1800-a-3200-euros-mes-historia-completa': { mid: banners.caseStudy, end: banners.trial },

  // Artículos de automatización -> Banner de herramienta + urgencia
  'automatizacion-airbnb-stack-completo': { mid: banners.toolFocus, end: banners.urgency },
  'automatizacion-anfitriones-airbnb': { mid: banners.toolFocus, end: banners.urgency },
  'automatizacion-airbnb-recupera-8-horas-semanales': { mid: banners.toolFocus, end: banners.urgency },

  // Artículos de manual digital -> Banner de herramienta + trial
  'manual-digital-apartamento-turistico-guia-completa': { mid: banners.toolFocus, end: banners.trial },
  'manual-digital-apartamento-turistico-plantilla-completa-2025': { mid: banners.toolFocus, end: banners.trial },
  'manual-digital-apartamentos-guia-definitiva': { mid: banners.toolFocus, end: banners.trial },

  // Artículos de check-in -> Banner de herramienta + recurso
  'plantilla-check-in-remoto-airbnb': { mid: banners.toolFocus, end: banners.resource },
  'operaciones-check-in-sin-estres': { mid: banners.toolFocus, end: banners.resource },
  'qr-code-apartamento-turistico-guia-generador': { mid: banners.toolFocus, end: banners.resource },

  // Artículos de mensajería -> Banner de caso + trial
  'mensajes-automaticos-airbnb': { mid: banners.caseStudy, end: banners.trial },
  'mensajes-automaticos-booking': { mid: banners.caseStudy, end: banners.trial },

  // Artículos de gestión/estrategia -> Banner de caso + urgencia
  'modo-bombero-a-ceo-escalar-airbnb': { mid: banners.caseStudy, end: banners.urgency },
  'del-modo-bombero-al-modo-ceo-framework': { mid: banners.caseStudy, end: banners.urgency },
  'revenue-management-avanzado': { mid: banners.caseStudy, end: banners.urgency },
  'revpar-vs-ocupacion-metricas-correctas-airbnb': { mid: banners.caseStudy, end: banners.trial },
  'revpar-vs-ocupacion-metrica-que-cambia-todo': { mid: banners.caseStudy, end: banners.trial },

  // Artículos para principiantes -> Banner de recurso + trial
  'primer-mes-anfitrion-airbnb': { mid: banners.resource, end: banners.trial },
  'errores-principiantes-airbnb': { mid: banners.resource, end: banners.trial },
  'kit-anti-caos-anfitriones-airbnb': { mid: banners.resource, end: banners.trial },

  // Artículos legales/normativos -> Banner de urgencia + trial
  'vut-madrid-2025-requisitos-normativa-checklist': { mid: banners.urgency, end: banners.trial },
  'normativa-vut-2025-cambios-legales': { mid: banners.urgency, end: banners.trial },
  'como-registrar-vivienda-uso-turistico-guia-paso-paso': { mid: banners.urgency, end: banners.trial },
  'registro-ses-hospedajes-guia-completa-2025': { mid: banners.urgency, end: banners.trial },

  // Artículos de optimización -> Banner de caso + urgencia
  'como-optimizar-precio-apartamento-turistico-2025': { mid: banners.caseStudy, end: banners.urgency },
  '10-trucos-marketing-aumentar-reservas': { mid: banners.caseStudy, end: banners.urgency },
  'storytelling-que-convierte-descripciones-airbnb': { mid: banners.caseStudy, end: banners.urgency },

  // Artículos técnicos -> Banner de recurso + trial
  'instrucciones-wifi-huespedes-apartamento-turistico': { mid: banners.resource, end: banners.trial },
  'metodologia-datos-itineramio': { mid: banners.resource, end: banners.trial },
}

async function main() {
  console.log('🎯 Añadiendo banners de captación de leads a artículos del blog...\n')

  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, content: true, title: true }
  })

  let updated = 0

  for (const post of posts) {
    // Obtener banners para este artículo (o usar defaults)
    const articleBanner = articleBanners[post.slug] || {
      mid: banners.trial,
      end: banners.urgency
    }

    let content = post.content

    // Skip si ya tiene banners
    if (content.includes('Prueba Gratis 15 Días') || content.includes('register')) {
      console.log(`⏭️  ${post.slug} - Ya tiene banners`)
      continue
    }

    // Insertar banner a mitad del contenido
    const paragraphs = content.split('</p>')
    const midPoint = Math.floor(paragraphs.length / 2)

    if (paragraphs.length > 4) {
      paragraphs.splice(midPoint, 0, articleBanner.mid)
    }

    // Añadir banner al final (antes del último enlace si existe)
    const updatedContent = paragraphs.join('</p>') + articleBanner.end

    // Actualizar en base de datos
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: updatedContent }
    })

    updated++
    console.log(`✅ ${post.slug} - Banners añadidos`)
  }

  console.log(`\n✅ Total actualizado: ${updated}/${posts.length} artículos`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
