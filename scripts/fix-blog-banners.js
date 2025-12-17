const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Good CTA banner HTML
const goodCTABanner = `<div style="background-color: #7c3aed; padding: 2rem; margin: 3rem 0; border-radius: 12px; text-align: center;">
  <h3 style="margin-top: 0; color: white; font-size: 1.5rem;">✨ Crea tu Manual Digital en 5 Minutos</h3>
  <p style="color: #e9d5ff; font-size: 1.1rem; margin: 1rem 0;">Reduce consultas de huéspedes hasta un 86% con Itineramio</p>
  <a href="/register" style="display: inline-block; background-color: white; color: #7c3aed; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">Prueba Gratis 15 Días →</a>
  <p style="color: #c4b5fd; font-size: 0.875rem; margin-top: 1rem; margin-bottom: 0;">Sin tarjeta de crédito • Configuración en minutos</p>
</div>`;

async function main() {
  const slugsToFix = [
    'registro-ses-hospedajes-guia-completa-2025',
    'como-registrar-vivienda-uso-turistico-guia-paso-paso',
    'kit-anti-caos-anfitriones-airbnb',
    'storytelling-que-convierte-descripciones-airbnb'
  ];

  console.log('=== CORRIGIENDO BANNERS EN ARTÍCULOS ===\n');

  for (const slug of slugsToFix) {
    try {
      const post = await prisma.blogPost.findFirst({
        where: { slug },
        select: { id: true, slug: true, content: true }
      });

      if (!post) {
        console.log(`❌ No encontrado: ${slug}`);
        continue;
      }

      let newContent = post.content;

      // Fix malformed style attributes like style="#f9fafb;..."
      newContent = newContent.replace(
        /style="#([a-f0-9]{6});/gi,
        'style="background-color: #$1;'
      );

      // Fix "border-left: 4px solid color: #xxx" -> "border-left: 4px solid #xxx"
      newContent = newContent.replace(
        /border-left:\s*4px\s+solid\s+color:\s*(#[a-f0-9]{6})/gi,
        'border-left: 4px solid $1'
      );

      // Fix duplicate color properties like "color: #xxx; color: white"
      newContent = newContent.replace(
        /color:\s*#[a-f0-9]{6};\s*color:\s*white/gi,
        'color: white'
      );

      // Find and replace broken CTA banners (look for patterns with missing background)
      const brokenCTAPattern = /<div[^>]*style="[^"]*"[^>]*>[\s\S]*?(?:Checklist Completo|Crea tu Manual|Prueba Gratis|Descargar Recursos)[\s\S]*?<\/div>/gi;

      // Check if there's a broken CTA (div with style but no background that contains CTA text)
      const hasBrokenCTA = newContent.match(/<div[^>]*style="[^"]*(?!background)[^"]*"[^>]*>[\s\S]*?(?:Checklist|Manual Digital|Prueba Gratis)[\s\S]*?<\/a>\s*<\/div>/i);

      if (hasBrokenCTA) {
        // Find and remove the broken CTA
        newContent = newContent.replace(
          /<div[^>]*style="[^"]*"[^>]*>[\s\S]*?<h3[^>]*>[\s\S]*?(?:Checklist|Manual Digital)[\s\S]*?<\/div>\s*<\/p>/gi,
          ''
        );

        // Add the good CTA at the end before the closing
        if (!newContent.includes('background-color: #7c3aed')) {
          // Find a good place to insert - before the last </p> or at the end
          const lastPIndex = newContent.lastIndexOf('</p>');
          if (lastPIndex > -1) {
            newContent = newContent.substring(0, lastPIndex + 4) + '\n\n' + goodCTABanner + newContent.substring(lastPIndex + 4);
          } else {
            newContent = newContent + '\n\n' + goodCTABanner;
          }
        }
      }

      // Update the post
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { content: newContent }
      });

      console.log(`✅ Corregido: ${slug}`);

    } catch (error) {
      console.error(`❌ Error en ${slug}:`, error.message);
    }
  }

  console.log('\n=== COMPLETADO ===');
  await prisma.$disconnect();
}

main();
