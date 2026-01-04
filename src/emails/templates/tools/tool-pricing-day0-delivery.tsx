import * as React from 'react'

interface PricingData {
  propertyType?: string
  location?: string
  season?: string
  bedrooms?: number
  bathrooms?: number
  guests?: number
  recommendedPrice?: number
  minPrice?: number
  maxPrice?: number
}

interface Props {
  name: string
  pricingData?: PricingData
}

export default function ToolPricingDay0Delivery({ name, pricingData }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'
  const hasData = pricingData && pricingData.recommendedPrice

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Tu Análisis de Precios</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¡Hola {firstName}! 👋
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Gracias por usar nuestra <strong>Calculadora de Precios</strong>. Aquí tienes tu análisis personalizado:
            </p>

            {/* Pricing Results Table */}
            {hasData && (
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px', borderCollapse: 'collapse' }}>
                {/* Header - Main Price */}
                <tr>
                  <td colSpan={2} style={{ backgroundColor: '#3b82f6', borderRadius: '8px 8px 0 0', padding: '20px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px 0', color: '#ffffff', fontSize: '14px', opacity: 0.9 }}>Precio Recomendado</p>
                    <p style={{ margin: 0, color: '#ffffff', fontSize: '36px', fontWeight: 'bold' }}>
                      €{pricingData.recommendedPrice}<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/noche</span>
                    </p>
                  </td>
                </tr>

                {/* Property Details */}
                <tr>
                  <td colSpan={2} style={{ backgroundColor: '#f8fafc', padding: '16px', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                    <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tu Propiedad</p>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td style={{ padding: '4px 0', color: '#374151', fontSize: '14px' }}>Tipo:</td>
                        <td style={{ padding: '4px 0', color: '#1e293b', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>{pricingData.propertyType || 'Apartamento'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 0', color: '#374151', fontSize: '14px' }}>Ubicación:</td>
                        <td style={{ padding: '4px 0', color: '#1e293b', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>{pricingData.location || 'Centro ciudad'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 0', color: '#374151', fontSize: '14px' }}>Temporada:</td>
                        <td style={{ padding: '4px 0', color: '#1e293b', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>{pricingData.season || 'Media'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 0', color: '#374151', fontSize: '14px' }}>Capacidad:</td>
                        <td style={{ padding: '4px 0', color: '#1e293b', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>{pricingData.guests || 2} huéspedes · {pricingData.bedrooms || 1} hab · {pricingData.bathrooms || 1} baño</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Price Range */}
                <tr>
                  <td style={{ backgroundColor: '#ffffff', padding: '16px', borderLeft: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px' }}>Precio Mínimo</p>
                    <p style={{ margin: 0, color: '#059669', fontSize: '20px', fontWeight: 'bold' }}>€{pricingData.minPrice}</p>
                  </td>
                  <td style={{ backgroundColor: '#ffffff', padding: '16px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px' }}>Precio Máximo</p>
                    <p style={{ margin: 0, color: '#dc2626', fontSize: '20px', fontWeight: 'bold' }}>€{pricingData.maxPrice}</p>
                  </td>
                </tr>

                {/* Monthly Projections */}
                <tr>
                  <td colSpan={2} style={{ backgroundColor: '#f0fdf4', borderRadius: '0 0 8px 8px', padding: '16px', border: '1px solid #86efac' }}>
                    <p style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Proyección Mensual</p>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td style={{ padding: '4px 0', color: '#166534', fontSize: '14px' }}>Ocupación 50% (15 noches):</td>
                        <td style={{ padding: '4px 0', color: '#166534', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>€{(pricingData.recommendedPrice || 0) * 15}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 0', color: '#166534', fontSize: '14px' }}>Ocupación 70% (21 noches):</td>
                        <td style={{ padding: '4px 0', color: '#166534', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>€{(pricingData.recommendedPrice || 0) * 21}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 0', color: '#166534', fontSize: '14px', fontWeight: 600 }}>Ocupación 90% (27 noches):</td>
                        <td style={{ padding: '4px 0', color: '#166534', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>€{(pricingData.recommendedPrice || 0) * 27}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            )}

            {!hasData && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                  <strong>Tu análisis está guardado.</strong> Puedes volver a consultarlo cuando quieras en nuestra calculadora.
                </p>
              </div>
            )}

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                <strong>💡 Tip PRO:</strong> Los anfitriones que ajustan sus precios mensualmente ganan un 23% más que los que los dejan fijos.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En los próximos días te enviaré consejos prácticos sobre pricing que he aprendido gestionando propiedades.
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
