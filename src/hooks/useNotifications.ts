'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification, ZoneWarning } from '../types/notifications'

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
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
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

  const generateZoneWarnings = useCallback((propertyId: string, zones: any[]) => {
    const warnings: ZoneWarning[] = []

    zones.forEach(zone => {
      // Check if zone is inactive
      if (zone.status === 'DRAFT' || !zone.isPublished) {
        warnings.push({
          zoneId: zone.id,
          zoneName: zone.name,
          type: 'inactive',
          message: `La zona "${zone.name}" está desactivada y no es visible para los huéspedes`,
          propertyId
        })
      }

      // Check if zone is empty (no steps)
      if (!zone.steps || zone.steps.length === 0 || zone.stepsCount === 0) {
        warnings.push({
          zoneId: zone.id,
          zoneName: zone.name,
          type: 'empty',
          message: `La zona "${zone.name}" no tiene instrucciones configuradas`,
          propertyId
        })
      }

      // Check if zone has no recent visits (simulate with viewCount)
      if (zone.viewCount === 0 && zone.createdAt) {
        const daysSinceCreated = Math.floor((Date.now() - new Date(zone.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceCreated > 7) {
          warnings.push({
            zoneId: zone.id,
            zoneName: zone.name,
            type: 'no_visits',
            message: `La zona "${zone.name}" no ha sido visitada en los últimos 7 días`,
            propertyId
          })
        }
      }
    })

    // Convert warnings to notifications
    warnings.forEach(warning => {
      // Check if this warning already exists
      const existingNotification = notifications.find(n => 
        n.zoneId === warning.zoneId && 
        n.type === 'warning' && 
        n.message === warning.message
      )

      if (!existingNotification) {
        addNotification({
          type: 'warning',
          title: 'Problema en zona',
          message: warning.message,
          propertyId: warning.propertyId,
          zoneId: warning.zoneId,
          read: false,
          actionUrl: `/properties/${warning.propertyId}/zones/${warning.zoneId}/steps`
        })
      }
    })
  }, [notifications, addNotification])

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