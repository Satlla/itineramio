import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { Resend } from 'resend'
import { enrollSubscriberInSequences } from '../../../../../src/lib/email-sequences'
import QRCode from 'qrcode'

// Lazy initialization of Resend to avoid build errors
let resend: Resend | null = null
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || '')
  }
  return resend
}

// Turnstile verification
async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping verification')
    return true // Skip in development
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

// Generate WiFi card HTML for email
function generateWifiCardHTML(data: {
  propertyName?: string
  networkName: string
  password: string
  style: { colors: string; textColor: string; name: string }
  qrCodeDataUrl?: string
}): string {
  // Map style names to actual colors for email (can't use Tailwind)
  const styleColors: Record<string, { bg: string; text: string }> = {
    'Moderno': { bg: 'linear-gradient(135deg, #8b5cf6, #9333ea)', text: '#ffffff' },
    'Minimalista': { bg: '#ffffff', text: '#111827' },
    'Océaño': { bg: 'linear-gradient(135deg, #60a5fa, #06b6d4)', text: '#ffffff' },
    'Atardecer': { bg: 'linear-gradient(135deg, #fb923c, #ec4899, #f43f5e)', text: '#ffffff' },
    'Bosque': { bg: 'linear-gradient(135deg, #059669, #15803d)', text: '#ffffff' },
    'Vintage': { bg: 'linear-gradient(135deg, #fef3c7, #fed7aa)', text: '#92400e' },
    'Tropical': { bg: 'linear-gradient(135deg, #a3e635, #34d399, #14b8a6)', text: '#ffffff' },
    'Nórdico': { bg: 'linear-gradient(135deg, #f1f5f9, #dbeafe)', text: '#1e293b' },
    'Urbano': { bg: 'linear-gradient(135deg, #27272a, #171717)', text: '#ffffff' },
    'Pastel': { bg: 'linear-gradient(135deg, #fbcfe8, #e9d5ff, #c7d2fe)', text: '#581c87' },
  }

  const colors = styleColors[data.style.name] || styleColors['Moderno']
  const borderStyle = data.style.name === 'Minimalista' ? 'border: 4px solid #111827;' : ''

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Tu tarjeta WiFi de Itineramio</p>
        </div>

        <!-- WiFi Card -->
        <div style="background: ${colors.bg}; color: ${colors.text}; border-radius: 24px; padding: 32px; ${borderStyle} margin-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: top;">
                ${data.propertyName ? `<p style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">${data.propertyName}</p>` : ''}
                <div style="margin-bottom: 24px;">
                  <span style="font-size: 32px; margin-right: 8px;">📶</span>
                  <span style="font-size: 28px; font-weight: bold;">WiFi</span>
                </div>
              </td>
              ${data.qrCodeDataUrl ? `
              <td style="vertical-align: top; text-align: right; width: 140px;">
                <div style="background: #ffffff; border-radius: 12px; padding: 8px; display: inline-block;">
                  <img src="${data.qrCodeDataUrl}" alt="WiFi QR Code" style="width: 100px; height: 100px; display: block;" />
                  <p style="font-size: 10px; color: #6b7280; margin: 4px 0 0 0; text-align: center;">Escanea para conectar</p>
                </div>
              </td>
              ` : ''}
            </tr>
          </table>

          <div style="margin-bottom: 16px;">
            <p style="font-size: 14px; opacity: 0.7; margin: 0 0 4px 0;">Red:</p>
            <p style="font-size: 24px; font-weight: bold; margin: 0; word-break: break-all;">${data.networkName}</p>
          </div>

          <div>
            <p style="font-size: 14px; opacity: 0.7; margin: 0 0 4px 0;">Contraseña:</p>
            <p style="font-size: 24px; font-weight: bold; margin: 0; word-break: break-all;">${data.password}</p>
          </div>
        </div>

        <!-- Instructions -->
        <div style="background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <h3 style="color: #111827; font-size: 16px; font-weight: bold; margin: 0 0 16px 0;">Cómo conectarse:</h3>
          <ol style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Abre la configuración WiFi en tu dispositivo</li>
            <li>Busca la red: <strong>${data.networkName}</strong></li>
            <li>Introduce la contraseña exactamente como aparece</li>
            <li>¡Listo! Ya estás conectado</li>
          </ol>
        </div>

        <!-- Tips -->
        <div style="background: #f0fdf4; border-radius: 16px; padding: 20px; border: 1px solid #bbf7d0; margin-bottom: 24px;">
          <p style="color: #166534; font-size: 14px; font-weight: bold; margin: 0 0 12px 0;">💡 Tips de uso:</p>
          <ul style="color: #15803d; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Imprime en papel de alta calidad</li>
            <li>Plastifica la tarjeta para mayor durabilidad</li>
            <li>Colócala en lugar visible: entrada, mesa, refrigerador</li>
          </ul>
        </div>

        <!-- CTA -->
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); border-radius: 16px; padding: 24px; text-align: center;">
          <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">¿Quieres automatizar más consultas?</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 16px 0;">Crea tu manual digital completo con Itineramio</p>
          <a href="https://www.itineramio.com/register?utm_source=email&utm_medium=tool&utm_campaign=wifi-card"
             style="display: inline-block; background: #ffffff; color: #7c3aed; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
            Crear mi manual gratis →
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 24px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            <a href="https://www.itineramio.com/unsubscribe" style="color: #9ca3af; text-decoration: none;">Cancelar suscripción</a>
            · © ${new Date().getFullYear()} Itineramio
          </p>
        </div>
      </div>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, turnstileToken, networkName, password, propertyName, style } = body

    // Validate required fields
    if (!name || !email || !networkName || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verify Turnstile token
    if (turnstileToken) {
      const isValid = await verifyTurnstile(turnstileToken)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Verificación de seguridad fallida. Inténtalo de nuevo.' },
          { status: 400 }
        )
      }
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Capture lead
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: normalizedEmail,
        source: 'wifi-card',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          name,
          email: normalizedEmail,
          source: 'wifi-card',
          metadata: { propertyName, networkName, style: style?.name }
        }
      })
    }

    // Create/update EmailSubscriber
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    let subscriber
    if (!existingSubscriber) {
      subscriber = await prisma.emailSubscriber.create({
        data: {
          email: normalizedEmail,
          name,
          source: 'tool_wifi-card',
          sourceMetadata: { propertyName, networkName },
          status: 'active',
          sequenceStatus: 'active',
          sequenceStartedAt: new Date(),
          tags: ['tool_wifi-card', 'wifi-card'],
          currentJourneyStage: 'lead',
          engagementScore: 'warm'
        }
      })

      // Enroll in sequences
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        source: 'tool_wifi-card',
        tags: ['tool_wifi-card', 'wifi-card']
      }).catch(error => {
        console.error('Failed to enroll subscriber in sequences:', error)
      })
    } else {
      subscriber = existingSubscriber
      // Update tags if needed
      if (!existingSubscriber.tags?.includes('wifi-card')) {
        await prisma.emailSubscriber.update({
          where: { email: normalizedEmail },
          data: { tags: { push: 'wifi-card' } }
        })
      }
    }

    // Generate WiFi QR code as data URL
    // WiFi QR format: WIFI:T:WPA;S:<SSID>;P:<PASSWORD>;;
    const wifiString = `WIFI:T:WPA;S:${networkName};P:${password};;`
    let qrCodeDataUrl: string | undefined

    try {
      qrCodeDataUrl = await QRCode.toDataURL(wifiString, {
        width: 200,
        margin: 1,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
    } catch (qrError) {
      console.error('Failed to generate QR code:', qrError)
      // Continue without QR code if generation fails
    }

    // Generate and send email with WiFi card
    const htmlContent = generateWifiCardHTML({
      propertyName,
      networkName,
      password,
      style: style || { name: 'Moderno', colors: '', textColor: '' },
      qrCodeDataUrl
    })

    await getResend().emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: normalizedEmail,
      subject: `Tu Tarjeta WiFi${propertyName ? ` - ${propertyName}` : ''} 📶`,
      html: htmlContent
    })

    console.log(`[WiFi Card] Sent to ${normalizedEmail}`)

    return NextResponse.json({
      success: true,
      message: 'Tarjeta enviada correctamente'
    })

  } catch (error) {
    console.error('Error sending WiFi card:', error)
    return NextResponse.json(
      { error: 'Error al enviar la tarjeta. Inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
