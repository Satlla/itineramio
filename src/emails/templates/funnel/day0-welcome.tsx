import * as React from 'react'

interface Day0WelcomeProps {
  name: string
  source?: string
  email?: string
}

export default function Day0Welcome({ name, source, email }: Day0WelcomeProps) {
  const firstName = name?.split(' ')[0] || 'Hola'
  const baseUrl = 'https://www.itineramio.com'
  const ctaUrl = `${baseUrl}/ai-setup`

  const steps = [
    { num: '01', label: 'Crea tu guía con IA', sublabel: '10 minutos', done: false, active: true },
    { num: '02', label: 'Añade tus zonas', sublabel: 'WiFi, acceso, normas...', done: false, active: false },
    { num: '03', label: 'Activa el chatbot', sublabel: 'Responde en su idioma', done: false, active: false },
    { num: '04', label: 'Comparte con el huésped', sublabel: 'QR o enlace directo', done: false, active: false },
  ]

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f5f5f5', padding: '40px 16px', margin: 0 }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Logo */}
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '28px' }}>
            <p style={{ margin: 0, color: '#888', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              Itineramio
            </p>
          </td>
        </tr>

        {/* Main card */}
        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8e8e8', overflow: 'hidden' }}>

            {/* Top accent bar */}
            <div style={{ backgroundColor: '#6B46C1', height: '4px', width: '100%' }} />

            <div style={{ padding: '40px 36px' }}>

              {/* Greeting */}
              <h1 style={{ margin: '0 0 8px 0', color: '#111', fontSize: '26px', fontWeight: 700, lineHeight: 1.2 }}>
                Bienvenido, {firstName}
              </h1>
              <p style={{ margin: '0 0 32px 0', color: '#888', fontSize: '15px' }}>
                Soy Alejandro, fundador de Itineramio.
              </p>

              {/* Personal message */}
              <p style={{ margin: '0 0 16px 0', color: '#222', fontSize: '16px', lineHeight: 1.7 }}>
                Creé Itineramio porque gestionaba varios apartamentos y me harté de enviar el WiFi, el código de entrada y las normas cada semana. Siempre lo mismo. Siempre a mano.
              </p>
              <p style={{ margin: '0 0 32px 0', color: '#222', fontSize: '16px', lineHeight: 1.7 }}>
                La solución es simple: <strong>una guía digital que el huésped recibe sola cuando confirma su reserva.</strong> Sin mensajes. Sin repetirte.
              </p>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '0 0 32px 0' }} />

              {/* Milestone roadmap */}
              <p style={{ margin: '0 0 20px 0', color: '#111', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Tu hoja de ruta — 4 pasos
              </p>

              <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '32px' }}>
                {steps.map((step, i) => (
                  <tr key={step.num}>
                    <td style={{ paddingBottom: i < steps.length - 1 ? '12px' : '0' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: step.active ? '#F5F0FF' : '#FAFAFA',
                        border: `1px solid ${step.active ? '#6B46C1' : '#E8E8E8'}`,
                        borderRadius: '10px',
                        padding: '14px 16px',
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: step.active ? '#6B46C1' : '#E8E8E8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginRight: '14px',
                        }}>
                          <span style={{ color: step.active ? '#fff' : '#999', fontSize: '13px', fontWeight: 700 }}>
                            {step.num}
                          </span>
                        </div>
                        <div>
                          <p style={{ margin: 0, color: step.active ? '#111' : '#888', fontSize: '15px', fontWeight: step.active ? 600 : 400 }}>
                            {step.label}
                            {step.active && (
                              <span style={{ marginLeft: '8px', backgroundColor: '#6B46C1', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', verticalAlign: 'middle' }}>
                                Ahora
                              </span>
                            )}
                          </p>
                          <p style={{ margin: '2px 0 0 0', color: '#aaa', fontSize: '13px' }}>
                            {step.sublabel}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </table>

              {/* CTA */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <a
                  href={ctaUrl}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#6B46C1',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '16px 40px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                  }}
                >
                  Crear mi primera guía →
                </a>
                <p style={{ margin: '10px 0 0 0', color: '#aaa', fontSize: '13px' }}>
                  Con IA · En 10 minutos · Sin tarjeta de crédito
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '0 0 28px 0' }} />

              {/* Example */}
              <p style={{ margin: '0 0 12px 0', color: '#111', fontSize: '14px', fontWeight: 600 }}>
                ¿Quieres ver cómo queda?
              </p>
              <p style={{ margin: '0 0 20px 0', color: '#555', fontSize: '14px', lineHeight: 1.6 }}>
                Aquí tienes la guía real de uno de mis apartamentos. Esto es lo que verá tu huésped desde el día uno:
              </p>
              <a
                href={`${baseUrl}/p/white-coast-suite-101`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  color: '#6B46C1',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Ver ejemplo de guía real →
              </a>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '28px 0' }} />

              {/* Sign off */}
              <p style={{ margin: '0 0 4px 0', color: '#222', fontSize: '15px', lineHeight: 1.7 }}>
                Si tienes cualquier duda, responde a este email. Lo leo yo.
              </p>
              <p style={{ margin: '0', color: '#222', fontSize: '15px' }}>
                Un saludo,
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#111', fontSize: '15px', fontWeight: 600 }}>
                Alejandro
              </p>
              <p style={{ margin: '2px 0 0 0', color: '#aaa', fontSize: '13px' }}>
                Fundador de Itineramio
              </p>

            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#bbb', fontSize: '12px' }}>
              <a href={`${baseUrl}/api/email/unsubscribe?email=${encodeURIComponent(email || '')}`} style={{ color: '#bbb', textDecoration: 'none' }}>
                Cancelar suscripción
              </a>
              {' · '}
              <a href={baseUrl} style={{ color: '#bbb', textDecoration: 'none' }}>
                itineramio.com
              </a>
            </p>
          </td>
        </tr>

      </table>
    </div>
  )
}

export function getSubject(): string {
  return 'Bienvenido, {firstName} — tu hoja de ruta está lista'
}
