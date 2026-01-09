import * as React from 'react'

interface Day0WelcomeProps {
  name: string
  source?: string
  email?: string
}

export default function Day0Welcome({ name, source, email }: Day0WelcomeProps) {
  const firstName = name?.split(' ')[0] || 'Hola'
  const baseUrl = 'https://www.itineramio.com'

  // Dynamic intro based on source
  const getIntroText = () => {
    if (source?.includes('time')) {
      return 'Gracias por usar la calculadora de tiempo.'
    }
    if (source?.includes('checklist') || source?.includes('cleaning')) {
      return 'Gracias por descargar tu checklist de limpieza.'
    }
    if (source?.includes('wifi')) {
      return 'Gracias por crear tu tarjeta WiFi.'
    }
    if (source?.includes('pricing')) {
      return 'Gracias por usar nuestra calculadora de precios.'
    }
    if (source?.includes('qr')) {
      return 'Gracias por generar tu codigo QR.'
    }
    if (source?.includes('rules') || source?.includes('normas')) {
      return 'Gracias por crear tus normas del alojamiento.'
    }
    if (source?.includes('reviews')) {
      return 'Gracias por descargar tu plantilla de respuestas.'
    }
    if (source?.includes('roi')) {
      return 'Gracias por usar la calculadora de rentabilidad.'
    }
    return 'Gracias por unirte a la comunidad de anfitriones.'
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <p style={{ margin: '0', color: '#717171', fontSize: '13px', letterSpacing: '0.5px' }}>ITINERAMIO</p>
          </td>
        </tr>

        {/* Content */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '40px 32px', border: '1px solid #DDDDDD' }}>
            <h1 style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '24px', fontWeight: 600, lineHeight: 1.3 }}>
              {firstName}, bienvenido
            </h1>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              {getIntroText()}
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Soy Alejandro, fundador de Itineramio. Creamos manuales digitales para anfitriones de alquiler vacacional.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>La idea es simple:</strong> en vez de responder las mismas preguntas una y otra vez (WiFi, electrodomesticos, parking...), le das a tus huespedes un enlace donde encuentran todo.
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Resultado: menos mensajes repetitivos, mejor experiencia para el huesped, y tu con mas tiempo libre.
            </p>

            <div style={{ backgroundColor: '#F7F7F7', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#222222', fontSize: '14px', fontWeight: 600 }}>
                Recursos gratuitos:
              </p>
              <p style={{ margin: '0', color: '#717171', fontSize: '14px', lineHeight: 1.6 }}>
                <a href={`${baseUrl}/hub/tools`} style={{ color: '#222222', textDecoration: 'underline' }}>Herramientas</a> ·
                <a href={`${baseUrl}/blog`} style={{ color: '#222222', textDecoration: 'underline', marginLeft: '8px' }}>Blog</a> ·
                <a href={`${baseUrl}/p/white-coast-suite-101`} style={{ color: '#222222', textDecoration: 'underline', marginLeft: '8px' }}>Ver ejemplo de manual</a>
              </p>
            </div>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              En los proximos dias te enviare algunos emails con contenido practico. Sin spam.
            </p>

            <p style={{ margin: '0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Un saludo,<br />
              <strong>Alejandro</strong><br />
              <span style={{ color: '#717171', fontSize: '14px' }}>Fundador de Itineramio</span>
            </p>

            <p style={{ margin: '24px 0 0 0', color: '#717171', fontSize: '13px', fontStyle: 'italic' }}>
              PD: Si tienes alguna pregunta, responde a este email.
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#717171', fontSize: '12px' }}>
              <a href={`${baseUrl}/api/email/unsubscribe?email=${encodeURIComponent(email || '')}`} style={{ color: '#717171', textDecoration: 'none' }}>Cancelar suscripcion</a>
              {' · '}
              <a href={baseUrl} style={{ color: '#717171', textDecoration: 'none' }}>itineramio.com</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}

export function getSubject(): string {
  return 'Bienvenido a Itineramio'
}
