'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, Check, Star, MessageCircle, Zap, Shield, Globe } from 'lucide-react'

// ─── DATA ───────────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: 'Antes enviaba la clave del WiFi más que cualquier otro mensaje. Ahora el huésped llega con la guía y ya sabe todo.',
    name: 'Carmen R.',
    role: 'Anfitriona · 7 apartamentos · Barcelona',
    stars: 5,
  },
  {
    quote: 'El chatbot responde en inglés, francés y alemán sin que yo toque nada. Mis valoraciones subieron medio punto en dos meses.',
    name: 'Marcos T.',
    role: 'Gestor de alquileres · 9 pisos · Madrid',
    stars: 5,
  },
  {
    quote: 'Con 8 pisos y solo yo gestionando, necesitaba algo que trabajara mientras duermo. Itineramio lo hace.',
    name: 'Laura S.',
    role: 'Superhost · 8 propiedades · Valencia',
    stars: 5,
  },
]

const features = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Guías en 10 minutos',
    body: 'Entrada, WiFi, normas, parking. Organizado por zonas. Sin copiar y pegar. Sin PDFs.',
    tag: 'Setup rápido',
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: 'Chatbot en su idioma',
    body: 'Detecta el idioma del huésped y responde usando la información de tu propio apartamento. 24/7.',
    tag: 'IA incluida',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Sin descarga ni registro',
    body: 'El huésped abre la guía en el navegador del móvil. Sin app. Sin fricción. Tasa de apertura altísima.',
    tag: 'Zero friction',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Se envía sola',
    body: 'Pega el enlace en tu mensaje automático de Airbnb o Booking. Cada reserva recibe la guía correcta.',
    tag: 'Automático',
  },
]

const metrics = [
  { value: '86%', label: 'de preguntas se repiten en cada reserva' },
  { value: '4,8★', label: 'exige Superhost. Una reseña baja tu posición' },
  { value: '10 min', label: 'para montar tu primera guía y estar listo' },
]

const faqs = [
  {
    q: '¿Para cuántas propiedades tiene sentido?',
    a: 'A partir de 4 o 5 ya notas el cambio. Si gestionas 6, 7 u 8 apartamentos, el ahorro de tiempo es inmediato: menos copiar y pegar, menos responder lo mismo, menos interrupciones fuera de hora.',
  },
  {
    q: '¿El huésped necesita descargar una app?',
    a: 'No. La guía se abre en el navegador del móvil. Sin descarga, sin registro. El huésped hace clic en el enlace y ya está dentro.',
  },
  {
    q: '¿Y si habla otro idioma?',
    a: 'El chatbot detecta el idioma y responde en el suyo. Disponible en español, inglés y francés. Tú configuras el contenido una sola vez.',
  },
  {
    q: '¿Cómo llega la guía al huésped?',
    a: 'Pegas el enlace en tu mensaje automático de Airbnb o Booking. Cada reserva recibe la guía correcta en el momento de la confirmación.',
  },
  {
    q: '¿Es difícil de configurar?',
    a: 'Empieza con entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Puedes añadir más zonas después, cuando quieras.',
  },
]

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Landing2() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Testimonial auto-rotate
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/[0.06]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={34} height={19} className="object-contain" />
            <span className="font-bold text-base tracking-tight text-white">Itineramio</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Producto', 'Cómo funciona', 'Precios', 'FAQ'].map(item => (
              <button key={item} className="text-sm text-white/50 hover:text-white transition-colors">{item}</button>
            ))}
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-[#0a0a0a] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-violet-100 transition-colors"
          >
            Empieza gratis
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20 overflow-hidden">
        {/* BG glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-violet-700/10 blur-[160px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-2 text-sm text-white/50 mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Para anfitriones con 6 o más propiedades en España
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[clamp(2.8rem,8vw,6.5rem)] font-black leading-[1.0] tracking-tight mb-6"
          >
            Los huéspedes<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              no leen.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[clamp(1.1rem,2.5vw,1.6rem)] text-white/40 font-medium mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Pero llegan preguntando lo mismo. Tú configuras una vez.<br className="hidden sm:block" />
            La guía hace el resto.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 bg-white text-[#0a0a0a] px-8 py-4 rounded-full font-bold text-lg hover:bg-violet-100 transition-all shadow-[0_0_60px_rgba(139,92,246,0.35)]"
            >
              Empieza gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/20 px-8 py-4 rounded-full font-semibold text-lg transition-all"
            >
              Ver demo en vivo
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-sm text-white/20"
          >
            Sin tarjeta · Sin app · 10 minutos para la primera guía
          </motion.p>
        </div>

        {/* Phone mockups */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 mt-20 flex items-end justify-center gap-4 sm:gap-6"
        >
          {/* Left phone */}
          <div className="relative w-44 sm:w-52 shrink-0 translate-y-8 opacity-70">
            <div className="relative bg-[#1c1c1c] rounded-[2.5rem] p-[8px] shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="absolute -left-[3px] top-20 w-[3px] h-7 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -left-[3px] top-32 w-[3px] h-10 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -right-[3px] top-28 w-[3px] h-14 bg-[#2a2a2a] rounded-r-sm" />
              <div className="relative rounded-[2rem] overflow-hidden bg-black">
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-20 border border-white/5" />
                <img src="/landing-mockup-1.png" alt="Propiedades" className="w-full h-auto" />
              </div>
            </div>
          </div>
          {/* Center phone */}
          <div className="relative w-52 sm:w-64 shrink-0 z-10">
            <div className="relative bg-[#1c1c1c] rounded-[2.8rem] p-[9px] shadow-[0_50px_120px_rgba(139,92,246,0.35),0_20px_60px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />
              <div className="relative rounded-[2.2rem] overflow-hidden bg-black">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 border border-white/5" />
                <img src="/landing-mockup-2.png" alt="Guía del apartamento" className="w-full h-auto" />
              </div>
            </div>
            {/* Floating label */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-xl whitespace-nowrap">
              Guía por zonas ✓
            </div>
          </div>
          {/* Right phone */}
          <div className="relative w-44 sm:w-52 shrink-0 translate-y-8 opacity-70">
            <div className="relative bg-[#1c1c1c] rounded-[2.5rem] p-[8px] shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="absolute -left-[3px] top-20 w-[3px] h-7 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -right-[3px] top-28 w-[3px] h-14 bg-[#2a2a2a] rounded-r-sm" />
              <div className="relative rounded-[2rem] overflow-hidden bg-black">
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-20 border border-white/5" />
                <img src="/landing-mockup-3.png" alt="Chatbot" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SOCIAL PROOF LOGOS ── */}
      <section className="py-16 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-white/25 text-sm uppercase tracking-widest mb-10">
            Los huéspedes te llegan desde
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {['Airbnb', 'Booking.com', 'Vrbo', 'Direct', 'Holidu'].map(name => (
              <span key={name} className="text-white/20 text-lg font-bold tracking-tight hover:text-white/40 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[#0a0a0a] p-10 sm:p-12 flex flex-col gap-3"
              >
                <span className="text-5xl sm:text-6xl font-black bg-gradient-to-br from-violet-400 to-purple-300 bg-clip-text text-transparent leading-none">
                  {m.value}
                </span>
                <p className="text-white/40 text-sm leading-relaxed">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-violet-400 text-sm uppercase tracking-widest mb-4">El producto</p>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight">
              Todo lo que necesita<br />
              <span className="text-white/30">un anfitrión serio.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 mb-5">
                  {f.icon}
                </div>
                <div className="text-xs font-bold text-violet-400/60 uppercase tracking-widest mb-3">{f.tag}</div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-violet-400 text-sm uppercase tracking-widest mb-4">Cómo funciona</p>
            <h2 className="text-4xl sm:text-5xl font-black">Tres pasos.<br />Diez minutos.</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
            {[
              { n: '01', title: 'Crea tu guía', body: 'Entrada, WiFi, normas, parking. Organizado por zonas. En 10 minutos tienes la primera guía lista.' },
              { n: '02', title: 'Configura el enlace', body: 'Pega el enlace en tu mensaje automático de Airbnb o Booking. Se envía solo en cada nueva reserva.' },
              { n: '03', title: 'El huésped llega ubicado', body: 'Sabe cómo entrar. Tiene el WiFi. Y si duda, el chatbot responde en su idioma usando tu información.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[#0a0a0a] p-10 sm:p-12 flex flex-col gap-5"
              >
                <span className="text-7xl font-black text-white/[0.04] leading-none select-none">{step.n}</span>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-white text-[#0a0a0a] px-8 py-4 rounded-full font-bold text-base hover:bg-violet-100 transition-all"
            >
              Empezar ahora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-violet-400 text-sm uppercase tracking-widest mb-4">Anfitriones reales</p>
            <h2 className="text-4xl sm:text-5xl font-black">Lo que dicen<br /><span className="text-white/30">quienes ya lo usan.</span></h2>
          </motion.div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border p-8 flex flex-col gap-6 transition-all ${i === activeTestimonial ? 'border-violet-500/40 bg-violet-950/20' : 'border-white/[0.06] bg-white/[0.02]'}`}
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-violet-400 fill-violet-400" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div>
                  <p className="text-white text-sm font-bold">{t.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all ${i === activeTestimonial ? 'w-6 h-2 bg-violet-400' : 'w-2 h-2 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ── */}
      <section className="py-24 px-4 bg-[#0e0e0e]">
        <div className="max-w-4xl mx-auto space-y-6">
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
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="pt-12"
          >
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white/20">
              Lo que quema no es el trabajo.{' '}
              <span className="text-white">Es la repetición.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            >
              <p className="text-violet-400 text-sm uppercase tracking-widest mb-5">Para quién es</p>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-8">
                Hecho para quien gestiona<br />
                <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                  6, 7 u 8 apartamentos.
                </span>
              </h2>
              <div className="space-y-4 text-white/50 text-base leading-relaxed">
                <p>Mi punto de ruptura no fue un huésped. Fue el sexto piso.</p>
                <p>Con 2 o 3 apartamentos tiras. Con 6, 7 u 8, ya no. Empiezas a vivir entre mensajes, accesos, dudas y reseñas.</p>
                <p className="text-white font-semibold text-xl pt-2">No necesitas otro chat.<br />Necesitas que el huésped llegue con lo básico ya claro.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-3"
            >
              {[
                { before: 'Envías el WiFi más que saludos', after: 'La guía lleva el WiFi incluido desde el primer día' },
                { before: '"No podemos entrar." Estás cenando', after: 'Las instrucciones de acceso ya están en la guía' },
                { before: 'Contestas en tres idiomas lo mismo', after: 'El chatbot responde en el idioma del huésped' },
                { before: 'Una reseña de 4★ por confusión', after: 'Menos dudas = mejores valoraciones' },
              ].map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="rounded-xl border border-red-500/10 bg-red-950/10 px-4 py-3 flex items-start gap-2.5">
                    <span className="text-red-400/60 text-xs mt-0.5">✕</span>
                    <p className="text-white/30 text-xs leading-relaxed">{row.before}</p>
                  </div>
                  <div className="rounded-xl border border-violet-500/20 bg-violet-950/10 px-4 py-3 flex items-start gap-2.5">
                    <Check className="w-3 h-3 text-violet-400 mt-0.5 shrink-0" />
                    <p className="text-white/70 text-xs leading-relaxed">{row.after}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-[#0e0e0e]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14"
          >
            <h2 className="text-4xl sm:text-5xl font-black">Lo que suelen preguntar</h2>
          </motion.div>

          <div className="divide-y divide-white/[0.06]">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-6 text-left group"
                >
                  <span className={`text-base font-semibold transition-colors ${openFaq === i ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-white/30 shrink-0 mt-0.5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-white/40 text-sm leading-relaxed pb-6">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-40 px-4 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-violet-950/20 to-[#0a0a0a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-700/15 blur-[180px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <h2 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black leading-[1.0] mb-6">
            Tu próximo huésped<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              ya tiene reserva.
            </span>
          </h2>
          <p className="text-xl text-white/35 mb-12 max-w-xl mx-auto leading-relaxed">
            Empieza por entrada, WiFi y normas.<br />
            Ese primer paso ya te quita repeticiones.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 bg-white text-[#0a0a0a] px-10 py-5 rounded-full font-black text-xl hover:bg-violet-100 transition-all shadow-[0_0_80px_rgba(139,92,246,0.45)]"
          >
            Empieza gratis
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-white/20">Sin tarjeta · Sin app · Sin compromiso</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.05] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} className="object-contain" />
                <span className="font-bold text-sm text-white">Itineramio</span>
              </Link>
              <p className="text-white/30 text-sm leading-relaxed">
                Guías digitales y chatbot IA para anfitriones con 6 o más propiedades en España.
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5">Producto</p>
              <ul className="space-y-3">
                {['Funcionalidades', 'Precios', 'Demo', 'Integraciones'].map(item => (
                  <li key={item}><Link href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5">Recursos</p>
              <ul className="space-y-3">
                {['Blog', 'Guía de inicio', 'FAQ', 'Contacto'].map(item => (
                  <li key={item}><Link href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5">Legal</p>
              <ul className="space-y-3">
                {['Privacidad', 'Términos', 'Cookies'].map(item => (
                  <li key={item}><Link href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">© {new Date().getFullYear()} Itineramio. Todos los derechos reservados.</p>
            <p className="text-white/20 text-xs">Hecho para anfitriones serios · España 🇪🇸</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
