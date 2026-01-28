import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Datos del CSV que el usuario pegó
const csvData = [
  { code: 'HMCXMZSXFH', guest: 'Laura Viviana Galindo Rozo', hostEarnings: 682.30, cleaning: 12.00 },
  { code: 'HMTM4MYQTY', guest: 'Matias Eduardo La Fontaine Sarmiento', hostEarnings: 221.65, cleaning: 10.00 },
  { code: 'HMPSAHEZEX', guest: 'Ольга Курганская', hostEarnings: 173.47, cleaning: 10.00 },
  { code: 'HM45DCJSWT', guest: 'Maria Garcia', hostEarnings: 106.01, cleaning: 10.00 },
  { code: 'HMXS8FS2EN', guest: 'Mona Von Hein', hostEarnings: 225.51, cleaning: 10.00 },
  { code: 'HMEXHH5YSD', guest: 'Aneel Abu Shahin', hostEarnings: 330.55, cleaning: 10.00 },
  { code: 'HM4YQ8SF4N', guest: 'Adryelle Montenegro', hostEarnings: 297.78, cleaning: 10.00 },
]

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'alejandrosatlla@gmail.com' } })
  if (!user) return

  console.log('=== COMPARACIÓN CSV vs BASE DE DATOS ===\n')
  console.log('Reservas de enero 2026:\n')

  for (const csv of csvData) {
    const db = await prisma.reservation.findFirst({
      where: { userId: user.id, confirmationCode: csv.code }
    })

    if (!db) {
      console.log(`❌ ${csv.code} - ${csv.guest}: NO ENCONTRADA EN BD`)
      continue
    }

    const dbEarnings = Number(db.hostEarnings)
    const dbCleaning = Number(db.cleaningFee)
    const earningsMatch = Math.abs(dbEarnings - csv.hostEarnings) < 0.01
    const cleaningMatch = Math.abs(dbCleaning - csv.cleaning) < 0.01

    const status = earningsMatch && cleaningMatch ? '✓' : '❌'

    console.log(`${status} ${csv.code} - ${csv.guest.slice(0, 30)}`)
    console.log(`   CSV:      hostEarnings=${csv.hostEarnings}€, cleaning=${csv.cleaning}€`)
    console.log(`   BD:       hostEarnings=${dbEarnings}€, cleaning=${dbCleaning}€`)
    console.log(`   checkIn:  ${db.checkIn.toISOString().slice(0, 10)}`)

    // Calcular comisión esperada (20%)
    const baseForCommission = dbEarnings - dbCleaning
    const commission = baseForCommission * 0.20
    console.log(`   Comisión: (${dbEarnings} - ${dbCleaning}) * 20% = ${commission.toFixed(2)}€`)
    console.log('')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
