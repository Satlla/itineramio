import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function ToolRoiDay8Offer({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Maximiza tu rentabilidad con datos</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Esta semana hemos visto cómo calcular tu ROI real, los gastos ocultos, y las palancas para mejorar. Pero hay un problema:
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>Sin datos actualizados, estás tomando decisiones a ciegas.</strong>
            </p>

            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#6b21a8', fontSize: '15px', fontWeight: 600 }}>
                Con Itineramio tienes:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b21a8', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Dashboard de ingresos y gastos en tiempo real</li>
                <li>ROI calculado automáticamente</li>
                <li>Comparativa con tu mercado local</li>
                <li>Alertas cuando tu ocupación baja</li>
                <li>Recomendaciones de precio basadas en datos</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a
                href="https://www.itineramio.com/register?utm_source=email&utm_medium=sequence&utm_campaign=tool-roi"
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
                Ver mi dashboard →
              </a>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Conecta tu propiedad en 5 minutos y empieza a tomar decisiones con datos reales.
            </p>

            <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>
              ¿Tienes preguntas? Responde a este email.
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
