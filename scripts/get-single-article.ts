import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const articleId = process.argv[2];

async function getArticle() {
  const article = await prisma.blogPost.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true
    }
  });

  if (article) {
    console.log('='.repeat(80));
    console.log(`Título: ${article.title}`);
    console.log(`Slug: ${article.slug}`);
    console.log(`ID: ${article.id}`);
    console.log('='.repeat(80));
    console.log('\nCONTENIDO:\n');
    console.log(article.content);
  } else {
    console.log('Artículo no encontrado');
  }

  await prisma.$disconnect();
}

getArticle();
