'use client'

import { useState, useEffect, useCallback } from 'react'

interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error' | 'evaluation'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

export function useRealNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      const result = await response.json()
      
      if (result.success) {
        // Convert string dates to Date objects
        const notificationsData = result.notifications || result.data || []
        const notificationsWithDates = notificationsData.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }))
        setNotifications(notificationsWithDates)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Mark specific notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, read: true } : n
          )
        )
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [])

  // Refresh notifications (useful after actions that might create new ones)
  const refreshNotifications = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  }
}