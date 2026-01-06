import * as React from 'react'

interface Props {
  name: string
  email: string
  rulesData?: {
    propertyName?: string
    rulesCount?: number
  }
}

export default function ToolHouseRulesDay6Violations({ name, email, rulesData }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Huésped Incumple Normas: Qué Hacer</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Tienes las normas claras, el huésped las vio... y aún así las incumplió. ¿Qué haces ahora?
            </p>

            <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Aquí tienes el <strong>protocolo de 3 pasos</strong> que uso yo:
            </p>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px', fontWeight: 600 }}>
                  Paso 1: Recordatorio amable (primeras horas)
                </p>
                <p style={{ margin: '0', color: '#78350f', fontSize: '14px', lineHeight: 1.6 }}>
                  "Hola María, espero que estéis disfrutando. Solo un recordatorio: a partir de las 22h os agradecería que mantengáis el volumen bajo por los vecinos. ¡Gracias!"
                </p>
              </div>

              <div style={{ backgroundColor: '#fed7aa', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 8px 0', color: '#9a3412', fontSize: '14px', fontWeight: 600 }}>
                  Paso 2: Advertencia formal (si continúa)
                </p>
                <p style={{ margin: '0', color: '#7c2d12', fontSize: '14px', lineHeight: 1.6 }}>
                  "Hola María, he recibido quejas de los vecinos por ruido. Como vimos en las normas, el incumplimiento reiterado puede resultar en cancelación de la reserva. Confío en que no habrá más problemas."
                </p>
              </div>

              <div style={{ backgroundColor: '#fecaca', borderRadius: '8px', padding: '16px' }}>
                <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px', fontWeight: 600 }}>
                  Paso 3: Contacto con Airbnb (último recurso)
                </p>
                <p style={{ margin: '0', color: '#991b1b', fontSize: '14px', lineHeight: 1.6 }}>
                  Documenta todo (mensajes, fotos si aplica) y contacta con soporte. Si las normas estaban claras en tu anuncio, Airbnb suele apoyar al anfitrión.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '14px', fontWeight: 600 }}>
                Prevención {">"} Reacción
              </p>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px', lineHeight: 1.6 }}>
                El 80% de los incumplimientos se evitan con:<br />
                • Normas visibles en el anuncio<br />
                • Mensaje de pre-llegada con recordatorio<br />
                • Cartel físico en el apartamento
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>Recuerda:</strong> La mayoría de huéspedes son respetuosos. Estas situaciones son la excepción, no la norma.
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
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripción</a> · © {new Date().getFullYear()} Itineramio
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
