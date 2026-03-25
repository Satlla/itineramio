'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Check, Copy, Download, ExternalLink, ChevronRight,
  Palette, Type, Layout, Box, Sparkles, Image as ImageIcon,
  Monitor, Smartphone, Layers, Zap, ArrowRight, Globe,
  Star, Shield, Bell, Settings, Home, Map, MessageCircle,
  Calendar, BarChart2, Users, BookOpen, QrCode, Wifi,
  Coffee, Utensils, ChevronDown, Plus, Search, Filter,
  CheckCircle2, Clock, TrendingUp, Eye
} from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────────────────────

function useCopy(timeout = 1500) {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), timeout)
    })
  }
  return { copied, copy }
}

// ─── Data ──────────────────────────────────────────────────────────────────

const COLORS = {
  brand: [
    { name: 'Brand 50',  hex: '#f0f0ff', tw: 'brand-50',  dark: false },
    { name: 'Brand 100', hex: '#e6e6ff', tw: 'brand-100', dark: false },
    { name: 'Brand 200', hex: '#d1d1ff', tw: 'brand-200', dark: false },
    { name: 'Brand 300', hex: '#a5b4fc', tw: 'brand-300', dark: false },
    { name: 'Brand 400', hex: '#818cf8', tw: 'brand-400', dark: false },
    { name: 'Brand 500', hex: '#6366f1', tw: 'brand-500', dark: true,  primary: true },
    { name: 'Brand 600', hex: '#4338ca', tw: 'brand-600', dark: true  },
    { name: 'Brand 700', hex: '#3730a3', tw: 'brand-700', dark: true  },
    { name: 'Brand 800', hex: '#312e81', tw: 'brand-800', dark: true  },
    { name: 'Brand 900', hex: '#1e1b4b', tw: 'brand-900', dark: true  },
    { name: 'Brand 950', hex: '#0f0c29', tw: 'brand-950', dark: true  },
  ],
  accent: [
    { name: 'Accent 50',  hex: '#faf5ff', tw: 'accent-50',  dark: false },
    { name: 'Accent 100', hex: '#f3e8ff', tw: 'accent-100', dark: false },
    { name: 'Accent 200', hex: '#e9d5ff', tw: 'accent-200', dark: false },
    { name: 'Accent 300', hex: '#d8b4fe', tw: 'accent-300', dark: false },
    { name: 'Accent 400', hex: '#c084fc', tw: 'accent-400', dark: false },
    { name: 'Accent 500', hex: '#8b5cf6', tw: 'accent-500', dark: true, primary: true },
    { name: 'Accent 600', hex: '#7c3aed', tw: 'accent-600', dark: true  },
    { name: 'Accent 700', hex: '#6d28d9', tw: 'accent-700', dark: true  },
    { name: 'Accent 800', hex: '#5b21b6', tw: 'accent-800', dark: true  },
    { name: 'Accent 900', hex: '#4c1d95', tw: 'accent-900', dark: true  },
  ],
  semantic: [
    { name: 'Success',   hex: '#10b981', tw: 'green-500',  dark: true  },
    { name: 'Warning',   hex: '#f59e0b', tw: 'amber-500',  dark: false },
    { name: 'Danger',    hex: '#ef4444', tw: 'red-500',    dark: true  },
    { name: 'Info',      hex: '#3b82f6', tw: 'blue-500',   dark: true  },
  ],
}

const TYPOGRAPHY = [
  { name: 'Display',   size: '4.5rem',  weight: '800', lh: '1',    sample: 'Crea guías que enamoran', class: 'text-[4.5rem] font-extrabold leading-none' },
  { name: 'H1',        size: '3rem',    weight: '700', lh: '1.1',  sample: 'Property Manual Creator', class: 'text-5xl font-bold leading-tight' },
  { name: 'H2',        size: '2.25rem', weight: '700', lh: '1.2',  sample: 'Zonas, pasos y medios', class: 'text-4xl font-bold leading-snug' },
  { name: 'H3',        size: '1.875rem',weight: '600', lh: '1.3',  sample: 'Check-in sin fricción', class: 'text-3xl font-semibold' },
  { name: 'H4',        size: '1.5rem',  weight: '600', lh: '1.4',  sample: 'Instrucciones WiFi', class: 'text-2xl font-semibold' },
  { name: 'Body LG',   size: '1.125rem',weight: '400', lh: '1.75', sample: 'Texto de cuerpo amplio para descripciones largas y secciones de contenido principal.', class: 'text-lg' },
  { name: 'Body',      size: '1rem',    weight: '400', lh: '1.75', sample: 'Texto base para la mayoría de los contenidos de la interfaz.', class: 'text-base' },
  { name: 'Body SM',   size: '0.875rem',weight: '400', lh: '1.5',  sample: 'Texto pequeño para etiquetas, metadatos y texto secundario.', class: 'text-sm' },
  { name: 'Caption',   size: '0.75rem', weight: '500', lh: '1.4',  sample: 'CAPTION — TAGS Y METADATOS', class: 'text-xs font-medium uppercase tracking-wider' },
]

// Isotipo inline SVG paths (shared geometry, color applied per variant)
const ISOTIPO_PATHS = {
  corners: [
    'M2 8V5C2 3.34315 3.34315 2 5 2H9',
    'M33.4336 2H36C37.6569 2 39 3.34315 39 5V8.16667M2 33.807V36C2 37.6569 3.34315 39 5 39H8.87611',
    'M40 34V36C40 37.6569 38.6569 39 37 39H33',
  ],
  main: 'M7.59408 22.8502C8.12901 23.5437 10.9814 27.2414 17.4965 27.2943V30.8126C17.4965 32.1469 17.8273 33.8071 19.1616 33.8071C20.4732 33.8071 20.8268 32.1316 20.8268 30.82V27.2943C24.9777 27.1022 33.3808 24.7007 33.7863 16.6318C34.1917 8.56282 28.5253 6.54558 25.2432 6.54558C24.3835 6.52733 22.887 6.65611 21.4128 7.21625C17.9043 8.54936 17.4965 12.953 17.4965 16.7062V24.5854C16.0967 24.5086 12.9208 24.0091 11.4149 22.6258C11.3433 22.6258 11.0533 22.6369 10.6524 22.6521C9.75609 22.6861 8.3058 22.7411 7.50537 22.7411C7.51721 22.7505 7.54646 22.7885 7.59408 22.8502ZM20.8992 24.5274C24.2296 24.2585 30.6442 22.0938 30.2387 15.1315C29.9974 13.1911 28.6894 9.18351 24.8088 9.36794C21.7286 9.36794 21.0265 13.1302 20.9921 16.2102L20.8992 24.5274Z',
  line: 'M8.30298 20.1123L12.6563 16.5179L8.30298 12.1248L12.6563 9.72852L17.977 13.7223',
}

const COMPONENTS_PREVIEW = {
  buttons: [
    { label: 'Primario',    cls: 'bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl font-medium text-sm transition-colors' },
    { label: 'Secundario',  cls: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-medium text-sm transition-colors' },
    { label: 'Ghost',       cls: 'text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl font-medium text-sm transition-colors' },
    { label: 'Danger',      cls: 'bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-xl font-medium text-sm transition-colors' },
    { label: 'Disabled',    cls: 'bg-gray-100 text-gray-400 px-4 py-2 rounded-xl font-medium text-sm cursor-not-allowed', disabled: true },
  ],
  badges: [
    { label: 'Activo',        cls: 'bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
    { label: 'Pendiente',     cls: 'bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
    { label: 'Beta',          cls: 'bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
    { label: 'Pro',           cls: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full' },
    { label: 'Archivado',     cls: 'bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
  ],
}

const SHADOWS = [
  { name: 'shadow-sm',   class: 'shadow-sm',   css: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  { name: 'shadow',      class: 'shadow',      css: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
  { name: 'shadow-md',   class: 'shadow-md',   css: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
  { name: 'shadow-lg',   class: 'shadow-lg',   css: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
  { name: 'shadow-xl',   class: 'shadow-xl',   css: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
  { name: 'shadow-brand', class: 'shadow-[0_4px_14px_0_rgba(99,102,241,0.25)]', css: '0 4px 14px 0 rgba(99,102,241,0.25)' },
]

const RADIUS = [
  { name: 'rounded-sm',   value: '2px',   class: 'rounded-sm'   },
  { name: 'rounded',      value: '4px',   class: 'rounded'      },
  { name: 'rounded-md',   value: '6px',   class: 'rounded-md'   },
  { name: 'rounded-lg',   value: '8px',   class: 'rounded-lg'   },
  { name: 'rounded-xl',   value: '12px',  class: 'rounded-xl'   },
  { name: 'rounded-2xl',  value: '16px',  class: 'rounded-2xl'  },
  { name: 'rounded-3xl',  value: '24px',  class: 'rounded-3xl'  },
  { name: 'rounded-full', value: '9999px',class: 'rounded-full' },
]

// ─── NAV items ─────────────────────────────────────────────────────────────

const NAV = [
  { id: 'brand',      label: 'Marca',       icon: Sparkles },
  { id: 'colors',     label: 'Colores',     icon: Palette  },
  { id: 'typography', label: 'Tipografía',  icon: Type     },
  { id: 'logos',      label: 'Logos',       icon: ImageIcon},
  { id: 'components', label: 'Componentes', icon: Box      },
  { id: 'screens',    label: 'Pantallas',   icon: Monitor  },
  { id: 'tokens',     label: 'Tokens',      icon: Layers   },
  { id: 'voice',      label: 'Voz y tono',  icon: MessageCircle },
]

// ─── ColorSwatch ───────────────────────────────────────────────────────────

function ColorSwatch({ color, copied, onCopy }: { color: any, copied: string | null, onCopy: (hex: string, id: string) => void }) {
  const id = color.hex
  const isCopied = copied === id
  return (
    <div
      className={`relative group cursor-pointer rounded-xl overflow-hidden border transition-transform hover:scale-105 ${color.dark ? 'border-white/10' : 'border-black/10'} ${color.primary ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}`}
      style={{ backgroundColor: color.hex }}
      onClick={() => onCopy(color.hex, id)}
    >
      <div className="h-20 w-full" />
      <div className={`px-3 py-2 ${color.dark ? 'bg-black/30 text-white' : 'bg-white/60 text-gray-800'}`}>
        <p className="text-[11px] font-semibold truncate">{color.name}</p>
        <p className={`text-[10px] font-mono ${color.dark ? 'text-white/70' : 'text-gray-500'}`}>{color.hex}</p>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${color.dark ? 'bg-black/40' : 'bg-white/60'}`}>
        {isCopied
          ? <Check className={`w-5 h-5 ${color.dark ? 'text-white' : 'text-gray-800'}`} />
          : <Copy className={`w-4 h-4 ${color.dark ? 'text-white' : 'text-gray-800'}`} />
        }
      </div>
    </div>
  )
}

// ─── AppScreen mockup ──────────────────────────────────────────────────────

function BrowserFrame({ children, url = 'itineramio.com' }: { children: React.ReactNode, url?: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#1a1a1a]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#2a2a2a] border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="flex-1 mx-4">
          <div className="bg-[#1a1a1a] rounded-md px-3 py-1 text-[11px] text-gray-400 font-mono flex items-center gap-2">
            <Shield className="w-3 h-3 text-gray-500" />
            {url}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-4 h-4 rounded bg-white/5" />
          <div className="w-4 h-4 rounded bg-white/5" />
        </div>
      </div>
      {children}
    </div>
  )
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[260px] mx-auto">
      {/* Phone shell */}
      <div className="absolute inset-0 rounded-[42px] bg-[#1a1a1a] border-4 border-[#2a2a2a] shadow-2xl" />
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1a1a1a] rounded-b-2xl z-10" />
      {/* Screen */}
      <div className="relative pt-10 pb-8 mx-1 rounded-[38px] overflow-hidden bg-gray-50 min-h-[540px]">
        {children}
      </div>
      {/* Home bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#2a2a2a] rounded-full" />
    </div>
  )
}

// ─── Screen: Dashboard ─────────────────────────────────────────────────────

function DashboardScreen() {
  return (
    <div className="bg-gray-50 min-h-[480px] font-sans">
      {/* Sidebar */}
      <div className="flex h-full">
        <div className="w-48 bg-white border-r border-gray-100 h-[480px] flex flex-col">
          <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">I</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">Itineramio</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {[
              { icon: Home, label: 'Panel', active: true },
              { icon: Map, label: 'Propiedades', active: false },
              { icon: Calendar, label: 'Reservas', active: false },
              { icon: Users, label: 'Clientes', active: false },
              { icon: BarChart2, label: 'Analítica', active: false },
              { icon: MessageCircle, label: 'Chatbot IA', active: false },
              { icon: Settings, label: 'Ajustes', active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div key={label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </nav>
          <div className="px-3 pb-4">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-3 border border-indigo-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3 h-3 text-violet-500" />
                <span className="text-[10px] font-bold text-violet-700">Plan Pro</span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2">Ilimitado activo</p>
              <div className="h-1 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-sm font-bold text-gray-900">Buenos días, Alejandro 👋</h1>
              <p className="text-[10px] text-gray-400">Martes 25 de marzo, 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600" />
            </div>
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Propiedades', value: '4', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Reservas mes', value: '23', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Consultas IA', value: '187', icon: MessageCircle, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className={`w-6 h-6 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                  <Icon className={`w-3 h-3 ${color}`} />
                </div>
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-[9px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>
          {/* Property list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-700">Propiedades recientes</span>
              <span className="text-[9px] text-indigo-600 font-medium">Ver todas →</span>
            </div>
            {[
              { name: 'Mercado Central', location: 'Alicante', status: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
              { name: 'Playa San Juan',  location: 'Alicante', status: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
              { name: 'Villa Moraira',   location: 'Moraira',  status: 'Borrador', color: 'bg-amber-100 text-amber-700' },
            ].map(({ name, location, status, color }) => (
              <div key={name} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                    <Home className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-800">{name}</p>
                    <p className="text-[9px] text-gray-400">{location}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Property Guide ────────────────────────────────────────────────

function GuideScreen() {
  const zones = [
    { icon: '🔑', name: 'Check-in', desc: '4 pasos', color: 'from-blue-400 to-indigo-500' },
    { icon: '📶', name: 'WiFi',     desc: '2 pasos', color: 'from-violet-400 to-purple-500' },
    { icon: '🍳', name: 'Cocina',   desc: '6 pasos', color: 'from-amber-400 to-orange-500' },
    { icon: '🅿️', name: 'Parking',  desc: '3 pasos', color: 'from-emerald-400 to-teal-500' },
    { icon: '🌊', name: 'Playa',    desc: '5 recom', color: 'from-cyan-400 to-blue-500' },
    { icon: '🍽️', name: 'Restaurantes', desc: '8 recom', color: 'from-rose-400 to-pink-500' },
  ]
  return (
    <div className="bg-gray-50 min-h-[480px] overflow-hidden">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-5 pt-6 pb-14">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/grid.svg)' }} />
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-base font-bold text-white leading-tight">Mercado Central</h1>
          <p className="text-[11px] text-white/70 mt-0.5">4Pax · Centro Alicante</p>
          <div className="flex items-center gap-1.5 mt-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />)}
            <span className="text-[10px] text-white/70 ml-1">4.9 (127 reseñas)</span>
          </div>
        </div>
      </div>
      {/* Cards grid */}
      <div className="px-4 -mt-8 relative">
        <div className="grid grid-cols-3 gap-2">
          {zones.map(({ icon, name, desc, color }) => (
            <div key={name} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-white hover:shadow-xl transition-shadow">
              <div className={`h-10 bg-gradient-to-br ${color} flex items-center justify-center`}>
                <span className="text-lg">{icon}</span>
              </div>
              <div className="p-2 text-center">
                <p className="text-[10px] font-semibold text-gray-800 truncate">{name}</p>
                <p className="text-[8px] text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Chat button */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-800">Asistente IA 24/7</p>
            <p className="text-[9px] text-gray-400 truncate">¿Tienes dudas? Pregúntame</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Zone detail ───────────────────────────────────────────────────

function ZoneScreen() {
  const steps = [
    { n: 1, title: 'Localiza la caja de llaves',  done: true,  img: true  },
    { n: 2, title: 'Introduce el código 4782',     done: true,  img: false },
    { n: 3, title: 'Abre la puerta principal',     done: false, img: true  },
    { n: 4, title: 'Registro en conserjería',      done: false, img: false },
  ]
  return (
    <div className="bg-gray-50 min-h-[480px]">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <span className="text-base">🔑</span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Check-in</h2>
          <p className="text-[10px] text-gray-400">4 pasos · ~5 min</p>
        </div>
        <div className="ml-auto">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      </div>
      {/* Progress */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-500 font-medium">Progreso</span>
          <span className="text-[10px] text-indigo-600 font-bold">2/4</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
        </div>
      </div>
      {/* Steps */}
      <div className="px-4 space-y-3">
        {steps.map(({ n, title, done, img }) => (
          <div key={n} className={`bg-white rounded-xl border overflow-hidden transition-all ${done ? 'border-emerald-100' : 'border-gray-100'}`}>
            <div className="flex items-start gap-3 p-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                {done
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  : <span className="text-[10px] font-bold text-gray-500">{n}</span>
                }
              </div>
              <div className="flex-1">
                <p className={`text-[11px] font-medium ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{title}</p>
              </div>
            </div>
            {img && !done && (
              <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded font-medium">Ver foto</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Screen: Analytics ─────────────────────────────────────────────────────

function AnalyticsScreen() {
  const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar']
  const values = [42, 67, 89, 55, 78, 94]
  const max = Math.max(...values)
  return (
    <div className="bg-gray-50 min-h-[480px]">
      <div className="bg-white px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">Analítica del Chatbot</h2>
        <p className="text-[10px] text-gray-400">Últimos 6 meses</p>
      </div>
      <div className="p-4 space-y-3">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Consultas totales', value: '1,247', trend: '+18%', icon: MessageCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Satisfacción', value: '94%', trend: '+3%', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Resueltas por IA', value: '89%', trend: '+5%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Tiempo respuesta', value: '0.8s', trend: '-12%', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(({ label, value, trend, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className={`w-6 h-6 ${bg} rounded-lg flex items-center justify-center mb-1.5`}>
                <Icon className={`w-3 h-3 ${color}`} />
              </div>
              <p className="text-sm font-bold text-gray-900">{value}</p>
              <p className="text-[8px] text-gray-400">{label}</p>
              <p className="text-[8px] text-emerald-600 font-medium mt-0.5">{trend}</p>
            </div>
          ))}
        </div>
        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-700 mb-3">Consultas mensuales</p>
          <div className="flex items-end gap-2 h-20">
            {values.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400 transition-all"
                  style={{ height: `${(v / max) * 72}px` }}
                />
                <span className="text-[8px] text-gray-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Top questions */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-700 mb-2">Top preguntas</p>
          {[
            { q: '¿Dónde está el WiFi?', n: 312 },
            { q: 'Instrucciones check-in', n: 208 },
            { q: 'Restaurantes cerca',     n: 189 },
          ].map(({ q, n }) => (
            <div key={q} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <p className="text-[10px] text-gray-600 flex-1 truncate">{q}</p>
              <span className="text-[9px] font-bold text-indigo-600 ml-2">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function StyleGuidePage() {
  const { copied, copy } = useCopy()
  const [activeNav, setActiveNav] = useState('brand')

  const scrollTo = (id: string) => {
    setActiveNav(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const Section = ({ id, children }: { id: string, children: React.ReactNode }) => (
    <section id={id} className="scroll-mt-20">
      {children}
    </section>
  )

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans">

      {/* ── Top bar ── */}
      <div className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/isotipe.svg" alt="Itineramio" width={24} height={24} />
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="text-white font-semibold">Itineramio</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Design System</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white/30">v2.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              itineramio.com
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">

        {/* ── Sidebar ── */}
        <aside className="w-56 flex-shrink-0 sticky top-[49px] h-[calc(100vh-49px)] overflow-y-auto py-8 pr-4 pl-6 hidden lg:block">
          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-3">Secciones</p>
          <nav className="space-y-0.5">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  activeNav === id
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-3">Descargas</p>
            <a
              href="/logo.svg"
              download
              className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all"
            >
              <Download className="w-3 h-3" />
              Brand Kit SVG
            </a>
            <a
              href="/logo-itineramio.svg"
              download
              className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all"
            >
              <Download className="w-3 h-3" />
              Logo variants
            </a>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 px-6 lg:px-10 py-8 space-y-20">

          {/* ════ HERO ════ */}
          <Section id="brand">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0a2e] via-[#16082b] to-[#09090b] border border-white/10 p-10 lg:p-16 mb-12">
              {/* Glow */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">Design System</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 bg-white/5 border border-white/10 px-3 py-1 rounded-full">v2.0 · 2026</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black leading-none mb-4 tracking-tight">
                  <span className="text-white">Itineramio</span><br />
                  <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Brand & Design</span>
                </h1>
                <p className="text-white/50 text-lg max-w-xl leading-relaxed">
                  Guía completa del sistema de diseño. Colores, tipografía, componentes y assets de marca para mantener coherencia visual en todos los puntos de contacto.
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  {[
                    { label: 'Colores', n: '24+', icon: Palette },
                    { label: 'Componentes', n: '100+', icon: Box },
                    { label: 'Assets SVG', n: '12', icon: ImageIcon },
                    { label: 'Pantallas', n: '4', icon: Monitor },
                  ].map(({ label, n, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                      <Icon className="w-4 h-4 text-violet-400" />
                      <span className="text-white font-bold text-sm">{n}</span>
                      <span className="text-white/40 text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Claridad',
                  desc: 'Interfaces que guían sin confundir. Cada elemento comunica con precisión y elimina la fricción del usuario.',
                  icon: Eye,
                  color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/20',
                  iconColor: 'text-blue-400',
                },
                {
                  title: 'Confianza',
                  desc: 'Diseño profesional que genera credibilidad. Los hosts y huéspedes confían en una plataforma que luce seria.',
                  icon: Shield,
                  color: 'from-violet-500/20 to-purple-500/20 border-violet-500/20',
                  iconColor: 'text-violet-400',
                },
                {
                  title: 'Calidez',
                  desc: 'Tech que no es fría. Combinamos precisión de producto con la hospitalidad del sector vacacional.',
                  icon: Sparkles,
                  color: 'from-amber-500/20 to-orange-500/20 border-amber-500/20',
                  iconColor: 'text-amber-400',
                },
              ].map(({ title, desc, icon: Icon, color, iconColor }) => (
                <div key={title} className={`bg-gradient-to-br ${color} border rounded-2xl p-6`}>
                  <Icon className={`w-6 h-6 ${iconColor} mb-3`} />
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ════ COLORS ════ */}
          <Section id="colors">
            <SectionHeader
              title="Colores"
              desc="El sistema de color de Itineramio está basado en una paleta indigo–violeta que transmite tecnología, confianza y modernidad."
              icon={<Palette className="w-5 h-5 text-violet-400" />}
            />

            {/* Primary gradient showcase */}
            <div className="rounded-2xl overflow-hidden mb-8 h-20 bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white font-bold text-lg tracking-wide">Brand Gradient · #6366f1 → #8b5cf6</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Brand */}
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Primary — Indigo (Brand)</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
                  {COLORS.brand.map(c => (
                    <ColorSwatch key={c.hex} color={c} copied={copied} onCopy={copy} />
                  ))}
                </div>
              </div>
              {/* Accent */}
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Accent — Violet (Purple)</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2">
                  {COLORS.accent.map(c => (
                    <ColorSwatch key={c.hex} color={c} copied={copied} onCopy={copy} />
                  ))}
                </div>
              </div>
              {/* Semantic */}
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Semánticos</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COLORS.semantic.map(c => (
                    <ColorSwatch key={c.hex} color={c} copied={copied} onCopy={copy} />
                  ))}
                </div>
              </div>
            </div>

            {/* CSS Variables */}
            <div className="mt-8 bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <span className="text-xs font-mono text-white/40">globals.css — variables</span>
                <button
                  onClick={() => copy(`--primary: 262 83% 58%;\n--accent: 262 83% 58%;\n--brand: #6366f1;\n--brand-accent: #8b5cf6;`, 'css-vars')}
                  className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                >
                  {copied === 'css-vars' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed">
                <p><span className="text-violet-400">--primary:</span> <span className="text-emerald-400">262 83% 58%</span>;</p>
                <p><span className="text-violet-400">--accent:</span> <span className="text-emerald-400">262 83% 58%</span>;</p>
                <p><span className="text-violet-400">--brand:</span> <span className="text-amber-300">#6366f1</span>;</p>
                <p><span className="text-violet-400">--brand-accent:</span> <span className="text-amber-300">#8b5cf6</span>;</p>
                <p><span className="text-violet-400">--background:</span> <span className="text-emerald-400">0 0% 100%</span>;</p>
                <p><span className="text-violet-400">--foreground:</span> <span className="text-emerald-400">222.2 84% 4.9%</span>;</p>
                <p><span className="text-violet-400">--border:</span> <span className="text-emerald-400">214.3 31.8% 91.4%</span>;</p>
                <p><span className="text-violet-400">--radius:</span> <span className="text-emerald-400">0.75rem</span>;</p>
              </div>
            </div>
          </Section>

          {/* ════ TYPOGRAPHY ════ */}
          <Section id="typography">
            <SectionHeader
              title="Tipografía"
              desc="Inter como fuente principal — diseñada para legibilidad en pantalla a cualquier tamaño. Satisfy para detalles decorativos."
              icon={<Type className="w-5 h-5 text-violet-400" />}
            />

            {/* Font showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Primaria — Inter</p>
                <p className="text-5xl font-black text-gray-900 leading-none mb-3">Aa</p>
                <p className="text-gray-600 text-sm font-medium">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p className="text-gray-500 text-sm">abcdefghijklmnopqrstuvwxyz</p>
                <p className="text-gray-400 text-sm mt-1">0123456789 !@#$%^&*()</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['400', '500', '600', '700', '800', '900'].map(w => (
                    <span key={w} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono" style={{ fontWeight: parseInt(w) }}>{w}</span>
                  ))}
                </div>
              </div>
              <div className="bg-[#1a0a2e] rounded-2xl p-6 border border-violet-500/20">
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">Decorativa — Satisfy</p>
                <p className="text-5xl text-white leading-none mb-3" style={{ fontFamily: 'Satisfy, cursive' }}>Aa</p>
                <p className="text-violet-300 text-base" style={{ fontFamily: 'Satisfy, cursive' }}>Itineramio Property Guide</p>
                <p className="text-white/30 text-xs mt-3">Usado en branding decorativo y headings especiales. No para UI funcional.</p>
              </div>
            </div>

            {/* Type scale */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estilo</p>
                </div>
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size</p>
                </div>
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight</p>
                </div>
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Line-h</p>
                </div>
                {TYPOGRAPHY.map(({ name, size, weight, lh, sample, class: cls }) => (
                  <>
                    <div key={`${name}-sample`} className="px-5 py-4 border-b border-gray-50">
                      <p className="text-[9px] font-mono text-gray-400 mb-1.5">{name}</p>
                      <p className={`${cls} text-gray-900 leading-tight`} style={{ lineHeight: lh }}>{sample}</p>
                    </div>
                    <div key={`${name}-size`} className="px-4 py-4 border-b border-gray-50 flex items-end justify-end">
                      <p className="text-xs font-mono text-gray-400">{size}</p>
                    </div>
                    <div key={`${name}-weight`} className="px-4 py-4 border-b border-gray-50 flex items-end justify-end">
                      <p className="text-xs font-mono text-gray-400">{weight}</p>
                    </div>
                    <div key={`${name}-lh`} className="px-4 py-4 border-b border-gray-50 flex items-end justify-end">
                      <p className="text-xs font-mono text-gray-400">{lh}</p>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </Section>

          {/* ════ LOGOS ════ */}
          <Section id="logos">
            <SectionHeader
              title="Isotipo & Assets"
              desc="El isotipo de Itineramio en sus tres versiones oficiales. Descarga en SVG vectorial para uso a cualquier resolución."
              icon={<ImageIcon className="w-5 h-5 text-violet-400" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gradiente */}
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-white h-52 flex items-center justify-center">
                  <svg width="120" height="117" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {ISOTIPO_PATHS.corners.map((d, i) => (
                      <path key={i} d={d} stroke="url(#g1)" strokeWidth="3"/>
                    ))}
                    <path fillRule="evenodd" clipRule="evenodd" d={ISOTIPO_PATHS.main} fill="url(#g2)"/>
                    <rect x="7.42334" y="18.5146" width="2.63837" height="2.39625" fill="url(#g3)"/>
                    <rect x="10.9412" y="14.521" width="2.63837" height="2.39625" fill="url(#g3)"/>
                    <rect x="6.54395" y="10.5269" width="2.63837" height="2.39625" fill="url(#g3)"/>
                    <rect x="11.8208" y="8.9292" width="0.879455" height="0.798751" fill="url(#g3)"/>
                    <path d={ISOTIPO_PATHS.line} stroke="url(#g1)" strokeWidth="0.2"/>
                    <defs>
                      <linearGradient id="g1" x1="2" y1="2" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#A855F7"/>
                      </linearGradient>
                      <linearGradient id="g2" x1="20.66" y1="6.54" x2="20.66" y2="33.81" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#A855F7"/>
                      </linearGradient>
                      <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                        <stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#A855F7"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Gradiente</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Uso principal · fondos claros</p>
                    </div>
                    <span className="text-[9px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium">#8B5CF6 → #A855F7</span>
                  </div>
                  <a href="/isotipe.svg" download className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/50 hover:text-white/80 border border-white/5 w-full">
                    <Download className="w-3.5 h-3.5" /> Descargar SVG
                  </a>
                </div>
              </div>

              {/* Negro */}
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-white h-52 flex items-center justify-center">
                  <svg width="120" height="117" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {ISOTIPO_PATHS.corners.map((d, i) => (
                      <path key={i} d={d} stroke="#000000" strokeWidth="3"/>
                    ))}
                    <path fillRule="evenodd" clipRule="evenodd" d={ISOTIPO_PATHS.main} fill="#000000"/>
                    <rect x="7.42334" y="18.5146" width="2.63837" height="2.39625" fill="#000000"/>
                    <rect x="10.9412" y="14.521" width="2.63837" height="2.39625" fill="#000000"/>
                    <rect x="6.54395" y="10.5269" width="2.63837" height="2.39625" fill="#000000"/>
                    <rect x="11.8208" y="8.9292" width="0.879455" height="0.798751" fill="#000000"/>
                    <path d={ISOTIPO_PATHS.line} stroke="#000000" strokeWidth="0.2"/>
                  </svg>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Negro</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Uso secundario · fondos claros</p>
                    </div>
                    <span className="text-[9px] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-medium">#000000</span>
                  </div>
                  <a href="/isotipo-black.svg" download className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/50 hover:text-white/80 border border-white/5 w-full">
                    <Download className="w-3.5 h-3.5" /> Descargar SVG
                  </a>
                </div>
              </div>

              {/* Blanco */}
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-[#09090b] h-52 flex items-center justify-center border-b border-white/5">
                  <svg width="120" height="117" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {ISOTIPO_PATHS.corners.map((d, i) => (
                      <path key={i} d={d} stroke="#ffffff" strokeWidth="3"/>
                    ))}
                    <path fillRule="evenodd" clipRule="evenodd" d={ISOTIPO_PATHS.main} fill="#ffffff"/>
                    <rect x="7.42334" y="18.5146" width="2.63837" height="2.39625" fill="#ffffff"/>
                    <rect x="10.9412" y="14.521" width="2.63837" height="2.39625" fill="#ffffff"/>
                    <rect x="6.54395" y="10.5269" width="2.63837" height="2.39625" fill="#ffffff"/>
                    <rect x="11.8208" y="8.9292" width="0.879455" height="0.798751" fill="#ffffff"/>
                    <path d={ISOTIPO_PATHS.line} stroke="#ffffff" strokeWidth="0.2"/>
                  </svg>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Blanco</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Fondos oscuros · dark mode</p>
                    </div>
                    <span className="text-[9px] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-medium">#ffffff</span>
                  </div>
                  <a href="/isotipo-white.svg" download className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/50 hover:text-white/80 border border-white/5 w-full">
                    <Download className="w-3.5 h-3.5" /> Descargar SVG
                  </a>
                </div>
              </div>
            </div>

            {/* Usage rules */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">Usar así</span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    'Logo sobre fondos blancos o muy claros',
                    'Logo light sobre fondos oscuros (#111, #0a0a0a)',
                    'Isotipo cuando el espacio es menor de 120px',
                    'Mantener espacio libre = altura de la I del logo',
                    'Descargar siempre en SVG para máxima calidad',
                  ].map(t => (
                    <li key={t} className="text-xs text-white/50 flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full border-2 border-red-400 flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-red-400" />
                  </div>
                  <span className="text-sm font-bold text-red-400">Evitar</span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    'No usar el logo oscuro sobre fondo oscuro',
                    'No distorsionar ni cambiar proporciones',
                    'No cambiar los colores del gradiente',
                    'No añadir sombra al logo',
                    'No usar en tamaño menor de 24px de alto',
                  ].map(t => (
                    <li key={t} className="text-xs text-white/50 flex items-start gap-2">
                      <div className="w-3 h-0.5 bg-red-400 mt-2 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* ════ COMPONENTS ════ */}
          <Section id="components">
            <SectionHeader
              title="Componentes"
              desc="Biblioteca de componentes base. Construidos sobre Radix UI + Tailwind, accesibles y consistentes."
              icon={<Box className="w-5 h-5 text-violet-400" />}
            />

            <div className="space-y-6">
              {/* Buttons */}
              <ComponentBlock title="Buttons" code={`<button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium text-sm">\n  Primario\n</button>`}>
                <div className="flex flex-wrap gap-3">
                  {COMPONENTS_PREVIEW.buttons.map(({ label, cls, disabled }) => (
                    <button key={label} className={cls} disabled={disabled}>{label}</button>
                  ))}
                </div>
              </ComponentBlock>

              {/* Badges */}
              <ComponentBlock title="Badges" code={`<span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">\n  Activo\n</span>`}>
                <div className="flex flex-wrap gap-2">
                  {COMPONENTS_PREVIEW.badges.map(({ label, cls }) => (
                    <span key={label} className={cls}>{label}</span>
                  ))}
                </div>
              </ComponentBlock>

              {/* Cards */}
              <ComponentBlock title="Cards" code={`<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">\n  {children}\n</div>`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { title: 'Card base',   sub: 'Contenido general', icon: Home,    bg: 'bg-indigo-50',  ic: 'text-indigo-600' },
                    { title: 'Card metric', sub: '1,247 consultas',   icon: BarChart2,bg: 'bg-violet-50', ic: 'text-violet-600' },
                    { title: 'Card action', sub: 'Ver detalle →',     icon: ArrowRight,bg: 'bg-gray-50',  ic: 'text-gray-500'  },
                  ].map(({ title, sub, icon: Icon, bg, ic }) => (
                    <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className={`w-4 h-4 ${ic}`} />
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>
              </ComponentBlock>

              {/* Inputs */}
              <ComponentBlock title="Inputs" code={`<input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Nombre de propiedad</label>
                    <input
                      type="text"
                      placeholder="Ej: Apartamento Playa"
                      defaultValue=""
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Búsqueda</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Estado (error)</label>
                    <input
                      type="text"
                      defaultValue="Valor incorrecto"
                      className="w-full border border-red-300 bg-red-50 rounded-xl px-4 py-2.5 text-sm text-red-600 outline-none"
                    />
                    <p className="text-xs text-red-500 mt-1">Campo obligatorio</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Estado (éxito)</label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="Alicante centro"
                        className="w-full border border-emerald-300 bg-emerald-50 rounded-xl px-4 py-2.5 text-sm text-emerald-700 outline-none pr-10"
                      />
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </ComponentBlock>

              {/* Notifications */}
              <ComponentBlock title="Alerts & Toasts" code={`<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">\n  ...\n</div>`}>
                <div className="space-y-2 max-w-md">
                  {[
                    { type: 'success', msg: 'Propiedad publicada correctamente.', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', dot: 'bg-emerald-500' },
                    { type: 'warning', msg: 'Tu prueba caduca en 3 días. Activa tu plan.', color: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500' },
                    { type: 'error',   msg: 'Error al guardar. Comprueba tu conexión.', color: 'bg-red-50 border-red-200 text-red-800', dot: 'bg-red-500' },
                    { type: 'info',    msg: 'Nuevo mensaje de un huésped esperando.', color: 'bg-blue-50 border-blue-200 text-blue-800', dot: 'bg-blue-500' },
                  ].map(({ type, msg, color, dot }) => (
                    <div key={type} className={`${color} border rounded-xl px-4 py-3 flex items-center gap-3 text-sm`}>
                      <div className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
                      {msg}
                    </div>
                  ))}
                </div>
              </ComponentBlock>

              {/* Zone Card */}
              <ComponentBlock title="Zone Cards (native)" code={`// Tarjetas de zona — homepage de la guía pública\n<div className="bg-white rounded-2xl shadow-lg overflow-hidden">`}>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { icon: '🔑', name: 'Check-in',   sub: '4 pasos',  color: 'from-blue-400 to-indigo-500' },
                    { icon: '📶', name: 'WiFi',        sub: '2 pasos',  color: 'from-violet-400 to-purple-500' },
                    { icon: '🍳', name: 'Cocina',      sub: '6 pasos',  color: 'from-amber-400 to-orange-500' },
                    { icon: '🌊', name: 'Playa',       sub: '5 recom',  color: 'from-cyan-400 to-blue-500' },
                    { icon: '🅿️', name: 'Parking',    sub: '3 pasos',  color: 'from-emerald-400 to-teal-500' },
                    { icon: '🍽️', name: 'Restaurantes',sub: '8 recom', color: 'from-rose-400 to-pink-500' },
                  ].map(({ icon, name, sub, color }) => (
                    <div key={name} className="w-24 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                      <div className={`h-14 bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <span className="text-2xl">{icon}</span>
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
                        <p className="text-[9px] text-gray-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentBlock>
            </div>
          </Section>

          {/* ════ SCREENS ════ */}
          <Section id="screens">
            <SectionHeader
              title="Pantallas reales"
              desc="Interfaces del producto tal como las ve el usuario. Dashboard, guía pública, detalle de zona y analítica del chatbot."
              icon={<Monitor className="w-5 h-5 text-violet-400" />}
            />

            <div className="space-y-12">
              {/* Dashboard */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="w-4 h-4 text-white/30" />
                  <span className="text-sm font-bold text-white/60">Dashboard — Panel del host</span>
                  <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">/main</span>
                </div>
                <BrowserFrame url="itineramio.com/main">
                  <DashboardScreen />
                </BrowserFrame>
              </div>

              {/* Guide + Zone — side by side */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-4 h-4 text-white/30" />
                  <span className="text-sm font-bold text-white/60">Guía pública — Vista del huésped</span>
                  <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">/guide/[slug]</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  <PhoneFrame>
                    <GuideScreen />
                  </PhoneFrame>
                  <PhoneFrame>
                    <ZoneScreen />
                  </PhoneFrame>
                  <div className="flex flex-col gap-4 pt-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Diseño guía pública</p>
                      <ul className="space-y-3">
                        {[
                          { t: 'Mobile-first', d: 'Optimizada para móvil. El huésped accede desde QR.' },
                          { t: 'Hero con degradado', d: 'Indigo → violeta. Foto de portada con overlay.' },
                          { t: 'Grid de zonas', d: '3 columnas. Icono + gradiente único por zona.' },
                          { t: 'Progress steps', d: 'Barra de progreso por zona. Checkmarks al completar.' },
                          { t: 'ChatBot IA flotante', d: 'Botón fijo bottom-right. Responde 24/7.' },
                        ].map(({ t, d }) => (
                          <li key={t} className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-white/70">{t}</p>
                              <p className="text-[11px] text-white/30">{d}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart2 className="w-4 h-4 text-white/30" />
                  <span className="text-sm font-bold text-white/60">Analítica del Chatbot IA</span>
                  <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">/properties/[id]/chatbot</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  <PhoneFrame>
                    <AnalyticsScreen />
                  </PhoneFrame>
                  <div className="md:col-span-2">
                    <BrowserFrame url="itineramio.com/properties/abc123/chatbot">
                      <div className="bg-gray-50 p-5 min-h-[300px]">
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {[
                            { l: 'Consultas', v: '1,247', t: '+18%', c: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { l: 'Satisfacción', v: '94%', t: '+3%', c: 'text-amber-600', bg: 'bg-amber-50' },
                            { l: 'Resueltas IA', v: '89%', t: '+5%', c: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { l: 'Avg respuesta', v: '0.8s', t: '-12%', c: 'text-violet-600', bg: 'bg-violet-50' },
                          ].map(({ l, v, t, c, bg }) => (
                            <div key={l} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                              <p className={`text-xl font-black ${c}`}>{v}</p>
                              <p className="text-[9px] text-gray-400">{l}</p>
                              <p className="text-[9px] text-emerald-500 font-medium mt-0.5">{t}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                          <p className="text-xs font-semibold text-gray-600 mb-3">Consultas mensuales</p>
                          <div className="flex items-end gap-3 h-32">
                            {['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'].map((m, i) => {
                              const heights = [42, 67, 89, 55, 78, 94]
                              const h = heights[i]
                              return (
                                <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
                                  <div
                                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-400"
                                    style={{ height: `${h * 1.1}px` }}
                                  />
                                  <span className="text-[9px] text-gray-400">{m}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </BrowserFrame>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ════ TOKENS ════ */}
          <Section id="tokens">
            <SectionHeader
              title="Design Tokens"
              desc="Sombras, radios de borde, espaciado y animaciones. Los átomos que definen la física visual del producto."
              icon={<Layers className="w-5 h-5 text-violet-400" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shadows */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Sombras</p>
                <div className="space-y-3">
                  {SHADOWS.map(({ name, class: cls, css }) => (
                    <div key={name} className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-white rounded-xl ${cls} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-white/60 font-bold">{name}</p>
                        <p className="text-[10px] font-mono text-white/25 truncate">{css}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Border radius */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Border Radius</p>
                <div className="grid grid-cols-2 gap-3">
                  {RADIUS.map(({ name, value, class: cls }) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 flex-shrink-0 ${cls}`} />
                      <div>
                        <p className="text-[11px] font-mono text-white/60">{name}</p>
                        <p className="text-[10px] text-white/25">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Spacing Scale</p>
                <div className="flex items-end gap-2">
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map(n => (
                    <div key={n} className="flex flex-col items-center gap-1.5">
                      <div
                        className="bg-gradient-to-t from-violet-500 to-indigo-400 rounded-sm w-5"
                        style={{ height: `${n * 4}px` }}
                      />
                      <span className="text-[8px] font-mono text-white/30">{n}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/20 mt-3 font-mono">Base: 4px · 1 unit = 4px</p>
              </div>

              {/* Animations */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Animaciones</p>
                <div className="space-y-3">
                  {[
                    { name: 'fade-in',       duration: '0.3s', ease: 'ease-out',   desc: 'Entrada de elementos UI' },
                    { name: 'slide-up',      duration: '0.4s', ease: 'ease-out',   desc: 'Modales y drawers' },
                    { name: 'bounce-subtle', duration: '2s',   ease: 'ease-in-out',desc: 'Indicadores de atención' },
                    { name: 'accordion',     duration: '0.2s', ease: 'ease-out',   desc: 'Radix UI acordeón' },
                    { name: 'framer spring', duration: '0.5s', ease: 'spring',     desc: 'Interacciones rich UI' },
                  ].map(({ name, duration, ease, desc }) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-16 flex-shrink-0">
                        <div className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-mono text-white/60 font-bold">{name}</p>
                        <p className="text-[9px] text-white/25">{duration} · {ease} · {desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ════ VOICE & TONE ════ */}
          <Section id="voice">
            <SectionHeader
              title="Voz y tono"
              desc="Cómo hablamos a hosts y huéspedes. El copy es parte del diseño — consistente, humano y profesional."
              icon={<MessageCircle className="w-5 h-5 text-violet-400" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { trait: 'Profesional sin ser frío', desc: 'Hablamos de igual a igual con hosts que gestionan propiedades. Respeto sin distancia.', icon: '🤝' },
                { trait: 'Claro y directo',          desc: 'Sin rodeos. El host tiene poco tiempo. Mensajes de una sola idea, sin ambigüedad.', icon: '💡' },
                { trait: 'Empático con el huésped',  desc: 'El huésped está en un lugar nuevo. Nos anticipamos a sus dudas con calidez.', icon: '🏠' },
                { trait: 'Tecnología accesible',     desc: 'IA y automatización son las palabras clave, pero las explicamos en beneficios concretos.', icon: '⚡' },
              ].map(({ trait, desc, icon }) => (
                <div key={trait} className="bg-[#111] border border-white/10 rounded-2xl p-5">
                  <span className="text-2xl mb-3 block">{icon}</span>
                  <h4 className="font-bold text-white text-sm mb-1">{trait}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Examples */}
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Ejemplos de copy</p>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { ctx: 'CTA principal',     good: 'Crea tu primera guía gratis',        bad: 'Regístrate ahora' },
                  { ctx: 'Error de formulario', good: 'El email no tiene un formato válido', bad: 'Email inválido' },
                  { ctx: 'Estado vacío',      good: 'Aún no tienes propiedades. ¡Empieza añadiendo la primera!', bad: 'No hay datos' },
                  { ctx: 'Confirmación',      good: 'Guía publicada. Tus huéspedes ya pueden acceder.',          bad: 'Éxito' },
                  { ctx: 'Chatbot bienvenida',good: '¡Hola! Soy el asistente de {propiedad} 👋 Pregúntame cualquier cosa.',  bad: 'Chatbot activo. Escribe tu pregunta.' },
                ].map(({ ctx, good, bad }) => (
                  <div key={ctx} className="grid grid-cols-[120px_1fr_1fr] gap-4 px-5 py-4">
                    <span className="text-[10px] text-white/30 font-mono">{ctx}</span>
                    <div className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white/60">{good}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full border border-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-white/30 line-through">{bad}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-white/5 pt-10 pb-16 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/isotipe.svg" alt="Itineramio" width={20} height={20} />
              <span className="text-white/20 text-xs">Itineramio Design System · v2.0 · 2026</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/20">
              <span>Actualizado marzo 2026</span>
              <span>·</span>
              <a href="/design/style-guide" className="hover:text-white/40 transition-colors">Design System</a>
              <span>·</span>
              <a href="/" className="hover:text-white/40 transition-colors">itineramio.com</a>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-white/40 text-sm leading-relaxed max-w-2xl">{desc}</p>
      </div>
    </div>
  )
}

// ─── Component Block ─────────────────────────────────────────────────────────

function ComponentBlock({ title, children, code }: { title: string, children: React.ReactNode, code?: string }) {
  const [showCode, setShowCode] = useState(false)
  const { copied, copy } = useCopy()

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <span className="text-xs font-bold text-white/50">{title}</span>
        {code && (
          <button
            onClick={() => setShowCode(!showCode)}
            className="text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" />
            {showCode ? 'Ocultar código' : 'Ver código'}
          </button>
        )}
      </div>
      <div className="p-6 bg-white rounded-none">
        {children}
      </div>
      {showCode && code && (
        <div className="border-t border-white/5 relative">
          <button
            onClick={() => copy(code, `code-${title}`)}
            className="absolute top-3 right-4 text-[10px] text-white/30 hover:text-white/60 flex items-center gap-1"
          >
            {copied === `code-${title}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <pre className="p-5 text-[11px] font-mono text-white/50 overflow-x-auto leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
