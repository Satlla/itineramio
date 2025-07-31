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
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../../src/providers/AuthProvider'
import { useNotifications } from '../../../../../src/hooks/useNotifications'

interface Announcement {
  id: string
  title: string
  message: string
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
    title: 'Check-in temprano no disponible',
    message: 'No podemos recibir huéspedes antes de las 15:00. Disculpa las molestias.',
    category: 'check-in',
    priority: 'HIGH'
  },
  {
    id: 'check-out-late', 
    title: 'Check-out tardío no disponible',
    message: 'No podemos facilitar salida tardía después de las 11:00. Gracias por tu comprensión.',
    category: 'check-in',
    priority: 'HIGH'
  },
  {
    id: 'no-luggage-storage',
    title: 'Sin custodia de equipajes',
    message: 'No disponemos de servicio de custodia de equipajes. Recomendamos consigna en estación/aeropuerto.',
    category: 'amenities',
    priority: 'NORMAL'
  },
  {
    id: 'no-parking',
    title: 'Sin plaza de aparcamiento',
    message: 'El alojamiento no dispone de plaza de aparcamiento. Parking público disponible en la zona.',
    category: 'parking',
    priority: 'HIGH'
  },
  {
    id: 'no-wifi',
    title: 'Sin conexión WiFi',
    message: 'El alojamiento no tiene conexión WiFi disponible temporalmente. Disculpa las molestias.',
    category: 'amenities',
    priority: 'URGENT'
  },
  {
    id: 'service-unavailable',
    title: 'Servicio temporalmente no disponible',
    message: 'El servicio de [especificar] no está disponible temporalmente. Se restablecerá el [fecha].',
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
  const propertyId = params.id as string
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [propertyName, setPropertyName] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'other',
    priority: 'NORMAL',
    isActive: true,
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadPropertyData()
    loadAnnouncements()
  }, [propertyId])

  const loadPropertyData = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setPropertyName(data.name || 'Propiedad')
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
    if (!formData.title.trim() || !formData.message.trim()) {
      addNotification({ title: 'Error', message: 'Título y mensaje son requeridos', type: 'error', read: false })
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null
        })
      })

      if (response.ok) {
        addNotification({ title: 'Éxito', message: 'Anuncio creado correctamente', type: 'success', read: false })
        setShowCreateForm(false)
        resetForm()
        loadAnnouncements()
      } else {
        const data = await response.json()
        addNotification({ title: 'Error', message: data.error || 'Error al crear aviso', type: 'error', read: false })
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
      addNotification({ title: 'Error', message: 'Error al crear aviso', type: 'error', read: false })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement || !formData.title.trim() || !formData.message.trim()) {
      addNotification({ title: 'Error', message: 'Título y mensaje son requeridos', type: 'error', read: false })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null
        })
      })

      if (response.ok) {
        addNotification({ title: 'Éxito', message: 'Anuncio actualizado correctamente', type: 'success', read: false })
        setEditingAnnouncement(null)
        resetForm()
        loadAnnouncements()
      } else {
        const data = await response.json()
        addNotification({ title: 'Error', message: data.error || 'Error al actualizar anuncio', type: 'error', read: false })
      }
    } catch (error) {
      console.error('Error updating announcement:', error)
      addNotification({ title: 'Error', message: 'Error al actualizar anuncio', type: 'error', read: false })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      return
    }

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addNotification({ title: 'Éxito', message: 'Anuncio eliminado correctamente', type: 'success', read: false })
        loadAnnouncements()
      } else {
        const data = await response.json()
        addNotification({ title: 'Error', message: data.error || 'Error al eliminar anuncio', type: 'error', read: false })
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      addNotification({ title: 'Error', message: 'Error al eliminar anuncio', type: 'error', read: false })
    }
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
      title: '',
      message: '',
      category: 'other',
      priority: 'NORMAL',
      isActive: true,
      startDate: '',
      endDate: ''
    })
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/properties/${propertyId}/zones`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a {propertyName}
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="w-8 h-8 mr-3 text-orange-600" />
                Avisos Importantes
              </h1>
              <p className="text-gray-600 mt-2">
                Los avisos son para comunicar limitaciones importantes que los huéspedes deben conocer antes de su llegada. Úsalos para informar sobre servicios no disponibles, restricciones de horarios o situaciones temporales.
              </p>
            </div>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={announcements.filter(a => a.isActive).length >= 5}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Aviso {announcements.filter(a => a.isActive).length >= 5 && `(Máx. 5)`}
            </Button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingAnnouncement ? 'Editar Aviso' : 'Crear Nuevo Aviso'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plantillas Predefinidas */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  💡 Plantillas Predefinidas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        className="text-left p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      >
                        <div className="flex items-start space-x-2">
                          <IconComponent className={`w-4 h-4 mt-0.5 text-${categoryInfo.color}-600`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {template.title}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {template.message}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Haz clic en una plantilla para usarla como base y personalízala según tus necesidades
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Obras en el edificio"
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
                  Mensaje *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe la información importante que deben saber tus huéspedes..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
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
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha fin (opcional)
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Anuncio activo (visible para los huéspedes)
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : (editingAnnouncement ? 'Actualizar' : 'Crear')}
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
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes avisos creados
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primer aviso para comunicar información importante a tus huéspedes
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Anuncio
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
                                {announcement.title}
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
                            {announcement.message}
                          </p>
                          
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
    </div>
  )
}