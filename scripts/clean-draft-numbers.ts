/**
 * Script para limpiar números de factura de borradores
 * Ejecutar con: npx ts-node scripts/clean-draft-numbers.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Buscando borradores con número asignado...')

  // Encontrar borradores que tengan número
  const draftsWithNumber = await prisma.clientInvoice.findMany({
    where: {
      status: 'DRAFT',
      OR: [
        { fullNumber: { not: null } },
        { number: { not: null } }
      ]
    },
    select: {
      id: true,
      fullNumber: true,
      number: true,
      owner: {
        select: {
          firstName: true,
          lastName: true,
          companyName: true
        }
      }
    }
  })

  console.log(`Encontrados ${draftsWithNumber.length} borradores con número:`)

  draftsWithNumber.forEach(inv => {
    const ownerName = inv.owner.companyName || `${inv.owner.firstName} ${inv.owner.lastName}`
    console.log(`  - ${inv.fullNumber || inv.number} (${ownerName})`)
  })

  if (draftsWithNumber.length === 0) {
    console.log('No hay borradores que limpiar.')
    return
  }

  // Limpiar los números
  const result = await prisma.clientInvoice.updateMany({
    where: {
      status: 'DRAFT',
      OR: [
        { fullNumber: { not: null } },
        { number: { not: null } }
      ]
    },
    data: {
      fullNumber: null,
      number: null
    }
  })

  console.log(`\n✅ Limpiados ${result.count} borradores`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
