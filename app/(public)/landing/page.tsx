'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const stats = [
  { stat: '86%', label: 'de las preguntas de huéspedes se repiten en cada reserva' },
  { stat: '4,8★', label: 'exige Superhost. Una reseña de confusión baja tu posición' },
  { stat: '93,9%', label: 'de usuarios móvil en España usa WhatsApp. Te van a escribir' },
]

const before = [
  'Envías el WiFi a cada huésped manualmente',
  'Copias y pegas acceso y normas en cada reserva',
  '"No podemos entrar" a las 22:00',
  'Contestas lo mismo en tres idiomas',
  'La reseña de 4 estrellas llega sin aviso',
]

const after = [
  'Configuras el enlace una vez en tu mensaje automático',
  'El huésped llega sabiendo cómo entrar y conectarse',
  'El chatbot responde en su idioma sin que tú hagas nada',
  'Tú no repites nada',
  'El check-in empieza bien y la reseña lo nota',
]

const steps = [
  {
    n: '01',
    title: 'Crea tu guía',
    body: 'Entrada, WiFi, normas, parking. Organizado por zonas. En 10 minutos.',
  },
  {
    n: '02',
    title: 'Configura el enlace',
    body: 'Pega el enlace en tu mensaje automático de Airbnb o Booking. Se envía solo en cada reserva.',
  },
  {
    n: '03',
    title: 'El huésped llega ubicado',
    body: 'Sabe cómo entrar. Tiene el WiFi. Y si duda, el chatbot le responde en su idioma.',
  },
]

const faqs = [
  {
    q: '¿Y si el huésped no abre la guía?',
    a: 'La recibe con la confirmación de reserva, antes de llegar. La tasa de apertura es mucho mayor que un mensaje suelto. Y dentro del piso, el QR refuerza.',
  },
  {
    q: '¿El huésped necesita descargar una app?',
    a: 'No. Se abre en el navegador del móvil. Sin descarga, sin registro.',
  },
  {
    q: '¿Y si habla otro idioma?',
    a: 'El chatbot detecta el idioma y responde en el suyo. Disponible en español, inglés y francés.',
  },
  {
    q: '¿Es complicado configurarlo?',
    a: 'Empieza con entrada, WiFi y normas. En 10 minutos tienes la primera guía lista.',
  },
]

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60])

  useEffect(() => {
    let lenis: any
    let rafId: number
    const initLenis = async () => {
      const { default: Lenis } = await import('lenis')
      lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
      const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
      rafId = requestAnimationFrame(raf)
    }
    initLenis()
    return () => { cancelAnimationFrame(rafId); lenis?.destroy() }
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="Itineramio" width={20} height={20} className="brightness-0 invert" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <span className="font-bold text-gray-900 text-lg">itineramio</span>
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-full text-sm hover:bg-gray-700 transition-all"
        >
          Empieza gratis <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50 via-white to-white pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-gray-200 bg-white rounded-full px-5 py-2 text-sm text-gray-500 mb-10 shadow-sm">
            Para anfitriones con 6–10 propiedades en España
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-10 text-gray-900">
            Los huéspedes<br />
            <span className="text-violet-600">no leen.</span>
          </h1>

          <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-500 mb-14 leading-snug">
            Pero llegan preguntando lo mismo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-700 transition-all text-lg"
            >
              Empieza gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-gray-500">Sin tarjeta. 10 minutos.</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ─── PRODUCT SHOWCASE ─── */}
      <section className="py-32 lg:py-48 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-violet-600 mb-4">
              El producto
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-bold text-gray-900">
              Lo que ven tus huéspedes.<br />
              <span className="text-gray-400">Lo que dejas de hacer tú.</span>
            </motion.h2>
          </motion.div>

          {/* Phone mockups */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-8">

            {/* Phone 1 — Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-60 lg:w-64 shrink-0"
            >
              <div className="relative bg-[#1a1a1a] rounded-[3.2rem] shadow-[0_40px_80px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(255,255,255,0.08)] p-[10px]">
                <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -left-[3px] top-52 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -right-[3px] top-36 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />
                <div className="relative rounded-[2.5rem] overflow-hidden bg-black">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 border border-white/5" />
                  <img src="/landing-mockup-1.png" alt="Dashboard de propiedades" className="w-full h-auto" />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-3 -right-3 bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
              >
                Tus propiedades
              </motion.div>
            </motion.div>

            {/* Phone 2 — Manual (center) */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-68 lg:w-72 shrink-0 z-10"
            >
              <div className="relative bg-[#1a1a1a] rounded-[3.2rem] shadow-[0_60px_120px_rgba(109,40,217,0.15),0_30px_60px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(255,255,255,0.1)] p-[10px]">
                <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -left-[3px] top-52 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -right-[3px] top-36 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />
                <div className="relative rounded-[2.5rem] overflow-hidden bg-black">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 border border-white/5" />
                  <img src="/landing-mockup-2.png" alt="Manual del apartamento" className="w-full h-auto" />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
              >
                Manual por zonas
              </motion.div>
            </motion.div>

            {/* Phone 3 — Chatbot */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-60 lg:w-64 shrink-0"
            >
              <div className="relative bg-[#1a1a1a] rounded-[3.2rem] shadow-[0_40px_80px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(255,255,255,0.08)] p-[10px]">
                <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -left-[3px] top-52 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
                <div className="absolute -right-[3px] top-36 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />
                <div className="relative rounded-[2.5rem] overflow-hidden bg-black">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 border border-white/5" />
                  <img src="/landing-mockup-3.png" alt="Chatbot respondiendo" className="w-full h-auto" />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                className="absolute -bottom-3 -left-3 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
              >
                Chatbot en su idioma
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── PROBLEM — BIG STATEMENT ─── */}
      <section className="py-32 lg:py-48 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="space-y-6">
            {[
              { text: 'Llevas semanas enviando la misma clave de WiFi.', muted: false },
              { text: 'El mismo mensaje de acceso. Las mismas normas.', muted: true },
              { text: 'Cambia el nombre del huésped y repite.', muted: true },
            ].map((line, i) => (
              <motion.p key={i} variants={fadeUp} className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${line.muted ? 'text-gray-400' : 'text-gray-900'}`}>
                {line.text}
              </motion.p>
            ))}
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="mt-24 space-y-6">
            {[
              { text: '"No podemos entrar."', muted: false },
              { text: 'A las 22:00. Mientras cenas.', muted: true },
              { text: 'Cuando estás atendiendo otro check-in.', muted: true },
            ].map((line, i) => (
              <motion.p key={i} variants={fadeUp} className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${line.muted ? 'text-gray-400' : 'text-gray-900'}`}>
                {line.text}
              </motion.p>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-24 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-400">
            No es el trabajo lo que quema.{' '}
            <span className="text-gray-900">Es la repetición.</span>
          </motion.p>
        </div>
      </section>

      {/* ─── THE SHIFT ─── */}
      <section className="py-32 lg:py-48 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }}>
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-violet-600 mb-8">La diferencia</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-10 text-gray-900">
              ¿Y si el huésped llegara{' '}
              <span className="text-violet-600">sabiendo cómo entrar?</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-5 text-xl text-gray-500 max-w-3xl leading-relaxed">
              <p>No hablamos de otro mensaje largo. Ni de un PDF que nadie abre.</p>
              <p>Una guía corta, clara, organizada por zonas — entrada, WiFi, normas, parking — con un enlace que el huésped recibe cuando se confirma la reserva.</p>
              <p>Y si tiene alguna duda, un chatbot le responde en su idioma usando la información de tu propio apartamento.</p>
              <p className="text-gray-900 font-semibold text-2xl">Tú configuras una vez. La guía hace el resto.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-24 px-4 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {stats.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="p-12 flex flex-col gap-4">
                <span className="text-6xl lg:text-7xl font-bold text-violet-600">{s.stat}</span>
                <p className="text-gray-500 text-base leading-relaxed">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-32 lg:py-48 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-violet-600 mb-6">Cómo funciona</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-bold mb-20 text-gray-900">Tres pasos.<br />Diez minutos.</motion.h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {steps.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white p-12 flex flex-col gap-6">
                  <span className="text-7xl font-black text-gray-100 leading-none">{step.n}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.body}</p>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp} className="mt-14 flex justify-center">
              <Link href="/register" className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-700 transition-all text-lg">
                Empieza gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="py-32 lg:py-48 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-bold mb-20 text-center text-gray-900">Tu semana<br />antes y después</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeUp} className="rounded-3xl bg-gray-50 border border-gray-200 p-10">
                <p className="text-xs uppercase tracking-widest text-red-500 mb-8">Antes</p>
                <ul className="space-y-5">
                  {before.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-gray-500">
                      <div className="w-5 h-5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-red-500" />
                      </div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div variants={fadeUp} className="rounded-3xl bg-violet-50 border border-violet-200 p-10">
                <p className="text-xs uppercase tracking-widest text-violet-600 mb-8">Después</p>
                <ul className="space-y-5">
                  {after.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-violet-600" />
                      </div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ICP ─── */}
      <section className="py-32 lg:py-48 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-violet-600 mb-8">Para quién es</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-12 text-gray-900">
              Hecho para quien gestiona<br />
              <span className="text-violet-600">6, 7 u 8 pisos solo.</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-5 text-xl text-gray-500 max-w-3xl leading-relaxed">
              <p>Contestas cada mensaje tú. Coordinas cada check-in tú. Te juegas la nota en cada reseña tú.</p>
              <p>No tienes equipo. No tienes sistema. Tienes el móvil y las ganas de que funcione.</p>
              <p className="text-gray-900 font-semibold text-2xl pt-4">No necesitas un software más.<br />Necesitas dejar de repetirte.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-32 lg:py-48 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-16 text-gray-900">Lo que suelen preguntar</motion.h2>
            <div className="divide-y divide-gray-100">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} className="py-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.q}</h3>
                  <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── LOSS FRAMING ─── */}
      <section className="py-32 lg:py-48 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="space-y-6">
            {[
              { text: 'El próximo huésped ya tiene reserva.', muted: false },
              { text: 'Va a preguntar el WiFi. Va a dudar con la entrada.', muted: true },
              { text: 'Si llega confundido, la reseña lo refleja.', muted: true },
              { text: 'Y una reseña de 4 estrellas no baja sola.', muted: false },
            ].map((line, i) => (
              <motion.p key={i} variants={fadeUp} className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${line.muted ? 'text-gray-400' : 'text-gray-900'}`}>
                {line.text}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-40 lg:py-56 px-4 bg-violet-600 overflow-hidden flex items-center justify-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-8 text-white">
            Tu próximo huésped<br />ya tiene reserva.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-xl text-violet-100 mb-12 max-w-xl mx-auto">
            Que llegue informado. Empieza con lo básico. El resto se añade después.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-violet-700 font-bold rounded-full hover:bg-violet-50 transition-all text-xl">
              Empieza gratis
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-6 text-sm text-violet-200">Sin tarjeta · Sin app · Sin compromiso</p>
          </motion.div>
        </motion.div>
      </section>

    </div>
  )
}
