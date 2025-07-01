'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { AlertTriangle, X, Trash2, Type, Building, MapPin } from 'lucide-react'
import { Input } from './Input'

interface DeletePropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyName: string
  propertyType: string
  propertyLocation: string
  zonesCount: number
  isDeleting?: boolean
}

export function DeletePropertyModal({
  isOpen,
  onClose,
  onConfirm,
  propertyName,
  propertyType,
  propertyLocation,
  zonesCount,
  isDeleting = false
}: DeletePropertyModalProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [step, setStep] = useState(1) // 1: Warning, 2: Confirmation
  
  const expectedText = 'ELIMINAR PROPIEDAD'
  const isConfirmationValid = confirmationText === expectedText

  const handleNextStep = () => {
    setStep(2)
  }

  const handleConfirm = () => {
    if (isConfirmationValid) {
      onConfirm()
    }
  }

  const handleClose = () => {
    setStep(1)
    setConfirmationText('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {step === 1 ? (
            <>
              {/* Warning Step */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ⚠️ Eliminar Propiedad
                </h2>
                <p className="text-gray-600">
                  Estás a punto de eliminar permanentemente esta propiedad y todo su contenido.
                </p>
              </div>

              {/* Property Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Propiedad a eliminar:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">{propertyName}</div>
                      <div className="text-sm text-gray-500">{propertyType}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div className="text-sm text-gray-700">{propertyLocation}</div>
                  </div>
                </div>
              </div>

              {/* What will be deleted */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-800 mb-2">⚡ Se eliminará permanentemente:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• {zonesCount} zona{zonesCount !== 1 ? 's' : ''} con todas sus instrucciones</li>
                  <li>• Todos los códigos QR y enlaces públicos</li>
                  <li>• Historial de visualizaciones y analytics</li>
                  <li>• Todas las imágenes y archivos subidos</li>
                  <li>• Configuración completa de la propiedad</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Esta acción no se puede deshacer.</strong> Una vez eliminada, no podrás recuperar ninguna información de esta propiedad.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  Continuar
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🔐 Confirmación Final
                </h2>
                <p className="text-gray-600">
                  Para confirmar la eliminación, escribe exactamente el texto que aparece abajo.
                </p>
              </div>

              {/* Property reminder */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600">Eliminando:</div>
                <div className="font-medium text-gray-900">{propertyName}</div>
              </div>

              {/* Confirmation text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escribe exactamente este texto:
                </label>
                <div className="bg-gray-100 border border-gray-300 rounded-md p-3 mb-3">
                  <code className="text-sm font-mono text-red-600 font-bold">
                    {expectedText}
                  </code>
                </div>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Escribe el texto exacto aquí..."
                  className={`w-full ${
                    confirmationText && !isConfirmationValid 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : isConfirmationValid
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : ''
                  }`}
                  disabled={isDeleting}
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-sm text-red-600 mt-1">
                    El texto no coincide. Debe ser exactamente: "{expectedText}"
                  </p>
                )}
                {isConfirmationValid && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Texto correcto
                  </p>
                )}
              </div>

              {/* Final warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 text-center">
                  <strong>⚠️ ÚLTIMA ADVERTENCIA:</strong><br />
                  Esta acción eliminará permanentemente "{propertyName}" y todo su contenido.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                  disabled={isDeleting}
                >
                  ← Volver
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!isConfirmationValid || isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      ELIMINAR DEFINITIVAMENTE
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}