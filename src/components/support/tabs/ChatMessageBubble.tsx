'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatMessage } from '../hooks/useSupportChat'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return 'ahora'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`

  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

function renderSimpleMarkdown(text: string): React.ReactNode {
  // Split by lines and process
  const lines = text.split('\n')

  return lines.map((line, i) => {
    // Bold: **text**
    let processed: React.ReactNode = line
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    if (parts.length > 1) {
      processed = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>
        }
        return part
      })
    }

    // Links: [text](url)
    if (typeof processed === 'string') {
      const linkParts = processed.split(/(\[[^\]]+\]\([^)]+\))/g)
      if (linkParts.length > 1) {
        processed = linkParts.map((part, j) => {
          const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
          if (linkMatch) {
            return (
              <a
                key={j}
                href={linkMatch[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-violet-300 hover:text-violet-200"
              >
                {linkMatch[1]}
              </a>
            )
          }
          return part
        })
      }
    }

    // List items: - text
    if (line.trimStart().startsWith('- ')) {
      return (
        <div key={i} className="flex gap-1.5 ml-2">
          <span className="shrink-0">&#8226;</span>
          <span>{typeof processed === 'string' ? processed.replace(/^-\s/, '') : processed}</span>
        </div>
      )
    }

    return (
      <React.Fragment key={i}>
        {processed}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const { t } = useTranslation('support')

  const isUser = message.sender === 'USER'
  const isAI = message.sender === 'AI'
  const isAdmin = message.sender === 'ADMIN'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-1'}`}>
        {/* Sender badge */}
        {!isUser && (
          <div className="flex items-center gap-1 mb-0.5 ml-1">
            {isAI && (
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                IA
              </span>
            )}
            {isAdmin && (
              <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                {t('chat.adminResponse')}
              </span>
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`
            px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
            ${isUser ? 'bg-violet-500 text-white rounded-br-md' : ''}
            ${isAI ? 'bg-gray-100 text-gray-800 rounded-bl-md' : ''}
            ${isAdmin ? 'bg-blue-50 text-gray-800 rounded-bl-md border border-blue-100' : ''}
          `}
        >
          {isAI ? renderSimpleMarkdown(message.content) : message.content}
        </div>

        {/* AI disclaimer */}
        {isAI && (
          <p className="text-[10px] text-gray-400 italic mt-0.5 ml-1">
            {t('chat.aiDisclaimer')}
          </p>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-400 mt-0.5 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
          {formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
