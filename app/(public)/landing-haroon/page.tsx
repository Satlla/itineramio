'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, ChevronDown, Check, X, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Manrope } from 'next/font/google'

const manrope = Manrope({ subsets: ['latin'], weight: ['400','600','700','800'], display: 'swap', variable: '--font-manrope' })

// ─── PHONE MOCKUP ────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[220px]" style={{ filter: 'drop-shadow(0 32px 48px rgba(0,0,0,0.18))' }}>
      <div className="bg-[#111] rounded-[36px] p-2 border border-white/10">
        <div className="bg-white rounded-[28px] overflow-hidden">
          {/* Status bar */}
          <div className="bg-[#7c3aed] px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-[10px] font-semibold opacity-80">9:41</span>
              <div className="flex gap-1">
                {[3,2,3].map((h,i) => <div key={i} className={`w-1 bg-white/70 rounded-full`} style={{ height: h * 2 + 'px' }}/>)}
              </div>
            </div>
            <p className="text-white text-[11px] font-semibold tracking-wide opacity-90">MI APARTAMENTO</p>
            <p className="text-white/60 text-[9px]">Guía del huésped</p>
          </div>
          {/* Zones */}
          <div className="p-3 space-y-1.5">
            {[
              { icon: '🔑', label: 'Entrada', active: true },
              { icon: '📶', label: 'WiFi', active: false },
              { icon: '🚗', label: 'Parking', active: false },
              { icon: '🍳', label: 'Cocina', active: false },
              { icon: '📋', label: 'Normas', active: false },
            ].map((z, i) => (
              <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${z.active ? 'bg-[#7c3aed]/10 border border-[#7c3aed]/20' : 'bg-[#f5f3f0]'}`}>
                <span className="text-sm">{z.icon}</span>
                <span className={`text-[11px] font-medium ${z.active ? 'text-[#7c3aed]' : 'text-[#555]'}`}>{z.label}</span>
              </div>
            ))}
            <div className="mt-2 bg-[#7c3aed] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-[8px]">AI</span>
                </div>
                <span className="text-white text-[10px] font-semibold">AlexAI</span>
                <span className="ml-auto text-[8px] text-green-300">● online</span>
              </div>
              <p className="text-white/80 text-[9px] leading-relaxed">Hola! El código de la caja es 4521 🔑</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function LandingHaroon() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  return (
    <div className={`${manrope.variable} min-h-screen bg-white text-[#111] overflow-x-hidden`}
      style={{ fontFamily: 'var(--font-manrope)', WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={26} height={15} className="object-contain"/>
            <span className="font-bold text-[15px]">Itineramio</span>
          </Link>
          <Link href="/register"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: '#7c3aed' }}>
            Start free trial
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="font-bold text-[#111] leading-[1.08] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>
                Los huéspedes no leen. Pero llegan preguntando{' '}
                <span style={{ color: '#7c3aed' }}>lo mismo.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-[#555] text-lg leading-relaxed mb-8">
                Crea una guía una vez. Se envía sola cuando entra la reserva. El huésped llega sabiendo cómo entrar, dónde aparcar y cuál es el WiFi. Tú dejas de repetir.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white text-base"
                  style={{ backgroundColor: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
                  Start free trial <ArrowRight className="w-4 h-4"/>
                </Link>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                className="mt-3 text-sm text-[#aaa]">No necesitas tarjeta. En 10 minutos tienes la primera guía.</motion.p>
            </div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="flex justify-center">
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ESTO YA TE SUENA ── */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-semibold mb-4">El problema</p>
              <h2 className="font-bold text-[#111] leading-tight mb-8" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                Esto ya te suena.
              </h2>
              <div className="space-y-3">
                {[
                  'Copias el mismo mensaje de entrada a cada huésped',
                  'Te preguntan el WiFi aunque lo mandaste antes',
                  'Recibes el "no podemos entrar" a las 22:00',
                  'Un PDF que nadie abre en el móvil',
                  'Reseña de 4 estrellas por una confusión evitable',
                  'En 6 pisos, lo manual ya no funciona',
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500"/>
                    </div>
                    <span className="text-[15px] text-[#444] leading-snug">{item}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-2xl border-l-4 border-[#7c3aed] bg-violet-50">
                <p className="text-[14px] text-[#7c3aed] font-semibold">No es el trabajo en sí. Es la repetición.</p>
              </motion.div>
            </div>
            <div className="hidden lg:flex justify-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 PAIN COLUMNS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔁',
                title: 'Preguntas siempre repetidas',
                body: 'Las mismas dudas en cada reserva. WiFi, acceso, normas, parking. La diferencia está en si las contestas tú una a una o si llegan resueltas antes del check-in.',
              },
              {
                icon: '📩',
                title: 'Mensajes largos que no se leen',
                body: 'Mandas un mensaje con todo. El huésped lo ve entre veinte notificaciones y no lo lee. Llega igual de perdido. El problema no es el canal, es el formato.',
              },
              {
                icon: '⭐',
                title: 'El check-in afecta las reseñas',
                body: 'Un check-in que empieza con confusión rara vez termina en 5 estrellas. No hace falta que salga mal. Basta con que no salga del todo bien.',
              },
            ].map((col, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[#fafafa] rounded-[20px] p-8 border border-black/[0.06]">
                <div className="text-3xl mb-4">{col.icon}</div>
                <h3 className="font-bold text-[#111] text-[17px] mb-3 leading-snug">{col.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{col.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRES PASOS ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#7c3aed' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-violet-200 text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Cómo funciona</p>
          <h2 className="font-bold text-white leading-tight mb-12" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Tres pasos. Diez minutos.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { n: '01', title: 'Crea tu guía', body: 'No tienes que montarlo todo. Empieza por lo que más tensión genera: la entrada. Añádela primero y deja lo demás para después.' },
              { n: '02', title: 'Se envía sola', body: 'Cuando se confirma la reserva, el huésped lo recibe automáticamente. Sin que tú hagas nada. Así llegáis los dos mucho mejor al check-in.' },
              { n: '03', title: 'El huésped llega ubicado', body: 'Ya llega más ubicado. Menos preguntas. Menos caos. Menos mensajes a las 22:00. Tu nota lo nota.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-[20px] p-8">
                <span className="text-[4rem] font-bold text-white/10 leading-none block mb-4">{s.n}</span>
                <h3 className="font-bold text-white text-[17px] mb-3">{s.title}</h3>
                <p className="text-violet-200 text-[14px] leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-10">
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-white text-[#7c3aed] px-8 py-4 rounded-full font-bold text-base"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              Empieza gratis <ArrowRight className="w-4 h-4"/>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── LO QUE CAMBIA DE VERDAD ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-semibold mb-4">El cambio real</p>
              <h2 className="font-bold text-[#111] leading-tight mb-8" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                Lo que cambia de verdad.
              </h2>
              <div className="space-y-3">
                {[
                  'El huésped llega más informado',
                  'Menos mensajes de WiFi a las 23:00',
                  'Menos reseñas de 4 estrellas por confusión',
                  'Más cierras en el móvil encima',
                  'Menos llamadas de "no podemos entrar"',
                  'Más huéspedes que se resuelven solos',
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600"/>
                    </div>
                    <span className="text-[15px] text-[#333] leading-snug font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="bg-[#fafafa] rounded-[24px] p-8 border border-black/[0.06]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-semibold mb-6">Tu semana antes y después</p>
              <div className="space-y-3">
                {[
                  { before: 'WiFi manual a cada huésped', after: 'La guía se envía automáticamente' },
                  { before: 'El huésped llega sin saber nada', after: 'El huésped llega ya informado' },
                  { before: 'Mensajes nocturnos de acceso', after: 'AlexAI responde en su idioma' },
                  { before: 'Mismas preguntas cada semana', after: 'Menos interrupciones, mejor nota' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
                      <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5"/>
                      <span className="text-[12px] text-[#666] leading-snug">{row.before}</span>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5"/>
                      <span className="text-[12px] text-[#333] leading-snug font-medium">{row.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LO QUE YA HAS PROBADO ── */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-semibold mb-4">Alternativas</p>
          <h2 className="font-bold text-[#111] leading-tight mb-10" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Lo que ya has probado y por qué no bastó.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Copiar y pegar en WhatsApp o Airbnb',
                body: 'El huésped recibe un mensaje largo entre otros veinte. No lo lee. Tú acabas repitiéndolo igual. El problema no es el canal. Es que un mensaje largo compite con todo lo demás en su bandeja.',
              },
              {
                title: 'Un PDF con las instrucciones',
                body: 'Nadie abre un PDF en el móvil. Y si lo abren, no encuentran lo que buscan porque está todo junto. Sin zonas. Sin estructura. Sin chatbot que resuelva dudas.',
              },
              {
                title: 'La guía integrada de Airbnb',
                body: 'Funciona para un apartamento. No para ocho. No se traduce sola. No tiene chatbot. Y no cubre Booking.com ni Vrbo.',
              },
              {
                title: 'No hacer nada y "ya va bien"',
                body: 'Va bien hasta que no va. Un check-in mal, una reseña de 4 estrellas, y la posición baja. A partir de 6 apartamentos, "ya va bien" es una apuesta que se paga con la nota.',
              },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-[20px] p-7 border border-black/[0.06]">
                <h3 className="font-bold text-[#111] text-[15px] mb-3">{item.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ICP ── */}
      <section className="py-20 px-6 bg-[#111]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#555] font-semibold mb-4">Para quién es</p>
          <h2 className="font-bold text-white leading-tight mb-8" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Hecho para quien gestiona{' '}
            <span style={{ color: '#7c3aed' }}>6, 7 u 8 pisos solo.</span>
          </h2>
          <div className="space-y-4 mb-10">
            {[
              'Gestionas varios apartamentos. Contestas cada mensaje tú. Tu juego es no perder ninguno por mala gestión.',
              'No tienes equipo. No tienes sistema. Tienes el móvil y las ganas del momento. Para el anfitrión que está al punto donde la guía manual ya no te aguanta y necesita que lo básico salga solo.',
              'No necesitas más software. Necesitas dejar de repetirte.',
            ].map((text, i) => (
              <motion.p key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-[16px] text-[#999] leading-relaxed">{text}</motion.p>
            ))}
          </div>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-[#7c3aed] text-white px-8 py-4 rounded-full font-bold text-base"
            style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
            Empieza gratis <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-semibold mb-4">Lo que suelen preguntar</p>
          <h2 className="font-bold text-[#111] leading-tight mb-10" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Preguntas frecuentes.
          </h2>
          {[
            { q: '¿Es otro sistema que tengo que aprender?', a: 'Empieza con tres secciones: entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Luego vas añadiendo si quieres.' },
            { q: '¿Y si el huésped habla otro idioma?', a: 'La guía se traduce automáticamente. AlexAI detecta el idioma del huésped y responde en el suyo. Español, inglés, francés.' },
            { q: '¿El huésped necesita descargar una app?', a: 'No. Se abre en el navegador del móvil. Sin descarga. Sin registro. El huésped solo necesita el enlace o escanear el QR.' },
            { q: '¿Y si el huésped no abre la guía?', a: 'La guía se envía antes de llegar. La tasa de apertura es mucho mayor cuando la reciben con la confirmación de reserva. Y dentro del apartamento, el QR está disponible como refuerzo.' },
            { q: '¿Funciona con Booking.com además de Airbnb?', a: 'Sí. La guía es una URL que puedes mandar por cualquier canal: Airbnb, Booking, WhatsApp, email. No depende de la plataforma.' },
          ].map((faq, i) => (
            <div key={i} className="border-t border-black/[0.08]">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left">
                <span className={`text-[16px] font-semibold leading-snug transition-colors ${faqOpen === i ? 'text-[#7c3aed]' : 'text-[#111]'}`}>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#aaa] shrink-0 mt-0.5 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`}/>
              </button>
              <AnimatePresence initial={false}>
                {faqOpen === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <p className="text-[15px] text-[#666] leading-relaxed pb-6">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <div className="border-t border-black/[0.08]"/>
        </div>
      </section>

      {/* ── COSTE DE NO HACER NADA ── */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-semibold mb-4">El coste de no hacer nada</p>
          <h2 className="font-bold text-[#111] leading-tight mb-10" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            El coste de no hacer nada.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { stat: '22:00', label: 'La hora a la que suele llegar el "no podemos entrar"', sub: 'Cuando estás cenando, conduciendo o ya en cama.' },
              { stat: '4.8★', label: 'Lo que exige Superhost en Airbnb', sub: 'Una reseña de 4 estrellas por confusión baja tu media y tu posición.' },
              { stat: '4★', label: 'La reseña que duele sin motivo grave', sub: 'No porque algo salió mal. Sino porque podría haberse evitado.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[20px] p-8 border border-black/[0.06] text-center">
                <p className="font-bold text-[#7c3aed] mb-2" style={{ fontSize: '2.4rem' }}>{s.stat}</p>
                <p className="text-[13px] font-semibold text-[#111] mb-2 leading-snug">{s.label}</p>
                <p className="text-[12px] text-[#999] leading-relaxed">{s.sub}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-[#111] rounded-[24px] p-10 text-center">
            <p className="text-[#999] text-base mb-4">No hace falta que algo salga mal para perder la nota. Basta con que el huésped llegue sin información.</p>
            <p className="text-white font-bold text-[20px]">Haz que el huésped llegue informado. Evita lo evitable.</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 text-center" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
          <p className="text-violet-200 text-[11px] uppercase tracking-[0.2em] font-semibold mb-6">Tu próximo huésped ya tiene reserva</p>
          <h2 className="font-bold text-white leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Que llegue informado.
          </h2>
          <p className="text-violet-200 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Crea la primera guía. Empieza con check-in, WiFi y normas. Con eso ya tienes lo que necesitas.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-3 bg-white text-[#7c3aed] px-10 py-5 rounded-full font-bold text-lg"
            style={{ boxShadow: '0 0 50px rgba(0,0,0,0.2)' }}>
            Start free trial <ArrowRight className="w-5 h-5"/>
          </Link>
          <p className="mt-5 text-violet-300 text-sm">No necesitas tarjeta · 10 minutos · Sin compromiso</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/[0.06] py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={22} height={13} className="object-contain"/>
            <span className="font-bold text-sm">Itineramio</span>
          </Link>
          <div className="flex gap-6">
            {[['Privacidad', '/legal/privacy'], ['Términos', '/legal/terms'], ['FAQ', '/faq']].map(([l, h]) => (
              <Link key={l} href={h} className="text-[#aaa] text-sm hover:text-[#111] transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-[#ccc] text-xs">©{new Date().getFullYear()} Itineramio · España 🇪🇸</p>
        </div>
      </footer>

    </div>
  )
}
