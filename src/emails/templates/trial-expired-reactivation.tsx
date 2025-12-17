import * as React from 'react'

interface TrialExpiredReactivationProps {
  name: string
  email: string
  totalViews: number
  propertiesCount: number
  daysExpired: number
}

export const getSubject = (name: string) => `${name}, tu manual sigue aquí (con 20% descuento)`

export const TrialExpiredReactivation: React.FC<TrialExpiredReactivationProps> = ({
  name,
  email,
  totalViews = 0,
  propertiesCount = 1,
  daysExpired = 7
}) => {
  const savedQueries = Math.floor(totalViews * 0.7)

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
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#7c3aed', fontSize: '32px', marginBottom: '10px', fontWeight: 'bold' }}>Itineramio</h1>
          </div>

          <div style={{ padding: '0 20px' }}>
            {/* Personal greeting */}
            <h2 style={{ color: '#111827', fontSize: '24px', marginBottom: '20px' }}>
              Hola {name} 👋
            </h2>

            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              Vi que tu prueba de Itineramio terminó hace {daysExpired} días.
            </p>

            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              Quería compartirte algo:
            </p>

            {/* Stats highlight */}
            {totalViews > 0 && (
              <div style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '30px',
                borderLeft: '4px solid #7c3aed'
              }}>
                <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                  Durante tu prueba, <strong style={{ color: '#7c3aed' }}>{totalViews} huéspedes</strong> vieron tu manual.
                </p>
                {savedQueries > 0 && (
                  <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginTop: '12px', marginBottom: 0 }}>
                    Eso son <strong style={{ color: '#7c3aed' }}>{savedQueries} consultas</strong> que NO tuviste que responder.
                  </p>
                )}
              </div>
            )}

            {/* Still there message */}
            <div style={{
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '1px solid #10b981'
            }}>
              <h3 style={{ color: '#065f46', fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>
                ✅ Buenas noticias
              </h3>
              <p style={{ color: '#047857', fontSize: '15px', lineHeight: '1.6', marginBottom: 0 }}>
                Tu{propertiesCount > 1 ? 's' : ''} <strong>{propertiesCount} manual{propertiesCount > 1 ? 'es' : ''}</strong> y toda tu configuración siguen guardados.
                No tienes que empezar de cero.
              </p>
            </div>

            {/* Offer */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '32px 24px',
              marginBottom: '30px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '20px', marginTop: 0, marginBottom: '16px', fontWeight: 'bold' }}>
                🎁 Si vuelves hoy, te doy 20% de descuento
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '24px' }}>€108</span>
                  {' '}€86<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/año</span>
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Plan BASIC (2 propiedades)
                </div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '12px 20px',
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '14px' }}>Código: </span>
                <strong style={{ fontSize: '18px', letterSpacing: '1px' }}>REACTIVATE20</strong>
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <a
                href="https://itineramio.com/account/billing?coupon=REACTIVATE20"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '18px 48px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}
              >
                Reactivar mi cuenta →
              </a>
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: 0 }}>
                ¿Lo probamos 1 mes más? Sin riesgo, cancela cuando quieras.
              </p>
            </div>

            {/* Comparison */}
            <div style={{
              backgroundColor: '#faf5ff',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <h4 style={{ color: '#6b21a8', fontSize: '14px', marginTop: 0, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📊 Datos que quizás no sabías
              </h4>
              <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
                <div style={{ marginBottom: '8px' }}>
                  ✓ Hosts con manual activo: <strong>4.2★</strong> de media
                </div>
                <div style={{ marginBottom: '8px' }}>
                  ✓ Hosts sin manual: <strong>3.8★</strong> de media
                </div>
                <div>
                  ✓ Diferencia en reservas: <strong>+23%</strong> más
                </div>
              </div>
            </div>

            {/* Personal sign-off */}
            <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', marginTop: '30px' }}>
              Si tienes alguna duda o quieres que te ayude con algo, simplemente responde este email.
            </p>

            <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', marginTop: '20px' }}>
              Un saludo,<br />
              <strong>Alejandro</strong><br />
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Founder @ Itineramio</span>
            </p>

            <p style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic', marginTop: '24px' }}>
              PD: Si no te interesa, responde "stop" y no te molesto más.
            </p>
          </div>

          {/* Footer */}
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

export default TrialExpiredReactivation
