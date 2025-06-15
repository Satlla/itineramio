'use client'

import React, { useState, useEffect } from 'react'
import { ZoneInspirationCard } from './ZoneInspirationCard'
import { 
  InspirationZone, 
  UserInspirationState, 
  getNextInspiration, 
  hasAllEssentialZones 
} from '../../data/zoneInspiration'

interface ZoneInspirationManagerProps {
  propertyId: string
  existingZoneNames: string[]
  onCreateZone: (inspiration: InspirationZone) => void
  userId: string
}

export function ZoneInspirationManager({
  propertyId,
  existingZoneNames,
  onCreateZone,
  userId
}: ZoneInspirationManagerProps) {
  const [userState, setUserState] = useState<UserInspirationState>({
    userId,
    dismissedZones: [],
    createdZones: [],
    showInspirations: true
  })
  const [currentInspiration, setCurrentInspiration] = useState<InspirationZone | null>(null)
  const [showCard, setShowCard] = useState(false)

  // Load user inspiration state from localStorage and API
  useEffect(() => {
    const loadUserState = async () => {
      try {
        // First check localStorage for immediate state
        const localState = localStorage.getItem(`inspiration_state_${userId}`)
        if (localState) {
          const parsed = JSON.parse(localState)
          setUserState(parsed)
        }

        // Then sync with server
        const response = await fetch(`/api/users/${userId}/inspiration-state`)
        if (response.ok) {
          const serverState = await response.json()
          setUserState(serverState.data)
          localStorage.setItem(`inspiration_state_${userId}`, JSON.stringify(serverState.data))
        }
      } catch (error) {
        console.error('Error loading user inspiration state:', error)
      }
    }

    loadUserState()
  }, [userId])

  // Check if should show inspiration
  useEffect(() => {
    if (!userState.showInspirations) return
    if (!hasAllEssentialZones(existingZoneNames)) return

    const inspiration = getNextInspiration(userState, existingZoneNames)
    if (inspiration) {
      setCurrentInspiration(inspiration)
      setShowCard(true)
    }
  }, [userState, existingZoneNames])

  // Save state to localStorage and server
  const saveUserState = async (newState: UserInspirationState) => {
    setUserState(newState)
    localStorage.setItem(`inspiration_state_${userId}`, JSON.stringify(newState))
    
    try {
      await fetch(`/api/users/${userId}/inspiration-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState)
      })
    } catch (error) {
      console.error('Error saving user inspiration state:', error)
    }
  }

  const handleDismissInspiration = () => {
    if (!currentInspiration) return

    const newState = {
      ...userState,
      dismissedZones: [...userState.dismissedZones, currentInspiration.id]
    }
    saveUserState(newState)
    setShowCard(false)
    setCurrentInspiration(null)
  }

  const handleDisableInspirations = async () => {
    const newState = {
      ...userState,
      showInspirations: false
    }
    saveUserState(newState)
    setShowCard(false)
    setCurrentInspiration(null)
  }

  const handleCreateZone = () => {
    if (!currentInspiration) return

    onCreateZone(currentInspiration)
    
    const newState = {
      ...userState,
      createdZones: [...userState.createdZones, currentInspiration.id]
    }
    saveUserState(newState)
    setShowCard(false)
    setCurrentInspiration(null)
  }

  const handleViewExamples = () => {
    // Open modal with detailed examples and tips
    // This could be implemented as a separate modal component
    console.log('View examples for:', currentInspiration?.name)
  }

  // Don't render if user has disabled inspirations or doesn't have essential zones
  if (!userState.showInspirations || !hasAllEssentialZones(existingZoneNames)) {
    return null
  }

  return (
    <>
      {currentInspiration && (
        <div className="mb-6">
          <ZoneInspirationCard
            inspiration={currentInspiration}
            onDismiss={handleDismissInspiration}
            onCreateZone={handleCreateZone}
            onViewExamples={handleViewExamples}
            isVisible={showCard}
          />
          
          {/* Option to disable all inspirations */}
          <div className="mt-2 text-center">
            <button
              onClick={handleDisableInspirations}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              No mostrar más sugerencias
            </button>
          </div>
        </div>
      )}
    </>
  )
}