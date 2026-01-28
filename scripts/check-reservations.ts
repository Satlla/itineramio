import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'alejandrosatlla@gmail.com' }
  })

  if (!user) {
    console.log('Usuario no encontrado')
    return
  }

  console.log('Usuario:', user.id)

  const count = await prisma.reservation.count({
    where: { userId: user.id }
  })
  console.log('Total reservas:', count)

  const reservas = await prisma.reservation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 15,
    select: {
      confirmationCode: true,
      guestName: true,
      checkIn: true,
      sourceListingName: true,
      importBatchId: true,
      createdAt: true
    }
  })

  console.log('\nUltimas 15 reservas:')
  for (const r of reservas) {
    console.log('- ' + r.confirmationCode + ' | ' + r.guestName + ' | ' + r.checkIn.toISOString().slice(0,10) + ' | listing: ' + (r.sourceListingName || 'N/A') + ' | batch: ' + (r.importBatchId || 'N/A'))
  }

  const codes = await prisma.reservation.findMany({
    where: { userId: user.id, platform: 'AIRBNB' },
    select: { confirmationCode: true }
  })
  console.log('\nCodigos Airbnb existentes (' + codes.length + '):')
  for (const c of codes) {
    console.log('  ' + c.confirmationCode)
  }

  const imports = await prisma.reservationImport.findMany({
    where: { userId: user.id },
    orderBy: { importDate: 'desc' },
    take: 5
  })
  console.log('\nUltimas importaciones:')
  for (const i of imports) {
    console.log('- ' + i.fileName + ' | ' + i.importDate.toISOString() + ' | imported: ' + i.importedCount + ' | skipped: ' + i.skippedCount + ' | batch: ' + (i.importBatchId || 'N/A'))
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
