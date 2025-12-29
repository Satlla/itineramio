import * as React from 'react'

interface Props {
  name: string
}

export default function ToolPricingDay6Test({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>¿Cómo saber si tu precio es correcto?</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hay una forma simple de saber si tu precio está bien calibrado. Se llama el <strong>"Test de los 30 días"</strong>:
            </p>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 16px 0', color: '#0c4a6e', fontSize: '15px', lineHeight: 1.6 }}>
                <strong>Mira tu ocupación de los próximos 30 días:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: '14px', lineHeight: 1.8 }}>
                <li><strong>&gt;90% ocupado:</strong> Probablemente precio muy bajo. Sube un 10-15%.</li>
                <li><strong>70-90% ocupado:</strong> Buen equilibrio. Mantén o ajusta ligeramente.</li>
                <li><strong>50-70% ocupado:</strong> Revisa. Puede ser precio alto o problema de anuncio.</li>
                <li><strong>&lt;50% ocupado:</strong> Algo falla. Baja precio o mejora fotos/descripción.</li>
              </ul>
            </div>

            <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>⚠️ Importante:</strong> Este test funciona mejor en temporada media. En alta deberías estar al 95%+, en baja el 60% ya es bueno.
            </p>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                <strong>✅ Ejercicio:</strong> Abre ahora Airbnb y mira tu ocupación de los próximos 30 días. ¿Qué te dice el test?
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Mañana te cuento cómo automatizar todo esto para que no tengas que estar pendiente.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Alejandro
            </p>
          </td>
        </tr>

        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              <a href="https://www.itineramio.com/unsubscribe" style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripción</a> · © {new Date().getFullYear()} Itineramio
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
