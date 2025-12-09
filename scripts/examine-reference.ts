import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
    }
  }
});

async function main() {
  const article = await prisma.blogPost.findUnique({
    where: { id: 'cmi3gal4o00007c2wznnfq6e3' }
  });
  
  if (!article) {
    console.log('Reference article not found');
    return;
  }
  
  console.log('Reference Article Content:\n');
  console.log(article.content);
  
  await prisma.$disconnect();
}

main().catch(console.error);
