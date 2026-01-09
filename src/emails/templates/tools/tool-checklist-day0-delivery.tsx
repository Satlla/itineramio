import * as React from 'react'

interface ToolChecklistDay0Props {
  name: string
  propertyName?: string
  propertyAddress?: string
}

export default function ToolChecklistDay0Delivery({ name, propertyName, propertyAddress }: ToolChecklistDay0Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Tu Checklist de Limpieza está listo</h1>
          </td>
        </tr>

        {/* Content */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¡Hola {firstName}! 👋
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Gracias por descargar tu <strong>Checklist de Limpieza Profesional</strong>
              {propertyName && ` para ${propertyName}`}.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Este checklist te ayudará a:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Estandarizar la limpieza entre turnos</li>
              <li>Reducir olvidos y errores</li>
              <li>Mejorar la consistencia de tus reseñas</li>
              <li>Dar instrucciones claras a tu equipo de limpieza</li>
            </ul>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', lineHeight: 1.5 }}>
                <strong>💡 Tip:</strong> Imprime el checklist y plastifícalo. Deja una copia en el alojamiento para que tu equipo lo tenga siempre a mano.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Mañana te envío un email corto con los <strong>3 puntos que más se olvidan</strong> en la limpieza (y que generan reseñas negativas).
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¡Que tengas un excelente día!
            </p>

            <p style={{ margin: '20px 0 0 0', color: '#374151', fontSize: '16px' }}>
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
  return '✅ Tu Checklist de Limpieza está listo'
}
