'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Save,
  Eye,
  User,
  Check,
  Plus,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../../src/components/ui/Button'
import { Input } from '../../../../../src/components/ui/Input'
import { Card } from '../../../../../src/components/ui/Card'
import { ImageUpload } from '../../../../../src/components/ui/ImageUpload'
import { AddressAutocomplete } from '../../../../../src/components/ui/AddressAutocomplete'
import { useFormPersistence } from '../../../../../src/hooks/useFormPersistence'
import { useAuth } from '../../../../../src/providers/AuthProvider'

// PropertySetType as string literal type
type PropertySetType = 'HOTEL' | 'BUILDING' | 'COMPLEX' | 'RESORT' | 'HOSTEL' | 'APARTHOTEL'

// Validation schema factory that accepts t for translations
function createPropertySetSchemaWithT(t: (key: string) => string) {
  return z.object({
    name: z.string().min(3, t('validation.nameMin')).max(100, t('validation.nameMax')),
    description: z.string().min(10, t('validation.descriptionMin')).max(1000, t('validation.descriptionMax')),
    type: z.enum(['HOTEL', 'BUILDING', 'COMPLEX', 'RESORT', 'HOSTEL', 'APARTHOTEL']),

    // Dirección
    street: z.string().min(5, t('validation.streetMin')),
    city: z.string().min(2, t('validation.cityMin')),
    state: z.string().min(2, t('validation.stateMin')),
    country: z.string().min(2, t('validation.countryMin')).default('España'),
    postalCode: z.string().min(4, t('validation.postalCodeMin')).max(10, t('validation.postalCodeMax')),

    // Imagen del conjunto
    profileImage: z.string().optional(),

    // Contacto del host
    hostContactName: z.string().min(2, t('validation.contactNameMin')).max(100, t('validation.contactNameMax')),
    hostContactPhone: z.string().min(9, t('validation.phoneMin')),
    hostContactEmail: z.string().email(t('validation.emailInvalid')),
    hostContactLanguage: z.string().default('es'),
    hostContactPhoto: z.string().optional(),

    // Selected properties
    selectedProperties: z.array(z.string()).optional()
  })
}

type CreatePropertySetFormData = z.infer<ReturnType<typeof createPropertySetSchemaWithT>>

interface Property {
  id: string
  name: string
  city: string
  state: string
  type: string
  profileImage?: string
  propertySetId?: string | null
}

function NewPropertySetPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId
  const { user } = useAuth()
  const { t } = useTranslation('property')

  const propertySetTypes = [
    { value: 'HOTEL', label: t('types.hotel'), icon: Building2 },
    { value: 'BUILDING', label: t('types.building'), icon: Building2 },
    { value: 'COMPLEX', label: t('types.complex'), icon: Building2 },
    { value: 'RESORT', label: t('types.resort'), icon: Building2 },
    { value: 'HOSTEL', label: t('types.hostel'), icon: Building2 },
    { value: 'APARTHOTEL', label: t('types.aparthotel'), icon: Building2 }
  ] as const

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])

  const createPropertySetSchema = createPropertySetSchemaWithT(t)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<CreatePropertySetFormData>({
    resolver: zodResolver(createPropertySetSchema),
    defaultValues: {
      country: 'España',
      hostContactLanguage: 'es',
      type: 'HOTEL',
      hostContactName: 'Alejandro Satlla',
      selectedProperties: []
    },
    mode: 'onChange'
  })

  const watchedValues = watch()

  // Setup form persistence with user-specific key
  const { clearSavedData, hasSavedData, getSavedDataInfo, lastSaved } = useFormPersistence({
    storageKey: user?.id ? `itineramio-property-set-draft-${user.id}` : 'itineramio-property-set-draft-temp',
    watch,
    setValue,
    reset,
    excludeFields: ['selectedProperties']
  })

  // Fetch available properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true)
      try {
        const response = await fetch('/api/properties')
        const result = await response.json()

        if (response.ok && result.data) {
          setAvailableProperties(result.data)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoadingProperties(false)
      }
    }

    fetchProperties()
  }, [])

  // Load property set data for editing
  useEffect(() => {
    if (isEditing && editId) {
      const loadPropertySetData = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/property-sets/${editId}`)
          const result = await response.json()

          if (response.ok && result.success) {
            const propertySet = result.data

            // Reset form with property set data
            reset({
              name: propertySet.name,
              description: propertySet.description,
              type: propertySet.type,
              street: propertySet.street,
              city: propertySet.city,
              state: propertySet.state,
              country: propertySet.country,
              postalCode: propertySet.postalCode,
              profileImage: propertySet.profileImage || undefined,
              hostContactName: propertySet.hostContactName,
              hostContactPhone: propertySet.hostContactPhone,
              hostContactEmail: propertySet.hostContactEmail,
              hostContactLanguage: propertySet.hostContactLanguage,
              hostContactPhoto: propertySet.hostContactPhoto || undefined
            })

            // Set selected properties
            const selectedIds = propertySet.properties?.map((p: Property) => p.id) || []
            setSelectedProperties(selectedIds)
            setValue('selectedProperties', selectedIds)
          } else {
            console.error('Error loading property set:', result.error)
            alert(t('groups.errorLoadingSet'))
            router.push('/properties/groups')
          }
        } catch (error) {
          console.error('Error loading property set:', error)
          alert(t('groups.errorLoadingSet'))
          router.push('/properties/groups')
        } finally {
          setIsLoading(false)
        }
      }

      loadPropertySetData()
    }
  }, [isEditing, editId, reset, router, setValue, t])

  const onSubmit = async (data: CreatePropertySetFormData) => {
    console.log('📝 Form submitted with data:', data)
    setIsSubmitting(true)

    try {
      const url = isEditing ? `/api/property-sets/${editId}` : '/api/property-sets'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          selectedProperties
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API error:', result)
        throw new Error(result.error || (isEditing ? t('groups.errorUpdating') : t('groups.errorCreating')))
      }

      console.log(`✅ Conjunto ${isEditing ? 'actualizado' : 'creado'} exitosamente:`, result.data)

      // Clear saved data and redirect to the new property set
      clearSavedData()
      router.push(`/properties/groups/${result.data.id}`)
    } catch (error) {
      console.error(`❌ Error ${isEditing ? 'actualizando' : 'creando'} conjunto:`, error)
      alert(isEditing ? t('groups.errorUpdating') : t('groups.errorCreating'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Debug: log form errors when they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('⚠️ Form validation errors:', errors)
    }
  }, [errors])

  // Validar campos por step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!watchedValues.name && !!watchedValues.description

      case 2:
        return !!watchedValues.street && !!watchedValues.city && !!watchedValues.state &&
               !!watchedValues.country && !!watchedValues.postalCode

      case 3:
        return !!watchedValues.hostContactName && !!watchedValues.hostContactPhone &&
               !!watchedValues.hostContactEmail

      case 4:
        return true // Property selection is optional

      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 4 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Set client flag to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Clear saved data when form is successfully submitted
  const handleSuccessfulSubmit = () => {
    clearSavedData()
    router.push('/properties/groups')
  }

  const handlePropertyToggle = (propertyId: string) => {
    setSelectedProperties(prev => {
      const newSelection = prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]

      setValue('selectedProperties', newSelection)
      return newSelection
    })
  }

  // Show all properties - allow moving between sets
  const selectableProperties = availableProperties

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/properties/groups">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? t('groups.editTitle') : t('groups.newTitle')}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing
                  ? t('groups.editSubtitle')
                  : t('groups.newSubtitle')
                }
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">{t('groups.loadingSet')}</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step}
                </div>
                <div className="ml-2 text-sm font-medium">
                  {step === 1 && t('groups.steps.basicInfo')}
                  {step === 2 && t('groups.steps.location')}
                  {step === 3 && t('groups.steps.contact')}
                  {step === 4 && t('groups.steps.properties')}
                </div>
                {step < 4 && (
                  <div className={`
                    flex-1 h-1 mx-4
                    ${currentStep > step ? 'bg-violet-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('groups.steps.basicInfo')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.setName')}
                    </label>
                    <Input
                      {...register('name')}
                      placeholder={t('groups.form.setNamePlaceholder')}
                      error={!!errors.name}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.description')}
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder={t('groups.form.descriptionPlaceholder')}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                        errors.description ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Tipo de conjunto */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.establishmentType')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {propertySetTypes.map((type) => {
                        const IconComponent = type.icon
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setValue('type', type.value as PropertySetType)}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              watchedValues.type === type.value
                                ? 'border-violet-500 bg-violet-50 text-violet-700'
                                : 'border-gray-200 hover:border-violet-300'
                            }`}
                          >
                            <IconComponent className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">{type.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Imagen del conjunto */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.mainPhoto')}
                    </label>
                    <ImageUpload
                      value={watchedValues.profileImage}
                      onChange={(imageUrl) => setValue('profileImage', imageUrl || undefined)}
                      placeholder={t('groups.form.mainPhotoUpload')}
                      variant="property"
                      maxSize={10}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('groups.form.mainPhotoHint')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={nextStep}
                    type="button"
                    disabled={!validateStep(1)}
                  >
                    {t('common.next')}
                  </Button>
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
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('groups.steps.location')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dirección con Google Maps Autocomplete */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      {t('groups.form.fullAddress')}
                    </label>
                    <AddressAutocomplete
                      value={watchedValues.street}
                      onChange={(addressData) => {
                        // Usar la dirección formateada completa de Google Maps
                        setValue('street', addressData.formattedAddress || addressData.street, { shouldValidate: true })
                        setValue('city', addressData.city, { shouldValidate: true })
                        setValue('state', addressData.state, { shouldValidate: true })
                        setValue('country', addressData.country, { shouldValidate: true })
                        if (addressData.postalCode && addressData.postalCode !== '00000') {
                          setValue('postalCode', addressData.postalCode, { shouldValidate: true })
                        }
                      }}
                      error={!!errors.street}
                      placeholder={t('groups.form.addressPlaceholder')}
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                    )}
                  </div>

                  {/* Ciudad (auto-filled from Google Maps) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.city')}
                    </label>
                    <Input
                      {...register('city')}
                      placeholder={t('groups.form.cityPlaceholder')}
                      error={!!errors.city}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  {/* Provincia (auto-filled from Google Maps) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.state')}
                    </label>
                    <Input
                      {...register('state')}
                      placeholder={t('groups.form.statePlaceholder')}
                      error={!!errors.state}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  {/* Código postal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.postalCode')}
                    </label>
                    <Input
                      {...register('postalCode')}
                      placeholder="28001"
                      maxLength={5}
                      error={!!errors.postalCode}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                    )}
                  </div>

                  {/* País (auto-filled from Google Maps) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.country')}
                    </label>
                    <Input
                      {...register('country')}
                      placeholder="España"
                      error={!!errors.country}
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button onClick={prevStep} type="button" variant="outline">
                    {t('common.previous')}
                  </Button>
                  <Button
                    onClick={nextStep}
                    type="button"
                    disabled={!validateStep(2)}
                  >
                    {t('common.next')}
                  </Button>
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
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('groups.form.contactInfoTitle')}
                </h2>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>💡 {t('groups.form.contactInfoNote')}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Foto de perfil */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.contactProfilePhoto')}
                    </label>
                    <ImageUpload
                      value={watchedValues.hostContactPhoto}
                      onChange={(imageUrl) => setValue('hostContactPhoto', imageUrl || undefined)}
                      placeholder={t('groups.form.contactProfileUpload')}
                      variant="profile"
                      maxSize={5}
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      {t('groups.form.contactProfileHint')}
                    </p>
                  </div>

                  {/* Nombre de contacto */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      {t('groups.form.fullName')}
                    </label>
                    <Input
                      {...register('hostContactName')}
                      placeholder={t('groups.form.fullNamePlaceholder')}
                      error={!!errors.hostContactName}
                    />
                    {errors.hostContactName && (
                      <p className="mt-1 text-sm text-red-600">{errors.hostContactName.message}</p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      {t('groups.form.whatsappPhone')}
                    </label>
                    <Input
                      {...register('hostContactPhone')}
                      placeholder="+34 600 000 000"
                      error={!!errors.hostContactPhone}
                    />
                    {errors.hostContactPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.hostContactPhone.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {t('groups.form.whatsappHint')}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      {t('groups.form.contactEmail')}
                    </label>
                    <Input
                      {...register('hostContactEmail')}
                      type="email"
                      placeholder="tu@email.com"
                      error={!!errors.hostContactEmail}
                    />
                    {errors.hostContactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.hostContactEmail.message}</p>
                    )}
                  </div>

                  {/* Idioma preferido */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('groups.form.preferredLanguage')}
                    </label>
                    <select
                      {...register('hostContactLanguage')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="es">{t('languages.es')}</option>
                      <option value="en">{t('languages.en')}</option>
                      <option value="fr">{t('languages.fr')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button onClick={prevStep} type="button" variant="outline">
                    {t('common.previous')}
                  </Button>
                  <Button
                    onClick={nextStep}
                    type="button"
                    disabled={!validateStep(3)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Selección de Propiedades */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('groups.form.selectProperties')}
                </h2>

                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>💡</strong> {t('groups.form.selectPropertiesTip')}
                  </p>
                </div>

                {loadingProperties ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-violet-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">{t('groups.form.loadingAvailableProperties')}</p>
                  </div>
                ) : selectableProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('groups.form.noPropertiesAvailable')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('groups.form.noPropertiesAvailableDesc')}
                    </p>
                    <Link href="/properties/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('groups.form.createFirstProperty')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectableProperties.map((property) => (
                      <div
                        key={property.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedProperties.includes(property.id)
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-violet-300'
                        }`}
                        onClick={() => handlePropertyToggle(property.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {property.profileImage ? (
                              <img
                                src={property.profileImage}
                                alt={property.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{property.name}</h3>
                            <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">{property.type}</p>
                              {property.propertySetId && property.propertySetId !== editId && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                  {t('common.inAnotherSet')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {selectedProperties.includes(property.id) && (
                              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show validation errors if any */}
                {Object.keys(errors).length > 0 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      {t('groups.form.fixErrors')}
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {errors.name && <li>{t('groups.form.errorName', { message: errors.name.message })}</li>}
                      {errors.description && <li>{t('groups.form.errorDescription', { message: errors.description.message })}</li>}
                      {errors.street && <li>{t('groups.form.errorAddress', { message: errors.street.message })}</li>}
                      {errors.city && <li>{t('groups.form.errorCity', { message: errors.city.message })}</li>}
                      {errors.state && <li>{t('groups.form.errorState', { message: errors.state.message })}</li>}
                      {errors.postalCode && <li>{t('groups.form.errorPostalCode', { message: errors.postalCode.message })}</li>}
                      {errors.hostContactName && <li>{t('groups.form.errorContactName', { message: errors.hostContactName.message })}</li>}
                      {errors.hostContactPhone && <li>{t('groups.form.errorPhone', { message: errors.hostContactPhone.message })}</li>}
                      {errors.hostContactEmail && <li>{t('groups.form.errorEmail', { message: errors.hostContactEmail.message })}</li>}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button onClick={prevStep} type="button" variant="outline">
                    {t('common.previous')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    onClick={() => {
                      console.log('🔘 Submit button clicked')
                      console.log('📋 Form values:', watchedValues)
                      console.log('❌ Form errors:', errors)
                      console.log('✅ Form is valid:', isValid)
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting
                      ? (isEditing ? t('groups.updating') : t('groups.creating'))
                      : (isEditing ? t('groups.updateSet') : t('groups.createSet'))
                    }
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  )
}

export default function NewPropertySetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPropertySetPageContent />
    </Suspense>
  )
}
