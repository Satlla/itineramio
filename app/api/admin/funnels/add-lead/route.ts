import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { LEAD_MAGNETS_BY_THEME, type FunnelTheme } from '@/data/funnels'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { name, email, theme, propertyCount } = body

    if (!email || !theme) {
      return NextResponse.json(
        { error: 'Email y tema son requeridos' },
        { status: 400 }
      )
    }

    // Validate theme
    if (!LEAD_MAGNETS_BY_THEME[theme as FunnelTheme]) {
      return NextResponse.json(
        { error: 'Tema de embudo no válido' },
        { status: 400 }
      )
    }

    // Check if lead already exists
    const existingLead = await prisma.lead.findFirst({
      where: { email: email.toLowerCase() }
    })

    const leadMagnet = LEAD_MAGNETS_BY_THEME[theme as FunnelTheme]

    if (existingLead) {
      // Update existing lead with funnel theme
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          name: name || existingLead.name,
          funnelTheme: theme,
          funnelCurrentDay: 0,
          funnelStartedAt: null,
          propertyCount: propertyCount || existingLead.propertyCount
        }
      })

      return NextResponse.json({
        success: true,
        lead: updatedLead,
        message: 'Lead actualizado con nuevo embudo'
      })
    }

    // Create new lead
    const newLead = await prisma.lead.create({
      data: {
        name: name || 'Sin nombre',
        email: email.toLowerCase(),
        source: `admin-manual-${theme}`,
        funnelTheme: theme,
        funnelCurrentDay: 0,
        propertyCount: propertyCount || null,
        metadata: {
          addedBy: 'admin',
          leadMagnet: leadMagnet.name,
          addedAt: new Date().toISOString()
        }
      }
    })

    // Also add to EmailSubscriber for email sending
    await prisma.emailSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name: name || undefined,
        tags: {
          push: [`funnel-${theme}`, 'manual-lead']
        }
      },
      create: {
        email: email.toLowerCase(),
        name: name || null,
        source: `admin-manual-${theme}`,
        status: 'ACTIVE',
        tags: [`funnel-${theme}`, 'manual-lead']
      }
    })

    return NextResponse.json({
      success: true,
      lead: newLead,
      message: 'Lead creado correctamente'
    })
  } catch (error) {
    console.error('Error adding lead:', error)
    return NextResponse.json(
      { error: 'Error al añadir lead' },
      { status: 500 }
    )
  }
}
