import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { verifyToken } from '../../../../../../src/lib/auth'
import { invoiceGeneratorAirbnb } from '../../../../../../src/lib/invoice-generator-airbnb'

function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const authUser = verifyToken(token)
    return authUser.userId
  } catch (error) {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify the invoice belongs to this user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Use the unified invoice generator with proper company data
    const html = await invoiceGeneratorAirbnb.generateInvoicePDF(id)

    if (!html) {
      return NextResponse.json(
        { error: 'Error generando factura' },
        { status: 500 }
      )
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="factura-${invoice.invoiceNumber}.html"`
      }
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Error al generar factura' },
      { status: 500 }
    )
  }
}
