'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft, 
  Home, 
  Users, 
  Bed, 
  Bath, 
  Square, 
  Mail, 
  Phone,
  Save,
  Eye,
  User,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, ImageUpload, PropertyPreview, SavedDataBanner, AddressAutocomplete } from '../../../../src/components/ui'
import { InlineSpinner } from '../../../../src/components/ui/Spinner'
import { AutoSaveIndicator } from '../../../../src/components/ui/AutoSaveIndicator'
import { useFormPersistence } from '../../../../src/hooks/useFormPersistence'
import { TrialActivationModal } from '../../../../src/components/TrialActivationModal'
import { useAuth } from '../../../../src/providers/AuthProvider'
import { OnboardingPopup } from '../../../../src/components/ui/OnboardingPopup'
import { useOnboarding } from '../../../../src/contexts/OnboardingContext'
// PropertyType as string literal type
type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'VILLA'

// Helper function to safely get error message
const getErrorMessage = (error: any): string => {
  if (!error?.message) return ''
  if (typeof error.message === 'string') return error.message
  if (typeof error.message === 'object' && error.message.es) return error.message.es
  return String(error.message)
}

// Validation schema factory - takes t() function for i18n
const createPropertySchemaFn = (t: (key: string) => string) => z.object({
  name: z.string().min(3, t('propertyForm.validation.nameMin')).max(80, t('propertyForm.validation.nameMax')),
  nameEn: z.string().max(80, t('propertyForm.validation.nameEnMax')).optional(),
  nameFr: z.string().max(80, t('propertyForm.validation.nameFrMax')).optional(),
  description: z.string().min(10, t('propertyForm.validation.descriptionMin')).max(300, t('propertyForm.validation.descriptionMax')),
  descriptionEn: z.string().max(300, t('propertyForm.validation.descriptionEnMax')).optional(),
  descriptionFr: z.string().max(300, t('propertyForm.validation.descriptionFrMax')).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'VILLA']),

  // Dirección
  street: z.string().min(5, t('propertyForm.validation.streetMin')),
  city: z.string().min(2, t('propertyForm.validation.cityMin')),
  state: z.string().min(2, t('propertyForm.validation.stateMin')),
  country: z.string().default(t('propertyForm.countryDefault')),
  postalCode: z.string().regex(/^[0-9]{5}$/, t('propertyForm.validation.postalCodeFormat')),

  // Características
  bedrooms: z.number().min(0, t('propertyForm.validation.bedroomsMin')).max(20, t('propertyForm.validation.bedroomsMax')),
  bathrooms: z.number().min(0, t('propertyForm.validation.bathroomsMin')).max(10, t('propertyForm.validation.bathroomsMax')),
  maxGuests: z.number().min(1, t('propertyForm.validation.maxGuestsMin')).max(50, t('propertyForm.validation.maxGuestsMax')),
  squareMeters: z.number().min(10, t('propertyForm.validation.squareMetersMin')).max(1000, t('propertyForm.validation.squareMetersMax')).optional(),

  // Imagen de la propiedad
  profileImage: z.string().optional(),

  // Contacto del host
  hostContactName: z.string().min(2, t('propertyForm.validation.hostNameMin')).max(100, t('propertyForm.validation.hostNameMax')),
  hostContactPhone: z.string().regex(/^[+]?[(]?[0-9\s\-()]{9,}$/, t('propertyForm.validation.phoneInvalid')),
  hostContactEmail: z.string().email(t('propertyForm.validation.emailInvalid')),
  hostContactLanguage: z.string().default('es'),
  hostContactPhoto: z.string().optional()
})

type CreatePropertyFormData = z.infer<ReturnType<typeof createPropertySchemaFn>>

const propertyTypesConfig = [
  { value: 'APARTMENT', labelKey: 'propertyForm.apartment', icon: Home },
  { value: 'HOUSE', labelKey: 'propertyForm.house', icon: Home },
  { value: 'ROOM', labelKey: 'propertyForm.room', icon: Bed },
  { value: 'VILLA', labelKey: 'propertyForm.villa', icon: Home }
] as const

function NewPropertyPageContent() {
  const { t } = useTranslation('dashboard')
  const createPropertySchema = createPropertySchemaFn(t)
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId
  const { user } = useAuth()
  const { isOnboarding, currentStep: onboardingStep, skipOnboarding, showSpotlight, spotlightTarget, setSpotlight } = useOnboarding()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [showSavedDataBanner, setShowSavedDataBanner] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [savedDataInfo, setSavedDataInfo] = useState<{
    data: any
    timestamp: Date | null
    hasData: boolean
  }>({ data: null, timestamp: null, hasData: false })
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState<'es' | 'en' | 'fr'>('es')
  const [createdPropertyData, setCreatedPropertyData] = useState<{
    id: string
    name: string
    monthlyFee: number
    isFirstProperty: boolean
  } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<CreatePropertyFormData>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      country: 'España',
      hostContactLanguage: 'es',
      type: 'APARTMENT',
      hostContactName: '',
      hostContactPhoto: undefined,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      name: '',
      description: ''
    },
    mode: 'onChange'
  })

  const watchedValues = watch()

  // Setup form persistence with user-specific key (autoRestore: false = user must click to restore)
  const { clearSavedData, restoreSavedData, hasSavedData, getSavedDataInfo, lastSaved, isSaving } = useFormPersistence({
    storageKey: user?.id ? `itineramio-property-draft-${user.id}` : 'itineramio-property-draft-temp',
    watch,
    setValue,
    reset,
    excludeFields: [],
    autoRestore: false // Don't auto-restore - wait for user to click "Continue"
  })

  // Load property data for editing
  useEffect(() => {
    if (isEditing && editId) {
      const loadPropertyData = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/properties/${editId}/safe`)
          const result = await response.json()
          
          if (response.ok && result.success) {
            const property = result.data
            
            // Extract translations from JSON fields
            const nameTranslations = property.nameTranslations || {}
            const descriptionTranslations = property.descriptionTranslations || {}

            // Reset form with property data
            reset({
              name: property.name,
              nameEn: nameTranslations.en || '',
              nameFr: nameTranslations.fr || '',
              description: property.description,
              descriptionEn: descriptionTranslations.en || '',
              descriptionFr: descriptionTranslations.fr || '',
              type: property.type,
              street: property.street,
              city: property.city,
              state: property.state,
              country: property.country,
              postalCode: property.postalCode,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              maxGuests: property.maxGuests,
              squareMeters: property.squareMeters || undefined,
              profileImage: property.profileImage || undefined,
              hostContactName: property.hostContactName,
              hostContactPhone: property.hostContactPhone,
              hostContactEmail: property.hostContactEmail,
              hostContactLanguage: property.hostContactLanguage,
              hostContactPhoto: property.hostContactPhoto || undefined
            })
          } else {
            console.error('Error loading property:', result.error)
            alert(t('propertyForm.errorLoadingProperty'))
            router.push('/properties')
          }
        } catch (error) {
          console.error('Error loading property:', error)
          alert(t('propertyForm.errorLoadingProperty'))
          router.push('/properties')
        } finally {
          setIsLoading(false)
        }
      }
      
      loadPropertyData()
    }
  }, [isEditing, editId, reset, router])

  const onSubmit = async (data: CreatePropertyFormData) => {
    setIsSubmitting(true)

    try {
      // Use safe endpoint which we know works
      const url = isEditing ? `/api/properties/${editId}/safe` : '/api/properties/safe'
      const method = isEditing ? 'PUT' : 'POST'

      console.log('📤 Enviando propiedad...', { url, method })

      // Prepare headers with localStorage token for PWA persistence
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      try {
        const localToken = localStorage.getItem('auth-token')
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`
          console.log('📱 Including localStorage token in request')
        }
      } catch (e) {
        console.warn('⚠️ Could not access localStorage:', e)
      }

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 70000) // 70 second timeout (backend has 60s)

      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('📥 Respuesta recibida:', response.status, response.headers.get('content-type'))

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('❌ Respuesta no es JSON:', text.substring(0, 200))
        throw new Error(t('propertyForm.invalidServerResponse'))
      }

      const result = await response.json()
      console.log('📦 Resultado:', result)

      if (!response.ok) {
        // Si requiere login, redirigir al login
        if (result.requiresLogin || response.status === 401) {
          alert(t('propertyForm.sessionExpired'))
          router.push('/login')
          return
        }
        throw new Error(result.error || t(isEditing ? 'propertyForm.errorUpdating' : 'propertyForm.errorCreating'))
      }

      console.log(`✅ Propiedad ${isEditing ? 'actualizada' : 'creada'} exitosamente:`, result.data)

      // Stop loading spinner immediately on success
      setIsSubmitting(false)

      // Clear saved data
      if (!isEditing && result.data?.id) {
        clearSavedData()

        // Check if trial activation is needed
        if (result.subscription?.needsTrial) {
          setCreatedPropertyData({
            id: result.data.id,
            name: result.data.name,
            monthlyFee: result.subscription.monthlyFee,
            isFirstProperty: result.subscription.isFirstProperty
          })
          setShowTrialModal(true)
        } else {
          // First property is free, just redirect
          console.log('🔄 Redirigiendo a:', `/properties/${result.data.id}/zones`)
          router.push(`/properties/${result.data.id}/zones`)
        }
      } else {
        // For edited properties, use the normal flow
        handleSuccessfulSubmit()
      }
    } catch (error: any) {
      console.error(`❌ Error ${isEditing ? 'actualizando' : 'creando'} propiedad:`, error)

      let errorMessage = t(isEditing ? 'propertyForm.errorUpdating' : 'propertyForm.errorCreating')

      if (error.name === 'AbortError') {
        errorMessage = t('propertyForm.requestTimeout')
      } else if (error.message) {
        errorMessage = error.message
      }

      alert(errorMessage + '\n\n' + t('propertyForm.contactSupport'))
      setIsSubmitting(false)
    }
  }

  // Validar campos por step
  const validateStep = (step: number): boolean => {
    const currentErrors = Object.keys(errors)

    switch (step) {
      case 1:
        const step1Valid = !!watchedValues.name && !!watchedValues.description &&
               watchedValues.bedrooms !== undefined && watchedValues.bathrooms !== undefined &&
               watchedValues.maxGuests !== undefined
        if (!step1Valid) {
          console.log('❌ Step 1 validation failed:', {
            name: watchedValues.name,
            description: watchedValues.description,
            bedrooms: watchedValues.bedrooms,
            bathrooms: watchedValues.bathrooms,
            maxGuests: watchedValues.maxGuests,
            hasName: !!watchedValues.name,
            hasDescription: !!watchedValues.description,
            hasBedrooms: watchedValues.bedrooms !== undefined,
            hasBathrooms: watchedValues.bathrooms !== undefined,
            hasMaxGuests: watchedValues.maxGuests !== undefined
          })
        }
        return step1Valid

      case 2:
        const step2Valid = !!watchedValues.street && !!watchedValues.city && !!watchedValues.state &&
               !!watchedValues.country && !!watchedValues.postalCode
        if (!step2Valid) {
          console.log('❌ Step 2 validation failed:', {
            street: watchedValues.street,
            city: watchedValues.city,
            state: watchedValues.state,
            country: watchedValues.country,
            postalCode: watchedValues.postalCode
          })
        }
        return step2Valid

      case 3:
        const step3Valid = !!watchedValues.hostContactName && !!watchedValues.hostContactPhone &&
               !!watchedValues.hostContactEmail
        if (!step3Valid) {
          console.log('❌ Step 3 validation failed:', {
            hostContactName: watchedValues.hostContactName,
            hostContactPhone: watchedValues.hostContactPhone,
            hostContactEmail: watchedValues.hostContactEmail
          })
        }
        return step3Valid

      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 3 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const showPropertyPreview = () => {
    setShowPreview(true)
  }

  // Set client flag to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check for onboarding mode - NO POPUP, just let spotlight work
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding')
    if ((onboardingParam === 'true' || isOnboarding) && onboardingStep === 'create-property') {
      // Don't show popup, spotlight will guide the user automatically
      setShowOnboardingPopup(false)
    }
  }, [searchParams, isOnboarding, onboardingStep])

  // Check for saved data on component mount
  useEffect(() => {
    const checkSavedData = () => {
      if (hasSavedData()) {
        const info = getSavedDataInfo()
        setSavedDataInfo(info)
        // Only show banner if there's actual meaningful data
        if (info.hasData) {
          setShowSavedDataBanner(true)
        }
      }
    }

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkSavedData, 100)
    return () => clearTimeout(timer)
  }, [hasSavedData, getSavedDataInfo])

  // Show spotlight on "Siguiente" button when step is valid during onboarding
  useEffect(() => {
    if (!isOnboarding || showOnboardingPopup) {
      // Don't show spotlight during popup or if not onboarding
      return
    }

    // Check current form step validation and show spotlight accordingly
    if (currentStep === 1 && validateStep(1)) {
      setSpotlight(true, 'next-button-step-1')
    } else if (currentStep === 2 && validateStep(2)) {
      setSpotlight(true, 'next-button-step-2')
    } else {
      // Clear spotlight if step is not valid
      setSpotlight(false)
    }
  }, [isOnboarding, showOnboardingPopup, currentStep, validateStep(1), validateStep(2), watchedValues])

  // Add beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if form has any data
      const hasFormData = Object.values(watchedValues).some(value => 
        value && value !== '' && value !== 0
      )
      
      if (hasFormData && !isSubmitting && !submissionSuccess) {
        e.preventDefault()
        e.returnValue = t('propertyForm.unsavedChanges')
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [watchedValues, isSubmitting, submissionSuccess])

  // Clear saved data when form is successfully submitted
  const handleSuccessfulSubmit = () => {
    setSubmissionSuccess(true)
    clearSavedData()
    // If editing from main page, go back to main, otherwise go to properties
    const targetPath = isEditing ? '/main' : '/properties'
    router.push(targetPath)
  }

  // Handle restoring saved data (only when user clicks "Continue")
  const handleRestoreSavedData = () => {
    restoreSavedData() // Now manually restore the data
    setShowSavedDataBanner(false)
  }

  // Handle starting fresh - clear all saved data
  const handleStartFresh = () => {
    clearSavedData()
    reset({
      country: 'España',
      hostContactLanguage: 'es',
      type: 'APARTMENT',
      hostContactName: '',
      hostContactPhoto: undefined,
      name: '',
      description: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      bedrooms: 0,
      bathrooms: 0,
      maxGuests: 1,
      squareMeters: undefined,
      profileImage: undefined,
      hostContactPhone: '',
      hostContactEmail: ''
    })
    setShowSavedDataBanner(false)
    setCurrentStep(1)
  }

  return (
    <div
      className="fixed inset-0 md:static md:min-h-screen bg-white md:bg-gray-50 overflow-y-auto md:overflow-x-hidden z-[70] md:z-auto"
      style={{
        paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))'
      }}
    >
      <div className="h-full md:max-w-4xl md:mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* Back button - always at top */}
          <div className="mb-4">
            <Link href="/properties">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('propertyForm.back')}
              </Button>
            </Link>
          </div>
          
          {/* Title and subtitle */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {isEditing ? t('propertyForm.editProperty') : t('propertyForm.newProperty')}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {isEditing
                ? t('propertyForm.editPropertyDescription')
                : t('propertyForm.newPropertyDescription')
              }
            </p>
          </div>
          
          {/* Action buttons - responsive layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={showPropertyPreview}
              className="flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('propertyForm.preview')}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">{t('loading.propertyData')}</span>
          </div>
        )}

        {/* Saved Data Banner */}
        {!isEditing && (
          <SavedDataBanner
            isVisible={showSavedDataBanner}
            onRestore={handleRestoreSavedData}
            timestamp={savedDataInfo.timestamp}
            onClose={() => setShowSavedDataBanner(false)}
            onStartFresh={handleStartFresh}
          />
        )}

        {/* Progress Steps - Clickable */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-8">
            {[1, 2, 3].map((step) => {
              // Can go to a step if: it's a previous step OR it's the next step and current is valid
              const canGoToStep = step < currentStep || (step === currentStep + 1 && validateStep(currentStep)) || step === currentStep

              return (
                <div
                  key={step}
                  className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (step < currentStep) {
                        // Always allow going back
                        setCurrentStep(step)
                      } else if (step > currentStep && validateStep(currentStep)) {
                        // Only go forward if current step is valid
                        setCurrentStep(step)
                      }
                    }}
                    disabled={step > currentStep && !validateStep(currentStep)}
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-all
                      ${currentStep >= step
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                      ${step < currentStep ? 'hover:bg-violet-700 cursor-pointer' : ''}
                      ${step > currentStep && validateStep(currentStep) ? 'hover:bg-violet-500 hover:text-white cursor-pointer' : ''}
                      ${step > currentStep && !validateStep(currentStep) ? 'opacity-50 cursor-not-allowed' : ''}
                      ${step === currentStep ? 'ring-2 ring-violet-300 ring-offset-2' : ''}
                    `}
                  >
                    {step}
                  </button>
                  <div className="ml-2 text-xs sm:text-sm font-medium hidden sm:block">
                    {step === 1 && t('propertyForm.step1')}
                    {step === 2 && t('propertyForm.step2')}
                    {step === 3 && t('propertyForm.step3')}
                  </div>
                  <div className="ml-2 text-xs font-medium block sm:hidden">
                    {step === 1 && t('propertyForm.step1Short')}
                    {step === 2 && t('propertyForm.step2')}
                    {step === 3 && t('propertyForm.step3')}
                  </div>
                  {step < 3 && (
                    <div className={`
                      flex-1 h-1 mx-2 sm:mx-4
                      ${currentStep > step ? 'bg-violet-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                  {t('propertyForm.step1')}
                </h2>

                {/* Language Tabs for Name and Description */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">{t('propertyForm.titleAndDescription')}</h3>
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setActiveLanguage('es')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          activeLanguage === 'es'
                            ? 'bg-white text-violet-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🇪🇸 ES {!watchedValues.name && <span className="text-red-500">*</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLanguage('en')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          activeLanguage === 'en'
                            ? 'bg-white text-violet-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🇬🇧 EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLanguage('fr')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          activeLanguage === 'fr'
                            ? 'bg-white text-violet-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🇫🇷 FR
                      </button>
                    </div>
                  </div>

                  {activeLanguage !== 'es' && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-700">
                        {t('propertyForm.translationsOptional')}
                      </p>
                    </div>
                  )}

                  {/* Name field based on active language */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {activeLanguage === 'es' ? `${t('propertyForm.propertyName')} *` :
                       activeLanguage === 'en' ? t('propertyForm.propertyNameOptional') :
                       t('propertyForm.propertyNameOptionalFr')}
                    </label>
                    {activeLanguage === 'es' && (
                      <>
                        <Input
                          {...register('name')}
                          placeholder={t('propertyForm.propertyNamePlaceholder')}
                          maxLength={80}
                          error={!!errors.name}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.name)}</p>
                        )}
                      </>
                    )}
                    {activeLanguage === 'en' && (
                      <Input
                        {...register('nameEn')}
                        placeholder={t('propertyForm.propertyNamePlaceholderEn')}
                        maxLength={80}
                      />
                    )}
                    {activeLanguage === 'fr' && (
                      <Input
                        {...register('nameFr')}
                        placeholder={t('propertyForm.propertyNamePlaceholderFr')}
                        maxLength={80}
                      />
                    )}
                  </div>

                  {/* Description field based on active language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {activeLanguage === 'es' ? `${t('propertyForm.description')} *` :
                       activeLanguage === 'en' ? t('propertyForm.descriptionOptional') :
                       t('propertyForm.descriptionOptionalFr')}
                    </label>
                    {activeLanguage === 'es' && (
                      <>
                        <textarea
                          {...register('description')}
                          rows={3}
                          maxLength={300}
                          placeholder={t('propertyForm.descriptionPlaceholder')}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none ${
                            errors.description ? 'border-red-300' : ''
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-400 text-right">{watchedValues.description?.length || 0}/300</p>
                        {errors.description && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.description)}</p>
                        )}
                      </>
                    )}
                    {activeLanguage === 'en' && (
                      <>
                        <textarea
                          {...register('descriptionEn')}
                          rows={3}
                          maxLength={300}
                          placeholder={t('propertyForm.descriptionPlaceholderEn')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-400 text-right">{watchedValues.descriptionEn?.length || 0}/300</p>
                      </>
                    )}
                    {activeLanguage === 'fr' && (
                      <>
                        <textarea
                          {...register('descriptionFr')}
                          rows={3}
                          maxLength={300}
                          placeholder={t('propertyForm.descriptionPlaceholderFr')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-400 text-right">{watchedValues.descriptionFr?.length || 0}/300</p>
                      </>
                    )}
                  </div>

                  {/* Translation status indicators */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">{t('propertyForm.languagesCompleted')}:</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${watchedValues.name ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      🇪🇸 {watchedValues.name ? '✓' : '—'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${watchedValues.nameEn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      🇬🇧 {watchedValues.nameEn ? '✓' : '—'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${watchedValues.nameFr ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      🇫🇷 {watchedValues.nameFr ? '✓' : '—'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Tipo de propiedad */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.propertyType')} *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {propertyTypesConfig.map((type) => {
                        const IconComponent = type.icon
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setValue('type', type.value as PropertyType)}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              watchedValues.type === type.value
                                ? 'border-violet-500 bg-violet-50 text-violet-700'
                                : 'border-gray-200 hover:border-violet-300'
                            }`}
                          >
                            <IconComponent className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">{t(type.labelKey)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Imagen de la propiedad */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.mainPhoto')}
                    </label>
                    <ImageUpload
                      value={watchedValues.profileImage}
                      onChange={(imageUrl) => setValue('profileImage', imageUrl || undefined)}
                      placeholder={t('propertyForm.uploadPropertyPhoto')}
                      variant="property"
                      maxSize={10}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('propertyForm.mainPhotoDescription')}
                    </p>
                  </div>

                  {/* Características */}
                  <div className="flex items-center space-x-2">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('propertyForm.bedrooms')} *
                      </label>
                      <Input
                        type="number"
                        {...register('bedrooms', { valueAsNumber: true })}
                        min="0"
                        max="20"
                        error={!!errors.bedrooms}
                      />
                      {errors.bedrooms && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.bedrooms)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('propertyForm.bathrooms')} *
                      </label>
                      <Input
                        type="number"
                        {...register('bathrooms', { valueAsNumber: true })}
                        min="0"
                        max="10"
                        error={!!errors.bathrooms}
                      />
                      {errors.bathrooms && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.bathrooms)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('propertyForm.maxGuests')} *
                      </label>
                      <Input
                        type="number"
                        {...register('maxGuests', { valueAsNumber: true })}
                        min="1"
                        max="50"
                        error={!!errors.maxGuests}
                      />
                      {errors.maxGuests && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.maxGuests)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Square className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('propertyForm.squareMeters')}
                      </label>
                      <Input
                        type="number"
                        {...register('squareMeters', { valueAsNumber: true })}
                        min="10"
                        max="1000"
                        placeholder={t('propertyForm.optional')}
                        error={!!errors.squareMeters}
                      />
                      {errors.squareMeters && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.squareMeters)}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
                  <div className="flex gap-3 order-2 sm:order-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={showPropertyPreview}
                      className="flex-1 sm:flex-initial"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('propertyForm.preview')}
                    </Button>
                  </div>
                  <div className="flex flex-col items-center sm:items-end order-1 sm:order-2">
                    <Button
                      id="next-button-step-1"
                      onClick={nextStep}
                      type="button"
                      disabled={!validateStep(1)}
                      className="w-full sm:w-auto"
                    >
                      {t('propertyForm.next')}
                    </Button>
                    {!validateStep(1) && (
                      <p className="text-sm text-red-600 mt-2 text-center sm:text-right">
                        {t('propertyForm.completeRequired')}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Ubicación */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                  {t('propertyForm.step2')}
                </h2>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    {t('propertyForm.addressAutocompleteInfo')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Dirección con Google Maps Autocomplete */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.fullAddress')} *
                    </label>
                    <AddressAutocomplete
                      value={watchedValues.street}
                      onChange={(addressData) => {
                        // Usar la dirección formateada completa de Google Maps en el input visual
                        // Esto muestra "Calle Gran Vía 123, Madrid, España" en el input
                        setValue('street', addressData.formattedAddress || addressData.street, { shouldValidate: true })
                        setValue('city', addressData.city, { shouldValidate: true })
                        setValue('state', addressData.state, { shouldValidate: true })
                        setValue('country', addressData.country, { shouldValidate: true })
                        if (addressData.postalCode) {
                          setValue('postalCode', addressData.postalCode, { shouldValidate: true })
                        }
                        console.log('Address autocomplete:', addressData)
                      }}
                      error={!!errors.street}
                      placeholder={t('propertyForm.addressPlaceholder')}
                    />
                    {errors.street && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.street)}</p>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.city')} *
                    </label>
                    <Input
                      {...register('city')}
                      placeholder={t('propertyForm.cityPlaceholder')}
                      error={!!errors.city}
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.city)}</p>
                    )}
                  </div>

                  {/* Provincia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.province')} *
                    </label>
                    <Input
                      {...register('state')}
                      placeholder={t('propertyForm.provincePlaceholder')}
                      error={!!errors.state}
                    />
                    {errors.state && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.state)}</p>
                    )}
                  </div>

                  {/* Código postal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.postalCode')} *
                    </label>
                    <Input
                      {...register('postalCode')}
                      placeholder={t('propertyForm.postalCodePlaceholder')}
                      maxLength={5}
                      error={!!errors.postalCode}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.postalCode)}</p>
                    )}
                  </div>

                  {/* País */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.country')} *
                    </label>
                    <Input
                      {...register('country')}
                      placeholder={t('propertyForm.countryDefault')}
                      error={!!errors.country}
                    />
                    {errors.country && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.country)}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
                  <div className="flex gap-3 order-2 sm:order-1">
                    <Button onClick={prevStep} type="button" variant="outline" className="flex-1 sm:flex-initial">
                      {t('propertyForm.previous')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={showPropertyPreview}
                      className="flex-1 sm:flex-initial"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('propertyForm.preview')}
                    </Button>
                  </div>
                  <div className="flex flex-col items-center sm:items-end order-1 sm:order-2">
                    <Button
                      id="next-button-step-2"
                      onClick={nextStep}
                      type="button"
                      disabled={!validateStep(2)}
                      className="w-full sm:w-auto"
                    >
                      {t('propertyForm.next')}
                    </Button>
                    {!validateStep(2) && (
                      <p className="text-sm text-red-600 mt-2 text-center sm:text-right">
                        {t('propertyForm.completeRequired')}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Contacto */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                  {t('propertyForm.contactInfo')}
                </h2>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    {t('propertyForm.contactInfoDescription')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Foto de perfil */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.profilePhoto')}
                    </label>
                    <ImageUpload
                      value={watchedValues.hostContactPhoto}
                      onChange={(imageUrl) => {
                        console.log('Host photo changed to:', imageUrl)
                        setValue('hostContactPhoto', imageUrl || undefined)
                      }}
                      placeholder={t('propertyForm.uploadProfilePhoto')}
                      variant="profile"
                      maxSize={5}
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      {t('propertyForm.profilePhotoDescription')}
                    </p>
                  </div>

                  {/* Nombre de contacto */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      {t('propertyForm.fullName')} *
                    </label>
                    <Input
                      {...register('hostContactName')}
                      placeholder={t('propertyForm.fullNamePlaceholder')}
                      error={!!errors.hostContactName}
                    />
                    {errors.hostContactName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.hostContactName)}</p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      {t('propertyForm.whatsappPhone')} *
                    </label>
                    <Input
                      {...register('hostContactPhone')}
                      placeholder={t('propertyForm.phonePlaceholder')}
                      error={!!errors.hostContactPhone}
                    />
                    {errors.hostContactPhone && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.hostContactPhone)}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {t('propertyForm.whatsappDescription')}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      {t('propertyForm.contactEmail')} *
                    </label>
                    <Input
                      {...register('hostContactEmail')}
                      type="email"
                      placeholder={t('propertyForm.emailPlaceholder')}
                      error={!!errors.hostContactEmail}
                    />
                    {errors.hostContactEmail && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{getErrorMessage(errors.hostContactEmail)}</p>
                    )}
                  </div>

                  {/* Idioma preferido */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('propertyForm.preferredLanguage')}
                    </label>
                    <select
                      {...register('hostContactLanguage')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm sm:text-base"
                    >
                      <option value="es">{t('propertyForm.spanish')}</option>
                      <option value="en">{t('propertyForm.english')}</option>
                      <option value="fr">{t('propertyForm.french')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
                  <div className="flex gap-3 order-2 sm:order-1">
                    <Button onClick={prevStep} type="button" variant="outline" className="flex-1 sm:flex-initial">
                      {t('propertyForm.previous')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!validateStep(3)}
                      onClick={showPropertyPreview}
                      className="flex-1 sm:flex-initial"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('propertyForm.preview')}
                    </Button>
                  </div>
                  <div className="flex flex-col items-center sm:items-end order-1 sm:order-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !validateStep(3)}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <InlineSpinner className="mr-2" color="white" />
                          {isEditing ? t('propertyForm.updating') : t('propertyForm.creating')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isEditing ? t('propertyForm.updateProperty') : t('propertyForm.createProperty')}
                        </>
                      )}
                    </Button>
                    {!validateStep(3) && (
                      <div className="mt-2 text-center sm:text-right">
                        <p className="text-xs sm:text-sm text-red-600 font-medium mb-1">
                          {t('propertyForm.completeRequiredFields')}:
                        </p>
                        <div className="text-xs text-red-500 space-y-0.5">
                          {!watchedValues.hostContactName && <p>• {t('propertyForm.contactName')}</p>}
                          {!watchedValues.hostContactPhone && <p>• {t('propertyForm.phone')}</p>}
                          {!watchedValues.hostContactEmail && <p>• {t('propertyForm.email')}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </form>

        {/* Property Preview Modal */}
        <PropertyPreview 
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          propertyData={watchedValues}
        />

        {/* Auto Save Indicator */}
        <AutoSaveIndicator
          isVisible={Object.values(watchedValues).some(value => value && value !== '' && value !== 0)}
          lastSaved={lastSaved || undefined}
          isSaving={isSaving}
        />

        {/* Trial Activation Modal */}
        {createdPropertyData && (
          <TrialActivationModal
            isOpen={showTrialModal}
            onClose={() => {
              setShowTrialModal(false)
              router.push(`/properties/${createdPropertyData.id}/zones`)
            }}
            propertyId={createdPropertyData.id}
            propertyName={createdPropertyData.name}
            monthlyFee={createdPropertyData.monthlyFee}
            isFirstProperty={createdPropertyData.isFirstProperty}
            onActivateTrial={async () => {
              try {
                const response = await fetch(`/api/properties/${createdPropertyData.id}/activate-trial`, {
                  method: 'POST'
                })

                if (response.ok) {
                  setShowTrialModal(false)
                  router.push(`/properties/${createdPropertyData.id}/zones`)
                } else {
                  alert(t('propertyForm.trialActivationError'))
                }
              } catch (error) {
                alert(t('propertyForm.trialActivationError'))
              }
            }}
            onPayNow={() => {
              setShowTrialModal(false)
              router.push('/account/billing')
            }}
          />
        )}

        {/* Onboarding Popup */}
        <OnboardingPopup
          isOpen={showOnboardingPopup}
          title={t('propertyForm.onboardingTitle')}
          description={t('propertyForm.onboardingDescription')}
          onSkip={() => {
            setShowOnboardingPopup(false)
            skipOnboarding()
          }}
          showNextButton={false}
        />
      </div>
    </div>
  )
}

export default function NewPropertyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPropertyPageContent />
    </Suspense>
  )
}