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

export default function ToolTimeDay0Result({ name, email, timeData }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'
  const hoursLost = timeData?.hoursLost || 72
  const properties = timeData?.properties || 3
  const daysLost = (hoursLost / 8).toFixed(1)

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
              Guardo este email para ti. Tu resultado de la calculadora:
            </p>

            {/* Result Box */}
            <div style={{ backgroundColor: '#FFF8F6', border: '1px solid #FFEBE8', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' as const }}>
              <p style={{ margin: '0 0 8px 0', color: '#717171', fontSize: '14px' }}>
                Con {properties} propiedades pierdes
              </p>
              <p style={{ margin: '0 0 8px 0', color: '#FF385C', fontSize: '48px', fontWeight: 700, lineHeight: 1 }}>
                {hoursLost} horas
              </p>
              <p style={{ margin: 0, color: '#222222', fontSize: '16px' }}>
                al año respondiendo lo mismo
              </p>
              <p style={{ margin: '12px 0 0 0', color: '#717171', fontSize: '14px' }}>
                ({daysLost} días laborales)
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Estás horas se van en mensajes de WhatsApp sobre:
            </p>

            <ul style={{ margin: '0 0 24px 0', padding: '0 0 0 20px', color: '#484848', fontSize: '15px', lineHeight: 2 }}>
              <li>Como llegar y donde aparcar</li>
              <li>Contrasena del WiFi</li>
              <li>Como funciona la lavadora, el AC, la vitroceramica...</li>
              <li>Recomendaciones de restaurantes y sitios</li>
              <li>Lineas de autobus o metro cercanas</li>
            </ul>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Cada mensaje son 3 minutos: leer, pensar, escribir. Multiplicalo por cientos de reservas al año.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              En 2 días te cuento como puedes recuperar el 70% de ese tiempo.
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

export function getSubject(hoursLost?: number): string {
  return `Tu resultado: ${hoursLost || 72} horas perdidas al año`
}
