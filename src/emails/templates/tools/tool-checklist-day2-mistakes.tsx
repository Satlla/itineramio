import * as React from 'react'

interface ToolChecklistDay2Props {
  name: string
}

export default function ToolChecklistDay2Mistakes({ name }: ToolChecklistDay2Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '22px', fontWeight: 600 }}>3 errores de limpieza que cuestan reseñas</h1>
          </td>
        </tr>

        {/* Content */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Después de analizar miles de reseñas de Airbnb, descubrimos los <strong>3 errores de limpieza más comunes</strong> que generan comentarios negativos:
            </p>

            {/* Error 1 */}
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '14px', fontWeight: 600 }}>
                ❌ Error #1: Olvidar los "puntos ciegos"
              </p>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px', lineHeight: 1.5 }}>
                Debajo del sofá, detrás del inodoro, las juntas de la ducha... Los huéspedes SÍ miran estos lugares.
              </p>
            </div>

            {/* Error 2 */}
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '14px', fontWeight: 600 }}>
                ❌ Error #2: No verificar antes del check-in
              </p>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px', lineHeight: 1.5 }}>
                Confiar 100% en el equipo de limpieza sin una inspección rápida. Un pelo en la almohada puede arruinar una estancia perfecta.
              </p>
            </div>

            {/* Error 3 */}
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '14px', fontWeight: 600 }}>
                ❌ Error #3: Usar productos con olor fuerte
              </p>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px', lineHeight: 1.5 }}>
                El exceso de ambientador o lejía grita "¡ESCONDEMOS ALGO!". Los huéspedes prefieren olor neutro = limpio de verdad.
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '14px', fontWeight: 600 }}>
                ✅ La solución
              </p>
              <p style={{ margin: 0, color: '#15803d', fontSize: '14px', lineHeight: 1.5 }}>
                Tu checklist ya incluye los puntos ciegos más importantes. En el próximo email te enviaré un <strong>Protocolo de Inspección Pre-huésped</strong> para verificar todo en menos de 5 minutos.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¿Cuál de estos errores has cometido alguna vez? (Yo confieso que el #2 me costó una reseña de 4 estrellas 😅)
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              — El equipo de Itineramio
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripción</a> · <a href="https://www.itineramio.com" style={{ color: '#6b7280', textDecoration: 'none' }}>itineramio.com</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}

export function getSubject(): string {
  return '3 errores de limpieza que cuestan reseñas (y cómo evitarlos)'
}
