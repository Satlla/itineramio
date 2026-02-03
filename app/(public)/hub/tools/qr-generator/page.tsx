'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  QrCode,
  Download,
  Copy,
  Check,
  Palette,
  Link2,
  Wifi,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import QRCode from 'qrcode'

type QRType = 'url' | 'wifi' | 'email' | 'phone' | 'location' | 'text'

interface QRConfig {
  type: QRType
  content: string
  // WiFi specific
  wifiSSID?: string
  wifiPassword?: string
  wifiEncryption?: 'WPA' | 'WEP' | 'nopass'
  // Email specific
  emailAddress?: string
  emailSubject?: string
  emailBody?: string
  // Phone specific
  phoneNumber?: string
  // Location specific
  latitude?: string
  longitude?: string
  // Style
  darkColor: string
  lightColor: string
  size: number
}

const defaultConfig: QRConfig = {
  type: 'url',
  content: '',
  wifiSSID: '',
  wifiPassword: '',
  wifiEncryption: 'WPA',
  emailAddress: '',
  emailSubject: '',
  emailBody: '',
  phoneNumber: '',
  latitude: '',
  longitude: '',
  darkColor: '#6366f1',
  lightColor: '#ffffff',
  size: 300
}

const colorPresets = [
  { name: 'Violeta', dark: '#6366f1', light: '#ffffff' },
  { name: 'Negro', dark: '#000000', light: '#ffffff' },
  { name: 'Azul', dark: '#2563eb', light: '#ffffff' },
  { name: 'Verde', dark: '#16a34a', light: '#ffffff' },
  { name: 'Rojo', dark: '#dc2626', light: '#ffffff' },
  { name: 'Naranja', dark: '#ea580c', light: '#ffffff' },
]

const qrTypes: { type: QRType; label: string; icon: any; description: string }[] = [
  { type: 'url', label: 'URL / Enlace', icon: Link2, description: 'Enlace a cualquier página web' },
  { type: 'wifi', label: 'WiFi', icon: Wifi, description: 'Conectar automáticamente a una red WiFi' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Abrir email con asunto y mensaje' },
  { type: 'phone', label: 'Teléfono', icon: Phone, description: 'Llamar a un número' },
  { type: 'location', label: 'Ubicación', icon: MapPin, description: 'Abrir ubicación en mapas' },
  { type: 'text', label: 'Texto libre', icon: QrCode, description: 'Cualquier texto o mensaje' },
]

export default function QRGeneratorPage() {
  const [config, setConfig] = useState<QRConfig>(defaultConfig)
  const [qrCode, setQrCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // Generate QR content based on type
  const generateQRContent = (): string => {
    switch (config.type) {
      case 'url':
        return config.content || ''
      case 'wifi':
        // WiFi QR format: WIFI:T:WPA;S:ssid;P:password;;
        const encryption = config.wifiEncryption || 'WPA'
        const ssid = config.wifiSSID || ''
        const password = config.wifiPassword || ''
        return `WIFI:T:${encryption};S:${ssid};P:${password};;`
      case 'email':
        const email = config.emailAddress || ''
        const subject = encodeURIComponent(config.emailSubject || '')
        const body = encodeURIComponent(config.emailBody || '')
        return `mailto:${email}?subject=${subject}&body=${body}`
      case 'phone':
        return `tel:${config.phoneNumber || ''}`
      case 'location':
        const lat = config.latitude || '0'
        const lng = config.longitude || '0'
        return `geo:${lat},${lng}`
      case 'text':
        return config.content || ''
      default:
        return config.content || ''
    }
  }

  // Generate QR code
  const generateQR = async () => {
    const content = generateQRContent()
    if (!content || content === 'WIFI:T:WPA;S:;P:;;' || content === 'mailto:?subject=&body=' || content === 'tel:' || content === 'geo:0,0') {
      setQrCode('')
      return
    }

    setLoading(true)
    setError('')

    try {
      const qrDataURL = await QRCode.toDataURL(content, {
        width: config.size,
        margin: 2,
        color: {
          dark: config.darkColor,
          light: config.lightColor
        },
        errorCorrectionLevel: 'M'
      })
      setQrCode(qrDataURL)
    } catch (err) {
      console.error('Error generating QR:', err)
      setError('Error al generar el código QR')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate when config changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      generateQR()
    }, 300)
    return () => clearTimeout(debounce)
  }, [config])

  // Download QR
  const handleDownload = () => {
    if (!qrCode) return
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `qr-code-${config.type}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copy QR to clipboard
  const handleCopy = async () => {
    if (!qrCode) return
    try {
      const response = await fetch(qrCode)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const updateConfig = (updates: Partial<QRConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const isValidContent = () => {
    switch (config.type) {
      case 'url':
        return config.content.length > 0
      case 'wifi':
        return (config.wifiSSID?.length || 0) > 0
      case 'email':
        return (config.emailAddress?.length || 0) > 0
      case 'phone':
        return (config.phoneNumber?.length || 0) > 0
      case 'location':
        return (config.latitude?.length || 0) > 0 && (config.longitude?.length || 0) > 0
      case 'text':
        return config.content.length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-violet-100 rounded-xl">
              <QrCode className="w-8 h-8 text-violet-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Generador de Códigos QR
              </h1>
              <p className="text-gray-600">
                Crea códigos QR personalizados para WiFi, enlaces, contacto y más
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* QR Type Selection */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tipo de QR
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {qrTypes.map(({ type, label, icon: Icon, description }) => (
                  <button
                    key={type}
                    onClick={() => updateConfig({ type, content: '' })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      config.type === type
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${config.type === type ? 'text-violet-600' : 'text-gray-500'}`} />
                    <div className={`font-medium text-sm ${config.type === type ? 'text-violet-900' : 'text-gray-900'}`}>
                      {label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contenido
              </h2>

              {config.type === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del enlace
                  </label>
                  <input
                    type="url"
                    value={config.content}
                    onChange={(e) => updateConfig({ content: e.target.value })}
                    placeholder="https://ejemplo.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              )}

              {config.type === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la red (SSID)
                    </label>
                    <input
                      type="text"
                      value={config.wifiSSID}
                      onChange={(e) => updateConfig({ wifiSSID: e.target.value })}
                      placeholder="MiRedWiFi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="text"
                      value={config.wifiPassword}
                      onChange={(e) => updateConfig({ wifiPassword: e.target.value })}
                      placeholder="********"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de seguridad
                    </label>
                    <select
                      value={config.wifiEncryption}
                      onChange={(e) => updateConfig({ wifiEncryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Sin contraseña</option>
                    </select>
                  </div>
                </div>
              )}

              {config.type === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección de email
                    </label>
                    <input
                      type="email"
                      value={config.emailAddress}
                      onChange={(e) => updateConfig({ emailAddress: e.target.value })}
                      placeholder="contacto@ejemplo.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto (opcional)
                    </label>
                    <input
                      type="text"
                      value={config.emailSubject}
                      onChange={(e) => updateConfig({ emailSubject: e.target.value })}
                      placeholder="Consulta desde QR"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={config.emailBody}
                      onChange={(e) => updateConfig({ emailBody: e.target.value })}
                      placeholder="Hola, me gustaría..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                </div>
              )}

              {config.type === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de teléfono
                  </label>
                  <input
                    type="tel"
                    value={config.phoneNumber}
                    onChange={(e) => updateConfig({ phoneNumber: e.target.value })}
                    placeholder="+34 600 000 000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              )}

              {config.type === 'location' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitud
                    </label>
                    <input
                      type="text"
                      value={config.latitude}
                      onChange={(e) => updateConfig({ latitude: e.target.value })}
                      placeholder="40.4168"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitud
                    </label>
                    <input
                      type="text"
                      value={config.longitude}
                      onChange={(e) => updateConfig({ longitude: e.target.value })}
                      placeholder="-3.7038"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Puedes obtener las coordenadas desde Google Maps haciendo clic derecho en un punto.
                  </p>
                </div>
              )}

              {config.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto libre
                  </label>
                  <textarea
                    value={config.content}
                    onChange={(e) => updateConfig({ content: e.target.value })}
                    placeholder="Escribe cualquier texto..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              )}
            </div>

            {/* Color Customization */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-600" />
                Personalizar color
              </h2>
              <div className="flex flex-wrap gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateConfig({ darkColor: preset.dark, lightColor: preset.light })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      config.darkColor === preset.dark
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border"
                      style={{ backgroundColor: preset.dark }}
                    />
                    <span className="text-sm font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color personalizado
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.darkColor}
                      onChange={(e) => updateConfig({ darkColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.darkColor}
                      onChange={(e) => updateConfig({ darkColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                Vista previa
              </h2>

              <div className="flex justify-center mb-6">
                {loading ? (
                  <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : qrCode ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="w-64 h-64 rounded-2xl shadow-lg"
                    />
                  </motion.div>
                ) : (
                  <div className="w-64 h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                    <QrCode className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm text-center px-4">
                      Introduce el contenido para generar el QR
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              {qrCode && (
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Descargar PNG
                  </button>
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-colors font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-green-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copiar al portapapeles
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-violet-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-violet-800">
                    <p className="font-medium mb-1">Consejo</p>
                    <p className="text-violet-700">
                      {config.type === 'wifi' && 'Los huéspedes podrán conectarse al WiFi escaneando el QR con su móvil.'}
                      {config.type === 'url' && 'Usa URLs cortas para que el QR sea más fácil de escanear.'}
                      {config.type === 'email' && 'Ideal para recibir feedback o consultas de tus huéspedes.'}
                      {config.type === 'phone' && 'Perfecto para que te contacten fácilmente en caso de emergencia.'}
                      {config.type === 'location' && 'Ayuda a tus huéspedes a encontrar tu propiedad fácilmente.'}
                      {config.type === 'text' && 'Puedes incluir instrucciones, códigos de acceso o mensajes personalizados.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
