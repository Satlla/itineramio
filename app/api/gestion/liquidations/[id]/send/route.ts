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
 * POST /api/gestion/liquidations/[id]/send
 * Sends liquidation to the property owner:
 * - Changes status DRAFT → SENT
 * - Generates/refreshes magic link token
 * - Sends email to owner with portal link
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId
    const { id } = await params

    const liquidation = await prisma.liquidation.findFirst({
      where: { id, userId },
      include: {
        owner: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    if (!liquidation) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }

    if (liquidation.status !== 'DRAFT' && liquidation.status !== 'SENT') {
      return NextResponse.json(
        { error: 'Solo se pueden enviar liquidaciones en estado borrador o enviado' },
        { status: 400 }
      )
    }

    // Accept email from request body (allows sending even if owner has no email configured)
    let body: { email?: string; message?: string } = {}
    try { body = await request.json() } catch { /* no body is ok for backwards compat */ }

    const recipientEmail = body.email || liquidation.owner.email
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'El propietario no tiene email configurado' },
        { status: 400 }
      )
    }

    // Generate magic link token for the owner
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    // Update owner token and liquidation status in parallel
    await Promise.all([
      prisma.propertyOwner.update({
        where: { id: liquidation.ownerId },
        data: {
          magicLinkToken: token,
          magicLinkTokenExpiry: expiresAt
        }
      }),
      prisma.liquidation.update({
        where: { id },
        data: { status: 'SENT' }
      })
    ])

    // Build portal URL pointing to the liquidation month
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itineramio.com'
    const portalUrl = `${baseUrl}/propietario/${token}?month=${liquidation.month}&year=${liquidation.year}`

    const ownerName = liquidation.owner.type === 'EMPRESA'
      ? liquidation.owner.companyName || 'Estimado propietario'
      : liquidation.owner.firstName || 'Estimado propietario'

    const managerName = liquidation.owner.user.name || 'Tu gestor'
    const monthName = MONTH_NAMES[liquidation.month]
    const totalAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
      .format(Number(liquidation.totalAmount))

    await sendEmail({
      to: recipientEmail,
      subject: `Liquidación de ${monthName} ${liquidation.year} lista para revisar`,
      html: emailTemplates.liquidationSentToOwner({
        ownerName,
        managerName,
        monthName,
        year: liquidation.year,
        totalAmount,
        portalUrl,
        customMessage: body.message || undefined
      })
    })

    return NextResponse.json({ success: true, portalUrl, sentTo: recipientEmail })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
