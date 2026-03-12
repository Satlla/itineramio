'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send } from 'lucide-react'

const LANGUAGE_FLAGS: Record<string, { flag: string; label: string }> = {
  es: { flag: '🇪🇸', label: 'ES' },
  en: { flag: '🇬🇧', label: 'EN' },
  fr: { flag: '🇫🇷', label: 'FR' },
}

interface ChatBubbleProps {
  propertyName: string
  welcomeText: string
  suggestions: string[]
  dismissText: string
  headerText: string
  inputPlaceholder?: string
  lang?: string
  className?: string
  onSuggestionClick: (suggestion: string) => void
  onDismiss: () => void
  onCustomMessage?: (message: string) => void
  onLanguageChange?: (lang: 'es' | 'en' | 'fr') => void
}

export function ChatBubble({
  propertyName,
  welcomeText,
  suggestions,
  dismissText,
  headerText,
  inputPlaceholder = 'Escribe tu pregunta...',
  lang = 'es',
  className = 'bottom-40 right-4 sm:bottom-28 sm:right-6',
  onSuggestionClick,
  onDismiss,
  onCustomMessage,
  onLanguageChange,
}: ChatBubbleProps) {
  const [dismissing, setDismissing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDismiss = () => {
    setDismissing(true)
    setTimeout(() => onDismiss(), 500)
  }

  const handleSend = () => {
    const msg = inputValue.trim()
    if (!msg) return
    setInputValue('')
    if (onCustomMessage) onCustomMessage(msg)
    else onSuggestionClick(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
          {/* Language flags */}
          {onLanguageChange && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {(Object.keys(LANGUAGE_FLAGS) as Array<'es' | 'en' | 'fr'>).map((l) => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`text-base leading-none transition-opacity ${lang === l ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                  title={LANGUAGE_FLAGS[l].label}
                >
                  {LANGUAGE_FLAGS[l].flag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-sm text-gray-700 leading-relaxed">{welcomeText}</p>
        </div>

        {/* Suggestion chips */}
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
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

        {/* Input */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-1 rounded-lg bg-black text-white disabled:opacity-30 transition-opacity"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dismiss */}
        <div className="px-4 pb-3 -mt-1">
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
