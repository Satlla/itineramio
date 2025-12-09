import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const articleId = process.argv[2]
  if (!articleId) {
    console.error('Please provide an article ID')
    process.exit(1)
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: articleId },
    select: { slug: true, title: true, content: true }
  })

  console.log(JSON.stringify(post, null, 2))
  await prisma.$disconnect()
}

main()
