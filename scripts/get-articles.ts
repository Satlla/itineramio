import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const articleIds = [
  'cmiq5kw7k00017co5t5ynrc30',
  'cmiq5kvi900007co5soytmb7p',
  'cmi4dw5yi00007cfx4hlferv3',
  'cmi3galw200027c2wcah8qrhw',
  'cmi3galjk00017c2wh9s25tvo',
  'cmi3g0f0u00007cwd9dxmw4tw',
  'cmhi1q60500007cgbn21jv7re',
  'cmhe1ga4s00017cqean8wlpjy',
  'cmhe1g9s200007cqejf99s962',
  'cmhe19f5600017che6hy2p6yd',
  'cmhe19erk00007chedbhrdb33',
  'cmhe0v7fg00007c6j56v6gyzy',
  'cmhdywg9500057cm2ik2mftj9',
  'cmhdywfym00047cm2l8j6nizb',
  'cmhdywfny00037cm2tx0suxd6',
  'cmhdywfd500027cm2gfahej8p',
  'cmhdywf2500017cm25c5cwhps',
  'cmhdyweq700007cm243p73ujg'
];

async function getArticles() {
  const articles = await prisma.blogPost.findMany({
    where: {
      id: { in: articleIds }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true
    }
  });

  console.log(JSON.stringify(articles, null, 2));
  await prisma.$disconnect();
}

getArticles();
