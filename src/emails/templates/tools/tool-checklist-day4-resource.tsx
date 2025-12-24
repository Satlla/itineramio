import * as React from 'react'

interface ToolChecklistDay4Props {
  name: string
}

export default function ToolChecklistDay4Resource({ name }: ToolChecklistDay4Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '22px', fontWeight: 600 }}>Protocolo de Inspección Pre-huésped</h1>
          </td>
        </tr>

        {/* Content */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Como prometí, aquí tienes tu <strong>Protocolo de Inspección Pre-huésped</strong> — la última línea de defensa contra reseñas negativas.
            </p>

            {/* Resource Box */}
            <div style={{ backgroundColor: '#faf5ff', border: '2px solid #e9d5ff', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '32px' }}>📋</p>
              <p style={{ margin: '0 0 8px 0', color: '#7c3aed', fontSize: '18px', fontWeight: 600 }}>
                Protocolo de Inspección
              </p>
              <p style={{ margin: '0 0 16px 0', color: '#6b21a8', fontSize: '14px' }}>
                Checklist de 5 minutos · 12 puntos críticos
              </p>
              <a
                href="https://www.itineramio.com/recursos/protocolo-inspeccion"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Descargar Protocolo
              </a>
            </div>

            <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              El protocolo incluye:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li><strong>12 puntos críticos</strong> a revisar en 5 minutos</li>
              <li><strong>Orden optimizado</strong> para recorrer el alojamiento</li>
              <li><strong>Fotos de referencia</strong> para cada punto</li>
              <li><strong>Espacio para notas</strong> y reportar incidencias</li>
            </ul>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px', lineHeight: 1.5 }}>
                <strong>💡 Pro tip:</strong> Guarda el protocolo en tu móvil y hazlo parte de tu rutina. 5 minutos antes de cada check-in pueden salvarte una reseña de 5 estrellas.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el próximo email te contaré sobre un test rápido que hacemos para ayudar a los anfitriones a descubrir sus fortalezas y áreas de mejora. Es gratuito y toma solo 90 segundos.
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
              <a href="https://www.itineramio.com" style={{ color: '#6b7280', textDecoration: 'none' }}>itineramio.com</a> · Herramientas para anfitriones profesionales
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}

export function getSubject(): string {
  return '🎁 Protocolo de Inspección Pre-huésped (plantilla)'
}
