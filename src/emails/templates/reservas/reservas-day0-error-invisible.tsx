import * as React from 'react'

interface Props {
  name: string
  email?: string
}

export default function ReservasDay0ErrorInvisible({ name, email }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>El error invisible que mata tus reservas</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Gracias por usar nuestra calculadora de tiempo.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Antes de hablar de automatizacion, hay algo mas urgente que necesitas saber.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Llevo anos trabajando con anfitriones y he identificado un patron:
            </p>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '15px', lineHeight: 1.6 }}>
                <strong>El 73% se obsesiona con CONSEGUIR reservas.</strong>
              </p>
              <p style={{ margin: 0, color: '#92400e', fontSize: '15px', lineHeight: 1.6 }}>
                <strong>Solo el 12% se enfoca en MANTENER las que ya tienen.</strong>
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              El resultado? Huespedes que llegan con expectativas altas, se encuentran con pequenos problemas (WiFi confuso, check-in caotico, informacion dispersa), y dejan resenas de 4 estrellas "porque todo estuvo bien, pero..."
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Y aqui esta el problema:
            </p>

            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#991b1b', fontSize: '18px', fontWeight: 600 }}>
                En Airbnb, 4 estrellas = malo
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Cada punto menos que 4.8 te hunde en el algoritmo. Menos visibilidad = menos reservas. Es un circulo vicioso.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>La solucion no es mas marketing. Es mejor experiencia.</strong>
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Un estudio de Cornell demostro que subir 0.1 puntos en rating aumenta las reservas un 11%.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Como se logra esto? <strong>Anticipandote a las preguntas antes de que las hagan.</strong>
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Te dejo un articulo donde explico exactamente como crear un sistema que elimina el 86% de las consultas repetitivas:
            </p>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a href="https://www.itineramio.com/blog/manual-digital-apartamento-turistico-guia-completa" style={{ display: 'inline-block', backgroundColor: '#7c3aed', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '16px' }}>
                Leer: Como crear un manual digital efectivo
              </a>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              No intento venderte nada. Solo quiero que entiendas esto:
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6, fontStyle: 'italic' }}>
              <strong>Las reservas no se consiguen. Se ganan.</strong>
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En 2 dias te cuento como descubrir tu estilo unico como anfitrion (y por que eso importa para tus reservas).
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Un saludo,<br />
              <strong>Alejandro</strong>
            </p>

            <p style={{ margin: '20px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              P.D. Si tienes 5 minutos, lee el articulo. Hay un dato sobre el WiFi que te va a sorprender.
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
