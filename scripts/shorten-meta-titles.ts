import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
    }
  }
});

// Mapa de correcciones manuales para acortar títulos
const shortenedTitles: Record<string, string> = {
  'automatizacion-airbnb-recupera-8-horas-semanales': 'Automatización Airbnb: Recupera 8 Horas/Semana [2026]',
  'calculadora-precio-airbnb-precio-optimo': 'Calculadora Precio Airbnb 2026: Precios Dinámicos',
  'instrucciones-wifi-huespedes-apartamento-turistico': 'Instrucciones WiFi Huéspedes: Template Gratis 2026',
  'fotografia-profesional-airbnb-guia-completa': 'Fotografía Profesional Airbnb: Guía Completa 2026',
  'amenities-multiplican-reservas-cuales-queman-dinero': 'Amenities que Multiplican Reservas [Guía 2026]',
  'checklist-limpieza-profesional-elimina-90-quejas': 'Checklist Limpieza Pro: 47 Puntos Anti-Quejas',
  'tarjeta-wifi-imprimible-huespedes-plantilla': 'Tarjeta WiFi Imprimible + QR Gratis | Huéspedes',
  'metodo-4-pasos-convertir-quejas-en-5-estrellas': 'Convertir Quejas en 5 Estrellas | Método ESAR',
  'como-crear-encuestas-satisfaccion-huespedes-google-forms': 'Encuestas Satisfacción Huéspedes | Google Forms',
  'plantilla-significado-estrellas-airbnb-huespedes': 'Significado Estrellas Airbnb | Plantilla Gratis',
  'del-modo-bombero-al-modo-ceo-framework': 'Del Modo Bombero al Modo CEO | Framework 2026',
  'manual-digital-apartamento-turistico-guia-completa': 'Guía Digital Apartamento Turístico 2026 [Gratis]',
  'storytelling-que-convierte-descripciones-airbnb': 'Descripciones Airbnb que Convierten | S.T.O.R.Y.',
  'mensajes-automaticos-booking': 'Mensajes Automáticos Booking: Plantillas 2026',
  '10-trucos-marketing-aumentar-reservas': '10 Trucos Marketing Apartamentos Turísticos'
};

async function shortenTitles() {
  console.log('✂️  ACORTANDO META TITLES\n');

  let updated = 0;

  for (const [slug, newTitle] of Object.entries(shortenedTitles)) {
    const article = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, metaTitle: true }
    });

    if (article === null) {
      console.log('❌ No encontrado: ' + slug);
      continue;
    }

    await prisma.blogPost.update({
      where: { id: article.id },
      data: { metaTitle: newTitle }
    });

    console.log('✅ ' + slug);
    console.log('   [' + (article.metaTitle?.length || 0) + '] ' + article.metaTitle);
    console.log('   [' + newTitle.length + '] ' + newTitle);
    console.log('');
    updated++;
  }

  console.log('Total acortados: ' + updated);

  await prisma.$disconnect();
}

shortenTitles();
