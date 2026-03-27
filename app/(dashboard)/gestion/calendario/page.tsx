'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, Settings, WifiOff, LogIn, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Platform colors
const PLATFORM_COLORS: Record<string, string> = {
  AIRBNB: '#00A699',   // Airbnb teal-green
  BOOKING: '#003580',  // Booking blue
  VRBO: '#1C6B8A',     // VRBO blue-teal
  OTHER: '#888888'
}

const PLATFORM_LABELS: Record<string, string> = {
  AIRBNB: 'Airbnb', BOOKING: 'Booking', VRBO: 'VRBO', OTHER: 'Otro'
}

interface TodayEvent {
  propertyId: string
  propertyName: string
  propertyImage?: string | null
  guestName: string
  platform: string
  nights?: number
  guestCount?: number
  date?: string
}

interface TodayData {
  checkIns: TodayEvent[]
  checkOuts: TodayEvent[]
  upcomingCheckIns: TodayEvent[]
  upcomingCheckOuts: TodayEvent[]
}

interface OccupancyDay {
  day: number
  platform: string
}

interface CalendarProperty {
  id: string
  name: string
  profileImage?: string | null
  status: string
  hasIcalConfig: boolean
  icalConfig: { airbnb?: string; booking?: string; vrbo?: string }
  daysInMonth: number
  occupancy: OccupancyDay[]
}

function TodayCard({ type, label, events }: {
  type: 'checkin' | 'checkout'
  label: string
  events: TodayEvent[]
}) {
  const isCheckin = type === 'checkin'
  const color = isCheckin ? 'text-emerald-600' : 'text-orange-500'
  const bg = isCheckin ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'
  const iconBg = isCheckin ? 'bg-emerald-100' : 'bg-orange-100'

  return (
    <div className={`rounded-2xl border p-3 ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${iconBg}`}>
          {isCheckin
            ? <LogIn className={`w-3.5 h-3.5 ${color}`} />
            : <LogOut className={`w-3.5 h-3.5 ${color}`} />
          }
        </div>
        <div>
          <p className={`text-xs font-semibold ${color}`}>{label}</p>
          <p className="text-[10px] text-gray-400">{events.length} {events.length === 1 ? 'reserva' : 'reservas'}</p>
        </div>
      </div>
      {events.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">Ninguno hoy</p>
      ) : (
        <div className="space-y-1.5">
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              {e.propertyImage ? (
                <img src={e.propertyImage} alt="" className="w-6 h-6 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-gray-200 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-gray-900 truncate">{e.guestName}</p>
                <p className="text-[10px] text-gray-400 truncate">{e.propertyName} · {PLATFORM_LABELS[e.platform] || e.platform}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UpcomingList({ type, label, events }: {
  type: 'checkin' | 'checkout'
  label: string
  events: TodayEvent[]
}) {
  const isCheckin = type === 'checkin'
  const color = isCheckin ? 'text-emerald-600' : 'text-orange-500'
  const dotColor = isCheckin ? 'bg-emerald-400' : 'bg-orange-400'

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
        <p className="text-[11px] text-gray-300 italic">Sin próximos</p>
      </div>
    )
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00')
    const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
  }

  // Group by date
  const grouped: Record<string, TodayEvent[]> = {}
  for (const e of events) {
    const key = e.date || ''
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 space-y-2">
      <p className={`text-xs font-semibold ${color}`}>{label}</p>
      {Object.entries(grouped).map(([date, evts]) => (
        <div key={date}>
          <p className="text-[10px] text-gray-400 font-medium mb-1">{formatDate(date)}</p>
          <div className="space-y-1">
            {evts.map((e, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                <div className="min-w-0 flex items-center gap-1">
                  <p className="text-[12px] text-gray-800 truncate">{e.guestName}</p>
                  <span className="text-[10px] text-gray-400 truncate hidden sm:inline">· {e.propertyName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniCalendar({ occupancy, daysInMonth, year, month }: {
  occupancy: OccupancyDay[]
  daysInMonth: number
  year: number
  month: number
}) {
  // Build a map: day → platform (prefer Airbnb over Booking over VRBO)
  const dayMap: Record<number, string> = {}
  for (const o of occupancy) {
    if (!dayMap[o.day]) dayMap[o.day] = o.platform
  }

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDay = isCurrentMonth ? today.getDate() : -1

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="flex flex-wrap gap-[3px]" style={{ width: 160 }}>
      {days.map((d) => {
        const platform = dayMap[d]
        const isToday = d === todayDay
        const color = platform ? PLATFORM_COLORS[platform] || PLATFORM_COLORS.OTHER : null
        return (
          <div
            key={d}
            title={platform ? `${d} — ${platform}` : String(d)}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: color || (isToday ? '#e5e7eb' : '#f3f4f6'),
              border: isToday && !color ? '1.5px solid #6366f1' : undefined,
              flexShrink: 0
            }}
          />
        )
      })}
    </div>
  )
}

export default function CalendarioPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [properties, setProperties] = useState<CalendarProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [todayData, setTodayData] = useState<TodayData | null>(null)

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/calendar/properties?year=${year}&month=${month}`, {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Error al cargar calendarios')
      const data = await res.json()
      setProperties(data.properties || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    fetch('/api/calendar/today', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTodayData(d))
      .catch(() => {})
  }, [])

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Calendarios</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link
                href="/gestion/calendario/configurar"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold text-gray-800">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Check-ins / Check-outs hoy + próximos */}
      {todayData && (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-2 space-y-4">
          {/* Hoy */}
          <div className="grid grid-cols-2 gap-3">
            <TodayCard
              type="checkin"
              label="Check-ins hoy"
              events={todayData.checkIns}
            />
            <TodayCard
              type="checkout"
              label="Check-outs hoy"
              events={todayData.checkOuts}
            />
          </div>

          {/* Próximos */}
          {(todayData.upcomingCheckIns.length > 0 || todayData.upcomingCheckOuts.length > 0) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-0.5">Próximos 7 días</p>
              <div className="grid grid-cols-2 gap-3">
                <UpcomingList type="checkin" label="Check-ins" events={todayData.upcomingCheckIns} />
                <UpcomingList type="checkout" label="Check-outs" events={todayData.upcomingCheckOuts} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Platform legend */}
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-1 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PLATFORM_COLORS.AIRBNB }} />
          <span className="text-xs text-gray-500">Airbnb</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PLATFORM_COLORS.BOOKING }} />
          <span className="text-xs text-gray-500">Booking</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PLATFORM_COLORS.VRBO }} />
          <span className="text-xs text-gray-500">VRBO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-200 border border-indigo-400" />
          <span className="text-xs text-gray-500">Hoy</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Cargando calendarios…</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button onClick={fetchData} className="text-sm text-violet-600 underline">Reintentar</button>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-1">Sin propiedades</p>
            <p className="text-sm text-gray-400">Crea tu primera propiedad para ver el calendario</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 mt-2">
            {properties.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/gestion/calendario/${prop.id}`}
                  className="flex items-center gap-3 py-4 px-1 hover:bg-gray-50 transition-colors rounded-xl -mx-1 px-2 active:bg-gray-100"
                >
                  {/* Property image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {prop.profileImage ? (
                      <Image
                        src={prop.profileImage}
                        alt={prop.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-violet-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{prop.name}</p>
                      {!prop.hasIcalConfig && (
                        <WifiOff className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" aria-label="Sin iCal configurado" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {prop.status === 'ACTIVE' ? 'Publicado' : 'Borrador'}
                    </p>
                    {prop.hasIcalConfig && (
                      <div className="flex gap-1.5 mt-1">
                        {prop.icalConfig.airbnb && (
                          <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PLATFORM_COLORS.AIRBNB }}>Airbnb</span>
                        )}
                        {prop.icalConfig.booking && (
                          <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PLATFORM_COLORS.BOOKING }}>Booking</span>
                        )}
                        {prop.icalConfig.vrbo && (
                          <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: PLATFORM_COLORS.VRBO }}>VRBO</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mini calendar */}
                  <div className="flex-shrink-0">
                    {prop.hasIcalConfig ? (
                      <MiniCalendar
                        occupancy={prop.occupancy}
                        daysInMonth={prop.daysInMonth}
                        year={year}
                        month={month}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-[160px]">
                        <WifiOff className="w-5 h-5 text-gray-200 mb-1" />
                        <p className="text-[10px] text-gray-300 text-center leading-tight">Sin iCal<br/>configurado</p>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
