import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'primer-mes-anfitrion-airbnb' },
    select: { id: true, content: true }
  })

  if (!post) {
    console.log('❌ Artículo no encontrado')
    return
  }

  let content = post.content
  let fixes = 0

  // Fix 1: Missing background-color before color value
  const regex1 = /style="([^"]*?)#f9fafb;([^"]*?)"/g
  if (regex1.test(content)) {
    content = content.replace(regex1, 'style="$1background-color: #f9fafb;$2"')
    fixes++
    console.log('✅ Fixed missing background-color')
  }

  // Fix 2: Missing color: before color value in font-weight declarations
  const regex2 = /style="font-weight: 700; #([0-9a-f]{6});/g
  if (regex2.test(content)) {
    content = content.replace(regex2, 'style="font-weight: 700; color: #$1;')
    fixes++
    console.log('✅ Fixed missing color: property')
  }

  // Fix 3: Missing color: before color values in various declarations
  const regex3 = /; #([0-9a-f]{6});/g
  const matches = content.match(regex3)
  if (matches && matches.length > 0) {
    content = content.replace(regex3, '; color: #$1;')
    fixes++
    console.log(`✅ Fixed ${matches.length} missing color: properties`)
  }

  // Fix 4: Check for other malformed CSS
  const regex4 = /style="[^"]*[^:]; #[0-9a-f]{6}/g
  if (regex4.test(content)) {
    console.log('⚠️  Warning: May have more malformed CSS to review')
  }

  if (fixes > 0) {
    await prisma.blogPost.update({
      where: { slug: 'primer-mes-anfitrion-airbnb' },
      data: { content }
    })
    console.log(`\n✅ Artículo actualizado con ${fixes} correcciones CSS`)
  } else {
    console.log('✅ No se encontraron errores CSS')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
