'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Loader2, AlertCircle, QrCode, Home, Share2, Bell, Languages, MessageCircle } from 'lucide-react'
import { useSupportChat } from '../hooks/useSupportChat'
import { ChatConversation } from './ChatConversation'

interface ChatTabProps {
  isLoggedIn: boolean
}

const FALLBACK_QUESTIONS = [
  { icon: <Home className="w-3.5 h-3.5" />, text: '¿Cómo creo mi primera propiedad?' },
  { icon: <QrCode className="w-3.5 h-3.5" />, text: '¿Cómo imprimo el código QR?' },
  { icon: <Share2 className="w-3.5 h-3.5" />, text: '¿Cómo comparto el manual con huéspedes?' },
  { icon: <Bell className="w-3.5 h-3.5" />, text: '¿Para qué sirven los avisos?' },
  { icon: <Languages className="w-3.5 h-3.5" />, text: '¿Cómo funcionan las traducciones automáticas?' },
]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  PROPERTIES: <Home className="w-3.5 h-3.5" />,
  GETTING_STARTED: <Home className="w-3.5 h-3.5" />,
  GUIDES: <QrCode className="w-3.5 h-3.5" />,
  FEATURES: <Bell className="w-3.5 h-3.5" />,
  INTEGRATIONS: <Share2 className="w-3.5 h-3.5" />,
  ACCOUNT: <Languages className="w-3.5 h-3.5" />,
  BILLING: <Languages className="w-3.5 h-3.5" />,
  GESTION: <Bell className="w-3.5 h-3.5" />,
  TROUBLESHOOTING: <MessageCircle className="w-3.5 h-3.5" />,
}

export function ChatTab({ isLoggedIn }: ChatTabProps) {
  const { t } = useTranslation('support')
  const {
    messages,
    tickets,
    currentTicketId,
    loading,
    sending,
    email,
    emailSubmitted,
    suggestWhatsApp,
    escalated,
    sendMessage,
    loadTicket,
    startNewConversation,
    escalateToAgent,
    setEmail,
    submitEmail,
  } = useSupportChat(isLoggedIn)

  const [emailError, setEmailError] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState(FALLBACK_QUESTIONS)

  useEffect(() => {
    fetch('/api/support/frequent-questions')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.questions?.length >= 3) {
          setSuggestedQuestions(
            data.questions.map((q: { question: string; category: string }) => ({
              icon: CATEGORY_ICONS[q.category] ?? <MessageCircle className="w-3.5 h-3.5" />,
              text: q.question,
            }))
          )
        }
      })
      .catch(() => {
        // Keep fallback on error
      })
  }, [])

  // Visitor needs to enter email first
  if (!isLoggedIn && !emailSubmitted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-violet-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{t('chat.title')}</h3>
        <p className="text-xs text-gray-500 mb-4 text-center">{t('chat.emailRequired')}</p>

        <div className="w-full max-w-[280px]">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const ok = submitEmail()
                if (!ok) setEmailError(true)
              }
            }}
            placeholder={t('chat.emailPlaceholder')}
            className={`
              w-full border rounded-xl px-3 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent
              ${emailError ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200'}
            `}
          />
          {emailError && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {t('chat.emailInvalid')}
            </p>
          )}
          <button
            onClick={() => {
              const ok = submitEmail()
              if (!ok) setEmailError(true)
            }}
            className="
              w-full mt-2
              bg-violet-500 hover:bg-violet-600
              text-white text-sm font-medium
              py-2.5 rounded-xl
              transition-colors duration-200
            "
          >
            {t('chat.emailSubmit')}
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading && !currentTicketId && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    )
  }

  // Active conversation (has messages)
  if (messages.length > 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ChatConversation
            messages={messages}
            sending={sending}
            suggestWhatsApp={suggestWhatsApp}
            escalated={escalated}
            onSend={sendMessage}
            onEscalate={escalateToAgent}
          />
        </div>
      </div>
    )
  }

  // Welcome view — direct chat with suggested questions
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* SofIA Welcome */}
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="shrink-0 w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-semibold">Soy SofIA</span>, tu asistente personal.
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Mi objetivo es que tu manual sea un <span className="font-semibold text-violet-600">10</span>. Pregúntame lo que necesites:
              </p>
            </div>
          </div>

          {/* Suggested questions as clickable chips */}
          <div className="pl-12 space-y-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                disabled={sending}
                className="
                  w-full text-left flex items-center gap-2.5
                  bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50
                  rounded-xl px-3 py-2
                  text-sm text-gray-700 hover:text-violet-700
                  transition-all duration-200
                  disabled:opacity-50
                  group
                "
              >
                <span className="text-gray-400 group-hover:text-violet-500 transition-colors">
                  {q.icon}
                </span>
                <span className="flex-1">{q.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Previous tickets link (subtle, only if logged in and has tickets) */}
        {isLoggedIn && tickets.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 mb-1.5">Conversaciones anteriores</p>
            <div className="space-y-1">
              {tickets.slice(0, 3).map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => loadTicket(ticket.id)}
                  className="w-full text-left text-xs text-gray-500 hover:text-violet-600 truncate py-1 transition-colors"
                >
                  {ticket.subject}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input always visible at bottom */}
      <ChatInput onSend={sendMessage} sending={sending} />
    </div>
  )
}

// Inline ChatInput to avoid circular import in welcome view
function ChatInput({ onSend, sending }: { onSend: (content: string) => void; sending: boolean }) {
  const { t } = useTranslation('support')
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (!value.trim() || sending) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <div className="border-t border-gray-200 p-3 bg-white shrink-0">
      <div className="flex items-end gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={t('chat.placeholder')}
          disabled={sending}
          className="
            flex-1
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
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
