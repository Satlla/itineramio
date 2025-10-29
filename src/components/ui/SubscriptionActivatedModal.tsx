'use client'

import React, { useEffect } from 'react'
import { CheckCircle2, X, CreditCard, Calendar, Building2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NotificationData {
  id: string
  data?: {
    planName?: string
    subscriptionId?: string
    invoiceId?: string
  }
}

interface SubscriptionActivatedModalProps {
  onClose: () => void
  notification: NotificationData
}

export const SubscriptionActivatedModal: React.FC<SubscriptionActivatedModalProps> = ({ onClose, notification }) => {
  const router = useRouter()

  useEffect(() => {
    // Marcar la notificación como leída al mostrar el modal
    const markAsRead = async () => {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
    markAsRead()
  }, [notification.id])

  const handleViewSubscription = () => {
    router.push('/subscriptions')
    onClose()
  }

  const handleCreateProperty = () => {
    router.push('/properties/new')
    onClose()
  }

  const handleGoToDashboard = () => {
    router.push('/main')
    onClose()
  }

  const planName = notification.data?.planName || 'tu plan'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-300">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              ¡Suscripción Activada!
            </h2>
            <p className="text-green-100">
              Tu plan {planName} está listo para usar
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestiona más propiedades</h3>
                <p className="text-sm text-gray-600">
                  Ahora puedes crear y gestionar más propiedades según tu plan
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Acceso a funciones premium</h3>
                <p className="text-sm text-gray-600">
                  Disfruta de todas las funciones incluidas en {planName}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Facturación transparente</h3>
                <p className="text-sm text-gray-600">
                  Consulta tus facturas y renueva fácilmente desde tu panel
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3 pt-4 border-t">
            <button
              onClick={handleCreateProperty}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Crear Nueva Propiedad
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleViewSubscription}
              className="w-full border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              Ver Detalles de Suscripción
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleGoToDashboard}
              className="w-full text-gray-600 hover:text-gray-900 py-2 font-medium underline underline-offset-4 transition-colors"
            >
              Ir a Dashboard
            </button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Si tienes alguna pregunta, no dudes en contactarnos en{' '}
            <a href="mailto:hola@itineramio.com" className="text-green-600 hover:underline">
              hola@itineramio.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
