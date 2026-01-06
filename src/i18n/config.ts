import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import Spanish translations
import esCommon from './locales/es/common.json'
import esLanding from './locales/es/landing.json'
import esAuth from './locales/es/auth.json'
import esDashboard from './locales/es/dashboard.json'
import esProperty from './locales/es/property.json'
import esTools from './locales/es/tools.json'
import esZones from './locales/es/zones.json'
import esAccount from './locales/es/account.json'
import esLegal from './locales/es/legal.json'

// Import English translations
import enCommon from './locales/en/common.json'
import enLanding from './locales/en/landing.json'
import enAuth from './locales/en/auth.json'
import enDashboard from './locales/en/dashboard.json'
import enProperty from './locales/en/property.json'
import enTools from './locales/en/tools.json'
import enZones from './locales/en/zones.json'
import enAccount from './locales/en/account.json'
import enLegal from './locales/en/legal.json'

// Import French translations
import frCommon from './locales/fr/common.json'
import frLanding from './locales/fr/landing.json'
import frAuth from './locales/fr/auth.json'
import frDashboard from './locales/fr/dashboard.json'
import frProperty from './locales/fr/property.json'
import frTools from './locales/fr/tools.json'
import frZones from './locales/fr/zones.json'
import frAccount from './locales/fr/account.json'
import frLegal from './locales/fr/legal.json'

const resources = {
  es: {
    common: esCommon,
    landing: esLanding,
    auth: esAuth,
    dashboard: esDashboard,
    property: esProperty,
    tools: esTools,
    zones: esZones,
    account: esAccount,
    legal: esLegal
  },
  en: {
    common: enCommon,
    landing: enLanding,
    auth: enAuth,
    dashboard: enDashboard,
    property: enProperty,
    tools: enTools,
    zones: enZones,
    account: enAccount,
    legal: enLegal
  },
  fr: {
    common: frCommon,
    landing: frLanding,
    auth: frAuth,
    dashboard: frDashboard,
    property: frProperty,
    tools: frTools,
    zones: frZones,
    account: frAccount,
    legal: frLegal
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    defaultNS: 'common',
    ns: ['common', 'landing', 'auth', 'dashboard', 'property', 'tools', 'zones', 'account', 'legal'],
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })

export const LANGUAGE_CONFIG = {
  es: { name: 'Español', flag: '🇪🇸', rtl: false },
  en: { name: 'English', flag: '🇬🇧', rtl: false },
  fr: { name: 'Français', flag: '🇫🇷', rtl: false }
}

export default i18n
