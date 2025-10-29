'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Mail, 
  MessageCircle, 
  Star,
  AlertCircle,
  Settings,
  Save,
  ArrowLeft,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { Button } from '../../../../src/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../src/components/ui/Card'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../src/providers/AuthProvider'

interface NotificationSettings {
  emailNotifications: {
    evaluations: boolean
    propertyUpdates: boolean
    weeklyReports: boolean
    marketing: boolean
  }
  pushNotifications: {
    enabled: boolean
    evaluations: boolean
    propertyUpdates: boolean
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: {
      evaluations: true,
      propertyUpdates: true,
      weeklyReports: false,
      marketing: false
    },
    pushNotifications: {
      enabled: false,
      evaluations: true,
      propertyUpdates: true
    }
  })

  // Load user notification preferences
  useEffect(() => {
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/account/notification-settings')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setSettings(result.data)
        }
      } else {
        // Fallback to localStorage if API fails
        const savedSettings = localStorage.getItem('notificationSettings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('notificationSettings')
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (e) {
          console.error('Error parsing saved settings:', e)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      // Save to API
      const response = await fetch('/api/account/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        // Also save to localStorage for immediate effect
        localStorage.setItem('notificationSettings', JSON.stringify(settings))
        
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving notification settings:', error)
      alert('Error al guardar la configuración. Por favor, intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const toggleSetting = (category: 'emailNotifications' | 'pushNotifications', setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }))
  }

  const NotificationToggle = ({ 
    enabled, 
    onToggle 
  }: { 
    enabled: boolean
    onToggle: () => void 
  }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-violet-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/account')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a cuenta
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bell className="w-8 h-8 mr-3 text-violet-600" />
          Configuración de Notificaciones
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona cómo y cuándo quieres recibir notificaciones
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-violet-600" />
                Notificaciones por Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Evaluaciones y Reseñas</h3>
                  <p className="text-sm text-gray-600">
                    Recibe un email cuando alguien evalúe tus propiedades o zonas
                  </p>
                </div>
                <NotificationToggle
                  enabled={settings.emailNotifications.evaluations}
                  onToggle={() => toggleSetting('emailNotifications', 'evaluations')}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Actualizaciones de Propiedades</h3>
                  <p className="text-sm text-gray-600">
                    Notificaciones sobre cambios importantes en tus propiedades
                  </p>
                </div>
                <NotificationToggle
                  enabled={settings.emailNotifications.propertyUpdates}
                  onToggle={() => toggleSetting('emailNotifications', 'propertyUpdates')}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Reportes Semanales</h3>
                  <p className="text-sm text-gray-600">
                    Resumen semanal de estadísticas y actividad
                  </p>
                </div>
                <NotificationToggle
                  enabled={settings.emailNotifications.weeklyReports}
                  onToggle={() => toggleSetting('emailNotifications', 'weeklyReports')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium">Novedades y Consejos</h3>
                  <p className="text-sm text-gray-600">
                    Actualizaciones sobre nuevas funcionalidades y mejores prácticas
                  </p>
                </div>
                <NotificationToggle
                  enabled={settings.emailNotifications.marketing}
                  onToggle={() => toggleSetting('emailNotifications', 'marketing')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-violet-600" />
                Notificaciones Push
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      Las notificaciones push estarán disponibles próximamente.
                      Por ahora, asegúrate de tener las notificaciones por email activadas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 opacity-50">
                <div>
                  <h3 className="font-medium">Activar Notificaciones Push</h3>
                  <p className="text-sm text-gray-600">
                    Recibe notificaciones instantáneas en tu navegador
                  </p>
                </div>
                <NotificationToggle
                  enabled={false}
                  onToggle={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center"
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          Configuración guardada correctamente
        </motion.div>
      )}
    </div>
  )
}