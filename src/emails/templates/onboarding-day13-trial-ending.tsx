import * as React from 'react'
import { genderWord, type Gender } from '@/lib/gender-text'

interface OnboardingDay13TrialEndingProps {
  name: string
  gender?: 'M' | 'F' | 'O'
  totalViews: number
  propertiesCount: number
}

export const OnboardingDay13TrialEnding: React.FC<OnboardingDay13TrialEndingProps> = ({
  name,
  gender,
  totalViews = 0,
  propertiesCount = 1
}) => {
  const savedQueries = Math.floor(totalViews * 0.7)
  const savedHours = Math.floor(savedQueries * 3 / 60)

  // Texto adaptado por género
  const readyText = genderWord('listo', gender as Gender)

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
              ⏰ {name}, tu prueba expira en 2 días
            </h2>

            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              Han pasado 13 días desde que empezaste tu prueba de Itineramio. Quería compartirte lo que has conseguido:
            </p>

            {/* Achievement Box */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '32px 24px',
              marginBottom: '30px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '20px', marginTop: 0, marginBottom: '24px', fontWeight: 'bold' }}>
                🎉 Tu impacto en 13 días
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: 0
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{totalViews}</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Visualizaciones</div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{savedQueries}</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Consultas evitadas</div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{savedHours}h</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Tiempo ahorrado</div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{propertiesCount}</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Manuales creados</div>
                </div>
              </div>
            </div>

            {/* Offer Box */}
            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '2px solid #fbbf24',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#92400e', fontSize: '18px', marginTop: 0, marginBottom: '16px' }}>
                🎁 Oferta exclusiva para ti
              </h3>
              <p style={{ color: '#78350f', fontSize: '16px', marginBottom: '20px', lineHeight: '1.6' }}>
                Activa hoy y obtén <strong>20% de descuento</strong> en tu primer año
              </p>
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  color: '#92400e',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '24px' }}>€108</span>
                  {' '}€86/año
                </div>
                <div style={{ color: '#78350f', fontSize: '13px' }}>
                  Código: <strong>TRIAL20</strong>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <a
                href="https://itineramio.com/dashboard/billing?coupon=TRIAL20"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '16px 40px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}
              >
                Activar Plan BASIC (20% OFF) →
              </a>
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '12px', marginBottom: 0 }}>
                ✅ Garantía de 30 días · ✅ Prueba 15 días sin compromiso
              </p>
            </div>

            {/* Testimonial */}
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              borderLeft: '4px solid #7c3aed'
            }}>
              <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px', fontStyle: 'italic' }}>
                "Dudé si pagar, pero hacer la cuenta me convenció: ahorro 15h/mes respondiendo consultas. A €15/h (barato), son €225/mes. Pago €9. ROI de 25x."
              </p>
              <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: 0 }}>
                <strong>Carlos R.</strong>, Property Manager en Málaga (8 propiedades)
              </p>
            </div>

            <p style={{ color: '#374151', fontSize: '15px', marginTop: '30px' }}>
              Si tienes alguna duda, simplemente responde este email.<br />
              Estoy aquí para ayudarte.<br /><br />
              Un saludo,<br />
              <strong>Alejandro</strong><br />
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Founder @ Itineramio</span>
            </p>

            <p style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic', marginTop: '20px' }}>
              PD: La oferta del 20% expira cuando termine tu prueba (en 2 días).
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

export default OnboardingDay13TrialEnding
