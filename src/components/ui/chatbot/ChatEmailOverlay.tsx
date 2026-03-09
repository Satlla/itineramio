'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Loader2 } from 'lucide-react'

interface ChatEmailOverlayProps {
  propertyId: string
  sessionId: string
  lang: string
  translations: {
    success: string
    prompt: string
    emailPlaceholder: string
    namePlaceholder: string
    error: string
    submit: string
    skip: string
  }
  onCollected: () => void
  onDismiss: () => void
}

export function ChatEmailOverlay({
  propertyId,
  sessionId,
  lang,
  translations: t,
  onCollected,
  onDismiss,
}: ChatEmailOverlayProps) {
  const [emailInput, setEmailInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) return

    setSubmitting(true)
    setError(false)

    try {
      const response = await fetch('/api/chatbot/collect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          name: nameInput.trim() || undefined,
          propertyId,
          sessionId,
          source: 'chatbot_inline'
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => onCollected(), 2000)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-gray-50 border border-gray-200 rounded-xl p-3 mx-1 mb-1 shadow-sm"
    >
      {success ? (
        <p className="text-sm text-center text-green-600 font-medium py-1">
          {t.success}
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <p className="text-xs text-gray-600 font-medium">{t.prompt}</p>
          </div>
          <div className="flex space-x-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="flex-1 min-w-0 px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-black/5 focus:border-gray-300 transition-colors"
            />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t.namePlaceholder}
              className="flex-1 min-w-0 px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-black/5 focus:border-gray-300 transition-colors"
            />
          </div>
          {error && (
            <p className="text-xs text-red-500">{t.error}</p>
          )}
          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !emailInput.trim()}
              className="flex-1 px-3 py-2 bg-black text-white text-xs rounded-lg hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
              ) : (
                t.submit
              )}
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-2 text-gray-400 text-xs hover:text-gray-600 transition-colors"
            >
              {t.skip}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
