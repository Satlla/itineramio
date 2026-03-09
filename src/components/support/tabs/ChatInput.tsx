'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SendHorizontal, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (content: string) => void
  sending: boolean
}

export function ChatInput({ onSend, sending }: ChatInputProps) {
  const { t } = useTranslation('support')
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const maxHeight = 96 // ~4 lines
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const handleSubmit = useCallback(() => {
    if (!value.trim() || sending) return
    onSend(value.trim())
    setValue('')
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, sending, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.placeholder')}
          disabled={sending}
          rows={1}
          className="
            flex-1 resize-none
            border border-gray-200 rounded-xl
            px-3 py-2 text-sm
            text-gray-800 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent
            disabled:opacity-50
            transition-all duration-200
          "
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || sending}
          className="
            shrink-0 w-9 h-9 rounded-xl
            bg-violet-500 hover:bg-violet-600
            text-white
            flex items-center justify-center
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            active:scale-95
          "
          aria-label={t('chat.send')}
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <SendHorizontal className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
