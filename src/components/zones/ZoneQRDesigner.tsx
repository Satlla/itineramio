'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Download,
  QrCode,
  Palette,
  Type,
  Globe,
  Image as ImageIcon,
  Check,
  Copy,
  Sparkles
} from 'lucide-react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'

interface ZoneQRDesignerProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  propertyName: string
  zoneId: string
  zoneName: string
  zoneSlug?: string
}

type DesignStyle = 'minimal' | 'framed' | 'modern'
type Language = 'es' | 'en'

const PRESET_TEXTS = {
  es: {
    scanMe: 'ESCANÉAME',
    scanMeAlt: 'ESCANEA AQUÍ',
    toView: 'Para ver la guía de',
    instructions: 'Instrucciones de'
  },
  en: {
    scanMe: 'SCAN ME',
    scanMeAlt: 'SCAN HERE',
    toView: 'To view',
    instructions: 'Instructions for'
  }
}

const QR_COLORS = [
  { name: 'Negro', value: '#000000' },
  { name: 'Violeta', value: '#8B5CF6' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Naranja', value: '#F97316' }
]

export default function ZoneQRDesigner({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  zoneId,
  zoneName,
  zoneSlug
}: ZoneQRDesignerProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [language, setLanguage] = useState<Language>('es')
  const [topText, setTopText] = useState(PRESET_TEXTS.es.scanMe)
  const [middleText, setMiddleText] = useState('')
  const [bottomText, setBottomText] = useState('itineramio.com')
  const [qrColor, setQrColor] = useState('#000000')
  const [designStyle, setDesignStyle] = useState<DesignStyle>('framed')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const designRef = useRef<HTMLDivElement>(null)

  // Generate the zone URL
  const zoneUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/guide/${propertyId}/${zoneId}`

  // Initialize middle text with property and zone name
  useEffect(() => {
    const texts = PRESET_TEXTS[language]
    setMiddleText(`${texts.toView} ${zoneName}`)
  }, [zoneName, language])

  // Generate QR code when color changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(zoneUrl, {
          width: 400,
          margin: 1,
          color: {
            dark: qrColor,
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        })
        setQrDataUrl(dataUrl)
      } catch (err) {
        console.error('Error generating QR:', err)
      }
    }
    generateQR()
  }, [zoneUrl, qrColor])

  // Update texts when language changes
  useEffect(() => {
    const texts = PRESET_TEXTS[language]
    setTopText(texts.scanMe)
    setMiddleText(`${texts.toView} ${zoneName}`)
  }, [language, zoneName])

  const handleDownloadSimple = async () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = `qr-${propertyName}-${zoneName}.png`.toLowerCase().replace(/\s+/g, '-')
    link.href = qrDataUrl
    link.click()
  }

  const handleDownloadDesign = async () => {
    if (!designRef.current) return

    setIsGenerating(true)

    try {
      const canvas = await html2canvas(designRef.current, {
        scale: 3, // High resolution for print
        backgroundColor: '#ffffff',
        useCORS: true
      })

      const link = document.createElement('a')
      link.download = `qr-design-${propertyName}-${zoneName}.png`.toLowerCase().replace(/\s+/g, '-')
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error generating design:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(zoneUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <QrCode className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Generador de QR para {zoneName}
                </h2>
                <p className="text-sm text-gray-500">
                  Personaliza y descarga el código QR
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Preview */}
            <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center min-h-[400px]">
              <div
                ref={designRef}
                className="bg-white p-8 shadow-lg"
                style={{ width: '280px' }}
              >
                {designStyle === 'framed' && (
                  <div className="text-center">
                    {/* Top text */}
                    <h3 className="text-2xl font-black tracking-tight mb-1" style={{ color: qrColor }}>
                      {topText}
                    </h3>

                    {/* Middle text */}
                    <p className="text-xs text-gray-600 mb-4 italic">
                      {middleText}
                    </p>

                    {/* QR with scanner frame */}
                    <div className="relative inline-block">
                      {/* Corner brackets */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 rounded-tl-sm" style={{ borderColor: qrColor }} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 rounded-tr-sm" style={{ borderColor: qrColor }} />
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 rounded-bl-sm" style={{ borderColor: qrColor }} />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 rounded-br-sm" style={{ borderColor: qrColor }} />

                      {/* QR Code */}
                      {qrDataUrl && (
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          className="w-44 h-44"
                        />
                      )}
                    </div>

                    {/* Bottom text */}
                    <p className="mt-4 text-sm text-gray-500 font-medium">
                      {bottomText}
                    </p>
                  </div>
                )}

                {designStyle === 'minimal' && (
                  <div className="text-center">
                    {qrDataUrl && (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      {bottomText}
                    </p>
                  </div>
                )}

                {designStyle === 'modern' && (
                  <div className="text-center">
                    {/* Gradient header */}
                    <div
                      className="py-3 px-4 -mx-8 -mt-8 mb-4"
                      style={{ background: `linear-gradient(135deg, ${qrColor}, ${qrColor}dd)` }}
                    >
                      <h3 className="text-xl font-bold text-white tracking-wide">
                        {topText}
                      </h3>
                    </div>

                    {/* Middle text */}
                    <p className="text-sm text-gray-600 mb-4">
                      {middleText}
                    </p>

                    {/* QR Code with rounded corners container */}
                    <div className="bg-gray-50 rounded-xl p-4 inline-block">
                      {qrDataUrl && (
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          className="w-40 h-40"
                        />
                      )}
                    </div>

                    {/* Bottom text */}
                    <p className="mt-4 text-sm font-medium" style={{ color: qrColor }}>
                      {bottomText}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="w-full md:w-80 p-6 border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto max-h-[400px] md:max-h-none">
              {/* Language */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4" />
                  Idioma
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('es')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      language === 'es'
                        ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      language === 'en'
                        ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Design Style */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4" />
                  Estilo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'framed', label: 'Enmarcado' },
                    { id: 'minimal', label: 'Mínimo' },
                    { id: 'modern', label: 'Moderno' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setDesignStyle(style.id as DesignStyle)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                        designStyle === style.id
                          ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Text */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Type className="w-4 h-4" />
                  Texto superior
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="SCAN ME"
                />
              </div>

              {/* Middle Text */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Type className="w-4 h-4" />
                  Descripción
                </label>
                <input
                  type="text"
                  value={middleText}
                  onChange={(e) => setMiddleText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Para ver las instrucciones"
                />
              </div>

              {/* Bottom Text */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4" />
                  URL / Web
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="itineramio.com"
                />
              </div>

              {/* QR Color */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4" />
                  Color del QR
                </label>
                <div className="flex gap-2 flex-wrap">
                  {QR_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setQrColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        qrColor === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Copy URL */}
              <button
                onClick={handleCopyUrl}
                className="w-full mb-3 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    URL copiada
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar URL de la zona
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer with download buttons */}
          <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleDownloadSimple}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Descargar QR Simple
            </button>
            <button
              onClick={handleDownloadDesign}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Descargar con Diseño
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
