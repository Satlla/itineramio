'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, ArrowDownCircle, ArrowUpCircle, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react'

interface DayData {
  date: string
  checkInsCount: number
  checkOutsCount: number
  cleaningsCount: number
  alertsCount: number
  checkIns: Array<{ apartamento: string; huesped: string; pax: number; noches: number; plataforma: string }>
  checkOuts: Array<{ apartamento: string; huesped: string; noches: number }>
  cleanings: Array<{ apartamento: string; asignado: string; estado: string; huesped: string; huespedes: string; notas: string }>
  alerts: Array<{ type: string; apartamento: string; detail: string }>
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatDateLabel(dateStr: string) {
  const [d, m, y] = dateStr.split('/').map(Number)
  const obj = new Date(y, m - 1, d)
  return `${DAY_NAMES[obj.getDay()]} ${d} ${MONTH_NAMES[m - 1]}`
}

function isToday(dateStr: string) {
  const [d, m, y] = dateStr.split('/').map(Number)
  const now = new Date()
  return now.getDate() === d && now.getMonth() + 1 === m && now.getFullYear() === y
}

function DayCard({ day }: { day: DayData }) {
  const [open, setOpen] = useState(isToday(day.date))
  const total = day.checkInsCount + day.checkOutsCount + day.cleaningsCount

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`font-semibold text-sm ${isToday(day.date) ? 'text-blue-400' : 'text-white'}`}>
            {formatDateLabel(day.date)}
            {isToday(day.date) && <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">hoy</span>}
          </span>
          <div className="flex items-center gap-2 text-xs">
            {day.checkInsCount > 0 && <span className="text-green-400 flex items-center gap-0.5"><ArrowDownCircle className="h-3 w-3" />{day.checkInsCount}</span>}
            {day.checkOutsCount > 0 && <span className="text-blue-400 flex items-center gap-0.5"><ArrowUpCircle className="h-3 w-3" />{day.checkOutsCount}</span>}
            {day.cleaningsCount > 0 && <span className="text-purple-400 flex items-center gap-0.5"><Sparkles className="h-3 w-3" />{day.cleaningsCount}</span>}
            {day.alertsCount > 0 && <span className="text-orange-400 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" />{day.alertsCount}</span>}
          </div>
        </div>
        {total > 0 ? (
          open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />
        ) : (
          <span className="text-gray-600 text-xs">Sin actividad</span>
        )}
      </button>

      {open && total > 0 && (
        <div className="border-t border-gray-800 p-4 space-y-3">
          {day.alerts.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Alertas</p>
              {day.alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                  <span className="text-orange-200">{a.apartamento}: <span className="text-orange-300">{a.detail}</span></span>
                </div>
              ))}
            </div>
          )}
          {day.checkIns.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">Llegadas</p>
              {day.checkIns.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{r.apartamento}</span>
                  <span className="text-gray-400 text-xs">{r.huesped} · {r.pax}px</span>
                </div>
              ))}
            </div>
          )}
          {day.checkOuts.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Salidas</p>
              {day.checkOuts.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{r.apartamento}</span>
                  <span className="text-gray-400 text-xs">{r.huesped}</span>
                </div>
              ))}
            </div>
          )}
          {day.cleanings.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Limpiezas</p>
              {day.cleanings.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{c.apartamento}</span>
                  <span className={`text-xs ${c.asignado ? 'text-gray-400' : 'text-orange-400'}`}>
                    {c.asignado || 'Sin asignar'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SatllaSemanaPage() {
  const [days, setDays] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/satllabot/data/week', { credentials: 'include' })
      if (!res.ok) throw new Error('Error cargando datos')
      const data = await res.json()
      setDays(data.days || [])
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
          <p className="text-gray-400 text-sm">Cargando semana...</p>
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

  const totalAlerts = days.reduce((s, d) => s + d.alertsCount, 0)

  return (
    <div className="p-4 space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-bold text-white">Esta semana</h2>
          {totalAlerts > 0 && (
            <p className="text-orange-400 text-sm flex items-center gap-1 mt-0.5">
              <AlertTriangle className="h-3.5 w-3.5" /> {totalAlerts} alerta{totalAlerts !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button onClick={load} className="text-gray-400 hover:text-white transition-colors p-2">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {days.map((day) => <DayCard key={day.date} day={day} />)}
    </div>
  )
}
