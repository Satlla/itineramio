import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Traducciones directas en el código para evitar problemas de importación
const resources = {
  es: {
    common: {
      navigation: {
        home: "Inicio",
        dashboard: "Panel",
        properties: "Propiedades",
        settings: "Configuración",
        logout: "Cerrar sesión",
        features: "Características",
        pricing: "Precios",
        contact: "Contacto"
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
      },
      footer: {
        description: "Crea manuales digitales interactivos para propiedades de alquiler vacacional de forma rápida y profesional.",
        company: "Empresa",
        product: "Producto",
        support: "Soporte",
        about: "Acerca de",
        careers: "Empleos",
        blog: "Blog",
        features: "Características",
        integrations: "Integraciones",
        api: "API",
        help: "Ayuda",
        documentation: "Documentación",
        status: "Estado",
        community: "Comunidad",
        privacy: "Privacidad",
        terms: "Términos",
        cookies: "Cookies",
        security: "Seguridad",
        newsletter: "Newsletter",
        newsletterDescription: "Recibe las últimas noticias y actualizaciones.",
        emailPlaceholder: "tu@email.com",
        subscribe: "Suscribirse",
        allRightsReserved: "Todos los derechos reservados.",
        language: "Idioma"
      },
      auth: {
        login: "Iniciar sesión",
        register: "Registrarse"
      }
    },
    auth: {
      login: {
        title: "Iniciar sesión",
        subtitle: "Accede a tu cuenta de ManualPhi",
        email: "Correo electrónico",
        password: "Contraseña",
        loginButton: "Iniciar sesión"
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
        logout: "Sign out",
        features: "Features",
        pricing: "Pricing",
        contact: "Contact"
      },
      buttons: {
        save: "Save",
        cancel: "Cancel",
        getStarted: "Get started",
        learnMore: "Learn more"
      },
      status: {
        loading: "Loading...",
        success: "Success",
        error: "Error"
      },
      footer: {
        description: "Create interactive digital manuals for vacation rental properties quickly and professionally.",
        company: "Company",
        product: "Product",
        support: "Support",
        about: "About",
        careers: "Careers",
        blog: "Blog",
        features: "Features",
        integrations: "Integrations",
        api: "API",
        help: "Help",
        documentation: "Documentation",
        status: "Status",
        community: "Community",
        privacy: "Privacy",
        terms: "Terms",
        cookies: "Cookies",
        security: "Security",
        newsletter: "Newsletter",
        newsletterDescription: "Get the latest news and updates.",
        emailPlaceholder: "your@email.com",
        subscribe: "Subscribe",
        allRightsReserved: "All rights reserved.",
        language: "Language"
      },
      auth: {
        login: "Sign in",
        register: "Sign up"
      }
    },
    auth: {
      login: {
        title: "Sign in",
        subtitle: "Access your ManualPhi account",
        email: "Email address", 
        password: "Password",
        loginButton: "Sign in"
      }
    }
  },
  fr: {
    common: {
      navigation: {
        home: "Accueil",
        dashboard: "Tableau de bord",
        properties: "Propriétés", 
        settings: "Paramètres",
        logout: "Se déconnecter",
        features: "Fonctionnalités",
        pricing: "Tarifs",
        contact: "Contact"
      },
      buttons: {
        save: "Enregistrer",
        cancel: "Annuler",
        getStarted: "Commencer",
        learnMore: "En savoir plus"
      },
      status: {
        loading: "Chargement...",
        success: "Succès",
        error: "Erreur"
      },
      footer: {
        description: "Créez des manuels numériques interactifs pour les propriétés de location de vacances rapidement et professionnellement.",
        company: "Entreprise",
        product: "Produit",
        support: "Support",
        about: "À propos",
        careers: "Carrières",
        blog: "Blog",
        features: "Fonctionnalités",
        integrations: "Intégrations",
        api: "API",
        help: "Aide",
        documentation: "Documentation",
        status: "Statut",
        community: "Communauté",
        privacy: "Confidentialité",
        terms: "Conditions",
        cookies: "Cookies",
        security: "Sécurité",
        newsletter: "Newsletter",
        newsletterDescription: "Recevez les dernières nouvelles et mises à jour.",
        emailPlaceholder: "votre@email.com",
        subscribe: "S'abonner",
        allRightsReserved: "Tous droits réservés.",
        language: "Langue"
      },
      auth: {
        login: "Se connecter",
        register: "S'inscrire"
      }
    },
    auth: {
      login: {
        title: "Se connecter",
        subtitle: "Accédez à votre compte ManualPhi",
        email: "Adresse email",
        password: "Mot de passe", 
        loginButton: "Se connecter"
      }
    }
  }
}

// Configuración de idiomas
export const LANGUAGE_CONFIG = {
  es: {
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false
  },
  en: {
    name: 'English',
    nativeName: 'English', 
    flag: '🇺🇸',
    rtl: false
  },
  fr: {
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false
  }
}

export const DEFAULT_LANGUAGE = 'es'
export const FALLBACK_LANGUAGE = 'en'

// Tipos simples
export interface UserLocale {
  language: string
  region: string
  currency: string
  rtl: boolean
}

// Función simple de detección
export const detectUserLocale = (): UserLocale => {
  if (typeof window !== 'undefined') {
    const browserLanguage = navigator.language.split('-')[0]
    const supportedLanguage = Object.keys(LANGUAGE_CONFIG).includes(browserLanguage) 
      ? browserLanguage 
      : DEFAULT_LANGUAGE
      
    return {
      language: supportedLanguage,
      region: 'ES',
      currency: 'EUR', 
      rtl: false
    }
  }
  
  return {
    language: DEFAULT_LANGUAGE,
    region: 'ES',
    currency: 'EUR',
    rtl: false
  }
}

// Inicializar i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  })

export default i18n