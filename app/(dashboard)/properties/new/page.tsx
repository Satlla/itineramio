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
import { Button, Input, Card, ImageUpload, PropertyPreview, SavedDataBanner } from '../../../../src/components/ui'
import { AutoSaveIndicator } from '../../../../src/components/ui/AutoSaveIndicator'
import { useFormPersistence } from '../../../../src/hooks/useFormPersistence'
// PropertyType as string literal type
type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'VILLA'

// Validation schema
const createPropertySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'Máximo 1000 caracteres'),
  type: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'VILLA']),
  
  // Dirección
  street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  state: z.string().min(2, 'La provincia debe tener al menos 2 caracteres'),
  country: z.string().default('España'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Código postal debe tener 5 dígitos'),
  
  // Características
  bedrooms: z.number().min(0, 'Mínimo 0 habitaciones').max(20, 'Máximo 20 habitaciones'),
  bathrooms: z.number().min(0, 'Mínimo 0 baños').max(10, 'Máximo 10 baños'),
  maxGuests: z.number().min(1, 'Mínimo 1 huésped').max(50, 'Máximo 50 huéspedes'),
  squareMeters: z.number().min(10, 'Mínimo 10 m²').max(1000, 'Máximo 1000 m²').optional(),
  
  // Imagen de la propiedad
  profileImage: z.string().optional(),
  
  // Contacto del host
  hostContactName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Máximo 100 caracteres'),
  hostContactPhone: z.string().regex(/^[+]?[(]?[0-9\s\-()]{9,}$/, 'Teléfono inválido'),
  hostContactEmail: z.string().email('Email inválido'),
  hostContactLanguage: z.string().default('es'),
  hostContactPhoto: z.string().optional()
})

type CreatePropertyFormData = z.infer<typeof createPropertySchema>

const propertyTypes = [
  { value: 'APARTMENT', label: 'Apartamento', icon: Home },
  { value: 'HOUSE', label: 'Casa', icon: Home },
  { value: 'ROOM', label: 'Habitación', icon: Bed },
  { value: 'VILLA', label: 'Villa', icon: Home }
] as const

function NewPropertyPageContent() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId
  
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      hostContactName: 'Alejandro Satlla'
    },
    mode: 'onChange'
  })

  const watchedValues = watch()

  // Setup form persistence
  const { clearSavedData, hasSavedData, getSavedDataInfo, lastSaved } = useFormPersistence({
    storageKey: 'itineramio-property-draft',
    watch,
    setValue,
    reset,
    excludeFields: [] // We want to save all fields
  })

  // Load property data for editing
  useEffect(() => {
    if (isEditing && editId) {
      const loadPropertyData = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/properties/${editId}`)
          const result = await response.json()
          
          if (response.ok && result.success) {
            const property = result.data
            
            // Reset form with property data
            reset({
              name: property.name,
              description: property.description,
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
            alert('Error al cargar los datos de la propiedad')
            router.push('/properties')
          }
        } catch (error) {
          console.error('Error loading property:', error)
          alert('Error al cargar los datos de la propiedad')
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
      const url = isEditing ? `/api/properties/${editId}` : '/api/properties'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `Error al ${isEditing ? 'actualizar' : 'crear'} la propiedad`)
      }
      
      console.log(`Propiedad ${isEditing ? 'actualizada' : 'creada'} exitosamente:`, result.data)
      
      // Clear saved data and redirect
      handleSuccessfulSubmit()
    } catch (error) {
      console.error(`Error ${isEditing ? 'actualizando' : 'creando'} propiedad:`, error)
      alert(`Error al ${isEditing ? 'actualizar' : 'crear'} la propiedad. Por favor, inténtalo de nuevo.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validar campos por step
  const validateStep = (step: number): boolean => {
    const currentErrors = Object.keys(errors)
    
    switch (step) {
      case 1:
        return !!watchedValues.name && !!watchedValues.description && 
               watchedValues.bedrooms !== undefined && watchedValues.bathrooms !== undefined && 
               watchedValues.maxGuests !== undefined
      
      case 2:
        return !!watchedValues.street && !!watchedValues.city && !!watchedValues.state && 
               !!watchedValues.country && !!watchedValues.postalCode
      
      case 3:
        return !!watchedValues.hostContactName && !!watchedValues.hostContactPhone && 
               !!watchedValues.hostContactEmail
      
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

  // Check for saved data on component mount
  useEffect(() => {
    const checkSavedData = () => {
      if (hasSavedData()) {
        const info = getSavedDataInfo()
        setSavedDataInfo(info)
        setShowSavedDataBanner(true)
      }
    }

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkSavedData, 100)
    return () => clearTimeout(timer)
  }, [hasSavedData, getSavedDataInfo])

  // Add beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if form has any data
      const hasFormData = Object.values(watchedValues).some(value => 
        value && value !== '' && value !== 0
      )
      
      if (hasFormData && !isSubmitting && !submissionSuccess) {
        e.preventDefault()
        e.returnValue = '¿Estás seguro de que quieres salir? Los datos se guardarán automáticamente.'
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

  // Handle restoring saved data
  const handleRestoreSavedData = () => {
    setShowSavedDataBanner(false)
    // The data is already loaded by the hook, just close the banner
  }

  // Handle discarding saved data
  const handleDiscardSavedData = () => {
    clearSavedData()
    reset({
      country: 'España',
      hostContactLanguage: 'es',
      type: 'APARTMENT',
      hostContactName: 'Alejandro Satlla'
    })
    setShowSavedDataBanner(false)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back button - always at top */}
          <div className="mb-4">
            <Link href="/properties">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
          
          {/* Title and subtitle */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing 
                ? 'Actualiza la información de tu propiedad'
                : 'Crea una nueva propiedad para gestionar sus manuales digitales'
              }
            </p>
          </div>
          
          {/* Action buttons - responsive layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            {isClient && hasSavedData() && (
              <Button 
                type="button" 
                variant="ghost"
                onClick={handleDiscardSavedData}
                className="text-gray-500 hover:text-red-600"
                size="sm"
              >
                Limpiar borrador
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline"
              onClick={showPropertyPreview}
              className="flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Cargando datos de la propiedad...</span>
          </div>
        )}

        {/* Saved Data Banner */}
        {!isEditing && (
          <SavedDataBanner
            isVisible={showSavedDataBanner}
            onRestore={handleRestoreSavedData}
            onDiscard={handleDiscardSavedData}
            timestamp={savedDataInfo.timestamp}
            onClose={() => setShowSavedDataBanner(false)}
          />
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}
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
                  {step === 1 && 'Información Básica'}
                  {step === 2 && 'Ubicación'}
                  {step === 3 && 'Contacto'}
                </div>
                {step < 3 && (
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
                  Información Básica
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la propiedad *
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="Ej: Acogedor apartamento en el centro"
                      error={!!errors.name}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder="Describe tu propiedad, sus características principales y qué la hace especial..."
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                        errors.description ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Tipo de propiedad */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de propiedad *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {propertyTypes.map((type) => {
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
                            <span className="text-sm font-medium">{type.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Imagen de la propiedad */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto principal de la propiedad
                    </label>
                    <ImageUpload
                      value={watchedValues.profileImage}
                      onChange={(imageUrl) => setValue('profileImage', imageUrl || undefined)}
                      placeholder="Subir foto de la propiedad"
                      variant="property"
                      maxSize={10}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Esta será la imagen principal de tu propiedad en el dashboard. Se optimizará automáticamente.
                    </p>
                  </div>

                  {/* Características */}
                  <div className="flex items-center space-x-2">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Habitaciones *
                      </label>
                      <Input
                        type="number"
                        {...register('bedrooms', { valueAsNumber: true })}
                        min="0"
                        max="20"
                        error={!!errors.bedrooms}
                      />
                      {errors.bedrooms && (
                        <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Baños *
                      </label>
                      <Input
                        type="number"
                        {...register('bathrooms', { valueAsNumber: true })}
                        min="0"
                        max="10"
                        error={!!errors.bathrooms}
                      />
                      {errors.bathrooms && (
                        <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Huéspedes máximo *
                      </label>
                      <Input
                        type="number"
                        {...register('maxGuests', { valueAsNumber: true })}
                        min="1"
                        max="50"
                        error={!!errors.maxGuests}
                      />
                      {errors.maxGuests && (
                        <p className="mt-1 text-sm text-red-600">{errors.maxGuests.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Square className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metros cuadrados
                      </label>
                      <Input
                        type="number"
                        {...register('squareMeters', { valueAsNumber: true })}
                        min="10"
                        max="1000"
                        placeholder="Opcional"
                        error={!!errors.squareMeters}
                      />
                      {errors.squareMeters && (
                        <p className="mt-1 text-sm text-red-600">{errors.squareMeters.message}</p>
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
                      Vista Previa
                    </Button>
                  </div>
                  <div className="flex flex-col items-center sm:items-end order-1 sm:order-2">
                    <Button 
                      onClick={nextStep} 
                      type="button"
                      disabled={!validateStep(1)}
                      className="w-full sm:w-auto"
                    >
                      Siguiente
                    </Button>
                    {!validateStep(1) && (
                      <p className="text-sm text-red-600 mt-2 text-center sm:text-right">
                        Completa todos los campos obligatorios para continuar
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
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Ubicación
                </h2>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Información importante:</strong> Introduce la dirección completa de la propiedad. Esta información ayudará a los huéspedes a encontrarla.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dirección */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección completa *
                    </label>
                    <Input
                      {...register('street')}
                      placeholder="Ej: Calle Gran Vía 123, 2º A"
                      error={!!errors.street}
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Incluye calle, número, piso y puerta si corresponde
                    </p>
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <Input
                      {...register('city')}
                      placeholder="Ej: Madrid"
                      error={!!errors.city}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  {/* Provincia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia *
                    </label>
                    <Input
                      {...register('state')}
                      placeholder="Ej: Madrid"
                      error={!!errors.state}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  {/* Código postal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código postal *
                    </label>
                    <Input
                      {...register('postalCode')}
                      placeholder="Ej: 28013"
                      maxLength={5}
                      error={!!errors.postalCode}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                    )}
                  </div>

                  {/* País */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País *
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

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
                  <div className="flex gap-3 order-2 sm:order-1">
                    <Button onClick={prevStep} type="button" variant="outline" className="flex-1 sm:flex-initial">
                      Anterior
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={showPropertyPreview}
                      className="flex-1 sm:flex-initial"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                  </div>
                  <div className="flex flex-col items-center sm:items-end order-1 sm:order-2">
                    <Button 
                      onClick={nextStep} 
                      type="button"
                      disabled={!validateStep(2)}
                      className="w-full sm:w-auto"
                    >
                      Siguiente
                    </Button>
                    {!validateStep(2) && (
                      <p className="text-sm text-red-600 mt-2 text-center sm:text-right">
                        Completa todos los campos obligatorios para continuar
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
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Información de Contacto
                </h2>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Importante:</strong> Esta información será usada para que los huéspedes puedan contactarte directamente desde el manual cuando necesiten ayuda.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Foto de perfil */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto de perfil de contacto
                    </label>
                    <ImageUpload
                      value={(() => {
                        console.log('🖼️ Host image value:', watchedValues.hostContactPhoto, typeof watchedValues.hostContactPhoto)
                        return watchedValues.hostContactPhoto
                      })()}
                      onChange={(imageUrl) => {
                        console.log('🖼️ Host image onChange called with:', imageUrl)
                        setValue('hostContactPhoto', imageUrl || undefined)
                      }}
                      placeholder="Subir foto de perfil"
                      variant="profile"
                      maxSize={5}
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Esta foto aparecerá cuando los huéspedes te contacten
                    </p>
                  </div>

                  {/* Nombre de contacto */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      Nombre completo *
                    </label>
                    <Input
                      {...register('hostContactName')}
                      placeholder="Tu nombre completo"
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
                      Teléfono WhatsApp *
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
                      Los huéspedes podrán contactarte via WhatsApp
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email de contacto *
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
                      Idioma preferido para comunicación
                    </label>
                    <select
                      {...register('hostContactLanguage')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
                  <div className="flex gap-3 order-2 sm:order-1">
                    <Button onClick={prevStep} type="button" variant="outline" className="flex-1 sm:flex-initial">
                      Anterior
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={!validateStep(3)}
                      onClick={showPropertyPreview}
                      className="flex-1 sm:flex-initial"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                  </div>
                  <div className="flex flex-col items-center sm:items-end order-1 sm:order-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !validateStep(3)}
                      loading={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting 
                        ? (isEditing ? 'Actualizando...' : 'Creando...') 
                        : (isEditing ? 'Actualizar Propiedad' : 'Crear Propiedad')
                      }
                    </Button>
                    {!validateStep(3) && (
                      <p className="text-sm text-red-600 mt-2 text-center sm:text-right">
                        Completa todos los campos obligatorios para {isEditing ? 'actualizar' : 'crear'} la propiedad
                      </p>
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