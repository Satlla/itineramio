'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle, Mail, Send, Share2, MessageCircle } from 'lucide-react'

interface DemoShareModalProps {
  isOpen: boolean
  onClose: () => void
  propertyName: string
  shareUrl: string
}

const trackEvent = (event: string, data: Record<string, unknown>) => {
  try {
    fetch('/api/admin/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    }).catch(() => {})
  } catch {}
}

export default function DemoShareModal({ isOpen, onClose, propertyName, shareUrl }: DemoShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false)

  const shareText = `Mira el manual digital que he creado con IA para mi alojamiento. Es increible! ${shareUrl}`
  const shareTextEncoded = encodeURIComponent(shareText)
  const shareUrlEncoded = encodeURIComponent(shareUrl)
  const emailSubject = encodeURIComponent(`Manual digital IA para ${propertyName}`)
  const emailBody = encodeURIComponent(`Hola!\n\nHe creado un manual digital con IA para mi alojamiento "${propertyName}" en Itineramio.\n\nEchale un vistazo: ${shareUrl}\n\nSi te gusta, ambos recibiremos un descuento extra!`)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      trackEvent('demo_shared', { method: 'copy_link' })
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedLink(true)
      trackEvent('demo_shared', { method: 'copy_link' })
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleWhatsApp = () => {
    trackEvent('demo_shared', { method: 'whatsapp' })
    window.open(`https://wa.me/?text=${shareTextEncoded}`, '_blank')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Manual digital de ${propertyName}`,
          text: `Mira el manual digital que he creado con IA para mi alojamiento.`,
          url: shareUrl,
        })
        trackEvent('demo_shared', { method: 'native_share' })
      } catch {
        // User cancelled or error - do nothing
      }
    }
  }

  const handleEmail = () => {
    trackEvent('demo_shared', { method: 'email' })
    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, '_blank')
  }

  const handleTelegram = () => {
    trackEvent('demo_shared', { method: 'telegram' })
    window.open(`https://t.me/share/url?url=${shareUrlEncoded}&text=${encodeURIComponent(`Manual digital IA para ${propertyName} - Itineramio`)}`, '_blank')
  }

  const shareOptions = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      onClick: handleWhatsApp,
    },
    ...(typeof navigator !== 'undefined' && 'share' in navigator
      ? [{
          id: 'native',
          label: 'Compartir',
          icon: Share2,
          color: 'bg-blue-500 hover:bg-blue-600',
          textColor: 'text-white',
          onClick: handleNativeShare,
        }]
      : []),
    {
      id: 'telegram',
      label: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      onClick: handleTelegram,
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'bg-gray-700 hover:bg-gray-600',
      textColor: 'text-white',
      onClick: handleEmail,
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full sm:max-w-md bg-gray-900 border border-gray-700 sm:rounded-2xl rounded-t-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Comparte tu manual
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Si les gusta, ambos recibireis un descuento extra
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share options */}
            <div className="px-5 pb-3 grid grid-cols-2 gap-2.5">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={option.onClick}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl ${option.color} ${option.textColor} transition-colors font-medium text-sm`}
                >
                  <option.icon className="w-5 h-5" />
                  {option.label}
                </button>
              ))}
            </div>

            {/* Copy link */}
            <div className="px-5 pb-5">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-700 hover:border-gray-600 bg-gray-800/50 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  {copiedLink ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-violet-400" />
                  )}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {copiedLink ? 'Enlace copiado!' : 'Copiar enlace'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{shareUrl}</p>
                </div>
              </button>
            </div>

            {/* Safe area for mobile */}
            <div className="h-safe-area-inset-bottom sm:hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
