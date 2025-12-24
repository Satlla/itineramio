import * as React from 'react'

interface ToolChecklistDay6Props {
  name: string
}

export default function ToolChecklistDay6Test({ name }: ToolChecklistDay6Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '22px', fontWeight: 600 }}>¿Qué tipo de anfitrión eres?</h1>
          </td>
        </tr>

        {/* Content */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hemos desarrollado un test que ha ayudado a <strong>+2,000 anfitriones</strong> a descubrir sus fortalezas y áreas de mejora.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              El test identifica 8 perfiles de anfitrión:
            </p>

            <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px' }}>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '16px' }}>🎯</span>
                  <span style={{ marginLeft: '8px', color: '#374151', fontSize: '14px' }}><strong>Estratega</strong> — Orientado a datos y KPIs</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '16px' }}>⚙️</span>
                  <span style={{ marginLeft: '8px', color: '#374151', fontSize: '14px' }}><strong>Sistemático</strong> — Procesos y automatización</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '16px' }}>✨</span>
                  <span style={{ marginLeft: '8px', color: '#374151', fontSize: '14px' }}><strong>Diferenciador</strong> — Experiencias únicas</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '16px' }}>⚡</span>
                  <span style={{ marginLeft: '8px', color: '#374151', fontSize: '14px' }}><strong>Ejecutor</strong> — Acción rápida</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>...y 4 perfiles más</span>
                </td>
              </tr>
            </table>

            {/* CTA Box */}
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '32px' }}>🧪</p>
              <p style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '18px', fontWeight: 600 }}>
                Test de Perfil de Anfitrión
              </p>
              <p style={{ margin: '0 0 16px 0', color: '#15803d', fontSize: '14px' }}>
                90 segundos · 100% gratuito · Resultado inmediato
              </p>
              <a
                href="https://www.itineramio.com/test"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                Hacer el Test Gratis
              </a>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Al completar el test, recibirás:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Tu perfil dominante y secundario</li>
              <li>Tus fortalezas principales</li>
              <li>Áreas de mejora específicas</li>
              <li>Una guía personalizada según tu perfil</li>
            </ul>

            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
              <em>Por cierto, por cómo usas el checklist de limpieza, me atrevo a apostar que tienes algo de "Sistemático" en ti 😉</em>
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
  return '¿Qué tipo de anfitrión eres? (90 segundos)'
}
