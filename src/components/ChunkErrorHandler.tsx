'use client'

import { useEffect } from 'react'

// Session storage key to prevent reload loops
const RELOAD_COUNT_KEY = 'chunkErrorReloadCount'
const RELOAD_TIMESTAMP_KEY = 'chunkErrorReloadTimestamp'
const MAX_RELOADS = 2
const RELOAD_WINDOW_MS = 30000 // 30 seconds

export function ChunkErrorHandler() {
  useEffect(() => {
    // Check if we should allow a reload (prevent infinite loops)
    const canReload = () => {
      try {
        const countStr = sessionStorage.getItem(RELOAD_COUNT_KEY) || '0'
        const timestampStr = sessionStorage.getItem(RELOAD_TIMESTAMP_KEY) || '0'
        const count = parseInt(countStr, 10)
        const timestamp = parseInt(timestampStr, 10)
        const now = Date.now()

        // Reset count if outside the time window
        if (now - timestamp > RELOAD_WINDOW_MS) {
          sessionStorage.setItem(RELOAD_COUNT_KEY, '1')
          sessionStorage.setItem(RELOAD_TIMESTAMP_KEY, now.toString())
          return true
        }

        // Check if we've exceeded max reloads
        if (count >= MAX_RELOADS) {
          console.warn('⚠️ Max reload attempts reached, not reloading')
          return false
        }

        // Increment count
        sessionStorage.setItem(RELOAD_COUNT_KEY, (count + 1).toString())
        return true
      } catch {
        // If sessionStorage fails, allow reload but only once
        return true
      }
    }

    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || ''
      const errorName = event.error?.name || ''

      const isChunkError =
        errorName === 'ChunkLoadError' ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('Failed to fetch dynamically imported module')

      // Don't auto-reload for appendChild errors - just log them
      // These are usually tracking script issues that don't break the app
      const isScriptError =
        errorMessage.includes('appendChild') ||
        errorMessage.includes('Invalid or unexpected token')

      if (isScriptError) {
        console.warn('⚠️ Script loading error detected (not reloading):', errorMessage)
        // Prevent the error from bubbling up and breaking React
        event.preventDefault?.()
        return
      }

      if (isChunkError) {
        console.log('⚠️ Chunk loading error detected')

        if (!canReload()) {
          console.warn('⚠️ Skipping reload due to recent reload attempts')
          return
        }

        console.log('⚠️ Clearing cache and reloading...')

        // Clear any service worker cache
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => registration.unregister())
          })
        }

        // Clear cache and reload
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name))
          })
        }

        // Force hard reload after a small delay
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    }

    window.addEventListener('error', handleError)

    // Also handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message = reason?.message || String(reason)

      if (reason?.name === 'ChunkLoadError' ||
          message.includes('Loading chunk') ||
          message.includes('Failed to fetch dynamically imported module')) {
        console.log('⚠️ Chunk loading error in promise')
        event.preventDefault()

        if (canReload()) {
          window.location.reload()
        }
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)

    // Clear reload count on successful page load
    const clearReloadCount = () => {
      setTimeout(() => {
        try {
          sessionStorage.removeItem(RELOAD_COUNT_KEY)
          sessionStorage.removeItem(RELOAD_TIMESTAMP_KEY)
        } catch {
          // Ignore
        }
      }, 5000) // Clear after 5 seconds of successful load
    }
    clearReloadCount()

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}