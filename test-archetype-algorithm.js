// Test del algoritmo de arquetipos

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

  const sortedDimensions = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topStrength = sortedDimensions[0][0]

  let archetype = 'EQUILIBRADO'

  // EL ESTRATEGA: Alto en DATA, MKT, y razonable en OPERATIVA
  if (DATA >= 4.0 && MKT >= 3.5 && OPERATIVA >= 3.0) {
    return 'ESTRATEGA'
  }
  // EL SISTEMÁTICO: Alto en OPERATIVA, bajo en improvisación (no bajo en BALANCE)
  else if (OPERATIVA >= 4.0 && BALANCE >= 3.0) {
    return 'SISTEMATICO'
  }
  // EL DIFERENCIADOR: Alto en MKT, COMUNICACION
  else if (MKT >= 4.0 && COMUNICACION >= 3.5) {
    return 'DIFERENCIADOR'
  }
  // EL EJECUTOR: Alto en OPERATIVA y CRISIS, rápido pero puede ser bajo en BALANCE
  else if (OPERATIVA >= 3.5 && CRISIS >= 3.5 && BALANCE < 3.5) {
    return 'EJECUTOR'
  }
  // EL RESOLUTOR: Muy alto en CRISIS
  else if (CRISIS >= 4.5) {
    return 'RESOLUTOR'
  }
  // EL EXPERIENCIAL: Muy alto en HOSPITALIDAD, COMUNICACION
  else if (HOSPITALIDAD >= 4.5 && COMUNICACION >= 4.0) {
    return 'EXPERIENCIAL'
  }
  // EL EQUILIBRADO: Scores balanceados, alto en BALANCE
  else if (BALANCE >= 4.0 && Math.max(...Object.values(scores)) - Math.min(...Object.values(scores)) < 1.5) {
    return 'EQUILIBRADO'
  }
  // EL IMPROVISADOR: Bajo en OPERATIVA, BALANCE, pero adaptable (CRISIS razonable)
  else if (OPERATIVA < 3.0 && BALANCE < 3.0 && CRISIS >= 3.0) {
    return 'IMPROVISADOR'
  }
  // Por defecto, si no encaja en ninguno, determinar por fortaleza principal
  else {
    if (topStrength === 'HOSPITALIDAD') return 'EXPERIENCIAL'
    else if (topStrength === 'COMUNICACION') return 'DIFERENCIADOR'
    else if (topStrength === 'OPERATIVA') return 'SISTEMATICO'
    else if (topStrength === 'CRISIS') return 'RESOLUTOR'
    else if (topStrength === 'DATA') return 'ESTRATEGA'
    else if (topStrength === 'LIMITES') return 'EJECUTOR'
    else if (topStrength === 'MKT') return 'DIFERENCIADOR'
    else if (topStrength === 'BALANCE') return 'EQUILIBRADO'
  }

  return archetype
}

// Test cases
const testCases = [
  {
    name: 'Respuestas aleatorias 1',
    scores: {
      HOSPITALIDAD: 3.5,
      COMUNICACION: 3.8,
      OPERATIVA: 3.2,
      CRISIS: 3.6,
      DATA: 4.2,
      LIMITES: 3.4,
      MKT: 3.7,
      BALANCE: 3.1
    }
  },
  {
    name: 'Respuestas aleatorias 2',
    scores: {
      HOSPITALIDAD: 4.0,
      COMUNICACION: 3.5,
      OPERATIVA: 3.0,
      CRISIS: 3.2,
      DATA: 4.1,
      LIMITES: 2.8,
      MKT: 3.6,
      BALANCE: 3.3
    }
  },
  {
    name: 'Alto en hospitalidad',
    scores: {
      HOSPITALIDAD: 4.8,
      COMUNICACION: 4.2,
      OPERATIVA: 2.5,
      CRISIS: 3.0,
      DATA: 2.2,
      LIMITES: 2.8,
      MKT: 2.9,
      BALANCE: 3.1
    }
  },
  {
    name: 'Alto en crisis',
    scores: {
      HOSPITALIDAD: 3.0,
      COMUNICACION: 3.2,
      OPERATIVA: 3.5,
      CRISIS: 4.8,
      DATA: 2.8,
      LIMITES: 3.1,
      MKT: 2.7,
      BALANCE: 3.0
    }
  },
  {
    name: 'Improvisador',
    scores: {
      HOSPITALIDAD: 3.5,
      COMUNICACION: 3.8,
      OPERATIVA: 2.5,
      CRISIS: 3.5,
      DATA: 2.8,
      LIMITES: 2.6,
      MKT: 3.2,
      BALANCE: 2.7
    }
  },
  {
    name: 'Todas las respuestas en 3',
    scores: {
      HOSPITALIDAD: 3.0,
      COMUNICACION: 3.0,
      OPERATIVA: 3.0,
      CRISIS: 3.0,
      DATA: 3.0,
      LIMITES: 3.0,
      MKT: 3.0,
      BALANCE: 3.0
    }
  }
]

console.log('PRUEBA DEL ALGORITMO DE ARQUETIPOS\n')
console.log('='.repeat(70))

testCases.forEach(test => {
  const result = determineArchetype(test.scores)
  console.log(`\n${test.name}:`)
  console.log(`  DATA: ${test.scores.DATA}, MKT: ${test.scores.MKT}, OPERATIVA: ${test.scores.OPERATIVA}`)
  console.log(`  → Resultado: ${result}`)
})

console.log('\n' + '='.repeat(70))
console.log('\nCONCLUSIONES:')
console.log('- Si DATA >= 4.0 Y MKT >= 3.5 Y OPERATIVA >= 3.0 → siempre ESTRATEGA')
console.log('- Estas condiciones son muy fáciles de cumplir')
console.log('- Se activa antes que otros arquetipos más específicos')
