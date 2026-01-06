import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function AcademiaQuizDay7Case({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Academia Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>De principiante a Superhost</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hoy quiero contarte la historia de Maria, una anfitriona que paso de 3.8 estrellas a Superhost en solo 3 meses.
            </p>

            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
                <strong>El problema:</strong> Maria recibia 5-10 mensajes diarios preguntando lo mismo: wifi, parking, check-in...
              </p>
              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
                <strong>La solucion:</strong> Creo un manual digital con toda la informacion y lo compartio antes de cada llegada.
              </p>
              <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                <strong>El resultado:</strong> Mensajes reducidos un 80%, resenas mejoradas, y el estatus de Superhost en el siguiente trimestre.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Lo que hizo Maria no es magia. Es tener un sistema claro que cualquier anfitrion puede implementar.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              En el proximo email te hablare de como puedes empezar tu propio camino hacia el Superhost.
            </p>

            <p style={{ margin: '20px 0 0 0', color: '#374151', fontSize: '16px' }}>
              Un saludo,<br />
              <strong>Alejandro</strong>
            </p>
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
