import * as React from 'react'

interface Props {
  name: string
}

export default function ToolWifiDay4Resource({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>5 detalles que generan 5 estrellas</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              He gestionado cientos de propiedades y estos son los <strong>5 pequeños detalles</strong> que más impactan en las reseñas:
            </p>

            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 2 }}>
                <li><strong>WiFi visible y fácil</strong> - Tarjeta con QR (ya lo tienes ✓)</li>
                <li><strong>Check-in sin fricciones</strong> - Instrucciones claras con fotos</li>
                <li><strong>Limpieza impecable</strong> - Especialmente baño y cocina</li>
                <li><strong>Detalles de bienvenida</strong> - Café, té, snack local</li>
                <li><strong>Comunicación rápida</strong> - Responder en menos de 1 hora</li>
              </ol>
            </div>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                <strong>💡 Dato:</strong> El 78% de las reseñas negativas mencionan problemas de limpieza o comunicación lenta. Son fáciles de evitar.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el próximo email te comparto un checklist que uso para preparar cada propiedad antes de cada check-in.
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
