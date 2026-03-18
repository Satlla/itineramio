import { NextRequest, NextResponse } from 'next/server'
import { parseAirbnbEmail } from '@/lib/reservations/parsers/airbnb-parser'
import { parseBookingEmail } from '@/lib/reservations/parsers/booking-parser'
import { ParsedReservation, ResendInboundEvent } from '@/lib/reservations/types'

// Resend API para obtener contenido del email
const RESEND_API_KEY = process.env.RESEND_API_KEY

/**
 * Webhook que recibe emails de Resend Inbound
 * Procesa emails de Airbnb y Booking para extraer reservas
 */
export async function POST(request: NextRequest) {
  try {
    const event: ResendInboundEvent = await request.json()


    // Solo procesar eventos de email recibido
    if (event.type !== 'email.received') {
      return NextResponse.json({ message: 'Evento ignorado' })
    }

    // Identificar la plataforma por el remitente
    const from = event.data.from.toLowerCase()
    let platform: 'AIRBNB' | 'BOOKING' | 'OTHER' = 'OTHER'

    if (from.includes('airbnb')) {
      platform = 'AIRBNB'
    } else if (from.includes('booking')) {
      platform = 'BOOKING'
    }

    if (platform === 'OTHER') {
      return NextResponse.json({
        message: 'Email ignorado - no es de plataforma soportada',
        from: event.data.from
      })
    }

    // Obtener el contenido completo del email via API de Resend
    const emailContent = await getEmailContent(event.data.email_id)

    if (!emailContent) {
      console.error('❌ No se pudo obtener contenido del email')
      return NextResponse.json(
        { error: 'No se pudo obtener contenido del email' },
        { status: 500 }
      )
    }

    // Parsear según la plataforma
    let parsedReservation: ParsedReservation | null = null

    if (platform === 'AIRBNB') {
      parsedReservation = parseAirbnbEmail(
        event.data.subject,
        emailContent.html || '',
        emailContent.text || ''
      )
    } else if (platform === 'BOOKING') {
      parsedReservation = parseBookingEmail(
        event.data.subject,
        emailContent.html || '',
        emailContent.text || ''
      )
    }

    if (parsedReservation) {
      // TODO: Guardar en base de datos
      // TODO: Enviar notificación al usuario
      // TODO: Identificar a qué usuario pertenece por el email de destino

      // Por ahora, devolvemos los datos parseados para testing
      return NextResponse.json({
        success: true,
        message: 'Reserva procesada correctamente',
        reservation: {
          platform: parsedReservation.platform,
          confirmationCode: parsedReservation.confirmationCode,
          propertyName: parsedReservation.propertyName,
          guestName: parsedReservation.guestName,
          guestCountry: parsedReservation.guestCountry,
          checkIn: parsedReservation.checkIn,
          checkOut: parsedReservation.checkOut,
          nights: parsedReservation.nights,
          hostEarnings: parsedReservation.hostEarnings,
          cleaningFee: parsedReservation.cleaningFee,
          eventType: parsedReservation.eventType
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No se pudo extraer datos de la reserva',
        emailId: event.data.email_id,
        subject: event.data.subject
      })
    }

  } catch (error) {
    console.error('❌ Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Obtiene el contenido completo de un email via API de Resend
 */
async function getEmailContent(emailId: string): Promise<{
  html: string | null
  text: string | null
} | null> {
  try {
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`
      }
    })

    if (!response.ok) {
      console.error('Error obteniendo email de Resend:', response.status)
      return null
    }

    const data = await response.json()

    return {
      html: data.html || null,
      text: data.text || null
    }
  } catch (error) {
    console.error('Error llamando a Resend API:', error)
    return null
  }
}

// También soportamos GET para verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook de Resend Inbound activo',
    timestamp: new Date().toISOString()
  })
}
