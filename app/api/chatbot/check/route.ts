import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { getAuthUser } from '../../../../src/lib/auth'

// Chatbot deshabilitado temporalmente mientras se corrigen errores.
// Solo visible para el admin (alejandrosatlla@gmail.com).
const CHATBOT_ADMIN_ONLY = false
const CHATBOT_ADMIN_EMAIL = 'alejandrosatlla@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ enabled: false }, { status: 400 })
    }

    // Modo admin-only: solo mostrar a alejandrosatlla@gmail.com
    if (CHATBOT_ADMIN_ONLY) {
      const user = await getAuthUser(request).catch(() => null)
      if (!user || user.email !== CHATBOT_ADMIN_EMAIL) {
        return NextResponse.json({ enabled: false })
      }
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      select: { id: true }
    })

    if (!property) {
      return NextResponse.json({ enabled: false }, { status: 403 })
    }

    return NextResponse.json({ enabled: true })
  } catch {
    return NextResponse.json({ enabled: false }, { status: 500 })
  }
}
