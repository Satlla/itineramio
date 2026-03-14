'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Euro, Calendar, SortAsc } from 'lucide-react'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface ApartmentStat {
  name: string
  totalRevenue: number
  totalNights: number
  totalReservations: number
  avgRevenue: number
  occupancyPct: number
  commission: number
}

interface StatsData {
  months: Array<{
    month: number
    year: number
    monthName: string
    byApartment?: Record<string, { revenue: number; reservations: number; nights: number }>
  }>
  apartments: ApartmentStat[]
}

type SortKey = 'totalRevenue' | 'occupancyPct' | 'name'

function OccupancyBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct))
  const color = clamped >= 70 ? 'bg-green-500' : clamped >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs text-gray-300 w-10 text-right">{pct.toFixed(1)}%</span>
    </div>
  )
}

export default function ApartamentosPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('totalRevenue')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/satllabot/data/stats?months=6', { credentials: 'include' })
      if (!res.ok) throw new Error('Error cargando datos')
      setStats(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Cargando apartamentos...</p>
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

  if (!stats) return null

  const sorted = [...stats.apartments].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return b[sortBy] - a[sortBy]
  })

  const now = new Date()
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Apartamentos</h2>
          <p className="text-gray-400 text-sm">Últimos 6 meses · {stats.apartments.length} unidades</p>
        </div>
        <button
          onClick={() => setSortBy(s => s === 'totalRevenue' ? 'occupancyPct' : s === 'occupancyPct' ? 'name' : 'totalRevenue')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
        >
          <SortAsc className="h-4 w-4" />
          {sortBy === 'totalRevenue' ? 'Ingresos' : sortBy === 'occupancyPct' ? 'Ocupación' : 'Nombre'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">Ingresos totales</p>
          <p className="text-green-400 font-bold text-sm mt-1">
            {stats.apartments.reduce((s, a) => s + a.totalRevenue, 0).toLocaleString('es-ES')} €
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">Reservas totales</p>
          <p className="text-white font-bold text-sm mt-1">
            {stats.apartments.reduce((s, a) => s + a.totalReservations, 0)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">Comisión total</p>
          <p className="text-blue-400 font-bold text-sm mt-1">
            {stats.apartments.reduce((s, a) => s + a.commission, 0).toLocaleString('es-ES')} €
          </p>
        </div>
      </div>

      {/* Apartment list */}
      <div className="space-y-2">
        {sorted.map(apt => (
          <button
            key={apt.name}
            onClick={() => router.push(`/satllabot/apartamentos/${encodeURIComponent(apt.name)}`)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-white font-medium text-sm">{apt.name}</span>
              <span className="text-green-400 font-bold text-sm">{apt.totalRevenue.toLocaleString('es-ES')} €</span>
            </div>

            <OccupancyBar pct={apt.occupancyPct} />

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {apt.totalReservations} reservas
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {apt.totalNights} noches
              </span>
              <span className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                {apt.commission.toLocaleString('es-ES')} € comisión
              </span>
            </div>
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center text-gray-500 py-12 text-sm">
          No hay datos de apartamentos disponibles
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
