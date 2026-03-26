'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronLeft, Star, Wifi, DoorOpen, MessageCircle, Menu, X, Bot, Zap, Globe, Bell, Car, FileText, UtensilsCrossed, Check, LogOut } from 'lucide-react'
import { Inter, Manrope } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], weight: ['300', '400', '600', '700', '800'], display: 'swap', variable: '--font-manrope' })

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
    title: 'Los huéspedes no leen, y tú lo sabes.',
    body: 'Por eso acabas repitiendo el WiFi, la entrada y las normas cada semana. Haz que les llegue antes de venir y deja de perseguir mensajes.',
    wide: true,
  },
  {
    icon: <Wifi className="w-6 h-6" />,
    title: 'He enviado el WiFi más que saludos.',
    body: 'Si gestionas varios apartamentos, sabes lo que es repetir WiFi, normas y acceso cada día. Crea una guía una vez y haz que se mande sola cuando entra la reserva.',
  },
  {
    icon: <DoorOpen className="w-6 h-6" />,
    title: 'El peor mensaje no es una queja.',
    body: 'Es este: "no podemos entrar". Suele llegar cuando estás cenando, conduciendo o con otro check-in encima. Haz que las instrucciones lleguen antes de la llegada.',
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: '4 estrellas por confusión duelen.',
    body: 'No porque sea grave, sino porque sabes que se podía haber evitado. Si el huésped llega sin tener claro el acceso o las normas, el riesgo sube. Mejor que llegue informado.',
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'No agota tener huéspedes.',
    body: 'Agota responder lo mismo veinte veces. Dónde se entra. Dónde se aparca. Cuál es la clave. Qué hacer al salir. Haz que la información llegue antes y sal de esa rueda.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'Los huéspedes no leen, ya está. Pero desde que uso Itineramio llegan con todo claro. Tres meses sin que nadie me pregunte por el acceso.',
    name: 'Carmen R.',
    role: 'Anfitriona · 7 apartamentos · Barcelona',
    avatar: '/avatar-carmen.jpg',
    stars: 5,
  },
  {
    quote: 'Con seis pisos ya no puedes seguir haciéndolo todo manual. Ahí empiezan las repeticiones y la sensación de no llegar a todo. Itineramio fue el cambio.',
    name: 'Marcos T.',
    role: 'Gestor de alquileres · 9 pisos · Madrid',
    avatar: '/avatar-marcos.jpg',
    stars: 5,
  },
  {
    quote: 'Una guía. Un envío automático. Y de repente dejas de repetirte. Eso es lo importante.',
    name: 'Laura S.',
    role: 'Superhost · 8 propiedades · Valencia',
    avatar: '/avatar-laura.jpg',
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

// ─── ANIMATED DEMO v2 — replica del dashboard real ───────────────────────────

const GUIDE_ZONES = [
  { id: 'entrada',  label: 'Entrada',  color: '#7c3aed', bg: '#ede9ff', icon: <DoorOpen className="w-3.5 h-3.5"/>,
    step: { title: 'Caja de llaves', body: 'Caja gris a la derecha de la puerta.\nCódigo: 4521 · Mantén pulsado 2 seg.' } },
  { id: 'wifi',     label: 'WiFi',     color: '#2563eb', bg: '#dbeafe', icon: <Wifi className="w-3.5 h-3.5"/>,
    step: { title: 'Red y contraseña', body: 'Red: Itineramio_5G\nClave: balcon2024#' } },
  { id: 'normas',   label: 'Normas',   color: '#d97706', bg: '#fef3c7', icon: <FileText className="w-3.5 h-3.5"/>,
    step: { title: 'Normas del piso',  body: 'Check-out antes de las 11:00h.\nNo fumar en el interior.' } },
  { id: 'parking',  label: 'Parking',  color: '#059669', bg: '#d1fae5', icon: <Car className="w-3.5 h-3.5"/>,
    step: { title: 'Aparcamiento',     body: 'Plaza B-14 · Pase magnético en\nel cajón de la cocina (izquierda).' } },
  { id: 'cocina',   label: 'Cocina',   color: '#dc2626', bg: '#fee2e2', icon: <UtensilsCrossed className="w-3.5 h-3.5"/>,
    step: { title: 'Equipamiento',     body: 'Cafetera, microondas, tostadora.\nEspecias básicas incluidas.' } },
  { id: 'checkout', label: 'Salida',   color: '#6b7280', bg: '#f3f4f6', icon: <LogOut className="w-3.5 h-3.5"/>,
    step: { title: 'Check-out',        body: 'Deja las llaves dentro y\ncierra con el código 4521.' } },
]

// SEQ: view='guide'|'zona'|'chat'
// Container 340px tall. Header 44px (13%). Zone grid p-3 (12px), 3 cols 2 rows.
// Row1 cy: (44+12+28)/340=25%  Row2 cy: (44+12+64+8+28)/340=46%
// Col1 cx≈17%  Col2 cx≈50%  Col3 cx≈83%
// Back btn (zone sub-header left): cx≈10%, cy≈20%
// Chat FAB (bottom-right): cx≈87%, cy≈87%
type SeqStep = { view:'guide'|'zona'|'chat'; zone:string|null; msg:number; cx:number; cy:number; click:boolean; dur:number }
const SEQ: SeqStep[] = [
  { view:'guide', zone:null,      msg:0, cx:50, cy:50, click:false, dur:900  },
  { view:'guide', zone:null,      msg:0, cx:17, cy:25, click:false, dur:550  },
  { view:'guide', zone:null,      msg:0, cx:17, cy:25, click:true,  dur:400  },
  { view:'zona',  zone:'entrada', msg:0, cx:17, cy:25, click:false, dur:1400 },
  { view:'zona',  zone:'entrada', msg:0, cx:10, cy:20, click:false, dur:500  },
  { view:'zona',  zone:'entrada', msg:0, cx:10, cy:20, click:true,  dur:400  },
  { view:'guide', zone:null,      msg:0, cx:10, cy:20, click:false, dur:400  },
  { view:'guide', zone:null,      msg:0, cx:50, cy:25, click:false, dur:500  },
  { view:'guide', zone:null,      msg:0, cx:50, cy:25, click:true,  dur:400  },
  { view:'zona',  zone:'wifi',    msg:0, cx:50, cy:25, click:false, dur:1200 },
  { view:'zona',  zone:'wifi',    msg:0, cx:10, cy:20, click:false, dur:500  },
  { view:'zona',  zone:'wifi',    msg:0, cx:10, cy:20, click:true,  dur:400  },
  { view:'guide', zone:null,      msg:0, cx:10, cy:20, click:false, dur:400  },
  { view:'guide', zone:null,      msg:0, cx:17, cy:46, click:false, dur:500  },
  { view:'guide', zone:null,      msg:0, cx:17, cy:46, click:true,  dur:400  },
  { view:'zona',  zone:'parking', msg:0, cx:17, cy:46, click:false, dur:1100 },
  { view:'zona',  zone:'parking', msg:0, cx:10, cy:20, click:false, dur:500  },
  { view:'zona',  zone:'parking', msg:0, cx:10, cy:20, click:true,  dur:400  },
  { view:'guide', zone:null,      msg:0, cx:10, cy:20, click:false, dur:400  },
  { view:'guide', zone:null,      msg:0, cx:87, cy:87, click:false, dur:600  },
  { view:'guide', zone:null,      msg:0, cx:87, cy:87, click:true,  dur:400  },
  { view:'chat',  zone:null,      msg:0, cx:87, cy:87, click:false, dur:700  },
  { view:'chat',  zone:null,      msg:1, cx:87, cy:87, click:false, dur:900  },
  { view:'chat',  zone:null,      msg:2, cx:87, cy:87, click:false, dur:1200 },
  { view:'chat',  zone:null,      msg:3, cx:87, cy:87, click:false, dur:2500 },
  { view:'chat',  zone:null,      msg:4, cx:87, cy:87, click:false, dur:1500 },
]

function DemoWidget() {
  const [step, setStep] = useState(0)
  const s = SEQ[step % SEQ.length]
  const [viewed, setViewed] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (step % SEQ.length === 0) setViewed(new Set())
  }, [step])

  useEffect(() => {
    if (s.view === 'zona' && s.zone && !s.click) {
      setViewed(prev => new Set([...prev, s.zone!]))
    }
  }, [s.view, s.zone, s.click])

  useEffect(() => {
    const t = setTimeout(() => setStep(p => (p + 1) % SEQ.length), s.dur)
    return () => clearTimeout(t)
  }, [step, s.dur])

  const activeZone = GUIDE_ZONES.find(z => z.id === s.zone) ?? null

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)' }}>

        {/* Browser chrome */}
        <div className="bg-[#ebebeb] px-4 py-2.5 flex items-center gap-3 border-b border-black/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-[#999] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#059669] inline-block" />
            app.itineramio.com/guide/barceloneta
          </div>
        </div>

        {/* App shell */}
        <div className="bg-[#f8f8f8] relative overflow-hidden" style={{ height: 340 }}>

          {/* ── Guide + Zona views ─────────────────────────────────── */}
          <div className="absolute inset-0 flex flex-col">

            {/* Sticky guide header — always visible */}
            <div className="bg-white border-b border-black/[0.06] px-3.5 py-2.5 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-2">
                <img src="/isotipo-gradient.svg" alt="" width={16} height={9} className="object-contain shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-[#111] leading-none">Apartamento Barceloneta</p>
                  <p className="text-[9px] text-[#999] mt-0.5">Barcelona · 2 hab · 4 huéspedes</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] cursor-default">🇪🇸</span>
                <span className="text-[11px] cursor-default opacity-40">🇬🇧</span>
                <span className="text-[11px] cursor-default opacity-40">🇫🇷</span>
              </div>
            </div>

            {/* Sliding content area */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">

                {/* Zone detail */}
                {s.view === 'zona' && activeZone ? (
                  <motion.div key={`zone-${activeZone.id}`}
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                    className="absolute inset-0 bg-white flex flex-col">
                    {/* Zone sub-header */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-black/[0.05] shrink-0">
                      <button className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <ChevronLeft className="w-3 h-3 text-[#555]" />
                      </button>
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: activeZone.bg, color: activeZone.color }}>
                        {activeZone.icon}
                      </div>
                      <p className="text-[11px] font-semibold text-[#111] flex-1 leading-none">{activeZone.label}</p>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Visto
                      </span>
                    </div>
                    {/* Step card */}
                    <div className="flex-1 p-3 overflow-hidden">
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl border border-black/[0.07] p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: '#111' }}>1</div>
                          <p className="text-[11px] font-semibold text-[#111]">{activeZone.step.title}</p>
                        </div>
                        <p className="text-[10px] text-[#555] leading-relaxed whitespace-pre-line pl-7">{activeZone.step.body}</p>
                        <div className="mt-2.5 pl-7 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-green-500" />
                          <span className="text-[9px] text-green-600 font-medium">Paso completado</span>
                        </div>
                      </motion.div>
                      {/* Progress */}
                      <div className="mt-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-[8px] text-[#aaa]">Progreso</span>
                          <span className="text-[8px] font-medium" style={{ color: activeZone.color }}>1/1 pasos</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                            className="h-full rounded-full" style={{ backgroundColor: activeZone.color }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : s.view !== 'chat' ? (
                  /* Zone grid */
                  <motion.div key="zone-grid"
                    initial={{ x: '-30%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-30%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                    className="absolute inset-0 p-3 flex flex-col gap-2.5 bg-[#f8f8f8]">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#bbb]">Manual de la propiedad</p>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      {GUIDE_ZONES.map(z => {
                        const isViewed = viewed.has(z.id)
                        const isHovered = s.view === 'guide' && s.zone === z.id
                        return (
                          <motion.div key={z.id}
                            animate={isHovered
                              ? { scale: 1.05, borderColor: z.color, boxShadow: `0 4px 12px ${z.color}22` }
                              : { scale: 1, borderColor: 'rgba(0,0,0,0.07)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            className="bg-white rounded-xl border p-2 flex flex-col gap-1.5 cursor-default"
                          >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: z.bg, color: z.color }}>
                              {z.icon}
                            </div>
                            <p className="text-[9px] font-semibold text-[#111] leading-tight">{z.label}</p>
                            {isViewed
                              ? <span className="text-[8px] text-green-600 font-medium flex items-center gap-0.5"><Check className="w-2 h-2"/>Visto</span>
                              : <span className="text-[8px] text-[#ccc]">Ver →</span>}
                          </motion.div>
                        )
                      })}
                    </div>
                    {/* Reading progress */}
                    <div className="shrink-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-[8px] text-[#aaa]">Guía leída</span>
                        <span className="text-[8px] font-semibold text-[#7c3aed]">{viewed.size}/6</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${(viewed.size / 6) * 100}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400" />
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Chat FAB — visible only on guide/zona views */}
            <AnimatePresence>
              {s.view !== 'chat' && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="absolute bottom-3 right-3 z-20">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg relative"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <Bot className="w-4 h-4 relative z-10" />
                    <motion.div animate={{ scale: [1, 1.7], opacity: [0.25, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-2xl bg-violet-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Chat panel ─────────────────────────────────────────── */}
          <AnimatePresence>
            {s.view === 'chat' && (
              <motion.div key="chat" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                className="absolute inset-0 flex flex-col bg-white z-30">

                {/* Chat header */}
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #18181b, #27272a)' }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(124,58,237,0.3)' }}>
                    <Bot className="w-3.5 h-3.5 text-violet-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-white leading-none">Asistente IA</p>
                    <p className="text-[9px] text-green-400 font-medium mt-0.5">● En línea · Barceloneta</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-[10px]">🇪🇸</span>
                    <span className="text-[10px] opacity-50">🇬🇧</span>
                    <span className="text-[10px] opacity-50">🇫🇷</span>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 px-3 py-3 flex flex-col justify-end gap-2.5 overflow-hidden">

                  {/* Suggested questions — shown before user types */}
                  <AnimatePresence>
                    {s.msg === 0 && (
                      <motion.div key="suggestions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5">
                        <p className="text-[8px] uppercase tracking-[0.15em] text-[#bbb] font-semibold">Preguntas frecuentes</p>
                        {['¿Cómo accedo al piso?', '¿Cuál es la clave del WiFi?', '¿A qué hora es el check-out?'].map((q, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-black/[0.06] bg-gray-50 text-[10px] text-[#444] cursor-default">
                            <MessageCircle className="w-2.5 h-2.5 text-[#bbb] shrink-0" />{q}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* User message */}
                  <AnimatePresence>
                    {s.msg >= 1 && (
                      <motion.div key="umsg" initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="self-end">
                        <div className="bg-[#111] text-white text-[10px] px-3 py-2 rounded-2xl rounded-br-sm max-w-[160px] leading-relaxed">
                          ¿Cómo entro? No encuentro las llaves 🤔
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {s.msg === 2 && (
                      <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="self-start">
                        <div className="bg-[#f5f3f0] px-3 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                          {[0,1,2].map(i => <motion.div key={i} animate={{ y: [0,-3,0] }} transition={{ repeat: Infinity, duration: 0.65, delay: i*0.13 }} className="w-1.5 h-1.5 rounded-full bg-[#aaa]" />)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI response */}
                  <AnimatePresence>
                    {s.msg >= 3 && (
                      <motion.div key="aresp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="self-start">
                        <div className="bg-[#f5f3f0] text-[#111] text-[10px] px-3 py-2 rounded-2xl rounded-bl-sm max-w-[210px] leading-relaxed">
                          ¡Hola! 👋 La caja de llaves está en la pared derecha de la puerta. Código: <strong>4521</strong>. Mantén pulsado 2 segundos y se abre.
                        </div>
                        <p className="text-[8px] text-[#ccc] mt-0.5 ml-1">Asistente IA · ahora</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Follow-up */}
                  <AnimatePresence>
                    {s.msg >= 4 && (
                      <motion.div key="follow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="self-start">
                        <div className="bg-[#f5f3f0] text-[#111] text-[10px] px-3 py-2 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed">
                          ¿Necesitas algo más? Tengo toda la info del piso 🏠
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input bar */}
                <div className="px-3 py-2.5 border-t border-black/[0.05] shrink-0">
                  <div className="bg-[#f5f3f0] rounded-full px-3 py-1.5 text-[9px] text-[#ccc]">Escribe en cualquier idioma…</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Cursor ─────────────────────────────────────────────── */}
          <motion.div
            animate={{ left: `${s.cx}%`, top: `${s.cy}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 26 }}
            className="absolute pointer-events-none z-50" style={{ transform: 'translate(-3px,-3px)' }}>
            <AnimatePresence>
              {s.click && (
                <motion.div key={`ripple-${step}`} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 2.8, opacity: 0 }} transition={{ duration: 0.38 }}
                  className="absolute w-6 h-6 rounded-full bg-violet-500/25 -translate-x-1/2 -translate-y-1/2" style={{ left: 4, top: 4 }} />
              )}
            </AnimatePresence>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2.5 1.5L2.5 15.5L6 11.5L8.5 16.5L11 15.5L8.5 10.5H14L2.5 1.5Z" fill="#111" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
        className="absolute -left-12 top-14 hidden lg:flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-2.5" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm">✓</div>
        <div>
          <p className="text-xs font-semibold text-[#111]">Guía enviada</p>
          <p className="text-[10px] text-[#aaa]">Reserva confirmada</p>
        </div>
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
    <div className={`${inter.className} ${manrope.variable} min-h-screen bg-white text-[#111] overflow-x-hidden`}
      style={{ WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-transparent'}`}
        style={scrolled ? { boxShadow: '0 1px 0 rgba(0,0,0,0.06)' } : {}}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} className="object-contain" />
            <span className="font-semibold text-[15px]">Itineramio</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['Producto','#features'],['Cómo funciona','#how'],['Testimonios','#testimonials'],['FAQ','#faq']].map(([l,h]) => (
              <a key={l} href={h} className="text-sm text-[#666] hover:text-[#111] transition-colors font-medium">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-[#666] hover:text-[#111] font-medium transition-colors">Entrar</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
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
          A partir de 6 pisos, lo manual muere
        </motion.div>

        {/* Headline — arini typography: bold + light mixed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4 max-w-4xl">
          {/* Label — arini style */}
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">El problema</p>
          <h1 className="leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)', fontFamily: 'var(--font-manrope)' }}>
            <span className="font-semibold text-[#111]">Los huéspedes no leen. </span>
            <span className="font-light text-[#aaa]">Y tú sigues enviando el mismo mensaje una y otra vez.</span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="text-base font-medium text-[#444] mb-10">
          Cuando el huésped llega ya informado, se nota desde el minuto uno. Menos dudas. Menos interrupciones. Menos mensajes con prisas.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-3">
          <Link href="/register" className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base text-white transition-all"
            style={{ backgroundColor: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
            Empieza gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 border border-black/10 text-[#666] hover:text-[#111] hover:border-black/20 px-8 py-4 rounded-full font-medium text-base transition-all">
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
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight max-w-2xl" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', fontFamily: 'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Si tu móvil manda más que tú, </span>
              <span className="font-light text-[#aaa]">ya sabes de qué va esto.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base font-medium text-[#555] mt-4">No necesitas otro chat. Necesitas que el huésped llegue con lo básico ya claro.</motion.p>
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
                  <h3 className="text-[17px] font-semibold text-[#111] mb-2">{f.title}</h3>
                  <p className="text-[15px] text-[#666] leading-relaxed font-normal">{f.body}</p>
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
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', fontFamily: 'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">No tienes que montarlo todo. </span>
              <span className="font-light text-[#aaa]">Empieza por la entrada.</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'Check-in, WiFi y normas. Con eso ya puedes empezar.', body: 'No necesitas montar toda la guía hoy. Lo importante es tener la parte que más preguntas genera. Haz eso primero y deja el resto para después.' },
              { n: '02', title: 'Una guía. Un envío automático.', body: 'Pega el enlace en tu mensaje automático de Airbnb o Booking. Cuando se confirma la reserva, el huésped lo recibe. Así llegáis los dos mucho mejor al check-in.' },
              { n: '03', title: 'Ahí cambia todo.', body: 'Cuando activas eso, el huésped ya recibe la información antes de llegar. No es teoría. Es el momento en el que dejas de repetir lo mismo en cada reserva.' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className="rounded-[20px] p-8 flex flex-col gap-5" style={{ backgroundColor: '#f5f3f0' }}>
                <span className="font-semibold text-[#111]/[0.06] leading-none select-none" style={{ fontSize: '4.5rem' }}>{s.n}</span>
                <h3 className="text-[17px] font-semibold text-[#111]">{s.title}</h3>
                <p className="text-[15px] text-[#666] leading-relaxed font-normal">{s.body}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 flex justify-start">
            <Link href="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-all"
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
                    <p className="font-semibold text-[#111] text-lg leading-none">{m.stat}</p>
                    <p className="text-[11px] text-[#888] mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: copy (arini style) */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-5 font-medium">El impacto</p>
              <h2 className="leading-[1.08] tracking-tight mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', fontFamily: 'var(--font-manrope)' }}>
                <span className="font-semibold text-[#111]">Con 2 o 3 apartamentos tiras. </span>
                <span className="font-light text-[#aaa]">Con 6, 7 u 8, ya no.</span>
              </h2>
              <p className="text-[15px] text-[#666] leading-relaxed mb-8 font-normal">
                No agota tener huéspedes. Agota responder lo mismo veinte veces. Dónde se entra. Dónde se aparca. Cuál es la clave. Qué hacer al salir. Haz que la información llegue antes y sal de esa rueda.
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white"
                style={{ backgroundColor: '#111' }}>
                Ver demo
              </Link>

              <div className="mt-8 border-t border-black/[0.06] pt-8">
                <p className="text-[17px] font-normal text-[#111] leading-relaxed mb-5">
                  "Una guía. Un envío automático. Y de repente dejas de repetirte. Eso es lo importante."
                </p>
                <div className="flex items-center gap-3">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Carmen" width={40} height={40} className="rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-[#111]">Carmen R.</p>
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
              <h2 className="leading-[1.08] tracking-tight mb-6" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', fontFamily: 'var(--font-manrope)' }}>
                <span className="font-semibold text-[#111]">Ya empezaste tu guía. </span>
                <span className="font-light text-[#aaa]">Termínala antes de que llegue el próximo huésped.</span>
              </h2>
              <div className="space-y-4 text-[15px] text-[#666] leading-relaxed mb-8">
                <p>No hace falta dejarla perfecta. Empieza por lo básico: entrada, WiFi y normas. Ese primer paso ya te quita repeticiones y evita más de una duda de última hora.</p>
                <p>Una guía. Un envío automático. Ese es el primer cambio real. Cuando activas eso, el huésped ya recibe la información antes de llegar.</p>
                <p className="font-semibold text-[#111] text-base">Es el momento en el que dejas de repetir lo mismo en cada reserva.</p>
              </div>
              <Link href="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-all"
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
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', fontFamily: 'var(--font-manrope)' }}>
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
              <p className="font-normal text-[#111] leading-relaxed mb-10" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}>
                "{TESTIMONIALS[tIdx].quote}"
              </p>
              <div className="flex items-center gap-4">
                <img src={TESTIMONIALS[tIdx].avatar} alt={TESTIMONIALS[tIdx].name} width={52} height={52} className="rounded-full object-cover" style={{ boxShadow: '0 0 0 3px rgba(124,58,237,0.15)' }} />
                <div>
                  <p className="font-semibold text-[#111] text-base">{TESTIMONIALS[tIdx].name}</p>
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
            { bold: 'Mi punto de ruptura no fue un huésped.', light: ' Fue el sexto piso.' },
            { bold: 'Hay días en los que no trabajas de anfitrión.', light: ' Trabajas de copiar y pegar.' },
            { bold: 'El mismo WiFi. La misma entrada. Las mismas normas.', light: ' Cambia el nombre del huésped y repite.' },
          ].map((line, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="leading-tight tracking-tight" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontFamily: 'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">{line.bold}</span>
              <span className="font-light text-[#ccc]">{line.light}</span>
            </motion.p>
          ))}
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="leading-tight tracking-tight pt-6" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontFamily: 'var(--font-manrope)' }}>
            <span className="font-light text-[#ccc]">Lo que quema no es el trabajo. </span>
            <span className="font-semibold text-[#111]">Es la repetición.</span>
          </motion.p>
        </div>
      </section>

      {/* ── FAQ (arini: border-top, no cards) ── */}
      <section id="faq" className="py-20 px-6" style={{ backgroundColor: '#f5f3f0' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.h2 variants={fadeUp} className="font-semibold text-[#111] leading-tight" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', fontFamily: 'var(--font-manrope)' }}>
              Preguntas frecuentes
            </motion.h2>
          </motion.div>
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="border-t border-black/[0.08]">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-7 text-left">
                <span className={`text-[16px] font-medium leading-snug transition-colors ${faqOpen === i ? 'text-violet-700' : 'text-[#111]'}`}>{faq.q}</span>
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
          <h2 className="leading-[1.05] tracking-tight text-white mb-5" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.8rem)', fontFamily: 'var(--font-manrope)' }}>
            <span className="font-semibold">Mejor que te pille </span>
            <span className="font-light" style={{ color: '#aaa' }}>preparado.</span>
          </h2>
          <p className="text-[#555] text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            Empieza por entrada, WiFi y normas. Ese primer paso ya te quita repeticiones y evita más de una duda de última hora.
          </p>
          <Link href="/register" className="group inline-flex items-center gap-3 bg-white text-[#111] px-10 py-5 rounded-full font-semibold text-lg hover:bg-violet-50 transition-all"
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
                <span className="font-semibold text-sm">Itineramio</span>
              </Link>
              <p className="text-[#aaa] text-sm leading-relaxed">Guías digitales y chatbot IA para anfitriones con 6 o más propiedades en España.</p>
            </div>
            {[
              { title: 'Producto', links: ['Funcionalidades', 'Precios', 'Demo', 'Integraciones'] },
              { title: 'Recursos', links: ['Blog', 'Guía de inicio', 'FAQ', 'Contacto'] },
              { title: 'Legal', links: ['Privacidad', 'Términos', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#111] mb-5">{col.title}</p>
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
