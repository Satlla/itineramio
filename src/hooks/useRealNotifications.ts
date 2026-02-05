'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'

interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error' | 'evaluation'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

// Global singleton state to prevent duplicate fetches across component instances
let globalNotifications: Notification[] = []
let globalLoading = true
let globalHasFetched = false
let globalIsFetching = false
let listeners: Set<() => void> = new Set()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return { notifications: globalNotifications, loading: globalLoading }
}

function notifyListeners() {
  listeners.forEach(listener => listener())
}

async function fetchNotificationsGlobal(force = false) {
  // Guard against duplicate calls (global singleton)
  if (globalIsFetching) return
  if (globalHasFetched && !force) return

  globalIsFetching = true

  try {
    const response = await fetch('/api/notifications')
    const result = await response.json()

    if (result.success) {
      const notificationsData = result.notifications || result.data || []
      globalNotifications = notificationsData.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }))
      globalHasFetched = true
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    globalLoading = false
    globalIsFetching = false
    notifyListeners()
  }
}

export function useRealNotifications() {
  const [, forceUpdate] = useState({})

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = subscribe(() => forceUpdate({}))
    return unsubscribe
  }, [])

  // Trigger fetch on mount (uses global guard)
  useEffect(() => {
    fetchNotificationsGlobal()
  }, [])

  const notifications = globalNotifications
  const loading = globalLoading

  // Mark specific notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        // Update global state
        globalNotifications = globalNotifications.map(n =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
        notifyListeners()
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
        // Update global state
        globalNotifications = globalNotifications.map(n => ({ ...n, read: true }))
        notifyListeners()
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [])

  // Refresh notifications (useful after actions that might create new ones)
  const refreshNotifications = useCallback(() => {
    fetchNotificationsGlobal(true) // force=true to bypass guard
  }, [])

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