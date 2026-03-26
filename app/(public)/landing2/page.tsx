'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, Check, Star, Wifi, DoorOpen, MessageCircle, Menu, X, Bot, Zap, Globe, Bell } from 'lucide-react'

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

// ─── DATA ─────────────────────────────────────────────────────────────────────

// COPIES EXACTOS DE HAROON
const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Guías automáticas',
    body: 'Crea la guía una vez y haz que se envíe automáticamente al confirmarse la reserva. Así llegan sabiendo cómo entrar, dónde aparcar y cuál es la clave del WiFi.',
    wide: true,
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'Chatbot en su idioma',
    body: 'El huésped pregunta. El chatbot responde usando la información de tu apartamento. 24/7, sin ti.',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Sin app ni registro',
    body: 'El huésped abre la guía en el navegador del móvil. Sin descarga. Sin fricción.',
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: 'Envío automático',
    body: 'Pega el enlace en Airbnb o Booking. Cada reserva recibe la guía correcta.',
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'Multiidioma',
    body: 'Español, inglés, francés. El chatbot detecta y responde. Configuras una sola vez.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'Los huéspedes no leen, ya está. Pero desde que uso Itineramio llegan con todo claro. Tres meses sin que nadie me pregunte por el acceso.',
    name: 'Carmen R.',
    role: 'Anfitriona · 7 apartamentos · Barcelona',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    stars: 5,
  },
  {
    quote: 'El chatbot responde en inglés, francés y alemán sin que yo toque nada. Mis valoraciones subieron medio punto en dos meses.',
    name: 'Marcos T.',
    role: 'Gestor de alquileres · 9 pisos · Madrid',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    stars: 5,
  },
  {
    quote: 'Con 8 pisos y solo yo gestionando, necesitaba algo que trabajara mientras duermo. Itineramio lo hace.',
    name: 'Laura S.',
    role: 'Superhost · 8 propiedades · Valencia',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    stars: 5,
  },
]

const LOGOS = ['Airbnb', 'Booking.com', 'Vrbo', 'Holidu', 'Wimdu', 'HomeAway', 'Expedia']

const FAQS = [
  {
    q: '¿Cómo llega la guía al huésped?',
    a: 'Pegas el enlace en tu mensaje automático de Airbnb o Booking. Cuando se confirma la reserva, el huésped lo recibe. Así llegáis los dos mucho mejor al check-in.',
  },
  {
    q: '¿El huésped necesita descargar una app?',
    a: 'No. La guía se abre en el navegador del móvil. Sin descarga, sin registro. Hace clic y ya está dentro.',
  },
  {
    q: '¿Y si habla otro idioma?',
    a: 'El chatbot detecta el idioma automáticamente y responde en el suyo. Disponible en español, inglés y francés.',
  },
]

// ─── ANIMATED DEMO ────────────────────────────────────────────────────────────
const SEQ = [
  { cx: 35, cy: 50, click: false, zone: null as null|string, chat: false, msg: 0, dur: 900 },
  { cx: 27, cy: 50, click: false, zone: null,      chat: false, msg: 0, dur: 550 },
  { cx: 27, cy: 50, click: true,  zone: 'wifi',    chat: false, msg: 0, dur: 650 },
  { cx: 27, cy: 50, click: false, zone: 'wifi',    chat: false, msg: 0, dur: 950 },
  { cx: 65, cy: 50, click: false, zone: 'wifi',    chat: false, msg: 0, dur: 600 },
  { cx: 65, cy: 50, click: true,  zone: 'entrada', chat: false, msg: 0, dur: 650 },
  { cx: 65, cy: 50, click: false, zone: 'entrada', chat: false, msg: 0, dur: 800 },
  { cx: 87, cy: 82, click: false, zone: 'entrada', chat: false, msg: 0, dur: 650 },
  { cx: 87, cy: 82, click: true,  zone: 'entrada', chat: true,  msg: 0, dur: 550 },
  { cx: 87, cy: 82, click: false, zone: 'entrada', chat: true,  msg: 1, dur: 850 },
  { cx: 87, cy: 82, click: false, zone: 'entrada', chat: true,  msg: 2, dur: 1000 },
  { cx: 87, cy: 82, click: false, zone: 'entrada', chat: true,  msg: 3, dur: 2800 },
]

const ZONES = [
  { id: 'wifi',    icon: <Wifi className="w-4 h-4"/>,        label: 'WiFi',    detail: ['Red: ItineramioApts_5G', 'Clave: balcon2024#'] },
  { id: 'entrada', icon: <DoorOpen className="w-4 h-4"/>,    label: 'Entrada', detail: ['Caja llaves: código 4521', 'Pulsa el botón 2 seg'] },
  { id: 'parking', icon: <Bot className="w-4 h-4"/>,         label: 'Parking', detail: ['Plaza B-14 · Pase incluido'] },
  { id: 'normas',  icon: <MessageCircle className="w-4 h-4"/>,label: 'Normas',  detail: ['Check-out antes de las 11h'] },
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
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)' }}>
        {/* Browser bar */}
        <div className="bg-[#f0f0f0] px-4 py-2.5 flex items-center gap-3 border-b border-black/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-[#aaa]">
            app.itineramio.com/guide/apartamento-barceloneta
          </div>
        </div>
        {/* App */}
        <div className="bg-white relative overflow-hidden" style={{ height: 320 }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.05]">
            <div className="flex items-center gap-2">
              <img src="/isotipo-gradient.svg" alt="" width={18} height={10} className="object-contain" />
              <span className="text-xs font-bold text-[#111]">Apartamento Barceloneta</span>
            </div>
            <motion.button
              animate={s.chat ? { backgroundColor: '#7c3aed', color: '#fff' } : { backgroundColor: '#ede9ff', color: '#7c3aed' }}
              transition={{ duration: 0.25 }}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <MessageCircle className="w-3 h-3" /> Chatbot
            </motion.button>
          </div>
          <div className="p-4 grid grid-cols-4 gap-2.5">
            {ZONES.map(z => {
              const active = s.zone === z.id
              return (
                <motion.div key={z.id}
                  animate={active ? { borderColor: 'rgba(124,58,237,0.35)', backgroundColor: '#ede9ff', scale: 1.02 } : { borderColor: 'rgba(0,0,0,0.06)', backgroundColor: '#f9f9f9', scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border p-2.5 flex flex-col gap-1.5 cursor-default"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${active ? 'bg-violet-700 text-white' : 'bg-white text-[#777]'}`}>{z.icon}</div>
                  <span className="text-[10px] font-bold text-[#111]">{z.label}</span>
                  <AnimatePresence>
                    {active && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                        {z.detail.map((l, i) => <p key={i} className="text-[9px] text-violet-700 leading-snug">{l}</p>)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
          <AnimatePresence>
            {s.chat && (
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="absolute inset-0 bg-white border-l border-black/[0.05] flex flex-col">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-black/[0.05]">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-violet-700" /></div>
                  <div>
                    <p className="text-[11px] font-bold text-[#111]">Asistente IA</p>
                    <p className="text-[9px] text-green-500 font-semibold">● En línea</p>
                  </div>
                </div>
                <div className="flex-1 p-3.5 flex flex-col justify-end gap-2.5 overflow-hidden">
                  <AnimatePresence>
                    {s.msg >= 1 && (
                      <motion.div key="q" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="self-end">
                        <div className="bg-[#111] text-white text-[10px] px-2.5 py-1.5 rounded-2xl rounded-br-sm max-w-[160px]">How do I get in? Can't find keys 🤔</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg === 2 && (
                      <motion.div key="dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="self-start">
                        <div className="bg-[#f5f3f0] px-3 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                          {[0,1,2].map(i => <motion.div key={i} animate={{ y: [0,-3,0] }} transition={{ repeat: Infinity, duration: 0.65, delay: i*0.13 }} className="w-1.5 h-1.5 rounded-full bg-[#aaa]" />)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg >= 3 && (
                      <motion.div key="a" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="self-start">
                        <div className="bg-[#f5f3f0] text-[#111] text-[10px] px-2.5 py-2 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed">
                          Hi! 👋 Key box is next to the door. Code: <strong>4521</strong>. Hold 2 seconds and it opens!
                        </div>
                        <p className="text-[8px] text-[#ccc] mt-0.5 ml-1">Itineramio AI · ahora</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="px-3.5 py-2.5 border-t border-black/[0.05]">
                  <div className="bg-[#f5f3f0] rounded-full px-3 py-1.5 text-[9px] text-[#ccc]">Escribe en cualquier idioma…</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Cursor */}
          <motion.div
            animate={{ left: `${s.cx}%`, top: `${s.cy}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 26 }}
            className="absolute pointer-events-none z-50" style={{ transform: 'translate(-3px,-3px)' }}
          >
            <AnimatePresence>
              {s.click && (
                <motion.div key={`r${step}`} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 2.8, opacity: 0 }} transition={{ duration: 0.38 }}
                  className="absolute w-6 h-6 rounded-full bg-violet-500/25 -translate-x-1/2 -translate-y-1/2" style={{ left: 4, top: 4 }} />
              )}
            </AnimatePresence>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2.5 1.5L2.5 15.5L6 11.5L8.5 16.5L11 15.5L8.5 10.5H14L2.5 1.5Z" fill="#111" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      </div>
      {/* Floating badges */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
        className="absolute -left-12 top-14 hidden lg:flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-2.5" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">✓</div>
        <div><p className="text-xs font-bold text-[#111]">Guía enviada</p><p className="text-[10px] text-[#aaa]">Reserva confirmada</p></div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }}
        className="absolute -right-12 bottom-14 hidden lg:block bg-white rounded-2xl px-3.5 py-2.5" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
        <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(i=><Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400"/>)}</div>
        <p className="text-[10px] font-bold text-[#111]">"Todo perfecto desde el primer día"</p>
        <p className="text-[9px] text-[#aaa] mt-0.5">Airbnb · hace 2 días</p>
      </motion.div>
    </div>
  )
}

// ─── LOGO CAROUSEL (fade, 1 at a time — arini style) ─────────────────────────
function LogoCarousel() {
  const [idx, setIdx] = useState(0)
  useEffect(() => { const t = setInterval(() => setIdx(p => (p+1) % LOGOS.length), 1600); return () => clearInterval(t) }, [])
  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#bbb] font-medium">Los huéspedes llegan desde</p>
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }} className="text-xl font-semibold text-[#ccc] tracking-tight">
            {LOGOS[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5">
        {LOGOS.map((_, i) => <div key={i} className={`rounded-full transition-all duration-400 ${i === idx ? 'w-5 h-1.5 bg-violet-600' : 'w-1.5 h-1.5 bg-black/10'}`} />)}
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Landing2() {
  const [scrolled, setScrolled] = useState(false)
  const [mob, setMob] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number|null>(null)
  const [tIdx, setTIdx] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTIdx(p => (p+1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#111] overflow-x-hidden"
      style={{ fontFamily: 'Inter, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-transparent'}`}
        style={scrolled ? { boxShadow: '0 1px 0 rgba(0,0,0,0.06)' } : {}}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} className="object-contain" />
            <span className="font-bold text-[15px]">Itineramio</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['Producto','#features'],['Cómo funciona','#how'],['Testimonios','#testimonials'],['FAQ','#faq']].map(([l,h]) => (
              <a key={l} href={h} className="text-sm text-[#666] hover:text-[#111] transition-colors font-medium">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-[#666] hover:text-[#111] font-medium transition-colors">Entrar</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all"
              style={{ backgroundColor: '#7c3aed', boxShadow: '0 2px 12px rgba(124,58,237,0.3)' }}>
              Empieza gratis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button className="md:hidden p-1" onClick={() => setMob(!mob)}>
              {mob ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mob && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-black/5 px-6 py-5 flex flex-col gap-5">
              {['Producto','Cómo funciona','Testimonios','FAQ'].map(l => <button key={l} className="text-sm text-[#666] text-left font-medium">{l}</button>)}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden">
        {/* Wave bg — arini style */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[60%]"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />
        </div>

        {/* Pill badge */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm text-violet-700 font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
          Para anfitriones con 6 o más propiedades en España
        </motion.div>

        {/* Headline — arini typography: bold + light mixed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4 max-w-4xl">
          {/* Label — arini style */}
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">El problema</p>
          <h1 className="leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
            <span className="font-semibold text-[#111]">Los huéspedes no leen. </span>
            <span className="font-light text-[#aaa]">Y tú sigues enviando el mismo mensaje una y otra vez.</span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="text-base font-semibold text-[#111] mb-10">
          Crea la guía una vez. Haz que se envíe sola.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-3">
          <Link href="/register" className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-base text-white transition-all"
            style={{ backgroundColor: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
            Empieza gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 border border-black/10 text-[#666] hover:text-[#111] hover:border-black/20 px-8 py-4 rounded-full font-semibold text-base transition-all">
            Ver demo
          </Link>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm text-[#bbb] mb-14">
          Sin tarjeta · Sin app · 10 minutos para la primera guía
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="w-full px-4 lg:px-16">
          <DemoWidget />
        </motion.div>
      </section>

      {/* ── LOGOS ── */}
      <section className="py-12 border-y border-black/[0.06]">
        <div className="max-w-sm mx-auto"><LogoCarousel /></div>
      </section>

      {/* ── FEATURES (arini card layout) ── */}
      <section id="features" className="py-20 px-6" style={{ backgroundColor: '#f5f3f0' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            {/* Arini section label style */}
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-5 font-medium">El producto</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight max-w-2xl" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)' }}>
              <span className="font-semibold text-[#111]">Tu solución completa </span>
              <span className="font-light text-[#aaa]">para la comunicación con huéspedes.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base font-semibold text-[#111] mt-4">Más rápido. Sin repeticiones.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className={`bg-white rounded-[20px] p-8 flex flex-col gap-5 ${f.wide ? 'lg:col-span-2' : ''}`}
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Icon with light violet bg — like arini's light blue */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-violet-700" style={{ backgroundColor: '#ede9ff' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#111] mb-2">{f.title}</h3>
                  <p className="text-[15px] text-[#666] leading-relaxed">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-5 font-medium">Cómo funciona</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)' }}>
              <span className="font-semibold text-[#111]">Tres pasos. </span>
              <span className="font-light text-[#aaa]">Diez minutos.</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'Crea la guía', body: 'Entrada, WiFi, normas, parking. Organizado por zonas. No hace falta dejarlo perfecto. Empieza por lo básico: entrada, WiFi y normas. Ese primer paso ya te quita repeticiones.' },
              { n: '02', title: 'Activa el envío automático', body: 'Pega el enlace en tu mensaje automático de Airbnb o Booking. Cuando se confirma la reserva, el huésped lo recibe. Así llegáis los dos mucho mejor al check-in.' },
              { n: '03', title: 'El huésped llega ubicado', body: 'Sabe cómo entrar, tiene el WiFi y si duda, el chatbot responde en su idioma. Tú dejas de repetir lo mismo en cada reserva.' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className="rounded-[20px] p-8 flex flex-col gap-5" style={{ backgroundColor: '#f5f3f0' }}>
                <span className="font-bold text-[#111]/[0.06] leading-none select-none" style={{ fontSize: '4.5rem' }}>{s.n}</span>
                <h3 className="text-[17px] font-bold text-[#111]">{s.title}</h3>
                <p className="text-[15px] text-[#666] leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 flex justify-start">
            <Link href="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all"
              style={{ backgroundColor: '#7c3aed' }}>
              Empieza ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── ANALYTICS / IMPACT (arini style: chart left, copy right) ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f5f3f0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: visual comparison */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-white rounded-[20px] p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Sin Itineramio', pct: 20, color: '#e5e7eb', textColor: '#999' },
                  { label: 'Con Itineramio', pct: 92, color: '#7c3aed', textColor: '#7c3aed' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: bar.textColor }}>{bar.label}</span>
                      <span className="text-xs font-bold" style={{ color: bar.textColor }}>{bar.pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${bar.pct}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ backgroundColor: bar.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#aaa]">% de huéspedes que llegan sin preguntar lo básico</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { stat: '86%', label: 'preguntas repetidas' },
                  { stat: '4,8★', label: 'valoración media' },
                  { stat: '-80%', label: 'mensajes fuera de hora' },
                  { stat: '10 min', label: 'setup inicial' },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-3" style={{ backgroundColor: '#f5f3f0' }}>
                    <p className="font-semibold text-[#111] text-xl leading-none">{m.stat}</p>
                    <p className="text-[11px] text-[#888] mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: copy (arini style) */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-5 font-medium">El impacto</p>
              <h2 className="leading-[1.08] tracking-tight mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>
                <span className="font-semibold text-[#111]">Resultados reales </span>
                <span className="font-light text-[#aaa]">en tus reservas.</span>
              </h2>
              <p className="text-[15px] text-[#666] leading-relaxed mb-8">
                Lo que quema no es el trabajo. Es la repetición. Dónde se entra. Dónde se aparca. Cuál es la clave. Qué hacer al salir.
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white"
                style={{ backgroundColor: '#111' }}>
                Ver demo
              </Link>

              {/* Featured quote — like arini's $56k quote */}
              <div className="mt-8 border-t border-black/[0.06] pt-8">
                <p className="text-[17px] font-medium text-[#111] leading-relaxed mb-5">
                  "Llevo 3 meses sin que nadie me pregunte por el acceso. Una guía. Un envío automático. Eso es lo importante."
                </p>
                <div className="flex items-center gap-3">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Carmen" width={40} height={40} className="rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold text-[#111]">Carmen R.</p>
                    <p className="text-xs text-[#aaa]">7 apartamentos · Barcelona</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT IN ACTION (adaptive section) ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-5 font-medium">La guía en acción</p>
              <h2 className="leading-[1.08] tracking-tight mb-6" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>
                <span className="font-semibold text-[#111]">Tú defines el contenido una vez. </span>
                <span className="font-light text-[#aaa]">La IA responde por ti.</span>
              </h2>
              <div className="space-y-4 text-[15px] text-[#666] leading-relaxed mb-8">
                <p>El huésped recibe el enlace con la confirmación. Sin app. Sin registro. Abre la guía en el móvil y ve entrada, WiFi, normas y parking.</p>
                <p>Si tiene alguna duda, el chatbot responde en su idioma usando la información que tú has configurado.</p>
                <p className="font-bold text-[#111] text-lg">Cuando activas eso, dejas de repetir lo mismo en cada reserva.</p>
              </div>
              <Link href="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all"
                style={{ backgroundColor: '#7c3aed' }}>
                Crear mi primera guía <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.1)' }}>
              <img src="/landing-mockup-2.png" alt="Guía de apartamento" className="w-full h-auto" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (arini style: 1 at a time, large) ── */}
      <section id="testimonials" className="py-20 px-6" style={{ backgroundColor: '#f5f3f0' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-5 font-medium">Anfitriones reales</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)' }}>
              <span className="font-semibold text-[#111]">Lo que dicen </span>
              <span className="font-light text-[#aaa]">quienes ya lo usan.</span>
            </motion.h2>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={tIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="bg-white rounded-[20px] p-10 sm:p-14" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex gap-1 mb-8">
                {Array.from({ length: TESTIMONIALS[tIdx].stars }).map((_,i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="font-medium text-[#111] leading-relaxed mb-10" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}>
                "{TESTIMONIALS[tIdx].quote}"
              </p>
              <div className="flex items-center gap-4">
                <img src={TESTIMONIALS[tIdx].avatar} alt={TESTIMONIALS[tIdx].name} width={52} height={52} className="rounded-full object-cover" style={{ boxShadow: '0 0 0 3px rgba(124,58,237,0.15)' }} />
                <div>
                  <p className="font-bold text-[#111] text-base">{TESTIMONIALS[tIdx].name}</p>
                  <p className="text-[#aaa] text-sm mt-0.5">{TESTIMONIALS[tIdx].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 mt-6">
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={() => setTIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === tIdx ? 'w-7 h-2 bg-violet-700' : 'w-2 h-2 bg-black/15'}`} />
            ))}
            <button onClick={() => setTIdx(p => (p+1) % TESTIMONIALS.length)} className="ml-auto text-[#aaa] hover:text-[#111] transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── NARRATIVE (arini "big statement") ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto space-y-6">
          {[
            { bold: 'Hay días en los que no trabajas de anfitrión.', light: ' Trabajas de copiar y pegar.' },
            { bold: 'El mismo WiFi. La misma entrada. Las mismas normas.', light: ' Cambia el nombre del huésped y repite.' },
          ].map((line, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="leading-tight tracking-tight" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)' }}>
              <span className="font-semibold text-[#111]">{line.bold}</span>
              <span className="font-light text-[#ccc]">{line.light}</span>
            </motion.p>
          ))}
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="leading-tight tracking-tight pt-6" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)' }}>
            <span className="font-light text-[#ccc]">Lo que quema no es el trabajo. </span>
            <span className="font-semibold text-[#111]">Es la repetición.</span>
          </motion.p>
        </div>
      </section>

      {/* ── FAQ (arini: border-top, no cards) ── */}
      <section id="faq" className="py-20 px-6" style={{ backgroundColor: '#f5f3f0' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.h2 variants={fadeUp} className="font-semibold text-[#111] leading-tight" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)' }}>
              Preguntas frecuentes
            </motion.h2>
          </motion.div>
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="border-t border-black/[0.08]">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-7 text-left">
                <span className={`text-[16px] font-semibold leading-snug transition-colors ${faqOpen === i ? 'text-violet-700' : 'text-[#111]'}`}>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#aaa] shrink-0 mt-0.5 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {faqOpen === i && (
                  <motion.div key="b" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <p className="text-[15px] text-[#666] leading-relaxed pb-7">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          <div className="border-t border-black/[0.08]" />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-36 px-6 overflow-hidden text-center" style={{ backgroundColor: '#0e0e0e' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#555] mb-6 font-medium">El próximo check-in viene igual</p>
          <h2 className="leading-[1.05] tracking-tight text-white mb-5" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.8rem)' }}>
            <span className="font-semibold">Mejor que te pille </span>
            <span className="font-light" style={{ color: '#aaa' }}>preparado.</span>
          </h2>
          <p className="text-[#555] text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            Empieza por entrada, WiFi y normas. Ese primer paso ya te quita repeticiones y evita más de una duda de última hora.
          </p>
          <Link href="/register" className="group inline-flex items-center gap-3 bg-white text-[#111] px-10 py-5 rounded-full font-semibold text-xl hover:bg-violet-50 transition-all"
            style={{ boxShadow: '0 0 50px rgba(124,58,237,0.2)' }}>
            Empieza gratis <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm" style={{ color: '#444' }}>Sin tarjeta · Sin app · Sin compromiso</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/[0.06] py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-5">
                <img src="/isotipo-gradient.svg" alt="Itineramio" width={24} height={14} className="object-contain" />
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
