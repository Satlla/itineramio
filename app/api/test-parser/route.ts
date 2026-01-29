import { NextRequest, NextResponse } from 'next/server'
import { parseAirbnbEmail } from '@/lib/reservations/parsers/airbnb-parser'

/**
 * Endpoint de prueba para el parser de emails
 * POST: Envía el texto del email y recibe los datos parseados
 * GET: Prueba con el email de ejemplo de Airbnb
 */
export async function POST(request: NextRequest) {
  try {
    const { subject, text, html } = await request.json()

    if (!text && !html) {
      return NextResponse.json(
        { error: 'Se requiere text o html del email' },
        { status: 400 }
      )
    }

    const result = parseAirbnbEmail(
      subject || 'Reserva confirmada',
      html || '',
      text || ''
    )

    return NextResponse.json({
      success: !!result,
      parsed: result
    })
  } catch (error) {
    console.error('Error en test parser:', error)
    return NextResponse.json(
      { error: 'Error parseando email' },
      { status: 500 }
    )
  }
}

// GET: Prueba con email de ejemplo
export async function GET() {
  // Email de ejemplo de Airbnb (el que compartió el usuario)
  const sampleEmailText = `
Airbnb
¡Nueva reserva confirmada! Salvador llega el 5 feb.
Envía un mensaje para confirmar los detalles de la llegada o dar la bienvenida a Salvador.


Salvador

Identidad verificada · 7 evaluaciones

España

Hola, viajo a un congreso y de paso voy con mi familia a hacer turismo. Un saludo.

Envía un mensaje a Salvador
Mercado Central | 4Pax| Centro Alicante
Casa/apto. entero

Llegada

jue, 5 feb

16:00

Salida

dom, 8 feb

11:00

Viajeros
2 adultos, 1 niño, 1 bebé

Código de confirmación
HMKZW9CXRE

Ver itinerario
El viajero ha pagado
85,67 € por 3 noches

257,00 €

Gastos de limpieza

60,00 €

Comisión de servicio del viajero

54,15 €

Total (EUR)
371,15 €
Cobro del anfitrión
Precio de la habitación por 3 noches

257,00 €

Gastos de limpieza

60,00 €

Comisión de servicio del anfitrión (3.0 % + IVA)

-11,51 €

Ganas
305,49 €

Cancelaciones
La política de cancelación que tienes establecida para los viajeros es Estricta.
`

  const sampleSubject = 'Reserva confirmada: Salvador Garcia-Ayllon Veintimilla llega el 5 feb.'

  const result = parseAirbnbEmail(sampleSubject, '', sampleEmailText)

  return NextResponse.json({
    message: 'Test del parser de Airbnb',
    emailUsed: 'Email de ejemplo de Salvador',
    success: !!result,
    parsed: result
  })
}
