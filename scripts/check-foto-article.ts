import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'fotografia-profesional-airbnb-guia-completa' },
    select: { id: true, title: true }
  })

  if (post) {
    console.log('✅ Article already exists:', post.title)
    console.log('   ID:', post.id)
  } else {
    console.log('❌ Article does not exist yet')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
