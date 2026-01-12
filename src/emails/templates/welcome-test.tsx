import * as React from 'react'
import { EmailArchetype } from '@/lib/resend'
import { generateDownloadToken } from '@/lib/tokens'
import { genderWord, type Gender } from '@/lib/gender-text'

interface WelcomeTestEmailProps {
  name: string
  gender?: 'M' | 'F' | 'O'
  archetype: EmailArchetype
  subscriberId?: string // ID del EmailSubscriber para generar token
  interests?: string[] // Intereses capturados en el test (máx 3)
}

const ARCHETYPE_INFO: Record<EmailArchetype, { emoji: string; strength: string; gap: string; guide: string; slug: string }> = {
  ESTRATEGA: {
    emoji: '🎯',
    strength: 'Analítico y orientado a datos',
    gap: 'Falta de automatización en reporting',
    guide: 'El Manual del Estratega: 5 KPIs que Mueven la Aguja',
    slug: 'estratega-5-kpis'
  },
  SISTEMATICO: {
    emoji: '⚙️',
    strength: 'Procesos organizados y escalables',
    gap: 'Necesitas más herramientas de automatización',
    guide: 'El Manual del Organizador: 47 Tareas Automatizables',
    slug: 'organizador-47-tareas'
  },
  DIFERENCIADOR: {
    emoji: '✨',
    strength: 'Experiencias únicas que destacan',
    gap: 'Falta storytelling en tus descripciones',
    guide: 'El Playbook del Diferenciador: Storytelling que Convierte',
    slug: 'diferenciador-storytelling'
  },
  EJECUTOR: {
    emoji: '⚡',
    strength: 'Acción rápida y decisiones directas',
    gap: 'Riesgo de burnout por sobrecarga',
    guide: 'Del Modo Bombero al Modo CEO: Guía del Ejecutor',
    slug: 'ejecutor-modo-ceo'
  },
  RESOLUTOR: {
    emoji: '🛠️',
    strength: 'Soluciones rápidas ante crisis',
    gap: 'Prevención antes de resolver',
    guide: 'Playbook Anti-Crisis: 27 Situaciones Resueltas',
    slug: 'resolutor-27-crisis'
  },
  EXPERIENCIAL: {
    emoji: '❤️',
    strength: 'Conexión emocional con huéspedes',
    gap: 'Escalar sin perder el toque humano',
    guide: 'El Corazón Escalable: Automatiza lo Técnico, Amplifica lo Humano',
    slug: 'experiencial-corazon-escalable'
  },
  EQUILIBRADO: {
    emoji: '⚖️',
    strength: 'Versatilidad en todas las áreas',
    gap: 'Definir tu especialización',
    guide: 'El Equilibrado Estratégico: De Versátil a Excepcional',
    slug: 'equilibrado-versatil-excepcional'
  },
  IMPROVISADOR: {
    emoji: '🎨',
    strength: 'Adaptabilidad y creatividad',
    gap: 'Necesitas más estructura sin perder flexibilidad',
    guide: 'El Kit Anti-Caos: Estructura que Libera',
    slug: 'improvisador-kit-anti-caos'
  }
}

// Mapeo de intereses a descripciones user-friendly
const INTEREST_LABELS: Record<string, string> = {
  reviews: 'Mejorar tus reviews y calificaciones',
  pricing: 'Optimizar tu estrategia de precios',
  occupancy: 'Aumentar tu tasa de ocupación',
  automation: 'Automatizar tareas repetitivas',
  communication: 'Mejorar la comunicación con huéspedes',
  calendar: 'Optimizar la gestión de tu calendario',
  design: 'Perfeccionar el diseño de tu espacio',
  legal: 'Cumplir con normativas legales'
}

export const WelcomeTestEmail: React.FC<WelcomeTestEmailProps> = ({
  name,
  gender,
  archetype,
  subscriberId,
  interests
}) => {
  const info = ARCHETYPE_INFO[archetype]
  // Always use production URL for emails (emails are sent from server)
  const baseUrl = 'https://itineramio.com'

  // Generar token de descarga si tenemos subscriberId
  const downloadToken = subscriberId
    ? generateDownloadToken(subscriberId, info.slug)
    : null

  console.log('📧 Welcome email - subscriberId:', subscriberId, 'token:', downloadToken ? 'generated' : 'null')

  // URL de descarga con token o landing normal
  const downloadUrl = downloadToken
    ? `${baseUrl}/recursos/${info.slug}/download?token=${downloadToken}`
    : `${baseUrl}/recursos/${info.slug}`

  console.log('📧 Welcome email - downloadUrl:', downloadUrl)

  // Texto adaptado por género
  const welcomeText = genderWord('bienvenido', gender as Gender)

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
              Manuales digitales inteligentes
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
              {info.emoji} ¡Hola {name}! Eres un {archetype}
            </h2>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Acabas de completar nuestro test de personalidad para anfitriones. Aquí está tu perfil completo:
            </p>

            {/* Results Box */}
            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '2px solid #86efac'
            }}>
              <h3 style={{
                color: '#15803d',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '16px',
                fontWeight: 'bold'
              }}>
                ✅ Tu Mayor Fortaleza
              </h3>
              <p style={{
                color: '#166534',
                fontSize: '15px',
                marginBottom: 0,
                lineHeight: '1.6'
              }}>
                {info.strength}
              </p>
            </div>

            <div style={{
              backgroundColor: '#fff7ed',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '2px solid #fed7aa'
            }}>
              <h3 style={{
                color: '#c2410c',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '16px',
                fontWeight: 'bold'
              }}>
                ⚠️ Tu Brecha Crítica
              </h3>
              <p style={{
                color: '#9a3412',
                fontSize: '15px',
                marginBottom: 0,
                lineHeight: '1.6'
              }}>
                {info.gap}
              </p>
            </div>

            {/* CTA Box */}
            <div style={{
              backgroundColor: '#faf5ff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '2px solid #e9d5ff'
            }}>
              <h3 style={{
                color: '#6b21a8',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '16px'
              }}>
                📥 Descarga tu guía personalizada
              </h3>
              <p style={{
                color: '#581c87',
                fontSize: '15px',
                marginBottom: '20px'
              }}>
                <strong>{info.guide}</strong>
              </p>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <a
                  href={downloadUrl}
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
                  Descargar Mi Guía PDF →
                </a>
              </div>

              <p style={{
                color: '#6b7280',
                fontSize: '13px',
                textAlign: 'center',
                marginBottom: 0
              }}>
                O mejor aún: crea tu manual digital en 5 minutos
              </p>
            </div>

            {/* Secondary CTA */}
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <h3 style={{
                color: '#111827',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '12px'
              }}>
                ¿Por qué Itineramio es perfecto para ti?
              </h3>
              <p style={{
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.8',
                marginBottom: '20px'
              }}>
                Como {archetype}, necesitas herramientas que se adapten a tu estilo.<br />
                Con Itineramio puedes crear manuales profesionales sin perder tiempo.
              </p>

              <a
                href={`${baseUrl}/register`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}
              >
                Prueba 15 días gratis (sin tarjeta)
              </a>
            </div>

            {/* Footer Message */}
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '10px'
            }}>
              En los próximos días te enviaré:
            </p>
            <ul style={{
              color: '#374151',
              fontSize: '14px',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              {interests && interests.length > 0 ? (
                <>
                  {interests.map((interest, index) => (
                    <li key={index}>{INTEREST_LABELS[interest] || interest}</li>
                  ))}
                  <li>Casos de éxito de anfitriones como tú</li>
                  <li>Plantillas descargables gratuitas</li>
                </>
              ) : (
                <>
                  <li>3 estrategias específicas para {archetype}s</li>
                  <li>Casos de éxito de anfitriones como tú</li>
                  <li>Plantillas descargables gratuitas</li>
                </>
              )}
            </ul>

            <p style={{
              color: '#374151',
              fontSize: '15px',
              marginTop: '30px',
              marginBottom: '10px'
            }}>
              ¡{welcomeText.charAt(0).toUpperCase() + welcomeText.slice(1)} a Itineramio!<br />
              <strong>Alejandro</strong><br />
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Founder @ Itineramio</span>
            </p>

            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              PD: Si tienes alguna pregunta, simplemente responde a este email. Leo todos los mensajes personalmente.
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
              <a href={baseUrl} style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Itineramio
              </a>
              {' · '}
              <a href={`${baseUrl}/blog`} style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Blog
              </a>
              {' · '}
              <a href={`${baseUrl}/recursos`} style={{ color: '#7c3aed', textDecoration: 'none' }}>
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

export default WelcomeTestEmail
