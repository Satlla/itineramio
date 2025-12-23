import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendLeadMagnetEmail } from '../../../../src/lib/resend'
import { LEAD_MAGNETS, type LeadMagnetArchetype } from '../../../../src/data/lead-magnets'
import { enrollSubscriberInSequences } from '../../../../src/lib/email-sequences'

// Map source to lead magnet info for email
const SOURCE_TO_LEAD_MAGNET: Record<string, {
  title: string
  subtitle: string
  archetype: string
  pages: number
  downloadables: string[]
  downloadUrl: string
}> = {
  // Arquetipo lead magnets
  'estratega-5-kpis': { ...LEAD_MAGNETS.ESTRATEGA, archetype: 'Estratega' },
  'sistematico-47-tareas': { ...LEAD_MAGNETS.SISTEMATICO, archetype: 'Sistemático' },
  'diferenciador-storytelling': { ...LEAD_MAGNETS.DIFERENCIADOR, archetype: 'Diferenciador' },
  'ejecutor-modo-ceo': { ...LEAD_MAGNETS.EJECUTOR, archetype: 'Ejecutor' },
  'resolutor-27-crisis': { ...LEAD_MAGNETS.RESOLUTOR, archetype: 'Resolutor' },
  'experiencial-corazon-escalable': { ...LEAD_MAGNETS.EXPERIENCIAL, archetype: 'Experiencial' },
  'equilibrado-versatil-excepcional': { ...LEAD_MAGNETS.EQUILIBRADO, archetype: 'Equilibrado' },
  'improvisador-kit-anti-caos': { ...LEAD_MAGNETS.IMPROVISADOR, archetype: 'Improvisador' },
  // Tool-based lead magnets
  'wifi-card': {
    title: 'Plantilla WiFi Profesional',
    subtitle: 'Tarjeta WiFi lista para imprimir',
    archetype: 'Anfitrion',
    pages: 1,
    downloadables: ['Tarjeta WiFi editable', 'Diseño profesional', 'Formato para imprimir'],
    downloadUrl: '/recursos/plantilla-wifi'
  },
  'qr-generator': {
    title: 'Generador de Códigos QR',
    subtitle: 'QR codes para tu propiedad',
    archetype: 'Anfitrión',
    pages: 1,
    downloadables: ['Códigos QR personalizados', 'Múltiples formatos'],
    downloadUrl: '/hub/qr-generator'
  },
  'cleaning-checklist': {
    title: 'Checklist de Limpieza',
    subtitle: 'Lista completa para tu equipo',
    archetype: 'Anfitrión',
    pages: 2,
    downloadables: ['Checklist imprimible', 'Por habitación', 'Para equipo de limpieza'],
    downloadUrl: '/recursos/checklist-limpieza'
  },
  'calculadora-rentabilidad': {
    title: 'Calculadora de Rentabilidad',
    subtitle: 'Análisis de tu potencial de ingresos',
    archetype: 'Anfitrión',
    pages: 1,
    downloadables: ['Informe personalizado', 'Comparativa mercado', 'Recomendaciones'],
    downloadUrl: '/hub/calculadora'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, source } = body

    // Validation
    if (!name || !email || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, source' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Get user agent and IP for analytics
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      undefined

    // Check if lead already exists (optional - prevent duplicates)
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: normalizedEmail,
        source,
        createdAt: {
          // Only check duplicates within last 24 hours
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    if (existingLead) {
      // Return success but don't create duplicate
      return NextResponse.json(
        {
          success: true,
          message: 'Lead already captured',
          leadId: existingLead.id
        },
        { status: 200 }
      )
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name,
        email: normalizedEmail,
        source,
        userAgent,
        ipAddress
      }
    })

    // Add to EmailSubscriber for nurturing sequence
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    // Determine archetype from source or use default
    const sourceToArchetype: Record<string, string> = {
      'estratega-5-kpis': 'ESTRATEGA',
      'sistematico-47-tareas': 'SISTEMATICO',
      'diferenciador-storytelling': 'DIFERENCIADOR',
      'ejecutor-modo-ceo': 'EJECUTOR',
      'resolutor-27-crisis': 'RESOLUTOR',
      'experiencial-corazon-escalable': 'EXPERIENCIAL',
      'equilibrado-versatil-excepcional': 'EQUILIBRADO',
      'improvisador-kit-anti-caos': 'IMPROVISADOR'
    }
    const archetype = sourceToArchetype[source] || 'EQUILIBRADO' // Default archetype for tool-based leads

    const tags = ['lead_magnet', source]

    let subscriber
    if (!existingSubscriber) {
      subscriber = await prisma.emailSubscriber.create({
        data: {
          email: normalizedEmail,
          name,
          source: `lead_magnet_${source}`,
          archetype, // Assign archetype for nurturing sequence
          status: 'active',
          sequenceStatus: 'active',
          sequenceStartedAt: new Date(),
          tags,
          currentJourneyStage: 'lead',
          engagementScore: 'warm'
        }
      })
      console.log(`[EmailSubscriber] Created for ${normalizedEmail} with archetype ${archetype}`)

      // Enrollar en secuencias de email automáticas
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        archetype,
        source: `lead_magnet_${source}`,
        tags
      }).catch(error => {
        console.error('Failed to enroll subscriber in sequences:', error)
      })
    } else {
      // Update existing subscriber with new source tag (don't overwrite archetype if exists)
      subscriber = await prisma.emailSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          tags: {
            push: source
          },
          archetype: existingSubscriber.archetype || archetype, // Only set if not already set
          // Reactivate sequence if was completed
          sequenceStatus: existingSubscriber.sequenceStatus === 'completed' ? 'active' : existingSubscriber.sequenceStatus,
          sequenceStartedAt: existingSubscriber.sequenceStartedAt || new Date()
        }
      })
      console.log(`[EmailSubscriber] Updated tags for ${normalizedEmail}`)

      // Re-enrollar si la secuencia estaba completada
      if (existingSubscriber.sequenceStatus === 'completed') {
        await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
          archetype: subscriber.archetype || archetype,
          source: `lead_magnet_${source}`,
          tags: [...(subscriber.tags || []), source]
        }).catch(error => {
          console.error('Failed to re-enroll subscriber in sequences:', error)
        })
      }
    }

    // Send welcome email with lead magnet
    const leadMagnetInfo = SOURCE_TO_LEAD_MAGNET[source]

    if (leadMagnetInfo) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'
        const downloadUrl = leadMagnetInfo.downloadUrl.startsWith('http')
          ? leadMagnetInfo.downloadUrl
          : `${baseUrl}${leadMagnetInfo.downloadUrl}`

        await sendLeadMagnetEmail({
          email: normalizedEmail,
          leadMagnetTitle: leadMagnetInfo.title,
          leadMagnetSubtitle: leadMagnetInfo.subtitle,
          archetype: leadMagnetInfo.archetype,
          downloadUrl,
          pages: leadMagnetInfo.pages,
          downloadables: leadMagnetInfo.downloadables
        })

        console.log(`[Email Sent] Lead magnet email to ${normalizedEmail} for ${source}`)
      } catch (emailError) {
        // Log error but don't fail the request
        console.error(`[Email Error] Failed to send to ${normalizedEmail}:`, emailError)
      }
    } else {
      console.log(`[Lead Captured] ${name} <${normalizedEmail}> from ${source} (no email template)`)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        leadId: lead.id
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error capturing lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to retrieve leads (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // For now, return basic stats

    const searchParams = request.nextUrl.searchParams
    const source = searchParams.get('source')

    const where = source ? { source } : {}

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        source: true,
        createdAt: true
      }
    })

    const totalCount = await prisma.lead.count({ where })

    const bySource = await prisma.lead.groupBy({
      by: ['source'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    return NextResponse.json({
      leads,
      stats: {
        total: totalCount,
        bySource: bySource.map(item => ({
          source: item.source,
          count: item._count.id
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
