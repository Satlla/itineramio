'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted')
    if (!cookiesAccepted) {
      // Show banner after a short delay
      setTimeout(() => {
        setIsVisible(true)
      }, 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    setIsVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookiesAccepted', 'essential')
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#24292f] border-t border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {/* Message */}
          <div className="flex-1 pr-0 sm:pr-4">
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia.{' '}
              <Link
                href="/legal/cookies"
                className="text-white underline hover:text-gray-200 transition-colors whitespace-nowrap"
              >
                Más información
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap flex-1 sm:flex-none"
            >
              Solo esenciales
            </button>
            <button
              onClick={handleAccept}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-white text-gray-900 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap flex-1 sm:flex-none"
            >
              Aceptar
            </button>
            <button
              onClick={handleReject}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Cerrar banner"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
