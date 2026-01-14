import * as React from 'react'

interface Day3TestCtaProps {
  name: string
}

export default function Day3TestCta({ name }: Day3TestCtaProps) {
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
              Que tipo de anfitrion eres?
            </h1>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              {firstName}, no todos los anfitriones gestionamos igual.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Algunos somos más analíticos, otros más intuitivos. Algunos priorizamos la eficiencia, otros la experiencia del huésped.
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Conocer tu perfil te ayuda a:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#222222', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Identificar tus <strong>fortalezas naturales</strong></li>
              <li>Detectar tus <strong>puntos ciegos</strong></li>
              <li>Recibir consejos <strong>adaptados a tu estilo</strong></li>
            </ul>

            <div style={{ backgroundColor: '#222222', borderRadius: '8px', padding: '24px', marginBottom: '24px', textAlign: 'center' as const }}>
              <p style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
                Test de Perfil de Anfitrion
              </p>
              <p style={{ margin: '0 0 20px 0', color: '#DDDDDD', fontSize: '14px' }}>
                7 preguntas · 2 minutos · Resultados inmediatos
              </p>
              <a
                href={`${baseUrl}/academia/test?utm_source=email&utm_medium=funnel&utm_campaign=day3`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ffffff',
                  color: '#222222',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                Hacer el test gratis →
              </a>
            </div>

            <p style={{ margin: '0 0 24px 0', color: '#717171', fontSize: '14px', lineHeight: 1.6 }}>
              Al finalizar recibirás tu perfil completo + una guia personalizada segun tu tipo de anfitrion.
            </p>

            <p style={{ margin: '0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Alejandro
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
  return 'Que tipo de anfitrion eres? (2 min)'
}
