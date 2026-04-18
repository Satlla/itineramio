'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, LogIn, LogOut, RefreshCw, Calendar, Users } from 'lucide-react'
import Link from 'next/link'

interface TodayEvent {
  propertyId: string
  propertyName: string
  propertyImage?: string | null
  guestName: string
  platform: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'OTHER'
  nights?: number
  guestCount?: number
}

interface TodayResponse {
  date: string
  summary: { checkInsCount: number; checkOutsCount: number }
  checkIns: TodayEvent[]
  checkOuts: TodayEvent[]
}

const PLATFORM_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  AIRBNB:  { bg: '#00A699', text: '#fff', label: 'Airbnb' },
  BOOKING: { bg: '#003580', text: '#fff', label: 'Booking' },
  VRBO:    { bg: '#1C6B8A', text: '#fff', label: 'VRBO' },
  OTHER:   { bg: '#6b7280', text: '#fff', label: 'Otro' }
}

function formatToday() {
  const d = new Date()
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
}

function EventCard({ event, type }: { event: TodayEvent; type: 'checkin' | 'checkout' }) {
  const style = PLATFORM_STYLES[event.platform] || PLATFORM_STYLES.OTHER
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      {/* Colored left bar */}
      <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: style.bg }} />

      {/* Property image placeholder / icon */}
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {event.propertyImage ? (
          <img src={event.propertyImage} alt="" className="object-cover w-full h-full" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: style.bg + '22' }}
          >
            {type === 'checkin'
              ? <LogIn className="w-4 h-4" style={{ color: style.bg }} />
              : <LogOut className="w-4 h-4" style={{ color: style.bg }} />
            }
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{event.guestName}</p>
        <p className="text-xs text-gray-500 truncate">{event.propertyName}</p>
        {event.guestCount && (
          <div className="flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] text-gray-400">{event.guestCount} personas</span>
          </div>
        )}
      </div>

      <span
        className="text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: style.bg + '18', color: style.bg }}
      >
        {style.label}
      </span>
    </motion.div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-8 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200">
      <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
      <p className="text-sm text-gray-400">Sin {label} hoy</p>
    </div>
  )
}

export default function CheckInsHoyPage() {
  const [data, setData] = useState<TodayResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/calendar/today', { credentials: 'include' })
      if (!res.ok) throw new Error('Error al cargar')
      setData(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/main" className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">Check-ins de hoy</h1>
            <p className="text-[11px] text-gray-400 capitalize">{formatToday()}</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-6 pb-24">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Consultando calendarios…</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button onClick={fetchData} className="text-sm text-gray-600 underline">Reintentar</button>
          </div>
        ) : (
          <>
            {/* Summary pills */}
            {data && (
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <LogIn className="w-4 h-4 text-emerald-500" />
                    <span className="text-2xl font-bold text-gray-900">{data.summary.checkInsCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Check-ins</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <LogOut className="w-4 h-4 text-orange-500" />
                    <span className="text-2xl font-bold text-gray-900">{data.summary.checkOutsCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Check-outs</p>
                </div>
              </div>
            )}

            {/* Check-ins */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h2 className="text-sm font-bold text-gray-800">
                  Entran hoy
                  {data && data.summary.checkInsCount > 0 && (
                    <span className="ml-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {data.summary.checkInsCount}
                    </span>
                  )}
                </h2>
              </div>
              {!data || data.checkIns.length === 0 ? (
                <EmptyState label="check-ins" />
              ) : (
                <div className="space-y-2">
                  {data.checkIns.map((ev: TodayEvent, i: number) => (
                    <EventCard key={`ci-${i}`} event={ev} type="checkin" />
                  ))}
                </div>
              )}
            </div>

            {/* Check-outs */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center">
                  <LogOut className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <h2 className="text-sm font-bold text-gray-800">
                  Salen hoy
                  {data && data.summary.checkOutsCount > 0 && (
                    <span className="ml-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      {data.summary.checkOutsCount}
                    </span>
                  )}
                </h2>
              </div>
              {!data || data.checkOuts.length === 0 ? (
                <EmptyState label="check-outs" />
              ) : (
                <div className="space-y-2">
                  {data.checkOuts.map((ev: TodayEvent, i: number) => (
                    <EventCard key={`co-${i}`} event={ev} type="checkout" />
                  ))}
                </div>
              )}
            </div>

            {/* Link to full calendar */}
            <Link
              href="/calendario"
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Ver todos los calendarios
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
