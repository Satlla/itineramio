import * as React from 'react'

interface Props {
  name: string
  rulesData?: {
    propertyName?: string
    rulesCount?: number
  }
}

export default function ToolHouseRulesDay8Offer({ name, rulesData }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'
  const propertyName = rulesData?.propertyName || 'tu alojamiento'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>¿Y Si Todo Esto Fuera Automático?</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Durante esta semana te he compartido todo lo que necesitas para comunicar tus normas de forma efectiva:
            </p>

            <ul style={{ margin: '0 0 20px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Tu cartel de normas profesional</li>
              <li>Los 5 errores que debes evitar</li>
              <li>Plantilla de mensaje pre-llegada</li>
              <li>Protocolo para cuando hay incumplimientos</li>
            </ul>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Pero seamos honestos: <strong>gestionar todo esto manualmente es agotador</strong>.
            </p>

            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#7c3aed', fontSize: '16px', fontWeight: 600 }}>
                Itineramio automatiza lo que haces a mano:
              </p>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#6b21a8', fontSize: '14px', lineHeight: 1.8 }}>
                <li>Mensajes pre-llegada programados con tus normas</li>
                <li>Guías digitales personalizadas para cada propiedad</li>
                <li>Precios dinámicos que optimizan tus ingresos</li>
                <li>Check-in online para cumplir con la normativa</li>
                <li>Checklists de limpieza para tu equipo</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a
                href="https://itineramio.com/registro"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                Prueba Itineramio 15 días
              </a>
              <p style={{ margin: '12px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
                Sin tarjeta de crédito · Cancela cuando quieras
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                <strong>+500 anfitriones</strong> ya gestionan sus propiedades con Itineramio. El tiempo que ahorras lo puedes dedicar a lo que realmente importa.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¿Tienes dudas? Responde a este email y te cuento cómo Itineramio puede ayudarte con {propertyName}.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Un saludo,<br />
              <strong>Alejandro</strong>
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
