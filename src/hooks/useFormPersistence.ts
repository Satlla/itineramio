'use client'

import { useEffect, useCallback, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'

interface UseFormPersistenceOptions {
  storageKey: string
  watch: () => any
  setValue: UseFormReturn<any>['setValue']
  reset: UseFormReturn<any>['reset']
  excludeFields?: string[]
}

export function useFormPersistence({
  storageKey,
  watch,
  setValue,
  reset,
  excludeFields = []
}: UseFormPersistenceOptions) {
  const watchedValues = watch()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load data from localStorage on component mount (only once)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const savedData = localStorage.getItem(storageKey)
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          
          // Only restore non-excluded fields
          Object.keys(parsedData).forEach(key => {
            if (!excludeFields.includes(key) && parsedData[key] !== undefined && parsedData[key] !== null) {
              setValue(key, parsedData[key])
            }
          })
        }
      } catch (error) {
        console.error('Error loading saved form data:', error)
        // If there's an error, remove the corrupted data
        localStorage.removeItem(storageKey)
      } finally {
        setIsInitialized(true)
      }
    }
  }, [storageKey, setValue, excludeFields, isInitialized])

  // Save data to localStorage whenever form values change (with debounce)
  useEffect(() => {
    if (typeof window !== 'undefined' && watchedValues && isInitialized) {
      const timeoutId = setTimeout(() => {
        try {
          // Filter out excluded fields and empty values
          const dataToSave = Object.keys(watchedValues).reduce((acc, key) => {
            const value = watchedValues[key]
            if (!excludeFields.includes(key) && value !== undefined && value !== null && value !== '') {
              acc[key] = value
            }
            return acc
          }, {} as Record<string, any>)

          // Only save if there's actual data and it's different from what's saved
          if (Object.keys(dataToSave).length > 0) {
            const currentSaved = localStorage.getItem(storageKey)
            const newData = JSON.stringify(dataToSave)
            
            if (currentSaved !== newData) {
              localStorage.setItem(storageKey, newData)
              const now = new Date()
              setLastSaved(now)
              localStorage.setItem(`${storageKey}_timestamp`, now.toISOString())
            }
          }
        } catch (error) {
          console.error('Error saving form data:', error)
        }
      }, 500) // 500ms debounce

      return () => clearTimeout(timeoutId)
    }
  }, [watchedValues, storageKey, excludeFields, isInitialized])

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  // Check if there's saved data
  const hasSavedData = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(storageKey)
      return savedData !== null && savedData !== undefined
    }
    return false
  }, [storageKey])

  // Get saved data info for display
  const getSavedDataInfo = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(storageKey)
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          const timestamp = localStorage.getItem(`${storageKey}_timestamp`)
          
          return {
            data: parsedData,
            timestamp: timestamp ? new Date(timestamp) : null,
            hasData: Object.keys(parsedData).length > 0
          }
        }
      } catch (error) {
        console.error('Error getting saved data info:', error)
      }
    }
    return { data: null, timestamp: null, hasData: false }
  }, [storageKey])


  return {
    clearSavedData,
    hasSavedData,
    getSavedDataInfo,
    lastSaved
  }
}