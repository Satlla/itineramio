'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Building,
  Gift,
  X
} from 'lucide-react'
import { Button } from './ui/Button'

interface TrialActivationModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  propertyName: string
  monthlyFee: number
  onActivateTrial: () => void
  onPayNow: () => void
  isFirstProperty?: boolean
}

export function TrialActivationModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  monthlyFee,
  onActivateTrial,
  onPayNow,
  isFirstProperty = false
}: TrialActivationModalProps) {
  const [loading, setLoading] = useState(false)

  const handleActivateTrial = async () => {
    setLoading(true)
    try {
      await onActivateTrial()
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = async () => {
    setLoading(true)
    try {
      await onPayNow()
    } finally {
      setLoading(false)
    }
  }

  if (isFirstProperty) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-[90vw] sm:max-w-sm md:max-w-md w-full p-3 sm:p-4 md:p-6"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  15 días de evaluación incluidos
                </h2>
                <p className="text-gray-600">
                  Como nuevo anfitrión, puedes probar Itineramio durante 15 días.
                  No necesitas pagar nada.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">Evaluación de 15 días incluye:</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    1 propiedad completa
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Zonas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Códigos QR y acceso web
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sin límite de tiempo
                  </li>
                </ul>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continuar a mi propiedad
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl max-w-[90vw] sm:max-w-[90vw] sm:max-w-sm md:max-w-md md:max-w-lg w-full p-3 sm:p-4 md:p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Activa tu nueva propiedad
              </h2>
              <p className="text-gray-600">
                "{propertyName}" requiere un plan de pago para estar activa
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Precio mensual:</h3>
              <div className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl font-bold text-blue-600">
                €{Number(monthlyFee).toFixed(2)}/mes
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Plan mensual
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Evaluación de 15 días</h4>
                  <p className="text-sm text-gray-600">
                    Activa tu propiedad inmediatamente con período de prueba
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Pago flexible</h4>
                  <p className="text-sm text-gray-600">
                    Bizum o transferencia bancaria
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleActivateTrial}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Activar prueba de 48 horas
              </Button>
              
              <Button
                onClick={handlePayNow}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar ahora
              </Button>
              
              <button
                onClick={onClose}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Configurar más tarde
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Podrás cancelar en cualquier momento. Sin compromisos.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}