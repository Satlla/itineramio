'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowLeft, Settings, RefreshCw, Save, X, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const PLATFORM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  AIRBNB:  { bg: '#00A699', text: '#fff', label: 'Airbnb' },
  BOOKING: { bg: '#003580', text: '#fff', label: 'Booking' },
  VRBO:    { bg: '#1C6B8A', text: '#fff', label: 'VRBO' },
  OTHER:   { bg: '#888888', text: '#fff', label: 'Otro' }
}

interface CalEvent {
  id: string
  guestName: string
  checkIn: string   // YYYY-MM-DD
  checkOut: string  // YYYY-MM-DD
  nights: number
  platform: string
  guestCount?: number
}

interface IcalConfig {
  airbnb: string
  booking: string
  vrbo: string
}

// Returns all dates in [start, end) as YYYY-MM-DD strings
function datesInRange(start: string, end: string): string[] {
  const result: string[] = []
  const cur = new Date(start + 'T00:00:00')
  const fin = new Date(end + 'T00:00:00')
  while (cur < fin) {
    result.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

function buildMonthGrid(year: number, month: number) {
  // Returns rows of day numbers (0 = empty)
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const startPad = (firstDay + 6) % 7 // start on Monday
  const cells: (number | null)[] = Array(startPad).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

export default function PropertyCalendarPage() {
  const params = useParams()
  const propertyId = params.propertyId as string

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [propertyName, setPropertyName] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [icalConfig, setIcalConfig] = useState<IcalConfig>({ airbnb: '', booking: '', vrbo: '' })
  const [savingConfig, setSavingConfig] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/calendar/property-events?propertyId=${propertyId}&year=${year}&month=${month}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Error')
      const data = await res.json()
      setEvents(data.events || [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [propertyId, year, month])

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/calendar/ical-config?propertyId=${propertyId}`, {
        credentials: 'include'
      })
      if (!res.ok) return
      const data = await res.json()
      setIcalConfig({ airbnb: data.airbnb || '', booking: data.booking || '', vrbo: data.vrbo || '' })
    } catch {}
  }, [propertyId])

  useEffect(() => {
    fetchConfig()
    // Get property name from URL or fetch it
    fetch(`/api/properties/${propertyId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setPropertyName(d.name) })
      .catch(() => {})
  }, [propertyId, fetchConfig])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const saveConfig = async () => {
    setSavingConfig(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/calendar/ical-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId, ...icalConfig })
      })
      if (!res.ok) throw new Error('Error')
      setSaveMsg('¡Guardado!')
      setShowSettings(false)
      fetchEvents()
    } catch {
      setSaveMsg('Error al guardar')
    } finally {
      setSavingConfig(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  // Build occupancy map: YYYY-MM-DD → platform
  const occupancyMap: Record<string, string> = {}
  const checkInDays = new Set<string>()
  const checkOutDays = new Set<string>()

  for (const ev of events) {
    checkInDays.add(ev.checkIn)
    checkOutDays.add(ev.checkOut)
    for (const d of datesInRange(ev.checkIn, ev.checkOut)) {
      if (!occupancyMap[d]) occupancyMap[d] = ev.platform
    }
  }

  const grid = buildMonthGrid(year, month)
  const todayStr = now.toISOString().split('T')[0]

  const dayStr = (d: number) => {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  // Current month events sorted
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`
  const monthEvents = events
    .filter(e => e.checkOut > monthStart && e.checkIn <= monthEnd)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/calendario" className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{propertyName || 'Calendario'}</h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            title="Configurar iCal"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={fetchEvents}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month navigator */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-base font-semibold text-gray-800">{monthNames[month - 1]} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Platform legend */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {Object.entries(PLATFORM_COLORS).filter(([k]) => k !== 'OTHER').map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: val.bg }} />
              <span className="text-xs text-gray-500">{val.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 mb-1">
                {week.map((day, di) => {
                  if (!day) return <div key={di} />
                  const ds = dayStr(day)
                  const platform = occupancyMap[ds]
                  const isCheckIn = checkInDays.has(ds)
                  const isCheckOut = checkOutDays.has(ds)
                  const isToday = ds === todayStr
                  const col = platform ? PLATFORM_COLORS[platform] : null

                  return (
                    <div
                      key={di}
                      className="relative h-10 flex flex-col items-center justify-center mx-0.5"
                    >
                      {/* Background fill for occupied days */}
                      {col && (
                        <div
                          className="absolute inset-0 rounded-lg opacity-20"
                          style={{ backgroundColor: col.bg }}
                        />
                      )}
                      {/* Check-in dot (bottom left) */}
                      {isCheckIn && col && (
                        <div
                          className="absolute bottom-0.5 left-1 w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: col.bg }}
                          title="Check-in"
                        />
                      )}
                      {/* Check-out dot (bottom right) */}
                      {isCheckOut && (
                        <div
                          className="absolute bottom-0.5 right-1 w-1.5 h-1.5 rounded-full bg-gray-400"
                          title="Check-out"
                        />
                      )}
                      <span className={`text-xs font-medium z-10 relative ${
                        isToday
                          ? 'w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center text-[11px]'
                          : col ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        {day}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Reservations list */}
            {monthEvents.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Reservas este mes</h2>
                <div className="space-y-2">
                  {monthEvents.map(ev => {
                    const col = PLATFORM_COLORS[ev.platform] || PLATFORM_COLORS.OTHER
                    return (
                      <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: col.bg }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{ev.guestName}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(ev.checkIn)} → {formatDate(ev.checkOut)} · {ev.nights} noche{ev.nights !== 1 ? 's' : ''}
                            {ev.guestCount ? ` · ${ev.guestCount} pers.` : ''}
                          </p>
                        </div>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: col.bg, color: col.text }}
                        >
                          {col.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-6">
                <p className="text-sm text-gray-400">Sin reservas para {monthNames[month - 1]} {year}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Settings drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettings(false)} />
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:m-4 z-10"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Configurar iCal</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Airbnb */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  <span className="inline-block w-2 h-2 rounded-sm mr-1.5 align-middle" style={{ backgroundColor: PLATFORM_COLORS.AIRBNB.bg }} />
                  URL iCal Airbnb
                </label>
                <input
                  type="url"
                  value={icalConfig.airbnb}
                  onChange={e => setIcalConfig(c => ({ ...c, airbnb: e.target.value }))}
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                  className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-gray-50"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Airbnb → Anuncios → Gestión de disponibilidad → Exportar calendario
                </p>
              </div>

              {/* Booking */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  <span className="inline-block w-2 h-2 rounded-sm mr-1.5 align-middle" style={{ backgroundColor: PLATFORM_COLORS.BOOKING.bg }} />
                  URL iCal Booking.com
                </label>
                <input
                  type="url"
                  value={icalConfig.booking}
                  onChange={e => setIcalConfig(c => ({ ...c, booking: e.target.value }))}
                  placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?..."
                  className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-gray-50"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Booking → Extranet → Calendario → Exportar
                </p>
              </div>

              {/* VRBO */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  <span className="inline-block w-2 h-2 rounded-sm mr-1.5 align-middle" style={{ backgroundColor: PLATFORM_COLORS.VRBO.bg }} />
                  URL iCal VRBO (opcional)
                </label>
                <input
                  type="url"
                  value={icalConfig.vrbo}
                  onChange={e => setIcalConfig(c => ({ ...c, vrbo: e.target.value }))}
                  placeholder="https://www.vrbo.com/calendar/..."
                  className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-gray-50"
                />
              </div>
            </div>

            {saveMsg && (
              <p className={`text-xs mt-3 font-medium ${saveMsg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMsg}
              </p>
            )}

            <button
              onClick={saveConfig}
              disabled={savingConfig}
              className="w-full mt-5 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingConfig ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savingConfig ? 'Guardando…' : 'Guardar'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-')
  const months = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${parseInt(d)} ${months[parseInt(m)]}`
}
