import * as React from 'react'

interface Props {
  name: string
  email?: string
  nivel?: string
}

export default function AcademiaQuizDay2Tip({ name, email, nivel }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Academia Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>El error mas comun</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Despues de analizar cientos de perfiles de anfitriones, hemos detectado un patron claro:
            </p>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '16px', fontWeight: 600 }}>
                El error #1: No tener un sistema claro de comunicacion con huespedes
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              La mayoria de anfitriones responden mensajes de forma reactiva, sin un proceso establecido. Esto genera:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Respuestas tardias o inconsistentes</li>
              <li>Preguntas repetidas de cada huesped</li>
              <li>Estres y sensacion de estar siempre "apagando fuegos"</li>
            </ul>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>La solucion:</strong> Crear un manual digital con toda la informacion que los huespedes necesitan. Asi pueden resolver sus dudas solos.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              En el proximo email te enviare una mini-guia para implementar esto en 7 dias.
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
