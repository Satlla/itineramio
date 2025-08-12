import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../../src/lib/auth'
import { invoiceGeneratorAirbnb } from '../../../../../src/lib/invoice-generator-airbnb'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)

    // Verify that the invoice belongs to the authenticated user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 })
    }

    const invoiceHTML = await invoiceGeneratorAirbnb.generateInvoicePDF(params.id)
    
    if (!invoiceHTML) {
      return NextResponse.json({ error: 'Error generating invoice' }, { status: 500 })
    }

    // Return HTML response
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="factura-${invoice.invoiceNumber}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}