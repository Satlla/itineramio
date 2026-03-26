'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, ChevronDown, Check, Star, Wifi, DoorOpen,
  MessageCircle, Menu, X, MapPin, Bot, Zap, Globe, Bell
} from 'lucide-react'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

// ─── DATA ─────────────────────────────────────────────────────────────────────

const LOGOS = ['Airbnb', 'Booking.com', 'Vrbo', 'Holidu', 'Wimdu', 'HomeAway', 'Expedia']

const FEATURES = [
  { icon: <Zap className="w-5 h-5" />, title: 'Guías en 10 minutos', body: 'Entrada, WiFi, normas, parking — organizado por zonas. Sin copiar y pegar. Sin PDFs que nadie abre.', wide: true },
  { icon: <Bot className="w-5 h-5" />, title: 'Chatbot en su idioma', body: 'Detecta el idioma del huésped y responde usando la información de tu apartamento. 24/7.' },
  { icon: <Globe className="w-5 h-5" />, title: 'Sin descarga ni registro', body: 'La guía se abre en el navegador del móvil. Sin app. Sin fricción.' },
  { icon: <Bell className="w-5 h-5" />, title: 'Se envía sola', body: 'Pega el enlace en Airbnb o Booking. Cada reserva recibe la guía correcta.' },
  { icon: <MessageCircle className="w-5 h-5" />, title: 'Multiidioma automático', body: 'Español, inglés, francés. El chatbot detecta y responde. Configuras una sola vez.' },
]

const WHY = [
  { stat: '86%', label: 'de preguntas se repiten', body: 'Las mismas dudas, cada reserva. Entrada, WiFi, parking, normas. La guía las resuelve todas antes de que pregunten.' },
  { stat: '4,8★', label: 'exige Superhost', body: 'Una reseña de confusión baja tu posición. Llega con la guía = menos confusión = mejores valoraciones.' },
  { stat: '10 min', label: 'para la primera guía', body: 'Sin formularios complicados. Empieza con entrada, WiFi y normas. En 10 minutos estás listo.' },
]

const TESTIMONIALS = [
  {
    quote: 'Antes enviaba la clave del WiFi más que cualquier otro mensaje. Ahora el huésped llega con la guía y ya lo sabe todo. Llevo 3 meses sin que nadie me pregunte por el acceso.',
    name: 'Carmen R.',
    role: 'Anfitriona · 7 apartamentos · Barcelona',
    avatar: 'https://i.pravatar.cc/80?img=47',
    stars: 5,
  },
  {
    quote: 'El chatbot responde en inglés, francés y alemán sin que yo toque nada. Mis valoraciones subieron medio punto en dos meses. Ya no me escriben de madrugada preguntando cómo entrar.',
    name: 'Marcos T.',
    role: 'Gestor de alquileres · 9 pisos · Madrid',
    avatar: 'https://i.pravatar.cc/80?img=12',
    stars: 5,
  },
  {
    quote: 'Con 8 pisos y solo yo gestionando, necesitaba algo que trabajara mientras duermo. Itineramio lo hace. El huésped llega, abre la guía, y yo descanso.',
    name: 'Laura S.',
    role: 'Superhost · 8 propiedades · Valencia',
    avatar: 'https://i.pravatar.cc/80?img=32',
    stars: 5,
  },
]

const FAQS = [
  { q: '¿Cómo llega la guía al huésped?', a: 'Pegas el enlace en tu mensaje automático de Airbnb o Booking. Cada nueva reserva recibe la guía correcta en el momento de la confirmación, sin que hagas nada.' },
  { q: '¿El huésped necesita descargar una app?', a: 'No. La guía se abre en el navegador del móvil. Sin descarga, sin registro. El huésped hace clic en el enlace y ya está dentro.' },
  { q: '¿Y si el huésped habla otro idioma?', a: 'El chatbot detecta el idioma automáticamente y responde en el suyo. Disponible en español, inglés y francés. Tú configuras el contenido una sola vez.' },
]

// ─── ANIMATED DEMO WIDGET ─────────────────────────────────────────────────────

/*
  Sequence:
  0 → cursor center, overview
  1 → move to WiFi card
  2 → click WiFi
  3 → WiFi expanded
  4 → move to chat button
  5 → click chat
  6 → chat opens
  7 → guest message appears
  8 → typing indicator
  9 → bot response
  10 → reset
*/
const SEQ = [
  { cx: 38, cy: 52, click: false, zone: null as null|string, chat: false, msg: 0, dur: 900 },
  { cx: 30, cy: 52, click: false, zone: null,      chat: false, msg: 0, dur: 600 },
  { cx: 30, cy: 52, click: true,  zone: 'wifi',    chat: false, msg: 0, dur: 700 },
  { cx: 30, cy: 52, click: false, zone: 'wifi',    chat: false, msg: 0, dur: 1000 },
  { cx: 68, cy: 52, click: false, zone: 'wifi',    chat: false, msg: 0, dur: 700 },
  { cx: 68, cy: 52, click: true,  zone: 'entrada', chat: false, msg: 0, dur: 700 },
  { cx: 68, cy: 52, click: false, zone: 'entrada', chat: false, msg: 0, dur: 800 },
  { cx: 88, cy: 84, click: false, zone: 'entrada', chat: false, msg: 0, dur: 700 },
  { cx: 88, cy: 84, click: true,  zone: 'entrada', chat: true,  msg: 0, dur: 600 },
  { cx: 88, cy: 84, click: false, zone: 'entrada', chat: true,  msg: 1, dur: 900 },
  { cx: 88, cy: 84, click: false, zone: 'entrada', chat: true,  msg: 2, dur: 1100 },
  { cx: 88, cy: 84, click: false, zone: 'entrada', chat: true,  msg: 3, dur: 2800 },
]

const ZONES = [
  { id: 'wifi',    icon: <Wifi className="w-4 h-4"/>,       label: 'WiFi',    detail: ['Red: ItineramioApts_5G', 'Clave: balcon2024#'] },
  { id: 'entrada', icon: <DoorOpen className="w-4 h-4"/>,   label: 'Entrada', detail: ['Caja llaves: código 4521', 'Pulsa el botón 2 seg'] },
  { id: 'parking', icon: <MapPin className="w-4 h-4"/>,     label: 'Parking', detail: ['Plaza B-14 · Pase incluido'] },
  { id: 'normas',  icon: <MessageCircle className="w-4 h-4"/>, label: 'Normas', detail: ['Check-out antes de las 11h'] },
]

function DemoWidget() {
  const [step, setStep] = useState(0)
  const s = SEQ[step % SEQ.length]

  useEffect(() => {
    const t = setTimeout(() => setStep(p => (p + 1) % SEQ.length), s.dur)
    return () => clearTimeout(t)
  }, [step, s.dur])

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)]">
        {/* Browser chrome */}
        <div className="bg-[#efefef] px-4 py-2.5 flex items-center gap-3 border-b border-black/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-[#aaa] font-medium">
            app.itineramio.com/guide/apartamento-barceloneta
          </div>
        </div>

        {/* App UI */}
        <div className="bg-white relative overflow-hidden" style={{ height: 340 }}>
          {/* App header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.05]">
            <div className="flex items-center gap-2">
              <img src="/isotipo-gradient.svg" alt="" width={20} height={11} className="object-contain" />
              <span className="text-xs font-bold text-[#111]">Apartamento Barceloneta</span>
            </div>
            <motion.button
              animate={s.chat ? { backgroundColor: '#7c3aed', color: '#fff' } : { backgroundColor: '#f5f3f0', color: '#555' }}
              transition={{ duration: 0.3 }}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <MessageCircle className="w-3 h-3" />
              Chatbot
            </motion.button>
          </div>

          {/* Zone grid */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ZONES.map(z => {
              const active = s.zone === z.id
              return (
                <motion.div
                  key={z.id}
                  animate={active
                    ? { borderColor: 'rgba(124,58,237,0.4)', backgroundColor: 'rgba(237,233,254,0.5)', scale: 1.02 }
                    : { borderColor: 'rgba(0,0,0,0.06)', backgroundColor: '#f9f9f9', scale: 1 }
                  }
                  transition={{ duration: 0.22 }}
                  className="rounded-xl border p-3 flex flex-col gap-2 cursor-default"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${active ? 'bg-violet-700 text-white' : 'bg-white text-[#555]'}`}>
                    {z.icon}
                  </div>
                  <span className="text-xs font-bold text-[#111]">{z.label}</span>
                  <AnimatePresence>
                    {active && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        {z.detail.map((l, i) => <p key={i} className="text-[10px] text-violet-700 leading-relaxed">{l}</p>)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Chat panel */}
          <AnimatePresence>
            {s.chat && (
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="absolute inset-0 bg-white border-l border-black/[0.05] flex flex-col"
              >
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.05]">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-violet-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111]">Asistente IA</p>
                    <p className="text-[10px] text-green-500 font-semibold">● En línea</p>
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-end gap-3 overflow-hidden">
                  <AnimatePresence>
                    {s.msg >= 1 && (
                      <motion.div key="q" initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.28 }} className="self-end">
                        <div className="bg-[#111] text-white text-[11px] px-3 py-2 rounded-2xl rounded-br-sm max-w-[180px]">
                          How do I get in? I can't find the keys 🤔
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg === 2 && (
                      <motion.div key="typing" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }} className="self-start">
                        <div className="bg-[#f5f3f0] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} className="w-1.5 h-1.5 rounded-full bg-[#aaa]" />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg >= 3 && (
                      <motion.div key="a" initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35 }} className="self-start">
                        <div className="bg-[#f5f3f0] text-[#111] text-[11px] px-3 py-2.5 rounded-2xl rounded-bl-sm max-w-[220px] leading-relaxed">
                          Hi! 👋 The key box is next to the door. Code: <strong>4521</strong>. Hold the button for 2 seconds and the door opens!
                        </div>
                        <p className="text-[9px] text-[#ccc] mt-1 ml-1">Itineramio AI · ahora</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="px-4 py-3 border-t border-black/[0.05]">
                  <div className="bg-[#f5f3f0] rounded-full px-4 py-2 text-[10px] text-[#ccc]">Escribe en cualquier idioma…</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cursor */}
          <motion.div
            animate={{ left: `${s.cx}%`, top: `${s.cy}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 26, mass: 0.9 }}
            className="absolute pointer-events-none z-50"
            style={{ transform: 'translate(-3px, -3px)' }}
          >
            <AnimatePresence>
              {s.click && (
                <motion.div
                  key={`r${step}`}
                  initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute w-7 h-7 rounded-full bg-violet-500/30 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: 4, top: 4 }}
                />
              )}
            </AnimatePresence>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 1.5L3 17L7 12.5L10 18.5L12.5 17.5L9.5 11.5H16L3 1.5Z" fill="#111111" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        initial={{ opacity: 0, x: -16, y: 8 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -left-14 top-16 hidden lg:flex items-center gap-3 bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] px-4 py-3"
      >
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">✓</div>
        <div>
          <p className="text-xs font-bold text-[#111]">Guía enviada</p>
          <p className="text-[10px] text-[#aaa]">Reserva confirmada</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16, y: -8 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 1, duration: 0.5 }}
        className="absolute -right-14 bottom-16 hidden lg:block bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] px-4 py-3"
      >
        <div className="flex gap-0.5 mb-1">
          {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400"/>)}
        </div>
        <p className="text-[11px] font-bold text-[#111]">"Todo perfecto desde el primer día"</p>
        <p className="text-[9px] text-[#aaa] mt-0.5">Airbnb · hace 2 días</p>
      </motion.div>
    </div>
  )
}

// ─── LOGO FADE CAROUSEL ───────────────────────────────────────────────────────

function LogoCarousel() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % LOGOS.length), 1800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="h-10 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="text-2xl font-black text-[#ccc] tracking-tight"
        >
          {LOGOS[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Landing2() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [tIdx, setTIdx] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTIdx(p => (p + 1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="min-h-screen bg-white text-[#111] overflow-x-hidden"
      style={{ fontFamily: 'Inter, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' } as React.CSSProperties}
    >

      {/* ── 1. NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={30} height={17} className="object-contain" />
            <span className="font-bold text-[15px] tracking-tight">Itineramio</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['Producto', '#features'], ['Cómo funciona', '#how'], ['Testimonios', '#testimonials'], ['FAQ', '#faq']].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-[#555] hover:text-[#111] transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-[#555] hover:text-[#111] transition-colors font-medium">Entrar</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 bg-[#7c3aed] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-violet-800 transition-colors shadow-sm">
              Empieza gratis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button className="md:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-black/5 px-6 py-5 flex flex-col gap-5">
              {['Producto', 'Cómo funciona', 'Testimonios', 'FAQ'].map(item => (
                <button key={item} className="text-sm text-[#555] text-left">{item}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── 2. HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-12 overflow-hidden">
        {/* Wave gradient bg */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[65%] rounded-b-[50%]"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0) 70%)' }}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm text-violet-700 font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
          Para anfitriones con 6 o más propiedades en España
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}
          className="font-black leading-[1.04] tracking-tight mb-5 max-w-4xl"
          style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5rem)' }}
        >
          Los huéspedes no leen.<br />
          <span className="bg-gradient-to-r from-violet-700 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Pero siguen preguntando lo mismo.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[#555] font-medium mb-10 max-w-xl leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
        >
          Configuras la guía una vez. El huésped la recibe con la confirmación de reserva
          y llega sabiendo cómo entrar, cuál es el WiFi y qué tiene que hacer.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-3">
          <Link href="/register" className="group inline-flex items-center gap-2.5 bg-[#7c3aed] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-violet-800 transition-all shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
            Empieza gratis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 border border-black/10 text-[#555] hover:text-[#111] hover:border-black/20 px-8 py-4 rounded-full font-semibold text-base transition-all">
            Ver demo
          </Link>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="text-sm text-[#bbb] mb-16">
          Sin tarjeta · Sin app · 10 minutos para la primera guía
        </motion.p>

        {/* Demo widget */}
        <motion.div
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full px-4"
        >
          <DemoWidget />
        </motion.div>
      </section>

      {/* ── 3. LOGOS CAROUSEL ── */}
      <section className="py-14 border-y border-black/[0.06]">
        <div className="max-w-xl mx-auto px-6 flex flex-col items-center gap-6">
          <p className="text-xs uppercase tracking-widest text-[#bbb] font-medium">Los huéspedes llegan desde</p>
          <LogoCarousel />
          <div className="flex gap-1.5">
            {LOGOS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-500 ${i === (Math.floor(Date.now() / 1800) % LOGOS.length) ? 'w-4 h-1.5 bg-violet-500' : 'w-1.5 h-1.5 bg-black/10'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURE CARDS ── */}
      <section id="features" className="py-20 px-6 bg-[#f5f3f0]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-violet-700 text-sm uppercase tracking-widest font-semibold mb-3">El producto</motion.p>
            <motion.h2 variants={fadeUp} className="font-black text-[#111] leading-tight" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Todo lo que necesita un anfitrión serio.
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i} variants={fadeUp}
                whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.08)', transition: { duration: 0.2 } }}
                className={`bg-white rounded-[20px] p-8 flex flex-col gap-5 ${f.wide ? 'lg:col-span-2' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-700">
                  {f.icon}
                </div>
                <h3 className="text-[17px] font-bold text-[#111] leading-snug">{f.title}</h3>
                <p className="text-[15px] text-[#555] leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. WHY ITINERAMIO — 3 cards ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-violet-700 text-sm uppercase tracking-widest font-semibold mb-3">Por qué Itineramio</motion.p>
            <motion.h2 variants={fadeUp} className="font-black text-[#111] leading-tight max-w-xl" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Los números que importan.
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHY.map((w, i) => (
              <motion.div
                key={i} variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-[#f5f3f0] rounded-[20px] p-8 flex flex-col gap-4"
              >
                <span className="font-black text-[#111] leading-none" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>{w.stat}</span>
                <p className="text-sm font-bold text-violet-700 uppercase tracking-wide">{w.label}</p>
                <p className="text-[15px] text-[#555] leading-relaxed">{w.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 6. TESTIMONIALS CAROUSEL ── */}
      <section id="testimonials" className="py-20 px-6 bg-[#f5f3f0]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.p variants={fadeUp} className="text-violet-700 text-sm uppercase tracking-widest font-semibold mb-3">Anfitriones reales</motion.p>
            <motion.h2 variants={fadeUp} className="font-black text-[#111]" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Lo que dicen quienes ya lo usan.
            </motion.h2>
          </motion.div>

          {/* Single testimonial fade carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={tIdx}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-white rounded-[20px] p-10 sm:p-14"
              >
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: TESTIMONIALS[tIdx].stars }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[#111] font-medium leading-relaxed mb-10" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)' }}>
                  "{TESTIMONIALS[tIdx].quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img src={TESTIMONIALS[tIdx].avatar} alt={TESTIMONIALS[tIdx].name} width={52} height={52} className="rounded-full object-cover ring-2 ring-violet-100" />
                  <div>
                    <p className="font-bold text-[#111] text-base">{TESTIMONIALS[tIdx].name}</p>
                    <p className="text-[#999] text-sm mt-0.5">{TESTIMONIALS[tIdx].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots — bottom left like arini */}
            <div className="flex gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === tIdx ? 'w-7 h-2 bg-violet-700' : 'w-2 h-2 bg-black/15 hover:bg-black/25'}`}
                />
              ))}
              <button onClick={() => setTIdx(p => (p + 1) % TESTIMONIALS.length)}
                className="ml-auto text-[#555] hover:text-[#111] transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. ANALYTICS / COMPARISON ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-violet-700 text-sm uppercase tracking-widest font-semibold mb-3">El impacto real</motion.p>
            <motion.h2 variants={fadeUp} className="font-black text-[#111]" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Tu semana, antes y después.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {/* Before */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-[#f5f3f0] rounded-[20px] p-8">
              <div className="flex items-center gap-2 mb-7">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#999]">Sin Itineramio</p>
              </div>
              {[
                ['—', 'Envías el WiFi más que saludos'],
                ['—', '"No podemos entrar." A las 22h'],
                ['—', 'Contestas en tres idiomas lo mismo'],
                ['—', 'Una reseña de 4★ por confusión'],
                ['—', 'Tu móvil no para en ningún momento'],
              ].map(([sym, text], i) => (
                <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className="w-5 h-5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-400" />
                  </div>
                  <p className="text-sm text-[#888] leading-relaxed">{text}</p>
                </div>
              ))}
            </motion.div>

            {/* After */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-violet-50 border border-violet-100 rounded-[20px] p-8">
              <div className="flex items-center gap-2 mb-7">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Con Itineramio</p>
              </div>
              {[
                'La guía se envía sola al confirmar la reserva',
                'Las instrucciones de acceso ya están en la guía',
                'El chatbot responde en el idioma del huésped',
                'Menos dudas = menos confusión = mejores reseñas',
                'Tú dejas de repetir lo mismo cada semana',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-violet-700" />
                  </div>
                  <p className="text-sm text-[#444] leading-relaxed">{text}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Featured quote */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-[#111] rounded-[20px] p-10 text-white text-center">
            <p className="text-[#777] text-sm uppercase tracking-widest mb-5">Resultado real</p>
            <p className="font-black text-white leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
              "Llevo 3 meses sin que nadie me pregunte por el acceso."
            </p>
            <p className="text-[#555] text-sm">Carmen R. · 7 apartamentos · Barcelona</p>
          </motion.div>
        </div>
      </section>

      {/* ── 8. PRODUCT IN ACTION (Adaptive section) ── */}
      <section className="py-20 px-6 bg-[#f5f3f0]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-violet-700 text-sm uppercase tracking-widest font-semibold mb-4">La guía en acción</p>
              <h2 className="font-black text-[#111] leading-tight mb-6" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                Tú defines el contenido una vez.<br />La IA responde por ti.
              </h2>
              <div className="space-y-4 text-[15px] text-[#555] leading-relaxed mb-8">
                <p>El huésped recibe el enlace con la confirmación. Abre la guía en su móvil — sin app, sin registro.</p>
                <p>Ve la entrada, el WiFi, las normas y el parking. Si tiene alguna duda, el chatbot responde en su idioma usando la información que tú has configurado.</p>
                <p className="text-[#111] font-bold text-lg">Una vez configurado, trabaja solo.</p>
              </div>
              <Link href="/register" className="group inline-flex items-center gap-2 bg-[#7c3aed] text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-violet-800 transition-all shadow-sm">
                Crear mi primera guía
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.1)]">
              <img src="/landing-mockup-2.png" alt="Guía de apartamento en móvil" className="w-full h-auto" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section id="faq" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.h2 variants={fadeUp} className="font-black text-[#111]" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Preguntas frecuentes
            </motion.h2>
          </motion.div>

          {/* Arini-style: border-top dividers, no cards */}
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="border-t border-black/[0.07] first:border-t-0">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-7 text-left">
                <span className={`text-[15px] font-semibold leading-snug transition-colors ${openFaq === i ? 'text-violet-700' : 'text-[#111]'}`}>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#aaa] shrink-0 mt-0.5 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <p className="text-[15px] text-[#555] leading-relaxed pb-7">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 10. FINAL CTA ── */}
      <section className="relative py-36 px-6 overflow-hidden text-center bg-[#0e0e0e]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.5) 0%, transparent 70%)' }}
          />
        </div>
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-black text-white leading-[1.05] mb-5" style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
            Tu próximo huésped<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              ya tiene reserva.
            </span>
          </h2>
          <p className="text-[#555] text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            Empieza por entrada, WiFi y normas.<br />
            Ese primer paso ya te quita repeticiones.
          </p>
          <Link href="/register" className="group inline-flex items-center gap-3 bg-white text-[#111] px-10 py-5 rounded-full font-black text-xl hover:bg-violet-50 transition-all shadow-[0_0_50px_rgba(124,58,237,0.25)]">
            Empieza gratis
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-[#444]">Sin tarjeta · Sin app · Sin compromiso</p>
        </motion.div>
      </section>

      {/* ── 11. FOOTER ── */}
      <footer className="border-t border-black/[0.07] py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-5">
                <img src="/isotipo-gradient.svg" alt="Itineramio" width={26} height={15} className="object-contain" />
                <span className="font-bold text-sm">Itineramio</span>
              </Link>
              <p className="text-[#aaa] text-sm leading-relaxed max-w-[200px]">
                Guías digitales y chatbot IA para anfitriones con 6 o más propiedades en España.
              </p>
            </div>
            {[
              { title: 'Producto', links: ['Funcionalidades', 'Precios', 'Demo', 'Integraciones'] },
              { title: 'Recursos', links: ['Blog', 'Guía de inicio', 'FAQ', 'Contacto'] },
              { title: 'Legal', links: ['Privacidad', 'Términos', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#111] mb-5">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(item => <li key={item}><Link href="#" className="text-[#aaa] text-sm hover:text-[#111] transition-colors">{item}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-black/[0.05] pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#ccc] text-xs">©{new Date().getFullYear()} Itineramio. Todos los derechos reservados.</p>
            <p className="text-[#ccc] text-xs">Hecho para anfitriones serios · España 🇪🇸</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
