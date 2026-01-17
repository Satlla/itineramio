import { config } from 'dotenv'
config({ path: '.env.local' })

import { Resend } from 'resend'

const testEmail = 'alejandrosatlla@gmail.com'
const confirmUrl = 'https://www.itineramio.com/api/newsletter/confirm?token=TEST_TOKEN_PREVIEW'
const baseUrl = 'https://www.itineramio.com'
const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(testEmail)}`

// PNG logo URL with gradient (hosted on server)
const isotipoUrl = `${baseUrl}/isotipo-gradient.png`

async function sendTestEmail() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('❌ No se encontró RESEND_API_KEY')
    return
  }

  console.log(`📧 API Key encontrada (${apiKey.length} chars)`)
  console.log(`📧 Enviando email de prueba a ${testEmail}...`)

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from: 'Itineramio <hola@itineramio.com>',
    to: testEmail,
    subject: '[PREVIEW v5] Confirma tu suscripción - Itineramio',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Confirma tu suscripción - Itineramio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="${isotipoUrl}" alt="Itineramio" width="40" height="22" style="display: block; height: 22px; width: auto;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 10px;">
                    <span style="font-size: 18px; font-weight: 600; color: #0f172a;">Itineramio</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.3;">Confirma tu suscripción</h1>
              <p style="margin: 0 0 32px 0; font-size: 15px; color: #64748b; line-height: 1.6;">Haz clic en el botón para confirmar tu email y empezar a recibir contenido exclusivo.</p>
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 12px;">
                    <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 16px 48px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">Confirmar suscripción</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto 12px auto;">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="${isotipoUrl}" alt="Itineramio" width="28" height="15" style="display: block; height: 15px; width: auto;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 6px;">
                    <span style="font-size: 14px; font-weight: 600; color: #0f172a;">Itineramio</span>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Darme de baja</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  })

  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Email de prueba enviado!')
    console.log('📧 ID:', data?.id)
  }
}

sendTestEmail()
  .catch(console.error)
