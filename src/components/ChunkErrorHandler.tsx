'use client'

import { useEffect } from 'react'

export function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.name === 'ChunkLoadError' ||
          event.error?.message?.includes('Loading chunk') ||
          event.error?.message?.includes('Failed to fetch dynamically imported module') ||
          event.error?.message?.includes('appendChild') ||
          event.error?.message?.includes('Invalid or unexpected token')) {
        console.log('⚠️ Chunk/script loading error detected, refreshing page...')
        
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
      if (event.reason?.name === 'ChunkLoadError' || 
          event.reason?.message?.includes('Loading chunk') ||
          event.reason?.message?.includes('Failed to fetch dynamically imported module')) {
        console.log('⚠️ Chunk loading error in promise, refreshing page...')
        event.preventDefault()
        window.location.reload()
      }
    }
    
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}