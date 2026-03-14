'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

const APARTMENTS_ORDER = [
  'Campello', 'Rambla', 'Mercado Central', 'Ático Estación', 'Loft Industrial',
  'Jacuzzi Luceros', 'Nook Terrace', 'Loft Terraza', 'Casa Azul', 'Quintana',
  'Villa Mulet', 'San Blas', 'Acogedor 6 Pax', 'Cozy',
  'Suite 104', 'Suite 102', 'Suite 103', 'Suite 101',
  'Habitación 2', 'Habitación 3', 'Habitación 4',
  'Habitación 5', 'Habitación 6', 'Habitación 7',
]

interface Reservation {
  id: string
  apartamento: string
  huesped: string
  checkIn: string
  checkOut: string
  checkInDay: number
  checkOutDay: number
  noches: number
  pax: number
  total: number
  plataforma: string
  codigo: string
  estado: string
  limpieza: number
  spanStart: number
  spanEnd: number
  startsBeforeMonth: boolean
  endsAfterMonth: boolean
}

interface CalendarData {
  year: number
  month: number
  monthName: string
  daysInMonth: number
  firstDayOfWeek: number
  reservations: Reservation[]
}

const DAY_W = 36 // px per day column
const APT_W = 156 // px for apartment name column
const ROW_H = 40 // px per apartment row
const HEADER_H = 52 // px for day numbers header

function platformStyle(plataforma: string): { bar: string; text: string } {
  const lower = (plataforma || '').toLowerCase()
  if (lower.includes('airbnb')) return { bar: '#FF385C', text: 'white' }
  if (lower.includes('booking')) return { bar: '#003580', text: 'white' }
  return { bar: '#6B7280', text: 'white' }
}

function ReservationModal({ res, onClose }: { res: Reservation; onClose: () => void }) {
  const { bar } = platformStyle(res.plataforma)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white border border-gray-200 rounded-2xl p-5 max-w-sm w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: bar }} />
              <span className="text-xs font-medium text-gray-500">{res.plataforma}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{res.apartamento}</h3>
            <p className="text-gray-600 text-sm mt-0.5">{res.huesped}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 ml-3 mt-0.5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-0.5">Check-in</p>
            <p className="text-gray-900 font-semibold">{res.checkIn}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-0.5">Check-out</p>
            <p className="text-gray-900 font-semibold">{res.checkOut}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-0.5">Noches</p>
            <p className="text-gray-900 font-semibold">{res.noches}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-0.5">Pax</p>
            <p className="text-gray-900 font-semibold">{res.pax}</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <span className="text-gray-500 text-sm">Total</span>
          <span className="text-gray-900 font-bold text-lg">{res.total.toLocaleString('es-ES')} €</span>
        </div>

        {res.limpieza > 0 && (
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Limpieza</span>
            <span className="text-gray-700 font-medium">{res.limpieza} €</span>
          </div>
        )}

        {res.codigo && (
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Código</span>
            <span className="text-gray-600 font-mono text-xs">{res.codigo}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default function CalendarioPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Reservation | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const today = now.getDate()
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/satllabot/data/calendar?month=${month}&year=${year}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Error cargando calendario')
      setData(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  // Scroll to today on load
  useEffect(() => {
    if (data && isCurrentMonth && scrollRef.current) {
      const offset = APT_W + (today - 3) * DAY_W
      scrollRef.current.scrollLeft = Math.max(0, offset)
    }
  }, [data, isCurrentMonth, today])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 mb-3 text-sm">{error}</p>
          <button onClick={load} className="text-blue-600 text-sm hover:underline">Reintentar</button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { daysInMonth, reservations } = data
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Build day-of-week labels for the header
  const getDayLetter = (dayNum: number) => {
    const d = new Date(year, month, dayNum)
    return DAY_LETTERS[d.getDay()]
  }

  // Sort apartments
  const aptNames = APARTMENTS_ORDER.filter(name =>
    reservations.some(r => r.apartamento === name)
  )
  for (const r of reservations) {
    if (!aptNames.includes(r.apartamento)) aptNames.push(r.apartamento)
  }

  const byApt: Record<string, Reservation[]> = {}
  for (const r of reservations) {
    if (!byApt[r.apartamento]) byApt[r.apartamento] = []
    byApt[r.apartamento].push(r)
  }

  const totalW = APT_W + daysInMonth * DAY_W

  return (
    <div className="flex flex-col bg-white h-[calc(100vh-56px)] lg:h-screen">

      {/* Month navigator — sticky at top */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-gray-900 font-semibold text-base">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable calendar — both x and y */}
      <div ref={scrollRef} className="flex-1 overflow-auto relative">
        <div style={{ minWidth: totalW, position: 'relative' }}>

          {/* Day header — sticky top */}
          <div
            className="flex bg-white border-b border-gray-200 z-20"
            style={{ position: 'sticky', top: 0, height: HEADER_H }}
          >
            {/* Corner cell — sticky left AND top */}
            <div
              className="shrink-0 bg-white border-r border-gray-200 flex items-end pb-2 px-3 z-30"
              style={{ position: 'sticky', left: 0, width: APT_W, minWidth: APT_W }}
            >
              <span className="text-xs font-medium text-gray-400">Apartamento</span>
            </div>

            {/* Day number cells */}
            {days.map(d => {
              const isToday = isCurrentMonth && d === today
              const letter = getDayLetter(d)
              const isWeekend = letter === 'S' || letter === 'D'
              return (
                <div
                  key={d}
                  className={`shrink-0 flex flex-col items-center justify-end pb-1.5 border-r border-gray-100 ${
                    isWeekend ? 'bg-gray-50/60' : ''
                  }`}
                  style={{ width: DAY_W }}
                >
                  <span className={`text-[10px] leading-none mb-0.5 ${isToday ? 'text-blue-500 font-semibold' : 'text-gray-400'}`}>
                    {letter}
                  </span>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600'
                  }`}>
                    {d}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Apartment rows */}
          {aptNames.map((aptName, rowIdx) => {
            const aptRes = byApt[aptName] || []
            return (
              <div
                key={aptName}
                className={`flex border-b border-gray-100 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                style={{ height: ROW_H }}
              >
                {/* Apartment name — sticky left */}
                <div
                  className={`shrink-0 flex items-center px-3 border-r border-gray-200 z-10 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  style={{ position: 'sticky', left: 0, width: APT_W, minWidth: APT_W }}
                >
                  <span className="text-xs text-gray-700 font-medium truncate">{aptName}</span>
                </div>

                {/* Day cells container — relative for absolute bars */}
                <div className="relative flex-1" style={{ height: ROW_H }}>
                  {/* Grid lines */}
                  {days.map(d => {
                    const isToday = isCurrentMonth && d === today
                    const letter = getDayLetter(d)
                    const isWeekend = letter === 'S' || letter === 'D'
                    return (
                      <div
                        key={d}
                        className={`absolute top-0 h-full border-r border-gray-100 ${
                          isToday ? 'bg-blue-50/40' : isWeekend ? 'bg-gray-50/40' : ''
                        }`}
                        style={{ left: (d - 1) * DAY_W, width: DAY_W }}
                      />
                    )
                  })}

                  {/* Reservation bars */}
                  {aptRes.map(r => {
                    const { bar, text } = platformStyle(r.plataforma)

                    // Left: start at middle of checkin day (or left edge if continues from prev month)
                    const leftPx = r.startsBeforeMonth
                      ? 0
                      : (r.checkInDay - 1) * DAY_W + DAY_W * 0.5

                    // Right: end at middle of checkout day (or right edge if continues to next month)
                    const rightPx = r.endsAfterMonth
                      ? daysInMonth * DAY_W
                      : (r.checkOutDay - 1) * DAY_W + DAY_W * 0.5

                    const width = rightPx - leftPx
                    if (width <= 0) return null

                    // Rounded corners: only round the checkin side (right is always flat or round end)
                    const borderRadius = r.startsBeforeMonth
                      ? `0 6px 6px 0`
                      : r.endsAfterMonth
                        ? `6px 0 0 6px`
                        : '6px'

                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="absolute hover:opacity-80 transition-opacity cursor-pointer overflow-hidden"
                        style={{
                          left: leftPx + 1,
                          width: width - 2,
                          top: 6,
                          height: ROW_H - 12,
                          background: bar,
                          borderRadius,
                        }}
                        title={`${r.huesped} — ${r.checkIn} → ${r.checkOut}`}
                      >
                        <div className="px-2 flex items-center h-full gap-1 min-w-0">
                          <span
                            className="text-xs font-medium leading-none truncate"
                            style={{ color: text, opacity: 0.95 }}
                          >
                            {r.huesped}
                          </span>
                          {r.total > 0 && width > 80 && (
                            <span
                              className="text-[10px] leading-none shrink-0"
                              style={{ color: text, opacity: 0.7 }}
                            >
                              {r.total}€
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {aptNames.length === 0 && (
            <div className="text-center text-gray-400 py-16 text-sm">
              Sin reservas en {MONTH_NAMES[month]} {year}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="shrink-0 border-t border-gray-100 px-4 py-2.5 flex items-center gap-5 text-xs text-gray-400 bg-white">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#FF385C' }} />
          <span>Airbnb</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#003580' }} />
          <span>Booking</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-400" />
          <span>Otro</span>
        </div>
        <span className="ml-auto">{reservations.length} reservas</span>
      </div>

      {selected && <ReservationModal res={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
