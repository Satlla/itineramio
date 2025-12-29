import * as React from 'react'

interface Props {
  name: string
}

export default function ToolRoiDay6Test({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>3 palancas para mejorar tu ROI</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Solo hay <strong>3 formas</strong> de mejorar tu rentabilidad:
            </p>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#0c4a6e', fontSize: '15px', fontWeight: 600 }}>
                1️⃣ Subir ingresos
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Pricing dinámico (más en alta, menos en baja)</li>
                <li>Mejorar fotos y descripción</li>
                <li>Conseguir más reseñas positivas</li>
                <li>Ofrecer servicios extra (late check-out, parking)</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '15px', fontWeight: 600 }}>
                2️⃣ Reducir gastos
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Negociar tarifas de limpieza</li>
                <li>Comprar amenities al por mayor</li>
                <li>Mantenimiento preventivo (evita averías)</li>
                <li>Automatizar comunicación</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b21a8', fontSize: '15px', fontWeight: 600 }}>
                3️⃣ Aumentar ocupación
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b21a8', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Publicar en múltiples plataformas</li>
                <li>Aceptar estancias cortas en fechas difíciles</li>
                <li>Responder rápido a consultas</li>
                <li>Ajustar mínimo de noches según temporada</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                <strong>✅ Ejercicio:</strong> Elige UNA palanca y una acción concreta. Impleméntala esta semana.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Mañana te cuento cómo automatizar estas mejoras.
            </p>

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
