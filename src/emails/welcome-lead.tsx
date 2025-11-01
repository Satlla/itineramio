import * as React from 'react'

interface WelcomeLeadEmailProps {
  name: string
  resourceName: string
}

export const WelcomeLeadEmail: React.FC<WelcomeLeadEmailProps> = ({
  name,
  resourceName
}) => {
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
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0
            }}>
              El mejor software para gestionar tu alojamiento turístico
            </p>
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
              ¡Hola{name ? ` ${name}` : ''}! 👋
            </h2>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Gracias por descargar <strong>{resourceName}</strong>. Esperamos que te sea de gran ayuda para tu negocio.
            </p>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              En Itineramio, creamos herramientas pensadas específicamente para anfitriones como tú, que quieren ofrecer la mejor experiencia a sus huéspedes sin perder tiempo en tareas repetitivas.
            </p>

            {/* CTA Box */}
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '2px solid #e5e7eb'
            }}>
              <h3 style={{
                color: '#111827',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '16px'
              }}>
                ¿Sabías que con Itineramio puedes...?
              </h3>
              <ul style={{
                color: '#374151',
                fontSize: '15px',
                lineHeight: '1.8',
                paddingLeft: '20px',
                marginBottom: '20px'
              }}>
                <li>✅ Crear manuales digitales en menos de 5 minutos</li>
                <li>✅ Reducir un 86% las consultas sobre WiFi, acceso, y check-in</li>
                <li>✅ Mejorar tus valoraciones con guías personalizadas</li>
                <li>✅ Automatizar respuestas con IA</li>
              </ul>

              <div style={{ textAlign: 'center' }}>
                <a
                  href="https://itineramio.com/register"
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
                  Prueba gratis 15 días →
                </a>
              </div>
            </div>

            {/* Footer Message */}
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '10px'
            }}>
              Si tienes alguna pregunta o necesitas ayuda, no dudes en responder a este email. Estamos aquí para ayudarte.
            </p>

            <p style={{
              color: '#374151',
              fontSize: '15px',
              marginBottom: '30px'
            }}>
              ¡Que tengas un gran día!<br />
              <strong>El equipo de Itineramio</strong>
            </p>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '30px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px'
          }}>
            <p style={{ marginBottom: '10px' }}>
              <a href="https://itineramio.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Itineramio
              </a>
              {' · '}
              <a href="https://itineramio.com/blog" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Blog
              </a>
              {' · '}
              <a href="https://itineramio.com/hub" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Recursos Gratuitos
              </a>
            </p>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} Itineramio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default WelcomeLeadEmail
