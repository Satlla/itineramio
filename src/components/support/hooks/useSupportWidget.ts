'use client'

import { useState, useEffect, useCallback } from 'react'

type TabType = 'chat' | 'articles' | 'updates'

export function useSupportWidget() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check auth via API (cookie is httpOnly, can't read from document.cookie)
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        setIsLoggedIn(res.ok)
      })
      .catch(() => {
        setIsLoggedIn(false)
      })
  }, [])

  // Auto-open on desktop after 2s (only once per session)
  useEffect(() => {
    if (hasAutoOpened) return
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768
    if (!isDesktop) return

    const alreadyDismissed = sessionStorage.getItem('support-widget-dismissed')
    if (alreadyDismissed) return

    const timer = setTimeout(() => {
      setOpen(true)
      setHasAutoOpened(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [hasAutoOpened])

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return

    try {
      const res = await fetch('/api/support/product-updates/unread-count', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch {
      // Silently fail - unread count is non-critical
    }
  }, [isLoggedIn])

  useEffect(() => {
    fetchUnreadCount()

    const interval = setInterval(fetchUnreadCount, 60_000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Re-fetch unread count after user opens Updates tab (IntersectionObserver marks items as read)
  useEffect(() => {
    if (activeTab !== 'updates') return
    const timer = setTimeout(fetchUnreadCount, 2000)
    return () => clearTimeout(timer)
  }, [activeTab, fetchUnreadCount])

  return {
    open,
    setOpen,
    activeTab,
    setActiveTab,
    unreadCount,
    isLoggedIn,
  }
}
