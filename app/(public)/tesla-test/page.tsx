'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Wifi, Key, MapPin, Star, Bell, MessageSquare, QrCode, Smartphone, ChevronDown, Play, Tv, UtensilsCrossed, Refrigerator, Snowflake, LogIn, LogOut, ClipboardList, Car, Wind, Microwave, Compass, Coffee, Bot, Globe, ExternalLink } from 'lucide-react'
import Image from 'next/image'

// ============================================
// GOLDEN RATIO TIMING SYSTEM
// ============================================
// φ = 1.618 — all durations and delays derive from this
const PHI = 1.618
const GOLDEN = {
  // Durations (seconds)
  fast: 0.5,          // quick micro-interactions
  base: 0.8,          // standard element entry
  slow: 1.3,          // hero-level reveals
  slower: 2.1,        // atmospheric animations
  slowest: 3.4,       // background ambient loops
  // Stagger delays between siblings
  stagger: 0.1 * PHI, // ~0.162s
  // Ease — organic deceleration curve
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  // Spring — soft, no bounce
  spring: { type: 'spring' as const, damping: 20, stiffness: 80 },
  // Spring — with gentle settle
  springSettle: { type: 'spring' as const, damping: 25, stiffness: 60 },
  // Pulse durations (loops)
  pulse: 2.6,         // QR pulse rings
  scan: 5,            // hologram scan line
  breathe: 3.4,       // subtle breathing animations
}

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
        style={{ width: 28, height: 28, left: '50%', top: '50%', marginLeft: -14, marginTop: -14 }}
        animate={{ scale: [1, 2, 2.6], opacity: [0.5, 0.15, 0] }}
        transition={{ duration: GOLDEN.pulse, repeat: Infinity, delay, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute rounded-full border border-violet-300/40"
        style={{ width: 28, height: 28, left: '50%', top: '50%', marginLeft: -14, marginTop: -14 }}
        animate={{ scale: [1, 1.6, 2.2], opacity: [0.3, 0.1, 0] }}
        transition={{ duration: GOLDEN.pulse, repeat: Infinity, delay: delay + GOLDEN.pulse * 0.382, ease: 'easeOut' }}
      />

      {/* Circular dot with mini QR inside */}
      <motion.button
        onClick={() => onToggle(id)}
        className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-violet-600/80 backdrop-blur-sm border-2 border-violet-400/60 cursor-pointer flex items-center justify-center shadow-lg shadow-violet-500/50"
        whileHover={{ scale: 1.2, borderColor: 'rgba(167, 139, 250, 0.9)', transition: { duration: GOLDEN.fast, ease: GOLDEN.ease } }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.3, ...GOLDEN.spring }}
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
        <span className="text-[9px] sm:text-[10px] font-medium text-white/80 bg-black/70 px-2 py-0.5 rounded-full backdrop-blur-sm border border-violet-500/20">
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
              className={`absolute left-1/2 -translate-x-1/2 w-px bg-gradient-to-t from-violet-400/40 to-violet-300/15 ${
                hologramPosition === 'bottom' ? 'top-full h-3 origin-top' : 'bottom-full h-3 origin-bottom'
              }`}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: hologramPosition === 'bottom' ? -8 : 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
              transition={{ duration: GOLDEN.base, ease: GOLDEN.ease }}
              className={`absolute ${holoPositionClass} w-48 sm:w-72`}
              style={{ transformOrigin: holoOrigin, zIndex: 100 }}
            >
              <div className="rounded-2xl border border-violet-400/15 bg-gradient-to-b from-violet-950/50 via-[#1a0a3e]/40 to-violet-950/35 backdrop-blur-xl shadow-2xl shadow-violet-900/20 overflow-hidden">
                {/* Hologram scan line */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
                >
                  <motion.div
                    className="w-full h-12 bg-gradient-to-b from-violet-400/8 via-violet-300/4 to-transparent"
                    animate={{ y: [-48, 300] }}
                    transition={{ duration: GOLDEN.scan, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>

                {/* Subtle noise/glass texture */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.03]"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
                />

                {/* Header */}
                <div className="px-4 pt-4 pb-2 border-b border-violet-400/8 relative">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-violet-300/80" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-semibold text-white/90">{hologramContent.title}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 py-3 space-y-2.5 relative">
                  {hologramContent.lines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: GOLDEN.stagger * i + 0.2, duration: GOLDEN.fast, ease: GOLDEN.ease }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400/70 mt-1.5 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs text-gray-300/80 leading-relaxed">{line}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Video preview */}
                {hologramContent.hasVideo && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: GOLDEN.stagger * 5, duration: GOLDEN.base, ease: GOLDEN.ease }}
                    className="mx-4 mb-4 rounded-xl bg-white/[0.03] border border-violet-400/10 overflow-hidden cursor-pointer group hover:bg-white/[0.06] hover:border-violet-400/20 transition-all"
                  >
                    {/* Video thumbnail bar */}
                    <div className="p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-500/10 group-hover:bg-violet-500/20 flex items-center justify-center flex-shrink-0 transition-colors border border-violet-400/15">
                        <Play className="w-4 h-4 text-violet-300/70 ml-0.5" fill="currentColor" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-white/80">Ver video tutorial</div>
                        <div className="text-[9px] text-violet-400/40">0:45 seg</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bottom gradient line */}
                <div className="h-px bg-gradient-to-r from-transparent via-violet-400/15 to-transparent" />
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
      transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
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
function FeatureCard({ icon: Icon, title, value, subtitle, delay, light }: {
  icon: any; title: string; value: string; subtitle: string; delay: number; light?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: GOLDEN.base, delay, ease: GOLDEN.ease }}
      className="text-center"
    >
      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 ${light ? 'text-violet-600' : 'text-violet-400'}`} strokeWidth={1.5} />
      <div className={`text-3xl sm:text-4xl font-extralight mb-1 sm:mb-2 ${light ? 'text-gray-900' : 'text-white'}`}>{value}</div>
      <div className={`text-xs sm:text-sm font-medium mb-1 ${light ? 'text-gray-700' : 'text-gray-300'}`}>{title}</div>
      <div className={`text-[10px] sm:text-xs ${light ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</div>
    </motion.div>
  )
}

// ============================================
// ZONES CAROUSEL — Tesla dark style
// ============================================
const ZONE_SETS = [
  [
    { label: 'Check-in', icon: LogIn },
    { label: 'Check-out', icon: LogOut },
    { label: 'WiFi', icon: Wifi },
    { label: 'Normas', icon: ClipboardList },
    { label: 'Parking', icon: Car },
    { label: 'Aire A/C', icon: Wind },
  ],
  [
    { label: 'Vitrocerámica', icon: Tv },
    { label: 'Lavadora', icon: Refrigerator },
    { label: 'Microondas', icon: Microwave },
    { label: 'Restaurantes', icon: UtensilsCrossed },
    { label: 'Qué ver', icon: Compass },
    { label: 'Coffee Shops', icon: Coffee },
  ],
]

function TeslaZonesCarousel() {
  const [page, setPage] = useState(0)
  // Longer interval to give time for staggered entry
  useEffect(() => {
    const t = setInterval(() => setPage(p => (p + 1) % ZONE_SETS.length), 5000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="w-full max-w-[280px]">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={page}
            initial={{}}
            animate={{}}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="grid grid-cols-3 gap-2">
            {ZONE_SETS[page].map((z, i) => (
              <motion.div
                key={z.label}
                initial={{ opacity: 0, scale: 0.4, y: 15, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: i * GOLDEN.stagger,
                  duration: GOLDEN.base,
                  ease: GOLDEN.ease,
                  scale: { ...GOLDEN.spring, delay: i * GOLDEN.stagger },
                }}
                className="rounded-[14px] p-3 flex flex-col items-center justify-center gap-1.5 aspect-square" style={{ backgroundColor: '#f0efed' }}
              >
                <motion.div
                  initial={{ rotate: -15, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    delay: i * GOLDEN.stagger + 0.25,
                    ...GOLDEN.spring,
                  }}
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#555]" style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                >
                  <z.icon className="w-4 h-4" strokeWidth={1.5} />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * GOLDEN.stagger + 0.35, duration: GOLDEN.fast, ease: GOLDEN.ease }}
                  className="text-[10px] font-semibold text-[#555] text-center leading-tight"
                >
                  {z.label}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {ZONE_SETS.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i === page ? 'w-4 h-1.5 bg-violet-600' : 'w-1.5 h-1.5 bg-black/10'}`} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// INFINITE CHAT — Tesla dark style
// ============================================
const CHAT_CONVOS = [
  { q: '¿Cuál es la clave del WiFi?', a: 'Red: MiCasa_5G — Clave: balcon2024#' },
  { q: '¿A qué hora es el checkout?', a: 'El checkout es a las 11:00h. Deja las llaves dentro.' },
  { q: '¿Cómo entro? No encuentro las llaves', a: 'Caja gris a la derecha de la puerta. Código: 4521, mantén 2 seg.' },
  { q: '¿Dónde puedo aparcar?', a: 'Plaza B-14. Pase magnético en el cajón de la cocina.' },
]

function TeslaChat() {
  const [idx, setIdx] = useState(0)
  const [stage, setStage] = useState<'q' | 'typing' | 'a' | 'pause'>('q')
  useEffect(() => {
    const delays = { q: 1200, typing: 1100, a: 3200, pause: 500 }
    const next = { q: 'typing' as const, typing: 'a' as const, a: 'pause' as const, pause: 'q' as const }
    const t = setTimeout(() => {
      if (stage === 'pause') setIdx(p => (p + 1) % CHAT_CONVOS.length)
      setStage(next[stage])
    }, delays[stage])
    return () => clearTimeout(t)
  }, [stage, idx])
  const convo = CHAT_CONVOS[idx]
  return (
    <div className="w-full max-w-[300px] bg-white rounded-t-[16px] p-4 flex flex-col gap-2.5" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 pb-2 border-b border-black/[0.05]">
        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
          <Bot className="w-3 h-3 text-violet-600" />
        </div>
        <span className="text-[11px] font-semibold text-[#111]">Asistente IA</span>
        <span className="ml-auto text-[9px] text-green-500 font-medium flex items-center gap-1">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: GOLDEN.breathe, repeat: Infinity }}
          />
          En línea
        </span>
      </div>
      <div className="flex flex-col gap-2 min-h-[80px] justify-end">
        <AnimatePresence mode="wait">
          <motion.div key={`q-${idx}`}
            initial={{ opacity: 0, y: 10, scale: 0.92, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: GOLDEN.fast, ease: GOLDEN.ease }}
            className="self-end bg-[#111] text-white text-[10px] px-2.5 py-1.5 rounded-2xl rounded-br-sm max-w-[165px] leading-relaxed">
            {convo.q}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {stage === 'typing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: GOLDEN.fast, ease: GOLDEN.ease }}
              className="self-start bg-[#f5f3f0] px-2.5 py-2 rounded-2xl rounded-bl-sm flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.16 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#aaa]" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {(stage === 'a' || stage === 'pause') && (
            <motion.div key={`a-${idx}`}
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(2px)' }}
              transition={{ duration: GOLDEN.base, ease: GOLDEN.ease }}
              className="self-start bg-[#f5f3f0] text-[#111] text-[10px] px-2.5 py-1.5 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed">
              {convo.a}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================
// MULTI-LANG — Tesla dark style
// ============================================
const LANG_CONVOS = [
  { lang: 'EN', q: "What's the WiFi password?", a: 'Network: MiCasa_5G — Password: balcon2024#' },
  { lang: 'ES', q: '¿A qué hora es el checkout?', a: 'El checkout es a las 11:00h.' },
  { lang: 'FR', q: "C'est quoi le WiFi?", a: 'Réseau: MiCasa_5G — Mdp: balcon2024#' },
]

function TeslaMultiLang() {
  const [idx, setIdx] = useState(0)
  const [showA, setShowA] = useState(false)
  useEffect(() => {
    setShowA(false)
    const t1 = setTimeout(() => setShowA(true), 1600)
    const t2 = setTimeout(() => setIdx(p => (p + 1) % LANG_CONVOS.length), 4200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [idx])
  const convo = LANG_CONVOS[idx]
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: GOLDEN.fast, ease: GOLDEN.ease }}
          className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Globe className="w-3.5 h-3.5 text-[#bbb]" strokeWidth={1.5} />
            <span className="text-[9px] font-bold text-[#bbb]">{convo.lang}</span>
          </div>
          <div className="self-end bg-[#111] text-white text-[10px] px-2.5 py-1.5 rounded-2xl rounded-br-sm max-w-[180px] leading-relaxed">
            {convo.q}
          </div>
          <AnimatePresence>
            {showA && (
              <motion.div
                initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: GOLDEN.fast, ease: GOLDEN.ease }}
                className="self-start bg-[#f5f3f0] text-[#111] text-[10px] px-2.5 py-1.5 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed border border-black/[0.05]">
                {convo.a}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================================
// FLOATING CHATBOT HOLOGRAM
// ============================================
const FLOATING_CHAT_CONVOS = [
  { q: '¿Cómo entro al apartamento?', a: 'Caja gris a la derecha de la puerta. Código: 4521, mantén 2 segundos hasta que oigas el click.' },
  { q: '¿Cuál es la clave del WiFi?', a: 'Red: MiCasa_5G — Contraseña: balcon2024#' },
  { q: '¿Dónde puedo aparcar?', a: 'Plaza B-14 en el parking subterráneo. El pase magnético está en el cajón izquierdo de la cocina.' },
  { q: '¿A qué hora es el checkout?', a: 'A las 11:00h. Deja las llaves dentro del lockbox y cierra la puerta.' },
]

function FloatingChatbot() {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const [stage, setStage] = useState<'idle' | 'q' | 'typing' | 'a'>('idle')
  const [input, setInput] = useState('')

  // Auto-play conversation when open
  useEffect(() => {
    if (!open) { setStage('idle'); return }
    if (stage === 'idle') {
      const t = setTimeout(() => setStage('q'), 800)
      return () => clearTimeout(t)
    }
    const delays = { q: 1500, typing: 1200, a: 4000, idle: 0 }
    const next = { q: 'typing' as const, typing: 'a' as const, a: 'q' as const, idle: 'q' as const }
    const t = setTimeout(() => {
      if (stage === 'a') setIdx(p => (p + 1) % FLOATING_CHAT_CONVOS.length)
      setStage(next[stage])
    }, delays[stage])
    return () => clearTimeout(t)
  }, [stage, open, idx])

  const convo = FLOATING_CHAT_CONVOS[idx]

  return (
    <>
      {/* Chat button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-violet-600 shadow-xl shadow-violet-500/30 flex items-center justify-center cursor-pointer border border-violet-400/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, ...GOLDEN.spring }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse when closed */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-violet-400/40"
            animate={{ scale: [1, 1.5, 1.8], opacity: [0.4, 0.1, 0] }}
            transition={{ duration: GOLDEN.pulse, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(8px)' }}
            transition={{ duration: GOLDEN.base, ease: GOLDEN.ease }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] max-h-[500px] rounded-2xl overflow-hidden"
          >
            {/* Hologram background */}
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/60 via-[#1a0a3e]/50 to-gray-950/70 backdrop-blur-2xl" />
            <div className="absolute inset-0 border border-violet-400/15 rounded-2xl pointer-events-none" />

            {/* Scan line */}
            <motion.div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <motion.div
                className="w-full h-16 bg-gradient-to-b from-violet-400/5 via-violet-300/2 to-transparent"
                animate={{ y: [-64, 500] }}
                transition={{ duration: GOLDEN.scan * 1.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            {/* Noise */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.02]"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
            />

            <div className="relative flex flex-col h-full">
              {/* Header */}
              <div className="px-5 py-4 border-b border-violet-400/8 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-violet-300" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/90">Asistente IA</div>
                  <div className="text-[10px] text-gray-500">Responde usando la info de tu apartamento</div>
                </div>
                <span className="flex items-center gap-1.5">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: GOLDEN.breathe, repeat: Infinity }}
                  />
                  <span className="text-[10px] text-green-400/70">En línea</span>
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 px-5 py-4 flex flex-col gap-3 min-h-[250px] justify-end overflow-y-auto">
                {/* Welcome message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: GOLDEN.base }}
                  className="text-center py-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-400/10 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-5 h-5 text-violet-400/60" />
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                    Pregunta lo que necesites sobre el apartamento. Respondo al instante.
                  </p>
                </motion.div>

                {/* Auto-playing conversation */}
                <AnimatePresence mode="wait">
                  {(stage === 'q' || stage === 'typing' || stage === 'a') && (
                    <motion.div
                      key={`fq-${idx}`}
                      initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
                      transition={{ duration: GOLDEN.fast, ease: GOLDEN.ease }}
                      className="self-end bg-violet-500/25 border border-violet-400/15 text-white/90 text-[13px] px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[240px] leading-relaxed backdrop-blur-sm"
                    >
                      {convo.q}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {stage === 'typing' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: GOLDEN.fast, ease: GOLDEN.ease }}
                      className="self-start bg-white/[0.03] border border-violet-400/8 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 backdrop-blur-sm"
                    >
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.16 }}
                          className="w-2 h-2 rounded-full bg-violet-400/40" />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {stage === 'a' && (
                    <motion.div
                      key={`fa-${idx}`}
                      initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, filter: 'blur(2px)' }}
                      transition={{ duration: GOLDEN.base, ease: GOLDEN.ease }}
                      className="self-start bg-white/[0.04] border border-violet-400/8 text-gray-200/80 text-[13px] px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[260px] leading-relaxed backdrop-blur-sm"
                    >
                      {convo.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input bar */}
              <div className="px-4 pb-4 pt-2 border-t border-violet-400/5">
                <div className="flex items-center gap-2 bg-white/[0.04] border border-violet-400/10 rounded-xl px-4 py-3">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    className="flex-1 bg-transparent text-sm text-white/80 placeholder-gray-600 outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center"
                  >
                    <ChevronDown className="w-4 h-4 text-violet-300 rotate-[-90deg]" />
                  </motion.button>
                </div>
              </div>

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/10 to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
    }, 1600)
    const timer = setInterval(() => {
      if (i < ids.length) {
        setActiveHotspot(ids[i])
        i++
      } else {
        clearInterval(timer)
      }
    }, 3400)
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
    <div ref={containerRef} className="min-h-screen selection:bg-violet-500/20">

      {/* ===== HERO — WHITE (matching production) ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden bg-white">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div animate={{ opacity: [0.6, 1, 0.6], scale: [0.97, 1.03, 0.97] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[60%]"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
          />
          <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.12, 0, 0.12] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="absolute top-[28%] left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/30"
          />
          <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.06, 0, 0.06] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 2.5 }}
            className="absolute top-[28%] left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/20"
          />
        </div>

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} className="object-contain" />
              <span className="font-semibold text-[15px] text-[#111]">Itineramio</span>
            </a>
            <div className="hidden md:flex items-center gap-7">
              {[['Funcionalidades', '#product'], ['Blog', '/blog'], ['Recursos', '#resources'], ['Precios', '#pricing'], ['Casos de Éxito', '#cases']].map(([l, h]) => (
                <a key={l} href={h} className="text-sm text-[#666] hover:text-[#111] transition-colors font-medium">{l}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a href="/login" className="hidden sm:block text-sm text-[#666] hover:text-[#111] font-medium transition-colors">Iniciar Sesión</a>
              <a href="/consulta" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: '#7c3aed', boxShadow: '0 2px 12px rgba(124,58,237,0.3)' }}>
                Registrarse
              </a>
            </div>
          </div>
        </nav>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: GOLDEN.fast, ease: GOLDEN.ease }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm text-violet-700 font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
          Para anfitriones con 6 a 10 apartamentos en España
        </motion.div>

        {/* Heading */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: GOLDEN.base, delay: 0.1, ease: GOLDEN.ease }}
          className="leading-[1.05] tracking-tight mb-4 max-w-4xl"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
          <span className="font-semibold text-[#111]">Los huéspedes no leen. </span>
          <span className="font-light text-[#aaa]">Y tú sigues enviando el mismo mensaje una y otra vez.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: GOLDEN.fast, ease: GOLDEN.ease }}
          className="text-base font-normal text-[#555] mb-10 max-w-xl leading-relaxed">
          Crea una guía una vez y haz que se envíe automáticamente al confirmarse la reserva. Así llegan sabiendo cómo entrar, dónde aparcar y cuál es la clave del WiFi. Tú dejas de repetir lo mismo cada semana.
        </motion.p>

        {/* Buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: GOLDEN.fast, ease: GOLDEN.ease }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-3">
          <a href="/consulta" className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base text-white transition-all"
            style={{ backgroundColor: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
            Empieza gratis <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/consulta" className="inline-flex items-center gap-2 border border-black/10 text-[#666] hover:text-[#111] hover:border-black/20 px-8 py-4 rounded-full font-medium text-base transition-all">
            Ver demo
          </a>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: GOLDEN.fast }}
          className="text-sm text-[#bbb] mb-16">
          No necesitas tarjeta. Configúralo en 10 minutos.
        </motion.p>
      </section>

      {/* ===== TESLA-STYLE PHONES WITH HOUSES — BLACK ===== */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 overflow-hidden bg-black text-white">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight mb-3 sm:mb-4">
            Tu propiedad en la <span className="text-violet-400">palma de tu mano</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg max-w-xl mx-auto">
            Controla todo desde tu móvil. Tu huésped accede al manual digital con un QR.
          </p>
        </motion.div>

        {/* ===== MOBILE LAYOUT: single phone + stats cards ===== */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-[280px] mx-auto mb-10"
          >
            {/* Single phone — Mi Casa */}
            <div className="bg-black rounded-[36px] p-2.5 shadow-2xl shadow-violet-900/20 border border-gray-800">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-10" />
              <div className="bg-gray-950 rounded-[28px] overflow-hidden relative">
                {/* Header */}
                <div className="p-4 pt-7 pb-2">
                  <div className="flex items-center justify-between">
                    <div />
                    <div className="text-center">
                      <div className="text-white text-sm font-medium">Mi Casa <span className="text-gray-600 text-[9px]">▾</span></div>
                      <div className="text-violet-400 text-[10px]">Conectado</div>
                    </div>
                    <div className="w-5 h-5 rounded bg-gray-800/50 flex items-center justify-center">
                      <QrCode className="w-3 h-3 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Houses image */}
                <div className="relative mx-3">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                    <Image src="/images/houses.webp" alt="Casa conectada" fill className="object-cover" />

                    {/* QR dots on TOP house */}
                    {[
                      { x: '30%', y: '33%', delay: 0 },
                      { x: '48%', y: '37%', delay: 0.4 },
                      { x: '70%', y: '34%', delay: 0.8 },
                    ].map((dot, i) => (
                      <div key={`mtop-${i}`} className="absolute" style={{ left: dot.x, top: dot.y, transform: 'translate(-50%, -50%)' }}>
                        <motion.div
                          className="absolute rounded-full border border-violet-400/40"
                          style={{ width: 18, height: 18, left: '50%', top: '50%', marginLeft: -9, marginTop: -9 }}
                          animate={{ scale: [1, 1.8, 2.3], opacity: [0.4, 0.1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: dot.delay }}
                        />
                        <div className="w-6 h-6 rounded-full bg-violet-600/70 backdrop-blur-sm border border-violet-400/40 flex items-center justify-center shadow-md shadow-violet-500/40">
                          <MiniQR size={12} />
                        </div>
                      </div>
                    ))}

                    {/* QR dots on BOTTOM house + fluorescent lines */}
                    {[
                      { x: '30%', y: '68%', delay: 0.2 },
                      { x: '50%', y: '65%', delay: 0.6 },
                      { x: '70%', y: '70%', delay: 1.0 },
                    ].map((dot, i) => (
                      <div key={`mbot-${i}`} className="absolute" style={{ left: dot.x, top: dot.y, transform: 'translate(-50%, -50%)' }}>
                        <motion.div
                          className="absolute rounded-full border border-violet-400/50"
                          style={{ width: 16, height: 16, left: '50%', top: '50%', marginLeft: -8, marginTop: -8 }}
                          animate={{ scale: [1, 2, 2.8], opacity: [0.5, 0.1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: dot.delay }}
                        />
                        <div className="w-3 h-3 rounded-full bg-violet-500 shadow-lg shadow-violet-500/60" />
                      </div>
                    ))}

                    {/* Fluorescent lines from bottom house */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 280">
                      <defs>
                        <linearGradient id="mflGrad" x1="0" y1="1" x2="0.3" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
                        </linearGradient>
                        <filter id="mflGlow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                      </defs>
                      <motion.path d="M 60 190 Q 30 160 -10 130" fill="none" stroke="url(#mflGrad)" strokeWidth="1.5" filter="url(#mflGlow)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: GOLDEN.slower, delay: 0.5, ease: GOLDEN.ease }} />
                      <motion.path d="M 100 182 Q 100 140 100 90" fill="none" stroke="url(#mflGrad)" strokeWidth="1.5" filter="url(#mflGlow)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: GOLDEN.slower, delay: 1.0, ease: GOLDEN.ease }} />
                      <motion.path d="M 140 196 Q 170 160 210 130" fill="none" stroke="url(#mflGrad)" strokeWidth="1.5" filter="url(#mflGlow)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: GOLDEN.slower, delay: 1.5, ease: GOLDEN.ease }} />
                      {[
                        { cx: [60, 30, -10], cy: [190, 160, 130], d: 0.3 },
                        { cx: [100, 100, 100], cy: [182, 140, 90], d: 0.7 },
                        { cx: [140, 170, 210], cy: [196, 160, 130], d: 1.1 },
                      ].map((p, i) => (
                        <motion.circle key={i} r="2" fill="#a78bfa" filter="url(#mflGlow)"
                          animate={{ cx: p.cx, cy: p.cy, opacity: [0, 1, 0] }}
                          transition={{ duration: GOLDEN.slowest, delay: p.d, repeat: Infinity, ease: 'linear' }} />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Bottom info */}
                <div className="px-4 py-3 space-y-2">
                  {[
                    { icon: Key, label: 'Check-in', value: 'Lockbox 4521#' },
                    { icon: Wifi, label: 'WiFi', value: 'MiCasa_5G' },
                    { icon: Bell, label: 'Normas', value: '3 reglas' },
                    { icon: MapPin, label: 'Lugares', value: '12 cerca' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5 text-violet-400/70" strokeWidth={1.5} />
                        <span className="text-xs text-gray-400">{item.label}</span>
                      </div>
                      <span className="text-[11px] text-gray-500">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats cards below phone — mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: GOLDEN.slow, delay: 0.5, ease: GOLDEN.ease }}
            className="max-w-sm mx-auto"
          >
            <div className="bg-gray-950 rounded-2xl border border-gray-800/50 p-5">
              <div className="text-gray-500 text-xs mb-1">Hoy</div>
              <div className="text-white text-3xl font-light mb-1">34</div>
              <div className="text-gray-500 text-xs mb-4">preguntas respondidas</div>

              {/* Mini chart */}
              <div className="relative h-16 mb-4 rounded-lg overflow-hidden bg-gray-900/50">
                <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <path d="M0 30 Q8 28 15 25 T25 22 T35 18 T45 20 T55 14 T65 16 T75 10 T85 12 T100 8 L100 40 L0 40 Z" fill="url(#mChartGrad)" />
                  <path d="M0 30 Q8 28 15 25 T25 22 T35 18 T45 20 T55 14 T65 16 T75 10 T85 12 T100 8" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 mb-5">
                <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
              </div>

              {/* Breakdown */}
              <div className="text-gray-500 text-xs mb-3 font-medium">Desglose</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Check-in', value: '4', pct: 12 },
                  { label: 'WiFi', value: '12', pct: 35 },
                  { label: 'Normas', value: '6', pct: 18 },
                  { label: 'Restaurantes', value: '8', pct: 24 },
                  { label: 'Transporte', value: '4', pct: 12 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className="text-xs text-white font-medium">{item.value}</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-violet-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 * i }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===== DESKTOP LAYOUT: two phones stacked ===== */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative max-w-lg mx-auto hidden md:block"
          style={{ height: '700px' }}
        >
          {/* Phone BACK (chatbot stats) — slightly behind and to the left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: GOLDEN.slow, delay: 0.5, ease: GOLDEN.ease }}
            className="absolute left-0 top-8 sm:left-4 sm:top-8 z-10"
            style={{ width: 'clamp(180px, 42vw, 220px)' }}
          >
            <div className="bg-black rounded-[28px] sm:rounded-[36px] p-2 sm:p-2.5 shadow-2xl shadow-black/60 border border-gray-800/80">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-4 sm:h-5 bg-black rounded-b-xl z-10" />
              <div className="bg-gray-950 rounded-[22px] sm:rounded-[28px] overflow-hidden aspect-[9/19.5]">
                <div className="p-3 sm:p-4 pt-6 sm:pt-7">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="text-[9px] sm:text-[10px] text-gray-500">← Inicio</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-400">Hoy ▾</div>
                  </div>
                  <div className="text-gray-500 text-[9px] sm:text-[9px] mb-0.5">Preguntas respondidas</div>
                  <div className="text-white text-xl sm:text-2xl font-light mb-2 sm:mb-3">34</div>

                  {/* Mini chart */}
                  <div className="relative h-12 sm:h-20 mb-2 sm:mb-3 rounded-lg overflow-hidden bg-gray-900/50">
                    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <path d="M0 30 Q8 28 15 25 T25 22 T35 18 T45 20 T55 14 T65 16 T75 10 T85 12 T100 8 L100 40 L0 40 Z" fill="url(#chartGrad)" />
                      <path d="M0 30 Q8 28 15 25 T25 22 T35 18 T45 20 T55 14 T65 16 T75 10 T85 12 T100 8" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                    </svg>
                  </div>

                  <div className="flex justify-between text-[8px] sm:text-[8px] text-gray-600 mb-2 sm:mb-4">
                    <span>Lun</span><span>Mié</span><span>Vie</span><span>Dom</span>
                  </div>

                  {/* Breakdown by category */}
                  <div className="text-gray-500 text-[9px] sm:text-[9px] mb-1.5 sm:mb-2 font-medium">Desglose</div>
                  <div className="space-y-1 sm:space-y-1.5">
                    {[
                      { label: 'Check-in', value: '4', color: 'bg-violet-500' },
                      { label: 'WiFi', value: '12', color: 'bg-violet-400' },
                      { label: 'Normas', value: '6', color: 'bg-violet-300' },
                      { label: 'Restaurantes', value: '8', color: 'bg-violet-200' },
                      { label: 'Transporte', value: '4', color: 'bg-violet-100' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${item.color}`} />
                          <span className="text-[9px] sm:text-[9px] text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-[9px] sm:text-[9px] text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Phone FRONT (main — Mi Casa) — in front and to the right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: GOLDEN.slow, delay: 0.2, ease: GOLDEN.ease }}
            className="absolute right-0 sm:right-4 top-0 z-20"
            style={{ width: 'clamp(210px, 50vw, 280px)' }}
          >
            <div className="bg-black rounded-[32px] sm:rounded-[40px] p-2.5 sm:p-3 shadow-2xl shadow-violet-900/20 border border-gray-800">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-28 h-5 sm:h-6 bg-black rounded-b-2xl z-10" />
              <div className="bg-gray-950 rounded-[26px] sm:rounded-[32px] overflow-hidden aspect-[9/19.5] relative">
                {/* Header — Tesla style */}
                <div className="p-3 sm:p-4 pt-6 sm:pt-7 pb-2">
                  <div className="flex items-center justify-between">
                    <div />
                    <div className="text-center">
                      <div className="text-white text-xs sm:text-sm font-medium">Mi Casa <span className="text-gray-600 text-[9px]">▾</span></div>
                      <div className="text-violet-400 text-[9px]">Conectado</div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-gray-800/50 flex items-center justify-center">
                        <QrCode className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Houses image — full width */}
                <div className="relative mx-1.5 sm:mx-3">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                    <Image
                      src="/images/houses.webp"
                      alt="Casa conectada"
                      fill
                      className="object-cover"
                    />

                    {/* QR dots on TOP house (casa abierta) — inside the house */}
                    {[
                      { x: '30%', y: '33%', delay: 0 },
                      { x: '48%', y: '37%', delay: 0.4 },
                      { x: '70%', y: '34%', delay: 0.8 },
                    ].map((dot, i) => (
                      <div key={`top-${i}`} className="absolute" style={{ left: dot.x, top: dot.y, transform: 'translate(-50%, -50%)' }}>
                        <motion.div
                          className="absolute rounded-full border border-violet-400/40"
                          style={{ width: 18, height: 18, left: '50%', top: '50%', marginLeft: -9, marginTop: -9 }}
                          animate={{ scale: [1, 1.8, 2.3], opacity: [0.4, 0.1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: dot.delay }}
                        />
                        <div className="w-5 h-5 rounded-full bg-violet-600/70 backdrop-blur-sm border border-violet-400/40 flex items-center justify-center shadow-md shadow-violet-500/40">
                          <MiniQR size={10} />
                        </div>
                      </div>
                    ))}

                    {/* QR dots on BOTTOM house (casita isométrica) + fluorescent lines */}
                    {[
                      { x: '30%', y: '68%', delay: 0.2 },
                      { x: '50%', y: '65%', delay: 0.6 },
                      { x: '70%', y: '70%', delay: 1.0 },
                    ].map((dot, i) => (
                      <div key={`bot-${i}`} className="absolute" style={{ left: dot.x, top: dot.y, transform: 'translate(-50%, -50%)' }}>
                        <motion.div
                          className="absolute rounded-full border border-violet-400/50"
                          style={{ width: 14, height: 14, left: '50%', top: '50%', marginLeft: -7, marginTop: -7 }}
                          animate={{ scale: [1, 2, 2.8], opacity: [0.5, 0.1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: dot.delay }}
                        />
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-lg shadow-violet-500/60" />
                      </div>
                    ))}

                    {/* Fluorescent lines from BOTTOM house going outward/upward */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 280">
                      <defs>
                        <linearGradient id="flGrad1" x1="0" y1="1" x2="0.3" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
                        </linearGradient>
                        <filter id="flGlow">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      {/* Lines radiating outward from bottom house */}
                      <motion.path d="M 60 190 Q 30 160 -10 130" fill="none" stroke="url(#flGrad1)" strokeWidth="1.5" filter="url(#flGlow)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: GOLDEN.slower, delay: 0.5, ease: GOLDEN.ease }} />
                      <motion.path d="M 100 182 Q 100 140 100 90" fill="none" stroke="url(#flGrad1)" strokeWidth="1.5" filter="url(#flGlow)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: GOLDEN.slower, delay: 1.0, ease: GOLDEN.ease }} />
                      <motion.path d="M 140 196 Q 170 160 210 130" fill="none" stroke="url(#flGrad1)" strokeWidth="1.5" filter="url(#flGlow)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: GOLDEN.slower, delay: 1.5, ease: GOLDEN.ease }} />

                      {/* Particles along lines */}
                      {[
                        { cx: [60, 30, -10], cy: [190, 160, 130], d: 0.3 },
                        { cx: [100, 100, 100], cy: [182, 140, 90], d: 0.7 },
                        { cx: [140, 170, 210], cy: [196, 160, 130], d: 1.1 },
                      ].map((p, i) => (
                        <motion.circle key={i} r="2" fill="#a78bfa" filter="url(#flGlow)"
                          animate={{ cx: p.cx, cy: p.cy, opacity: [0, 1, 0] }}
                          transition={{ duration: GOLDEN.slowest, delay: p.d, repeat: Infinity, ease: 'linear' }}
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Bottom — Mi Casa info with vector icons (Tesla style) */}
                <div className="px-3 sm:px-4 py-2 sm:py-3">
                  <div className="space-y-1.5">
                    {[
                      { icon: Key, label: 'Check-in', value: 'Lockbox 4521#' },
                      { icon: Wifi, label: 'WiFi', value: 'MiCasa_5G' },
                      { icon: Bell, label: 'Normas', value: '3 reglas' },
                      { icon: MapPin, label: 'Lugares', value: '12 cerca' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.2 + i * 0.12 }}
                        className="flex items-center justify-between py-0.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <item.icon className="w-3 h-3 text-violet-400/70" strokeWidth={1.5} />
                          <span className="text-[9px] sm:text-[10px] text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-[8px] sm:text-[9px] text-gray-500">{item.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ambient glow between phones */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-violet-600/8 rounded-full blur-3xl z-0" />
        </motion.div>
      </section>

      {/* ===== HOUSE RENDER WITH HOTSPOTS — BLACK ===== */}
      <section ref={houseRef} className="relative pt-12 sm:pt-20 bg-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
          className="text-center mb-8 sm:mb-12 px-4 sm:px-6"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight mb-3 sm:mb-4">
            Cada dispositivo, <span className="text-violet-400">documentado</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg max-w-xl mx-auto">
            El huésped escanea el QR y accede a las instrucciones de cada electrodoméstico. Con video incluido.
          </p>
        </motion.div>

        {/* House image container — full width */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
          className="relative w-full"
        >
          {/* Image wrapper — overflow visible so holograms can go outside */}
          <div className="relative" style={{ overflow: 'visible' }}>
            <div className="overflow-hidden">
              <Image
                src="/images/render-casa.webp"
                alt="Apartamento turístico conectado con Itineramio"
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
              />

              {/* Dark gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
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
            className="flex justify-center mt-6 pb-6"
          >
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-500/10">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <QrCode className="w-4 h-4 text-violet-400" />
              </motion.div>
              <span className="text-[10px] sm:text-xs text-gray-400">Pulsa en cada QR para ver las instrucciones</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== EL PRODUCTO — WHITE, clean ===== */}
      <section className="py-24 sm:py-36 px-6 bg-white">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
            className="text-center mb-20 sm:mb-28">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extralight leading-tight">
              <span className="text-[#111]">Todo lo que necesita el huésped. </span>
              <span className="text-[#ccc]">Sin que tú repitas nada.</span>
            </h2>
          </motion.div>

          {/* Feature 1: Guía por zonas */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: GOLDEN.base, ease: GOLDEN.ease }}
            className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-24 sm:mb-32">
            <div className="flex-1 order-2 md:order-1">
              <p className="text-[11px] font-semibold text-[#bbb] uppercase tracking-widest mb-3">Guía por zonas</p>
              <h3 className="text-xl sm:text-2xl font-light text-[#111] mb-3 leading-snug">
                Organiza la información en zonas
              </h3>
              <p className="text-[15px] text-[#777] leading-relaxed">
                Entrada, WiFi, normas, parking. El huésped encuentra lo que busca sin leer todo. Cada zona con su QR.
              </p>
            </div>
            <div className="flex-shrink-0 order-1 md:order-2">
              <TeslaZonesCarousel />
            </div>
          </motion.div>

          {/* Feature 2: Chatbot IA */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: GOLDEN.base, ease: GOLDEN.ease }}
            className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-24 sm:mb-32">
            <div className="flex-shrink-0">
              <TeslaChat />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-[#bbb] uppercase tracking-widest mb-3">Chatbot IA</p>
              <h3 className="text-xl sm:text-2xl font-light text-[#111] mb-3 leading-snug">
                Responde por ti, en su idioma
              </h3>
              <p className="text-[15px] text-[#777] leading-relaxed">
                Usando la información de tu propio apartamento. El huésped pregunta, el chatbot responde. Tú no haces nada.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 & 4: Two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 sm:gap-12">

            {/* Multi-idioma */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: GOLDEN.base, ease: GOLDEN.ease }}>
              <div className="mb-6">
                <TeslaMultiLang />
              </div>
              <p className="text-[11px] font-semibold text-[#bbb] uppercase tracking-widest mb-2">Multi-idioma</p>
              <p className="text-[15px] text-[#777] leading-relaxed">
                El chatbot detecta el idioma del huésped y responde en el suyo. Español, inglés, francés.
              </p>
            </motion.div>

            {/* Sin app */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: GOLDEN.stagger * 2, duration: GOLDEN.base, ease: GOLDEN.ease }}>
              <div className="mb-6">
                {/* Browser bar minimal */}
                <div className="w-full max-w-[240px] bg-white rounded-xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-50">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200" />)}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-full px-2.5 py-1 text-[9px] text-gray-400 truncate">
                      itineramio.com/guide/tu-apto
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-violet-50 flex items-center justify-center">
                        <MapPin className="w-2.5 h-2.5 text-violet-500" />
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full flex-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[0, 1, 2].map(i => <div key={i} className="rounded-lg h-7 bg-gray-50" />)}
                    </div>
                    <div className="h-1.5 bg-gray-50 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-[#bbb] uppercase tracking-widest mb-2">Sin app, sin descarga</p>
              <p className="text-[15px] text-[#777] leading-relaxed">
                El huésped lo abre en el navegador del móvil. Sin instalar nada. Sin registro.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== EL PROBLEMA — WHITE ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }} className="mb-12 sm:mb-16">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium mb-4">El problema</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extralight text-gray-900 leading-tight">
              Esto ya te <span className="text-violet-600">suena</span>.
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              'Hay días en los que no trabajas de anfitrión. Trabajas de copiar y pegar. El mismo WiFi. La misma entrada. Las mismas normas. Cambia el nombre del huésped y repite.',
              'He enviado la clave del WiFi tantas veces que ya me la sé mejor que mi DNI. Si gestionas varios apartamentos, sabes lo que es repetir WiFi, normas y acceso cada día.',
              'No agota tener huéspedes. Agota responder lo mismo veinte veces. Dónde se entra. Dónde se aparca. Cuál es la clave. Qué hacer al salir. Lo que quema no es el trabajo. Es la repetición.',
              'El peor mensaje no es una queja. Es este: "no podemos entrar". Suele llegar cuando estás cenando, conduciendo o con otro check-in encima.',
              'Si tu móvil manda más que tú, ya sabes de qué va esto. WhatsApp, Airbnb, Booking, llamadas, notas del check-in, preguntas repetidas. No necesitas otro chat. Necesitas que el huésped llegue con lo básico ya claro.',
              'Una reseña de 4 estrellas por confusión duele más que una avería. No porque sea "grave", sino porque sabes que se podía haber evitado.',
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * GOLDEN.stagger * 0.5, duration: GOLDEN.base, ease: GOLDEN.ease }}
                className="flex items-start gap-4"
              >
                <div className="w-1 h-1 rounded-full bg-violet-400 mt-3 flex-shrink-0" />
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POR QUÉ FUNCIONA — Stats WHITE ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-violet-200/20 rounded-full blur-3xl" />

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16 sm:mb-20">
          <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium mb-4">Por qué funciona</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight text-gray-900 mb-3 sm:mb-4">
            Los números ya lo <span className="text-violet-600">dicen</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { value: '86%', label: 'de las preguntas se repiten', desc: 'en cada reserva. WiFi, check-in, parking — siempre lo mismo.' },
            { value: '4.8★', label: 'exige Superhost', desc: 'Booking pesa las reseñas recientes. Un check-in malo baja la nota rápido.' },
            { value: '0', label: 'PDFs que alguien abre', desc: 'en el móvil. Nadie los lee. Un QR instantáneo sí.' },
            { value: '10\'', label: 'para configurarlo', desc: 'Check-in, WiFi y normas. Con eso ya puedes empezar.' },
            { value: '1', label: 'momento marca la reseña', desc: 'Los primeros 10 minutos. Si el huésped llega ubicado, todo cambia.' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * GOLDEN.stagger, duration: GOLDEN.base, ease: GOLDEN.ease }}
              className={`rounded-2xl bg-gray-50 border border-gray-200/60 p-6 sm:p-8 ${i >= 3 ? 'sm:col-span-1 lg:col-span-1' : ''}`}
            >
              <div className="text-3xl sm:text-4xl font-extralight text-violet-600 mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-gray-900 mb-2">{stat.label}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== ANTES Y DESPUÉS — WHITE ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14 sm:mb-20">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium mb-4">El cambio</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight text-gray-900">
              Tu semana <span className="text-gray-400">antes</span> y <span className="text-violet-600">después</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Antes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: GOLDEN.base, ease: GOLDEN.ease }}
              className="rounded-2xl bg-gray-50 border border-gray-200/60 p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium">Antes</span>
                <span className="ml-auto text-xs text-gray-300">85% gestionando</span>
              </div>
              <div className="space-y-4">
                {[
                  'Envías el WiFi a cada huésped manualmente',
                  'Copias y pegas las instrucciones de acceso',
                  'Recibes el "no podemos entrar" a las 22:00',
                  'El huésped llega sin haber leído nada',
                  'Contestas las mismas preguntas en tres idiomas',
                  'La reseña de 4 estrellas llega sin aviso',
                ].map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * GOLDEN.stagger, duration: GOLDEN.fast, ease: GOLDEN.ease }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-px h-4 bg-gray-300 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-400 leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Después */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: GOLDEN.base, ease: GOLDEN.ease }}
              className="rounded-2xl bg-violet-50/50 border border-violet-200/30 p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-violet-600" />
                <span className="text-xs uppercase tracking-[0.2em] text-violet-600 font-medium">Después</span>
                <span className="ml-auto text-xs text-violet-400">15% gestionando</span>
              </div>
              <div className="space-y-4">
                {[
                  'La guía se envía sola cuando entra la reserva',
                  'El huésped llega sabiendo cómo entrar y aparcar',
                  'Las dudas las resuelve el chatbot en su idioma',
                  'Tú no repites nada',
                  'Menos llamadas tensas, menos mensajes nocturnos',
                  'El check-in empieza bien y la reseña lo nota',
                ].map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * GOLDEN.stagger + 0.3, duration: GOLDEN.fast, ease: GOLDEN.ease }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-px h-4 bg-violet-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight text-gray-900 mb-4">Cómo funciona</h2>
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
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
              className={`flex flex-col md:flex-row items-center gap-6 sm:gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0">
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${gradient} to-violet-50/20 flex items-center justify-center border border-violet-200/30`}>
                  <span className="text-4xl sm:text-5xl font-extralight text-violet-300">{step}</span>
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

      {/* ===== CASA LIGHT — WHITE with hotspots ===== */}
      <section className="pt-20 sm:pt-32 bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
          className="text-center mb-10 sm:mb-14 px-4 sm:px-6"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight text-gray-900 mb-3 sm:mb-4">
            De día, todo <span className="text-violet-600">conectado</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto">
            Cada zona del apartamento tiene su QR. El huésped accede a la información sin preguntarte.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
          className="relative w-full"
        >
          <div className="relative" style={{ overflow: 'visible' }}>
            <div className="overflow-hidden">
              <Image src="/images/casalight.webp" alt="Apartamento turístico de día" width={1920} height={1080} className="w-full h-auto" />
            </div>

            {/* Hotspots — light style */}
            {[
              { id: 'cl-fridge', x: '30%', y: '35%', label: 'Nevera', icon: Refrigerator, delay: 0,
                content: { title: 'Nevera / Frigorífico', lines: ['Temperatura: 4°C (ya configurado)', 'Congelador en la parte inferior', 'Vaciar antes del check-out'], hasVideo: true } },
              { id: 'cl-tv', x: '78%', y: '38%', label: 'Smart TV', icon: Tv, delay: 0.3,
                content: { title: 'Smart TV', lines: ['Mando en el cajón del mueble', 'Netflix y Prime Video con sesión iniciada', 'Chromecast: buscar "Terraza TV"'], hasVideo: true } },
              { id: 'cl-oven', x: '35%', y: '28%', label: 'Horno', icon: UtensilsCrossed, delay: 0.6,
                content: { title: 'Horno & Cocina', lines: ['Vitrocerámica: botones táctiles frontales', 'Horno: dial derecho temperatura', 'Lavavajillas bajo la encimera'], hasVideo: true } },
              { id: 'cl-sofa', x: '52%', y: '58%', label: 'Terraza', icon: Compass, delay: 0.9,
                content: { title: 'Terraza & Exterior', lines: ['Chimenea exterior: botón lateral', 'Cojines guardar si llueve', 'Toldo eléctrico: mando en el cajón'], hasVideo: false } },
            ].map((spot) => (
              <Hotspot
                key={spot.id}
                id={spot.id}
                x={spot.x}
                y={spot.y}
                icon={spot.icon}
                label={spot.label}
                delay={spot.delay}
                hologramPosition="top"
                hologramContent={spot.content}
                activeId={activeHotspot}
                onToggle={toggleHotspot}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== KITCHEN — WHITE with hotspots ===== */}
      <section className="pt-20 sm:pt-32 bg-[#fafafa]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
          className="text-center mb-10 sm:mb-14 px-4 sm:px-6"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight text-gray-900 mb-3 sm:mb-4">
            Cada electrodoméstico, <span className="text-violet-600">explicado</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto">
            El huésped escanea y sabe cómo funciona todo. Sin llamadas, sin mensajes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
          className="relative w-full"
        >
          <div className="relative" style={{ overflow: 'visible' }}>
            <div className="overflow-hidden">
              <Image src="/images/kitchen.webp" alt="Cocina del apartamento" width={1920} height={1080} className="w-full h-auto" />
            </div>

            {/* Kitchen hotspots */}
            {[
              { id: 'k-fridge', x: '65%', y: '35%', label: 'Nevera', icon: Refrigerator, delay: 0,
                content: { title: 'Nevera', lines: ['Temperatura recomendada: 4°C', 'Dispensador de hielo: botón lateral', 'Vaciar antes del check-out'], hasVideo: true } },
              { id: 'k-oven', x: '82%', y: '42%', label: 'Horno', icon: UtensilsCrossed, delay: 0.3,
                content: { title: 'Horno', lines: ['Girar dial para temperatura', 'Modo convección: símbolo ventilador', 'Bandeja en el cajón inferior'], hasVideo: true } },
              { id: 'k-micro', x: '82%', y: '28%', label: 'Microondas', icon: Microwave, delay: 0.6,
                content: { title: 'Microondas', lines: ['Panel táctil: pulsar tiempo + Start', 'No usar aluminio', 'Función descongelar: botón snowflake'], hasVideo: true } },
              { id: 'k-island', x: '40%', y: '50%', label: 'Isla / Encimera', icon: Coffee, delay: 0.9,
                content: { title: 'Isla & Encimera', lines: ['Vitrocerámica: tocar zona + ajustar potencia', 'Cafetera Nespresso en la esquina', 'Cápsulas en el cajón derecho'], hasVideo: false } },
            ].map((spot) => (
              <Hotspot
                key={spot.id}
                id={spot.id}
                x={spot.x}
                y={spot.y}
                icon={spot.icon}
                label={spot.label}
                delay={spot.delay}
                hologramPosition="top"
                hologramContent={spot.content}
                activeId={activeHotspot}
                onToggle={toggleHotspot}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== FINAL CTA — BLACK ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-violet-600/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: GOLDEN.slow, ease: GOLDEN.ease }}
          className="relative text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extralight mb-4 sm:mb-6">Pruébalo gratis</h2>
          <p className="text-gray-500 text-sm sm:text-lg mb-8 sm:mb-12">15 días. Sin tarjeta. Tu manual listo en 10 minutos.</p>

          <motion.a
            href="/consulta"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-black font-medium rounded-full text-base sm:text-lg hover:bg-gray-100 transition-colors"
          >
            Solicita una prueba
          </motion.a>

          <p className="text-gray-700 text-[10px] sm:text-xs mt-6 sm:mt-8">Sin compromiso. Cancela cuando quieras.</p>
        </motion.div>
      </section>

      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-100 bg-white text-center">
        <p className="text-gray-300 text-xs sm:text-sm">Itineramio</p>
      </footer>

      {/* ===== FLOATING CHATBOT HOLOGRAM ===== */}
      <FloatingChatbot />
    </div>
  )
}
