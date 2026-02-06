import * as React from 'react'

interface QrData {
  url?: string
  format?: string
}

interface Props {
  name: string
  email?: string
  qrData?: QrData
}

export default function ToolQrDay0Delivery({ name, email, qrData }: Props) {
  const firstName = name?.split(' ')[0] || 'Anfitrión'
  const qrUrl = qrData?.url || 'https://www.itineramio.com'

  // Generate QR image using external API (works in emails)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=7c3aed&bgcolor=f5f3ff`

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f8f8', padding: '40px 16px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '580px', margin: '0 auto' }}>
        <tr>
          <td style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Itineramio</p>
            <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '24px', fontWeight: 600 }}>Tu Código QR</h1>
          </td>
        </tr>

        <tr>
          <td style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              ¡Hola {firstName}! 👋
            </p>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              Gracias por usar nuestro <strong>Generador de QR</strong>. Aquí tienes tu código listo para usar:
            </p>

            {/* QR Code Image */}
            <div style={{ textAlign: 'center', margin: '24px 0', padding: '24px', backgroundColor: '#f5f3ff', borderRadius: '12px' }}>
              <img
                src={qrImageUrl}
                alt="Tu Código QR"
                width="200"
                height="200"
                style={{ display: 'block', margin: '0 auto', borderRadius: '8px' }}
              />
              <p style={{ margin: '16px 0 0 0', color: '#7c3aed', fontSize: '12px', wordBreak: 'break-all' }}>
                {qrUrl}
              </p>
            </div>

            {/* Download instruction */}
            <div style={{ backgroundColor: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', color: '#5b21b6', fontSize: '14px', fontWeight: 600 }}>
                💡 Guarda esta imagen
              </p>
              <p style={{ margin: 0, color: '#7c3aed', fontSize: '13px' }}>
                Haz clic derecho en el QR y selecciona "Guardar imagen como..." para descargarlo en alta calidad.
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                <strong>Tip PRO:</strong> Los códigos QR funcionan mejor impresos en tamaño mínimo de 2x2 cm. Para carteles o señalización, usa al menos 5x5 cm.
              </p>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
              En los próximos días te compartiré ideas creativas para usar códigos QR en tu alquiler vacacional.
            </p>

            <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>
              Un saludo,<br />
              <strong>Alejandro</strong>
            </p>
          </td>
        </tr>

        <tr>
          <td style={{ textAlign: 'center', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              <a href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Cancelar suscripción</a> · © {new Date().getFullYear()} Itineramio
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
