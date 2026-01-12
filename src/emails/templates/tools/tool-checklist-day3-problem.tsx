import * as React from 'react'

interface ToolChecklistDay3Props {
  name: string
  email?: string
}

export default function ToolChecklistDay3Problem({ name, email }: ToolChecklistDay3Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrion'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#ffffff', padding: '0' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <tr>
          <td style={{ padding: '24px 24px 0 24px' }}>
            <p style={{ margin: 0, color: '#FF385C', fontSize: '16px', fontWeight: 600, letterSpacing: '-0.2px' }}>
              Itineramio
            </p>
          </td>
        </tr>

        {/* Main Content */}
        <tr>
          <td style={{ padding: '32px 24px' }}>
            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Te prometí contarte cómo reducir esos mensajes de WhatsApp.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Pero antes, déjame preguntarte algo:
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#222222', fontSize: '18px', lineHeight: 1.7, fontWeight: 600 }}>
              ¿Cuántas veces has explicado lo mismo a diferentes huéspedes?
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              "El WiFi es <em>este</em>, la basura se deja <em>aquí</em>, el checkout es a <em>esta hora</em>..."
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Lo repites cada semana. A veces cada día.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Y lo peor: aunque lo expliques bien, <strong>te vuelven a preguntar</strong>.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Porque el huésped no guarda tus mensajes. No lee el email de Airbnb. No recuerda lo que le dijiste.
            </p>

            <p style={{ margin: '0 0 24px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Cuando tiene una duda, hace lo más fácil: <strong>te escribe</strong>.
            </p>

            {/* The cost */}
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#991B1B', fontSize: '15px', lineHeight: 1.6 }}>
                Si gestionas 3 propiedades con rotación semanal, respondes <strong>+300 mensajes al año</strong> sobre las mismas 10 preguntas.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Y eso sin contar las llamadas.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              ¿La solución?
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Un sitio donde el huésped tenga <strong>todo</strong>. Siempre accesible. Sin tener que buscarlo.
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#484848', fontSize: '16px', lineHeight: 1.7 }}>
              Mañana te enseño exactamente cómo funciona.
            </p>

            <p style={{ margin: '32px 0 0 0', color: '#222222', fontSize: '16px' }}>
              — Álex
            </p>
            <p style={{ margin: '4px 0 0 0', color: '#717171', fontSize: '14px' }}>
              Fundador de Itineramio
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: '24px', borderTop: '1px solid #EBEBEB' }}>
            <p style={{ margin: 0, color: '#717171', fontSize: '12px' }}>
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#717171', textDecoration: 'underline' }}>Cancelar suscripcion</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}

export function getSubject(): string {
  return 'Cuántas veces has explicado lo mismo?'
}
