'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, XCircle } from 'lucide-react'

interface Reservation {
  apartamento: string
  huesped: string
  checkIn: string
  checkOut: string
  noches: number
  pax: number
  plataforma: string
  total: number
  codigo: string
  estado: string
}

interface MonthData {
  year: number
  month: number
  monthName: string
  total: number
  cancelledCount: number
  reservations: Reservation[]
  cancelled: Reservation[]
}

const MONTH_NAMES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function PlatformBadge({ plataforma }: { plataforma: string }) {
  const lower = (plataforma || '').toLowerCase()
  if (lower.includes('airbnb')) return <span className="px-1.5 py-0.5 rounded text-xs bg-rose-900 text-rose-300">Airbnb</span>
  if (lower.includes('booking')) return <span className="px-1.5 py-0.5 rounded text-xs bg-blue-900 text-blue-300">Booking</span>
  return <span className="px-1.5 py-0.5 rounded text-xs bg-gray-700 text-gray-300">{plataforma || '—'}</span>
}

export default function SatllaReservasPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [data, setData] = useState<MonthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [showCancelled, setShowCancelled] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/satllabot/data/reservations?month=${month}&year=${year}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Error cargando reservas')
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

  const apartments = data ? [...new Set(data.reservations.map(r => r.apartamento))].sort() : []
  const filtered = data ? data.reservations.filter(r =>
    !filter || r.apartamento === filter
  ) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{MONTH_NAMES_ES[month]} {year}</h2>
          {data && (
            <p className="text-gray-400 text-sm">{data.total} reservas · {data.cancelledCount} canceladas</p>
          )}
        </div>
        <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Filtro por apartamento */}
      {apartments.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilter('')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !filter ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Todos
          </button>
          {apartments.map(apt => (
            <button
              key={apt}
              onClick={() => setFilter(f => f === apt ? '' : apt)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === apt ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {apt}
            </button>
          ))}
        </div>
      )}

      {/* KPI rápido */}
      {data && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <p className="text-2xl font-bold text-white">{filtered.length}</p>
            <p className="text-gray-400 text-xs">Reservas</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <p className="text-2xl font-bold text-white">{filtered.reduce((s, r) => s + r.noches, 0)}</p>
            <p className="text-gray-400 text-xs">Noches</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <p className="text-2xl font-bold text-white">
              {filtered.reduce((s, r) => s + r.total, 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
            </p>
            <p className="text-gray-400 text-xs">Total</p>
          </div>
        </div>
      )}

      {/* Lista reservas */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm bg-gray-900 rounded-xl p-6 text-center">
          Sin reservas{filter ? ` para ${filter}` : ''}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{r.apartamento}</p>
                  <p className="text-gray-300 text-sm">{r.huesped}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {r.checkIn} → {r.checkOut} · {r.noches}n · {r.pax}px
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <PlatformBadge plataforma={r.plataforma} />
                  <span className="text-white font-semibold text-sm">{r.total.toFixed(0)}€</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Canceladas */}
      {data && data.cancelledCount > 0 && (
        <div>
          <button
            onClick={() => setShowCancelled(!showCancelled)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            {showCancelled ? 'Ocultar' : 'Ver'} {data.cancelledCount} cancelada{data.cancelledCount !== 1 ? 's' : ''}
          </button>
          {showCancelled && (
            <div className="space-y-2 mt-2">
              {data.cancelled.map((r, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 opacity-50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{r.apartamento}</p>
                      <p className="text-gray-400 text-sm">{r.huesped}</p>
                      <p className="text-gray-500 text-xs mt-1">{r.checkIn} → {r.checkOut}</p>
                    </div>
                    <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded">Cancelada</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button onClick={load} className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar
        </button>
      </div>
    </div>
  )
}
