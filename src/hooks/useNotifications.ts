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

  const generateZoneWarnings = useCallback((propertyId: string, zones: any[], propertyName?: string) => {
    const warnings: ZoneWarning[] = []

    zones.forEach(zone => {
      const zoneName = getZoneText(zone.name)
      
      // Check if zone is inactive
      if (zone.status === 'DRAFT' || !zone.isPublished) {
        warnings.push({
          zoneId: zone.id,
          zoneName,
          type: 'inactive',
          message: `La zona "${zoneName}" está desactivada y no es visible para los huéspedes`,
          propertyId
        })
      }

      // Check if zone is empty (no steps)
      if (!zone.steps || zone.steps.length === 0 || zone.stepsCount === 0) {
        warnings.push({
          zoneId: zone.id,
          zoneName,
          type: 'empty',
          message: `La zona "${zoneName}" no tiene instrucciones configuradas`,
          propertyId
        })
      }

      // Check if zone has steps but they are incomplete
      if (zone.steps && zone.steps.length > 0) {
        const incompleteSteps = zone.steps.filter((step: any) => {
          const content = getZoneText(step.content || step.title)
          return !content || content.trim().length < 10 // Steps with less than 10 chars
        })
        
        if (incompleteSteps.length > 0) {
          warnings.push({
            zoneId: zone.id,
            zoneName,
            type: 'incomplete_steps',
            message: `La zona "${zoneName}" tiene ${incompleteSteps.length} paso(s) incompleto(s)`,
            propertyId
          })
        }
      }

      // Check if zone needs English translation
      if (zone.steps && zone.steps.length > 0) {
        const stepsWithoutEnglish = zone.steps.filter((step: any) => {
          const content = step.content || step.title
          if (typeof content === 'object') {
            return !content.en || content.en.trim().length === 0
          }
          return true // If content is string only, it needs translation
        })
        
        if (stepsWithoutEnglish.length > 0) {
          warnings.push({
            zoneId: zone.id,
            zoneName,
            type: 'missing_translation',
            message: `La zona "${zoneName}" necesita traducción al inglés (${stepsWithoutEnglish.length} paso(s))`,
            propertyId
          })
        }
      }

      // Check if zone needs French translation
      if (zone.steps && zone.steps.length > 0) {
        const stepsWithoutFrench = zone.steps.filter((step: any) => {
          const content = step.content || step.title
          if (typeof content === 'object') {
            return !content.fr || content.fr.trim().length === 0
          }
          return true // If content is string only, it needs translation
        })
        
        if (stepsWithoutFrench.length > 0) {
          warnings.push({
            zoneId: zone.id,
            zoneName,
            type: 'missing_french',
            message: `La zona "${zoneName}" necesita traducción al francés (${stepsWithoutFrench.length} paso(s))`,
            propertyId
          })
        }
      }

      // Check if zone has no recent visits (simulate with viewCount)
      if (zone.viewCount === 0 && zone.createdAt) {
        const daysSinceCreated = Math.floor((Date.now() - new Date(zone.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceCreated > 7) {
          warnings.push({
            zoneId: zone.id,
            zoneName,
            type: 'no_visits',
            message: `La zona "${zoneName}" no ha sido visitada en los últimos 7 días`,
            propertyId
          })
        }
      }
    })

    // Check property-level issues
    const essentialZones = ['check in', 'check out', 'wifi', 'emergencias']
    const existingZoneNames = zones.map(z => getZoneText(z.name).toLowerCase())
    
    essentialZones.forEach(essentialZone => {
      const hasZone = existingZoneNames.some(name => 
        name.includes(essentialZone.toLowerCase()) || 
        name.includes(essentialZone.replace(' ', ''))
      )
      
      if (!hasZone) {
        warnings.push({
          zoneId: '',
          zoneName: '',
          type: 'missing_essential',
          message: `Falta zona esencial: "${essentialZone}" en ${propertyName || 'la propiedad'}`,
          propertyId
        })
      }
    })

    // Convert warnings to notifications
    warnings.forEach(warning => {
      // Create unique identifier for this type of warning
      const warningKey = `${warning.type}_${warning.zoneId || 'property'}_${warning.propertyId}`
      
      // Check if this warning already exists (using a more specific check)
      const existingNotification = notifications.find(n => 
        n.propertyId === warning.propertyId && 
        n.zoneId === warning.zoneId &&
        n.type === 'warning' && 
        n.message.includes(warning.zoneName || warning.type)
      )

      if (!existingNotification) {
        const notificationTitle = warning.type === 'missing_essential' 
          ? 'Zona esencial faltante'
          : warning.type === 'missing_translation'
          ? 'Traducción necesaria'
          : warning.type === 'missing_french'
          ? 'Traducción al francés necesaria'
          : warning.type === 'incomplete_steps'
          ? 'Pasos incompletos'
          : 'Problema en zona'

        const actionUrl = warning.zoneId 
          ? `/properties/${warning.propertyId}/zones/${warning.zoneId}`
          : `/properties/${warning.propertyId}/zones`

        addNotification({
          type: 'warning',
          title: notificationTitle,
          message: warning.message,
          propertyId: warning.propertyId,
          zoneId: warning.zoneId || undefined,
          read: false,
          actionUrl
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