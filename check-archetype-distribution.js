const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkArchetypeDistribution() {
  try {
    // Total de tests
    const totalTests = await prisma.hostProfileTest.count()

    // Distribución por arquetipo
    const byArchetype = await prisma.hostProfileTest.groupBy({
      by: ['archetype'],
      _count: true,
    })

    // Ordenar por cantidad
    const sorted = byArchetype.sort((a, b) => b._count - a._count)

    console.log('🎯 DISTRIBUCIÓN DE ARQUETIPOS EN TESTS\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Total de tests: ${totalTests}\n`)

    sorted.forEach(item => {
      const percentage = ((item._count / totalTests) * 100).toFixed(1)
      const bar = '█'.repeat(Math.round(percentage / 2))
      console.log(`${item.archetype.padEnd(15)} ${item._count.toString().padStart(3)} (${percentage.padStart(5)}%) ${bar}`)
    })

    // Obtener algunos ejemplos de scores para cada arquetipo
    console.log('\n\n📊 EJEMPLOS DE SCORES POR ARQUETIPO:\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    for (const arch of sorted.slice(0, 5)) { // Top 5 arquetipos
      const examples = await prisma.hostProfileTest.findMany({
        where: { archetype: arch.archetype },
        select: {
          archetype: true,
          scoreHospitalidad: true,
          scoreComunicacion: true,
          scoreOperativa: true,
          scoreCrisis: true,
          scoreData: true,
          scoreLimites: true,
          scoreMkt: true,
          scoreBalance: true,
          topStrength: true,
          criticalGap: true,
        },
        take: 2,
      })

      console.log(`\n${arch.archetype}:`)
      examples.forEach((test, i) => {
        console.log(`  Ejemplo ${i + 1}:`)
        console.log(`    HOSPITALIDAD: ${test.scoreHospitalidad.toFixed(2)}`)
        console.log(`    COMUNICACION: ${test.scoreComunicacion.toFixed(2)}`)
        console.log(`    OPERATIVA:    ${test.scoreOperativa.toFixed(2)}`)
        console.log(`    CRISIS:       ${test.scoreCrisis.toFixed(2)}`)
        console.log(`    DATA:         ${test.scoreData.toFixed(2)}`)
        console.log(`    LIMITES:      ${test.scoreLimites.toFixed(2)}`)
        console.log(`    MKT:          ${test.scoreMkt.toFixed(2)}`)
        console.log(`    BALANCE:      ${test.scoreBalance.toFixed(2)}`)
        console.log(`    Fortaleza: ${test.topStrength}`)
        console.log(`    Gap crítico: ${test.criticalGap}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkArchetypeDistribution()
