'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Inter, Manrope } from 'next/font/google'
import {
  Home, Eye, Timer, MapPin, Star, MoreHorizontal,
  Plus, Edit, Share2, Trash2, Copy, ExternalLink,
  Building2, Hash, Sparkles, ArrowRight, CheckCircle,
  MessageCircle, Zap
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const inter   = Inter({ subsets: ['latin'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], weight: ['300','400','600','700'], display: 'swap', variable: '--font-manrope' })

// ─── FAKE DATA (misma estructura que el dashboard real) ──────────────────────
const STATS = [
  { label: 'Propiedades',     value: '4',    icon: <Home className="h-7 w-7 text-violet-600"/>,  href: '/properties' },
  { label: 'Vistas totales',  value: '3.120',icon: <Eye className="h-7 w-7 text-blue-600"/>,     href: '/analytics' },
  { label: 'Min. ahorrados',  value: '240',  icon: <Timer className="h-7 w-7 text-orange-500"/>, href: null },
  { label: 'Zonas vistas',    value: '87',   icon: <Eye className="h-7 w-7 text-green-600"/>,    href: null },
]

const PROPERTIES = [
  {
    id: '1', name: 'Apartamento Eixample', city: 'Barcelona', state: 'Cataluña',
    bedrooms: 2, bathrooms: 1, maxGuests: 4, zonesCount: 7, totalViews: 1240,
    status: 'ACTIVE', propertyCode: 'BCN-01', propertySetId: null,
  },
  {
    id: '2', name: 'Loft Born', city: 'Barcelona', state: 'Cataluña',
    bedrooms: 1, bathrooms: 1, maxGuests: 2, zonesCount: 5, totalViews: 890,
    status: 'ACTIVE', propertyCode: 'BCN-02', propertySetId: 'set-1',
  },
  {
    id: '3', name: 'Piso Gràcia', city: 'Barcelona', state: 'Cataluña',
    bedrooms: 3, bathrooms: 2, maxGuests: 6, zonesCount: 6, totalViews: 670,
    status: 'DRAFT', propertyCode: null, propertySetId: null,
  },
]

const ACTIVITY = [
  { type: 'view',    text: 'Guía vista',           sub: 'Loft Born · hace 5 min',   color:'#2563eb', bg:'#dbeafe',  icon: <Eye className="w-3.5 h-3.5"/> },
  { type: 'msg',     text: 'Pregunta resuelta IA',  sub: 'Eixample · hace 22 min',   color:'#7c3aed', bg:'#ede9ff',  icon: <MessageCircle className="w-3.5 h-3.5"/> },
  { type: 'review',  text: 'Nueva reseña — 5★',     sub: 'Piso Gràcia · hace 1h',    color:'#f59e0b', bg:'#fef3c7',  icon: <Star className="w-3.5 h-3.5"/> },
  { type: 'checkin', text: 'Check-in completado',    sub: 'Eixample · ayer',          color:'#059669', bg:'#d1fae5',  icon: <CheckCircle className="w-3.5 h-3.5"/> },
  { type: 'zone',    text: 'Zona WiFi visitada',     sub: 'Loft Born · ayer',         color:'#0891b2', bg:'#cffafe',  icon: <Zap className="w-3.5 h-3.5"/> },
]

// ─── PROPERTY ROW ────────────────────────────────────────────────────────────
function PropertyRow({ p, i }: { p: typeof PROPERTIES[0]; i: number }) {
  const [active, setActive] = useState(p.status === 'ACTIVE')

  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
      className="bg-white rounded-[20px] p-5 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
      style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="flex space-x-4">
        {/* Image placeholder */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <Home className="w-7 h-7 text-white"/>
          </div>
          <span className="text-[10px] sm:text-xs text-violet-600 underline cursor-pointer hover:text-violet-800">Editar</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Name + badges */}
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <h3 className="font-semibold text-base sm:text-lg text-[#111] truncate" style={{ fontFamily:'var(--font-manrope)' }}>
                  {p.name}
                </h3>
                {p.propertyCode && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                    <Hash className="w-2.5 h-2.5 mr-0.5"/> {p.propertyCode}
                  </span>
                )}
                {p.propertySetId && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                    <Building2 className="w-2.5 h-2.5 mr-0.5"/> En grupo
                  </span>
                )}
              </div>

              {/* City */}
              <p className="text-sm text-[#666] mb-2">{p.city}, {p.state}</p>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#999] mb-3">
                <span>{p.bedrooms} hab.</span>
                <span>{p.bathrooms} baños</span>
                <span className="hidden xs:inline">{p.maxGuests} huéspedes</span>
              </div>

              {/* Stats + toggle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center text-[#666] gap-1">
                    <MapPin className="w-3.5 h-3.5"/> {p.zonesCount} zonas
                  </div>
                  {p.totalViews > 0 && (
                    <div className="flex items-center text-[#666] gap-1">
                      <Eye className="w-3.5 h-3.5"/> {p.totalViews.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#999] hidden xs:inline">{active ? 'Activa' : 'Inactiva'}</span>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" checked={active} onChange={() => setActive(!active)} className="sr-only peer"/>
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-[#e5e7eb] peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer
                      peer-checked:after:translate-x-full peer-checked:after:border-white
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                      after:bg-white after:border-[#ccc] after:border after:rounded-full
                      after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all
                      peer-checked:bg-violet-600"/>
                  </label>
                </div>
              </div>
            </div>

            {/* Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-1.5 rounded-[8px] text-[#ccc] hover:text-[#666] hover:bg-[#f5f3f0] transition-colors"
                  onClick={e => e.stopPropagation()}>
                  <MoreHorizontal className="w-4 h-4"/>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="w-52 bg-white rounded-[12px] border border-black/[0.07] p-1.5"
                  style={{ boxShadow:'0 8px 24px rgba(0,0,0,0.1)' }} sideOffset={4}>
                  {[
                    { icon:<Edit className="w-4 h-4"/>,       label:'Editar' },
                    { icon:<Building2 className="w-4 h-4"/>,  label:'Gestionar zonas' },
                    { icon:<Copy className="w-4 h-4"/>,       label:'Duplicar' },
                    { icon:<Share2 className="w-4 h-4"/>,     label:'Compartir guía' },
                    { icon:<ExternalLink className="w-4 h-4"/>,label:'Ver guía pública' },
                    { icon:<Trash2 className="w-4 h-4"/>,     label:'Eliminar', danger:true },
                  ].map((item: any, di) => (
                    <DropdownMenu.Item key={di}
                      className={`flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-[8px] cursor-pointer outline-none
                        ${item.danger ? 'text-red-500 hover:bg-red-50' : 'text-[#444] hover:bg-[#f5f3f0]'}`}>
                      {item.icon} {item.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PreviewDashboard() {
  return (
    <div className={`${inter.className} ${manrope.variable} min-h-screen bg-[#f5f3f0] pb-10`}
      style={{ WebkitFontSmoothing:'antialiased' } as React.CSSProperties}>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
          className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#111]"
            style={{ fontFamily:'var(--font-manrope)' }}>
            Hola, Alejandro 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#888] mt-1">Aquí tienes el resumen de tus propiedades.</p>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45, delay:0.08 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-5 sm:mb-6">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white rounded-[16px] p-3 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer hover:shadow-md transition-shadow"
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              {s.icon}
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-[#888] leading-tight">{s.label}</p>
                <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#111]"
                  style={{ fontFamily:'var(--font-manrope)' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Two column layout ── */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">

          {/* Left: Properties (3/4) */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>

              {/* Section header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#111]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                  </svg>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#111]"
                    style={{ fontFamily:'var(--font-manrope)' }}>
                    Propiedades ({PROPERTIES.length})
                  </h2>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a href="/ai-setup"
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border border-violet-300 text-violet-700 hover:bg-violet-50 transition-colors w-full sm:w-auto">
                    <Sparkles className="w-3.5 h-3.5"/> Crear con IA
                  </a>
                  <a href="/properties/new"
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white transition-all w-full sm:w-auto"
                    style={{ backgroundColor:'#7c3aed', boxShadow:'0 2px 10px rgba(124,58,237,0.25)' }}>
                    <Plus className="w-3.5 h-3.5"/> Nueva propiedad
                  </a>
                </div>
              </div>

              {/* Property list */}
              <div className="space-y-3 sm:space-y-4">
                {PROPERTIES.map((p, i) => <PropertyRow key={p.id} p={p} i={i}/>)}
              </div>

              {/* Ver todas */}
              <div className="mt-5 text-center">
                <a href="/properties"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-black/[0.1] text-sm font-medium text-[#555] hover:border-black/20 hover:text-[#111] transition-all">
                  Ver todas las propiedades <ArrowRight className="w-3.5 h-3.5"/>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right: Recent activity (1/4) */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}>
              <h2 className="text-lg font-semibold text-[#111] mb-4" style={{ fontFamily:'var(--font-manrope)' }}>
                Actividad reciente
              </h2>
              <div className="bg-white rounded-[20px] overflow-hidden divide-y divide-black/[0.04]"
                style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                {ACTIVITY.map((a, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.2 + i*0.06 }}
                    className="flex items-start gap-3 px-4 py-3.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: a.bg, color: a.color }}>
                      {a.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[#222] leading-snug">{a.text}</p>
                      <p className="text-[10px] text-[#aaa] mt-0.5">{a.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  )
}
