import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/email/tag
 *
 * Gestiona tags, engagement score y journey stage de subscribers
 *
 * Body:
 * {
 *   email: string
 *   action: 'add' | 'remove' | 'set' | 'update'
 *   tags?: string[] // Para add/remove/set
 *   engagementScore?: 'hot' | 'warm' | 'cold'
 *   journeyStage?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      action,
      tags = [],
      engagementScore,
      journeyStage
    } = body

    // Validación básica
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    if (!action || !['add', 'remove', 'set', 'update'].includes(action)) {
      return NextResponse.json(
        { error: 'Action debe ser: add, remove, set, o update' },
        { status: 400 }
      )
    }

    // Buscar subscriber
    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos de actualización
    let updateData: any = {}

    // Gestionar tags según la acción
    if (action === 'add' && tags.length > 0) {
      // Añadir tags sin duplicar
      const currentTags = subscriber.tags || []
      const newTags = [...new Set([...currentTags, ...tags])]
      updateData.tags = newTags
    }
    else if (action === 'remove' && tags.length > 0) {
      // Remover tags específicos
      const currentTags = subscriber.tags || []
      const newTags = currentTags.filter(tag => !tags.includes(tag))
      updateData.tags = newTags
    }
    else if (action === 'set') {
      // Reemplazar todos los tags
      updateData.tags = tags
    }

    // Actualizar engagement score si se proporciona
    if (engagementScore && ['hot', 'warm', 'cold'].includes(engagementScore)) {
      updateData.engagementScore = engagementScore

      // Si pasa a "hot", registrar la fecha
      if (engagementScore === 'hot' && subscriber.engagementScore !== 'hot') {
        updateData.becameHotAt = new Date()
      }
    }

    // Actualizar journey stage si se proporciona
    if (journeyStage) {
      updateData.currentJourneyStage = journeyStage
    }

    // Actualizar subscriber
    const updated = await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        ...updateData,
        lastEngagement: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      subscriber: updated,
      changes: {
        tagsChanged: !!updateData.tags,
        engagementChanged: !!updateData.engagementScore,
        journeyChanged: !!updateData.currentJourneyStage
      }
    })

  } catch (error) {
    console.error('Error en /api/email/tag:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email/tag?email=user@example.com
 *
 * Obtiene los tags y metadatos de un subscriber
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        tags: true,
        engagementScore: true,
        currentJourneyStage: true,
        lastEngagement: true,
        becameHotAt: true,
        archetype: true,
        source: true
      }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriber
    })

  } catch (error) {
    console.error('Error en GET /api/email/tag:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
