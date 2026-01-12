import * as React from 'react'

interface Day7ConversionProps {
  name: string
}

export default function Day7Conversion({ name }: Day7ConversionProps) {
  const firstName = name?.split(' ')[0] || 'Hola'
  const baseUrl = 'https://www.itineramio.com'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <p style={{ margin: '0', color: '#717171', fontSize: '13px', letterSpacing: '0.5px' }}>ITINERAMIO</p>
          </td>
        </tr>

        {/* Content */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '40px 32px', border: '1px solid #DDDDDD' }}>
            <h1 style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '24px', fontWeight: 600, lineHeight: 1.3 }}>
              {firstName}, tu prueba gratuita te espera
            </h1>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Durante esta semana te he contado:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#222222', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Por que el 80% de malas reseñas son evitables</li>
              <li>Como identificar tu perfil de anfitrion</li>
              <li>El caso de Maria: de 4.1 a 4.9 estrellas</li>
            </ul>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Ahora te toca a ti.
            </p>

            <div style={{ backgroundColor: '#222222', borderRadius: '12px', padding: '32px', marginBottom: '24px', textAlign: 'center' as const }}>
              <p style={{ margin: '0 0 8px 0', color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>
                15 días gratis
              </p>
              <p style={{ margin: '0 0 20px 0', color: '#DDDDDD', fontSize: '14px' }}>
                Sin tarjeta · Cancela cuando quieras
              </p>

              <a
                href={`${baseUrl}/register?utm_source=email&utm_medium=funnel&utm_campaign=day7`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ffffff',
                  color: '#222222',
                  padding: '16px 40px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
              >
                Crear mi manual digital →
              </a>

              <p style={{ margin: '20px 0 0 0', color: '#999999', fontSize: '13px' }}>
                Configura tu primer alojamiento en 5 minutos
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>Que incluye la prueba:</strong>
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#717171', fontSize: '14px', lineHeight: 1.8 }}>
              <li>1 propiedad con todas las funciones</li>
              <li>Manual digital personalizable</li>
              <li>Códigos QR ilimitados</li>
              <li>Soporte por email</li>
            </ul>

            <div style={{ backgroundColor: '#F7F7F7', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#717171', fontSize: '14px', lineHeight: 1.5 }}>
                <strong>Garantia:</strong> Si no te convence, no pagas nada. Sin compromisos, sin letra pequeña.
              </p>
            </div>

            <p style={{ margin: '0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Alejandro<br />
              <span style={{ color: '#717171', fontSize: '14px' }}>Fundador de Itineramio</span>
            </p>

            <p style={{ margin: '24px 0 0 0', color: '#717171', fontSize: '13px', fontStyle: 'italic' }}>
              PD: Si tienes dudas antes de empezar, responde a este email. Estoy aquí para ayudarte.
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#717171', fontSize: '12px' }}>
              <a href={`${baseUrl}/api/email/unsubscribe`} style={{ color: '#717171', textDecoration: 'none' }}>Cancelar suscripcion</a>
              {' · '}
              <a href={baseUrl} style={{ color: '#717171', textDecoration: 'none' }}>itineramio.com</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}

export function getSubject(): string {
  return 'Tu prueba gratuita de 15 días te espera'
}
