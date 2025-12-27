import * as React from 'react'

interface Props {
  name: string
}

export default function ToolWifiDay8Offer({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Gestiona tu alquiler sin estrés</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Esta semana te he compartido consejos sobre cómo mejorar la experiencia de tus huéspedes. La tarjeta WiFi, los 5 detalles, el checklist...
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Pero, ¿y si pudieras <strong>automatizar todo esto</strong>?
            </p>

            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#6b21a8', fontSize: '15px', fontWeight: 600 }}>
                Con Itineramio puedes:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b21a8', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Checklists digitales para tu equipo de limpieza</li>
                <li>Mensajes automáticos de check-in/out</li>
                <li>Control de tareas antes de cada reserva</li>
                <li>Dashboard con todas tus propiedades</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a
                href="https://itineramio.com/register"
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
                Probar Itineramio →
              </a>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Empieza con tu primera propiedad. Si no te convence, cancelas cuando quieras.
            </p>

            <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>
              ¿Preguntas? Responde a este email.
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
