'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Clock, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface SavedDataBannerProps {
  isVisible: boolean
  onRestore: () => void
  timestamp?: Date | null
  onClose: () => void
  onStartFresh?: () => void
}

export function SavedDataBanner({
  isVisible,
  onRestore,
  timestamp,
  onClose,
  onStartFresh
}: SavedDataBannerProps) {
  const { t } = useTranslation('common')

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return t('savedData.timeAgo.justNow')
    } else if (diffInMinutes < 60) {
      return t('savedData.timeAgo.minutes', { count: diffInMinutes })
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return t('savedData.timeAgo.hours', { count: hours })
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return t('savedData.timeAgo.days', { count: days })
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Save className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {t('savedData.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('savedData.description')}
                    {timestamp && (
                      <span className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {t('savedData.savedAgo', { time: formatTimestamp(timestamp) })}
                      </span>
                    )}
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={onRestore}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t('savedData.continue')}
                    </Button>
                    {onStartFresh && (
                      <Button
                        onClick={onStartFresh}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        {t('savedData.startOver')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors ml-2"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}