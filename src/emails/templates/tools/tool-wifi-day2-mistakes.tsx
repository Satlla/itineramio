import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function ToolWifiDay2Mistakes({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>El detalle que más valoran tus huéspedes</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¿Sabías que el <strong>WiFi rápido y fácil de conectar</strong> es uno de los amenities más valorados por los huéspedes?
            </p>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#991b1b', fontSize: '15px', fontWeight: 600 }}>
                ❌ Error común: Contraseñas imposibles
              </p>
              <p style={{ margin: '12px 0 0 0', color: '#991b1b', fontSize: '14px' }}>
                "xK9#mP2$vL" puede ser segura, pero genera frustración. Los huéspedes pierden tiempo, te escriben pidiendo la clave, y empiezan mal.
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '15px', fontWeight: 600 }}>
                ✅ La solución:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Contraseña fácil de recordar (ej: "bienvenido2024")</li>
                <li>QR para conectar automáticamente (como el de tu tarjeta)</li>
                <li>Tarjeta visible en varios puntos de la casa</li>
              </ul>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En mi próximo email te cuento los 5 detalles que hacen que los huéspedes dejen 5 estrellas.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Alejandro
            </p>
          </td>
        </tr>

        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripción</a> · © {new Date().getFullYear()} Itineramio
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
