import * as React from 'react'

interface Props {
  name: string
}

export default function ToolWifiDay6Test({ name }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Mini checklist pre check-in</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Hola {firstName},
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Te prometí mi checklist. Es simple pero efectivo:
            </p>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#0c4a6e', fontSize: '15px', fontWeight: 600 }}>
                ✅ Antes de cada check-in:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: '14px', lineHeight: 1.8 }}>
                <li>WiFi funcionando (prueba conexión)</li>
                <li>Tarjeta WiFi visible</li>
                <li>Luces y enchufes operativos</li>
                <li>Agua caliente OK</li>
                <li>Baño: toallas limpias, papel, jabón</li>
                <li>Cocina: básicos (sal, aceite, café)</li>
                <li>Camas hechas, almohadas mullidas</li>
                <li>Temperatura agradable (AC/calefacción)</li>
                <li>Sin olores (ventila antes)</li>
                <li>Instrucciones de check-in enviadas</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                <strong>✅ Ejercicio:</strong> Revisa tu próximo check-in con esta lista. ¿Hay algo que puedas mejorar?
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Mañana te cuento cómo automatizar todo esto para que no tengas que recordar nada.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Alejandro
            </p>
          </td>
        </tr>

        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              © {new Date().getFullYear()} Itineramio
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
