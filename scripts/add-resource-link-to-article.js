const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const starsPost = await prisma.blogPost.findFirst({
    where: { slug: 'plantilla-significado-estrellas-airbnb-huespedes' }
  });

  if (!starsPost) {
    console.log('Article not found');
    return;
  }

  // Add the resource banner after the printable template section
  const resourceBanner = `
<div style="background: linear-gradient(135deg, #FF385C 0%, #E31C5F 100%); border-radius: 16px; padding: 2rem; margin: 2.5rem 0; text-align: center; color: white;">
  <h4 style="font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem 0; color: white;">¿Quieres la plantilla con tu QR de WhatsApp?</h4>
  <p style="font-size: 1rem; margin: 0 0 1.25rem 0; opacity: 0.95;">Personaliza la plantilla con tu nombre y número. Incluye un código QR para que tus huéspedes te contacten directamente.</p>
  <a href="/recursos/plantilla-estrellas-personalizada" style="display: inline-block; background: white; color: #E31C5F; font-weight: 700; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none;">Personalizar plantilla gratis</a>
</div>`;

  let content = starsPost.content;

  // Check if already has the resource link
  if (content.includes('plantilla-estrellas-personalizada')) {
    console.log('Resource link already exists');
    return;
  }

  // Add after the printable template section (after "Cómo usar la plantilla")
  content = content.replace(
    /<\/div>\s*<h2 class="section-title">Versión corta/,
    `</div>\n\n${resourceBanner}\n\n<h2 class="section-title">Versión corta`
  );

  await prisma.blogPost.update({
    where: { id: starsPost.id },
    data: { content }
  });

  console.log('Resource link added to article');
}

main().catch(console.error).finally(() => prisma.$disconnect());
