import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendEmail, emailTemplates } from '@/lib/email'
import crypto from 'crypto'

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * POST /api/gestion/owners/[id]/send-link
 * Generate a magic link and send it to the property owner
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const body = await request.json().catch(() => ({}))
    const { month, year, sendEmail: shouldSendEmail = true } = body

    // Default to current month if not specified
    const targetMonth = month || new Date().getMonth() + 1
    const targetYear = year || new Date().getFullYear()

    // Get owner with validation
    const owner = await prisma.propertyOwner.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    if (!owner.email) {
      return NextResponse.json(
        { error: 'El propietario no tiene email configurado' },
        { status: 400 }
      )
    }

    // Get manager info for email
    const manager = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days validity

    // Update owner with magic link token
    await prisma.propertyOwner.update({
      where: { id },
      data: {
        magicLinkToken: token,
        magicLinkTokenExpiry: expiresAt
      }
    })

    // Build the portal URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itineramio.com'
    const portalUrl = `${baseUrl}/propietario/${token}?month=${targetMonth}&year=${targetYear}`

    // Get owner display name
    const ownerName = owner.type === 'EMPRESA'
      ? owner.companyName || 'Estimado cliente'
      : owner.firstName || 'Estimado propietario'

    // Send email if requested
    if (shouldSendEmail) {
      await sendEmail({
        to: owner.email,
        subject: `Tu resumen de ${MONTH_NAMES[targetMonth]} ${targetYear}`,
        html: emailTemplates.ownerPortalLink({
          ownerName,
          managerName: manager?.name || 'Tu gestor',
          portalUrl,
          monthName: MONTH_NAMES[targetMonth],
          year: targetYear
        })
      })
    }

    return NextResponse.json({
      success: true,
      portalUrl,
      expiresAt: expiresAt.toISOString(),
      emailSent: shouldSendEmail,
      sentTo: owner.email
    })
  } catch (error) {
    console.error('Error sending magic link:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/gestion/owners/[id]/send-link
 * Get the current magic link status for an owner
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const owner = await prisma.propertyOwner.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true,
        email: true,
        magicLinkToken: true,
        magicLinkTokenExpiry: true,
        magicLinkLastAccess: true
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    const hasActiveLink = owner.magicLinkToken &&
      owner.magicLinkTokenExpiry &&
      new Date(owner.magicLinkTokenExpiry) > new Date()

    return NextResponse.json({
      hasActiveLink,
      expiresAt: owner.magicLinkTokenExpiry?.toISOString() || null,
      lastAccess: owner.magicLinkLastAccess?.toISOString() || null
    })
  } catch (error) {
    console.error('Error getting magic link status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
