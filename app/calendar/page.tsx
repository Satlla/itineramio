'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react'

interface Property {
  id: string
  name: string
  type: string
  city: string
  profileImage?: string
  reservations: Reservation[]
  syncConfig?: {
    airbnbICalUrl?: string
    bookingICalUrl?: string
    vrboICalUrl?: string
    otherICalUrl?: string
    lastSyncAt?: string
    lastSyncStatus?: string
  }
}

interface Reservation {
  id: string
  propertyId: string
  source: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'DIRECT' | 'MANUAL'
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  guestCount?: number
  totalPrice?: number
  pricePerNight?: number
  status: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    checkUserAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchCalendarData()
    }
  }, [currentDate, user])

  useEffect(() => {
    // Filter properties based on search term
    if (!searchTerm.trim()) {
      setFilteredProperties(properties)
    } else {
      const filtered = properties.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.reservations.some(res => 
          res.guestName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredProperties(filtered)
    }
  }, [searchTerm, properties])

  const checkUserAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      window.location.href = '/login'
    }
  }

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get start and end of current month + next 2 months for horizontal view
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0)
      
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]
      
      const response = await fetch(`/api/calendar?startDate=${startDateStr}&endDate=${endDateStr}`)
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Flatten all properties from property groups
        const allProperties = data.propertyGroups.flatMap((group: any) => group.properties)
        setProperties(allProperties)
      } else {
        console.error('Calendar API error:', data.error)
        setProperties([])
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  const handleSyncAll = async () => {
    try {
      setLoading(true)
      
      const propertiesToSync = properties.filter(prop => 
        prop.syncConfig && 
        (prop.syncConfig.airbnbICalUrl || prop.syncConfig.bookingICalUrl || prop.syncConfig.vrboICalUrl)
      )
      
      if (propertiesToSync.length === 0) {
        alert('No hay propiedades configuradas para sincronización.')
        return
      }
      
      let syncedCount = 0
      let errorCount = 0
      
      for (const property of propertiesToSync) {
        try {
          const response = await fetch('/api/calendar/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              propertyId: property.id,
              force: true 
            })
          })
          
          if (response.ok) {
            syncedCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }
      
      await fetchCalendarData()
      
      if (errorCount === 0) {
        alert(`✅ Sincronización completada: ${syncedCount} propiedades actualizadas`)
      } else {
        alert(`⚠️ Sincronización parcial: ${syncedCount} éxitos, ${errorCount} errores`)
      }
      
    } catch (error) {
      console.error('Error syncing calendars:', error)
      alert('❌ Error durante la sincronización')
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // Generate dates for horizontal calendar (current month + next 2 months)
  const generateCalendarDates = () => {
    const dates = []
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0)
    
    const current = new Date(startDate)
    while (current <= endDate) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const getSourceColor = (source: string) => {
    const customTeal = 'rgb(0, 132, 137)' // Tu color específico
    switch (source) {
      case 'AIRBNB':
        return customTeal
      case 'BOOKING':
        return 'rgb(59, 130, 246)' // blue-500
      case 'VRBO':
        return 'rgb(249, 115, 22)' // orange-500
      case 'DIRECT':
        return 'rgb(55, 65, 81)' // gray-700
      case 'MANUAL':
        return 'rgb(168, 85, 247)' // purple-500
      default:
        return 'rgb(156, 163, 175)' // gray-400
    }
  }

  const getSourceColorLight = (source: string) => {
    switch (source) {
      case 'AIRBNB':
        return 'bg-red-100 border-red-300'
      case 'BOOKING':
        return 'bg-blue-100 border-blue-300'
      case 'VRBO':
        return 'bg-orange-100 border-orange-300'
      case 'DIRECT':
        return 'bg-gray-100 border-gray-300'
      case 'MANUAL':
        return 'bg-green-100 border-green-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getReservationForDate = (property: Property, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return property.reservations.find(res => {
      const checkIn = new Date(res.checkIn)
      const checkOut = new Date(res.checkOut)
      const currentDate = new Date(dateStr)
      return currentDate >= checkIn && currentDate < checkOut
    })
  }

  const getAllReservationsForDate = (property: Property, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    // Buscar reservas que estén activas en este día (check-in hasta antes del check-out)
    const activeReservations = property.reservations.filter(res => {
      const checkIn = new Date(res.checkIn)
      const checkOut = new Date(res.checkOut)
      const currentDate = new Date(dateStr)
      return currentDate >= checkIn && currentDate < checkOut
    })
    
    // Buscar reservas que hagan check-in este día
    const checkInReservations = property.reservations.filter(res => {
      const checkIn = new Date(res.checkIn)
      return checkIn.toISOString().split('T')[0] === dateStr
    })
    
    // Combinar y eliminar duplicados
    const allReservations = [...activeReservations]
    checkInReservations.forEach(res => {
      if (!allReservations.find(r => r.id === res.id)) {
        allReservations.push(res)
      }
    })
    
    return allReservations
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isFirstDayOfReservation = (reservation: Reservation, date: Date) => {
    return date.toISOString().split('T')[0] === reservation.checkIn.split('T')[0]
  }

  const isLastDayOfReservation = (reservation: Reservation, date: Date) => {
    const checkOut = new Date(reservation.checkOut)
    checkOut.setDate(checkOut.getDate() - 1) // Last night, not checkout day
    return date.toISOString().split('T')[0] === checkOut.toISOString().split('T')[0]
  }

  const isCheckInDay = (reservation: Reservation, date: Date) => {
    const checkIn = new Date(reservation.checkIn)
    return checkIn.toISOString().split('T')[0] === date.toISOString().split('T')[0]
  }

  const isCheckOutDay = (reservation: Reservation, date: Date) => {
    const checkOut = new Date(reservation.checkOut)
    return checkOut.toISOString().split('T')[0] === date.toISOString().split('T')[0]
  }

  const formatPrice = (price?: number | null) => {
    if (!price) return ''
    return `€${price.toLocaleString()}`
  }

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const calendarDates = generateCalendarDates()
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Ultra Clean */}
      <div className="border-b border-gray-100">
        <div className="max-w-none px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Calendario
              </h1>
              <p className="text-gray-600 text-sm">
                {filteredProperties.length} propiedades
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar - Airbnb Style */}
              <div className="relative">
                <div className="flex items-center bg-white border border-gray-300 rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-shadow w-80">
                  <Search className="w-4 h-4 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Buscar propiedades o huéspedes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 outline-none text-sm placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Sync Button */}
              <button 
                onClick={handleSyncAll}
                disabled={loading}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Sincronizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="px-8 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <select
              value={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-').map(Number)
                setCurrentDate(new Date(year, month, 1))
              }}
              className="text-lg font-medium text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:bg-gray-50 rounded px-2 py-1 capitalize"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() - 12 + i)
                return (
                  <option 
                    key={`${date.getFullYear()}-${date.getMonth()}`}
                    value={`${date.getFullYear()}-${date.getMonth()}`}
                  >
                    {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </option>
                )
              })}
            </select>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={() => {
              const today = new Date()
              setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
            }}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: 'rgb(0, 132, 137)' }}
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex">
        {/* Properties Column */}
        <div className="w-80 bg-white border-r border-gray-200">
          {/* Properties List */}
          <div className="divide-y divide-gray-100">
            {filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-base font-medium mb-2">
                  {searchTerm ? 'No se encontraron propiedades' : 'No hay propiedades'}
                </p>
                <p className="text-sm text-gray-400">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Añade propiedades para ver sus calendarios aquí'}
                </p>
              </div>
            ) : (
              filteredProperties.map(property => (
                <div key={property.id} className="p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <img 
                      src={property.profileImage || '/api/placeholder/40/40'} 
                      alt={property.name}
                      className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate mb-0.5 leading-tight">
                        {property.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {property.city} · {property.type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-x-auto" style={{ backgroundColor: '#f1f1f1' }}>
          {/* Days Header */}
          <div className="flex sticky top-0 bg-white z-10 border-b border-gray-200">
            {calendarDates.map(date => (
              <div 
                key={date.toISOString()}
                className="flex-shrink-0 w-12 py-2"
                style={{
                  backgroundColor: isToday(date) ? 'rgb(0, 132, 137)' : 'transparent'
                }}
              >
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()]}
                  </div>
                  <div className={`text-sm mt-1 ${
                    isToday(date) ? 'text-white font-bold w-6 h-6 flex items-center justify-center mx-auto' : 'text-gray-900 font-medium'
                  }`} style={{
                    backgroundColor: isToday(date) ? 'rgb(0, 132, 137)' : 'transparent'
                  }}>
                    {date.getDate()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Body with Grid */}
          <div className="bg-white relative">
            {filteredProperties.map((property, propertyIndex) => (
              <div key={property.id} className="relative">
                {/* Grid cells */}
                <div className="flex border-b border-gray-200 last:border-b-0">
                  {calendarDates.map(date => (
                    <div 
                      key={`${property.id}-${date.toISOString()}-cell`}
                      className="flex-shrink-0 w-12 h-12 border-r border-gray-200 last:border-r-0 flex items-center justify-center"
                      style={{ backgroundColor: '#f1f1f1' }}
                    >
                      {/* Today indicator for empty days */}
                      {isToday(date) && !getReservationForDate(property, date) && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgb(0, 132, 137)' }}></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reservation bars - rendered on top */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {calendarDates.map(date => {
                    const reservations = getAllReservationsForDate(property, date)
                    
                    return (
                      <div 
                        key={`${property.id}-${date.toISOString()}-bar`}
                        className="flex-shrink-0 w-12 h-12 relative flex items-center justify-center"
                      >
                        {reservations.map((reservation, index) => {
                          const isFirst = isFirstDayOfReservation(reservation, date)
                          const isLast = isLastDayOfReservation(reservation, date)
                          const isCheckIn = isCheckInDay(reservation, date)
                          const isCheckOut = isCheckOutDay(reservation, date)
                          const hasMultiple = reservations.length > 1
                          // Mantener siempre la misma posición vertical central
                          const verticalOffset = 0 // Sin offset vertical para mantener alineación
                          
                          // Configurar posición y bordes según el tipo de día
                          let leftPosition = 5
                          let rightPosition = 5
                          let borderRadius = '0px'
                          let leftPercent = 0
                          let rightPercent = 0
                          
                          if (isCheckOut && !isCheckIn) {
                            // Solo día de checkout - la barra termina exactamente al 50%
                            leftPosition = 0
                            rightPercent = 50 // Termina exactamente al 50% del día
                            rightPosition = 0 // Sin margen adicional
                            borderRadius = '0px 12px 12px 0px'
                          } else if (isCheckIn && !isCheckOut) {
                            // Solo día de checkin - la barra empieza exactamente al 50%
                            leftPercent = 50 // Empieza exactamente al 50% del día
                            leftPosition = 0 // Sin margen adicional
                            rightPosition = 0
                            borderRadius = '12px 0px 0px 12px'
                          } else if (isCheckIn && isCheckOut && !isFirst && !isLast) {
                            // Mismo día checkout y checkin (día de cambio)
                            // No mostrar nada para evitar confusión
                            return null
                          } else if (isFirst && isLast) {
                            // Reserva de un solo día
                            if (isCheckIn && isCheckOut) {
                              // Checkout y checkin mismo día (día completo)
                              borderRadius = '12px'
                              leftPosition = 5
                              rightPosition = 5
                            } else {
                              borderRadius = '12px'
                              leftPosition = 5
                              rightPosition = 5
                            }
                          } else if (isFirst) {
                            // Primer día normal (checkin)
                            if (isCheckIn) {
                              leftPercent = 50
                              leftPosition = 0 // Sin margen adicional
                              rightPosition = 0
                              borderRadius = '12px 0px 0px 12px'
                            } else {
                              borderRadius = '12px 0px 0px 12px'
                              leftPosition = 5
                              rightPosition = 0
                            }
                          } else if (isLast) {
                            // Último día normal (última noche, no checkout)
                            borderRadius = '0px 12px 12px 0px'
                            leftPosition = 0
                            rightPosition = 5
                          } else {
                            // Días intermedios
                            borderRadius = '0px'
                            leftPosition = 0
                            rightPosition = 0
                          }
                          
                          return (
                            <div 
                              key={reservation.id}
                              className="absolute h-5 cursor-pointer hover:opacity-90 transition-opacity flex items-center pointer-events-auto z-10"
                              onClick={() => setSelectedReservation(reservation)}
                              title={`${reservation.guestName} - ${reservation.source}${reservation.totalPrice ? ' - ' + formatPrice(reservation.totalPrice) : ''}`}
                              style={{
                                backgroundColor: getSourceColor(reservation.source),
                                left: leftPercent > 0 ? `${leftPercent}%` : `${leftPosition}px`,
                                right: rightPercent > 0 ? `${rightPercent}%` : `${rightPosition}px`,
                                borderRadius: borderRadius,
                                top: '50%',
                                transform: 'translateY(-50%)', // Centrar verticalmente siempre
                                opacity: hasMultiple ? 0.85 : 1,
                                paddingLeft: (isFirst || isCheckIn) ? '8px' : '0px',
                                paddingRight: '0px',
                              }}
                            >
                              {(isFirst || isCheckIn) && (
                                <div className="text-white text-[8px] font-semibold truncate overflow-hidden whitespace-nowrap ml-1">
                                  {reservation.guestName.split(' ')[0]}
                                  {reservation.pricePerNight && (
                                    <span className="ml-1 opacity-90">€{reservation.pricePerNight}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div 
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-3 h-3 ${getSourceColor(selectedReservation.source)} rounded-full`}></div>
              <button
                onClick={() => setSelectedReservation(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedReservation.guestName}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Fuente:</span>
                <span className="ml-2 font-medium">{selectedReservation.source}</span>
              </div>
              
              <div>
                <span className="text-gray-500">Fechas:</span>
                <span className="ml-2">
                  {new Date(selectedReservation.checkIn).toLocaleDateString('es-ES')} - {new Date(selectedReservation.checkOut).toLocaleDateString('es-ES')}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500">Noches:</span>
                <span className="ml-2">{selectedReservation.nights}</span>
              </div>
              
              {selectedReservation.guestCount && (
                <div>
                  <span className="text-gray-500">Huéspedes:</span>
                  <span className="ml-2">{selectedReservation.guestCount}</span>
                </div>
              )}
              
              {selectedReservation.totalPrice && (
                <div>
                  <span className="text-gray-500">Precio total:</span>
                  <span className="ml-2 font-semibold">{formatPrice(selectedReservation.totalPrice)}</span>
                </div>
              )}
              
              {selectedReservation.pricePerNight && (
                <div>
                  <span className="text-gray-500">Por noche:</span>
                  <span className="ml-2">{formatPrice(selectedReservation.pricePerNight)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend - Minimal */}
      <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-center space-x-8 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Airbnb</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Booking</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">VRBO</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
            <span className="text-gray-600">Directa</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-gray-600">Manual</span>
          </div>
        </div>
      </div>
    </div>
  )
}