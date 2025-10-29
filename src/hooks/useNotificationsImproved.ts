'use client'

import { useState, useEffect, useCallback } from 'react'

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'evaluation'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

export function useNotificationsImproved() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, use localStorage fallback
          const stored = localStorage.getItem('itineramio_notifications')
          if (stored) {
            const parsed = JSON.parse(stored).map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt)
            }))
            setNotifications(parsed)
          }
          setLoading(false)
          return
        }
        throw new Error('Failed to fetch notifications')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        const formattedNotifications = result.data.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }))
        setNotifications(formattedNotifications)
        
        // Also save to localStorage as backup
        localStorage.setItem('itineramio_notifications', JSON.stringify(result.data))
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Error al cargar notificaciones')
      
      // Fallback to localStorage
      const stored = localStorage.getItem('itineramio_notifications')
      if (stored) {
        try {
          const parsed = JSON.parse(stored).map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          }))
          setNotifications(parsed)
        } catch (parseError) {
          console.error('Error parsing stored notifications:', parseError)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      })
    } catch (err) {
      console.error('Error marking notification as read:', err)
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      )
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    
    if (unreadIds.length === 0) return

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: unreadIds })
      })
    } catch (err) {
      console.error('Error marking all as read:', err)
      // Revert optimistic update on error
      fetchNotifications()
    }
  }, [notifications, fetchNotifications])

  // Add notification (client-side only, for immediate feedback)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `temp-${Date.now()}`,
      createdAt: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  // Poll for new notifications every 30 seconds (only if authenticated)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only poll if we previously got a successful response (not 401)
      if (!error || error !== 'Error al cargar notificaciones') {
        fetchNotifications()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchNotifications, error])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5)

  return {
    notifications,
    recentNotifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    addNotification,
    refresh: fetchNotifications
  }
}