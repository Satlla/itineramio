import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * POST /api/owner/[token]/confirm
 * Owner confirms a liquidation from the portal (no login required)
 * Body: { liquidationId: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { liquidationId } = body

    if (!liquidationId) {
      return NextResponse.json({ error: 'liquidationId requerido' }, { status: 400 })
    }

    // Validate magic link token
    const owner = await prisma.propertyOwner.findFirst({
      where: {
        magicLinkToken: token,
        magicLinkTokenExpiry: { gt: new Date() }
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 401 })
    }

    // Find the liquidation and verify it belongs to this owner
    const liquidation = await prisma.liquidation.findFirst({
      where: { id: liquidationId, ownerId: owner.id }
    })

    if (!liquidation) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }

    if (liquidation.status !== 'SENT') {
      return NextResponse.json(
        { error: 'Solo se pueden confirmar liquidaciones en estado SENT' },
        { status: 400 }
      )
    }

    const confirmedAt = new Date().toISOString()

    // Merge ownerConfirmedAt into the existing notes JSON
    let existingNotes: Record<string, unknown> = {}
    if (liquidation.notes) {
      try {
        existingNotes = JSON.parse(liquidation.notes)
      } catch {
        // notes is plain text — wrap it
        existingNotes = { legacyNotes: liquidation.notes }
      }
    }

    const updatedNotes = JSON.stringify({ ...existingNotes, ownerConfirmedAt: confirmedAt })

    await prisma.liquidation.update({
      where: { id: liquidationId },
      data: { notes: updatedNotes }
    })

    // Notify the manager by email
    const managerEmail = owner.user.email
    if (managerEmail) {
      const ownerName = owner.type === 'EMPRESA'
        ? owner.companyName || 'El propietario'
        : `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'El propietario'

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itineramio.com'
      const liquidationUrl = `${baseUrl}/gestion/liquidaciones/${liquidationId}`

      await sendEmail({
        to: managerEmail,
        subject: `✓ ${ownerName} ha confirmado la liquidación de ${MONTH_NAMES[liquidation.month]} ${liquidation.year}`,
        html: emailTemplates.ownerConfirmedLiquidation({
          managerName: owner.user.name || 'Gestor',
          ownerName,
          monthName: MONTH_NAMES[liquidation.month],
          year: liquidation.year,
          liquidationUrl
        })
      })
    }

    return NextResponse.json({ success: true, confirmedAt })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
