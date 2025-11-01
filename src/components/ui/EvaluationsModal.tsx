import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Settings, Mail, Bell, Eye, EyeOff, Check, MapPin, Home } from 'lucide-react'
import { Button } from './Button'

interface Evaluation {
  id: string
  type: 'zone' | 'property'
  rating: number
  comment?: string
  userName: string
  userEmail?: string
  createdAt: string
  isPublic: boolean
  isApproved: boolean
  // Zone specific
  zoneId?: string
  zoneName?: string
  // Property specific  
  propertyId: string
  propertyName: string
}

interface NotificationSettings {
  emailNotifications: {
    zoneEvaluations: boolean
    propertyEvaluations: boolean
  }
  dashboardNotifications: {
    zoneEvaluations: boolean
    propertyEvaluations: boolean
  }
}

interface EvaluationsModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  propertyName: string
}

export function EvaluationsModal({ isOpen, onClose, propertyId, propertyName }: EvaluationsModalProps) {
  const [activeTab, setActiveTab] = useState<'zone' | 'property'>('zone')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: {
      zoneEvaluations: true,
      propertyEvaluations: true
    },
    dashboardNotifications: {
      zoneEvaluations: true,
      propertyEvaluations: true
    }
  })

  // Fetch evaluations
  useEffect(() => {
    if (isOpen) {
      fetchEvaluations()
      fetchSettings()
    }
  }, [isOpen, propertyId])

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}/evaluations/enhanced`)
      const result = await response.json()
      
      if (result.success) {
        setEvaluations(result.data)
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/account/notification-settings')
      const result = await response.json()
      
      if (result.success && result.data) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const updateSettings = async (newSettings: NotificationSettings) => {
    try {
      const response = await fetch('/api/account/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        setSettings(newSettings)
      }
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const toggleEvaluationVisibility = async (evaluationId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/toggle-public`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic })
      })

      if (response.ok) {
        setEvaluations(prev => 
          prev.map(evaluation => 
            evaluation.id === evaluationId ? { ...evaluation, isPublic } : evaluation
          )
        )
      }
    } catch (error) {
      console.error('Error toggling evaluation visibility:', error)
    }
  }

  const filteredEvaluations = evaluations.filter(evaluation => evaluation.type === activeTab)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b">
            <div>
              <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900">Evaluaciones</h2>
              <p className="text-gray-600">{propertyName}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-b bg-gray-50 overflow-hidden"
            >
              <div className="p-3 sm:p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Configuración de Notificaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-4 md:p-6">
                  {/* Email Notifications */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Correos Electrónicos
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications.zoneEvaluations}
                          onChange={(e) => updateSettings({
                            ...settings,
                            emailNotifications: {
                              ...settings.emailNotifications,
                              zoneEvaluations: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Evaluaciones de zona</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications.propertyEvaluations}
                          onChange={(e) => updateSettings({
                            ...settings,
                            emailNotifications: {
                              ...settings.emailNotifications,
                              propertyEvaluations: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Evaluaciones generales</span>
                      </label>
                    </div>
                  </div>

                  {/* Dashboard Notifications */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Bell className="w-4 h-4 mr-2" />
                      Notificaciones Dashboard
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.dashboardNotifications.zoneEvaluations}
                          onChange={(e) => updateSettings({
                            ...settings,
                            dashboardNotifications: {
                              ...settings.dashboardNotifications,
                              zoneEvaluations: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Evaluaciones de zona</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.dashboardNotifications.propertyEvaluations}
                          onChange={(e) => updateSettings({
                            ...settings,
                            dashboardNotifications: {
                              ...settings.dashboardNotifications,
                              propertyEvaluations: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Evaluaciones generales</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('zone')}
              className={`flex-1 px-3 sm:px-4 md:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'zone'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MapPin className="w-4 h-4 mr-2 inline" />
              Evaluaciones de Zona ({evaluations.filter(e => e.type === 'zone').length})
            </button>
            <button
              onClick={() => setActiveTab('property')}
              className={`flex-1 px-3 sm:px-4 md:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'property'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-4 h-4 mr-2 inline" />
              Evaluaciones Generales ({evaluations.filter(e => e.type === 'property').length})
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-3 sm:py-4 md:py-3 sm:py-4 md:py-6 lg:py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="text-center py-3 sm:py-4 md:py-3 sm:py-4 md:py-6 lg:py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay evaluaciones aún
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'zone' 
                    ? 'Las evaluaciones de zona aparecerán aquí cuando los huéspedes evalúen zonas específicas.'
                    : 'Las evaluaciones generales aparecerán aquí cuando los huéspedes evalúen todo el manual.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex items-center">
                            {renderStars(evaluation.rating)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {evaluation.userName}
                          </span>
                          {evaluation.type === 'zone' && evaluation.zoneName && (
                            <span className="text-sm text-gray-500">
                              • {evaluation.zoneName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(evaluation.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {evaluation.comment && (
                          <p className="text-gray-700">{evaluation.comment}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleEvaluationVisibility(evaluation.id, !evaluation.isPublic)}
                          className={`p-2 rounded-full transition-colors ${
                            evaluation.isPublic
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={evaluation.isPublic ? 'Hacer privada' : 'Hacer pública'}
                        >
                          {evaluation.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        {evaluation.isPublic && (
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Pública
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}