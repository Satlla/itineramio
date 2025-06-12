import 'i18next'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof import('../i18n/locales/es/common.json')
      auth: typeof import('../i18n/locales/es/auth.json')
      dashboard: typeof import('../i18n/locales/es/dashboard.json')
      property: typeof import('../i18n/locales/es/property.json')
    }
    returnNull: false
  }
}