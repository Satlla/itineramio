'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Loader2,
  Mail,
  Building2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  Save,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Trash2
} from 'lucide-react'

interface Booking {
  id: string
  email: string
  name: string
  properties: string
  challenge: string | null
  scheduledDate: string
  status: string
  source: string
  notes: string | null
  adminNotes: string | null
  createdAt: string
}

interface BlockedSlot {
  id: string
  date: string
  time: string | null
  reason: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  scheduled: { label: 'Pendiente', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Clock },
  completed: { label: 'Completada', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: XCircle },
  no_show: { label: 'No asistió', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertCircle }
}

const TIMES = ['10:00', '11:00', '12:00', '16:00', '17:00', '18:00']
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function AdminConsultasPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingBlock, setSavingBlock] = useState(false)

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select')
  const [dragStartDate, setDragStartDate] = useState<string | null>(null)

  // Day detail view
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState('')

  // Ref for drag handling
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Handle mouse up anywhere to end drag
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isDragging])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bookingsRes, blockedRes] = await Promise.all([
        fetch('/api/admin/consultas'),
        fetch('/api/admin/consultas/blocked')
      ])

      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        setBookings(data.bookings || [])
      }

      if (blockedRes.ok) {
        const data = await blockedRes.json()
        setBlockedSlots(data.blockedSlots || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/consultas/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        ))
        if (selectedBooking?.id === bookingId) {
          setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const saveNotes = async () => {
    if (!selectedBooking) return
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/consultas/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: notesValue })
      })

      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === selectedBooking.id ? { ...b, adminNotes: notesValue } : b
        ))
        setSelectedBooking(prev => prev ? { ...prev, adminNotes: notesValue } : null)
        setEditingNotes(false)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setSavingNotes(false)
    }
  }

  // Block entire day
  const blockDay = async (date: string, reason?: string) => {
    setSavingBlock(true)
    try {
      const res = await fetch('/api/admin/consultas/blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time: null, reason: reason || null })
      })

      if (res.ok) {
        const data = await res.json()
        setBlockedSlots(prev => [...prev, data.blockedSlot])
      }
    } catch (error) {
      console.error('Error blocking day:', error)
    } finally {
      setSavingBlock(false)
    }
  }

  // Block specific time slot
  const blockTimeSlot = async (date: string, time: string, reason?: string) => {
    setSavingBlock(true)
    try {
      const res = await fetch('/api/admin/consultas/blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, reason: reason || null })
      })

      if (res.ok) {
        const data = await res.json()
        setBlockedSlots(prev => [...prev, data.blockedSlot])
      }
    } catch (error) {
      console.error('Error blocking slot:', error)
    } finally {
      setSavingBlock(false)
    }
  }

  // Unblock day or slot
  const unblockSlot = async (slotId: string) => {
    try {
      const res = await fetch(`/api/admin/consultas/blocked/${slotId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setBlockedSlots(prev => prev.filter(s => s.id !== slotId))
      }
    } catch (error) {
      console.error('Error unblocking slot:', error)
    }
  }

  // Block multiple selected days
  const blockSelectedDays = async () => {
    if (selectedDates.size === 0) return
    setSavingBlock(true)

    try {
      const promises = Array.from(selectedDates).map(date =>
        fetch('/api/admin/consultas/blocked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, time: null, reason: blockReason || null })
        }).then(res => res.ok ? res.json() : null)
      )

      const results = await Promise.all(promises)
      const newSlots = results.filter(r => r?.blockedSlot).map(r => r.blockedSlot)
      setBlockedSlots(prev => [...prev, ...newSlots])
      setSelectedDates(new Set())
      setBlockReason('')
    } catch (error) {
      console.error('Error blocking days:', error)
    } finally {
      setSavingBlock(false)
    }
  }

  // Unblock multiple selected days
  const unblockSelectedDays = async () => {
    if (selectedDates.size === 0) return
    setSavingBlock(true)

    try {
      const slotsToUnblock = blockedSlots.filter(slot => {
        const slotDate = new Date(slot.date).toISOString().split('T')[0]
        return selectedDates.has(slotDate) && slot.time === null
      })

      const promises = slotsToUnblock.map(slot =>
        fetch(`/api/admin/consultas/blocked/${slot.id}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      setBlockedSlots(prev => prev.filter(s => !slotsToUnblock.find(u => u.id === s.id)))
      setSelectedDates(new Set())
    } catch (error) {
      console.error('Error unblocking days:', error)
    } finally {
      setSavingBlock(false)
    }
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Get day of week for first day (0 = Sunday, convert to Monday start)
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek < 0) startDayOfWeek = 6

    const days: (Date | null)[] = []

    // Add empty slots for days before first of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Add empty slots to complete last week
    while (days.length % 7 !== 0) {
      days.push(null)
    }

    return days
  }, [currentMonth])

  // Get day status
  const getDayStatus = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const isPast = date < today
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const isToday = dateStr === today.toISOString().split('T')[0]

    // Check if fully blocked (whole day)
    const dayBlock = blockedSlots.find(s => {
      const slotDate = new Date(s.date).toISOString().split('T')[0]
      return slotDate === dateStr && s.time === null
    })

    // Check for time-specific blocks
    const timeBlocks = blockedSlots.filter(s => {
      const slotDate = new Date(s.date).toISOString().split('T')[0]
      return slotDate === dateStr && s.time !== null
    })

    // Check for bookings
    const dayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.scheduledDate).toISOString().split('T')[0]
      return bookingDate === dateStr
    })

    // Calculate availability
    const totalSlots = TIMES.length
    const blockedCount = dayBlock ? totalSlots : timeBlocks.length
    const bookedCount = dayBookings.length
    const availableCount = isWeekend ? 0 : Math.max(0, totalSlots - blockedCount - bookedCount)

    return {
      dateStr,
      isPast,
      isWeekend,
      isToday,
      isFullyBlocked: !!dayBlock,
      dayBlock,
      timeBlocks,
      bookings: dayBookings,
      blockedCount,
      bookedCount,
      availableCount,
      hasBookings: dayBookings.length > 0
    }
  }, [blockedSlots, bookings])

  // Handle drag selection
  const handleMouseDown = (dateStr: string, status: ReturnType<typeof getDayStatus>) => {
    if (status.isPast || status.isWeekend) return

    setIsDragging(true)
    setDragStartDate(dateStr)

    // Determine mode based on current state
    if (selectedDates.has(dateStr)) {
      setDragMode('deselect')
      setSelectedDates(prev => {
        const next = new Set(prev)
        next.delete(dateStr)
        return next
      })
    } else {
      setDragMode('select')
      setSelectedDates(prev => new Set(prev).add(dateStr))
    }
  }

  const handleMouseEnter = (dateStr: string, status: ReturnType<typeof getDayStatus>) => {
    if (!isDragging || status.isPast || status.isWeekend) return

    if (dragMode === 'select') {
      setSelectedDates(prev => new Set(prev).add(dateStr))
    } else {
      setSelectedDates(prev => {
        const next = new Set(prev)
        next.delete(dateStr)
        return next
      })
    }
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  // Stats
  const stats = {
    total: bookings.length,
    scheduled: bookings.filter(b => b.status === 'scheduled').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    noShow: bookings.filter(b => b.status === 'no_show').length
  }

  // Upcoming bookings
  const today = new Date()
  const upcomingBookings = bookings
    .filter(b => b.status === 'scheduled' && new Date(b.scheduledDate) >= today)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5)

  // Check if any selected dates are blocked
  const selectedHasBlocked = Array.from(selectedDates).some(dateStr => {
    return blockedSlots.some(s => {
      const slotDate = new Date(s.date).toISOString().split('T')[0]
      return slotDate === dateStr && s.time === null
    })
  })

  const selectedHasUnblocked = Array.from(selectedDates).some(dateStr => {
    const dayBlock = blockedSlots.find(s => {
      const slotDate = new Date(s.date).toISOString().split('T')[0]
      return slotDate === dateStr && s.time === null
    })
    return !dayBlock
  })

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-violet-600" />
              Mi Calendario
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Arrastra para seleccionar días · Click en un día para ver detalles
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center gap-1">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" />
            {stats.scheduled}
          </div>
          <div className="text-xs sm:text-sm text-blue-600">Pendientes</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" />
            {stats.completed}
          </div>
          <div className="text-xs sm:text-sm text-green-600">Completadas</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" />
            {stats.noShow}
          </div>
          <div className="text-xs sm:text-sm text-red-600">No show</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-lg font-bold text-gray-900 capitalize">
                  {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium bg-white text-violet-600 hover:bg-violet-50 rounded-lg transition-colors border border-violet-200"
                >
                  Hoy
                </button>
              </div>
            </div>

            {/* Selection Actions Bar */}
            {selectedDates.size > 0 && (
              <div className="px-4 py-3 bg-violet-50 border-b border-violet-200 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-violet-700">
                    {selectedDates.size} día{selectedDates.size > 1 ? 's' : ''} seleccionado{selectedDates.size > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setSelectedDates(new Set())}
                    className="text-xs text-violet-600 hover:underline"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Motivo (opcional)"
                    className="px-3 py-1.5 text-sm border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 w-40"
                  />
                  {selectedHasUnblocked && (
                    <button
                      onClick={blockSelectedDays}
                      disabled={savingBlock}
                      className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {savingBlock ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Bloquear
                    </button>
                  )}
                  {selectedHasBlocked && (
                    <button
                      onClick={unblockSelectedDays}
                      disabled={savingBlock}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {savingBlock ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                      Desbloquear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                Cargando calendario...
              </div>
            ) : (
              <div
                ref={calendarRef}
                className="p-4 select-none"
                onMouseLeave={() => setIsDragging(false)}
              >
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-2">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, i) => {
                    if (!date) {
                      return <div key={`empty-${i}`} className="aspect-square" />
                    }

                    const status = getDayStatus(date)
                    const isSelected = selectedDates.has(status.dateStr)

                    return (
                      <div
                        key={status.dateStr}
                        className={`
                          aspect-square rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden
                          ${status.isPast ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-50' : ''}
                          ${status.isWeekend && !status.isPast ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : ''}
                          ${status.isFullyBlocked && !status.isPast ? 'bg-red-50 border-red-200 hover:border-red-400' : ''}
                          ${!status.isPast && !status.isWeekend && !status.isFullyBlocked ? 'bg-white border-gray-200 hover:border-violet-400 hover:shadow-md' : ''}
                          ${isSelected ? 'ring-2 ring-violet-500 ring-offset-1 border-violet-400' : ''}
                          ${status.isToday ? 'border-violet-500' : ''}
                        `}
                        onMouseDown={() => handleMouseDown(status.dateStr, status)}
                        onMouseEnter={() => handleMouseEnter(status.dateStr, status)}
                        onClick={() => {
                          if (!status.isPast && !status.isWeekend && !isDragging) {
                            setSelectedDay(status.dateStr)
                          }
                        }}
                      >
                        {/* Date number */}
                        <div className={`
                          absolute top-1 left-1.5 text-sm font-bold
                          ${status.isToday ? 'bg-violet-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                          ${status.isPast || status.isWeekend ? 'text-gray-400' : ''}
                          ${status.isFullyBlocked && !status.isPast ? 'text-red-600' : ''}
                          ${!status.isPast && !status.isWeekend && !status.isFullyBlocked ? 'text-gray-700' : ''}
                        `}>
                          {date.getDate()}
                        </div>

                        {/* Status indicators */}
                        {!status.isPast && !status.isWeekend && (
                          <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5">
                            {/* Bookings */}
                            {status.bookings.map((booking, bi) => (
                              <div
                                key={booking.id}
                                className={`
                                  text-[9px] font-medium px-1 py-0.5 rounded truncate
                                  ${booking.status === 'completed' ? 'bg-green-200 text-green-800' : ''}
                                  ${booking.status === 'scheduled' ? 'bg-blue-200 text-blue-800' : ''}
                                  ${booking.status === 'no_show' ? 'bg-red-200 text-red-800' : ''}
                                  ${booking.status === 'cancelled' ? 'bg-gray-200 text-gray-600' : ''}
                                `}
                                title={`${booking.name} - ${new Date(booking.scheduledDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                              >
                                {new Date(booking.scheduledDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Blocked indicator */}
                        {status.isFullyBlocked && !status.isPast && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-red-400" />
                          </div>
                        )}

                        {/* Partial blocks indicator */}
                        {status.timeBlocks.length > 0 && !status.isFullyBlocked && !status.isPast && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full" title={`${status.timeBlocks.length} horas bloqueadas`} />
                          </div>
                        )}

                        {/* Available slots indicator */}
                        {status.availableCount > 0 && status.availableCount < TIMES.length && !status.hasBookings && (
                          <div className="absolute bottom-1 right-1 text-[9px] font-medium text-gray-400">
                            {status.availableCount}h
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-blue-200"></div>
                Reservado
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-green-200"></div>
                Completado
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-red-50 border border-red-200 flex items-center justify-center">
                  <Lock className="w-2 h-2 text-red-400" />
                </div>
                Bloqueado
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
                Disponible
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-violet-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Próximas citas
              </h3>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto">
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  No hay citas pendientes
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingBookings.map((booking) => {
                    const date = new Date(booking.scheduledDate)
                    return (
                      <button
                        key={booking.id}
                        onClick={() => {
                          setSelectedBooking(booking)
                          setNotesValue(booking.adminNotes || '')
                        }}
                        className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-violet-50 hover:from-blue-100 hover:to-violet-100 rounded-lg transition-colors border border-blue-100"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium text-gray-900 text-sm truncate">{booking.name}</span>
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-600" />
                Días bloqueados
              </h3>
            </div>
            <div className="p-3 max-h-64 overflow-y-auto">
              {blockedSlots.filter(s => s.time === null).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Sin días bloqueados
                </p>
              ) : (
                <div className="space-y-1.5">
                  {blockedSlots
                    .filter(s => s.time === null)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 10)
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-2 bg-red-50 rounded-lg group"
                      >
                        <div className="text-sm">
                          <div className="font-medium text-red-700">
                            {new Date(slot.date).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          {slot.reason && (
                            <div className="text-xs text-red-600">{slot.reason}</div>
                          )}
                        </div>
                        <button
                          onClick={() => unblockSlot(slot.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Desbloquear"
                        >
                          <Unlock className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-xl p-4 border border-violet-200">
            <h4 className="font-medium text-violet-800 mb-2 text-sm">Tips:</h4>
            <ul className="text-xs text-violet-700 space-y-1.5">
              <li>• <strong>Arrastra</strong> sobre los días para seleccionar varios</li>
              <li>• <strong>Click</strong> en un día para ver/gestionar horarios</li>
              <li>• Los <strong>fines de semana</strong> están deshabilitados</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">
                {new Date(selectedDay).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h3>
              <button
                onClick={() => {
                  setSelectedDay(null)
                  setSelectedTime(null)
                  setBlockReason('')
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {(() => {
                const dayStatus = getDayStatus(new Date(selectedDay))

                return (
                  <div className="space-y-3">
                    {/* Quick block/unblock whole day */}
                    <div className="flex gap-2 mb-4">
                      {!dayStatus.isFullyBlocked ? (
                        <button
                          onClick={async () => {
                            await blockDay(selectedDay)
                            fetchData()
                          }}
                          disabled={savingBlock}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          Bloquear día completo
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            if (dayStatus.dayBlock) {
                              await unblockSlot(dayStatus.dayBlock.id)
                            }
                          }}
                          disabled={savingBlock}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Unlock className="w-4 h-4" />
                          Desbloquear día
                        </button>
                      )}
                    </div>

                    {/* Time slots */}
                    <div className="text-sm font-medium text-gray-700 mb-2">Horarios:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {TIMES.map(time => {
                        const timeBlock = dayStatus.timeBlocks.find(t => t.time === time)
                        const booking = dayStatus.bookings.find(b => {
                          const bookingTime = new Date(b.scheduledDate).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Europe/Madrid'
                          })
                          return bookingTime === time
                        })

                        const isBlocked = dayStatus.isFullyBlocked || !!timeBlock
                        const isBooked = !!booking

                        return (
                          <div
                            key={time}
                            className={`
                              p-3 rounded-lg border-2 transition-all
                              ${isBooked ? 'bg-blue-50 border-blue-200' : ''}
                              ${isBlocked && !isBooked ? 'bg-red-50 border-red-200' : ''}
                              ${!isBlocked && !isBooked ? 'bg-gray-50 border-gray-200 hover:border-gray-300' : ''}
                            `}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-gray-900">{time}</span>
                              {isBooked && <Video className="w-4 h-4 text-blue-600" />}
                              {isBlocked && !isBooked && <Lock className="w-4 h-4 text-red-500" />}
                            </div>

                            {isBooked && booking && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setNotesValue(booking.adminNotes || '')
                                  setSelectedDay(null)
                                }}
                                className="text-xs text-blue-600 hover:underline truncate block w-full text-left"
                              >
                                {booking.name}
                              </button>
                            )}

                            {isBlocked && !isBooked && !dayStatus.isFullyBlocked && timeBlock && (
                              <button
                                onClick={() => unblockSlot(timeBlock.id)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Desbloquear
                              </button>
                            )}

                            {!isBlocked && !isBooked && (
                              <button
                                onClick={() => blockTimeSlot(selectedDay, time)}
                                disabled={savingBlock}
                                className="text-xs text-gray-500 hover:text-red-600"
                              >
                                Bloquear
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-violet-600" />
                Detalle de la cita
              </h3>
              <button
                onClick={() => {
                  setSelectedBooking(null)
                  setEditingNotes(false)
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Date/time */}
              <div className="bg-gradient-to-br from-violet-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="text-lg font-bold">
                  {new Date(selectedBooking.scheduledDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-white/90 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedBooking.scheduledDate).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}h
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedBooking.status]?.bgColor} ${STATUS_CONFIG[selectedBooking.status]?.color}`}>
                  {STATUS_CONFIG[selectedBooking.status]?.label}
                </span>
              </div>

              {/* Client info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{selectedBooking.name}</div>
                    <a href={`mailto:${selectedBooking.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedBooking.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{selectedBooking.properties} propiedades</span>
                </div>
              </div>

              {/* Challenge */}
              {selectedBooking.challenge && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Su principal reto
                  </div>
                  <p className="text-sm text-amber-900">{selectedBooking.challenge}</p>
                </div>
              )}

              {/* Admin notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Mis notas
                  </span>
                  {!editingNotes && (
                    <button onClick={() => setEditingNotes(true)} className="text-xs text-violet-600 hover:underline">
                      Editar
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                      placeholder="Añade notas..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveNotes}
                        disabled={savingNotes}
                        className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false)
                          setNotesValue(selectedBooking.adminNotes || '')
                        }}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {selectedBooking.adminNotes || <span className="text-gray-400 italic">Sin notas</span>}
                  </p>
                )}
              </div>

              {/* Status actions */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs font-medium text-gray-500 mb-2">Cambiar estado:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedBooking.id, status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedBooking.status === status
                          ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-gray-300`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 pt-2">
                <a
                  href={`mailto:${selectedBooking.email}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
                <a
                  href={`https://meet.google.com/itineramio-${selectedBooking.id.slice(0, 8)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Meet
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
