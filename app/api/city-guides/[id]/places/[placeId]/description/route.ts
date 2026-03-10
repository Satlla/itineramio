import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../src/lib/prisma'
import { getAuthUser } from '../../../../../../../src/lib/auth'
import { getAdminUser } from '../../../../../../../src/lib/admin-auth'

const ADMIN_EMAIL = 'alejandrosatlla@gmail.com'

// PATCH /api/city-guides/[id]/places/[placeId]/description
// Update the personal recommendation text for a place in a guide.
// Body: { description: string | null }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; placeId: string }> }
) {
  try {
    const { id, placeId } = await params

    const user = await getAuthUser(request)
    const adminUser = await getAdminUser(request)
    if (!user && !adminUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const isAdmin = !!adminUser || user?.email === ADMIN_EMAIL
    if (!isAdmin && guide.authorId !== user?.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const guidePlace = await prisma.cityGuidePlace.findUnique({
      where: { id: placeId },
    })

    if (!guidePlace || guidePlace.guideId !== id) {
      return NextResponse.json({ success: false, error: 'Lugar no encontrado en esta guía' }, { status: 404 })
    }

    const body = await request.json()
    const description = typeof body.description === 'string' && body.description.trim()
      ? body.description.trim()
      : null
    const mustTry = typeof body.mustTry === 'string' && body.mustTry.trim()
      ? body.mustTry.trim()
      : null
    const bookingUrl = typeof body.bookingUrl === 'string' && body.bookingUrl.trim()
      ? body.bookingUrl.trim()
      : null
    const tags = Array.isArray(body.tags) ? body.tags.filter(Boolean) : undefined

    const updateData: any = { description, mustTry, bookingUrl }
    if (tags !== undefined) updateData.tags = tags

    const updated = await prisma.cityGuidePlace.update({
      where: { id: placeId },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating place description:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
