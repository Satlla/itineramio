import * as React from 'react'

interface LeadMagnetDownloadEmailProps {
  leadMagnetTitle: string
  leadMagnetSubtitle: string
  archetype: string
  downloadUrl: string
  pages: number
  downloadables: string[]
}

export const LeadMagnetDownloadEmail: React.FC<
  LeadMagnetDownloadEmailProps
> = ({
  leadMagnetTitle,
  leadMagnetSubtitle,
  archetype,
  downloadUrl,
  pages,
  downloadables,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#f9fafb',
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '40px 20px',
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            <h1
              style={{
                color: '#7c3aed',
                fontSize: '32px',
                marginBottom: '10px',
                fontWeight: 'bold',
              }}
            >
              Itineramio
            </h1>
            <p
              style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0,
              }}
            >
              Recursos para anfitriones {archetype}s
            </p>
          </div>

          {/* Main Content */}
          <div
            style={{
              padding: '0 20px',
            }}
          >
            {/* Success Badge */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                ✓ Tu guía está lista
              </div>
            </div>

            <h2
              style={{
                color: '#111827',
                fontSize: '24px',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              {leadMagnetTitle}
            </h2>

            <p
              style={{
                color: '#6b7280',
                fontSize: '16px',
                textAlign: 'center',
                marginBottom: '30px',
              }}
            >
              {leadMagnetSubtitle}
            </p>

            {/* Download CTA Box */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                borderRadius: '12px',
                padding: '32px 24px',
                marginBottom: '30px',
                border: '2px solid #2563eb',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                }}
              >
                📥
              </div>
              <h3
                style={{
                  color: '#111827',
                  fontSize: '20px',
                  marginTop: 0,
                  marginBottom: '16px',
                  fontWeight: 'bold',
                }}
              >
                Descarga tu guía ahora
              </h3>
              <p
                style={{
                  color: '#374151',
                  fontSize: '14px',
                  marginBottom: '24px',
                }}
              >
                {pages} páginas de contenido práctico • 100% gratis
              </p>

              <a
                href={downloadUrl}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '16px 40px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                ⬇️ Descargar PDF
              </a>

              <p
                style={{
                  color: '#6b7280',
                  fontSize: '12px',
                  marginTop: '16px',
                  marginBottom: 0,
                }}
              >
                El link estará disponible durante 30 días
              </p>
            </div>

            {/* What's Inside */}
            {downloadables.length > 0 && (
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '30px',
                }}
              >
                <h3
                  style={{
                    color: '#111827',
                    fontSize: '18px',
                    marginTop: 0,
                    marginBottom: '16px',
                  }}
                >
                  📋 Qué incluye esta guía
                </h3>
                <ul
                  style={{
                    color: '#374151',
                    fontSize: '15px',
                    lineHeight: '1.8',
                    paddingLeft: '20px',
                    marginBottom: 0,
                  }}
                >
                  {downloadables.map((item, index) => (
                    <li key={index}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            <div
              style={{
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '30px',
                borderLeft: '4px solid #f59e0b',
              }}
            >
              <h3
                style={{
                  color: '#111827',
                  fontSize: '18px',
                  marginTop: 0,
                  marginBottom: '16px',
                }}
              >
                🚀 Próximos pasos
              </h3>
              <ol
                style={{
                  color: '#374151',
                  fontSize: '15px',
                  lineHeight: '1.8',
                  paddingLeft: '20px',
                  marginBottom: 0,
                }}
              >
                <li>
                  <strong>Descarga el PDF</strong> (haz clic en el botón arriba)
                </li>
                <li>
                  <strong>Lee toda la guía</strong> y toma notas de las ideas que
                  más te resuenen
                </li>
                <li>
                  <strong>Implementa una acción hoy</strong> - No esperes al
                  "momento perfecto"
                </li>
              </ol>
            </div>

            {/* Itineramio CTA */}
            <div
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                borderRadius: '12px',
                padding: '32px 24px',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '20px',
                  marginTop: 0,
                  marginBottom: '12px',
                  fontWeight: 'bold',
                }}
              >
                ¿Listo para automatizar tu negocio?
              </h3>
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '15px',
                  marginBottom: '24px',
                  opacity: 0.95,
                }}
              >
                Itineramio te ayuda a gestionar tu alquiler vacacional sin perder
                tiempo en tareas repetitivas
              </p>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <ul
                  style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    paddingLeft: '20px',
                    marginTop: 0,
                    marginBottom: 0,
                    textAlign: 'left',
                  }}
                >
                  <li>✅ Manuales digitales en 5 minutos</li>
                  <li>✅ Reduce 86% las consultas repetitivas</li>
                  <li>✅ Mejora tus valoraciones automáticamente</li>
                  <li>✅ Automatiza respuestas con IA</li>
                </ul>
              </div>

              <a
                href="https://itineramio.com/register"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ffffff',
                  color: '#7c3aed',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                Prueba gratis 15 días →
              </a>
            </div>

            {/* Footer Message */}
            <p
              style={{
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '10px',
              }}
            >
              Cada semana compartimos nuevos recursos, casos de estudio y
              estrategias para anfitriones. Si tienes alguna pregunta, simplemente
              responde a este email.
            </p>

            <p
              style={{
                color: '#374151',
                fontSize: '15px',
                marginBottom: '30px',
              }}
            >
              ¡Éxito con tu negocio!
              <br />
              <strong>El equipo de Itineramio</strong>
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '30px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '12px',
            }}
          >
            <p style={{ marginBottom: '10px' }}>
              <a
                href="https://itineramio.com"
                style={{ color: '#7c3aed', textDecoration: 'none' }}
              >
                Itineramio
              </a>
              {' · '}
              <a
                href="https://itineramio.com/blog"
                style={{ color: '#7c3aed', textDecoration: 'none' }}
              >
                Blog
              </a>
              {' · '}
              <a
                href="https://itineramio.com/recursos"
                style={{ color: '#7c3aed', textDecoration: 'none' }}
              >
                Recursos Gratuitos
              </a>
            </p>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} Itineramio. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default LeadMagnetDownloadEmail
