'use client'

import React, { useState, useEffect, Suspense } from 'react'
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
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../src/components/ui/Button'
import { Input } from '../../../../src/components/ui/Input'
import { Card } from '../../../../src/components/ui/Card'
import { ImageUpload } from '../../../../src/components/ui/ImageUpload'
import { useFormPersistence } from '../../../../src/hooks/useFormPersistence'
import { useAuth } from '../../../../src/providers/AuthProvider'

// PropertySetType as string literal type
type PropertySetType = 'HOTEL' | 'BUILDING' | 'COMPLEX' | 'RESORT' | 'HOSTEL' | 'APARTHOTEL'

// Validation schema
const createPropertySetSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'Máximo 1000 caracteres'),
  type: z.enum(['HOTEL', 'BUILDING', 'COMPLEX', 'RESORT', 'HOSTEL', 'APARTHOTEL']),
  
  // Dirección
  street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  state: z.string().min(2, 'La provincia debe tener al menos 2 caracteres'),
  country: z.string().default('España'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Código postal debe tener 5 dígitos'),
  
  // Imagen del conjunto
  profileImage: z.string().optional(),
  
  // Contacto del host
  hostContactName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Máximo 100 caracteres'),
  hostContactPhone: z.string().regex(/^[+]?[(]?[0-9\s\-()]{9,}$/, 'Teléfono inválido'),
  hostContactEmail: z.string().email('Email inválido'),
  hostContactLanguage: z.string().default('es'),
  hostContactPhoto: z.string().optional(),
  
  // Selected properties
  selectedProperties: z.array(z.string()).optional()
})

type CreatePropertySetFormData = z.infer<typeof createPropertySetSchema>

const propertySetTypes = [
  { value: 'HOTEL', label: 'Hotel', icon: Building2 },
  { value: 'BUILDING', label: 'Edificio', icon: Building2 },
  { value: 'COMPLEX', label: 'Complejo', icon: Building2 },
  { value: 'RESORT', label: 'Resort', icon: Building2 },
  { value: 'HOSTEL', label: 'Hostel', icon: Building2 },
  { value: 'APARTHOTEL', label: 'Aparthotel', icon: Building2 }
] as const

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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])

  // Redirect to new URL structure  
  useEffect(() => {
    // Only redirect if we're actually on the old URL path
    if (typeof window !== 'undefined' && window.location.pathname === '/property-sets/new') {
      const query = editId ? `?edit=${editId}` : ''
      router.replace(`/properties/groups/new${query}`)
    }
  }, [router, editId])

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
      try {
        const response = await fetch('/api/properties')
        const result = await response.json()
        
        if (response.ok && result.data) {
          setAvailableProperties(result.data)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
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
            alert('Error al cargar los datos del conjunto')
            router.push('/properties')
          }
        } catch (error) {
          console.error('Error loading property set:', error)
          alert('Error al cargar los datos del conjunto')
          router.push('/properties')
        } finally {
          setIsLoading(false)
        }
      }
      
      loadPropertySetData()
    }
  }, [isEditing, editId, reset, router, setValue])

  const onSubmit = async (data: CreatePropertySetFormData) => {
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
        throw new Error(result.error || `Error al ${isEditing ? 'actualizar' : 'crear'} el conjunto`)
      }
      
      console.log(`Conjunto ${isEditing ? 'actualizado' : 'creado'} exitosamente:`, result.data)
      
      // Clear saved data and redirect
      handleSuccessfulSubmit()
    } catch (error) {
      console.error(`Error ${isEditing ? 'actualizando' : 'creando'} conjunto:`, error)
      alert(`Error al ${isEditing ? 'actualizar' : 'crear'} el conjunto. Por favor, inténtalo de nuevo.`)
    } finally {
      setIsSubmitting(false)
    }
  }

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
    router.push('/properties')
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

  // Filter available properties (exclude those already in other sets)
  const selectableProperties = availableProperties.filter(property => 
    !property.propertySetId || property.propertySetId === editId
  )

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/properties">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Editar Conjunto' : 'Nuevo Conjunto de Propiedades'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? 'Actualiza la información de tu conjunto'
                  : 'Agrupa múltiples propiedades bajo una misma gestión'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Cargando datos del conjunto...</span>
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
                  {step === 1 && 'Información Básica'}
                  {step === 2 && 'Ubicación'}
                  {step === 3 && 'Contacto'}
                  {step === 4 && 'Propiedades'}
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
                  Información Básica
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del conjunto *
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="Ej: Hotel Vista Mar, Complejo Residencial Los Pinos"
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
                      placeholder="Describe tu conjunto de propiedades, sus características principales..."
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
                      Tipo de establecimiento *
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
                      Foto principal del conjunto
                    </label>
                    <ImageUpload
                      value={watchedValues.profileImage}
                      onChange={(imageUrl) => setValue('profileImage', imageUrl || undefined)}
                      placeholder="Subir foto del conjunto"
                      variant="property"
                      maxSize={10}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Esta será la imagen principal del conjunto
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button 
                    onClick={nextStep} 
                    type="button"
                    disabled={!validateStep(1)}
                  >
                    Siguiente
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
                  Ubicación
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dirección */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Dirección completa *
                    </label>
                    <Input
                      {...register('street')}
                      placeholder="Avenida del Mar, 123"
                      error={!!errors.street}
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <Input
                      {...register('city')}
                      placeholder="Madrid"
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
                      placeholder="Madrid"
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
                      placeholder="28001"
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

                <div className="flex justify-between mt-8">
                  <Button onClick={prevStep} type="button" variant="outline">
                    Anterior
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    type="button"
                    disabled={!validateStep(2)}
                  >
                    Siguiente
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
                  Información de Contacto
                </h2>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Importante:</strong> Esta información será usada para el contacto principal del conjunto de propiedades.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Foto de perfil */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto de perfil de contacto
                    </label>
                    <ImageUpload
                      value={watchedValues.hostContactPhoto}
                      onChange={(imageUrl) => setValue('hostContactPhoto', imageUrl || undefined)}
                      placeholder="Subir foto de perfil"
                      variant="profile"
                      maxSize={5}
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Esta foto aparecerá cuando los huéspedes contacten
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

                <div className="flex justify-between mt-8">
                  <Button onClick={prevStep} type="button" variant="outline">
                    Anterior
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    type="button"
                    disabled={!validateStep(3)}
                  >
                    Siguiente
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
                  Seleccionar Propiedades
                </h2>
                
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>💡 Consejo:</strong> Selecciona las propiedades que pertenecen a este conjunto. Puedes dejarlo vacío y agregar propiedades más tarde.
                  </p>
                </div>

                {selectableProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay propiedades disponibles
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Crea algunas propiedades primero para poder agregarlas al conjunto
                    </p>
                    <Link href="/properties/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primera Propiedad
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
                            <p className="text-xs text-gray-500">{property.type}</p>
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

                <div className="flex justify-between mt-8">
                  <Button onClick={prevStep} type="button" variant="outline">
                    Anterior
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting 
                      ? (isEditing ? 'Actualizando...' : 'Creando...') 
                      : (isEditing ? 'Actualizar Conjunto' : 'Crear Conjunto')
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