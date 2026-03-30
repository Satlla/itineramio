'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Check, Loader2, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const PLATFORM_COLORS = {
  AIRBNB:  '#00A699',
  BOOKING: '#003580',
  VRBO:    '#1C6B8A',
}

interface Property {
  id: string
  name: string
  profileImage?: string | null
  status: string
}

interface UrlState {
  airbnb: string
  booking: string
  vrbo: string
}

interface SaveStatus {
  state: 'idle' | 'saving' | 'saved' | 'error'
  msg?: string
}

function PropertyRow({
  prop,
  initial,
  onSave,
}: {
  prop: Property
  initial: UrlState
  onSave: (id: string, urls: UrlState) => Promise<void>
}) {
  const [urls, setUrls] = useState<UrlState>(initial)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<SaveStatus>({ state: 'idle' })

  const hasAny = initial.airbnb || initial.booking || initial.vrbo
  const isDirty =
    urls.airbnb !== initial.airbnb ||
    urls.booking !== initial.booking ||
    urls.vrbo !== initial.vrbo

  const handleSave = async () => {
    setStatus({ state: 'saving' })
    try {
      await onSave(prop.id, urls)
      setStatus({ state: 'saved' })
      setTimeout(() => setStatus({ state: 'idle' }), 2500)
    } catch (e: any) {
      setStatus({ state: 'error', msg: e.message })
    }
  }

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {prop.profileImage ? (
            <Image src={prop.profileImage} alt="" width={40} height={40} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{prop.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {hasAny ? (
              <>
                {initial.airbnb && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PLATFORM_COLORS.AIRBNB }}>Airbnb ✓</span>}
                {initial.booking && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PLATFORM_COLORS.BOOKING }}>Booking ✓</span>}
                {initial.vrbo && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PLATFORM_COLORS.VRBO }}>VRBO ✓</span>}
              </>
            ) : (
              <span className="text-[10px] text-gray-400">Sin iCal configurado</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {status.state === 'saved' && <Check className="w-4 h-4 text-emerald-500" />}
          {status.state === 'saving' && <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />}
          {status.state === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded form */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="pt-4 space-y-3">
            {/* Airbnb */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: PLATFORM_COLORS.AIRBNB }} />
                URL iCal Airbnb
              </label>
              <input
                type="url"
                value={urls.airbnb}
                onChange={e => setUrls(u => ({ ...u, airbnb: e.target.value }))}
                placeholder="https://www.airbnb.es/calendar/ical/..."
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A699]/30 bg-white"
              />
            </div>

            {/* Booking */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: PLATFORM_COLORS.BOOKING }} />
                URL iCal Booking.com
              </label>
              <input
                type="url"
                value={urls.booking}
                onChange={e => setUrls(u => ({ ...u, booking: e.target.value }))}
                placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?..."
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003580]/30 bg-white"
              />
            </div>

            {/* VRBO */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: PLATFORM_COLORS.VRBO }} />
                URL iCal VRBO (opcional)
              </label>
              <input
                type="url"
                value={urls.vrbo}
                onChange={e => setUrls(u => ({ ...u, vrbo: e.target.value }))}
                placeholder="https://www.vrbo.com/calendar/..."
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C6B8A]/30 bg-white"
              />
            </div>

            {status.state === 'error' && (
              <p className="text-xs text-red-500">{status.msg || 'Error al guardar'}</p>
            )}

            <button
              onClick={handleSave}
              disabled={status.state === 'saving' || !isDirty}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {status.state === 'saving' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
              ) : status.state === 'saved' ? (
                <><Check className="w-4 h-4" /> ¡Guardado!</>
              ) : (
                <><Save className="w-4 h-4" /> Guardar</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ConfigurarCalendarioPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [configs, setConfigs] = useState<Record<string, UrlState>>({})
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/calendar/properties?year=2026&month=1', { credentials: 'include' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const props: Property[] = data.properties || []
      setProperties(props)
      const cfgMap: Record<string, UrlState> = {}
      for (const p of data.properties) {
        cfgMap[p.id] = {
          airbnb: p.icalConfig?.airbnb || '',
          booking: p.icalConfig?.booking || '',
          vrbo: p.icalConfig?.vrbo || '',
        }
      }
      setConfigs(cfgMap)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (propertyId: string, urls: UrlState) => {
    const res = await fetch('/api/calendar/ical-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ propertyId, ...urls })
    })
    if (!res.ok) throw new Error('Error al guardar')
    // Update local config so status badges update
    setConfigs(prev => ({ ...prev, [propertyId]: urls }))
  }

  const configured = properties.filter(p => {
    const c = configs[p.id]
    return c && (c.airbnb || c.booking || c.vrbo)
  }).length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/gestion/calendario" className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">Configurar iCal</h1>
            <p className="text-[11px] text-gray-400">
              {loading ? 'Cargando…' : `${configured} / ${properties.length} propiedades configuradas`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!loading && properties.length > 0 && (
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${(configured / properties.length) * 100}%` }}
          />
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-5 pb-24 space-y-3">
        {/* Instructions */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 text-xs text-violet-700 leading-relaxed">
          <p className="font-semibold mb-1">¿Cómo obtener la URL de iCal?</p>
          <p><span className="font-medium">Airbnb:</span> Anuncios → tu anuncio → Disponibilidad → Sincronizar → Exportar calendario (.ics)</p>
          <p className="mt-1"><span className="font-medium">Booking:</span> Extranet → Propiedades → Calendario → Exportar iCal</p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Cargando propiedades…</p>
          </div>
        ) : (
          <>
            {properties.map((prop, i) => (
              <motion.div key={prop.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <PropertyRow
                  prop={prop}
                  initial={configs[prop.id] || { airbnb: '', booking: '', vrbo: '' }}
                  onSave={handleSave}
                />
              </motion.div>
            ))}

            <Link
              href="/gestion/calendario"
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-2xl transition-colors mt-4"
            >
              <Calendar className="w-4 h-4" />
              Ver calendario
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
