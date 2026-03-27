'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Settings, WifiOff, Lightbulb, X, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

// ─── Platform colours ────────────────────────────────────────────────────────
const PC: Record<string, { bg: string; text: string; label: string }> = {
  AIRBNB:  { bg: '#00A699', text: '#fff', label: 'Airbnb'  },
  BOOKING: { bg: '#003580', text: '#fff', label: 'Booking' },
  VRBO:    { bg: '#1C6B8A', text: '#fff', label: 'VRBO'    },
  OTHER:   { bg: '#888',    text: '#fff', label: 'Otro'    },
}

// ─── Multi-month config (mirrors Satllabot) ──────────────────────────────────
const MONTHS_BEFORE = 1
const MONTHS_AFTER  = 10
const COL_W         = 36   // px per day column (desktop)
const SIDEBAR_W     = 200  // px
const ROW_H         = 56   // px
const MONTH_BAR_H   = 26   // px
const DAY_BAR_H     = 40   // px

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_LABELS  = ['L','M','X','J','V','S','D']

interface MonthMeta {
  year: number
  month: number   // 0-indexed (JS)
  month1: number  // 1-indexed
  daysInMonth: number
  startCol: number
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

// ─── Build the 12-month metadata array ───────────────────────────────────────
function buildMonths(): MonthMeta[] {
  const today = new Date()
  const result: MonthMeta[] = []
  let col = 0
  for (let i = -MONTHS_BEFORE; i <= MONTHS_AFTER; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      month1: d.getMonth() + 1,
      daysInMonth,
      startCol: col,
    })
    col += daysInMonth
  }
  return result
}

// Convert YYYY-MM-DD to global column index (null if out of range)
function dateToCol(dateStr: string, months: MonthMeta[]): number | null {
  const [y, m, d] = dateStr.split('-').map(Number)
  const meta = months.find(x => x.year === y && x.month1 === m)
  if (!meta) return null
  return meta.startCol + d - 1
}

// ─── Mobile mini-calendar (dots) ─────────────────────────────────────────────
function MiniCalendar({ occupancy, daysInMonth, year, month }: {
  occupancy: Array<{ day: number; platform: string }>
  daysInMonth: number; year: number; month: number
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

// ─── iCal Config panel ───────────────────────────────────────────────────────
function IcalPanel({ propertyId, propertyName, initial, onSaved }: {
  propertyId: string; propertyName: string
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
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ propertyId, ...urls })
      })
      if (!res.ok) throw new Error()
      setMsg('¡Guardado! Actualizando…')
      setTimeout(() => { setMsg(''); onSaved() }, 1200)
    } catch { setMsg('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-600">Conectar iCal — {propertyName}</p>
        <button onClick={() => setShowTip(v => !v)} className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700">
          <Lightbulb className="w-3.5 h-3.5" /> ¿Cómo?
        </button>
      </div>
      <AnimatePresence>
        {showTip && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="text-[11px] bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-amber-800 space-y-1 leading-relaxed">
              <p><strong>Airbnb:</strong> Anuncios → tu anuncio → Disponibilidad → Sincronizar calendarios → Exportar (.ics)</p>
              <p><strong>Booking:</strong> Extranet → Propiedades → Calendario → Exportar iCal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {([
        { key: 'airbnb' as const, label: 'Airbnb',          color: PC.AIRBNB.bg,  ph: 'https://www.airbnb.es/calendar/ical/...' },
        { key: 'booking' as const, label: 'Booking',         color: PC.BOOKING.bg, ph: 'https://admin.booking.com/...' },
        { key: 'vrbo'    as const, label: 'VRBO (opcional)', color: PC.VRBO.bg,    ph: 'https://www.vrbo.com/calendar/...' },
      ]).map(({ key, label, color, ph }) => (
        <div key={key}>
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mb-1">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />{label}
          </label>
          <input type="url" value={urls[key]} onChange={e => setUrls(u => ({ ...u, [key]: e.target.value }))}
            placeholder={ph} className="w-full text-[11px] px-2.5 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-violet-400" />
        </div>
      ))}
      {msg && <p className={`text-[11px] font-medium ${msg.includes('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</p>}
      <button onClick={save} disabled={saving}
        className="flex items-center justify-center gap-1.5 w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {saving ? 'Guardando…' : 'Guardar y sincronizar'}
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const now = new Date()
  const months = useMemo(() => buildMonths(), [])
  const totalCols = useMemo(() => months.reduce((s, m) => s + m.daysInMonth, 0), [months])

  // For mobile: show current month
  const [mobileYear, setMobileYear]   = useState(now.getFullYear())
  const [mobileMonth, setMobileMonth] = useState(now.getMonth() + 1)

  const [properties, setProperties]   = useState<CalendarProperty[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [editingPropId, setEditingPropId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch covers the full multi-month window
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      // Use the first month of our range as start, last as end
      const first = months[0]
      const last  = months[months.length - 1]
      const url   = `/api/calendar/properties?year=${first.year}&month=${first.month1}&endYear=${last.year}&endMonth=${last.month1}`
      const res   = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error('Error al cargar')
      const data  = await res.json()
      setProperties(data.properties || [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [months])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-scroll to center today on desktop
  useEffect(() => {
    if (!scrollRef.current || loading) return
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    const todayCol = dateToCol(todayStr, months)
    if (todayCol == null) return
    const viewW = scrollRef.current.clientWidth - SIDEBAR_W
    const todayCenter = todayCol * COL_W + COL_W / 2
    scrollRef.current.scrollLeft = Math.max(0, todayCenter - viewW / 2)
  }, [loading, months])

  // Today info
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const todayCol = dateToCol(todayStr, months) ?? -1

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-bold text-gray-900">Calendario</h1>
          <div className="flex items-center gap-1.5">
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
          {/* ══ DESKTOP: multi-month Gantt (Satllabot-style) ══ */}
          <div className="hidden lg:block">
            <div
              ref={scrollRef}
              style={{
                display: 'flex',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch' as any,
                scrollbarWidth: 'thin' as any,
                scrollbarColor: '#ddd transparent',
              } as React.CSSProperties}
            >
              {/* ── Sidebar (sticky left) ── */}
              <div style={{
                width: SIDEBAR_W, flexShrink: 0,
                position: 'sticky', left: 0, zIndex: 20,
                background: '#fff', borderRight: '1px solid #f3f4f6',
              }}>
                {/* Header placeholder (same height as month bar + day bar) */}
                <div style={{ height: MONTH_BAR_H + DAY_BAR_H, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }} />
                {/* Property rows */}
                {properties.map(prop => (
                  <div key={prop.id} style={{ height: ROW_H, borderBottom: '1px solid #f3f4f6' }}
                    className="flex items-center gap-2.5 px-3 hover:bg-gray-50/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {prop.profileImage
                        ? <img src={prop.profileImage} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{prop.name}</p>
                      {prop.hasIcalConfig ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          {prop.icalConfig.airbnb  && <span className="text-[9px] px-1 rounded text-white font-bold" style={{ backgroundColor: PC.AIRBNB.bg }}>A</span>}
                          {prop.icalConfig.booking && <span className="text-[9px] px-1 rounded text-white font-bold" style={{ backgroundColor: PC.BOOKING.bg }}>B</span>}
                          {prop.icalConfig.vrbo    && <span className="text-[9px] px-1 rounded text-white font-bold" style={{ backgroundColor: PC.VRBO.bg }}>V</span>}
                          <button onClick={() => setEditingPropId(editingPropId === prop.id ? null : prop.id)}
                            className="text-gray-400 hover:text-violet-500 transition-colors ml-0.5">
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
                ))}
              </div>

              {/* ── Grid (scrolls horizontally) ── */}
              <div style={{ flexShrink: 0, width: totalCols * COL_W, display: 'flex', flexDirection: 'column' }}>

                {/* Month label bar */}
                <div style={{ display: 'flex', height: MONTH_BAR_H, borderBottom: '1px solid #f3f4f6', background: '#f9fafb', flexShrink: 0 }}>
                  {months.map(m => (
                    <div key={`${m.year}-${m.month}`} style={{ width: m.daysInMonth * COL_W, flexShrink: 0, borderRight: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>
                        {MONTH_NAMES[m.month]} {m.year}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day header bar */}
                <div style={{ display: 'flex', height: DAY_BAR_H, borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
                  {months.map(m =>
                    Array.from({ length: m.daysInMonth }, (_, i) => i + 1).map(d => {
                      const date    = new Date(m.year, m.month, d)
                      const dow     = (date.getDay() + 6) % 7  // Mon=0
                      const isWknd  = dow >= 5
                      const isToday = m.startCol + d - 1 === todayCol
                      return (
                        <div key={`${m.year}-${m.month}-${d}`} style={{
                          width: COL_W, flexShrink: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                          borderRight: '1px solid #f3f4f6',
                          background: isToday ? '#eff6ff' : isWknd ? '#fafafa' : undefined,
                        }}>
                          <span style={{ fontSize: 9, color: isToday ? '#2563eb' : '#9ca3af', lineHeight: 1 }}>{DAY_LABELS[dow]}</span>
                          <span style={{
                            fontSize: 12, fontWeight: 600, lineHeight: 1,
                            width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                            background: isToday ? '#2563eb' : undefined,
                            color: isToday ? '#fff' : '#374151',
                          }}>{d}</span>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Property rows */}
                {properties.map(prop => (
                  <div key={prop.id} style={{ height: ROW_H, position: 'relative', flexShrink: 0, borderBottom: '1px solid #f3f4f6' }}>
                    {/* Background cells (weekends + today highlight) */}
                    <div style={{ display: 'flex', height: '100%', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                      {months.map(m =>
                        Array.from({ length: m.daysInMonth }, (_, i) => i + 1).map(d => {
                          const date   = new Date(m.year, m.month, d)
                          const dow    = (date.getDay() + 6) % 7
                          const isWknd = dow >= 5
                          const isTod  = m.startCol + d - 1 === todayCol
                          const isMStart = d === 1
                          return (
                            <div key={`${m.year}-${m.month}-${d}`} style={{
                              width: COL_W, flexShrink: 0, height: '100%',
                              borderRight: isMStart ? '2px solid #e5e7eb' : '1px solid #f9fafb',
                              background: isTod ? '#eff6ff' : isWknd ? '#fafafa' : undefined,
                            }} />
                          )
                        })
                      )}
                    </div>

                    {/* Reservation bars */}
                    {prop.events.map(ev => {
                      const ciCol = dateToCol(ev.checkIn, months)
                      const coCol = dateToCol(ev.checkOut, months)

                      // Clamp to visible range
                      const startCol = ciCol !== null ? ciCol : (ev.checkIn < `${months[0].year}-${String(months[0].month1).padStart(2,'0')}-01` ? 0 : null)
                      const endCol   = coCol !== null ? coCol - 1 : (ev.checkOut > `${months[months.length-1].year}-${String(months[months.length-1].month1).padStart(2,'0')}-31` ? totalCols - 1 : null)

                      if (startCol === null || endCol === null || startCol > totalCols || endCol < 0) return null

                      const c     = PC[ev.platform] || PC.OTHER
                      const left  = startCol * COL_W
                      const width = Math.max((endCol - startCol + 1) * COL_W - 2, COL_W - 2)
                      const isOngoing = ev.checkIn <= todayStr && ev.checkOut > todayStr

                      const tooltip = [
                        ev.reservationCode && `Reserva: ${ev.reservationCode}`,
                        `Entrada: ${ev.checkIn}`,
                        `Salida: ${ev.checkOut}`,
                        `Noches: ${ev.nights}`,
                        ev.phoneLast4 && `Tel: ···${ev.phoneLast4}`,
                      ].filter(Boolean).join('\n')

                      return (
                        <div key={ev.id} title={tooltip} style={{
                          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                          height: 28, left, width,
                          backgroundColor: c.bg, borderRadius: 20,
                          display: 'flex', alignItems: 'center',
                          paddingLeft: 10, paddingRight: 8,
                          overflow: 'hidden', gap: 6,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          cursor: 'default', zIndex: 5,
                          transition: 'filter 0.15s',
                        }}>
                          <span style={{ color: c.text, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                            {ev.guestName || ev.reservationCode || 'Reservado'} · {ev.nights}n
                          </span>
                          {isOngoing && width > 80 && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: c.bg, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 4, padding: '1px 5px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                              En curso
                            </span>
                          )}
                          {!isOngoing && ev.phoneLast4 && width > 100 && (
                            <span style={{ color: c.text, fontSize: 10, opacity: 0.75, whiteSpace: 'nowrap', flexShrink: 0 }}>···{ev.phoneLast4}</span>
                          )}
                        </div>
                      )
                    })}

                    {/* No iCal / edit overlay */}
                    {editingPropId === prop.id && (
                      <div className="absolute inset-0 z-10 flex items-center px-3 py-1 bg-white/95">
                        <div className="w-full max-w-lg">
                          <IcalPanel propertyId={prop.id} propertyName={prop.name} initial={prop.icalConfig}
                            onSaved={() => { setEditingPropId(null); fetchData() }} />
                        </div>
                        <button onClick={() => setEditingPropId(null)} className="ml-2 p-1 rounded-full hover:bg-gray-100 text-gray-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {!prop.hasIcalConfig && editingPropId !== prop.id && (
                      <div className="absolute inset-0 flex items-center px-4" style={{ zIndex: 4 }}>
                        <button onClick={() => setEditingPropId(prop.id)}
                          className="flex items-center gap-2 text-xs text-gray-400 hover:text-violet-600 transition-colors group">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                          Conectar Airbnb / Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Webkit scrollbar CSS */}
            <style>{`
              div[style*="overflowX: auto"]::-webkit-scrollbar { height: 5px; }
              div[style*="overflowX: auto"]::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
            `}</style>
          </div>

          {/* ══ MOBILE VIEW ══ */}
          <div className="lg:hidden">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-50">
              {Object.entries(PC).filter(([k]) => k !== 'OTHER').map(([k, v]) => (
                <div key={k} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: v.bg }} />
                  <span className="text-[10px] text-gray-500">{v.label}</span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-gray-50 pb-24">
              {properties.map((prop, i) => (
                <motion.div key={prop.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={`/calendario/${prop.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {prop.profileImage
                        ? <img src={prop.profileImage} alt={prop.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{prop.name}</p>
                      <p className="text-xs text-gray-400">{prop.status === 'ACTIVE' ? 'Publicado' : 'Borrador'}</p>
                      {prop.hasIcalConfig && (
                        <div className="flex gap-1 mt-0.5">
                          {prop.icalConfig.airbnb  && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PC.AIRBNB.bg }}>Airbnb</span>}
                          {prop.icalConfig.booking && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PC.BOOKING.bg }}>Booking</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {prop.hasIcalConfig ? (
                        <MiniCalendar occupancy={prop.occupancy} daysInMonth={prop.daysInMonth} year={mobileYear} month={mobileMonth} />
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
