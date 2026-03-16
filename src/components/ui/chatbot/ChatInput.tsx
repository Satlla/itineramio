'use client'

import React from 'react'
import { Send, Loader2, Phone } from 'lucide-react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isLoading: boolean
  placeholder: string
  inputRef?: React.Ref<HTMLInputElement>
  hostPhone?: string
  onWhatsAppClick?: () => void
  whatsAppLabel?: string
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  isLoading,
  placeholder,
  inputRef,
  hostPhone,
  onWhatsAppClick,
  whatsAppLabel,
}: ChatInputProps) {
  return (
    <div className="border-t border-gray-100 px-4 py-3">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, 500))}
            maxLength={500}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-gray-300 text-sm disabled:opacity-50 transition-colors placeholder:text-gray-400"
          />
        </div>
        <button
          type="button"
          onTouchEnd={(e) => { e.preventDefault(); if (!isLoading && value.trim()) onSend() }}
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          className="p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {hostPhone && onWhatsAppClick && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={onWhatsAppClick}
            className="flex items-center space-x-1 text-[11px] text-gray-400 hover:text-green-600 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>{whatsAppLabel}</span>
          </button>
        </div>
      )}
    </div>
  )
}
