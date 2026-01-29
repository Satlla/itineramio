import * as React from 'react'

interface ToolChecklistDay5Props {
  name: string
  email?: string
}

export default function ToolChecklistDay5Offer({ name, email }: ToolChecklistDay5Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'

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
              Si viste el ejemplo de ayer y pensaste <em>"esto me vendría bien"</em>, hoy puedes probarlo.
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              <strong>15 días gratis</strong>. Sin tarjeta. Creas tu manual, lo pruebas con tus huéspedes, y decides.
            </p>

            {/* Simple CTA */}
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px' }}>
              <tr>
                <td align="center">
                  <a
                    href="https://www.itineramio.com/register?utm_source=email&utm_medium=sequence&utm_campaign=tool-checklist-day5"
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

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Y si decides quedarte, usa el código <strong style={{ color: '#FF385C' }}>BIENVENIDO20</strong> para un 20% en tu primer pago.
            </p>

            {/* Closing */}
            <div style={{ backgroundColor: '#F7F7F7', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#484848', fontSize: '14px', lineHeight: 1.6 }}>
                Si no es el momento, no pasa nada. El checklist de limpieza es tuyo para siempre. Y si algún día necesitas ayuda con tus huéspedes, aquí estaremos.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              ¿Alguna duda? Responde a este email.
            </p>

            <p style={{ margin: '32px 0 0 0', color: '#222222', fontSize: '16px' }}>
              — Álex
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

export function getSubject(_couponsRemaining?: number): string {
  return 'Último email (+ código 20%)'
}
