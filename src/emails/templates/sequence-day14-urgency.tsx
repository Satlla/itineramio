/** @jsxImportSource react */
import * as React from 'react'
import { EmailArchetype } from '@/lib/resend'

interface Day14UrgencyEmailProps {
  name: string
  archetype: EmailArchetype
}

export const Day14UrgencyEmail: React.FC<Day14UrgencyEmailProps> = ({
  name,
  archetype
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
            marginBottom: '30px'
          }}>
            <h1 style={{
              color: '#7c3aed',
              fontSize: '28px',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              Itineramio
            </h1>
          </div>

          {/* Main Content */}
          <div style={{ padding: '0 20px' }}>
            {/* Urgency Badge */}
            <div style={{
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center',
              border: '2px solid #fca5a5'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ⏰ ÚLTIMO EMAIL DE ESTA SERIE
              </p>
            </div>

            <h2 style={{
              color: '#111827',
              fontSize: '24px',
              marginBottom: '16px',
              lineHeight: '1.3'
            }}>
              {name}, es ahora o nunca
            </h2>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              Durante 2 semanas te he enviado:
            </p>

            <ul style={{
              color: '#374151',
              fontSize: '15px',
              lineHeight: '1.8',
              marginBottom: '30px',
              paddingLeft: '20px'
            }}>
              <li><strong>Día 0:</strong> Tu perfil completo de {archetype}</li>
              <li><strong>Día 3:</strong> Los 3 errores que te están frenando</li>
              <li><strong>Día 7:</strong> Un caso de éxito real y verificable</li>
              <li><strong>Día 10:</strong> Qué obtienes con Itineramio</li>
            </ul>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              Te di <strong>valor primero</strong>, venta después. Ahora la decisión es tuya.
            </p>

            {/* The Choice */}
            <div style={{
              marginBottom: '40px'
            }}>
              <h3 style={{
                color: '#111827',
                fontSize: '20px',
                marginBottom: '20px',
                fontWeight: 'bold'
              }}>
                Tienes 2 caminos:
              </h3>

              {/* Path 1 - Bad */}
              <div style={{
                backgroundColor: '#fee2e2',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                border: '2px solid #fca5a5'
              }}>
                <h4 style={{
                  color: '#dc2626',
                  fontSize: '16px',
                  marginTop: 0,
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}>
                  ❌ Camino 1: Seguir como hasta ahora
                </h4>
                <ul style={{
                  color: '#991b1b',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li>Mismos errores, mismos resultados</li>
                  <li>Trabajando EN el negocio, no EN el negocio</li>
                  <li>Viendo cómo otros {archetype}s te superan</li>
                  <li>Dentro de 6 meses, exactamente donde estás hoy</li>
                </ul>
              </div>

              {/* Path 2 - Good */}
              <div style={{
                backgroundColor: '#d1fae5',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px',
                border: '2px solid #6ee7b7'
              }}>
                <h4 style={{
                  color: '#065f46',
                  fontSize: '16px',
                  marginTop: 0,
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}>
                  ✅ Camino 2: Probar Itineramio 15 días gratis
                </h4>
                <ul style={{
                  color: '#064e3b',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li>Automatizas lo repetitivo en 1 semana</li>
                  <li>Recuperas 10-15 horas semanales</li>
                  <li>Mejoras tus métricas clave en 30 días</li>
                  <li>Si no funciona, cancelas sin costo</li>
                </ul>
              </div>
            </div>

            {/* Social Proof */}
            <div style={{
              backgroundColor: '#faf5ff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '40px',
              borderLeft: '4px solid #9333ea'
            }}>
              <h3 style={{
                color: '#581c87',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '16px',
                fontWeight: 'bold'
              }}>
                👥 Esto dicen otros {archetype}s:
              </h3>
              <div style={{
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e9d5ff'
              }}>
                <p style={{
                  color: '#581c87',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  marginBottom: '8px',
                  lineHeight: '1.6'
                }}>
                  "Recuperé 12 horas semanales la primera semana. Ahora gestiono 15 propiedades en vez de 8."
                </p>
                <p style={{
                  color: '#7c3aed',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  — David T., Madrid
                </p>
              </div>
              <div style={{
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e9d5ff'
              }}>
                <p style={{
                  color: '#581c87',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  marginBottom: '8px',
                  lineHeight: '1.6'
                }}>
                  "Mi RevPAR subió 31% en 4 meses. La automatización de KPIs fue un game-changer."
                </p>
                <p style={{
                  color: '#7c3aed',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  — María G., Valencia
                </p>
              </div>
              <div>
                <p style={{
                  color: '#581c87',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  marginBottom: '8px',
                  lineHeight: '1.6'
                }}>
                  "Por fin puedo irme de vacaciones sin que el negocio se desmorone."
                </p>
                <p style={{
                  color: '#7c3aed',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  — Carlos R., Barcelona
                </p>
              </div>
            </div>

            {/* Final CTA */}
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#ffffff',
                fontSize: '22px',
                marginTop: 0,
                marginBottom: '16px',
                fontWeight: 'bold'
              }}>
                Este es el último email
              </h3>
              <p style={{
                color: '#d1d5db',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                No voy a bombardearte con más emails de ventas.<br />
                La decisión es simple: pruébalo o sigue sin él.
              </p>

              <a
                href="https://itineramio.com/register"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '18px 48px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  boxShadow: '0 4px 6px rgba(124, 58, 237, 0.3)'
                }}
              >
                Probar Itineramio 15 días gratis →
              </a>

              <p style={{
                color: '#9ca3af',
                fontSize: '13px',
                marginTop: '20px',
                marginBottom: 0
              }}>
                ✓ Sin tarjeta ✓ Sin compromiso ✓ Prueba 15 días sin compromiso
              </p>
            </div>

            {/* Alternative */}
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                ¿No es el momento adecuado?
              </p>
              <p style={{
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0
              }}>
                Está bien. Seguirás en nuestra lista y recibirás contenido de valor ocasionalmente.<br />
                Pero no más emails de ventas de esta serie.
              </p>
            </div>

            {/* Signature */}
            <p style={{
              color: '#374151',
              fontSize: '15px',
              marginTop: '30px',
              marginBottom: '10px'
            }}>
              Gracias por tu tiempo,<br />
              <strong>Alejandro</strong><br />
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Founder @ Itineramio</span>
            </p>

            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              PD: Si decides probar Itineramio en el futuro, estaré aquí. No guardamos rencores 😊
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
              <a href="https://itineramio.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Itineramio
              </a>
              {' · '}
              <a href="https://itineramio.com/blog" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Blog
              </a>
              {' · '}
              <a href="https://itineramio.com/recursos" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Recursos
              </a>
            </p>
            <p style={{ margin: '10px 0' }}>
              <a href="{{unsubscribe}}" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '11px' }}>
                Cancelar suscripción
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

export default Day14UrgencyEmail
