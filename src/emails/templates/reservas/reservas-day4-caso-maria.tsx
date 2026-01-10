import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function ReservasDay4CasoMaria({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>De 3.8 a Superhost en 90 dias</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hoy quiero contarte una historia real.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Maria tiene 2 apartamentos en Valencia. Llevaba 18 meses estancada en 3.8 estrellas.
            </p>

            <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Sus resenas decian cosas como:
            </p>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px', fontStyle: 'italic' }}>
                "Bien, pero costo encontrar el parking"
              </p>
              <p style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px', fontStyle: 'italic' }}>
                "Bonito piso, pero el check-in fue confuso"
              </p>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px', fontStyle: 'italic' }}>
                "Todo correcto, aunque tardaron en responder"
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Nada grave. Pero nada memorable tampoco.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>Su problema no era el apartamento. Era la comunicacion.</strong>
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Los huespedes llegaban con dudas. Maria respondia rapido, pero siempre estaba apagando fuegos.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Que cambio? <strong>3 cosas:</strong>
            </p>

            {/* Change 1 */}
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '14px', fontWeight: 600 }}>
                1. CREO UN MANUAL DIGITAL POR ZONAS
              </p>
              <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', lineHeight: 1.6 }}>
                En lugar de un PDF de 15 paginas que nadie lee, dividio la informacion en secciones: Llegada (parking, llaves, WiFi), Cocina (electrodomesticos, reciclaje), Zona (restaurantes, transporte). Cada seccion con un QR que el huesped escanea cuando la necesita.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a href="https://www.itineramio.com/blog/qr-code-apartamento-turistico-guia-generador" style={{ color: '#7c3aed', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                → Como crear QR por zonas para tu alojamiento
              </a>
            </div>

            {/* Change 2 */}
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '14px', fontWeight: 600 }}>
                2. AUTOMATIZO LOS MENSAJES CLAVE
              </p>
              <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', lineHeight: 1.6 }}>
                Mensaje de check-in 24h antes. Mensaje de bienvenida al llegar. Mensaje de check-out la noche anterior. Siempre los mismos. Siempre a tiempo.
              </p>
            </div>

            {/* Change 3 */}
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '14px', fontWeight: 600 }}>
                3. AJUSTO SUS PRECIOS CON DATOS
              </p>
              <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', lineHeight: 1.6 }}>
                Descubrio que estaba 15% por debajo del mercado en temporada alta y 10% por encima en temporada baja.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <a href="https://www.itineramio.com/blog/como-optimizar-precio-apartamento-turistico-2025" style={{ color: '#7c3aed', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                → Como optimizar el precio de tu apartamento turistico
              </a>
            </div>

            {/* Results */}
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                EL RESULTADO
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534', fontSize: '15px', lineHeight: 2 }}>
                <li><strong>Semana 1-4:</strong> Rating subio a 4.2</li>
                <li><strong>Semana 5-8:</strong> Primeras resenas de 5 estrellas mencionando "comunicacion excelente"</li>
                <li><strong>Semana 9-12:</strong> Superhost conseguido</li>
              </ul>
              <p style={{ margin: '16px 0 0 0', color: '#166534', fontSize: '15px', fontWeight: 600 }}>
                Y lo mas importante: dejo de responder mensajes a las 3am.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Maria no hizo magia. Hizo sistema.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Y eso es exactamente lo que intento ensenarte en estos emails.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el proximo te hablare de como calcular cuanto tiempo puedes recuperar automatizando tu operacion (spoiler: son mas horas de las que crees).
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Un saludo,<br />
              <strong>Alejandro</strong>
            </p>

            <p style={{ margin: '20px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              P.D. Si hiciste el test de arquetipo, ya sabes si eres mas "Maria antes" (apagando fuegos) o "Maria despues" (con sistema). Si no lo has hecho:
            </p>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a href="https://www.itineramio.com/host-profile/test" style={{ color: '#7c3aed', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                → Hacer el test de arquetipo (3 min)
              </a>
            </div>
          </td>
        </tr>

        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripcion</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
