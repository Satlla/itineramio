import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  // Primero ver las columnas de la tabla
  const columns = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'user_modules'
  ` as any[]
  console.log('Columnas:', columns.map(c => c.column_name).join(', '))

  // Buscar con query raw
  const modules = await prisma.$queryRaw`
    SELECT * FROM user_modules WHERE "moduleType" = 'FACTURAMIO'
  ` as any[]

  console.log('\nRegistros con FACTURAMIO:', modules.length)
  if (modules.length > 0) {
    modules.forEach(m => console.log('  -', m.id, m.userId, m.status))
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
