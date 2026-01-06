import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function AcademiaQuizDay4Resource({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Academia Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Mini-guia: 7 dias</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Como te prometi, aqui tienes la mini-guia para mejorar tu gestion en 7 dias:
            </p>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '14px', fontWeight: 600 }}>Plan de 7 dias:</p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#0369a1', fontSize: '14px', lineHeight: 1.8 }}>
                <li><strong>Dia 1-2:</strong> Documenta las 10 preguntas mas frecuentes de tus huespedes</li>
                <li><strong>Dia 3-4:</strong> Crea respuestas claras para cada una</li>
                <li><strong>Dia 5-6:</strong> Organiza la informacion en secciones (check-in, wifi, normas...)</li>
                <li><strong>Dia 7:</strong> Comparte el manual con tu proximo huesped y pide feedback</li>
              </ul>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Si quieres hacerlo mas rapido, en Itineramio puedes crear un manual digital profesional en minutos, con plantillas predefinidas y QR para compartirlo facilmente.
            </p>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a href="https://www.itineramio.com" style={{ display: 'inline-block', backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Crear mi manual digital
              </a>
            </div>

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
