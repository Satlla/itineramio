import * as React from 'react'

interface Props {
  name: string
}

export default function ToolPricingDay4Resource({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Calendario de temporadas</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Como te prometí, aquí tienes el <strong>calendario de temporadas</strong> para ajustar tus precios:
            </p>

            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', fontWeight: 600 }}>
                📅 Temporada ALTA (+20-40%):
              </p>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Semana Santa</li>
                <li>Julio y Agosto</li>
                <li>Puentes y festivos nacionales</li>
                <li>Navidad y Fin de Año</li>
              </ul>

              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', fontWeight: 600 }}>
                📆 Temporada MEDIA (precio base):
              </p>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Mayo, Junio, Septiembre</li>
                <li>Fines de semana normales</li>
              </ul>

              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', fontWeight: 600 }}>
                🗓️ Temporada BAJA (-15-25%):
              </p>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Enero (post-Reyes), Febrero</li>
                <li>Noviembre (excepto puentes)</li>
                <li>Entre semana fuera de temporada</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                <strong>💡 Tip:</strong> Revisa eventos locales (ferias, conciertos, deportes) y ajusta. Un partido de Champions o un festival pueden multiplicar la demanda x3.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el próximo email te explico cómo saber si tus precios están bien... sin adivinar.
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
