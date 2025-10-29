'use client'

import { useState } from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'

interface CanceledSubscriptionBannerProps {
  subscriptionEndDate: Date
  planName: string
  cancelReason?: string
  onReactivate?: () => void
}

export default function CanceledSubscriptionBanner({
  subscriptionEndDate,
  planName,
  cancelReason,
  onReactivate
}: CanceledSubscriptionBannerProps) {
  const [isReactivating, setIsReactivating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isDismissed) return null

  const daysRemaining = Math.ceil(
    (subscriptionEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const handleReactivate = async () => {
    setIsReactivating(true)
    setError(null)

    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Recargar la página para actualizar el estado
        window.location.reload()
      } else {
        setError(data.error || 'Error al reactivar la suscripción')
      }
    } catch (err) {
      console.error('Error reactivando suscripción:', err)
      setError('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsReactivating(false)
    }

    // Llamar callback opcional
    if (onReactivate) {
      onReactivate()
    }
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg shadow-md p-6 mb-6 relative">
      {/* Botón para cerrar */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Cerrar banner"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        {/* Icono de alerta */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tu suscripción está programada para cancelarse
          </h3>

          <div className="text-sm text-gray-700 space-y-1 mb-4">
            <p>
              <span className="font-medium">Plan:</span> {planName}
            </p>
            <p>
              <span className="font-medium">Se cancela el:</span>{' '}
              {subscriptionEndDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p>
              <span className="font-medium">Días restantes:</span>{' '}
              <span className={daysRemaining <= 7 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}
              </span>
            </p>
            {cancelReason && (
              <p className="text-gray-600 italic mt-2">
                Motivo: {cancelReason}
              </p>
            )}
          </div>

          {/* Mensaje de reactivación */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-orange-700">¿Cambiaste de opinión?</span>
              {' '}
              Puedes reactivar tu suscripción ahora mismo <strong>sin costo adicional</strong>.
              Ya has pagado hasta el {subscriptionEndDate.toLocaleDateString('es-ES')}, así que tu plan
              continuará automáticamente después de esa fecha.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleReactivate}
              disabled={isReactivating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReactivating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Reactivando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Reactivar Suscripción Gratis
                </>
              )}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Mantener cancelación
            </button>
          </div>

          {/* Nota informativa */}
          <p className="text-xs text-gray-500 mt-4">
            💡 <strong>Nota:</strong> Si reactivas, tu suscripción se renovará automáticamente al final del período actual.
            Puedes cancelar de nuevo en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  )
}
