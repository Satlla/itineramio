'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Sparkles, RefreshCw, CheckCircle, Clock, Pencil, X, CalendarDays, User, FileText, Send } from 'lucide-react'

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
  saving: boolean
  error: string
}

function Badge({ estado }: { estado: string }) {
  const lower = estado.toLowerCase()
  if (lower === 'hecho' || lower === 'completada') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Hecho</span>
  }
  if (lower === 'en proceso') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300 flex items-center gap-1"><Clock className="h-3 w-3" />En proceso</span>
  }
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-900 text-orange-300 flex items-center gap-1"><Clock className="h-3 w-3" />Pendiente</span>
}

function PlatformBadge({ plataforma }: { plataforma: string }) {
  const lower = (plataforma || '').toLowerCase()
  if (lower.includes('airbnb')) return <span className="px-1.5 py-0.5 rounded text-xs bg-rose-900 text-rose-300">Airbnb</span>
  if (lower.includes('booking')) return <span className="px-1.5 py-0.5 rounded text-xs bg-blue-900 text-blue-300">Booking</span>
  return <span className="px-1.5 py-0.5 rounded text-xs bg-gray-700 text-gray-300">{plataforma || '—'}</span>
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

function EditModal({ edit, onClose, onSaved }: { edit: EditState; onClose: () => void; onSaved: () => void }) {
  const [asignado, setAsignado] = useState(edit.asignado)
  const [notas, setNotas] = useState(edit.notas)
  const [estado, setEstado] = useState(edit.estado)
  const [newDate, setNewDate] = useState(toInputDate(edit.date))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isReschedule = fromInputDate(newDate) !== edit.date

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const targetDate = fromInputDate(newDate)

      if (isReschedule) {
        // Reschedule + update fields in one go: reschedule first
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
        // Update fields on new date
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-t-2xl p-5 space-y-4 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">{edit.cleaning.apartamento}</h3>
            <p className="text-gray-400 text-xs">Limpieza {edit.date}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-gray-400 flex items-center gap-1 mb-1"><CalendarDays className="h-3 w-3" />Fecha</label>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {isReschedule && (
            <p className="text-yellow-400 text-xs mt-1">⚠️ La limpieza se moverá al {fromInputDate(newDate)}</p>
          )}
        </div>

        {/* Asignado */}
        <div>
          <label className="text-xs text-gray-400 flex items-center gap-1 mb-1"><User className="h-3 w-3" />Asignado a</label>
          <select
            value={asignado}
            onChange={e => setAsignado(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
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

        {/* Estado */}
        <div>
          <label className="text-xs text-gray-400 flex items-center gap-1 mb-1"><CheckCircle className="h-3 w-3" />Estado</label>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Hecho">Hecho</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="text-xs text-gray-400 flex items-center gap-1 mb-1"><FileText className="h-3 w-3" />Notas</label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={2}
            placeholder="Trona, late check-in, instrucciones..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

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

export default function SatllaHoyPage() {
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editState, setEditState] = useState<EditState | null>(null)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/satllabot/data/today', { credentials: 'include' })
      if (!res.ok) throw new Error('Error cargando datos')
      setData(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

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
        setSendResult(`✅ Enviadas ${d.sent} limpiezas al grupo`)
      } else {
        setSendResult(`❌ ${d.error || d.message || 'Error'}`)
      }
    } catch {
      setSendResult('❌ Error de conexión')
    } finally {
      setSending(false)
      setTimeout(() => setSendResult(''), 4000)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Cargando datos...</p>
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

  const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const [d, m, y] = (data.date || '').split('/').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const dateLabel = `${DAY_NAMES[dateObj.getDay()]} ${d} de ${MONTH_NAMES[m - 1]}`

  const openEdit = (c: Cleaning) => {
    setEditState({
      cleaning: c,
      date: data.date,
      newDate: data.date,
      asignado: c.asignado || '',
      notas: c.notas || '',
      estado: c.estado || 'Pendiente',
      saving: false,
      error: '',
    })
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Edit modal */}
      {editState && (
        <EditModal
          edit={editState}
          onClose={() => setEditState(null)}
          onSaved={load}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">{dateLabel}</h2>
          <p className="text-gray-400 text-sm">
            {data.checkIns.length} llegadas · {data.checkOuts.length} salidas · {data.cleanings.length} limpiezas
          </p>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-white transition-colors p-2">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Alertas */}
      {data.alerts.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" /> Alertas ({data.alerts.length})
          </h3>
          <div className="space-y-2">
            {data.alerts.map((a, i) => (
              <div key={i} className="bg-orange-950 border border-orange-800 rounded-xl p-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-200 font-medium text-sm">{a.apartamento}</p>
                  <p className="text-orange-300 text-xs">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Check-ins */}
      <section>
        <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1">
          <ArrowDownCircle className="h-4 w-4" /> Llegadas ({data.checkIns.length})
        </h3>
        {data.checkIns.length === 0 ? (
          <p className="text-gray-500 text-sm bg-gray-900 rounded-xl p-4 text-center">Sin llegadas hoy</p>
        ) : (
          <div className="space-y-2">
            {data.checkIns.map((r, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{r.apartamento}</p>
                    <p className="text-gray-300 text-sm">{r.huesped}</p>
                    <p className="text-gray-400 text-xs mt-1">{r.pax} pax · {r.noches} noches</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <PlatformBadge plataforma={r.plataforma} />
                    {r.codigo && <span className="text-gray-500 text-xs font-mono">{r.codigo}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Check-outs */}
      <section>
        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-1">
          <ArrowUpCircle className="h-4 w-4" /> Salidas ({data.checkOuts.length})
        </h3>
        {data.checkOuts.length === 0 ? (
          <p className="text-gray-500 text-sm bg-gray-900 rounded-xl p-4 text-center">Sin salidas hoy</p>
        ) : (
          <div className="space-y-2">
            {data.checkOuts.map((r, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-semibold text-white">{r.apartamento}</p>
                <p className="text-gray-300 text-sm">{r.huesped}</p>
                <p className="text-gray-400 text-xs mt-1">{r.noches} noches</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Limpiezas */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="h-4 w-4" /> Limpiezas ({data.cleanings.length})
          </h3>
          {data.cleanings.length > 0 && (
            <button
              onClick={() => sendToGroup(data.date)}
              disabled={sending}
              className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Send className="h-3 w-3" />
              {sending ? 'Enviando...' : 'Enviar al grupo'}
            </button>
          )}
        </div>
        {sendResult && (
          <p className="text-sm mb-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-200">{sendResult}</p>
        )}
        {data.cleanings.length === 0 ? (
          <p className="text-gray-500 text-sm bg-gray-900 rounded-xl p-4 text-center">Sin limpiezas hoy</p>
        ) : (
          <div className="space-y-2">
            {data.cleanings.map((c, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{c.apartamento}</p>
                    {c.asignado ? (
                      <p className="text-gray-300 text-sm">{c.asignado}</p>
                    ) : (
                      <p className="text-orange-400 text-sm font-medium">Sin asignar</p>
                    )}
                    {c.huesped && <p className="text-gray-500 text-xs mt-0.5">{c.huesped}{c.huespedes ? ` · ${c.huespedes} pax` : ''}</p>}
                    {c.notas && <p className="text-yellow-400 text-xs mt-1 bg-yellow-950/50 rounded px-2 py-0.5">{c.notas}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge estado={c.estado} />
                    <button
                      onClick={() => openEdit(c)}
                      className="text-gray-500 hover:text-blue-400 transition-colors p-1"
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
      </section>
    </div>
  )
}
