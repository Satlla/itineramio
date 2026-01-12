import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function AcademiaQuizDay10Invite({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Academia Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>El siguiente paso</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En estos días te he compartido:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Tu perfil de anfitrion segun el quiz</li>
              <li>El error mas comun y como evitarlo</li>
              <li>Una mini-guia de 7 días</li>
              <li>Un caso de exito real</li>
            </ul>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Ahora la pregunta es: <strong>estás listo para dar el siguiente paso?</strong>
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Si quieres profesionalizar tu gestión y ahorrar horas cada semana, te invito a probar Itineramio:
            </p>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a href="https://www.itineramio.com/auth/register" style={{ display: 'inline-block', backgroundColor: '#7c3aed', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '16px' }}>
                Empezar prueba de 15 días
              </a>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>
              Sin tarjeta de credito. Sin compromiso.
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
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripcion</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
