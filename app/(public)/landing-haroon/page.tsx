'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, X, Star } from 'lucide-react'

// ─── PHOTO PLACEHOLDER ────────────────────────────────────────────────────────
// Replace src with real lifestyle photos when available
function Photo({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#e8e4df] ${className}`}>
      {src
        ? <img src={src} alt={alt} className="w-full h-full object-cover"/>
        : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#bbb] text-sm font-medium">{alt}</span>
          </div>
        )
      }
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingHaroon() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

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
      <section className="pt-16 pb-20 px-6 overflow-hidden">
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
            <Photo
              alt="Anfitrión gestionando su apartamento"
              className="h-[420px] hidden lg:block"
            />
          </div>
        </div>
      </section>

      {/* ── ESTO YA TE SUENA ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-black text-[#111] leading-tight mb-8"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
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
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: '#fee2e2' }}>
                      <X className="w-3 h-3 text-red-500"/>
                    </div>
                    <span className="text-[15px] text-[#444] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-[16px] font-bold text-[#111] italic">
                No es el trabajo lo que quema. Es la repetición.
              </p>
            </div>
            <Photo
              alt="Huésped llegando confundido"
              className="h-[380px] hidden lg:block"
            />
          </div>
        </div>
      </section>

      {/* ── Y SI EL HUÉSPED LLEGARA SABIENDO ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f9f7ff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Photo
              alt="Aplicación móvil guía huésped"
              className="h-[400px] hidden lg:block"
            />
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
              <p className="mt-6 text-[17px] font-bold text-[#111]">Tú no haces nada. La guía sale sola.</p>
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
                color: '#7c3aed',
                title: 'Preguntas siempre repetidas',
                body: 'Las preguntas de los huéspedes se repiten en cada reserva: WiFi, acceso, normas, parking, checkout. La diferencia está en si las contestas tú o si ya llegan resueltas antes de su llegada.',
              },
              {
                color: '#2563eb',
                title: 'Mensajes largos fallan',
                body: 'Airbnb permite mensajes automáticos y Booking.com tiene plantillas, pero si son largos, los huéspedes no los leen. No es el canal, es el formato.',
              },
              {
                color: '#059669',
                title: 'Check-in afecta reseñas',
                body: 'Superhost exige 4.8 estrellas y las reseñas recientes importan. Una calificación de 4 por confusión en el check-in baja tu media; casi siempre ocurre por falta de información previa.',
              },
            ].map((col, i) => (
              <div key={i} className="rounded-2xl p-8 text-white" style={{ backgroundColor: col.color }}>
                <h3 className="font-bold text-[18px] mb-4 leading-tight">{col.title}</h3>
                <p className="text-[14px] leading-relaxed opacity-90">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRES PASOS ── */}
      <section className="py-20 px-6 bg-[#111]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-black text-white leading-tight mb-12"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Tres pasos. Diez minutos.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
            {[
              {
                icon: '✏️',
                title: 'Crea tu guía',
                body: 'Entrada, WiFi, normas, parking. Organizado por zonas. Sin textos largos. Empieza solo con lo básico.',
              },
              {
                icon: '📤',
                title: 'Se envía sola',
                body: 'Cuando se confirma una reserva, el huésped recibe la guía automáticamente. Sin que toques nada.',
              },
              {
                icon: '🏠',
                title: 'El huésped llega ubicado',
                body: 'Sabe cómo entrar. Tiene el WiFi. Conoce las normas. Y si pregunta algo, el chatbot le responde en su idioma.',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.06] rounded-2xl p-8 border border-white/10">
                <div className="text-3xl mb-5">{s.icon}</div>
                <h3 className="font-bold text-white text-[18px] mb-3">{s.title}</h3>
                <p className="text-[#aaa] text-[14px] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[#666] text-[14px] mb-8 italic">Empieza con check-in, WiFi y normas. Con eso ya funciona.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-[#7c3aed] text-white px-10 py-4 rounded-full font-bold text-[15px]">
            Start free trial <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </section>

      {/* ── LO QUE CAMBIA DE VERDAD ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Photo
              alt="Anfitrión cenando tranquilo sin el móvil"
              className="h-[420px] hidden lg:block"
            />
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
                    <Star className="w-4 h-4 text-[#7c3aed] shrink-0 mt-0.5 fill-[#7c3aed]"/>
                    <span className="text-[15px] text-[#333] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANTES / DESPUÉS ── */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-black text-white text-center leading-tight mb-10"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Tu semana <span className="underline decoration-white/40">antes</span> y <span className="underline decoration-white/40">después</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-5">ANTES</p>
              <div className="space-y-3">
                {[
                  'WiFi manual a cada huésped',
                  '"No podemos entrar" a las 22:00',
                  'Las mismas preguntas en tres idiomas',
                  'El móvil no para en la cena',
                  'La reseña de 4 estrellas llega sin aviso',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <X className="w-3.5 h-3.5 text-red-300 shrink-0 mt-0.5"/>
                    <span className="text-[13px] text-white/80 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-5">DESPUÉS</p>
              <div className="space-y-3">
                {[
                  'La guía sale sola al confirmar',
                  'El huésped llega ya informado',
                  'El chatbot responde en su idioma',
                  'Menos confusión, mejor nota',
                  'Cenas sin el móvil encima',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Star className="w-3.5 h-3.5 text-green-300 shrink-0 mt-0.5 fill-green-300"/>
                    <span className="text-[13px] text-white leading-snug font-medium">{item}</span>
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
                title: 'Copiar y pegar en WhatsApp o Airbnb',
                body: 'El huésped recibe un mensaje largo entre otros veinte. No lo lee. Tú acabas repitiéndolo igual. El problema no es el canal. Es que un mensaje largo compite con todo lo demás en su bandeja.',
              },
              {
                title: 'Un PDF con las instrucciones',
                body: 'Nadie abre un PDF en el móvil. Y si lo abren, no encuentran lo que buscan porque está todo junto. Sin zonas. Sin estructura. Sin chatbot que resuelva dudas.',
              },
              {
                title: 'La guía integrada de Airbnb',
                body: 'Funciona para un piso. No para ocho. No se traduce sola. No se envía automáticamente al confirmar. No tiene chatbot. Y no cubre Booking.com.',
              },
              {
                title: 'No hacer nada y "ya va bien"',
                body: 'Va bien hasta que no va. Un check-in mal, una reseña de 4 estrellas, y la posición baja. A partir de 6 pisos, "ya va bien" es una apuesta que se paga con la nota.',
              },
            ].map((item, i) => (
              <div key={i} className="p-7 rounded-2xl border border-black/[0.08] bg-[#fafafa]">
                <h3 className="font-bold text-[#111] text-[16px] mb-3 leading-snug">{item.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ICP ── */}
      <section className="py-20 px-6 bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-black text-white leading-tight mb-8"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Hecho para quien gestiona{' '}
                <span style={{ color: '#a78bfa' }}>6, 7 u 8 pisos solo</span>
              </h2>
              <div className="space-y-5">
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
            <Photo
              alt="Anfitrión con el móvil gestionando pisos"
              className="h-[420px] hidden lg:block"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ 2x2 GRID ── */}
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
              <div key={i} className="p-7 rounded-2xl border border-black/[0.08] bg-[#fafafa]">
                <h3 className="font-bold text-[#111] text-[15px] mb-3 leading-snug">{faq.q}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EL COSTE DE NO HACER NADA ── */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-black text-[#111] leading-tight mb-8 text-center"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            El coste de no hacer nada
          </h2>
          <div className="space-y-5 mb-10 max-w-3xl mx-auto">
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
              <div key={i} className="bg-white rounded-2xl p-8 border border-black/[0.06]">
                <p className="font-black text-[#7c3aed] mb-2" style={{ fontSize: '2.2rem' }}>{s.stat}</p>
                <p className="text-[13px] text-[#666] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-black text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Tu próximo huésped ya tiene reserva.<br/>Que llegue informado.
          </h2>
          <p className="text-violet-200 text-[16px] mb-10 leading-relaxed">
            Crea tu primera guía hoy. Empieza con lo básico. El resto se añade después.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-white text-[#7c3aed] px-10 py-5 rounded-full font-black text-[16px]">
            Start free trial <ArrowRight className="w-5 h-5"/>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/[0.06] py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={22} height={13} className="object-contain"/>
            <span className="font-bold text-sm">Itineramio</span>
          </Link>
          <div className="flex gap-6">
            {[['Privacidad', '/legal/privacy'], ['Términos', '/legal/terms'], ['FAQ', '/faq']].map(([l, h]) => (
              <Link key={l} href={h} className="text-[#999] text-sm hover:text-[#111] transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-[#ccc] text-xs">©{new Date().getFullYear()} Itineramio · España 🇪🇸</p>
        </div>
      </footer>

    </div>
  )
}
