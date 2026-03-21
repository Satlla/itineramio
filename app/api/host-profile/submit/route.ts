import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { Archetype, Dimension } from '@/data/hostProfileQuestions'
import { sendWelcomeTestEmail } from '@/lib/resend'
import { notifyHostProfileTestCompleted } from '@/lib/notifications/admin-notifications'
import { enrollSubscriberInSequences } from '@/lib/email-sequences'
import { updateLeadWithQuiz } from '@/lib/unified-lead'

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
  interests?: string[]
  // Funnel tracking params
  sourceEmail?: string  // e.g., 'email2'
  sourceLevel?: string  // e.g., '2'
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
  const secondStrength = sortedDimensions[1][0] as Dimension
  const criticalGap = sortedDimensions[sortedDimensions.length - 1][0] as Dimension

  // Calcular diferencia entre máximo y mínimo para detectar perfiles balanceados
  const maxScore = Math.max(...Object.values(scores))
  const minScore = Math.min(...Object.values(scores))
  const scoreRange = maxScore - minScore

  // Lógica de asignación de arquetipo (ordenada por especificidad)
  let archetype: Archetype = 'EQUILIBRADO'

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

    // Normalizar email a lowercase
    const normalizedEmail = body.email.toLowerCase().trim()

    // Calcular scores por dimensión
    const dimensionScores = calculateDimensionScores(body.answers)

    // Determinar arquetipo
    const { archetype, topStrength, criticalGap } = determineArchetype(dimensionScores)

    // Guardar en base de datos
    const testResult = await prisma.hostProfileTest.create({
      data: {
        email: normalizedEmail,
        name: body.name || null,
        gender: body.gender || null,
        answers: body.answers as unknown as Prisma.InputJsonValue,
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

    // Update unified lead with quiz data (always, not just from funnel)
    try {
      const leadResult = await updateLeadWithQuiz(normalizedEmail, {
        testResultId: testResult.id,
        archetype,
        topStrength,
        criticalGap,
        scores: dimensionScores,
        sourceEmail: body.sourceEmail
      })
    } catch {
      // Ignore lead update errors
    }

    // Determinar nivel basado en arquetipo (para SOAP OPERA sequence)
    const archetypeToNivel: Record<string, string> = {
      'ESTRATEGA': 'avanzado',
      'SISTEMATICO': 'avanzado',
      'EJECUTOR': 'intermedio',
      'DIFERENCIADOR': 'intermedio',
      'RESOLUTOR': 'intermedio',
      'EXPERIENCIAL': 'principiante',
      'EQUILIBRADO': 'intermedio',
      'IMPROVISADOR': 'principiante'
    }
    const nivel = archetypeToNivel[archetype] || 'intermedio'

    // Crear o actualizar EmailSubscriber para el funnel de email marketing
    let subscriber = null
    try {
      subscriber = await prisma.emailSubscriber.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          name: body.name || null,
          archetype,
          nivel, // Para SOAP OPERA sequence
          source: 'host_profile_test',
          sourceMetadata: {
            testResultId: testResult.id,
            completedAt: new Date().toISOString(),
            scores: dimensionScores,
            gender: body.gender || null,
          },
          status: 'active',
          currentJourneyStage: 'subscribed',
          engagementScore: 'hot', // Alto engagement por completar test
          tags: [archetype, 'test_completed', `nivel_${nivel}`],
          hostProfileTestId: testResult.id,
          // IMPORTANTE: Iniciar la secuencia de nurturing
          sequenceStartedAt: new Date(),
          sequenceStatus: 'active',
          // SOAP OPERA sequence tracking
          soapOperaStatus: 'pending',
          // Interest-based segmentation
          interests: body.interests || [],
          topPriority: body.interests?.[0] || null,
          contentTrack: body.interests?.[0] ? `${body.interests[0]}_focused` : null,
        },
        update: {
          // Si ya existe, actualizar con el nuevo test
          name: body.name || null,
          archetype,
          nivel, // Actualizar nivel también
          sourceMetadata: {
            testResultId: testResult.id,
            completedAt: new Date().toISOString(),
            scores: dimensionScores,
            gender: body.gender || null,
          },
          tags: [archetype, 'test_completed', `nivel_${nivel}`],
          hostProfileTestId: testResult.id,
          // Reiniciar secuencia si hicieron el test de nuevo
          sequenceStartedAt: new Date(),
          sequenceStatus: 'active',
          soapOperaStatus: 'pending', // Reiniciar SOAP OPERA
          soapOperaStartedAt: null,
          day3SentAt: null,
          day7SentAt: null,
          day10SentAt: null,
          day14SentAt: null,
          // Interest-based segmentation
          interests: body.interests || [],
          topPriority: body.interests?.[0] || null,
          contentTrack: body.interests?.[0] ? `${body.interests[0]}_focused` : null,
        }
      })
    } catch {
      // No fallar la request si hay error en EmailSubscriber (tabla puede no existir aún)
      subscriber = null
    }

    // Enviar email de bienvenida con resultados del test
    let emailSent = false
    let emailError = null
    try {
      const emailResult = await sendWelcomeTestEmail({
        email: normalizedEmail,
        name: body.name || 'Anfitrión',
        gender: body.gender,
        archetype,
        subscriberId: subscriber?.id, // Pasar el ID para generar token
        interests: body.interests // Intereses seleccionados en el test
      })

      emailSent = emailResult.success

      // Si el email se envió exitosamente, actualizar tracking
      if (emailResult.success && subscriber) {
        await prisma.emailSubscriber.update({
          where: { id: subscriber.id },
          data: {
            emailsSent: { increment: 1 },
            lastEmailSentAt: new Date()
          }
        })
      }
    } catch (err) {
      // No fallar la request si hay error enviando email
      emailError = err instanceof Error ? err.message : 'Unknown error'
    }

    // Inscribir en secuencias de email automatizadas
    let sequenceEnrollment = null
    if (subscriber) {
      try {
        sequenceEnrollment = await enrollSubscriberInSequences(
          subscriber.id,
          'TEST_COMPLETED',
          {
            archetype,
            source: 'host_profile_test',
            tags: [archetype, 'test_completed']
          }
        )
      } catch {
        // Ignore sequence enrollment errors
      }
    }

    // Send admin notification (async, don't block response)
    notifyHostProfileTestCompleted({
      email: normalizedEmail,
      name: body.name,
      archetype,
      score: Object.values(dimensionScores).reduce((a, b) => a + b, 0)
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      resultId: testResult.id,
      archetype,
      scores: dimensionScores,
      topStrength,
      criticalGap,
      // DEBUG INFO - versión 2
      debug: {
        version: 2,
        emailSent,
        emailError,
        subscriberId: subscriber?.id,
        hasSubscriber: !!subscriber
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar el test' },
      { status: 500 }
    )
  }
}
