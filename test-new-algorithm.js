const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Copiar la nueva función del algoritmo
function determineArchetype(scores) {
  const {
    HOSPITALIDAD,
    COMUNICACION,
    OPERATIVA,
    CRISIS,
    DATA,
    LIMITES,
    MKT,
    BALANCE
  } = scores

  // Identificar fortaleza principal (dimensión con score más alto)
  const sortedDimensions = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topStrength = sortedDimensions[0][0]
  const secondStrength = sortedDimensions[1][0]
  const criticalGap = sortedDimensions[sortedDimensions.length - 1][0]

  // Calcular diferencia entre máximo y mínimo para detectar perfiles balanceados
  const maxScore = Math.max(...Object.values(scores))
  const minScore = Math.min(...Object.values(scores))
  const scoreRange = maxScore - minScore

  // Lógica de asignación de arquetipo (ordenada por especificidad)
  let archetype = 'EQUILIBRADO'

  // PASO 1: Perfiles con patrones claros y específicos (alta prioridad)

  // EL RESOLUTOR: Muy alto en CRISIS, es su superpoder
  if (CRISIS >= 4.2 && topStrength === 'CRISIS') {
    archetype = 'RESOLUTOR'
  }
  // EL EXPERIENCIAL: Alto en HOSPITALIDAD, enfocado en la experiencia del huésped
  else if (HOSPITALIDAD >= 4.0 && COMUNICACION >= 3.5 && topStrength === 'HOSPITALIDAD') {
    archetype = 'EXPERIENCIAL'
  }
  // EL IMPROVISADOR: Bajo en estructura pero adaptable
  else if (OPERATIVA < 3.0 && BALANCE < 3.0 && CRISIS >= 3.0) {
    archetype = 'IMPROVISADOR'
  }
  // EL EJECUTOR: Alto en OPERATIVA/LIMITES pero bajo BALANCE (riesgo burnout)
  else if ((OPERATIVA >= 3.8 || LIMITES >= 3.8) && BALANCE < 3.3 && (topStrength === 'OPERATIVA' || topStrength === 'LIMITES')) {
    archetype = 'EJECUTOR'
  }

  // PASO 2: Perfiles estratégicos y de diferenciación (requieren combinaciones)

  // EL SISTEMÁTICO: Alto en OPERATIVA con buenos procesos (debe ir antes de ESTRATEGA)
  else if (OPERATIVA >= 4.0 && BALANCE >= 3.0 && topStrength === 'OPERATIVA') {
    archetype = 'SISTEMATICO'
  }
  // EL ESTRATEGA: Alto en DATA + MKT (analítico y orientado al negocio)
  else if (DATA >= 4.0 && MKT >= 3.8 && (topStrength === 'DATA' || secondStrength === 'DATA')) {
    archetype = 'ESTRATEGA'
  }
  // EL DIFERENCIADOR: Alto en MKT + COMUNICACION (marketing y storytelling)
  else if (MKT >= 4.0 && COMUNICACION >= 3.5 && (topStrength === 'MKT' || topStrength === 'COMUNICACION')) {
    archetype = 'DIFERENCIADOR'
  }

  // PASO 3: Perfil equilibrado (muy balanceado en todas las dimensiones)
  else if (scoreRange < 1.2 && minScore >= 3.2) {
    archetype = 'EQUILIBRADO'
  }

  // PASO 4: Fallback más estricto basado en fortaleza principal
  // Solo si la fortaleza es significativa (>= 4.0)
  else if (maxScore >= 4.0) {
    if (topStrength === 'HOSPITALIDAD') archetype = 'EXPERIENCIAL'
    else if (topStrength === 'COMUNICACION') archetype = 'DIFERENCIADOR'
    else if (topStrength === 'OPERATIVA') archetype = 'SISTEMATICO'
    else if (topStrength === 'CRISIS') archetype = 'RESOLUTOR'
    else if (topStrength === 'DATA') archetype = 'ESTRATEGA'
    else if (topStrength === 'LIMITES') archetype = 'EJECUTOR'
    else if (topStrength === 'MKT') archetype = 'DIFERENCIADOR'
    else if (topStrength === 'BALANCE') archetype = 'EQUILIBRADO'
  }
  // PASO 5: Si ningún score es >= 4.0, es EQUILIBRADO por defecto
  else {
    archetype = 'EQUILIBRADO'
  }

  return {
    archetype,
    topStrength,
    criticalGap
  }
}

async function testNewAlgorithm() {
  try {
    console.log('🧪 PROBANDO NUEVO ALGORITMO DE ARQUETIPOS\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Obtener todos los tests
    const tests = await prisma.hostProfileTest.findMany({
      select: {
        id: true,
        email: true,
        archetype: true,
        scoreHospitalidad: true,
        scoreComunicacion: true,
        scoreOperativa: true,
        scoreCrisis: true,
        scoreData: true,
        scoreLimites: true,
        scoreMkt: true,
        scoreBalance: true,
      }
    })

    console.log(`Total de tests a analizar: ${tests.length}\n`)

    const changes = []
    const newDistribution = {}

    tests.forEach((test, index) => {
      const scores = {
        HOSPITALIDAD: test.scoreHospitalidad,
        COMUNICACION: test.scoreComunicacion,
        OPERATIVA: test.scoreOperativa,
        CRISIS: test.scoreCrisis,
        DATA: test.scoreData,
        LIMITES: test.scoreLimites,
        MKT: test.scoreMkt,
        BALANCE: test.scoreBalance,
      }

      const result = determineArchetype(scores)
      const oldArchetype = test.archetype
      const newArchetype = result.archetype

      // Contar distribución
      newDistribution[newArchetype] = (newDistribution[newArchetype] || 0) + 1

      console.log(`[${index + 1}/${tests.length}] ${test.email.substring(0, 20)}...`)
      console.log(`   Arquetipo ANTERIOR: ${oldArchetype}`)
      console.log(`   Arquetipo NUEVO:    ${newArchetype} ${oldArchetype !== newArchetype ? '⚠️ CAMBIÓ' : '✅'}`)
      console.log(`   Top strength: ${result.topStrength}`)
      console.log(`   Scores: H=${scores.HOSPITALIDAD.toFixed(1)} C=${scores.COMUNICACION.toFixed(1)} O=${scores.OPERATIVA.toFixed(1)} CR=${scores.CRISIS.toFixed(1)} D=${scores.DATA.toFixed(1)} L=${scores.LIMITES.toFixed(1)} M=${scores.MKT.toFixed(1)} B=${scores.BALANCE.toFixed(1)}`)
      console.log('')

      if (oldArchetype !== newArchetype) {
        changes.push({
          email: test.email,
          old: oldArchetype,
          new: newArchetype
        })
      }
    })

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('📊 RESUMEN DE CAMBIOS:\n')
    console.log(`Total de cambios: ${changes.length} de ${tests.length} (${((changes.length/tests.length)*100).toFixed(1)}%)`)

    if (changes.length > 0) {
      console.log('\nDetalles de cambios:')
      changes.forEach(change => {
        console.log(`  ${change.old.padEnd(15)} → ${change.new.padEnd(15)} (${change.email.substring(0, 25)})`)
      })
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('📈 NUEVA DISTRIBUCIÓN:\n')

    const sortedDistribution = Object.entries(newDistribution).sort((a, b) => b[1] - a[1])
    sortedDistribution.forEach(([archetype, count]) => {
      const percentage = ((count / tests.length) * 100).toFixed(1)
      const bar = '█'.repeat(Math.round(percentage / 2))
      console.log(`${archetype.padEnd(15)} ${count.toString().padStart(2)} (${percentage.padStart(5)}%) ${bar}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNewAlgorithm()
