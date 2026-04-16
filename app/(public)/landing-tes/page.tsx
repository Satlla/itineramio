'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Wifi, Key, MapPin, Star, Bell, MessageSquare, QrCode, Smartphone,
  ChevronDown, ChevronRight, Bot, Globe, Tv, UtensilsCrossed,
  Refrigerator, ClipboardList, Car, ArrowRight, BookOpen, Zap,
  BarChart3, Settings, Shield, Languages, Monitor, Play,
  Check, Users, Building, Coffee, Compass, Microwave, LogIn, LogOut, Wind,
  AlertTriangle, Brain, Layers, Map, Landmark, TreePine, Utensils, Heart
} from 'lucide-react'
import Image from 'next/image'

// ============================================
// MINI QR CODE SVG
// ============================================
function MiniQR({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" className="rounded-[3px]">
      <rect width="7" height="7" fill="#7c3aed" rx="0.5" />
      <rect x="0.5" y="0.5" width="2" height="2" fill="white" rx="0.3" />
      <rect x="0.8" y="0.8" width="1.4" height="1.4" fill="#7c3aed" rx="0.2" />
      <rect x="1.1" y="1.1" width="0.8" height="0.8" fill="white" rx="0.1" />
      <rect x="4.5" y="0.5" width="2" height="2" fill="white" rx="0.3" />
      <rect x="4.8" y="0.8" width="1.4" height="1.4" fill="#7c3aed" rx="0.2" />
      <rect x="5.1" y="1.1" width="0.8" height="0.8" fill="white" rx="0.1" />
      <rect x="0.5" y="4.5" width="2" height="2" fill="white" rx="0.3" />
      <rect x="0.8" y="4.8" width="1.4" height="1.4" fill="#7c3aed" rx="0.2" />
      <rect x="1.1" y="5.1" width="0.8" height="0.8" fill="white" rx="0.1" />
      <rect x="3" y="3" width="1" height="1" fill="white" rx="0.15" />
      <rect x="3.5" y="5" width="0.6" height="0.6" fill="white" opacity="0.8" />
    </svg>
  )
}

// ============================================
// HOTSPOT WITH PULSE + HOLOGRAM
// ============================================
interface HotspotProps {
  id: string; x: string; y: string; icon: any; label: string; delay: number
  hologramContent: { title: string; lines: string[]; hasVideo?: boolean }
  activeId: string | null; onToggle: (id: string) => void
  hologramPosition?: 'top' | 'bottom'
}

function Hotspot({ id, x, y, icon: Icon, label, hologramContent, delay, activeId, onToggle, hologramPosition = 'top' }: HotspotProps) {
  const isActive = activeId === id
  const holoClass = hologramPosition === 'bottom'
    ? 'top-full mt-3 left-1/2 -translate-x-1/2'
    : 'bottom-full mb-3 left-1/2 -translate-x-1/2'

  return (
    <div className="absolute" style={{ left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: isActive ? 100 : 20 }}>
      {/* Pulse rings */}
      <motion.div className="absolute rounded-full border-2 border-violet-400/60"
        style={{ width: 28, height: 28, left: '50%', top: '50%', marginLeft: -14, marginTop: -14 }}
        animate={{ scale: [1, 2, 2.6], opacity: [0.5, 0.15, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeOut' }} />
      <motion.div className="absolute rounded-full border border-violet-300/40"
        style={{ width: 28, height: 28, left: '50%', top: '50%', marginLeft: -14, marginTop: -14 }}
        animate={{ scale: [1, 1.6, 2.2], opacity: [0.3, 0.1, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, delay: delay + 1, ease: 'easeOut' }} />

      {/* QR dot */}
      <motion.button onClick={() => onToggle(id)}
        className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-violet-600/80 backdrop-blur-sm border-2 border-violet-400/60 cursor-pointer flex items-center justify-center shadow-lg shadow-violet-500/50"
        whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: delay + 0.3, type: 'spring', damping: 20, stiffness: 80 }}
        style={{ zIndex: 10 }}>
        <MiniQR size={16} />
      </motion.button>

      {/* Label */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.6 }}
        className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
        <span className="text-[9px] sm:text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-violet-400/20">{label}</span>
      </motion.div>

      {/* Hologram */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: hologramPosition === 'bottom' ? -8 : 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute ${holoClass} w-48 sm:w-72`}
            style={{ zIndex: 100 }}>
            <div className="rounded-2xl border border-violet-400/15 bg-gradient-to-b from-violet-950/50 via-[#1a0a3e]/40 to-violet-950/35 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Scan line */}
              <motion.div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                <motion.div className="w-full h-12 bg-gradient-to-b from-violet-400/8 to-transparent"
                  animate={{ y: [-48, 300] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
              </motion.div>
              {/* Header */}
              <div className="px-4 pt-4 pb-2 border-b border-violet-400/8 relative">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-violet-300/80" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-white/90">{hologramContent.title}</span>
                </div>
              </div>
              {/* Lines */}
              <div className="px-4 py-3 space-y-2.5 relative">
                {hologramContent.lines.map((line, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16 * i + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400/70 mt-1.5 flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs text-gray-300/80 leading-relaxed">{line}</span>
                  </motion.div>
                ))}
              </div>
              {/* Video */}
              {hologramContent.hasVideo && (
                <div className="mx-4 mb-4 rounded-xl bg-violet-500/10 border border-violet-400/15 p-3 flex items-center gap-3 cursor-pointer hover:bg-violet-500/20 transition-all">
                  <div className="w-9 h-9 rounded-full bg-violet-500/15 flex items-center justify-center border border-violet-400/20">
                    <Play className="w-4 h-4 text-violet-300 ml-0.5" fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white/80">Ver video tutorial</div>
                    <div className="text-[10px] text-violet-300/50">0:45 seg</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// TIMING
// ============================================
const G = {
  fast: 0.5,
  base: 0.8,
  slow: 1.3,
  stagger: 0.162,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  spring: { type: 'spring' as const, damping: 20, stiffness: 80 },
}

// ============================================
// INTERACTIVE TABS DEMO (GitHub-style)
// ============================================
const FEATURE_TABS = [
  {
    id: 'manual',
    label: 'Manual',
    icon: BookOpen,
    title: 'Crea tu guía digital en minutos',
    desc: 'La IA analiza tu alojamiento y genera automáticamente todas las zonas: check-in, WiFi, normas, electrodomésticos, recomendaciones.',
    cta: 'Explorar Manual Digital',
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: Brain,
    title: 'Un asistente que aprende de ti',
    desc: 'El Intelligence trabaja 24/7 respondiendo las preguntas de tus huéspedes. Si no sabe algo, te lo pregunta a ti. Aprende la respuesta y no vuelve a preguntarte más. Rellénalo una vez y regresa a las cosas que realmente importan.',
    cta: 'Explorar Intelligence',
  },
  {
    id: 'avisos',
    label: 'Avisos',
    icon: AlertTriangle,
    title: 'Avisa antes de que pregunten',
    desc: 'Informa a tu huésped con antelación sobre cortes de suministros, obras en la calle, fiestas locales, falta de WiFi en una franja horaria. Que llegue informado desde el primer momento.',
    cta: 'Explorar Avisos',
  },
  {
    id: 'conjuntos',
    label: 'Conjuntos',
    icon: Layers,
    title: 'Agrupa tus propiedades',
    desc: 'Si tienes varias propiedades en el mismo edificio, un bloque de apartamentos o un hotel, agrúpalos en un conjunto. Gestiona todo en bloque: mismas normas, mismo parking, mismas recomendaciones.',
    cta: 'Explorar Conjuntos',
  },
  {
    id: 'guia-local',
    label: 'Guía Local',
    icon: Map,
    title: 'Convierte turistas en locales',
    desc: 'Añade los mejores lugares de la ciudad, recomendados por ti. Castillos, ríos, restaurantes, o dónde tomas el mejor café. Que tus huéspedes dejen de ser turistas y vivan la ciudad como tú.',
    cta: 'Explorar Guía Local',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    title: 'Controla todo desde un solo sitio',
    desc: 'Estadísticas en tiempo real: preguntas respondidas, QR escaneados, rendimiento por propiedad. Datos que te ayudan a mejorar.',
    cta: 'Explorar Dashboard',
  },
]

// Chat simulation for chatbot tab
const CHAT_MESSAGES = [
  { q: '¿Cuál es la clave del WiFi?', a: 'Red: MiCasa_5G — Clave: balcon2024#' },
  { q: '¿Cómo entro al apartamento?', a: 'Caja gris a la derecha. Código: 4521, mantén 2 seg.' },
  { q: '¿A qué hora es el checkout?', a: 'A las 11:00h. Deja las llaves en el lockbox.' },
]

// Zone items for manual tab
const ZONE_ITEMS = [
  { icon: LogIn, label: 'Check-in' },
  { icon: LogOut, label: 'Check-out' },
  { icon: Wifi, label: 'WiFi' },
  { icon: ClipboardList, label: 'Normas' },
  { icon: Car, label: 'Parking' },
  { icon: Wind, label: 'Aire A/C' },
]

function FeatureTabsDemo() {
  const [activeTab, setActiveTab] = useState('manual')
  const [chatIdx, setChatIdx] = useState(0)
  const [chatStage, setChatStage] = useState<'q' | 'typing' | 'a'>('q')

  // Chat auto-play when chatbot tab active
  useEffect(() => {
    if (activeTab !== 'chatbot') return
    const delays = { q: 1200, typing: 1000, a: 2800 }
    const next = { q: 'typing' as const, typing: 'a' as const, a: 'q' as const }
    const t = setTimeout(() => {
      if (chatStage === 'a') setChatIdx(p => (p + 1) % CHAT_MESSAGES.length)
      setChatStage(next[chatStage])
    }, delays[chatStage])
    return () => clearTimeout(t)
  }, [chatStage, activeTab, chatIdx])

  // Reset chat when switching to chatbot tab
  useEffect(() => {
    if (activeTab === 'chatbot') { setChatIdx(0); setChatStage('q') }
  }, [activeTab])

  const tab = FEATURE_TABS.find(t => t.id === activeTab)!

  return (
    <div>
      {/* Tabs — horizontal scroll on mobile, centered on desktop */}
      <div className="mb-8 -mx-6 px-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 sm:gap-2 sm:justify-center min-w-max">
          {FEATURE_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-white text-[#111] shadow-sm'
                  : 'text-[#666] hover:text-[#111] hover:bg-gray-50'
              }`}
            >
              <t.icon className="w-4 h-4" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content — demo on top in desktop, text below */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Text side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: G.fast, ease: G.ease }}
          >
            <h3 className="text-2xl sm:text-3xl font-light text-[#111] mb-4 leading-snug">{tab.title}</h3>
            <p className="text-base sm:text-lg text-[#555] leading-relaxed mb-6">{tab.desc}</p>
            <a href="/demo" className="inline-flex items-center gap-2 text-violet-600 text-sm font-medium hover:gap-3 transition-all">
              {tab.cta} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </AnimatePresence>

        {/* Demo side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: G.base, ease: G.ease }}
            className="bg-[#fafafa] rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 min-h-[320px] flex flex-col"
          >
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>
              <span className="text-xs text-gray-500 ml-2">itineramio.com</span>
            </div>

            <div className="flex-1 p-5">
              {/* Manual tab demo */}
              {activeTab === 'manual' && (
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: G.fast, ease: G.ease }}
                    className="text-sm text-gray-500 mb-4 font-medium"
                  >Zonas del manual</motion.div>
                  <div className="grid grid-cols-3 gap-2">
                    {ZONE_ITEMS.map((z, i) => (
                      <motion.div
                        key={z.label}
                        initial={{ opacity: 0, scale: 0.3, y: 20, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                          delay: 0.15 + i * 0.12,
                          duration: 0.7,
                          ease: G.ease,
                          scale: { type: 'spring', damping: 15, stiffness: 120, delay: 0.15 + i * 0.12 },
                        }}
                        className="bg-white rounded-xl p-3 flex flex-col items-center gap-2 aspect-square justify-center border border-violet-200 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer shadow-sm"
                      >
                        <motion.div
                          initial={{ rotate: -20, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ delay: 0.25 + i * 0.12, type: 'spring', damping: 12, stiffness: 150 }}
                        >
                          <z.icon className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
                        </motion.div>
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + i * 0.12, duration: 0.4, ease: G.ease }}
                          className="text-[11px] font-medium text-gray-600"
                        >{z.label}</motion.span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: G.base, ease: G.ease }}
                    className="flex items-center gap-2 mt-4 text-xs text-green-600"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3, type: 'spring', damping: 10, stiffness: 200 }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                    <span>6 zonas generadas automáticamente con IA</span>
                  </motion.div>
                </div>
              )}

              {/* Chatbot tab demo */}
              {activeTab === 'chatbot' && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200/50">
                    <div className="w-6 h-6 rounded-full bg-violet-500/15 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Asistente IA</span>
                    <span className="ml-auto text-[9px] text-green-400/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      En línea
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2.5 justify-end">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`q-${chatIdx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: G.fast, ease: G.ease }}
                        className="self-end bg-violet-100 text-gray-700 text-[11px] px-3 py-2 rounded-2xl rounded-br-sm max-w-[200px]"
                      >
                        {CHAT_MESSAGES[chatIdx].q}
                      </motion.div>
                    </AnimatePresence>
                    <AnimatePresence>
                      {chatStage === 'typing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="self-start bg-white/5 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} animate={{ y: [0, -3, 0] }}
                              transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                              className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {chatStage === 'a' && (
                        <motion.div
                          key={`a-${chatIdx}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: G.base, ease: G.ease }}
                          className="self-start bg-white/5 text-gray-500 text-[11px] px-3 py-2 rounded-2xl rounded-bl-sm max-w-[220px]"
                        >
                          {CHAT_MESSAGES[chatIdx].a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Dashboard tab demo */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: G.fast, ease: G.ease }}
                    className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Hoy</div>
                      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 12, stiffness: 100 }}
                        className="text-4xl font-light text-[#111]">34</motion.div>
                      <div className="text-[10px] text-gray-400">preguntas respondidas</div>
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                      className="text-right">
                      <div className="text-xs text-green-600 font-medium">+12%</div>
                      <div className="text-[10px] text-gray-400">vs ayer</div>
                    </motion.div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="h-20 rounded-lg overflow-hidden bg-gray-100/50">
                    <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        d="M0 50 Q20 45 40 40 T80 32 T120 20 T160 15 T200 8"
                        fill="none" stroke="#8b5cf6" strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: G.slow }}
                      />
                      <path d="M0 50 Q20 45 40 40 T80 32 T120 20 T160 15 T200 8 L200 60 L0 60 Z" fill="url(#dg)" />
                    </svg>
                  </motion.div>
                  <div className="space-y-2">
                    {[
                      { l: 'WiFi', v: 12, pct: 35 },
                      { l: 'Check-in', v: 8, pct: 24 },
                      { l: 'Normas', v: 6, pct: 18 },
                      { l: 'Restaurantes', v: 5, pct: 15 },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.15, duration: G.base, ease: G.ease }}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">{item.l}</span>
                          <span className="text-gray-700 font-medium">{item.v}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-violet-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ delay: 0.7 + i * 0.15, duration: G.slow, ease: G.ease }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Intelligence tab demo */}
              {activeTab === 'intelligence' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200/50">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <span className="text-xs text-gray-400">Intelligence activo</span>
                    <span className="ml-auto text-[9px] text-green-400/50 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Aprendiendo
                    </span>
                  </div>
                  {[
                    { q: '¿Hay supermercado cerca?', status: 'learned', answer: 'Mercadona a 2 min andando, calle San Fernando 12' },
                    { q: '¿Se puede fumar en la terraza?', status: 'learned', answer: 'No, el apartamento es 100% libre de humo' },
                    { q: '¿Dónde está la plancha?', status: 'asking', answer: null },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * G.stagger, duration: G.fast }}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200/50"
                    >
                      <div className="text-[11px] text-gray-500 mb-1.5">{item.q}</div>
                      {item.status === 'learned' ? (
                        <div className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-green-400/60 mt-0.5 flex-shrink-0" />
                          <span className="text-[10px] text-gray-300">{item.answer}</span>
                        </div>
                      ) : (
                        <motion.div
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-3 h-3 rounded-full border border-amber-400/40 flex items-center justify-center">
                            <span className="text-[7px] text-amber-400">?</span>
                          </div>
                          <span className="text-[10px] text-amber-400/50">Esperando tu respuesta...</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                    className="text-[10px] text-white/20 mt-2 flex items-center gap-1.5">
                    <Brain className="w-3 h-3" />
                    <span>47 respuestas aprendidas. No vuelve a preguntarte.</span>
                  </motion.div>
                </div>
              )}

              {/* Avisos tab demo */}
              {activeTab === 'avisos' && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-300 mb-3">Avisos activos</div>
                  {[
                    { icon: Wifi, title: 'Corte de WiFi', desc: 'Mañana 10:00-12:00 por mantenimiento del proveedor', time: 'Enviado hace 2h', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { icon: AlertTriangle, title: 'Obras en la calle', desc: 'Calle San Fernando cortada del 15-20 abril. Acceso por calle Castaños', time: 'Activo', color: 'text-orange-400', bg: 'bg-orange-400/10' },
                    { icon: Star, title: 'Fiesta de Hogueras', desc: 'Del 20-24 junio. Ruido nocturno en zona centro. Tapones en el cajón del baño', time: 'Programado', color: 'text-violet-400', bg: 'bg-violet-400/10' },
                  ].map((aviso, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * G.stagger, duration: G.fast }}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg ${aviso.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <aviso.icon className={`w-3.5 h-3.5 ${aviso.color}`} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-gray-600 font-medium">{aviso.title}</div>
                          <div className="text-[10px] text-gray-300 leading-relaxed mt-0.5">{aviso.desc}</div>
                        </div>
                        <span className="text-[8px] text-white/20 flex-shrink-0">{aviso.time}</span>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    className="text-[10px] text-violet-400/50 mt-2 cursor-pointer hover:text-violet-400/80 transition-colors">
                    + Crear nuevo aviso
                  </motion.div>
                </div>
              )}

              {/* Conjuntos tab demo */}
              {activeTab === 'conjuntos' && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-300 mb-3">Conjuntos</div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: G.fast }}
                    className="p-4 rounded-xl bg-gray-50 border border-violet-500/10"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">Edificio Plaza Mar</div>
                        <div className="text-[10px] text-gray-300">4 apartamentos</div>
                      </div>
                    </div>
                    <div className="space-y-1.5 ml-11">
                      {['1ºA — Ocupado', '2ºB — Libre', '3ºA — Check-in mañana', '4ºC — Ocupado'].map((apt, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-2 text-[10px]"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-amber-400' : 'bg-green-400'}`} />
                          <span className="text-gray-400">{apt}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-3 ml-11 text-[9px] text-white/20">Mismas normas, parking y recomendaciones compartidas</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="p-3 rounded-xl bg-white/[0.02] border border-gray-200/50 border-dashed flex items-center justify-center cursor-pointer hover:border-violet-500/20 transition-colors"
                  >
                    <span className="text-[10px] text-white/20">+ Crear conjunto</span>
                  </motion.div>
                </div>
              )}

              {/* Guía Local tab demo */}
              {activeTab === 'guia-local' && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-300 mb-3">Tus recomendaciones</div>
                  {[
                    { icon: Utensils, name: 'La Taberna del Gourmet', type: 'Restaurante', note: 'El mejor arroz de Alicante', distance: '350m' },
                    { icon: Coffee, name: 'Café Loft', type: 'Cafetería', note: 'Donde tomo el mejor café de la ciudad', distance: '200m' },
                    { icon: Landmark, name: 'Castillo de Santa Bárbara', type: 'Monumento', note: 'Vistas de toda la bahía, subir al atardecer', distance: '1.2km' },
                    { icon: TreePine, name: 'Parque El Palmeral', type: 'Naturaleza', note: 'Paseo tranquilo con lago y patos', distance: '800m' },
                  ].map((place, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * G.stagger, duration: G.fast }}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-200/50 hover:border-violet-500/15 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <place.icon className="w-3.5 h-3.5 text-violet-400" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-gray-600 font-medium">{place.name}</div>
                        <div className="text-[9px] text-white/25 mb-0.5">{place.type} · {place.distance}</div>
                        <div className="text-[10px] text-white/35 italic">&quot;{place.note}&quot;</div>
                      </div>
                      <Heart className="w-3 h-3 text-white/10 flex-shrink-0 mt-1" />
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                    className="text-[10px] text-white/15 text-center mt-2">
                    Que dejen de ser turistas y vivan como locales
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================
// FEATURE GRID (GitHub-style hover cards)
// ============================================
function FeatureGrid() {
  const features = [
    {
      icon: Brain,
      title: 'Intelligence',
      desc: 'Aprende de tus respuestas. Si no sabe algo, te pregunta una vez. Nunca más.',
      cta: 'Explorar Intelligence',
    },
    {
      icon: AlertTriangle,
      title: 'Avisos al huésped',
      desc: 'Cortes de luz, obras, fiestas locales. El huésped llega informado desde el primer momento.',
      cta: 'Explorar Avisos',
    },
    {
      icon: Layers,
      title: 'Conjuntos',
      desc: 'Agrupa apartamentos del mismo edificio u hotel. Gestiona normas y recomendaciones en bloque.',
      cta: 'Explorar Conjuntos',
    },
    {
      icon: Map,
      title: 'Guía Local',
      desc: 'Tus restaurantes, cafés y rincones favoritos. Que el huésped viva la ciudad como tú.',
      cta: 'Explorar Guía Local',
    },
    {
      icon: Zap,
      title: 'Mensaje de bienvenida',
      desc: 'Añade el link de tu guía al mensaje automático de bienvenida de Airbnb o Booking. El huésped lo recibe con cada reserva.',
      cta: 'Explorar integración',
    },
    {
      icon: Smartphone,
      title: 'Sin app, sin descarga',
      desc: 'El huésped abre la guía en el navegador. Sin instalar nada. Sin registro.',
      cta: 'Explorar acceso',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * G.stagger, duration: G.base, ease: G.ease }}
          className="group p-6 rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300 cursor-pointer"
        >
          <f.icon className="w-6 h-6 text-[#111] mb-4 group-hover:text-violet-600 transition-colors" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-[#111] mb-2">{f.title}</h3>
          <p className="text-sm text-[#777] leading-relaxed mb-4">{f.desc}</p>
          <span className="text-sm text-violet-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            {f.cta} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// NAV — transparent → solid on scroll
// ============================================
function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  const showWhiteBg = scrolled && isMobile

  return (
    <nav className={`md:absolute fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      showWhiteBg ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img src="/isotipo-gradient.svg" alt="Itineramio" width={36} height={20}
            className={`object-contain transition-all duration-500 ${showWhiteBg ? '' : 'brightness-0 invert'}`} />
          <span className={`font-semibold text-lg transition-colors duration-500 ${showWhiteBg ? 'text-[#111]' : 'text-white'}`}>Itineramio</span>
        </a>
        <div className="hidden md:flex items-center gap-7">
          {['Funcionalidades', 'Precios', 'Blog'].map(l => (
            <a key={l} href="#" className="text-sm font-medium text-gray-500 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-500 ${
            showWhiteBg
              ? 'bg-[#111] text-white hover:bg-black'
              : 'bg-white text-black hover:bg-white/90'
          }`}>Entrar</a>
        </div>
      </div>
    </nav>
  )
}

// ============================================
// HERO HOLOGRAMS — Rotating questions above houses
// ============================================
const HOLOGRAM_QUESTIONS = [
  '¿Cuál es la clave del WiFi?',
  '¿Cómo desbloqueo la vitrocerámica?',
  '¿Dónde aparco?',
  '¿A qué hora es el checkout?',
  '¿Cómo entro al apartamento?',
  '¿Cómo pongo el agua caliente?',
  '¿Hay horario para sacar la basura?',
  '¿Dónde podemos comer un buen arroz?',
  '¿Hay lavadora?',
  '¿Cómo funciona el aire acondicionado?',
  '¿Dónde están las toallas extra?',
  '¿Se puede fumar en la terraza?',
  '¿Hay secador de pelo?',
  '¿Dónde está el supermercado más cerca?',
  '¿Cómo conecto el Chromecast?',
  '¿Hay plancha?',
  '¿Cuál es el código de la puerta?',
  '¿Dónde dejo las llaves al salir?',
  '¿Hay cápsulas de café?',
  '¿Cómo funciona el lavavajillas?',
  '¿Dónde está la farmacia?',
  '¿Hay Netflix?',
  '¿Se puede hacer barbacoa?',
  '¿Dónde está la parada de bus?',
  '¿Hay ascensor?',
  '¿Cómo bajo las persianas?',
  '¿Dónde reciclo el vidrio?',
  '¿Cuántas llaves hay?',
  '¿Hay microondas?',
  '¿Dónde está la playa más cerca?',
  '¿Funciona el horno?',
  '¿Hay sábanas extra?',
  '¿Cómo apago la alarma?',
  '¿Dónde puedo alquilar bicis?',
  '¿Hay trona para bebé?',
  '¿Cuál es la mejor terraza para cenar?',
  '¿Dónde está el parking del aeropuerto?',
  '¿Se admiten mascotas?',
  '¿Hay cuna?',
  '¿Cómo enciendo la calefacción?',
  '¿Dónde compro la tarjeta de transporte?',
  '¿Hay tostadora?',
  '¿Cuál es el PIN del lockbox?',
  '¿Dónde hay un cajero?',
  '¿Cómo funciona la Smart TV?',
  '¿Hay hervidor de agua?',
  '¿Dónde está la estación de tren?',
  '¿Hay batidora?',
  '¿Cuándo pasan a limpiar?',
  '¿El WiFi llega a la terraza?',
  '¿Dónde tiro la basura orgánica?',
  '¿Hay tabla de planchar?',
  '¿Cómo abro la caja fuerte?',
  '¿Dónde hay un buen brunch?',
  '¿Hay champú y gel?',
  '¿Cómo funciona la inducción?',
  '¿Dónde está el hospital más cercano?',
  '¿Hay tendedero?',
  '¿Cuántos mandos hay?',
  '¿Dónde veo el atardecer?',
  '¿Hay botiquín?',
  '¿Cómo enciendo el jacuzzi?',
  '¿Dónde hay un parque infantil?',
  '¿Hay papel de aluminio?',
  '¿El parking es gratuito?',
  '¿Dónde está la piscina comunitaria?',
  '¿Hay ventilador?',
  '¿Cómo pido un taxi?',
  '¿Dónde alquilo un coche?',
  '¿Hay lavavajillas?',
  '¿Qué día es el mercadillo?',
  '¿Dónde hay una buena heladería?',
  '¿Hay detector de humos?',
  '¿Cómo funciona el portero automático?',
  '¿Hay adaptador de enchufe?',
  '¿Dónde hago paddle surf?',
  '¿Hay escoba y fregona?',
  '¿Cómo llego al centro?',
  '¿Hay cafetera italiana?',
  '¿Dónde está el contenedor de cartón?',
  '¿Hay báscula?',
  '¿Cuál es el mejor chiringuito?',
  '¿Se oye ruido por la noche?',
  '¿Dónde hay un coworking?',
  '¿Hay bolsas de basura?',
  '¿Cómo funciona el termo?',
  '¿Dónde hay una gasolinera?',
  '¿Hay espejo de cuerpo entero?',
  '¿Cuánto cuesta el parking por hora?',
  '¿Dónde veo fuegos artificiales?',
  '¿Hay sacacorchos?',
  '¿Cómo conecto el bluetooth del altavoz?',
  '¿Dónde compro fruta fresca?',
  '¿Hay manta extra?',
  '¿A qué hora cierra la piscina?',
  '¿Dónde hay una lavandería?',
  '¿Hay abrelatas?',
  '¿Cuál es la mejor ruta de senderismo?',
  '¿Dónde hay un buen coffee shop?',
]

const HOLO_POSITIONS = [
  { x: '15%', y: '60%' },
  { x: '30%', y: '52%' },
  { x: '50%', y: '48%' },
  { x: '70%', y: '52%' },
  { x: '85%', y: '60%' },
]

function HeroHolograms() {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; text: string }[]>([])
  const nextId = useRef(0)
  const nextQ = useRef(0)

  // Spawn positions — base of each house
  const spawnPoints = [
    { x: 15, y: 65 },
    { x: 30, y: 57 },
    { x: 50, y: 53 },
    { x: 70, y: 57 },
    { x: 85, y: 65 },
  ]

  useEffect(() => {
    // Spawn a new bubble every 1.2s from a random house
    const timer = setInterval(() => {
      const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)]
      const text = HOLOGRAM_QUESTIONS[nextQ.current % HOLOGRAM_QUESTIONS.length]
      nextQ.current++
      const id = nextId.current++
      // Slight random offset so they don't stack perfectly
      const xOffset = (Math.random() - 0.5) * 6
      setBubbles(prev => [...prev, { id, x: spawn.x + xOffset, y: spawn.y, text }])

      // Remove bubble after animation completes (6s)
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== id))
      }, 6000)
    }, 1200)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Static pulse dots at each house base */}
      {spawnPoints.map((p, i) => (
        <div key={`dot-${i}`} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}>
          <motion.div
            className="absolute rounded-full border border-violet-400/30"
            style={{ width: 14, height: 14, left: '50%', top: '50%', marginLeft: -7, marginTop: -7 }}
            animate={{ scale: [1, 2, 2.5], opacity: [0.3, 0.08, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-violet-500/60 shadow-md shadow-violet-500/30" />
        </div>
      ))}

      {/* Rising bubbles */}
      <AnimatePresence>
        {bubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            className="absolute"
            style={{ left: `${bubble.x}%`, transform: 'translateX(-50%)' }}
            initial={{ top: `${bubble.y}%`, opacity: 0, scale: 0.7, filter: 'blur(4px)' }}
            animate={{ top: `${bubble.y - 40 - Math.random() * 15}%`, opacity: [0, 1, 1, 0.7, 0], scale: [0.7, 1, 1, 0.95, 0.9], filter: ['blur(4px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(3px)'] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5.5, ease: 'easeOut' }}
          >
            <div className="bg-violet-950/50 backdrop-blur-lg border border-violet-400/20 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 whitespace-nowrap shadow-lg shadow-violet-900/15">
              <div className="flex items-center gap-1.5">
                <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400 flex-shrink-0" />
                <span className="text-[8px] sm:text-[11px] text-white/85">{bubble.text}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// TYPEWRITER EFFECT
// ============================================
function Typewriter({ text, delay = 0, speed = 30, className }: { text: string; delay?: number; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [started, text, speed])

  return (
    <span className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-violet-400 ml-0.5 align-middle"
        />
      )}
    </span>
  )
}

// ============================================
// FLOATING CHATBOT HOLOGRAM
// ============================================
const BOT_CONVOS = [
  { q: '¿Cuál es la clave del WiFi?', a: 'Red: MiCasa_5G — Clave: balcon2024#' },
  { q: '¿Cómo entro al apartamento?', a: 'Caja gris a la derecha de la puerta. Código: 4521, mantén 2 seg.' },
  { q: '¿A qué hora es el checkout?', a: 'A las 11:00h. Deja las llaves en el lockbox y cierra la puerta.' },
  { q: '¿Dónde puedo aparcar?', a: 'Plaza B-14. Pase magnético en el cajón izquierdo de la cocina.' },
]

function FloatingChatHologram() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-8 right-8 z-[9999] w-16 h-16 rounded-full bg-violet-600 shadow-2xl shadow-violet-500/50 flex items-center justify-center cursor-pointer border-2 border-violet-400/50"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', damping: 15, stiffness: 100 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <ChevronDown className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Bot className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <motion.div className="absolute inset-0 rounded-full border-2 border-violet-400/40"
            animate={{ scale: [1, 1.5, 1.8], opacity: [0.4, 0.1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity }} />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-28 right-8 z-[9999] w-[360px] sm:w-[400px] rounded-2xl overflow-hidden shadow-2xl shadow-black/30"
          >
            {/* Dark glass bg */}
            <div className="bg-[#111318] rounded-2xl border border-white/10 shadow-2xl">

              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3 bg-[#18181b]">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-white">SofIA</div>
                  <div className="text-xs text-white/40">Att. Cliente</div>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                  <ChevronDown className="w-5 h-5 text-white/40" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5 px-5 bg-[#111318]">
                {[
                  { icon: MessageSquare, label: 'Chat', active: true },
                  { icon: BookOpen, label: 'Artículos', active: false },
                  { icon: Bell, label: 'Novedades', active: false },
                ].map((tab, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                    tab.active ? 'border-violet-500 text-white' : 'border-transparent text-white/25 hover:text-white/40'
                  }`}>
                    <tab.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {tab.label}
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="px-5 py-5 min-h-[300px] flex flex-col bg-[#111318]">
                {/* Bot welcome */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: G.ease }}
                  className="flex gap-3 mb-5"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white leading-relaxed">
                      <strong>Soy SofIA</strong>, tu asistente personal.
                    </p>
                    <p className="text-sm text-white/50 leading-relaxed mt-1">
                      Mi objetivo es que tu manual sea un <span className="text-violet-400 font-semibold">10</span>.
                      Pregúntame lo que necesites:
                    </p>
                  </div>
                </motion.div>

                {/* Suggested questions */}
                <div className="space-y-2 flex-1">
                  {[
                    '¿Cómo creo mi primera propiedad?',
                    '¿Cómo imprimo el código QR?',
                    '¿Cómo configuro el chatbot para mis huéspedes?',
                    '¿Cómo añado recomendaciones locales?',
                  ].map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: G.ease }}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.02] transition-all text-[13px] text-white/50 hover:text-white/80 cursor-pointer group"
                    >
                      <MapPin className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors flex-shrink-0" strokeWidth={1.5} />
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-[#111318]">
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3">
                  <input type="text" placeholder="Escribe tu mensaje..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none" />
                  <button className="w-9 h-9 rounded-lg bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
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
export default function TeslaTest2() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [houseVisible, setHouseVisible] = useState(false)
  const houseRef = useRef<HTMLDivElement>(null)

  const toggleHotspot = useCallback((id: string) => {
    setActiveHotspot(prev => prev === id ? null : id)
  }, [])

  // Auto-cycle hotspots
  useEffect(() => {
    if (!houseVisible) return
    const ids = ['fridge', 'oven', 'ac', 'tv', 'tablet']
    let i = 0
    const initial = setTimeout(() => { setActiveHotspot('fridge'); i = 1 }, 1600)
    const timer = setInterval(() => {
      if (i < ids.length) { setActiveHotspot(ids[i]); i++ }
      else clearInterval(timer)
    }, 3400)
    return () => { clearInterval(timer); clearTimeout(initial) }
  }, [houseVisible])

  useEffect(() => {
    if (!houseRef.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHouseVisible(true) }, { threshold: 0.2 })
    obs.observe(houseRef.current)
    return () => obs.disconnect()
  }, [])

  const hotspots = [
    { id: 'fridge', x: '20%', y: '38%', icon: Refrigerator, label: 'Nevera', delay: 0, hologramPosition: 'top' as const,
      hologramContent: { title: 'Nevera / Frigorífico', lines: ['Temperatura recomendada: 4°C', 'Cajón inferior: congelador (-18°C)', 'Dispensador de hielo: botón lateral', 'Vaciar antes del check-out'], hasVideo: true } },
    { id: 'oven', x: '33%', y: '30%', icon: UtensilsCrossed, label: 'Horno', delay: 0.3, hologramPosition: 'top' as const,
      hologramContent: { title: 'Horno & Microondas', lines: ['Dial derecho: temperatura, izquierdo: modo', 'Microondas: panel táctil, pulsar Start', 'Bandeja en el cajón inferior', 'No usar aluminio en el microondas'], hasVideo: true } },
    { id: 'ac', x: '57%', y: '30%', icon: Wind, label: 'Aire acondicionado', delay: 0.6, hologramPosition: 'top' as const,
      hologramContent: { title: 'Aire Acondicionado', lines: ['Mando en el cajón del mueble TV', 'Modo frío: pulsar MODE hasta copo de nieve', 'Temperatura recomendada: 23-25°C', 'Apagar al salir del apartamento'], hasVideo: true } },
    { id: 'tv', x: '68%', y: '35%', icon: Tv, label: 'Smart TV', delay: 0.8, hologramPosition: 'top' as const,
      hologramContent: { title: 'Smart TV Samsung', lines: ['Mando en el cajón de la mesa', 'Netflix, Prime Video y Disney+ con sesión', 'WiFi: MiCasa_5G (conectada)', 'Chromecast: buscar "Salón TV"'], hasVideo: true } },
    { id: 'tablet', x: '22%', y: '72%', icon: Smartphone, label: 'Panel de control', delay: 1.0, hologramPosition: 'bottom' as const,
      hologramContent: { title: 'Panel del Apartamento', lines: ['Controla luces, AC y persianas', 'Modo Noche: apaga todo a la vez', 'Temperatura mínima AC: 22°C', 'PIN: últimos 4 dígitos de tu reserva'], hasVideo: true } },
  ]

  return (
    <div className="bg-white text-[#111] min-h-screen">

      <NavBar />

      {/* ===== HERO — Neighbor full-screen ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image src="/images/neighbor.png" alt="Complejo de apartamentos conectados" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80" />
        </div>

        {/* Hologram questions — rotating on 5 fixed positions, never disappear */}
        <HeroHolograms />

        {/* Text content — positioned lower, over the houses */}
        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-0 right-0 z-20 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: G.slow, ease: G.ease }}
            className="leading-[1.06] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)' }}
          >
            <span className="font-semibold text-white">Los huéspedes no leen.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: G.base, ease: G.ease }}
            className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Y tú sigues enviando el mismo mensaje una y otra vez. Crea una guía una vez, añade el link a tu mensaje de bienvenida automático, y listo. Así llegan sabiendo cómo entrar, dónde aparcar y cuál es la clave del WiFi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: G.slow, ease: G.ease }}
          >
            <a href="/demo" className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Empieza ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ===== INTERACTIVE DEMO (GitHub-style tabs) ===== */}
      <section className="py-20 sm:py-28 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: G.slow, ease: G.ease }}
            className="mb-12 text-center"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#bbb] font-medium mb-4">Funcionalidades</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#111] leading-[1.1]">
              Todo lo que necesitas para reducir las preguntas de tu alojamiento
            </h2>
          </motion.div>

          <FeatureTabsDemo />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 sm:py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '86%', label: 'Preguntas', sub: 'se repiten en cada reserva' },
            { value: '10\'', label: 'Setup', sub: 'tu guía lista en minutos' },
            { value: '4.9★', label: 'Rating', sub: 'media de nuestros anfitriones' },
            { value: '0', label: 'Apps', sub: 'que el huésped necesita instalar' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * G.stagger, duration: G.base, ease: G.ease }}
            >
              <div className="text-4xl sm:text-5xl font-light text-[#111] mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-[#999] uppercase tracking-wider mb-0.5">{stat.label}</div>
              <div className="text-xs text-[#bbb]">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== DARK — Phones Tesla + Casa con hotspots ===== */}
      <section className="bg-[#0d1117] text-white pt-20 sm:pt-28">
        {/* Phones section */}
        <div className="max-w-5xl mx-auto px-6 mb-16 sm:mb-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: G.slow, ease: G.ease }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-3">
              Cuando el huésped llega informado, <span className="text-violet-400">se nota desde el minuto uno</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto">
              Menos dudas. Menos interrupciones. Menos mensajes con prisas.
            </p>
          </motion.div>

          {/* Two phones — desktop, from tesla-test */}
          <div className="hidden md:block relative max-w-lg mx-auto" style={{ height: '700px' }}>
            {/* Phone BACK (stats) — behind, left */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: G.slow, delay: 0.5, ease: G.ease }}
              className="absolute left-0 top-8 z-10" style={{ width: '220px' }}>
              <div className="bg-black rounded-[36px] p-2.5 shadow-2xl border border-gray-800/50">
                <div className="bg-gray-950 rounded-[28px] overflow-hidden aspect-[9/19.5] p-4 pt-7">
                  <div className="text-[10px] text-gray-500 mb-1">Hoy</div>
                  <div className="text-white text-2xl font-light mb-3">34 <span className="text-xs text-gray-500">preguntas</span></div>
                  <div className="relative h-20 mb-3 rounded-lg overflow-hidden bg-gray-900/50">
                    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                      <defs><linearGradient id="pcg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" /></linearGradient></defs>
                      <path d="M0 30 Q15 25 25 22 T45 18 T65 12 T85 10 T100 5 L100 40 L0 40 Z" fill="url(#pcg2)" />
                      <path d="M0 30 Q15 25 25 22 T45 18 T65 12 T85 10 T100 5" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    {[{ l: 'WiFi', v: '12' },{ l: 'Check-in', v: '8' },{ l: 'Normas', v: '6' },{ l: 'Restaurantes', v: '5' }].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{item.l}</span>
                        <span className="text-[10px] text-white font-medium">{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Phone FRONT (Mi Casa) — in front, right */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: G.slow, delay: 0.2, ease: G.ease }}
              className="absolute right-0 top-0 z-20" style={{ width: '280px' }}>
              <div className="bg-black rounded-[40px] p-3 shadow-2xl shadow-violet-900/10 border border-gray-800">
                <div className="bg-gray-950 rounded-[32px] overflow-hidden aspect-[9/19.5] relative">
                  <div className="p-4 pt-7 pb-2 text-center">
                    <div className="text-white text-sm font-medium">Mi Casa <span className="text-gray-600 text-[9px]">&#9662;</span></div>
                    <div className="text-violet-400 text-[9px]">Conectado</div>
                  </div>
                  <div className="relative mx-3 aspect-[3/4] rounded-xl overflow-hidden">
                    <Image src="/images/houses.png" alt="Casa" fill className="object-cover" />
                    {/* QR dots top house */}
                    {[{ x: '30%', y: '33%', d: 0 },{ x: '48%', y: '37%', d: 0.4 },{ x: '70%', y: '34%', d: 0.8 }].map((dot, i) => (
                      <div key={i} className="absolute" style={{ left: dot.x, top: dot.y, transform: 'translate(-50%,-50%)' }}>
                        <motion.div className="absolute rounded-full border border-violet-400/40"
                          style={{ width: 18, height: 18, left: '50%', top: '50%', marginLeft: -9, marginTop: -9 }}
                          animate={{ scale: [1, 1.8, 2.3], opacity: [0.4, 0.1, 0] }}
                          transition={{ duration: 2.6, repeat: Infinity, delay: dot.d }} />
                        <div className="w-5 h-5 rounded-full bg-violet-600/70 border border-violet-400/40 flex items-center justify-center shadow-md shadow-violet-500/40">
                          <MiniQR size={10} />
                        </div>
                      </div>
                    ))}
                    {/* Bottom house — fluorescent lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 280">
                      <defs>
                        <linearGradient id="flg2" x1="0" y1="1" x2="0.3" y2="0"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" /><stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" /></linearGradient>
                        <filter id="flgw2"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                      </defs>
                      <motion.path d="M 60 190 Q 30 160 -10 130" fill="none" stroke="url(#flg2)" strokeWidth="1.5" filter="url(#flgw2)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.1, delay: 0.5 }} />
                      <motion.path d="M 100 182 Q 100 140 100 90" fill="none" stroke="url(#flg2)" strokeWidth="1.5" filter="url(#flgw2)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.1, delay: 1 }} />
                      <motion.path d="M 140 196 Q 170 160 210 130" fill="none" stroke="url(#flg2)" strokeWidth="1.5" filter="url(#flgw2)"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.1, delay: 1.5 }} />
                      {[{ cx: [60,30,-10], cy: [190,160,130], d: 0.3 },{ cx: [100,100,100], cy: [182,140,90], d: 0.7 },{ cx: [140,170,210], cy: [196,160,130], d: 1.1 }].map((p, i) => (
                        <motion.circle key={i} r="2" fill="#a78bfa" filter="url(#flgw2)"
                          animate={{ cx: p.cx, cy: p.cy, opacity: [0,1,0] }}
                          transition={{ duration: 3.4, delay: p.d, repeat: Infinity, ease: 'linear' }} />
                      ))}
                    </svg>
                  </div>
                  <div className="px-4 py-3 space-y-1.5">
                    {[{ icon: Key, l: 'Check-in', v: 'Lockbox 4521#' },{ icon: Wifi, l: 'WiFi', v: 'MiCasa_5G' },{ icon: ClipboardList, l: 'Normas', v: '3 reglas' },{ icon: MapPin, l: 'Lugares', v: '12 cerca' }].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <item.icon className="w-3 h-3 text-violet-400/70" strokeWidth={1.5} />
                          <span className="text-[10px] text-gray-400">{item.l}</span>
                        </div>
                        <span className="text-[9px] text-gray-500">{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Casa nocturna — full width with hotspots */}
        <div ref={houseRef} className="relative pt-8 sm:pt-12">
          <div className="text-center mb-8 sm:mb-12 px-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-3">
              Cada dispositivo, <span className="text-violet-400">documentado</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto">
              El huésped escanea el QR y accede a las instrucciones. Con video incluido.
            </p>
          </div>

          <div className="relative w-full" style={{ overflow: 'visible' }}>
            <div className="overflow-hidden">
              <Image src="/images/render-casa.png" alt="Apartamento conectado" width={1920} height={1080} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/50 via-transparent to-[#0d1117]/20 pointer-events-none" />
            </div>
            {hotspots.map(spot => (
              <Hotspot key={spot.id} {...spot} activeId={activeHotspot} onToggle={toggleHotspot} />
            ))}
          </div>

          <div className="flex justify-center mt-6 pb-8">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-500/10">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <QrCode className="w-4 h-4 text-violet-400" />
              </motion.div>
              <span className="text-[10px] sm:text-xs text-gray-400">Pulsa en cada QR para ver las instrucciones</span>
            </div>
          </div>
        </div>

      </section>

      {/* ===== FEATURE GRID (GitHub-style cards) ===== */}
      <section className="py-20 sm:py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: G.slow, ease: G.ease }}
            className="mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#111] leading-snug max-w-xl">
              Diseñado para escalar contigo
            </h2>
            <p className="text-base text-[#777] mt-3 max-w-lg">
              Da igual si gestionas 1 apartamento o 50. Itineramio se adapta a tu operativa.
            </p>
          </motion.div>
          <FeatureGrid />
        </div>
      </section>

      {/* ===== BEFORE/AFTER — Dark ===== */}
      <section className="bg-[#0d1117] text-white py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-3">
              Tu semana <span className="text-gray-300">antes</span> y <span className="text-violet-400">después</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: G.base, ease: G.ease }}
              className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-gray-200/50">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <span className="text-xs uppercase tracking-widest text-gray-300">Antes</span>
              </div>
              <div className="space-y-3">
                {[
                  'Envías el WiFi a cada huésped manualmente',
                  'Copias y pegas las instrucciones de acceso',
                  'Recibes el "no podemos entrar" a las 22:00',
                  'Contestas las mismas preguntas en tres idiomas',
                  'La reseña de 4 estrellas llega sin aviso',
                ].map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }} className="flex items-start gap-3">
                    <div className="w-px h-4 bg-white/10 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{t}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.2, duration: G.base, ease: G.ease }}
              className="p-6 sm:p-8 rounded-2xl bg-violet-500/[0.04] border border-violet-500/10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-xs uppercase tracking-widest text-violet-400/60">Después</span>
              </div>
              <div className="space-y-3">
                {[
                  'Añades el link al mensaje de bienvenida y llega con cada reserva',
                  'El huésped llega sabiendo cómo entrar y aparcar',
                  'Las dudas las resuelve el chatbot en su idioma',
                  'Tú no repites nada',
                  'El check-in empieza bien y la reseña lo nota',
                ].map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.08 + 0.25 }} className="flex items-start gap-3">
                    <div className="w-px h-4 bg-violet-500/30 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-500">{t}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 sm:py-28 px-6 bg-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: G.slow, ease: G.ease }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#111] mb-4 leading-tight">
            Tu próximo huésped ya tiene reserva, y también muchas preguntas.
          </h2>
          <p className="text-base text-[#777] mb-10 max-w-lg mx-auto leading-relaxed">
            Prepara tu guía antes de que llegue. Check-in, WiFi y normas. Con eso ya puedes empezar.
          </p>
          <a href="/demo" className="group inline-flex items-center gap-2 px-8 py-4 bg-[#111] text-white text-base font-medium rounded-lg hover:bg-black transition-colors">
            Empieza gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <p className="text-xs text-[#ccc] mt-4">No necesitas tarjeta. Configúralo en 10 minutos.</p>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center">
        <p className="text-xs text-[#ccc]">Itineramio</p>
      </footer>

      {/* ===== FLOATING CHATBOT HOLOGRAM ===== */}
      <FloatingChatHologram />
    </div>
  )
}
