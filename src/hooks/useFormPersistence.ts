'use client'

import { useEffect, useCallback, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'

interface UseFormPersistenceOptions {
  storageKey: string
  watch: () => any
  setValue: UseFormReturn<any>['setValue']
  reset: UseFormReturn<any>['reset']
  excludeFields?: string[]
  autoRestore?: boolean // NEW: Control if data should auto-restore (default: false)
}

export function useFormPersistence({
  storageKey,
  watch,
  setValue,
  reset,
  excludeFields = [],
  autoRestore = false // Default to NOT auto-restoring
}: UseFormPersistenceOptions) {
  const watchedValues = watch()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasCheckedForData, setHasCheckedForData] = useState(false)

  // Check for saved data on mount (but don't restore unless autoRestore is true)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const savedData = localStorage.getItem(storageKey)
        if (savedData && autoRestore) {
          const parsedData = JSON.parse(savedData)
          console.log('📥 Auto-restoring saved form data:', Object.keys(parsedData))

          // Only restore non-excluded fields
          Object.keys(parsedData).forEach(key => {
            if (!excludeFields.includes(key) && parsedData[key] !== undefined && parsedData[key] !== null) {
              setValue(key, parsedData[key])
            }
          })
          console.log('✅ Form data restored successfully')
        } else if (savedData) {
          console.log('📋 Saved data found but NOT auto-restoring (waiting for user action)')
        } else {
          console.log('ℹ️  No saved form data found')
        }
      } catch (error) {
        console.error('❌ Error checking saved form data:', error)
        localStorage.removeItem(storageKey)
      } finally {
        setIsInitialized(true)
        setHasCheckedForData(true)
      }
    }
  }, [storageKey, setValue, excludeFields, isInitialized, autoRestore])

  // Save data to localStorage whenever form values change (with debounce)
  useEffect(() => {
    if (typeof window !== 'undefined' && watchedValues && isInitialized) {
      setIsSaving(true)

      const timeoutId = setTimeout(() => {
        try {
          const defaultValues = {
            'country': 'España',
            'hostContactLanguage': 'es',
            'type': 'APARTMENT'
          }

          const significantFields = [
            'name', 'description', 'street', 'city', 'state', 'postalCode',
            'bedrooms', 'bathrooms', 'maxGuests', 'squareMeters', 'profileImage',
            'hostContactName', 'hostContactPhone', 'hostContactEmail', 'hostContactPhoto',
            'checkInInstructions', 'checkOutInstructions', 'houseRules',
            'wifiName', 'wifiPassword'
          ]

          const dataToSave = Object.keys(watchedValues).reduce((acc, key) => {
            const value = watchedValues[key]
            if (!excludeFields.includes(key) && value !== undefined && value !== null && (typeof value === 'number' || value !== '')) {
              acc[key] = value
            }
            return acc
          }, {} as Record<string, any>)

          const hasMeaningfulData = Object.keys(dataToSave).some(key => {
            const value = dataToSave[key]
            const defaultValue = defaultValues[key as keyof typeof defaultValues]

            if (significantFields.includes(key)) {
              return value !== null && value !== undefined && value !== ''
            }

            if (defaultValue !== undefined) {
              return value !== defaultValue
            }

            return false
          })

          if (Object.keys(dataToSave).length > 0 && hasMeaningfulData) {
            const currentSaved = localStorage.getItem(storageKey)
            const newData = JSON.stringify(dataToSave)

            if (currentSaved !== newData) {
              localStorage.setItem(storageKey, newData)
              const now = new Date()
              setLastSaved(now)
              localStorage.setItem(`${storageKey}_timestamp`, now.toISOString())
              console.log('✅ Form data saved to localStorage:', Object.keys(dataToSave))
            }
          } else {
            localStorage.removeItem(storageKey)
            localStorage.removeItem(`${storageKey}_timestamp`)
            console.log('🧹 No meaningful data, cleared localStorage')
          }
        } catch (error) {
          console.error('❌ Error saving form data:', error)
        } finally {
          setIsSaving(false)
        }
      }, 800)

      return () => {
        clearTimeout(timeoutId)
        setIsSaving(false)
      }
    }
  }, [watchedValues, storageKey, excludeFields, isInitialized])

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(`${storageKey}_timestamp`)
      console.log('🗑️ Cleared saved data from localStorage')
    }
  }, [storageKey])

  // NEW: Manually restore saved data (called when user clicks "Continue")
  const restoreSavedData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(storageKey)
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          console.log('📥 Manually restoring saved form data:', Object.keys(parsedData))

          Object.keys(parsedData).forEach(key => {
            if (!excludeFields.includes(key) && parsedData[key] !== undefined && parsedData[key] !== null) {
              setValue(key, parsedData[key])
            }
          })
          console.log('✅ Form data restored successfully')
          return true
        }
      } catch (error) {
        console.error('❌ Error restoring saved form data:', error)
      }
    }
    return false
  }, [storageKey, setValue, excludeFields])

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

          const significantFields = [
            'name', 'description', 'street', 'city', 'state', 'postalCode',
            'bedrooms', 'bathrooms', 'maxGuests', 'squareMeters', 'profileImage',
            'hostContactName', 'hostContactPhone', 'hostContactEmail', 'hostContactPhoto',
            'checkInInstructions', 'checkOutInstructions', 'houseRules',
            'wifiName', 'wifiPassword'
          ]

          const defaultValues = {
            'country': 'España',
            'hostContactLanguage': 'es',
            'type': 'APARTMENT'
          }

          const hasMeaningfulData = Object.keys(parsedData).some(key => {
            const value = parsedData[key]
            const defaultValue = defaultValues[key as keyof typeof defaultValues]

            if (significantFields.includes(key)) {
              const hasRealValue = value !== null && value !== undefined && value !== ''
              return hasRealValue
            }

            if (defaultValue !== undefined) {
              return value !== defaultValue
            }

            return false
          })

          console.log('📊 Saved data check:', {
            keys: Object.keys(parsedData),
            hasMeaningfulData
          })

          if (!hasMeaningfulData) {
            console.log('🧹 No meaningful data found, cleaning up localStorage')
            localStorage.removeItem(storageKey)
            localStorage.removeItem(`${storageKey}_timestamp`)
          }

          return {
            data: parsedData,
            timestamp: timestamp ? new Date(timestamp) : null,
            hasData: hasMeaningfulData
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
    restoreSavedData, // NEW: Function to manually restore data
    hasSavedData,
    getSavedDataInfo,
    lastSaved,
    isSaving,
    hasCheckedForData
  }
}
