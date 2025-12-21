import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

function formatPhoneForWhatsApp(phone: string): string {
  // Remove everything except digits and +
  let cleaned = phone.replace(/[^\d+]/g, '')
  // If starts with 00, replace with +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2)
  }
  // If no + and looks like Spanish number
  if (!cleaned.startsWith('+') && cleaned.length === 9) {
    cleaned = '+34' + cleaned
  }
  // Remove the + for wa.me link
  return cleaned.replace('+', '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, telefono, email } = body

    if (!nombre || !telefono || !email) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    // Format phone for WhatsApp
    const whatsappPhone = formatPhoneForWhatsApp(telefono)
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola, tengo una pregunta sobre mi estancia')}`

    // Generate QR code URL using external service (works in all email clients)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(whatsappUrl)}&bgcolor=ffffff&color=222222`

    // Save lead to database
    try {
      await prisma.leadMagnetDownload.create({
        data: {
          email,
          leadMagnetSlug: 'plantilla-estrellas-personalizada',
          metadata: {
            nombre,
            telefono,
            whatsappPhone
          }
        }
      })
    } catch (dbError) {
      // If table doesn't exist or other DB error, continue anyway
      console.error('Error saving lead:', dbError)
    }

    // Generate the HTML template
    const templateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 40px 20px; }
    .template {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      padding: 32px 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #ebebeb;
      margin-bottom: 24px;
    }
    .logo { font-size: 40px; margin-bottom: 8px; }
    .title { font-size: 24px; font-weight: 600; color: #222; margin-bottom: 4px; }
    .subtitle { color: #717171; font-size: 14px; }
    .star-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .star-item.five { background: #f0fdf4; }
    .star-item.four { background: #fefce8; }
    .star-item.three { background: #fef2f2; }
    .stars { font-size: 20px; margin-right: 16px; min-width: 100px; }
    .star-text .label { font-weight: 600; font-size: 14px; }
    .star-item.five .label { color: #166534; }
    .star-item.four .label { color: #a16207; }
    .star-item.three .label { color: #b91c1c; }
    .star-text .desc { font-size: 12px; color: #717171; }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #ebebeb;
      margin-top: 24px;
    }
    .footer-text { color: #717171; font-size: 13px; margin-bottom: 16px; }
    .coral { color: #FF385C; }
  </style>
</head>
<body>
  <div class="template">
    <div class="header">
      <div class="logo">🏠</div>
      <div class="title">Gracias por tu estancia</div>
      <div class="subtitle">${nombre}</div>
    </div>

    <div class="star-item five">
      <div class="stars">⭐⭐⭐⭐⭐</div>
      <div class="star-text">
        <div class="label">5 Estrellas</div>
        <div class="desc">Todo funcionó correctamente</div>
      </div>
    </div>

    <div class="star-item four">
      <div class="stars">⭐⭐⭐⭐</div>
      <div class="star-text">
        <div class="label">4 Estrellas</div>
        <div class="desc">Hubo algún problema menor</div>
      </div>
    </div>

    <div class="star-item three">
      <div class="stars">⭐⭐⭐</div>
      <div class="star-text">
        <div class="label">3 Estrellas o menos</div>
        <div class="desc">Hubo problemas significativos</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">
        ¿Algún problema? <span class="coral">Escríbeme directamente</span>
      </div>
      <table cellpadding="0" cellspacing="0" border="0" style="background: #f9fafb; border-radius: 16px; margin: 0 auto;">
        <tr>
          <td style="padding: 16px;">
            <img src="${qrCodeUrl}" alt="QR WhatsApp" width="80" height="80" style="display: block;" />
          </td>
          <td style="padding: 16px 20px 16px 0; vertical-align: middle;">
            <div style="font-size: 11px; color: #717171;">Escanea para contactar</div>
            <div style="font-weight: 600; color: #222; font-size: 14px;">${telefono}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>
`

    // Send email with the template and QR attachment
    await resend.emails.send({
      from: 'Itineramio <recursos@itineramio.com>',
      to: email,
      subject: 'Tu plantilla personalizada del significado de las estrellas',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #222; font-size: 24px; }
    .template-preview { background: #f9fafb; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #FF385C 0%, #E31C5F 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; color: #717171; font-size: 14px; }
  </style>
</head>
<body>
  <h1>¡Aquí tienes tu plantilla personalizada!</h1>

  <p>Hola ${nombre},</p>

  <p>Gracias por descargar la plantilla del significado de las estrellas. A continuación encontrarás tu plantilla personalizada con tu código QR de WhatsApp.</p>

  <div class="template-preview">
    <p style="margin: 0 0 16px 0; font-weight: 600;">Tu plantilla:</p>
    ${templateHtml}
  </div>

  <p><strong>Cómo usarla:</strong></p>
  <ol>
    <li>Imprime este email o guárdalo como PDF</li>
    <li>Recorta la plantilla</li>
    <li>Enmárcala o plastifícala</li>
    <li>Colócala en un lugar visible de tu alojamiento</li>
  </ol>

  <p>El código QR lleva directamente a tu WhatsApp, para que tus huéspedes puedan contactarte fácilmente si tienen alguna pregunta o problema.</p>

  <p>
    <a href="https://www.itineramio.com/blog/plantilla-significado-estrellas-airbnb-huespedes" class="cta">
      Ver artículo completo
    </a>
  </p>

  <div class="footer">
    <p>Este email fue enviado por <a href="https://www.itineramio.com">Itineramio</a>.</p>
    <p>Si no solicitaste esta plantilla, puedes ignorar este mensaje.</p>
  </div>
</body>
</html>
`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Error al generar la plantilla' },
      { status: 500 }
    )
  }
}
