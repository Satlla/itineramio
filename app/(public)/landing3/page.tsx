'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronLeft, Star, Wifi, DoorOpen, MessageCircle, X, Bot, Car, FileText, UtensilsCrossed, Check, LogOut, XCircle, CheckCircle2 } from 'lucide-react'
import { Inter, Manrope } from 'next/font/google'

const inter   = Inter({ subsets: ['latin'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], weight: ['300','400','600','700','800'], display: 'swap', variable: '--font-manrope' })

// ─── VARIANTS ──────────────────────────────────────────────────────────────
const fadeUp      = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25,0.1,0.25,1] } } }
const fadeIn      = { hidden: { opacity: 0 },         show: { opacity: 1,        transition: { duration: 0.5 } } }
const stagger     = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const popUp       = { hidden: { opacity: 0, y: 40, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }
const cardStagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }
const cardPop     = { hidden: { opacity: 0, y: 24, scale: 0.94 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

// ─── COUNT-UP ──────────────────────────────────────────────────────────────
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref   = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  useEffect(() => {
    if (!inView) return
    let start = 0; const steps = 50; const inc = to / steps
    const t = setInterval(() => { start += inc; if (start >= to) { setVal(to); clearInterval(t) } else setVal(Math.floor(start)) }, 28)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{val}{suffix}</span>
}

// ─── LOGOS ─────────────────────────────────────────────────────────────────
const LOGOS = ['Airbnb', 'Booking.com', 'Vrbo', 'Holidu', 'Wimdu', 'HomeAway', 'Expedia']

function LogoCarousel() {
  const [idx, setIdx] = useState(0)
  useEffect(() => { const t = setInterval(() => setIdx(p => (p+1)%LOGOS.length), 1600); return () => clearInterval(t) }, [])
  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#bbb] font-medium">Los huéspedes llegan desde</p>
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span key={idx} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            transition={{ duration:0.35 }} className="text-xl font-semibold text-[#ccc] tracking-tight">
            {LOGOS[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5">
        {LOGOS.map((_,i) => <div key={i} className={`rounded-full transition-all duration-300 ${i===idx ? 'w-5 h-1.5 bg-violet-600' : 'w-1.5 h-1.5 bg-black/10'}`} />)}
      </div>
    </div>
  )
}

// ─── CASE STUDIES ──────────────────────────────────────────────────────────
// TODO Haroon: reemplazar con datos reales de hosts
type CaseStudy = {
  id: number
  hostName: string
  location: string
  properties: number
  metric1: { to: number; suffix: string; label: string }
  metric2: { to: number; suffix: string; label: string }
  quote: string
  highlight: string
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 1,
    hostName: 'Carlos R.',
    location: 'Barcelona',
    properties: 8,
    metric1: { to: 87, suffix: '%', label: 'menos preguntas repetidas' },
    metric2: { to: 40, suffix: 'h', label: 'ahorradas al mes' },
    quote: 'Antes del sexto apartamento podía con todo. Después, Itineramio fue lo que me permitió escalar sin caos.',
    highlight: 'De 4,6 a 4,9★ en 2 meses',
  },
  {
    id: 2,
    hostName: 'María G.',
    location: 'Valencia',
    properties: 4,
    metric1: { to: 5, suffix: '★', label: 'valoración media actual' },
    metric2: { to: 10, suffix: ' min', label: 'para configurar la guía' },
    quote: 'Mis huéspedes llegan sabiendo todo. Ya no recibo mensajes de "¿cómo entro?" a las 11 de la noche.',
    highlight: 'Superhost durante 3 años consecutivos',
  },
  {
    id: 3,
    hostName: 'Javier L.',
    location: 'Sevilla',
    properties: 12,
    metric1: { to: 90, suffix: '%', label: 'dudas resueltas sin intervención' },
    metric2: { to: 3, suffix: ' min', label: 'tiempo medio de respuesta' },
    quote: 'Con 12 apartamentos no puedes estar pendiente del móvil todo el día. El chatbot lo cubre sin que yo toque nada.',
    highlight: '12 propiedades, sin asistente',
  },
]

// ─── FEATURE ANIMATIONS DATA ───────────────────────────────────────────────
const ALL_ZONE_SETS = [
  [
    { label:'Entrada',  color:'#7c3aed', bg:'#ede9ff', e:'🚪' },
    { label:'WiFi',     color:'#2563eb', bg:'#dbeafe', e:'📶' },
    { label:'Normas',   color:'#d97706', bg:'#fef3c7', e:'📋' },
    { label:'Parking',  color:'#059669', bg:'#d1fae5', e:'🚗' },
    { label:'Cocina',   color:'#dc2626', bg:'#fee2e2', e:'🍳' },
    { label:'Salida',   color:'#6b7280', bg:'#f3f4f6', e:'🔑' },
  ],
  [
    { label:'Piscina',  color:'#0ea5e9', bg:'#e0f2fe', e:'🏊' },
    { label:'Terraza',  color:'#8b5cf6', bg:'#ede9fe', e:'🌅' },
    { label:'Jardín',   color:'#16a34a', bg:'#dcfce7', e:'🌿' },
    { label:'Garaje',   color:'#78716c', bg:'#f5f5f4', e:'🚘' },
    { label:'Gym',      color:'#ef4444', bg:'#fee2e2', e:'💪' },
    { label:'BBQ',      color:'#f97316', bg:'#ffedd5', e:'🔥' },
  ],
]

const CHAT_CONVOS = [
  { q:'¿Cuál es la clave del WiFi? 🤔',     a:'Red: Itineramio_5G · Clave: balcon2024# 🙌' },
  { q:'¿A qué hora es el checkout?',         a:'El checkout es a las 11:00h. Deja las llaves dentro y cierra. ¡Hasta pronto! 👋' },
  { q:'¿Dónde puedo dejar las maletas?',     a:'Consigna en Calle Mayor 12 — código Alex25 para descuento 🧳' },
  { q:'¿Dónde podemos aparcar?',             a:'Parking Urquinaona (C/ Urquinaona 6), a 3 min a pie 🚗' },
  { q:'¿Recomendáis algún restaurante? 🍽️', a:'La Barceloneta a 5 min — menciona el apartamento y tienes 10% dto.' },
]

const LANG_CONVOS = [
  { flag:'🇬🇧', lang:'EN', q:"What's the WiFi password?",  a:'Network: Itineramio_5G · Password: balcon2024# 🙌' },
  { flag:'🇪🇸', lang:'ES', q:'¿A qué hora es el checkout?', a:'El checkout es a las 11:00h. ¡Hasta pronto! 👋' },
  { flag:'🇫🇷', lang:'FR', q:"C'est quoi le WiFi?",          a:'Réseau: Itineramio_5G · Mdp: balcon2024# 🙌' },
]

// ─── ZONES CAROUSEL ────────────────────────────────────────────────────────
function ZonesCarousel() {
  const [page, setPage] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPage(p => (p + 1) % ALL_ZONE_SETS.length), 3000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="w-full max-w-[280px]">
      <AnimatePresence mode="wait">
        <motion.div key={page}
          initial={{ x: '50%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-50%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid grid-cols-3 gap-2">
          {ALL_ZONE_SETS[page].map(z => (
            <div key={z.label} className="rounded-[14px] p-3 flex flex-col items-center justify-center gap-1.5 aspect-square" style={{ backgroundColor: z.bg }}>
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: z.color + '22' }}>
                <span style={{ color: z.color, fontSize: 14 }}>{z.e}</span>
              </div>
              <span className="text-[10px] font-semibold" style={{ color: z.color }}>{z.label}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-1.5 mt-3">
        {ALL_ZONE_SETS.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i === page ? 'w-4 h-1.5 bg-violet-600' : 'w-1.5 h-1.5 bg-black/10'}`}/>
        ))}
      </div>
    </div>
  )
}

// ─── INFINITE CHAT ──────────────────────────────────────────────────────────
function InfiniteChat() {
  const [idx, setIdx] = useState(0)
  const [stage, setStage] = useState<'q'|'typing'|'a'|'pause'>('q')
  useEffect(() => {
    const delays: Record<'q'|'typing'|'a'|'pause', number> = { q: 900, typing: 850, a: 2600, pause: 300 }
    const next: Record<'q'|'typing'|'a'|'pause', 'q'|'typing'|'a'|'pause'> = { q:'typing', typing:'a', a:'pause', pause:'q' }
    const t = setTimeout(() => {
      if (stage === 'pause') setIdx(p => (p + 1) % CHAT_CONVOS.length)
      setStage(next[stage])
    }, delays[stage])
    return () => clearTimeout(t)
  }, [stage, idx])
  const convo = CHAT_CONVOS[idx]
  return (
    <div className="w-full max-w-[300px] bg-white rounded-t-[16px] p-4 flex flex-col gap-2.5" style={{ boxShadow:'0 -4px 24px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 pb-2 border-b border-black/[0.05]">
        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center"><Bot className="w-3 h-3 text-violet-600"/></div>
        <span className="text-[11px] font-semibold text-[#111]">Asistente IA</span>
        <span className="ml-auto text-[9px] text-green-500 font-medium">● En línea</span>
      </div>
      <div className="flex flex-col gap-2 min-h-[80px] justify-end">
        <AnimatePresence mode="wait">
          <motion.div key={`q-${idx}`}
            initial={{ opacity:0, y:6, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-4 }} transition={{ duration:0.22 }}
            className="self-end bg-[#111] text-white text-[10px] px-2.5 py-1.5 rounded-2xl rounded-br-sm max-w-[165px] leading-relaxed">
            {convo.q}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {stage === 'typing' && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="self-start bg-[#f5f3f0] px-2.5 py-2 rounded-2xl rounded-bl-sm flex gap-1">
              {[0,1,2].map(i => <motion.div key={i} animate={{ y:[0,-3,0] }} transition={{ repeat:Infinity, duration:0.65, delay:i*0.13 }} className="w-1.5 h-1.5 rounded-full bg-[#aaa]"/>)}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {(stage === 'a' || stage === 'pause') && (
            <motion.div key={`a-${idx}`}
              initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              transition={{ duration:0.22 }}
              className="self-start bg-[#f5f3f0] text-[#111] text-[10px] px-2.5 py-1.5 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed">
              {convo.a}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── MULTI-LANG CHAT MINI ───────────────────────────────────────────────────
function MultiLangChatMini() {
  const [idx, setIdx] = useState(0)
  const [showA, setShowA] = useState(false)
  useEffect(() => {
    setShowA(false)
    const t1 = setTimeout(() => setShowA(true), 1300)
    const t2 = setTimeout(() => { setIdx(p => (p + 1) % LANG_CONVOS.length) }, 3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [idx])
  const convo = LANG_CONVOS[idx]
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
          transition={{ duration:0.22 }} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{convo.flag}</span>
            <span className="text-[9px] font-bold text-[#bbb]">{convo.lang}</span>
          </div>
          <div className="self-end bg-[#111] text-white text-[10px] px-2.5 py-1.5 rounded-2xl rounded-br-sm max-w-[180px] leading-relaxed">
            {convo.q}
          </div>
          <AnimatePresence>
            {showA && (
              <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                transition={{ duration:0.2 }}
                className="self-start bg-violet-50 text-violet-900 text-[10px] px-2.5 py-1.5 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed border border-violet-100">
                {convo.a}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── DEMO WIDGET ───────────────────────────────────────────────────────────
const GUIDE_ZONES = [
  { id:'entrada',  label:'Entrada',  color:'#7c3aed', bg:'#ede9ff', icon:<DoorOpen className="w-3.5 h-3.5"/>,       step:{ title:'Caja de llaves',    body:'Caja gris a la derecha de la puerta.\nCódigo: 4521 · Mantén pulsado 2 seg.' } },
  { id:'wifi',     label:'WiFi',     color:'#2563eb', bg:'#dbeafe', icon:<Wifi className="w-3.5 h-3.5"/>,           step:{ title:'Red y contraseña',   body:'Red: Itineramio_5G\nClave: balcon2024#' } },
  { id:'normas',   label:'Normas',   color:'#d97706', bg:'#fef3c7', icon:<FileText className="w-3.5 h-3.5"/>,       step:{ title:'Normas del apartamento',    body:'Check-out antes de las 11:00h.\nNo fumar en el interior.' } },
  { id:'parking',  label:'Parking',  color:'#059669', bg:'#d1fae5', icon:<Car className="w-3.5 h-3.5"/>,            step:{ title:'Aparcamiento',       body:'Plaza B-14 · Pase magnético en\nel cajón de la cocina (izquierda).' } },
  { id:'cocina',   label:'Cocina',   color:'#dc2626', bg:'#fee2e2', icon:<UtensilsCrossed className="w-3.5 h-3.5"/>,step:{ title:'Equipamiento',       body:'Cafetera, microondas, tostadora.\nEspecias básicas incluidas.' } },
  { id:'checkout', label:'Salida',   color:'#6b7280', bg:'#f3f4f6', icon:<LogOut className="w-3.5 h-3.5"/>,         step:{ title:'Check-out',          body:'Deja las llaves dentro y\ncierra con el código 4521.' } },
]

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
  const [step, setStep]     = useState(0)
  const [viewed, setViewed] = useState<Set<string>>(new Set())
  const s = SEQ[step % SEQ.length]

  useEffect(() => { if (step % SEQ.length === 0) setViewed(new Set()) }, [step])
  useEffect(() => { if (s.view==='zona' && s.zone && !s.click) setViewed(p => new Set([...p, s.zone!])) }, [s.view, s.zone, s.click])
  useEffect(() => { const t = setTimeout(() => setStep(p => (p+1)%SEQ.length), s.dur); return () => clearTimeout(t) }, [step, s.dur])

  const activeZone = GUIDE_ZONES.find(z => z.id===s.zone) ?? null

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow:'0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)' }}>
        {/* Browser chrome */}
        <div className="bg-[#ebebeb] px-4 py-2.5 flex items-center gap-3 border-b border-black/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"/><div className="w-3 h-3 rounded-full bg-[#ffbd2e]"/><div className="w-3 h-3 rounded-full bg-[#28c840]"/>
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-[#999] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#059669] inline-block shrink-0"/>app.itineramio.com/guide/barceloneta
          </div>
        </div>
        {/* App shell */}
        <div className="bg-[#f8f8f8] relative overflow-hidden" style={{ height:340 }}>
          <div className="absolute inset-0 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-black/[0.06] px-3.5 py-2.5 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-2">
                <img src="/isotipo-gradient.svg" alt="" width={16} height={9} className="object-contain shrink-0"/>
                <div>
                  <p className="text-[11px] font-semibold text-[#111] leading-none">Apartamento Barceloneta</p>
                  <p className="text-[9px] text-[#999] mt-0.5">Barcelona · 2 hab · 4 huéspedes</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">🇪🇸</span><span className="text-[11px] opacity-40">🇬🇧</span><span className="text-[11px] opacity-40">🇫🇷</span>
              </div>
            </div>
            {/* Sliding content */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {s.view==='zona' && activeZone ? (
                  <motion.div key={`zone-${activeZone.id}`} initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
                    transition={{ type:'spring', stiffness:400, damping:38 }} className="absolute inset-0 bg-white flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-black/[0.05] shrink-0">
                      <button className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <ChevronLeft className="w-3 h-3 text-[#555]"/>
                      </button>
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor:activeZone.bg, color:activeZone.color }}>{activeZone.icon}</div>
                      <p className="text-[11px] font-semibold text-[#111] flex-1 leading-none">{activeZone.label}</p>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-0.5"><Check className="w-2.5 h-2.5"/>Visto</span>
                    </div>
                    <div className="flex-1 p-3 overflow-hidden">
                      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
                        className="bg-white rounded-xl border border-black/[0.07] p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor:'#111' }}>1</div>
                          <p className="text-[11px] font-semibold text-[#111]">{activeZone.step.title}</p>
                        </div>
                        <p className="text-[10px] text-[#555] leading-relaxed whitespace-pre-line pl-7">{activeZone.step.body}</p>
                        <div className="mt-2.5 pl-7 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-green-500"/><span className="text-[9px] text-green-600 font-medium">Paso completado</span>
                        </div>
                      </motion.div>
                      <div className="mt-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-[8px] text-[#aaa]">Progreso</span>
                          <span className="text-[8px] font-medium" style={{ color:activeZone.color }}>1/1 pasos</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width:0 }} animate={{ width:'100%' }} transition={{ duration:0.6, delay:0.3, ease:'easeOut' }}
                            className="h-full rounded-full" style={{ backgroundColor:activeZone.color }}/>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : s.view!=='chat' ? (
                  <motion.div key="zone-grid" initial={{ x:'-30%', opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:'-30%', opacity:0 }}
                    transition={{ type:'spring', stiffness:400, damping:38 }} className="absolute inset-0 p-3 flex flex-col gap-2.5 bg-[#f8f8f8]">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#bbb]">Manual de la propiedad</p>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      {GUIDE_ZONES.map(z => {
                        const isViewed  = viewed.has(z.id)
                        const isHovered = s.view==='guide' && s.zone===z.id
                        return (
                          <motion.div key={z.id}
                            animate={isHovered ? { scale:1.05, borderColor:z.color, boxShadow:`0 4px 12px ${z.color}22` } : { scale:1, borderColor:'rgba(0,0,0,0.07)', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}
                            transition={{ type:'spring', stiffness:400, damping:28 }}
                            className="bg-white rounded-xl border p-2 flex flex-col gap-1.5 cursor-default">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor:z.bg, color:z.color }}>{z.icon}</div>
                            <p className="text-[9px] font-semibold text-[#111] leading-tight">{z.label}</p>
                            {isViewed
                              ? <span className="text-[8px] text-green-600 font-medium flex items-center gap-0.5"><Check className="w-2 h-2"/>Visto</span>
                              : <span className="text-[8px] text-[#ccc]">Ver →</span>}
                          </motion.div>
                        )
                      })}
                    </div>
                    <div className="shrink-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-[8px] text-[#aaa]">Guía leída</span>
                        <span className="text-[8px] font-semibold text-[#7c3aed]">{viewed.size}/6</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div animate={{ width:`${(viewed.size/6)*100}%` }} transition={{ duration:0.5, ease:'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"/>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            {/* Chat FAB */}
            <AnimatePresence>
              {s.view!=='chat' && (
                <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }}
                  transition={{ type:'spring', stiffness:300, damping:22 }} className="absolute bottom-3 right-3 z-20">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg relative"
                    style={{ background:'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <Bot className="w-4 h-4 relative z-10"/>
                    <motion.div animate={{ scale:[1,1.7], opacity:[0.25,0] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeOut' }}
                      className="absolute inset-0 rounded-2xl bg-violet-400"/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Chat panel */}
          <AnimatePresence>
            {s.view==='chat' && (
              <motion.div key="chat" initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
                transition={{ type:'spring', stiffness:340, damping:34 }} className="absolute inset-0 flex flex-col bg-white z-30">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 shrink-0"
                  style={{ background:'linear-gradient(135deg, #18181b, #27272a)' }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor:'rgba(124,58,237,0.3)' }}>
                    <Bot className="w-3.5 h-3.5 text-violet-300"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-white leading-none">Asistente IA</p>
                    <p className="text-[9px] text-green-400 font-medium mt-0.5">● En línea · Barceloneta</p>
                  </div>
                  <div className="flex gap-1"><span className="text-[10px]">🇪🇸</span><span className="text-[10px] opacity-50">🇬🇧</span><span className="text-[10px] opacity-50">🇫🇷</span></div>
                </div>
                <div className="flex-1 px-3 py-3 flex flex-col justify-end gap-2.5 overflow-hidden">
                  <AnimatePresence>
                    {s.msg===0 && (
                      <motion.div key="sugg" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-1.5">
                        <p className="text-[8px] uppercase tracking-[0.15em] text-[#bbb] font-semibold">Preguntas frecuentes</p>
                        {['¿Cómo accedo al apartamento?','¿Cuál es la clave del WiFi?','¿A qué hora es el check-out?'].map((q,i) => (
                          <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-black/[0.06] bg-gray-50 text-[10px] text-[#444] cursor-default">
                            <MessageCircle className="w-2.5 h-2.5 text-[#bbb] shrink-0"/>{q}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg>=1 && (
                      <motion.div key="umsg" initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} className="self-end">
                        <div className="bg-[#111] text-white text-[10px] px-3 py-2 rounded-2xl rounded-br-sm max-w-[160px] leading-relaxed">
                          ¿Cómo entro? No encuentro las llaves 🤔
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg===2 && (
                      <motion.div key="typing" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="self-start">
                        <div className="bg-[#f5f3f0] px-3 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                          {[0,1,2].map(i => <motion.div key={i} animate={{ y:[0,-3,0] }} transition={{ repeat:Infinity, duration:0.65, delay:i*0.13 }} className="w-1.5 h-1.5 rounded-full bg-[#aaa]"/>)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg>=3 && (
                      <motion.div key="aresp" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }} className="self-start">
                        <div className="bg-[#f5f3f0] text-[#111] text-[10px] px-3 py-2 rounded-2xl rounded-bl-sm max-w-[210px] leading-relaxed">
                          ¡Hola! 👋 La caja está a la derecha de la puerta. Código: <strong>4521</strong>. Mantén pulsado 2 segundos y se abre.
                        </div>
                        <p className="text-[8px] text-[#ccc] mt-0.5 ml-1">Asistente IA · ahora</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg>=4 && (
                      <motion.div key="follow" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="self-start">
                        <div className="bg-[#f5f3f0] text-[#111] text-[10px] px-3 py-2 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed">
                          ¿Necesitas algo más? Tengo toda la info del apartamento 🏠
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="px-3 py-2.5 border-t border-black/[0.05] shrink-0">
                  <div className="bg-[#f5f3f0] rounded-full px-3 py-1.5 text-[9px] text-[#ccc]">Escribe en cualquier idioma…</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Cursor */}
          <motion.div animate={{ left:`${s.cx}%`, top:`${s.cy}%` }} transition={{ type:'spring', stiffness:180, damping:26 }}
            className="absolute pointer-events-none z-50" style={{ transform:'translate(-3px,-3px)' }}>
            <AnimatePresence>
              {s.click && (
                <motion.div key={`r-${step}`} initial={{ scale:0, opacity:0.5 }} animate={{ scale:2.8, opacity:0 }} transition={{ duration:0.38 }}
                  className="absolute w-6 h-6 rounded-full bg-violet-500/25 -translate-x-1/2 -translate-y-1/2" style={{ left:4, top:4 }}/>
              )}
            </AnimatePresence>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2.5 1.5L2.5 15.5L6 11.5L8.5 16.5L11 15.5L8.5 10.5H14L2.5 1.5Z" fill="#111" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      </div>
      {/* Badge */}
      <motion.div initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.9 }}
        className="absolute -left-12 top-14 hidden lg:flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-2.5" style={{ boxShadow:'0 8px 24px rgba(0,0,0,0.09)' }}>
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm">✓</div>
        <div><p className="text-xs font-semibold text-[#111]">Guía enviada</p><p className="text-[10px] text-[#aaa]">Reserva confirmada</p></div>
      </motion.div>
    </div>
  )
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function Landing3() {
  const [scrolled, setScrolled]           = useState(false)
  const [pastHero, setPastHero]           = useState(false)
  const [mob, setMob]                     = useState(false)
  const [faqOpen, setFaqOpen]             = useState<number|null>(null)
  const [beforeAfterTab, setBeforeAfterTab] = useState<'before'|'after'>('before')

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, -60])
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -30])

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20)
      setPastHero(window.scrollY > 600)
    }
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className={`${inter.className} ${manrope.variable} min-h-screen bg-white text-[#111] overflow-x-hidden`}
      style={{ WebkitFontSmoothing:'antialiased' } as React.CSSProperties}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-transparent'}`}
        style={scrolled ? { boxShadow:'0 1px 0 rgba(0,0,0,0.06)' } : {}}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} className="object-contain"/>
            <span className="font-semibold text-[15px]">Itineramio</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['Cómo funciona','#how'],['Por qué funciona','#why'],['FAQ','#faq']].map(([l,h]) => (
              <a key={l} href={h} className="text-sm text-[#666] hover:text-[#111] transition-colors font-medium">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-[#666] hover:text-[#111] font-medium transition-colors">Entrar</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
              style={{ backgroundColor:'#7c3aed', boxShadow:'0 2px 12px rgba(124,58,237,0.3)' }}>
              Empieza gratis <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
            <button className="md:hidden p-1" onClick={() => setMob(!mob)}>
              {mob ? <X className="w-5 h-5"/> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mob && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              className="md:hidden bg-white border-t border-black/5 px-6 py-5 flex flex-col gap-5">
              {['Cómo funciona','Por qué funciona','FAQ'].map(l => <button key={l} className="text-sm text-[#666] text-left font-medium">{l}</button>)}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* CTA sticky móvil — aparece al pasar el hero */}
      <AnimatePresence>
        {pastHero && (
          <motion.div initial={{ y:-48, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:-48, opacity:0 }}
            transition={{ duration:0.28, ease:[0.25,0.1,0.25,1] }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 flex justify-center py-2 px-4 pointer-events-none">
            <Link href="/register" className="pointer-events-auto inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor:'#7c3aed', boxShadow:'0 4px 16px rgba(124,58,237,0.45)' }}>
              Empieza gratis <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden">
        {/* Fondo con orbs parallax */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div style={{ y: orb1Y, background:'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,58,237,0.11) 0%, transparent 70%)' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[65%]"/>
          <motion.div style={{ y: orb2Y, background:'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', borderRadius:'50%' }}
            className="absolute top-[35%] right-[5%] w-[500px] h-[500px]"/>
        </div>

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm text-violet-700 font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse"/>
          Para anfitriones con 6 a 10 apartamentos en España
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.15 }}
          className="leading-[1.05] tracking-tight mb-4 max-w-4xl"
          style={{ fontSize:'clamp(2.4rem, 6vw, 5rem)', fontFamily:'var(--font-manrope)' }}>
          <span className="font-semibold text-[#111]">Los huéspedes no leen. </span>
          <span className="font-light text-[#aaa]">Y tú sigues enviando el mismo mensaje una y otra vez.</span>
        </motion.h1>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
          className="text-base font-normal text-[#555] mb-10 max-w-xl leading-relaxed">
          Crea una guía una vez y haz que se envíe automáticamente al confirmarse la reserva. Así llegan sabiendo cómo entrar, dónde aparcar y cuál es la clave del WiFi. Tú dejas de repetir lo mismo cada semana.
        </motion.p>

        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-3">
          <Link href="/register" className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base text-white transition-all"
            style={{ backgroundColor:'#7c3aed', boxShadow:'0 4px 20px rgba(124,58,237,0.35)' }}>
            Empieza gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 border border-black/10 text-[#666] hover:text-[#111] hover:border-black/20 px-8 py-4 rounded-full font-medium text-base transition-all">
            Ver demo
          </Link>
        </motion.div>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} className="text-sm text-[#bbb] mb-16">
          No necesitas tarjeta. Configúralo en 10 minutos.
        </motion.p>

        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.5 }} className="w-full px-4 lg:px-16">
          <DemoWidget/>
        </motion.div>
      </section>

      {/* ── TRUST BAR + LOGOS ── */}
      <section className="py-12 border-y border-black/[0.06]">
        <div className="max-w-4xl mx-auto px-6">
          {/* Trust badges */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            {[
              { icon:<Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"/>, text:'4,9★ valoración media' },
              { icon:<Check className="w-3.5 h-3.5 text-violet-600"/>, text:'Sin app, sin registro del huésped' },
              { icon:<MessageCircle className="w-3.5 h-3.5 text-violet-600"/>, text:'Chatbot en 3 idiomas incluido' },
            ].map((badge, i) => (
              <motion.div key={i} variants={fadeUp}
                className="flex items-center gap-2 text-sm text-[#555] font-medium">
                {badge.icon}
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
          <div className="max-w-sm mx-auto"><LogoCarousel/></div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-4">El producto</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.06] tracking-tight max-w-2xl"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Todo lo que necesita el huésped. </span>
              <span className="font-light text-[#aaa]">Sin que tú repitas nada.</span>
            </motion.h2>
          </motion.div>

          {/* Row 1: 2 big cards */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={cardStagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <motion.div variants={cardPop} whileHover={{ y:-4, boxShadow:'0 12px 40px rgba(0,0,0,0.08)', transition:{ duration:0.18 } }}
              className="rounded-[20px] overflow-hidden" style={{ backgroundColor:'#f5f3f0' }}>
              <div className="h-56 flex items-center justify-center px-8 pt-6 relative overflow-hidden">
                <ZonesCarousel/>
              </div>
              <div className="px-7 pb-7 pt-4">
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-violet-600 inline-block"/>Guía por zonas
                </p>
                <p className="text-[15px] text-[#555] leading-relaxed">Organiza la información en zonas: entrada, WiFi, normas, parking. El huésped encuentra lo que busca sin leer todo.</p>
              </div>
            </motion.div>

            <motion.div variants={cardPop} whileHover={{ y:-4, boxShadow:'0 12px 40px rgba(0,0,0,0.08)', transition:{ duration:0.18 } }}
              className="rounded-[20px] overflow-hidden" style={{ backgroundColor:'#f5f3f0' }}>
              <div className="h-56 flex items-end justify-center px-8 pt-8 relative overflow-hidden">
                <InfiniteChat/>
              </div>
              <div className="px-7 pb-7 pt-4">
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-violet-600 inline-block"/>Chatbot IA
                </p>
                <p className="text-[15px] text-[#555] leading-relaxed">Responde las dudas del huésped en su idioma usando la información de tu propio apartamento. Tú no haces nada.</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Row 2: 3 smaller cards */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={cardStagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label:'Siempre accesible',
                body:'El huésped accede cuando quiere, desde el móvil, con un link o QR dentro del apartamento.',
                illustration: (
                  <div className="h-36 flex items-center justify-center px-6 pt-6">
                    <div className="flex flex-col gap-2 w-full max-w-[220px]">
                      {/* Link compartido */}
                      <div className="flex items-center gap-2 bg-white rounded-[12px] px-3 py-2.5" style={{ boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">🔗</div>
                        <div>
                          <p className="text-[10px] font-semibold text-[#111]">itineramio.com/guide/tu-apto</p>
                          <p className="text-[9px] text-[#aaa]">Comparte el link con el huésped</p>
                        </div>
                      </div>
                      {/* QR pulsante */}
                      <div className="flex items-center gap-2.5 bg-[#f5f3f0] rounded-[12px] px-3 py-2.5">
                        <motion.div
                          animate={{ scale:[1, 1.08, 1], opacity:[0.8, 1, 0.8] }}
                          transition={{ repeat:Infinity, duration:2, ease:'easeInOut' }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs bg-violet-100">
                          ◼
                        </motion.div>
                        <div>
                          <p className="text-[10px] font-semibold text-[#111]">QR en el apartamento</p>
                          <p className="text-[9px] text-[#aaa]">El huésped escanea y listo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                label:'Multi-idioma',
                body:'El chatbot detecta el idioma del huésped y responde en el suyo. Español, inglés, francés.',
                illustration: (
                  <div className="h-36 flex items-center justify-center px-6 pt-6">
                    <MultiLangChatMini/>
                  </div>
                ),
              },
              {
                label:'Sin app, sin descarga',
                body:'El huésped lo abre en el navegador del móvil. Sin instalar nada. Sin registro.',
                illustration: (
                  <div className="h-36 flex items-center justify-center px-6 pt-6">
                    <div className="w-full max-w-[200px] bg-white rounded-[14px] overflow-hidden" style={{ boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
                      <div className="bg-[#f5f3f0] px-2.5 py-1.5 flex items-center gap-1.5">
                        <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#ddd]"/>)}</div>
                        <div className="flex-1 bg-white rounded-full px-2 py-0.5 text-[8px] text-[#aaa] truncate">itineramio.com/guide/tu-apto</div>
                      </div>
                      <div className="p-2.5 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-violet-100"/>
                          <div className="h-2 bg-[#f0f0f0] rounded-full flex-1"/>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {['#ede9ff','#dbeafe','#d1fae5'].map((bg,i) => <div key={i} className="rounded-[6px] h-6" style={{ backgroundColor:bg }}/>)}
                        </div>
                        <div className="h-1.5 bg-[#f0f0f0] rounded-full w-3/4"/>
                      </div>
                    </div>
                  </div>
                ),
              },
            ].map((card, i) => (
              <motion.div key={i} variants={cardPop} whileHover={{ y:-4, boxShadow:'0 12px 40px rgba(0,0,0,0.08)', transition:{ duration:0.18 } }}
                className="rounded-[20px] overflow-hidden" style={{ backgroundColor:'#f5f3f0' }}>
                {card.illustration}
                <div className="px-5 pb-5 pt-3">
                  <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-violet-600 inline-block"/>{card.label}
                  </p>
                  <p className="text-[13px] text-[#555] leading-relaxed">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CASE STUDIES ── */}
      <section className="py-24 px-6" style={{ backgroundColor:'#f5f3f0' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-4">Resultados reales</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.06] tracking-tight max-w-2xl"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Anfitriones que ya lo usan. </span>
              <span className="font-light text-[#aaa]">Sus números hablan.</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={cardStagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CASE_STUDIES.map(cs => (
              <motion.div key={cs.id} variants={cardPop}
                whileHover={{ y:-4, boxShadow:'0 16px 48px rgba(0,0,0,0.10)', transition:{ duration:0.18 } }}
                className="rounded-[20px] overflow-hidden bg-white flex flex-col border border-black/[0.06]"
                style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="p-7 flex flex-col gap-5 flex-1">
                  {/* Host */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor:'#7c3aed' }}>
                      {cs.hostName.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#111]">{cs.hostName}</p>
                      <p className="text-[11px] text-[#aaa]">{cs.location} · {cs.properties} propiedades</p>
                    </div>
                  </div>
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {[cs.metric1, cs.metric2].map((m, i) => (
                      <div key={i} className="rounded-[14px] p-3.5" style={{ backgroundColor:'#f5f3f0' }}>
                        <p className="font-bold text-[#7c3aed] leading-none mb-1"
                          style={{ fontSize:'clamp(1.6rem, 3vw, 2.2rem)', fontFamily:'var(--font-manrope)' }}>
                          <CountUp to={m.to} suffix={m.suffix}/>
                        </p>
                        <p className="text-[11px] text-[#777] leading-snug">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Quote */}
                  <blockquote className="text-[14px] text-[#555] leading-relaxed italic border-l-2 border-violet-200 pl-4">
                    "{cs.quote}"
                  </blockquote>
                </div>
                {/* Highlight strip */}
                <div className="px-7 py-3 flex items-center gap-2" style={{ backgroundColor:'#7c3aed' }}>
                  <Star className="w-3.5 h-3.5 text-white fill-white shrink-0"/>
                  <p className="text-[12px] font-semibold text-white">{cs.highlight}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STAT BLOCKS ── */}
      <section id="why" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-4">Por qué funciona</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight max-w-2xl"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Los números </span>
              <span className="font-light text-[#aaa]">ya lo dicen.</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={cardStagger}
            className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {([
              { to:86,  suffix:'%',    label:'preguntas repetidas',      body:'WiFi, acceso, normas. Llegan resueltas antes de que el huésped aparezca.' },
              { to:0,   suffix:null,   label:'PDFs que alguien abre',    body:'Sin zonas ni estructura. Una guía web sí se abre de un vistazo en el móvil.', static:'0' },
              { to:94,  suffix:'%',    label:'usan WhatsApp en España',  body:'Tus huéspedes van a escribirte. La pregunta es si ya tienen la info antes.' },
              { to:10,  suffix:' min', label:'marcan la reseña',         body:'El check-in define el tono de toda la estancia. Empieza bien.' },
              { to:0,   suffix:null,   label:'noches de tensión evitadas', body:'El huésped que llega informado no llama a las 22:00 diciendo que no puede entrar.', static:'∞' },
            ] as Array<{ to:number; suffix:string|null; label:string; body:string; static?:string }>).map((item, i) => (
              <motion.div key={i} variants={popUp}
                whileHover={{ y:-4, transition:{ duration:0.18 } }}
                className="bg-white rounded-[20px] p-7 flex flex-col gap-3 border border-black/[0.06]"
                style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="font-bold text-[#7c3aed] leading-none"
                  style={{ fontSize:'clamp(2rem, 3.5vw, 2.8rem)', fontFamily:'var(--font-manrope)' }}>
                  {item.static ?? <CountUp to={item.to} suffix={item.suffix ?? ''}/>}
                </p>
                <p className="text-[12px] font-semibold text-[#111] leading-snug">{item.label}</p>
                <p className="text-[13px] text-[#777] leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA intermedio */}
          <motion.div initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white"
              style={{ backgroundColor:'#7c3aed', boxShadow:'0 4px 16px rgba(124,58,237,0.28)' }}>
              Ver cómo funciona <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <span className="text-sm text-[#bbb]">Sin tarjeta · Sin permanencia</span>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6" style={{ backgroundColor:'#f5f3f0' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">Cómo funciona</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Tres pasos. </span>
              <span className="font-light text-[#aaa]">Diez minutos.</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={cardStagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
            {[
              { n:'01', title:'Crea tu guía', body:'No tienes que montarlo todo. Empieza por la entrada. Si una parte genera tensión, suele ser esa. Añádela primero y deja lo demás para después.' },
              { n:'02', title:'Haz que se envíe automáticamente', body:'Cuando se confirma la reserva, el huésped lo recibe. Así llegáis los dos mucho mejor al check-in.' },
              { n:'03', title:'El huésped llega ubicado', body:'Ya llega más ubicado. Menos preguntas después. Menos caos al llegar. Todo más claro antes.' },
            ].map((s, i) => (
              <motion.div key={i} variants={cardPop} whileHover={{ y:-4, transition:{ duration:0.18 } }}
                className="rounded-[20px] p-8 flex flex-col gap-4 bg-white" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <span className="font-semibold text-[#111]/[0.06] leading-none select-none" style={{ fontSize:'4.5rem', fontFamily:'var(--font-manrope)' }}>{s.n}</span>
                <h3 className="text-[17px] font-semibold text-[#111]">{s.title}</h3>
                <p className="text-[15px] text-[#666] leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} className="flex flex-col items-start gap-2">
            <Link href="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white"
              style={{ backgroundColor:'#7c3aed' }}>
              Empieza gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <p className="text-sm text-[#bbb]">Check-in, WiFi y normas. Con eso ya puedes empezar.</p>
          </motion.div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">Antes y después</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Tu semana antes </span>
              <span className="font-light text-[#aaa]">y después.</span>
            </motion.h2>
          </motion.div>

          {/* Mobile tab switcher */}
          <div className="flex md:hidden justify-center mb-8">
            <div className="flex border border-black/[0.08] rounded-full p-1">
              {(['before','after'] as const).map(tab => (
                <button key={tab} onClick={() => setBeforeAfterTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${beforeAfterTab===tab ? 'bg-[#111] text-white' : 'text-[#999]'}`}>
                  {tab==='before' ? 'Antes' : 'Después'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arrow desktop */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-white border border-black/[0.08] items-center justify-center"
              style={{ boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
              <ArrowRight className="w-4 h-4 text-[#aaa]"/>
            </div>

            {/* ANTES */}
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              className={`bg-white rounded-[20px] overflow-hidden ${beforeAfterTab==='after' ? 'hidden md:block' : ''}`}
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Metric bar */}
              <div className="px-8 pt-6 pb-2">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex-1 h-1.5 bg-red-50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-200 rounded-full" style={{ width:'85%' }}/>
                  </div>
                  <span className="text-[11px] text-red-400 font-semibold whitespace-nowrap shrink-0">85% gestionando</span>
                </div>
              </div>
              <div className="px-8 pb-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999] font-semibold mb-6">Antes</p>
                <div className="space-y-3.5">
                  {[
                    'Envías el WiFi a cada huésped manualmente',
                    'Copias y pegas las instrucciones de acceso',
                    'Recibes el "no podemos entrar" a las 22:00',
                    'El huésped llega sin haber leído nada',
                    'Contestas las mismas preguntas en tres idiomas',
                    'La reseña de 4 estrellas llega sin aviso',
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity:0, x:-8 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
                      className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-[#e5e7eb] shrink-0 mt-0.5"/>
                      <span className="text-[14px] text-[#999] leading-snug">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* DESPUÉS */}
            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              className={`bg-white rounded-[20px] overflow-hidden ${beforeAfterTab==='before' ? 'hidden md:block' : ''}`}
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Metric bar animada */}
              <div className="px-8 pt-6 pb-2">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex-1 h-1.5 bg-green-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width:0 }}
                      whileInView={{ width:'15%' }}
                      viewport={{ once:true }}
                      transition={{ duration:1.2, delay:0.4, ease:'easeOut' }}
                      className="h-full bg-green-400 rounded-full"/>
                  </div>
                  <span className="text-[11px] text-green-600 font-semibold whitespace-nowrap shrink-0">15% gestionando</span>
                </div>
              </div>
              <div className="px-8 pb-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c3aed] font-semibold mb-6">Después</p>
                <div className="space-y-3.5">
                  {[
                    'La guía se envía sola cuando entra la reserva',
                    'El huésped llega sabiendo cómo entrar y aparcar',
                    'Las dudas las resuelve el chatbot en su idioma',
                    'Tú no repites nada',
                    'Menos llamadas tensas, menos mensajes nocturnos',
                    'El check-in empieza bien y la reseña lo nota',
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity:0, x:8 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
                      className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5"/>
                      <span className="text-[14px] text-[#333] leading-snug font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">

          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-10">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">FAQ</motion.p>
            <motion.h2 variants={fadeUp} className="font-semibold text-[#111] leading-tight"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              Lo que suelen preguntar.
            </motion.h2>
          </motion.div>

          {[
            { q:'¿Y si el huésped no abre la guía?', a:'La guía se envía antes de llegar, no dentro del apartamento. La tasa de apertura es mucho mayor cuando la reciben con la confirmación de reserva. Y dentro del apartamento, el QR está disponible como refuerzo.' },
            { q:'¿Es otro sistema que tengo que aprender?', a:'Empieza con tres secciones: entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Luego vas añadiendo si quieres.' },
            { q:'¿El huésped necesita descargar una app?', a:'No. Se abre en el navegador del móvil. Sin descarga. Sin registro.' },
            { q:'¿Y si el huésped habla otro idioma?', a:'La guía se traduce automáticamente. El chatbot detecta el idioma y responde en el suyo. Funciona en tres idiomas.' },
          ].map((faq, i) => (
            <motion.div key={i} initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
              className="border-t border-black/[0.08]">
              <button onClick={() => setFaqOpen(faqOpen===i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-7 text-left">
                <span className={`text-[16px] font-medium leading-snug transition-colors ${faqOpen===i ? 'text-violet-700' : 'text-[#111]'}`}>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#aaa] shrink-0 mt-0.5 transition-transform duration-200 ${faqOpen===i ? 'rotate-180' : ''}`}/>
              </button>
              <AnimatePresence initial={false}>
                {faqOpen===i && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }} className="overflow-hidden">
                    <p className="text-[15px] text-[#666] leading-relaxed pb-7">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          <div className="border-t border-black/[0.08]"/>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-36 px-6 overflow-hidden text-center" style={{ backgroundColor:'#f5f3f0' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)'}}/>
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="relative z-10 max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-6 font-medium">Tu próximo huésped ya tiene reserva</p>
          <h2 className="leading-[1.05] tracking-tight text-[#111] mb-5"
            style={{ fontSize:'clamp(2.2rem, 6vw, 4.8rem)', fontFamily:'var(--font-manrope)' }}>
            <span className="font-semibold">Ya empezaste tu guía. </span>
            <span className="font-light text-[#aaa]">Termínala antes de que llegue el próximo huésped.</span>
          </h2>
          <p className="text-[#666] text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            No hace falta dejarla perfecta. Empieza por lo básico: entrada, WiFi y normas. Ese primer paso ya te quita repeticiones y evita más de una duda de última hora.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon:<Check className="w-3.5 h-3.5 text-violet-600"/>, text:'Sin tarjeta de crédito' },
              { icon:<Check className="w-3.5 h-3.5 text-violet-600"/>, text:'Configúralo en 10 minutos' },
              { icon:<Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500"/>, text:'4,9★ valoración media' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[#555] text-sm font-medium">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <Link href="/register" className="group inline-flex items-center gap-3 bg-[#7c3aed] text-white px-10 py-5 rounded-full font-semibold text-lg transition-all"
            style={{ boxShadow:'0 4px 24px rgba(124,58,237,0.35)' }}>
            Empieza gratis <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform"/>
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/[0.06] py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-5">
                <img src="/isotipo-gradient.svg" alt="Itineramio" width={24} height={14} className="object-contain"/>
                <span className="font-semibold text-sm">Itineramio</span>
              </Link>
              <p className="text-[#aaa] text-sm leading-relaxed">Guías digitales y chatbot IA para anfitriones con 6 o más propiedades en España.</p>
            </div>
            {[
              { title:'Producto', links:['Funcionalidades','Precios','Demo','Integraciones'] },
              { title:'Recursos', links:['Blog','Guía de inicio','FAQ','Contacto'] },
              { title:'Legal',    links:['Privacidad','Términos','Cookies'] },
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
