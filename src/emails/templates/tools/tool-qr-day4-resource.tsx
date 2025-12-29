import * as React from 'react'

interface Props {
  name: string
}

export default function ToolQrDay4Resource({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Tu guía digital del alojamiento</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Una <strong>guía digital</strong> es una página web simple con toda la información que tus huéspedes necesitan. Un solo QR que lo tiene todo.
            </p>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#0c4a6e', fontSize: '15px', fontWeight: 600 }}>
                📱 Qué incluir en tu guía:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: '14px', lineHeight: 1.8 }}>
                <li>WiFi (nombre y contraseña)</li>
                <li>Instrucciones de check-in y check-out</li>
                <li>Cómo usar electrodomésticos</li>
                <li>Normas de la casa</li>
                <li>Recomendaciones locales</li>
                <li>Contacto de emergencia</li>
                <li>Enlace para dejar reseña</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                <strong>Ventaja:</strong> Si algo cambia (horario de un restaurante, código de portero), actualizas la página y el QR sigue funcionando.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En mi próximo email te explico cómo conseguir más reseñas usando un simple QR.
            </p>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '14px', fontWeight: 600 }}>
                📚 Lectura recomendada
              </p>
              <p style={{ margin: '0 0 12px 0', color: '#0c4a6e', fontSize: '14px', lineHeight: 1.5 }}>
                <strong>Manual Digital Apartamento Turístico: Guía Completa 2026</strong><br />
                Descubre cómo los mejores anfitriones organizan toda la información de su alojamiento en un solo lugar.
              </p>
              <a href="https://www.itineramio.com/blog/manual-digital-apartamento-turistico-guia-completa?utm_source=email&utm_medium=sequence&utm_campaign=tool-qr" style={{ color: '#0369a1', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                Leer artículo →
              </a>
            </div>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Alejandro
            </p>
          </td>
        </tr>

        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              <a href="https://www.itineramio.com/unsubscribe" style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripción</a> · © {new Date().getFullYear()} Itineramio
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
