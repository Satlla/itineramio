import * as React from 'react'

interface Day5CaseStudyProps {
  name: string
  email?: string
}

export default function Day5CaseStudy({ name, email }: Day5CaseStudyProps) {
  const firstName = name?.split(' ')[0] || 'Hola'
  const baseUrl = 'https://www.itineramio.com'
  const demoUrl = 'https://www.itineramio.com/p/white-coast-suite-101'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <p style={{ margin: '0', color: '#717171', fontSize: '13px', letterSpacing: '0.5px' }}>ITINERAMIO</p>
          </td>
        </tr>

        {/* Content */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '40px 32px', border: '1px solid #DDDDDD' }}>
            <h1 style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '24px', fontWeight: 600, lineHeight: 1.3 }}>
              Asi funciona un manual digital
            </h1>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              {firstName}, te lo explico con un ejemplo real.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>El flujo es muy simple:</strong>
            </p>

            <ol style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#222222', fontSize: '15px', lineHeight: 2 }}>
              <li>Un huesped reserva tu alojamiento</li>
              <li>Le envias un mensaje automatico con el enlace a tu manual</li>
              <li>El huesped lo abre desde su movil y ve todo: WiFi, normas, parking, como llegar, recomendaciones locales...</li>
              <li>Cuando tiene una duda, mira el manual en vez de escribirte</li>
            </ol>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Mira este ejemplo real de un apartamento en Alicante:
            </p>

            {/* Demo CTA */}
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px' }}>
              <tr>
                <td align="center">
                  <a
                    href={demoUrl}
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
                    Ver manual de ejemplo
                  </a>
                </td>
              </tr>
            </table>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Fijate en como esta organizado: zonas claras, fotos, instrucciones paso a paso. El huesped encuentra lo que busca sin tener que preguntarte.
            </p>

            <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '15px', fontWeight: 600 }}>
                Crear el tuyo es rapido:
              </p>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#15803D', fontSize: '14px', lineHeight: 1.8 }}>
                <li>Itineramio te da una estructura base ya hecha</li>
                <li>Solo tienes que rellenar la info de tu alojamiento</li>
                <li>Puedes eliminar las zonas que no necesites y crear las que quieras</li>
                <li>En 5-10 minutos lo tienes listo</li>
              </ul>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Los huespedes seguiran escribiendote de vez en cuando (es inevitable), pero las preguntas repetitivas del tipo "cual es la clave del WiFi" o "como funciona el aire acondicionado" desaparecen.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Manana te cuento como probarlo gratis.
            </p>

            <p style={{ margin: '24px 0 0 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Alejandro
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#717171', fontSize: '12px' }}>
              <a href={`${baseUrl}/api/email/unsubscribe?email=${encodeURIComponent(email || '')}`} style={{ color: '#717171', textDecoration: 'none' }}>Cancelar suscripcion</a>
              {' · '}
              <a href={baseUrl} style={{ color: '#717171', textDecoration: 'none' }}>itineramio.com</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}

export function getSubject(): string {
  return 'Asi funciona un manual digital (ejemplo real)'
}
