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
  maxCards?: number
  horizontal?: boolean
}

export function ZoneInspirationManager({
  propertyId,
  existingZoneNames,
  onCreateZone,
  userId,
  maxCards = 1,
  horizontal = false
}: ZoneInspirationManagerProps) {
  const [userState, setUserState] = useState<UserInspirationState>({
    userId,
    dismissedZones: [],
    createdZones: [],
    showInspirations: true
  })
  const [currentInspirations, setCurrentInspirations] = useState<InspirationZone[]>([])
  const [showCards, setShowCards] = useState(false)

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

    const inspirations: InspirationZone[] = []
    let currentState = userState
    
    for (let i = 0; i < maxCards; i++) {
      const inspiration = getNextInspiration(currentState, existingZoneNames)
      if (inspiration && !inspirations.find(insp => insp.id === inspiration.id)) {
        inspirations.push(inspiration)
        // Temporarily mark as dismissed to get next different one
        currentState = {
          ...currentState,
          dismissedZones: [...currentState.dismissedZones, inspiration.id]
        }
      }
    }
    
    if (inspirations.length > 0) {
      setCurrentInspirations(inspirations)
      setShowCards(true)
    }
  }, [userState, existingZoneNames, maxCards])

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

  const handleDismissInspiration = (inspirationId: string) => {
    const newState = {
      ...userState,
      dismissedZones: [...userState.dismissedZones, inspirationId]
    }
    saveUserState(newState)
    
    // Remove from current inspirations
    const updatedInspirations = currentInspirations.filter(insp => insp.id !== inspirationId)
    setCurrentInspirations(updatedInspirations)
    
    if (updatedInspirations.length === 0) {
      setShowCards(false)
    }
  }

  const handleDisableInspirations = async () => {
    const newState = {
      ...userState,
      showInspirations: false
    }
    saveUserState(newState)
    setShowCards(false)
    setCurrentInspirations([])
  }

  const handleCreateZone = (inspiration: InspirationZone) => {
    onCreateZone(inspiration)
    
    const newState = {
      ...userState,
      createdZones: [...userState.createdZones, inspiration.id]
    }
    saveUserState(newState)
    
    // Remove from current inspirations
    const updatedInspirations = currentInspirations.filter(insp => insp.id !== inspiration.id)
    setCurrentInspirations(updatedInspirations)
    
    if (updatedInspirations.length === 0) {
      setShowCards(false)
    }
  }

  const handleViewExamples = (inspiration: InspirationZone) => {
    // Open modal with detailed examples and tips
    // This could be implemented as a separate modal component
    console.log('View examples for:', inspiration?.name)
  }

  // Don't render if user has disabled inspirations or doesn't have essential zones
  if (!userState.showInspirations || !hasAllEssentialZones(existingZoneNames)) {
    return horizontal ? <></> : null
  }

  return (
    <>
      {currentInspirations.length > 0 && (
        <div className={horizontal ? "contents" : "mb-6"}>
          {horizontal ? (
            // Horizontal layout - each card in its own grid cell
            currentInspirations.map((inspiration, index) => (
              <div key={inspiration.id} className="">
                <ZoneInspirationCard
                  inspiration={inspiration}
                  onDismiss={() => handleDismissInspiration(inspiration.id)}
                  onCreateZone={() => handleCreateZone(inspiration)}
                  onViewExamples={() => handleViewExamples(inspiration)}
                  isVisible={showCards}
                  compact={true}
                />
              </div>
            ))
          ) : (
            // Vertical layout - single card
            <ZoneInspirationCard
              inspiration={currentInspirations[0]}
              onDismiss={() => handleDismissInspiration(currentInspirations[0].id)}
              onCreateZone={() => handleCreateZone(currentInspirations[0])}
              onViewExamples={() => handleViewExamples(currentInspirations[0])}
              isVisible={showCards}
            />
          )}
          
          {/* Option to disable all inspirations */}
          {!horizontal && (
            <div className="mt-2 text-center">
              <button
                onClick={handleDisableInspirations}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                No mostrar más sugerencias
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Global disable button for horizontal layout */}
      {horizontal && currentInspirations.length > 0 && (
        <div className="col-span-full mt-4 text-center">
          <button
            onClick={handleDisableInspirations}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            No mostrar más sugerencias de zonas
          </button>
        </div>
      )}
    </>
  )
}