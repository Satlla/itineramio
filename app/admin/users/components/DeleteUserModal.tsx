'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, Trash2, CheckCircle } from 'lucide-react'

interface DeleteUserModalProps {
  userId: string | null
  userName: string
  userEmail: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteUserModal({
  userId,
  userName,
  userEmail,
  isOpen,
  onClose,
  onSuccess
}: DeleteUserModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const steps = [
    'Validando permisos...',
    'Eliminando propiedades...',
    'Eliminando zonas y pasos...',
    'Eliminando suscripciones...',
    'Eliminando notificaciones...',
    'Eliminando datos del usuario...',
    'Finalizando...'
  ]

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setConfirmText('')
      setDeleting(false)
      setProgress(0)
      setCurrentStep('')
      setError('')
      setSuccess(false)
    }
  }, [isOpen])

  const simulateProgress = () => {
    let currentProgress = 0
    let stepIndex = 0

    const interval = setInterval(() => {
      currentProgress += Math.random() * 15

      if (currentProgress > 100) {
        currentProgress = 100
      }

      setProgress(currentProgress)

      // Update step based on progress
      const newStepIndex = Math.min(
        Math.floor((currentProgress / 100) * steps.length),
        steps.length - 1
      )

      if (newStepIndex !== stepIndex) {
        stepIndex = newStepIndex
        setCurrentStep(steps[stepIndex])
      }

      if (currentProgress >= 100) {
        clearInterval(interval)
      }
    }, 300)

    return interval
  }

  const handleDelete = async () => {
    if (!userId) return

    setDeleting(true)
    setError('')
    setProgress(0)
    setCurrentStep(steps[0])

    const progressInterval = simulateProgress()

    try {
      const response = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el usuario')
      }

      // Ensure progress reaches 100%
      setProgress(100)
      setCurrentStep('¡Completado!')
      setSuccess(true)

      // Wait a bit to show success state
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)

    } catch (err: any) {
      clearInterval(progressInterval)
      setError(err.message || 'Error al eliminar el usuario')
      setDeleting(false)
      setProgress(0)
      setCurrentStep('')
    }
  }

  if (!isOpen) return null

  const canDelete = confirmText === 'ELIMINAR'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Eliminar Usuario
            </h2>
          </div>
          {!deleting && !success && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            // Success State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Usuario eliminado correctamente!
              </h3>
              <p className="text-gray-600">
                Todos los datos han sido eliminados de forma permanente.
              </p>
            </div>
          ) : deleting ? (
            // Deleting State with Progress Bar
            <div className="py-4">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {currentStep}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center">
                  Por favor, espera mientras eliminamos todos los datos del usuario...
                </p>
              </div>
            </div>
          ) : (
            // Confirmation State
            <>
              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900 mb-1">
                      ⚠️ Acción Permanente e Irreversible
                    </h4>
                    <p className="text-sm text-red-700">
                      Esta acción eliminará de forma permanente:
                    </p>
                    <ul className="mt-2 text-sm text-red-700 space-y-1 list-disc list-inside">
                      <li>Todos los datos del usuario</li>
                      <li>Todas sus propiedades y zonas</li>
                      <li>Todas sus suscripciones</li>
                      <li>Todo su historial y notificaciones</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Usuario a eliminar:</span>
                </p>
                <p className="text-base font-medium text-gray-900">{userName}</p>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>

              {/* Confirmation Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para confirmar, escribe <span className="font-mono font-bold text-red-600">ELIMINAR</span>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="Escribe ELIMINAR aquí"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                  disabled={deleting}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!deleting && !success && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                canDelete && !deleting
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Eliminar Permanentemente</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
