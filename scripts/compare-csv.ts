import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  // Leer el CSV
  const csvContent = fs.readFileSync('/Users/alejandrosatlla/Downloads/air.csv', 'utf-8')
  const lines = csvContent.split('\n')
  
  // Extraer códigos de confirmación del CSV (columna 4 = "Código de confirmación")
  const csvCodes = new Set<string>()
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    
    // Parsear CSV básico
    const parts = line.split(',')
    const tipo = parts[2]?.replace(/"/g, '').trim()
    const code = parts[3]?.replace(/"/g, '').trim()
    
    // Solo reservas (no payouts, ni créditos)
    if (tipo === 'Reserva' && code && code.startsWith('HM')) {
      csvCodes.add(code)
    }
  }
  
  console.log('Códigos en el CSV (tipo Reserva):')
  for (const code of csvCodes) {
    console.log('  ' + code)
  }
  console.log('Total en CSV:', csvCodes.size)
  
  // Comparar con la base de datos
  const user = await prisma.user.findFirst({
    where: { email: 'alejandrosatlla@gmail.com' }
  })
  if (!user) return
  
  const dbReservations = await prisma.reservation.findMany({
    where: { userId: user.id, platform: 'AIRBNB' },
    select: { confirmationCode: true }
  })
  
  const dbCodes = new Set(dbReservations.map(r => r.confirmationCode))
  
  console.log('\nCódigos en la BD:', dbCodes.size)
  
  // Códigos que están en CSV pero NO en BD
  const newCodes = [...csvCodes].filter(c => !dbCodes.has(c))
  console.log('\nCódigos NUEVOS (en CSV pero no en BD):', newCodes.length)
  for (const code of newCodes) {
    console.log('  ' + code)
  }
  
  // Códigos que están en BD pero NO en CSV
  const oldCodes = [...dbCodes].filter(c => !csvCodes.has(c))
  console.log('\nCódigos VIEJOS (en BD pero no en CSV):', oldCodes.length)
  for (const code of oldCodes) {
    console.log('  ' + code)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
