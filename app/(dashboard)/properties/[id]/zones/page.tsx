'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, QrCode, MoreVertical, MapPin, Copy, Share2, ExternalLink, FileText, X, CheckCircle, Info, Sparkles, Check, GripVertical, AlertTriangle, Star, Eye, Lightbulb, Bell } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'
import { Button } from '../../../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../src/components/ui/Card'
import { IconSelector, ZoneIconDisplay, useZoneIcon } from '../../../../../src/components/ui/IconSelector'
import { Input } from '../../../../../src/components/ui/Input'
import { QRCodeDisplay } from '../../../../../src/components/ui/QRCodeDisplay'
import { ElementSelector } from '../../../../../src/components/ui/ElementSelector'
import { ZoneInspirationManager } from '../../../../../src/components/ui/ZoneInspirationManager'
import { ZoneStaticSuggestions } from '../../../../../src/components/ui/ZoneStaticSuggestions'
import { ZoneInspirationModal } from '../../../../../src/components/ui/ZoneInspirationModal'
import { StepEditor, Step } from '../../../../../src/components/ui/StepEditor'
import { MobileZoneToast } from '../../../../../src/components/ui/MobileZoneToast'
import { cn } from '../../../../../src/lib/utils'
import { useRouter } from 'next/navigation'
import { zoneTemplates, zoneCategories, ZoneTemplate } from '../../../../../src/data/zoneTemplates'
import { InspirationZone } from '../../../../../src/data/zoneInspiration'
import { useAuth } from '../../../../../src/providers/AuthProvider'
import { useNotifications } from '../../../../../src/hooks/useNotifications'
import { AnimatedLoadingSpinner } from '../../../../../src/components/ui/AnimatedLoadingSpinner'
import { InlineLoadingSpinner } from '../../../../../src/components/ui/InlineLoadingSpinner'
import { DeleteConfirmationModal } from '../../../../../src/components/ui/DeleteConfirmationModal'
import { DeletePropertyModal } from '../../../../../src/components/ui/DeletePropertyModal'
// ManualEjemploModal removed
import { crearZonasEsenciales, borrarTodasLasZonas } from '../../../../../src/utils/crearZonasEsenciales'
import { createBatchZones } from '../../../../../src/utils/createBatchZones'
import { ZonasEsencialesModal } from '../../../../../src/components/ui/ZonasEsencialesModal'
import { CopyZoneToPropertyModal } from '../../../../../src/components/ui/CopyZoneToPropertyModal'
// Removed unused imports
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { createPropertySlug, createZoneSlug, findPropertyBySlug } from '../../../../../src/lib/slugs'
import { getCleanZoneUrl } from '../../../../../src/lib/slug-resolver'
import { generateSlug } from '../../../../../src/lib/slug-utils'

interface Zone {
  id: string
  name: string
  description?: string
  iconId: string
  order: number
  stepsCount: number
  qrUrl: string
  lastUpdated: string
  slug?: string
}

export default function PropertyZonesPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  const router = useRouter()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [zones, setZones] = useState<Zone[]>([])
  const [propertyName, setPropertyName] = useState<string>('')
  const [propertySlug, setPropertySlug] = useState<string>('')
  const [propertyType, setPropertyType] = useState<string>('')
  const [propertyLocation, setPropertyLocation] = useState<string>('')
  const [propertyStatus, setPropertyStatus] = useState<string>('DRAFT')
  const [unreadEvaluations, setUnreadEvaluations] = useState<number>(0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedZoneForQR, setSelectedZoneForQR] = useState<Zone | null>(null)
  const [showPropertyQRModal, setShowPropertyQRModal] = useState(false)
  const [showElementSelector, setShowElementSelector] = useState(false)
  const [showInspirationModal, setShowInspirationModal] = useState(false)
  const [selectedInspirationZone, setSelectedInspirationZone] = useState<ZoneTemplate | null>(null)
  const [copied, setCopied] = useState(false)
  const [showStepEditor, setShowStepEditor] = useState(false)
  const [editingZoneForSteps, setEditingZoneForSteps] = useState<Zone | null>(null)
  const [loadingSteps, setLoadingSteps] = useState(false)
  const [currentSteps, setCurrentSteps] = useState<Step[]>([])
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null)
  const [isDeletingZone, setIsDeletingZone] = useState(false)
  
  // Delete property modal state
  const [showDeletePropertyModal, setShowDeletePropertyModal] = useState(false)
  const [isDeletingProperty, setIsDeletingProperty] = useState(false)
  
  // Copy zone modal state
  const [showCopyZoneModal, setShowCopyZoneModal] = useState(false)
  const [zoneToCopy, setZoneToCopy] = useState<Zone | null>(null)
  
  // Essential zones modal state
  const [showEssentialZonesModal, setShowEssentialZonesModal] = useState(false)
  const [hasShownEssentialZones, setHasShownEssentialZones] = useState(false)
  const [selectedEssentialZones, setSelectedEssentialZones] = useState<Set<string>>(new Set())
  
  // Welcome modal state for essential zones (first time users)
  
  // Zonas esenciales modal state
  const [showZonasEsencialesModal, setShowZonasEsencialesModal] = useState(false)
  const [hasCreatedEssentialZones, setHasCreatedEssentialZones] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Evaluations modal state
  const [evaluationsModalOpen, setEvaluationsModalOpen] = useState(false)
  const [propertyEvaluations, setPropertyEvaluations] = useState<any[]>([])
  const [loadingEvaluations, setLoadingEvaluations] = useState(false)
  const [debugModalShow, setDebugModalShow] = useState(false) // For testing modal visibility
  
  const [isCreatingZone, setIsCreatingZone] = useState(false)
  const [isUpdatingZone, setIsUpdatingZone] = useState(false)
  const [isLoadingZones, setIsLoadingZones] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconId: ''
  })
  const [isReordering, setIsReordering] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId)
    })
  }, [params])

  const essentialZones = [
    { id: 'check-in', name: 'Check In', icon: 'key', description: 'Instrucciones de entrada y llaves' },
    { id: 'check-out', name: 'Check Out', icon: 'exit', description: 'Instrucciones de salida' },
    { id: 'wifi', name: 'WiFi', icon: 'wifi', description: 'Contraseña y conexión a internet' },
    { id: 'parking', name: 'Parking', icon: 'car', description: 'Dónde aparcar y acceso' },
    { id: 'cocina', name: 'Cocina', icon: 'kitchen', description: 'Uso de electrodomésticos' },
    { id: 'climatizacion', name: 'Climatización', icon: 'thermometer', description: 'Aire acondicionado y calefacción' },
    { id: 'limpieza', name: 'Limpieza', icon: 'cleaning', description: 'Productos y rutinas de limpieza' },
    { id: 'normas', name: 'Normas de la Casa', icon: 'list', description: 'Reglas y convivencia' },
    { id: 'emergencias', name: 'Emergencias', icon: 'phone', description: 'Contactos de emergencia' },
    { id: 'transporte', name: 'Transporte', icon: 'bus', description: 'Cómo llegar y moverse' },
    { id: 'recomendaciones', name: 'Recomendaciones', icon: 'star', description: 'Restaurantes y lugares de interés' },
    { id: 'basura', name: 'Basura y Reciclaje', icon: 'trash', description: 'Gestión de residuos' }
  ]
  
  // Get zone-specific help text
  const getZoneHelpText = (zoneName: string): string => {
    const helpTexts: Record<string, string> = {
      'check-in': 'Indica a tus huéspedes cómo entrar a tu alojamiento, código de seguridad, pasos para entrar, códigos...',
      'check-out': 'Da instrucciones concretas de cómo abandonar el alojamiento. ¿Dónde dejan las llaves? ¿Tienen que avisarte?',
      'wifi': 'Comparte la contraseña del WiFi y explica cómo conectarse. Incluye el nombre de la red.',
      'parking': 'Explica dónde pueden aparcar, si necesitan código de acceso, horarios permitidos...',
      'cocina': 'Detalla cómo usar los electrodomésticos principales: horno, vitrocerámica, lavavajillas...',
      'lavadora': 'Instrucciones paso a paso para usar la lavadora. ¿Dónde está el detergente?',
      'aire acondicionado': 'Cómo encender/apagar, ajustar temperatura, usar el mando a distancia...',
      'calefacción': 'Explica el sistema de calefacción: termostato, radiadores, horarios...',
      'basura y reciclaje': '¿Dónde están los contenedores? ¿Qué días pasa la basura? ¿Cómo reciclar?',
      'normas de la casa': 'Horarios de silencio, política de mascotas, número máximo de huéspedes...'
    }
    
    return helpTexts[zoneName.toLowerCase()] || 'Añade instrucciones detalladas para ayudar a tus huéspedes.'
  }

  // Helper function to get zone text (for name, description, etc.)
  const getZoneText = (value: any, fallback: string = '') => {
    if (typeof value === 'string') {
      return value
    }
    if (value && typeof value === 'object') {
      return value.es || value.en || value.fr || fallback
    }
    return fallback
  }

  // Get zones that the user doesn't have and existing zones
  const getMissingZones = () => {
    const existingZoneNames = zones.map(z => getZoneText(z.name).toLowerCase())
    
    // Get top zones by popularity from essential category, excluding zones that already exist
    return zoneTemplates
      .filter(template => template.category === 'essential' || template.category === 'amenities')
      .filter(template => !existingZoneNames.includes(template.name.toLowerCase()))
      .filter(template => {
        // Filter out common essential zones that are likely already created
        const templateName = template.name.toLowerCase()
        return !existingZoneNames.some(existingName => 
          existingName.includes('check') || 
          existingName.includes('wifi') || 
          existingName.includes('parking') ||
          existingName.includes('cocina') ||
          existingName.includes('aires') ||
          existingName.includes('clima') ||
          existingName.includes('normas') ||
          templateName.includes(existingName) ||
          existingName.includes(templateName)
        )
      })
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8)
  }

  // Check if user has any zone that matches the template
  const findExistingZone = (templateName: string): Zone | undefined => {
    return zones.find(z => getZoneText(z.name).toLowerCase() === templateName.toLowerCase())
  }

  // Fetch property name and zones
  useEffect(() => {
    if (!id) return
    
    const fetchData = async () => {
      try {
        // Fetch property info
        const propResponse = await fetch(`/api/properties/${id}`)
        const propResult = await propResponse.json()
        
        // Check if property exists
        if (!propResponse.ok || !propResult.success || !propResult.data) {
          console.error('Property not found:', id)
          addNotification({
            type: 'error',
            title: 'Propiedad no encontrada',
            message: 'La propiedad que intentas acceder no existe o ha sido eliminada',
            read: false
          })
          // Redirect to properties list
          router.push('/properties')
          return
        }
        
        // Set property data
        setPropertyName(propResult.data.name)
        setPropertySlug(propResult.data.slug || '')
        setPropertyType(propResult.data.type || 'APARTMENT')
        setPropertyLocation(`${propResult.data.city}, ${propResult.data.state}`)
        setPropertyStatus(propResult.data.status || 'DRAFT')

        // Skip notifications for now to avoid 500 errors
        // Will be re-enabled once notification system is properly set up
        setUnreadEvaluations(0)

        // Fetch zones
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success && zonesResult.data) {
          let transformedZones: Zone[] = zonesResult.data.map((zone: any) => {
            // Use helper to get zone text
            const zoneName = getZoneText(zone.name)
            const zoneDescription = getZoneText(zone.description)

            const transformedZone = {
              id: zone.id,
              name: zoneName,
              description: zoneDescription,
              iconId: zone.icon, // API uses 'icon' field, UI expects 'iconId'
              order: zone.order || 0,
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://itineramio.com/guide/${id}/${zone.id}`,
              lastUpdated: zone.updatedAt ? new Date(zone.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              slug: zone.slug
            }

            console.log('🔄 Transformed zone on load:', {
              id: zone.id,
              name: zoneName,
              originalIcon: zone.icon,
              transformedIconId: transformedZone.iconId
            })

            return transformedZone
          })

          // Check if property has no zones and create essential zones automatically
          const hasExistingZones = transformedZones.length > 0
          const propertyZonesKey = `property_${id}_zones_created`
          const hasCreatedZonesForThisProperty = isClient && typeof window !== 'undefined' ? 
            !!window.localStorage.getItem(propertyZonesKey) : false
          
          // Debug logging for mobile troubleshooting
          console.log('🔍 Banner Debug Info:', {
            isClient,
            hasExistingZones,
            zonesLength: transformedZones.length,
            propertyZonesKey,
            hasCreatedZonesForThisProperty,
            windowExists: typeof window !== 'undefined',
            localStorage: typeof window !== 'undefined' ? window.localStorage : null
          })
          
          if (isClient && !hasExistingZones && !hasCreatedZonesForThisProperty) {
            // Property has no zones and we haven't created them yet
            // Show modal immediately and create zones in background
            const propertyWelcomeKey = `property_${id}_welcome_shown`
            const hasShownWelcome = typeof window !== 'undefined' ? 
              !!window.localStorage.getItem(propertyWelcomeKey) : false
            
            console.log('🎯 Welcome Modal Check:', {
              propertyWelcomeKey,
              hasShownWelcome,
              shouldShowModal: !hasShownWelcome
            })
            
            if (!hasShownWelcome) {
              // Show modal immediately with extra mobile debugging
              console.log('📱 Showing ZonasEsencialesModal...')
              setShowZonasEsencialesModal(true)
              setIsCreatingZone(true) // Show loading state
              
              // Create zones in background
              setTimeout(async () => {
                try {
                  const success = await crearZonasEsenciales(id)
                  if (success) {
                    // Mark that we've created zones for this property
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem(propertyZonesKey, 'true')
                      window.localStorage.setItem(propertyWelcomeKey, 'true')
                    }
                    
                    // Refetch zones to show them
                    const newResponse = await fetch(`/api/properties/${id}/zones`)
                    const newResult = await newResponse.json()
                    if (newResult.success) {
                      const newZones = newResult.data.map((zone: any) => {
                        const zoneName = getZoneText(zone.name)
                        const zoneDescription = getZoneText(zone.description)
                        return {
                          id: zone.id,
                          name: zoneName,
                          description: zoneDescription,
                          iconId: zone.icon,
                          order: zone.order || 0,
                          stepsCount: zone.steps?.length || 0,
                          qrUrl: `https://itineramio.com/guide/${id}/${zone.id}`,
                          lastUpdated: zone.updatedAt ? new Date(zone.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                          slug: zone.slug
                        }
                      })
                      setZones(newZones)
                      setHasCreatedEssentialZones(true) // Mark zones as ready
                    }
                  }
                } catch (error) {
                  console.error('Error creating essential zones:', error)
                } finally {
                  setIsCreatingZone(false) // Hide loading state
                }
              }, 1000) // Small delay to show modal first
            }
          }
          
          setZones(transformedZones)
          setIsLoadingZones(false)
          
          // Don't show welcome modal for properties that already have zones
          
          // REMOVED: No longer showing welcome modal for existing zones
          // System template detection and modal logic removed
          
          // Generate zone warnings after zones are loaded
          setTimeout(() => {
            if (transformedZones.length > 0) {
              // Generate warnings for zones
              transformedZones.forEach(zone => {
                // Check for empty zones
                if (zone.stepsCount === 0) {
                  addNotification({
                    type: 'warning',
                    title: `${propResult.data?.name || 'Propiedad'} - Zona sin configurar`,
                    message: `La zona "${getZoneText(zone.name)}" no tiene instrucciones configuradas`,
                    propertyId: id,
                    zoneId: zone.id,
                    read: false,
                    actionUrl: `/properties/${id}/zones/${zone.id}/steps`
                  })
                }
                
                // Check for zones with few steps
                if (zone.stepsCount > 0 && zone.stepsCount < 3) {
                  addNotification({
                    type: 'info',
                    title: `${propResult.data?.name || 'Propiedad'} - Zona incompleta`,
                    message: `La zona "${getZoneText(zone.name)}" solo tiene ${zone.stepsCount} paso(s). Considera añadir más información`,
                    propertyId: id,
                    zoneId: zone.id,
                    read: false,
                    actionUrl: `/properties/${id}/zones/${zone.id}/steps`
                  })
                }
              })
              
              // Add some demo notifications
              if (transformedZones.length > 2) {
                addNotification({
                  type: 'error',
                  title: `${propResult.data?.name || 'Propiedad'} - Error reportado`,
                  message: `Un huésped reportó que el código WiFi no funciona en la zona "${getZoneText(transformedZones[0].name)}"`,
                  propertyId: id,
                  zoneId: transformedZones[0].id,
                  read: false,
                  actionUrl: `/properties/${id}/zones/${transformedZones[0].id}/steps`
                })
              }
              
              // Success notification
              addNotification({
                type: 'info',
                title: `${propResult.data?.name || 'Propiedad'} - ¡Bienvenido!`,
                message: 'Tu manual digital está listo. Revisa las notificaciones para optimizarlo',
                propertyId: id,
                read: false
              })
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoadingZones(false)
      }
    }

    fetchData()
  }, [id, addNotification, isClient, router])

  const handleCreateZone = async () => {
    if (!formData.name || !formData.iconId) return

    // Check for duplicate zones
    const nameNormalized = formData.name.toLowerCase().trim();
    const nameClean = nameNormalized.replace(/[\s-_]/g, '');
    
    const isDuplicate = zones.some(zone => {
      const existingName = getZoneText(zone.name).toLowerCase().trim();
      const existingClean = existingName.replace(/[\s-_]/g, '');
      return existingName === nameNormalized || existingClean === nameClean;
    });

    if (isDuplicate) {
      addNotification({
        type: 'error',
        title: 'Zona duplicada',
        message: `Ya existe una zona con el nombre "${formData.name}". Por favor elige otro nombre.`,
        read: false
      });
      return;
    }

    setIsCreatingZone(true)
    try {
      const zoneData = {
        name: formData.name,
        description: formData.description || 'Nueva zona personalizada',
        icon: formData.iconId,
        color: 'bg-gray-100',
        status: 'ACTIVE'
      }

      const success = await createBatchZones(id, [zoneData])

      if (success) {
        // Refresh zones list
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success) {
          setZones(zonesResult.data)
        }
        
        setFormData({ name: '', description: '', iconId: '' })
        setShowCreateForm(false)
        setShowIconSelector(false)
      } else {
        alert('Error al crear la zona')
      }
    } catch (error) {
      console.error('Error creating zone:', error)
      alert('Error al crear la zona')
    } finally {
      setIsCreatingZone(false)
    }
  }

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone)
    setFormData({
      name: getZoneText(zone.name),
      description: getZoneText(zone.description),
      iconId: zone.iconId
    })
    setShowCreateForm(true)
  }

  const handleUpdateZone = async () => {
    if (!editingZone || !formData.name || !formData.iconId) return

    console.log('🔄 Updating zone with data:', {
      name: formData.name,
      description: formData.description,
      iconId: formData.iconId,
      editingZone: editingZone.id
    })

    setIsUpdatingZone(true)
    try {
      const response = await fetch(`/api/properties/${id}/zones/${editingZone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || '',
          iconId: formData.iconId,
          color: 'bg-gray-100',
          status: 'ACTIVE'
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Zone updated successfully, API response:', result.data)
        
        setZones(zones.map(zone => 
          zone.id === editingZone.id 
            ? {
                ...zone,
                name: formData.name,
                description: formData.description,
                iconId: formData.iconId,
                lastUpdated: new Date().toISOString().split('T')[0]
              }
            : zone
        ))

        console.log('✅ Local zones state updated')

        setEditingZone(null)
        setFormData({ name: '', description: '', iconId: '' })
        setShowCreateForm(false)
        setShowIconSelector(false)
      } else {
        console.error('Error updating zone:', result.error)
        alert(result.error || 'Error al actualizar la zona')
      }
    } catch (error) {
      console.error('Error updating zone:', error)
      alert('Error al actualizar la zona')
    } finally {
      setIsUpdatingZone(false)
    }
  }

  const handleDeleteZone = (zone: Zone) => {
    setZoneToDelete(zone)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!zoneToDelete) return

    setIsDeletingZone(true)
    
    try {
      const response = await fetch(`/api/properties/${id}/zones/${zoneToDelete.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const newZones = zones.filter(zone => zone.id !== zoneToDelete.id)
        setZones(newZones)
        
        // If user deletes all zones, mark that they have manually cleared them
        if (newZones.length === 0) {
          const propertyZonesKey = `property_${id}_zones_created`
          const propertyWelcomeKey = `property_${id}_welcome_shown`
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(propertyZonesKey, 'true') // Prevent auto-creation
            window.localStorage.setItem(propertyWelcomeKey, 'true') // Prevent welcome banner
          }
        }
        
        addNotification({
          type: 'info',
          title: '✅ Zona eliminada',
          message: `La zona "${getZoneText(zoneToDelete.name)}" ha sido eliminada correctamente`,
          read: false
        })
        setShowDeleteModal(false)
        setZoneToDelete(null)
      } else {
        console.error('Error deleting zone:', result.error)
        addNotification({
          type: 'error',
          title: '❌ Error al eliminar zona',
          message: result.error || 'No se pudo eliminar la zona. Inténtalo de nuevo.',
          read: false
        })
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
      addNotification({
        type: 'error',
        title: '❌ Error al eliminar zona',
        message: 'Error de conexión. Inténtalo de nuevo.',
        read: false
      })
    } finally {
      setIsDeletingZone(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setZoneToDelete(null)
    setIsDeletingZone(false)
  }

  const handleShowQR = (zone: Zone) => {
    setSelectedZoneForQR(zone)
    setShowQRModal(true)
  }

  const handleCopyZone = (zone: Zone) => {
    setZoneToCopy(zone)
    setShowCopyZoneModal(true)
  }

  const handleCopyComplete = (successCount: number, failedCount: number) => {
    setShowCopyZoneModal(false)
    setZoneToCopy(null)
    
    if (successCount > 0 && failedCount === 0) {
      addNotification({
        type: 'success',
        title: 'Zona copiada',
        message: `Zona copiada exitosamente a ${successCount} propiedad${successCount !== 1 ? 'es' : ''}`,
        read: false
      })
    } else if (successCount > 0 && failedCount > 0) {
      addNotification({
        type: 'warning',
        title: 'Copia parcial',
        message: `Zona copiada a ${successCount} propiedades, ${failedCount} fallaron`,
        read: false
      })
    } else if (failedCount > 0) {
      addNotification({
        type: 'error',
        title: 'Error al copiar',
        message: `Error al copiar la zona a ${failedCount} propiedad${failedCount !== 1 ? 'es' : ''}`,
        read: false
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', iconId: '' })
    setEditingZone(null)
    setShowCreateForm(false)
    setShowIconSelector(false)
  }

  const handleApplyTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: id
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Refresh zones data
        // In a real app, you would fetch zones from the API
        // For now, we'll simulate adding a new zone
        const newZone: Zone = {
          id: result.data.zoneId,
          name: 'Nueva Zona desde Plantilla',
          description: 'Zona creada desde plantilla',
          iconId: 'template',
          order: zones.length + 1,
          stepsCount: 5, // This would come from the API
          qrUrl: `https://itineramio.com/z/${Math.random().toString(36).substr(2, 6)}`,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
        
        setZones([...zones, newZone])
        setShowElementSelector(false)
        
        // Stay on zones page after creating zone
        console.log('✅ Zone created successfully, staying on zones page')
      } else {
        console.error('Error applying template:', result.error)
      }
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  const handleViewInspirationExample = (zone: ZoneTemplate) => {
    setSelectedInspirationZone(zone)
    setShowInspirationModal(true)
  }

  const handleUseTemplate = async (zoneTemplate: ZoneTemplate) => {
    try {
      const zoneData = {
        name: getZoneText(zoneTemplate.name),
        description: getZoneText(zoneTemplate.description, 'Descripción de la zona'),
        icon: zoneTemplate.icon,
        color: 'bg-gray-100',
        status: 'ACTIVE'
      }

      const success = await createBatchZones(id, [zoneData])

      if (success) {
        // Refresh zones list
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success) {
          setZones(zonesResult.data)
        }
        
        setShowInspirationModal(false)
        setSelectedInspirationZone(null)
      } else {
        alert('Error al crear la zona')
      }
    } catch (error) {
      console.error('Error creating zone:', error)
      alert('Error al crear la zona')
    }
  }

  const [showPredefineModal, setShowPredefineModal] = useState(false)

  const handleOpenMultiSelect = () => {
    console.log('🚀 handleOpenMultiSelect called')
    console.log('🚀 zones.length:', zones.length)
    console.log('🚀 hasShownEssentialZones:', hasShownEssentialZones)
    
    // Show essential zones modal when creating first zone
    if (zones.length === 0) {
      console.log('🚀 Showing essential zones modal')
      // Initialize all zones as selected
      setSelectedEssentialZones(new Set(essentialZones.map(z => z.id)))
      setShowEssentialZonesModal(true)
      setHasShownEssentialZones(true)
    } else {
      console.log('🚀 Showing element selector')
      setShowElementSelector(true)
    }
  }

  const handleCreateEssentialZones = async (selectedZoneIds: string[]) => {
    setIsCreatingZone(true)
    try {
      // Prepare zones data for batch creation
      const zonesToCreate = selectedZoneIds.map(zoneId => {
        const essentialZone = essentialZones.find(z => z.id === zoneId)
        if (!essentialZone) return null
        
        return {
          name: essentialZone.name,
          description: essentialZone.description,
          icon: essentialZone.icon,
          status: 'ACTIVE'
        }
      }).filter((zone): zone is NonNullable<typeof zone> => zone !== null)

      if (zonesToCreate.length === 0) {
        setShowEssentialZonesModal(false)
        setIsCreatingZone(false)
        return
      }

      // Use batch API for reliability
      console.log('🚀 Using BATCH API for essential zones creation')
      const success = await createBatchZones(id, zonesToCreate)
      
      if (success) {
        // Refetch zones to get the created ones
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        
        if (zonesResult.success && zonesResult.data) {
          const transformedZones: Zone[] = zonesResult.data.map((zone: any) => {
            const zoneName = getZoneText(zone.name)
            const zoneDescription = getZoneText(zone.description)
            return {
              id: zone.id,
              name: zoneName,
              description: zoneDescription,
              iconId: zone.icon,
              order: zone.order || 0,
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://itineramio.com/guide/${id}/${zone.id}`,
              lastUpdated: zone.updatedAt ? new Date(zone.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              slug: zone.slug
            }
          })
          
          setZones(transformedZones)
          addNotification({
            type: 'success',
            title: 'Zonas creadas',
            message: `${zonesToCreate.length} zonas esenciales creadas correctamente`,
            read: false
          })
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron crear las zonas esenciales',
          read: false
        })
      }
      
      setShowEssentialZonesModal(false)
    } catch (error) {
      console.error('Error creating essential zones:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al crear las zonas esenciales',
        read: false
      })
    } finally {
      setIsCreatingZone(false)
    }
  }

  // Handler for keeping the essential zones that were automatically created (defined later)

  // Handler for deleting all essential zones if user doesn't want them (defined later)

  const handleSelectMultipleElements = async (selectedElementIds: string[]) => {
    console.log('🎯 handleSelectMultipleElements called with:', selectedElementIds)
    console.log('🎯 Number of elements selected:', selectedElementIds.length)
    console.log('🎯 Current zones count:', zones.length)
    
    if (selectedElementIds.length === 0) {
      console.warn('⚠️ No elements selected')
      setShowElementSelector(false)
      return
    }
    
    setIsCreatingZone(true)
    
    // ALWAYS use batch API for reliability
    console.log('🚀 ALWAYS using BATCH API for reliability')
    try {
      const { apartmentElements } = await import('../../../../../src/data/apartmentElements')
      
      // Prepare zones data for batch creation
      const zonesToCreate = selectedElementIds.map(elementId => {
        const element = apartmentElements.find(e => e.id === elementId)
        if (!element) return null
        
        return {
          name: getZoneText(element.name),
          description: getZoneText(element.description),
          icon: element.icon,
          status: 'ACTIVE'
        }
      }).filter((zone): zone is NonNullable<typeof zone> => zone !== null)

      if (zonesToCreate.length === 0) {
        setShowElementSelector(false)
        setIsCreatingZone(false)
        return
      }

      // Use batch API for reliability
      const success = await createBatchZones(id, zonesToCreate)
      
      if (success) {
        // Refetch zones to get the created ones
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        
        if (zonesResult.success && zonesResult.data) {
          const transformedZones: Zone[] = zonesResult.data.map((zone: any) => {
            const zoneName = getZoneText(zone.name)
            const zoneDescription = getZoneText(zone.description)
            return {
              id: zone.id,
              name: zoneName,
              description: zoneDescription,
              iconId: zone.icon,
              order: zone.order || 0,
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://itineramio.com/guide/${id}/${zone.id}`,
              lastUpdated: zone.updatedAt ? new Date(zone.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              slug: zone.slug
            }
          })
          
          setZones(transformedZones)
          addNotification({
            type: 'success',
            title: 'Zonas creadas',
            message: `${zonesToCreate.length} zonas creadas correctamente`,
            read: false
          })
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron crear las zonas',
          read: false
        })
      }

      setShowElementSelector(false)
    } catch (error) {
      console.error('Error creating zones:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al crear los elementos',
        read: false
      })
    } finally {
      setIsCreatingZone(false)
    }
  }

  const handlePredefinedZonesChoice = async () => {
    setShowPredefineModal(false)
    setIsCreatingZone(true)
    
    // Get essential zones that don't exist yet
    const existingZoneNames = zones.map(z => getZoneText(z.name).toLowerCase())
    const commonZones = [
      { name: 'WiFi', iconId: 'wifi', description: 'Contraseña y conexión a internet' },
      { name: 'Check-in', iconId: 'door', description: 'Proceso de entrada y llaves' },
      { name: 'Check-out', iconId: 'exit', description: 'Proceso de salida' },
      { name: 'Cómo llegar', iconId: 'map-pin', description: 'Indicaciones para llegar al alojamiento' },
      { name: 'Información Básica', iconId: 'info', description: 'Información esencial del alojamiento' },
      { name: 'Climatización', iconId: 'thermometer', description: 'Aire acondicionado y calefacción' },
      { name: 'Aparcamiento', iconId: 'car', description: 'Dónde aparcar y cómo acceder' },
      { name: 'Normas', iconId: 'list', description: 'Normas de la casa y convivencia' },
      { name: 'Teléfonos de interés', iconId: 'phone', description: 'Emergencias y contactos útiles' }
    ].filter(zone => !existingZoneNames.includes(zone.name.toLowerCase()))

    try {
      if (commonZones.length === 0) {
        addNotification({
          type: 'info',
          title: 'Sin zonas nuevas',
          message: 'Ya tienes todas las zonas predefinidas',
          read: false
        })
        setIsCreatingZone(false)
        return
      }

      // Prepare zones data for batch creation
      const zonesToCreate = commonZones.map(zoneData => ({
        name: zoneData.name,
        description: zoneData.description,
        icon: zoneData.iconId,
        status: 'ACTIVE'
      }))

      // Use batch API for reliability
      console.log('🚀 Using BATCH API for predefined zones')
      const success = await createBatchZones(id, zonesToCreate)
      
      if (success) {
        // Refetch zones to get the created ones
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        
        if (zonesResult.success && zonesResult.data) {
          const transformedZones: Zone[] = zonesResult.data.map((zone: any) => {
            const zoneName = getZoneText(zone.name)
            const zoneDescription = getZoneText(zone.description)
            return {
              id: zone.id,
              name: zoneName,
              description: zoneDescription,
              iconId: zone.icon,
              order: zone.order || 0,
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://itineramio.com/guide/${id}/${zone.id}`,
              lastUpdated: zone.updatedAt ? new Date(zone.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              slug: zone.slug
            }
          })
          
          setZones(transformedZones)
          addNotification({
            type: 'success',
            title: 'Zonas creadas',
            message: `${commonZones.length} zonas predefinidas creadas correctamente`,
            read: false
          })
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron crear las zonas predefinidas',
          read: false
        })
      }
    } catch (error) {
      console.error('Error creating predefined zones:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al crear las zonas predefinidas',
        read: false
      })
    } finally {
      setIsCreatingZone(false)
    }
  }

  const handleCustomZonesChoice = () => {
    setShowPredefineModal(false)
    setShowElementSelector(true)
  }



  const handleSelectMultipleZones = async (zoneIds: string[]) => {
    setIsCreatingZone(true)
    try {
      // Create zones from templates via batch API
      const zonesToCreate = zoneIds.map(templateId => {
        const template = zoneTemplates.find(t => t.id === templateId)
        if (!template) return null
        
        return {
          name: getZoneText(template.name),
          description: getZoneText(template.description),
          icon: template.icon,
          color: 'bg-gray-100',
          status: 'ACTIVE'
        }
      }).filter(zone => zone !== null)

      const success = await createBatchZones(id, zonesToCreate)

      if (success) {
        // Refresh zones list
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success) {
          setZones(zonesResult.data)
        }
        
        setShowElementSelector(false)
      } else {
        alert('Error al crear las zonas')
      }
    } catch (error) {
      console.error('Error creating multiple zones:', error)
      alert('Error al crear las zonas')
    } finally {
      setIsCreatingZone(false)
    }
  }

  const handleCopyURL = async (zone: Zone) => {
    const url = `${window.location.origin}/guide/${id}/${zone.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleCreateZoneFromInspiration = async (inspiration: InspirationZone) => {
    // Check for duplicate zones
    const inspirationName = getZoneText(inspiration.name);
    const nameNormalized = inspirationName.toLowerCase().trim();
    const nameClean = nameNormalized.replace(/[\s-_]/g, '');
    
    const isDuplicate = zones.some(zone => {
      const existingNormalized = zone.name.toLowerCase().trim();
      const existingClean = existingNormalized.replace(/[\s-_]/g, '');
      return existingClean === nameClean;
    });

    if (isDuplicate) {
      addNotification({
        type: 'error',
        title: 'Zona duplicada',
        message: `Ya existe una zona "${inspirationName}" en esta propiedad.`,
        read: false
      });
      return;
    }

    setIsCreatingZone(true)
    try {
      const zoneData = {
        name: inspirationName,
        description: getZoneText(inspiration.description),
        icon: inspiration.icon,
        color: 'bg-gray-100',
        status: 'ACTIVE'
      }

      const success = await createBatchZones(id, [zoneData])

      if (success) {
        // Refresh zones list
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success) {
          const newZones = zonesResult.data
          setZones(newZones)
          
          // Find the newly created zone and open step editor
          const newZone = newZones.find((zone: Zone) => zone.name === getZoneText(inspiration.name))
          if (newZone) {
            setEditingZoneForSteps(newZone)
            setShowStepEditor(true)
          }
        }
      } else {
        alert('Error al crear la zona')
      }
    } catch (error) {
      console.error('Error creating zone from inspiration:', error)
      alert('Error al crear la zona')
    } finally {
      setIsCreatingZone(false)
    }
  }

  const handleCreateZoneFromTemplate = async (template: ZoneTemplate) => {
    // Check for duplicate zones
    const nameNormalized = template.name.toLowerCase().trim();
    const nameClean = nameNormalized.replace(/[\s-_]/g, '');
    
    const isDuplicate = zones.some(zone => {
      const existingName = getZoneText(zone.name).toLowerCase().trim();
      const existingClean = existingName.replace(/[\s-_]/g, '');
      return existingName === nameNormalized || existingClean === nameClean;
    });

    if (isDuplicate) {
      addNotification({
        type: 'error',
        title: 'Zona duplicada',
        message: `Ya existe una zona "${template.name}" en esta propiedad.`,
        read: false
      });
      return;
    }

    setIsCreatingZone(true)
    try {
      const zoneData = {
        name: template.name,
        description: template.description,
        icon: template.icon,
        color: 'bg-gray-100',
        status: 'ACTIVE'
      }

      const success = await createBatchZones(id, [zoneData])

      if (success) {
        // Refresh zones list
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success) {
          const newZones = zonesResult.data
          setZones(newZones)
          
          // Find the newly created zone and open step editor
          const newZone = newZones.find((zone: Zone) => zone.name === template.name)
          if (newZone) {
            setEditingZoneForSteps(newZone)
            setShowStepEditor(true)
          }
        }
      } else {
        alert('Error al crear la zona')
      }
    } catch (error) {
      console.error('Error creating zone from template:', error)
      alert('Error al crear la zona')
    } finally {
      setIsCreatingZone(false)
    }
  }

  // Zonas esenciales modal handlers - NEW FLOW
  const handleKeepEssentialZones = () => {
    // User accepts the zones that are already being created in background
    setShowZonasEsencialesModal(false)
    
    // Show success notification
    addNotification({
      type: 'success',
      title: '¡Perfecto!',
      message: 'Hemos creado las zonas esenciales para ti. Ahora puedes completarlas con información específica.',
      read: false
    })
    
    // Add notification about inactive property if it's in DRAFT status
    if (propertyStatus === 'DRAFT') {
      setTimeout(() => {
        addNotification({
          type: 'warning',
          title: '⚠️ Propiedad Inactiva',
          message: 'Tu propiedad está inactiva. Los huéspedes no podrán verla hasta que la actives. Completa las zonas y actívala cuando esté lista.',
          read: false,
          propertyId: id
        })
      }, 1000) // Delay to show after the first notification
    }
  }



  const loadZoneSteps = async (zoneId: string) => {
    setLoadingSteps(true)
    try {
      const response = await fetch(`/api/properties/${id}/zones/${zoneId}/steps`)
      const result = await response.json()
      
      if (result.success) {
        const transformedSteps: Step[] = result.data.map((apiStep: any, index: number) => ({
          id: apiStep.id,
          type: apiStep.type?.toLowerCase() || 'text',
          title: typeof apiStep.title === 'string' 
            ? { es: apiStep.title, en: '', fr: '' } 
            : apiStep.title || { es: '', en: '', fr: '' },
          content: typeof apiStep.content === 'string' 
            ? { es: apiStep.content, en: '', fr: '' } 
            : apiStep.content || { es: '', en: '', fr: '' },
          media: apiStep.mediaUrl ? {
            url: apiStep.mediaUrl,
            thumbnail: apiStep.thumbnail,
            title: apiStep.content?.es || 'Media'
          } : undefined,
          order: index
        }))
        
        setCurrentSteps(transformedSteps)
      } else {
        console.error('Error loading steps:', result.error)
        setCurrentSteps([])
      }
    } catch (error) {
      console.error('Error loading zone steps:', error)
      setCurrentSteps([])
    } finally {
      setLoadingSteps(false)
    }
  }

  const handleSaveSteps = async (steps: Step[]) => {
    console.log('🚨 ===== HANDLESAVESTEPS CALLED =====')
    console.log('🚨 editingZoneForSteps:', editingZoneForSteps)
    console.log('🚨 steps received:', steps)
    console.log('🚨 steps length:', steps?.length)
    
    if (!editingZoneForSteps) {
      console.log('❌ No editingZoneForSteps, returning early')
      return
    }
    
    console.log('💾 handleSaveSteps called with:', steps.length, 'steps')
    console.log('🔍 Raw steps data:', steps)

    try {
      // Transform steps to match API expectations
      const transformedSteps = steps.map((step, index) => {
        console.log(`📝 Processing step ${index}:`, step)
        
        // Create base API step
        const apiStep: any = {
          type: step.type?.toUpperCase() || 'TEXT',
          title: step.title || { es: '', en: '', fr: '' }, // Use actual title field
          content: step.content || {},
          order: index + 1
        }
        
        // Add media URL directly to step (not in content)
        if (step.media?.url) {
          console.log(`🎬 Step ${index} has media:`, {
            url: step.media.url,
            thumbnail: step.media.thumbnail,
            title: step.media.title
          })
          apiStep.mediaUrl = step.media.url
          if (step.media.thumbnail) {
            apiStep.thumbnail = step.media.thumbnail
          }
          if (step.media.title) {
            apiStep.mediaTitle = step.media.title
          }
        }
        
        console.log(`✅ Step ${index} transformed for API:`, apiStep)
        return apiStep
      })
      
      console.log('💾 Final payload for API:', transformedSteps)

      // Send debug data first
      try {
        const debugResponse = await fetch('/api/debug-video-flow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalSteps: steps,
            transformedSteps: transformedSteps,
            zoneId: editingZoneForSteps.id,
            timestamp: new Date().toISOString()
          })
        })
        const debugResult = await debugResponse.json()
        console.log('🐛 Debug response:', debugResult)
      } catch (debugError) {
        console.log('🐛 Debug endpoint failed:', debugError)
      }

      const response = await fetch(`/api/properties/${id}/zones/${editingZoneForSteps.id}/steps`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ steps: transformedSteps })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Update zone steps count
        setZones(zones.map(zone => 
          zone.id === editingZoneForSteps.id 
            ? { ...zone, stepsCount: steps.length, lastUpdated: new Date().toISOString().split('T')[0] }
            : zone
        ))
        
        setShowStepEditor(false)
        setEditingZoneForSteps(null)
      } else {
        console.error('Error saving steps:', result.error)
        alert(result.error || 'Error al guardar las instrucciones')
      }
    } catch (error) {
      console.error('Error saving steps:', error)
      alert('Error al guardar las instrucciones')
    }
  }

  const handleDeleteProperty = async () => {
    setIsDeletingProperty(true)
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        addNotification({
          type: 'info',
          title: 'Propiedad eliminada',
          message: `"${propertyName}" ha sido eliminada permanentemente`,
          read: false
        })
        router.push('/properties')
      } else {
        const result = await response.json()
        addNotification({
          type: 'error',
          title: 'Error al eliminar',
          message: result.error || 'No se pudo eliminar la propiedad',
          read: false
        })
        setShowDeletePropertyModal(false)
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor',
        read: false
      })
      setShowDeletePropertyModal(false)
    } finally {
      setIsDeletingProperty(false)
    }
  }

  // Evaluations modal functions
  const handleViewEvaluations = async () => {
    setEvaluationsModalOpen(true)
    setLoadingEvaluations(true)
    
    try {
      const response = await fetch(`/api/properties/${id}/evaluations`, {
        credentials: 'include'
      })
      const result = await response.json()
      
      if (result.success) {
        setPropertyEvaluations(result.data.evaluations)
      } else {
        console.error('Failed to fetch evaluations:', result.error)
        setPropertyEvaluations([])
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error)
      setPropertyEvaluations([])
    } finally {
      setLoadingEvaluations(false)
    }
  }

  const closeEvaluationsModal = () => {
    setEvaluationsModalOpen(false)
    setPropertyEvaluations([])
  }

  const handleToggleEvaluationPublic = async (evaluationId: string, isCurrentlyPublic: boolean) => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/toggle-public`, {
        method: 'PATCH',
        credentials: 'include'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setPropertyEvaluations(propertyEvaluations.map(evaluation => 
          evaluation.id === evaluationId 
            ? { ...evaluation, isPublic: !isCurrentlyPublic }
            : evaluation
        ))
      }
    } catch (error) {
      console.error('Error toggling evaluation visibility:', error)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = zones.findIndex((zone) => zone.id === active.id)
      const newIndex = zones.findIndex((zone) => zone.id === over?.id)
      
      const newZones = arrayMove(zones, oldIndex, newIndex)
      
      // Update local state immediately for smooth UI
      setZones(newZones)
      
      // Update orders in the backend
      setIsReordering(true)
      try {
        const zonesWithNewOrder = newZones.map((zone, index) => ({
          id: zone.id,
          order: index + 1
        }))
        
        const response = await fetch(`/api/properties/${id}/zones/order`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ zones: zonesWithNewOrder })
        })
        
        if (!response.ok) {
          // Revert changes if API call fails
          setZones(zones)
          addNotification({
            type: 'error',
            title: 'Error',
            message: 'No se pudo actualizar el orden de las zonas',
            read: false
          })
        } else {
          addNotification({
            type: 'info',
            title: 'Orden actualizado',
            message: 'El orden de las zonas se ha actualizado correctamente',
            read: false
          })
        }
      } catch (error) {
        console.error('Error updating zone order:', error)
        // Revert changes if there's an error
        setZones(zones)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar el orden de las zonas',
          read: false
        })
      } finally {
        setIsReordering(false)
      }
    }
  }

  // Sortable Zone Item Component
  function SortableZoneItem({ zone }: { zone: Zone }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: zone.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={`hover:shadow-lg transition-shadow cursor-pointer hover:border-violet-300 ${
            isDragging ? 'shadow-xl ring-2 ring-violet-400 z-50' : ''
          }`}
          onClick={() => {
            // Debug logging
            console.log('🔍 Zone click debug:', {
              zoneName: typeof zone.name === 'string' ? zone.name : (zone.name as any)?.es || 'Zone',
              zoneSlug: zone.slug,
              propertySlug: propertySlug,
              hasSlug: !!(zone.slug && propertySlug)
            })
            
            // Go directly to zone steps editor
            console.log('🚀 Opening steps editor for zone:', zone.id)
            setEditingZoneForSteps(zone)
            loadZoneSteps(zone.id).then(() => {
              setShowStepEditor(true)
            })
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between min-h-[80px]">
              {/* Left side - Zone info */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {/* Drag handle */}
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0 mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Zone icon */}
                <div className="flex-shrink-0 mt-1">
                  <ZoneIconDisplay iconId={zone.iconId} size="md" />
                </div>
                
                {/* Zone content */}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{getZoneText(zone.name)}</h3>
                  
                  <div className="flex flex-col space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Edit className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{zone.stepsCount}</span>
                      <span className="ml-1">steps</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-500 flex-shrink-0">Actualizado:</span>
                      <span className="ml-1 font-medium truncate">{zone.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Menu */}
              <div className="flex items-start pt-1 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="w-48 bg-white rounded-md border shadow-lg p-1 z-50">
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={async () => {
                          setEditingZoneForSteps(zone)
                          await loadZoneSteps(zone.id)
                          setShowStepEditor(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={() => handleEditZone(zone)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Configurar
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={() => handleCopyURL(zone)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar URL
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={() => handleShowQR(zone)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Ver Código QR
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={() => handleCopyZone(zone)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar zona
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-red-100 text-red-600 rounded cursor-pointer"
                        onSelect={() => handleDeleteZone(zone)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Mobile Zone Item Component for 2x2 grid
  function SortableZoneItemMobile({ zone }: { zone: Zone }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: zone.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={`hover:shadow-lg transition-shadow cursor-pointer hover:border-violet-300 h-full ${
            isDragging ? 'shadow-xl ring-2 ring-violet-400 z-50' : ''
          }`}
          onClick={async () => {
            // En móvil, ir directamente al editor de pasos
            setEditingZoneForSteps(zone)
            await loadZoneSteps(zone.id)
            setShowStepEditor(true)
          }}
        >
          <CardContent className="p-3">
            <div className="flex flex-col h-full">
              {/* Header with drag handle and menu */}
              <div className="flex items-center justify-between mb-3">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-3 h-3 text-gray-400" />
                </div>
                
                <div className="flex items-center ml-2" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="w-48 bg-white rounded-md border shadow-lg p-1 z-50">
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                          onSelect={() => handleEditZone(zone)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Configurar
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                          onSelect={() => handleCopyURL(zone)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar URL
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                          onSelect={() => handleShowQR(zone)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Ver Código QR
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                          onSelect={() => handleCopyZone(zone)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar zona
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-red-100 text-red-600 rounded cursor-pointer"
                          onSelect={() => handleDeleteZone(zone)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>

              {/* Zone content */}
              <div className="flex flex-col items-center text-center flex-1 min-h-[100px] justify-between">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="mb-3">
                    <ZoneIconDisplay iconId={zone.iconId} size="lg" />
                  </div>
                  
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 break-words px-1">
                    {getZoneText(zone.name)}
                  </h3>
                </div>
                
                <div className="flex items-center justify-center text-xs text-gray-600 flex-shrink-0">
                  <Edit className="w-3 h-3 mr-1 text-gray-400" />
                  <span className="font-medium">{zone.stepsCount}</span>
                  <span className="ml-1">steps</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Show loading spinner when loading zones
  if (isLoadingZones) {
    return <AnimatedLoadingSpinner text="Cargando zonas..." type="zones" />
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pb-24 lg:pb-6">
      {/* Inactive Property Banner */}
      {propertyStatus === 'DRAFT' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                Propiedad Inactiva - No visible para huéspedes
              </h3>
              <p className="text-sm text-amber-700 mb-2">
                Esta propiedad está actualmente inactiva. Los huéspedes no podrán acceder a los manuales hasta que la actives.
              </p>
              <p className="text-sm text-amber-700">
                <strong>Recomendación:</strong> Completa todas las zonas con sus instrucciones antes de activar la propiedad para ofrecer la mejor experiencia a tus huéspedes.
              </p>
            </div>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch(`/api/properties/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ status: 'ACTIVE' })
                  })
                  
                  const result = await response.json()
                  
                  if (response.ok && result.success) {
                    setPropertyStatus('ACTIVE')
                    addNotification({
                      type: 'info',
                      title: '✅ Propiedad Activada',
                      message: 'Tu propiedad ya está visible para los huéspedes',
                      read: false
                    })
                    
                    // Reload the page to ensure all data is updated
                    setTimeout(() => {
                      window.location.reload()
                    }, 1000)
                  } else {
                    console.error('Failed to activate property:', result.error)
                    addNotification({
                      type: 'error',
                      title: 'Error al activar',
                      message: result.error || 'No se pudo activar la propiedad',
                      read: false
                    })
                  }
                } catch (error) {
                  console.error('Error activating property:', error)
                  addNotification({
                    type: 'error',
                    title: 'Error',
                    message: 'No se pudo activar la propiedad',
                    read: false
                  })
                }
              }}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Activar Propiedad
            </Button>
          </div>
        </div>
      )}


      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Zonas de {propertyName || 'la Propiedad'}
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las diferentes zonas y sus códigos QR para facilitar la experiencia de tus huéspedes
          </p>
        </div>
        <div className="hidden lg:flex space-x-3">
          {/* Desktop buttons */}
          <Button
            onClick={handleViewEvaluations}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 relative"
          >
            <Star className="w-5 h-5 mr-2" />
            Evaluaciones
            {unreadEvaluations > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadEvaluations}
              </span>
            )}
          </Button>
          
          <Button
            onClick={() => router.push(`/properties/${id}/announcements`)}
            variant="outline"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <Bell className="w-5 h-5 mr-2" />
            Avisos
          </Button>
          
          <Button
            onClick={() => {
              const publicUrl = `${window.location.origin}/guide/${id}`
              window.open(publicUrl, '_blank')
            }}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50 flex items-center"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
            <span className="hidden sm:inline">Vista Pública</span>
          </Button>

          {/* Property Options Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="w-56 bg-white rounded-md border shadow-lg p-1 z-50">
                <DropdownMenu.Item
                  className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  onSelect={() => setShowPropertyQRModal(true)}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR del Apartamento Completo
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  onSelect={() => router.push(`/properties/new?edit=${id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Propiedad
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  onSelect={() => {
                    const publicUrl = `${window.location.origin}/guide/${id}`
                    navigator.clipboard.writeText(publicUrl).then(() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    })
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir Manual
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Mobile buttons - below text */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center gap-4">
          {/* Evaluaciones - Airbnb style */}
          <button
            onClick={handleViewEvaluations}
            className="text-black font-semibold text-sm underline underline-offset-4 hover:text-gray-700 transition-colors relative"
          >
            Evaluaciones
            {unreadEvaluations > 0 && (
              <span className="absolute -top-2 -right-0 translate-x-full bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-1">
                {unreadEvaluations}
              </span>
            )}
          </button>
          
          {/* Avisos */}
          <button
            onClick={() => router.push(`/properties/${id}/announcements`)}
            className="text-black font-semibold text-sm underline underline-offset-4 hover:text-gray-700 transition-colors"
          >
            Avisos
          </button>
          
          {/* Vista Pública */}
          <button
            onClick={() => {
              const publicUrl = `${window.location.origin}/guide/${id}`
              window.open(publicUrl, '_blank')
            }}
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Vista pública</span>
          </button>
          
          {/* QR Code */}
          <button
            onClick={() => setShowPropertyQRModal(true)}
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>QR</span>
          </button>
          
          {/* Compartir */}
          <button
            onClick={async () => {
              const shareUrl = `${window.location.origin}/guide/${id}`
              try {
                await navigator.clipboard.writeText(shareUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch {
                // Fallback
                const textArea = document.createElement('textarea')
                textArea.value = shareUrl
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }
            }}
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <Card className="mb-8">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-violet-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Zonas</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{zones.length}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">QR Codes</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{zones.length}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Edit className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Steps</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {zones.reduce((acc, zone) => acc + zone.stepsCount, 0)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="h-3 w-3 sm:h-4 sm:w-4 bg-orange-600 rounded-full"></div>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Última Act.</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Hoy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Section - Zones (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Mobile header for zones */}
          <div className="lg:hidden mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Tus zonas en {propertyName || 'la propiedad'}
            </h2>
          </div>

          {/* Desktop Add Elements Button - Above zones */}
          {zones.length > 0 && (
            <div className="hidden lg:block mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tus zonas
                </h2>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Zona Personalizada
                  </Button>
                  <Button
                    onClick={handleOpenMultiSelect}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Elementos Predefinidos
                  </Button>
                </div>
              </div>
            </div>
          )}
          <AnimatePresence>
            {zones.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Crea tu primer manual digital
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Añade zonas con instrucciones para que tus huéspedes tengan toda la información que necesitan.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50 flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Zona Personalizada
                  </Button>
                  <Button
                    onClick={handleOpenMultiSelect}
                    className="bg-violet-600 hover:bg-violet-700 flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Elementos Predefinidos
                  </Button>
                </div>
              </Card>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={zones.map(zone => zone.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {/* Desktop: vertical list, Mobile: 2x2 grid */}
                  <div className="hidden lg:block space-y-4">
                    {zones.map((zone) => (
                      <SortableZoneItem key={zone.id} zone={zone} />
                    ))}
                  </div>
                  
                  <div className="lg:hidden">
                    {/* Mobile: 2 rows with 2 columns each = 4 zones visible at once */}
                    <div className="grid grid-cols-2 grid-rows-2 gap-3 h-80">
                      {zones.slice(0, 4).map((zone) => (
                        <SortableZoneItemMobile key={zone.id} zone={zone} />
                      ))}
                    </div>
                    
                    {/* If more than 4 zones, show them in additional 2x2 grids */}
                    {zones.length > 4 && (
                      <div className="mt-6 space-y-6">
                        {Array.from({ length: Math.ceil((zones.length - 4) / 4) }, (_, index) => (
                          <div key={index} className="grid grid-cols-2 grid-rows-2 gap-3 h-80">
                            {zones.slice(4 + index * 4, 8 + index * 4).map((zone) => (
                              <SortableZoneItemMobile key={zone.id} zone={zone} />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section - Zone Suggestions (1/3 width on desktop, hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-1 overflow-hidden">
          <div className="lg:sticky lg:top-6 overflow-hidden">
            <ZoneStaticSuggestions
              existingZoneNames={zones.map(z => getZoneText(z.name))}
              onCreateZone={handleCreateZoneFromTemplate}
              onViewDetails={handleViewInspirationExample}
              maxVisible={6}
            />
          </div>
        </div>
      </div>

      {/* Zone Static Suggestions Section - Mobile Only */}
      {user && zones.length > 0 && (
        <div id="mobile-suggestions" className="mt-12 lg:hidden pb-24">
          <ZoneStaticSuggestions
            existingZoneNames={zones.map(z => getZoneText(z.name))}
            onCreateZone={handleCreateZoneFromTemplate}
            onViewDetails={handleViewInspirationExample}
            maxVisible={6}
          />
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-100 rounded-full mb-3">
                  <Plus className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingZone ? 'Editar Zona' : 'Crear Zona Personalizada'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {editingZone ? 'Modifica los detalles de tu zona' : 'Diseña una zona completamente personalizada con tu propio nombre e icono'}
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la zona
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Cocina, Baño, Entrada..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción de la zona"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono
                  </label>
                  <div className="flex items-center space-x-3">
                    <ZoneIconDisplay iconId={formData.iconId} size="md" />
                    <Button
                      variant="outline"
                      onClick={() => setShowIconSelector(true)}
                      className="flex-1"
                    >
                      {formData.iconId ? 'Cambiar Icono' : 'Seleccionar Icono'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingZone ? handleUpdateZone : handleCreateZone}
                  disabled={!formData.name || !formData.iconId || isCreatingZone || isUpdatingZone}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {(isCreatingZone || isUpdatingZone) ? (
                    <InlineLoadingSpinner />
                  ) : (
                    editingZone ? 'Actualizar' : 'Crear'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIconSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <IconSelector
                selectedIconId={formData.iconId}
                onSelect={(iconId) => {
                  setFormData({ ...formData, iconId })
                  setShowIconSelector(false)
                }}
                onClose={() => setShowIconSelector(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRModal && selectedZoneForQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">QR Code - {getZoneText(selectedZoneForQR.name)}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowQRModal(false)
                      setSelectedZoneForQR(null)
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <QRCodeDisplay
                  propertyId={id}
                  zoneId={selectedZoneForQR.id}
                  zoneName={getZoneText(selectedZoneForQR.name)}
                  size="lg"
                  showTitle={false}
                />
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Los huéspedes pueden escanear este código QR para acceder a las instrucciones de esta zona.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element Selector Modal */}
      <AnimatePresence>
        {showElementSelector && (
          <ElementSelector
            onClose={() => setShowElementSelector(false)}
            onSelectElements={handleSelectMultipleElements}
            existingElementNames={zones.map(z => getZoneText(z.name))}
            isLoading={isCreatingZone}
          />
        )}
      </AnimatePresence>

      {/* Property QR Modal */}
      <AnimatePresence>
        {showPropertyQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">QR Code - {propertyName}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPropertyQRModal(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <QRCodeDisplay
                  propertyId={id}
                  zoneName={propertyName}
                  size="lg"
                  showTitle={false}
                />
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Los huéspedes pueden escanear este código QR para acceder al manual completo del apartamento.
                  </p>
                  <div className="mt-3 flex justify-center">
                    <Button
                      onClick={() => {
                        const publicUrl = `${window.location.origin}/guide/${id}`
                        navigator.clipboard.writeText(publicUrl).then(() => {
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        })
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copiado!' : 'Copiar Enlace'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Inspiration Modal with examples and templates */}
      <ZoneInspirationModal
        isOpen={showInspirationModal}
        onClose={() => {
          setShowInspirationModal(false)
          setSelectedInspirationZone(null)
        }}
        template={selectedInspirationZone}
        onCreateZone={handleCreateZoneFromTemplate}
      />

      {/* Step Editor */}
      <AnimatePresence>
        {showStepEditor && editingZoneForSteps && (
          <StepEditor
            zoneTitle={getZoneText(editingZoneForSteps.name)}
            initialSteps={currentSteps}
            onSave={handleSaveSteps}
            onCancel={() => {
              setShowStepEditor(false)
              setEditingZoneForSteps(null)
              setCurrentSteps([])
            }}
            maxVideos={5}
            currentVideoCount={0}
            propertyId={id}
            zoneId={editingZoneForSteps.id}
          />
        )}
      </AnimatePresence>

      {/* Essential Zones Modal */}
      <AnimatePresence>
        {showEssentialZonesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEssentialZonesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎯 Zonas Esenciales para tu Apartamento
                </h2>
                <p className="text-gray-600 text-lg">
                  Te recomendamos estas zonas que más consultan los huéspedes. ¡Selecciona las que necesites para empezar!
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEssentialZones(new Set(essentialZones.map(z => z.id)))}
                  className="text-xs"
                >
                  ✅ Seleccionar todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEssentialZones(new Set())}
                  className="text-xs"
                >
                  ❌ Deseleccionar todas
                </Button>
                <div className="flex-1" />
                <span className="text-sm text-gray-500 self-center">
                  {selectedEssentialZones.size} de {essentialZones.length} seleccionadas
                </span>
              </div>

              {/* Essential Zones List */}
              <div className="space-y-3 mb-6">
                {essentialZones.map((zone, index) => {
                  const isSelected = selectedEssentialZones.has(zone.id)
                  return (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-violet-500 bg-violet-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const newSelected = new Set(selectedEssentialZones)
                        if (isSelected) {
                          newSelected.delete(zone.id)
                        } else {
                          newSelected.add(zone.id)
                        }
                        setSelectedEssentialZones(newSelected)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ZoneIconDisplay iconId={zone.icon} size="sm" />
                          <div>
                            <h4 className="font-medium text-gray-900">{zone.name}</h4>
                            <p className="text-sm text-gray-600">{zone.description}</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-violet-500 border-violet-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-violet-800">
                    <p className="font-medium mb-1">💡 ¿Por qué estas zonas son esenciales?</p>
                    <p>Basado en miles de apartamentos, estas son las zonas que más consultan los huéspedes. Tenerlas preparadas:</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>✅ Mejora la experiencia de tus huéspedes</li>
                      <li>✅ Reduce preguntas repetitivas</li>
                      <li>✅ Aumenta las valoraciones positivas</li>
                      <li>✅ Ahorra tiempo en comunicación</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    const selectedIds = Array.from(selectedEssentialZones)
                    
                    if (selectedIds.length > 0) {
                      handleCreateEssentialZones(selectedIds)
                    } else {
                      setShowEssentialZonesModal(false)
                    }
                  }}
                  disabled={isCreatingZone || selectedEssentialZones.size === 0}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3"
                >
                  {isCreatingZone ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creando zonas...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      🚀 Crear {selectedEssentialZones.size} zona{selectedEssentialZones.size !== 1 ? 's' : ''} seleccionada{selectedEssentialZones.size !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEssentialZonesModal(false)
                      setShowElementSelector(true)
                    }}
                    className="flex-1"
                  >
                    🎨 Prefiero elegir yo
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowEssentialZonesModal(false)}
                    className="flex-1 text-gray-500"
                  >
                    ❌ Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Fixed Bottom Navbar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="p-4">
          {zones.length === 0 ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="border-violet-200 text-violet-700 hover:bg-violet-50 flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Personalizada
              </Button>
              <Button
                onClick={handleOpenMultiSelect}
                className="bg-violet-600 hover:bg-violet-700 flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Predefinidas
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowElementSelector(true)}
                className="bg-violet-600 hover:bg-violet-700 flex-1"
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir Elementos
              </Button>
              <Button
                onClick={() => {
                  // Scroll to suggestions section
                  const suggestionsSection = document.querySelector('#mobile-suggestions')
                  if (suggestionsSection) {
                    suggestionsSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                variant="outline"
                className="w-12 h-12 p-0"
                title="Ver sugerencias"
              >
                <Lightbulb className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPredefineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-md"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    ¿Quieres que agreguemos zonas predefinidas?
                  </h3>
                  <p className="text-gray-600">
                    Podemos añadir las zonas más comunes (WiFi, Check-in, Check-out, etc.) o puedes elegir tú mismo qué zonas añadir.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handlePredefinedZonesChoice}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    Sí, añadir zonas predefinidas
                  </Button>
                  
                  <Button
                    onClick={handleCustomZonesChoice}
                    variant="outline"
                    className="w-full"
                  >
                    No, prefiero elegir yo las zonas
                  </Button>
                  
                  <Button
                    onClick={() => setShowPredefineModal(false)}
                    variant="ghost"
                    className="w-full text-gray-500"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileZoneToast
        existingZoneNames={zones.map(z => getZoneText(z.name))}
        onCreateZone={handleCreateZoneFromTemplate}
      />

      {isCreatingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <InlineLoadingSpinner text="Creando zona..." type="zones" />
          </div>
        </div>
      )}

      <ZonasEsencialesModal
        isOpen={showZonasEsencialesModal || debugModalShow}
        onClose={() => {
          setShowZonasEsencialesModal(false)
          setDebugModalShow(false)
        }}
        onKeepZones={handleKeepEssentialZones}
        userName={user?.name || user?.email || 'Usuario'}
        isLoading={isCreatingZone}
      />

      {/* Debug button to test modal in mobile - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => {
              console.log('🧪 Debug: Forcing modal show')
              setDebugModalShow(true)
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
          >
            🧪 Test Modal
          </button>
        </div>
      )}


      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar zona permanentemente"
        description="Esta acción eliminará permanentemente la zona y todo su contenido. Una vez eliminada, no podrás recuperar la información."
        itemName={zoneToDelete ? getZoneText(zoneToDelete.name) : ''}
        itemType="Zona"
        consequences={zoneToDelete ? [
          `${zoneToDelete.stepsCount} ${zoneToDelete.stepsCount === 1 ? 'paso' : 'pasos'} de instrucciones`,
          'Código QR y enlaces públicos',
          'Historial de visualizaciones',
          'Toda la configuración de la zona'
        ] : []}
        isLoading={isDeletingZone}
      />

      <DeletePropertyModal
        isOpen={showDeletePropertyModal}
        onClose={() => setShowDeletePropertyModal(false)}
        onConfirm={handleDeleteProperty}
        propertyName={propertyName}
        propertyType={propertyType}
        propertyLocation={propertyLocation}
        zonesCount={zones.length}
        totalSteps={zones.reduce((acc, zone) => acc + zone.stepsCount, 0)}
        totalViews={0} // TODO: Add property analytics
        totalRatings={0} // TODO: Add property ratings
        mediaCount={0} // TODO: Calculate media count
        createdDate={undefined} // TODO: Add property creation date
        isPublished={propertyStatus === 'ACTIVE'}
        isDeleting={isDeletingProperty}
      />

      <CopyZoneToPropertyModal
        isOpen={showCopyZoneModal}
        onClose={() => {
          setShowCopyZoneModal(false)
          setZoneToCopy(null)
        }}
        zoneName={zoneToCopy ? getZoneText(zoneToCopy.name) : ''}
        zoneId={zoneToCopy?.id || ''}
        currentPropertyId={id}
        onCopyComplete={handleCopyComplete}
      />

      {/* Evaluations Modal */}
      {evaluationsModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeEvaluationsModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Evaluaciones de {propertyName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gestiona las evaluaciones de los huéspedes
                </p>
              </div>
              <button
                onClick={closeEvaluationsModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingEvaluations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
                  <span className="ml-3 text-gray-600">Cargando evaluaciones...</span>
                </div>
              ) : propertyEvaluations.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Sin evaluaciones aún
                  </h4>
                  <p className="text-gray-600">
                    Los huéspedes aún no han dejado evaluaciones para esta propiedad
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {propertyEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < evaluation.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {evaluation.rating}/5
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            por {evaluation.userName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            evaluation.isPublic
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {evaluation.isPublic ? 'Pública' : 'Privada'}
                          </span>
                          <button
                            onClick={() => handleToggleEvaluationPublic(evaluation.id, evaluation.isPublic)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              evaluation.isPublic 
                                ? "border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50" 
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {evaluation.isPublic ? 'Hacer privada' : 'Hacer pública'}
                          </button>
                        </div>
                      </div>
                      
                      {evaluation.comment && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            "{evaluation.comment}"
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {evaluation.reviewType === 'zone' ? 'Evaluación de zona' : 'Evaluación general'}
                        </span>
                        <span>
                          {new Date(evaluation.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {propertyEvaluations.length > 0 && (
                    <span>
                      {propertyEvaluations.filter(e => e.isPublic).length} de {propertyEvaluations.length} evaluaciones públicas
                    </span>
                  )}
                </div>
                <button
                  onClick={closeEvaluationsModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}