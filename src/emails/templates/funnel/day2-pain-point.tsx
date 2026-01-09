import * as React from 'react'

interface Day2PainPointProps {
  name: string
}

export default function Day2PainPoint({ name }: Day2PainPointProps) {
  const firstName = name?.split(' ')[0] || 'Hola'
  const baseUrl = 'https://www.itineramio.com'

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
              El error que cuesta el 80% de las malas resenas
            </h1>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              {firstName}, despues de analizar miles de resenas de alojamientos turisticos, descubrimos algo interesante:
            </p>

            <div style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B', padding: '16px 20px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400E', fontSize: '15px', lineHeight: 1.6 }}>
                <strong>El 80% de las resenas negativas</strong> no son por el alojamiento en si, sino por <strong>falta de informacion clara</strong>.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Los huespedes se frustran cuando:
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#222222', fontSize: '15px', lineHeight: 1.8 }}>
              <li>No encuentran como funciona algo (WiFi, TV, cafetera...)</li>
              <li>Tienen que llamar o escribir para preguntas basicas</li>
              <li>Las instrucciones estan desactualizadas o son confusas</li>
              <li>No saben que hacer en caso de problema</li>
            </ul>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              La solucion no es estar disponible 24/7. Es <strong>anticiparte a sus preguntas</strong> con informacion accesible.
            </p>

            <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '14px', fontWeight: 600 }}>
                Lo que hacen los anfitriones con mejores valoraciones:
              </p>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#15803D', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Manual digital accesible desde el movil</li>
                <li>Instrucciones con fotos paso a paso</li>
                <li>Codigo QR en lugares estrategicos</li>
                <li>Informacion actualizada en tiempo real</li>
              </ul>
            </div>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Manana te cuento como identificar tu estilo de gestion (y como aprovecharlo).
            </p>

            <p style={{ margin: '0', color: '#222222', fontSize: '16px', lineHeight: 1.6 }}>
              Alejandro
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#717171', fontSize: '12px' }}>
              <a href={`${baseUrl}/api/email/unsubscribe`} style={{ color: '#717171', textDecoration: 'none' }}>Cancelar suscripcion</a>
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
  return 'El error que cuesta el 80% de las malas resenas'
}
