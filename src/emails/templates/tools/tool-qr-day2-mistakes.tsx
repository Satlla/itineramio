import * as React from 'react'

interface Props {
  name: string
}

export default function ToolQrDay2Mistakes({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>7 usos de QR que no conocías</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Los códigos QR no son solo para WiFi. Aquí tienes <strong>7 ideas</strong> que usan los mejores anfitriones:
            </p>

            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 2 }}>
                <li><strong>WiFi</strong> - Conexión automática sin escribir clave</li>
                <li><strong>Manual digital</strong> - Instrucciones de electrodomésticos</li>
                <li><strong>Guía local</strong> - Restaurantes, playas, actividades</li>
                <li><strong>Contacto directo</strong> - WhatsApp del anfitrión</li>
                <li><strong>Reseñas</strong> - Link directo a dejar valoración</li>
                <li><strong>Check-out</strong> - Instrucciones de salida</li>
                <li><strong>Emergencias</strong> - Números útiles de la zona</li>
              </ol>
            </div>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                <strong>💡 Pro tip:</strong> Crea un QR que lleve a una página con toda la información. Es más fácil de actualizar que múltiples QRs.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el próximo email te enseño cómo crear tu "guía digital" del alojamiento.
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
