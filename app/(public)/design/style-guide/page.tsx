'use client'

import { useState } from 'react'
import {
  Check, Copy, Download, ChevronRight,
  Palette, Type, Box, Sparkles, Image as ImageIcon,
  Monitor, Smartphone, Layers, Zap, ArrowRight, Globe,
  Star, Shield, Bell, Settings, Home, Map, MessageCircle,
  Calendar, BarChart2, BookOpen, QrCode, Search,
  CheckCircle2, Eye, Sun, Moon,
  // Zone icons reales de la app
  ChefHat, Utensils, Coffee, Refrigerator, Flame, Wine,
  Bed, Lamp, Lightbulb, Fan, Armchair,
  Bath, Droplets,
  Sofa, Tv, Volume2, Gamepad2,
  DoorOpen, Key, Lock, Camera,
  Trees, Car, Bike, Waves,
  Wifi, Thermometer, Wind,
  Plane, Compass, Mountain, Umbrella,
  Info, Scissors, ShowerHead, Shirt,
} from 'lucide-react'

// ─── Theme ─────────────────────────────────────────────────────────────────

type Theme = 'dark' | 'light'

// ─── Copy helper ───────────────────────────────────────────────────────────

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

// ─── Infinity logo paths (logo-itineramio.svg) ─────────────────────────────

const INF_PATHS = [
  { type: 'stroke', d: 'M123.34 44.7245L112.607 53.6594L132.443 69.8455C133.344 70.5824 134.387 71.2027 135.527 71.6601C139.241 73.1402 147.773 75.5045 157.981 69.8791C172.84 61.6754 164.645 45.4257 163.177 43.566', sw: 10, cap: 'round' as const },
  { type: 'fill',   d: 'M108.092 32.1245C110.237 30.3864 110.568 27.2378 108.83 25.0921C107.091 22.9463 103.943 22.6159 101.797 24.3541L104.944 28.2393L108.092 32.1245ZM92.9446 37.9599L96.0918 41.8452L108.092 32.1245L104.944 28.2393L101.797 24.3541L89.7973 34.0747L92.9446 37.9599Z', sw: 0 },
  { type: 'stroke', d: 'M181.884 24.5146C189.23 35.2595 190.799 47.2539 188.215 60.0171', sw: 10 },
  { type: 'stroke', d: 'M5.53057 58.7791C5.53057 58.7791 7.35412 72.7401 19.2757 83.5876C22.13 86.1931 31.8263 94.551 46.7103 95.5529C66.571 96.9067 79.8677 84.1505 81.9592 82.0792L97.3746 66.6829L112.771 82.0984C117.991 87.322 124.37 91.2585 131.42 93.4503C142.047 96.7418 157.391 98.0816 171.693 86.6627C181.913 78.5043 186.43 68.7455 188.215 60.0176', sw: 10 },
  { type: 'stroke', d: 'M98.842 37.5615L76.6314 14.9518C76.2412 14.569 75.8151 14.2169 75.3698 13.8969C70.9518 10.6665 48.2872 -3.48163 22.3513 15.0626C22.3513 15.0626 1.44432 30.0334 5.53005 58.7954', sw: 10 },
  { type: 'stroke', d: 'M64.0331 33.6563C63.675 33.2927 63.2964 32.9779 62.8831 32.6772C59.818 30.408 47.8499 22.5458 35.1527 33.4173C20.7648 45.7363 29.885 60.6655 29.885 60.6655C29.885 60.6655 36.7732 73.8435 50.2481 73.3088C50.2481 73.3088 58.11 73.9178 62.3971 69.5146L82.0403 50.483L64.0331 33.6563Z', sw: 10 },
  { type: 'stroke', d: 'M157.264 34.028L153.267 29.0456C152.289 27.8172 152.436 26.196 153.61 25.2273L171.265 10.5469C172.323 9.68064 174.079 9.86666 174.945 10.9677L180.648 18.0767C181.517 19.1606 181.323 20.6136 180.182 21.4109L161.26 34.6319C160.052 35.4701 158.214 35.198 157.264 34.028Z', sw: 5 },
  { type: 'stroke', d: 'M114.324 11.614L109.927 15.8166C108.85 16.8537 108.786 18.4023 109.773 19.4635L124.6 35.5303C125.49 36.4803 127.171 36.5247 128.126 35.5938L134.399 29.5975C135.355 28.6831 135.354 27.2875 134.376 26.392L118.171 11.5442C117.136 10.6018 115.367 10.6286 114.324 11.614Z', sw: 5 },
  { type: 'stroke', d: 'M142.718 24.813L145.792 24.7246C146.589 24.71 147.323 24.0518 147.579 23.0997L155.469 5.73167C155.919 4.11302 155.004 2.48029 153.635 2.50019L134.58 2.61179C133.363 2.61419 132.551 4.24425 133.114 5.52823L140.854 23.4706C141.21 24.3187 141.92 24.8276 142.718 24.813Z', sw: 5 },
]

// Isotipo plano — solo los trazos del infinito (negro / blanco)
function InfinityLogo({ color = '#000', size = 160 }: { color?: string, size?: number }) {
  const h = Math.round(size * (107 / 195))
  return (
    <svg width={size} height={h} viewBox="0 0 195 107" fill="none" xmlns="http://www.w3.org/2000/svg">
      {INF_PATHS.map((p, i) => p.type === 'fill'
        ? <path key={i} d={p.d} fill={color} />
        : <path key={i} d={p.d} stroke={color} strokeWidth={p.sw} strokeMiterlimit="10" strokeLinecap={p.cap ?? 'butt'} />
      )}
    </svg>
  )
}

// Logo principal — círculo con gradiente de marca + infinito en blanco
// Gradiente real: #FF07AB → #FF2E76 → #FF4D4D
const INF_BG_PATHS = [
  { type: 'stroke', d: 'M176.396 141.485L165.662 150.42L185.499 166.606C186.399 167.343 187.443 167.963 188.583 168.421C192.296 169.901 200.828 172.265 211.037 166.64C225.895 158.436 217.7 142.186 216.232 140.327', sw: 10, cap: 'round' as const },
  { type: 'fill',   d: 'M161.147 128.885C163.293 127.147 163.623 123.999 161.885 121.853C160.147 119.707 156.999 119.377 154.853 121.115L158 125L161.147 128.885ZM146 134.721L149.147 138.606L161.147 128.885L158 125L154.853 121.115L142.853 130.835L146 134.721Z', sw: 0 },
  { type: 'stroke', d: 'M234.94 121.275C242.285 132.02 243.855 144.015 241.271 156.778', sw: 10 },
  { type: 'stroke', d: 'M58.5862 155.54C58.5862 155.54 60.4098 169.501 72.3313 180.348C75.1856 182.954 84.882 191.312 99.766 192.314C119.627 193.667 132.923 180.911 135.015 178.84L150.43 163.444L165.827 178.859C171.047 184.083 177.425 188.019 184.476 190.211C195.102 193.503 210.447 194.842 224.748 183.423C234.969 175.265 239.486 165.506 241.27 156.778', sw: 10 },
  { type: 'stroke', d: 'M151.898 134.322L129.687 111.713C129.297 111.33 128.871 110.978 128.425 110.658C124.008 107.427 101.343 93.2791 75.407 111.823C75.407 111.823 54.5 126.794 58.5857 155.556', sw: 10 },
  { type: 'stroke', d: 'M117.089 130.417C116.731 130.053 116.352 129.739 115.939 129.438C112.874 127.169 100.906 119.307 88.2083 130.178C73.8205 142.497 82.9407 157.426 82.9407 157.426C82.9407 157.426 89.8289 170.604 103.304 170.07C103.304 170.07 111.166 170.679 115.453 166.275L135.096 147.244L117.089 130.417Z', sw: 10 },
  { type: 'stroke', d: 'M210.32 130.789L206.323 125.806C205.345 124.578 205.492 122.957 206.665 121.988L224.321 107.308C225.378 106.441 227.135 106.627 228.001 107.728L233.704 114.837C234.572 115.921 234.379 117.374 233.237 118.172L214.316 131.393C213.108 132.231 211.27 131.959 210.32 130.789Z', sw: 5 },
  { type: 'stroke', d: 'M167.379 108.375L162.983 112.577C161.906 113.614 161.842 115.163 162.828 116.224L177.656 132.291C178.545 133.241 180.227 133.285 181.182 132.355L187.454 126.358C188.41 125.444 188.41 124.048 187.432 123.153L171.227 108.305C170.192 107.363 168.423 107.389 167.379 108.375Z', sw: 5 },
  { type: 'stroke', d: 'M195.773 121.574L198.847 121.485C199.645 121.471 200.379 120.813 200.635 119.86L208.525 102.492C208.975 100.874 208.06 99.241 206.691 99.2609L187.636 99.3725C186.419 99.3749 185.607 101.005 186.17 102.289L193.91 120.231C194.266 121.079 194.976 121.588 195.773 121.574Z', sw: 5 },
]

function InfinityLogoBadge({ size = 200 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brandGrad" x1="150" y1="0" x2="150" y2="300" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF07AB" />
          <stop offset="0.557292" stopColor="#FF2E76" />
          <stop offset="1" stopColor="#FF4D4D" />
        </linearGradient>
      </defs>
      <circle cx="150" cy="150" r="150" fill="url(#brandGrad)" />
      {INF_BG_PATHS.map((p, i) => p.type === 'fill'
        ? <path key={i} d={p.d} fill="white" />
        : <path key={i} d={p.d} stroke="white" strokeWidth={p.sw} strokeMiterlimit="10" strokeLinecap={p.cap ?? 'butt'} />
      )}
    </svg>
  )
}

// ─── Color data ────────────────────────────────────────────────────────────

const COLORS = {
  brand: [
    { name: 'Brand 50',  hex: '#f0f0ff', dark: false },
    { name: 'Brand 100', hex: '#e6e6ff', dark: false },
    { name: 'Brand 200', hex: '#d1d1ff', dark: false },
    { name: 'Brand 300', hex: '#a5b4fc', dark: false },
    { name: 'Brand 400', hex: '#818cf8', dark: false },
    { name: 'Brand 500', hex: '#6366f1', dark: true,  primary: true },
    { name: 'Brand 600', hex: '#4338ca', dark: true  },
    { name: 'Brand 700', hex: '#3730a3', dark: true  },
    { name: 'Brand 800', hex: '#312e81', dark: true  },
    { name: 'Brand 900', hex: '#1e1b4b', dark: true  },
    { name: 'Brand 950', hex: '#0f0c29', dark: true  },
  ],
  accent: [
    { name: 'Violet 50',  hex: '#faf5ff', dark: false },
    { name: 'Violet 100', hex: '#f3e8ff', dark: false },
    { name: 'Violet 200', hex: '#e9d5ff', dark: false },
    { name: 'Violet 300', hex: '#d8b4fe', dark: false },
    { name: 'Violet 400', hex: '#c084fc', dark: false },
    { name: 'Violet 500', hex: '#8b5cf6', dark: true, primary: true },
    { name: 'Violet 600', hex: '#7c3aed', dark: true  },
    { name: 'Violet 700', hex: '#6d28d9', dark: true  },
    { name: 'Violet 800', hex: '#5b21b6', dark: true  },
    { name: 'Violet 900', hex: '#4c1d95', dark: true  },
  ],
  guide: [
    { name: 'Text Primary',  hex: '#222222', dark: true,  primary: true },
    { name: 'Text Body',     hex: '#484848', dark: true  },
    { name: 'Text Muted',    hex: '#717171', dark: false },
    { name: 'Success',       hex: '#008A05', dark: true  },
    { name: 'Subtle BG',     hex: '#F7F7F7', dark: false },
    { name: 'WhatsApp',      hex: '#25D366', dark: true  },
  ],
  semantic: [
    { name: 'Emerald',   hex: '#10b981', dark: true  },
    { name: 'Amber',     hex: '#f59e0b', dark: false },
    { name: 'Red',       hex: '#ef4444', dark: true  },
    { name: 'Blue',      hex: '#3b82f6', dark: true  },
  ],
}

// ─── Zone icons (los reales de la app — Lucide React) ──────────────────────

const ZONE_ICONS = [
  // Cocina
  { id: 'kitchen',      Icon: ChefHat,        label: 'Cocina',         cat: 'Cocina'    },
  { id: 'utensils',     Icon: Utensils,        label: 'Utensilios',     cat: 'Cocina'    },
  { id: 'coffee',       Icon: Coffee,          label: 'Café',           cat: 'Cocina'    },
  { id: 'refrigerator', Icon: Refrigerator,    label: 'Frigorífico',    cat: 'Cocina'    },
  { id: 'cooktop',      Icon: Flame,           label: 'Vitrocerámica',  cat: 'Cocina'    },
  { id: 'wine',         Icon: Wine,            label: 'Vinos',          cat: 'Cocina'    },
  // Dormitorio
  { id: 'bed',          Icon: Bed,             label: 'Dormitorio',     cat: 'Dormitorio'},
  { id: 'lamp',         Icon: Lamp,            label: 'Lámpara',        cat: 'Dormitorio'},
  { id: 'lightbulb',    Icon: Lightbulb,       label: 'Luz',            cat: 'Dormitorio'},
  { id: 'fan',          Icon: Fan,             label: 'Ventilador',     cat: 'Dormitorio'},
  { id: 'armchair',     Icon: Armchair,        label: 'Salón',          cat: 'Dormitorio'},
  // Baño
  { id: 'bath',         Icon: Bath,            label: 'Bañera',         cat: 'Baño'      },
  { id: 'shower',       Icon: ShowerHead,      label: 'Ducha',          cat: 'Baño'      },
  { id: 'droplets',     Icon: Droplets,        label: 'Agua',           cat: 'Baño'      },
  { id: 'scissors',     Icon: Scissors,        label: 'Secador',        cat: 'Baño'      },
  // Salón
  { id: 'sofa',         Icon: Sofa,            label: 'Sofá',           cat: 'Salón'     },
  { id: 'tv',           Icon: Tv,              label: 'TV',             cat: 'Salón'     },
  { id: 'volume',       Icon: Volume2,         label: 'Audio',          cat: 'Salón'     },
  { id: 'gamepad',      Icon: Gamepad2,        label: 'Videojuegos',    cat: 'Salón'     },
  // Acceso
  { id: 'door',         Icon: DoorOpen,        label: 'Entrada',        cat: 'Acceso'    },
  { id: 'key',          Icon: Key,             label: 'Llaves',         cat: 'Acceso'    },
  { id: 'lock',         Icon: Lock,            label: 'Caja fuerte',    cat: 'Acceso'    },
  { id: 'camera',       Icon: Camera,          label: 'Seguridad',      cat: 'Acceso'    },
  // Exterior
  { id: 'trees',        Icon: Trees,           label: 'Jardín',         cat: 'Exterior'  },
  { id: 'car',          Icon: Car,             label: 'Parking',        cat: 'Exterior'  },
  { id: 'bike',         Icon: Bike,            label: 'Bicicleta',      cat: 'Exterior'  },
  { id: 'waves',        Icon: Waves,           label: 'Piscina',        cat: 'Exterior'  },
  // Servicios
  { id: 'washing',      Icon: Shirt,           label: 'Lavadora',       cat: 'Servicios' },
  { id: 'wifi',         Icon: Wifi,            label: 'WiFi',           cat: 'Servicios' },
  { id: 'thermometer',  Icon: Thermometer,     label: 'Calefacción',    cat: 'Servicios' },
  { id: 'wind',         Icon: Wind,            label: 'Aire acond.',    cat: 'Servicios' },
  // Viajes
  { id: 'plane',        Icon: Plane,           label: 'Transporte',     cat: 'Viajes'    },
  { id: 'compass',      Icon: Compass,         label: 'Turismo',        cat: 'Viajes'    },
  { id: 'mountain',     Icon: Mountain,        label: 'Montaña',        cat: 'Viajes'    },
  { id: 'umbrella',     Icon: Umbrella,        label: 'Playa',          cat: 'Viajes'    },
]

// ─── Typography scale ──────────────────────────────────────────────────────

const TYPOGRAPHY = [
  { name: 'Display',  size: '4.5rem',   weight: '800', lh: '1',    sample: 'Crea guías que enamoran',   cls: 'text-[3.5rem] font-extrabold leading-none'   },
  { name: 'H1',       size: '3rem',     weight: '700', lh: '1.1',  sample: 'Property Manual Creator',   cls: 'text-4xl font-bold leading-tight'             },
  { name: 'H2',       size: '2.25rem',  weight: '700', lh: '1.2',  sample: 'Zonas, pasos y medios',      cls: 'text-3xl font-bold leading-snug'              },
  { name: 'H3',       size: '1.875rem', weight: '600', lh: '1.3',  sample: 'Check-in sin fricción',      cls: 'text-2xl font-semibold'                       },
  { name: 'H4',       size: '1.5rem',   weight: '600', lh: '1.4',  sample: 'Instrucciones WiFi',         cls: 'text-xl font-semibold'                        },
  { name: 'Body LG',  size: '1.125rem', weight: '400', lh: '1.75', sample: 'Texto amplio para descripciones largas.', cls: 'text-lg'                         },
  { name: 'Body',     size: '1rem',     weight: '400', lh: '1.75', sample: 'Texto base de la interfaz.', cls: 'text-base'                                    },
  { name: 'Body SM',  size: '0.875rem', weight: '400', lh: '1.5',  sample: 'Texto pequeño para etiquetas.', cls: 'text-sm'                                  },
  { name: 'Caption',  size: '0.75rem',  weight: '500', lh: '1.4',  sample: 'CAPTION — TAGS Y METADATOS', cls: 'text-xs font-medium uppercase tracking-wider' },
]

// ─── Nav ───────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'brand',      label: 'Marca'       },
  { id: 'logos',      label: 'Logotipo'    },
  { id: 'colors',     label: 'Colores'     },
  { id: 'typography', label: 'Tipografía'  },
  { id: 'icons',      label: 'Iconos'      },
  { id: 'components', label: 'Componentes' },
  { id: 'screens',    label: 'Pantallas'   },
  { id: 'tokens',     label: 'Tokens'      },
  { id: 'marketing',  label: 'Marketing'   },
]

// ─── Color swatch ──────────────────────────────────────────────────────────

function ColorSwatch({ color, copied, onCopy }: { color: any, copied: string | null, onCopy: (h: string, id: string) => void }) {
  const id = color.hex
  return (
    <div
      className={`relative group cursor-pointer rounded-xl overflow-hidden border transition-transform hover:scale-105 ${color.dark ? 'border-white/10' : 'border-black/10'} ${color.primary ? 'ring-2 ring-offset-1 ring-violet-400' : ''}`}
      style={{ backgroundColor: color.hex }}
      onClick={() => onCopy(color.hex, id)}
    >
      <div className="h-16 w-full" />
      <div className={`px-2 py-1.5 ${color.dark ? 'bg-black/30 text-white' : 'bg-white/60 text-gray-800'}`}>
        <p className="text-[10px] font-semibold truncate">{color.name}</p>
        <p className={`text-[9px] font-mono ${color.dark ? 'text-white/60' : 'text-gray-500'}`}>{color.hex}</p>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${color.dark ? 'bg-black/40' : 'bg-white/60'}`}>
        {copied === id ? <Check className={`w-4 h-4 ${color.dark ? 'text-white' : 'text-gray-800'}`} /> : <Copy className={`w-3.5 h-3.5 ${color.dark ? 'text-white' : 'text-gray-800'}`} />}
      </div>
    </div>
  )
}

// ─── Browser / Phone frames ────────────────────────────────────────────────

function BrowserFrame({ children, url = 'itineramio.com' }: { children: React.ReactNode, url?: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#1a1a1a]">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#2a2a2a] border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="flex-1 mx-4">
          <div className="bg-[#1a1a1a] rounded-md px-3 py-1 text-[11px] text-gray-400 font-mono flex items-center gap-2">
            <Shield className="w-3 h-3 text-gray-500 flex-shrink-0" />{url}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[240px] mx-auto">
      <div className="absolute inset-0 rounded-[40px] bg-[#1a1a1a] border-4 border-[#2a2a2a] shadow-2xl" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1a1a1a] rounded-b-2xl z-10" />
      <div className="relative pt-9 pb-6 mx-1 rounded-[36px] overflow-hidden bg-gray-50 min-h-[500px]">
        {children}
      </div>
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#2a2a2a] rounded-full" />
    </div>
  )
}

// ─── App screen mockups ────────────────────────────────────────────────────

function DashboardScreen() {
  return (
    <div className="bg-gray-50 min-h-[440px] flex flex-col text-[11px]">
      {/* Navbar horizontal — refleja la app real */}
      <div className="bg-white border-b border-neutral-100 px-4 h-12 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <InfinityLogo color="#fff" size={16} />
          </div>
          <span className="font-semibold text-gray-800 text-[11px]">Itineramio</span>
        </div>
        <nav className="flex items-center gap-0.5">
          {[
            { label: 'Home',       active: true  },
            { label: 'Properties', active: false },
            { label: 'Sets',       active: false },
            { label: 'Gestion',    active: false },
            { label: 'Guides',     active: false },
          ].map(({ label, active }) => (
            <div key={label} className={`relative px-2.5 py-2 text-[10px] font-medium ${active ? 'text-violet-600' : 'text-gray-700'}`}>
              {label}
              {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0" />
          <div className="flex flex-col gap-[3px] cursor-pointer pl-1">
            <div className="w-3.5 h-[2px] bg-gray-500 rounded" />
            <div className="w-3.5 h-[2px] bg-gray-500 rounded" />
            <div className="w-3.5 h-[2px] bg-gray-500 rounded" />
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-gray-900 text-[12px]">Buenos días 👋</p>
            <p className="text-gray-400 text-[9px]">Martes 25 de marzo, 2026</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[{ l: 'Propiedades', v: '4', I: Home, c: 'text-violet-600', bg: 'bg-violet-50' }, { l: 'Reservas mes', v: '23', I: Calendar, c: 'text-emerald-600', bg: 'bg-emerald-50' }, { l: 'Consultas IA', v: '187', I: MessageCircle, c: 'text-violet-600', bg: 'bg-violet-50' }].map(({ l, v, I, c, bg }) => (
            <div key={l} className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm">
              <div className={`w-5 h-5 ${bg} rounded-lg flex items-center justify-center mb-1.5`}><I className={`w-2.5 h-2.5 ${c}`} /></div>
              <p className="text-base font-bold text-gray-900">{v}</p>
              <p className="text-[8px] text-gray-400">{l}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-50 flex justify-between items-center">
            <span className="text-[10px] font-semibold text-gray-700">Propiedades</span>
            <span className="text-[8px] text-violet-600">Ver todas →</span>
          </div>
          {[{ n: 'Mercado Central', l: 'Alicante', s: 'Activa', sc: 'bg-emerald-100 text-emerald-700' }, { n: 'Playa San Juan', l: 'Alicante', s: 'Activa', sc: 'bg-emerald-100 text-emerald-700' }, { n: 'Villa Moraira', l: 'Moraira', s: 'Borrador', sc: 'bg-amber-100 text-amber-700' }].map(({ n, l, s, sc }) => (
            <div key={n} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center"><Home className="w-2.5 h-2.5 text-white" /></div>
                <div><p className="text-[10px] font-medium text-gray-800">{n}</p><p className="text-[8px] text-gray-400">{l}</p></div>
              </div>
              <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${sc}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GuideScreen() {
  const zones = [
    { icon: Key,      name: 'Check-in',    color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { icon: Wifi,     name: 'WiFi',         color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { icon: ChefHat,  name: 'Cocina',       color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { icon: Car,      name: 'Parking',      color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { icon: Waves,    name: 'Piscina',      color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { icon: Utensils, name: 'Restaurantes', color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
  ]
  return (
    <div className="bg-white min-h-[500px]">
      {/* Header — white sticky, real app style */}
      <div className="bg-white/95 border-b border-gray-100 px-3 py-2.5 flex items-center justify-between">
        <button className="p-1 rounded-full hover:bg-gray-100">
          <ArrowRight className="w-3.5 h-3.5 text-[#222222] rotate-180" />
        </button>
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-gray-400" />
          <span className="text-[9px] text-gray-400">ES</span>
        </div>
      </div>
      {/* Property header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[13px] font-semibold text-[#222222] leading-tight">Mercado Central</h1>
            <p className="text-[9px] text-[#717171]">4Pax · Centro Alicante</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
          <span className="text-[9px] text-[#717171] ml-1">4.9 · 47 reseñas</span>
        </div>
      </div>
      {/* Zone grid */}
      <div className="px-3 py-3">
        <p className="text-[9px] font-semibold text-[#717171] uppercase tracking-wider mb-2">Manual de la propiedad</p>
        <div className="grid grid-cols-2 gap-2">
          {zones.slice(0, 4).map(({ icon: I, name, color }) => (
            <button key={name} className="flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 rounded-xl text-left hover:border-[#222222] hover:shadow-md transition-all">
              <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <I className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-medium text-[#222222] truncate">{name}</p>
            </button>
          ))}
        </div>
        {/* AI chatbot button */}
        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-2.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-[#222222]">Asistente IA 24/7</p>
            <p className="text-[8px] text-[#717171]">¿Tienes dudas? Pregúntame</p>
          </div>
          <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
        </div>
        {/* CTA button */}
        <button className="mt-3 w-full bg-[#222222] text-white text-[10px] font-medium py-2 rounded-lg hover:bg-black transition-colors">
          Ver siguiente paso →
        </button>
      </div>
    </div>
  )
}

// ─── Section header ────────────────────────────────────────────────────────

function SectionHeader({ title, desc, theme }: { title: string, desc: string, theme: Theme }) {
  const isDark = theme === 'dark'
  return (
    <div className="mb-8">
      <h2 className={`text-2xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm leading-relaxed max-w-2xl ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{desc}</p>
    </div>
  )
}

// ─── Component block ───────────────────────────────────────────────────────

function ComponentBlock({ title, children, code, theme }: { title: string, children: React.ReactNode, code?: string, theme: Theme }) {
  const [showCode, setShowCode] = useState(false)
  const { copied, copy } = useCopy()
  const isDark = theme === 'dark'
  return (
    <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-[#111] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <span className={`text-xs font-bold ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{title}</span>
        {code && (
          <button onClick={() => setShowCode(!showCode)} className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}>
            <BookOpen className="w-3 h-3" />{showCode ? 'Ocultar' : 'Ver código'}
          </button>
        )}
      </div>
      <div className="p-6 bg-white">{children}</div>
      {showCode && code && (
        <div className={`border-t relative ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <button onClick={() => copy(code, `code-${title}`)} className="absolute top-3 right-4 text-[10px] text-white/30 hover:text-white/60 flex items-center gap-1">
            {copied === `code-${title}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <pre className="p-5 text-[11px] font-mono text-white/50 overflow-x-auto leading-relaxed bg-[#0a0a0a]"><code>{code}</code></pre>
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function StyleGuidePage() {
  const [theme, setTheme] = useState<Theme>('light')
  const { copied, copy } = useCopy()
  const [activeNav, setActiveNav] = useState('brand')
  const isDark = theme === 'dark'

  const scrollTo = (id: string) => {
    setActiveNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const Section = ({ id, children }: { id: string, children: React.ReactNode }) => (
    <section id={id} className="scroll-mt-20">{children}</section>
  )

  // Dynamic classes based on theme
  const bg      = isDark ? 'bg-[#09090b]'     : 'bg-gray-50'
  const text     = isDark ? 'text-white'        : 'text-gray-900'
  const border   = isDark ? 'border-white/5'   : 'border-gray-200'
  const topbarBg = isDark ? 'bg-[#09090b]/90'  : 'bg-white/90'
  const cardBg   = isDark ? 'bg-[#111] border-white/10' : 'bg-white border-gray-200 shadow-sm'
  const mutedText = isDark ? 'text-white/40'   : 'text-gray-500'
  const subText   = isDark ? 'text-white/20'   : 'text-gray-400'
  const navActive = isDark ? 'bg-white/10 text-white' : 'bg-violet-50 text-violet-700'
  const navInactive = isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors duration-300`}>

      {/* ── Topbar ── */}
      <div className={`border-b ${border} ${topbarBg} backdrop-blur-xl sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/isotipo-gradient.svg" alt="Itineramio" style={{ width: 52, height: 28 }} />
            <div className={`flex items-center gap-2 text-sm ${mutedText}`}>
              <span className={`font-semibold ${text}`}>Itineramio</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Design System</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className={subText}>v2.0</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ── Light / Dark toggle ── */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : `${mutedText} hover:${text}`}`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'dark' ? 'bg-[#1a1a1a] text-white shadow-sm' : `${mutedText} hover:${text}`}`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>

            <a href="/" className={`flex items-center gap-1.5 text-xs ${mutedText} hover:${text} transition-colors`}>
              <Globe className="w-3.5 h-3.5" />itineramio.com
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">

        {/* ── Sidebar ── */}
        <aside className="w-52 flex-shrink-0 sticky top-[49px] h-[calc(100vh-49px)] overflow-y-auto py-8 pr-4 pl-6 hidden lg:block">
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${subText}`}>Secciones</p>
          <nav className="space-y-0.5">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all text-left ${activeNav === id ? navActive + ' font-medium' : navInactive}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className={`mt-8 pt-6 border-t ${border}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${subText}`}>Descargas</p>
            {[
              { label: 'Isotipo gradiente', file: '/isotipo-gradient.svg' },
            ].map(({ label, file }) => (
              <a key={file} href={file} download className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all ${mutedText} hover:${text} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                <Download className="w-3 h-3" />{label}
              </a>
            ))}
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 px-6 lg:px-10 py-8 space-y-20">

          {/* ════ BRAND ════ */}
          <Section id="brand">
            <div className={`relative overflow-hidden rounded-3xl border p-10 lg:p-16 mb-12 ${isDark ? 'bg-gradient-to-br from-[#1a0a2e] via-[#16082b] to-[#09090b] border-white/10' : 'bg-gradient-to-br from-violet-50 via-indigo-50 to-white border-indigo-100'}`}>
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full ${isDark ? 'text-violet-400 bg-violet-500/10 border-violet-500/20' : 'text-violet-600 bg-violet-100 border-violet-200'}`}>Design System</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full ${isDark ? 'text-white/20 bg-white/5 border-white/10' : 'text-gray-400 bg-gray-100 border-gray-200'}`}>v2.0 · 2026</span>
                </div>
                {/* Logo principal en el hero */}
                <div className="mb-6">
                  <img src="/isotipo-gradient.svg" alt="Itineramio" style={{ width: 100, height: 55, objectFit: "contain" }} />
                </div>
                <h1 className={`text-4xl lg:text-5xl font-black leading-none mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Itineramio<br />
                  <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Brand & Design</span>
                </h1>
                <p className={`text-lg max-w-xl leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                  Guía completa del sistema de diseño — colores, tipografía Inter, iconos Lucide, logotipo y pantallas del producto.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  {[{ l: 'Colores', n: '24+' }, { l: 'Iconos Lucide', n: '100+' }, { l: 'Componentes', n: '80+' }, { l: 'Assets SVG', n: '3' }].map(({ l, n }) => (
                    <div key={l} className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <span className={`font-bold text-sm ${text}`}>{n}</span>
                      <span className={`text-sm ${mutedText}`}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Claridad',    desc: 'Interfaces que guían sin confundir. Cada elemento comunica con precisión.', emoji: '🎯', border: isDark ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-200 bg-blue-50' },
                { title: 'Confianza',   desc: 'Diseño profesional que genera credibilidad en hosts y huéspedes.',           emoji: '🛡️', border: isDark ? 'border-violet-500/20 bg-violet-500/5' : 'border-violet-200 bg-violet-50' },
                { title: 'Calidez',     desc: 'Tech con personalidad. Precisión de producto con hospitalidad real.',        emoji: '✨', border: isDark ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50' },
              ].map(({ title, desc, emoji, border: b }) => (
                <div key={title} className={`border rounded-2xl p-6 ${b}`}>
                  <span className="text-2xl mb-3 block">{emoji}</span>
                  <h3 className={`font-bold mb-2 ${text}`}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${mutedText}`}>{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ════ LOGOS ════ */}
          <Section id="logos">
            <SectionHeader title="Logotipo" desc="El símbolo de Itineramio: el infinito. Versión negra para fondos claros, versión blanca para fondos oscuros." theme={theme} />

            {/* Logo principal — destacado */}
            <div className={`rounded-3xl overflow-hidden border mb-6 ${cardBg}`}>
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Preview sobre fondo claro */}
                <div className="h-64 bg-white flex items-center justify-center p-10 border-b md:border-b-0 md:border-r border-gray-100">
                  <img src="/isotipo-gradient.svg" alt="Logo gradiente" style={{ width: 160, height: 88, objectFit: "contain" }} />
                </div>
                {/* Preview sobre fondo oscuro */}
                <div className="h-64 bg-black flex items-center justify-center p-10">
                  <img src="/isotipo-gradient.svg" alt="Logo gradiente" style={{ width: 160, height: 88, objectFit: "contain" }} />
                </div>
              </div>
            </div>

            {/* Dos variantes de gradiente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
                <div className="h-14 bg-gradient-to-r from-[#FF07AB] via-[#FF2E76] to-[#FF4D4D] flex items-center justify-center">
                  <p className="text-white font-bold text-xs tracking-wide">#FF07AB → #FF2E76 → #FF4D4D</p>
                </div>
                <div className="p-4">
                  <p className={`text-xs font-bold mb-0.5 ${text}`}>Logo Marketing · isotipo-gradient.svg</p>
                  <p className={`text-[10px] ${mutedText}`}>Para anuncios Meta/Google, web pública, materiales impresos y creatividades</p>
                </div>
              </div>
              <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
                <div className="h-14 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F43F5E] flex items-center justify-center">
                  <p className="text-white font-bold text-xs tracking-wide">#8B5CF6 → #EC4899 → #F43F5E</p>
                </div>
                <div className="p-4">
                  <p className={`text-xs font-bold mb-0.5 ${text}`}>Logo In-App · ItineramioLogo.tsx</p>
                  <p className={`text-[10px] ${mutedText}`}>Para navbar de la app, pantallas de login, emails y dashboard</p>
                </div>
              </div>
            </div>

            {/* Uso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border rounded-2xl p-5 ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                <p className="text-sm font-bold text-emerald-500 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Usar así</p>
                <ul className="space-y-1.5">
                  {['Sobre fondo blanco o claro con versión gradiente', 'Sobre fondo oscuro (#000, #111) con versión blanca', 'Siempre mantener proporciones 195:107', 'Tamaño mínimo: 80px de ancho', 'SVG siempre — nunca PNG para web'].map(t => (
                    <li key={t} className={`text-xs flex items-start gap-2 ${mutedText}`}><Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />{t}</li>
                  ))}
                </ul>
              </div>
              <div className={`border rounded-2xl p-5 ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-red-400 flex items-center justify-center"><span className="w-2 h-0.5 bg-red-400 block" /></span>Evitar</p>
                <ul className="space-y-1.5">
                  {['No distorsionar ni cambiar proporciones', 'No cambiar los colores del gradiente', 'No usar versión negra sobre fondo oscuro', 'No añadir sombras o efectos al logo', 'No usar en tamaño menor de 80px de ancho'].map(t => (
                    <li key={t} className={`text-xs flex items-start gap-2 ${mutedText}`}><span className="w-3 h-0.5 bg-red-400 mt-2 flex-shrink-0 block" />{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* ════ COLORS ════ */}
          <Section id="colors">
            <SectionHeader title="Colores" desc="La app tiene DOS paletas: Dashboard (violet-600 como acción primaria) y Guía pública (negro #222222 al estilo Airbnb). Click para copiar el hex." theme={theme} />

            {/* Gradient strips */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex-1 rounded-2xl overflow-hidden h-14 bg-gradient-to-r from-[#FF07AB] via-[#FF2E76] to-[#FF4D4D] flex items-center justify-center">
                <p className="text-white font-bold tracking-wide text-xs">Isotipo Gradient · #FF07AB → #FF4D4D</p>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden h-14 bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] flex items-center justify-center">
                <p className="text-white font-bold tracking-wide text-xs">Dashboard UI · #6366f1 → #8b5cf6</p>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden h-14 bg-[#222222] flex items-center justify-center">
                <p className="text-white font-bold tracking-wide text-xs">Guía Pública · #222222</p>
              </div>
            </div>

            <div className="space-y-8">
              {['brand', 'accent', 'guide', 'semantic'].map(group => (
                <div key={group}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${subText}`}>
                    {group === 'brand' ? '🖥 Dashboard — Indigo (foco, enlaces, variante)' :
                     group === 'accent' ? '🖥 Dashboard — Violet (botones primarios, badges, gradientes)' :
                     group === 'guide' ? '📱 Guía Pública — paleta Airbnb (huéspedes)' :
                     'Semánticos (ambas superficies)'}
                  </p>
                  <div className={`grid gap-2 ${group === 'semantic' || group === 'guide' ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-10'}`}>
                    {COLORS[group as keyof typeof COLORS].map((c: any) => (
                      <ColorSwatch key={c.hex} color={c} copied={copied} onCopy={copy} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-8 rounded-2xl overflow-hidden border ${isDark ? 'bg-[#111] border-white/10' : 'bg-gray-900 border-gray-700'}`}>
              <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-white/5' : 'border-gray-700'}`}>
                <span className="text-xs font-mono text-white/40">globals.css — CSS variables</span>
                <button onClick={() => copy('--primary: 262 83% 58%;\n--brand: #6366f1;\n--brand-accent: #8b5cf6;', 'css')} className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60">
                  {copied === 'css' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copiar
                </button>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed">
                <p><span className="text-violet-400">--primary:</span> <span className="text-emerald-400">262 83% 58%</span>;</p>
                <p><span className="text-violet-400">--brand:</span> <span className="text-amber-300">#6366f1</span>;</p>
                <p><span className="text-violet-400">--brand-accent:</span> <span className="text-amber-300">#8b5cf6</span>;</p>
                <p><span className="text-violet-400">--background:</span> <span className="text-emerald-400">0 0% 100%</span>;</p>
                <p><span className="text-violet-400">--radius:</span> <span className="text-emerald-400">0.75rem</span>;</p>
              </div>
            </div>
          </Section>

          {/* ════ TYPOGRAPHY ════ */}
          <Section id="typography">
            <SectionHeader title="Tipografía" desc="Inter como fuente única — diseñada para legibilidad en pantalla. Es la tipografía real usada en toda la app. Cargada desde Google Fonts con next/font." theme={theme} />

            <div className={`rounded-2xl p-8 border mb-8 ${cardBg}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${subText}`}>Inter — fuente principal de Itineramio</p>
              <p className="text-6xl font-black text-gray-900 leading-none mb-4">Aa</p>
              <p className="text-gray-600 font-medium">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p className="text-gray-500">abcdefghijklmnopqrstuvwxyz</p>
              <p className="text-gray-400 mt-1">0123456789 !@#$%&()</p>
              <div className="flex gap-2 mt-4 flex-wrap">
                {['400', '500', '600', '700', '800', '900'].map(w => (
                  <span key={w} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-mono border border-gray-200" style={{ fontWeight: parseInt(w) }}>Inter {w}</span>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              <div className={`grid grid-cols-[1fr_auto_auto_auto] border-b ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                {['Estilo', 'Size', 'Weight', 'L-H'].map(h => (
                  <div key={h} className={`px-5 py-3 ${h !== 'Estilo' ? 'text-right' : ''}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>{h}</p>
                  </div>
                ))}
              </div>
              {TYPOGRAPHY.map(({ name, size, weight, lh, sample, cls }) => (
                <div key={name} className={`grid grid-cols-[1fr_auto_auto_auto] border-b last:border-0 ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
                  <div className="px-5 py-4">
                    <p className={`text-[9px] font-mono mb-1.5 ${subText}`}>{name}</p>
                    <p className={`${cls} text-gray-900`} style={{ lineHeight: lh }}>{sample}</p>
                  </div>
                  <div className="px-4 py-4 flex items-end justify-end"><p className={`text-xs font-mono ${mutedText}`}>{size}</p></div>
                  <div className="px-4 py-4 flex items-end justify-end"><p className={`text-xs font-mono ${mutedText}`}>{weight}</p></div>
                  <div className="px-4 py-4 flex items-end justify-end"><p className={`text-xs font-mono ${mutedText}`}>{lh}</p></div>
                </div>
              ))}
            </div>
          </Section>

          {/* ════ ICONS ════ */}
          <Section id="icons">
            <SectionHeader title="Iconos" desc="Lucide React — librería de iconos vectoriales SVG usada en toda la app. Stroke-based, accesibles, con soporte de Tailwind CSS." theme={theme} />

            <div className={`rounded-2xl p-4 border mb-6 flex items-center gap-4 ${isDark ? 'bg-[#111] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>lucide-react</div>
              <p className={`text-sm ${mutedText}`}>Iconos SVG vectoriales · stroke 1.5px · tamaño via className (w-4 h-4, w-5 h-5…)</p>
            </div>

            {/* Categorías */}
            {['Cocina', 'Dormitorio', 'Baño', 'Salón', 'Acceso', 'Exterior', 'Servicios', 'Viajes'].map(cat => {
              const icons = ZONE_ICONS.filter(z => z.cat === cat)
              return (
                <div key={cat} className="mb-6">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${subText}`}>{cat}</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {icons.map(({ id, Icon, label }) => (
                      <div
                        key={id}
                        className={`rounded-2xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-105 border ${isDark ? 'bg-[#111] border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10' : 'bg-white border-gray-200 hover:border-violet-300 hover:bg-violet-50 shadow-sm'}`}
                        onClick={() => copy(id, `icon-${id}`)}
                        title={`Copiar: ${id}`}
                      >
                        <Icon className={`w-5 h-5 ${isDark ? 'text-white/70' : 'text-gray-700'}`} strokeWidth={1.5} />
                        <p className={`text-[9px] text-center leading-tight ${mutedText}`}>{label}</p>
                        {copied === `icon-${id}` && <Check className="w-3 h-3 text-emerald-400 absolute" />}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className={`rounded-2xl p-5 border mt-4 ${isDark ? 'bg-[#111] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs font-mono mb-3 ${mutedText}`}>Uso en código</p>
              <pre className={`text-[12px] font-mono leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{`import { Key, Wifi, ChefHat } from 'lucide-react'

<Key className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
<Wifi className="w-4 h-4 text-violet-500" />
<ChefHat className="w-6 h-6 text-orange-500" />`}</pre>
            </div>
          </Section>

          {/* ════ COMPONENTS ════ */}
          <Section id="components">
            <SectionHeader title="Componentes" desc="Dos superficies, dos sistemas. Dashboard usa violet (src/components/ui/button.tsx). Guía pública usa negro #222222 (app/(public)/guide/)." theme={theme} />

            {/* Contexto legend */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium"><Monitor className="w-3.5 h-3.5" />Dashboard (host) — violet</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"><Smartphone className="w-3.5 h-3.5" />Guía pública (huésped) — negro #222222</span>
            </div>

            <div className="space-y-5">
              {/* ── Dashboard buttons ── */}
              <ComponentBlock title="Buttons · Dashboard" theme={theme} code={`// src/components/ui/button.tsx\n<Button>Primario</Button>            // bg-violet-600 rounded-md shadow-lg\n<Button variant="secondary">...</Button>  // bg-gray-100 rounded-md\n<Button variant="outline">...</Button>    // border-2 border-gray-300\n<Button variant="ghost">...</Button>      // text-gray-700 hover:bg-gray-100\n<Button variant="destructive">...</Button>// bg-red-600`}>
                <div className="flex flex-wrap gap-3">
                  {[
                    { l: 'Primary',      c: 'bg-violet-600 text-white hover:bg-violet-700 h-10 px-4 rounded-md font-medium text-sm transition-all shadow-lg hover:shadow-xl' },
                    { l: 'Secondary',    c: 'bg-gray-100 text-gray-900 hover:bg-gray-200 h-10 px-4 rounded-md font-medium text-sm transition-all shadow-md' },
                    { l: 'Outline',      c: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-10 px-4 rounded-md font-medium text-sm transition-colors' },
                    { l: 'Ghost',        c: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 h-10 px-4 rounded-md font-medium text-sm transition-colors' },
                    { l: 'Link',         c: 'text-violet-600 hover:text-violet-700 hover:underline h-10 px-4 font-medium text-sm' },
                    { l: 'Destructive',  c: 'bg-red-600 text-white hover:bg-red-700 h-10 px-4 rounded-md font-medium text-sm transition-all shadow-lg' },
                    { l: 'sm',           c: 'bg-violet-600 text-white hover:bg-violet-700 h-9 px-3 rounded-md font-medium text-sm transition-all shadow-md' },
                    { l: 'lg',           c: 'bg-violet-600 text-white hover:bg-violet-700 h-12 px-8 rounded-lg font-medium text-base transition-all shadow-lg' },
                    { l: 'disabled',     c: 'bg-violet-600 text-white h-10 px-4 rounded-md font-medium text-sm opacity-50 cursor-not-allowed', disabled: true },
                  ].map(({ l, c, disabled }) => <button key={l} className={c} disabled={disabled}>{l}</button>)}
                </div>
              </ComponentBlock>

              {/* ── Guía pública buttons ── */}
              <ComponentBlock title="Buttons · Guía pública" theme={theme} code={`// app/(public)/guide/\n<button className="bg-[#222222] text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-black">\n  Siguiente paso\n</button>`}>
                <div className="flex flex-wrap gap-3 items-center">
                  {[
                    { l: 'Primario (negro)',c: 'bg-[#222222] text-white hover:bg-black px-6 py-2.5 rounded-lg font-medium text-sm transition-colors' },
                    { l: 'Outline',         c: 'text-[#222222] bg-white border border-[#222222] hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors' },
                    { l: 'Ghost circular',  c: 'p-2 rounded-full text-[#222222] hover:bg-gray-100 transition-colors' },
                    { l: '💬 WhatsApp',    c: 'bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-2.5 rounded-full font-medium text-sm transition-colors shadow-lg' },
                  ].map(({ l, c }) => <button key={l} className={c}>{l}</button>)}
                </div>
              </ComponentBlock>

              {/* ── Step badges ── */}
              <ComponentBlock title="Step Badges · Guía pública" theme={theme}>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#008A05] text-white flex items-center justify-center shadow-md"><Check className="w-4 h-4" /></div>
                    <div><p className="text-xs font-medium text-gray-700">Completado</p><p className="text-[10px] text-gray-400 font-mono">#008A05</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#222222] text-white flex items-center justify-center shadow-md text-sm font-medium">2</div>
                    <div><p className="text-xs font-medium text-gray-700">Activo</p><p className="text-[10px] text-gray-400 font-mono">#222222</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium border border-gray-200">3</div>
                    <div><p className="text-xs font-medium text-gray-400">Pendiente</p><p className="text-[10px] text-gray-300 font-mono">gray-100</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 w-32"><div className="bg-violet-600 h-2 rounded-full w-2/3" /></div>
                    <p className="text-xs text-gray-500">Progress · violet-600</p>
                  </div>
                </div>
              </ComponentBlock>

              {/* ── Zone cards real ── */}
              <ComponentBlock title="Zone Cards · Guía pública" theme={theme} code={`// Fondo blanco, border-gray-200, hover:border-[#222222]\n<button className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-200\n  rounded-xl hover:border-[#222222] hover:shadow-md transition-all">\n  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">...\n  <p className="text-xs font-medium text-[#222222]">Check-in</p>\n</button>`}>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { I: Key,      name: 'Check-in'   },
                    { I: Wifi,     name: 'WiFi'        },
                    { I: ChefHat,  name: 'Cocina'      },
                    { I: Waves,    name: 'Piscina'     },
                    { I: Car,      name: 'Parking'     },
                    { I: Utensils, name: 'Restaurantes'},
                  ].map(({ I, name }) => (
                    <button key={name} className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-[#222222] hover:shadow-md transition-all cursor-pointer">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <I className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-medium text-[#222222]">{name}</p>
                    </button>
                  ))}
                </div>
              </ComponentBlock>

              {/* ── Badges ── */}
              <ComponentBlock title="Badges · Dashboard" theme={theme}>
                <div className="flex flex-wrap gap-2">
                  {[
                    { l: 'Activo',    c: 'bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
                    { l: 'Pendiente', c: 'bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
                    { l: 'Beta',      c: 'bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
                    { l: 'Pro',       c: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full' },
                    { l: 'Borrador',  c: 'bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
                  ].map(({ l, c }) => <span key={l} className={c}>{l}</span>)}
                </div>
              </ComponentBlock>

              {/* ── Inputs ── */}
              <ComponentBlock title="Inputs · Dashboard (rounded-lg, ring-violet-500)" theme={theme}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Default</label>
                    <input type="text" placeholder="Ej: Apartamento Playa" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Con icono</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Buscar..." className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-red-500 mb-1.5 block">Error</label>
                    <input type="text" defaultValue="Valor incorrecto" className="w-full border border-red-300 bg-red-50 rounded-lg px-4 py-2.5 text-sm text-red-600 outline-none" />
                    <p className="text-xs text-red-500 mt-1">Campo obligatorio</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-emerald-600 mb-1.5 block">Correcto</label>
                    <div className="relative">
                      <input type="text" defaultValue="Alicante centro" className="w-full border border-emerald-300 bg-emerald-50 rounded-lg px-4 py-2.5 text-sm text-emerald-700 outline-none pr-10" />
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </ComponentBlock>

              {/* ── Alerts ── */}
              <ComponentBlock title="Alerts · Dashboard" theme={theme}>
                <div className="space-y-2 max-w-md">
                  {[
                    { msg: 'Propiedad publicada correctamente.', c: 'bg-emerald-50 border-emerald-200 text-emerald-800', dot: 'bg-emerald-500' },
                    { msg: 'Tu prueba caduca en 3 días. Activa tu plan.', c: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500' },
                    { msg: 'Error al guardar. Comprueba tu conexión.', c: 'bg-red-50 border-red-200 text-red-800', dot: 'bg-red-500' },
                    { msg: 'Nuevo mensaje de un huésped esperando.', c: 'bg-blue-50 border-blue-200 text-blue-800', dot: 'bg-blue-500' },
                  ].map(({ msg, c, dot }) => (
                    <div key={msg} className={`${c} border rounded-xl px-4 py-3 flex items-center gap-3 text-sm`}>
                      <div className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />{msg}
                    </div>
                  ))}
                </div>
              </ComponentBlock>

              {/* ── Dashboard cards ── */}
              <ComponentBlock title="Cards · Dashboard (bg-white, border-gray-200, rounded-lg, shadow-sm)" theme={theme}>
                <div className="grid grid-cols-3 gap-3 max-w-sm">
                  {[
                    { l: 'Propiedades', v: '4',  I: Home,          c: 'text-violet-600', bg: 'bg-violet-50' },
                    { l: 'Reservas',    v: '23', I: Calendar,      c: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { l: 'Chats IA',   v: '187', I: MessageCircle, c: 'text-violet-600', bg: 'bg-violet-50' },
                  ].map(({ l, v, I, c, bg }) => (
                    <div key={l} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}><I className={`w-4 h-4 ${c}`} /></div>
                      <p className="text-xl font-bold text-gray-900">{v}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </ComponentBlock>

            </div>
          </Section>

          {/* ════ SCREENS ════ */}
          <Section id="screens">
            <SectionHeader title="Pantallas" desc="Interfaces reales del producto — dashboard del host y guía pública del huésped." theme={theme} />

            <div className="space-y-12">
              <div>
                <div className={`flex items-center gap-3 mb-4`}>
                  <Monitor className={`w-4 h-4 ${mutedText}`} />
                  <span className={`text-sm font-bold ${mutedText}`}>Dashboard — panel del host</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${isDark ? 'text-white/20 bg-white/5 border-white/10' : 'text-gray-400 bg-gray-100 border-gray-200'}`}>/main</span>
                </div>
                <BrowserFrame url="itineramio.com/main">
                  <DashboardScreen />
                </BrowserFrame>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className={`w-4 h-4 ${mutedText}`} />
                  <span className={`text-sm font-bold ${mutedText}`}>Guía pública — vista del huésped</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${isDark ? 'text-white/20 bg-white/5 border-white/10' : 'text-gray-400 bg-gray-100 border-gray-200'}`}>/guide/[slug]</span>
                </div>
                <div className="flex justify-center">
                  <PhoneFrame><GuideScreen /></PhoneFrame>
                </div>
              </div>
            </div>
          </Section>

          {/* ════ TOKENS ════ */}
          <Section id="tokens">
            <SectionHeader title="Design Tokens" desc="Sombras, radios de borde, espaciado y animaciones — los átomos del sistema visual." theme={theme} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-2xl p-6 border ${cardBg}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${subText}`}>Sombras</p>
                <div className="space-y-3">
                  {['shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl'].map((s, i) => (
                    <div key={s} className="flex items-center gap-4">
                      <div className={`w-10 h-10 bg-white rounded-xl ${s} flex-shrink-0 border border-gray-100`} />
                      <div>
                        <p className={`text-xs font-mono font-bold ${text === 'text-white' ? 'text-white/60' : 'text-gray-600'}`}>{s}</p>
                        <p className={`text-[9px] font-mono ${subText}`}>nivel {i + 1}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.15)] flex-shrink-0" />
                    <div>
                      <p className={`text-xs font-mono font-bold ${isDark ? 'text-white/60' : 'text-gray-600'}`}>shadow-brand</p>
                      <p className={`text-[9px] font-mono ${subText}`}>indigo glow</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-6 border ${cardBg}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${subText}`}>Border Radius</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { n: 'rounded-sm',   v: '2px',    c: 'rounded-sm'   },
                    { n: 'rounded',      v: '4px',    c: 'rounded'      },
                    { n: 'rounded-md',   v: '6px',    c: 'rounded-md'   },
                    { n: 'rounded-lg',   v: '8px',    c: 'rounded-lg'   },
                    { n: 'rounded-xl',   v: '12px',   c: 'rounded-xl'   },
                    { n: 'rounded-2xl',  v: '16px',   c: 'rounded-2xl'  },
                    { n: 'rounded-3xl',  v: '24px',   c: 'rounded-3xl'  },
                    { n: 'rounded-full', v: '9999px', c: 'rounded-full' },
                  ].map(({ n, v, c }) => (
                    <div key={n} className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 flex-shrink-0 ${c}`} />
                      <div>
                        <p className={`text-[10px] font-mono ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{n}</p>
                        <p className={`text-[9px] ${subText}`}>{v}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ════ MARKETING ════ */}
          <Section id="marketing">
            <SectionHeader title="Marketing" desc="Especificaciones para el equipo creativo — formatos, paleta, tipografía y copy guidelines para campañas Meta Ads y Google Ads." theme={theme} />

            {/* Formatos de anuncio */}
            <div className="mb-10">
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${subText}`}>Formatos de anuncio</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Feed cuadrado', dims: '1080 × 1080 px', ratio: '1:1',    color: 'from-violet-500 to-purple-600', h: 'h-24' },
                  { label: 'Feed vertical',  dims: '1080 × 1350 px', ratio: '4:5',    color: 'from-pink-500 to-rose-500',     h: 'h-28' },
                  { label: 'Story / Reels',  dims: '1080 × 1920 px', ratio: '9:16',   color: 'from-indigo-500 to-violet-600', h: 'h-36' },
                  { label: 'Banner Google',  dims: '1200 × 628 px',  ratio: '1.91:1', color: 'from-emerald-500 to-teal-500',  h: 'h-16' },
                ].map(({ label, dims, ratio, color, h }) => (
                  <div key={label} className={`rounded-2xl overflow-hidden border ${cardBg}`}>
                    <div className={`bg-gradient-to-br ${color} ${h} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{ratio}</span>
                    </div>
                    <div className="p-3">
                      <p className={`text-[10px] font-bold ${text}`}>{label}</p>
                      <p className={`text-[9px] font-mono mt-0.5 ${mutedText}`}>{dims}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colores para creatividades */}
            <div className="mb-10">
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${subText}`}>Colores para creatividades — click para copiar</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                {[
                  { label: 'Fondo oscuro',    hex: '#09090b', dark: true  },
                  { label: 'Fondo claro',     hex: '#FFFFFF', dark: false },
                  { label: 'Violet 500',      hex: '#8B5CF6', dark: true  },
                  { label: 'Logo Start',      hex: '#FF07AB', dark: true  },
                  { label: 'Logo Mid',        hex: '#FF2E76', dark: true  },
                  { label: 'Logo End',        hex: '#FF4D4D', dark: true  },
                ].map(({ label, hex, dark: d }) => (
                  <div key={hex} className={`relative group cursor-pointer rounded-xl overflow-hidden border transition-transform hover:scale-105 ${d ? 'border-white/10' : 'border-black/10'}`} style={{ backgroundColor: hex }} onClick={() => copy(hex, `mkt-${hex}`)}>
                    <div className="h-12 w-full" />
                    <div className={`px-2 py-1.5 ${d ? 'bg-black/30 text-white' : 'bg-white/60 text-gray-800'}`}>
                      <p className="text-[9px] font-semibold truncate">{label}</p>
                      <p className={`text-[8px] font-mono ${d ? 'text-white/60' : 'text-gray-500'}`}>{hex}</p>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${d ? 'bg-black/40' : 'bg-white/60'}`}>
                      {copied === `mkt-${hex}` ? <Check className={`w-4 h-4 ${d ? 'text-white' : 'text-gray-800'}`} /> : <Copy className={`w-3.5 h-3.5 ${d ? 'text-white' : 'text-gray-800'}`} />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="rounded-xl overflow-hidden h-11 bg-gradient-to-r from-[#FF07AB] via-[#FF2E76] to-[#FF4D4D] flex items-center justify-center cursor-pointer" onClick={() => copy('#FF07AB, #FF2E76, #FF4D4D', 'grad-logo')}>
                  <p className="text-white font-bold text-xs">Gradiente Logo Marketing — copiar</p>
                </div>
                <div className="rounded-xl overflow-hidden h-11 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F43F5E] flex items-center justify-center cursor-pointer" onClick={() => copy('#8B5CF6, #EC4899, #F43F5E', 'grad-app')}>
                  <p className="text-white font-bold text-xs">Gradiente In-App — copiar</p>
                </div>
              </div>
            </div>

            {/* Tipografía para anuncios */}
            <div className="mb-10">
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${subText}`}>Tipografía para creatividades — Inter (Google Fonts)</p>
              <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                {[
                  { role: 'Headline',    weight: '700', size: '32–40px', sample: 'Los huéspedes no leen.' },
                  { role: 'Subheadline', weight: '600', size: '20–24px', sample: 'He enviado el WiFi más que saludos.' },
                  { role: 'Body copy',   weight: '400', size: '14–16px', sample: 'Crea una guía una vez y haz que se envíe sola en cada reserva.' },
                  { role: 'CTA button',  weight: '700', size: '14–16px', sample: 'Empieza gratis →' },
                ].map(({ role, weight, size, sample }) => (
                  <div key={role} className={`px-5 py-4 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono ${subText}`}>{role}</span>
                      <span className={`text-[9px] font-mono ${subText}`}>Inter {weight} · {size}</span>
                    </div>
                    <p className="text-gray-900" style={{ fontWeight: parseInt(weight), fontSize: '15px' }}>{sample}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy guidelines */}
            <div className="mb-10">
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${subText}`}>Copy aprobado — hooks reales de Haroon</p>
              <div className={`rounded-2xl border divide-y ${isDark ? 'bg-[#111] border-white/10 divide-white/5' : 'bg-white border-gray-200 divide-gray-50'}`}>
                {[
                  { hook: 'He enviado la clave del WiFi tantas veces que ya me la sé mejor que mi DNI.', tag: 'Ad Set 2' },
                  { hook: 'El peor mensaje no es una queja. Es este: «No podemos entrar».', tag: 'Ad Set 3' },
                  { hook: 'Si tu móvil manda más que tú, ya sabes de qué va esto.', tag: 'Ad Set 3' },
                  { hook: 'Una reseña de 4 estrellas por confusión duele más que una avería.', tag: 'Ad Set 4' },
                  { hook: 'Mi punto de ruptura no fue un huésped. Fue el sexto piso.', tag: 'Ad Set 5' },
                  { hook: 'Hay días en los que no trabajas de anfitrión. Trabajas de copiar y pegar.', tag: 'Ad Set 5' },
                ].map(({ hook, tag }) => (
                  <div key={tag + hook} className="px-5 py-4 flex items-start justify-between gap-4">
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-800'}`}>"{hook}"</p>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'}`}>{tag}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 rounded-xl p-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-amber-50 border-amber-200'}`}>
                <p className={`text-xs font-bold mb-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Reglas de tono</p>
                <ul className="space-y-1">
                  {[
                    'Directo y en primera persona — el anfitrión habla',
                    'Sin superlativos: no "la mejor solución", sino hechos concretos',
                    'Sin emojis en titulares de anuncio',
                    'Específico: "la clave del WiFi", no "información básica"',
                    'CTA en imperativo: Empieza gratis · Prueba gratis · Crear mi guía',
                  ].map(r => (
                    <li key={r} className={`text-[10px] flex items-start gap-2 ${isDark ? 'text-white/40' : 'text-amber-800'}`}>
                      <Check className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Logo en anuncios */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${subText}`}>Logo en anuncios</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-2xl overflow-hidden border ${cardBg}`}>
                  <div className="h-20 bg-black flex items-center justify-center">
                    <img src="/isotipo-gradient.svg" style={{ width: 80, height: 44, objectFit: 'contain' }} alt="Logo sobre negro" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-emerald-500">Correcto</p>
                    <p className={`text-[9px] ${mutedText} mt-0.5`}>Gradiente sobre fondo oscuro</p>
                  </div>
                </div>
                <div className={`rounded-2xl overflow-hidden border ${cardBg}`}>
                  <div className="h-20 bg-white border-b border-gray-100 flex items-center justify-center">
                    <img src="/isotipo-gradient.svg" style={{ width: 80, height: 44, objectFit: 'contain' }} alt="Logo sobre blanco" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-emerald-500">Correcto</p>
                    <p className={`text-[9px] ${mutedText} mt-0.5`}>Gradiente sobre fondo claro</p>
                  </div>
                </div>
                <div className={`rounded-2xl overflow-hidden border ${cardBg}`}>
                  <div className="h-20 bg-gradient-to-r from-[#FF07AB] to-[#FF4D4D] flex items-center justify-center">
                    <img src="/isotipo-gradient.svg" style={{ width: 80, height: 44, objectFit: 'contain' }} alt="Logo sobre color" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-red-400">Evitar</p>
                    <p className={`text-[9px] ${mutedText} mt-0.5`}>Logo sobre fondo de color intenso</p>
                  </div>
                </div>
              </div>
              <p className={`mt-3 text-[10px] ${subText}`}>Padding mínimo alrededor del logo: 20px · Tamaño mínimo en anuncio: 80px de ancho</p>
            </div>
          </Section>

          {/* Footer */}
          <div className={`border-t pt-10 pb-16 flex flex-col sm:flex-row items-center justify-between gap-4 ${border}`}>
            <div className="flex items-center gap-3">
              <InfinityLogo color={isDark ? '#fff' : '#000'} size={28} />
              <span className={`text-xs ${subText}`}>Itineramio Design System · v2.0 · 2026</span>
            </div>
            <div className={`flex items-center gap-4 text-xs ${subText}`}>
              <span>Actualizado marzo 2026</span>
              <span>·</span>
              <a href="/" className={`hover:${text} transition-colors`}>itineramio.com</a>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
