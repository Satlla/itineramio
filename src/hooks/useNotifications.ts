'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification, ZoneWarning } from '../types/notifications'

// Helper function to get text from multilingual objects
const getZoneText = (value: any, fallback: string = '') => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || fallback
  }
  return fallback
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('itineramio_notifications')
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }))
        setNotifications(parsed)
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }
  }, [])

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('itineramio_notifications', JSON.stringify(notifications))
  }, [notifications])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  const generateZoneWarnings = useCallback((propertyId: string, zones: any[], propertyName?: string) => {
    // Generate warnings for empty zones or zones with few steps
    zones.forEach(zone => {
      const zoneName = getZoneText(zone.name)
      
      if (zone.stepsCount === 0) {
        addNotification({
          type: 'warning',
          title: `${propertyName || 'Propiedad'} - Zona sin configurar`,
          message: `La zona "${zoneName}" no tiene instrucciones configuradas`,
          propertyId,
          zoneId: zone.id,
          read: false,
          actionUrl: `/properties/${propertyId}/zones/${zone.id}/steps`
        })
      } else if (zone.stepsCount < 3) {
        addNotification({
          type: 'info',
          title: `${propertyName || 'Propiedad'} - Zona incompleta`,
          message: `La zona "${zoneName}" solo tiene ${zone.stepsCount} paso(s)`,
          propertyId,
          zoneId: zone.id,
          read: false,
          actionUrl: `/properties/${propertyId}/zones/${zone.id}/steps`
        })
      }
    })
  }, [addNotification])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    generateZoneWarnings
  }
}