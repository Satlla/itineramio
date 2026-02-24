'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Sparkles, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { AddressAutocomplete } from './AddressAutocomplete'
import { CATEGORIES } from '../../lib/recommendations/categories'

interface GenerateRecommendationsModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  propertyName: string
  propertyLocation: string
  onSuccess: () => void
}

interface AddressData {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  lat?: number
  lng?: number
  formattedAddress: string
}

export function GenerateRecommendationsModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  propertyLocation,
  onSuccess,
}: GenerateRecommendationsModalProps) {
  const { t } = useTranslation('property')
  const [step, setStep] = useState<'address' | 'categories' | 'generating' | 'done' | 'error'>('address')
  const [address, setAddress] = useState<AddressData | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(CATEGORIES.map(c => c.id))
  )
  const [result, setResult] = useState<{ zonesCreated: number; totalPlaces: number } | null>(null)
  const [error, setError] = useState<string>('')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('address')
      setAddress(null)
      setSelectedCategories(new Set(CATEGORIES.map(c => c.id)))
      setResult(null)
      setError('')
    }
  }, [isOpen])

  const handleAddressChange = (addr: AddressData) => {
    setAddress(addr)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const selectAll = () => setSelectedCategories(new Set(CATEGORIES.map(c => c.id)))
  const selectNone = () => setSelectedCategories(new Set())

  const handleGenerate = async () => {
    if (!address?.lat || !address?.lng) return

    setStep('generating')
    try {
      const response = await fetch(`/api/properties/${propertyId}/recommendations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lat: address.lat,
          lng: address.lng,
          city: address.city || '',
          categories: Array.from(selectedCategories),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || t('recommendations.modal.errorGenerating'))
      }

      setResult({ zonesCreated: data.zonesCreated, totalPlaces: data.totalPlaces })
      setStep('done')
    } catch (err: any) {
      setError(err.message || t('recommendations.modal.unexpectedError'))
      setStep('error')
    }
  }

  const handleDone = () => {
    onSuccess()
    onClose()
  }

  if (!isOpen) return null

  const osmCategories = CATEGORIES.filter(c => c.source === 'OSM')
  const googleCategories = CATEGORIES.filter(c => c.source === 'GOOGLE')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && step !== 'generating') onClose()
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('recommendations.modal.title')}</h2>
                <p className="text-sm text-gray-500">{propertyName}</p>
              </div>
            </div>
            {step !== 'generating' && (
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Step 1: Address */}
            {step === 'address' && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('recommendations.modal.confirmAddress')}
                  </p>
                  <AddressAutocomplete
                    value={propertyLocation}
                    onChange={handleAddressChange}
                    placeholder={t('recommendations.modal.addressPlaceholder')}
                  />
                  {address?.lat && address?.lng && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {t('recommendations.modal.coordinatesDetected', { lat: address.lat.toFixed(4), lng: address.lng.toFixed(4) })}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => setStep('categories')}
                  disabled={!address?.lat || !address?.lng}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {t('recommendations.modal.next')}
                </Button>
              </div>
            )}

            {/* Step 2: Category selection */}
            {step === 'categories' && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t('recommendations.modal.selectCategories')}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={selectAll} className="text-xs text-violet-600 hover:underline">
                      {t('recommendations.modal.selectAll')}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={selectNone} className="text-xs text-gray-500 hover:underline">
                      {t('recommendations.modal.selectNone')}
                    </button>
                  </div>
                </div>

                {/* OSM categories (free) */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    {t('recommendations.modal.essentialServices')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {osmCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                          selectedCategories.has(cat.id)
                            ? 'border-violet-300 bg-violet-50 text-violet-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedCategories.has(cat.id)
                            ? 'bg-violet-600 border-violet-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedCategories.has(cat.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="truncate">{t(`recommendations.modal.categories.${cat.id}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Google categories (paid) */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    {t('recommendations.modal.leisureTourism')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {googleCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                          selectedCategories.has(cat.id)
                            ? 'border-violet-300 bg-violet-50 text-violet-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedCategories.has(cat.id)
                            ? 'bg-violet-600 border-violet-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedCategories.has(cat.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="truncate">{t(`recommendations.modal.categories.${cat.id}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('address')}
                    className="flex-1"
                  >
                    {t('recommendations.modal.back')}
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={selectedCategories.size === 0}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('recommendations.modal.generate', { count: selectedCategories.size })}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Generating */}
            {step === 'generating' && (
              <div className="text-center py-8">
                <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('recommendations.modal.searching')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('recommendations.modal.searchingDescription')}
                </p>
              </div>
            )}

            {/* Step 4: Done */}
            {step === 'done' && result && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('recommendations.modal.generated')}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {t('recommendations.modal.generatedZones', { count: result.zonesCreated })}{' '}
                  {t('recommendations.modal.generatedPlaces', { count: result.totalPlaces })}
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  {t('recommendations.modal.zonesPublished')}
                </p>
                <Button
                  onClick={handleDone}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {t('recommendations.modal.viewZones')}
                </Button>
              </div>
            )}

            {/* Error state */}
            {step === 'error' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-sm text-red-600 mb-6">{error}</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    {t('recommendations.modal.close')}
                  </Button>
                  <Button
                    onClick={() => setStep('categories')}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {t('recommendations.modal.retry')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
