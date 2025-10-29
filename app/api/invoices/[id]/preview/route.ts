import { NextRequest, NextResponse } from 'next/server'
import { invoiceGeneratorAirbnb } from '../../../../../src/lib/invoice-generator-airbnb'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    // TEMPORAL: Endpoint público para ver facturas de prueba
    // En producción este endpoint debe tener autenticación
    console.log('📄 Generando vista previa de factura:', params.id)
    
    const invoiceHTML = await invoiceGeneratorAirbnb.generateInvoicePDF(params.id)
    
    if (!invoiceHTML) {
      return NextResponse.json({ error: 'Error generating invoice preview' }, { status: 500 })
    }

    // Return HTML response
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="factura-preview-${params.id}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating invoice preview:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}