import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

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

    // Get user agent and IP for analytics
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      undefined

    // Check if lead already exists (optional - prevent duplicates)
    const existingLead = await prisma.lead.findFirst({
      where: {
        email,
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

    // Create lead (metadata temporarily disabled until migration completes)
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        source,
        userAgent,
        ipAddress
        // metadata: body.metadata || {} // TODO: Uncomment after migration
      }
    })

    // Create initial journey stage: LEAD
    // Temporarily disabled until migration completes
    // TODO: Uncomment after running: npx prisma db push
    /*
    await prisma.customerJourneyStage.create({
      data: {
        leadId: lead.id,
        email: email.toLowerCase().trim(),
        stage: 'LEAD',
        score: 10, // Initial score for lead capture
        metadata: {
          source,
          capturedVia: 'hub-tool',
          initialAction: 'resource_download'
        }
      }
    })
    */

    // TODO: Queue welcome email
    // This will be handled by a background job or trigger
    // For now, we log it and send asynchronously
    const resourceNameMap: Record<string, string> = {
      'qr-generator': 'Generador de Códigos QR',
      'roi-calculator': 'Calculadora de ROI',
      'pricing-calculator': 'Calculadora de Precios',
      'description-generator': 'Generador de Descripciones',
      'checkin-builder': 'Constructor de Check-in',
      'occupancy-calculator': 'Calculadora de Ocupación',
      'wifi-card': 'Tarjeta WiFi',
      'cleaning-checklist': 'Checklist de Limpieza',
      'airbnb-setup': 'Checklist Setup Airbnb'
    }

    const resourceName = resourceNameMap[source] || source

    // Note: Email sending should be queued/async in production
    console.log(`[Lead Captured] ${name} <${email}> from ${source}`)
    console.log(`[TODO] Send welcome email with ${resourceName}`)

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
