'use client'

import Link from 'next/link'
import { X, Star, RefreshCw, MessageSquare, Award, ArrowRight, Key, Wifi, Car, ChefHat, ClipboardList, MessageCircle, PenLine, Rocket, Home, FileText, HelpCircle, Utensils, PhoneCall, Moon } from 'lucide-react'

// ─── GRADIENT TEXT HELPER ────────────────────────────────────────────────────
const gradientStyle = {
  background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as React.CSSProperties

const gradientStyleLight = {
  background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as React.CSSProperties

const gradientBorder = {
  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #7c3aed, #db2777) border-box',
  border: '2px solid transparent',
  borderRadius: '16px',
} as React.CSSProperties

// ─── PHONE MOCKUP ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  const zones = [
    { icon: <Key className="w-3 h-3 text-[#7c3aed]"/>, label: 'Check-In', sub: '3 instrucciones' },
    { icon: <ChefHat className="w-3 h-3 text-[#7c3aed]"/>, label: 'Caldera', sub: '2 instrucciones' },
    { icon: <RefreshCw className="w-3 h-3 text-[#7c3aed]"/>, label: 'Videocámara', sub: '1 instrucción' },
    { icon: <ClipboardList className="w-3 h-3 text-[#7c3aed]"/>, label: 'Check-Out', sub: '4 instrucciones' },
    { icon: <Wifi className="w-3 h-3 text-[#7c3aed]"/>, label: 'WiFi', sub: '1 instrucción' },
    { icon: <Home className="w-3 h-3 text-[#7c3aed]"/>, label: 'Normas de la Casa', sub: '5 instrucciones' },
    { icon: <Car className="w-3 h-3 text-[#7c3aed]"/>, label: 'Luz de la cocina', sub: '1 instrucción' },
    { icon: <MessageCircle className="w-3 h-3 text-[#7c3aed]"/>, label: 'Aire Acondicionado', sub: '2 instrucciones' },
  ]
  return (
    <div className="mx-auto w-[240px]" style={{
      filter: 'drop-shadow(0 24px 48px rgba(124,58,237,0.22))',
    }}>
      {/* Fondo lavanda detrás del teléfono */}
      <div className="rounded-[36px] p-[3px]" style={{ background: '#111' }}>
        <div className="bg-white rounded-[34px] overflow-hidden">
          {/* Notch */}
          <div className="bg-white flex justify-center pt-2 pb-1">
            <div className="w-[72px] h-[20px] rounded-full bg-[#111] flex items-center justify-center gap-1.5">
              <div className="w-[6px] h-[6px] rounded-full bg-[#333]"/>
              <div className="w-[8px] h-[8px] rounded-full bg-[#222]"/>
            </div>
          </div>
          {/* Status bar */}
          <div className="bg-white px-4 pt-1 pb-1 flex items-center justify-between">
            <span className="text-[9px] font-semibold text-[#111]">9:41</span>
            <div className="flex gap-1 items-center">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <rect x="0" y="4" width="2" height="4" rx="0.5" fill="#111"/>
                <rect x="3" y="2.5" width="2" height="5.5" rx="0.5" fill="#111"/>
                <rect x="6" y="1" width="2" height="7" rx="0.5" fill="#111"/>
                <rect x="9" y="0" width="2" height="8" rx="0.5" fill="#111"/>
              </svg>
              <Wifi className="w-2.5 h-2.5 text-[#111]"/>
            </div>
          </div>
          {/* Header */}
          <div className="px-4 pb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#111]">Manual del apartamento</p>
            <span className="text-[8px] text-[#7c3aed] font-semibold border border-[#7c3aed] rounded-full px-1.5 py-0.5">Sugerencias</span>
          </div>
          {/* Zones list */}
          <div className="divide-y divide-[#f5f5f5]">
            {zones.map((z, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2">
                <div className="w-6 h-6 rounded-lg bg-[#f3f0ff] flex items-center justify-center shrink-0">
                  {z.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-[#222] leading-tight">{z.label}</p>
                  <p className="text-[8px] text-[#aaa]">{z.sub}</p>
                </div>
                <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
                  <path d="M1 1l3 3-3 3" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
          {/* Chat FAB */}
          <div className="flex justify-end px-4 py-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7c3aed' }}>
              <MessageCircle className="w-4 h-4 text-white"/>
            </div>
          </div>
        </div>
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
            Prueba gratis 15 días
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-16 pb-4 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-bold text-[#111] leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)' }}>
            Los huéspedes no leen.<br/>
            Pero llegan preguntando{' '}
            <span style={gradientStyle}>lo mismo.</span>
          </h1>
          <p className="text-[#555] text-[17px] leading-relaxed mb-8 max-w-xl">
            Crea una guía una vez. Se envía sola cuando entra la reserva. El huésped llega sabiendo cómo entrar, dónde aparcar y cuál es el WiFi.
          </p>
          <Link href="/register"
            className="inline-flex items-center px-8 py-4 rounded-full font-semibold text-white text-[15px]"
            style={{ backgroundColor: '#7c3aed' }}>
            Prueba gratis 15 días
          </Link>
        </div>
      </section>

      {/* ── ESTO YA TE SUENA ── */}
      <section className="pt-12 pb-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="h-[300px] lg:h-[420px] rounded-2xl overflow-hidden">
              <img src="/landing-haroon/hero-frustrated.png" alt="Anfitrión estresado"
                className="w-full h-full object-cover object-center"/>
            </div>
            <div>
              <h2 className="font-bold text-[#111] leading-tight mb-8"
                style={{ fontSize: 'clamp(3rem, 5vw, 4rem)' }}>
                Esto ya te suena
              </h2>
              <div className="space-y-3 mb-8">
                {[
                  'Llevas semanas enviando la misma clave de WiFi a cada huésped',
                  'El "no podemos entrar" llega siempre a las 22:00',
                  'Una reseña de 4 estrellas por confusión baja tu posición en Airbnb',
                  'Con 6+ pisos, el móvil manda más que tú',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ border: '1px solid #f1f1f1' }}>
                    <X className="w-4 h-4 text-red-500 shrink-0"/>
                    <span className="text-[15px] text-[#444] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(90deg, #f3f0ff 0%, #ffffff 100%)' }}>
                <p className="text-[15px] text-[#5b21b6]">No es el trabajo lo que quema. Es la repetición.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Y SI EL HUÉSPED LLEGARA ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f5f3ff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-bold text-[#111] leading-tight mb-6">
                <span className="block font-normal text-[#111]" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>Y si el huésped llegara</span>
                <span className="block text-[#111]" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)' }}>sabiendo cómo entrar?</span>
              </h2>
              <div className="space-y-4 text-[16px] text-[#555] leading-relaxed">
                <p>No hablamos de mandar otro mensaje largo que nadie lee. Ni de un PDF que se pierde en la bandeja.</p>
                <p>Hablamos de una guía corta, clara, organizada por zonas — entrada, WiFi, normas, parking, lo útil del barrio — que el huésped recibe automáticamente cuando se confirma la reserva.</p>
                <p>Antes de llegar, ya sabe cómo entrar. Ya tiene el WiFi. Ya conoce las normas. Y si tiene alguna duda, un chatbot le responde en su idioma usando la información de tu propio apartamento.</p>
              </div>
              <p className="mt-6 text-[17px] font-bold text-[#111] italic">Tú no haces nada. La guía sale sola.</p>
            </div>
            <div className="flex justify-center py-8">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 PAIN CARDS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Preguntas siempre repetidas',
                body: 'Las preguntas de los huéspedes se repiten en cada reserva: WiFi, acceso, normas, parking, checkout. La diferencia está en si las contestas tú o si ya llegan resueltas antes de su llegada.',
              },
              {
                title: 'Mensajes largos fallan',
                body: 'Airbnb permite mensajes automáticos y Booking.com tiene plantillas, pero si son largos, los huéspedes no los leen. No es el canal, es el formato.',
              },
              {
                title: 'Check-in afecta reseñas',
                body: 'Superhost exige 4.8 estrellas y las reseñas recientes importan. Una calificación de 4 por confusión en el check-in baja tu media; casi siempre ocurre por falta de información previa.',
              },
            ].map((col, i) => (
              <div key={i} className="rounded-2xl p-7" style={{ ...gradientBorder }}>
                <h3 className="font-bold text-[28px] mb-3 leading-tight" style={gradientStyle}>{col.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRES PASOS ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-bold text-[#111] leading-tight mb-12"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Tres pasos. Diez minutos.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
            {[
              {
                icon: <PenLine className="w-6 h-6 text-white"/>,
                iconBg: 'linear-gradient(135deg, #a3e635, #4ade80)',
                n: '01', titleColor: '#16a34a',
                title: 'Crea tu guía',
                body: 'Entrada, WiFi, normas, parking. Organizado por zonas. Sin textos largos. Empieza solo con lo básico.',
              },
              {
                icon: <Rocket className="w-6 h-6 text-white"/>,
                iconBg: 'linear-gradient(135deg, #7dd3fc, #3b82f6)',
                n: '02', titleColor: '#2563eb',
                title: 'Se envía sola',
                body: 'Cuando se confirma una reserva, el huésped recibe la guía automáticamente. Sin que toques nada.',
              },
              {
                icon: <Home className="w-6 h-6 text-white"/>,
                iconBg: 'linear-gradient(135deg, #fdba74, #ea580c)',
                n: '03', titleColor: '#ea580c',
                title: 'El huésped llega ubicado',
                body: 'Sabe cómo entrar. Tiene el WiFi. Conoce las normas. Y si pregunta algo, el chatbot le responde en su idioma.',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-black/[0.06]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: s.iconBg }}>
                  {s.icon}
                </div>
                <p className="text-[#ccc] font-bold text-[2.5rem] leading-none mb-3">{s.n}</p>
                <h3 className="font-bold text-[17px] mb-3" style={{ color: s.titleColor }}>{s.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[#aaa] text-[14px] mb-8 italic">Empieza con check-in, WiFi y normas. Con eso ya funciona.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 text-white px-10 py-4 rounded-full font-semibold text-[15px]"
            style={{ backgroundColor: '#7c3aed' }}>
            Prueba gratis 15 días <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </section>

      {/* ── LO QUE CAMBIA DE VERDAD ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="h-[300px] lg:h-[420px] rounded-2xl overflow-hidden">
              <img src="/landing-haroon/relax-armchair.png" alt="Anfitrión relajado"
                className="w-full h-full object-cover object-center"/>
            </div>
            <div>
              <h2 className="font-bold text-[#111] leading-tight mb-6">
                <span className="block font-normal text-[#999]" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>Lo que</span>
                <span className="block" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}>cambia de verdad</span>
              </h2>
              <div className="space-y-3">
                {[
                  { icon: <Moon className="w-4 h-4"/>, color: '#22c55e', text: 'Menos mensajes de WiFi a las 23:00' },
                  { icon: <Star className="w-4 h-4"/>, color: '#3b82f6', text: 'Menos reseñas de 4 estrellas por confusión' },
                  { icon: <Utensils className="w-4 h-4"/>, color: '#ea580c', text: 'Más cenas sin el móvil encima' },
                  { icon: <FileText className="w-4 h-4"/>, color: '#22c55e', text: 'Menos copiar y pegar cada reserva' },
                  { icon: <PhoneCall className="w-4 h-4"/>, color: '#ea580c', text: 'Menos llamadas de "no podemos entrar"' },
                  { icon: <Home className="w-4 h-4"/>, color: '#3b82f6', text: 'Más huéspedes que resuelven solos' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: '#f3f0ff', color: item.color }}>
                    {item.icon}
                    <span className="text-[15px] text-[#333]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANTES / DESPUÉS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto p-10" style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 40%, #c4b5fd 0%, #ede9fe 50%, #f8f7ff 100%)', borderRadius: '48px' }}>
          <h2 className="text-[#111] text-center leading-tight mb-10"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Tu semana <strong>antes</strong> y <strong>después</strong>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #fca5a5' }}>
              <div className="px-6 py-3" style={{ backgroundColor: '#fff1f2' }}>
                <p className="text-red-400 text-[12px] font-bold uppercase tracking-widest">ANTES</p>
              </div>
              <div className="px-6 pb-6 pt-3 bg-white divide-y divide-gray-100">
                {[
                  'WiFi manual a cada huésped',
                  '"No podemos entrar" a las 22:00',
                  'Las mismas preguntas en tres idiomas',
                  'El móvil no para en la cena',
                  'La reseña de 4 estrellas llega sin aviso',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2.5">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="#fca5a5"/>
                      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[13px] text-[#555] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #86efac' }}>
              <div className="px-6 py-3" style={{ backgroundColor: '#f0fdf4' }}>
                <p className="text-green-500 text-[12px] font-bold uppercase tracking-widest">DESPUÉS</p>
              </div>
              <div className="px-6 pb-6 pt-3 bg-white divide-y divide-gray-100">
                {[
                  'La guía sale sola al confirmar',
                  'El huésped llega ya informado',
                  'El chatbot responde en su idioma',
                  'Menos confusión, mejor nota',
                  'Cenas sin el móvil encima',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2.5">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="#86efac"/>
                      <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[13px] text-[#333] leading-snug">{item}</span>
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
          <h2 className="text-[#111] leading-tight mb-10"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Lo que ya has probado y<br/><strong>por qué no bastó</strong>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: <img src="/landing-haroon/icon-phone-chat.png" alt="Chat" className="w-10 h-10 object-contain"/>,
                title: 'Copiar y pegar en WhatsApp o Airbnb',
                body: 'El huésped recibe un mensaje largo entre otros veinte. No lo lee. Tú acabas repitiéndolo igual. El problema no es el canal. Es que un mensaje largo compite con todo lo demás en su bandeja.',
              },
              {
                icon: <img src="/landing-haroon/icon-pdf.png" alt="PDF" className="w-10 h-10 object-contain"/>,
                title: 'Un PDF con las instrucciones',
                body: 'Nadie abre un PDF en el móvil. Y si lo abren, no encuentran lo que buscan porque está todo junto. Sin zonas. Sin estructura. Sin chatbot que resuelva dudas.',
              },
              {
                icon: <img src="/landing-haroon/icon-airbnb.png" alt="Airbnb" className="w-10 h-10 object-contain"/>,
                title: 'La guía integrada de Airbnb',
                body: 'Funciona para un piso. No para ocho. No se traduce sola. No se envía automáticamente al confirmar. No tiene chatbot. Y no cubre Booking.com.',
              },
              {
                icon: <img src="/landing-haroon/icon-stars.png" alt="Estrellas" className="w-10 h-10 object-contain"/>,
                title: 'No hacer nada y "ya va bien"',
                body: 'Va bien hasta que no va. Un check-in mal, una reseña de 4 estrellas, y la posición baja. A partir de 6 pisos, "ya va bien" es una apuesta que se paga con la nota.',
              },
            ].map((item, i) => (
              <div key={i} className="p-7 rounded-2xl" style={gradientBorder}>
                <div className="w-14 h-14 rounded-2xl bg-[#f3f0ff] flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#111] text-[15px] mb-3 leading-snug">{item.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ICP ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[#111] leading-tight mb-8">
                <span className="block text-[18px] font-normal text-[#555]">Hecho para quien gestiona</span>
                <span className="block font-bold text-[#111]" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>6, 7 u 8 pisos solo</span>
              </h2>
              <div className="space-y-4">
                <p className="text-[16px] text-[#555] leading-relaxed">Gestionas varios apartamentos. Contestas cada mensaje tú. Coordinas cada check-in tú. Te juegas la nota en cada reseña tú.</p>
                <p className="text-[16px] text-[#555] leading-relaxed">No tienes equipo. No tienes sistema. Tienes el móvil y las ganas de que funcione.</p>
                <p className="text-[16px] text-[#555] leading-relaxed">Esto está hecho para ese momento. Para el anfitrión que ha cruzado el punto donde lo manual ya no aguanta y necesita que lo básico salga solo.</p>
                <p className="text-[16px] text-[#555] leading-relaxed">No necesitas un <strong>software más</strong>. Necesitas <strong>dejar de repetirte.</strong></p>
              </div>
            </div>
            <div className="h-[300px] lg:h-[420px] rounded-2xl overflow-hidden">
              <img src="/landing-haroon/stressed-laptop.png" alt="Anfitrión gestionando"
                className="w-full h-full object-cover object-center"/>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ 2x2 ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[#111] leading-tight mb-10 text-center"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Lo que <strong>suelen preguntar</strong>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { q: 'Es otro sistema que tengo que aprender?', a: 'Empieza con tres secciones: entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Luego vas añadiendo si quieres.', color: '#7c3aed', light: '#a78bfa' },
              { q: 'Y si el huésped no abre la guía?', a: 'La guía se envía antes de llegar, no dentro del piso. La tasa de apertura es mucho mayor cuando la reciben con la confirmación de reserva. Y dentro del apartamento, el QR está disponible como refuerzo.', color: '#22c55e', light: '#86efac' },
              { q: 'Y si el huésped habla otro idioma?', a: 'La guía se traduce automáticamente. El chatbot detecta el idioma y responde en el suyo. Funciona en tres idiomas.', color: '#f97316', light: '#fdba74' },
              { q: 'El huésped necesita descargar una app?', a: 'No. Se abre en el navegador del móvil. Sin descarga. Sin registro.', color: '#3b82f6', light: '#93c5fd' },
            ].map((faq, i) => (
              <div key={i} className="p-7 rounded-2xl" style={{
                background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${faq.color}, ${faq.light}) border-box`,
                border: '2px solid transparent',
                borderRadius: '16px',
              }}>
                <h3 className="font-bold text-[17px] mb-3 leading-snug" style={{ color: faq.color }}>{faq.q}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COSTE DE NO HACER NADA ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-[#111] leading-tight mb-10 text-center"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            El coste de no hacer nada
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-12">
            <div className="space-y-4">
              <p className="text-[16px] text-[#555] leading-relaxed">
                El próximo huésped va a llegar, preguntará el WiFi, dudará con la entrada y puede llamar… o no. Si llega confundido y la estancia empieza mal, la reseña lo refleja, y una reseña de cuatro por confusión no baja sola.
              </p>
              <p className="text-[16px] text-[#555] leading-relaxed">
                Superhost pide un promedio de 4,8 o más, Booking.com pesa las reseñas recientes, y lo que parece un «detalle» mueve tu posición.
              </p>
              <p className="text-[16px] font-bold text-[#111] leading-relaxed">
                No hace falta que algo salga mal; basta con que no salga del todo bien.
              </p>
            </div>
            <div className="h-[300px] lg:h-[360px] rounded-2xl overflow-hidden">
              <img src="/landing-haroon/woman-phone.png" alt="Anfitriona mirando el móvil"
                className="w-full h-full object-cover object-center"/>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { stat: '22:00', label: 'hora del "no podemos entrar"' },
              { stat: '4.8★', label: 'mínimo para Superhost' },
              { stat: '4★', label: 'basta para bajar tu posición' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-black/[0.06]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="font-bold mb-2" style={{ fontSize: '2.2rem', ...gradientStyle }}>{s.stat}</p>
                <p className="text-[13px] text-[#666] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Rocket className="w-10 h-10 text-white"/>
          </div>
          <h2 className="font-bold text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Tu próximo huésped ya tiene reserva.<br/>
            Que llegue informado.
          </h2>
          <p className="text-white/70 text-[16px] mb-10 leading-relaxed">
            Crea tu primera guía hoy. Empieza con lo básico. El resto se añade después.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-white px-10 py-4 rounded-full font-semibold text-[16px] text-[#7c3aed]">
            Prueba gratis 15 días
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6 bg-[#0a0010]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={22} height={13} className="object-contain"/>
            <span className="font-bold text-sm text-white">Itineramio</span>
          </Link>
          <div className="flex gap-6">
            {[
              { href: '/privacy', label: 'Privacidad' },
              { href: '/terms', label: 'Términos' },
              { href: '/register', label: 'Crear cuenta' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
