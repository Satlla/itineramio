'use client'

import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Filter, Clock, MapPin, Users, Phone, Mail, Settings, Plus, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react'

interface PropertyGroup {
  id: string
  name: string
  properties: Property[]
  isCollapsed: boolean
}

interface Property {
  id: string
  name: string
  type: string
  city: string
  reservations: Reservation[]
  syncConfig?: {
    airbnbICalUrl?: string
    bookingICalUrl?: string
    lastSyncAt?: string
    lastSyncStatus?: string
  }
}

interface Reservation {
  id: string
  propertyId: string
  source: 'AIRBNB' | 'BOOKING' | 'DIRECT' | 'MANUAL'
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  guestCount?: number
  guestPhone?: string
  guestEmail?: string
  totalPrice?: number
  status: string
}

const FEATURE_ENABLED = process.env.NODE_ENV === 'development' || false // Only for development for now

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [propertyGroups, setPropertyGroups] = useState<PropertyGroup[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [todayCheckIns, setTodayCheckIns] = useState<Reservation[]>([])
  const [todayCheckOuts, setTodayCheckOuts] = useState<Reservation[]>([])

  // Check if feature is enabled and user is admin
  useEffect(() => {
    checkFeatureAccess()
    if (FEATURE_ENABLED) {
      fetchCalendarData()
    }
  }, [])

  // Refetch data when date changes
  useEffect(() => {
    if (FEATURE_ENABLED && isAdmin) {
      fetchCalendarData()
    }
  }, [currentDate, isAdmin])

  const checkFeatureAccess = async () => {
    try {
      // Check if user is admin for development access
      const response = await fetch('/api/auth/me')
      const userData = await response.json()
      setIsAdmin(userData?.isAdmin || false)
    } catch (error) {
      console.error('Error checking user access:', error)
    }
  }

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      
      const currentMonth = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0') + '-01'
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)
      const endDate = nextMonth.getFullYear() + '-' + String(nextMonth.getMonth() + 1).padStart(2, '0') + '-' + String(nextMonth.getDate()).padStart(2, '0')
      
      const response = await fetch(`/api/admin/calendar?startDate=${currentMonth}&endDate=${endDate}`)
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPropertyGroups(data.propertyGroups)
        setTodayCheckIns(data.todayCheckIns)
        setTodayCheckOuts(data.todayCheckOuts)
      } else {
        console.error('Calendar API error:', data.error)
        // Fallback to empty data
        setPropertyGroups([])
        setTodayCheckIns([])
        setTodayCheckOuts([])
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      // Fallback to empty data
      setPropertyGroups([])
      setTodayCheckIns([])
      setTodayCheckOuts([])
    } finally {
      setLoading(false)
    }
  }

  const togglePropertyGroup = (groupId: string) => {
    setPropertyGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isCollapsed: !group.isCollapsed }
        : group
    ))
  }

  const handleSyncAll = async () => {
    try {
      setLoading(true)
      
      // Get all properties that have sync configured
      const propertiesToSync = propertyGroups
        .flatMap(group => group.properties)
        .filter(prop => prop.syncConfig && prop.syncConfig.airbnbICalUrl)
      
      if (propertiesToSync.length === 0) {
        alert('No hay propiedades configuradas para sincronización')
        return
      }
      
      let syncedCount = 0
      let errorCount = 0
      
      for (const property of propertiesToSync) {
        try {
          const response = await fetch('/api/admin/calendar/sync', {
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
      
      // Refresh data after sync
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

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'AIRBNB':
        return 'bg-red-500'
      case 'BOOKING':
        return 'bg-blue-500'
      case 'DIRECT':
        return 'bg-gray-900'
      case 'MANUAL':
        return 'bg-green-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
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

  // Feature flag check
  if (!FEATURE_ENABLED || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Calendario en Desarrollo
          </h2>
          <p className="text-gray-600 mb-4">
            Esta funcionalidad está en desarrollo y solo está disponible para administradores en modo desarrollo.
          </p>
          {!isAdmin && (
            <p className="text-sm text-red-600">
              Necesitas permisos de administrador para acceder.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <CalendarIcon className="w-8 h-8 text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Centro de Operaciones
            </h1>
            <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              BETA
            </span>
          </div>
          <p className="text-gray-600">
            Gestiona todas tus reservas desde un solo lugar
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </button>
          <button 
            onClick={handleSyncAll}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Today's Activity Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Check-ins Hoy</h3>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
              {todayCheckIns.length}
            </span>
          </div>
          {todayCheckIns.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay check-ins programados</p>
          ) : (
            <div className="space-y-2">
              {todayCheckIns.map(reservation => (
                <div key={reservation.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{reservation.guestName}</p>
                    <p className="text-sm text-gray-500">Propiedad ID: {reservation.propertyId}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getSourceColor(reservation.source)}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Check-outs Hoy</h3>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
              {todayCheckOuts.length}
            </span>
          </div>
          {todayCheckOuts.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay check-outs programados</p>
          ) : (
            <div className="space-y-2">
              {todayCheckOuts.map(reservation => (
                <div key={reservation.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{reservation.guestName}</p>
                    <p className="text-sm text-gray-500">Propiedad ID: {reservation.propertyId}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getSourceColor(reservation.source)}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por propiedad, huésped..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
              />
            </div>
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Todas las fuentes</option>
            <option value="AIRBNB">Airbnb</option>
            <option value="BOOKING">Booking.com</option>
            <option value="DIRECT">Directas</option>
            <option value="MANUAL">Manuales</option>
          </select>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {monthName}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Property Groups Calendar */}
      <div className="space-y-4">
        {propertyGroups.map(group => (
          <div key={group.id} className="bg-white rounded-lg border border-gray-200">
            {/* Group Header */}
            <div 
              className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => togglePropertyGroup(group.id)}
            >
              <div className="flex items-center">
                <ChevronRight className={`w-5 h-5 transition-transform ${group.isCollapsed ? '' : 'rotate-90'}`} />
                <h3 className="ml-2 text-lg font-semibold text-gray-900">{group.name}</h3>
                <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {group.properties.length} propiedades
                </span>
              </div>
            </div>

            {/* Properties Calendar Grid */}
            {!group.isCollapsed && (
              <div className="divide-y divide-gray-200">
                {group.properties.map(property => (
                  <div key={property.id} className="p-4">
                    {/* Property Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{property.name}</h4>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {property.city} • {property.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {property.syncConfig?.lastSyncStatus === 'SUCCESS' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Configurar
                        </button>
                      </div>
                    </div>

                    {/* Mini Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for days before month starts */}
                      {Array.from({ length: startingDayOfWeek }, (_, i) => (
                        <div key={`empty-${i}`} className="h-8" />
                      ))}
                      
                      {/* Days of the month */}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        
                        const dayReservations = property.reservations.filter(res => {
                          const checkIn = new Date(res.checkIn)
                          const checkOut = new Date(res.checkOut)
                          const currentDay = new Date(dateStr)
                          return currentDay >= checkIn && currentDay < checkOut
                        })

                        const isToday = dateStr === new Date().toISOString().split('T')[0]

                        return (
                          <div 
                            key={day} 
                            className={`h-8 text-xs flex items-center justify-center border rounded ${
                              isToday ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            }`}
                          >
                            <span className="font-medium">{day}</span>
                            {dayReservations.length > 0 && (
                              <div className="flex space-x-0.5 ml-1">
                                {dayReservations.slice(0, 2).map(res => (
                                  <div 
                                    key={res.id}
                                    className={`w-1.5 h-1.5 rounded-full ${getSourceColor(res.source)}`}
                                    title={`${res.guestName} (${res.source})`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Current Reservations */}
                    {property.reservations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Reservas Próximas</h5>
                        {property.reservations.slice(0, 3).map(reservation => (
                          <div key={reservation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${getSourceColor(reservation.source)} mr-3`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{reservation.guestName}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(reservation.checkIn).toLocaleDateString('es-ES')} - {new Date(reservation.checkOut).toLocaleDateString('es-ES')} • {reservation.nights} noches
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {reservation.source}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda de Fuentes</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            <span className="text-sm text-gray-600">Airbnb</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Booking.com</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-900 mr-2" />
            <span className="text-sm text-gray-600">Reserva Directa</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <span className="text-sm text-gray-600">Manual</span>
          </div>
        </div>
      </div>
    </div>
  )
}