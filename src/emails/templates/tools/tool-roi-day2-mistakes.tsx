import * as React from 'react'

interface Props {
  name: string
}

export default function ToolRoiDay2Mistakes({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>El error que mata tu rentabilidad</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              El error más común que veo en propietarios de alquiler vacacional:
            </p>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#991b1b', fontSize: '15px', fontWeight: 600 }}>
                ❌ No calcular TODOS los gastos
              </p>
              <p style={{ margin: '12px 0 0 0', color: '#991b1b', fontSize: '14px' }}>
                Muchos solo cuentan hipoteca y comunidad. Olvidan: limpieza, suministros, mantenimiento, comisiones, impuestos, seguros, renovaciones...
              </p>
            </div>

            <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              <strong>Gastos que suelen olvidarse:</strong>
            </p>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
              <li>Limpieza entre huéspedes (~15-20€/limpieza)</li>
              <li>Ropa de cama y toallas (reposición anual)</li>
              <li>Comisiones de plataforma (3-15%)</li>
              <li>Mantenimiento imprevisto (caldera, electrodomésticos)</li>
              <li>Vacantes (meses sin ocupación)</li>
              <li>Tu tiempo (tiene valor)</li>
            </ul>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                <strong>✅ Regla práctica:</strong> Si calculas un ROI del 8%, el real probablemente sea 5-6% cuando incluyas todo.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el próximo email te comparto una hoja de cálculo con todos los gastos que deberías trackear.
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
