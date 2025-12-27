import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await prisma.hostProfileTest.findUnique({
      where: { id },
      select: {
        id: true,
        archetype: true,
        topStrength: true,
        criticalGap: true,
        scoreHospitalidad: true,
        scoreComunicacion: true,
        scoreOperativa: true,
        scoreCrisis: true,
        scoreData: true,
        scoreLimites: true,
        scoreMkt: true,
        scoreBalance: true,
        email: true
      }
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Resultado no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: result.id,
      archetype: result.archetype,
      topStrength: result.topStrength,
      criticalGap: result.criticalGap,
      scores: {
        scoreHospitalidad: result.scoreHospitalidad,
        scoreComunicacion: result.scoreComunicacion,
        scoreOperativa: result.scoreOperativa,
        scoreCrisis: result.scoreCrisis,
        scoreData: result.scoreData,
        scoreLimites: result.scoreLimites,
        scoreMkt: result.scoreMkt,
        scoreBalance: result.scoreBalance
      },
      email: result.email
    })

  } catch (error) {
    console.error('Error fetching result:', error)
    return NextResponse.json(
      { error: 'Error al obtener resultado' },
      { status: 500 }
    )
  }
}
