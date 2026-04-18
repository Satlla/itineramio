'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Wifi, Key, MapPin, Star, Bell, MessageSquare, QrCode, Smartphone, ChevronDown, Play, Tv, UtensilsCrossed, Refrigerator, Snowflake } from 'lucide-react'
import Image from 'next/image'

// ============================================
// MINI QR CODE SVG (brand violet)
// ============================================
function MiniQR({ size = 28 }: { size?: number }) {
  const s = size
  const u = s / 7 // unit size
  return (
    <svg width={s} height={s} viewBox="0 0 7 7" className="rounded-[3px]">
      {/* Background */}
      <rect width="7" height="7" fill="#7c3aed" rx="0.5" />
      {/* Top-left finder */}
      <rect x="0.5" y="0.5" width="2" height="2" fill="white" rx="0.3" />
      <rect x="0.8" y="0.8" width="1.4" height="1.4" fill="#7c3aed" rx="0.2" />
      <rect x="1.1" y="1.1" width="0.8" height="0.8" fill="white" rx="0.1" />
      {/* Top-right finder */}
      <rect x="4.5" y="0.5" width="2" height="2" fill="white" rx="0.3" />
      <rect x="4.8" y="0.8" width="1.4" height="1.4" fill="#7c3aed" rx="0.2" />
      <rect x="5.1" y="1.1" width="0.8" height="0.8" fill="white" rx="0.1" />
      {/* Bottom-left finder */}
      <rect x="0.5" y="4.5" width="2" height="2" fill="white" rx="0.3" />
      <rect x="0.8" y="4.8" width="1.4" height="1.4" fill="#7c3aed" rx="0.2" />
      <rect x="1.1" y="5.1" width="0.8" height="0.8" fill="white" rx="0.1" />
      {/* Data modules */}
      <rect x="3" y="0.7" width="0.6" height="0.6" fill="white" opacity="0.8" />
      <rect x="3" y="3" width="1" height="1" fill="white" rx="0.15" />
      <rect x="0.7" y="3" width="0.6" height="0.6" fill="white" opacity="0.7" />
      <rect x="5" y="3.2" width="0.6" height="0.6" fill="white" opacity="0.7" />
      <rect x="3.5" y="5" width="0.6" height="0.6" fill="white" opacity="0.8" />
      <rect x="5" y="5" width="0.6" height="0.6" fill="white" opacity="0.6" />
    </svg>
  )
}

// ============================================
// HOTSPOT WITH PULSE + HOLOGRAM
// ============================================
interface HotspotProps {
  id: string
  x: string
  y: string
  mobileX?: string
  mobileY?: string
  icon: any
  label: string
  hologramContent: {
    title: string
    lines: string[]
    hasVideo?: boolean
  }
  delay: number
  activeId: string | null
  onToggle: (id: string) => void
  hologramPosition?: 'top' | 'bottom' | 'left' | 'right'
}

function Hotspot({ id, x, y, mobileX, mobileY, icon: Icon, label, hologramContent, delay, activeId, onToggle, hologramPosition = 'top' }: HotspotProps) {
  const isActive = activeId === id

  // Calculate hologram offset based on position
  const holoPositionClass = {
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
  }[hologramPosition]

  const holoOrigin = {
    top: 'bottom center',
    bottom: 'top center',
    left: 'right center',
    right: 'left center',
  }[hologramPosition]

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: isActive ? 100 : 20,
      }}
    >
      {/* Pulse rings */}
      <motion.div
        className="absolute rounded-full border-2 border-violet-400/60"
        style={{ width: 36, height: 36, left: '50%', top: '50%', marginLeft: -18, marginTop: -18 }}
        animate={{ scale: [1, 2, 2.6], opacity: [0.5, 0.15, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, delay }}
      />
      <motion.div
        className="absolute rounded-full border border-violet-300/40"
        style={{ width: 36, height: 36, left: '50%', top: '50%', marginLeft: -18, marginTop: -18 }}
        animate={{ scale: [1, 1.6, 2.2], opacity: [0.3, 0.1, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: delay + 0.6 }}
      />

      {/* Circular dot with mini QR inside */}
      <motion.button
        onClick={() => onToggle(id)}
        className="relative w-9 h-9 rounded-full bg-violet-600/80 backdrop-blur-sm border-2 border-violet-400/60 cursor-pointer flex items-center justify-center shadow-lg shadow-violet-500/50"
        whileHover={{ scale: 1.3, borderColor: 'rgba(167, 139, 250, 0.9)' }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
        style={{ zIndex: 10 }}
      >
        <MiniQR size={16} />
        {/* Glow pulse on active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-violet-400/25"
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.6 }}
        className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
      >
        <span className="text-[9px] sm:text-[10px] font-medium text-gray-600 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-violet-200/30 shadow-sm">
          {label}
        </span>
      </motion.div>

      {/* Hologram panel — positioned OUTSIDE overflow */}
      <AnimatePresence>
        {isActive && (
          <>
            {/* Connection line from QR to hologram */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute left-1/2 -translate-x-1/2 w-px bg-gradient-to-t from-violet-400/50 to-violet-300/20 ${
                hologramPosition === 'bottom' ? 'top-full h-3 origin-top' : 'bottom-full h-3 origin-bottom'
              }`}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: hologramPosition === 'bottom' ? -5 : 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className={`absolute ${holoPositionClass} w-60 sm:w-72`}
              style={{ transformOrigin: holoOrigin, zIndex: 100 }}
            >
              <div className="rounded-2xl border border-violet-300/25 bg-gradient-to-b from-white/80 via-violet-50/70 to-white/75 backdrop-blur-xl shadow-2xl shadow-violet-300/15 overflow-hidden">
                {/* Hologram scan line */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
                >
                  <motion.div
                    className="w-full h-12 bg-gradient-to-b from-violet-400/5 via-violet-200/3 to-transparent"
                    animate={{ y: [-48, 300] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>

                {/* Subtle noise/glass texture */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.03]"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
                />

                {/* Header */}
                <div className="px-4 pt-4 pb-2 border-b border-violet-200/20 relative">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-violet-600" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{hologramContent.title}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 py-3 space-y-2.5 relative">
                  {hologramContent.lines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * i + 0.1 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">{line}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Video preview */}
                {hologramContent.hasVideo && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mx-4 mb-4 rounded-xl bg-violet-50/50 border border-violet-200/30 overflow-hidden cursor-pointer group hover:bg-violet-50 hover:border-violet-300/40 transition-all"
                  >
                    {/* Video thumbnail bar */}
                    <div className="p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Play className="w-4 h-4 text-violet-600 ml-0.5" fill="currentColor" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-gray-700">Ver video tutorial</div>
                        <div className="text-[9px] text-gray-400">0:45 seg</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bottom gradient line */}
                <div className="h-px bg-gradient-to-r from-transparent via-violet-300/20 to-transparent" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// PHONE MOCKUP
// ============================================
function PhoneMockup({ children, side }: { children: React.ReactNode; side: 'left' | 'right' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative w-[240px] sm:w-[280px] mx-auto"
    >
      <div className="relative bg-black rounded-[36px] sm:rounded-[40px] p-2.5 sm:p-3 shadow-2xl shadow-violet-500/20 border border-gray-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-6 bg-black rounded-b-2xl z-10" />
        <div className="bg-gray-950 rounded-[26px] sm:rounded-[28px] overflow-hidden aspect-[9/19]">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// FEATURE CARD
// ============================================
function FeatureCard({ icon: Icon, title, value, subtitle, delay }: {
  icon: any; title: string; value: string; subtitle: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-violet-500 mx-auto mb-3 sm:mb-4" strokeWidth={1.5} />
      <div className="text-3xl sm:text-4xl font-extralight text-gray-900 mb-1 sm:mb-2">{value}</div>
      <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className="text-[10px] sm:text-xs text-gray-400">{subtitle}</div>
    </motion.div>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function TeslaTestPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [houseVisible, setHouseVisible] = useState(false)
  const houseRef = useRef<HTMLDivElement>(null)

  // Auto-cycle hotspots
  useEffect(() => {
    if (!houseVisible) return
    const ids = ['fridge', 'oven', 'ac', 'tv', 'tablet']
    let i = 0
    const initial = setTimeout(() => {
      setActiveHotspot('fridge')
      i = 1
    }, 1200)
    const timer = setInterval(() => {
      if (i < ids.length) {
        setActiveHotspot(ids[i])
        i++
      } else {
        clearInterval(timer)
      }
    }, 2800)
    return () => { clearInterval(timer); clearTimeout(initial) }
  }, [houseVisible])

  // Observe house section
  useEffect(() => {
    if (!houseRef.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setHouseVisible(true)
    }, { threshold: 0.2 })
    obs.observe(houseRef.current)
    return () => obs.disconnect()
  }, [])

  const toggleHotspot = useCallback((id: string) => {
    setActiveHotspot(prev => prev === id ? null : id)
  }, [])

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  const hotspots = [
    {
      id: 'fridge',
      x: '20%', y: '38%',
      icon: Refrigerator,
      label: 'Nevera',
      delay: 0,
      hologramPosition: 'top' as const,
      hologramContent: {
        title: 'Nevera / Frigorífico',
        lines: [
          'Temperatura recomendada: 4°C (ya configurado)',
          'Cajón inferior: congelador (-18°C)',
          'El dispensador de hielo se activa con el botón lateral',
          'Por favor, vaciar antes del check-out',
        ],
        hasVideo: true,
      },
    },
    {
      id: 'oven',
      x: '33%', y: '30%',
      icon: UtensilsCrossed,
      label: 'Horno',
      delay: 0.3,
      hologramPosition: 'top' as const,
      hologramContent: {
        title: 'Horno & Microondas',
        lines: [
          'Horno: girar dial derecho para temperatura, izquierdo para modo',
          'Microondas: panel táctil superior, pulsar "Start"',
          'Bandeja de horno en el cajón inferior',
          'No usar papel de aluminio en el microondas',
        ],
        hasVideo: true,
      },
    },
    {
      id: 'ac',
      x: '57%', y: '30%',
      icon: Snowflake,
      label: 'Aire acondicionado',
      delay: 0.6,
      hologramPosition: 'top' as const,
      hologramContent: {
        title: 'Aire Acondicionado',
        lines: [
          'Mando en el cajón del mueble de la TV',
          'Modo frío: pulsar MODE hasta ver el copo de nieve',
          'Temperatura recomendada: 23-25°C',
          'Por favor, apagar al salir del apartamento',
        ],
        hasVideo: true,
      },
    },
    {
      id: 'tv',
      x: '68%', y: '35%',
      icon: Tv,
      label: 'Smart TV',
      delay: 0.8,
      hologramPosition: 'top' as const,
      hologramContent: {
        title: 'Smart TV Samsung',
        lines: [
          'Mando en el cajón de la mesa de centro',
          'Netflix, Prime Video y Disney+ con sesión iniciada',
          'WiFi: MiCasa_5G (conectada automáticamente)',
          'Chromecast integrado: buscar "Salón TV" desde tu móvil',
        ],
        hasVideo: true,
      },
    },
    {
      id: 'tablet',
      x: '22%', y: '72%',
      icon: Smartphone,
      label: 'Panel de control',
      delay: 1.0,
      hologramPosition: 'bottom' as const,
      hologramContent: {
        title: 'Panel del Apartamento',
        lines: [
          'Controla luces, AC y persianas desde la tablet',
          'Modo "Noche": apaga todas las luces a la vez',
          'Aire acondicionado: temperatura mínima 22°C',
          'PIN de acceso: últimos 4 dígitos de tu reserva',
        ],
        hasVideo: true,
      },
    },
  ]

  return (
    <div ref={containerRef} className="bg-white text-gray-900 min-h-screen selection:bg-violet-500/20">

      {/* ===== HERO ===== */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 via-white to-white" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.2) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extralight tracking-tight mb-4 sm:mb-6 text-gray-900">
              Itineramio
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-light text-gray-500 max-w-2xl mx-auto mb-3 sm:mb-4">
              Tu alojamiento, conectado
            </p>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md sm:max-w-lg mx-auto leading-relaxed">
              Un manual digital inteligente que transforma la experiencia de tus huéspedes.
              Todo accesible con un QR. Todo automatizado.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="mt-12 sm:mt-16">
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 mx-auto animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== HOUSE RENDER WITH HOTSPOTS ===== */}
      <section ref={houseRef} className="relative py-12 sm:py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight mb-3 sm:mb-4 text-gray-900">
            Cada dispositivo, <span className="text-violet-600">documentado</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto">
            El huésped escanea el QR y accede a las instrucciones de cada electrodoméstico. Con video incluido.
          </p>
        </motion.div>

        {/* House image container — NO overflow hidden so holograms can escape */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Ambient glow */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-violet-400/10 blur-3xl rounded-full" />

          {/* Image wrapper — overflow visible so holograms can go outside */}
          <div className="relative rounded-2xl" style={{ overflow: 'visible' }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/60">
              <Image
                src="/images/render-casa.webp"
                alt="Apartamento turístico conectado con Itineramio"
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
              />

              {/* Dark gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 pointer-events-none" />
            </div>

            {/* Hotspots — positioned relative to the image, holograms can overflow */}
            {hotspots.map(spot => (
              <Hotspot
                key={spot.id}
                {...spot}
                activeId={activeHotspot}
                onToggle={toggleHotspot}
              />
            ))}
          </div>

          {/* Scan instruction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: houseVisible ? 1 : 0 }}
            transition={{ delay: 3.5 }}
            className="flex justify-center mt-6"
          >
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-violet-200/40">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <QrCode className="w-4 h-4 text-violet-400" />
              </motion.div>
              <span className="text-[10px] sm:text-xs text-gray-400">Pulsa en cada QR para ver las instrucciones</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          <FeatureCard icon={MessageSquare} title="Menos mensajes" value="80%" subtitle="preguntas resueltas automáticamente" delay={0} />
          <FeatureCard icon={Star} title="Mejor rating" value="4.9" subtitle="media de nuestros anfitriones" delay={0.15} />
          <FeatureCard icon={QrCode} title="Setup" value="10'" subtitle="tu manual listo en minutos" delay={0.3} />
          <FeatureCard icon={Bell} title="Respuesta" value="0s" subtitle="información al instante" delay={0.45} />
        </div>
      </section>

      {/* ===== DUAL PHONES ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-violet-200/20 rounded-full blur-3xl" />

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight mb-3 sm:mb-4 text-gray-900">
            Dos mundos, <span className="text-violet-600">una plataforma</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto">
            El huésped ve su guía. Tú ves tu dashboard.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24 relative">
          {/* Guest phone */}
          <div className="text-center">
            <PhoneMockup side="left">
              <div className="p-3 sm:p-4 pt-7 sm:pt-8">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                    <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <div className="text-white text-xs sm:text-sm font-semibold">Mi Apartamento</div>
                  <div className="text-gray-500 text-[10px] sm:text-xs">Alicante, España</div>
                </div>
                {[
                  { icon: '🔑', title: 'Check-in', desc: 'Código: 4521#', bg: 'from-violet-900/50 to-violet-800/30' },
                  { icon: '📶', title: 'WiFi', desc: 'MiCasa_5G', bg: 'from-blue-900/50 to-blue-800/30' },
                  { icon: '🏠', title: 'Normas', desc: 'Horarios y convivencia', bg: 'from-emerald-900/50 to-emerald-800/30' },
                  { icon: '🍽️', title: 'Restaurantes', desc: '12 recomendaciones', bg: 'from-amber-900/50 to-amber-800/30' },
                  { icon: '🗺️', title: 'Transporte', desc: 'Metro, bus, parking', bg: 'from-cyan-900/50 to-cyan-800/30' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i + 0.3 }}
                    className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r ${item.bg} mb-1.5 sm:mb-2`}
                  >
                    <span className="text-base sm:text-lg">{item.icon}</span>
                    <div>
                      <div className="text-white text-[10px] sm:text-xs font-medium">{item.title}</div>
                      <div className="text-gray-400 text-[8px] sm:text-[10px]">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </PhoneMockup>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-gray-400 text-xs sm:text-sm mt-4 sm:mt-6">
              Vista del huésped
            </motion.p>
          </div>

          {/* Connection line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden md:block w-px h-40 bg-gradient-to-b from-transparent via-violet-500 to-transparent"
          />

          {/* Host phone */}
          <div className="text-center">
            <PhoneMockup side="right">
              <div className="p-3 sm:p-4 pt-7 sm:pt-8">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="text-white text-xs sm:text-sm font-semibold">Dashboard</div>
                  <div className="text-gray-500 text-[10px] sm:text-xs">Hoy</div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {[
                    { value: '3', label: 'Activas', color: 'text-green-400' },
                    { value: '94%', label: 'Ocupación', color: 'text-violet-400' },
                    { value: '4.92', label: 'Rating', color: 'text-yellow-400' },
                    { value: '12', label: 'Reservas', color: 'text-blue-400' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i + 0.5 }}
                      className="bg-gray-900/80 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center"
                    >
                      <div className={`text-base sm:text-lg font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-gray-500 text-[8px] sm:text-[9px]">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 mb-1.5 sm:mb-2 font-medium">Actividad reciente</div>
                {[
                  { text: 'Check-in: María G.', time: 'Hace 2h', dot: 'bg-green-500' },
                  { text: 'Reserva confirmada', time: 'Hace 5h', dot: 'bg-violet-500' },
                  { text: 'Reseña: 5 estrellas', time: 'Ayer', dot: 'bg-yellow-500' },
                  { text: 'QR escaneado: WiFi', time: 'Ayer', dot: 'bg-blue-500' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i + 0.7 }}
                    className="flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 border-b border-gray-800/50"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                    <div className="flex-1 text-gray-300 text-[9px] sm:text-[10px]">{item.text}</div>
                    <div className="text-gray-600 text-[8px] sm:text-[9px]">{item.time}</div>
                  </motion.div>
                ))}
              </div>
            </PhoneMockup>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-gray-400 text-xs sm:text-sm mt-4 sm:mt-6">
              Vista del anfitrión
            </motion.p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 border-t border-gray-100">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight mb-4 text-gray-900">Cómo funciona</h2>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-16 sm:space-y-32">
          {[
            { step: '01', title: 'Crea tu manual', description: 'Introduce la dirección. La IA genera todas las secciones: check-in, WiFi, normas, recomendaciones, electrodomésticos.', gradient: 'from-violet-500/10' },
            { step: '02', title: 'Coloca los QR', description: 'Descarga e imprime los códigos QR para cada zona. Entrada, cocina, salón — cada espacio con su propio código.', gradient: 'from-violet-400/10' },
            { step: '03', title: 'El huésped escanea', description: 'Sin apps. Sin PDFs. Escanea el QR con la cámara y accede a instrucciones, videos y recomendaciones al instante.', gradient: 'from-violet-500/10' },
            { step: '04', title: 'Tú descansas', description: 'Menos mensajes repetitivos. Mejor rating. Más tiempo para ti. Tu alojamiento funciona solo.', gradient: 'from-violet-400/10' },
          ].map(({ step, title, description, gradient }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col md:flex-row items-center gap-6 sm:gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0">
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${gradient} to-transparent flex items-center justify-center border border-gray-200/60`}>
                  <span className="text-4xl sm:text-5xl font-extralight text-gray-400">{step}</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900 mb-2 sm:mb-3">{title}</h3>
                <p className="text-gray-400 text-sm sm:text-lg leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-violet-200/15 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extralight mb-4 sm:mb-6 text-gray-900">Pruébalo gratis</h2>
          <p className="text-gray-400 text-sm sm:text-lg mb-8 sm:mb-12">15 días. Sin tarjeta. Tu manual listo en 10 minutos.</p>

          <motion.a
            href="/consulta"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-8 sm:px-10 py-3.5 sm:py-4 bg-violet-600 text-white font-medium rounded-full text-base sm:text-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20"
          >
            Solicita una prueba
          </motion.a>

          <p className="text-gray-300 text-[10px] sm:text-xs mt-6 sm:mt-8">Sin compromiso. Cancela cuando quieras.</p>
        </motion.div>
      </section>

      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-100 text-center">
        <p className="text-gray-300 text-xs sm:text-sm">Itineramio — Prototipo landing</p>
      </footer>
    </div>
  )
}
