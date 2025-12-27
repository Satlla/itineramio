import * as React from 'react'

interface ToolChecklistDay8Props {
  name: string
}

export default function ToolChecklistDay8Offer({ name }: ToolChecklistDay8Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '22px', fontWeight: 600 }}>Automatiza la gestión de tu limpieza</h1>
          </td>
        </tr>

        {/* Content */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              A lo largo de esta semana te he enviado herramientas para mejorar tus operaciones de limpieza: el checklist, los errores comunes, el protocolo de inspección...
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Pero si gestionas <strong>más de una propiedad</strong>, sabes que coordinar todo manualmente se vuelve caótico rápidamente.
            </p>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px', lineHeight: 1.5 }}>
                <strong>¿Te suena familiar?</strong><br />
                "¿Cuándo era el último check-out?"<br />
                "¿Ya limpiaron la otra propiedad?"<br />
                "¿Quién tiene las llaves hoy?"
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Itineramio te ayuda a:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li><strong>Coordinar turnos de limpieza</strong> automáticamente según reservas</li>
              <li><strong>Asignar tareas al equipo</strong> con notificaciones</li>
              <li><strong>Verificar completado</strong> con fotos y checklist digital</li>
              <li><strong>Historial completo</strong> por propiedad</li>
            </ul>

            {/* CTA Box */}
            <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>
                Prueba Itineramio 15 días gratis
              </p>
              <p style={{ margin: '0 0 16px 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                Sin tarjeta de crédito · Cancela cuando quieras
              </p>
              <a
                href="https://www.itineramio.com/pricing?utm_source=email&utm_medium=sequence&utm_campaign=tool_checklist"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ffffff',
                  color: '#7c3aed',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                Empezar Prueba Gratuita
              </a>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
              <em>Y si decides que no es para ti, no pasa nada — seguirás teniendo acceso a todas las herramientas gratuitas que te he enviado.</em>
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¿Tienes alguna pregunta? Responde a este email y te ayudo personalmente.
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
  return 'Automatiza la gestión de tu limpieza'
}
