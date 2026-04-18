'use client'

export default function PromoImage() {
  return (
    <div style={{ width: 2048, height: 1536, position: 'relative', overflow: 'hidden', fontFamily: '-apple-system, sans-serif' }}>

      {/* Background — apartment photo */}
      <img src="/images/apto-real.webp" alt="Apartamento turístico" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* Subtle dark gradient at bottom for text readability */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1), transparent)' }} />

      {/* iPhone mockup — right side */}
      <div style={{ position: 'absolute', right: 140, bottom: 120, width: 320, transform: 'rotate(-5deg)' }}>
        {/* Phone frame */}
        <div style={{ background: '#000', borderRadius: 44, padding: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
          {/* Notch */}
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 120, height: 28, background: '#000', borderRadius: '0 0 16px 16px', zIndex: 10 }} />
          {/* Screen */}
          <div style={{ background: '#111', borderRadius: 34, overflow: 'hidden', aspectRatio: '9/19.5' }}>
            {/* Header */}
            <div style={{ padding: '32px 20px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Mi Apartamento</div>
              <div style={{ fontSize: 11, color: '#7c3aed' }}>Guía Digital</div>
            </div>

            {/* Guide sections */}
            <div style={{ padding: '0 16px' }}>
              {[
                { icon: '🔑', label: 'Check-in', desc: 'Código de entrada' },
                { icon: '📶', label: 'WiFi', desc: 'Red y contraseña' },
                { icon: '🏠', label: 'Normas', desc: 'Lo que necesitas saber' },
                { icon: '🍽️', label: 'Restaurantes', desc: '12 recomendaciones' },
                { icon: '🗺️', label: 'Qué ver', desc: 'Lo mejor de la ciudad' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat preview */}
            <div style={{ margin: '12px 16px', padding: '10px 14px', background: 'rgba(124,58,237,0.15)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, color: '#fff' }}>IA</span>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Asistente 24/7</span>
                <span style={{ fontSize: 8, color: '#22c55e', marginLeft: 'auto' }}>● En línea</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Pregúntame lo que necesites...</div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code — floating near phone */}
      <div style={{ position: 'absolute', right: 500, bottom: 200, textAlign: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          {/* Mini QR */}
          <svg width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#fff" />
            {/* QR finder patterns */}
            <rect x="5" y="5" width="25" height="25" rx="3" fill="#111" />
            <rect x="9" y="9" width="17" height="17" rx="2" fill="#fff" />
            <rect x="13" y="13" width="9" height="9" rx="1" fill="#111" />

            <rect x="70" y="5" width="25" height="25" rx="3" fill="#111" />
            <rect x="74" y="9" width="17" height="17" rx="2" fill="#fff" />
            <rect x="78" y="13" width="9" height="9" rx="1" fill="#111" />

            <rect x="5" y="70" width="25" height="25" rx="3" fill="#111" />
            <rect x="9" y="74" width="17" height="17" rx="2" fill="#fff" />
            <rect x="13" y="78" width="9" height="9" rx="1" fill="#111" />

            {/* Data modules */}
            <rect x="35" y="5" width="6" height="6" fill="#111" />
            <rect x="45" y="5" width="6" height="6" fill="#111" />
            <rect x="55" y="5" width="6" height="6" fill="#111" />
            <rect x="35" y="15" width="6" height="6" fill="#111" />
            <rect x="50" y="15" width="6" height="6" fill="#111" />
            <rect x="35" y="35" width="6" height="6" fill="#111" />
            <rect x="45" y="35" width="6" height="6" fill="#111" />
            <rect x="55" y="35" width="6" height="6" fill="#111" />
            <rect x="65" y="35" width="6" height="6" fill="#111" />
            <rect x="75" y="35" width="6" height="6" fill="#111" />
            <rect x="85" y="35" width="6" height="6" fill="#111" />
            <rect x="35" y="45" width="6" height="6" fill="#111" />
            <rect x="55" y="45" width="6" height="6" fill="#111" />
            <rect x="75" y="45" width="6" height="6" fill="#111" />
            <rect x="35" y="55" width="6" height="6" fill="#111" />
            <rect x="45" y="55" width="6" height="6" fill="#111" />
            <rect x="65" y="55" width="6" height="6" fill="#111" />
            <rect x="85" y="55" width="6" height="6" fill="#111" />
            <rect x="45" y="65" width="6" height="6" fill="#111" />
            <rect x="55" y="65" width="6" height="6" fill="#111" />
            <rect x="75" y="65" width="6" height="6" fill="#111" />
            <rect x="35" y="75" width="6" height="6" fill="#111" />
            <rect x="55" y="75" width="6" height="6" fill="#111" />
            <rect x="65" y="75" width="6" height="6" fill="#111" />
            <rect x="85" y="75" width="6" height="6" fill="#111" />
            <rect x="35" y="85" width="6" height="6" fill="#111" />
            <rect x="45" y="85" width="6" height="6" fill="#111" />
            <rect x="65" y="85" width="6" height="6" fill="#111" />
            <rect x="85" y="85" width="6" height="6" fill="#111" />

            {/* Center logo */}
            <rect x="40" y="40" width="20" height="20" rx="4" fill="#7c3aed" />
            <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">it</text>
          </svg>
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: '#fff', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          Escanea tu guía digital
        </div>
      </div>

      {/* Bottom text bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 300, color: '#fff', letterSpacing: '-0.02em' }}>
            Este alojamiento tiene <span style={{ fontWeight: 600 }}>guía digital interactiva</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Asistente IA 24/7 · Instrucciones con video · Recomendaciones locales
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/isotipo-gradient.svg" alt="Itineramio" width={32} height={18} style={{ filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>itineramio</span>
        </div>
      </div>
    </div>
  )
}
