'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Download, ArrowLeft } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

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
  limpieza: number
  comisionPct: number
}

interface StatsData {
  months: Array<{
    month: number
    year: number
    monthName: string
    totalRevenue: number
    reservations: number
    totalNights: number
    totalCommission: number
  }>
  apartments: Array<{
    name: string
    totalRevenue: number
    totalNights: number
    totalReservations: number
    avgRevenue: number
    occupancyPct: number
    commission: number
  }>
}

interface ReservationsData {
  reservations: Reservation[]
}

function PlatformBadge({ plataforma }: { plataforma: string }) {
  const lower = (plataforma || '').toLowerCase()
  if (lower.includes('airbnb')) return <span className="px-1.5 py-0.5 rounded text-xs bg-rose-900 text-rose-300">Airbnb</span>
  if (lower.includes('booking')) return <span className="px-1.5 py-0.5 rounded text-xs bg-blue-900 text-blue-300">Booking</span>
  return <span className="px-1.5 py-0.5 rounded text-xs bg-gray-700 text-gray-300">{plataforma || '—'}</span>
}

export default function ApartamentoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const nombre = decodeURIComponent(params.nombre as string)

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [stats, setStats] = useState<StatsData | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, resRes] = await Promise.all([
        fetch('/api/satllabot/data/stats?months=6', { credentials: 'include' }),
        fetch(`/api/satllabot/data/reservations?month=${month}&year=${year}`, { credentials: 'include' }),
      ])
      if (!statsRes.ok || !resRes.ok) throw new Error('Error cargando datos')
      const [s, r]: [StatsData, ReservationsData] = await Promise.all([statsRes.json(), resRes.json()])
      setStats(s)
      const aptReservations = (r.reservations || r as unknown as Reservation[]).filter((res: Reservation) =>
        (res.apartamento || '').toLowerCase() === nombre.toLowerCase()
      )
      setReservations(aptReservations)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [month, year, nombre])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch(
        `/api/satllabot/data/export?month=${month}&year=${year}&apartamento=${encodeURIComponent(nombre)}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Error exportando')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Reservas_${nombre.replace(/\s+/g, '_')}_${MONTH_NAMES[month]}_${year}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al exportar')
    } finally {
      setExporting(false)
    }
  }

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
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
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

  // Apartment global stats
  const aptStats = stats?.apartments.find(a => a.name.toLowerCase() === nombre.toLowerCase())

  // Revenue chart per month from stats
  // We extract this apartment's revenue per month from topApartments
  const revenueByMonth = stats?.months.map(m => ({
    name: MONTH_SHORT[m.month],
    ingresos: 0, // We don't have per-apt breakdown in months from stats endpoint
  })) || []

  // Active reservations for the month
  const activeReservations = reservations.filter(r => r.estado !== 'Cancelada')
  const monthRevenue = activeReservations.reduce((s, r) => s + r.total, 0)
  const monthNights = activeReservations.reduce((s, r) => s + r.noches, 0)
  const monthCommission = activeReservations.reduce((s, r) => {
    const base = Math.max(0, r.total - r.limpieza)
    return s + base * ((r.comisionPct || 20) / 100)
  }, 0)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const occupancy = daysInMonth > 0 ? ((monthNights / daysInMonth) * 100).toFixed(1) : '0.0'

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push('/satllabot/apartamentos')}
        className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Apartamentos
      </button>

      <h2 className="text-white font-bold text-xl">{nombre}</h2>

      {/* Global stats */}
      {aptStats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Ingresos 6 meses</p>
            <p className="text-green-400 font-bold">{aptStats.totalRevenue.toLocaleString('es-ES')} €</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Comisión 6 meses</p>
            <p className="text-blue-400 font-bold">{aptStats.commission.toLocaleString('es-ES')} €</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Reservas 6 meses</p>
            <p className="text-white font-bold">{aptStats.totalReservations}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs">ADR medio</p>
            <p className="text-white font-bold">{aptStats.avgRevenue.toLocaleString('es-ES')} €</p>
          </div>
        </div>
      )}

      {/* Month selector */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white p-1">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-white font-medium">{MONTH_NAMES[month]} {year}</span>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white p-1">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Month KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-gray-500 text-xs">Ingresos mes</p>
          <p className="text-green-400 font-bold">{monthRevenue.toLocaleString('es-ES')} €</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-gray-500 text-xs">Ocupación</p>
          <p className="text-yellow-400 font-bold">{occupancy}%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-gray-500 text-xs">Noches</p>
          <p className="text-white font-bold">{monthNights}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-gray-500 text-xs">Comisión mes</p>
          <p className="text-blue-400 font-bold">{monthCommission.toFixed(0)} €</p>
        </div>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white rounded-xl py-3 text-sm font-medium transition-colors"
      >
        <Download className="h-4 w-4" />
        {exporting ? 'Exportando...' : `Exportar Excel — ${MONTH_NAMES[month]} ${year}`}
      </button>

      {/* Reservations list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          Reservas {MONTH_NAMES[month]} {year} ({activeReservations.length})
        </h3>
        {activeReservations.length === 0 ? (
          <p className="text-gray-500 text-sm text-center bg-gray-900 border border-gray-800 rounded-xl p-4">
            Sin reservas este mes
          </p>
        ) : (
          <div className="space-y-2">
            {activeReservations.map((r, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white font-medium text-sm">{r.huesped}</p>
                  <span className="text-green-400 font-semibold text-sm shrink-0">{r.total} €</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{r.checkIn} → {r.checkOut}</span>
                  <span>{r.noches}n · {r.pax}px</span>
                  <PlatformBadge plataforma={r.plataforma} />
                </div>
                {r.codigo && (
                  <p className="text-gray-600 text-xs font-mono mt-1">{r.codigo}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancelled */}
      {reservations.filter(r => r.estado === 'Cancelada').length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          + {reservations.filter(r => r.estado === 'Cancelada').length} canceladas no mostradas
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
