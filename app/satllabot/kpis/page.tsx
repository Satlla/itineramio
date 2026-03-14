'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Euro, Calendar, Users, Percent } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

interface KpiData {
  year: number
  month: number
  monthName: string
  reservations: number
  cancelledCount: number
  totalRevenue: number
  totalNights: number
  totalGuests: number
  totalCommission: number
  avgNightsPerReservation: number
  avgRevenuePerReservation: number
  occupiedApartments: number
  byPlatform: Record<string, { reservations: number; revenue: number; nights: number }>
  byApartment: Record<string, { reservations: number; revenue: number; nights: number }>
}

interface StatsData {
  months: Array<{
    year: number
    month: number
    monthName: string
    reservations: number
    totalRevenue: number
    totalNights: number
    totalCommission: number
    avgNights: number
    avgRevenue: number
    occupancyPct: number
    byPlatform: Record<string, { revenue: number; reservations: number; nights: number }>
    topApartments: Array<{ name: string; revenue: number; reservations: number }>
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

const PIE_COLORS = ['#f43f5e', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

function KpiCard({
  label, value, icon: Icon, color = 'text-white',
}: {
  label: string; value: string; icon: React.ElementType; color?: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
      <div className="text-gray-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs">{label}</p>
        <p className={`font-bold text-lg leading-tight ${color}`}>{value}</p>
      </div>
    </div>
  )
}

export default function KpisPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [kpisRes, statsRes] = await Promise.all([
        fetch(`/api/satllabot/data/kpis?month=${month}&year=${year}`, { credentials: 'include' }),
        fetch('/api/satllabot/data/stats?months=6', { credentials: 'include' }),
      ])
      if (!kpisRes.ok || !statsRes.ok) throw new Error('Error cargando datos')
      const [k, s] = await Promise.all([kpisRes.json(), statsRes.json()])
      setKpis(k)
      setStats(s)
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
          <p className="text-gray-400 text-sm">Cargando KPIs...</p>
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

  // Revenue trend chart data from stats
  const revenueData = stats?.months.map(m => ({
    name: MONTH_SHORT[m.month],
    ingresos: m.totalRevenue,
    comision: m.totalCommission,
  })) || []

  // Platform pie data from current month kpis
  const platformData = kpis
    ? Object.entries(kpis.byPlatform).map(([name, v]) => ({ name, value: v.revenue }))
    : []

  // Top 8 apartments for current month
  const topApts = kpis
    ? Object.entries(kpis.byApartment)
        .map(([name, v]) => ({ name: name.length > 15 ? name.slice(0, 14) + '…' : name, revenue: v.revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)
    : []

  // ADR trend
  const adrData = stats?.months.map(m => ({
    name: MONTH_SHORT[m.month],
    adr: m.avgRevenue,
  })) || []

  const TOTAL_APTS = 24
  const occupancyPct = kpis && kpis.totalNights
    ? ((kpis.totalNights / (TOTAL_APTS * new Date(year, month + 1, 0).getDate())) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Month selector */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white p-1">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-white font-bold text-lg">{MONTH_NAMES[month]} {year}</h2>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white p-1">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Ingresos" value={`${kpis.totalRevenue.toLocaleString('es-ES')} €`} icon={Euro} color="text-green-400" />
          <KpiCard label="Reservas" value={String(kpis.reservations)} icon={Calendar} />
          <KpiCard label="Noches" value={String(kpis.totalNights)} icon={TrendingUp} />
          <KpiCard label="Comisión" value={`${kpis.totalCommission.toLocaleString('es-ES')} €`} icon={Percent} color="text-blue-400" />
          <KpiCard label="Pax total" value={String(kpis.totalGuests)} icon={Users} />
          <KpiCard label="Ocupación" value={`${occupancyPct}%`} icon={TrendingUp} color="text-yellow-400" />
        </div>
      )}

      {/* Revenue últimos 6 meses */}
      {revenueData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Ingresos últimos 6 meses</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                formatter={(v: number) => [`${v.toLocaleString('es-ES')} €`]}
              />
              <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ingresos" />
              <Bar dataKey="comision" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Comisión" />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Platform pie */}
      {platformData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Ingresos por plataforma — {MONTH_NAMES[month]}</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  {platformData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: number) => [`${v.toLocaleString('es-ES')} €`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {platformData.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-300 text-xs">{p.name}</span>
                  </div>
                  <span className="text-white text-xs font-medium">{p.value.toLocaleString('es-ES')} €</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top apartamentos */}
      {topApts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top apartamentos — {MONTH_NAMES[month]}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topApts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={80} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(v: number) => [`${v.toLocaleString('es-ES')} €`]}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ADR tendencia */}
      {adrData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">ADR (ingreso medio/reserva) — 6 meses</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={adrData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(v: number) => [`${v.toLocaleString('es-ES')} €`]}
              />
              <Line type="monotone" dataKey="adr" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} name="ADR" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
