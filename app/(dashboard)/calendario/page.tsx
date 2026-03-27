'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RefreshCw, Settings, WifiOff, Lightbulb, X, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

// ─── Platform colours ────────────────────────────────────────────────────────
const PC: Record<string, { bg: string; text: string; label: string; light: string }> = {
  AIRBNB:  { bg: '#00A699', text: '#fff', label: 'Airbnb',  light: '#e6f7f5' },
  BOOKING: { bg: '#003580', text: '#fff', label: 'Booking', light: '#e6ecf7' },
  VRBO:    { bg: '#1C6B8A', text: '#fff', label: 'VRBO',    light: '#e6f0f5' },
  OTHER:   { bg: '#888',    text: '#fff', label: 'Otro',    light: '#f0f0f0' },
}

interface CalendarEvent {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  platform: string
  reservationCode?: string
  phoneLast4?: string
}

interface CalendarProperty {
  id: string
  name: string
  profileImage?: string | null
  status: string
  hasIcalConfig: boolean
  icalConfig: { airbnb?: string; booking?: string; vrbo?: string }
  daysInMonth: number
  occupancy: Array<{ day: number; platform: string }>
  events: CalendarEvent[]
}

// ─── Month helpers ────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_LABELS = ['L','M','X','J','V','S','D']

function buildGrid(year: number, month: number) {
  const firstDay = (new Date(year, month - 1, 1).getDay() + 6) % 7 // Mon=0
  const days = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null)]
  for (let d = 1; d <= days; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)
  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

function dayStr(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

// ─── Mobile mini-calendar (dots) ─────────────────────────────────────────────
function MiniCalendar({ occupancy, daysInMonth, year, month }: {
  occupancy: Array<{ day: number; platform: string }>
  daysInMonth: number
  year: number
  month: number
}) {
  const today = new Date()
  const todayDay = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : -1
  const map: Record<number, string> = {}
  occupancy.forEach(o => { if (!map[o.day]) map[o.day] = o.platform })

  return (
    <div className="flex flex-wrap gap-[3px]" style={{ width: 156 }}>
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
        const p = map[d]
        const isToday = d === todayDay
        return (
          <div key={d} style={{
            width: 10, height: 10, borderRadius: 2, flexShrink: 0,
            backgroundColor: p ? (PC[p]?.bg || PC.OTHER.bg) : (isToday ? '#e5e7eb' : '#f3f4f6'),
            border: isToday && !p ? '1.5px solid #6366f1' : undefined,
          }} />
        )
      })}
    </div>
  )
}

// ─── iCal Config inline panel ────────────────────────────────────────────────
function IcalPanel({ propertyId, propertyName, initial, onSaved }: {
  propertyId: string
  propertyName: string
  initial: { airbnb?: string; booking?: string; vrbo?: string }
  onSaved: () => void
}) {
  const [urls, setUrls] = useState({ airbnb: initial.airbnb || '', booking: initial.booking || '', vrbo: initial.vrbo || '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showTip, setShowTip] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/calendar/ical-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId, ...urls })
      })
      if (!res.ok) throw new Error()
      setMsg('¡Guardado! Actualizando…')
      setTimeout(() => { setMsg(''); onSaved() }, 1200)
    } catch {
      setMsg('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-600">Conectar iCal — {propertyName}</p>
        <button
          onClick={() => setShowTip(v => !v)}
          className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          ¿Cómo?
        </button>
      </div>

      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="text-[11px] bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-amber-800 space-y-1 leading-relaxed">
              <p><strong>Airbnb:</strong> Anuncios → tu anuncio → Disponibilidad → Sincronizar calendarios → Exportar (.ics)</p>
              <p><strong>Booking:</strong> Extranet → Propiedades → Calendario → Exportar iCal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {[
        { key: 'airbnb' as const, label: 'Airbnb', color: PC.AIRBNB.bg, ph: 'https://www.airbnb.es/calendar/ical/...' },
        { key: 'booking' as const, label: 'Booking', color: PC.BOOKING.bg, ph: 'https://admin.booking.com/...' },
        { key: 'vrbo' as const, label: 'VRBO (opcional)', color: PC.VRBO.bg, ph: 'https://www.vrbo.com/calendar/...' },
      ].map(({ key, label, color, ph }) => (
        <div key={key}>
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mb-1">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </label>
          <input
            type="url"
            value={urls[key]}
            onChange={e => setUrls(u => ({ ...u, [key]: e.target.value }))}
            placeholder={ph}
            className="w-full text-[11px] px-2.5 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-violet-400"
          />
        </div>
      ))}

      {msg && <p className={`text-[11px] font-medium ${msg.includes('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center justify-center gap-1.5 w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {saving ? 'Guardando…' : 'Guardar y sincronizar'}
      </button>
    </div>
  )
}


// ─── Main page ────────────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [properties, setProperties] = useState<CalendarProperty[]>([])
  const [daysInMonth, setDaysInMonth] = useState(31)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPropId, setEditingPropId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const colW = 32

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/calendar/properties?year=${year}&month=${month}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Error al cargar')
      const data = await res.json()
      setProperties(data.properties || [])
      setDaysInMonth(data.daysInMonth || 31)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { fetchData() }, [fetchData])

  // Scroll to show today on load (3 days before today visible)
  useEffect(() => {
    if (!scrollRef.current || loading) return
    const today = new Date()
    if (today.getFullYear() === year && today.getMonth() + 1 === month) {
      scrollRef.current.scrollLeft = Math.max(0, (today.getDate() - 4)) * colW
    } else {
      scrollRef.current.scrollLeft = 0
    }
  }, [year, month, loading])

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }

  const todayDay = now.getFullYear() === year && now.getMonth() + 1 === month ? now.getDate() : -1
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-gray-900 w-40 text-center">
              {MONTH_NAMES[month - 1]} {year}
            </h1>
            <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 mr-3">
              {Object.entries(PC).filter(([k]) => k !== 'OTHER').map(([k, v]) => (
                <div key={k} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: v.bg }} />
                  <span className="text-[11px] text-gray-500">{v.label}</span>
                </div>
              ))}
            </div>
            <button onClick={fetchData} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link href="/calendario/configurar" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Cargando calendarios…<br/><span className="text-xs">Esto puede tardar unos segundos</span></p>
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-400 mb-2">{error}</p>
          <button onClick={fetchData} className="text-sm text-violet-600 underline">Reintentar</button>
        </div>
      ) : (
        <>
          {/* ══ DESKTOP VIEW ══ */}
          <div className="hidden lg:block">
            {/* Single overflow-x-auto — header + rows scroll together */}
            <div className="overflow-x-auto" ref={scrollRef}>
              <div style={{ width: 208 + daysInMonth * colW }}>

                {/* Header row */}
                <div className="flex border-b border-gray-100 bg-gray-50">
                  <div className="w-52 flex-shrink-0 sticky left-0 z-20 bg-gray-50 border-r border-gray-100 px-3 py-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Propiedad</p>
                  </div>
                  {days.map(d => {
                    const date = new Date(year, month - 1, d)
                    const dow = ['D','L','M','X','J','V','S'][date.getDay()]
                    const isToday = d === todayDay
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                    return (
                      <div key={d} style={{ width: colW, flexShrink: 0 }}
                        className={`flex flex-col items-center py-1.5 border-r border-gray-100 ${isWeekend ? 'bg-gray-100/60' : ''}`}
                      >
                        <span className="text-[9px] text-gray-400">{dow}</span>
                        <span className={`text-xs font-semibold ${isToday ? 'w-5 h-5 bg-violet-600 text-white rounded-full flex items-center justify-center text-[10px]' : 'text-gray-600'}`}>
                          {d}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Property rows */}
                {properties.map(prop => (
                  <div key={prop.id} className="flex border-b border-gray-100 hover:bg-gray-50/30 transition-colors" style={{ height: 56 }}>
                    {/* Left: property name — sticky horizontally */}
                    <div className="w-52 flex-shrink-0 sticky left-0 z-10 bg-white border-r border-gray-100 flex items-center gap-2.5 px-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {prop.profileImage
                          ? <img src={prop.profileImage} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{prop.name}</p>
                        {prop.hasIcalConfig ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            {prop.icalConfig.airbnb && <span className="text-[9px] px-1 rounded text-white font-bold" style={{ backgroundColor: PC.AIRBNB.bg }}>A</span>}
                            {prop.icalConfig.booking && <span className="text-[9px] px-1 rounded text-white font-bold" style={{ backgroundColor: PC.BOOKING.bg }}>B</span>}
                            {prop.icalConfig.vrbo && <span className="text-[9px] px-1 rounded text-white font-bold" style={{ backgroundColor: PC.VRBO.bg }}>V</span>}
                            <button onClick={() => setEditingPropId(editingPropId === prop.id ? null : prop.id)}
                              className="text-[9px] text-gray-400 hover:text-violet-500 transition-colors ml-0.5">
                              <Settings className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <WifiOff className="w-2.5 h-2.5" /> Sin iCal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: gantt bars */}
                    <div className="relative" style={{ width: daysInMonth * colW, flexShrink: 0 }}>
                      <GanttContent
                        prop={prop} year={year} month={month}
                        daysInMonth={daysInMonth} colW={colW} todayDay={todayDay}
                        forceEdit={editingPropId === prop.id}
                        onNeedRefresh={() => { setEditingPropId(null); fetchData() }}
                        onCloseEdit={() => setEditingPropId(null)}
                      />
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* ══ MOBILE VIEW ══ */}
          <div className="lg:hidden">
            {/* Mobile legend */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-50">
              {Object.entries(PC).filter(([k]) => k !== 'OTHER').map(([k, v]) => (
                <div key={k} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: v.bg }} />
                  <span className="text-[10px] text-gray-500">{v.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1 ml-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-indigo-400" />
                <span className="text-[10px] text-gray-500">Hoy</span>
              </div>
            </div>

            <div className="divide-y divide-gray-50 pb-24">
              {properties.map((prop, i) => (
                <motion.div key={prop.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={`/calendario/${prop.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {prop.profileImage
                        ? <img src={prop.profileImage} alt={prop.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{prop.name}</p>
                      <p className="text-xs text-gray-400">{prop.status === 'ACTIVE' ? 'Publicado' : 'Borrador'}</p>
                      {prop.hasIcalConfig && (
                        <div className="flex gap-1 mt-0.5">
                          {prop.icalConfig.airbnb && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PC.AIRBNB.bg }}>Airbnb</span>}
                          {prop.icalConfig.booking && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PC.BOOKING.bg }}>Booking</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {prop.hasIcalConfig ? (
                        <MiniCalendar occupancy={prop.occupancy} daysInMonth={prop.daysInMonth} year={year} month={month} />
                      ) : (
                        <div className="flex flex-col items-center gap-1 w-[156px]">
                          <WifiOff className="w-4 h-4 text-gray-200" />
                          <p className="text-[10px] text-gray-300 text-center">Sin iCal</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Desktop Gantt content (scrolls horizontally synced with header) ──────────
function GanttContent({ prop, year, month, daysInMonth, colW, todayDay, forceEdit, onNeedRefresh, onCloseEdit }: {
  prop: CalendarProperty
  year: number
  month: number
  daysInMonth: number
  colW: number
  todayDay: number
  forceEdit?: boolean
  onNeedRefresh: () => void
  onCloseEdit?: () => void
}) {
  const [showConfig, setShowConfig] = useState(false)
  const isEditing = forceEdit || showConfig
  const monthStart = dayStr(year, month, 1)
  const monthEnd = dayStr(year, month, daysInMonth)

  const bars = prop.events.map(ev => {
    const ciStr = ev.checkIn >= monthStart ? ev.checkIn : monthStart
    const startDay = parseInt(ciStr.split('-')[2])
    const endDayRaw = ev.checkOut <= monthEnd
      ? Math.max(parseInt(ev.checkOut.split('-')[2]) - 1, startDay)
      : daysInMonth
    return { ...ev, startDay, endDay: endDayRaw }
  }).filter(b => b.startDay <= daysInMonth && b.endDay >= 1)

  return (
    <div className="relative" style={{ width: daysInMonth * colW, height: 56 }}>
      {/* Background columns */}
      <div className="flex h-full absolute inset-0">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const date = new Date(year, month - 1, d)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          const isToday = d === todayDay
          return (
            <div key={d} style={{ width: colW, flexShrink: 0 }}
              className={`h-full border-r border-gray-100 ${isToday ? 'bg-violet-50' : isWeekend ? 'bg-gray-50/60' : ''}`}
            />
          )
        })}
      </div>

      {/* Reservation bars */}
      {prop.hasIcalConfig && bars.map(bar => {
        const c = PC[bar.platform] || PC.OTHER
        const left = (bar.startDay - 1) * colW
        const width = Math.max((bar.endDay - bar.startDay + 1) * colW - 1, colW - 1)
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
        const isOngoing = bar.checkIn <= todayStr && bar.checkOut > todayStr
        const tooltip = [
          bar.reservationCode && `Reserva: ${bar.reservationCode}`,
          `Entrada: ${bar.checkIn}`,
          `Salida: ${bar.checkOut}`,
          `Noches: ${bar.nights}`,
          bar.phoneLast4 && `Tel: ···${bar.phoneLast4}`,
        ].filter(Boolean).join('\n')
        return (
          <div key={bar.id}
            style={{
              position: 'absolute', top: 8, height: 40, left, width,
              backgroundColor: c.bg, borderRadius: 6,
              display: 'flex', alignItems: 'center',
              paddingLeft: 10, paddingRight: 8,
              overflow: 'hidden', gap: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
            }}
            title={tooltip}
          >
            <span style={{ color: c.text, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
              {bar.reservationCode || 'Reservado'} · {bar.nights}n
            </span>
            {isOngoing && width > 80 && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: c.bg,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 4, padding: '1px 5px', flexShrink: 0, whiteSpace: 'nowrap'
              }}>
                En curso
              </span>
            )}
            {!isOngoing && bar.phoneLast4 && width > 100 && (
              <span style={{ color: c.text, fontSize: 10, opacity: 0.75, whiteSpace: 'nowrap', flexShrink: 0 }}>
                ···{bar.phoneLast4}
              </span>
            )}
          </div>
        )
      })}

      {/* No iCal hint */}
      {!prop.hasIcalConfig && !isEditing && (
        <div className="absolute inset-0 flex items-center px-4">
          <button onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-violet-600 transition-colors group">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            </span>
            Conectar Airbnb / Booking para ver reservas
          </button>
        </div>
      )}

      {/* Inline config form (for new or editing existing) */}
      {isEditing && (
        <div className="absolute inset-0 z-10 flex items-center px-3 py-1 bg-white/95">
          <div className="w-full max-w-lg">
            <IcalPanel propertyId={prop.id} propertyName={prop.name} initial={prop.icalConfig}
              onSaved={() => { setShowConfig(false); onNeedRefresh() }} />
          </div>
          <button onClick={() => { setShowConfig(false); onCloseEdit?.() }} className="ml-2 p-1 rounded-full hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
