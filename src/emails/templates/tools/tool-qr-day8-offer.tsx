import * as React from 'react'

interface Props {
  name: string
}

export default function ToolQrDay8Offer({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Tu guía digital, automatizada</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Esta semana hemos visto cómo usar QRs para WiFi, guías y reseñas. Pero crear y mantener todo esto lleva tiempo.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Con <strong>Itineramio</strong>, cada propiedad tiene su guía digital automática:
            </p>

            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b21a8', fontSize: '14px', lineHeight: 1.8 }}>
                <li>Página personalizada con tu branding</li>
                <li>QR generado automáticamente</li>
                <li>Información de WiFi, check-in, normas</li>
                <li>Recomendaciones locales editables</li>
                <li>Link directo a reseñas</li>
                <li>Actualizable en segundos desde el móvil</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a
                href="https://itineramio.com/register"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                Crear mi guía digital →
              </a>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Configura tu primera propiedad en 5 minutos. Si no te convence, cancelas sin compromiso.
            </p>

            <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>
              ¿Dudas? Responde a este email.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Alejandro
            </p>
          </td>
        </tr>

        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              © {new Date().getFullYear()} Itineramio
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
