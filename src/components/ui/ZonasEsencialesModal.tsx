'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { Home, Wifi, LogOut, Phone, X, Trash2, Key, MapPin, List, Car, Thermometer, Bus, Star } from 'lucide-react'
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

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        style={{
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
          initial={{ scale: 0.96, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-white rounded-2xl p-6 w-full max-w-6xl lg:max-w-5xl max-h-[95vh] overflow-y-auto my-4 relative"
          style={{
            minHeight: '300px',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: 'calc(100vh - 2rem)',
            margin: '1rem auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#111' }}
            >
              {t('essentialZonesModal.greeting', { userName })}
            </h2>
            <p className="text-base" style={{ color: '#666' }} dangerouslySetInnerHTML={{ __html: t('essentialZonesModal.creatingManual') }} />
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: '#555' }}>
                  {t('essentialZonesModal.creatingZones', { current: currentZoneIndex, total: totalZones })}
                </span>
                <span className="text-sm font-semibold" style={{ color: '#7c3aed' }}>
                  {Math.round((currentZoneIndex / totalZones) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentZoneIndex / totalZones) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Zones Created - Responsive Grid */}
          <div className="rounded-xl p-4 mb-6" style={{ background: '#f8f8f8', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3
              className="font-semibold mb-4 text-center text-sm uppercase tracking-widest"
              style={{ color: '#999', fontFamily: 'Manrope, sans-serif' }}
            >
              {t('essentialZonesModal.essentialZonesTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {zonesKeys.map((zone, index) => {
                const IconComponent = iconMap[zone.icon]
                const isCreated = isLoading && index < currentZoneIndex
                const isCreating = isLoading && index === currentZoneIndex
                const zoneName = t(`essentialZonesModal.zones.${zone.nameKey}`)
                const zoneDesc = t(`essentialZonesModal.zones.${zone.descKey}`)

                return (
                  <motion.div
                    key={zone.nameKey}
                    className="flex items-center space-x-3 p-2.5 rounded-xl bg-white transition-all"
                    style={{
                      border: isCreating
                        ? '1px solid rgba(124,58,237,0.3)'
                        : '1px solid rgba(0,0,0,0.05)',
                      background: isCreating ? 'rgba(124,58,237,0.03)' : '#fff'
                    }}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#f8f8f8' }}
                    >
                      {isCreated ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="font-bold text-sm"
                          style={{ color: '#059669' }}
                        >
                          ✓
                        </motion.div>
                      ) : (
                        <IconComponent
                          className={`w-4 h-4 ${isCreating ? 'text-violet-600' : 'text-gray-400'}`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-medium text-sm truncate"
                        style={{ color: isCreated ? '#059669' : '#111' }}
                      >
                        {zoneName}
                      </div>
                      <div className="text-xs truncate" style={{ color: '#999' }}>
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
            <h3
              className="font-semibold mb-4 text-center"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#111' }}
            >
              {t('essentialZonesModal.whatCanYouDo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Content Types */}
              <div
                className="bg-white rounded-xl p-4"
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderLeft: '3px solid #059669'
                }}
              >
                <h4 className="font-semibold mb-2 text-sm" style={{ color: '#111' }}>{t('essentialZonesModal.contentTypes')}</h4>
                <ul className="text-sm space-y-1" style={{ color: '#555' }}>
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.contentText')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.contentPhotos')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.contentVideos')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.contentLinks')}` }} />
                </ul>
              </div>

              {/* Sharing Options */}
              <div
                className="bg-white rounded-xl p-4"
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderLeft: '3px solid #7c3aed'
                }}
              >
                <h4 className="font-semibold mb-2 text-sm" style={{ color: '#111' }}>{t('essentialZonesModal.features')}</h4>
                <ul className="text-sm space-y-1" style={{ color: '#555' }}>
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.featureQR')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.featureLinks')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.featureMobile')}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t('essentialZonesModal.featureTranslations')}` }} />
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Start Steps */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{ background: '#f8f8f8', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <h4
              className="font-semibold mb-3 text-sm"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#111' }}
            >
              {t('essentialZonesModal.nextSteps')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-start space-x-2.5">
                  <span
                    className="font-bold text-sm flex-shrink-0 mt-0.5"
                    style={{ color: '#7c3aed', fontFamily: 'Manrope, sans-serif' }}
                  >
                    {n}.
                  </span>
                  <span className="text-sm" style={{ color: '#555' }}>
                    {t(`essentialZonesModal.step${n}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <Button
              onClick={onKeepZones}
              disabled={isLoading}
              className="w-full max-w-[90vw] sm:max-w-sm md:max-w-md bg-violet-600 hover:bg-violet-700 h-12 text-base font-semibold"
              style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.35)' } as React.CSSProperties}
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
            className="absolute top-4 right-4 hover:text-gray-600 transition-colors"
            style={{ color: '#bbb' }}
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
