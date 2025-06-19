'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeft, 
  Save,
  Info,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '../../../../../../src/components/ui/Button'
import { Input } from '../../../../../../src/components/ui/Input'
import { Card } from '../../../../../../src/components/ui/Card'
// No need to import IconSelector, we'll use inline emoji selector

// Zone validation schema
const createZoneSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500, 'Máximo 500 caracteres'),
  icon: z.string().min(1, 'Selecciona un icono'),
  color: z.string().optional(),
  order: z.number().min(0, 'El orden debe ser un número positivo').optional()
})

type CreateZoneFormData = z.infer<typeof createZoneSchema>

// Predefined zone templates
const zoneTemplates = {
  entrance: { name: 'Entrada', icon: '🚪', color: 'bg-blue-100', description: 'Información sobre el acceso principal, llaves, códigos de entrada y zonas comunes.' },
  living_room: { name: 'Salón', icon: '🛋️', color: 'bg-green-100', description: 'Guía sobre el uso del salón, entretenimiento, televisión y normas de convivencia.' },
  kitchen: { name: 'Cocina', icon: '🍳', color: 'bg-yellow-100', description: 'Instrucciones sobre electrodomésticos, utensilios disponibles y normas de limpieza.' },
  bedroom: { name: 'Dormitorio', icon: '🛏️', color: 'bg-purple-100', description: 'Información sobre la habitación, ropa de cama, armarios y comodidades.' },
  bathroom: { name: 'Baño', icon: '🚿', color: 'bg-blue-100', description: 'Guía sobre el uso del baño, agua caliente, toallas y productos disponibles.' },
  garden: { name: 'Jardín', icon: '🌳', color: 'bg-green-100', description: 'Normas de uso del jardín, barbacoa, piscina y zonas exteriores.' },
  garage: { name: 'Garaje', icon: '🚗', color: 'bg-gray-100', description: 'Información sobre aparcamiento, acceso y normas del garaje.' },
  pool: { name: 'Piscina', icon: '🏊', color: 'bg-cyan-100', description: 'Horarios de uso, normas de seguridad y mantenimiento de la piscina.' },
  wifi: { name: 'WiFi', icon: '📶', color: 'bg-violet-100', description: 'Contraseña de WiFi, dispositivos inteligentes y solución de problemas de conexión.' },
  appliances: { name: 'Electrodomésticos', icon: '🔌', color: 'bg-orange-100', description: 'Guía de uso de lavadora, lavavajillas, microondas y otros electrodomésticos.' },
  security: { name: 'Seguridad', icon: '🔒', color: 'bg-red-100', description: 'Sistemas de seguridad, alarmas, cámaras y procedimientos de emergencia.' },
  rules: { name: 'Normas', icon: '📋', color: 'bg-pink-100', description: 'Normas de la casa, horarios de silencio, política de mascotas y otras reglas.' }
}

// Available colors for zones
const zoneColors = [
  { value: 'bg-red-100', label: 'Rojo', color: '#FEE2E2' },
  { value: 'bg-orange-100', label: 'Naranja', color: '#FED7AA' },
  { value: 'bg-yellow-100', label: 'Amarillo', color: '#FEF3C7' },
  { value: 'bg-green-100', label: 'Verde', color: '#D1FAE5' },
  { value: 'bg-blue-100', label: 'Azul', color: '#DBEAFE' },
  { value: 'bg-violet-100', label: 'Violeta', color: '#EDE9FE' },
  { value: 'bg-purple-100', label: 'Púrpura', color: '#F3E8FF' },
  { value: 'bg-pink-100', label: 'Rosa', color: '#FCE7F3' },
  { value: 'bg-gray-100', label: 'Gris', color: '#F3F4F6' },
  { value: 'bg-cyan-100', label: 'Cian', color: '#CFFAFE' }
]

export default function NewZonePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const propertyId = params.id as string
  const templateId = searchParams.get('template')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [propertyName, setPropertyName] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateZoneFormData>({
    resolver: zodResolver(createZoneSchema),
    defaultValues: {
      color: 'bg-gray-100',
      order: 0
    }
  })

  const watchedValues = watch()

  // Load template if provided
  useEffect(() => {
    if (templateId && zoneTemplates[templateId as keyof typeof zoneTemplates]) {
      const template = zoneTemplates[templateId as keyof typeof zoneTemplates]
      setValue('name', template.name)
      setValue('icon', template.icon)
      setValue('color', template.color)
      setValue('description', template.description)
    }
  }, [templateId, setValue])

  // Fetch property name
  useEffect(() => {
    fetchPropertyName()
  }, [propertyId])

  const fetchPropertyName = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      const result = await response.json()
      
      if (response.ok && result.data) {
        setPropertyName(result.data.name)
      }
    } catch (error) {
      console.error('Error fetching property:', error)
    }
  }

  const onSubmit = async (data: CreateZoneFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/properties/${propertyId}/zones`, {
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
        throw new Error(result.error || 'Error al crear la zona')
      }
      
      // Redirect to the property edit page
      router.push(`/properties/${propertyId}`)
    } catch (error) {
      console.error('Error creating zone:', error)
      alert('Error al crear la zona. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/properties/${propertyId}/zones`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Zona</h1>
              <p className="text-gray-600 mt-1">
                {propertyName && `Crear nueva zona para ${propertyName}`}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-8">
            <div className="space-y-6">
              {/* Icon and Color Selection */}
              <div className="flex space-x-6">
                {/* Icon Selection */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono de la zona *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(zoneTemplates).slice(0, 12).map(([key, template]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setValue('icon', template.icon)}
                        className={`
                          p-3 border-2 rounded-lg transition-all text-2xl
                          ${watchedValues.icon === template.icon 
                            ? 'border-violet-500 bg-violet-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        title={template.name}
                      >
                        {template.icon}
                      </button>
                    ))}
                  </div>
                  {errors.icon && (
                    <p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>
                  )}
                </div>

                {/* Color Selection */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de fondo
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {zoneColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setValue('color', color.value)}
                        className={`
                          w-full h-10 rounded-lg border-2 transition-all
                          ${watchedValues.color === color.value 
                            ? 'border-violet-500 ring-2 ring-violet-200' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        style={{ backgroundColor: color.color }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-16 h-16 rounded-lg flex items-center justify-center text-3xl
                    ${watchedValues.color || 'bg-gray-100'}
                  `}>
                    {watchedValues.icon || '📁'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {watchedValues.name || 'Nombre de la zona'}
                    </h3>
                    <p className="text-sm text-gray-600">0 pasos</p>
                  </div>
                </div>
              </div>

              {/* Zone Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la zona *
                </label>
                <Input
                  {...register('name')}
                  placeholder="Ej: Cocina principal"
                  error={!!errors.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe qué información contendrá esta zona del manual..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Order */}
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
                  Las zonas se mostrarán ordenadas de menor a mayor
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Siguiente paso:</strong> Después de crear la zona, podrás añadir pasos con 
                      instrucciones detalladas, imágenes y videos para guiar a tus huéspedes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <Link href={`/properties/${propertyId}/zones`}>
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
                {isSubmitting ? 'Creando...' : 'Crear Zona'}
              </Button>
            </div>
          </Card>
        </form>

        {/* Quick Templates */}
        {!templateId && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Plantillas Rápidas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(zoneTemplates).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setValue('name', template.name)
                    setValue('icon', template.icon)
                    setValue('color', template.color)
                    setValue('description', template.description)
                  }}
                  className="p-3 border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition-all duration-200 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-2 ${template.color}`}>
                    {template.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{template.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}