import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'primer-mes-anfitrion-airbnb' },
    select: { id: true, content: true }
  })

  if (!post) {
    console.log('❌ Article not found')
    return
  }

  console.log('✅ Article found')
  console.log('Content length:', post.content.length, 'characters')

  // Save to file for analysis
  fs.writeFileSync('/Users/alejandrosatlla/Documents/itineramio/primer-mes-content.txt', post.content)
  console.log('📄 Content saved to primer-mes-content.txt')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
