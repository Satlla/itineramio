import 'i18next'
import 'react-i18next'

// Define available namespaces
type Namespaces = 'common' | 'auth' | 'dashboard' | 'property' | 'zones' | 'account' | 'landing' | 'tools' | 'legal'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    // Use loose typing to allow any translation key
    // This prevents TS errors while still providing namespace autocomplete
    resources: Record<Namespaces, Record<string, unknown>>
    returnNull: false
    // Disable strict key checking
    allowObjectInHTMLChildren: true
  }
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: Record<Namespaces, Record<string, unknown>>
  }

  // Override useTranslation to accept any namespace
  export function useTranslation(
    ns?: Namespaces | Namespaces[],
    options?: { keyPrefix?: string }
  ): {
    t: (key: string, optionsOrDefaultValue?: string | Record<string, unknown>) => string
    i18n: typeof import('i18next').default
    ready: boolean
  }
}
