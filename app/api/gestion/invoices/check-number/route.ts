import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/invoices/check-number?number=F260001
 * Verifica si un número de factura ya existe
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const number = searchParams.get('number')

    if (!number) {
      return NextResponse.json({ exists: false })
    }

    // Buscar si existe una factura con ese número (fullNumber)
    const existingInvoice = await prisma.clientInvoice.findFirst({
      where: {
        userId,
        fullNumber: number
      },
      select: { id: true }
    })

    return NextResponse.json({ exists: !!existingInvoice })
  } catch (error) {
    console.error('Error checking invoice number:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
