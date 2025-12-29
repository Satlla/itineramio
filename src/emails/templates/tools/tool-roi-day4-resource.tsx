import * as React from 'react'

interface Props {
  name: string
}

export default function ToolRoiDay4Resource({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Desglose de gastos reales</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Como te prometí, aquí tienes el <strong>desglose completo de gastos</strong> que deberías considerar:
            </p>

            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', fontWeight: 600 }}>
                💰 Gastos fijos (mensuales):
              </p>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Hipoteca o alquiler del local</li>
                <li>Comunidad de propietarios</li>
                <li>Seguro del hogar + RC</li>
                <li>Internet y streaming</li>
                <li>Suministros base (agua, luz, gas)</li>
              </ul>

              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', fontWeight: 600 }}>
                🔄 Gastos variables (por reserva):
              </p>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Limpieza (15-40€ según tamaño)</li>
                <li>Lavandería/ropa de cama</li>
                <li>Amenities de bienvenida</li>
                <li>Comisión de plataforma (3-15%)</li>
              </ul>

              <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '15px', fontWeight: 600 }}>
                📅 Gastos anuales:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: 1.7 }}>
                <li>Mantenimiento preventivo</li>
                <li>Renovación de textiles</li>
                <li>Licencia turística (si aplica)</li>
                <li>Contabilidad/gestoría</li>
                <li>Reserva para imprevistos (5-10%)</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                <strong>💡 Pro tip:</strong> Crea una cuenta bancaria separada para el alquiler. Ingresa todos los cobros ahí y paga todos los gastos desde ella. Así el ROI real sale solo.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En el próximo email te explico las 3 palancas para mejorar tu rentabilidad sin invertir más.
            </p>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '14px', fontWeight: 600 }}>
                📚 Lectura recomendada
              </p>
              <p style={{ margin: '0 0 12px 0', color: '#0c4a6e', fontSize: '14px', lineHeight: 1.5 }}>
                <strong>Manual Digital Apartamento Turístico: Guía Completa 2026</strong><br />
                Descubre cómo los mejores anfitriones organizan toda la información de su alojamiento en un solo lugar.
              </p>
              <a href="https://www.itineramio.com/blog/manual-digital-apartamento-turistico-guia-completa?utm_source=email&utm_medium=sequence&utm_campaign=tool-roi" style={{ color: '#0369a1', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                Leer artículo →
              </a>
            </div>

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
