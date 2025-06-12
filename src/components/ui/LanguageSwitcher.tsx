'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/hooks/useLocale'
import { LANGUAGE_CONFIG } from '@/i18n/config'

interface LanguageSwitcherProps {
  variant?: 'default' | 'footer'
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'default' }) => {
  const { t } = useTranslation('common')
  const { currentLanguage, changeLanguage, availableLanguages } = useLocale()
  
  const currentConfig = LANGUAGE_CONFIG[currentLanguage as keyof typeof LANGUAGE_CONFIG]
  
  const handleLanguageChange = async (language: string) => {
    await changeLanguage(language)
  }
  
  if (variant === 'footer') {
    return (
      <select 
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 hover:border-gray-400 focus:border-violet-500 focus:outline-none"
      >
        {availableLanguages.map((lang) => {
          const config = LANGUAGE_CONFIG[lang as keyof typeof LANGUAGE_CONFIG]
          return (
            <option key={lang} value={lang} className="bg-white text-gray-900">
              {config.flag} {config.name}
            </option>
          )
        })}
      </select>
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600">Language:</span>
      <select 
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white hover:border-neutral-400 focus:border-brand-500 focus:outline-none"
      >
        {availableLanguages.map((lang) => {
          const config = LANGUAGE_CONFIG[lang as keyof typeof LANGUAGE_CONFIG]
          return (
            <option key={lang} value={lang}>
              {config.flag} {config.name}
            </option>
          )
        })}
      </select>
    </div>
  )
}