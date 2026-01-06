'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { useTranslation } from 'react-i18next'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  itemName?: string
  itemType?: string
  consequences?: string[]
  isLoading?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType = 'elemento',
  consequences = [],
  isLoading = false
}: DeleteConfirmationModalProps) {
  const { t } = useTranslation('common')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl max-w-[90vw] sm:max-w-sm md:max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 sm:p-4 md:p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                    {itemName && (
                      <p className="text-sm text-gray-600 mt-1">
                        {itemType}: <span className="font-medium">{itemName}</span>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-3 sm:px-4 md:px-6 pb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {description}
              </p>
              
              {consequences.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    {t('modals.delete.permanentlyDeleteWarning')}
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {consequences.map((consequence, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                        <span>{consequence}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    {t('modals.delete.cannotUndo')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-3 sm:px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex space-x-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2"
                >
                  {t('modals.delete.cancel')}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('modals.delete.deleting')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>{t('modals.delete.deleteDefinitely')}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}