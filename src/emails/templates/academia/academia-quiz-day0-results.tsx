import * as React from 'react'

interface Props {
  name: string
  email?: string
  nivel?: string
}

export default function AcademiaQuizDay0Results({ name, email, nivel }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'
  const nivelDisplay = nivel === 'BASIC' ? 'Principiante' : nivel === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Academia Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Tu perfil de anfitrión</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Gracias por completar el quiz de la Academia. Segun tus respuestas, tu nivel actual es:
            </p>

            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '24px', fontWeight: 700 }}>
                {nivelDisplay}
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En los próximos días te enviaré contenido personalizado para tu nivel:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>El error mas comun de los anfitriones de tu nivel</li>
              <li>Mini-guia para mejorar tu gestión en 7 días</li>
              <li>Caso de exito: de principiante a Superhost</li>
            </ul>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
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
