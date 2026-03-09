'use client'

import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Reservation {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  platform: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'
  hostEarnings: number
  nights: number
  billingConfig?: { property: { name: string; profileImage?: string } }
  billingUnit?: { id: string; name: string; imageUrl?: string }
}

interface ReservationsCalendarProps {
  reservations: Reservation[]
  onReservationClick: (reservation: Reservation) => void
  selectedYear: number
  selectedMonth?: number
}

const PLATFORM_COLORS: Record<string, string> = {
  AIRBNB: 'bg-red-500',
  BOOKING: 'bg-blue-600',
  VRBO: 'bg-indigo-500',
  DIRECT: 'bg-green-500',
  OTHER: 'bg-gray-500',
}

const STATUS_OPACITY: Record<string, string> = {
  CONFIRMED: 'opacity-100',
  PENDING: 'opacity-70',
  CANCELLED: 'opacity-40 line-through',
  COMPLETED: 'opacity-80',
}

const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0=Sun, adjust to Mon-based (Mon=0)
  const d = new Date(year, month - 1, 1).getDay()
  return d === 0 ? 6 : d - 1
}

export function ReservationsCalendar({ reservations, onReservationClick, selectedYear, selectedMonth }: ReservationsCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(selectedYear)
  const [viewMonth, setViewMonth] = useState(selectedMonth ?? today.getMonth() + 1)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // Build map: day -> reservations that overlap with that day
  const dayReservations = useMemo(() => {
    const map = new Map<number, Reservation[]>()

    for (const r of reservations) {
      if (r.status === 'CANCELLED') continue
      const checkIn = new Date(r.checkIn)
      const checkOut = new Date(r.checkOut)

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(viewYear, viewMonth - 1, day)
        // Reservation spans: checkIn <= date < checkOut
        if (date >= checkIn && date < checkOut) {
          if (!map.has(day)) map.set(day, [])
          map.get(day)!.push(r)
        }
      }
    }

    return map
  }, [reservations, viewYear, viewMonth, daysInMonth])

  // Build multi-day spans for rendering
  const spans = useMemo(() => {
    const result: Array<{
      reservation: Reservation
      startDay: number
      endDay: number
      row: number
    }> = []

    const rowOccupancy = new Map<number, Set<number>>() // day -> set of rows used

    for (const r of reservations) {
      if (r.status === 'CANCELLED') continue
      const checkIn = new Date(r.checkIn)
      const checkOut = new Date(r.checkOut)

      const monthStart = new Date(viewYear, viewMonth - 1, 1)
      const monthEnd = new Date(viewYear, viewMonth - 1, daysInMonth)

      if (checkOut <= monthStart || checkIn > monthEnd) continue

      const startDay = Math.max(1, checkIn.getMonth() + 1 === viewMonth && checkIn.getFullYear() === viewYear ? checkIn.getDate() : 1)
      const endDay = Math.min(daysInMonth, checkOut.getMonth() + 1 === viewMonth && checkOut.getFullYear() === viewYear ? checkOut.getDate() - 1 : daysInMonth)

      if (startDay > endDay) continue

      // Find first available row
      let row = 0
      while (true) {
        let free = true
        for (let d = startDay; d <= endDay; d++) {
          if (rowOccupancy.get(d)?.has(row)) { free = false; break }
        }
        if (free) break
        row++
        if (row > 4) break // max 5 rows per day
      }

      for (let d = startDay; d <= endDay; d++) {
        if (!rowOccupancy.has(d)) rowOccupancy.set(d, new Set())
        rowOccupancy.get(d)!.add(row)
      }

      result.push({ reservation: r, startDay, endDay, row })
    }

    return result
  }, [reservations, viewYear, viewMonth, daysInMonth])

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Build grid cells
  const totalCells = firstDay + daysInMonth
  const totalRows = Math.ceil(totalCells / 7)

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </h2>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7" style={{ minHeight: `${totalRows * 100}px` }}>
        {Array.from({ length: totalRows * 7 }).map((_, cellIndex) => {
          const dayNumber = cellIndex - firstDay + 1
          const isValidDay = dayNumber >= 1 && dayNumber <= daysInMonth
          const isToday = isValidDay && today.getDate() === dayNumber && today.getMonth() + 1 === viewMonth && today.getFullYear() === viewYear
          const daySpans = spans.filter(s => s.startDay <= dayNumber && s.endDay >= dayNumber && isValidDay)
          const isWeekend = cellIndex % 7 >= 5

          return (
            <div
              key={cellIndex}
              className={`relative border-r border-b border-gray-50 min-h-[90px] p-1 ${!isValidDay ? 'bg-gray-50/50' : isWeekend ? 'bg-gray-50/30' : ''}`}
            >
              {isValidDay && (
                <>
                  <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full mb-1 ${isToday ? 'bg-violet-600 text-white' : 'text-gray-700'}`}>
                    {dayNumber}
                  </span>

                  {/* Reservation spans */}
                  <div className="space-y-0.5 mt-1">
                    {daySpans
                      .sort((a, b) => a.row - b.row)
                      .slice(0, 3)
                      .map(({ reservation: r, startDay, endDay }) => {
                        const isStart = startDay === dayNumber
                        const isEnd = endDay === dayNumber
                        const platformColor = PLATFORM_COLORS[r.platform] || PLATFORM_COLORS.OTHER
                        const statusOpacity = STATUS_OPACITY[r.status]

                        return (
                          <button
                            key={r.id}
                            onClick={() => onReservationClick(r)}
                            title={`${r.guestName} — ${r.platform}`}
                            className={`
                              w-full text-left text-white text-xs px-1.5 py-0.5 truncate transition-opacity hover:opacity-80 cursor-pointer
                              ${platformColor} ${statusOpacity}
                              ${isStart ? 'rounded-l-full pl-2' : ''}
                              ${isEnd ? 'rounded-r-full pr-2' : ''}
                              ${!isStart && !isEnd ? '' : ''}
                            `}
                          >
                            {isStart ? r.guestName : ''}
                          </button>
                        )
                      })}
                    {daySpans.length > 3 && (
                      <span className="text-xs text-gray-400 px-1">+{daySpans.length - 3}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
          <div key={platform} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs text-gray-500">{platform.charAt(0) + platform.slice(1).toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
