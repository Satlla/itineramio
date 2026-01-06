import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function ToolQrDay6Test({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>¿Qué tipo de anfitrión eres?</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Después de ayudar a cientos de anfitriones, hemos identificado <strong>8 perfiles operativos</strong> diferentes. Cada uno tiene fortalezas únicas y puntos ciegos específicos.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Conocer tu perfil te ayuda a entender por qué ciertas cosas te cuestan más que a otros (y viceversa).
            </p>

            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', fontWeight: 600 }}>
                🎯 Algunos perfiles:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: 1.8 }}>
                <li><strong>Estratega</strong> — Orientado a datos y optimización</li>
                <li><strong>Sistemático</strong> — Procesos y automatización</li>
                <li><strong>Diferenciador</strong> — Experiencias únicas</li>
                <li><strong>Ejecutor</strong> — Acción rápida y directa</li>
              </ul>
            </div>

            {/* CTA Box */}
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' as const }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '32px' }}>🧪</p>
              <p style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '18px', fontWeight: 600 }}>
                Test de Perfil de Anfitrión
              </p>
              <p style={{ margin: '0 0 16px 0', color: '#15803d', fontSize: '14px' }}>
                90 segundos · 100% gratuito · Resultado inmediato
              </p>
              <a
                href="https://www.itineramio.com/host-profile/test"
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
                Hacer el Test Gratis →
              </a>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
              <em>Al completar el test recibirás tu perfil detallado, fortalezas, áreas de mejora y una guía personalizada.</em>
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              — El equipo de Itineramio
            </p>
          </td>
        </tr>

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
