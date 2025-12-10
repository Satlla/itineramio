import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Paleta de colores oficial
const COLORS = {
  text: {
    title: '#1f2937',      // Gray 800
    subtitle: '#374151',   // Gray 700
    body: '#4b5563',       // Gray 600
    secondary: '#6b7280'   // Gray 500
  },
  bg: {
    light: '#f9fafb',      // Gray 50
    white: '#ffffff',
    dark: '#1f2937'        // Gray 800
  },
  border: {
    light: '#e5e7eb',      // Gray 200
    accent: '#6b7280'      // Gray 500
  },
  accent: {
    link: '#6366f1',       // Indigo 500
    success: '#059669',    // Green 600
    error: '#ef4444',      // Red 500
    warning: '#fef3c7'     // Amber 100
  }
}

// Reemplazar todos los colores no estándar
function standardizeColors(content: string): string {
  let result = content

  // Reemplazar gradientes por colores sólidos
  result = result.replace(/background:\s*linear-gradient\([^)]+\)/g, `background-color: ${COLORS.bg.dark}`)
  result = result.replace(/background-color:\s*#667eea/gi, COLORS.bg.dark)
  result = result.replace(/background-color:\s*#764ba2/gi, COLORS.bg.dark)
  result = result.replace(/background-color:\s*#8b5cf6/gi, COLORS.bg.dark)
  result = result.replace(/background-color:\s*#a855f7/gi, COLORS.bg.dark)

  // Normalizar colores de texto morado/azul a grises o accent
  result = result.replace(/color:\s*#6b21a8/gi, COLORS.text.title)
  result = result.replace(/color:\s*#7e22ce/gi, COLORS.text.subtitle)
  result = result.replace(/color:\s*#1e40af/gi, COLORS.text.title)
  result = result.replace(/color:\s*#1e3a8a/gi, COLORS.text.subtitle)

  // Normalizar fondos de color a grises
  result = result.replace(/background-color:\s*#eff6ff/gi, COLORS.bg.light)
  result = result.replace(/background-color:\s*#faf5ff/gi, COLORS.bg.light)
  result = result.replace(/background-color:\s*#f0fdf4/gi, COLORS.bg.light)
  result = result.replace(/background-color:\s*#ecfdf5/gi, COLORS.bg.light)

  // Mantener solo warning/error donde sea crítico
  result = result.replace(/background-color:\s*#fef9c3/gi, COLORS.accent.warning)

  return result
}

// Enlaces internos relacionados por tema
const relatedLinks: Record<string, string[]> = {
  'primer-mes-anfitrion-airbnb': [
    '<a href="/blog/errores-principiantes-airbnb" style="color: #6366f1; font-weight: 600;">→ 10 Errores de Principiantes</a>',
    '<a href="/blog/manual-digital-apartamento-turistico-guia-completa" style="color: #6366f1; font-weight: 600;">→ Manual Digital Completo</a>',
    '<a href="/blog/plantilla-check-in-remoto-airbnb" style="color: #6366f1; font-weight: 600;">→ Plantilla Check-in Remoto</a>'
  ],
  'errores-principiantes-airbnb': [
    '<a href="/blog/primer-mes-anfitrion-airbnb" style="color: #6366f1; font-weight: 600;">→ Guía Primer Mes</a>',
    '<a href="/blog/kit-anti-caos-anfitriones-airbnb" style="color: #6366f1; font-weight: 600;">→ Kit Anti-Caos</a>',
    '<a href="/blog/automatizacion-airbnb-stack-completo" style="color: #6366f1; font-weight: 600;">→ Stack de Automatización</a>'
  ],
  'automatizacion-airbnb-stack-completo': [
    '<a href="/blog/modo-bombero-a-ceo-escalar-airbnb" style="color: #6366f1; font-weight: 600;">→ Modo Bombero a CEO</a>',
    '<a href="/blog/mensajes-automaticos-airbnb" style="color: #6366f1; font-weight: 600;">→ Mensajes Automáticos</a>',
    '<a href="/blog/caso-david-15-propiedades" style="color: #6366f1; font-weight: 600;">→ Caso David</a>'
  ],
  'revpar-vs-ocupacion-metricas-correctas-airbnb': [
    '<a href="/blog/revenue-management-avanzado" style="color: #6366f1; font-weight: 600;">→ Revenue Management Avanzado</a>',
    '<a href="/blog/como-optimizar-precio-apartamento-turistico-2025" style="color: #6366f1; font-weight: 600;">→ Optimizar Precio</a>',
    '<a href="/blog/modo-bombero-a-ceo-escalar-airbnb" style="color: #6366f1; font-weight: 600;">→ Escalar tu Negocio</a>'
  ],
  'manual-digital-apartamento-turistico-guia-completa': [
    '<a href="/blog/qr-code-apartamento-turistico-guia-generador" style="color: #6366f1; font-weight: 600;">→ Guía QR Code</a>',
    '<a href="/blog/instrucciones-wifi-huespedes-apartamento-turistico" style="color: #6366f1; font-weight: 600;">→ Instrucciones WiFi</a>',
    '<a href="/blog/plantilla-check-in-remoto-airbnb" style="color: #6366f1; font-weight: 600;">→ Check-in Remoto</a>'
  ]
}

async function main() {
  console.log('🎨 Estandarizando paleta de colores en todos los artículos...\\n')

  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, content: true }
  })

  let updated = 0

  for (const post of posts) {
    let content = post.content

    // Estandarizar colores
    content = standardizeColors(content)

    // Añadir sección de artículos relacionados si no existe y hay enlaces para este artículo
    if (relatedLinks[post.slug] && !content.includes('Artículos Relacionados')) {
      const links = relatedLinks[post.slug].map(link => `<li style="margin-bottom: 1rem;">${link}</li>`).join('\n    ')
      const relatedSection = `
<div style="background-color: #f9fafb; border-radius: 16px; padding: 2.5rem; margin: 3rem 0; border: 2px solid #e5e7eb;">
  <h3 style="color: #1f2937; margin-top: 0; font-size: 1.5rem; font-weight: 700;">📚 Artículos Relacionados</h3>
  <ul style="list-style: none; padding: 0; margin: 1.5rem 0;">
    ${links}
  </ul>
</div>`

      // Insertar antes del último CTA
      const lastCtaIndex = content.lastIndexOf('<div style="background')
      if (lastCtaIndex > 0) {
        content = content.slice(0, lastCtaIndex) + relatedSection + '\n\n' + content.slice(lastCtaIndex)
      } else {
        content += relatedSection
      }
    }

    // Actualizar en base de datos
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content }
    })

    updated++
    console.log(`✅ ${post.slug}`)
  }

  console.log(`\n✅ Total actualizado: ${updated}/${posts.length} artículos`)
  console.log('\n🎨 Paleta de colores estandarizada:')
  console.log('   - Texto: Grises (#1f2937 → #6b7280)')
  console.log('   - Fondos: Gray 50 (#f9fafb) y Dark (#1f2937)')
  console.log('   - Enlaces: Indigo (#6366f1)')
  console.log('   - Alerts: Solo rojo para críticos')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
