import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Buscar si ya completó el test
    const existingTest = await prisma.hostProfileTest.findFirst({
      where: { email: email.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        archetype: true,
        createdAt: true,
      }
    })

    if (existingTest) {
      return NextResponse.json({
        exists: true,
        resultId: existingTest.id,
        archetype: existingTest.archetype,
        completedAt: existingTest.createdAt,
      })
    }

    return NextResponse.json({
      exists: false,
    })

  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Error al verificar el email' },
      { status: 500 }
    )
  }
}
