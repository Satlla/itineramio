import { useEffect, useRef } from 'react'

interface ViewTrackingOptions {
  enabled?: boolean
  threshold?: number // percentage of element visible to trigger tracking
  timeThreshold?: number // minimum time spent before tracking
}

export const usePropertyViewTracking = (
  propertyId: string | null,
  options: ViewTrackingOptions = {}
) => {
  const { enabled = true, timeThreshold = 3000 } = options
  const tracked = useRef(false)
  const startTime = useRef<number>()

  useEffect(() => {
    if (!propertyId || !enabled || tracked.current) return

    // Record start time
    startTime.current = Date.now()

    // Set up tracking after minimum time threshold
    const timeoutId = setTimeout(() => {
      if (!tracked.current) {
        trackPropertyView(propertyId)
        tracked.current = true
      }
    }, timeThreshold)

    // Track on page unload
    const handleUnload = () => {
      if (!tracked.current) {
        trackPropertyView(propertyId)
        tracked.current = true
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [propertyId, enabled, timeThreshold])
}

export const useZoneViewTracking = (
  propertyId: string | null,
  zoneId: string | null,
  options: ViewTrackingOptions = {}
) => {
  const { enabled = true, threshold = 50, timeThreshold = 2000 } = options
  const tracked = useRef(false)
  const startTime = useRef<number>()
  const observer = useRef<IntersectionObserver>()

  useEffect(() => {
    if (!propertyId || !zoneId || !enabled || tracked.current) return

    startTime.current = Date.now()

    // Set up intersection observer for zone visibility
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold / 100) {
            // Zone is visible, start tracking after time threshold
            setTimeout(() => {
              if (!tracked.current && entry.isIntersecting) {
                const timeSpent = startTime.current ? 
                  Math.round((Date.now() - startTime.current) / 1000) : 0
                trackZoneView(propertyId, zoneId, timeSpent)
                tracked.current = true
              }
            }, timeThreshold)
          }
        })
      },
      {
        threshold: threshold / 100,
        rootMargin: '-50px'
      }
    )

    // Find zone element and observe it
    const zoneElement = document.querySelector(`[data-zone-id="${zoneId}"]`)
    if (zoneElement) {
      observer.current.observe(zoneElement)
    }

    // Fallback: track on page unload if zone was visible
    const handleUnload = () => {
      if (!tracked.current && zoneElement) {
        const rect = zoneElement.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0
        if (isVisible) {
          const timeSpent = startTime.current ? 
            Math.round((Date.now() - startTime.current) / 1000) : 0
          trackZoneView(propertyId, zoneId, timeSpent)
          tracked.current = true
        }
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [propertyId, zoneId, enabled, threshold, timeThreshold])
}

// Helper functions for API calls
const trackPropertyView = async (propertyId: string) => {
  try {
    const viewData = {
      referrer: document.referrer || null,
      language: navigator.language || 'es',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenWidth: screen.width,
      screenHeight: screen.height
    }

    await fetch(`/api/properties/${propertyId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewData)
    })
  } catch (error) {
    console.error('Error tracking property view:', error)
  }
}

const trackZoneView = async (propertyId: string, zoneId: string, timeSpent: number) => {
  try {
    const viewData = {
      referrer: document.referrer || null,
      language: navigator.language || 'es',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenWidth: screen.width,
      screenHeight: screen.height,
      timeSpent
    }

    await fetch(`/api/properties/${propertyId}/zones/${zoneId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewData)
    })
  } catch (error) {
    console.error('Error tracking zone view:', error)
  }
}

export default {
  usePropertyViewTracking,
  useZoneViewTracking
}