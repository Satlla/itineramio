import * as React from 'react'

interface TimeData {
  properties?: number
  bookingsPerMonth?: number
  hoursLost?: number
}

interface Props {
  name: string
  email?: string
  timeData?: TimeData
  couponsRemaining?: number
}

export default function ToolTimeDay4Offer({ name, email, timeData, couponsRemaining }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'
  const hoursLost = timeData?.hoursLost || 72
  const hoursRecovered = Math.round(hoursLost * 0.7)

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#ffffff', padding: '0' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ padding: '24px 24px 0 24px' }}>
            <p style={{ margin: 0, color: '#FF385C', fontSize: '16px', fontWeight: 600, letterSpacing: '-0.2px' }}>
              Itineramio
            </p>
          </td>
        </tr>

        {/* Main Content */}
        <tr>
          <td style={{ padding: '32px 24px' }}>
            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Si lo que te mostre el otro día te parecio util, hoy puedes probarlo.
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              <strong>15 días gratis</strong>. Sin tarjeta. Creas tu manual, lo pruebas con tus huéspedes, y decides.
            </p>

            {/* CTA */}
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px' }}>
              <tr>
                <td align="center">
                  <a
                    href="https://www.itineramio.com/register?utm_source=email&utm_medium=sequence&utm_campaign=tool-time-day4"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#FF385C',
                      color: '#ffffff',
                      padding: '14px 32px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '16px'
                    }}
                  >
                    Empezar prueba gratuita
                  </a>
                </td>
              </tr>
            </table>

            {/* Result reminder */}
            <div style={{ backgroundColor: '#F7F7F7', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#484848', fontSize: '14px', lineHeight: 1.6 }}>
                Recuerda: calculamos que pierdes <strong>{hoursLost} horas al año</strong> en mensajes repetitivos. Con un manual digital puedes recuperar {hoursRecovered} de esas horas.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Y si decides quedarte, usa el código <strong style={{ color: '#FF385C' }}>BIENVENIDO20</strong> para un 20% en tu primer pago.
            </p>

            {/* Closing */}
            <div style={{ backgroundColor: '#F7F7F7', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#484848', fontSize: '14px', lineHeight: 1.6 }}>
                Si no es el momento, no pasa nada. Y si algun día necesitas ayuda con tus huéspedes, aquí estaremos.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Alguna duda? Responde a este email.
            </p>

            <p style={{ margin: '32px 0 0 0', color: '#222222', fontSize: '16px' }}>
              — Alex
            </p>
            <p style={{ margin: '4px 0 0 0', color: '#717171', fontSize: '14px' }}>
              Fundador de Itineramio
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: '24px', borderTop: '1px solid #EBEBEB' }}>
            <p style={{ margin: 0, color: '#717171', fontSize: '12px' }}>
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#717171', textDecoration: 'underline' }}>Cancelar suscripcion</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}

export function getSubject(couponsRemaining?: number): string {
  if (couponsRemaining && couponsRemaining < 20) {
    return `Último email (+ código 20% - quedan ${couponsRemaining})`
  }
  return 'Último email (+ código 20%)'
}
