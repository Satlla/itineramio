'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { Globe, CheckCircle, X, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LanguageCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  zoneName: string
}

export function LanguageCompletionModal({
  isOpen,
  onClose,
  zoneName
}: LanguageCompletionModalProps) {
  const { t } = useTranslation('common')

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                <Globe className="w-10 h-10 text-violet-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {t('modals.languageCompletion.zoneSaved', { zoneName })}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 text-center mb-6">
            {t('modals.languageCompletion.moreReachWithLanguages')}
          </p>

          {/* Benefits */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">GB</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t('modals.languageCompletion.english')}</h3>
                <p className="text-sm text-gray-600">
                  {t('modals.languageCompletion.englishDescription')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-violet-50 to-violet-50/50 rounded-xl border border-violet-100">
              <div className="flex-shrink-0 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">FR</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t('modals.languageCompletion.french')}</h3>
                <p className="text-sm text-gray-600">
                  {t('modals.languageCompletion.frenchDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>{t('modals.languageCompletion.tip')}</strong> {t('modals.languageCompletion.tipDescription')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('modals.languageCompletion.understood')}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
