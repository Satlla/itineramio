'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { Navbar } from '../../../src/components/layout/Navbar'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/60 via-black to-black" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full px-5 py-2 text-sm text-white/60 mb-10"
          >
            Hecho para anfitriones con 6–10 propiedades en España
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8"
          >
            Los huéspedes<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              no leen.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl sm:text-2xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Pero llegan preguntando lo mismo. Crea una guía una vez, configura el enlace en tu mensaje automático y deja de repetirte.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-violet-100 transition-all text-lg shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]"
            >
              Empieza gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-white/40">Sin tarjeta. 10 minutos.</p>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ─── PROBLEM — BIG STATEMENT ─── */}
      <section className="py-32 lg:py-48 px-4 bg-black">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-6"
          >
            {[
              { text: 'Llevas semanas enviando la misma clave de WiFi.', muted: false },
              { text: 'El mismo mensaje de acceso. Las mismas normas.', muted: true },
              { text: 'Cambia el nombre del huésped y repite.', muted: true },
            ].map((line, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${line.muted ? 'text-white/30' : 'text-white'}`}
              >
                {line.text}
              </motion.p>
            ))}
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="mt-24 space-y-6"
          >
            {[
              { text: '"No podemos entrar."', muted: false },
              { text: 'A las 22:00. Mientras cenas.', muted: true },
              { text: 'Cuando estás atendiendo otro check-in.', muted: true },
            ].map((line, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${line.muted ? 'text-white/30' : 'text-white'}`}
              >
                {line.text}
              </motion.p>
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-24 text-3xl sm:text-4xl lg:text-5xl font-bold text-white/30"
          >
            Y no es el trabajo lo que quema.{' '}
            <span className="text-white">Es la repetición.</span>
          </motion.p>
        </div>
      </section>

      {/* ─── THE SHIFT ─── */}
      <section className="py-32 lg:py-48 px-4 bg-gradient-to-b from-black via-violet-950/20 to-black">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-violet-400 mb-8">
              La diferencia
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-10">
              ¿Y si el huésped llegara{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                sabiendo cómo entrar?
              </span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-6 text-xl text-white/60 max-w-3xl leading-relaxed">
              <p>No hablamos de otro mensaje largo. Ni de un PDF que nadie abre.</p>
              <p>
                Una guía corta, clara, organizada por zonas — entrada, WiFi, normas, parking — con un enlace que el huésped recibe cuando se confirma la reserva.
              </p>
              <p>
                Y si tiene alguna duda, un chatbot le responde en su idioma usando la información de tu propio apartamento.
              </p>
              <p className="text-white font-semibold text-2xl">Tú configuras una vez. La guía hace el resto.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-24 px-4 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-black p-12 flex flex-col gap-4"
              >
                <span className="text-6xl lg:text-7xl font-bold bg-gradient-to-br from-violet-400 to-purple-300 bg-clip-text text-transparent">
                  {s.stat}
                </span>
                <p className="text-white/50 text-base leading-relaxed">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-32 lg:py-48 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-violet-400 mb-6">
              Cómo funciona
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-bold mb-20">
              Tres pasos.<br />Diez minutos.
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-black p-12 flex flex-col gap-6 group hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-7xl font-black text-white/5 group-hover:text-white/10 transition-colors leading-none">
                    {step.n}
                  </span>
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  <p className="text-white/50 leading-relaxed">{step.body}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-14 flex justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-violet-100 transition-all text-lg shadow-[0_0_40px_rgba(139,92,246,0.3)]"
              >
                Empieza gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="py-32 lg:py-48 px-4 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-bold mb-20 text-center">
              Tu semana<br />antes y después
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeUp} className="rounded-3xl bg-white/[0.03] border border-white/5 p-10">
                <p className="text-xs uppercase tracking-widest text-red-400 mb-8">Antes</p>
                <ul className="space-y-5">
                  {before.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-white/40">
                      <div className="w-5 h-5 rounded-full border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-red-400" />
                      </div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-3xl bg-violet-950/30 border border-violet-500/20 p-10">
                <p className="text-xs uppercase tracking-widest text-violet-400 mb-8">Después</p>
                <ul className="space-y-5">
                  {after.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-white/80">
                      <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-violet-400" />
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
      <section className="py-32 lg:py-48 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-violet-400 mb-8">
              Para quién es
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-12">
              Hecho para quien gestiona<br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                6, 7 u 8 pisos solo.
              </span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-5 text-xl text-white/50 max-w-3xl leading-relaxed">
              <p>Contestas cada mensaje tú. Coordinas cada check-in tú. Te juegas la nota en cada reseña tú.</p>
              <p>No tienes equipo. No tienes sistema. Tienes el móvil y las ganas de que funcione.</p>
              <p className="text-white font-semibold text-2xl pt-4">
                No necesitas un software más.<br />Necesitas dejar de repetirte.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-32 lg:py-48 px-4 bg-black">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-16">
              Lo que suelen preguntar
            </motion.h2>
            <div className="divide-y divide-white/5">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} className="py-8">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                  <p className="text-white/50 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── LOSS FRAMING ─── */}
      <section className="py-32 lg:py-48 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-6"
          >
            {[
              { text: 'El próximo huésped ya tiene reserva.', muted: false },
              { text: 'Va a preguntar el WiFi. Va a dudar con la entrada.', muted: true },
              { text: 'Si llega confundido, la reseña lo refleja.', muted: true },
              { text: 'Y una reseña de 4 estrellas no baja sola.', muted: false },
            ].map((line, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${line.muted ? 'text-white/25' : 'text-white'}`}
              >
                {line.text}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-40 lg:py-56 px-4 bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/30 to-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/15 rounded-full blur-[160px] pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.h2 variants={fadeUp} className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            Tu próximo huésped<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              ya tiene reserva.
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-xl text-white/50 mb-12 max-w-xl mx-auto">
            Que llegue informado. Empieza con lo básico. El resto se añade después.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-violet-100 transition-all text-xl shadow-[0_0_80px_rgba(139,92,246,0.5)] hover:shadow-[0_0_100px_rgba(139,92,246,0.7)]"
            >
              Empieza gratis
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-6 text-sm text-white/30">Sin tarjeta · Sin app · Sin compromiso</p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
