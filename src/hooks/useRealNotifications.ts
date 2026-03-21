'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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
let globalLastFetchedAt = 0
let listeners: Set<() => void> = new Set()

const STALE_TIME_MS = 30_000 // 30 seconds

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners() {
  listeners.forEach(listener => listener())
}

async function fetchNotificationsGlobal(force = false) {
  if (globalIsFetching) return

  const now = Date.now()
  const isStale = now - globalLastFetchedAt > STALE_TIME_MS

  if (globalHasFetched && !force && !isStale) return

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
      globalLastFetchedAt = Date.now()
    }
  } catch {
    // silent
  } finally {
    globalLoading = false
    globalIsFetching = false
    notifyListeners()
  }
}

function mergeNewNotifications(incoming: any[]) {
  const existingIds = new Set(globalNotifications.map(n => n.id))
  const newOnes = incoming
    .filter(n => !existingIds.has(n.id))
    .map(n => ({ ...n, createdAt: new Date(n.createdAt) }))

  if (newOnes.length > 0) {
    globalNotifications = [...newOnes, ...globalNotifications]
    notifyListeners()
  }
}

export function useRealNotifications() {
  const [, forceUpdate] = useState({})
  const sseRef = useRef<EventSource | null>(null)

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = subscribe(() => forceUpdate({}))
    return () => { unsubscribe() }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchNotificationsGlobal()
  }, [])

  // SSE connection for real-time updates
  useEffect(() => {
    // Only one SSE connection globally
    if (sseRef.current) return
    if (typeof window === 'undefined') return

    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    let retries = 0
    const MAX_RETRIES = 3

    function connect() {
      const sse = new EventSource('/api/notifications/sse')
      sseRef.current = sse

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'connected') {
            retries = 0
            // If unread count differs from our state, refetch
            const currentUnread = globalNotifications.filter(n => !n.read).length
            if (data.unreadCount !== currentUnread) {
              fetchNotificationsGlobal(true)
            }
          } else if (data.type === 'new_notifications' && data.notifications?.length > 0) {
            mergeNewNotifications(data.notifications)
          }
          // 'ping' events are silently ignored
        } catch {
          // Ignore parse errors
        }
      }

      sse.onerror = () => {
        sse.close()
        sseRef.current = null

        if (retries < MAX_RETRIES) {
          retries++
          const delay = Math.min(1000 * 2 ** retries, 30_000)
          retryTimeout = setTimeout(connect, delay)
        }
        // After max retries, fall back to polling via the global stale-while-revalidate
      }
    }

    connect()

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }
    }
  }, [])

  const notifications = globalNotifications
  const loading = globalLoading

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        globalNotifications = globalNotifications.map(n =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
        notifyListeners()
      }
    } catch {
      // silent
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })

      if (response.ok) {
        globalNotifications = globalNotifications.map(n => ({ ...n, read: true }))
        notifyListeners()
      }
    } catch {
      // silent
    }
  }, [])

  const refreshNotifications = useCallback(() => {
    fetchNotificationsGlobal(true)
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
