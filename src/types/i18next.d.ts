import 'i18next'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: {
        navigation: {
          home: string
          dashboard: string
          properties: string
          settings: string
          logout: string
          features: string
          pricing: string
          contact: string
        }
        buttons: {
          save: string
          cancel: string
          getStarted: string
          learnMore: string
        }
        status: {
          loading: string
          success: string
          error: string
        }
        footer: {
          description: string
          company: string
          product: string
          support: string
          about: string
          careers: string
          blog: string
          features: string
          integrations: string
          api: string
          help: string
          documentation: string
          status: string
          community: string
          privacy: string
          terms: string
          cookies: string
          security: string
          newsletter: string
          newsletterDescription: string
          emailPlaceholder: string
          subscribe: string
          allRightsReserved: string
          language: string
        }
        auth: {
          login: string
          register: string
        }
        dashboard: {
          title: string
          welcome: string
          totalProperties: string
          totalViews: string
          activeManuals: string
          avgRating: string
          timeSaved: string
          properties: string
          noProperties: string
          createFirst: string
          quickActions: string
          viewAll: string
          addProperty: string
        }
        navbar: {
          menu: string
          profile: string
          notifications: string
        }
        notifications: {
          title: string
          markAllRead: string
          noNotifications: string
          missingZone: string
          incompleteZone: string
          missingTranslation: string
        }
        zones: {
          zones: string
          addZone: string
          editZone: string
          deleteZone: string
        }
        share: {
          copyLink: string
          linkCopied: string
          shareProperty: string
        }
      }
      auth: {
        login: {
          title: string
          subtitle: string
          email: string
          password: string
          loginButton: string
        }
      }
    }
    returnNull: false
  }
}