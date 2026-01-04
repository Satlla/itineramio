import * as React from 'react'

interface WelcomeQREmailProps {
  name: string
}

export const WelcomeQREmail: React.FC<WelcomeQREmailProps> = ({ name }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f9fafb',
        margin: 0,
        padding: 0
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '40px 20px'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h1 style={{
              color: '#7c3aed',
              fontSize: '32px',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              Itineramio
            </h1>
          </div>

          {/* Main Content */}
          <div style={{
            padding: '0 20px'
          }}>
            <h2 style={{
              color: '#111827',
              fontSize: '24px',
              marginBottom: '20px'
            }}>
              ✅ ¡Tu código QR está listo, {name}!
            </h2>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              Acabas de crear tu primer código QR con Itineramio. Ahora tus huéspedes podrán acceder al manual con un simple escaneo.
            </p>

            {/* Tips Box */}
            <div style={{
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '2px solid #bfdbfe'
            }}>
              <h3 style={{
                color: '#1e40af',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '16px'
              }}>
                💡 3 Tips para usar tu QR
              </h3>
              <ul style={{
                color: '#1e3a8a',
                fontSize: '15px',
                lineHeight: '1.8',
                paddingLeft: '20px',
                marginBottom: 0
              }}>
                <li><strong>Imprímelo y colócalo</strong> en la entrada, cocina, y baño</li>
                <li><strong>Añádelo a tu email de check-in</strong> pre-llegada</li>
                <li><strong>Pégalo en electrodomésticos</strong> complejos (cafetera, TV, aire)</li>
              </ul>
            </div>

            {/* Example Box */}
            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#15803d',
                fontSize: '16px',
                marginTop: 0,
                marginBottom: '12px'
              }}>
                📊 Ejemplo real de Laura (Superhost Barcelona)
              </h3>
              <p style={{
                color: '#166534',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: 0
              }}>
                "Puse QR codes en 3 sitios: entrada, cocina y mesita de noche. Las consultas por WiFi y electrodomésticos bajaron del 85% a casi 0. Ahora duermo tranquila."
              </p>
            </div>

            {/* CTA */}
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <p style={{
                color: '#374151',
                fontSize: '15px',
                marginBottom: '20px'
              }}>
                ¿Quieres crear tu propio manual digital?
              </p>
              <a
                href="https://www.itineramio.com/register"
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
                Crear mi Manual Gratis →
              </a>
            </div>

            {/* Secondary CTA */}
            <div style={{
              backgroundColor: '#faf5ff',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <p style={{
                color: '#581c87',
                fontSize: '14px',
                marginBottom: '12px'
              }}>
                <strong>¿Listo para crear tu manual completo?</strong>
              </p>
              <a
                href="https://www.itineramio.com/register"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                Prueba 15 días gratis
              </a>
            </div>

            <p style={{
              color: '#374151',
              fontSize: '15px',
              marginTop: '30px'
            }}>
              Un saludo,<br />
              <strong>Alejandro</strong>
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
              <a href="https://www.itineramio.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Itineramio
              </a>
            </p>
            <p style={{ margin: '10px 0' }}>
              <a href="{{unsubscribe}}" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '11px' }}>
                Cancelar suscripción
              </a>
            </p>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} Itineramio
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default WelcomeQREmail
