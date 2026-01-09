import * as React from 'react'

interface ToolChecklistDay8Props {
  name: string
  email?: string
  couponsRemaining?: number
}

export default function ToolChecklistDay8Offer({ name, email, couponsRemaining = 50 }: ToolChecklistDay8Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'
  const showUrgency = couponsRemaining <= 20

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#ffffff', padding: '0' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header - Airbnb style */}
        <tr>
          <td style={{ padding: '24px 24px 0 24px' }}>
            <p style={{ margin: 0, color: '#FF385C', fontSize: '16px', fontWeight: 600, letterSpacing: '-0.2px' }}>
              Itineramio
            </p>
          </td>
        </tr>

        {/* Main Content */}
        <tr>
          <td style={{ padding: '32px 24px' }}>
            <h1 style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '26px', fontWeight: 600, lineHeight: 1.3 }}>
              {firstName}, este es mi último email
            </h1>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.6 }}>
              Durante esta semana te envié recursos para mejorar tu gestión como anfitrión: el checklist de limpieza, los errores que cuestan reseñas, el protocolo de inspección y el test de perfil.
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#484848', fontSize: '16px', lineHeight: 1.6 }}>
              Todo eso está muy bien, pero si gestionas <strong>más de una propiedad</strong>, necesitas algo más que PDFs.
            </p>

            {/* What is Itineramio */}
            <div style={{ backgroundColor: '#F7F7F7', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 16px 0', color: '#222222', fontSize: '18px', fontWeight: 600 }}>
                ¿Qué es Itineramio?
              </h2>
              <p style={{ margin: '0', color: '#484848', fontSize: '15px', lineHeight: 1.6 }}>
                Una plataforma donde creas el <strong>manual digital</strong> de tus alojamientos. Tus huéspedes acceden desde su móvil y tienen toda la información que necesitan, sin que tengas que repetir las mismas instrucciones una y otra vez.
              </p>
            </div>

            {/* Features Grid */}
            <h2 style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '18px', fontWeight: 600 }}>
              Lo que puedes hacer con Itineramio
            </h2>

            <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px' }}>
              {/* Feature 1 */}
              <tr>
                <td style={{ padding: '16px', backgroundColor: '#F7F7F7', borderRadius: '12px', marginBottom: '12px' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td style={{ width: '40px', verticalAlign: 'top' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#FF385C', borderRadius: '8px', textAlign: 'center', lineHeight: '32px', color: '#fff', fontSize: '16px' }}>
                          📱
                        </div>
                      </td>
                      <td style={{ paddingLeft: '12px' }}>
                        <p style={{ margin: '0 0 4px 0', color: '#222222', fontSize: '15px', fontWeight: 600 }}>Manual digital automático</p>
                        <p style={{ margin: 0, color: '#717171', fontSize: '14px', lineHeight: 1.5 }}>Rellenas los datos de tu propiedad y el manual se genera solo. Con enlace QR para que los huéspedes accedan al instante.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style={{ height: '12px' }}></td></tr>

              {/* Feature 2 */}
              <tr>
                <td style={{ padding: '16px', backgroundColor: '#F7F7F7', borderRadius: '12px' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td style={{ width: '40px', verticalAlign: 'top' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#FF385C', borderRadius: '8px', textAlign: 'center', lineHeight: '32px', color: '#fff', fontSize: '16px' }}>
                          🏠
                        </div>
                      </td>
                      <td style={{ paddingLeft: '12px' }}>
                        <p style={{ margin: '0 0 4px 0', color: '#222222', fontSize: '15px', fontWeight: 600 }}>Organiza por conjuntos</p>
                        <p style={{ margin: 0, color: '#717171', fontSize: '14px', lineHeight: 1.5 }}>Agrupa tus propiedades (ej: "Apartamentos Madrid", "Casas rurales"). Perfecto si gestionas varios alojamientos.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style={{ height: '12px' }}></td></tr>

              {/* Feature 3 */}
              <tr>
                <td style={{ padding: '16px', backgroundColor: '#F7F7F7', borderRadius: '12px' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td style={{ width: '40px', verticalAlign: 'top' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#FF385C', borderRadius: '8px', textAlign: 'center', lineHeight: '32px', color: '#fff', fontSize: '16px' }}>
                          📍
                        </div>
                      </td>
                      <td style={{ paddingLeft: '12px' }}>
                        <p style={{ margin: '0 0 4px 0', color: '#222222', fontSize: '15px', fontWeight: 600 }}>Zonas personalizables</p>
                        <p style={{ margin: 0, color: '#717171', fontSize: '14px', lineHeight: 1.5 }}>Crea zonas (cocina, baño, terraza...) con imágenes, vídeos y texto. Puedes enviar zonas específicas a tus huéspedes según lo que necesiten saber.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style={{ height: '12px' }}></td></tr>

              {/* Feature 4 */}
              <tr>
                <td style={{ padding: '16px', backgroundColor: '#F7F7F7', borderRadius: '12px' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td style={{ width: '40px', verticalAlign: 'top' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#FF385C', borderRadius: '8px', textAlign: 'center', lineHeight: '32px', color: '#fff', fontSize: '16px' }}>
                          🌍
                        </div>
                      </td>
                      <td style={{ paddingLeft: '12px' }}>
                        <p style={{ margin: '0 0 4px 0', color: '#222222', fontSize: '15px', fontWeight: 600 }}>Disponible en 3 idiomas</p>
                        <p style={{ margin: 0, color: '#717171', fontSize: '14px', lineHeight: 1.5 }}>Español, inglés y catalán. Tus huéspedes internacionales ven el manual en su idioma.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style={{ height: '12px' }}></td></tr>

              {/* Feature 5 */}
              <tr>
                <td style={{ padding: '16px', backgroundColor: '#F7F7F7', borderRadius: '12px' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td style={{ width: '40px', verticalAlign: 'top' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#FF385C', borderRadius: '8px', textAlign: 'center', lineHeight: '32px', color: '#fff', fontSize: '16px' }}>
                          💬
                        </div>
                      </td>
                      <td style={{ paddingLeft: '12px' }}>
                        <p style={{ margin: '0 0 4px 0', color: '#222222', fontSize: '15px', fontWeight: 600 }}>WhatsApp integrado</p>
                        <p style={{ margin: 0, color: '#717171', fontSize: '14px', lineHeight: 1.5 }}>Enlace directo a tu WhatsApp o al de tu coanfitrión. Los huéspedes te contactan con un toque.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            {/* Free Trial + Discount with scarcity */}
            <div style={{ border: '2px solid #FF385C', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
              {/* Scarcity badge */}
              <div style={{
                backgroundColor: showUrgency ? '#FEE2E2' : '#FEF3C7',
                color: showUrgency ? '#DC2626' : '#D97706',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'inline-block',
                marginBottom: '16px',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {showUrgency ? '⚡ ' : '🎟️ '}
                Quedan {couponsRemaining} de 50 códigos disponibles
              </div>

              <h3 style={{ margin: '0 0 12px 0', color: '#222222', fontSize: '22px', fontWeight: 600 }}>
                15 días gratis + 20% de descuento
              </h3>

              <p style={{ margin: '0 0 16px 0', color: '#484848', fontSize: '15px', lineHeight: 1.5 }}>
                Prueba Itineramio 15 días sin compromiso.<br />
                Si te convence, usa el código para obtener un 20% de descuento en tu primer pago.
              </p>

              {/* Coupon code box */}
              <div style={{
                backgroundColor: '#F7F7F7',
                border: '2px dashed #FF385C',
                borderRadius: '8px',
                padding: '12px 24px',
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0 0 4px 0', color: '#717171', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tu código de descuento
                </p>
                <p style={{ margin: 0, color: '#FF385C', fontSize: '24px', fontWeight: 700, letterSpacing: '2px' }}>
                  BIENVENIDO20
                </p>
              </div>

              <br />

              <a
                href="https://www.itineramio.com/register?utm_source=email&utm_medium=sequence&utm_campaign=tool-checklist-day8"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#FF385C',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
              >
                Empezar prueba gratuita
              </a>

              <p style={{ margin: '16px 0 0 0', color: '#717171', fontSize: '13px', lineHeight: 1.5 }}>
                El código se introduce en el paso de pago de Stripe,<br />
                cuando selecciones tu plan después del período de prueba.
              </p>
            </div>

            {/* Closing */}
            <p style={{ margin: '0 0 20px 0', color: '#717171', fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic' }}>
              Este es el último email de esta secuencia. Si no es el momento, no pasa nada — seguirás teniendo acceso a todas las herramientas gratuitas del hub.
            </p>

            <p style={{ margin: '0 0 8px 0', color: '#484848', fontSize: '16px', lineHeight: 1.6 }}>
              ¿Alguna duda? Responde a este email.
            </p>

            <p style={{ margin: '0', color: '#222222', fontSize: '16px', fontWeight: 500 }}>
              — El equipo de Itineramio
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: '24px', borderTop: '1px solid #EBEBEB' }}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tr>
                <td>
                  <p style={{ margin: '0 0 8px 0', color: '#717171', fontSize: '12px' }}>
                    Itineramio · Manuales digitales para anfitriones
                  </p>
                  <p style={{ margin: 0, color: '#717171', fontSize: '12px' }}>
                    <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#717171', textDecoration: 'underline' }}>Cancelar suscripción</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  )
}

export function getSubject(couponsRemaining?: number): string {
  if (couponsRemaining && couponsRemaining <= 10) {
    return `⚡ Solo quedan ${couponsRemaining} códigos - 20% descuento`
  }
  if (couponsRemaining && couponsRemaining <= 20) {
    return `Quedan ${couponsRemaining} códigos - 15 días gratis + 20% dto`
  }
  return '15 días gratis + código descuento 20% (limitado)'
}
