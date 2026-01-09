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
}

export default function ToolTimeDay2Solution({ name, email, timeData }: Props) {
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
              El otro dia calculamos que pierdes <strong>{hoursLost} horas al ano</strong> respondiendo mensajes repetitivos.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Hoy te cuento como reducirlas a casi nada.
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '18px', fontWeight: 600, lineHeight: 1.5 }}>
              La solucion: darle la informacion al huesped antes de que pregunte.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              No en un PDF que no abren.<br />
              No en un email de Airbnb que no leen.<br />
              No en un WhatsApp que no guardan.
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              En un <strong>enlace</strong> que abren desde el movil en 2 segundos.
            </p>

            {/* How it works */}
            <div style={{ backgroundColor: '#F7F7F7', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 16px 0', color: '#222222', fontSize: '15px', fontWeight: 600 }}>
                Asi funciona:
              </p>
              <p style={{ margin: '0 0 12px 0', color: '#484848', fontSize: '15px', lineHeight: 1.6 }}>
                1. El huesped escanea un QR o abre un link
              </p>
              <p style={{ margin: '0 0 12px 0', color: '#484848', fontSize: '15px', lineHeight: 1.6 }}>
                2. Ve TODO sobre tu alojamiento: WiFi, electrodomesticos, normas, recomendaciones
              </p>
              <p style={{ margin: '0', color: '#484848', fontSize: '15px', lineHeight: 1.6 }}>
                3. No te escribe. Porque ya tiene la respuesta.
              </p>
            </div>

            {/* Result */}
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '15px', lineHeight: 1.6 }}>
                <strong>{hoursLost}h → {Math.round(hoursLost * 0.3)}h</strong> = {hoursRecovered} horas recuperadas al ano
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Esto es lo que hacemos en Itineramio: manuales digitales para anfitriones.
            </p>

            {/* CTA */}
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px' }}>
              <tr>
                <td align="center">
                  <a
                    href="https://www.itineramio.com/demo?utm_source=email&utm_medium=sequence&utm_campaign=tool-time-day2"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#FF385C',
                      color: '#ffffff',
                      padding: '14px 28px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '16px'
                    }}
                  >
                    Ver manual de ejemplo
                  </a>
                </td>
              </tr>
            </table>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              En 2 dias te cuento como puedes probarlo en tu propiedad.
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

export function getSubject(): string {
  return 'Como reducir esos mensajes de WhatsApp'
}
