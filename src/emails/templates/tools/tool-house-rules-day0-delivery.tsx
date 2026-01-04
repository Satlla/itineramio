import * as React from 'react'

interface Props {
  name: string
  rulesData?: {
    propertyName?: string
    rulesCount?: number
  }
}

export default function ToolHouseRulesDay0Delivery({ name, rulesData }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'
  const propertyName = rulesData?.propertyName || 'tu alojamiento'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Tus Normas del Apartamento</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¡Hola {firstName}!
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Gracias por usar nuestro <strong>Generador de Normas</strong> para {propertyName}. Ya tienes tu documento listo para imprimir y enmarcar.
            </p>

            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0', color: '#7c3aed', fontSize: '14px', fontWeight: 600 }}>
                3 consejos para que tus normas funcionen:
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', lineHeight: 1.6 }}>
                <strong>1. Colócalo en un lugar visible</strong><br />
                La entrada o el salón son los mejores sitios. Un marco bonito lo hace más profesional.
              </p>

              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', lineHeight: 1.6 }}>
                <strong>2. Envíalas ANTES de la llegada</strong><br />
                Incluye un resumen de las 3-4 normas más importantes en tu mensaje de pre-llegada.
              </p>

              <p style={{ margin: '0', color: '#374151', fontSize: '15px', lineHeight: 1.6 }}>
                <strong>3. Sé consistente</strong><br />
                Las mismas normas deben aparecer en tu anuncio, mensaje pre-llegada y cartel físico.
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                <strong>Dato:</strong> Los anfitriones con normas claras y visibles tienen un 40% menos de conflictos con huéspedes.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En los próximos días te compartiré más consejos sobre cómo gestionar las normas y qué hacer cuando no se cumplen.
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
