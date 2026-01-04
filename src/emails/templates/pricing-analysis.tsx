import * as React from 'react'

interface PricingAnalysisEmailProps {
  userName: string
  propertyType: string
  location: string
  recommendedPrice: number
  minPrice: number
  maxPrice: number
  monthlyProjection: number
}

export const PricingAnalysisEmail: React.FC<PricingAnalysisEmailProps> = ({
  userName,
  propertyType,
  location,
  recommendedPrice,
  minPrice,
  maxPrice,
  monthlyProjection,
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
              Tu analisis de precios personalizado
            </p>
          </div>

          {/* Main Content */}
          <div style={{ padding: '0 20px' }}>
            {/* Success Badge */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
                ✓ Analisis completado
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
              Hola {userName}!
            </h2>

            <p
              style={{
                color: '#6b7280',
                fontSize: '16px',
                textAlign: 'center',
                marginBottom: '30px',
              }}
            >
              Hemos analizado tu propiedad y aqui tienes los resultados.
              Encontraras el informe completo en PDF adjunto a este email.
            </p>

            {/* Price Summary Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                borderRadius: '16px',
                padding: '32px 24px',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  margin: '0 0 8px 0',
                  opacity: 0.9,
                }}
              >
                Precio Recomendado
              </p>
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '48px',
                  margin: '0 0 8px 0',
                  fontWeight: 'bold',
                }}
              >
                {recommendedPrice} EUR
              </h3>
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  margin: 0,
                  opacity: 0.9,
                }}
              >
                por noche
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px',
                  marginTop: '24px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                  }}
                >
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: '12px',
                      margin: '0 0 4px 0',
                      opacity: 0.8,
                    }}
                  >
                    Minimo
                  </p>
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: '20px',
                      margin: 0,
                      fontWeight: 'bold',
                    }}
                  >
                    {minPrice} EUR
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                  }}
                >
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: '12px',
                      margin: '0 0 4px 0',
                      opacity: 0.8,
                    }}
                  >
                    Maximo
                  </p>
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: '20px',
                      margin: 0,
                      fontWeight: 'bold',
                    }}
                  >
                    {maxPrice} EUR
                  </p>
                </div>
              </div>
            </div>

            {/* Property Summary */}
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
                Tu propiedad
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#6b7280', fontSize: '14px', padding: '8px 0' }}>
                      Tipo:
                    </td>
                    <td
                      style={{
                        color: '#111827',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'right',
                        padding: '8px 0',
                      }}
                    >
                      {propertyType}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#6b7280', fontSize: '14px', padding: '8px 0' }}>
                      Ubicacion:
                    </td>
                    <td
                      style={{
                        color: '#111827',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'right',
                        padding: '8px 0',
                      }}
                    >
                      {location}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#6b7280', fontSize: '14px', padding: '8px 0' }}>
                      Proyeccion mensual (70% ocupacion):
                    </td>
                    <td
                      style={{
                        color: '#16a34a',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'right',
                        padding: '8px 0',
                      }}
                    >
                      {monthlyProjection} EUR
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PDF Note */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px',
                border: '1px solid #bfdbfe',
              }}
            >
              <p
                style={{
                  color: '#1e40af',
                  fontSize: '14px',
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                📎 <strong>El PDF con el analisis completo esta adjunto a este email.</strong>
                <br />
                Incluye proyecciones detalladas, estrategia de precios y consejos personalizados.
              </p>
            </div>

            {/* Tips */}
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
                Consejos para maximizar tus ingresos
              </h3>
              <ul
                style={{
                  color: '#374151',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  paddingLeft: '20px',
                  marginBottom: 0,
                }}
              >
                <li>Ajusta precios segun eventos locales y festividades</li>
                <li>Ofrece descuentos para reservas de larga estancia</li>
                <li>Sube precios en fines de semana y temporada alta</li>
                <li>Responde rapido para mejorar tu posicionamiento</li>
              </ul>
            </div>

            {/* CTA */}
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
                Automatiza la gestion de tu alquiler
              </h3>
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '15px',
                  marginBottom: '24px',
                  opacity: 0.95,
                }}
              >
                Itineramio te ayuda a crear manuales digitales, responder automaticamente
                a tus huespedes y mejorar tus valoraciones.
              </p>

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
                Prueba gratis 15 dias
              </a>
            </div>

            {/* Footer Message */}
            <p
              style={{
                color: '#374151',
                fontSize: '15px',
                marginBottom: '30px',
              }}
            >
              Si tienes alguna pregunta, simplemente responde a este email.
              <br />
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
                href="https://itineramio.com/hub"
                style={{ color: '#7c3aed', textDecoration: 'none' }}
              >
                Herramientas Gratuitas
              </a>
              {' · '}
              <a
                href="https://itineramio.com/blog"
                style={{ color: '#7c3aed', textDecoration: 'none' }}
              >
                Blog
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

export default PricingAnalysisEmail
