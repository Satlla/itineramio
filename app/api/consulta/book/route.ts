import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { updateLeadWithVideoCall } from '@/lib/unified-lead'

// Lazy initialization to avoid build errors when RESEND_API_KEY is not set
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || '')
  }
  return _resend
}

interface BookingRequest {
  name: string
  email: string
  properties: string
  challenge?: string
  selectedDate: string
  selectedTime: string
  source?: string
  sourceLevel?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.properties || !body.selectedDate || !body.selectedTime) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Email no válido' },
        { status: 400 }
      )
    }

    const normalizedEmail = body.email.toLowerCase().trim()
    const scheduledDateTime = new Date(`${body.selectedDate}T${body.selectedTime}:00`)

    // SECURITY: Check if this email already has a pending booking
    const existingBooking = await prisma.consultationBooking.findFirst({
      where: {
        email: normalizedEmail,
        status: 'scheduled',
        scheduledDate: { gte: new Date() }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Ya tienes una consulta pendiente. Revisa tu email para ver los detalles.' },
        { status: 400 }
      )
    }

    // SECURITY: Check if the slot is blocked
    const dateOnly = new Date(body.selectedDate)
    dateOnly.setHours(0, 0, 0, 0)

    const blockedSlot = await prisma.blockedSlot.findFirst({
      where: {
        date: dateOnly,
        OR: [
          { time: null }, // Whole day blocked
          { time: body.selectedTime }
        ]
      }
    })

    if (blockedSlot) {
      return NextResponse.json(
        { error: 'Este horario no está disponible. Por favor selecciona otro.' },
        { status: 400 }
      )
    }

    // SECURITY: Check if slot is already booked
    const slotTaken = await prisma.consultationBooking.findFirst({
      where: {
        scheduledDate: scheduledDateTime,
        status: 'scheduled'
      }
    })

    if (slotTaken) {
      return NextResponse.json(
        { error: 'Este horario acaba de ser reservado. Por favor selecciona otro.' },
        { status: 400 }
      )
    }

    // Create consultation booking record
    const booking = await prisma.consultationBooking.create({
      data: {
        email: normalizedEmail,
        name: body.name,
        properties: body.properties,
        challenge: body.challenge || null,
        scheduledDate: new Date(`${body.selectedDate}T${body.selectedTime}:00`),
        status: 'scheduled',
        source: body.source || 'direct',
        metadata: {
          sourceLevel: body.sourceLevel,
          bookedAt: new Date().toISOString()
        }
      }
    })

    // Update unified lead
    try {
      await updateLeadWithVideoCall(normalizedEmail)
      console.log('✅ Lead updated with videoCall completion')
    } catch (leadError) {
      console.error('⚠️ Could not update lead:', leadError)
    }

    // Generate Google Meet link (placeholder - in production you'd use Google Calendar API)
    const meetLink = `https://meet.google.com/itineramio-${booking.id.slice(0, 8)}`

    // Format date for email
    const dateFormatted = new Date(body.selectedDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Send confirmation email to user
    try {
      await getResend().emails.send({
        from: 'Álex de Itineramio <alex@itineramio.com>',
        to: [normalizedEmail],
        subject: `✅ Llamada confirmada: ${dateFormatted} a las ${body.selectedTime}h`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 600;">
      ✅ Llamada Confirmada
    </div>
  </div>

  <p style="font-size: 16px;">Hola ${body.name},</p>

  <p style="font-size: 16px;">
    ¡Perfecto! Ya tienes tu sesión de consultoría agendada.
  </p>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0;">
    <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">📅 Fecha</p>
    <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${dateFormatted}</p>

    <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">🕐 Hora</p>
    <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${body.selectedTime}h (hora España peninsular)</p>

    <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">📍 Duración</p>
    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">30 minutos</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${meetLink}"
       style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
      🎥 Unirse a la videollamada
    </a>
  </div>

  <p style="font-size: 14px; color: #64748b; text-align: center;">
    Guarda este email. El enlace de arriba es el que usaremos para la llamada.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

  <p style="font-size: 16px; font-weight: 600;">¿Qué haremos en la llamada?</p>

  <ul style="font-size: 15px; color: #4a4a4a;">
    <li>Entenderé cómo gestionas tu/s propiedad/es actualmente</li>
    <li>Identificaremos 2-3 puntos de mejora concretos</li>
    <li>Te daré un plan de acción que puedes implementar ya</li>
    <li>Si tiene sentido, te cuento cómo Itineramio puede ayudarte</li>
  </ul>

  <p style="font-size: 16px;">
    Sin presión, sin compromiso. Solo una conversación útil entre anfitriones.
  </p>

  <p style="font-size: 16px; margin-top: 30px;">
    ¡Nos vemos pronto!<br>
    <strong>Álex</strong>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    ¿Necesitas cambiar la fecha? Responde a este email.<br>
    Itineramio · Herramientas para anfitriones
  </p>

</body>
</html>
        `,
        tags: [
          { name: 'type', value: 'consultation-confirmation' },
          { name: 'source', value: body.source || 'direct' }
        ]
      })
      console.log('✅ Confirmation email sent to user')
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
    }

    // Send notification to admins
    try {
      await getResend().emails.send({
        from: 'Itineramio <notificaciones@itineramio.com>',
        to: ['hola@itineramio.com', 'alejandrosatlla@gmail.com'],
        subject: `🎯 Nueva consultoría: ${body.name} (${body.properties})`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; padding: 20px;">

  <h2 style="color: #8B5CF6;">🎯 Nueva Consultoría Agendada</h2>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${body.name}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${normalizedEmail}">${normalizedEmail}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Propiedades:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${body.properties}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${dateFormatted} a las ${body.selectedTime}h</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Fuente:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${body.source || 'direct'} ${body.sourceLevel ? `(level ${body.sourceLevel})` : ''}</td>
    </tr>
  </table>

  ${body.challenge ? `
  <div style="margin-top: 20px; background: #f8fafc; padding: 15px; border-radius: 8px;">
    <strong>Su reto:</strong><br>
    ${body.challenge}
  </div>
  ` : ''}

  <div style="margin-top: 20px;">
    <a href="${meetLink}" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Unirse a la llamada
    </a>
  </div>

  <p style="margin-top: 20px; font-size: 14px; color: #666;">
    📅 Añade esto a tu calendario manualmente o configura la integración con Google Calendar.
  </p>

</body>
</html>
        `
      })
      console.log('✅ Notification email sent to Alex')
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError)
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      meetLink
    })

  } catch (error) {
    console.error('Error booking consultation:', error)
    return NextResponse.json(
      { error: 'Error al agendar la consultoría' },
      { status: 500 }
    )
  }
}
