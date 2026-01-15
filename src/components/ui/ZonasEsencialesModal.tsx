'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { Home, Wifi, LogOut, Phone, X, Sparkles, Trash2, Key, MapPin, List, Car, Thermometer, Bus, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ZonasEsencialesModalProps {
  isOpen: boolean
  onClose: () => void
  onKeepZones: () => void
  userName: string
  isLoading?: boolean
  currentZoneIndex?: number
  totalZones?: number
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  key: Key,
  wifi: Wifi,
  exit: LogOut,
  'map-pin': MapPin,
  list: List,
  car: Car,
  thermometer: Thermometer,
  phone: Phone,
  bus: Bus,
  star: Star,
  trash: Trash2
}

// Zone keys for translation lookup
const zonesKeys = [
  { nameKey: 'checkIn', descKey: 'checkInDesc', icon: 'key' },
  { nameKey: 'wifi', descKey: 'wifiDesc', icon: 'wifi' },
  { nameKey: 'checkOut', descKey: 'checkOutDesc', icon: 'exit' },
  { nameKey: 'howToArrive', descKey: 'howToArriveDesc', icon: 'map-pin' },
  { nameKey: 'houseRules', descKey: 'houseRulesDesc', icon: 'list' },
  { nameKey: 'parking', descKey: 'parkingDesc', icon: 'car' },
  { nameKey: 'climate', descKey: 'climateDesc', icon: 'thermometer' },
  { nameKey: 'emergencies', descKey: 'emergenciesDesc', icon: 'phone' },
  { nameKey: 'transport', descKey: 'transportDesc', icon: 'bus' },
  { nameKey: 'recommendations', descKey: 'recommendationsDesc', icon: 'star' },
  { nameKey: 'trash', descKey: 'trashDesc', icon: 'trash' }
]

export function ZonasEsencialesModal({
  isOpen,
  onClose,
  onKeepZones,
  userName,
  isLoading = false,
  currentZoneIndex = 0,
  totalZones = 11
}: ZonasEsencialesModalProps) {
  const { t } = useTranslation('zones')

  // Debug logging for mobile
  React.useEffect(() => {
    if (isOpen) {
      console.log('🎭 ZonasEsencialesModal mounted and visible', {
        isOpen,
        userName,
        isLoading,
        viewport: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight,
          userAgent: window.navigator.userAgent
        } : null
      })
    }
  }, [isOpen, userName, isLoading])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        style={{ 
          // Asegurar que el modal esté visible en todos los dispositivos
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999 
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-4 sm:p-3 sm:p-4 md:p-6 w-full max-w-6xl lg:max-w-5xl max-h-[95vh] overflow-y-auto my-4"
          style={{
            // Asegurar que el modal funcione en móvil
            minHeight: '300px',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: 'calc(100vh - 2rem)',
            margin: '1rem auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-violet-600" />
            </div>
            <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {t('essentialZonesModal.greeting', { userName })}
            </h2>
            <p className="text-gray-600 text-lg" dangerouslySetInnerHTML={{ __html: t('essentialZonesModal.creatingManual') }} />
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {t('essentialZonesModal.creatingZones', { current: currentZoneIndex, total: totalZones })}
                </span>
                <span className="text-sm font-semibold text-violet-600">
                  {Math.round((currentZoneIndex / totalZones) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentZoneIndex / totalZones) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Zones Created - Responsive Grid */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              {t('essentialZonesModal.essentialZonesTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {zonesKeys.map((zone, index) => {
                const IconComponent = iconMap[zone.icon]
                const isCreated = isLoading && index < currentZoneIndex
                const isCreating = isLoading && index === currentZoneIndex
                const zoneName = t(`essentialZonesModal.zones.${zone.nameKey}`)
                const zoneDesc = t(`essentialZonesModal.zones.${zone.descKey}`)

                return (
                  <motion.div
                    key={zone.nameKey}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                      isCreated
                        ? 'bg-green-50 border border-green-200'
                        : isCreating
                        ? 'bg-violet-50 border border-violet-200 animate-pulse'
                        : 'bg-white'
                    }`}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isCreated
                        ? 'bg-green-100'
                        : isCreating
                        ? 'bg-violet-100'
                        : 'bg-violet-100'
                    }`}>
                      {isCreated ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600"
                        >
                          ✓
                        </motion.div>
                      ) : (
                        <IconComponent className={`w-4 h-4 ${
                          isCreating ? 'text-violet-600' : 'text-violet-600'
                        }`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium text-sm truncate ${
                        isCreated ? 'text-green-900' : 'text-gray-900'
                      }`}>
                        {zoneName}
                      </div>
                      <div className={`text-xs truncate ${
                        isCreated ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {isCreating ? t('essentialZonesModal.creating') : zoneDesc}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Features Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              {t('essentialZonesModal.whatCanYouDo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Content Types */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">{t('essentialZonesModal.contentTypes')}</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.contentText')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.contentPhotos')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.contentVideos')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.contentLinks')}` }} />
                </ul>
              </div>

              {/* Sharing Options */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">{t('essentialZonesModal.features')}</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.featureQR')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.featureLinks')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.featureMobile')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.featureTranslations')}` }} />
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Start Info */}
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-violet-800 mb-2">{t('essentialZonesModal.nextSteps')}</h4>
            <div className="text-sm text-violet-700 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-violet-200 text-violet-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>{t('essentialZonesModal.step1')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-violet-200 text-violet-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>{t('essentialZonesModal.step2')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-violet-200 text-violet-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>{t('essentialZonesModal.step3')}</span>
              </div>
            </div>
          </div>

          {/* Actions - Single Button */}
          <div className="flex justify-center">
            <Button
              onClick={onKeepZones}
              disabled={isLoading}
              className="w-full max-w-[90vw] sm:max-w-sm md:max-w-md bg-violet-600 hover:bg-violet-700 h-12 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('essentialZonesModal.creatingEssentialZones')}
                </>
              ) : (
                <>{t('essentialZonesModal.startManual')}</>
              )}
            </Button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}