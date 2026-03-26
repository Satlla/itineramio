'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inter, Manrope } from 'next/font/google'
import {
  Home, MessageCircle, Star, Eye, Plus, Settings, LogOut,
  ChevronRight, MoreHorizontal, Wifi, DoorOpen, Car, FileText,
  TrendingUp, Users, Zap, Bell, Search, ArrowUpRight, Check,
  UtensilsCrossed, MapPin, Calendar, Bot
} from 'lucide-react'

const inter   = Inter({ subsets: ['latin'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], weight: ['300','400','600','700'], display: 'swap', variable: '--font-manrope' })

// ─── DATA ───────────────────────────────────────────────────────────────────
const PROPERTIES = [
  {
    id: '1',
    name: 'Apartamento Eixample',
    city: 'Barcelona',
    zones: 7,
    views: 1240,
    rating: 4.9,
    status: 'active',
    color: '#7c3aed',
    bg: '#ede9ff',
    nextCheckin: 'Hoy, 16:00',
    guest: 'Marie D.',
  },
  {
    id: '2',
    name: 'Loft Born',
    city: 'Barcelona',
    zones: 5,
    views: 890,
    rating: 4.8,
    status: 'active',
    color: '#2563eb',
    bg: '#dbeafe',
    nextCheckin: 'Mañana, 15:00',
    guest: 'Thomas K.',
  },
  {
    id: '3',
    name: 'Piso Gràcia',
    city: 'Barcelona',
    zones: 6,
    views: 670,
    rating: 4.7,
    status: 'active',
    color: '#059669',
    bg: '#d1fae5',
    nextCheckin: 'Jue, 14:00',
    guest: 'Ana P.',
  },
  {
    id: '4',
    name: 'Estudio Barceloneta',
    city: 'Barcelona',
    zones: 4,
    views: 320,
    rating: 4.6,
    status: 'draft',
    color: '#d97706',
    bg: '#fef3c7',
    nextCheckin: null,
    guest: null,
  },
]

const ACTIVITY = [
  { icon: <MessageCircle className="w-3.5 h-3.5"/>, color:'#7c3aed', text: 'Marie preguntó por el parking', prop: 'Eixample', time: 'hace 5 min', resolved: true },
  { icon: <Eye className="w-3.5 h-3.5"/>,           color:'#2563eb', text: 'Guía vista por Thomas K.', prop: 'Loft Born', time: 'hace 22 min', resolved: false },
  { icon: <Star className="w-3.5 h-3.5"/>,           color:'#f59e0b', text: 'Nueva reseña — 5 estrellas', prop: 'Piso Gràcia', time: 'hace 1h', resolved: false },
  { icon: <Check className="w-3.5 h-3.5"/>,          color:'#059669', text: 'Check-in completado', prop: 'Eixample', time: 'ayer', resolved: false },
  { icon: <MessageCircle className="w-3.5 h-3.5"/>, color:'#7c3aed', text: 'Pregunta resuelta por IA: WiFi', prop: 'Loft Born', time: 'ayer', resolved: true },
]

const STATS = [
  { label: 'Propiedades activas', value: '4', sub: '+1 este mes', icon: <Home className="w-4 h-4"/>, up: true },
  { label: 'Vistas este mes', value: '3.120', sub: '+18% vs anterior', icon: <Eye className="w-4 h-4"/>, up: true },
  { label: 'Preguntas resueltas IA', value: '86%', sub: 'Sin intervención tuya', icon: <Bot className="w-4 h-4"/>, up: true },
  { label: 'Valoración media', value: '4,8★', sub: 'Superhost activo', icon: <Star className="w-4 h-4"/>, up: true },
]

const NAV = [
  { icon: <Home className="w-4 h-4"/>,        label: 'Inicio',       active: true  },
  { icon: <MessageCircle className="w-4 h-4"/>, label: 'Mensajes',    active: false },
  { icon: <Calendar className="w-4 h-4"/>,    label: 'Reservas',     active: false },
  { icon: <TrendingUp className="w-4 h-4"/>,  label: 'Analítica',    active: false },
  { icon: <Users className="w-4 h-4"/>,       label: 'Huéspedes',    active: false },
  { icon: <Settings className="w-4 h-4"/>,    label: 'Configuración',active: false },
]

// ─── ZONE PILLS ─────────────────────────────────────────────────────────────
const ZONE_ICONS = [
  { icon: <DoorOpen className="w-3 h-3"/>,       label:'Entrada',  color:'#7c3aed', bg:'#ede9ff' },
  { icon: <Wifi className="w-3 h-3"/>,           label:'WiFi',     color:'#2563eb', bg:'#dbeafe' },
  { icon: <Car className="w-3 h-3"/>,            label:'Parking',  color:'#059669', bg:'#d1fae5' },
  { icon: <UtensilsCrossed className="w-3 h-3"/>,label:'Cocina',   color:'#dc2626', bg:'#fee2e2' },
  { icon: <FileText className="w-3 h-3"/>,       label:'Normas',   color:'#d97706', bg:'#fef3c7' },
  { icon: <MapPin className="w-3 h-3"/>,         label:'Barrio',   color:'#0891b2', bg:'#cffafe' },
]

// ─── PROPERTY CARD ──────────────────────────────────────────────────────────
function PropertyCard({ p, i }: { p: typeof PROPERTIES[0]; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
      whileHover={{ y:-2, transition:{ duration:0.15 } }}
      className="bg-white rounded-[20px] p-6 flex flex-col gap-4 cursor-pointer"
      style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
      onClick={() => setOpen(!open)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: p.bg, color: p.color }}>
            {p.name.charAt(0)}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#111] leading-tight">{p.name}</p>
            <p className="text-[11px] text-[#aaa] flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5"/> {p.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status==='active' ? 'bg-green-50 text-green-600' : 'bg-[#f5f3f0] text-[#aaa]'}`}>
            {p.status==='active' ? 'Activa' : 'Borrador'}
          </span>
          <button className="text-[#ccc] hover:text-[#111] transition-colors">
            <MoreHorizontal className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-[12px] text-[#666]">
          <Eye className="w-3 h-3 text-[#ccc]"/> {p.views.toLocaleString()}
        </div>
        <div className="flex items-center gap-1 text-[12px] text-[#666]">
          <Star className="w-3 h-3 text-amber-400"/> {p.rating}
        </div>
        <div className="flex items-center gap-1 text-[12px] text-[#666]">
          <Zap className="w-3 h-3 text-[#ccc]"/> {p.zones} zonas
        </div>
      </div>

      {/* Next check-in */}
      {p.nextCheckin && (
        <div className="flex items-center gap-2 rounded-[10px] px-3 py-2" style={{ backgroundColor:'#f5f3f0' }}>
          <Calendar className="w-3.5 h-3.5 text-[#aaa]"/>
          <span className="text-[12px] text-[#555]">Check-in: <strong>{p.nextCheckin}</strong> · {p.guest}</span>
        </div>
      )}

      {/* Zone pills */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="overflow-hidden">
            <div className="pt-2 flex flex-wrap gap-1.5">
              {ZONE_ICONS.map((z, zi) => (
                <div key={zi} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: z.bg, color: z.color }}>
                  {z.icon} {z.label}
                </div>
              ))}
              <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-[#f5f3f0] text-[#aaa] border border-dashed border-[#ddd]">
                <Plus className="w-2.5 h-2.5"/> Añadir zona
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-black/[0.04]">
        <button className="text-[12px] font-medium text-[#7c3aed] flex items-center gap-1 hover:gap-2 transition-all">
          Ver guía <ArrowUpRight className="w-3 h-3"/>
        </button>
        <button className="text-[11px] text-[#aaa] hover:text-[#111] transition-colors flex items-center gap-1">
          {open ? 'Ocultar zonas' : 'Ver zonas'} <ChevronRight className={`w-3 h-3 transition-transform ${open?'rotate-90':''}`}/>
        </button>
      </div>
    </motion.div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function PreviewDashboard() {
  const [navActive, setNavActive] = useState(0)

  return (
    <div className={`${inter.className} ${manrope.variable} min-h-screen flex`}
      style={{ backgroundColor:'#f5f3f0', WebkitFontSmoothing:'antialiased' } as React.CSSProperties}>

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-black/[0.05] px-4 py-6 sticky top-0 h-screen"
        style={{ boxShadow:'1px 0 0 rgba(0,0,0,0.03)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <img src="/isotipo-gradient.svg" alt="Itineramio" width={24} height={14} className="object-contain"/>
          <span className="font-semibold text-[14px] text-[#111]">Itineramio</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map((item, i) => (
            <button key={i} onClick={() => setNavActive(i)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all text-left
                ${navActive===i ? 'bg-violet-50 text-violet-700' : 'text-[#666] hover:bg-[#f5f3f0] hover:text-[#111]'}`}>
              <span className={navActive===i ? 'text-violet-600' : 'text-[#bbb]'}>{item.icon}</span>
              {item.label}
              {i===1 && <span className="ml-auto w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">3</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-black/[0.05] pt-4 mt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">AS</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#111] truncate">Alejandro S.</p>
              <p className="text-[10px] text-[#aaa]">Plan Pro · 4 props</p>
            </div>
            <button className="text-[#ccc] hover:text-[#666] transition-colors">
              <LogOut className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="bg-white border-b border-black/[0.05] px-6 lg:px-8 h-14 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#ccc]"/>
              <input placeholder="Buscar propiedad…" className="pl-9 pr-4 py-2 text-[13px] bg-[#f5f3f0] rounded-[10px] outline-none w-56 text-[#111] placeholder-[#bbb]"/>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-[10px] hover:bg-[#f5f3f0] transition-colors">
              <Bell className="w-4 h-4 text-[#666]"/>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-600"/>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-white transition-all"
              style={{ backgroundColor:'#7c3aed', boxShadow:'0 2px 10px rgba(124,58,237,0.3)' }}>
              <Plus className="w-3.5 h-3.5"/> Nueva propiedad
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 lg:px-8 py-8 overflow-auto">

          {/* Greeting */}
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mb-8">
            <h1 className="text-[22px] font-semibold text-[#111] leading-tight" style={{ fontFamily:'var(--font-manrope)' }}>
              Buenos días, Alejandro 👋
            </h1>
            <p className="text-[14px] text-[#888] mt-1">Tienes 2 check-ins hoy y 3 preguntas sin leer.</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}
                className="bg-white rounded-[16px] p-5 flex flex-col gap-3" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[#ccc]">{s.icon}</span>
                  <span className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5"/> +
                  </span>
                </div>
                <div>
                  <p className="text-[22px] font-semibold text-[#111] leading-tight" style={{ fontFamily:'var(--font-manrope)' }}>{s.value}</p>
                  <p className="text-[11px] text-[#aaa] mt-0.5">{s.label}</p>
                </div>
                <p className="text-[11px] text-green-500 font-medium">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Properties (2/3) */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#111]" style={{ fontFamily:'var(--font-manrope)' }}>Tus propiedades</h2>
                <button className="text-[12px] text-violet-600 font-medium hover:underline flex items-center gap-1">
                  Ver todas <ChevronRight className="w-3.5 h-3.5"/>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROPERTIES.map((p, i) => <PropertyCard key={p.id} p={p} i={i}/>)}
              </div>
            </div>

            {/* Activity (1/3) */}
            <div className="xl:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#111]" style={{ fontFamily:'var(--font-manrope)' }}>Actividad reciente</h2>
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center">5</span>
              </div>
              <div className="bg-white rounded-[20px] overflow-hidden" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                {ACTIVITY.map((a, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}
                    className={`flex items-start gap-3 px-5 py-4 ${i < ACTIVITY.length-1 ? 'border-b border-black/[0.04]' : ''}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: a.color+'18', color: a.color }}>
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#333] leading-snug">{a.text}</p>
                      <p className="text-[10px] text-[#aaa] mt-0.5">{a.prop} · {a.time}</p>
                    </div>
                    {a.resolved && (
                      <span className="text-[9px] font-semibold text-green-500 bg-green-50 px-1.5 py-0.5 rounded-full shrink-0">IA</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="mt-4 bg-white rounded-[20px] p-5" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <p className="text-[12px] font-semibold text-[#111] mb-3">Acciones rápidas</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label:'Añadir propiedad', icon:<Plus className="w-3.5 h-3.5"/>, color:'#7c3aed', bg:'#ede9ff' },
                    { label:'Ver mensajes IA', icon:<Bot className="w-3.5 h-3.5"/>,  color:'#2563eb', bg:'#dbeafe' },
                    { label:'Compartir guía', icon:<ArrowUpRight className="w-3.5 h-3.5"/>, color:'#059669', bg:'#d1fae5' },
                  ].map((action, i) => (
                    <button key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:opacity-80 transition-opacity text-left"
                      style={{ backgroundColor: action.bg }}>
                      <span style={{ color: action.color }}>{action.icon}</span>
                      <span className="text-[12px] font-medium" style={{ color: action.color }}>{action.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto" style={{ color: action.color }}/>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
