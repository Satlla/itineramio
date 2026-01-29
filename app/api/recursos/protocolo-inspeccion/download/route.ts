import { NextResponse } from 'next/server'
import { generateInspectionProtocolPDF } from '@/lib/pdf-generator-server'

export async function GET() {
  try {
    const pdfBuffer = generateInspectionProtocolPDF()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="protocolo-inspeccion-pre-huésped.pdf"',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error generating inspection protocol PDF:', error)
    return NextResponse.json(
      { error: 'Error generating PDF' },
      { status: 500 }
    )
  }
}
