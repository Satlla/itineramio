import * as React from 'react'

interface OnboardingDay1StatsProps {
  name: string
  views: number
}

export const OnboardingDay1Stats: React.FC<OnboardingDay1StatsProps> = ({ name, views }) => {
  return (
    <html>
      <head><meta charSet="utf-8" /></head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f9fafb',
        margin: 0,
        padding: 0
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#7c3aed', fontSize: '32px', marginBottom: '10px', fontWeight: 'bold' }}>Itineramio</h1>
          </div>

          <div style={{ padding: '0 20px' }}>
            <h2 style={{ color: '#111827', fontSize: '24px', marginBottom: '20px' }}>
              👀 ¡{name}, tu manual ya tiene {views} visitas!
            </h2>

            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              En solo 24 horas, tus huéspedes ya están consultando tu manual. Eso son <strong>{views} consultas que NO tuviste que responder</strong>.
            </p>

            <div style={{
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '2px solid #a7f3d0'
            }}>
              <h3 style={{ color: '#047857', fontSize: '18px', marginTop: 0, marginBottom: '16px' }}>
                📊 Tus estadísticas primeras 24h
              </h3>
              <div style={{ color: '#065f46', fontSize: '15px', lineHeight: '2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Visualizaciones totales:</span>
                  <strong>{views}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Consultas evitadas:</span>
                  <strong>~{Math.floor(views * 0.7)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tiempo ahorrado:</span>
                  <strong>~{Math.floor(views * 0.7 * 3)} minutos</strong>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <a
                href="https://itineramio.com/dashboard/analytics"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Ver Mis Estadísticas Completas →
              </a>
            </div>

            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
              <strong>Próximo paso:</strong> Personaliza el diseño de tu manual con tus colores y logo. Te envío un tutorial mañana.
            </p>

            <p style={{ color: '#374151', fontSize: '15px', marginTop: '30px' }}>
              Un saludo,<br /><strong>Alejandro</strong>
            </p>
          </div>

          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '30px',
            marginTop: '40px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px'
          }}>
            <p style={{ marginBottom: '10px' }}>
              <a href="https://itineramio.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>Itineramio</a>
            </p>
            <p style={{ margin: '10px 0' }}>
              <a href="{{unsubscribe}}" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '11px' }}>
                Cancelar suscripción
              </a>
            </p>
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} Itineramio</p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default OnboardingDay1Stats
