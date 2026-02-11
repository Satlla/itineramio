import * as React from 'react'

interface GuestFollowupEmailProps {
  guestName: string
  propertyName: string
  guideUrl: string
  hostName: string
  language?: 'es' | 'en' | 'fr'
}

const i18n: Record<string, Record<string, string>> = {
  es: {
    subject: '¿Cómo va tu estancia en {propertyName}?',
    greeting: '¡Hola {guestName}!',
    body: '¿Cómo va tu estancia en {propertyName}? Esperamos que estés disfrutando al máximo.',
    cta: 'Recuerda que tienes acceso a tu guía digital con toda la información del alojamiento:',
    ctaButton: 'Abrir guía digital',
    recommendations: '¿Necesitas recomendaciones de restaurantes, actividades o transporte? Responde a este email y estaremos encantados de ayudarte.',
    signature: 'Un saludo,',
    footer: 'Este email fue enviado porque interactuaste con el asistente virtual de {propertyName}.',
    unsubscribe: 'Si no deseas recibir más emails, ignora este mensaje.'
  },
  en: {
    subject: 'How is your stay at {propertyName}?',
    greeting: 'Hi {guestName}!',
    body: 'How is your stay at {propertyName}? We hope you\'re enjoying it to the fullest.',
    cta: 'Remember you have access to your digital guide with all the accommodation information:',
    ctaButton: 'Open digital guide',
    recommendations: 'Need recommendations for restaurants, activities or transport? Reply to this email and we\'ll be happy to help.',
    signature: 'Best regards,',
    footer: 'This email was sent because you interacted with the virtual assistant at {propertyName}.',
    unsubscribe: 'If you don\'t want to receive more emails, just ignore this message.'
  },
  fr: {
    subject: 'Comment se passe votre séjour à {propertyName} ?',
    greeting: 'Bonjour {guestName} !',
    body: 'Comment se passe votre séjour à {propertyName} ? Nous espérons que vous en profitez au maximum.',
    cta: 'N\'oubliez pas que vous avez accès à votre guide numérique avec toutes les informations sur l\'hébergement :',
    ctaButton: 'Ouvrir le guide numérique',
    recommendations: 'Besoin de recommandations de restaurants, d\'activités ou de transport ? Répondez à cet email et nous serons ravis de vous aider.',
    signature: 'Cordialement,',
    footer: 'Cet email a été envoyé car vous avez interagi avec l\'assistant virtuel de {propertyName}.',
    unsubscribe: 'Si vous ne souhaitez plus recevoir d\'emails, ignorez simplement ce message.'
  }
}

function t(key: string, lang: string, replacements: Record<string, string> = {}): string {
  let text = i18n[lang]?.[key] || i18n.es[key] || key
  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.split(`{${placeholder}}`).join(value)
  }
  return text
}

export function getFollowupSubject(propertyName: string, language: string): string {
  return t('subject', language, { propertyName })
}

export const GuestFollowupEmail: React.FC<GuestFollowupEmailProps> = ({
  guestName,
  propertyName,
  guideUrl,
  hostName,
  language = 'es'
}) => {
  const lang = language
  const replacements = { guestName, propertyName, hostName }

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
              fontSize: '28px',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              Itineramio
            </h1>
          </div>

          {/* Main Content */}
          <div style={{ padding: '0 20px' }}>
            <h2 style={{
              color: '#111827',
              fontSize: '22px',
              marginBottom: '20px'
            }}>
              {t('greeting', lang, replacements)}
            </h2>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              {t('body', lang, replacements)}
            </p>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              {t('cta', lang, replacements)}
            </p>

            {/* CTA Button */}
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <a
                href={guideUrl}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {t('ctaButton', lang, replacements)}
              </a>
            </div>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              {t('recommendations', lang, replacements)}
            </p>

            {/* Signature */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px',
              marginTop: '20px'
            }}>
              <p style={{
                color: '#374151',
                fontSize: '15px',
                lineHeight: '1.6',
                margin: '0 0 4px 0'
              }}>
                {t('signature', lang, replacements)}
              </p>
              <p style={{
                color: '#111827',
                fontSize: '15px',
                fontWeight: '600',
                margin: '0'
              }}>
                {hostName}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              lineHeight: '1.5',
              margin: '0 0 4px 0'
            }}>
              {t('footer', lang, replacements)}
            </p>
            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              lineHeight: '1.5',
              margin: 0
            }}>
              {t('unsubscribe', lang, replacements)}
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
