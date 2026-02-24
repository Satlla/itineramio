'use client'

import React, { useEffect, ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/config'

interface I18nProviderProps {
  children: ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  useEffect(() => {
    // Cargar idioma guardado o detectar del navegador (solo en el cliente)
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('itineramio-language')
      if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage)
      } else if (!savedLanguage) {
        // Detect from browser language (post-hydration to avoid mismatch)
        const browserLang = navigator.language?.split('-')[0]
        if (browserLang && ['es', 'en', 'fr'].includes(browserLang) && browserLang !== i18n.language) {
          i18n.changeLanguage(browserLang)
        }
      }
    }
    
    // Configurar dirección del texto
    const handleLanguageChange = (lng: string) => {
      document.documentElement.lang = lng
      document.documentElement.dir = ['ar', 'he', 'fa'].includes(lng) ? 'rtl' : 'ltr'
    }
    
    i18n.on('languageChanged', handleLanguageChange)
    handleLanguageChange(i18n.language)
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])
  
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}