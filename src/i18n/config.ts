import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  es: {
    common: {
      navigation: {
        home: "Inicio",
        dashboard: "Panel",
        properties: "Propiedades",
        settings: "Configuración",
        logout: "Cerrar sesión"
      },
      buttons: {
        save: "Guardar",
        cancel: "Cancelar",
        getStarted: "Comenzar",
        learnMore: "Saber más"
      },
      status: {
        loading: "Cargando...",
        success: "Éxito",
        error: "Error"
      }
    }
  },
  en: {
    common: {
      navigation: {
        home: "Home",
        dashboard: "Dashboard", 
        properties: "Properties",
        settings: "Settings",
        logout: "Logout"
      },
      buttons: {
        save: "Save",
        cancel: "Cancel",
        getStarted: "Get Started",
        learnMore: "Learn More"
      },
      status: {
        loading: "Loading...",
        success: "Success",
        error: "Error"
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
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