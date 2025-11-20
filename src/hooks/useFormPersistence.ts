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
  const [isSaving, setIsSaving] = useState(false)

  // Load data from localStorage on component mount (only once)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const savedData = localStorage.getItem(storageKey)
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          console.log('📥 Loading saved form data:', Object.keys(parsedData))

          // Only restore non-excluded fields
          Object.keys(parsedData).forEach(key => {
            if (!excludeFields.includes(key) && parsedData[key] !== undefined && parsedData[key] !== null) {
              setValue(key, parsedData[key])
            }
          })
          console.log('✅ Form data restored successfully')
        } else {
          console.log('ℹ️  No saved form data found')
        }
      } catch (error) {
        console.error('❌ Error loading saved form data:', error)
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
      // Set saving state immediately when values change
      setIsSaving(true)

      const timeoutId = setTimeout(() => {
        try {
          // Default values that don't count as "real data"
          const defaultValues = {
            'country': 'España',
            'hostContactLanguage': 'es',
            'type': 'APARTMENT'
          }

          // Fields that indicate real user input
          const significantFields = [
            'name', 'description', 'street', 'city', 'state', 'postalCode',
            'bedrooms', 'bathrooms', 'maxGuests', 'squareMeters', 'profileImage',
            'hostContactName', 'hostContactPhone', 'hostContactEmail', 'hostContactPhoto',
            'checkInInstructions', 'checkOutInstructions', 'houseRules',
            'wifiName', 'wifiPassword'
          ]

          // Filter out excluded fields and empty values (keep 0 for numbers)
          const dataToSave = Object.keys(watchedValues).reduce((acc, key) => {
            const value = watchedValues[key]
            // Keep value if it's not undefined/null, and either it's a number (including 0) or non-empty string
            if (!excludeFields.includes(key) && value !== undefined && value !== null && (typeof value === 'number' || value !== '')) {
              acc[key] = value
            }
            return acc
          }, {} as Record<string, any>)

          // Check if we have any meaningful data beyond defaults
          const hasMeaningfulData = Object.keys(dataToSave).some(key => {
            const value = dataToSave[key]
            const defaultValue = defaultValues[key as keyof typeof defaultValues]

            // If it's a significant field with a REAL value (not null/undefined/empty), it's meaningful
            if (significantFields.includes(key)) {
              return value !== null && value !== undefined && value !== ''
            }

            // If it's a default field, only meaningful if different from default
            if (defaultValue !== undefined) {
              return value !== defaultValue
            }

            // Other fields are not considered meaningful by themselves
            return false
          })

          // Only save if there's actual meaningful data
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
            // If there's no meaningful data, remove any saved data
            localStorage.removeItem(storageKey)
            localStorage.removeItem(`${storageKey}_timestamp`)
            console.log('🧹 No meaningful data, cleared localStorage')
          }
        } catch (error) {
          console.error('❌ Error saving form data:', error)
        } finally {
          // Always clear saving state after save attempt
          setIsSaving(false)
        }
      }, 800) // 800ms debounce - balance between responsiveness and performance

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

          // Same logic as when saving - check for significant fields
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

          // Check if there's meaningful data
          const hasMeaningfulData = Object.keys(parsedData).some(key => {
            const value = parsedData[key]
            const defaultValue = defaultValues[key as keyof typeof defaultValues]

            // If it's a significant field with a REAL value (not null/undefined/empty), it's meaningful
            if (significantFields.includes(key)) {
              const hasRealValue = value !== null && value !== undefined && value !== ''
              if (hasRealValue) {
                console.log(`✅ Found significant field with real value: ${key} = ${value}`)
                return true
              } else {
                console.log(`❌ Significant field but no real value: ${key} = ${value}`)
                return false
              }
            }

            // If it's a default field, only meaningful if different from default
            if (defaultValue !== undefined) {
              return value !== defaultValue
            }

            return false
          })

          console.log('📊 Saved data check:', {
            keys: Object.keys(parsedData),
            hasMeaningfulData,
            parsedData
          })

          // If no meaningful data, clean up localStorage
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
    hasSavedData,
    getSavedDataInfo,
    lastSaved,
    isSaving
  }
}