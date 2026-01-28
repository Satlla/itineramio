import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'verifactu-2027-guia-gestores-apartamentos-turisticos' },
    select: { id: true, content: true }
  })

  if (!post) {
    console.log('Post no encontrado')
    return
  }

  let content = post.content

  // Reemplazar caracteres problemáticos por versiones seguras
  content = content.replace(/\u2014/g, '-')      // em dash
  content = content.replace(/\u2013/g, '-')      // en dash
  content = content.replace(/\u2022/g, '&#8226;') // bullet
  content = content.replace(/\u2192/g, '&#8594;') // flecha derecha
  content = content.replace(/\u201C/g, '"')       // comilla izquierda
  content = content.replace(/\u201D/g, '"')       // comilla derecha
  content = content.replace(/\u2018/g, "'")       // apóstrofe izquierdo
  content = content.replace(/\u2019/g, "'")       // apóstrofe derecho

  await prisma.blogPost.update({
    where: { id: post.id },
    data: { content }
  })

  console.log('Contenido actualizado y limpiado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
