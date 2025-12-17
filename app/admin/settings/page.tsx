'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Save, 
  RotateCcw,
  Mail,
  Phone,
  Globe,
  DollarSign,
  FileText,
  Shield,
  Bell,
  Database,
  Server,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Building2,
  MessageSquare
} from 'lucide-react'

interface SystemSettings {
  // Company Information
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  companyWebsite: string
  companyTaxId: string
  companyCity: string
  companyPostalCode: string
  companyCountry: string
  companyBankAccount: string
  companyBic: string
  companyLogoUrl: string
  companyAdditionalInfo: string
  
  // Platform Settings
  platformName: string
  supportEmail: string
  defaultLanguage: string
  defaultCurrency: string
  
  // Email Settings
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPassword: string
  smtpFromEmail: string
  smtpFromName: string
  
  // System Settings
  maintenanceMode: boolean
  userRegistration: boolean
  emailVerification: boolean
  maxPropertiesPerUser: number
  maxFileSizeMB: number
  
  // Security Settings
  sessionTimeoutMinutes: number
  passwordMinLength: number
  requireSpecialCharacters: boolean
  maxLoginAttempts: number
  
  // Notification Settings
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  adminNotifications: boolean
  
  // AI Chatbot Settings
  chatbotEnabled: boolean
  openaiApiKey: string
  chatbotWelcomeMessage: string
  whatsappNotifications: boolean
}

const defaultSettings: SystemSettings = {
  companyName: 'Itineramio',
  companyEmail: 'hola@itineramio.com',
  companyPhone: '+34 900 000 000',
  companyAddress: '',
  companyWebsite: 'https://itineramio.com',
  companyTaxId: '',
  companyCity: '',
  companyPostalCode: '',
  companyCountry: 'España',
  companyBankAccount: '',
  companyBic: '',
  companyLogoUrl: '',
  companyAdditionalInfo: '',
  
  platformName: 'Itineramio',
  supportEmail: 'hola@itineramio.com',
  defaultLanguage: 'es',
  defaultCurrency: 'EUR',
  
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  smtpFromEmail: '',
  smtpFromName: 'Itineramio',
  
  maintenanceMode: false,
  userRegistration: true,
  emailVerification: false,
  maxPropertiesPerUser: 10,
  maxFileSizeMB: 10,
  
  sessionTimeoutMinutes: 60,
  passwordMinLength: 8,
  requireSpecialCharacters: true,
  maxLoginAttempts: 5,
  
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  adminNotifications: true,
  
  chatbotEnabled: true,
  openaiApiKey: '',
  chatbotWelcomeMessage: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?',
  whatsappNotifications: true
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [activeTab, setActiveTab] = useState('company')
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof SystemSettings, string>>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (data.success && data.settings) {
        setSettings({ ...defaultSettings, ...data.settings })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      showMessage('error', 'Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const validateAllSettings = (): boolean => {
    const newErrors: Partial<Record<keyof SystemSettings, string>> = {}
    let hasErrors = false

    Object.entries(settings).forEach(([key, value]) => {
      const error = validateField(key as keyof SystemSettings, value)
      if (error) {
        newErrors[key as keyof SystemSettings] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)
    return !hasErrors
  }

  const saveSettings = async () => {
    if (!validateAllSettings()) {
      showMessage('error', 'Corrige los errores de validación antes de guardar')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      
      if (data.success) {
        showMessage('success', 'Configuración guardada correctamente')
        setErrors({})
      } else {
        showMessage('error', data.error || 'Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showMessage('error', 'Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    if (confirm('¿Estás seguro de restablecer toda la configuración a los valores por defecto?')) {
      setSettings(defaultSettings)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const validateField = (key: keyof SystemSettings, value: any): string | null => {
    switch (key) {
      case 'companyName':
      case 'platformName':
        if (!value || value.trim().length < 2) {
          return 'Debe tener al menos 2 caracteres'
        }
        break
      
      case 'companyEmail':
      case 'supportEmail':
      case 'smtpFromEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Formato de email inválido'
        }
        break
      
      case 'companyPhone':
        if (value && !/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
          return 'Formato de teléfono inválido'
        }
        break
      
      case 'companyWebsite':
        if (value && !/^https?:\/\/.+\..+$/.test(value)) {
          return 'Debe ser una URL válida (http:// o https://)'
        }
        break
        
      case 'companyTaxId':
        if (value && value.length < 8) {
          return 'NIF/CIF debe tener al menos 8 caracteres'
        }
        break
        
      case 'companyBankAccount':
        if (value && !/^ES\d{22}$/.test(value.replace(/\s/g, ''))) {
          return 'Formato IBAN español inválido (debe empezar por ES + 22 dígitos)'
        }
        break
      
      case 'smtpHost':
        if (value && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return 'Formato de servidor inválido'
        }
        break
      
      case 'smtpPort':
        const port = parseInt(value)
        if (value && (isNaN(port) || port < 1 || port > 65535)) {
          return 'Puerto debe estar entre 1 y 65535'
        }
        break
      
      case 'maxPropertiesPerUser':
        const maxProps = parseInt(value)
        if (isNaN(maxProps) || maxProps < 1 || maxProps > 1000) {
          return 'Debe estar entre 1 y 1000'
        }
        break
      
      case 'maxFileSizeMB':
        const maxSize = parseInt(value)
        if (isNaN(maxSize) || maxSize < 1 || maxSize > 100) {
          return 'Debe estar entre 1 y 100 MB'
        }
        break
      
      case 'sessionTimeoutMinutes':
        const timeout = parseInt(value)
        if (isNaN(timeout) || timeout < 15 || timeout > 1440) {
          return 'Debe estar entre 15 minutos y 24 horas'
        }
        break
      
      case 'passwordMinLength':
        const minLength = parseInt(value)
        if (isNaN(minLength) || minLength < 6 || minLength > 20) {
          return 'Debe estar entre 6 y 20 caracteres'
        }
        break
      
      case 'maxLoginAttempts':
        const maxAttempts = parseInt(value)
        if (isNaN(maxAttempts) || maxAttempts < 3 || maxAttempts > 10) {
          return 'Debe estar entre 3 y 10 intentos'
        }
        break
      
      case 'chatbotWelcomeMessage':
        if (value && value.length > 500) {
          return 'Máximo 500 caracteres'
        }
        break
    }
    return null
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    const error = validateField(key, value)
    setErrors(prev => ({ ...prev, [key]: error || undefined }))
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const InputField = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    ...props
  }: {
    label: string
    type?: string
    value: any
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    error?: string
    [key: string]: any
  }) => (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 text-xs sm:text-sm ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )

  const TextareaField = ({
    label,
    value,
    onChange,
    placeholder,
    error,
    rows = 3,
    ...props
  }: {
    label: string
    value: any
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    placeholder?: string
    error?: string
    rows?: number
    [key: string]: any
  }) => (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 text-xs sm:text-sm ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )

  const tabs = [
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'platform', label: 'Plataforma', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'system', label: 'Sistema', icon: Server },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'chatbot', label: 'Chatbot IA', icon: MessageSquare }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Gestiona la configuración global de la plataforma Itineramio
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={resetSettings}
            className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-center text-xs sm:text-sm"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Restablecer</span>
            <span className="sm:hidden">Reset</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 sm:flex-none bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center text-xs sm:text-sm"
          >
            <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide space-x-4 sm:space-x-8 px-3 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Información de la Empresa</h3>
              <p className="text-xs sm:text-sm text-gray-600">Esta información aparecerá en las facturas y documentos oficiales</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nombre de la Empresa"
                  value={settings.companyName}
                  onChange={(e) => updateSetting('companyName', e.target.value)}
                  error={errors.companyName}
                  required
                />
                
                <InputField
                  label="NIF/CIF"
                  value={settings.companyTaxId}
                  onChange={(e) => updateSetting('companyTaxId', e.target.value)}
                  error={errors.companyTaxId}
                  placeholder="B12345678"
                />
                
                <InputField
                  label="Email de Contacto"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => updateSetting('companyEmail', e.target.value)}
                  error={errors.companyEmail}
                />
                
                <InputField
                  label="Teléfono"
                  type="tel"
                  value={settings.companyPhone}
                  onChange={(e) => updateSetting('companyPhone', e.target.value)}
                  error={errors.companyPhone}
                  placeholder="+34 900 000 000"
                />
                
                <InputField
                  label="Sitio Web"
                  type="url"
                  value={settings.companyWebsite}
                  onChange={(e) => updateSetting('companyWebsite', e.target.value)}
                  error={errors.companyWebsite}
                  placeholder="https://example.com"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <select
                    value={settings.companyCountry}
                    onChange={(e) => updateSetting('companyCountry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="España">España</option>
                    <option value="Francia">Francia</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Italia">Italia</option>
                    <option value="Reino Unido">Reino Unido</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Dirección"
                  value={settings.companyAddress}
                  onChange={(e) => updateSetting('companyAddress', e.target.value)}
                  error={errors.companyAddress}
                  placeholder="Calle Ejemplo, 123"
                />
                
                <InputField
                  label="Ciudad"
                  value={settings.companyCity}
                  onChange={(e) => updateSetting('companyCity', e.target.value)}
                  error={errors.companyCity}
                  placeholder="Madrid"
                />
                
                <InputField
                  label="Código Postal"
                  value={settings.companyPostalCode}
                  onChange={(e) => updateSetting('companyPostalCode', e.target.value)}
                  error={errors.companyPostalCode}
                  placeholder="28001"
                />
              </div>

              <div className="border-t pt-4 sm:pt-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Información Bancaria</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <InputField
                    label="IBAN"
                    value={settings.companyBankAccount}
                    onChange={(e) => updateSetting('companyBankAccount', e.target.value)}
                    error={errors.companyBankAccount}
                    placeholder="ES82 0182 0304 8102 0158 7248"
                  />
                  
                  <InputField
                    label="BIC/SWIFT"
                    value={settings.companyBic}
                    onChange={(e) => updateSetting('companyBic', e.target.value)}
                    error={errors.companyBic}
                    placeholder="BBVAESMM"
                  />
                </div>
              </div>

              <div className="border-t pt-4 sm:pt-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Logo e Información Adicional</h4>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
                  <div className="flex items-center space-x-4">
                    {settings.companyLogoUrl && (
                      <img 
                        src={settings.companyLogoUrl} 
                        alt="Company Logo" 
                        className="w-20 h-20 object-contain border rounded-lg bg-white p-2"
                      />
                    )}
                    <div className="flex-1">
                      <InputField
                        label="URL del Logo"
                        value={settings.companyLogoUrl}
                        onChange={(e) => updateSetting('companyLogoUrl', e.target.value)}
                        placeholder="https://ejemplo.com/logo.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL directa de la imagen del logo (PNG, JPG). Recomendado: 400x200px
                      </p>
                    </div>
                  </div>
                </div>
                
                <TextareaField
                  label="Información Adicional"
                  value={settings.companyAdditionalInfo}
                  onChange={(e) => updateSetting('companyAdditionalInfo', e.target.value)}
                  error={errors.companyAdditionalInfo}
                  placeholder="Información adicional que aparecerá en las facturas..."
                  rows={3}
                />
              </div>

              {/* Vista previa de factura */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Vista Previa de Factura</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-6">
                    {settings.companyLogoUrl && (
                      <img 
                        src={settings.companyLogoUrl} 
                        alt="Logo" 
                        className="h-16 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-gray-900">
                        {settings.companyName || 'Nombre de la Empresa'}
                      </h2>
                      {settings.companyTaxId && (
                        <p className="text-sm text-gray-600">
                          NIF/CIF: {settings.companyTaxId}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Datos de contacto:</h3>
                      <p>{settings.companyEmail || 'email@empresa.com'}</p>
                      <p>{settings.companyPhone || '+34 900 000 000'}</p>
                      {settings.companyWebsite && <p>{settings.companyWebsite}</p>}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Dirección fiscal:</h3>
                      <p>{settings.companyAddress || 'Dirección'}</p>
                      <p>{settings.companyPostalCode || '28001'} {settings.companyCity || 'Ciudad'}</p>
                      <p>{settings.companyCountry || 'País'}</p>
                    </div>
                  </div>

                  {(settings.companyBankAccount || settings.companyBic) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">Datos bancarios:</h3>
                      <div className="text-sm text-gray-600">
                        {settings.companyBankAccount && <p>IBAN: {settings.companyBankAccount}</p>}
                        {settings.companyBic && <p>BIC: {settings.companyBic}</p>}
                      </div>
                    </div>
                  )}

                  {settings.companyAdditionalInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600">{settings.companyAdditionalInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Platform Tab */}
          {activeTab === 'platform' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración de la Plataforma</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nombre de la Plataforma"
                  value={settings.platformName}
                  onChange={(e) => updateSetting('platformName', e.target.value)}
                  error={errors.platformName}
                  required
                />
                
                <InputField
                  label="Email de Soporte"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  error={errors.supportEmail}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idioma por Defecto</label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda por Defecto</label>
                  <select
                    value={settings.defaultCurrency}
                    onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración de Email (SMTP)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Servidor SMTP"
                  value={settings.smtpHost}
                  onChange={(e) => updateSetting('smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                  error={errors.smtpHost}
                />
                
                <InputField
                  label="Puerto"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => updateSetting('smtpPort', e.target.value)}
                  error={errors.smtpPort}
                  min="1"
                  max="65535"
                />
                
                <InputField
                  label="Usuario"
                  value={settings.smtpUser}
                  onChange={(e) => updateSetting('smtpUser', e.target.value)}
                  error={errors.smtpUser}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={settings.smtpPassword}
                      onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Remitente</label>
                  <input
                    type="email"
                    value={settings.smtpFromEmail}
                    onChange={(e) => updateSetting('smtpFromEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Remitente</label>
                  <input
                    type="text"
                    value={settings.smtpFromName}
                    onChange={(e) => updateSetting('smtpFromName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración del Sistema</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Modo Mantenimiento</h4>
                    <p className="text-sm text-gray-600">Desactiva el acceso a la plataforma para usuarios</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Registro de Usuarios</h4>
                    <p className="text-sm text-gray-600">Permite el registro de nuevos usuarios</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.userRegistration}
                      onChange={(e) => updateSetting('userRegistration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Verificación de Email</h4>
                    <p className="text-sm text-gray-600">Requiere verificación de email para nuevos usuarios</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailVerification}
                      onChange={(e) => updateSetting('emailVerification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Máximo Propiedades por Usuario"
                  type="number"
                  value={settings.maxPropertiesPerUser}
                  onChange={(e) => updateSetting('maxPropertiesPerUser', parseInt(e.target.value))}
                  error={errors.maxPropertiesPerUser}
                  min="1"
                  max="1000"
                />
                
                <InputField
                  label="Tamaño Máximo de Archivo (MB)"
                  type="number"
                  value={settings.maxFileSizeMB}
                  onChange={(e) => updateSetting('maxFileSizeMB', parseInt(e.target.value))}
                  error={errors.maxFileSizeMB}
                  min="1"
                  max="100"
                />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración de Seguridad</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Sesión (minutos)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeoutMinutes}
                    onChange={(e) => updateSetting('sessionTimeoutMinutes', parseInt(e.target.value))}
                    min="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitud Mínima de Contraseña</label>
                  <input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                    min="6"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo Intentos de Login</label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Requerir Caracteres Especiales</h4>
                    <p className="text-sm text-gray-600">Las contraseñas deben incluir caracteres especiales</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireSpecialCharacters}
                      onChange={(e) => updateSetting('requireSpecialCharacters', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración del Chatbot IA</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Activar Chatbot</h4>
                    <p className="text-sm text-gray-600">Habilita el asistente virtual en las vistas públicas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.chatbotEnabled}
                      onChange={(e) => updateSetting('chatbotEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones WhatsApp</h4>
                    <p className="text-sm text-gray-600">Permite a los huéspedes contactar por WhatsApp desde el chatbot</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.whatsappNotifications}
                      onChange={(e) => updateSetting('whatsappNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clave API de OpenAI</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={settings.openaiApiKey}
                      onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional. Si no se proporciona, el chatbot usará respuestas predefinidas.
                  </p>
                </div>
                
                <div>
                  <TextareaField
                    label="Mensaje de Bienvenida"
                    value={settings.chatbotWelcomeMessage}
                    onChange={(e) => updateSetting('chatbotWelcomeMessage', e.target.value)}
                    placeholder="¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?"
                    error={errors.chatbotWelcomeMessage}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este mensaje se mostrará cuando los huéspedes abran el chatbot. (máximo 500 caracteres)
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Información sobre el Chatbot IA</h4>
                    <div className="text-sm text-blue-800">
                      <ul className="space-y-1">
                        <li>• El chatbot aparece automáticamente en todas las vistas públicas de zonas</li>
                        <li>• Con OpenAI: Respuestas inteligentes basadas en el contenido de la propiedad</li>
                        <li>• Sin OpenAI: Respuestas predefinidas basadas en reglas</li>
                        <li>• Incluye integración con WhatsApp para contacto directo</li>
                        <li>• Todas las interacciones se registran en los logs del sistema</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones por Email</h4>
                    <p className="text-sm text-gray-600">Enviar notificaciones por correo electrónico</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones Push</h4>
                    <p className="text-sm text-gray-600">Enviar notificaciones push a dispositivos móviles</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones SMS</h4>
                    <p className="text-sm text-gray-600">Enviar notificaciones por SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones Admin</h4>
                    <p className="text-sm text-gray-600">Notificar a administradores sobre eventos importantes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.adminNotifications}
                      onChange={(e) => updateSetting('adminNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}