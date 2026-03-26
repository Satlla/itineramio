'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Check, Star, Wifi, DoorOpen, MessageCircle, Menu, X, MapPin, Coffee } from 'lucide-react'

// ─── VARIANTS ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

// ─── DATA ─────────────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: 'Antes enviaba la clave del WiFi más que cualquier otro mensaje. Ahora el huésped llega con la guía y ya lo sabe todo.',
    name: 'Carmen R.',
    role: '7 apartamentos · Barcelona',
    avatar: 'https://i.pravatar.cc/80?img=47',
    stars: 5,
  },
  {
    quote: 'El chatbot responde en inglés, francés y alemán sin que yo toque nada. Mis valoraciones subieron medio punto en dos meses.',
    name: 'Marcos T.',
    role: '9 pisos · Madrid',
    avatar: 'https://i.pravatar.cc/80?img=12',
    stars: 5,
  },
  {
    quote: 'Con 8 pisos y solo yo gestionando, necesitaba algo que trabajara mientras duermo. Itineramio lo hace.',
    name: 'Laura S.',
    role: '8 propiedades · Valencia',
    avatar: 'https://i.pravatar.cc/80?img=32',
    stars: 5,
  },
]

const faqs = [
  { q: '¿Para cuántas propiedades tiene sentido?', a: 'A partir de 4 o 5 ya notas el cambio. Si gestionas 6, 7 u 8 apartamentos el ahorro de tiempo es inmediato: menos copiar y pegar, menos responder lo mismo, menos interrupciones fuera de hora.' },
  { q: '¿El huésped necesita descargar una app?', a: 'No. La guía se abre en el navegador del móvil. Sin descarga, sin registro. El huésped hace clic en el enlace y ya está dentro.' },
  { q: '¿Y si habla otro idioma?', a: 'El chatbot detecta el idioma y responde en el suyo. Disponible en español, inglés y francés. Tú configuras el contenido una sola vez.' },
  { q: '¿Cómo llega la guía al huésped?', a: 'Pegas el enlace en tu mensaje automático de Airbnb o Booking. Cada reserva recibe la guía correcta en el momento de la confirmación.' },
  { q: '¿Es difícil de configurar?', a: 'Empieza con entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Puedes añadir más zonas después.' },
]

// ─── ANIMATED DEMO ────────────────────────────────────────────────────────────

// Steps:
// 0 → idle, cursor center
// 1 → cursor moves to WiFi card
// 2 → click WiFi card (card highlighted + expands)
// 3 → cursor moves to Entrada card
// 4 → click Entrada (card highlighted)
// 5 → cursor moves to chat button
// 6 → chat panel opens
// 7 → guest message appears
// 8 → typing indicator
// 9 → bot response appears
// 10 → reset

const STEPS = [
  { cursor: { x: 50, y: 50 }, click: false, activeZone: null as null | string, chatOpen: false, chatPhase: 0, duration: 800 },
  { cursor: { x: 37, y: 55 }, click: false, activeZone: null, chatOpen: false, chatPhase: 0, duration: 600 },
  { cursor: { x: 37, y: 55 }, click: true, activeZone: 'wifi', chatOpen: false, chatPhase: 0, duration: 900 },
  { cursor: { x: 37, y: 55 }, click: false, activeZone: 'wifi', chatOpen: false, chatPhase: 0, duration: 800 },
  { cursor: { x: 63, y: 55 }, click: false, activeZone: 'wifi', chatOpen: false, chatPhase: 0, duration: 600 },
  { cursor: { x: 63, y: 55 }, click: true, activeZone: 'entrada', chatOpen: false, chatPhase: 0, duration: 900 },
  { cursor: { x: 63, y: 55 }, click: false, activeZone: 'entrada', chatOpen: false, chatPhase: 0, duration: 700 },
  { cursor: { x: 82, y: 83 }, click: false, activeZone: 'entrada', chatOpen: false, chatPhase: 0, duration: 700 },
  { cursor: { x: 82, y: 83 }, click: true, activeZone: 'entrada', chatOpen: true, chatPhase: 0, duration: 600 },
  { cursor: { x: 82, y: 83 }, click: false, activeZone: 'entrada', chatOpen: true, chatPhase: 1, duration: 900 },
  { cursor: { x: 82, y: 83 }, click: false, activeZone: 'entrada', chatOpen: true, chatPhase: 2, duration: 1200 },
  { cursor: { x: 82, y: 83 }, click: false, activeZone: 'entrada', chatOpen: true, chatPhase: 3, duration: 2500 },
]

function AnimatedDemo() {
  const [step, setStep] = useState(0)
  const s = STEPS[Math.min(step, STEPS.length - 1)]

  useEffect(() => {
    const t = setTimeout(() => {
      setStep(prev => (prev + 1) % STEPS.length)
    }, s.duration)
    return () => clearTimeout(t)
  }, [step, s.duration])

  const zones = [
    { id: 'wifi', icon: <Wifi className="w-4 h-4" />, label: 'WiFi', detail: 'Red: ItineramioApts_5G\nClave: balcon2024#' },
    { id: 'entrada', icon: <DoorOpen className="w-4 h-4" />, label: 'Entrada', detail: 'Caja de llaves: código 4521\nPuerta: pulsa el botón 2 seg' },
    { id: 'parking', icon: <MapPin className="w-4 h-4" />, label: 'Parking', detail: 'Plaza B-14 · Pase incluido' },
    { id: 'normas', icon: <Coffee className="w-4 h-4" />, label: 'Normas', detail: 'Check-out antes de las 11h' },
  ]

  return (
    <div className="relative w-full select-none" style={{ maxWidth: 580 }}>
      {/* Browser frame */}
      <div className="rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)]">
        {/* Browser chrome */}
        <div className="bg-[#f0f0f0] px-4 py-3 flex items-center gap-3 border-b border-black/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1.5 text-xs text-[#999] font-medium">
            app.itineramio.com/guide/barceloneta
          </div>
        </div>

        {/* App content */}
        <div className="bg-white relative overflow-hidden" style={{ height: 380 }}>
          {/* App header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.05]">
            <div className="flex items-center gap-2">
              <img src="/isotipo-gradient.svg" alt="" width={22} height={12} className="object-contain" />
              <span className="text-xs font-bold text-[#111]">Apartamento Barceloneta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[10px] text-[#999] bg-[#f5f5f5] px-2 py-1 rounded-full">ES · EN · FR</div>
              <motion.button
                animate={s.activeZone === 'entrada' && s.chatOpen ? { backgroundColor: '#7c3aed', color: '#fff' } : { backgroundColor: '#f5f3f0', color: '#555' }}
                transition={{ duration: 0.3 }}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Chatbot
              </motion.button>
            </div>
          </div>

          {/* Zones grid */}
          <div className="p-4 grid grid-cols-2 gap-3">
            {zones.map(z => {
              const isActive = s.activeZone === z.id
              return (
                <motion.div
                  key={z.id}
                  animate={isActive ? {
                    borderColor: 'rgba(124, 58, 237, 0.4)',
                    backgroundColor: 'rgba(237, 233, 254, 0.5)',
                    scale: 1.02,
                  } : {
                    borderColor: 'rgba(0,0,0,0.06)',
                    backgroundColor: '#f9f9f9',
                    scale: 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border p-3.5 flex flex-col gap-2 cursor-default"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-violet-600 text-white' : 'bg-white text-[#555]'}`} style={{ transition: 'all 0.25s' }}>
                    {z.icon}
                  </div>
                  <span className="text-xs font-bold text-[#111]">{z.label}</span>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {z.detail.split('\n').map((line, i) => (
                          <p key={i} className="text-[10px] text-violet-700 leading-relaxed">{line}</p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Chat panel */}
          <AnimatePresence>
            {s.chatOpen && (
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0 bg-white border-l border-black/[0.06] flex flex-col"
              >
                {/* Chat header */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.05]">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111]">Asistente IA</p>
                    <p className="text-[10px] text-green-500 font-medium">● En línea</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 flex flex-col justify-end gap-3 overflow-hidden">
                  {/* Guest message */}
                  <AnimatePresence>
                    {s.chatPhase >= 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="self-end"
                      >
                        <div className="bg-[#111] text-white text-xs px-3 py-2 rounded-2xl rounded-br-md max-w-[180px]">
                          How do I get in? I can't find the keys 🤔
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {s.chatPhase === 2 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="self-start"
                      >
                        <div className="bg-[#f5f3f0] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                              className="w-1.5 h-1.5 rounded-full bg-[#999]"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bot response */}
                  <AnimatePresence>
                    {s.chatPhase >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="self-start"
                      >
                        <div className="bg-[#f5f3f0] text-[#111] text-xs px-3 py-2.5 rounded-2xl rounded-bl-md max-w-[210px] leading-relaxed">
                          Hi! 👋 The key box is next to the door. Code: <strong>4521</strong>. Press the button for 2 seconds and the door opens!
                        </div>
                        <p className="text-[9px] text-[#bbb] mt-1 ml-1">Itineramio AI · just now</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 border-t border-black/[0.05]">
                  <div className="bg-[#f5f3f0] rounded-full px-4 py-2 text-[10px] text-[#bbb]">
                    Escribe en cualquier idioma...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated cursor */}
          <motion.div
            animate={{ left: `${s.cursor.x}%`, top: `${s.cursor.y}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 28, mass: 0.8 }}
            className="absolute pointer-events-none z-50"
            style={{ transform: 'translate(-4px, -4px)' }}
          >
            {/* Click ripple */}
            <AnimatePresence>
              {s.click && (
                <motion.div
                  key={`ripple-${step}`}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute w-8 h-8 rounded-full bg-violet-500/40 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: 4, top: 4 }}
                />
              )}
            </AnimatePresence>
            {/* Cursor SVG */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 2L4 18L8 13.5L11.5 20L14 19L10.5 12.5H18L4 2Z" fill="#111111" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute -left-10 top-20 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] px-4 py-3 flex items-center gap-3 hidden lg:flex"
      >
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
        <div>
          <p className="text-xs font-bold text-[#111]">Guía enviada</p>
          <p className="text-[10px] text-[#999]">Reserva confirmada</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute -right-10 bottom-20 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] px-4 py-3 hidden lg:block"
      >
        <div className="flex items-center gap-1 mb-1">
          {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
        </div>
        <p className="text-[10px] font-bold text-[#111]">"Todo perfecto desde el primer día"</p>
        <p className="text-[9px] text-[#999] mt-0.5">Airbnb · hace 2 días</p>
      </motion.div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Landing2() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeT, setActiveT] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#111] overflow-x-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={32} height={18} className="object-contain" />
            <span className="font-bold text-[15px] tracking-tight">Itineramio</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {['Producto', 'Cómo funciona', 'Precios', 'FAQ'].map(item => (
              <button key={item} className="text-sm text-[#555] hover:text-[#111] transition-colors">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-[#555] hover:text-[#111] transition-colors font-medium">Entrar</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 bg-[#111] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-violet-700 transition-colors">
              Empieza gratis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button className="md:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-black/5 px-6 py-4 flex flex-col gap-4"
            >
              {['Producto', 'Cómo funciona', 'Precios', 'FAQ'].map(item => (
                <button key={item} className="text-sm text-[#555] text-left">{item}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center gap-16 px-6 pt-28 pb-16 max-w-7xl mx-auto overflow-hidden">
        {/* BG wave */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-[50%] bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-50 opacity-80 blur-3xl" style={{ animation: 'pulse 7s ease-in-out infinite' }} />
        </div>

        {/* Left: copy */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex-1 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm text-violet-700 font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Para anfitriones con 6 o más propiedades
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}
            className="text-[clamp(2.6rem,6vw,4.8rem)] font-black leading-[1.05] tracking-tight mb-5"
          >
            Los huéspedes<br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              no leen.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-[#555] font-medium mb-9 leading-relaxed"
          >
            Pero llegan preguntando lo mismo.<br />
            Tú configuras una vez. La guía hace el resto.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.32 }}
            className="flex flex-col sm:flex-row items-start gap-4 mb-5"
          >
            <Link href="/register" className="group inline-flex items-center gap-2.5 bg-[#111] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-violet-700 transition-all shadow-lg">
              Empieza gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/demo" className="inline-flex items-center gap-2 border border-black/10 text-[#555] hover:text-[#111] px-8 py-4 rounded-full font-semibold text-base transition-all">
              Ver demo
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm text-[#aaa]">
            Sin tarjeta · Sin app · 10 minutos para la primera guía
          </motion.p>
        </motion.div>

        {/* Right: animated demo */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 flex justify-center items-center w-full lg:max-w-none max-w-[540px] px-4 lg:px-0"
        >
          <AnimatedDemo />
        </motion.div>
      </section>

      {/* ── LOGOS ── */}
      <section className="py-12 border-y border-black/[0.06] bg-white overflow-hidden">
        <p className="text-center text-[#bbb] text-xs uppercase tracking-widest mb-7">Los huéspedes llegan desde</p>
        <div className="relative flex overflow-x-hidden">
          <div className="flex gap-16 animate-[marquee_18s_linear_infinite] whitespace-nowrap">
            {['Airbnb', 'Booking.com', 'Vrbo', 'Holidu', 'Wimdu', 'Direct'].map(n => (
              <span key={n} className="text-[#ccc] text-base font-bold tracking-tight">{n}</span>
            ))}
          </div>
          <div className="flex gap-16 animate-[marquee_18s_linear_infinite] whitespace-nowrap ml-16" aria-hidden>
            {['Airbnb', 'Booking.com', 'Vrbo', 'Holidu', 'Wimdu', 'Direct'].map(n => (
              <span key={n} className="text-[#ccc] text-base font-bold tracking-tight">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06]">
          {[
            { value: '86%', label: 'de preguntas de huéspedes se repiten en cada reserva' },
            { value: '4,8★', label: 'exige Superhost. Una reseña de confusión baja tu posición' },
            { value: '10 min', label: 'para tener tu primera guía lista y funcionando' },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="px-10 py-10 flex flex-col gap-3"
            >
              <span className="text-5xl sm:text-6xl font-black bg-gradient-to-br from-violet-600 to-purple-500 bg-clip-text text-transparent leading-none">{m.value}</span>
              <p className="text-[#777] text-sm leading-relaxed">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 bg-[#F5F3F0]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.p variants={fadeUp} className="text-violet-600 text-sm uppercase tracking-widest font-semibold mb-4">El producto</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black leading-tight">Todo lo que necesita<br />un anfitrión serio.</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { sym: '✦', title: 'Guías en 10 minutos', body: 'Entrada, WiFi, normas, parking. Organizado por zonas. Sin copiar y pegar. Sin PDFs que nadie abre.' },
              { sym: '◎', title: 'Chatbot en su idioma', body: 'Detecta el idioma del huésped y responde usando la información de tu propio apartamento. 24/7.' },
              { sym: '◈', title: 'Sin descarga ni registro', body: 'La guía se abre en el navegador del móvil. Sin app. Sin fricción. Funciona en cualquier dispositivo.' },
              { sym: '⬡', title: 'Se envía sola', body: 'Pega el enlace en Airbnb o Booking. Cada reserva recibe la guía correcta. Sin hacer nada tú.' },
              { sym: '◐', title: 'Multiidioma automático', body: 'Español, inglés, francés. El chatbot detecta y responde. Tú configuras una sola vez.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl p-8 flex flex-col gap-4 ${i === 0 ? 'lg:col-span-2' : ''}`}
              >
                <div className="text-2xl text-violet-600 font-black leading-none">{f.sym}</div>
                <h3 className="text-base font-bold text-[#111]">{f.title}</h3>
                <p className="text-sm text-[#777] leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-14 text-center">
            <motion.p variants={fadeUp} className="text-violet-600 text-sm uppercase tracking-widest font-semibold mb-4">Cómo funciona</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black">Tres pasos.<br />Diez minutos.</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Crea tu guía', body: 'Entrada, WiFi, normas, parking. Organizado por zonas. En 10 minutos tienes la primera guía lista.' },
              { n: '02', title: 'Configura el enlace', body: 'Pega el enlace en tu mensaje automático de Airbnb o Booking. Se envía solo en cada nueva reserva.' },
              { n: '03', title: 'El huésped llega ubicado', body: 'Sabe cómo entrar, tiene el WiFi, y si tiene alguna duda el chatbot responde en su idioma.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-[#F5F3F0] rounded-2xl p-10 flex flex-col gap-5"
              >
                <span className="text-6xl font-black text-black/[0.05] leading-none select-none">{step.n}</span>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-sm text-[#777] leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-10 flex justify-center">
            <Link href="/register" className="group inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 rounded-full font-bold hover:bg-violet-700 transition-all">
              Empezar ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEM NARRATIVE ── */}
      <section className="py-24 px-4 bg-[#111] text-white">
        <div className="max-w-4xl mx-auto space-y-7">
          {[
            { text: 'He enviado la clave del WiFi más veces de las que recuerdo.', muted: false },
            { text: 'El mismo WiFi. La misma entrada. Las mismas normas.', muted: true },
            { text: 'Cambia el nombre del huésped y repite.', muted: true },
          ].map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight ${line.muted ? 'text-white/20' : 'text-white'}`}
            >
              {line.text}
            </motion.p>
          ))}
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="pt-10 text-3xl sm:text-4xl lg:text-5xl font-black text-white/20">
            Lo que quema no es el trabajo.{' '}
            <span className="text-white">Es la repetición.</span>
          </motion.p>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black mb-14 text-center">Tu semana antes y después</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div variants={fadeUp} className="rounded-2xl bg-[#F5F3F0] p-10">
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-7">Antes</p>
                <ul className="space-y-4">
                  {['He enviado el WiFi más que saludos', 'Trabajas de copiar y pegar', '"No podemos entrar." Cuando estás cenando', 'Contestas lo mismo en tres idiomas', 'Una reseña de 4★ por una confusión'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-red-400" />
                      </div>
                      <span className="text-sm text-[#888] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div variants={fadeUp} className="rounded-2xl bg-violet-50 border border-violet-100 p-10">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-7">Después</p>
                <ul className="space-y-4">
                  {['La guía sale sola cuando se confirma la reserva', 'Llegan sabiendo cómo entrar, dónde aparcar y el WiFi', 'Menos copiar y pegar. El huésped ya sabe', 'Tú dejas de repetir lo mismo cada semana', 'La reseña lo nota'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-violet-600" />
                      </div>
                      <span className="text-sm text-[#444] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 bg-[#F5F3F0]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.p variants={fadeUp} className="text-violet-600 text-sm uppercase tracking-widest font-semibold mb-4">Anfitriones reales</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black">Lo que dicen<br /><span className="text-[#aaa]">quienes ya lo usan.</span></motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-8 flex flex-col gap-5 transition-all cursor-default ${i === activeT ? 'bg-white shadow-md ring-1 ring-violet-200' : 'bg-white/60 hover:bg-white'}`}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[#333] text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} width={36} height={36} className="rounded-full object-cover ring-2 ring-white" />
                  <div>
                    <p className="text-sm font-bold text-[#111]">{t.name}</p>
                    <p className="text-xs text-[#aaa]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveT(i)} className={`rounded-full transition-all ${i === activeT ? 'w-6 h-2 bg-violet-500' : 'w-2 h-2 bg-black/15'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-violet-600 text-sm uppercase tracking-widest font-semibold mb-6">Para quién es</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-12">
              Hecho para quien gestiona<br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">6, 7 u 8 apartamentos.</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-4 text-lg max-w-3xl leading-relaxed text-[#666]">
              <p>Mi punto de ruptura no fue un huésped. Fue el sexto piso.</p>
              <p>Con 2 o 3 apartamentos tiras. Con 6, 7 u 8, ya no. Empiezas a vivir entre mensajes, accesos, dudas y reseñas.</p>
              <p className="text-[#111] font-bold text-xl pt-4">No necesitas otro chat.<br />Necesitas que el huésped llegue con lo básico ya claro.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-[#F5F3F0]">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black">Lo que suelen preguntar</motion.h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="bg-white rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left">
                  <span className={`text-[15px] font-semibold transition-colors ${openFaq === i ? 'text-violet-700' : 'text-[#111]'}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#aaa] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="text-sm text-[#777] leading-relaxed px-7 pb-6">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-40 px-4 overflow-hidden flex flex-col items-center justify-center text-center bg-[#111]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-violet-800/20 blur-[130px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl sm:text-7xl lg:text-[5rem] font-black leading-[1.0] mb-6 text-white">
            Tu próximo huésped<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">ya tiene reserva.</span>
          </h2>
          <p className="text-xl text-white/40 mb-12 max-w-xl mx-auto leading-relaxed">
            Empieza por entrada, WiFi y normas.<br />Ese primer paso ya te quita repeticiones.
          </p>
          <Link href="/register" className="group inline-flex items-center gap-3 bg-white text-[#111] px-10 py-5 rounded-full font-black text-xl hover:bg-violet-100 transition-all shadow-[0_0_60px_rgba(139,92,246,0.25)]">
            Empieza gratis
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-white/25">Sin tarjeta · Sin app · Sin compromiso</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/[0.06] py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <img src="/isotipo-gradient.svg" alt="Itineramio" width={26} height={15} className="object-contain" />
                <span className="font-bold text-sm">Itineramio</span>
              </Link>
              <p className="text-[#aaa] text-sm leading-relaxed">Guías digitales y chatbot IA para anfitriones con 6 o más propiedades en España.</p>
            </div>
            {[
              { title: 'Producto', links: ['Funcionalidades', 'Precios', 'Demo', 'Integraciones'] },
              { title: 'Recursos', links: ['Blog', 'Guía de inicio', 'FAQ', 'Contacto'] },
              { title: 'Legal', links: ['Privacidad', 'Términos', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-widest mb-5">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(item => <li key={item}><Link href="#" className="text-[#aaa] text-sm hover:text-[#111] transition-colors">{item}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-black/[0.05] pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#ccc] text-xs">© {new Date().getFullYear()} Itineramio. Todos los derechos reservados.</p>
            <p className="text-[#ccc] text-xs">Hecho para anfitriones serios · España 🇪🇸</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}
