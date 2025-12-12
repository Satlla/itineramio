'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Save,
  X,
  Bell,
  AlertTriangle,
  Info,
  Calendar,
  Eye,
  EyeOff,
  Car,
  Wrench,
  Key,
  Wifi,
  Users
} from 'lucide-react'
import { Button } from '../../../../../src/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../src/components/ui/Card'
import { Input } from '../../../../../src/components/ui/Input'
import { PropertySetUpdateModal } from '../../../../../src/components/ui/PropertySetUpdateModal'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../../src/providers/AuthProvider'
import { useNotifications } from '../../../../../src/hooks/useNotifications'

interface MultiLangText {
  es: string
  en: string
  fr: string
}

interface Announcement {
  id: string
  title: MultiLangText
  message: MultiLangText
  category: string
  priority: string
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  { id: 'parking', label: 'Aparcamiento', icon: Car, color: 'blue' },
  { id: 'cleaning', label: 'Limpieza', icon: Users, color: 'green' },
  { id: 'construction', label: 'Obras/Ruidos', icon: Wrench, color: 'orange' },
  { id: 'check-in', label: 'Check-in/out', icon: Key, color: 'purple' },
  { id: 'amenities', label: 'Servicios', icon: Wifi, color: 'indigo' },
  { id: 'other', label: 'Otros', icon: Info, color: 'gray' }
]

const AVISO_TEMPLATES = [
  {
    id: 'check-in-early',
    title: {
      es: 'Check-in temprano no disponible',
      en: 'Early check-in not available',
      fr: 'Arrivée anticipée non disponible'
    },
    message: {
      es: 'No podemos recibir huéspedes antes de las 15:00. Disculpa las molestias.',
      en: 'We cannot receive guests before 3:00 PM. Sorry for the inconvenience.',
      fr: 'Nous ne pouvons pas recevoir les invités avant 15h00. Désolé pour le désagrément.'
    },
    category: 'check-in',
    priority: 'HIGH'
  },
  {
    id: 'check-out-late',
    title: {
      es: 'Check-out tardío no disponible',
      en: 'Late check-out not available',
      fr: 'Départ tardif non disponible'
    },
    message: {
      es: 'No podemos facilitar salida tardía después de las 11:00. Gracias por tu comprensión.',
      en: 'We cannot provide late check-out after 11:00 AM. Thank you for your understanding.',
      fr: 'Nous ne pouvons pas faciliter un départ tardif après 11h00. Merci de votre compréhension.'
    },
    category: 'check-in',
    priority: 'HIGH'
  },
  {
    id: 'no-luggage-storage',
    title: {
      es: 'Sin custodia de equipajes',
      en: 'No luggage storage',
      fr: 'Pas de consigne à bagages'
    },
    message: {
      es: 'No disponemos de servicio de custodia de equipajes. Recomendamos consigna en estación/aeropuerto.',
      en: 'We do not have luggage storage service. We recommend lockers at station/airport.',
      fr: 'Nous n\'avons pas de service de consigne à bagages. Nous recommandons les consignes à la gare/aéroport.'
    },
    category: 'amenities',
    priority: 'NORMAL'
  },
  {
    id: 'no-parking',
    title: {
      es: 'Sin plaza de aparcamiento',
      en: 'No parking space',
      fr: 'Pas de place de parking'
    },
    message: {
      es: 'El alojamiento no dispone de plaza de aparcamiento. Parking público disponible en la zona.',
      en: 'The accommodation does not have a parking space. Public parking available in the area.',
      fr: 'Le logement ne dispose pas de place de parking. Parking public disponible dans la zone.'
    },
    category: 'parking',
    priority: 'HIGH'
  },
  {
    id: 'no-wifi',
    title: {
      es: 'Sin conexión WiFi',
      en: 'No WiFi connection',
      fr: 'Pas de connexion WiFi'
    },
    message: {
      es: 'El alojamiento no tiene conexión WiFi disponible temporalmente. Disculpa las molestias.',
      en: 'The accommodation does not have WiFi connection temporarily available. Sorry for the inconvenience.',
      fr: 'Le logement n\'a pas de connexion WiFi temporairement disponible. Désolé pour le désagrément.'
    },
    category: 'amenities',
    priority: 'URGENT'
  },
  {
    id: 'service-unavailable',
    title: {
      es: 'Servicio temporalmente no disponible',
      en: 'Service temporarily unavailable',
      fr: 'Service temporairement indisponible'
    },
    message: {
      es: 'El servicio de [especificar] no está disponible temporalmente. Se restablecerá el [fecha].',
      en: 'The [specify] service is temporarily unavailable. It will be restored on [date].',
      fr: 'Le service de [spécifier] n\'est pas disponible temporairement. Il sera rétabli le [date].'
    },
    category: 'amenities',
    priority: 'NORMAL'
  }
]

const PRIORITIES = [
  { id: 'LOW', label: 'Baja', color: 'gray' },
  { id: 'NORMAL', label: 'Normal', color: 'blue' },
  { id: 'HIGH', label: 'Alta', color: 'orange' },
  { id: 'URGENT', label: 'Urgente', color: 'red' }
]

export default function PropertyAnnouncementsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  const [propertyId, setPropertyId] = useState<string>('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [propertyName, setPropertyName] = useState('')

  // Property set states
  const [propertySetId, setPropertySetId] = useState<string | null>(null)
  const [propertySetProperties, setPropertySetProperties] = useState<Array<{ id: string; name: string }>>([])
  const [showPropertySetModal, setShowPropertySetModal] = useState(false)
  const [pendingOperation, setPendingOperation] = useState<'create' | 'update' | 'delete' | null>(null)
  const [pendingAnnouncementData, setPendingAnnouncementData] = useState<any>(null)
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: { es: '', en: '', fr: '' },
    message: { es: '', en: '', fr: '' },
    category: 'other',
    priority: 'NORMAL',
    isActive: true,
    startDate: '',
    endDate: ''
  })

  // Language tab state
  const [activeLanguage, setActiveLanguage] = useState<'es' | 'en' | 'fr'>('es')

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id as string
      setPropertyId(id)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (propertyId) {
      loadPropertyData()
      loadAnnouncements()
    }
  }, [propertyId])

  const loadPropertyData = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setPropertyName(data.data.name || 'Propiedad')
        setPropertySetId(data.data.propertySetId || null)

        // Fetch property set properties if this property belongs to a set
        if (data.data.propertySetId) {
          try {
            console.log('🔗 Property belongs to set:', data.data.propertySetId)
            const setResponse = await fetch(`/api/property-sets/${data.data.propertySetId}`)
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
      }
    } catch (error) {
      console.error('Error loading property:', error)
    }
  }

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/announcements?propertyId=${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.data || [])
      } else {
        addNotification({ title: 'Error', message: 'Error al cargar avisos', type: 'error', read: false })
      }
    } catch (error) {
      console.error('Error loading announcements:', error)
      addNotification({ title: 'Error', message: 'Error al cargar anuncios', type: 'error', read: false })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async () => {
    if (!propertyId) {
      addNotification({ title: 'Error', message: 'ID de propiedad no disponible', type: 'error', read: false })
      return
    }

    if (!formData.title.es.trim() || !formData.message.es.trim()) {
      addNotification({ title: 'Error', message: 'Título y mensaje en español son requeridos', type: 'error', read: false })
      return
    }

    console.log('📢 CREATE ANNOUNCEMENT - Starting')
    console.log('📢 propertySetId:', propertySetId)
    console.log('📢 propertySetProperties.length:', propertySetProperties.length)

    // If property is in a set with multiple properties, show PropertySetUpdateModal
    if (propertySetId && propertySetProperties.length > 1) {
      console.log('🔗 Property is in a set, showing PropertySetUpdateModal for CREATE')
      setPendingOperation('create')
      setPendingAnnouncementData(formData)
      setShowPropertySetModal(true)
      return
    }

    console.log('⚠️ NOT showing modal. Creating directly.')
    await performCreateAnnouncement('single')
  }

  const handleUpdateAnnouncement = async () => {
    if (!propertyId || !editingAnnouncement || !formData.title.es.trim() || !formData.message.es.trim()) {
      addNotification({ title: 'Error', message: 'Título y mensaje en español son requeridos', type: 'error', read: false })
      return
    }

    console.log('📢 UPDATE ANNOUNCEMENT - Starting')
    console.log('📢 propertySetId:', propertySetId)
    console.log('📢 propertySetProperties.length:', propertySetProperties.length)

    // If property is in a set with multiple properties, show PropertySetUpdateModal
    if (propertySetId && propertySetProperties.length > 1) {
      console.log('🔗 Property is in a set, showing PropertySetUpdateModal for UPDATE')
      setPendingOperation('update')
      setPendingAnnouncementData({ ...formData, announcementId: editingAnnouncement.id })
      setShowPropertySetModal(true)
      return
    }

    console.log('⚠️ NOT showing modal. Updating directly.')
    await performUpdateAnnouncement('single')
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      return
    }

    console.log('📢 DELETE ANNOUNCEMENT - Starting')
    console.log('📢 propertySetId:', propertySetId)
    console.log('📢 propertySetProperties.length:', propertySetProperties.length)

    // If property is in a set with multiple properties, show PropertySetUpdateModal
    if (propertySetId && propertySetProperties.length > 1) {
      console.log('🔗 Property is in a set, showing PropertySetUpdateModal for DELETE')
      setPendingOperation('delete')
      setAnnouncementToDelete(id)
      setShowPropertySetModal(true)
      return
    }

    console.log('⚠️ NOT showing modal. Deleting directly.')
    await performDeleteAnnouncement('single', [id])
  }

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const response = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !announcement.isActive
        })
      })

      if (response.ok) {
        addNotification({
          title: 'Éxito',
          message: `Anuncio ${!announcement.isActive ? 'activado' : 'desactivado'} correctamente`,
          type: 'success',
          read: false
        })
        loadAnnouncements()
      } else {
        const data = await response.json()
        addNotification({ title: 'Error', message: data.error || 'Error al actualizar anuncio', type: 'error', read: false })
      }
    } catch (error) {
      console.error('Error toggling announcement:', error)
      addNotification({ title: 'Error', message: 'Error al actualizar anuncio', type: 'error', read: false })
    }
  }

  // Multi-property CREATE function
  const performCreateAnnouncement = async (
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    try {
      setSaving(true)
      const propertiesToCreate = scope === 'single'
        ? [propertyId]
        : scope === 'all'
          ? propertySetProperties.map(p => p.id)
          : selectedPropertyIds || []

      let successCount = 0
      for (const propId of propertiesToCreate) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        try {
          const localToken = localStorage.getItem('auth-token')
          if (localToken) {
            headers['Authorization'] = `Bearer ${localToken}`
          }
        } catch (e) {
          console.warn('⚠️ Could not access localStorage:', e)
        }

        const response = await fetch('/api/announcements', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            propertyId: propId,
            ...formData,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null
          })
        })
        if (response.ok) successCount++
      }

      if (successCount > 0) {
        const message = successCount > 1
          ? (scope === 'all'
              ? 'Se ha creado el aviso para todo el conjunto'
              : `Se ha creado el aviso en ${successCount} propiedades`)
          : 'Aviso creado correctamente'

        addNotification({ title: 'Éxito', message, type: 'success', read: false })
        setShowCreateForm(false)
        resetForm()
        loadAnnouncements()
      }
    } catch (error) {
      addNotification({ title: 'Error', message: 'Error al crear aviso', type: 'error', read: false })
    } finally {
      setSaving(false)
    }
  }

  // Multi-property UPDATE function
  const performUpdateAnnouncement = async (
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    if (!editingAnnouncement) return

    try {
      setSaving(true)
      const propertiesToUpdate = scope === 'single'
        ? [propertyId]
        : scope === 'all'
          ? propertySetProperties.map(p => p.id)
          : selectedPropertyIds || []

      let successCount = 0
      // For each property, find matching announcement by title and update it
      for (const propId of propertiesToUpdate) {
        // Get announcements for this property
        const announcementsResponse = await fetch(`/api/announcements?propertyId=${propId}`)
        if (!announcementsResponse.ok) continue

        const announcementsData = await announcementsResponse.json()
        const matchingAnnouncement = announcementsData.data?.find((a: Announcement) =>
          a.title.es === editingAnnouncement.title.es
        )

        if (matchingAnnouncement) {
          const response = await fetch(`/api/announcements/${matchingAnnouncement.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              startDate: formData.startDate || null,
              endDate: formData.endDate || null
            })
          })
          if (response.ok) successCount++
        }
      }

      if (successCount > 0) {
        const message = successCount > 1
          ? (scope === 'all'
              ? `Se ha actualizado "${formData.title.es}" en todo el conjunto`
              : `Se ha actualizado "${formData.title.es}" en ${successCount} propiedades`)
          : 'Aviso actualizado correctamente'

        addNotification({ title: 'Éxito', message, type: 'success', read: false })
        setEditingAnnouncement(null)
        resetForm()
        loadAnnouncements()
      }
    } catch (error) {
      addNotification({ title: 'Error', message: 'Error al actualizar aviso', type: 'error', read: false })
    } finally {
      setSaving(false)
    }
  }

  // Multi-property DELETE function
  const performDeleteAnnouncement = async (
    scope: 'single' | 'all' | 'selected',
    announcementIds: string[],
    selectedPropertyIds?: string[]
  ) => {
    if (announcementIds.length === 0) return

    try {
      const propertiesToDelete = scope === 'single'
        ? [propertyId]
        : scope === 'all'
          ? propertySetProperties.map(p => p.id)
          : selectedPropertyIds || []

      // Get the announcement title for the message
      let announcementTitle = ''
      const firstAnnouncement = announcements.find(a => a.id === announcementIds[0])
      if (firstAnnouncement) announcementTitle = firstAnnouncement.title.es

      let successCount = 0
      // For each property, find and delete matching announcements
      for (const propId of propertiesToDelete) {
        const announcementsResponse = await fetch(`/api/announcements?propertyId=${propId}`)
        if (!announcementsResponse.ok) continue

        const announcementsData = await announcementsResponse.json()
        const matchingAnnouncement = announcementsData.data?.find((a: Announcement) =>
          a.title.es === announcementTitle
        )

        if (matchingAnnouncement) {
          const response = await fetch(`/api/announcements/${matchingAnnouncement.id}`, {
            method: 'DELETE'
          })
          if (response.ok) successCount++
        }
      }

      if (successCount > 0) {
        const message = successCount > 1
          ? (scope === 'all'
              ? `Se ha eliminado "${announcementTitle}" de todo el conjunto`
              : `Se ha eliminado "${announcementTitle}" de ${successCount} propiedades`)
          : 'Aviso eliminado correctamente'

        addNotification({ title: 'Éxito', message, type: 'success', read: false })
        loadAnnouncements()
      }
    } catch (error) {
      addNotification({ title: 'Error', message: 'Error al eliminar aviso', type: 'error', read: false })
    }
  }

  // Modal handler
  const handlePropertySetConfirm = async (
    scope: 'single' | 'all' | 'selected',
    selectedPropertyIds?: string[]
  ) => {
    setShowPropertySetModal(false)

    if (pendingOperation === 'create') {
      await performCreateAnnouncement(scope, selectedPropertyIds)
    } else if (pendingOperation === 'update') {
      await performUpdateAnnouncement(scope, selectedPropertyIds)
    } else if (pendingOperation === 'delete' && announcementToDelete) {
      await performDeleteAnnouncement(scope, [announcementToDelete], selectedPropertyIds)
    }

    // Clear pending states
    setPendingOperation(null)
    setPendingAnnouncementData(null)
    setAnnouncementToDelete(null)
  }

  const startEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      message: announcement.message,
      category: announcement.category,
      priority: announcement.priority,
      isActive: announcement.isActive,
      startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : ''
    })
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: { es: '', en: '', fr: '' },
      message: { es: '', en: '', fr: '' },
      category: 'other',
      priority: 'NORMAL',
      isActive: true,
      startDate: '',
      endDate: ''
    })
    setActiveLanguage('es')
  }

  const cancelEdit = () => {
    setEditingAnnouncement(null)
    setShowCreateForm(false)
    resetForm()
  }

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[5]
  }

  const getPriorityInfo = (priorityId: string) => {
    return PRIORITIES.find(pri => pri.id === priorityId) || PRIORITIES[1]
  }

  const getPriorityBadgeClass = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-700',
      NORMAL: 'bg-blue-100 text-blue-700',
      HIGH: 'bg-orange-100 text-orange-700',
      URGENT: 'bg-red-100 text-red-700'
    }
    return colors[priority as keyof typeof colors] || colors.NORMAL
  }

  // Wait for propertyId to be available
  if (!propertyId) {
    return (
      <div className="min-h-screen bg-white" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/properties/${propertyId}/zones`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a {propertyName}
          </button>
          
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Avisos Importantes
            </h1>
            
            <p className="text-gray-600 text-base leading-relaxed max-w-3xl">
              Los avisos son para comunicar limitaciones importantes que los huéspedes deben conocer antes de su llegada. Úsalos para informar sobre servicios no disponibles, restricciones de horarios o situaciones temporales.
            </p>
            
            <div className="pt-2">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-black hover:bg-gray-900 text-white rounded-lg px-6 py-3 font-medium transition-colors"
                disabled={announcements.filter(a => a.isActive).length >= 5}
              >
                <Plus className="w-4 h-4 mr-2 inline-block" />
                Nuevo Aviso {announcements.filter(a => a.isActive).length >= 5 && `(Máx. 5)`}
              </Button>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mb-8 border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <CardTitle className="text-lg font-medium">
                {editingAnnouncement ? 'Editar Aviso' : 'Crear Nuevo Aviso'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Plantillas Predefinidas */}
              {!editingAnnouncement && (
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4">
                    Plantillas rápidas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVISO_TEMPLATES.map((template) => {
                    const categoryInfo = getCategoryInfo(template.category)
                    const IconComponent = categoryInfo.icon
                    return (
                      <button
                        key={template.id}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            title: template.title,
                            message: template.message,
                            category: template.category,
                            priority: template.priority
                          })
                        }}
                        className="text-left p-4 border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all bg-white"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-${categoryInfo.color}-50`}>
                            <IconComponent className={`w-5 h-5 text-${categoryInfo.color}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {template.title.es}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {template.message.es}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Selecciona una plantilla para empezar
                </p>
              </div>
            )}

              {/* Language Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveLanguage('es')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeLanguage === 'es'
                        ? 'border-violet-600 text-violet-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🇪🇸 Español
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLanguage('en')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeLanguage === 'en'
                        ? 'border-violet-600 text-violet-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLanguage('fr')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeLanguage === 'fr'
                        ? 'border-violet-600 text-violet-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título * {activeLanguage === 'es' && '(requerido)'}
                  </label>
                  <Input
                    value={formData.title[activeLanguage]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, [activeLanguage]: e.target.value }
                    }))}
                    placeholder={
                      activeLanguage === 'es' ? 'Ej: Obras en el edificio' :
                      activeLanguage === 'en' ? 'Ex: Building construction' :
                      'Ex: Travaux dans le bâtiment'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje * {activeLanguage === 'es' && '(requerido)'}
                </label>
                <textarea
                  value={formData.message[activeLanguage]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    message: { ...prev.message, [activeLanguage]: e.target.value }
                  }))}
                  placeholder={
                    activeLanguage === 'es' ? 'Describe la información importante que deben saber tus huéspedes...' :
                    activeLanguage === 'en' ? 'Describe the important information your guests should know...' :
                    'Décrivez les informations importantes que vos invités doivent connaître...'
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {activeLanguage !== 'es' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional - Si lo dejas vacío, se mostrará el texto en español
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha inicio (opcional)
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deja vacío para activar inmediatamente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha fin (opcional)
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deja vacío para aviso permanente
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2 w-4 h-4 text-black rounded focus:ring-black"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Aviso activo (visible para los huéspedes)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
                  disabled={saving}
                  className="bg-black hover:bg-gray-900 text-white px-6 py-2"
                >
                  {saving ? 'Guardando...' : (editingAnnouncement ? 'Actualizar aviso' : 'Crear aviso')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcements List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes avisos creados
              </h3>
              <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
                Crea tu primer aviso para comunicar información importante a tus huéspedes
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-black hover:bg-gray-900 text-white rounded-lg px-6 py-3 font-medium"
              >
                <Plus className="w-4 h-4 mr-2 inline-block" />
                Crear Primer Aviso
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const category = getCategoryInfo(announcement.category)
              const priority = getPriorityInfo(announcement.priority)
              const CategoryIcon = category.icon

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`${!announcement.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                              <CategoryIcon className={`w-5 h-5 text-${category.color}-600`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {announcement.title.es}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadgeClass(announcement.priority)}`}>
                                  {priority.label}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full bg-${category.color}-100 text-${category.color}-700`}>
                                  {category.label}
                                </span>
                                {!announcement.isActive && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">
                            {announcement.message.es}
                          </p>

                          {/* Multi-language indicator */}
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-xs text-gray-500">Idiomas:</span>
                            {announcement.title.es && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">🇪🇸 ES</span>}
                            {announcement.title.en && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">🇬🇧 EN</span>}
                            {announcement.title.fr && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">🇫🇷 FR</span>}
                          </div>
                          
                          {(announcement.startDate || announcement.endDate) && (
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                              <Calendar className="w-4 h-4 mr-1" />
                              {announcement.startDate && (
                                <span>Desde: {new Date(announcement.startDate).toLocaleDateString()}</span>
                              )}
                              {announcement.startDate && announcement.endDate && <span className="mx-2">•</span>}
                              {announcement.endDate && (
                                <span>Hasta: {new Date(announcement.endDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-400">
                            Creado: {new Date(announcement.createdAt).toLocaleDateString()}
                            {announcement.updatedAt !== announcement.createdAt && (
                              <> • Actualizado: {new Date(announcement.updatedAt).toLocaleDateString()}</>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(announcement)}
                            className={announcement.isActive ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'}
                          >
                            {announcement.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(announcement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Property Set Update Modal */}
      <PropertySetUpdateModal
        isOpen={showPropertySetModal}
        onClose={() => setShowPropertySetModal(false)}
        onConfirm={handlePropertySetConfirm}
        currentPropertyId={propertyId}
        currentPropertyName={propertyName}
        propertySetProperties={propertySetProperties}
      />
    </div>
  )
}