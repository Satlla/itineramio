import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  scheduleOnboardingSequence,
  sendLeadMagnetEmail,
  type EmailArchetype,
} from '@/lib/resend'
import { getLeadMagnetBySlug } from '@/data/lead-magnets'
import { notifyEmailSubscriber } from '@/lib/notifications/admin-notifications'
import { enrollSubscriberInSequences } from '@/lib/email-sequences'

const prisma = new PrismaClient()

/**
 * POST /api/email/subscribe
 *
 * Suscribe un email a la lista de marketing de Itineramio
 * y programa la secuencia de onboarding correspondiente
 *
 * Body:
 * {
 *   email: string (required)
 *   name?: string
 *   archetype?: EmailArchetype
 *   source: 'test' | 'qr' | 'blog' | 'landing' | 'manual' (required)
 *   tags?: string[]
 *   metadata?: any
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, archetype, source, tags = [], metadata = {}, prioridades = [] } = body

    // Convert priorities to tags
    const priorityTags = (prioridades as string[]).map((p: string) => `interes-${p}`)
    const allTags = [...tags, ...priorityTags]

    // Validación
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (!source) {
      return NextResponse.json(
        { error: 'Source es requerido' },
        { status: 400 }
      )
    }

    // Normalizar email a minúsculas para evitar duplicados
    const normalizedEmail = email.toLowerCase().trim()

    // Verificar si ya existe el suscriptor
    const existing = await prisma.emailSubscriber.findFirst({
      where: { email: normalizedEmail }
    })

    if (existing) {
      // Si ya existe y está unsubscribed, reactivar
      if (existing.status === 'unsubscribed') {
        await prisma.emailSubscriber.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            unsubscribedAt: null,
            updatedAt: new Date()
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Suscripción reactivada',
          subscriber: { email, reactivated: true }
        })
      }

      // Si ya existe y está activo, enviar el lead magnet si aplica
      if (source === 'lead_magnet' && metadata.leadMagnetSlug) {
        const leadMagnet = getLeadMagnetBySlug(metadata.leadMagnetSlug)
        if (leadMagnet) {
          // Enlace directo al PDF (sin tokens intermedios)
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
          const downloadUrl = `${baseUrl}${leadMagnet.downloadUrl}`

          await sendLeadMagnetEmail({
            email,
            leadMagnetTitle: leadMagnet.title,
            leadMagnetSubtitle: leadMagnet.subtitle,
            archetype: leadMagnet.archetype || 'Anfitrión',
            downloadUrl,
            pages: leadMagnet.pages,
            downloadables: leadMagnet.downloadables,
          })
        }
      }

      // Actualizar datos si vienen nuevos
      if (archetype || name || priorityTags.length > 0) {
        // Filter out tags that already exist
        const newPriorityTags = priorityTags.filter(tag => !existing.tags?.includes(tag))
        await prisma.emailSubscriber.update({
          where: { id: existing.id },
          data: {
            ...(name && { name }),
            ...(archetype && { archetype }),
            ...(newPriorityTags.length > 0 && { tags: { push: newPriorityTags } }),
            updatedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Ya estás suscrito',
        subscriber: { email, alreadySubscribed: true },
        leadMagnetSlug: metadata.leadMagnetSlug
      })
    }

    // Crear nuevo suscriptor
    const subscriber = await prisma.emailSubscriber.create({
      data: {
        email: normalizedEmail,
        name,
        archetype,
        source,
        sourceMetadata: { ...metadata, prioridades: prioridades as string[] },
        tags: allTags,
        status: 'active',
        currentJourneyStage: 'subscribed',
        engagementScore: 'warm',
        sequenceStartedAt: new Date(), // Para secuencias de email automatizadas
        sequenceStatus: 'active',
        nivelSequenceStatus: allTags.some(t => t.startsWith('nivel_')) ? 'pending' : 'none'
      }
    })

    // Send admin notification (async, don't block response)
    notifyEmailSubscriber({
      email,
      source,
      downloadedGuide: source === 'lead_magnet',
      leadMagnetSlug: metadata.leadMagnetSlug || undefined
    }).catch(error => {
      console.error('Failed to send admin notification:', error)
    })

    // Enviar email correspondiente según el source
    if (source === 'lead_magnet' && metadata.leadMagnetSlug) {
      // Lead magnet: enviar email con enlace directo al PDF
      const leadMagnet = getLeadMagnetBySlug(metadata.leadMagnetSlug)
      if (leadMagnet) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
        const downloadUrl = `${baseUrl}${leadMagnet.downloadUrl}`

        await sendLeadMagnetEmail({
          email,
          leadMagnetTitle: leadMagnet.title,
          leadMagnetSubtitle: leadMagnet.subtitle,
          archetype: leadMagnet.archetype || 'Anfitrión',
          downloadUrl,
          pages: leadMagnet.pages,
          downloadables: leadMagnet.downloadables,
        })
      }
    }

    // Enrollar en secuencias de email (nuevo sistema basado en prioridades y tags)
    await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
      archetype,
      source,
      tags: allTags
    }).catch(error => {
      console.error('Failed to enroll subscriber in sequences:', error)
      // No bloqueamos la respuesta si falla el enrollment
    })

    return NextResponse.json({
      success: true,
      message: 'Suscripción exitosa',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        archetype: subscriber.archetype
      },
      leadMagnetSlug: metadata.leadMagnetSlug
    })

  } catch (error) {
    console.error('Error al suscribir email:', error)
    return NextResponse.json(
      { error: 'Error al procesar suscripción' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email/subscribe?email=xxx
 *
 * Consulta el estado de suscripción de un email
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

    const normalizedEmail = email.toLowerCase().trim()

    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        archetype: true,
        source: true,
        status: true,
        currentJourneyStage: true,
        engagementScore: true,
        subscribedAt: true,
        tags: true
      }
    })

    if (!subscriber) {
      return NextResponse.json(
        { subscribed: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      subscribed: true,
      subscriber
    })

  } catch (error) {
    console.error('Error al consultar suscripción:', error)
    return NextResponse.json(
      { error: 'Error al consultar suscripción' },
      { status: 500 }
    )
  }
}
