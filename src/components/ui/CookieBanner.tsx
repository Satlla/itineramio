'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface CookiePreferences {
  essential: boolean // Always true, cannot be disabled
  analytics: boolean
  marketing: boolean
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false
}

// Helper to get stored preferences
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('cookiePreferences')
  if (stored) {
    try {
      return JSON.parse(stored) as CookiePreferences
    } catch {
      return null
    }
  }

  // Legacy support: convert old format to new
  const legacy = localStorage.getItem('cookiesAccepted')
  if (legacy === 'true') {
    return { essential: true, analytics: true, marketing: true }
  } else if (legacy === 'essential') {
    return { essential: true, analytics: false, marketing: false }
  }

  return null
}

// Helper to check if a specific category is allowed
export function isCookieCategoryAllowed(category: keyof CookiePreferences): boolean {
  const prefs = getCookiePreferences()
  if (!prefs) return false
  return prefs[category]
}

export const CookieBanner: React.FC = () => {
  const { t } = useTranslation('common')
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    // Check if user has already made a choice
    const existingPrefs = getCookiePreferences()
    if (!existingPrefs) {
      // Show banner after a short delay
      setTimeout(() => {
        setIsVisible(true)
      }, 1500)
    }
  }, [])

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    // Store new format
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs))

    // Also store legacy format for backwards compatibility
    if (prefs.analytics && prefs.marketing) {
      localStorage.setItem('cookiesAccepted', 'true')
    } else {
      localStorage.setItem('cookiesAccepted', 'essential')
    }

    setIsVisible(false)
    setShowPreferences(false)

    // Emit detailed event
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: prefs
    }))

    // Also emit legacy event format for backwards compatibility
    const legacyValue = prefs.analytics && prefs.marketing ? 'true' : 'essential'
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: legacyValue
    }))
  }, [])

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true
    })
  }

  const handleRejectAll = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false
    })
  }

  const handleSavePreferences = () => {
    savePreferences(preferences)
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return // Cannot disable essential cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#24292f] border-t border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Main Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {/* Message */}
          <div className="flex-1 pr-0 sm:pr-4">
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {t('cookies.banner.message')}{' '}
              <Link
                href="/legal/cookies"
                className="text-white underline hover:text-gray-200 transition-colors whitespace-nowrap"
              >
                {t('cookies.banner.moreInfo')}
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1 flex-1 sm:flex-none justify-center"
              aria-expanded={showPreferences}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('cookies.banner.customize')}</span>
              {showPreferences ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleRejectAll}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap flex-1 sm:flex-none"
            >
              {t('cookies.banner.essentialOnly')}
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-white text-gray-900 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap flex-1 sm:flex-none"
            >
              {t('cookies.banner.acceptAll')}
            </button>
            <button
              onClick={handleRejectAll}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label={t('cookies.banner.closeBanner')}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Essential Cookies */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">{t('cookies.categories.essential.title')}</h3>
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">{t('cookies.categories.essential.alwaysActive')}</span>
                </div>
                <p className="text-xs text-gray-400">
                  {t('cookies.categories.essential.description')}
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">{t('cookies.categories.analytics.title')}</h3>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      preferences.analytics ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={preferences.analytics}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        preferences.analytics ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                      style={{ transform: preferences.analytics ? 'translateX(18px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {t('cookies.categories.analytics.description')}
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">{t('cookies.categories.marketing.title')}</h3>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      preferences.marketing ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={preferences.marketing}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`}
                      style={{ transform: preferences.marketing ? 'translateX(18px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {t('cookies.categories.marketing.description')}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('cookies.banner.savePreferences')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Floating button to manage cookie preferences after initial acceptance
 * Add this component to your layout/footer to allow users to change preferences later
 */
export const CookiePreferencesButton: React.FC = () => {
  const { t } = useTranslation('common')
  const [showModal, setShowModal] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    const stored = getCookiePreferences()
    if (stored) {
      setPreferences(stored)
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs))

    if (prefs.analytics && prefs.marketing) {
      localStorage.setItem('cookiesAccepted', 'true')
    } else {
      localStorage.setItem('cookiesAccepted', 'essential')
    }

    setShowModal(false)

    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: prefs
    }))

    // Reload to apply changes
    window.location.reload()
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 transition-colors"
      >
        <Settings className="w-4 h-4" />
        {t('cookies.preferences.buttonLabel')}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t('cookies.preferences.title')}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {t('cookies.preferences.description')}
              </p>

              <div className="space-y-4">
                {/* Essential */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{t('cookies.preferences.essential.title')}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{t('cookies.categories.essential.alwaysActive')}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('cookies.preferences.essential.description')}
                  </p>
                </div>

                {/* Analytics */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{t('cookies.preferences.analytics.title')}</h3>
                    <button
                      onClick={() => togglePreference('analytics')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        style={{ transform: preferences.analytics ? 'translateX(22px)' : 'translateX(4px)' }}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('cookies.preferences.analytics.description')}
                  </p>
                </div>

                {/* Marketing */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{t('cookies.preferences.marketing.title')}</h3>
                    <button
                      onClick={() => togglePreference('marketing')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.marketing ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        style={{ transform: preferences.marketing ? 'translateX(22px)' : 'translateX(4px)' }}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('cookies.preferences.marketing.description')}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {t('cookies.preferences.cancel')}
                </button>
                <button
                  onClick={() => savePreferences(preferences)}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('cookies.preferences.saveChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
