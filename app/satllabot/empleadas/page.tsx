'use client'

import { useEffect, useState, useRef } from 'react'
import { Users, Clock, Euro, ChevronDown, ChevronUp, ExternalLink, Check, PenLine } from 'lucide-react'

interface Empleada {
  rowNum: number
  nombre: string
  tipo: string
  telefono: string
  tarifa: number
  horasDia: number
  sueldoMensual: number
  activa: boolean
  notas: string
  semanaActual: {
    desde: string
    hasta: string
    horas: number
    limpiezas: number
    importe: number
  }
}

interface Pago {
  rowNum: number
  fecha: string
  empleada: string
  semana: string
  horas: string
  importeBruto: string
  descuentos: string
  importeNeto: string
  estado: string
  fechaFirma: string
  firma: string
  notas: string
}

interface Limpieza {
  fecha: string
  dia: string
  apartamento: string
  horas: number
  estado: string
}

interface Extracto {
  nombre: string
  periodo: string
  limpiezas: Limpieza[]
  horas_total: number
  tarifa: number
  importe: number
}

function SignatureCanvas({ onSave, onCancel }: { onSave: (sig: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      drawing.current = true
      const pos = getPos(e, canvas)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!drawing.current) return
      const pos = getPos(e, canvas)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }

    const stop = () => { drawing.current = false }

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stop)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', stop)

    return () => {
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stop)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stop)
    }
  }, [])

  const save = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-4 w-full max-w-sm">
        <p className="text-white font-semibold mb-3 text-center">Firma aquí</p>
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full bg-gray-800 rounded-xl border border-gray-700 touch-none"
        />
        <div className="flex gap-2 mt-3">
          <button onClick={clear} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600">Borrar</button>
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600">Cancelar</button>
          <button onClick={save} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500">Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default function EmpleadasPage() {
  const [empleadas, setEmpleadas] = useState<Empleada[]>([])
  const [semana, setSemana] = useState<{ desde: string; hasta: string }>({ desde: '', hasta: '' })
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [extracto, setExtracto] = useState<Extracto | null>(null)
  const [loadingExtracto, setLoadingExtracto] = useState(false)
  const [generandoPago, setGenerandoPago] = useState<string | null>(null)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [showFirma, setShowFirma] = useState<number | null>(null)
  const [confirmando, setConfirmando] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [empRes, pagosRes] = await Promise.all([
        fetch('/api/satllabot/data/empleadas', { credentials: 'include' }),
        fetch('/api/satllabot/data/pagos', { credentials: 'include' }),
      ])
      const empData = await empRes.json()
      const pagosData = await pagosRes.json()
      setEmpleadas(empData.empleadas || [])
      setSemana(empData.semana || { desde: '', hasta: '' })
      setPagos(pagosData.pagos || [])
    } finally {
      setLoading(false)
    }
  }

  async function verExtracto(empleada: Empleada) {
    if (expanded === empleada.nombre) {
      setExpanded(null)
      setExtracto(null)
      return
    }
    setExpanded(empleada.nombre)
    setLoadingExtracto(true)
    try {
      const res = await fetch(
        `/api/satllabot/data/pagos?modo=extracto&empleada=${encodeURIComponent(empleada.nombre)}&desde=${semana.desde}&hasta=${semana.hasta}`,
        { credentials: 'include' }
      )
      const data = await res.json()
      setExtracto(data)
    } finally {
      setLoadingExtracto(false)
    }
  }

  async function generarPago(empleada: Empleada) {
    if (!extracto || extracto.nombre !== empleada.nombre) return
    setGenerandoPago(empleada.nombre)
    try {
      const res = await fetch('/api/satllabot/data/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          empleada: empleada.nombre,
          semana: `${semana.desde} - ${semana.hasta}`,
          horas: extracto.horas_total,
          importe: extracto.importe,
          descuentos: 0,
        }),
      })
      await res.json()
      await fetchData()
      // Build WhatsApp message
      let waMsg = `Hola ${empleada.nombre}! Resumen semana ${semana.desde} - ${semana.hasta}:\n\n`
      for (const l of extracto.limpiezas) {
        waMsg += `- ${l.dia} ${l.fecha}: ${l.apartamento} (${l.horas}h)\n`
      }
      waMsg += `\nTotal: ${extracto.horas_total}h × ${extracto.tarifa}€ = *${extracto.importe.toFixed(2)}€*\n¿Confirmas?`
      const waUrl = `https://wa.me/${empleada.telefono}?text=${encodeURIComponent(waMsg)}`
      window.open(waUrl, '_blank')
    } finally {
      setGenerandoPago(null)
    }
  }

  async function confirmarPago(pago: Pago, firma: string) {
    setConfirmando(pago.rowNum)
    try {
      await fetch('/api/satllabot/data/pagos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'confirmar', pagoId: pago.rowNum, firma }),
      })
      setShowFirma(null)
      await fetchData()
    } finally {
      setConfirmando(null)
    }
  }

  const pendingPagos = pagos.filter(p => p.estado !== 'Pagado y Firmado')
  const activasEmpleadas = empleadas.filter(e => e.activa)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          Empleadas
        </h1>
        {semana.desde && (
          <p className="text-gray-400 text-sm mt-1">Semana {semana.desde} — {semana.hasta}</p>
        )}
      </div>

      {/* Empleadas cards */}
      <div className="space-y-3">
        {activasEmpleadas.map((emp) => (
          <div key={emp.nombre} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold">{emp.nombre}</p>
                  <p className="text-gray-500 text-xs capitalize">{emp.tipo} · {emp.tarifa}€/h</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">{emp.semanaActual.horas}h</p>
                  <p className="text-gray-400 text-xs">{emp.semanaActual.importe.toFixed(2)}€</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => verExtracto(emp)}
                  className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 flex items-center justify-center gap-1"
                >
                  {expanded === emp.nombre ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Ver extracto
                </button>
                {extracto && extracto.nombre === emp.nombre && expanded === emp.nombre && (
                  <button
                    onClick={() => generarPago(emp)}
                    disabled={generandoPago === emp.nombre}
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {generandoPago === emp.nombre ? 'Enviando...' : 'Generar pago'}
                  </button>
                )}
              </div>
            </div>

            {/* Extracto expanded */}
            {expanded === emp.nombre && (
              <div className="border-t border-gray-800 p-4 bg-gray-950">
                {loadingExtracto ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : extracto ? (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-xs mb-3">Limpiezas esta semana:</p>
                    {extracto.limpiezas.length === 0 ? (
                      <p className="text-gray-500 text-sm">Sin limpiezas asignadas esta semana.</p>
                    ) : (
                      extracto.limpiezas.map((l, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-gray-800 last:border-0">
                          <div>
                            <p className="text-white text-sm">{l.apartamento}</p>
                            <p className="text-gray-500 text-xs">{l.dia} {l.fecha}</p>
                          </div>
                          <p className="text-gray-300 text-sm">{l.horas}h</p>
                        </div>
                      ))
                    )}
                    <div className="pt-2 flex justify-between">
                      <p className="text-gray-400 text-sm">Total</p>
                      <p className="text-white font-semibold">{extracto.horas_total}h = {extracto.importe.toFixed(2)}€</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagos pendientes */}
      {pendingPagos.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Euro className="h-4 w-4 text-yellow-400" />
            Pagos pendientes
          </h2>
          <div className="space-y-2">
            {pendingPagos.map((pago) => (
              <div key={pago.rowNum} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{pago.empleada}</p>
                  <p className="text-gray-400 text-xs">{pago.semana}</p>
                  <p className="text-gray-500 text-xs">{pago.estado}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{pago.importeNeto}€</p>
                  <button
                    onClick={() => setShowFirma(pago.rowNum)}
                    className="mt-1 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <PenLine className="h-3 w-3" />
                    Marcar pagado
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature modal */}
      {showFirma !== null && (
        <SignatureCanvas
          onSave={(sig) => {
            const pago = pagos.find(p => p.rowNum === showFirma)
            if (pago) confirmarPago(pago, sig)
          }}
          onCancel={() => setShowFirma(null)}
        />
      )}
    </div>
  )
}
