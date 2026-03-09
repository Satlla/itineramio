'use client'

import React, { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, CheckCircle2, UserRound } from 'lucide-react'
import type { ChatMessage } from '../hooks/useSupportChat'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatInput } from './ChatInput'

interface ChatConversationProps {
  messages: ChatMessage[]
  sending: boolean
  suggestWhatsApp: boolean
  escalated: boolean
  onSend: (content: string) => void
  onEscalate: () => void
}

const WHATSAPP_LINK = 'https://wa.me/34652656440'

export function ChatConversation({
  messages,
  sending,
  suggestWhatsApp,
  escalated,
  onSend,
  onEscalate,
}: ChatConversationProps) {
  const { t } = useTranslation('support')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Show escalation block after ≥2 user messages
  const userMessageCount = messages.filter(m => m.sender === 'USER').length
  const showEscalation = userMessageCount >= 2 && !escalated

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, suggestWhatsApp, escalated])

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm text-center px-4">
            <MessageSquare className="w-8 h-8 mb-2 text-gray-300" />
            <p>{t('chat.welcome')}</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Escalated confirmation */}
        {escalated && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-2">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-700">{t('chat.escalated')}</p>
            </div>
            <p className="text-xs text-green-600">{t('chat.escalatedMessage')}</p>
          </div>
        )}

        {/* Escalation + WhatsApp block */}
        {showEscalation && (
          <div className={`rounded-xl p-3 mt-2 ${
            suggestWhatsApp
              ? 'bg-violet-50 border border-violet-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className="text-sm text-gray-600 mb-2">
              {suggestWhatsApp ? t('chat.escalateHintUrgent') : t('chat.escalateHint')}
            </p>
            <button
              onClick={onEscalate}
              className={`
                inline-flex items-center gap-2
                text-sm font-medium
                px-4 py-2 rounded-lg
                transition-colors duration-200
                ${suggestWhatsApp
                  ? 'bg-violet-500 hover:bg-violet-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                }
              `}
            >
              <UserRound className="w-4 h-4" />
              {t('chat.escalateButton')}
            </button>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t('chat.orWhatsApp')}: +34 652 656 440
            </a>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} sending={sending} />
    </div>
  )
}
