'use client'

import Link from 'next/link'
import { ArrowRight, X, Star, RefreshCw, MessageSquare, Award } from 'lucide-react'

// ─── PHONE MOCKUP ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div className="mx-auto w-[200px]" style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.18))' }}>
      <div className="bg-[#111] rounded-[36px] p-2 border border-[#333]">
        <div className="bg-white rounded-[28px] overflow-hidden">
          <div className="bg-[#7c3aed] px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-[10px] font-bold">9:41</span>
              <div className="flex gap-1 items-end">
                <div className="w-1 h-2 bg-white/50 rounded-full"/>
                <div className="w-1 h-3 bg-white/70 rounded-full"/>
                <div className="w-1 h-4 bg-white rounded-full"/>
              </div>
            </div>
            <p className="text-white text-[11px] font-bold tracking-wider uppercase">MI APARTAMENTO</p>
            <p className="text-white/60 text-[9px] mt-0.5">Guía del huésped</p>
          </div>
          <div className="p-3 space-y-1.5">
            {[
              { icon: '🔑', label: 'Entrada y llaves', active: true },
              { icon: '📶', label: 'WiFi', active: false },
              { icon: '🚗', label: 'Parking', active: false },
              { icon: '🍳', label: 'Cocina', active: false },
              { icon: '📋', label: 'Normas de la casa', active: false },
            ].map((z, i) => (
              <div key={i} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${z.active ? 'bg-[#7c3aed]' : 'bg-[#f5f5f5]'}`}>
                <span className="text-xs">{z.icon}</span>
                <span className={`text-[10px] font-semibold ${z.active ? 'text-white' : 'text-[#555]'}`}>{z.label}</span>
              </div>
            ))}
          </div>
          <div className="mx-3 mb-3 bg-[#7c3aed] rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">AI</span>
              </div>
              <span className="text-white text-[10px] font-bold">AlexAI</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"/>
            </div>
            <p className="text-white/85 text-[9px] leading-relaxed">Hola 👋 El código de la caja es 4521. Mantén pulsado 2 seg.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LIFESTYLE PHOTO PLACEHOLDER ──────────────────────────────────────────────
function Photo({ alt, className = '', bg = '#e8e4df' }: { alt: string; className?: string; bg?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`} style={{ backgroundColor: bg }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-40">
        <div className="text-4xl">📷</div>
        <span className="text-[12px] font-medium text-[#888] text-center px-4">{alt}</span>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingHaroon() {
  return (
    <div className="min-h-screen bg-white text-[#111] overflow-x-hidden"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.08]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={26} height={15} className="object-contain"/>
            <span className="font-bold text-[15px] tracking-tight">Itineramio</span>
          </Link>
          <Link href="/register"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: '#7c3aed' }}>
            Start free trial
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-16 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-black text-[#111] leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)' }}>
                Los huéspedes no leen.<br/>
                Pero llegan preguntando{' '}
                <span style={{ color: '#7c3aed' }}>lo mismo.</span>
              </h1>
              <p className="text-[#555] text-[17px] leading-relaxed mb-8">
                Crea una guía una vez. Se envía sola cuando entra la reserva. El huésped llega sabiendo cómo entrar, dónde aparcar y cuál es el WiFi.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-[15px]"
                style={{ backgroundColor: '#7c3aed' }}>
                Start free trial <ArrowRight className="w-4 h-4"/>
              </Link>
            </div>
            <Photo alt="Anfitrión gestionando su apartamento" className="h-[420px] hidden lg:block" bg="#ede8e0"/>
          </div>
        </div>
      </section>

      {/* ── ESTO YA TE SUENA ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Photo alt="Huésped confundido a la llegada" className="h-[400px] hidden lg:block" bg="#ddd8cf"/>
            <div>
              <h2 className="font-black text-[#111] leading-tight mb-8"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
                Esto ya te suena
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  'Llevas semanas enviando la misma clave de WiFi a cada huésped',
                  'El "no podemos entrar" llega siempre a las 22:00',
                  'Una reseña de 4 estrellas por confusión baja tu posición en Airbnb',
                  'Con 6+ pisos, el móvil manda más que tú',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-red-100">
                      <X className="w-3 h-3 text-red-500"/>
                    </div>
                    <span className="text-[15px] text-[#444] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl border-l-4 border-[#7c3aed]" style={{ backgroundColor: '#f3f0ff' }}>
                <p className="text-[15px] font-bold text-[#7c3aed]">No es el trabajo lo que quema. Es la repetición.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Y SI EL HUÉSPED LLEGARA ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f9f8ff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-black text-[#111] leading-tight mb-6"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                Y si el huésped llegara<br/>
                <span style={{ color: '#7c3aed' }}>sabiendo cómo entrar?</span>
              </h2>
              <div className="space-y-4 text-[16px] text-[#555] leading-relaxed">
                <p>No hablamos de mandar otro mensaje largo que nadie lee. Ni de un PDF que se pierde en la bandeja.</p>
                <p>Hablamos de una guía corta, clara, organizada por zonas — entrada, WiFi, normas, parking, lo útil del barrio — que el huésped recibe automáticamente cuando se confirma la reserva.</p>
                <p>Antes de llegar, ya sabe cómo entrar. Ya tiene el WiFi. Ya conoce las normas. Y si tiene alguna duda, un chatbot le responde en su idioma usando la información de tu propio apartamento.</p>
              </div>
              <p className="mt-6 text-[17px] font-black text-[#111] italic">Tú no haces nada. La guía sale sola.</p>
            </div>
            <div className="flex justify-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 PAIN CARDS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <RefreshCw className="w-5 h-5 text-[#7c3aed]"/>,
                iconBg: '#ede9fe',
                title: 'Preguntas siempre repetidas',
                body: 'Las preguntas de los huéspedes se repiten en cada reserva: WiFi, acceso, normas, parking, checkout. La diferencia está en si las contestas tú o si ya llegan resueltas antes de su llegada.',
              },
              {
                icon: <MessageSquare className="w-5 h-5 text-[#2563eb]"/>,
                iconBg: '#dbeafe',
                title: 'Mensajes largos fallan',
                body: 'Airbnb permite mensajes automáticos y Booking.com tiene plantillas, pero si son largos, los huéspedes no los leen. No es el canal, es el formato.',
              },
              {
                icon: <Award className="w-5 h-5 text-[#059669]"/>,
                iconBg: '#d1fae5',
                title: 'Check-in afecta reseñas',
                body: 'Superhost exige 4.8 estrellas y las reseñas recientes importan. Una calificación de 4 por confusión en el check-in baja tu media; casi siempre ocurre por falta de información previa.',
              },
            ].map((col, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-black/[0.07]"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: col.iconBg }}>
                  {col.icon}
                </div>
                <h3 className="font-bold text-[#111] text-[17px] mb-3 leading-tight">{col.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRES PASOS ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-black text-[#111] leading-tight mb-12"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Tres pasos. Diez minutos.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
            {[
              {
                icon: '✏️',
                iconBg: '#d1fae5',
                n: '01',
                title: 'Crea tu guía',
                body: 'Entrada, WiFi, normas, parking. Organizado por zonas. Sin textos largos. Empieza solo con lo básico.',
              },
              {
                icon: '📤',
                iconBg: '#dbeafe',
                n: '02',
                title: 'Se envía sola',
                body: 'Cuando se confirma una reserva, el huésped recibe la guía automáticamente. Sin que toques nada.',
              },
              {
                icon: '🏠',
                iconBg: '#ede9fe',
                n: '03',
                title: 'El huésped llega ubicado',
                body: 'Sabe cómo entrar. Tiene el WiFi. Conoce las normas. Y si pregunta algo, el chatbot le responde en su idioma.',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-black/[0.06]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={{ backgroundColor: s.iconBg }}>
                  {s.icon}
                </div>
                <p className="text-[#ccc] font-black text-[2.5rem] leading-none mb-3">{s.n}</p>
                <h3 className="font-bold text-[#111] text-[17px] mb-3">{s.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[#aaa] text-[14px] mb-8 italic">Empieza con check-in, WiFi y normas. Con eso ya funciona.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 text-white px-10 py-4 rounded-full font-bold text-[15px]"
            style={{ backgroundColor: '#7c3aed' }}>
            Start free trial <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </section>

      {/* ── LO QUE CAMBIA DE VERDAD ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Photo alt="Anfitrión cenando tranquilo sin el móvil" className="h-[420px] hidden lg:block" bg="#2a2420"/>
            <div>
              <h2 className="font-black text-[#111] leading-tight mb-8"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Lo que cambia de<br/>verdad
              </h2>
              <div className="space-y-4">
                {[
                  'Menos mensajes de WiFi a las 23:00',
                  'Menos reseñas de 4 estrellas por confusión',
                  'Más cenas sin el móvil encima',
                  'Menos copiar y pegar cada reserva',
                  'Menos llamadas de "no podemos entrar"',
                  'Más huéspedes que resuelven solos',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Star className="w-4 h-4 shrink-0 mt-0.5 fill-[#7c3aed] text-[#7c3aed]"/>
                    <span className="text-[16px] text-[#333] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANTES / DESPUÉS ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f3f0ff' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-black text-[#111] text-center leading-tight mb-10"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Tu semana <em>antes</em> y <em>después</em>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-red-100">
              <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest mb-5">ANTES</p>
              <div className="space-y-3">
                {[
                  'WiFi manual a cada huésped',
                  '"No podemos entrar" a las 22:00',
                  'Las mismas preguntas en tres idiomas',
                  'El móvil no para en la cena',
                  'La reseña de 4 estrellas llega sin aviso',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5"/>
                    <span className="text-[13px] text-[#666] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-violet-100">
              <p className="text-[#7c3aed] text-[11px] font-bold uppercase tracking-widest mb-5">DESPUÉS</p>
              <div className="space-y-3">
                {[
                  'La guía sale sola al confirmar',
                  'El huésped llega ya informado',
                  'El chatbot responde en su idioma',
                  'Menos confusión, mejor nota',
                  'Cenas sin el móvil encima',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Star className="w-3.5 h-3.5 text-[#7c3aed] fill-[#7c3aed] shrink-0 mt-0.5"/>
                    <span className="text-[13px] text-[#333] leading-snug font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LO QUE YA HAS PROBADO ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-black text-[#111] leading-tight mb-10"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Lo que ya has probado y<br/>por qué no bastó
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: '💬',
                title: 'Copiar y pegar en WhatsApp o Airbnb',
                body: 'El huésped recibe un mensaje largo entre otros veinte. No lo lee. Tú acabas repitiéndolo igual. El problema no es el canal. Es que un mensaje largo compite con todo lo demás en su bandeja.',
              },
              {
                icon: '📄',
                title: 'Un PDF con las instrucciones',
                body: 'Nadie abre un PDF en el móvil. Y si lo abren, no encuentran lo que buscan porque está todo junto. Sin zonas. Sin estructura. Sin chatbot que resuelva dudas.',
              },
              {
                icon: '🏠',
                title: 'La guía integrada de Airbnb',
                body: 'Funciona para un piso. No para ocho. No se traduce sola. No se envía automáticamente al confirmar. No tiene chatbot. Y no cubre Booking.com.',
              },
              {
                icon: '🤷',
                title: 'No hacer nada y "ya va bien"',
                body: 'Va bien hasta que no va. Un check-in mal, una reseña de 4 estrellas, y la posición baja. A partir de 6 pisos, "ya va bien" es una apuesta que se paga con la nota.',
              },
            ].map((item, i) => (
              <div key={i} className="p-7 rounded-2xl border border-black/[0.07] bg-[#fafafa]">
                <div className="text-2xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-[#111] text-[15px] mb-3 leading-snug">{item.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ICP DARK ── */}
      <section className="py-20 px-6 bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-black text-white leading-tight mb-8"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Hecho para quien gestiona{' '}
                <span style={{ color: '#a78bfa' }}>6, 7 u 8 pisos solo</span>
              </h2>
              <div className="space-y-4">
                {[
                  'Gestionas varios apartamentos. Contestas cada mensaje tú. Coordinas cada check-in tú. Te juegas la nota en cada reseña tú.',
                  'No tienes equipo. No tienes sistema. Tienes el móvil y las ganas de que funcione.',
                  'Esto está hecho para ese momento. Para el anfitrión que ha cruzado el punto donde lo manual ya no aguanta y necesita que lo básico salga solo.',
                  'No necesitas un software más. Necesitas dejar de repetirte.',
                ].map((text, i) => (
                  <p key={i} className="text-[16px] text-[#aaa] leading-relaxed">{text}</p>
                ))}
              </div>
            </div>
            <Photo alt="Anfitrión con el móvil gestionando pisos" className="h-[420px] hidden lg:block" bg="#1f1a17"/>
          </div>
        </div>
      </section>

      {/* ── FAQ 2x2 ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-black text-[#111] leading-tight mb-10 text-center"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Lo que suelen preguntar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                q: '¿Es otro sistema que tengo que aprender?',
                a: 'Empieza con tres secciones: entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Luego vas añadiendo si quieres.',
              },
              {
                q: '¿Y si el huésped no abre la guía?',
                a: 'La guía se envía antes de llegar, no dentro del piso. La tasa de apertura es mucho mayor cuando la reciben con la confirmación de reserva. Y dentro del apartamento, el QR está disponible como refuerzo.',
              },
              {
                q: '¿Y si el huésped habla otro idioma?',
                a: 'La guía se traduce automáticamente. El chatbot detecta el idioma y responde en el suyo. Funciona en tres idiomas.',
              },
              {
                q: '¿El huésped necesita descargar una app?',
                a: 'No. Se abre en el navegador del móvil. Sin descarga. Sin registro.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-7 rounded-2xl border border-black/[0.07] bg-[#fafafa]">
                <h3 className="font-bold text-[#111] text-[15px] mb-3 leading-snug">{faq.q}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COSTE DE NO HACER NADA ── */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-black text-[#111] leading-tight mb-8 text-center"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            El coste de no hacer nada
          </h2>
          <div className="space-y-5 max-w-3xl mx-auto mb-12">
            <p className="text-[16px] text-[#555] leading-relaxed">
              El próximo huésped va a llegar, preguntará el WiFi, dudará con la entrada y puede llamar… o no. Si llega confundido y la estancia empieza mal, la reseña lo refleja, y una reseña de cuatro por confusión no baja sola.
            </p>
            <p className="text-[16px] text-[#555] leading-relaxed">
              Superhost pide un promedio de 4,8 o más, Booking.com pesa las reseñas recientes, y lo que parece un detalle mueve tu posición.
            </p>
            <p className="text-[16px] text-[#555] leading-relaxed">
              No hace falta que algo salga mal; basta con que no salga del todo bien.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { stat: '22:00', label: 'hora de "no podemos entrar"' },
              { stat: '4.8★', label: 'mínimo para Superhost' },
              { stat: '4★', label: 'basta para bajar tu posición' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-black/[0.06]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="font-black text-[#7c3aed] mb-2" style={{ fontSize: '2.2rem' }}>{s.stat}</p>
                <p className="text-[13px] text-[#666] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 text-center bg-[#111]">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed' }}>
            <img src="/isotipo-gradient.svg" alt="" width={28} height={16} className="object-contain brightness-0 invert"/>
          </div>
          <h2 className="font-black text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Tu próximo huésped ya tiene reserva.<br/>Que llegue informado.
          </h2>
          <p className="text-[#888] text-[16px] mb-10 leading-relaxed">
            Crea tu primera guía hoy. Empieza con lo básico. El resto se añade después.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 text-white px-10 py-5 rounded-full font-black text-[16px]"
            style={{ backgroundColor: '#7c3aed' }}>
            Start free trial <ArrowRight className="w-5 h-5"/>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6 bg-[#111]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={22} height={13} className="object-contain"/>
            <span className="font-bold text-sm text-white">Itineramio</span>
          </Link>
          <div className="flex gap-6">
            {[['Privacidad', '/legal/privacy'], ['Términos', '/legal/terms'], ['FAQ', '/faq']].map(([l, h]) => (
              <Link key={l} href={h} className="text-[#666] text-sm hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-[#555] text-xs">©{new Date().getFullYear()} Itineramio · España 🇪🇸</p>
        </div>
      </footer>

    </div>
  )
}
