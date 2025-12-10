import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'modo-bombero-a-ceo-escalar-airbnb' },
    select: {
      id: true,
      title: true,
      content: true,
      status: true
    }
  })

  if (!post) {
    console.log('❌ Article not found')
    return
  }

  console.log('✅ Article found')
  console.log('Title:', post.title)
  console.log('Status:', post.status)
  console.log('Content length:', post.content.length)
  console.log('\nFirst 1000 chars:')
  console.log(post.content.substring(0, 1000))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
