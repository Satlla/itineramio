import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Propuesta de Gestión Integral — 48 Apartamentos Santa Pola'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          color: 'white',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Purple glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-50px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(139,92,246,0.3)',
            border: '1px solid rgba(139,92,246,0.5)',
            padding: '8px 24px',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '30px',
            alignSelf: 'flex-start',
          }}
        >
          Propuesta Comercial
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '16px',
            color: '#e9e0ff',
          }}
        >
          Gestión Integral de
        </div>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '16px',
            color: '#c4b5fd',
          }}
        >
          48 Apartamentos
        </div>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '40px',
          }}
        >
          Santa Pola, Alicante
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Preparado por
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              Alejandro Santalla
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Fecha
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              Febrero 2026
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Contacto
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              652 656 440
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
