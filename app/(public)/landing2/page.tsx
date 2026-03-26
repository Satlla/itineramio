'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Check, Star, MessageCircle, Zap, Shield, Globe, Menu, X } from 'lucide-react'

// ─── VARIANTS ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: '✦',
    title: 'Guías en 10 minutos',
    body: 'Entrada, WiFi, normas, parking. Organizado por zonas. Sin copiar y pegar. Sin PDFs que nadie abre.',
  },
  {
    icon: '◎',
    title: 'Chatbot en su idioma',
    body: 'Detecta el idioma del huésped y responde usando la información de tu propio apartamento. 24/7, sin ti.',
  },
  {
    icon: '◈',
    title: 'Sin descarga ni registro',
    body: 'El huésped abre la guía en el móvil. Sin app. Sin fricción. Funciona en cualquier dispositivo.',
  },
  {
    icon: '⬡',
    title: 'Se envía sola',
    body: 'Pega el enlace en tu mensaje automático de Airbnb o Booking. Cada reserva recibe la guía correcta.',
  },
  {
    icon: '◐',
    title: 'Multiidioma automático',
    body: 'Español, inglés, francés. El chatbot detecta y responde. Tú configuras una sola vez.',
  },
]

const testimonials = [
  {
    quote: 'Antes enviaba la clave del WiFi más que cualquier otro mensaje. Ahora el huésped llega con la guía y ya lo sabe todo.',
    name: 'Carmen R.',
    role: '7 apartamentos · Barcelona',
    stars: 5,
  },
  {
    quote: 'El chatbot responde en inglés, francés y alemán sin que yo toque nada. Mis valoraciones subieron medio punto en dos meses.',
    name: 'Marcos T.',
    role: '9 pisos · Madrid',
    stars: 5,
  },
  {
    quote: 'Con 8 pisos y solo yo gestionando, necesitaba algo que trabajara mientras duermo. Itineramio lo hace.',
    name: 'Laura S.',
    role: '8 propiedades · Valencia',
    stars: 5,
  },
]

const metrics = [
  { value: '86%', label: 'de preguntas de huéspedes se repiten en cada reserva' },
  { value: '4,8★', label: 'exige Superhost. Una reseña de confusión baja tu posición' },
  { value: '10 min', label: 'para montar tu primera guía y estar listo' },
]

const faqs = [
  { q: '¿Para cuántas propiedades tiene sentido?', a: 'A partir de 4 o 5 ya notas el cambio. Si gestionas 6, 7 u 8 apartamentos el ahorro de tiempo es inmediato: menos copiar y pegar, menos responder lo mismo, menos interrupciones fuera de hora.' },
  { q: '¿El huésped necesita descargar una app?', a: 'No. La guía se abre en el navegador del móvil. Sin descarga, sin registro. El huésped hace clic en el enlace y ya está dentro.' },
  { q: '¿Y si habla otro idioma?', a: 'El chatbot detecta el idioma y responde en el suyo. Disponible en español, inglés y francés. Tú configuras el contenido una sola vez.' },
  { q: '¿Cómo llega la guía al huésped?', a: 'Pegas el enlace en tu mensaje automático de Airbnb o Booking. Cada reserva recibe la guía correcta en el momento de la confirmación.' },
  { q: '¿Es difícil de configurar?', a: 'Empieza con entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Puedes añadir más zonas después.' },
]

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Landing2() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeT, setActiveT] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

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
    <div className="min-h-screen bg-white text-[#111111] overflow-x-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={32} height={18} className="object-contain" />
            <span className="font-bold text-[15px] tracking-tight text-[#111111]">Itineramio</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {['Producto', 'Cómo funciona', 'Precios', 'FAQ'].map(item => (
              <button key={item} className="text-sm text-[#555] hover:text-[#111] transition-colors">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-[#555] hover:text-[#111] transition-colors font-medium">Entrar</Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-[#111] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#333] transition-colors"
            >
              Empieza gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button className="md:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
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
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        {/* Animated wave background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-[50%] bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 opacity-70 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-violet-200/40 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100/50 blur-[80px]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm text-violet-700 font-medium mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Para anfitriones con 6 o más propiedades en España
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}
            className="text-[clamp(2.8rem,8vw,6rem)] font-black leading-[1.02] tracking-tight mb-6 text-[#111]"
          >
            Los huéspedes<br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              no leen.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.22 }}
            className="text-[clamp(1.1rem,2.5vw,1.5rem)] text-[#555] font-medium mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Pero llegan preguntando lo mismo.<br className="hidden sm:block" />
            Tú configuras una vez. La guía hace el resto.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 bg-[#111] text-white px-9 py-4 rounded-full font-bold text-lg hover:bg-violet-700 transition-all shadow-lg"
            >
              Empieza gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 border border-black/10 bg-white text-[#555] hover:text-[#111] hover:border-black/20 px-9 py-4 rounded-full font-semibold text-lg transition-all shadow-sm"
            >
              Ver demo
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="text-sm text-[#999]"
          >
            Sin tarjeta · Sin app · 10 minutos para la primera guía
          </motion.p>
        </motion.div>

        {/* Phone mockups */}
        <motion.div
          initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 mt-16 flex items-end justify-center gap-4 sm:gap-6"
        >
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ duration: 0.9, delay: 0.6 }}
            className="relative w-40 sm:w-48 shrink-0 translate-y-6"
          >
            <div className="relative bg-[#1a1a1a] rounded-[2.5rem] p-[8px] shadow-[0_30px_70px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <div className="absolute -left-[3px] top-20 w-[3px] h-7 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -left-[3px] top-32 w-[3px] h-10 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -right-[3px] top-28 w-[3px] h-14 bg-[#2a2a2a] rounded-r-sm" />
              <div className="relative rounded-[2rem] overflow-hidden bg-black">
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 bg-black rounded-full z-20" />
                <img src="/landing-mockup-1.png" alt="Propiedades" className="w-full h-auto" />
              </div>
            </div>
          </motion.div>

          {/* Center */}
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
            className="relative w-52 sm:w-64 shrink-0 z-10"
          >
            <div className="relative bg-[#1a1a1a] rounded-[2.8rem] p-[9px] shadow-[0_50px_100px_rgba(139,92,246,0.25),0_20px_50px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />
              <div className="relative rounded-[2.2rem] overflow-hidden bg-black">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-18 h-6 bg-black rounded-full z-20" />
                <img src="/landing-mockup-2.png" alt="Guía" className="w-full h-auto" />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap"
            >
              Guía por zonas ✓
            </motion.div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 3 }} transition={{ duration: 0.9, delay: 0.7 }}
            className="relative w-40 sm:w-48 shrink-0 translate-y-6"
          >
            <div className="relative bg-[#1a1a1a] rounded-[2.5rem] p-[8px] shadow-[0_30px_70px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <div className="absolute -left-[3px] top-20 w-[3px] h-7 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -right-[3px] top-28 w-[3px] h-14 bg-[#2a2a2a] rounded-r-sm" />
              <div className="relative rounded-[2rem] overflow-hidden bg-black">
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 bg-black rounded-full z-20" />
                <img src="/landing-mockup-3.png" alt="Chatbot" className="w-full h-auto" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── LOGOS CAROUSEL ── */}
      <section className="py-14 border-y border-black/[0.06] bg-white overflow-hidden">
        <p className="text-center text-[#999] text-xs uppercase tracking-widest mb-8">Los huéspedes llegan desde</p>
        <div className="flex gap-12 sm:gap-20 animate-[scroll_20s_linear_infinite] whitespace-nowrap px-8">
          {['Airbnb', 'Booking.com', 'Vrbo', 'Holidu', 'Wimdu', 'Airbnb', 'Booking.com', 'Vrbo', 'Holidu', 'Wimdu'].map((name, i) => (
            <span key={i} className="inline-block text-[#bbb] text-lg font-bold tracking-tight shrink-0">{name}</span>
          ))}
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.07]">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="px-10 py-10 flex flex-col gap-3"
            >
              <span className="text-5xl sm:text-6xl font-black bg-gradient-to-br from-violet-600 to-purple-500 bg-clip-text text-transparent leading-none">
                {m.value}
              </span>
              <p className="text-[#555] text-sm leading-relaxed">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 bg-[#F5F3F0]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-16">
            <motion.p variants={fadeUp} className="text-violet-600 text-sm uppercase tracking-widest font-semibold mb-4">El producto</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#111] leading-tight">
              Todo lo que necesita<br />un anfitrión serio.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow ${i === 0 ? 'lg:col-span-2' : ''}`}
              >
                <div className="text-2xl text-violet-600 font-black leading-none">{f.icon}</div>
                <h3 className="text-lg font-bold text-[#111]">{f.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-16 text-center">
            <motion.p variants={fadeUp} className="text-violet-600 text-sm uppercase tracking-widest font-semibold mb-4">Cómo funciona</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#111]">Tres pasos.<br />Diez minutos.</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {[
              { n: '01', title: 'Crea tu guía', body: 'Entrada, WiFi, normas, parking. Organizado por zonas. En 10 minutos tienes la primera guía lista.' },
              { n: '02', title: 'Configura el enlace', body: 'Pega el enlace en tu mensaje automático de Airbnb o Booking. Se envía solo en cada nueva reserva.' },
              { n: '03', title: 'El huésped llega ubicado', body: 'Sabe cómo entrar, tiene el WiFi, y si tiene alguna duda el chatbot responde en su idioma.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-[#F5F3F0] rounded-2xl p-10 flex flex-col gap-5"
              >
                <span className="text-6xl font-black text-black/[0.06] leading-none select-none">{step.n}</span>
                <h3 className="text-xl font-bold text-[#111]">{step.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed flex-1">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-violet-700 transition-all"
            >
              Empezar ahora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEM / NARRATIVE ── */}
      <section className="py-24 px-4 bg-[#111] text-white">
        <div className="max-w-4xl mx-auto space-y-7">
          {[
            { text: 'He enviado la clave del WiFi más veces de las que recuerdo.', muted: false },
            { text: 'El mismo WiFi. La misma entrada. Las mismas normas.', muted: true },
            { text: 'Cambia el nombre del huésped y repite.', muted: true },
          ].map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight ${line.muted ? 'text-white/20' : 'text-white'}`}
            >
              {line.text}
            </motion.p>
          ))}
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
            className="pt-10 text-3xl sm:text-4xl lg:text-5xl font-black text-white/20 leading-tight"
          >
            Lo que quema no es el trabajo.{' '}
            <span className="text-white">Es la repetición.</span>
          </motion.p>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#111] mb-16 text-center">
              Tu semana antes y después
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div variants={fadeUp} className="rounded-2xl bg-[#F5F3F0] p-10">
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-8">Antes</p>
                <ul className="space-y-5">
                  {[
                    'He enviado el WiFi más que saludos',
                    'Hay días que no trabajas de anfitrión. Trabajas de copiar y pegar',
                    '"No podemos entrar." Cuando estás cenando',
                    'Contestas lo mismo en tres idiomas',
                    'Una reseña de 4★ por una confusión evitable',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-red-400" />
                      </div>
                      <span className="text-sm text-[#777] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div variants={fadeUp} className="rounded-2xl bg-violet-50 border border-violet-100 p-10">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-8">Después</p>
                <ul className="space-y-5">
                  {[
                    'La guía sale sola cuando se confirma la reserva',
                    'Así llegan sabiendo cómo entrar, dónde aparcar y cuál es el WiFi',
                    'Menos copiar y pegar. El huésped ya sabe',
                    'Tú dejas de repetir lo mismo cada semana',
                    'La reseña lo nota',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-violet-600" />
                      </div>
                      <span className="text-sm text-[#333] leading-relaxed">{item}</span>
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
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#111]">
              Lo que dicen<br />quienes ya lo usan.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-8 flex flex-col gap-6 transition-all cursor-default ${i === activeT ? 'bg-white shadow-md ring-1 ring-violet-200' : 'bg-white/60 hover:bg-white'}`}
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-violet-500 fill-violet-500" />
                  ))}
                </div>
                <p className="text-[#333] text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div>
                  <p className="text-[#111] text-sm font-bold">{t.name}</p>
                  <p className="text-[#999] text-xs mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveT(i)}
                className={`rounded-full transition-all ${i === activeT ? 'w-6 h-2 bg-violet-500' : 'w-2 h-2 bg-black/15'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-violet-600 text-sm uppercase tracking-widest font-semibold mb-6">Para quién es</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-12 text-[#111]">
              Hecho para quien gestiona<br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                6, 7 u 8 apartamentos.
              </span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-5 text-lg max-w-3xl leading-relaxed text-[#555]">
              <p>Mi punto de ruptura no fue un huésped. Fue el sexto piso.</p>
              <p>Con 2 o 3 apartamentos tiras. Con 6, 7 u 8, ya no. Empiezas a vivir entre mensajes, accesos, dudas y reseñas.</p>
              <p>Si tu móvil manda más que tú, ya sabes de qué va esto.</p>
              <p className="text-[#111] font-bold text-2xl pt-4">No necesitas otro chat.<br />Necesitas que el huésped llegue con lo básico ya claro.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-[#F5F3F0]">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#111]">Lo que suelen preguntar</motion.h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left"
                >
                  <span className={`text-[15px] font-semibold transition-colors ${openFaq === i ? 'text-violet-700' : 'text-[#111]'}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#999] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-[#555] leading-relaxed px-7 pb-6">{faq.a}</p>
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-800/20 blur-[150px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <h2 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black leading-[1.0] mb-6 text-white">
            Tu próximo huésped<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              ya tiene reserva.
            </span>
          </h2>
          <p className="text-xl text-white/40 mb-12 max-w-xl mx-auto leading-relaxed">
            Empieza por entrada, WiFi y normas.<br />Ese primer paso ya te quita repeticiones.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 bg-white text-[#111] px-10 py-5 rounded-full font-black text-xl hover:bg-violet-100 transition-all shadow-[0_0_80px_rgba(139,92,246,0.3)]"
          >
            Empieza gratis
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-white/25">Sin tarjeta · Sin app · Sin compromiso</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/[0.06] py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} className="object-contain" />
                <span className="font-bold text-sm text-[#111]">Itineramio</span>
              </Link>
              <p className="text-[#999] text-sm leading-relaxed">
                Guías digitales y chatbot IA para anfitriones con 6 o más propiedades en España.
              </p>
            </div>
            {[
              { title: 'Producto', links: ['Funcionalidades', 'Precios', 'Demo', 'Integraciones'] },
              { title: 'Recursos', links: ['Blog', 'Guía de inicio', 'FAQ', 'Contacto'] },
              { title: 'Legal', links: ['Privacidad', 'Términos', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[#111] text-xs font-bold uppercase tracking-widest mb-5">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(item => (
                    <li key={item}><Link href="#" className="text-[#999] text-sm hover:text-[#111] transition-colors">{item}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-black/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#bbb] text-xs">© {new Date().getFullYear()} Itineramio. Todos los derechos reservados.</p>
            <p className="text-[#bbb] text-xs">Hecho para anfitriones serios · España 🇪🇸</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
