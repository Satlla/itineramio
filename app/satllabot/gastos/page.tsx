'use client'

import { useEffect, useState } from 'react'
import { Receipt, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const CATEGORIAS = ['Lavandería', 'Roturas', 'Productos', 'Limpiadoras extra', 'Mantenimiento', 'Otros']

interface Gasto {
  fecha: string
  categoria: string
  descripcion: string
  importe: number
  apartamento: string
  notas: string
}

export default function GastosPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos')
  const [form, setForm] = useState({
    categoria: CATEGORIAS[0],
    descripcion: '',
    importe: '',
    apartamento: '',
    notas: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchGastos()
  }, [month, year])

  async function fetchGastos() {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/satllabot/data/fichajes?desde=01/${String(month).padStart(2,'0')}/${year}&hasta=${getDaysInMonth(year, month)}/${String(month).padStart(2,'0')}/${year}`,
        { credentials: 'include' }
      )
      // Note: gastos tab not yet wired to backend — show placeholder
      setGastos([])
    } catch {
      setGastos([])
    } finally {
      setLoading(false)
    }
  }

  function getDaysInMonth(y: number, m: number) {
    return String(new Date(y, m, 0).getDate()).padStart(2, '0')
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const filtered = filtroCategoria === 'Todos' ? gastos : gastos.filter(g => g.categoria === filtroCategoria)
  const total = filtered.reduce((sum, g) => sum + g.importe, 0)

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-400" />
          Gastos
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between bg-gray-900 rounded-xl p-3">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white p-1">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-white font-medium">{MONTH_NAMES[month - 1]} {year}</span>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white p-1">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Filtro categoría */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Todos', ...CATEGORIAS].map(cat => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filtroCategoria === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="bg-gray-900 rounded-xl p-4 flex justify-between items-center">
        <p className="text-gray-400 text-sm">Total del mes</p>
        <p className="text-white text-xl font-bold">{total.toFixed(2)}€</p>
      </div>

      {/* Lista gastos */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="h-10 w-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No hay gastos registrados</p>
          <p className="text-gray-600 text-sm mt-1">Pulsa "Nuevo" para añadir uno</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((g, i) => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex justify-between items-start">
              <div>
                <p className="text-white font-medium">{g.descripcion}</p>
                <p className="text-gray-500 text-xs">{g.categoria} · {g.fecha}</p>
                {g.apartamento && <p className="text-gray-600 text-xs">{g.apartamento}</p>}
              </div>
              <p className="text-red-400 font-semibold shrink-0 ml-3">{g.importe.toFixed(2)}€</p>
            </div>
          ))}
        </div>
      )}

      {/* New gasto form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h2 className="text-white font-semibold">Nuevo gasto</h2>

            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Ej. Detergente lavandería"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Importe (€)</label>
                <input
                  type="number"
                  value={form.importe}
                  onChange={e => setForm(f => ({ ...f, importe: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Apartamento (opcional)</label>
                <input
                  type="text"
                  value={form.apartamento}
                  onChange={e => setForm(f => ({ ...f, apartamento: e.target.value }))}
                  placeholder="Nombre del apartamento"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                disabled={saving || !form.descripcion || !form.importe}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50"
                onClick={async () => {
                  setSaving(true)
                  try {
                    // TODO: wire to gastos API endpoint when backend is ready
                    // For now just close the form
                    setShowForm(false)
                    setForm({ categoria: CATEGORIAS[0], descripcion: '', importe: '', apartamento: '', notas: '' })
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
