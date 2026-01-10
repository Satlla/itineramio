import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function ReservasDay2ArquetipoChecklist({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Tu perfil oculto de anfitrión</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el último email te hablé de por qué la experiencia del huésped es más importante que el marketing.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hoy quiero ir un paso más allá.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Después de analizar cientos de anfitriones, he identificado <strong>8 perfiles diferentes</strong>.
            </p>

            <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Cada uno tiene:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Fortalezas naturales</li>
              <li>Puntos ciegos que le cuestan reservas</li>
              <li>Estrategias específicas que le funcionan</li>
            </ul>

            <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Por ejemplo:
            </p>

            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>
                <strong>El Estratega</strong> es genial con números pero descuida el toque personal.
              </p>
              <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>
                <strong>El Experiencial</strong> crea momentos wow pero se agota porque no delega.
              </p>
              <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                <strong>El Ejecutor</strong> lo hace todo él mismo pero nunca escala.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¿Cuál eres tú?
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              He creado un test gratuito de 3 minutos que te dice exactamente:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Tu perfil dominante</li>
              <li>Tus fortalezas ocultas</li>
              <li>Una guía personalizada para tu tipo</li>
            </ul>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <a href="https://www.itineramio.com/host-profile/test" style={{ display: 'inline-block', backgroundColor: '#7c3aed', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '16px' }}>
                Descubre tu arquetipo de anfitrión
              </a>
            </div>

            {/* Separator */}
            <div style={{ borderTop: '1px solid #e5e7eb', margin: '32px 0' }}></div>

            {/* Bonus Section */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                BONUS
              </p>
              <h3 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '18px', fontWeight: 600 }}>
                Checklist de Limpieza Profesional
              </h3>
              <p style={{ margin: '0 0 16px 0', color: '#166534', fontSize: '15px', lineHeight: 1.6 }}>
                Hablando de experiencia del huésped...
              </p>
              <p style={{ margin: '0 0 16px 0', color: '#166534', fontSize: '15px', lineHeight: 1.6 }}>
                La limpieza es lo #1 que mencionan las reseñas negativas.
              </p>
              <p style={{ margin: '0 0 16px 0', color: '#166534', fontSize: '15px', lineHeight: 1.6 }}>
                He preparado un checklist interactivo con <strong>50+ items</strong> organizados por zona (cocina, baños, dormitorios, exteriores) que puedes personalizar con el nombre de tu alojamiento.
              </p>
              <p style={{ margin: '0 0 20px 0', color: '#166534', fontSize: '15px', lineHeight: 1.6 }}>
                Es el mismo sistema que usan property managers profesionales.
              </p>
              <div style={{ textAlign: 'center' }}>
                <a href="https://www.itineramio.com/hub/tools/cleaning-checklist" style={{ display: 'inline-block', backgroundColor: '#166534', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
                  Descargar Checklist de Limpieza
                </a>
              </div>
            </div>

            {/* Separator */}
            <div style={{ borderTop: '1px solid #e5e7eb', margin: '32px 0' }}></div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¿Por qué te doy todo esto gratis?
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Porque sé que cuando mejores tu operación, eventualmente querrás automatizarla. Y ahí es donde podemos ayudarte.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Pero eso es para otro día.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hoy, solo haz el test y descarga el checklist.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Un saludo,<br />
              <strong>Alejandro</strong>
            </p>

            <p style={{ margin: '20px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              P.D. Si tu equipo de limpieza ya usa un checklist, compáralo con el nuestro. Te sorprenderá lo que falta.
            </p>
          </td>
        </tr>

        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripción</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
