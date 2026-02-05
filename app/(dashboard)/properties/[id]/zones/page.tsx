'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, QrCode, MoreVertical, MapPin, Copy, Share2, ExternalLink, FileText, X, CheckCircle, Info, Sparkles, Check, GripVertical, AlertTriangle, Star, Eye, Lightbulb, Bell, Hash, ChevronDown, ArrowLeft, BarChart3, Download } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import { zoneTemplates, zoneCategories, ZoneTemplate, getZoneTemplateText, MultilingualText } from '../../../../../src/data/zoneTemplates'
import { getZoneContentTemplate } from '../../../../../src/data/zone-content-templates'
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
import ZoneQRDesigner from '../../../../../src/components/zones/ZoneQRDesigner'
import { EvaluationsModal } from '../../../../../src/components/ui/EvaluationsModal'
import { PropertySetUpdateModal } from '../../../../../src/components/ui/PropertySetUpdateModal'
import { LanguageCompletionModal } from '../../../../../src/components/ui/LanguageCompletionModal'
// Removed unused imports
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { createPropertySlug, createZoneSlug, findPropertyBySlug } from '../../../../../src/lib/slugs'
import { getCleanZoneUrl } from '../../../../../src/lib/slug-resolver'
import { generateSlug } from '../../../../../src/lib/slug-utils'
import { useTranslation } from 'react-i18next'

interface Zone {
  id: string
  name: string
  description?: string
  iconId: string
  order: number
  steps?: any[] // Array of steps from API
  stepsCount: number
  qrUrl: string
  lastUpdated: string
  slug?: string
}

// Helper function to get zone text from i18n object or string
const getZoneText = (text: any, fallback: string = ''): string => {
  if (!text) return fallback
  if (typeof text === 'string') return text
  if (typeof text === 'object') {
    return text.es || text.en || text.fr || fallback
  }
  return fallback
}

// Helper function to transform zones from API response
// API returns 'icon' but UI expects 'iconId'
const transformZonesFromApi = (zonesData: any[], propertyId: string): Zone[] => {
  return zonesData.map((zone: any) => ({
    id: zone.id,
    name: getZoneText(zone.name),
    description: getZoneText(zone.description),
    iconId: zone.icon || zone.iconId || '', // API uses 'icon', transform to 'iconId'
    order: zone.order || 0,
    steps: zone.steps || [],
    stepsCount: zone.steps?.length || 0,
    qrUrl: `https://www.itineramio.com/guide/${propertyId}/${zone.id}`,
    lastUpdated: zone.updatedAt ? new Date(zone.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    slug: zone.slug
  }))
}

export default function PropertyZonesPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  const router = useRouter()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { t } = useTranslation('dashboard')
  const [zones, setZones] = useState<Zone[]>([])
  const [propertyName, setPropertyName] = useState<string>('')
  const [propertyCode, setPropertyCode] = useState<string>('')
  const [propertySlug, setPropertySlug] = useState<string>('')
  const [propertyType, setPropertyType] = useState<string>('')
  const [propertyLocation, setPropertyLocation] = useState<string>('')
  const [propertyStatus, setPropertyStatus] = useState<string>('DRAFT')
  const [propertySetId, setPropertySetId] = useState<string | null>(null)
  const [unreadEvaluations, setUnreadEvaluations] = useState<number>(0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedZoneForQR, setSelectedZoneForQR] = useState<Zone | null>(null)
  const [showQRDesigner, setShowQRDesigner] = useState(false)
  const [showPropertyQRModal, setShowPropertyQRModal] = useState(false)
  const [showElementSelector, setShowElementSelector] = useState(false)
  const [showInspirationModal, setShowInspirationModal] = useState(false)
  const [selectedInspirationZone, setSelectedInspirationZone] = useState<ZoneTemplate | null>(null)
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
  const [zoneCreationProgress, setZoneCreationProgress] = useState(0)
  const [totalZonesToCreate, setTotalZonesToCreate] = useState(11)
  
  // Evaluations modal state
  const [evaluationsModalOpen, setEvaluationsModalOpen] = useState(false)
  const [propertyEvaluations, setPropertyEvaluations] = useState<any[]>([])
  const [loadingEvaluations, setLoadingEvaluations] = useState(false)

  // Ref for zones section scroll
  const zonesContainerRef = useRef<HTMLDivElement>(null)

  // Language completion modal state
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [completedZoneName, setCompletedZoneName] = useState('')

  const [isCreatingZone, setIsCreatingZone] = useState(false)
  const [isUpdatingZone, setIsUpdatingZone] = useState(false)
  const [isLoadingZones, setIsLoadingZones] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    nameFr: '',
    description: '',
    iconId: ''
  })
  const [formNameLang, setFormNameLang] = useState<'es' | 'en' | 'fr'>('es')
  const [isReordering, setIsReordering] = useState(false)
  const [showCopiedBadge, setShowCopiedBadge] = useState(false)
  const [showEvaluationsModal, setShowEvaluationsModal] = useState(false)

  // Zone translations state
  const [editingTranslationsZoneId, setEditingTranslationsZoneId] = useState<string | null>(null)
  const [zoneTranslations, setZoneTranslations] = useState({ es: '', en: '', fr: '' })
  const [savingTranslations, setSavingTranslations] = useState(false)
  const [rawZonesData, setRawZonesData] = useState<Map<string, any>>(new Map())

  // Property Set Update Modal state
  const [showPropertySetModal, setShowPropertySetModal] = useState(false)
  const [propertySetProperties, setPropertySetProperties] = useState<Array<{ id: string; name: string }>>([])
  const [pendingStepsToSave, setPendingStepsToSave] = useState<Step[]>([])
  const [pendingZoneForSave, setPendingZoneForSave] = useState<Zone | null>(null)
  const [pendingOperation, setPendingOperation] = useState<'create' | 'update' | 'delete' | null>(null)
  const [pendingZoneData, setPendingZoneData] = useState<any>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts (prevents accidental drags)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms press required before drag starts (allows scroll)
        tolerance: 5, // 5px tolerance for slight finger movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Unwrap params Promise
  useEffect(() => {
    if (!id) {
      params.then(({ id: paramId }) => {
        setId(paramId)
      })
    }
  }, [params, id])


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
      .filter(template => !existingZoneNames.includes(getZoneTemplateText(template.name).toLowerCase()))
      .filter(template => {
        // Filter out common essential zones that are likely already created
        const templateName = getZoneTemplateText(template.name).toLowerCase()
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

  // Guard against duplicate fetches
  const hasFetchedDataRef = useRef(false)
  const isFetchingDataRef = useRef(false)

  // Fetch property name and zones
  useEffect(() => {
    if (!id) return
    // Guard against duplicate fetches (React StrictMode, etc.)
    if (hasFetchedDataRef.current || isFetchingDataRef.current) return
    isFetchingDataRef.current = true

    const fetchData = async () => {
      try {
        // Get auth headers for fetch requests
        const getAuthHeaders = (): HeadersInit => {
          const headers: HeadersInit = { 'Content-Type': 'application/json' }
          try {
            const token = localStorage.getItem('auth-token')
            if (token) {
              headers['Authorization'] = `Bearer ${token}`
            }
          } catch (e) {
            console.warn('Could not access localStorage for auth token')
          }
          return headers
        }

        // Fetch property info
        let propResponse = await fetch(`/api/properties/${id}`, {
          credentials: 'include',
          headers: getAuthHeaders()
        })
        let propResult = await propResponse.json()

        // If main endpoint fails, try safe endpoint
        if (!propResponse.ok || !propResult.success) {
          console.log('Main property endpoint failed, trying safe endpoint...')
          propResponse = await fetch(`/api/properties/${id}/safe`, {
            credentials: 'include',
            headers: getAuthHeaders()
          })
          propResult = await propResponse.json()
        }
        
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
        setPropertyCode(propResult.data.propertyCode || '')
        setPropertySlug(propResult.data.slug || '')
        setPropertyType(propResult.data.type || 'APARTMENT')
        setPropertyLocation(`${propResult.data.city}, ${propResult.data.state}`)
        setPropertyStatus(propResult.data.status || 'DRAFT')
        setPropertySetId(propResult.data.propertySetId || null)

        // Fetch property set properties if this property belongs to a set
        if (propResult.data.propertySetId) {
          try {
            console.log('🔗 Property belongs to set:', propResult.data.propertySetId)
            const setResponse = await fetch(`/api/property-sets/${propResult.data.propertySetId}`, {
              credentials: 'include',
              headers: getAuthHeaders()
            })
            if (setResponse.ok) {
              const setData = await setResponse.json()
              if (setData.success && setData.data && setData.data.properties) {
                console.log('🔗 Property set has', setData.data.properties.length, 'properties:', setData.data.properties.map((p: any) => p.name))
                setPropertySetProperties(
                  setData.data.properties.map((p: any) => ({
                    id: p.id,
                    name: p.name
                  }))
                )
              } else {
                console.log('⚠️ Property set data not found in response')
              }
            } else {
              console.log('⚠️ Failed to fetch property set data, status:', setResponse.status)
            }
          } catch (error) {
            console.error('Error fetching property set:', error)
          }
        } else {
          console.log('🏠 Property is NOT in a set (standalone property)')
        }

        // Skip notifications for now to avoid 500 errors
        // Will be re-enabled once notification system is properly set up
        setUnreadEvaluations(0)

        // Fetch zones
        let zonesResponse = await fetch(`/api/properties/${id}/zones`, {
          credentials: 'include',
          headers: getAuthHeaders()
        })
        let zonesResult = await zonesResponse.json()

        // If main zones endpoint fails, try safe endpoint
        if (!zonesResponse.ok || !zonesResult.success) {
          console.log('Main zones endpoint failed, trying safe endpoint...')
          zonesResponse = await fetch(`/api/properties/${id}/zones/safe`, {
            credentials: 'include',
            headers: getAuthHeaders()
          })
          zonesResult = await zonesResponse.json()
        }
        
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
              steps: zone.steps || [], // Preserve original steps array
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://www.itineramio.com/guide/${id}/${zone.id}`,
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
                  // Reset progress
                  setZoneCreationProgress(0)

                  const success = await crearZonasEsenciales(id, (current, total) => {
                    console.log(`📊 Progress: ${current}/${total}`)
                    setZoneCreationProgress(current)
                    setTotalZonesToCreate(total)
                  })
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
                          steps: zone.steps || [],
                          stepsCount: zone.steps?.length || 0,
                          qrUrl: `https://www.itineramio.com/guide/${id}/${zone.id}`,
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
      } finally {
        hasFetchedDataRef.current = true
        isFetchingDataRef.current = false
      }
    }

    fetchData()
  }, [id, addNotification, isClient, router])

  const handleCreateZone = async () => {
    if (!formData.name || !formData.iconId) return

    console.log('🆕 CREATE ZONE - Starting')
    console.log('🆕 propertySetId:', propertySetId)
    console.log('🆕 propertySetProperties.length:', propertySetProperties.length)

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

    const zoneData = {
      name: formData.name,
      description: formData.description || 'Nueva zona personalizada',
      icon: formData.iconId,
      color: 'bg-gray-100',
      status: 'ACTIVE'
    }

    // If property is in a set with multiple properties, show PropertySetUpdateModal
    if (propertySetId && propertySetProperties.length > 1) {
      console.log('🔗 Property is in a set, showing PropertySetUpdateModal for CREATE')
      setPendingOperation('create')
      setPendingZoneData(zoneData)
      setShowPropertySetModal(true)
      return
    }

    console.log('⚠️ NOT showing modal. Reason:', {
      noPropertySetId: !propertySetId,
      notEnoughProperties: propertySetProperties.length <= 1
    })

    // Otherwise, create directly
    setIsCreatingZone(true)
    try {
      const success = await createBatchZones(id, [zoneData])

      if (success) {
        // Refresh zones list
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success) {
          setZones(transformZonesFromApi(zonesResult.data, id))
        }

        setFormData({ name: '', description: '', iconId: '' })
        setShowCreateForm(false)
        setShowIconSelector(false)

        addNotification({
          type: 'success',
          title: '✅ Zona creada',
          message: `La zona "${zoneData.name}" se ha creado correctamente`,
          read: false
        })
      } else {
        addNotification({
          type: 'error',
          title: '❌ Error al crear zona',
          message: 'No se pudo crear la zona. Inténtalo de nuevo.',
          read: false
        })
      }
    } catch (error) {
      console.error('Error creating zone:', error)
      addNotification({
        type: 'error',
        title: '❌ Error al crear zona',
        message: 'Error de conexión. Inténtalo de nuevo.',
        read: false
      })
    } finally {
      setIsCreatingZone(false)
    }
  }

  const handleEditZone = async (zone: Zone) => {
    setEditingZone(zone)

    // Fetch raw zone data to get translations
    try {
      const response = await fetch(`/api/properties/${id}/zones/${zone.id}`)
      const result = await response.json()
      if (result.success && result.data) {
        const rawZone = result.data
        const nameObj = rawZone.name

        setFormData({
          name: typeof nameObj === 'string' ? nameObj : nameObj?.es || '',
          nameEn: typeof nameObj === 'string' ? '' : nameObj?.en || '',
          nameFr: typeof nameObj === 'string' ? '' : nameObj?.fr || '',
          description: getZoneText(rawZone.description),
          iconId: rawZone.icon || zone.iconId
        })
      } else {
        // Fallback to basic data
        setFormData({
          name: getZoneText(zone.name),
          nameEn: '',
          nameFr: '',
          description: getZoneText(zone.description),
          iconId: zone.iconId
        })
      }
    } catch (error) {
      console.error('Error loading zone data:', error)
      setFormData({
        name: getZoneText(zone.name),
        nameEn: '',
        nameFr: '',
        description: getZoneText(zone.description),
        iconId: zone.iconId
      })
    }

    setShowCreateForm(true)
  }

  // Handle zone translations
  const handleOpenTranslations = async (zone: Zone) => {
    // Check if we have cached raw data
    const cachedRaw = rawZonesData.get(zone.id)
    if (cachedRaw) {
      const nameObj = cachedRaw.name
      setZoneTranslations({
        es: typeof nameObj === 'string' ? nameObj : nameObj?.es || '',
        en: typeof nameObj === 'string' ? '' : nameObj?.en || '',
        fr: typeof nameObj === 'string' ? '' : nameObj?.fr || ''
      })
      setEditingTranslationsZoneId(zone.id)
      return
    }

    // Fetch raw zone data
    try {
      const response = await fetch(`/api/properties/${id}/zones/${zone.id}`)
      const result = await response.json()
      if (result.success && result.data) {
        const rawZone = result.data
        // Cache the raw data
        setRawZonesData(prev => new Map(prev).set(zone.id, rawZone))

        const nameObj = rawZone.name
        setZoneTranslations({
          es: typeof nameObj === 'string' ? nameObj : nameObj?.es || '',
          en: typeof nameObj === 'string' ? '' : nameObj?.en || '',
          fr: typeof nameObj === 'string' ? '' : nameObj?.fr || ''
        })
        setEditingTranslationsZoneId(zone.id)
      }
    } catch (error) {
      console.error('Error loading zone translations:', error)
    }
  }

  const handleSaveTranslations = async (zoneId: string) => {
    if (!zoneTranslations.es) {
      alert('El nombre en español es obligatorio')
      return
    }

    setSavingTranslations(true)
    try {
      const response = await fetch(`/api/properties/${id}/zones/${zoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: {
            es: zoneTranslations.es,
            en: zoneTranslations.en || zoneTranslations.es,
            fr: zoneTranslations.fr || zoneTranslations.es
          }
        })
      })

      const result = await response.json()
      if (response.ok && result.success) {
        // Update local state
        setZones(zones.map(z =>
          z.id === zoneId
            ? { ...z, name: zoneTranslations.es }
            : z
        ))
        // Update cache
        setRawZonesData(prev => {
          const newMap = new Map(prev)
          const existing = newMap.get(zoneId) || {}
          newMap.set(zoneId, {
            ...existing,
            name: {
              es: zoneTranslations.es,
              en: zoneTranslations.en || zoneTranslations.es,
              fr: zoneTranslations.fr || zoneTranslations.es
            }
          })
          return newMap
        })
        setEditingTranslationsZoneId(null)
      } else {
        alert(result.error || 'Error al guardar traducciones')
      }
    } catch (error) {
      console.error('Error saving translations:', error)
      alert('Error al guardar traducciones')
    } finally {
      setSavingTranslations(false)
    }
  }

  const handleUpdateZone = async () => {
    if (!editingZone || !formData.name || !formData.iconId) return

    // Build multilingual name object
    const multilingualName = {
      es: formData.name,
      en: formData.nameEn || formData.name,
      fr: formData.nameFr || formData.name
    }

    const zoneUpdateData = {
      name: multilingualName,
      description: formData.description || '',
      iconId: formData.iconId
    }

    console.log('🔄 Updating zone with data:', {
      ...zoneUpdateData,
      editingZone: editingZone.id
    })

    // If property is in a set with multiple properties, show PropertySetUpdateModal
    if (propertySetId && propertySetProperties.length > 1) {
      console.log('🔗 Property is in a set, showing PropertySetUpdateModal for UPDATE ZONE')
      setPendingOperation('update')
      setPendingZoneData({ ...zoneUpdateData, zoneId: editingZone.id, zoneName: editingZone.name })
      setPendingZoneForSave(editingZone)
      setShowPropertySetModal(true)
      return
    }

    // Otherwise, update directly
    await performUpdateZone(editingZone, zoneUpdateData, 'single')
  }

  const performUpdateZone = async (
    zone: Zone,
    updateData: { name: any; description: string; iconId: string },
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    setIsUpdatingZone(true)
    try {
      // First update the current zone
      const response = await fetch(`/api/properties/${id}/zones/${zone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updateData.name,
          description: updateData.description,
          iconId: updateData.iconId,
          color: 'bg-gray-100',
          status: 'ACTIVE'
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('Error updating zone:', result.error)
        alert(result.error || 'Error al actualizar la zona')
        return
      }

      console.log('✅ Zone updated successfully')

      // If scope is 'all' or 'selected', update matching zones in other properties
      if (scope !== 'single') {
        const currentZoneName = getZoneText(zone.name).toLowerCase()
        const propertiesToUpdate = scope === 'all'
          ? propertySetProperties.filter(p => p.id !== id)
          : propertySetProperties.filter(p => selectedPropertyIds?.includes(p.id) && p.id !== id)

        console.log(`🔗 Updating zone "${currentZoneName}" in ${propertiesToUpdate.length} other properties`)

        for (const prop of propertiesToUpdate) {
          try {
            // Find matching zone in this property
            const zonesResponse = await fetch(`/api/properties/${prop.id}/zones`)
            const zonesResult = await zonesResponse.json()

            if (zonesResult.success && zonesResult.data) {
              const matchingZone = zonesResult.data.find((z: any) => {
                const zName = getZoneText(z.name).toLowerCase()
                return zName === currentZoneName
              })

              if (matchingZone) {
                console.log(`📝 Updating zone in property ${prop.name}`)
                await fetch(`/api/properties/${prop.id}/zones/${matchingZone.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: updateData.name,
                    description: updateData.description,
                    iconId: updateData.iconId,
                    color: 'bg-gray-100',
                    status: 'ACTIVE'
                  })
                })
              }
            }
          } catch (error) {
            console.error(`Error updating zone in property ${prop.id}:`, error)
          }
        }

        addNotification({
          type: 'info',
          title: '✅ Zonas actualizadas',
          message: `Zona actualizada en ${propertiesToUpdate.length + 1} propiedades`,
          read: false
        })
      }

      // Update local state
      setZones(zones.map(z =>
        z.id === zone.id
          ? {
              ...z,
              name: updateData.name.es || formData.name,
              description: updateData.description,
              iconId: updateData.iconId,
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : z
      ))

      console.log('✅ Local zones state updated')

      setEditingZone(null)
      setFormData({ name: '', nameEn: '', nameFr: '', description: '', iconId: '' })
      setFormNameLang('es')
      setShowCreateForm(false)
      setShowIconSelector(false)
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

    console.log('🗑️ DELETE ZONE - Starting')
    console.log('🗑️ propertySetId:', propertySetId)
    console.log('🗑️ propertySetProperties.length:', propertySetProperties.length)

    // Close the initial delete confirmation modal
    setShowDeleteModal(false)

    // If property is in a set with multiple properties, show PropertySetUpdateModal
    if (propertySetId && propertySetProperties.length > 1) {
      console.log('🔗 Property is in a set, showing PropertySetUpdateModal for DELETE')
      setPendingOperation('delete')
      setShowPropertySetModal(true)
      return
    }

    console.log('⚠️ NOT showing modal. Reason:', {
      noPropertySetId: !propertySetId,
      notEnoughProperties: propertySetProperties.length <= 1
    })

    // Otherwise, delete directly
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
    setFormData({ name: '', nameEn: '', nameFr: '', description: '', iconId: '' })
    setFormNameLang('es')
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
          qrUrl: `https://www.itineramio.com/z/${Math.random().toString(36).substr(2, 6)}`,
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
          setZones(transformZonesFromApi(zonesResult.data, id))
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

  // Scroll to zones section (mobile only)
  const scrollToZones = () => {
    if (zonesContainerRef.current) {
      zonesContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
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
              steps: zone.steps || [],
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://www.itineramio.com/guide/${id}/${zone.id}`,
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
      
      // Prepare zones data for batch creation - pass full multilingual objects
      const zonesToCreate = selectedElementIds.map(elementId => {
        const element = apartmentElements.find(e => e.id === elementId)
        if (!element) return null

        return {
          // Pass full multilingual object for name and description
          name: element.name,
          description: element.description,
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
              steps: zone.steps || [],
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://www.itineramio.com/guide/${id}/${zone.id}`,
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

    // Get essential zones that don't exist yet - now with multilingual support
    const existingZoneNames = zones.map(z => getZoneText(z.name).toLowerCase())
    const commonZones = [
      {
        name: { es: 'WiFi', en: 'WiFi', fr: 'WiFi' },
        iconId: 'wifi',
        description: { es: 'Contraseña y conexión a internet', en: 'Password and internet connection', fr: 'Mot de passe et connexion internet' }
      },
      {
        name: { es: 'Check-in', en: 'Check-in', fr: 'Arrivée' },
        iconId: 'door',
        description: { es: 'Proceso de entrada y llaves', en: 'Entry process and keys', fr: 'Processus d\'entrée et clés' }
      },
      {
        name: { es: 'Check-out', en: 'Check-out', fr: 'Départ' },
        iconId: 'exit',
        description: { es: 'Proceso de salida', en: 'Departure process', fr: 'Processus de départ' }
      },
      {
        name: { es: 'Cómo llegar', en: 'How to get there', fr: 'Comment venir' },
        iconId: 'map-pin',
        description: { es: 'Indicaciones para llegar al alojamiento', en: 'Directions to the accommodation', fr: 'Indications pour arriver à l\'hébergement' }
      },
      {
        name: { es: 'Información Básica', en: 'Basic Information', fr: 'Informations de base' },
        iconId: 'info',
        description: { es: 'Información esencial del alojamiento', en: 'Essential accommodation information', fr: 'Informations essentielles sur l\'hébergement' }
      },
      {
        name: { es: 'Climatización', en: 'Climate Control', fr: 'Climatisation' },
        iconId: 'thermometer',
        description: { es: 'Aire acondicionado y calefacción', en: 'Air conditioning and heating', fr: 'Climatisation et chauffage' }
      },
      {
        name: { es: 'Aparcamiento', en: 'Parking', fr: 'Parking' },
        iconId: 'car',
        description: { es: 'Dónde aparcar y cómo acceder', en: 'Where to park and how to access', fr: 'Où se garer et comment accéder' }
      },
      {
        name: { es: 'Normas', en: 'House Rules', fr: 'Règlement' },
        iconId: 'list',
        description: { es: 'Normas de la casa y convivencia', en: 'House rules and living together', fr: 'Règles de la maison et cohabitation' }
      },
      {
        name: { es: 'Teléfonos de interés', en: 'Important Contacts', fr: 'Contacts importants' },
        iconId: 'phone',
        description: { es: 'Emergencias y contactos útiles', en: 'Emergency and useful contacts', fr: 'Urgences et contacts utiles' }
      }
    ].filter(zone => !existingZoneNames.includes(zone.name.es.toLowerCase()))

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
              steps: zone.steps || [],
              stepsCount: zone.steps?.length || 0,
              qrUrl: `https://www.itineramio.com/guide/${id}/${zone.id}`,
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
      // Create zones from templates via batch API - pass full multilingual objects
      const zonesToCreate = zoneIds.map(templateId => {
        const template = zoneTemplates.find(t => t.id === templateId)
        if (!template) return null

        return {
          // Pass full multilingual object for name and description
          name: template.name,
          description: template.description,
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
          setZones(transformZonesFromApi(zonesResult.data, id))
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
      // URL copied successfully
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
      const existingNormalized = getZoneText(zone.name).toLowerCase().trim();
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
      // Pass full multilingual object if available, otherwise wrap string in object
      const zoneData = {
        name: typeof inspiration.name === 'object' ? inspiration.name : { es: inspiration.name },
        description: typeof inspiration.description === 'object' ? inspiration.description : { es: inspiration.description || '' },
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
          const newZones = transformZonesFromApi(zonesResult.data, id)
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
    const templateName = getZoneTemplateText(template.name);
    const nameNormalized = templateName.toLowerCase().trim();
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
        message: `Ya existe una zona "${templateName}" en esta propiedad.`,
        read: false
      });
      return;
    }

    setIsCreatingZone(true)
    try {
      // Get content template if available
      console.log('🔍 Template ID:', template.id)
      const contentTemplate = getZoneContentTemplate(template.id)
      console.log('🔍 Content template found:', !!contentTemplate, contentTemplate?.steps?.length, 'steps')

      const zoneData = {
        name: template.name,
        description: template.description,
        icon: template.icon,
        color: 'bg-gray-100',
        status: 'ACTIVE',
        steps: contentTemplate?.steps // Include pre-filled steps if template exists
      }

      const success = await createBatchZones(id, [zoneData], !!contentTemplate)

      if (success) {
        // Refresh zones list
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success) {
          const newZones = transformZonesFromApi(zonesResult.data, id)
          setZones(newZones)

          // Find the newly created zone
          const newZone = newZones.find((zone: Zone) => zone.name === getZoneTemplateText(template.name))
          if (newZone) {
            // If template had content, show success message
            if (contentTemplate) {
              addNotification({
                type: 'success',
                title: 'Zona creada con contenido',
                message: `"${getZoneTemplateText(template.name)}" se ha creado con texto profesional en ES/EN/FR. ¡Solo edita con tus datos!`,
                read: false
              })
            }
            // Open step editor to let user customize the content
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
      const response = await fetch(`/api/properties/${id}/zones/${zoneId}/steps/safe`)
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
    console.log('💾 handleSaveSteps called with', steps?.length, 'steps')

    if (!editingZoneForSteps) {
      console.log('❌ No editingZoneForSteps')
      return
    }

    // Si la propiedad está en un conjunto con múltiples propiedades, mostrar modal
    if (propertySetId && propertySetProperties.length > 1) {
      console.log('🔗 Showing PropertySetUpdateModal')
      setPendingOperation('update')
      setPendingStepsToSave(steps)
      setPendingZoneForSave(editingZoneForSteps)
      // Cerrar el StepEditor antes de mostrar el modal
      setShowStepEditor(false)
      setShowPropertySetModal(true)
      return
    }

    // Para propiedades individuales, guardar directamente
    await performSaveSteps(steps, editingZoneForSteps, 'single')
  }

  const performSaveSteps = async (steps: Step[], zone: Zone, scope: 'single' | 'all' | 'selected', selectedPropertyIds?: string[]) => {
    console.log('💾 performSaveSteps called with:', steps.length, 'steps')
    console.log('🔍 Raw steps data:', steps)
    console.log('🎯 Scope:', scope)
    console.log('🎯 Selected properties:', selectedPropertyIds)

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
            zoneId: zone.id,
            timestamp: new Date().toISOString()
          })
        })
        const debugResult = await debugResponse.json()
        console.log('🐛 Debug response:', debugResult)
      } catch (debugError) {
        console.log('🐛 Debug endpoint failed:', debugError)
      }

      // Determine which zones to update
      let zonesToUpdate: Array<{ propertyId: string; zoneId: string; zoneName: string }> = []

      if (scope === 'single') {
        // Update only the current zone
        zonesToUpdate = [{ propertyId: id, zoneId: zone.id, zoneName: zone.name }]
      } else if (scope === 'all' && propertySetId) {
        // Update all zones with same name in all properties of the set
        const currentZoneName = getZoneText(zone.name).toLowerCase()

        for (const prop of propertySetProperties) {
          // Find zone with same name in this property
          try {
            const zonesResponse = await fetch(`/api/properties/${prop.id}/zones`, { credentials: 'include' })
            if (zonesResponse.ok) {
              const zonesData = await zonesResponse.json()
              if (zonesData.success && zonesData.data) {
                const matchingZone = zonesData.data.find((z: any) =>
                  getZoneText(z.name).toLowerCase() === currentZoneName
                )
                if (matchingZone) {
                  zonesToUpdate.push({
                    propertyId: prop.id,
                    zoneId: matchingZone.id,
                    zoneName: matchingZone.name
                  })
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching zones for property ${prop.id}:`, error)
          }
        }
      } else if (scope === 'selected' && selectedPropertyIds && selectedPropertyIds.length > 0) {
        // Update zones with same name in selected properties
        const currentZoneName = getZoneText(zone.name).toLowerCase()

        for (const propId of selectedPropertyIds) {
          try {
            const zonesResponse = await fetch(`/api/properties/${propId}/zones`, { credentials: 'include' })
            if (zonesResponse.ok) {
              const zonesData = await zonesResponse.json()
              if (zonesData.success && zonesData.data) {
                const matchingZone = zonesData.data.find((z: any) =>
                  getZoneText(z.name).toLowerCase() === currentZoneName
                )
                if (matchingZone) {
                  zonesToUpdate.push({
                    propertyId: propId,
                    zoneId: matchingZone.id,
                    zoneName: matchingZone.name
                  })
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching zones for property ${propId}:`, error)
          }
        }
      }

      console.log(`🎯 Found ${zonesToUpdate.length} existing zones`)

      // For properties without the zone, we need to create it first if scope is 'all' or 'selected'
      const propertiesToCheck = scope === 'all'
        ? propertySetProperties
        : scope === 'selected' && selectedPropertyIds
          ? propertySetProperties.filter(p => selectedPropertyIds.includes(p.id))
          : []

      const zonesCreated = []
      for (const prop of propertiesToCheck) {
        const hasZone = zonesToUpdate.some(z => z.propertyId === prop.id)
        if (!hasZone) {
          // Create the zone in this property
          try {
            console.log(`🆕 Creating zone "${getZoneText(zone.name)}" in property ${prop.id}`)
            const createResponse = await fetch(`/api/properties/${prop.id}/zones`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: zone.name,
                icon: zone.icon || zone.iconId || '',
                color: zone.color || 'bg-gray-100'
              })
            })

            if (createResponse.ok) {
              const createResult = await createResponse.json()
              if (createResult.success && createResult.data) {
                zonesCreated.push({
                  propertyId: prop.id,
                  zoneId: createResult.data.id,
                  zoneName: createResult.data.name
                })
                console.log(`✅ Zone created in property ${prop.id}`)
              }
            }
          } catch (error) {
            console.error(`❌ Error creating zone in property ${prop.id}:`, error)
          }
        }
      }

      // Add newly created zones to the update list
      const allZonesToUpdate = [...zonesToUpdate, ...zonesCreated]
      console.log(`🎯 Total zones to update (including newly created): ${allZonesToUpdate.length}`)

      // Update all zones (existing and newly created)
      let successCount = 0
      const updatedPropertyIds = new Set<string>()

      for (const zoneInfo of allZonesToUpdate) {
        try {
          const response = await fetch(`/api/properties/${zoneInfo.propertyId}/zones/${zoneInfo.zoneId}/steps/safe`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ steps: transformedSteps })
          })

          const result = await response.json()

          if (response.ok && result.success) {
            successCount++
            updatedPropertyIds.add(zoneInfo.propertyId)
            console.log(`✅ Updated zone ${zoneInfo.zoneId} in property ${zoneInfo.propertyId}`)
          } else {
            console.error(`❌ Error updating zone ${zoneInfo.zoneId}:`, result.error)
          }
        } catch (error) {
          console.error(`❌ Error updating zone ${zoneInfo.zoneId}:`, error)
        }
      }

      if (successCount > 0) {
        // Update zone steps count for current property
        setZones(zones.map(z =>
          z.id === zone.id
            ? { ...z, stepsCount: steps.length, lastUpdated: new Date().toISOString().split('T')[0] }
            : z
        ))

        setShowStepEditor(false)
        setEditingZoneForSteps(null)

        // Get zone name for both modal and notifications
        const zoneName = getZoneText(zone.name)

        // 🚨 VALIDATION CODE START - THIS SHOULD ALWAYS APPEAR
        console.log('🚨🚨🚨 VALIDATION CODE REACHED - zoneName:', zoneName)
        console.log('🚨🚨🚨 Steps to validate:', steps.length)
        console.log('🚨🚨🚨 Steps data:', JSON.stringify(steps, null, 2))

        // Check if any steps are missing EN or FR content
        // Only validate CONTENT (not titles, since titles are optional)
        // Only show modal if user has Spanish content but missing translations
        console.log('🔍 Validating language completion for zone:', zoneName)
        console.log('🔍 Total steps to validate:', steps.length)

        const hasMissingLanguages = steps.some((step, index) => {
          // Only check content, not titles (titles are optional)
          const contentEs = step.content?.es?.trim()
          const contentEn = step.content?.en?.trim()
          const contentFr = step.content?.fr?.trim()

          // Debug log
          console.log(`📝 Step ${index + 1}:`, {
            hasEs: !!contentEs,
            hasEn: !!contentEn,
            hasFr: !!contentFr
          })

          // Only flag as missing if:
          // 1. There's Spanish content (user is actively using the zone)
          // 2. AND both EN and FR are empty (not just one missing)
          // This way we only suggest translations when the zone is actively used
          // but doesn't have ANY translations yet
          if (contentEs && !contentEn && !contentFr) {
            console.log(`❌ Step ${index + 1}: Has ES but missing both EN and FR`)
            return true
          }

          console.log(`✅ Step ${index + 1}: OK (has translations or no ES content)`)
          return false
        })

        console.log('🎯 Final validation result:', {
          hasMissingLanguages,
          willShowModal: hasMissingLanguages
        })

        // Only show language completion modal if languages are actually missing
        if (hasMissingLanguages) {
          setCompletedZoneName(zoneName)
          setShowLanguageModal(true)
        }

        // Show improved success message
        const propertyCount = updatedPropertyIds.size

        console.log('🔔 NOTIFICATION DEBUG:')
        console.log('🔔 successCount:', successCount)
        console.log('🔔 propertyCount:', propertyCount)
        console.log('🔔 zoneName:', zoneName)
        console.log('🔔 updatedPropertyIds:', Array.from(updatedPropertyIds))

        if (propertyCount > 1) {
          console.log('🔔 Showing multi-property notification')
          addNotification({
            type: 'success',
            title: '✅ Cambios guardados',
            message: `Se han guardado los cambios de "${zoneName}" en ${propertyCount} propiedades`,
            read: false
          })
          console.log('🔔 Multi-property notification call completed')
        } else {
          console.log('🔔 Showing single-property notification')
          addNotification({
            type: 'success',
            title: '✅ Instrucciones guardadas',
            message: 'Tus instrucciones se han guardado correctamente',
            read: false
          })
          console.log('🔔 Single-property notification call completed')
        }
      } else {
        addNotification({
          type: 'error',
          title: '❌ Error al guardar',
          message: 'No se pudieron guardar las instrucciones. Inténtalo de nuevo.',
          read: false
        })
      }
    } catch (error) {
      console.error('Error saving steps:', error)
      addNotification({
        type: 'error',
        title: '❌ Error al guardar',
        message: 'Error de conexión. Inténtalo de nuevo.',
        read: false
      })
    }
  }

  // Unified function to CREATE zone across property set
  const performCreateZone = async (
    zoneData: any,
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    console.log('🆕 performCreateZone called with scope:', scope)

    try {
      const propertiesToCreate = scope === 'single'
        ? [{ id, name: propertyName }]
        : scope === 'all'
          ? propertySetProperties
          : propertySetProperties.filter(p => selectedPropertyIds?.includes(p.id))

      console.log(`🎯 Creating zone in ${propertiesToCreate.length} properties`)

      let successCount = 0
      for (const prop of propertiesToCreate) {
        try {
          const success = await createBatchZones(prop.id, [zoneData])
          if (success) {
            successCount++
            console.log(`✅ Zone created in property ${prop.id}`)
          }
        } catch (error) {
          console.error(`❌ Error creating zone in property ${prop.id}:`, error)
        }
      }

      if (successCount > 0) {
        // Refresh zones list for current property
        const zonesResponse = await fetch(`/api/properties/${id}/zones`)
        const zonesResult = await zonesResponse.json()
        if (zonesResult.success) {
          setZones(transformZonesFromApi(zonesResult.data, id))
        }

        setFormData({ name: '', description: '', iconId: '' })
        setShowCreateForm(false)
        setShowIconSelector(false)

        // Show success message with improved text
        console.log('🔔 CREATE NOTIFICATION DEBUG:')
        console.log('🔔 successCount:', successCount)
        console.log('🔔 scope:', scope)
        console.log('🔔 zoneData.name:', zoneData.name)

        if (successCount > 1) {
          const message = scope === 'all'
            ? 'Se ha creado una zona nueva para todo el conjunto'
            : `Se ha creado una zona nueva para ${successCount} propiedades`

          console.log('🔔 Showing multi-property creation notification:', message)
          addNotification({
            type: 'success',
            title: '✅ Zona creada con éxito',
            message: message,
            read: false
          })
          console.log('🔔 Multi-property creation notification call completed')
        } else {
          console.log('🔔 Showing single-property creation notification')
          addNotification({
            type: 'success',
            title: '✅ Zona creada',
            message: `La zona "${zoneData.name}" se ha creado correctamente`,
            read: false
          })
          console.log('🔔 Single-property creation notification call completed')
        }
      } else {
        addNotification({
          type: 'error',
          title: '❌ Error al crear zona',
          message: 'No se pudo crear la zona. Inténtalo de nuevo.',
          read: false
        })
      }
    } catch (error) {
      console.error('Error creating zone:', error)
      addNotification({
        type: 'error',
        title: '❌ Error al crear zona',
        message: 'Error de conexión. Inténtalo de nuevo.',
        read: false
      })
    }
  }

  // Unified function to DELETE zone across property set
  const performDeleteZone = async (
    zone: Zone,
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    console.log('🗑️ performDeleteZone called with scope:', scope)

    try {
      const zoneName = getZoneText(zone.name)

      // Find matching zones to delete
      const zonesToDelete: Array<{ propertyId: string; zoneId: string }> = []

      if (scope === 'single') {
        zonesToDelete.push({ propertyId: id, zoneId: zone.id })
      } else {
        const propertiesToCheck = scope === 'all'
          ? propertySetProperties
          : propertySetProperties.filter(p => selectedPropertyIds?.includes(p.id))

        for (const prop of propertiesToCheck) {
          try {
            const zonesResponse = await fetch(`/api/properties/${prop.id}/zones`)
            if (zonesResponse.ok) {
              const zonesData = await zonesResponse.json()
              if (zonesData.success && zonesData.data) {
                const matchingZone = zonesData.data.find((z: any) =>
                  getZoneText(z.name).toLowerCase() === zoneName.toLowerCase()
                )
                if (matchingZone) {
                  zonesToDelete.push({
                    propertyId: prop.id,
                    zoneId: matchingZone.id
                  })
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching zones for property ${prop.id}:`, error)
          }
        }
      }

      console.log(`🎯 Deleting ${zonesToDelete.length} zones`)

      let successCount = 0
      for (const zoneInfo of zonesToDelete) {
        try {
          const response = await fetch(`/api/properties/${zoneInfo.propertyId}/zones/${zoneInfo.zoneId}`, {
            method: 'DELETE'
          })

          const result = await response.json()

          if (response.ok && result.success) {
            successCount++
            console.log(`✅ Deleted zone ${zoneInfo.zoneId} in property ${zoneInfo.propertyId}`)
          }
        } catch (error) {
          console.error(`❌ Error deleting zone ${zoneInfo.zoneId}:`, error)
        }
      }

      if (successCount > 0) {
        // Remove zone from current property's list
        const newZones = zones.filter(z => z.id !== zone.id)
        setZones(newZones)

        // Handle empty zones state
        if (newZones.length === 0) {
          const propertyZonesKey = `property_${id}_zones_created`
          const propertyWelcomeKey = `property_${id}_welcome_shown`
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(propertyZonesKey, 'true')
            window.localStorage.setItem(propertyWelcomeKey, 'true')
          }
        }

        setShowDeleteModal(false)
        setZoneToDelete(null)

        // Show success message with improved text
        console.log('🔔 DELETE NOTIFICATION DEBUG:')
        console.log('🔔 successCount:', successCount)
        console.log('🔔 scope:', scope)
        console.log('🔔 zoneName:', zoneName)

        if (successCount > 1) {
          const message = scope === 'all'
            ? `Se ha eliminado "${zoneName}" de todo el conjunto`
            : `Se ha eliminado "${zoneName}" de ${successCount} propiedades`

          console.log('🔔 Showing multi-property deletion notification:', message)
          addNotification({
            type: 'info',
            title: '✅ Zonas eliminadas',
            message: message,
            read: false
          })
          console.log('🔔 Multi-property deletion notification call completed')
        } else {
          console.log('🔔 Showing single-property deletion notification')
          addNotification({
            type: 'info',
            title: '✅ Zona eliminada',
            message: `La zona "${zoneName}" ha sido eliminada correctamente`,
            read: false
          })
          console.log('🔔 Single-property deletion notification call completed')
        }
      } else {
        addNotification({
          type: 'error',
          title: '❌ Error al eliminar',
          message: 'No se pudo eliminar la zona. Inténtalo de nuevo.',
          read: false
        })
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
      addNotification({
        type: 'error',
        title: '❌ Error al eliminar',
        message: 'Error de conexión. Inténtalo de nuevo.',
        read: false
      })
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
      console.log('🔄 DRAG & DROP: Iniciando reordenamiento de zonas')
      console.log('   - Zona arrastrada:', active.id)
      console.log('   - Posición destino:', over?.id)

      const oldIndex = zones.findIndex((zone) => zone.id === active.id)
      const newIndex = zones.findIndex((zone) => zone.id === over?.id)

      console.log('   - Índice anterior:', oldIndex, '→ Índice nuevo:', newIndex)

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

        console.log('📤 Enviando nuevo orden al servidor:', zonesWithNewOrder)

        // Get token from localStorage for PWA fallback
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }

        // Add Authorization header if token exists (for PWA mode)
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
          console.log('🔑 Token encontrado en localStorage')
        } else {
          console.log('⚠️  No se encontró token en localStorage, usando solo cookies')
        }

        const url = `/api/properties/${id}/zones/order`
        console.log('🌐 URL del request:', url)

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          credentials: 'include', // For cookie-based auth
          body: JSON.stringify({ zones: zonesWithNewOrder })
        })

        console.log('📥 Respuesta del servidor:', response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.text()
          console.error('❌ Error del servidor:', errorData)

          // Revert changes if API call fails
          setZones(zones)
          addNotification({
            type: 'error',
            title: 'Error',
            message: `No se pudo actualizar el orden de las zonas (${response.status})`,
            read: false
          })
        } else {
          const responseData = await response.json()
          console.log('✅ Orden actualizado correctamente:', responseData)

          addNotification({
            type: 'success',
            title: 'Orden actualizado',
            message: 'El orden de las zonas se ha guardado correctamente',
            read: false
          })
        }
      } catch (error) {
        console.error('❌ Error al actualizar el orden de las zonas:', error)
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
        console.log('✅ Proceso de reordenamiento finalizado')
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
      transform: CSS.Transform.toString(transform) + (isDragging ? ' scale(1.05)' : ''),
      transition,
      opacity: isDragging ? 0.8 : 1,
      zIndex: isDragging ? 999 : ('auto' as any),
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
      >
        <Card
          className={`hover:shadow-lg transition-all cursor-pointer hover:border-violet-300 ${
            isDragging ? 'shadow-2xl ring-4 ring-violet-500 border-violet-500 bg-violet-50' : ''
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
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between min-h-[140px] lg:min-h-[100px]">
              {/* Left side - Zone info */}
              <div className="flex items-center space-x-3 flex-1 min-w-0 h-full">
                {/* Drag handle */}
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Zone icon */}
                <div className="flex-shrink-0 flex items-center">
                  <ZoneIconDisplay iconId={zone.iconId} size="md" />
                </div>
                
                {/* Zone content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate pr-2">{getZoneText(zone.name)}</h3>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="inline-flex items-center bg-blue-50 rounded-full px-2 py-0.5">
                      <Edit className="w-3 h-3 mr-1 text-blue-500" />
                      <span className="font-medium text-blue-700">{zone.stepsCount}</span>
                      <span className="ml-0.5 text-blue-600 hidden xs:inline">steps</span>
                    </div>

                    <span className="text-gray-400">•</span>

                    <div className="text-gray-600">
                      <span className="hidden sm:inline text-gray-500">Actualizado: </span>
                      <span className="font-medium">{zone.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Menú */}
              <div className="flex items-center ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
                          console.log('Opening steps editor for zone:', zone.id, zone)
                          setEditingZoneForSteps(zone)
                          await loadZoneSteps(zone.id)
                          setShowStepEditor(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('zones.edit')}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={() => handleEditZone(zone)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {t('zones.configure')}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={() => handleCopyURL(zone)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {t('zones.copyUrl')}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={() => handleShowQR(zone)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {t('zones.viewQr')}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onSelect={() => handleCopyZone(zone)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {t('zones.copyZone')}
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm hover:bg-red-100 text-red-600 rounded cursor-pointer"
                        onSelect={() => handleDeleteZone(zone)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('zones.delete')}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
      <div
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
              {/* Header with drag handle and menú */}
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
                          {t('zones.configure')}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                          onSelect={() => handleCopyURL(zone)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {t('zones.copyUrl')}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                          onSelect={() => handleShowQR(zone)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          {t('zones.viewQr')}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                          onSelect={() => handleCopyZone(zone)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {t('zones.copyZone')}
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                        <DropdownMenu.Item
                          className="flex items-center px-3 py-2 text-sm hover:bg-red-100 text-red-600 rounded cursor-pointer"
                          onSelect={() => handleDeleteZone(zone)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('zones.delete')}
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>

              {/* Zone content */}
              <div className="flex flex-col items-center text-center flex-1 min-h-[110px] justify-between">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="mb-3">
                    <ZoneIconDisplay iconId={zone.iconId} size="lg" />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 break-words px-1">
                    {getZoneText(zone.name)}
                  </h3>
                </div>

                <div className="inline-flex items-center justify-center text-xs text-gray-600 bg-gray-50 rounded-full px-2 py-0.5 max-w-full">
                  <Edit className="w-2.5 h-2.5 mr-0.5 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">{zone.stepsCount}</span>
                  <span className="ml-0.5 hidden xs:inline">steps</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handler for PropertySetUpdateModal confirmation
  const handlePropertySetConfirm = async (
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    console.log('🔗 PropertySetUpdateModal confirmed with:', { scope, operation: pendingOperation })

    setShowPropertySetModal(false)

    try {
      if (pendingOperation === 'update' && pendingZoneData?.zoneId && pendingZoneForSave) {
        // Zone metadata update (name, description, icon, translations)
        await performUpdateZone(
          pendingZoneForSave,
          { name: pendingZoneData.name, description: pendingZoneData.description, iconId: pendingZoneData.iconId },
          scope,
          selectedPropertyIds
        )
      } else if (pendingOperation === 'update' && pendingStepsToSave && pendingZoneForSave) {
        // Steps update
        await performSaveSteps(pendingStepsToSave, pendingZoneForSave, scope, selectedPropertyIds)
      } else if (pendingOperation === 'create' && pendingZoneData) {
        setIsCreatingZone(true)
        await performCreateZone(pendingZoneData, scope, selectedPropertyIds)
      } else if (pendingOperation === 'delete' && zoneToDelete) {
        setIsDeletingZone(true)
        await performDeleteZone(zoneToDelete, scope, selectedPropertyIds)
      }
    } catch (error) {
      console.error('Error in handlePropertySetConfirm:', error)
    } finally {
      // Clear all pending states and ensure we return to zones list
      setPendingStepsToSave([])
      setPendingZoneForSave(null)
      setPendingOperation(null)
      setPendingZoneData(null)
      setIsCreatingZone(false)
      setIsDeletingZone(false)
      setShowStepEditor(false)
      setEditingZoneForSteps(null)
      setCurrentSteps([])
    }
  }

  // Handler for PropertySetUpdateModal close/cancel
  const handlePropertySetModalClose = () => {
    console.log('🔗 PropertySetUpdateModal cancelled')
    setShowPropertySetModal(false)
    // Clear all pending states
    setPendingStepsToSave([])
    setPendingZoneForSave(null)
    setPendingOperation(null)
    setPendingZoneData(null)
  }

  // Show loading spinner when loading zones
  if (isLoadingZones) {
    return <AnimatedLoadingSpinner text={t('loading.zones', 'Cargando zonas...')} type="zones" />
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-24 lg:pb-6">

      {/* Inactive Property Banner */}
      {propertyStatus === 'DRAFT' && (
        <div className="mb-4 sm:mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-amber-800 mb-1">
                  Propiedad inactiva
                </h3>
                <p className="text-xs sm:text-sm text-amber-700 mb-2">
                  Esta propiedad no está activa. Los huéspedes no pueden ver el manual.
                </p>
                <p className="text-xs sm:text-sm text-amber-700">
                  Activa la propiedad para que los huéspedes puedan acceder al manual.
                </p>
              </div>
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
                      title: 'Propiedad activada',
                      message: 'La propiedad ahora está visible para los huéspedes',
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
              className="bg-amber-600 hover:bg-amber-700 text-white w-full md:w-auto"
            >
              Activar propiedad
            </Button>
          </div>
        </div>
      )}


      {/* Copied Badge */}
      <AnimatePresence>
        {showCopiedBadge && (
          <div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50"
          >
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{t('propertyZones.manualCopied')}</span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Back to property set button */}
      {propertySetId && (
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/properties/groups/${propertySetId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t('propertyZones.backToGroup', 'Volver al conjunto')}
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* Botón Volver a Propiedades - Siempre visible */}
            <Button
              onClick={() => router.push('/properties')}
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100 rounded-full p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {propertyName ? `Zonas de ${propertyName}` : 'Zonas de la Propiedad'}
            </h1>
            {propertyCode && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Hash className="w-4 h-4 mr-1" />
                {propertyCode}
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-2">
            Gestiona las diferentes zonas y sus códigos QR
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-6">
          {/* Desktop links - same style as mobile */}
          <button
            onClick={handleViewEvaluations}
            className="text-gray-700 font-medium text-sm underline underline-offset-4 hover:text-gray-900 transition-colors relative"
          >
            {t('propertyZones.evaluations', 'Evaluaciones')}
            {unreadEvaluations > 0 && (
              <span className="absolute -top-2 -right-0 translate-x-full bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-1">
                {unreadEvaluations}
              </span>
            )}
          </button>

          <button
            onClick={() => router.push(`/properties/${id}/announcements`)}
            className="text-gray-700 font-medium text-sm underline underline-offset-4 hover:text-gray-900 transition-colors"
          >
            {t('propertyZones.announcements', 'Avisos')}
          </button>

          <button
            onClick={() => router.push(`/properties/${id}/analytics`)}
            className="text-violet-600 font-medium text-sm underline underline-offset-4 hover:text-violet-700 transition-colors"
          >
            {t('propertyZones.analytics', 'Analíticas')}
          </button>

          <button
            onClick={() => {
              const publicUrl = `${window.location.origin}/guide/${id}`
              window.open(publicUrl, '_blank')
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t('propertyZones.publicView')}
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </button>

          {/* Property Options Menú */}
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
                  {t('propertyZones.propertyQr')}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  onSelect={() => router.push(`/properties/new?edit=${id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('propertyZones.editProperty')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Mobile buttons - below text */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between">
          {/* Left side - Text links */}
          <div className="flex items-center gap-4">
            {/* Evaluaciones - Keep text */}
            <button
              onClick={handleViewEvaluations}
              className="text-black font-medium text-sm underline underline-offset-4 hover:text-gray-700 transition-colors relative"
            >
              {t('propertyZones.evaluations', 'Evaluaciones')}
              {unreadEvaluations > 0 && (
                <span className="absolute -top-2 -right-0 translate-x-full bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-1">
                  {unreadEvaluations}
                </span>
              )}
            </button>

            {/* Avisos - Keep text */}
            <button
              onClick={() => router.push(`/properties/${id}/announcements`)}
              className="text-black font-medium text-sm underline underline-offset-4 hover:text-gray-700 transition-colors"
            >
              {t('propertyZones.announcements', 'Avisos')}
            </button>

            {/* Analíticas - Keep text */}
            <button
              onClick={() => router.push(`/properties/${id}/analytics`)}
              className="text-violet-600 font-medium text-sm underline underline-offset-4 hover:text-violet-700 transition-colors"
            >
              {t('propertyZones.analytics', 'Analíticas')}
            </button>
          </div>

          {/* Right side - Icon buttons */}
          <div className="flex items-center gap-3">
            {/* Vista Pública */}
            <button
              onClick={() => {
                const publicUrl = `${window.location.origin}/guide/${id}`
                window.open(publicUrl, '_blank')
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t('propertyZones.publicView')}
            >
              <Eye className="w-5 h-5 text-gray-700" />
            </button>


            {/* QR Code */}
            <button
              onClick={() => setShowPropertyQRModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t('zones.viewQr')}
            >
              <QrCode className="w-5 h-5 text-gray-700" />
            </button>

          </div>
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Pasos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {zones.reduce((acc, zone) => acc + (zone.stepsCount || 0), 0)}
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
        <div ref={zonesContainerRef} className="lg:col-span-2 space-y-4">

          {/* Mobile header for zones */}
          <div className="lg:hidden mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {propertyName ? `Tus zonas en ${propertyName}` : 'Tus zonas'}
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
                  {/* Desktop: 2 columns, Mobile: 1 column */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {zones.map((zone) => (
                      <SortableZoneItem key={zone.id} zone={zone} />
                    ))}
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
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div
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
                  {editingZone ? t('zones.editZone') : t('zones.createCustomZone')}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {editingZone ? t('zones.modifyDetails') : t('zones.designCustom')}
                </p>
              </div>

              <div className="space-y-4">
                {/* Zone Name with translations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('zones.zoneName')}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setFormNameLang('es')}
                        className={`text-lg px-1.5 py-0.5 rounded transition-all ${formNameLang === 'es' ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}
                        title="Español"
                      >
                        🇪🇸
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormNameLang('en')}
                        className={`text-lg px-1.5 py-0.5 rounded transition-all ${formNameLang === 'en' ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}
                        title="English"
                      >
                        🇬🇧
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormNameLang('fr')}
                        className={`text-lg px-1.5 py-0.5 rounded transition-all ${formNameLang === 'fr' ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}
                        title="Français"
                      >
                        🇫🇷
                      </button>
                    </div>
                  </div>
                  <Input
                    value={formNameLang === 'es' ? formData.name : formNameLang === 'en' ? formData.nameEn : formData.nameFr}
                    onChange={(e) => {
                      if (formNameLang === 'es') {
                        setFormData({ ...formData, name: e.target.value })
                      } else if (formNameLang === 'en') {
                        setFormData({ ...formData, nameEn: e.target.value })
                      } else {
                        setFormData({ ...formData, nameFr: e.target.value })
                      }
                    }}
                    placeholder={formNameLang === 'es' ? 'Nombre en español *' : formNameLang === 'en' ? 'Name in English' : 'Nom en français'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('zones.descriptionOptional')}
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('zones.descriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('zones.icon')}
                  </label>
                  <div className="flex items-center space-x-3">
                    <ZoneIconDisplay iconId={formData.iconId} size="md" />
                    <Button
                      variant="outline"
                      onClick={() => setShowIconSelector(true)}
                      className="flex-1"
                    >
                      {formData.iconId ? t('zones.changeIcon') : t('zones.selectIcon')}
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
                  {t('zones.cancel')}
                </Button>
                <Button
                  onClick={editingZone ? handleUpdateZone : handleCreateZone}
                  disabled={!formData.name || !formData.iconId || isCreatingZone || isUpdatingZone}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {(isCreatingZone || isUpdatingZone) ? (
                    <InlineLoadingSpinner />
                  ) : (
                    editingZone ? t('zones.update') : t('zones.create')
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIconSelector && (
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div
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
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRModal && selectedZoneForQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
            onClick={() => {
              setShowQRModal(false)
              setSelectedZoneForQR(null)
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:w-auto sm:min-w-[380px] sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">
                    {getZoneText(selectedZoneForQR.name)}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowQRModal(false)
                    setSelectedZoneForQR(null)
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto">
                {/* QR Code - Centered and responsive */}
                <div className="flex justify-center mb-4">
                  <QRCodeDisplay
                    propertyId={id}
                    zoneId={selectedZoneForQR.id}
                    zoneName={getZoneText(selectedZoneForQR.name)}
                    size="md"
                    showTitle={false}
                    showActions={false}
                  />
                </div>

                {/* URL Display */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">URL de la zona:</p>
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/guide/${id}/${selectedZoneForQR.id}`}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  {/* Download Button - Primary */}
                  <Button
                    onClick={async () => {
                      try {
                        const QRCode = (await import('qrcode')).default
                        const zoneUrl = `${window.location.origin}/guide/${id}/${selectedZoneForQR.id}`
                        const qrDataUrl = await QRCode.toDataURL(zoneUrl, {
                          width: 600,
                          margin: 2,
                          color: { dark: '#6366f1', light: '#ffffff' }
                        })

                        // For mobile compatibility, create a temporary anchor with download attribute
                        const link = document.createElement('a')
                        link.href = qrDataUrl
                        link.download = `qr-${getZoneText(selectedZoneForQR.name).toLowerCase().replace(/\s+/g, '-')}.png`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      } catch (err) {
                        console.error('Error downloading QR:', err)
                        // Fallback: open in new tab
                        try {
                          const QRCode = (await import('qrcode')).default
                          const zoneUrl = `${window.location.origin}/guide/${id}/${selectedZoneForQR.id}`
                          const qrDataUrl = await QRCode.toDataURL(zoneUrl, { width: 600 })
                          window.open(qrDataUrl, '_blank')
                        } catch (e) {
                          alert('No se pudo descargar el QR. Intenta de nuevo.')
                        }
                      }
                    }}
                    className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-medium"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Descargar QR
                  </Button>

                  {/* Copy URL Button */}
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const url = `${window.location.origin}/guide/${id}/${selectedZoneForQR.id}`
                      try {
                        await navigator.clipboard.writeText(url)
                        // Visual feedback
                        const btn = document.activeElement as HTMLButtonElement
                        if (btn) {
                          const originalText = btn.innerHTML
                          btn.innerHTML = '<svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>¡Copiado!'
                          setTimeout(() => { btn.innerHTML = originalText }, 2000)
                        }
                      } catch (err) {
                        console.error('Error copying URL:', err)
                      }
                    }}
                    className="w-full h-12"
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    Copiar enlace
                  </Button>

                  {/* Share Button - Only on mobile */}
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const url = `${window.location.origin}/guide/${id}/${selectedZoneForQR.id}`
                        try {
                          await navigator.share({
                            title: `${getZoneText(selectedZoneForQR.name)} - Itineramio`,
                            url
                          })
                        } catch (err) {
                          console.error('Error sharing:', err)
                        }
                      }}
                      className="w-full h-12"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Compartir
                    </Button>
                  )}

                  {/* Design Button */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowQRModal(false)
                      setShowQRDesigner(true)
                    }}
                    className="w-full h-12 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Personalizar diseño
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone QR Designer Modal */}
      {selectedZoneForQR && (
        <ZoneQRDesigner
          isOpen={showQRDesigner}
          onClose={() => {
            setShowQRDesigner(false)
            setSelectedZoneForQR(null)
          }}
          propertyId={id}
          propertyName={propertyName}
          zoneId={selectedZoneForQR.id}
          zoneName={getZoneText(selectedZoneForQR.name)}
          zoneSlug={selectedZoneForQR.slug}
        />
      )}

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
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('zones.qrCodeTitle', { name: propertyName })}</h3>
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
                    {t('zones.qrPropertyScanMessage')}
                  </p>
                  <div className="mt-3 flex justify-center">
                    <Button
                      onClick={() => {
                        const publicUrl = `${window.location.origin}/guide/${id}`
                        navigator.clipboard.writeText(publicUrl).then(() => {
                          // URL copied successfully
                        })
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {t('zones.copyLink')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEssentialZonesModal(false)}
          >
            <div
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
                  Te recomendamos estás zonas que más consultan los huéspedes. ¡Selecciona las que necesites para empezar!
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
                    <div
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
                            <h4 className="font-medium text-gray-900">{typeof zone.name === 'string' ? zone.name : zone.name?.es || ''}</h4>
                            <p className="text-sm text-gray-600">{typeof zone.description === 'string' ? zone.description : zone.description?.es || ''}</p>
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
                    </div>
                  )
                })}
              </div>

              <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-violet-800">
                    <p className="font-medium mb-1">💡 ¿Por qué estás zonas son esenciales?</p>
                    <p>Basado en miles de apartamentos, estás son las zonas que más consultan los huéspedes. Tenerlas preparadas:</p>
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
            </div>
          </div>
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
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div
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
            </div>
          </div>
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
        isOpen={showZonasEsencialesModal}
        onClose={() => setShowZonasEsencialesModal(false)}
        onKeepZones={handleKeepEssentialZones}
        userName={user?.name || user?.email || 'Usuario'}
        isLoading={isCreatingZone}
        currentZoneIndex={zoneCreationProgress}
        totalZones={totalZonesToCreate}
      />


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

      <LanguageCompletionModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        zoneName={completedZoneName}
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
          <div
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
          </div>
        </div>
      )}


      {/* Evaluations Modal */}
      <EvaluationsModal
        isOpen={showEvaluationsModal}
        onClose={() => setShowEvaluationsModal(false)}
        propertyId={id}
        propertyName={propertyName || 'Propiedad'}
      />

      {/* Property Set Update Modal */}
      <PropertySetUpdateModal
        isOpen={showPropertySetModal}
        onClose={handlePropertySetModalClose}
        onConfirm={handlePropertySetConfirm}
        currentPropertyId={id}
        currentPropertyName={propertyName}
        propertySetProperties={propertySetProperties}
      />

    </div>
  )
}
