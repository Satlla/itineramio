'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  QrCode,
  Download,
  ArrowLeft,
  Copy,
  Check,
  Palette,
  Sparkles,
  Home,
  Wifi,
  Phone
} from 'lucide-react'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'

const qrColors = [
  { name: 'Violet', color: '#7c3aed', bg: '#f5f3ff' },
  { name: 'Blue', color: '#3b82f6', bg: '#eff6ff' },
  { name: 'Green', color: '#10b981', bg: '#ecfdf5' },
  { name: 'Orange', color: '#f59e0b', bg: '#fffbeb' },
  { name: 'Pink', color: '#ec4899', bg: '#fdf2f8' },
  { name: 'Black', color: '#000000', bg: '#ffffff' }
]

export default function QRGenerator() {
  const { t } = useTranslation('tools')

  const qrTemplates = [
    { id: 'manual', label: t('qrGenerator.templates.manual'), icon: Home, url: 'https://www.itineramio.com/manual/' },
    { id: 'wifi', label: t('qrGenerator.templates.wifi'), icon: Wifi, url: 'WIFI:T:WPA;S:RedName;P:Password;;' },
    { id: 'contact', label: t('qrGenerator.templates.contact'), icon: Phone, url: 'tel:+34600000000' }
  ]

  const [url, setUrl] = useState('')
  const [selectedColor, setSelectedColor] = useState(qrColors[0])
  const [qrCode, setQrCode] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ format: 'png' | 'svg' } | null>(null)
  const [QRCodeStyling, setQRCodeStyling] = useState<any>(null)
  const [hasUnlockedDownload, setHasUnlockedDownload] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  // Dynamically import qr-code-styling on client side only
  useEffect(() => {
    import('qr-code-styling').then((module) => {
      setQRCodeStyling(() => module.default)
    })
  }, [])

  const generateQR = () => {
    if (!url.trim() || !QRCodeStyling) return

    // Clear previous QR
    if (qrRef.current) {
      qrRef.current.innerHTML = ''
    }

    const qr = new QRCodeStyling({
      width: 400,
      height: 400,
      data: url,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 10
      },
      dotsOptions: {
        type: 'rounded',
        color: selectedColor.color,
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: selectedColor.color },
            { offset: 1, color: selectedColor.color }
          ]
        }
      },
      backgroundOptions: {
        color: selectedColor.bg
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: selectedColor.color
      },
      cornersDotOptions: {
        type: 'dot',
        color: selectedColor.color
      }
    })

    if (qrRef.current) {
      qr.append(qrRef.current)
    }
    setQrCode(qr)
  }

  const handleDownloadClick = (format: 'png' | 'svg') => {
    setPendingAction({ format })
    setShowLeadModal(true)
  }

  const downloadQR = (format: 'png' | 'svg') => {
    if (qrCode) {
      qrCode.download({
        name: 'itineramio-qr',
        extension: format
      })
    }
  }

  const handleLeadSubmit = async (data: { name: string; email: string }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'qr-generator',
          metadata: {
            format: pendingAction?.format,
            url: url
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Lead captured successfully:', result)
        // Unlock downloads - NO automatic download
        setHasUnlockedDownload(true)
      } else {
        console.error('Error capturing lead:', result.error)
      }
    } catch (error) {
      console.error('Error calling lead capture API:', error)
    }

    setIsSubmitting(false)
    setShowLeadModal(false)
    setPendingAction(null)
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyTemplate = (template: typeof qrTemplates[0]) => {
    setUrl(template.url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/hub"
                className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t('common.backToHub')}
              </Link>
              <SocialShare
                title={t('qrGenerator.shareTitle')}
                description={t('qrGenerator.shareDescription')}
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  {t('qrGenerator.title')}
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  {t('qrGenerator.subtitle')}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-50 rounded-full border border-violet-200">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-900">{t('qrGenerator.badge')}</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('common.configuration')}
                </h2>

                {/* Templates */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {t('qrGenerator.quickTemplates')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {qrTemplates.map((template) => {
                      const Icon = template.icon
                      return (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-4 bg-gray-50 hover:bg-violet-50 border-2 border-gray-200 hover:border-violet-500 rounded-xl transition-all group"
                        >
                          <Icon className="w-6 h-6 text-gray-600 group-hover:text-violet-600 mx-auto mb-2" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-violet-900">
                            {template.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* URL Input */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {t('qrGenerator.urlLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={t('qrGenerator.urlPlaceholder')}
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                      onClick={copyUrl}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {t('qrGenerator.urlHint')}
                  </p>
                </div>

                {/* Color Picker */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    {t('qrGenerator.colorLabel')}
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {qrColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-12 h-12 rounded-xl transition-all ${
                          selectedColor.name === color.name
                            ? 'ring-4 ring-violet-500 ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      >
                        {selectedColor.name === color.name && (
                          <Check className="w-6 h-6 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateQR}
                  disabled={!url.trim() || !QRCodeStyling}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {!QRCodeStyling ? t('qrGenerator.loading') : t('qrGenerator.generateButton')}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('qrGenerator.tips.title')}
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('qrGenerator.tips.tip1')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('qrGenerator.tips.tip2')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('qrGenerator.tips.tip3')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('qrGenerator.tips.tip4')}</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Right: Preview & Download */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('common.preview')}
                </h2>

                {/* QR Code Container */}
                <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl mb-6 p-8">
                  {/* Always render qrRef div so QR can be appended */}
                  <div ref={qrRef} className={`qr-code-container ${!qrCode ? 'hidden' : ''}`} />
                  {!qrCode && (
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {t('qrGenerator.configurePrompt')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Download Buttons */}
                {qrCode && (
                  <div className="space-y-3">
                    {hasUnlockedDownload ? (
                      <>
                        {/* Success message */}
                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-4">
                          <p className="text-green-800 font-medium flex items-center">
                            <Check className="w-5 h-5 mr-2" />
                            {t('qrGenerator.downloadReady')}
                          </p>
                          <p className="text-green-600 text-sm mt-1">
                            {t('qrGenerator.emailSent')}
                          </p>
                        </div>
                        {/* Direct download buttons - no modal */}
                        <button
                          onClick={() => downloadQR('png')}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all group"
                        >
                          <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                          {t('common.downloadPng')}
                        </button>
                        <button
                          onClick={() => downloadQR('svg')}
                          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all group"
                        >
                          <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                          {t('common.downloadSvg')}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Buttons that require email first */}
                        <button
                          onClick={() => handleDownloadClick('png')}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all group"
                        >
                          <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                          {t('common.downloadPng')}
                        </button>
                        <button
                          onClick={() => handleDownloadClick('svg')}
                          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all group"
                        >
                          <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                          {t('common.downloadSvg')}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-violet-50 rounded-xl">
                  <p className="text-sm text-violet-900">
                    <strong>{t('qrGenerator.cta.question')}</strong>
                    <br />
                    <Link href="/register" className="text-violet-600 hover:text-violet-700 font-semibold underline">
                      {t('qrGenerator.cta.action')}
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false)
          setPendingAction(null)
        }}
        onSubmit={handleLeadSubmit}
        title={t('qrGenerator.leadModal.title')}
        description={t('qrGenerator.leadModal.description')}
        downloadLabel={`${t('common.downloadPng').split(' ')[0]} ${pendingAction?.format.toUpperCase() || ''}`}
      />
    </div>
  )
}
