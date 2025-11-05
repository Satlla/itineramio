import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Archetype, Dimension } from '@/src/data/hostProfileQuestions'

interface AnswerData {
  questionId: number
  dimension: Dimension
  value: number
}

interface SubmitRequest {
  answers: AnswerData[]
  email: string
  name?: string
  gender?: 'M' | 'F' | 'O'
}

// Algoritmo de cálculo de scores por dimensión
function calculateDimensionScores(answers: AnswerData[]): Record<Dimension, number> {
  const dimensionScores: Record<Dimension, number> = {
    HOSPITALIDAD: 0,
    COMUNICACION: 0,
    OPERATIVA: 0,
    CRISIS: 0,
    DATA: 0,
    LIMITES: 0,
    MKT: 0,
    BALANCE: 0
  }

  const dimensionCounts: Record<Dimension, number> = {
    HOSPITALIDAD: 0,
    COMUNICACION: 0,
    OPERATIVA: 0,
    CRISIS: 0,
    DATA: 0,
    LIMITES: 0,
    MKT: 0,
    BALANCE: 0
  }

  // Suma de valores por dimensión
  answers.forEach(answer => {
    dimensionScores[answer.dimension] += answer.value
    dimensionCounts[answer.dimension]++
  })

  // Promedios (escala 1-5)
  Object.keys(dimensionScores).forEach(dimension => {
    const dim = dimension as Dimension
    if (dimensionCounts[dim] > 0) {
      dimensionScores[dim] = dimensionScores[dim] / dimensionCounts[dim]
    }
  })

  return dimensionScores
}

// Determinar arquetipo basado en scores
function determineArchetype(scores: Record<Dimension, number>): {
  archetype: Archetype
  topStrength: string
  criticalGap: string
} {
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
  const topStrength = sortedDimensions[0][0] as Dimension
  const criticalGap = sortedDimensions[sortedDimensions.length - 1][0] as Dimension

  // Lógica de asignación de arquetipo
  let archetype: Archetype = 'EQUILIBRADO'

  // EL ESTRATEGA: Alto en DATA, MKT, y razonable en OPERATIVA
  if (DATA >= 4.0 && MKT >= 3.5 && OPERATIVA >= 3.0) {
    archetype = 'ESTRATEGA'
  }
  // EL SISTEMÁTICO: Alto en OPERATIVA, bajo en improvisación (no bajo en BALANCE)
  else if (OPERATIVA >= 4.0 && BALANCE >= 3.0) {
    archetype = 'SISTEMATICO'
  }
  // EL DIFERENCIADOR: Alto en MKT, COMUNICACION
  else if (MKT >= 4.0 && COMUNICACION >= 3.5) {
    archetype = 'DIFERENCIADOR'
  }
  // EL EJECUTOR: Alto en OPERATIVA y CRISIS, rápido pero puede ser bajo en BALANCE
  else if (OPERATIVA >= 3.5 && CRISIS >= 3.5 && BALANCE < 3.5) {
    archetype = 'EJECUTOR'
  }
  // EL RESOLUTOR: Muy alto en CRISIS
  else if (CRISIS >= 4.5) {
    archetype = 'RESOLUTOR'
  }
  // EL EXPERIENCIAL: Muy alto en HOSPITALIDAD, COMUNICACION
  else if (HOSPITALIDAD >= 4.5 && COMUNICACION >= 4.0) {
    archetype = 'EXPERIENCIAL'
  }
  // EL EQUILIBRADO: Scores balanceados, alto en BALANCE
  else if (BALANCE >= 4.0 && Math.max(...Object.values(scores)) - Math.min(...Object.values(scores)) < 1.5) {
    archetype = 'EQUILIBRADO'
  }
  // EL IMPROVISADOR: Bajo en OPERATIVA, BALANCE, pero adaptable (CRISIS razonable)
  else if (OPERATIVA < 3.0 && BALANCE < 3.0 && CRISIS >= 3.0) {
    archetype = 'IMPROVISADOR'
  }
  // Por defecto, si no encaja en ninguno, determinar por fortaleza principal
  else {
    if (topStrength === 'HOSPITALIDAD') archetype = 'EXPERIENCIAL'
    else if (topStrength === 'COMUNICACION') archetype = 'DIFERENCIADOR'
    else if (topStrength === 'OPERATIVA') archetype = 'SISTEMATICO'
    else if (topStrength === 'CRISIS') archetype = 'RESOLUTOR'
    else if (topStrength === 'DATA') archetype = 'ESTRATEGA'
    else if (topStrength === 'LIMITES') archetype = 'EJECUTOR'
    else if (topStrength === 'MKT') archetype = 'DIFERENCIADOR'
    else if (topStrength === 'BALANCE') archetype = 'EQUILIBRADO'
  }

  return {
    archetype,
    topStrength: getDimensionLabel(topStrength),
    criticalGap: getDimensionLabel(criticalGap)
  }
}

function getDimensionLabel(dimension: Dimension): string {
  const labels: Record<Dimension, string> = {
    HOSPITALIDAD: 'Hospitalidad y Atención al Huésped',
    COMUNICACION: 'Comunicación Efectiva',
    OPERATIVA: 'Gestión Operativa y Procesos',
    CRISIS: 'Resolución de Crisis',
    DATA: 'Análisis de Datos y Rentabilidad',
    LIMITES: 'Límites y Políticas Claras',
    MKT: 'Marketing y Diferenciación',
    BALANCE: 'Balance Vida-Negocio'
  }
  return labels[dimension]
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitRequest = await request.json()

    // Validar que tenemos 45 respuestas
    if (!body.answers || body.answers.length !== 45) {
      return NextResponse.json(
        { error: 'Se requieren 45 respuestas completas' },
        { status: 400 }
      )
    }

    // Validar que el email es requerido y válido
    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Email válido es requerido para ver los resultados' },
        { status: 400 }
      )
    }

    // Calcular scores por dimensión
    const dimensionScores = calculateDimensionScores(body.answers)

    // Determinar arquetipo
    const { archetype, topStrength, criticalGap } = determineArchetype(dimensionScores)

    // Guardar en base de datos
    const testResult = await prisma.hostProfileTest.create({
      data: {
        email: body.email,
        name: body.name || null,
        gender: body.gender || null,
        answers: body.answers,
        scoreHospitalidad: dimensionScores.HOSPITALIDAD,
        scoreComunicacion: dimensionScores.COMUNICACION,
        scoreOperativa: dimensionScores.OPERATIVA,
        scoreCrisis: dimensionScores.CRISIS,
        scoreData: dimensionScores.DATA,
        scoreLimites: dimensionScores.LIMITES,
        scoreMkt: dimensionScores.MKT,
        scoreBalance: dimensionScores.BALANCE,
        archetype,
        topStrength,
        criticalGap,
        emailConsent: true, // True porque dieron email para ver resultados
        shareConsent: false
      }
    })

    return NextResponse.json({
      success: true,
      resultId: testResult.id,
      archetype,
      scores: dimensionScores,
      topStrength,
      criticalGap
    })

  } catch (error) {
    console.error('Error processing test:', error)
    return NextResponse.json(
      { error: 'Error al procesar el test' },
      { status: 500 }
    )
  }
}
