import { useTranslation } from 'react-i18next'
import { LANGUAGE_CONFIG } from '../i18n/config'

export const useLocale = () => {
  const { i18n } = useTranslation()
  
  const currentLanguage = i18n.language || 'es'
  const config = LANGUAGE_CONFIG[currentLanguage as keyof typeof LANGUAGE_CONFIG] || LANGUAGE_CONFIG.es
  
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(currentLanguage)
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat(currentLanguage).format(number)
  }
  
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString(currentLanguage)
  }
  
  const changeLanguage = async (newLanguage: string) => {
    localStorage.setItem('manualphi-language', newLanguage)
    await i18n.changeLanguage(newLanguage)
  }
  
  const isRTL = () => {
    return config.rtl
  }
  
  const getLanguageDirection = () => {
    return config.rtl ? 'rtl' : 'ltr'
  }
  
  return {
    currentLanguage,
    config,
    formatDate,
    formatCurrency,
    formatNumber,
    formatTime,
    changeLanguage,
    isRTL,
    getLanguageDirection,
    availableLanguages: Object.keys(LANGUAGE_CONFIG)
  }
}