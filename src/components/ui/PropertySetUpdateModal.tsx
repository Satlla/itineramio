'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, Check, AlertCircle } from 'lucide-react'
import { Button } from './Button'

interface Property {
  id: string
  name: string
}

interface PropertySetUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (scope: 'single' | 'all' | 'selected', selectedPropertyIds?: string[]) => void
  currentPropertyId: string
  currentPropertyName: string
  propertySetProperties: Property[]
}

export function PropertySetUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  currentPropertyId,
  currentPropertyName,
  propertySetProperties
}: PropertySetUpdateModalProps) {
  const [selectedScope, setSelectedScope] = useState<'single' | 'all' | 'selected'>('single')
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set([currentPropertyId]))

  const handlePropertyToggle = (propertyId: string) => {
    const newSelected = new Set(selectedProperties)
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId)
    } else {
      newSelected.add(propertyId)
    }
    setSelectedProperties(newSelected)
  }

  const handleConfirm = () => {
    console.log('PropertySetUpdateModal handleConfirm called', { selectedScope, selectedProperties: Array.from(selectedProperties) })
    if (selectedScope === 'selected') {
      onConfirm(selectedScope, Array.from(selectedProperties))
    } else {
      onConfirm(selectedScope)
    }
  }

  const isConfirmDisabled = selectedScope === 'selected' && selectedProperties.size === 0

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 border-b">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-6 h-6 text-violet-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Actualizar Conjunto</h2>
                </div>
                <p className="text-gray-600">
                  Esta propiedad pertenece a un conjunto. ¿Dónde quieres aplicar los cambios?
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              {/* Option 1: Solo esta propiedad */}
              <button
                onClick={() => setSelectedScope('single')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedScope === 'single'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedScope === 'single'
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedScope === 'single' && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Solo esta propiedad</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Los cambios solo se aplicarán a <span className="font-medium">{currentPropertyName}</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 2: Todo el conjunto */}
              <button
                onClick={() => setSelectedScope('all')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedScope === 'all'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedScope === 'all'
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedScope === 'all' && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Todo el conjunto</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Aplicar a todas las {propertySetProperties.length} propiedades del conjunto
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 3: Seleccionar propiedades */}
              <button
                onClick={() => setSelectedScope('selected')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedScope === 'selected'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedScope === 'selected'
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedScope === 'selected' && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">Seleccionar propiedades</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Elige manualmente qué propiedades quieres actualizar
                    </div>
                  </div>
                </div>
              </button>

              {/* Property selection list */}
              {selectedScope === 'selected' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mt-3 space-y-2 border-l-2 border-violet-200 pl-4"
                >
                  {propertySetProperties.map((property) => (
                    <label
                      key={property.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProperties.has(property.id)}
                        onChange={() => handlePropertyToggle(property.id)}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                      />
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {property.name}
                        {property.id === currentPropertyId && (
                          <span className="ml-2 text-xs text-violet-600 font-medium">(Actual)</span>
                        )}
                      </span>
                    </label>
                  ))}
                  {selectedProperties.size > 0 && (
                    <div className="text-xs text-gray-500 mt-2 px-3">
                      {selectedProperties.size} {selectedProperties.size === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Confirmar y Guardar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
