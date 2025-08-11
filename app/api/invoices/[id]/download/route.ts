import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '../../../../../src/lib/admin-auth'
import { invoiceGenerator } from '../../../../../src/lib/invoice-generator'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const invoiceHTML = await invoiceGenerator.generateInvoicePDF(params.id)
    
    if (!invoiceHTML) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Return HTML response that can be used to generate PDF
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="factura-${params.id}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}