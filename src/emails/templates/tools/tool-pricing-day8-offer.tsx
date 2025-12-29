import * as React from 'react'

interface Props {
  name: string
}

export default function ToolPricingDay8Offer({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Pricing automático con Itineramio</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Durante esta semana te he compartido cómo optimizar tus precios manualmente. Pero seamos honestos: <strong>es mucho trabajo</strong>.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Por eso creé Itineramio. La plataforma que automatiza tu pricing basándose en:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Demanda real de tu zona</li>
              <li>Precios de competidores similares</li>
              <li>Eventos locales y festivos</li>
              <li>Tu histórico de reservas</li>
            </ul>

            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#6b21a8', fontSize: '15px', fontWeight: 600 }}>
                Lo que consiguen nuestros usuarios:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b21a8', fontSize: '14px', lineHeight: 1.7 }}>
                <li>+18% de ingresos de media</li>
                <li>Precios actualizados automáticamente</li>
                <li>Cero tiempo dedicado a revisar precios</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a
                href="https://www.itineramio.com/register?utm_source=email&utm_medium=sequence&utm_campaign=tool-pricing"
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
              Puedes probarlo con tu primera propiedad. Si no te convence, cancelas sin compromiso.
            </p>

            <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>
              ¿Tienes dudas? Responde a este email y te ayudo.
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
