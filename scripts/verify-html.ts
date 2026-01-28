import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'verifactu-2027-guia-gestores-apartamentos-turisticos' },
    select: { content: true }
  })

  if (!post) {
    console.log('Post no encontrado')
    return
  }

  const content = post.content

  // Contar tags
  const tagCounts: Record<string, number> = {}
  const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link']

  const openMatches = content.match(/<([a-z0-9]+)[^>]*>/gi) || []
  const closeMatches = content.match(/<\/([a-z0-9]+)>/gi) || []

  openMatches.forEach(tag => {
    const match = tag.match(/<([a-z0-9]+)/i)
    if (match) {
      const name = match[1].toLowerCase()
      if (selfClosing.indexOf(name) === -1) {
        tagCounts[name] = (tagCounts[name] || 0) + 1
      }
    }
  })

  closeMatches.forEach(tag => {
    const match = tag.match(/<\/([a-z0-9]+)/i)
    if (match) {
      const name = match[1].toLowerCase()
      tagCounts[name] = (tagCounts[name] || 0) - 1
    }
  })

  console.log('Balance de tags:')
  let allOk = true
  Object.entries(tagCounts).forEach(([tag, count]) => {
    if (count !== 0) {
      console.log(`  ${tag}: ${count > 0 ? '+' : ''}${count} (DESBALANCEADO)`)
      allOk = false
    } else {
      console.log(`  ${tag}: OK`)
    }
  })

  if (allOk) {
    console.log('\n✓ Todos los tags están balanceados')
  }

  console.log('\nTotal caracteres:', content.length)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
