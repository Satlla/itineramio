'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingContextType {
  isOnboarding: boolean
  currentStep: string | null
  showSpotlight: boolean
  spotlightTarget: string | null
  startOnboarding: () => void
  nextStep: (step: string) => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  setSpotlight: (show: boolean, target?: string | null) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [showSpotlight, setShowSpotlight] = useState(false)
  const [spotlightTarget, setSpotlightTarget] = useState<string | null>(null)
  const router = useRouter()

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const onboardingState = localStorage.getItem('onboardingState')
      if (onboardingState) {
        const state = JSON.parse(onboardingState)
        setIsOnboarding(state.isActive)
        setCurrentStep(state.currentStep)
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error)
      localStorage.removeItem('onboardingState')
    }
  }, [])

  const saveState = (isActive: boolean, step: string | null) => {
    localStorage.setItem('onboardingState', JSON.stringify({
      isActive,
      currentStep: step
    }))
  }

  const startOnboarding = () => {
    setIsOnboarding(true)
    setCurrentStep('create-property')
    saveState(true, 'create-property')
    router.push('/properties/new?onboarding=true')
  }

  const nextStep = (step: string) => {
    setCurrentStep(step)
    saveState(true, step)
  }

  const skipOnboarding = () => {
    setIsOnboarding(false)
    setCurrentStep(null)
    setShowSpotlight(false)
    setSpotlightTarget(null)
    localStorage.removeItem('onboardingState')
    localStorage.setItem('hasSeenFirstPropertyOnboarding', 'true')
  }

  const setSpotlight = (show: boolean, target?: string | null) => {
    setShowSpotlight(show)
    setSpotlightTarget(target || null)
  }

  const completeOnboarding = async () => {
    setIsOnboarding(false)
    setCurrentStep(null)
    localStorage.removeItem('onboardingState')
    localStorage.setItem('hasSeenFirstPropertyOnboarding', 'true')

    // Mark as completed in database
    try {
      await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStep,
        showSpotlight,
        spotlightTarget,
        startOnboarding,
        nextStep,
        skipOnboarding,
        completeOnboarding,
        setSpotlight
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
