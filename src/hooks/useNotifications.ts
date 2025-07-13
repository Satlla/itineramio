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
    // EMERGENCY DISABLED - React error #31 persists even with safety measures
    console.log('🚫 Notifications completely disabled to prevent React error #31:', notification)
    return
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
    // EMERGENCY DISABLED - React error #31 persists
    console.log('🚫 Zone warnings completely disabled to prevent React error #31')
    return
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