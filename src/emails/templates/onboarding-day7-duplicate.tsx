import * as React from 'react'

interface OnboardingDay7DuplicateProps {
  name: string
}

export const OnboardingDay7Duplicate: React.FC<OnboardingDay7DuplicateProps> = ({ name }) => {
  return (
    <html>
      <head><meta charSet="utf-8" /></head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f9fafb',
        margin: 0,
        padding: 0
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#7c3aed', fontSize: '32px', marginBottom: '10px', fontWeight: 'bold' }}>Itineramio</h1>
          </div>

          <div style={{ padding: '0 20px' }}>
            <h2 style={{ color: '#111827', fontSize: '24px', marginBottom: '20px' }}>
              ⚡ {name}, crea tu 2ª propiedad en 5 minutos
            </h2>

            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              ¿Sabías que puedes <strong>duplicar tu manual existente</strong> y personalizarlo para otra propiedad en menos de 5 minutos?
            </p>

            <div style={{
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              border: '2px solid #bfdbfe'
            }}>
              <h3 style={{ color: '#1e40af', fontSize: '18px', marginTop: 0, marginBottom: '16px' }}>
                🚀 Cómo funciona la duplicación
              </h3>
              <ol style={{ color: '#1e3a8a', fontSize: '15px', lineHeight: '2', paddingLeft: '20px', marginBottom: 0 }}>
                <li>Click en "Duplicar propiedad"</li>
                <li>Cambia el nombre y dirección</li>
                <li>Personaliza solo lo que es diferente (WiFi, electrodomésticos)</li>
                <li>¡Listo! Nuevo manual en 5 min</li>
              </ol>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <p style={{ color: '#166534', fontSize: '14px', lineHeight: '1.6', marginBottom: 0, fontStyle: 'italic' }}>
                💬 "Tengo 6 propiedades y pensé que crear 6 manuales sería un infierno. Dupliqué el primero y en 30 min tenía todos listos. Game changer."<br />
                <strong style={{ fontSize: '13px' }}>— María G., 6 apartamentos en Sevilla</strong>
              </p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <a
                href="https://itineramio.com/dashboard/properties"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Duplicar Mi Propiedad →
              </a>
            </div>

            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
              <strong>Tip pro:</strong> Si tienes un edificio entero, usa "Property Sets" para gestionar todas las propiedades juntas. Es aún más rápido.
            </p>

            <p style={{ color: '#374151', fontSize: '15px', marginTop: '30px' }}>
              Un saludo,<br /><strong>Alejandro</strong>
            </p>
          </div>

          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '30px',
            marginTop: '40px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px'
          }}>
            <p style={{ marginBottom: '10px' }}>
              <a href="https://itineramio.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>Itineramio</a>
            </p>
            <p style={{ margin: '10px 0' }}>
              <a href="{{unsubscribe}}" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '11px' }}>
                Cancelar suscripción
              </a>
            </p>
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} Itineramio</p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default OnboardingDay7Duplicate
