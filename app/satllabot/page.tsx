'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  AlertTriangle, ArrowDownCircle, Sparkles,
  RefreshCw, CheckCircle, Clock, Pencil, X, CalendarDays,
  User, FileText, Send, ChevronDown, ChevronRight, ChevronLeft,
  Copy
} from 'lucide-react'

// ─── Interfaces ────────────────────────────────────────────────────────────

interface CheckIn {
  apartamento: string
  huesped: string
  pax: number
  noches: number
  codigo: string
  plataforma: string
}

interface CheckOut {
  apartamento: string
  huesped: string
  noches: number
}

interface Cleaning {
  apartamento: string
  asignado: string
  estado: string
  huesped: string
  huespedes: string
  notas: string
  horaInicio?: string
  horaFin?: string
}

interface Alert {
  type: string
  apartamento: string
  detail: string
}

interface TodayData {
  date: string
  checkIns: CheckIn[]
  checkOuts: CheckOut[]
  cleanings: Cleaning[]
  alerts: Alert[]
}

interface EditState {
  cleaning: Cleaning
  date: string
  newDate: string
  asignado: string
  notas: string
  estado: string
  horaInicio: string
  horaFin: string
  saving: boolean
  error: string
}

// ─── Date helpers ───────────────────────────────────────────────────────────

function getTodayStr(): string {
  const now = new Date()
  return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
}

function parseDate(ddmmyyyy: string): Date {
  const [d, m, y] = ddmmyyyy.split('/').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

function getWeekDays(dateStr: string): Date[] {
  const date = parseDate(dateStr)
  const day = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

// Convert DD/MM/YYYY → YYYY-MM-DD for <input type="date">
function toInputDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

// Convert YYYY-MM-DD → DD/MM/YYYY
function fromInputDate(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split('-')
  return `${d}/${m}/${y}`
}

function offsetDate(dateStr: string, days: number): string {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

const DAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] // index = getDay() (0=Sunday)
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTH_NAMES_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

// ─── Badge components ───────────────────────────────────────────────────────

function Badge({ estado }: { estado: string }) {
  const lower = estado.toLowerCase()
  if (lower === 'hecho' || lower === 'completada') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
        <CheckCircle className="h-3 w-3" />Hecho
      </span>
    )
  }
  if (lower === 'en proceso') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        <Clock className="h-3 w-3" />En proceso
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
      <Clock className="h-3 w-3" />Pendiente
    </span>
  )
}

function PlatformBadge({ plataforma }: { plataforma: string }) {
  const lower = (plataforma || '').toLowerCase()
  if (lower.includes('airbnb')) return <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700">Airbnb</span>
  if (lower.includes('booking')) return <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">Booking</span>
  return <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{plataforma || '—'}</span>
}

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({
  id,
  title,
  count,
  icon,
  accentClass,
  collapsed,
  onToggle,
  children,
  headerRight,
}: {
  id: string
  title: string
  count: number
  icon: React.ReactNode
  accentClass: string
  collapsed: boolean
  onToggle: () => void
  children: React.ReactNode
  headerRight?: React.ReactNode
}) {
  return (
    <section>
      <div
        className="flex items-center justify-between mb-2 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          }
          <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${accentClass}`}>
            {icon}
            {title}
          </span>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 leading-none">
            {count}
          </span>
        </div>
        {!collapsed && headerRight && (
          <div onClick={e => e.stopPropagation()}>{headerRight}</div>
        )}
      </div>
      {!collapsed && children}
    </section>
  )
}

// ─── Edit modal ─────────────────────────────────────────────────────────────

function EditModal({ edit, onClose, onSaved }: { edit: EditState; onClose: () => void; onSaved: () => void }) {
  const [asignado, setAsignado] = useState(edit.asignado)
  const [notas, setNotas] = useState(edit.notas)
  const [estado, setEstado] = useState(edit.estado)
  const [newDate, setNewDate] = useState(toInputDate(edit.date))
  const [horaInicio, setHoraInicio] = useState(edit.horaInicio || '')
  const [horaFin, setHoraFin] = useState(edit.horaFin || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isReschedule = fromInputDate(newDate) !== edit.date

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const targetDate = fromInputDate(newDate)

      if (isReschedule) {
        const r1 = await fetch('/api/satllabot/data/cleanings', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reschedule',
            shortName: edit.cleaning.apartamento,
            date: edit.date,
            newDate: targetDate,
          }),
        })
        if (!r1.ok) throw new Error('Error reprogramando')
        await fetch('/api/satllabot/data/cleanings', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            shortName: edit.cleaning.apartamento,
            date: targetDate,
            asignado,
            notas,
            estado,
            horaInicio,
            horaFin,
          }),
        })
      } else {
        const r2 = await fetch('/api/satllabot/data/cleanings', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            shortName: edit.cleaning.apartamento,
            date: edit.date,
            asignado,
            notas,
            estado,
            horaInicio,
            horaFin,
          }),
        })
        if (!r2.ok) throw new Error('Error guardando')
      }

      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error guardando')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white border border-gray-200 rounded-t-2xl shadow-xl p-5 space-y-4 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{edit.cleaning.apartamento}</h3>
            <p className="text-gray-500 text-xs">Limpieza {edit.date}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-1.5 font-medium">
            <CalendarDays className="h-3 w-3" />Fecha
          </label>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
          {isReschedule && (
            <p className="text-orange-600 text-xs mt-1.5 bg-orange-50 rounded-lg px-2 py-1">
              La limpieza se moverá al {fromInputDate(newDate)}
            </p>
          )}
        </div>

        {/* Asignado */}
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-1.5 font-medium">
            <User className="h-3 w-3" />Asignado a
          </label>
          <select
            value={asignado}
            onChange={e => setAsignado(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          >
            <option value="">Sin asignar</option>
            <option value="Diana">Diana (Marce)</option>
            <option value="María">María</option>
            <option value="Gaby">Gaby</option>
            <option value="Diana + María">Diana + María</option>
            <option value="Diana + Gaby">Diana + Gaby</option>
            <option value="María + Gaby">María + Gaby</option>
          </select>
        </div>

        {/* Hora inicio + fin */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Hora inicio</label>
            <input
              type="time"
              value={horaInicio}
              onChange={e => setHoraInicio(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Hora fin</label>
            <input
              type="time"
              value={horaFin}
              onChange={e => setHoraFin(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-1.5 font-medium">
            <CheckCircle className="h-3 w-3" />Estado
          </label>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Hecho">Hecho</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-1.5 font-medium">
            <FileText className="h-3 w-3" />Notas
          </label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={2}
            placeholder="Trona, late check-in, instrucciones..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none placeholder:text-gray-400"
          />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-3 font-semibold text-sm transition-colors"
        >
          {saving ? 'Guardando...' : isReschedule ? `Mover al ${fromInputDate(newDate)}` : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function SatllaHoyPage() {
  const today = useMemo(() => getTodayStr(), [])
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekOffset, setWeekOffset] = useState(0)
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editState, setEditState] = useState<EditState | null>(null)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const toggleSection = (name: string) => {
    setCollapsedSections(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const load = useCallback(async (date?: string) => {
    setLoading(true)
    setError('')
    try {
      const d = date || selectedDate
      const params = d !== today ? `?date=${encodeURIComponent(d)}` : ''
      const res = await fetch(`/api/satllabot/data/today${params}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Error cargando datos')
      setData(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, today])

  useEffect(() => { load() }, [load])

  // Base date for the week strip: selectedDate shifted by weekOffset weeks
  const weekBase = useMemo(() => {
    const base = parseDate(selectedDate)
    base.setDate(base.getDate() + weekOffset * 7)
    return formatDate(base)
  }, [selectedDate, weekOffset])

  const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase])

  const handleSelectDay = (date: Date) => {
    const str = formatDate(date)
    setSelectedDate(str)
    setWeekOffset(0)
    load(str)
  }

  const handleYesterday = () => {
    const str = offsetDate(selectedDate, -1)
    setSelectedDate(str)
    setWeekOffset(0)
    load(str)
  }

  const handleTomorrow = () => {
    const str = offsetDate(selectedDate, 1)
    setSelectedDate(str)
    setWeekOffset(0)
    load(str)
  }

  const handlePrevWeek = () => {
    setWeekOffset(o => o - 1)
  }

  const handleNextWeek = () => {
    setWeekOffset(o => o + 1)
  }

  const sendToGroup = useCallback(async (date: string) => {
    setSending(true)
    setSendResult('')
    try {
      const res = await fetch('/api/satllabot/data/send-cleanings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      const d = await res.json()
      if (d.sent !== undefined) {
        setSendResult(`Enviadas ${d.sent} limpiezas al grupo`)
      } else {
        setSendResult(`Error: ${d.error || d.message || 'desconocido'}`)
      }
    } catch {
      setSendResult('Error de conexión')
    } finally {
      setSending(false)
      setTimeout(() => setSendResult(''), 4000)
    }
  }, [])

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      // silencioso
    }
  }

  const openEdit = (c: Cleaning) => {
    if (!data) return
    setEditState({
      cleaning: c,
      date: data.date,
      newDate: data.date,
      asignado: c.asignado || '',
      notas: c.notas || '',
      estado: c.estado || 'Pendiente',
      horaInicio: c.horaInicio || '',
      horaFin: c.horaFin || '',
      saving: false,
      error: '',
    })
  }

  // ── Derived date labels ────────────────────────────────────────────────

  const selectedDateObj = useMemo(() => parseDate(selectedDate), [selectedDate])
  const selectedDayName = DAY_NAMES[selectedDateObj.getDay()]
  const selectedDayNum = selectedDateObj.getDate()
  const selectedMonthShort = MONTH_NAMES_SHORT[selectedDateObj.getMonth()]

  const todayDateObj = useMemo(() => parseDate(today), [today])
  const yesterdayLabel = useMemo(() => {
    const d = parseDate(offsetDate(selectedDate, -1))
    return `${DAY_NAMES[d.getDay()].slice(0, 3)} ${d.getDate()}`
  }, [selectedDate])
  const tomorrowLabel = useMemo(() => {
    const d = parseDate(offsetDate(selectedDate, 1))
    return `${DAY_NAMES[d.getDay()].slice(0, 3)} ${d.getDate()}`
  }, [selectedDate])

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-white">
      {/* Edit modal */}
      {editState && (
        <EditModal
          edit={editState}
          onClose={() => setEditState(null)}
          onSaved={() => load(selectedDate)}
        />
      )}

      {/* Week strip */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 sticky top-0 lg:top-0 z-10">
        {/* Week navigation */}
        <div className="flex items-center gap-1 mb-3 max-w-2xl mx-auto">
          <button
            onClick={handlePrevWeek}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 grid grid-cols-7 gap-0.5">
            {weekDays.map((day, i) => {
              const str = formatDate(day)
              const isSelected = str === selectedDate
              const isToday = str === today
              const isPast = day < todayDateObj
              const letterIdx = day.getDay() // 0=Sunday
              // Map to L M X J V S D
              const letterMap = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
              const letter = letterMap[letterIdx]
              return (
                <button
                  key={i}
                  onClick={() => handleSelectDay(day)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isToday
                        ? 'bg-blue-50 text-blue-600'
                        : isPast
                          ? 'text-gray-400 hover:bg-gray-50'
                          : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] font-medium leading-none">{letter}</span>
                  <span className="text-sm font-semibold leading-none">{day.getDate()}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                  )}
                  {isSelected && isToday && (
                    <span className="w-1 h-1 rounded-full bg-white/60 mt-0.5" />
                  )}
                </button>
              )
            })}
          </div>
          <button
            onClick={handleNextWeek}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick day nav */}
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs text-gray-400">
          <button
            onClick={handleYesterday}
            className="flex items-center gap-1 hover:text-gray-700 transition-colors py-1 px-2 rounded-lg hover:bg-gray-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {yesterdayLabel}
          </button>
          <span className="text-gray-700 font-medium capitalize text-sm">
            {selectedDayName} {selectedDayNum} {selectedMonthShort}
          </span>
          <button
            onClick={handleTomorrow}
            className="flex items-center gap-1 hover:text-gray-700 transition-colors py-1 px-2 rounded-lg hover:bg-gray-50"
          >
            {tomorrowLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Cargando...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <button onClick={() => load(selectedDate)} className="text-blue-600 text-sm hover:underline">
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Stats + refresh */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p className="text-xs text-green-600 font-medium">Check-in hoy</p>
                <p className="text-2xl font-bold text-green-700 leading-none mt-1">{data.checkIns.length}</p>
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-600 font-medium">Check-out hoy</p>
                <p className="text-2xl font-bold text-blue-700 leading-none mt-1">{data.checkOuts.length}</p>
              </div>
              <button
                onClick={() => load(selectedDate)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-xl hover:bg-gray-100 self-stretch flex items-center"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* ── Alertas ───────────────────────────────────────────── */}
            {data.alerts.length > 0 && (
              <Section
                id="alertas"
                title="Alertas"
                count={data.alerts.length}
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                accentClass="text-orange-500"
                collapsed={!!collapsedSections['alertas']}
                onToggle={() => toggleSection('alertas')}
              >
                <div className="space-y-2">
                  {data.alerts.map((a, i) => (
                    <div key={i} className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-orange-800 font-medium text-sm">{a.apartamento}</p>
                        <p className="text-orange-600 text-xs">{a.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Llegadas ──────────────────────────────────────────── */}
            <Section
              id="llegadas"
              title="Llegadas"
              count={data.checkIns.length}
              icon={<ArrowDownCircle className="h-3.5 w-3.5" />}
              accentClass="text-green-600"
              collapsed={!!collapsedSections['llegadas']}
              onToggle={() => toggleSection('llegadas')}
            >
              {data.checkIns.length === 0 ? (
                <p className="text-gray-400 text-sm bg-gray-50 rounded-xl p-4 text-center">Sin llegadas</p>
              ) : (
                <div className="space-y-2">
                  {data.checkIns.map((r, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{r.apartamento}</p>
                          <p className="text-gray-600 text-sm mt-0.5">{r.huesped}</p>
                          <p className="text-gray-400 text-xs mt-1">{r.pax} pax · {r.noches} noches</p>
                          {r.codigo && (
                            <button
                              onClick={() => copyCode(r.codigo)}
                              className="mt-1.5 inline-flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-gray-700 transition-colors group"
                              title="Copiar código"
                            >
                              {copiedCode === r.codigo
                                ? <CheckCircle className="h-3 w-3 text-green-500" />
                                : <Copy className="h-3 w-3 group-hover:text-gray-600" />
                              }
                              {r.codigo}
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <PlatformBadge plataforma={r.plataforma} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── Limpiezas ─────────────────────────────────────────── */}
            <Section
              id="limpiezas"
              title="Limpiezas"
              count={data.cleanings.length}
              icon={<Sparkles className="h-3.5 w-3.5" />}
              accentClass="text-purple-600"
              collapsed={!!collapsedSections['limpiezas']}
              onToggle={() => toggleSection('limpiezas')}
              headerRight={
                data.cleanings.length > 0 ? (
                  <button
                    onClick={() => sendToGroup(data.date)}
                    disabled={sending}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Send className="h-3 w-3" />
                    {sending ? 'Enviando...' : 'Enviar al grupo'}
                  </button>
                ) : undefined
              }
            >
              {sendResult && (
                <p className="text-sm mb-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">{sendResult}</p>
              )}
              {data.cleanings.length === 0 ? (
                <p className="text-gray-400 text-sm bg-gray-50 rounded-xl p-4 text-center">Sin limpiezas</p>
              ) : (
                <div className="space-y-2">
                  {data.cleanings.map((c, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{c.apartamento}</p>
                          {c.asignado ? (
                            <p className="text-gray-600 text-sm mt-0.5">{c.asignado}</p>
                          ) : (
                            <p className="text-orange-600 text-sm font-medium mt-0.5">Sin asignar</p>
                          )}
                          {(c.horaInicio || c.horaFin) && (
                            <p className="text-gray-400 text-xs mt-1">
                              {c.horaInicio && `Inicio: ${c.horaInicio}`}
                              {c.horaInicio && c.horaFin && ' · '}
                              {c.horaFin && `Fin: ${c.horaFin}`}
                            </p>
                          )}
                          {c.huesped && (
                            <p className="text-gray-400 text-xs mt-0.5">
                              {c.huesped}{c.huespedes ? ` · ${c.huespedes} pax` : ''}
                            </p>
                          )}
                          {c.notas && (
                            <p className="text-amber-700 text-xs mt-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1">
                              {c.notas}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge estado={c.estado} />
                          <button
                            onClick={() => openEdit(c)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-lg hover:bg-blue-50"
                            title="Editar limpieza"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}
