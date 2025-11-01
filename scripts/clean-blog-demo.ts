import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Cleaning demo blog articles...')

  const result = await prisma.blogPost.deleteMany({
    where: {
      slug: {
        in: [
          'como-optimizar-precio-apartamento-turistico-2025',
          'manual-digital-apartamentos-guia-definitiva',
          'normativa-vut-2025-cambios-legales',
          'automatizacion-anfitriones-airbnb',
          '10-trucos-marketing-aumentar-reservas',
          'operaciones-check-in-sin-estres'
        ]
      }
    }
  })

  console.log(`✅ Deleted ${result.count} demo articles`)
  console.log('\n🔗 View blog at: http://localhost:3000/blog')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
