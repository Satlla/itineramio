import * as React from 'react'

interface GuidebookDeliveryEmailProps {
  guestName: string
  propertyName: string
  guideUrl: string
  hostName: string
  language?: 'es' | 'en' | 'fr'
}

const i18n: Record<string, Record<string, string>> = {
  es: {
    subject: 'Tu guía digital para {propertyName}',
    greeting: '¡Hola {guestName}!',
    body: 'Te damos la bienvenida a {propertyName}. Hemos preparado una guía digital con toda la información que necesitas para tu estancia.',
    ctaIntro: 'Accede a tu guía digital con instrucciones de llegada, WiFi, recomendaciones locales y mucho más:',
    ctaButton: 'Abrir mi guía digital',
    info: 'Puedes acceder a la guía en cualquier momento desde tu móvil. No necesitas descargar ninguna app.',
    signature: 'Un saludo,',
    footer: 'Este email fue enviado automáticamente por {propertyName} a través de Itineramio.',
    unsubscribe: 'Si no has reservado este alojamiento, puedes ignorar este mensaje.',
  },
  en: {
    subject: 'Your digital guide for {propertyName}',
    greeting: 'Hi {guestName}!',
    body: 'Welcome to {propertyName}. We\'ve prepared a digital guide with everything you need for your stay.',
    ctaIntro: 'Access your digital guide with arrival instructions, WiFi, local recommendations and more:',
    ctaButton: 'Open my digital guide',
    info: 'You can access the guide anytime from your phone. No app download needed.',
    signature: 'Best regards,',
    footer: 'This email was sent automatically by {propertyName} via Itineramio.',
    unsubscribe: 'If you didn\'t book this accommodation, you can ignore this message.',
  },
  fr: {
    subject: 'Votre guide numérique pour {propertyName}',
    greeting: 'Bonjour {guestName} !',
    body: 'Bienvenue à {propertyName}. Nous avons préparé un guide numérique avec toutes les informations nécessaires pour votre séjour.',
    ctaIntro: 'Accédez à votre guide numérique avec les instructions d\'arrivée, le WiFi, les recommandations locales et plus encore :',
    ctaButton: 'Ouvrir mon guide numérique',
    info: 'Vous pouvez accéder au guide à tout moment depuis votre téléphone. Aucune application à télécharger.',
    signature: 'Cordialement,',
    footer: 'Cet email a été envoyé automatiquement par {propertyName} via Itineramio.',
    unsubscribe: 'Si vous n\'avez pas réservé cet hébergement, vous pouvez ignorer ce message.',
  },
}

function t(key: string, lang: string, replacements: Record<string, string> = {}): string {
  let text = i18n[lang]?.[key] || i18n.es[key] || key
  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.split(`{${placeholder}}`).join(value)
  }
  return text
}

export function getDeliverySubject(propertyName: string, language: string): string {
  return t('subject', language, { propertyName })
}

export const GuidebookDeliveryEmail: React.FC<GuidebookDeliveryEmailProps> = ({
  guestName,
  propertyName,
  guideUrl,
  hostName,
  language = 'es',
}) => {
  const lang = language
  const replacements = { guestName, propertyName, hostName }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1
              style={{
                color: '#7c3aed',
                fontSize: '28px',
                marginBottom: '10px',
                fontWeight: 'bold',
              }}
            >
              Itineramio
            </h1>
          </div>

          {/* Main Content */}
          <div style={{ padding: '0 20px' }}>
            <h2
              style={{
                color: '#111827',
                fontSize: '22px',
                marginBottom: '20px',
              }}
            >
              {t('greeting', lang, replacements)}
            </h2>

            <p
              style={{
                color: '#374151',
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              {t('body', lang, replacements)}
            </p>

            <p
              style={{
                color: '#374151',
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '20px',
              }}
            >
              {t('ctaIntro', lang, replacements)}
            </p>

            {/* CTA Button */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
                  fontWeight: '600',
                }}
              >
                {t('ctaButton', lang, replacements)}
              </a>
            </div>

            <p
              style={{
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              {t('info', lang, replacements)}
            </p>

            {/* Signature */}
            <div
              style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px',
                marginTop: '20px',
              }}
            >
              <p
                style={{
                  color: '#374151',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: '0 0 4px 0',
                }}
              >
                {t('signature', lang, replacements)}
              </p>
              <p
                style={{
                  color: '#111827',
                  fontSize: '15px',
                  fontWeight: '600',
                  margin: '0',
                }}
              >
                {hostName}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                lineHeight: '1.5',
                margin: '0 0 4px 0',
              }}
            >
              {t('footer', lang, replacements)}
            </p>
            <p
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              {t('unsubscribe', lang, replacements)}
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
