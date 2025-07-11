'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell,
  Mail,
  Smartphone,
  Save,
  Star,
  MessageSquare,
  Home,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '../../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/Card'
import { useAuth } from '../../../../src/providers/AuthProvider'

interface NotificationPreferences {
  emailEvaluations: boolean
  emailSuggestions: boolean
  emailPropertyUpdates: boolean
  emailSystemUpdates: boolean
  inAppEvaluations: boolean
  inAppSuggestions: boolean
  inAppPropertyUpdates: boolean
  inAppSystemUpdates: boolean
}

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEvaluations: true,
    emailSuggestions: true,
    emailPropertyUpdates: true,
    emailSystemUpdates: false,
    inAppEvaluations: true,
    inAppSuggestions: true,
    inAppPropertyUpdates: true,
    inAppSystemUpdates: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/settings/notifications')
      const result = await response.json()
      
      if (result.success && result.preferences) {
        setPreferences(result.preferences)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración de Notificaciones
          </h1>
          <p className="text-gray-600">
            Personaliza cómo y cuándo quieres recibir notificaciones sobre la actividad de tus propiedades.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Notificaciones por Email</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Recibe emails en tu bandeja de entrada para mantenerte informado.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="font-medium text-gray-900">Evaluaciones</div>
                    <div className="text-sm text-gray-600">Nuevas evaluaciones de huéspedes</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailEvaluations}
                    onChange={(e) => updatePreference('emailEvaluations', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900">Sugerencias</div>
                    <div className="text-sm text-gray-600">Sugerencias para mejorar tus manuales</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailSuggestions}
                    onChange={(e) => updatePreference('emailSuggestions', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Home className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-medium text-gray-900">Actualizaciones de Propiedades</div>
                    <div className="text-sm text-gray-600">Cambios importantes en tus propiedades</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailPropertyUpdates}
                    onChange={(e) => updatePreference('emailPropertyUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="font-medium text-gray-900">Actualizaciones del Sistema</div>
                    <div className="text-sm text-gray-600">Nuevas funciones y anuncios importantes</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailSystemUpdates}
                    onChange={(e) => updatePreference('emailSystemUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-violet-600" />
                <span>Notificaciones en la App</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Notificaciones que aparecen en tu dashboard cuando estás conectado.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="font-medium text-gray-900">Evaluaciones</div>
                    <div className="text-sm text-gray-600">Nuevas evaluaciones de huéspedes</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inAppEvaluations}
                    onChange={(e) => updatePreference('inAppEvaluations', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900">Sugerencias</div>
                    <div className="text-sm text-gray-600">Sugerencias para mejorar tus manuales</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inAppSuggestions}
                    onChange={(e) => updatePreference('inAppSuggestions', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Home className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-medium text-gray-900">Actualizaciones de Propiedades</div>
                    <div className="text-sm text-gray-600">Cambios importantes en tus propiedades</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inAppPropertyUpdates}
                    onChange={(e) => updatePreference('inAppPropertyUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="font-medium text-gray-900">Actualizaciones del Sistema</div>
                    <div className="text-sm text-gray-600">Nuevas funciones y anuncios importantes</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inAppSystemUpdates}
                    onChange={(e) => updatePreference('inAppSystemUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <motion.div
            initial={false}
            animate={saved ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={savePreferences}
              disabled={saving}
              className={`px-8 py-3 ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-violet-600 hover:bg-violet-700'} text-white`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Guardando...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Preferencias
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Info Card */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Sobre las Notificaciones</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• <strong>Evaluaciones:</strong> Se envían cuando los huéspedes califican tu propiedad o zonas específicas.</p>
                  <p>• <strong>Sugerencias:</strong> Los huéspedes pueden sugerir mejoras a tu manual desde la vista pública.</p>
                  <p>• <strong>Actualizaciones de Propiedades:</strong> Cambios importantes como publicación, cambios de estado, etc.</p>
                  <p>• <strong>Actualizaciones del Sistema:</strong> Nuevas funciones de Itineramio y anuncios importantes.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}