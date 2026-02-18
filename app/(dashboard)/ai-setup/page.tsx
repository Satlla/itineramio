'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/providers/AuthProvider'
import Step1Address, { type Step1Data } from './components/Step1Address'
import Step2Details, { type Step2Data } from './components/Step2Details'
import Step3Media, { type MediaItem } from './components/Step2Media'
import Step4Review, { type LocationData } from './components/Step4Review'
import Step5Generate from './components/Step3Generate'

const STEPS = [
  { label: 'Propiedad', number: 1 },
  { label: 'Detalles', number: 2 },
  { label: 'Media', number: 3 },
  { label: 'Revisar', number: 4 },
  { label: 'Generar', number: 5 },
]

const STORAGE_KEY = 'itineramio-ai-setup-draft'

let _cachedDraft: any = undefined
function loadDraft() {
  if (typeof window === 'undefined') return null
  if (_cachedDraft !== undefined) return _cachedDraft
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    _cachedDraft = raw ? JSON.parse(raw) : null
  } catch {
    _cachedDraft = null
  }
  // Clear cache after initial render so future page loads re-read
  setTimeout(() => { _cachedDraft = undefined }, 0)
  return _cachedDraft
}

export default function AISetupPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [currentStep, setCurrentStepRaw] = useState(1)
  const setCurrentStep = (stepOrFn: number | ((prev: number) => number)) => {
    setCurrentStepRaw(stepOrFn)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  const defaultStep1: Step1Data = {
    propertyName: '',
    propertyDescription: '',
    profileImage: '',
    street: '',
    city: '',
    state: '',
    country: 'España',
    postalCode: '',
    formattedAddress: '',
    propertyType: 'APARTMENT',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    squareMeters: 0,
    wifiName: '',
    wifiPassword: '',
    checkInTime: '15:00',
    checkInMethod: 'lockbox',
    checkInInstructions: '',
    checkOutTime: '11:00',
    hasParking: 'no',
    hasPool: false,
    hasAC: false,
    hostContactName: user?.name || '',
    hostContactPhone: user?.phone || '',
    hostContactEmail: user?.email || '',
    hostContactLanguage: 'es',
    hostContactPhoto: '',
  }

  const defaultStep2: Step2Data = {
    lockboxCode: '',
    lockboxLocation: '',
    doorCode: '',
    codeChangesPerReservation: false,
    meetingPoint: '',
    latePlan: 'call',
    latePlanDetails: '',
    hotWaterType: 'instant',
    electricalPanelLocation: '',
    supportHoursFrom: '09:00',
    supportHoursTo: '22:00',
    emergencyPhone: '',
    recyclingContainerLocation: '',
    recommendations: '',
    parkingSpotNumber: '',
    parkingFloor: '',
    parkingAccess: 'remote',
    parkingAccessCode: '',
    checkoutInstructions: '',
    keyReturn: 'lockbox',
    keyReturnDetails: '',
    lateCheckout: 'no',
    lateCheckoutPrice: '',
    lateCheckoutUntil: '',
    luggageAfterCheckout: 'no',
    luggageUntil: '',
    luggageConsignaInfo: '',
    items: {
      iron: { has: false, location: '' },
      ironingBoard: { has: false, location: '' },
      hairdryer: { has: false, location: '' },
      firstAid: { has: false, location: '' },
      extraBlankets: { has: false, location: '' },
      broom: { has: false, location: '' },
    },
  }

  // Step 1 data
  const [step1Data, setStep1Data] = useState<Step1Data>(defaultStep1)

  // Step 2 data
  const [step2Data, setStep2Data] = useState<Step2Data>(defaultStep2)

  // Step 3 data — media items (URLs only, not blobs)
  const [media, setMedia] = useState<MediaItem[]>([])

  // Step 4: disabled zones and reviewed content from review
  const [disabledZones, setDisabledZones] = useState<Set<string>>(new Set())
  const [reviewedContent, setReviewedContent] = useState<Record<string, string>>({})

  // Location data (fetched when entering Step 4)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationDataLoading, setLocationDataLoading] = useState(false)

  // Restore draft from localStorage on mount (avoids hydration mismatch)
  useEffect(() => {
    const draft = loadDraft()
    if (!draft) return
    if (draft.currentStep > 1) setCurrentStepRaw(draft.currentStep)
    if (draft.step1Data) setStep1Data(draft.step1Data)
    if (draft.step2Data) setStep2Data(draft.step2Data)
    if (draft.media) setMedia(draft.media)
    if (draft.disabledZones) setDisabledZones(new Set(draft.disabledZones))
    if (draft.reviewedContent) setReviewedContent(draft.reviewedContent)
    // Only restore locationData if it has the new driving fields, otherwise re-fetch
    if (draft.locationData && draft.locationData.directions?.drivingFromAirport !== undefined) {
      setLocationData(draft.locationData)
    }
  }, [])

  // Save draft to localStorage on every change (skip step 5 = generation in progress)
  useEffect(() => {
    if (currentStep >= 5) return // Don't save once generation starts
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStep,
        step1Data,
        step2Data,
        media,
        disabledZones: [...disabledZones],
        reviewedContent,
        locationData,
      }))
    } catch {} // Ignore quota errors
  }, [currentStep, step1Data, step2Data, media, disabledZones, reviewedContent, locationData])

  // Clear draft when generation completes (user navigates away from step 5)
  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  // Fetch location data when entering Step 4
  useEffect(() => {
    if (currentStep !== 4) return
    if (locationData) return // Already fetched
    if (locationDataLoading) return
    if (!step1Data.lat || !step1Data.lng || !step1Data.city) return

    setLocationDataLoading(true)
    fetch('/api/ai-setup/location-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: step1Data.lat,
        lng: step1Data.lng,
        city: step1Data.city,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setLocationData(data.data)
        }
      })
      .catch(err => console.error('[ai-setup] Failed to fetch location data:', err))
      .finally(() => setLocationDataLoading(false))
  }, [currentStep, locationData, locationDataLoading, step1Data.lat, step1Data.lng, step1Data.city])

  // Warn before leaving with unsaved work (steps 1-4 only)
  useEffect(() => {
    const hasData = step1Data.propertyName || step1Data.street || media.length > 0
    if (!hasData || currentStep >= 5) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [step1Data.propertyName, step1Data.street, media.length, currentStep])

  // Build property data for generation
  const buildPropertyData = () => {
    return {
      // Step 1
      name: step1Data.propertyName,
      description: step1Data.propertyDescription || `${step1Data.propertyName} con ${step1Data.bedrooms} dormitorios y ${step1Data.bathrooms} baños`,
      profileImage: step1Data.profileImage,
      type: step1Data.propertyType,
      street: step1Data.street,
      city: step1Data.city,
      state: step1Data.state,
      country: step1Data.country,
      postalCode: step1Data.postalCode,
      lat: step1Data.lat || 0,
      lng: step1Data.lng || 0,
      bedrooms: step1Data.bedrooms,
      bathrooms: step1Data.bathrooms,
      maxGuests: step1Data.maxGuests,
      squareMeters: step1Data.squareMeters || undefined,
      wifiName: step1Data.wifiName,
      wifiPassword: step1Data.wifiPassword,
      checkInTime: step1Data.checkInTime,
      checkInMethod: step1Data.checkInMethod,
      checkInInstructions: step1Data.checkInInstructions,
      checkOutTime: step1Data.checkOutTime,
      hasParking: step1Data.hasParking,
      hasPool: step1Data.hasPool,
      hasAC: step1Data.hasAC,
      hostContactName: step1Data.hostContactName,
      hostContactPhone: step1Data.hostContactPhone,
      hostContactEmail: step1Data.hostContactEmail,
      hostContactLanguage: step1Data.hostContactLanguage,
      hostContactPhoto: step1Data.hostContactPhoto,
      // Step 2
      details: step2Data,
      // Step 4: disabled zones + reviewed content
      disabledZones: [...disabledZones],
      reviewedContent,
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/30 via-gray-950 to-purple-950/20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Top bar */}
        <div className="border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : router.push('/properties')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">
                {currentStep > 1 ? 'Paso anterior' : 'Mis propiedades'}
              </span>
            </button>

            {/* Logo / title */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
              <span className="text-white font-semibold text-sm sm:text-base">Creación con IA</span>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-1">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className={`flex items-center gap-0.5 ${
                    step.number === currentStep
                      ? 'text-white'
                      : step.number < currentStep
                      ? 'text-violet-400'
                      : 'text-gray-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                      step.number === currentStep
                        ? 'bg-violet-600 text-white'
                        : step.number < currentStep
                        ? 'bg-violet-600/30 text-violet-400'
                        : 'bg-gray-800 text-gray-600'
                    }`}
                  >
                    {step.number < currentStep ? '✓' : step.number}
                  </div>
                  <span className="text-[10px] hidden xl:inline">{step.label}</span>
                  {step.number < STEPS.length && (
                    <div className={`w-4 sm:w-5 h-px ${step.number < currentStep ? 'bg-violet-500' : 'bg-gray-700'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1Address
                key="step1"
                data={step1Data}
                onChange={setStep1Data}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <Step2Details
                key="step2"
                data={step2Data}
                onChange={setStep2Data}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
                checkInMethod={step1Data.checkInMethod}
                hasParking={step1Data.hasParking}
              />
            )}

            {currentStep === 3 && (
              <Step3Media
                key="step3"
                media={media}
                onMediaChange={setMedia}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <Step4Review
                key="step4"
                step1Data={step1Data}
                step2Data={step2Data}
                media={media}
                locationData={locationData}
                locationDataLoading={locationDataLoading}
                disabledZones={disabledZones}
                onDisabledZonesChange={setDisabledZones}
                reviewedContent={reviewedContent}
                onReviewedContentChange={setReviewedContent}
                onNext={() => setCurrentStep(5)}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && (
              <Step5Generate
                key="step5"
                propertyData={buildPropertyData()}
                mediaAnalysis={media}
                onComplete={clearDraft}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
