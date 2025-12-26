import * as React from 'react'

interface Props {
  name: string
  rulesData?: {
    propertyName?: string
    rulesCount?: number
  }
}

export default function ToolHouseRulesDay4Prearrivals({ name, rulesData }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'
  const propertyName = rulesData?.propertyName || 'tu alojamiento'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Plantilla: Mensaje Pre-Llegada</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Te prometí una plantilla para incluir las normas en tu mensaje de pre-llegada. Aquí la tienes, <strong>lista para copiar y personalizar</strong>:
            </p>

            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Plantilla de mensaje
              </p>
              <div style={{ borderLeft: '3px solid #7c3aed', paddingLeft: '16px', marginTop: '12px' }}>
                <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic' }}>
                  ¡Hola [NOMBRE]!
                </p>
                <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic' }}>
                  Todo listo para tu llegada mañana. Aquí tienes la información importante:
                </p>
                <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic' }}>
                  <strong>Check-in:</strong> A partir de las 15:00<br />
                  <strong>Código de acceso:</strong> [CÓDIGO]<br />
                  <strong>WiFi:</strong> [NOMBRE_RED] / [CONTRASEÑA]
                </p>
                <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic' }}>
                  <strong>3 cosas a tener en cuenta:</strong><br />
                  • Silencio a partir de las 22:00 (vecinos muy majos pero ligeros de sueño)<br />
                  • No fumar dentro del apartamento<br />
                  • Basura en los contenedores de la esquina
                </p>
                <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic' }}>
                  ¿Alguna pregunta? Escríbeme cuando quieras.
                </p>
                <p style={{ margin: '0', color: '#374151', fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic' }}>
                  ¡Buen viaje!
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#7c3aed', fontSize: '14px', fontWeight: 600 }}>
                Por qué funciona esta plantilla:
              </p>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#6b21a8', fontSize: '14px', lineHeight: 1.6 }}>
                <li>Tono amigable, no autoritario</li>
                <li>Solo 3 normas clave (no abruma)</li>
                <li>Explica el "por qué" de cada norma</li>
                <li>Invita a preguntar (genera confianza)</li>
              </ul>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              El próximo email: <strong>qué hacer cuando un huésped incumple una norma</strong> (y cómo evitar conflictos).
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
