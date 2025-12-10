import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(70));
  console.log('VERIFICACIÓN FINAL - CONVERSIÓN TAILWIND A ESTILOS INLINE');
  console.log('='.repeat(70));
  console.log('');

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'primer-mes-anfitrion-airbnb' }
  });

  if (!article) {
    console.error('❌ Artículo no encontrado');
    return;
  }

  console.log('📄 Artículo: Tu Primer Mes como Anfitrión: Guía Completa Día a Día');
  console.log('🆔 Slug: primer-mes-anfitrion-airbnb');
  console.log('');

  // Buscar atributos class
  const classMatches = article.content.match(/class="[^"]+"/g);
  const classCount = classMatches ? classMatches.length : 0;

  // Buscar atributos style
  const styleMatches = article.content.match(/style="[^"]+"/g);
  const styleCount = styleMatches ? styleMatches.length : 0;

  console.log('📊 ESTADÍSTICAS:');
  console.log('-'.repeat(70));
  console.log(`  Longitud total del contenido: ${article.content.length.toLocaleString()} caracteres`);
  console.log(`  Atributos "class" encontrados: ${classCount}`);
  console.log(`  Atributos "style" encontrados: ${styleCount}`);
  console.log('');

  if (classCount === 0) {
    console.log('✅ ÉXITO: No se encontraron atributos "class" en el contenido');
    console.log('✅ Todas las clases Tailwind han sido convertidas a estilos inline');
  } else {
    console.log(`⚠️  ADVERTENCIA: Se encontraron ${classCount} atributos "class"`);
    console.log('');
    console.log('Atributos class restantes:');
    classMatches?.slice(0, 10).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match}`);
    });
  }

  console.log('');
  console.log('📋 MUESTRA DEL CONTENIDO CONVERTIDO:');
  console.log('-'.repeat(70));

  // Mostrar diferentes secciones del contenido
  const sections = [
    { name: 'Inicio (caracteres 0-800)', start: 0, end: 800 },
    { name: 'Medio (caracteres 15000-15800)', start: 15000, end: 15800 },
    { name: 'Final (últimos 800 caracteres)', start: article.content.length - 800, end: article.content.length },
  ];

  sections.forEach(section => {
    console.log('');
    console.log(`${section.name}:`);
    console.log(article.content.substring(section.start, section.end));
    console.log('...');
  });

  console.log('');
  console.log('='.repeat(70));
  console.log('✅ VERIFICACIÓN COMPLETADA');
  console.log('='.repeat(70));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
