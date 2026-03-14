'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

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

function platformColor(plataforma: string) {
  const lower = (plataforma || '').toLowerCase()
  if (lower.includes('airbnb')) return 'bg-rose-700 border-rose-600'
  if (lower.includes('booking')) return 'bg-blue-700 border-blue-600'
  return 'bg-gray-600 border-gray-500'
}

function ReservationModal({ res, onClose }: { res: Reservation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-lg">{res.apartamento}</h3>
            <p className="text-gray-300 text-sm">{res.huesped}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white ml-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Check-in</span>
            <span className="text-white font-medium">{res.checkIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Check-out</span>
            <span className="text-white font-medium">{res.checkOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Noches</span>
            <span className="text-white">{res.noches}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pax</span>
            <span className="text-white">{res.pax}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Plataforma</span>
            <span className="text-white">{res.plataforma}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total</span>
            <span className="text-green-400 font-semibold">{res.total.toLocaleString('es-ES')} €</span>
          </div>
          {res.limpieza > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Limpieza</span>
              <span className="text-white">{res.limpieza} €</span>
            </div>
          )}
          {res.codigo && (
            <div className="flex justify-between">
              <span className="text-gray-400">Código</span>
              <span className="text-gray-300 font-mono text-xs">{res.codigo}</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-2 text-sm transition-colors"
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
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-center">
          <p className="text-red-300 mb-3">{error}</p>
          <button onClick={load} className="text-blue-400 text-sm hover:underline">Reintentar</button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { daysInMonth, reservations } = data
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Get all apartments that have reservations, plus keep known order
  const aptNames = APARTMENTS_ORDER.filter(name =>
    reservations.some(r => r.apartamento === name)
  )
  // Also add any apartment not in APARTMENTS_ORDER
  for (const r of reservations) {
    if (!aptNames.includes(r.apartamento)) aptNames.push(r.apartamento)
  }

  // Group reservations by apartment
  const byApt: Record<string, Reservation[]> = {}
  for (const r of reservations) {
    if (!byApt[r.apartamento]) byApt[r.apartamento] = []
    byApt[r.apartamento].push(r)
  }

  // Column width for days
  const dayColWidth = 42

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-950 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white p-1">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-white font-bold text-lg">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white p-1">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${180 + daysInMonth * dayColWidth}px` }}>
          {/* Day numbers header */}
          <div className="flex sticky top-[57px] z-10 bg-gray-900 border-b border-gray-800">
            {/* Apartment name column */}
            <div className="w-44 shrink-0 px-3 py-2 text-xs text-gray-500 font-medium border-r border-gray-800">
              Apartamento
            </div>
            {days.map(d => (
              <div
                key={d}
                className={`text-center text-xs py-2 font-medium border-r border-gray-800 shrink-0 ${
                  isCurrentMonth && d === today
                    ? 'text-blue-400 bg-blue-950/40'
                    : 'text-gray-400'
                }`}
                style={{ width: dayColWidth }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Apartment rows */}
          {aptNames.map(aptName => {
            const aptRes = byApt[aptName] || []
            return (
              <div key={aptName} className="flex border-b border-gray-800/60 hover:bg-gray-900/30">
                {/* Apartment name */}
                <div className="w-44 shrink-0 px-3 py-2 border-r border-gray-800 flex items-center">
                  <span className="text-xs text-gray-300 font-medium truncate">{aptName}</span>
                </div>

                {/* Day cells + reservation blocks */}
                <div className="relative flex flex-1" style={{ height: 44 }}>
                  {/* Day grid lines */}
                  {days.map(d => (
                    <div
                      key={d}
                      className={`shrink-0 h-full border-r border-gray-800/40 ${
                        isCurrentMonth && d === today ? 'bg-blue-950/20' : ''
                      }`}
                      style={{ width: dayColWidth }}
                    />
                  ))}

                  {/* Reservation blocks */}
                  {aptRes.map(r => {
                    const startCol = r.spanStart - 1 // 0-based
                    const endCol = r.spanEnd // exclusive
                    const span = endCol - startCol
                    const left = startCol * dayColWidth
                    const width = span * dayColWidth - 2

                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className={`absolute top-1.5 rounded-md border px-1.5 overflow-hidden text-left cursor-pointer hover:opacity-90 transition-opacity ${platformColor(r.plataforma)}`}
                        style={{
                          left: left + 1,
                          width,
                          height: 28,
                        }}
                        title={`${r.huesped} — ${r.total}€`}
                      >
                        <span className="text-white text-xs font-medium leading-none block truncate">
                          {r.huesped}
                        </span>
                        <span className="text-white/70 text-[10px] leading-none block truncate">
                          {r.total > 0 ? `${r.total}€` : ''}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {aptNames.length === 0 && (
            <div className="text-center text-gray-500 py-12 text-sm">
              No hay reservas en {MONTH_NAMES[month]} {year}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-rose-700" /> Airbnb
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-700" /> Booking
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-600" /> Otro
        </div>
        <span className="ml-auto text-gray-600">{reservations.length} reservas</span>
      </div>

      {/* Modal */}
      {selected && <ReservationModal res={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
