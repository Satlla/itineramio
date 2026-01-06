import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Globe, Copy, CheckCircle } from 'lucide-react'
import { Button } from './Button'
import { useTranslation } from 'react-i18next'

interface ShareLanguageModalProps {
  isOpen: boolean
  onClose: () => void
  onShare: (language: string) => void
  title?: string
  description?: string
  type?: 'manual' | 'zone'
  currentUrl?: string
}

const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }
]

export function ShareLanguageModal({
  isOpen,
  onClose,
  onShare,
  title = 'Compartir',
  description = 'Selecciona el idioma en el que quieres compartir',
  type = 'manual',
  currentUrl
}: ShareLanguageModalProps) {
  const { t } = useTranslation('common')
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    onShare(selectedLanguage)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      onClose()
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Modal Container - Centered with scroll */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-[90vw] sm:max-w-sm md:max-w-md bg-white rounded-lg shadow-xl p-3 sm:p-4 md:p-6 relative"
              >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Language Selection */}
            <div className="space-y-3 mb-6">
              {languages.map((lang) => (
                <label
                  key={lang.code}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedLanguage === lang.code
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={selectedLanguage === lang.code}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl mr-3">{lang.flag}</span>
                  <span className={`font-medium ${
                    selectedLanguage === lang.code ? 'text-violet-900' : 'text-gray-700'
                  }`}>
                    {lang.label}
                  </span>
                  {selectedLanguage === lang.code && (
                    <CheckCircle className="w-5 h-5 text-violet-600 ml-auto" />
                  )}
                </label>
              ))}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">{t('modals.shareLanguage.linkPreview')}</p>
              <p className="text-sm font-mono text-gray-800 break-all">
                {(() => {
                  if (currentUrl) {
                    const url = new URL(currentUrl)
                    url.searchParams.set('lang', selectedLanguage)
                    return url.toString()
                  }
                  // Fallback if no currentUrl provided
                  const baseUrl = typeof window !== 'undefined' ? window.location.href : ''
                  const url = new URL(baseUrl)
                  url.searchParams.set('lang', selectedLanguage)
                  return url.toString()
                })()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {t('modals.shareLanguage.cancel')}
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                disabled={copied}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('modals.shareLanguage.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('modals.shareLanguage.copyLink')}
                  </>
                )}
              </Button>
            </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}