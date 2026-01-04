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
      navbar: {
        features: "Funcionalidades",
        blog: "Blog",
        academy: "Academia",
        resources: "Recursos",
        pricing: "Precios",
        successStories: "Casos de Éxito",
        compare: "Comparar",
        login: "Iniciar Sesión",
        register: "Registrarse",
        searchArticles: "Buscar artículos...",
        language: "Idioma"
      },
      footer: {
        company: "Empresa",
        product: "Producto",
        support: "Soporte",
        howItWorks: "¿Cómo funciona?",
        successStories: "Casos de Éxito",
        contact: "Contacto",
        blog: "Blog",
        features: "Características",
        pricing: "Precios",
        comparisons: "Comparativas",
        resources: "Recursos",
        help: "Ayuda",
        faq: "Preguntas Frecuentes",
        documentation: "Documentación",
        community: "Comunidad",
        newsletter: "Newsletter",
        newsletterDescription: "Recibe las últimas noticias y actualizaciones de Itineramio directamente en tu bandeja de entrada.",
        subscribe: "Suscribirse",
        copyright: "Todos los derechos reservados.",
        privacy: "Privacidad",
        terms: "Términos",
        cookies: "Cookies",
        language: "Idioma"
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
      navbar: {
        features: "Features",
        blog: "Blog",
        academy: "Academy",
        resources: "Resources",
        pricing: "Pricing",
        successStories: "Success Stories",
        compare: "Compare",
        login: "Login",
        register: "Sign Up",
        searchArticles: "Search articles...",
        language: "Language"
      },
      footer: {
        company: "Company",
        product: "Product",
        support: "Support",
        howItWorks: "How it works",
        successStories: "Success Stories",
        contact: "Contact",
        blog: "Blog",
        features: "Features",
        pricing: "Pricing",
        comparisons: "Comparisons",
        resources: "Resources",
        help: "Help",
        faq: "FAQ",
        documentation: "Documentation",
        community: "Community",
        newsletter: "Newsletter",
        newsletterDescription: "Get the latest news and updates from Itineramio directly in your inbox.",
        subscribe: "Subscribe",
        copyright: "All rights reserved.",
        privacy: "Privacy",
        terms: "Terms",
        cookies: "Cookies",
        language: "Language"
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
  },
  fr: {
    common: {
      navigation: {
        home: "Accueil",
        dashboard: "Tableau de bord",
        properties: "Propriétés",
        settings: "Paramètres",
        logout: "Déconnexion"
      },
      navbar: {
        features: "Fonctionnalités",
        blog: "Blog",
        academy: "Académie",
        resources: "Ressources",
        pricing: "Tarifs",
        successStories: "Témoignages",
        compare: "Comparer",
        login: "Connexion",
        register: "S'inscrire",
        searchArticles: "Rechercher des articles...",
        language: "Langue"
      },
      footer: {
        company: "Entreprise",
        product: "Produit",
        support: "Support",
        howItWorks: "Comment ça marche",
        successStories: "Témoignages",
        contact: "Contact",
        blog: "Blog",
        features: "Fonctionnalités",
        pricing: "Tarifs",
        comparisons: "Comparatifs",
        resources: "Ressources",
        help: "Aide",
        faq: "FAQ",
        documentation: "Documentation",
        community: "Communauté",
        newsletter: "Newsletter",
        newsletterDescription: "Recevez les dernières nouvelles et mises à jour d'Itineramio directement dans votre boîte mail.",
        subscribe: "S'abonner",
        copyright: "Tous droits réservés.",
        privacy: "Confidentialité",
        terms: "Conditions",
        cookies: "Cookies",
        language: "Langue"
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