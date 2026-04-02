'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, ChevronDown, Check, X } from 'lucide-react'

// ─── PHONE MOCKUP ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div style={{ filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.22))' }} className="mx-auto w-[230px]">
      <div className="bg-[#111] rounded-[40px] p-2.5 border-2 border-[#2a2a2a]">
        <div className="bg-white rounded-[32px] overflow-hidden">
          {/* Status bar */}
          <div className="bg-[#7c3aed] px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-[10px] font-bold">9:41</span>
              <div className="flex gap-1 items-end">
                <div className="w-1 h-2 bg-white/50 rounded-full"/>
                <div className="w-1 h-3 bg-white/70 rounded-full"/>
                <div className="w-1 h-4 bg-white rounded-full"/>
              </div>
            </div>
            <p className="text-white text-[12px] font-bold tracking-widest uppercase">MI APARTAMENTO</p>
            <p className="text-white/60 text-[10px] mt-0.5">Guía del huésped</p>
          </div>
          {/* Zones list */}
          <div className="p-3.5 space-y-2">
            {[
              { icon: '🔑', label: 'Entrada y llaves', active: true },
              { icon: '📶', label: 'WiFi', active: false },
              { icon: '🚗', label: 'Parking', active: false },
              { icon: '🍳', label: 'Cocina', active: false },
              { icon: '📋', label: 'Normas de la casa', active: false },
            ].map((z, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${z.active ? 'bg-[#7c3aed] text-white' : 'bg-[#f5f5f5]'}`}>
                <span className="text-sm">{z.icon}</span>
                <span className={`text-[11px] font-semibold ${z.active ? 'text-white' : 'text-[#444]'}`}>{z.label}</span>
                {z.active && <span className="ml-auto text-white/70 text-[10px]">→</span>}
              </div>
            ))}
          </div>
          {/* AlexAI bubble */}
          <div className="mx-3.5 mb-4 bg-[#7c3aed] rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">AI</span>
              </div>
              <span className="text-white text-[11px] font-bold">AlexAI</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"/>
            </div>
            <p className="text-white/85 text-[10px] leading-relaxed">Hola 👋 El código de la caja es 4521. Mantén pulsado 2 seg.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingHaroon() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white text-[#111] overflow-x-hidden" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white border-b-2 border-[#111]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={26} height={15} className="object-contain"/>
            <span className="font-black text-[16px] tracking-tight">Itineramio</span>
          </Link>
          <Link href="/register"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#111]">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-20 pb-24 px-6 border-b-2 border-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="inline-block bg-[#7c3aed] text-white text-[12px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full mb-8">Para anfitriones con 5+ pisos</p>
              <h1 className="font-black text-[#111] leading-[1.05] tracking-tighter mb-6"
                style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.2rem)' }}>
                Los huéspedes no leen.<br/>
                Pero llegan preguntando{' '}
                <span className="underline decoration-[#7c3aed] decoration-4 underline-offset-4">lo mismo.</span>
              </h1>
              <p className="text-[#555] text-[18px] leading-relaxed mb-10 max-w-lg">
                Crea una guía una vez. Se envía sola cuando entra la reserva. El huésped llega sabiendo cómo entrar, dónde aparcar y cuál es el WiFi. Tú dejas de repetir.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-white text-[16px] bg-[#7c3aed]">
                  Empezar gratis <ArrowRight className="w-5 h-5"/>
                </Link>
                <Link href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-[#111] text-[16px] border-2 border-[#111] bg-white">
                  Ver demo
                </Link>
              </div>
              <p className="text-[#999] text-sm">Sin tarjeta. En 10 minutos tienes la primera guía.</p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── ESTO YA TE SUENA ── */}
      <section className="py-24 px-6 bg-[#fafafa] border-b-2 border-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-black text-[#111] leading-tight mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Esto ya te suena.
              </h2>
              <div className="space-y-4">
                {[
                  'Copias el mismo mensaje de entrada a cada huésped',
                  'Te preguntan el WiFi aunque lo mandaste antes',
                  'Recibes el "no podemos entrar" a las 22:00',
                  'Un PDF que nadie abre en el móvil',
                  'Reseña de 4 estrellas por una confusión evitable',
                  'Con 6 pisos, lo manual ya no funciona',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 text-white"/>
                    </div>
                    <span className="text-[16px] text-[#333] leading-snug font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-5 border-l-4 border-[#7c3aed] bg-violet-50 rounded-r-xl">
                <p className="text-[15px] text-[#7c3aed] font-bold">No es el trabajo en sí. Es la repetición.</p>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 PAIN COLUMNS ── */}
      <section className="py-24 px-6 bg-white border-b-2 border-[#111]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-black text-[#111] mb-12 text-center" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
            Por qué pasa esto.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-[#111] rounded-2xl overflow-hidden">
            {[
              {
                n: '01',
                title: 'Preguntas siempre repetidas',
                body: 'Las mismas dudas en cada reserva. WiFi, acceso, normas, parking. La diferencia está en si las contestas tú una a una o si llegan resueltas antes del check-in.',
              },
              {
                n: '02',
                title: 'Mensajes largos que no se leen',
                body: 'Mandas un mensaje con todo. El huésped lo ve entre veinte notificaciones y no lo lee. Llega igual de perdido. El problema no es el canal, es el formato.',
              },
              {
                n: '03',
                title: 'El check-in afecta las reseñas',
                body: 'Un check-in que empieza con confusión rara vez termina en 5 estrellas. No hace falta que salga mal. Basta con que no salga del todo bien.',
              },
            ].map((col, i) => (
              <div key={i} className={`p-8 ${i < 2 ? 'border-b-2 md:border-b-0 md:border-r-2 border-[#111]' : ''}`}>
                <p className="font-black text-[#7c3aed] text-[2rem] mb-4">{col.n}</p>
                <h3 className="font-black text-[#111] text-[18px] mb-4 leading-tight">{col.title}</h3>
                <p className="text-[15px] text-[#555] leading-relaxed">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRES PASOS ── */}
      <section className="py-24 px-6" style={{ backgroundColor: '#7c3aed' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-black text-white leading-tight mb-4 text-center" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Tres pasos. Diez minutos.
          </h2>
          <p className="text-violet-200 text-[16px] text-center mb-14">Así funciona Itineramio.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Crea tu guía', body: 'No tienes que montarlo todo. Empieza por lo que más tensión genera: la entrada. Añádela primero y deja lo demás para después.' },
              { n: '02', title: 'Se envía sola', body: 'Cuando se confirma la reserva, el huésped lo recibe automáticamente. Sin que tú hagas nada. Así llegáis los dos mucho mejor al check-in.' },
              { n: '03', title: 'El huésped llega ubicado', body: 'Ya llega más informado. Menos preguntas. Menos caos. Menos mensajes a las 22:00. Tu nota lo nota.' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-8 border border-white/20">
                <p className="font-black text-white/20 text-[5rem] leading-none mb-6">{s.n}</p>
                <h3 className="font-black text-white text-[20px] mb-4">{s.title}</h3>
                <p className="text-violet-200 text-[15px] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-white text-[#7c3aed] px-10 py-5 rounded-xl font-black text-[16px]">
              Empezar gratis <ArrowRight className="w-5 h-5"/>
            </Link>
          </div>
        </div>
      </section>

      {/* ── LO QUE CAMBIA DE VERDAD ── */}
      <section className="py-24 px-6 bg-white border-t-2 border-b-2 border-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-black text-[#111] leading-tight mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Lo que cambia de verdad.
              </h2>
              <div className="space-y-4">
                {[
                  'El huésped llega más informado',
                  'Menos mensajes de WiFi a las 23:00',
                  'Menos reseñas de 4 estrellas por confusión',
                  'El móvil de noche ya no te interrumpe igual',
                  'Menos llamadas de "no podemos entrar"',
                  'Más huéspedes que se resuelven solos',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-white"/>
                    </div>
                    <span className="text-[16px] text-[#333] leading-snug font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-black text-[#111] text-[18px] mb-6">Tu semana antes y después</h3>
              <div className="border-2 border-[#111] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-2 border-b-2 border-[#111]">
                  <div className="p-4 border-r-2 border-[#111] bg-red-50">
                    <p className="text-[11px] font-black uppercase tracking-widest text-red-600 mb-1">Antes</p>
                  </div>
                  <div className="p-4 bg-green-50">
                    <p className="text-[11px] font-black uppercase tracking-widest text-green-700 mb-1">Después</p>
                  </div>
                </div>
                {[
                  { before: 'WiFi manual a cada huésped', after: 'La guía se envía automáticamente' },
                  { before: 'El huésped llega sin saber nada', after: 'El huésped llega ya informado' },
                  { before: 'Mensajes nocturnos de acceso', after: 'AlexAI responde en su idioma' },
                  { before: 'Mismas preguntas cada semana', after: 'Menos interrupciones, mejor nota' },
                ].map((row, i) => (
                  <div key={i} className={`grid grid-cols-2 ${i < 3 ? 'border-b border-[#eee]' : ''}`}>
                    <div className="flex items-start gap-2 p-4 border-r-2 border-[#111] bg-red-50">
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5"/>
                      <span className="text-[13px] text-[#666] leading-snug">{row.before}</span>
                    </div>
                    <div className="flex items-start gap-2 p-4 bg-green-50">
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5"/>
                      <span className="text-[13px] text-[#333] leading-snug font-semibold">{row.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LO QUE YA HAS PROBADO ── */}
      <section className="py-24 px-6 bg-[#fafafa] border-b-2 border-[#111]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-black text-[#111] leading-tight mb-12" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Lo que ya has probado<br/>y por qué no bastó.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                title: '"Ya va bien" sin sistema',
                body: 'Va bien hasta que no va. Un check-in mal, una reseña de 4 estrellas, y la posición baja. A partir de 6 apartamentos, "ya va bien" es una apuesta que se paga con la nota.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border-2 border-[#111]">
                <h3 className="font-black text-[#111] text-[17px] mb-4 leading-tight">{item.title}</h3>
                <p className="text-[15px] text-[#666] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ICP DARK ── */}
      <section className="py-24 px-6 bg-[#111]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-black text-white leading-tight mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Hecho para quien gestiona{' '}
            <span className="text-[#7c3aed]">6, 7 u 8 pisos solo.</span>
          </h2>
          <div className="space-y-5 mb-12">
            {[
              'Gestionas varios apartamentos. Contestas cada mensaje tú. Tu juego es no perder ninguno por mala gestión.',
              'No tienes equipo. No tienes sistema. Tienes el móvil y las ganas del momento. Para el anfitrión que está en el punto donde la guía manual ya no aguanta y necesita que lo básico salga solo.',
              'No necesitas más software. Necesitas dejar de repetirte.',
            ].map((text, i) => (
              <p key={i} className="text-[17px] text-[#aaa] leading-relaxed">{text}</p>
            ))}
          </div>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-[#7c3aed] text-white px-10 py-5 rounded-xl font-black text-[16px]">
            Empezar gratis <ArrowRight className="w-5 h-5"/>
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-white border-t-2 border-b-2 border-[#111]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-black text-[#111] leading-tight mb-12" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Preguntas frecuentes.
          </h2>
          {[
            { q: '¿Es otro sistema que tengo que aprender?', a: 'Empieza con tres secciones: entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Luego vas añadiendo si quieres.' },
            { q: '¿Y si el huésped habla otro idioma?', a: 'La guía se traduce automáticamente. AlexAI detecta el idioma del huésped y responde en el suyo. Español, inglés, francés.' },
            { q: '¿El huésped necesita descargar una app?', a: 'No. Se abre en el navegador del móvil. Sin descarga. Sin registro. El huésped solo necesita el enlace o escanear el QR.' },
            { q: '¿Y si el huésped no abre la guía?', a: 'La guía se envía antes de llegar. La tasa de apertura es mucho mayor cuando la reciben con la confirmación de reserva. Y dentro del apartamento, el QR está disponible como refuerzo.' },
            { q: '¿Funciona con Booking.com además de Airbnb?', a: 'Sí. La guía es una URL que puedes mandar por cualquier canal: Airbnb, Booking, WhatsApp, email. No depende de la plataforma.' },
          ].map((faq, i) => (
            <div key={i} className="border-t-2 border-[#111]">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left">
                <span className={`text-[17px] font-bold leading-snug transition-colors ${faqOpen === i ? 'text-[#7c3aed]' : 'text-[#111]'}`}>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#aaa] shrink-0 mt-1 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`}/>
              </button>
              {faqOpen === i && (
                <p className="text-[15px] text-[#666] leading-relaxed pb-6">{faq.a}</p>
              )}
            </div>
          ))}
          <div className="border-t-2 border-[#111]"/>
        </div>
      </section>

      {/* ── COSTE DE NO HACER NADA ── */}
      <section className="py-24 px-6 bg-[#fafafa] border-b-2 border-[#111]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-black text-[#111] leading-tight mb-12 text-center" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            El coste de no hacer nada.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-[#111] rounded-2xl overflow-hidden mb-12">
            {[
              { stat: '22:00', label: 'La hora a la que suele llegar el "no podemos entrar"', sub: 'Cuando estás cenando, conduciendo o ya en cama.' },
              { stat: '4.8★', label: 'Lo que exige Superhost en Airbnb', sub: 'Una reseña de 4 estrellas por confusión baja tu media y tu posición.' },
              { stat: '4★', label: 'La reseña que duele sin motivo grave', sub: 'No porque algo salió mal. Sino porque podría haberse evitado.' },
            ].map((s, i) => (
              <div key={i} className={`p-10 text-center ${i < 2 ? 'border-b-2 md:border-b-0 md:border-r-2 border-[#111]' : ''}`}>
                <p className="font-black text-[#7c3aed] mb-3" style={{ fontSize: '3rem' }}>{s.stat}</p>
                <p className="text-[14px] font-bold text-[#111] mb-2 leading-snug">{s.label}</p>
                <p className="text-[13px] text-[#999] leading-relaxed">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#111] rounded-2xl p-10 text-center">
            <p className="text-[#999] text-[16px] mb-4">No hace falta que algo salga mal para perder la nota.</p>
            <p className="text-white font-black text-[22px]">Basta con que el huésped llegue sin información.</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 text-center" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-violet-200 text-[13px] font-bold uppercase tracking-[0.2em] mb-6">Tu próximo huésped ya tiene reserva</p>
          <h2 className="font-black text-white leading-tight mb-6" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
            Que llegue informado.
          </h2>
          <p className="text-violet-200 text-[18px] mb-12 max-w-lg mx-auto leading-relaxed">
            Crea la primera guía. Empieza con check-in, WiFi y normas. Con eso ya tienes lo que necesitas.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-3 bg-white text-[#7c3aed] px-12 py-5 rounded-xl font-black text-[18px]">
            Empezar gratis <ArrowRight className="w-5 h-5"/>
          </Link>
          <p className="mt-6 text-violet-300 text-[14px]">Sin tarjeta · 10 minutos · Sin compromiso</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-2 border-[#111] py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={22} height={13} className="object-contain"/>
            <span className="font-black text-sm">Itineramio</span>
          </Link>
          <div className="flex gap-6">
            {[['Privacidad', '/legal/privacy'], ['Términos', '/legal/terms'], ['FAQ', '/faq']].map(([l, h]) => (
              <Link key={l} href={h} className="text-[#999] text-sm hover:text-[#111] transition-colors font-medium">{l}</Link>
            ))}
          </div>
          <p className="text-[#ccc] text-xs">©{new Date().getFullYear()} Itineramio · España 🇪🇸</p>
        </div>
      </footer>

    </div>
  )
}
