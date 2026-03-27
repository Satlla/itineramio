'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronLeft, Wifi, DoorOpen, MessageCircle, X, Bot, Car, FileText, UtensilsCrossed, Check, LogOut, XCircle, CheckCircle2, LogIn, Flame, ClipboardList, Wind, RotateCcw, Timer, Compass, Coffee } from 'lucide-react'
import { Inter, Manrope } from 'next/font/google'

const inter   = Inter({ subsets: ['latin'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], weight: ['300','400','600','700','800'], display: 'swap', variable: '--font-manrope' })

// ─── VARIANTS ──────────────────────────────────────────────────────────────
const fadeUp  = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25,0.1,0.25,1] } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

// ─── COUNT-UP ──────────────────────────────────────────────────────────────
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref  = useRef<HTMLSpanElement>(null)
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
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#bbb] font-medium">Guests arrive from</p>
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

// ─── DEMO WIDGET ───────────────────────────────────────────────────────────
const GUIDE_ZONES = [
  { id:'entry',    label:'Entry',    icon:<DoorOpen className="w-3.5 h-3.5"/>,        step:{ title:'Lockbox',              body:'Grey box to the right of the door.\nCode: 4521 · Hold for 2 seconds.' } },
  { id:'wifi',     label:'WiFi',     icon:<Wifi className="w-3.5 h-3.5"/>,            step:{ title:'Network & password',    body:'Network: Itineramio_5G\nPassword: balcon2024#' } },
  { id:'rules',    label:'Rules',    icon:<FileText className="w-3.5 h-3.5"/>,        step:{ title:'House rules',           body:'Checkout before 11:00am.\nNo smoking inside.' } },
  { id:'parking',  label:'Parking',  icon:<Car className="w-3.5 h-3.5"/>,             step:{ title:'Parking',               body:'Space B-14 · Magnetic pass in\nthe kitchen drawer (left side).' } },
  { id:'kitchen',  label:'Kitchen',  icon:<UtensilsCrossed className="w-3.5 h-3.5"/>, step:{ title:'Equipment',             body:'Coffee maker, microwave, toaster.\nBasic spices included.' } },
  { id:'checkout', label:'Checkout', icon:<LogOut className="w-3.5 h-3.5"/>,          step:{ title:'Check-out',             body:'Leave keys inside and\nlock with code 4521.' } },
]

type SeqStep = { view:'guide'|'zona'|'chat'; zone:string|null; msg:number; cx:number; cy:number; click:boolean; dur:number }
const SEQ: SeqStep[] = [
  { view:'guide', zone:null,     msg:0, cx:50, cy:50, click:false, dur:900  },
  { view:'guide', zone:null,     msg:0, cx:17, cy:25, click:false, dur:550  },
  { view:'guide', zone:null,     msg:0, cx:17, cy:25, click:true,  dur:400  },
  { view:'zona',  zone:'entry',  msg:0, cx:17, cy:25, click:false, dur:1400 },
  { view:'zona',  zone:'entry',  msg:0, cx:10, cy:20, click:false, dur:500  },
  { view:'zona',  zone:'entry',  msg:0, cx:10, cy:20, click:true,  dur:400  },
  { view:'guide', zone:null,     msg:0, cx:10, cy:20, click:false, dur:400  },
  { view:'guide', zone:null,     msg:0, cx:50, cy:25, click:false, dur:500  },
  { view:'guide', zone:null,     msg:0, cx:50, cy:25, click:true,  dur:400  },
  { view:'zona',  zone:'wifi',   msg:0, cx:50, cy:25, click:false, dur:1200 },
  { view:'zona',  zone:'wifi',   msg:0, cx:10, cy:20, click:false, dur:500  },
  { view:'zona',  zone:'wifi',   msg:0, cx:10, cy:20, click:true,  dur:400  },
  { view:'guide', zone:null,     msg:0, cx:10, cy:20, click:false, dur:400  },
  { view:'guide', zone:null,     msg:0, cx:17, cy:46, click:false, dur:500  },
  { view:'guide', zone:null,     msg:0, cx:17, cy:46, click:true,  dur:400  },
  { view:'zona',  zone:'parking',msg:0, cx:17, cy:46, click:false, dur:1100 },
  { view:'zona',  zone:'parking',msg:0, cx:10, cy:20, click:false, dur:500  },
  { view:'zona',  zone:'parking',msg:0, cx:10, cy:20, click:true,  dur:400  },
  { view:'guide', zone:null,     msg:0, cx:10, cy:20, click:false, dur:400  },
  { view:'guide', zone:null,     msg:0, cx:87, cy:87, click:false, dur:600  },
  { view:'guide', zone:null,     msg:0, cx:87, cy:87, click:true,  dur:400  },
  { view:'chat',  zone:null,     msg:0, cx:87, cy:87, click:false, dur:700  },
  { view:'chat',  zone:null,     msg:1, cx:87, cy:87, click:false, dur:900  },
  { view:'chat',  zone:null,     msg:2, cx:87, cy:87, click:false, dur:1200 },
  { view:'chat',  zone:null,     msg:3, cx:87, cy:87, click:false, dur:2500 },
  { view:'chat',  zone:null,     msg:4, cx:87, cy:87, click:false, dur:1500 },
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
                  <p className="text-[11px] font-semibold text-[#111] leading-none">Barceloneta Apartment</p>
                  <p className="text-[9px] text-[#999] mt-0.5">Barcelona · 2 bed · 4 guests</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] opacity-40">🇪🇸</span><span className="text-[11px]">🇬🇧</span><span className="text-[11px] opacity-40">🇫🇷</span>
              </div>
            </div>
            {/* Sliding content */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {s.view==='zona' && activeZone ? (
                  <motion.div key={`zone-${activeZone.id}`} initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
                    transition={{ duration:0.28, ease:[0.25,0.1,0.25,1] }} className="absolute inset-0 bg-white flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-black/[0.05] shrink-0">
                      <button className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <ChevronLeft className="w-3 h-3 text-[#555]"/>
                      </button>
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-[#555]" style={{ backgroundColor:'#f0efed' }}>{activeZone.icon}</div>
                      <p className="text-[11px] font-semibold text-[#111] flex-1 leading-none">{activeZone.label}</p>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full text-[#555] flex items-center gap-0.5" style={{ backgroundColor:'rgba(0,0,0,0.05)' }}><Check className="w-2.5 h-2.5"/>Viewed</span>
                    </div>
                    <div className="flex-1 p-3 overflow-hidden">
                      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
                        className="bg-white rounded-xl border border-black/[0.07] p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor:'#111' }}>1</div>
                          <p className="text-[11px] font-semibold text-[#111]">{activeZone.step.title}</p>
                        </div>
                        <p className="text-[10px] text-[#555] leading-relaxed whitespace-pre-line pl-7">{activeZone.step.body}</p>
                        <div className="mt-2.5 pl-7 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-[#555]"/><span className="text-[9px] text-[#555] font-medium">Step completed</span>
                        </div>
                      </motion.div>
                      <div className="mt-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-[8px] text-[#aaa]">Progress</span>
                          <span className="text-[8px] font-medium text-[#555]">1/1 steps</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width:0 }} animate={{ width:'100%' }} transition={{ duration:0.6, delay:0.3, ease:'easeOut' }}
                            className="h-full rounded-full bg-[#7c3aed]"/>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : s.view!=='chat' ? (
                  <motion.div key="zone-grid" initial={{ x:'-30%', opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:'-30%', opacity:0 }}
                    transition={{ duration:0.28, ease:[0.25,0.1,0.25,1] }} className="absolute inset-0 p-3 flex flex-col gap-2.5 bg-[#f8f8f8]">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#bbb]">Property guide</p>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      {GUIDE_ZONES.map(z => {
                        const isViewed  = viewed.has(z.id)
                        const isHovered = s.view==='guide' && s.zone===z.id
                        return (
                          <motion.div key={z.id}
                            animate={isHovered ? { scale:1.03, borderColor:'rgba(0,0,0,0.15)', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' } : { scale:1, borderColor:'rgba(0,0,0,0.07)', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}
                            transition={{ duration:0.2, ease:'easeOut' }}
                            className="bg-white rounded-xl border p-2 flex flex-col gap-1.5 cursor-default">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[#555]" style={{ backgroundColor:'#f0efed' }}>{z.icon}</div>
                            <p className="text-[9px] font-semibold text-[#111] leading-tight">{z.label}</p>
                            {isViewed
                              ? <span className="text-[8px] text-[#555] font-medium flex items-center gap-0.5"><Check className="w-2 h-2"/>Viewed</span>
                              : <span className="text-[8px] text-[#ccc]">See →</span>}
                          </motion.div>
                        )
                      })}
                    </div>
                    <div className="shrink-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-[8px] text-[#aaa]">Guide viewed</span>
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
                  transition={{ duration:0.2, ease:'easeOut' }} className="absolute bottom-3 right-3 z-20">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg relative"
                    style={{ background:'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <Bot className="w-4 h-4 relative z-10"/>
                    <motion.div animate={{ scale:[1,1.8], opacity:[0.3,0] }} transition={{ repeat:Infinity, duration:2, ease:'easeOut' }}
                      className="absolute inset-0 rounded-2xl bg-violet-400"/>
                    <motion.div animate={{ scale:[1,2.4], opacity:[0.15,0] }} transition={{ repeat:Infinity, duration:2, ease:'easeOut', delay:0.7 }}
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
                transition={{ duration:0.28, ease:[0.25,0.1,0.25,1] }} className="absolute inset-0 flex flex-col bg-white z-30">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 shrink-0"
                  style={{ background:'linear-gradient(135deg, #18181b, #27272a)' }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor:'rgba(124,58,237,0.3)' }}>
                    <Bot className="w-3.5 h-3.5 text-violet-300"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-white leading-none">AI Assistant</p>
                    <p className="text-[9px] text-green-400 font-medium mt-0.5">● Online · Barceloneta</p>
                  </div>
                  <div className="flex gap-1"><span className="text-[10px] opacity-50">🇪🇸</span><span className="text-[10px]">🇬🇧</span><span className="text-[10px] opacity-50">🇫🇷</span></div>
                </div>
                <div className="flex-1 px-3 py-3 flex flex-col justify-end gap-2.5 overflow-hidden">
                  <AnimatePresence>
                    {s.msg===0 && (
                      <motion.div key="sugg" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-1.5">
                        <p className="text-[8px] uppercase tracking-[0.15em] text-[#bbb] font-semibold">Common questions</p>
                        {['How do I get in?','What\'s the WiFi password?','What time is checkout?'].map((q,i) => (
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
                          How do I get in? Can&apos;t find the keys 🤔
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
                          Hi! 👋 The lockbox is to the right of the door. Code: <strong>4521</strong>. Hold for 2 seconds and it opens.
                        </div>
                        <p className="text-[8px] text-[#ccc] mt-0.5 ml-1">AI Assistant · just now</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {s.msg>=4 && (
                      <motion.div key="follow" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="self-start">
                        <div className="bg-[#f5f3f0] text-[#111] text-[10px] px-3 py-2 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed">
                          Need anything else? I have all the property info 🏠
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="px-3 py-2.5 border-t border-black/[0.05] shrink-0">
                  <div className="bg-[#f5f3f0] rounded-full px-3 py-1.5 text-[9px] text-[#ccc]">Type in any language…</div>
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
        <div><p className="text-xs font-semibold text-[#111]">Guide sent</p><p className="text-[10px] text-[#aaa]">Booking confirmed</p></div>
      </motion.div>
    </div>
  )
}

// ─── ZONES CAROUSEL ─────────────────────────────────────────────────────────
const ALL_ZONE_SETS_EN = [
  [
    { label:'Check-in',    icon:<LogIn className="w-4 h-4"/> },
    { label:'Check-out',   icon:<LogOut className="w-4 h-4"/> },
    { label:'WiFi',        icon:<Wifi className="w-4 h-4"/> },
    { label:'House Rules', icon:<ClipboardList className="w-4 h-4"/> },
    { label:'Parking',     icon:<Car className="w-4 h-4"/> },
    { label:'A/C',         icon:<Wind className="w-4 h-4"/> },
  ],
  [
    { label:'Cooktop',      icon:<Flame className="w-4 h-4"/> },
    { label:'Washer',       icon:<RotateCcw className="w-4 h-4"/> },
    { label:'Microwave',    icon:<Timer className="w-4 h-4"/> },
    { label:'Restaurants',  icon:<UtensilsCrossed className="w-4 h-4"/> },
    { label:'What to See',  icon:<Compass className="w-4 h-4"/> },
    { label:'Coffee Shops', icon:<Coffee className="w-4 h-4"/> },
  ],
]

function ZonesCarousel({ sets }: { sets: {label:string; icon:React.ReactNode}[][] }) {
  const [page, setPage] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPage(p => (p + 1) % sets.length), 2800)
    return () => clearInterval(t)
  }, [sets.length])
  return (
    <div className="w-full max-w-[280px]">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={page}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="grid grid-cols-3 gap-2">
            {sets[page].map((z) => (
              <div key={z.label} className="rounded-[14px] p-3 flex flex-col items-center justify-center gap-1.5 aspect-square" style={{ backgroundColor:'#f0efed' }}>
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#555]" style={{ backgroundColor:'rgba(0,0,0,0.04)' }}>
                  {z.icon}
                </div>
                <span className="text-[10px] font-semibold text-[#555] text-center leading-tight">{z.label}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {sets.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i === page ? 'w-4 h-1.5 bg-violet-600' : 'w-1.5 h-1.5 bg-black/10'}`}/>
        ))}
      </div>
    </div>
  )
}

// ─── INFINITE CHAT ──────────────────────────────────────────────────────────
const CHAT_CONVOS_EN = [
  { q:"What's the WiFi password? 🤔",           a:'Network: Itineramio_5G · Password: balcon2024# 🙌' },
  { q:'What time is checkout?',                  a:'Checkout is at 11:00am. Leave the keys inside. See you! 👋' },
  { q:"How do I get in? Can't find the keys",    a:'Grey box right of the door. Code: 4521, hold 2 sec. 🔐' },
  { q:'Where can I park?',                       a:'Space B-14 · Magnetic pass in the kitchen drawer (left). 🚗' },
]

function InfiniteChat({ convos }: { convos: {q:string; a:string}[] }) {
  const [idx, setIdx] = useState(0)
  const [stage, setStage] = useState<'q'|'typing'|'a'|'pause'>('q')
  useEffect(() => {
    const delays = { q:900, typing:850, a:2600, pause:300 }
    const next   = { q:'typing' as const, typing:'a' as const, a:'pause' as const, pause:'q' as const }
    const t = setTimeout(() => {
      if (stage === 'pause') setIdx(p => (p + 1) % convos.length)
      setStage(next[stage])
    }, delays[stage])
    return () => clearTimeout(t)
  }, [stage, idx, convos.length])
  const convo = convos[idx]
  return (
    <div className="w-full max-w-[300px] bg-white rounded-t-[16px] p-4 flex flex-col gap-2.5" style={{ boxShadow:'0 -4px 24px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 pb-2 border-b border-black/[0.05]">
        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center"><Bot className="w-3 h-3 text-violet-600"/></div>
        <span className="text-[11px] font-semibold text-[#111]">AI Assistant</span>
        <span className="ml-auto text-[9px] text-green-500 font-medium">● Online</span>
      </div>
      <div className="flex flex-col gap-2 min-h-[80px] justify-end">
        <AnimatePresence mode="wait">
          <motion.div key={`q-${idx}`} initial={{ opacity:0, y:6, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
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
            <motion.div key={`a-${idx}`} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
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
const LANG_CONVOS = [
  { flag:'🇬🇧', lang:'EN', q:"What's the WiFi password?",   a:'Network: Itineramio_5G · Password: balcon2024# 🙌' },
  { flag:'🇪🇸', lang:'ES', q:'¿A qué hora es el checkout?',  a:'El checkout es a las 11:00h. ¡Hasta pronto! 👋' },
  { flag:'🇫🇷', lang:'FR', q:"C'est quoi le WiFi?",           a:'Réseau: Itineramio_5G · Mdp: balcon2024# 🙌' },
]

function MultiLangChatMini() {
  const [idx, setIdx] = useState(0)
  const [showA, setShowA] = useState(false)
  useEffect(() => {
    setShowA(false)
    const t1 = setTimeout(() => setShowA(true), 1300)
    const t2 = setTimeout(() => setIdx(p => (p + 1) % LANG_CONVOS.length), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [idx])
  const convo = LANG_CONVOS[idx]
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
          transition={{ duration:0.22 }} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{convo.flag}</span>
            <span className="text-[9px] font-bold text-[#bbb]">{convo.lang}</span>
          </div>
          <div className="self-end bg-[#111] text-white text-[10px] px-2.5 py-1.5 rounded-2xl rounded-br-sm max-w-[180px] leading-relaxed">{convo.q}</div>
          <AnimatePresence>
            {showA && (
              <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                transition={{ duration:0.2 }}
                className="self-start bg-[#f5f3f0] text-[#111] text-[10px] px-2.5 py-1.5 rounded-2xl rounded-bl-sm max-w-[200px] leading-relaxed border border-black/[0.05]">
                {convo.a}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function Landing2En() {
  const [scrolled, setScrolled]             = useState(false)
  const [mob, setMob]                       = useState(false)
  const [faqOpen, setFaqOpen]               = useState<number|null>(null)
  const [beforeAfterTab, setBeforeAfterTab] = useState<'before'|'after'>('before')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
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
            {[['How it works','#how'],['Why it works','#why'],['FAQ','#faq']].map(([l,h]) => (
              <a key={l} href={h} className="text-sm text-[#666] hover:text-[#111] transition-colors font-medium">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-[#666] hover:text-[#111] font-medium transition-colors">Log in</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
              style={{ backgroundColor:'#7c3aed', boxShadow:'0 2px 12px rgba(124,58,237,0.3)' }}>
              Start free <ArrowRight className="w-3.5 h-3.5"/>
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
              {['How it works','Why it works','FAQ'].map(l => <button key={l} className="text-sm text-[#666] text-left font-medium">{l}</button>)}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── SECTION 1: HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div animate={{ opacity:[0.6,1,0.6], scale:[0.97,1.03,0.97] }} transition={{ repeat:Infinity, duration:6, ease:'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[60%]"
            style={{ background:'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%)' }}/>
          <motion.div animate={{ scale:[1,1.6,1], opacity:[0.12,0,0.12] }} transition={{ repeat:Infinity, duration:5, ease:'easeInOut' }}
            className="absolute top-[28%] left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/30"/>
          <motion.div animate={{ scale:[1,1.6,1], opacity:[0.06,0,0.06] }} transition={{ repeat:Infinity, duration:5, ease:'easeInOut', delay:2.5 }}
            className="absolute top-[28%] left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/20"/>
        </div>

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm text-violet-700 font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse"/>
          For hosts with 6 to 10 properties in Spain
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          className="leading-[1.05] tracking-tight mb-4 max-w-4xl"
          style={{ fontSize:'clamp(2.4rem, 6vw, 5rem)', fontFamily:'var(--font-manrope)' }}>
          <span className="font-semibold text-[#111]">Guests don&apos;t read. </span>
          <span className="font-light text-[#aaa]">And you keep sending the same message over and over again.</span>
        </motion.h1>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          className="text-base font-normal text-[#555] mb-10 max-w-xl leading-relaxed">
          Create a guide once and have it sent automatically when a booking is confirmed. They arrive already knowing how to get in, where to park, and what the WiFi password is. You stop repeating yourself every week.
        </motion.p>

        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-3">
          <Link href="/register" className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base text-white transition-all"
            style={{ backgroundColor:'#7c3aed', boxShadow:'0 4px 20px rgba(124,58,237,0.35)' }}>
            Start free trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 border border-black/10 text-[#666] hover:text-[#111] hover:border-black/20 px-8 py-4 rounded-full font-medium text-base transition-all">
            See demo
          </Link>
        </motion.div>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }} className="text-sm text-[#bbb] mb-16">
          No card needed. Set it up in 10 minutes.
        </motion.p>

        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.5 }} className="w-full px-4 lg:px-16">
          <DemoWidget/>
        </motion.div>
      </section>

      {/* ── LOGOS ── */}
      <section className="py-12 border-y border-black/[0.06]">
        <div className="max-w-sm mx-auto"><LogoCarousel/></div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-4">The product</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.06] tracking-tight max-w-2xl"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Everything the guest needs. </span>
              <span className="font-light text-[#aaa]">Without you repeating anything.</span>
            </motion.h2>
          </motion.div>

          {/* Row 1: 2 big cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            {/* Card 1: Zone guide */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.05 }}
              className="rounded-[20px] overflow-hidden" style={{ backgroundColor:'#f5f3f0' }}>
              {/* Illustration: zones carousel */}
              <div className="h-56 flex items-center justify-center px-8 pt-6 relative overflow-hidden">
                <ZonesCarousel sets={ALL_ZONE_SETS_EN} />
              </div>
              <div className="px-7 pb-7 pt-4">
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-violet-600 inline-block"/>
                  Zone guide
                </p>
                <p className="text-[15px] text-[#555] leading-relaxed font-normal">
                  Organize information by zones: entry, WiFi, house rules, parking. The guest finds what they need without reading everything.
                </p>
              </div>
            </motion.div>

            {/* Card 2: AI Chatbot */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
              className="rounded-[20px] overflow-hidden" style={{ backgroundColor:'#f5f3f0' }}>
              {/* Illustration: infinite chat loop */}
              <div className="h-56 flex items-end justify-center px-8 pt-8 relative overflow-hidden">
                <InfiniteChat convos={CHAT_CONVOS_EN} />
              </div>
              <div className="px-7 pb-7 pt-4">
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-violet-600 inline-block"/>
                  AI Chatbot
                </p>
                <p className="text-[15px] text-[#555] leading-relaxed font-normal">
                  Answers guest questions in their language using your property&apos;s own information. You do nothing.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Row 2: 2 smaller cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Card 4: Multi-language */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.17 }}
              className="rounded-[20px] overflow-hidden" style={{ backgroundColor:'#f5f3f0' }}>
              <div className="h-36 flex items-center justify-center px-6 pt-6">
                <MultiLangChatMini />
              </div>
              <div className="px-5 pb-5 pt-3">
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-violet-600 inline-block"/>
                  Multi-language
                </p>
                <p className="text-[13px] text-[#555] leading-relaxed font-normal">
                  The chatbot detects the guest&apos;s language and responds in theirs. Spanish, English, French.
                </p>
              </div>
            </motion.div>

            {/* Card 5: No app */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.22 }}
              className="rounded-[20px] overflow-hidden" style={{ backgroundColor:'#f5f3f0' }}>
              <div className="h-36 flex items-center justify-center px-6 pt-6">
                <div className="w-full max-w-[200px] bg-white rounded-[14px] overflow-hidden"
                  style={{ boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
                  <div className="bg-[#f5f3f0] px-2.5 py-1.5 flex items-center gap-1.5">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#ddd]"/>)}
                    </div>
                    <div className="flex-1 bg-white rounded-full px-2 py-0.5 text-[8px] text-[#aaa] truncate">
                      itineramio.com/guide/your-place
                    </div>
                  </div>
                  <div className="p-2.5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-violet-100"/>
                      <div className="h-2 bg-[#f0f0f0] rounded-full flex-1"/>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {['#f0efed','#e8e6e3','#ebebeb'].map((bg,i) => (
                        <div key={i} className="rounded-[6px] h-6" style={{ backgroundColor: bg }}/>
                      ))}
                    </div>
                    <div className="h-1.5 bg-[#f0f0f0] rounded-full w-3/4"/>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 pt-3">
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-violet-600 inline-block"/>
                  No app, no download
                </p>
                <p className="text-[13px] text-[#555] leading-relaxed font-normal">
                  The guest opens it in their mobile browser. No install. No sign-up.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SECTION 2: PROBLEM VALIDATION ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">The problem</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight mb-12"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">You already know this.</span>
            </motion.h2>
          </motion.div>

          <div className="space-y-8">
            {[
              'Some days you\'re not working as a host. You\'re working as a copy-paste machine. The same WiFi. The same entry instructions. The same house rules. Change the guest\'s name and repeat.',
              'I\'ve sent the WiFi password so many times I know it better than my own ID. If you manage multiple properties, you know what it\'s like to repeat WiFi, house rules, and access info every single day.',
              'Having guests isn\'t exhausting. Answering the same thing twenty times is. Where to get in. Where to park. What\'s the password. What to do at checkout. It\'s not the work that burns you out. It\'s the repetition.',
              'The worst message isn\'t a complaint. It\'s this one: "we can\'t get in." It usually arrives when you\'re having dinner, driving, or in the middle of another check-in.',
              'If your phone runs your life, you already know what this is about. WhatsApp, Airbnb, Booking, calls, check-in notes, repeated questions. You don\'t need another chat. You need guests to arrive already knowing the basics.',
              'A 4-star review because of confusion hurts more than a broken appliance. Not because it\'s "serious" — but because you know it was avoidable.',
              'My breaking point wasn\'t a guest. It was the sixth property. With 2 or 3 apartments you manage. With 6, 7, or 8 — you don\'t. You start living between messages, access issues, questions, and reviews. That\'s where stopping everything manually stops being a convenience and becomes a necessity.',
            ].map((text, i) => (
              <motion.p key={i} initial={{ opacity:0, x:-16 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                className="text-[17px] text-[#333] leading-relaxed font-normal">
                {text}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE SHIFT ── */}
      <section className="py-24 px-6" style={{ backgroundColor:'#f5f3f0' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">The solution</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight mb-10"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">When the guest arrives already informed, </span>
              <span className="font-light text-[#aaa]">you can tell from minute one.</span>
            </motion.h2>
          </motion.div>

          <div className="space-y-5">
            {[
              'Fewer questions. Fewer interruptions. Fewer last-minute messages.',
              'The difference isn\'t having another manual. It\'s having the guide sent automatically when the booking comes in, before the chaos starts.',
              'One guide. One automatic send. And suddenly you stop repeating yourself. Add the entry, WiFi, rules, and what matters. When the booking is confirmed, the guest gets it. You both show up to check-in in a much better state.',
            ].map((text, i) => (
              <motion.p key={i} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                className="text-[17px] text-[#333] leading-relaxed font-normal">
                {text}
              </motion.p>
            ))}
            <motion.p initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.3 }}
              className="text-[19px] font-semibold text-[#111] pt-2">
              One guide. One automatic send. That&apos;s the first real change.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── STAT BLOCKS ── */}
      <section id="why" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">Why it works</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight max-w-2xl"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">The numbers </span>
              <span className="font-light text-[#aaa]">already say it.</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { stat:'86%', label:'of questions repeat in every booking', body:'WiFi. Entry. Rules. Parking. Checkout. Always the same ones. The difference is whether you answer them every time or whether they arrive already resolved before the guest shows up.' },
              { stat:'4.8★', label:'is what Superhost requires. Booking.com weighs recent reviews.', body:'A 4-star review from a confusing check-in brings down your average and your ranking. And the confusion almost always starts with a lack of information before arrival.' },
              { stat:'93.9%', label:'of mobile users in Spain use WhatsApp', body:'Your guests are going to message you there. The question isn\'t whether they\'ll contact you. It\'s whether they\'ll have the information before they need to ask.' },
              { stat:'0', label:'PDFs anyone opens on their phone', body:'No one opens a PDF on their phone. And if they do, they can\'t find what they\'re looking for because everything\'s together. No zones. No structure. No chatbot to answer questions.' },
              { stat:'1', label:'moment that defines the review: the first 10 minutes', body:'A check-in that starts with confusion rarely ends in 5 stars. It doesn\'t need to go wrong. It just needs to not go entirely right.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                whileHover={{ y:-3, transition:{ duration:0.18 } }}
                className="bg-white rounded-[20px] p-8 flex flex-col gap-4 border border-black/[0.06]"
                style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="font-semibold text-[#7c3aed] leading-none" style={{ fontSize:'clamp(2rem, 4vw, 2.8rem)', fontFamily:'var(--font-manrope)' }}>
                  {item.stat}
                </p>
                <p className="text-[13px] font-semibold text-[#111] leading-snug">{item.label}</p>
                <p className="text-[14px] text-[#666] leading-relaxed font-normal">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6" style={{ backgroundColor:'#f5f3f0' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Three steps. </span>
              <span className="font-light text-[#aaa]">Ten minutes.</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
            {[
              { n:'01', title:'Create your guide', body:'You don\'t have to build it all. Start with the entry. If one part creates tension, it\'s usually that one. Add it first and leave the rest for later.' },
              { n:'02', title:'Have it sent automatically', body:'When the booking is confirmed, the guest gets it. You both show up to check-in in a much better state.' },
              { n:'03', title:'The guest arrives informed', body:'Already knows what to do. Fewer questions after. Less chaos at arrival. Everything clearer beforehand.' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y:-3, transition:{ duration:0.18 } }}
                className="rounded-[20px] p-8 flex flex-col gap-4 bg-white" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <span className="font-semibold text-[#111]/[0.06] leading-none select-none" style={{ fontSize:'4.5rem', fontFamily:'var(--font-manrope)' }}>{s.n}</span>
                <h3 className="text-[17px] font-semibold text-[#111]">{s.title}</h3>
                <p className="text-[15px] text-[#666] leading-relaxed font-normal">{s.body}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} className="flex flex-col items-start gap-2">
            <Link href="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-all"
              style={{ backgroundColor:'#7c3aed' }}>
              Start free trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <p className="text-sm text-[#bbb]">Entry, WiFi, and house rules. That&apos;s enough to start. You don&apos;t need to build the whole guide today.</p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 5: WHAT CHANGES ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-10">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">The real change</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight mb-8"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">What actually </span>
              <span className="font-light text-[#aaa]">changes.</span>
            </motion.h2>
          </motion.div>
          <div className="space-y-5">
            {[
              'Less copy-pasting gets old fast. Break out of that loop.',
              'When you activate the automatic send, the guest already gets the information before they arrive. This isn\'t theory. It\'s the moment you stop repeating yourself with every booking.',
              'The next check-in will be the same. Better to be ready for it. If the guest arrives not knowing how to get in, you\'re back in the same loop.',
            ].map((text, i) => (
              <motion.p key={i} initial={{ opacity:0, x:-12 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                className="text-[17px] text-[#333] leading-relaxed font-normal">{text}</motion.p>
            ))}
            <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.35 }}
              className="text-[19px] font-semibold text-[#111] pt-2">
              Get the basics in place before it happens again.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5B: BEFORE / AFTER ── */}
      <section className="py-24 px-6" style={{ backgroundColor:'#f5f3f0' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">Before and after</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">Your week before </span>
              <span className="font-light text-[#aaa]">and after.</span>
            </motion.h2>
          </motion.div>

          {/* Mobile tab switcher */}
          <div className="flex md:hidden justify-center mb-8">
            <div className="flex border border-black/[0.08] rounded-full p-1 bg-white">
              {(['before','after'] as const).map(tab => (
                <button key={tab} onClick={() => setBeforeAfterTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${beforeAfterTab===tab ? 'bg-[#111] text-white' : 'text-[#999]'}`}>
                  {tab==='before' ? 'Before' : 'After'}
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

            {/* BEFORE */}
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              className={`bg-white rounded-[20px] overflow-hidden ${beforeAfterTab==='after' ? 'hidden md:block' : ''}`}
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-8 pt-6 pb-2">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex-1 h-1.5 bg-red-50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-200 rounded-full" style={{ width:'85%' }}/>
                  </div>
                  <span className="text-[11px] text-red-400 font-semibold whitespace-nowrap shrink-0">85% managing</span>
                </div>
              </div>
              <div className="px-8 pb-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999] font-semibold mb-6">Before</p>
                <div className="space-y-3.5">
                  {[
                    'You send the WiFi to every guest manually',
                    'You copy-paste access instructions every time',
                    'You get the "we can\'t get in" at 10pm',
                    'The guest arrives without having read anything',
                    'You answer the same questions in three languages',
                    'The 4-star review arrives without warning',
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

            {/* AFTER */}
            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              className={`bg-white rounded-[20px] overflow-hidden ${beforeAfterTab==='before' ? 'hidden md:block' : ''}`}
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
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
                  <span className="text-[11px] text-green-600 font-semibold whitespace-nowrap shrink-0">15% managing</span>
                </div>
              </div>
              <div className="px-8 pb-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c3aed] font-semibold mb-6">After</p>
                <div className="space-y-3.5">
                  {[
                    'The guide sends itself when the booking comes in',
                    'The guest arrives knowing how to get in and park',
                    'Questions are handled by the chatbot in their language',
                    'You repeat nothing',
                    'Fewer tense calls, fewer late-night messages',
                    'Check-in starts well and the review reflects it',
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

      {/* ── SECTION 5C: WHY THIS WORKS BETTER ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">Alternatives</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight max-w-2xl"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">What you&apos;ve already tried </span>
              <span className="font-light text-[#aaa]">(and why it wasn&apos;t enough).</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title:'Copy-pasting in WhatsApp or Airbnb', body:'The guest gets a long message among twenty others. They don\'t read it. You end up repeating it anyway. The problem isn\'t the channel. It\'s that a long message competes with everything else in their inbox.' },
              { title:'A PDF with the instructions', body:'No one opens a PDF on their phone. And if they do, they can\'t find what they\'re looking for because everything\'s together. No zones. No structure. No chatbot to answer questions.' },
              { title:'Airbnb\'s built-in guidebook', body:'Works for one property. Not for eight. It doesn\'t translate itself. It doesn\'t send automatically on confirmation. It has no chatbot. And it doesn\'t cover Booking.com.' },
              { title:'Do nothing and "it\'s fine"', body:'It\'s fine until it\'s not. One bad check-in, one 4-star review, and your ranking drops. Above 6 properties, "it\'s fine" is a bet you pay with your rating.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                className="rounded-[20px] p-7 border border-black/[0.07]" style={{ backgroundColor:'#f5f3f0' }}>
                <h3 className="text-[15px] font-semibold text-[#111] mb-3">{item.title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed font-normal">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ICP FILTER ── */}
      <section className="py-24 px-6" style={{ backgroundColor:'#0e0e0e' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div animate={{ opacity:[0.6,1,0.6] }} transition={{ repeat:Infinity, duration:4, ease:'easeInOut' }} className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.2) 0%, transparent 70%)' }}/>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="relative z-10">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#555] font-medium mb-5">Who it&apos;s for</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight text-white mb-10"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold">My breaking point wasn&apos;t a guest. </span>
              <span className="font-light" style={{ color:'#aaa' }}>It was the sixth property.</span>
            </motion.h2>
            <div className="space-y-4 text-left max-w-xl mx-auto mb-10">
              {[
                'With 2 or 3 apartments you manage. With 6, 7, or 8 — you don\'t. You start living between messages, access issues, questions, and reviews.',
                'That\'s where stopping everything manually stops being a convenience and becomes a necessity.',
                'With six properties, doing it manually dies. That\'s when the repetition, the messages, and the feeling of not keeping up start. If you\'ve crossed that point, you know.',
              ].map((text, i) => (
                <motion.p key={i} variants={fadeUp} className="text-[16px] text-[#999] leading-relaxed font-normal">{text}</motion.p>
              ))}
            </div>
            <motion.p variants={fadeUp} className="text-[20px] font-semibold text-white">
              If you&apos;re there, this message is going to feel very real.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 7: FAQ ── */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">FAQ</motion.p>
            <motion.h2 variants={fadeUp} className="font-semibold text-[#111] leading-tight"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              What people usually ask.
            </motion.h2>
          </motion.div>
          {[
            { q:'What if the guest doesn\'t open the guide?', a:'The guide is sent before arrival, not inside the property. Open rates are much higher when guests receive it with the booking confirmation. And inside the apartment, the QR code is available as backup.' },
            { q:'Is this another system I have to learn?', a:'Start with three sections: entry, WiFi, and house rules. In 10 minutes you have your first guide ready. Then you add more if you want.' },
            { q:'Does the guest need to download an app?', a:'No. It opens in the mobile browser. No download. No sign-up.' },
            { q:'What if the guest speaks another language?', a:'The guide is automatically translated. The chatbot detects the language and responds in theirs. Works in three languages.' },
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
                    <p className="text-[15px] text-[#666] leading-relaxed pb-7 font-normal">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          <div className="border-t border-black/[0.08]"/>
        </div>
      </section>

      {/* ── SECTION 8: LOSS FRAMING ── */}
      <section className="py-24 px-6" style={{ backgroundColor:'#f5f3f0' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] font-medium mb-5">The cost of doing nothing</motion.p>
            <motion.h2 variants={fadeUp} className="leading-[1.08] tracking-tight mb-10"
              style={{ fontSize:'clamp(1.9rem, 4vw, 3.2rem)', fontFamily:'var(--font-manrope)' }}>
              <span className="font-semibold text-[#111]">The cost of </span>
              <span className="font-light text-[#aaa]">doing nothing.</span>
            </motion.h2>
          </motion.div>
          <div className="space-y-5">
            {[
              'The next check-in will be the same. Better to be ready for it. If the guest arrives not knowing how to get in, you\'re back in the same loop.',
              'A 4-star review does hurt. Especially when you know it came from an avoidable mistake.',
              'Less risk at arrival. Protect your rating. Have the guest arrive more informed and stop gambling on every check-in.',
            ].map((text, i) => (
              <motion.p key={i} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                className="text-[17px] text-[#333] leading-relaxed font-normal">{text}</motion.p>
            ))}
            <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.35 }}
              className="text-[19px] font-semibold text-[#111] pt-2">
              Have the guest arrive more informed. Avoid the avoidable.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FINAL CTA ── */}
      <section className="relative py-36 px-6 overflow-hidden text-center" style={{ backgroundColor:'#0e0e0e' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.2) 0%, transparent 70%)'}}/>
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="relative z-10 max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#555] mb-6 font-medium">Your next guest already has a booking</p>
          <h2 className="leading-[1.05] tracking-tight text-white mb-5"
            style={{ fontSize:'clamp(2.2rem, 6vw, 4.8rem)', fontFamily:'var(--font-manrope)' }}>
            <span className="font-semibold">You already started your guide. </span>
            <span className="font-light" style={{ color:'#aaa' }}>Finish it before the next guest arrives.</span>
          </h2>
          <p className="text-[#666] text-lg mb-12 max-w-lg mx-auto leading-relaxed font-normal">
            It doesn&apos;t need to be perfect. Start with the basics: entry, WiFi, and house rules. That first step alone cuts out repetition and avoids more than one last-minute question.
          </p>
          <Link href="/register" className="group inline-flex items-center gap-3 bg-white text-[#111] px-10 py-5 rounded-full font-semibold text-lg hover:bg-violet-50 transition-all"
            style={{ boxShadow:'0 0 50px rgba(124,58,237,0.2)' }}>
            Start free trial <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform"/>
          </Link>
          <p className="mt-6 text-sm" style={{ color:'#444' }}>Entry, WiFi, and house rules. That&apos;s enough to start.</p>
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
              <p className="text-[#aaa] text-sm leading-relaxed">Digital guides and AI chatbot for hosts with 6 or more properties in Spain.</p>
            </div>
            {[
              { title:'Product', links:[
                { label:'Features',     href:'/en/features' },
                { label:'Pricing',      href:'/en/#pricing' },
                { label:'Demo',         href:'/demo' },
                { label:'Integrations', href:'/en/features#integrations' },
              ]},
              { title:'Resources', links:[
                { label:'Blog',            href:'/blog' },
                { label:'Getting started', href:'/bienvenido' },
                { label:'FAQ',             href:'/faq' },
                { label:'Contact',         href:'mailto:hola@itineramio.com' },
              ]},
              { title:'Legal', links:[
                { label:'Privacy', href:'/legal/privacy' },
                { label:'Terms',   href:'/legal/terms' },
                { label:'Cookies', href:'/legal/cookies' },
              ]},
            ].map(col => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#111] mb-5">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(item => <li key={item.label}><Link href={item.href} className="text-[#aaa] text-sm hover:text-[#111] transition-colors">{item.label}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-black/[0.05] pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#ccc] text-xs">©{new Date().getFullYear()} Itineramio. All rights reserved.</p>
            <p className="text-[#ccc] text-xs">Built for serious hosts · Spain 🇪🇸</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
