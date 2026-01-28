import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Buscar todas las evaluaciones de esta IP
  const ratings = await prisma.zoneRating.findMany({
    where: {
      ipAddress: '89.222.112.20'
    },
    include: {
      zone: {
        include: {
          property: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('=== EVALUACIONES DE IP 89.222.112.20 ===\n')
  console.log('Total de evaluaciones:', ratings.length)

  for (const r of ratings) {
    const zoneName = typeof r.zone?.name === 'object' ? (r.zone.name as {es?: string}).es || JSON.stringify(r.zone.name) : r.zone?.name
    console.log('\n---')
    console.log('Propiedad:', r.zone?.property?.name || 'N/A')
    console.log('Zona:', zoneName || 'N/A')
    console.log('Fecha:', r.createdAt)
    console.log('Idioma evaluación:', r.language)
    console.log('')
    console.log('Puntuaciones:')
    console.log('  - General:', r.overallRating, '★')
    console.log('  - Claridad:', r.clarity, '★')
    console.log('  - Completitud:', r.completeness, '★')
    console.log('  - Utilidad:', r.helpfulness, '★')
    console.log('  - Actualizado:', r.upToDate, '★')
    console.log('')
    console.log('Feedback:', r.feedback || '(sin comentario)')
    console.log('Sugerencias:', r.improvementSuggestions || '(sin sugerencias)')
    console.log('')
    console.log('Perfil huésped:')
    console.log('  - País:', r.guestCountry || 'N/A')
    console.log('  - Rango edad:', r.guestAgeRange || 'N/A')
    console.log('  - Tipo viaje:', r.guestTravelType || 'N/A')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
