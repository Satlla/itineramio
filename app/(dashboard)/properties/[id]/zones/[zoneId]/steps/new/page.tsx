'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeft, 
  Save,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Eye,
  Clock,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../../../../../../src/components/ui/Button'
import { Input } from '../../../../../../../../src/components/ui/Input'
import { Card } from '../../../../../../../../src/components/ui/Card'
import { ImageUpload } from '../../../../../../../../src/components/ui/ImageUpload'

// Step validation schema
const createStepSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'Máximo 1000 caracteres').optional(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'LINK']),
  content: z.string().min(5, 'El contenido debe tener al menos 5 caracteres').optional(),
  mediaUrl: z.string().optional(),
  linkUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  estimatedTime: z.number().min(1, 'Mínimo 1 minuto').max(60, 'Máximo 60 minutos').optional(),
  order: z.number().min(0).optional()
}).refine((data) => {
  // Require either description or content
  return data.description || data.content
}, {
  message: 'Se requiere descripción o contenido',
  path: ['content']
})

type CreateStepFormData = z.infer<typeof createStepSchema>

const stepTypes = [
  {
    value: 'TEXT' as const,
    label: 'Texto',
    icon: FileText,
    description: 'Instrucciones de texto con formato'
  },
  {
    value: 'IMAGE' as const,
    label: 'Imagen',
    icon: ImageIcon,
    description: 'Foto con explicación'
  },
  {
    value: 'VIDEO' as const,
    label: 'Video',
    icon: Video,
    description: 'Video instructivo'
  },
  {
    value: 'LINK' as const,
    label: 'Enlace',
    icon: LinkIcon,
    description: 'Enlace a recurso externo'
  }
]

export default function NewStepPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const zoneId = params.zoneId as string
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zoneName, setZoneName] = useState('')
  const [propertyName, setPropertyName] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateStepFormData>({
    resolver: zodResolver(createStepSchema),
    defaultValues: {
      type: 'TEXT',
      estimatedTime: 2,
      order: 0
    }
  })

  const watchedValues = watch()
  const selectedType = watch('type')

  // Fetch zone and property names
  useEffect(() => {
    fetchZoneData()
  }, [propertyId, zoneId])

  const fetchZoneData = async () => {
    try {
      const [zoneResponse, propertyResponse] = await Promise.all([
        fetch(`/api/properties/${propertyId}/zones/${zoneId}`),
        fetch(`/api/properties/${propertyId}`)
      ])
      
      const [zoneResult, propertyResult] = await Promise.all([
        zoneResponse.json(),
        propertyResponse.json()
      ])
      
      if (zoneResponse.ok && zoneResult.data) {
        setZoneName(zoneResult.data.name)
      }
      
      if (propertyResponse.ok && propertyResult.data) {
        setPropertyName(propertyResult.data.name)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const onSubmit = async (data: CreateStepFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps/safe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'ACTIVE'
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el paso')
      }
      
      // Redirect back to zone page
      router.push(`/properties/${propertyId}/zones/${zoneId}`)
    } catch (error) {
      console.error('Error creating step:', error)
      alert('Error al crear el paso. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (type: CreateStepFormData['type']) => {
    setValue('type', type)
    // Clear type-specific fields when changing type
    setValue('content', '')
    setValue('mediaUrl', '')
    setValue('linkUrl', '')
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: \'calc(4rem + env(safe-area-inset-top, 0px))\' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/properties/${propertyId}/zones/${zoneId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevo Paso</h1>
              <p className="text-gray-600 mt-1">
                {propertyName && zoneName && `${propertyName} > ${zoneName}`}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => alert('Vista previa próximamente')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step Type Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tipo de Paso
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stepTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedType === type.value
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <IconComponent className="w-8 h-8 mb-3" />
                    <h3 className="font-medium mb-1">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información Básica
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del paso *
                </label>
                <Input
                  {...register('title')}
                  placeholder="Ej: Cómo usar la lavadora"
                  error={!!errors.title}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción breve
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Descripción breve de lo que aprenderá el huésped..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Opcional - puedes añadir contenido detallado más abajo
                </p>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Tiempo estimado (minutos)
                </label>
                <Input
                  type="number"
                  {...register('estimatedTime', { valueAsNumber: true })}
                  min="1"
                  max="60"
                  placeholder="2"
                  error={!!errors.estimatedTime}
                />
                {errors.estimatedTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedTime.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Tiempo que tardará el huésped en completar este paso
                </p>
              </div>
            </div>
          </Card>

          {/* Content Based on Type */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contenido del Paso
            </h2>

            {selectedType === 'TEXT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido del texto *
                </label>
                <textarea
                  {...register('content')}
                  rows={8}
                  placeholder="Escribe las instrucciones detalladas para este paso..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.content ? 'border-red-300' : ''
                  }`}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Puedes usar formato markdown para dar estilo al texto
                </p>
              </div>
            )}

            {selectedType === 'IMAGE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen *
                  </label>
                  <ImageUpload
                    value={watchedValues.mediaUrl}
                    onChange={(imageUrl) => setValue('mediaUrl', imageUrl || '')}
                    placeholder="Subir imagen instructiva"
                    variant="property"
                    maxSize={10}
                    error={!!errors.mediaUrl}
                  />
                  {errors.mediaUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.mediaUrl.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explicación de la imagen *
                  </label>
                  <textarea
                    {...register('content')}
                    rows={4}
                    placeholder="Describe lo que muestra la imagen y las instrucciones..."
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                      errors.content ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            )}

            {selectedType === 'VIDEO' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del video *
                  </label>
                  <Input
                    {...register('mediaUrl')}
                    placeholder="https://youtube.com/watch?v=..."
                    error={!!errors.mediaUrl}
                  />
                  {errors.mediaUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.mediaUrl.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Soportamos YouTube, Vimeo y enlaces directos a videos
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del video *
                  </label>
                  <textarea
                    {...register('content')}
                    rows={4}
                    placeholder="Describe qué muestra el video y qué aprenderá el huésped..."
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                      errors.content ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            )}

            {selectedType === 'LINK' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del enlace *
                  </label>
                  <Input
                    {...register('linkUrl')}
                    placeholder="https://ejemplo.com"
                    error={!!errors.linkUrl}
                  />
                  {errors.linkUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkUrl.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del enlace *
                  </label>
                  <textarea
                    {...register('content')}
                    rows={4}
                    placeholder="Explica qué encontrará el huésped en este enlace y por qué es útil..."
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                      errors.content ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Order */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configuración Avanzada
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden de aparición
              </label>
              <Input
                type="number"
                {...register('order', { valueAsNumber: true })}
                min="0"
                placeholder="0"
                error={!!errors.order}
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Los pasos se mostrarán ordenados de menor a mayor
              </p>
            </div>
          </Card>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Consejo:</strong> Crea pasos claros y concisos. Los huéspedes agradecen 
                  instrucciones específicas con imágenes o videos cuando sea necesario.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Link href={`/properties/${propertyId}/zones/${zoneId}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creando...' : 'Crear Paso'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}