import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
    }
  }
});

const articleIds = [
  'cmiq5kw7k00017co5t5ynrc30', // mensajes-automaticos-booking
  'cmiq5kvi900007co5soytmb7p', // mensajes-automaticos-airbnb
  'cmi4dw5yi00007cfx4hlferv3', // metodologia-datos-itineramio
  'cmi3galw200027c2wcah8qrhw', // caso-laura
  'cmi3galjk00017c2wh9s25tvo', // del-modo-bombero-al-modo-ceo
  'cmi3g0f0u00007cwd9dxmw4tw', // revpar-vs-ocupacion
  'cmhi1q60500007cgbn21jv7re', // manual-digital
  'cmhe1ga4s00017cqean8wlpjy', // vut-madrid-2025
  'cmhe1g9s200007cqejf99s962', // plantilla-check-in-remoto
  'cmhe19f5600017che6hy2p6yd', // instrucciones-wifi
  'cmhe19erk00007chedbhrdb33', // qr-code
  'cmhe0v7fg00007c6j56v6gyzy', // manual-digital-guia-completa
  'cmhdywg9500057cm2ik2mftj9', // operaciones-check-in
  'cmhdywfym00047cm2l8j6nizb', // 10-trucos-marketing
  'cmhdywfny00037cm2tx0suxd6', // automatizacion-anfitriones
  'cmhdywfd500027cm2gfahej8p', // normativa-vut-2025
  'cmhdywf2500017cm25c5cwhps', // manual-digital-apartamentos
  'cmhdyweq700007cm243p73ujg', // como-optimizar-precio
];

async function main() {
  console.log('Starting to format blog articles...\n');
  
  // First, let's fetch the reference article to see its formatting
  const referenceArticle = await prisma.blogPost.findUnique({
    where: { id: 'cmi3gal4o00007c2wznnfq6e3' }
  });
  
  if (referenceArticle) {
    console.log('Reference article fetched:');
    console.log(`Title: ${referenceArticle.title}`);
    console.log(`Slug: ${referenceArticle.slug}`);
    console.log(`Content length: ${referenceArticle.content.length} chars\n`);
  }
  
  // Now fetch the first 3 articles to work with
  const batch1 = articleIds.slice(0, 3);
  
  for (const id of batch1) {
    const article = await prisma.blogPost.findUnique({
      where: { id }
    });
    
    if (article) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Article: ${article.title}`);
      console.log(`Slug: ${article.slug}`);
      console.log(`Content length: ${article.content.length} chars`);
      console.log(`${'='.repeat(80)}\n`);
      
      // Show first 1000 chars of content to understand structure
      console.log('First 1000 chars of content:');
      console.log(article.content.substring(0, 1000));
      console.log('\n...\n');
    } else {
      console.log(`Article ${id} not found`);
    }
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
