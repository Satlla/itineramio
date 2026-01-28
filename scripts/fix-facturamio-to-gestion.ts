import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function fix() {
  console.log('Actualizando FACTURAMIO → GESTION...')

  const result = await prisma.$executeRaw`
    UPDATE user_modules
    SET "moduleType" = 'GESTION'
    WHERE "moduleType" = 'FACTURAMIO'
  `

  console.log(`✅ ${result} registro(s) actualizado(s)`)

  // Verificar
  const remaining = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM user_modules WHERE "moduleType" = 'FACTURAMIO'
  ` as any[]

  console.log(`Registros FACTURAMIO restantes: ${remaining[0].count}`)
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
