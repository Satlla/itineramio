'use client'

import { useState, useCallback, useEffect } from 'react'

export interface ChatMessage {
  id: string
  sender: 'USER' | 'AI' | 'ADMIN'
  content: string
  createdAt: string
  aiConfidence?: number
}

export interface Ticket {
  id: string
  subject: string
  status: string
  lastMessageAt: string
  _count: { messages: number }
}

export function useSupportChat(isLoggedIn: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [suggestWhatsApp, setSuggestWhatsApp] = useState(false)
  const [escalated, setEscalated] = useState(false)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/support/tickets', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets ?? [])
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTicket = useCallback(async (ticketId: string) => {
    setLoading(true)
    setSuggestWhatsApp(false)
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCurrentTicketId(ticketId)
        setMessages(data.messages ?? [])
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'USER',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setSending(true)
    setSuggestWhatsApp(false)

    try {
      // Detect browser language
      const lang = typeof navigator !== 'undefined'
        ? (navigator.language?.split('-')[0] || 'es')
        : 'es'

      const body: Record<string, string> = {
        message: content.trim(),
        language: lang,
      }
      if (currentTicketId) body.ticketId = currentTicketId
      if (!isLoggedIn && email) body.email = email

      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()

        if (data.ticketId && !currentTicketId) {
          setCurrentTicketId(data.ticketId)
        }

        // Add AI response message
        if (data.message) {
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: 'AI',
            content: data.message,
            createdAt: new Date().toISOString(),
            aiConfidence: data.aiConfidence,
          }
          setMessages((prev) => [...prev, aiMsg])
        }

        if (data.suggestWhatsApp) {
          setSuggestWhatsApp(true)
        }
      } else {
        // Handle error response
        const errorData = await res.json().catch(() => null)
        const errorContent = errorData?.code === 'EMAIL_REQUIRED'
          ? 'Por favor, introduce tu email para continuar.'
          : 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.'

        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: 'AI',
          content: errorContent,
          createdAt: new Date().toISOString(),
          aiConfidence: 0,
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    } catch {
      // Network error — show error message
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'AI',
        content: 'Error de conexión. Por favor, inténtalo de nuevo.',
        createdAt: new Date().toISOString(),
        aiConfidence: 0,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setSending(false)
    }
  }, [currentTicketId, isLoggedIn, email])

  const escalateToAgent = useCallback(async () => {
    if (!currentTicketId || escalated) return

    try {
      const body: Record<string, string> = { ticketId: currentTicketId }
      if (!isLoggedIn && email) body.email = email

      const res = await fetch('/api/support/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setEscalated(true)
        const confirmMsg: ChatMessage = {
          id: `escalate-${Date.now()}`,
          sender: 'AI',
          content: 'Tu consulta ha sido escalada. Un miembro del equipo te responderá lo antes posible.',
          createdAt: new Date().toISOString(),
          aiConfidence: 1,
        }
        setMessages((prev) => [...prev, confirmMsg])
      }
    } catch {
      // Silently fail
    }
  }, [currentTicketId, escalated, isLoggedIn, email])

  const startNewConversation = useCallback(() => {
    setCurrentTicketId(null)
    setMessages([])
    setSuggestWhatsApp(false)
    setEscalated(false)
  }, [])

  const submitEmail = useCallback(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(email)) {
      setEmailSubmitted(true)
      return true
    }
    return false
  }, [email])

  // Load tickets on mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadTickets()
    }
  }, [isLoggedIn, loadTickets])

  // Poll for new admin messages every 15s when there's an active ticket
  useEffect(() => {
    if (!currentTicketId) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/support/tickets/${currentTicketId}`, { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const serverMessages: ChatMessage[] = data.messages ?? []
        setMessages((prev) => {
          const localAdminIds = new Set(prev.filter((m) => m.sender === 'ADMIN').map((m) => m.id))
          const newAdminMessages = serverMessages.filter(
            (m) => m.sender === 'ADMIN' && !localAdminIds.has(m.id)
          )
          if (newAdminMessages.length === 0) return prev
          return [...prev, ...newAdminMessages]
        })
      } catch {
        // Silently fail
      }
    }

    const interval = setInterval(poll, 15_000)
    return () => clearInterval(interval)
  }, [currentTicketId])

  return {
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
    loadTickets,
    startNewConversation,
    escalateToAgent,
    setEmail,
    submitEmail,
  }
}
