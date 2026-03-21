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

    if (liquidation.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo se pueden enviar liquidaciones en estado DRAFT' },
        { status: 400 }
      )
    }

    if (!liquidation.owner.email) {
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
      to: liquidation.owner.email,
      subject: `Liquidación de ${monthName} ${liquidation.year} lista para revisar`,
      html: emailTemplates.liquidationSentToOwner({
        ownerName,
        managerName,
        monthName,
        year: liquidation.year,
        totalAmount,
        portalUrl
      })
    })

    return NextResponse.json({ success: true, portalUrl, sentTo: liquidation.owner.email })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
