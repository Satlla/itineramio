const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const article = await prisma.blogPost.findFirst({
    where: { slug: 'como-conseguir-resenas-5-estrellas-sin-parecer-desesperado' }
  });

  if (!article) {
    console.log('Article not found');
    return;
  }

  // Add link to plantilla if not present
  let updatedContent = article.content;

  if (!updatedContent.includes('plantilla-significado-estrellas')) {
    // Find the link to encuestas and add plantilla link nearby
    updatedContent = updatedContent.replace(
      /(<a href="\/blog\/como-crear-encuestas-satisfaccion-huespedes-google-forms">.*?<\/a>)/g,
      '$1 y consulta nuestra <a href="/blog/plantilla-significado-estrellas-airbnb-huespedes">plantilla del significado de las estrellas</a>'
    );
  }

  // Also add in the closure section if there's a mention of estrellas
  if (!updatedContent.includes('plantilla-significado-estrellas') && updatedContent.includes('cierre')) {
    // Add at the end of the article before summary
    updatedContent = updatedContent.replace(
      /<h2 class="section-title">Resumen/,
      `<div class="tip-box">
  <div class="tip-box-title">Recurso adicional</div>
  <p>Descarga nuestra <a href="/blog/plantilla-significado-estrellas-airbnb-huespedes" style="color: #1e40af; text-decoration: underline;">plantilla del significado de las estrellas</a> para incluir en tu mensaje de cierre o imprimir para tu alojamiento.</p>
</div>

<h2 class="section-title">Resumen`
    );
  }

  await prisma.blogPost.update({
    where: { id: article.id },
    data: { content: updatedContent }
  });

  console.log('Article updated with plantilla link');
}

main().catch(console.error).finally(() => prisma.$disconnect());
