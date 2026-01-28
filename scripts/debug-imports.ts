import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'alejandrosatlla@gmail.com' } })
  if (!user) return

  console.log('=== HISTORIAL DE IMPORTACIONES ===\n')

  // Ver las últimas importaciones
  const imports = await prisma.reservationImport.findMany({
    where: { userId: user.id },
    orderBy: { importDate: 'desc' },
    take: 10
  })

  console.log('Últimas importaciones:')
  imports.forEach(i => {
    console.log(`  ${i.importDate.toISOString()} | ${i.fileName} | Importadas: ${i.importedCount} | Saltadas: ${i.skippedCount} | Errores: ${i.errorCount}`)
    if (i.importBatchId) console.log(`    BatchId: ${i.importBatchId}`)
  })

  console.log('\n=== TODAS LAS RESERVAS (ordenadas por creación) ===\n')

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      confirmationCode: true,
      guestName: true,
      checkIn: true,
      hostEarnings: true,
      importBatchId: true,
      importSource: true,
      sourceListingName: true,
      createdAt: true,
      billingConfig: {
        select: {
          property: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('Total reservas:', reservations.length)
  console.log('\nReservas (más recientes primero):')
  reservations.forEach(r => {
    const property = r.billingConfig?.property?.name || 'Sin propiedad'
    console.log(`  ${r.createdAt.toISOString().slice(0,19)} | ${r.confirmationCode} | ${r.checkIn.toISOString().slice(0,10)} | ${r.guestName.slice(0,25).padEnd(25)} | ${property}`)
    if (r.importBatchId) console.log(`    BatchId: ${r.importBatchId}`)
  })

  console.log('\n=== RESERVAS POR BATCH ID ===\n')
  const byBatch = new Map<string, number>()
  reservations.forEach(r => {
    const batch = r.importBatchId || 'Sin batch'
    byBatch.set(batch, (byBatch.get(batch) || 0) + 1)
  })
  byBatch.forEach((count, batch) => {
    console.log(`  ${batch}: ${count} reservas`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
