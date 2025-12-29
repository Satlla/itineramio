import * as React from 'react'

interface Props {
  name: string
  rulesData?: {
    propertyName?: string
    rulesCount?: number
  }
}

export default function ToolHouseRulesDay2Mistakes({ name, rulesData }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>5 Errores que Anulan tus Normas</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Ayer te envié tu cartel de normas. Hoy quiero contarte los <strong>5 errores más comunes</strong> que hacen que los huéspedes ignoren las normas por completo.
            </p>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0', color: '#dc2626', fontSize: '14px', fontWeight: 600 }}>
                Evita estos errores a toda costa:
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '15px', lineHeight: 1.7 }}>
                <strong style={{ color: '#dc2626' }}>1. Demasiadas normas</strong><br />
                Más de 8-10 normas = nadie las lee. Prioriza las esenciales.
              </p>

              <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '15px', lineHeight: 1.7 }}>
                <strong style={{ color: '#dc2626' }}>2. Tono amenazante</strong><br />
                "Está PROHIBIDO..." genera rechazo. Mejor: "Para tu comodidad y la de los vecinos..."
              </p>

              <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '15px', lineHeight: 1.7 }}>
                <strong style={{ color: '#dc2626' }}>3. Normas ocultas</strong><br />
                Si solo están en el anuncio de Airbnb, el 90% no las verá. Deben estar visibles en el apartamento.
              </p>

              <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '15px', lineHeight: 1.7 }}>
                <strong style={{ color: '#dc2626' }}>4. Sin consecuencias claras</strong><br />
                "No se permite fumar" vs "No se permite fumar. Cargo de limpieza profunda: 200€"
              </p>

              <p style={{ margin: '0', color: '#374151', fontSize: '15px', lineHeight: 1.7 }}>
                <strong style={{ color: '#dc2626' }}>5. Inconsistencia</strong><br />
                Si el anuncio dice una cosa y el cartel otra, pierdes credibilidad.
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                <strong>Consejo PRO:</strong> Lee tus normas en voz alta. Si suenan como un padre enfadado, reescríbelas.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el próximo email te daré una <strong>plantilla de mensaje pre-llegada</strong> que incluye las normas de forma natural.
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
              <a href="https://www.itineramio.com/unsubscribe" style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripción</a> · © {new Date().getFullYear()} Itineramio
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
