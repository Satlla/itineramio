import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  scheduleOnboardingSequence,
  sendLeadMagnetEmail,
  type EmailArchetype,
} from '@/lib/resend'
import { getLeadMagnetBySlug } from '@/data/lead-magnets'
import { generateDownloadToken } from '@/lib/tokens'

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
    const { email, name, archetype, source, tags = [], metadata = {} } = body

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

    // Verificar si ya existe el suscriptor
    const existing = await prisma.emailSubscriber.findFirst({
      where: { email }
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

      // Generar token para redirección directa si es lead magnet
      let downloadToken = null

      // Si ya existe y está activo, enviar el lead magnet si aplica
      if (source === 'lead_magnet' && metadata.leadMagnetSlug) {
        const leadMagnet = getLeadMagnetBySlug(metadata.leadMagnetSlug)
        if (leadMagnet) {
          // Generar token para descarga directa
          const token = generateDownloadToken(existing.id, metadata.leadMagnetSlug)
          downloadToken = token
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'
          const downloadUrl = `${baseUrl}/recursos/${metadata.leadMagnetSlug}/download?token=${token}`

          await sendLeadMagnetEmail({
            email,
            leadMagnetTitle: leadMagnet.title,
            leadMagnetSubtitle: leadMagnet.subtitle,
            archetype: leadMagnet.archetype,
            downloadUrl,
            pages: leadMagnet.pages,
            downloadables: leadMagnet.downloadables,
          })
        }
      }

      // Actualizar datos si vienen nuevos
      if (archetype || name) {
        await prisma.emailSubscriber.update({
          where: { id: existing.id },
          data: {
            ...(name && { name }),
            ...(archetype && { archetype }),
            updatedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Ya estás suscrito',
        subscriber: { email, alreadySubscribed: true },
        downloadToken, // Devolver token para redirección inmediata
        leadMagnetSlug: metadata.leadMagnetSlug
      })
    }

    // Crear nuevo suscriptor
    const subscriber = await prisma.emailSubscriber.create({
      data: {
        email,
        name,
        archetype,
        source,
        sourceMetadata: metadata,
        tags,
        status: 'active',
        currentJourneyStage: 'subscribed',
        engagementScore: 'warm'
      }
    })

    // Enviar email correspondiente según el source
    if (source === 'lead_magnet' && metadata.leadMagnetSlug) {
      // Lead magnet: enviar email con PDF
      const leadMagnet = getLeadMagnetBySlug(metadata.leadMagnetSlug)
      if (leadMagnet) {
        // Generar token para descarga directa
        const token = generateDownloadToken(subscriber.id, metadata.leadMagnetSlug)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'
        const downloadUrl = `${baseUrl}/recursos/${metadata.leadMagnetSlug}/download?token=${token}`

        await sendLeadMagnetEmail({
          email,
          leadMagnetTitle: leadMagnet.title,
          leadMagnetSubtitle: leadMagnet.subtitle,
          archetype: leadMagnet.archetype,
          downloadUrl,
          pages: leadMagnet.pages,
          downloadables: leadMagnet.downloadables,
        })
      }
    } else if (archetype) {
      // Otros sources: secuencia de onboarding normal
      await scheduleOnboardingSequence({
        email,
        name: name || '',
        archetype: archetype as EmailArchetype,
        source: source as any
      })
    }

    // Generar token si es lead magnet para redirigir directamente
    let downloadToken = null
    if (source === 'lead_magnet' && metadata.leadMagnetSlug) {
      downloadToken = generateDownloadToken(subscriber.id, metadata.leadMagnetSlug)
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción exitosa',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        archetype: subscriber.archetype
      },
      downloadToken, // Devolver token para redirección inmediata
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

    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email },
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
