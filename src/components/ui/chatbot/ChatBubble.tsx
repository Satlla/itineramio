'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

interface ChatBubbleProps {
  propertyName: string
  welcomeText: string
  suggestions: string[]
  dismissText: string
  headerText: string
  className?: string
  onSuggestionClick: (suggestion: string) => void
  onDismiss: () => void
}

export function ChatBubble({
  propertyName,
  welcomeText,
  suggestions,
  dismissText,
  headerText,
  className = 'bottom-40 right-4 sm:bottom-28 sm:right-6',
  onSuggestionClick,
  onDismiss,
}: ChatBubbleProps) {
  const [dismissing, setDismissing] = useState(false)

  const handleDismiss = () => {
    setDismissing(true)
    setTimeout(() => onDismiss(), 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={dismissing
        ? { opacity: 0, scale: 0.2, x: 0, y: 40 }
        : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, scale: 0.2, y: 40 }}
      transition={{ duration: dismissing ? 0.4 : 0.3, ease: 'easeOut' }}
      className={`fixed z-50 ${className}`}
      style={{ maxWidth: '320px', width: 'calc(100vw - 32px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider">{headerText}</p>
            <p className="text-sm font-medium truncate">{propertyName}</p>
          </div>
        </div>

        {/* Message */}
        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 leading-relaxed">{welcomeText}</p>
        </div>

        {/* Suggestion chips */}
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-violet-100 hover:text-violet-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Dismiss */}
        <div className="px-4 pb-3">
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {dismissText}
          </button>
        </div>
      </div>

      {/* Arrow pointing to chat button */}
      <div className="flex justify-end mr-5 -mt-px">
        <div className="w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45 translate-y-[-6px]" />
      </div>
    </motion.div>
  )
}
