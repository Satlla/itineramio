import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e3a5f',
          backgroundImage: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 80px',
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              marginBottom: 20,
            }}
          >
            📊
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#1e3a5f',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            Resumen Mensual
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            Reservas · Liquidación · Facturas
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
