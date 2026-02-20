import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendLeadMagnetEmail, sendPricingAnalysisEmail } from '../../../../src/lib/resend'
import { LEAD_MAGNETS, type LeadMagnetArchetype } from '../../../../src/data/lead-magnets'
import { enrollSubscriberInSequences } from '../../../../src/lib/email-sequences'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'
// Dynamic import for PDF generator to avoid issues with jsPDF in serverless environment

// Rate limit: 10 leads per 10 minutes per IP
const LEAD_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 10 * 60 * 1000 // 10 minutes
}

// Map source to lead magnet info for email
const SOURCE_TO_LEAD_MAGNET: Record<string, {
  title: string
  subtitle: string
  archetype: string
  pages: number
  downloadables: string[]
  downloadUrl: string
}> = {
  // Arquetipo lead magnets - these get the download email
  'estratega-5-kpis': { ...LEAD_MAGNETS.ESTRATEGA, archetype: 'Estratega' },
  'organizador-47-tareas': { ...LEAD_MAGNETS.SISTEMATICO, archetype: 'Organizador' },
  'diferenciador-storytelling': { ...LEAD_MAGNETS.DIFERENCIADOR, archetype: 'Diferenciador' },
  'ejecutor-modo-ceo': { ...LEAD_MAGNETS.EJECUTOR, archetype: 'Ejecutor' },
  'resolutor-27-crisis': { ...LEAD_MAGNETS.RESOLUTOR, archetype: 'Resolutor' },
  'experiencial-corazon-escalable': { ...LEAD_MAGNETS.EXPERIENCIAL, archetype: 'Experiencial' },
  'equilibrado-versatil-excepcional': { ...LEAD_MAGNETS.EQUILIBRADO, archetype: 'Equilibrado' },
  'improvisador-kit-anti-caos': { ...LEAD_MAGNETS.IMPROVISADOR, archetype: 'Improvisador' },
  // PDF/downloadable tools - these get the download email
  // Note: wifi-card removed - it's now in ONLINE_TOOLS (user downloads directly on page)
  'cleaning-checklist': {
    title: 'Checklist de Limpieza',
    subtitle: 'Lista completa para tu equipo',
    archetype: 'Anfitrión',
    pages: 2,
    downloadables: ['Checklist imprimible', 'Por habitación', 'Para equipo de limpieza'],
    downloadUrl: '/recursos/checklist-limpieza'
  }
  // NOTE: Online tools (qr-generator, pricing-calculator, etc.) are NOT here
  // They don't need a download email - user already has the result on the page
  // Their sequences (tool-qr, tool-pricing) handle all follow-up emails
}

// Online tools that don't need download email - sequences handle everything
// Slugs must match what the frontend sends as 'source'
// wifi-card: downloads directly on page, no need to email a link
const ONLINE_TOOLS = ['qr-generator', 'pricing-calculator', 'roi-calculator', 'house-rules-generator', 'wifi-card', 'time-calculator', 'cleaning-checklist', 'checklist-limpieza']

// Map source slugs to clean display names for the dashboard
const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  'time-calculator': 'Calculadora de Tiempo',
  'qr-generator': 'Generador de QR',
  'pricing-calculator': 'Calculadora de Precios',
  'roi-calculator': 'Calculadora de ROI',
  'house-rules-generator': 'Generador de Normas',
  'wifi-card': 'Tarjeta WiFi',
  'cleaning-checklist': 'Checklist de Limpieza',
  'checklist-limpieza': 'Checklist de Limpieza',
  'plantilla-reviews': 'Plantilla de Reseñas',
  'academia-quiz': 'Quiz Academia',
  'host_profile_test': 'Test de Arquetipo',
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent spam
    const rateLimitKey = getRateLimitKey(request, null, 'lead-capture')
    const rateLimitResult = checkRateLimit(rateLimitKey, LEAD_RATE_LIMIT)

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error: 'Too many requests. Please try again later.'
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000))
        }
      })
    }

    const body = await request.json()
    const { name, email, source, metadata } = body

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
        metadata: metadata || {},
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
      'organizador-47-tareas': 'SISTEMATICO',
      'diferenciador-storytelling': 'DIFERENCIADOR',
      'ejecutor-modo-ceo': 'EJECUTOR',
      'resolutor-27-crisis': 'RESOLUTOR',
      'experiencial-corazon-escalable': 'EXPERIENCIAL',
      'equilibrado-versatil-excepcional': 'EQUILIBRADO',
      'improvisador-kit-anti-caos': 'IMPROVISADOR'
    }
    const archetype = sourceToArchetype[source] || 'EQUILIBRADO' // Default archetype for tool-based leads

    // Use clean display names for sources
    const isOnlineTool = ONLINE_TOOLS.includes(source)
    const subscriberSource = SOURCE_DISPLAY_NAMES[source] || source
    const tags = isOnlineTool
      ? [source]
      : ['lead_magnet', source]

    let subscriber
    if (!existingSubscriber) {
      subscriber = await prisma.emailSubscriber.create({
        data: {
          email: normalizedEmail,
          name,
          source: subscriberSource,
          sourceMetadata: metadata || {}, // Store tool metadata for email personalization
          archetype, // Assign archetype for nurturing sequence
          status: 'active',
          sequenceStatus: 'active',
          sequenceStartedAt: new Date(),
          tags,
          currentJourneyStage: 'lead',
          engagementScore: 'warm'
        }
      })
      console.log(`[EmailSubscriber] Created for ${normalizedEmail} with source ${subscriberSource}`)

      // Enrollar en secuencias de email automáticas
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        archetype,
        source: subscriberSource,
        tags
      }).catch(error => {
        console.error('Failed to enroll subscriber in sequences:', error)
      })
    } else {
      // Update existing subscriber with new source tag (don't overwrite archetype if exists)
      const newTag = isOnlineTool ? `tool_${source}` : source
      subscriber = await prisma.emailSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          tags: {
            push: newTag
          },
          archetype: existingSubscriber.archetype || archetype, // Only set if not already set
          // Update sourceMetadata with new tool data
          sourceMetadata: metadata || existingSubscriber.sourceMetadata,
          // Reactivate sequence if was completed
          sequenceStatus: existingSubscriber.sequenceStatus === 'completed' ? 'active' : existingSubscriber.sequenceStatus,
          sequenceStartedAt: existingSubscriber.sequenceStartedAt || new Date()
        }
      })
      console.log(`[EmailSubscriber] Updated tags for ${normalizedEmail} with ${newTag}`)

      // ALWAYS try to enroll in new sequences for tools
      // The enrollment system will skip if already enrolled in a specific sequence
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        archetype: subscriber.archetype || archetype,
        source: subscriberSource,
        tags: [...(subscriber.tags || []), newTag]
      }).catch(error => {
        console.error('Failed to enroll existing subscriber in sequences:', error)
      })
    }

    // Send welcome email ONLY for lead magnets that have downloadable content
    // Online tools (qr-generator, pricing-calculator) don't need this - their sequences handle follow-ups
    const leadMagnetInfo = SOURCE_TO_LEAD_MAGNET[source]

    if (leadMagnetInfo && !isOnlineTool) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
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
    } else if (source === 'pricing-calculator' && metadata) {
      // Special handling for pricing calculator - send PDF by email
      try {
        // Dynamic import to avoid issues with jsPDF in serverless
        const { generatePricingAnalysisPDF } = await import('../../../../src/lib/pdf-generator-server')

        const amenitiesList = metadata.amenities || []
        const pdfBuffer = generatePricingAnalysisPDF({
          propertyType: metadata.propertyType || 'Apartamento',
          location: metadata.location || 'Centro ciudad',
          season: metadata.season || 'Temporada Media',
          bedrooms: metadata.bedrooms || 1,
          bathrooms: metadata.bathrooms || 1,
          guests: metadata.guests || 2,
          amenities: Array.isArray(amenitiesList) ? amenitiesList : [],
          recommendedPrice: metadata.recommendedPrice || 0,
          minPrice: metadata.minPrice || 0,
          maxPrice: metadata.maxPrice || 0,
          weekendPrice: metadata.weekendPrice || Math.round((metadata.recommendedPrice || 0) * 1.2),
          weeklyDiscount: metadata.weeklyDiscount || 10,
          monthlyDiscount: metadata.monthlyDiscount || 20,
          userName: name
        })

        await sendPricingAnalysisEmail({
          email: normalizedEmail,
          userName: name,
          propertyType: metadata.propertyType || 'Apartamento',
          location: metadata.location || 'Centro ciudad',
          recommendedPrice: metadata.recommendedPrice || 0,
          minPrice: metadata.minPrice || 0,
          maxPrice: metadata.maxPrice || 0,
          monthlyProjection: (metadata.recommendedPrice || 0) * 21, // 70% occupancy
          pdfBuffer
        })

        console.log(`[Email Sent] Pricing analysis PDF to ${normalizedEmail}`)
      } catch (emailError) {
        console.error(`[Email Error] Failed to send pricing PDF to ${normalizedEmail}:`, emailError)
      }
    } else if (isOnlineTool) {
      console.log(`[Lead Captured] ${name} <${normalizedEmail}> from online tool ${source} - sequence will handle emails`)
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

// GET endpoint to retrieve leads (admin only)
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { requireAdminAuth } = await import('../../../../src/lib/admin-auth')
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

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
