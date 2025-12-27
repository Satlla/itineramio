'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { AlertTriangle, X, Trash2, Type, Building, MapPin, Eye, Star, QrCode, Image, FileText, Users, Calendar, BarChart } from 'lucide-react'
import { Input } from './Input'

interface DeletePropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyName: string
  propertyType: string
  propertyLocation: string
  zonesCount: number
  totalSteps?: number
  totalViews?: number
  totalRatings?: number
  mediaCount?: number
  createdDate?: string
  isPublished?: boolean
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
  totalSteps = 0,
  totalViews = 0,
  totalRatings = 0,
  mediaCount = 0,
  createdDate,
  isPublished = false,
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
          className="bg-white rounded-xl p-3 sm:p-4 md:p-6 w-full max-w-[90vw] sm:max-w-sm md:max-w-md"
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
                <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900 mb-2">
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
                      <div className="text-sm text-gray-500">
                        {propertyType} • {isPublished ? '🟢 Publicada' : '🔶 Borrador'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div className="text-sm text-gray-700">{propertyLocation}</div>
                  </div>

                  {createdDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div className="text-sm text-gray-700">
                        Creada el {new Date(createdDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick stats */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{totalViews} vistas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{totalRatings} valoraciones</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What will be deleted */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Se eliminará permanentemente:
                </h4>
                
                <div className="space-y-3 text-sm text-red-700">
                  {/* Content */}
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Contenido y zonas</div>
                      <div className="text-xs text-red-600">
                        {zonesCount} zona{zonesCount !== 1 ? 's' : ''} • {totalSteps} paso{totalSteps !== 1 ? 's' : ''} de instrucciones
                      </div>
                    </div>
                  </div>

                  {/* Media */}
                  {mediaCount > 0 && (
                    <div className="flex items-start gap-2">
                      <Image className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Archivos multimedia</div>
                        <div className="text-xs text-red-600">
                          {mediaCount} imagen{mediaCount !== 1 ? 'es' : ''}/video{mediaCount !== 1 ? 's' : ''} subido{mediaCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QR Codes */}
                  <div className="flex items-start gap-2">
                    <QrCode className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Códigos QR y enlaces</div>
                      <div className="text-xs text-red-600">
                        {zonesCount} código{zonesCount !== 1 ? 's' : ''} QR • Enlaces públicos únicos
                      </div>
                    </div>
                  </div>

                  {/* Analytics */}
                  {(totalViews > 0 || totalRatings > 0) && (
                    <div className="flex items-start gap-2">
                      <BarChart className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Historial y analíticas</div>
                        <div className="text-xs text-red-600">
                          {totalViews} vista{totalViews !== 1 ? 's' : ''} • {totalRatings} valoración{totalRatings !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guest access */}
                  {isPublished && (
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Acceso de huéspedes</div>
                        <div className="text-xs text-red-600">
                          Los huéspedes perderán acceso inmediatamente
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">⚠️ Esta acción no se puede deshacer</p>
                    <p>Una vez eliminada, no podrás recuperar ninguna información de esta propiedad. Todos los datos se perderán permanentemente.</p>
                    {isPublished && (
                      <p className="mt-2 font-medium text-amber-900">
                        ⚡ Los huéspedes perderán acceso inmediatamente al manual digital.
                      </p>
                    )}
                  </div>
                </div>
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
                <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  🔐 Confirmación Final
                </h2>
                <p className="text-gray-600">
                  Para confirmar la eliminación, escribe exactamente el texto que aparece abajo.
                </p>
              </div>

              {/* Property reminder */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Eliminando permanentemente:</div>
                <div className="font-medium text-gray-900 mb-2">{propertyName}</div>
                <div className="text-xs text-gray-500 flex flex-wrap gap-2">
                  <span>{zonesCount} zona{zonesCount !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{totalSteps} paso{totalSteps !== 1 ? 's' : ''}</span>
                  {mediaCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{mediaCount} archivo{mediaCount !== 1 ? 's' : ''}</span>
                    </>
                  )}
                  {totalViews > 0 && (
                    <>
                      <span>•</span>
                      <span>{totalViews} vista{totalViews !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
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
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm text-red-800">
                    <strong>⚠️ ÚLTIMA ADVERTENCIA</strong><br />
                    Esta acción eliminará permanentemente <strong>"{propertyName}"</strong> y todo su contenido.
                  </p>
                  <p className="text-xs text-red-700 mt-2">
                    {zonesCount} zona{zonesCount !== 1 ? 's' : ''} • {totalSteps} paso{totalSteps !== 1 ? 's' : ''} • Datos irrecuperables
                  </p>
                </div>
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