'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Bot,
  User,
  ChevronDown,
  AlertCircle,
  Loader2,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { ChatBubble } from './chatbot/ChatBubble'
import { ChatInput } from './chatbot/ChatInput'
import { ChatDemoBanner } from './chatbot/ChatDemoBanner'
import { ChatEmailOverlay } from './chatbot/ChatEmailOverlay'

interface MediaItem {
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption?: string
}

interface RecommendationCard {
  name: string
  address: string
  rating: number | null
  distance: string | null
  walkMinutes: number | null
  photoUrl: string | null
  category: string
  categoryIcon: string
  mapsUrl: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  typing?: boolean
  media?: MediaItem[]
  recommendations?: RecommendationCard[]
}

interface ChatBotProps {
  propertyId: string
  zoneId?: string
  zoneName?: string
  propertyName: string
  language?: 'es' | 'en' | 'fr'
  hostContact?: {
    name: string
    phone: string
    email: string
  }
  className?: string
  isDemoMode?: boolean
}

interface FAQ {
  question: string
  answer: string
  category: string
}

const i18n: Record<string, Record<string, string>> = {
  es: {
    header: 'Asistente IA',
    welcomeZone: '¡Hola! Soy tu asistente virtual para {propertyName}. Estoy aquí para ayudarte con cualquier pregunta sobre {zoneName} y tu estancia. ¿En qué puedo ayudarte?',
    welcomeProperty: '¡Hola! Soy tu asistente virtual para {propertyName}. Puedo ayudarte con cualquier pregunta sobre el alojamiento, check-in, servicios y más. ¿En qué puedo ayudarte?',
    placeholder: 'Escribe tu pregunta...',
    typing: 'Escribiendo...',
    errorMessage: 'Lo siento, hubo un error técnico. Por favor, intenta de nuevo o contacta directamente al anfitrión.',
    errorBanner: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.',
    rateLimited: 'Has enviado demasiados mensajes. Por favor, espera un momento antes de enviar otro.',
    faqTitle: 'Preguntas frecuentes:',
    contactWhatsApp: 'Contactar por WhatsApp',
    faq1q: '¿Cómo puedo contactar al anfitrión?',
    faq1a: 'Puedes contactar al anfitrión a través del teléfono o email proporcionado en la información de contacto.',
    faq2q: '¿Dónde está la Wi-Fi?',
    faq2a: 'La información de Wi-Fi se encuentra generalmente en la zona de bienvenida o recepción. Busca las instrucciones específicas en los pasos de la zona correspondiente.',
    faq3q: '¿Cómo funciona el check-in?',
    faq3a: 'Las instrucciones de check-in están detalladas en la zona de acceso. Sigue los pasos numerados para completar tu llegada.',
    faq4q: '¿Hay parking disponible?',
    faq4a: 'La información sobre parking está disponible en las instrucciones específicas de la propiedad. Revisa las zonas de acceso o servicios.',
    emailPrompt: '¿Te gustaría recibir recomendaciones durante tu estancia?',
    emailPlaceholder: 'tu@email.com',
    namePlaceholder: 'Tu nombre (opcional)',
    emailSubmit: 'Enviar',
    emailSkip: 'Ahora no',
    emailSuccess: '¡Gracias! Te enviaremos recomendaciones útiles.',
    emailError: 'Error al enviar. Inténtalo de nuevo.',
    welcomeBubble: '¡Hola! Soy el asistente de {propertyName} 👋 Si tienes alguna duda durante tu estancia, puedes consultarme aquí.',
    welcomeBubbleSuggestions: 'Cómo hacer check-in|Clave del WiFi|Qué visitar|Restaurantes cerca',
    welcomeBubbleDismiss: 'En otro momento',
    demoWelcome: '¡Hola! Soy el asistente IA de {propertyName}. Tus huespedes pueden preguntarme cualquier cosa sobre tu alojamiento, 24/7, en 3 idiomas.\n\nPruebame: preguntame donde esta el WiFi, como funciona el check-in, o que restaurantes hay cerca',
    demoBannerText: 'Imagina que tus huespedes tienen esto 24/7. Sin llamadas a las 3 AM, sin repetir las mismas instrucciones.',
    demoBannerCta: 'Activar mi chatbot IA',
  },
  en: {
    header: 'AI Assistant',
    welcomeZone: 'Hello! I\'m your virtual assistant for {propertyName}. I\'m here to help you with any questions about {zoneName} and your stay. How can I help you?',
    welcomeProperty: 'Hello! I\'m your virtual assistant for {propertyName}. I can help you with any questions about the accommodation, check-in, services and more. How can I help you?',
    placeholder: 'Type your question...',
    typing: 'Typing...',
    errorMessage: 'Sorry, there was a technical error. Please try again or contact the host directly.',
    errorBanner: 'Sorry, there was an error processing your query. Please try again.',
    rateLimited: 'You\'ve sent too many messages. Please wait a moment before sending another.',
    faqTitle: 'Frequently asked questions:',
    contactWhatsApp: 'Contact via WhatsApp',
    faq1q: 'How can I contact the host?',
    faq1a: 'You can contact the host through the phone or email provided in the contact information.',
    faq2q: 'Where is the Wi-Fi?',
    faq2a: 'Wi-Fi information is usually found in the welcome or reception zone. Look for specific instructions in the steps of the corresponding zone.',
    faq3q: 'How does check-in work?',
    faq3a: 'Check-in instructions are detailed in the access zone. Follow the numbered steps to complete your arrival.',
    faq4q: 'Is parking available?',
    faq4a: 'Parking information is available in the specific property instructions. Check the access or services zones.',
    emailPrompt: 'Would you like to receive recommendations during your stay?',
    emailPlaceholder: 'you@email.com',
    namePlaceholder: 'Your name (optional)',
    emailSubmit: 'Send',
    emailSkip: 'Not now',
    emailSuccess: 'Thank you! We\'ll send you useful recommendations.',
    emailError: 'Error sending. Please try again.',
    welcomeBubble: 'Hello! I\'m the assistant for {propertyName} 👋 If you have any questions during your stay, you can ask me here.',
    welcomeBubbleSuggestions: 'How to check in|WiFi password|What to visit|Restaurants nearby',
    welcomeBubbleDismiss: 'Maybe later',
    demoWelcome: 'Hello! I\'m the AI assistant for {propertyName}. Your guests can ask me anything about your accommodation, 24/7, in 3 languages.\n\nTry me: ask where the WiFi is, how check-in works, or what restaurants are nearby',
    demoBannerText: 'Imagine your guests having this 24/7. No calls at 3 AM, no repeating the same instructions.',
    demoBannerCta: 'Activate my AI chatbot',
  },
  fr: {
    header: 'Assistant IA',
    welcomeZone: 'Bonjour ! Je suis votre assistant virtuel pour {propertyName}. Je suis là pour vous aider avec toute question sur {zoneName} et votre séjour. Comment puis-je vous aider ?',
    welcomeProperty: 'Bonjour ! Je suis votre assistant virtuel pour {propertyName}. Je peux vous aider avec toute question sur l\'hébergement, l\'enregistrement, les services et plus encore. Comment puis-je vous aider ?',
    placeholder: 'Écrivez votre question...',
    typing: 'En train d\'écrire...',
    errorMessage: 'Désolé, une erreur technique s\'est produite. Veuillez réessayer ou contacter directement l\'hôte.',
    errorBanner: 'Désolé, une erreur s\'est produite lors du traitement de votre demande. Veuillez réessayer.',
    rateLimited: 'Vous avez envoyé trop de messages. Veuillez attendre un moment avant d\'en envoyer un autre.',
    faqTitle: 'Questions fréquentes :',
    contactWhatsApp: 'Contacter via WhatsApp',
    faq1q: 'Comment contacter l\'hôte ?',
    faq1a: 'Vous pouvez contacter l\'hôte par téléphone ou email fournis dans les coordonnées.',
    faq2q: 'Où est le Wi-Fi ?',
    faq2a: 'Les informations Wi-Fi se trouvent généralement dans la zone d\'accueil ou de réception. Recherchez les instructions spécifiques dans les étapes de la zone correspondante.',
    faq3q: 'Comment fonctionne l\'enregistrement ?',
    faq3a: 'Les instructions d\'enregistrement sont détaillées dans la zone d\'accès. Suivez les étapes numérotées pour compléter votre arrivée.',
    faq4q: 'Y a-t-il un parking disponible ?',
    faq4a: 'Les informations de parking sont disponibles dans les instructions spécifiques de la propriété. Consultez les zones d\'accès ou de services.',
    emailPrompt: 'Souhaitez-vous recevoir des recommandations pendant votre séjour ?',
    emailPlaceholder: 'vous@email.com',
    namePlaceholder: 'Votre nom (optionnel)',
    emailSubmit: 'Envoyer',
    emailSkip: 'Pas maintenant',
    emailSuccess: 'Merci ! Nous vous enverrons des recommandations utiles.',
    emailError: 'Erreur d\'envoi. Veuillez réessayer.',
    welcomeBubble: 'Bonjour ! Je suis l\'assistant de {propertyName} 👋 Si vous avez des questions pendant votre séjour, vous pouvez me consulter ici.',
    welcomeBubbleSuggestions: 'Comment faire le check-in|Mot de passe WiFi|Que visiter|Restaurants à proximité',
    welcomeBubbleDismiss: 'Plus tard',
    demoWelcome: 'Bonjour ! Je suis l\'assistant IA de {propertyName}. Vos invites peuvent me poser n\'importe quelle question sur votre hebergement, 24h/24, en 3 langues.\n\nEssayez-moi : demandez-moi ou se trouve le WiFi, comment fonctionne l\'enregistrement, ou quels restaurants se trouvent a proximite',
    demoBannerText: 'Imaginez que vos invites aient ceci 24h/24. Plus d\'appels a 3h du matin, plus de repetitions des memes instructions.',
    demoBannerCta: 'Activer mon chatbot IA',
  }
}

function t(key: string, lang: string, replacements: Record<string, string> = {}): string {
  let text = i18n[lang]?.[key] || i18n.es[key] || key
  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replace(`{${placeholder}}`, value)
  }
  return text
}

function getFAQs(lang: string): FAQ[] {
  return [
    { question: t('faq1q', lang), answer: t('faq1a', lang), category: 'contacto' },
    { question: t('faq2q', lang), answer: t('faq2a', lang), category: 'servicios' },
    { question: t('faq3q', lang), answer: t('faq3a', lang), category: 'proceso' },
    { question: t('faq4q', lang), answer: t('faq4a', lang), category: 'servicios' },
  ]
}

function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default function ChatBot({
  propertyId,
  zoneId,
  zoneName,
  propertyName,
  language = 'es',
  hostContact,
  className = '',
  isDemoMode = false,
}: ChatBotProps) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false)
  // dismissingBubble moved to ChatBubble component
  const chatButtonRef = useRef<HTMLButtonElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFAQs, setShowFAQs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Demo promotion state
  const [showDemoBanner, setShowDemoBanner] = useState(false)

  // Email collection state
  const [showEmailOverlay, setShowEmailOverlay] = useState(false)
  const [emailCollected, setEmailCollected] = useState(false)
  const [emailDismissed, setEmailDismissed] = useState(false)
  // emailInput, nameInput, emailSubmitting, emailError, emailSuccess moved to ChatEmailOverlay

  // Session tracking — restore from localStorage if available
  const storageKey = `chatbot-${propertyId}${zoneId ? `-${zoneId}` : ''}`
  const sessionIdRef = useRef<string>('')
  if (!sessionIdRef.current) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`${storageKey}-session`) : null
    sessionIdRef.current = saved || generateSessionId()
  }
  const userMessageCountRef = useRef(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const lang = language || 'es'

  // Check if chatbot is enabled for this property (beta restriction)
  useEffect(() => {
    fetch('/api/chatbot/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
      .then(res => setIsEnabled(res.ok))
      .catch(() => setIsEnabled(false))
  }, [propertyId])

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      const toSave = messages.filter(m => !m.typing).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        media: m.media
      }))
      localStorage.setItem(`${storageKey}-messages`, JSON.stringify(toSave))
      localStorage.setItem(`${storageKey}-session`, sessionIdRef.current)
    }
  }, [messages, storageKey])

  const trackEvent = async (event: string, data: any) => {
    try {
      await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data })
      })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Show welcome bubble after 3 seconds (only once per session, only if chat not already opened)
  useEffect(() => {
    if (isEnabled === false || isOpen) return
    const welcomeKey = `chatbot-welcome-${propertyId}`
    const alreadyShown = typeof window !== 'undefined' && sessionStorage.getItem(welcomeKey)
    if (alreadyShown) return

    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowWelcomeBubble(true)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(welcomeKey, '1')
        }
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [isEnabled, propertyId, isOpen])

  // Show demo banner after first user message in demo mode
  useEffect(() => {
    if (isDemoMode && userMessageCountRef.current >= 1 && !showDemoBanner) {
      const timer = setTimeout(() => setShowDemoBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [messages, isDemoMode, showDemoBanner])

  // Show email overlay after 3 user messages (skip in demo mode and when logged in)
  useEffect(() => {
    const loggedIn = document.cookie.split(';').some(c => c.trim().startsWith('auth-token='))
    if (!isDemoMode && !loggedIn && userMessageCountRef.current >= 3 && !emailCollected && !emailDismissed && !showEmailOverlay) {
      setShowEmailOverlay(true)
    }
  }, [messages, emailCollected, emailDismissed, showEmailOverlay, isDemoMode])

  const initializeChat = () => {
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}-messages`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as any[]
          if (parsed.length > 0) {
            const restored = parsed.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
            setMessages(restored)
            setShowFAQs(false)
            // Restore message count for email overlay logic
            userMessageCountRef.current = restored.filter((m: any) => m.role === 'user').length
            return
          }
        } catch { /* ignore corrupt data */ }
      }
    }

    const welcomeKey = isDemoMode ? 'demoWelcome' : (zoneId && zoneName ? 'welcomeZone' : 'welcomeProperty')
    const welcomeContent = t(welcomeKey, lang, {
      propertyName,
      zoneName: zoneName || ''
    })

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    setShowFAQs(true)
  }

  const handleWelcomeSuggestion = (suggestion: string) => {
    setShowWelcomeBubble(false)
    setIsOpen(true)
    if (messages.length === 0) {
      initializeChat()
    }
    // Send the suggestion as a message after chat opens
    setTimeout(() => {
      setCurrentMessage(suggestion)
      setTimeout(() => sendMessage(suggestion), 100)
    }, 400)
  }

  const handleOpen = () => {
    setShowWelcomeBubble(false)
    setIsOpen(true)
    if (messages.length === 0) {
      initializeChat()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const sendMessage = async (overrideMessage?: string) => {
    const messageText = overrideMessage || currentMessage.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)
    setError(null)
    setShowFAQs(false)
    userMessageCountRef.current += 1

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      content: t('typing', lang),
      timestamp: new Date(),
      typing: true
    }
    setMessages(prev => [...prev, typingMessage])

    // Abort after 55s to prevent hanging forever in production
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 55000)

    try {
      const body: Record<string, any> = {
        message: userMessage.content,
        propertyId,
        propertyName,
        language: lang,
        conversationHistory: messages.filter(m => !m.typing).slice(-10).map(m => ({ role: m.role, content: m.content })),
        sessionId: sessionIdRef.current
      }

      // Only send zoneId/zoneName when available
      if (zoneId) body.zoneId = zoneId
      if (zoneName) body.zoneName = zoneName

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (response.status === 429) {
        throw new Error('rate_limited')
      }

      if (!response.ok) {
        throw new Error('api_error')
      }

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('text/event-stream')) {
        // Streaming response — read tokens progressively
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const streamMsgId = Date.now().toString()
        let streamedContent = ''
        let streamMedia: MediaItem[] | undefined
        let streamRecommendations: RecommendationCard[] | undefined

        // Replace typing indicator with empty assistant message
        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing)
          return [...filtered, { id: streamMsgId, role: 'assistant' as const, content: '', timestamp: new Date() }]
        })

        if (reader) {
          let buffer = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const dataStr = line.replace('data: ', '').trim()
              if (!dataStr) continue
              try {
                const parsed = JSON.parse(dataStr)
                if (parsed.token) {
                  streamedContent += parsed.token
                  const currentContent = streamedContent
                  setMessages(prev => prev.map(m =>
                    m.id === streamMsgId ? { ...m, content: currentContent } : m
                  ))
                }
                if (parsed.done) {
                  streamMedia = parsed.media
                  streamRecommendations = parsed.recommendations
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }

        clearTimeout(timeout)

        // Set final content with media and recommendations
        const finalContent = streamedContent
        const finalMedia = streamMedia
        const finalRecommendations = streamRecommendations
        setMessages(prev => prev.map(m =>
          m.id === streamMsgId ? { ...m, content: finalContent, media: finalMedia, recommendations: finalRecommendations } : m
        ))

        trackEvent('chatbot_interaction', {
          zoneId, propertyId, zoneName, propertyName,
          type: 'message', query: userMessage.content,
          response: finalContent, language: lang
        })
      } else {
        // Non-streaming fallback response
        clearTimeout(timeout)
        const data = await response.json()

        trackEvent('chatbot_interaction', {
          zoneId, propertyId, zoneName, propertyName,
          type: 'message', query: userMessage.content,
          response: data.response, language: lang
        })

        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing)
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
            media: data.media || undefined,
            recommendations: data.recommendations || undefined,
          }
          return [...filtered, assistantMessage]
        })
      }

    } catch (error: any) {
      clearTimeout(timeout)
      console.error('Chatbot error:', error)

      // If user got partial content before abort/error, keep it instead of showing error
      const isAbort = error?.name === 'AbortError'
      const isRateLimited = error?.message === 'rate_limited'

      // Check if we already have a streamed partial response
      const hasPartialResponse = !isRateLimited && messages.some(m =>
        !m.typing && m.role === 'assistant' && m.content.length > 20
      )

      if (hasPartialResponse && isAbort) {
        // Partial content exists — just remove typing indicator, don't add error
        setMessages(prev => prev.filter(m => !m.typing))
      } else {
        setError(isRateLimited ? t('rateLimited', lang) : t('errorBanner', lang))

        // Remove typing indicator and add error message
        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing)
          const errorMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: isRateLimited ? t('rateLimited', lang) : t('errorMessage', lang),
            timestamp: new Date()
          }
          return [...filtered, errorMsg]
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFAQClick = (faq: FAQ) => {
    // Send FAQ through AI instead of returning canned answer
    setCurrentMessage(faq.question)
    setShowFAQs(false)
    // Use a small delay so the state updates before sending
    setTimeout(() => {
      const fakeEvent = { key: 'Enter', shiftKey: false, preventDefault: () => {} } as React.KeyboardEvent
      // Directly trigger sendMessage with the FAQ question
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: faq.question,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setCurrentMessage('')
      setIsLoading(true)
      setError(null)
      userMessageCountRef.current += 1

      const typingMessage: Message = {
        id: `typing-${Date.now()}`,
        role: 'assistant',
        content: t('typing', lang),
        timestamp: new Date(),
        typing: true
      }
      setMessages(prev => [...prev, typingMessage])

      const body: Record<string, any> = {
        message: faq.question,
        propertyId,
        propertyName,
        language: lang,
        conversationHistory: messages.filter(m => !m.typing).slice(-10).map(m => ({ role: m.role, content: m.content })),
        sessionId: sessionIdRef.current
      }
      if (zoneId) body.zoneId = zoneId
      if (zoneName) body.zoneName = zoneName

      const faqController = new AbortController()
      const faqTimeout = setTimeout(() => faqController.abort(), 55000)

      fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: faqController.signal,
      }).then(async (response) => {
        if (response.status === 429) throw new Error('rate_limited')
        if (!response.ok) throw new Error('api_error')

        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('text/event-stream')) {
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          const streamMsgId = Date.now().toString()
          let streamedContent = ''
          let streamMedia: MediaItem[] | undefined
          let streamRecommendations: RecommendationCard[] | undefined

          setMessages(prev => {
            const filtered = prev.filter(m => !m.typing)
            return [...filtered, { id: streamMsgId, role: 'assistant' as const, content: '', timestamp: new Date() }]
          })

          if (reader) {
            let buffer = ''
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n\n')
              buffer = lines.pop() || ''
              for (const line of lines) {
                const dataStr = line.replace('data: ', '').trim()
                if (!dataStr) continue
                try {
                  const parsed = JSON.parse(dataStr)
                  if (parsed.token) {
                    streamedContent += parsed.token
                    const currentContent = streamedContent
                    setMessages(prev => prev.map(m =>
                      m.id === streamMsgId ? { ...m, content: currentContent } : m
                    ))
                  }
                  if (parsed.done) {
                    streamMedia = parsed.media
                    streamRecommendations = parsed.recommendations
                  }
                } catch { /* skip */ }
              }
            }
          }

          setMessages(prev => prev.map(m =>
            m.id === streamMsgId ? { ...m, content: streamedContent, media: streamMedia, recommendations: streamRecommendations } : m
          ))
        } else {
          const data = await response.json()
          setMessages(prev => {
            const filtered = prev.filter(m => !m.typing)
            return [...filtered, {
              id: Date.now().toString(),
              role: 'assistant' as const,
              content: data.response,
              timestamp: new Date(),
              media: data.media || undefined,
              recommendations: data.recommendations || undefined,
            }]
          })
        }
      }).catch((error: any) => {
        const isRateLimited = error?.message === 'rate_limited'
        setError(isRateLimited ? t('rateLimited', lang) : t('errorBanner', lang))
        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing)
          return [...filtered, {
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: isRateLimited ? t('rateLimited', lang) : t('errorMessage', lang),
            timestamp: new Date()
          }]
        })
      }).finally(() => {
        clearTimeout(faqTimeout)
        setIsLoading(false)
      })
    }, 0)
  }

  const handleWhatsApp = () => {
    if (hostContact?.phone) {
      const subject = zoneName
        ? `${propertyName} - ${zoneName}`
        : propertyName
      const greeting = lang === 'en' ? 'Hello' : lang === 'fr' ? 'Bonjour' : 'Hola'
      const question = lang === 'en' ? 'I have a question about' : lang === 'fr' ? 'J\'ai une question sur' : 'tengo una consulta sobre'
      const message = encodeURIComponent(`${greeting}, ${question} ${subject}`)
      window.open(`https://wa.me/${hostContact.phone.replace(/[^\d]/g, '')}?text=${message}`, '_blank')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const faqs = getFAQs(lang)

  // Don't render chatbot if not enabled for this property
  if (isEnabled === false) return null

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <div className={`fixed z-50 ${className || 'bottom-4 right-4 sm:bottom-6 sm:right-6'}`} id="demo-chatbot-btn">
            {/* Demo glow ring */}
            {isDemoMode && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-md"
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <motion.button
              ref={chatButtonRef}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="relative w-14 h-14 bg-black text-white rounded-2xl shadow-xl hover:shadow-2xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>
            {/* Demo tooltip badge */}
            {isDemoMode && !isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 10 }}
                className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-gray-700 pointer-events-none"
              >
                Pruebalo: pregunta algo a tu asistente IA
                <div className="absolute -bottom-1 right-5 w-2 h-2 bg-gray-900 border-b border-r border-gray-700 rotate-45" />
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Welcome Bubble */}
      <AnimatePresence>
        {showWelcomeBubble && !isOpen && (
          <ChatBubble
            propertyName={propertyName}
            welcomeText={t('welcomeBubble', lang, { propertyName })}
            suggestions={t('welcomeBubbleSuggestions', lang).split('|')}
            dismissText={t('welcomeBubbleDismiss', lang)}
            headerText={t('header', lang)}
            className={className ? className.replace(/bottom-\d+/, 'bottom-40').replace(/sm:bottom-\d+/, 'sm:bottom-28') : 'bottom-40 right-4 sm:bottom-28 sm:right-6'}
            onSuggestionClick={handleWelcomeSuggestion}
            onDismiss={() => setShowWelcomeBubble(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bg-white z-50 overflow-hidden flex flex-col
              max-sm:inset-0 max-sm:rounded-none
              sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-100
              ${isMinimized
                ? 'sm:w-[380px] sm:h-16'
                : 'sm:w-[380px] sm:h-[520px]'
              } ${className || 'sm:bottom-6 sm:right-6'}`}
          >
            {/* Header */}
            <div className="bg-black text-white px-5 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-white/40 font-semibold uppercase tracking-[0.15em]">{t('header', lang)}</p>
                    <h3 className="font-semibold text-base leading-snug mt-0.5 line-clamp-2">{propertyName}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-3">
                  <button
                    onClick={handleMinimize}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 relative min-h-0">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {message.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        </div>
                        <div>
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                              message.role === 'user'
                                ? 'bg-black text-white'
                                : 'bg-gray-50 text-gray-800 border border-gray-100'
                            }`}
                          >
                            {message.typing ? (
                              <div className="flex items-center space-x-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{message.content}</span>
                              </div>
                            ) : (
                              <div className="chatbot-markdown prose prose-sm max-w-none">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                    a: ({ href, children }) => (
                                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-black underline hover:text-gray-600">
                                        {children}
                                      </a>
                                    ),
                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
                                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                                    img: ({ src, alt }) => (
                                      <img src={src} alt={alt || ''} loading="lazy" className="rounded-lg max-h-40 w-full object-cover my-1" />
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>

                          {/* Rich Media */}
                          {message.media && message.media.length > 0 && (
                            <div className="mt-2 space-y-2 max-w-[280px]">
                              {message.media.map((item, idx) => (
                                <div key={idx} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                  {item.type === 'IMAGE' ? (
                                    <img
                                      src={item.url}
                                      alt={item.caption || ''}
                                      loading="lazy"
                                      className="w-full h-auto max-h-40 object-cover"
                                    />
                                  ) : (
                                    <video
                                      controls
                                      preload="metadata"
                                      playsInline
                                      className="w-full max-h-48"
                                    >
                                      <source src={item.url} type="video/mp4" />
                                      <source src={item.url} type="video/webm" />
                                    </video>
                                  )}
                                  {item.caption && (
                                    <p className="text-[11px] text-gray-500 px-2.5 py-1.5 bg-gray-50">{item.caption}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Recommendation Cards */}
                          {message.recommendations && message.recommendations.length > 0 && (
                            <div className="mt-2 space-y-1.5 max-w-[300px]">
                              {message.recommendations.map((rec, idx) => (
                                <a
                                  key={idx}
                                  href={rec.mapsUrl || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer no-underline"
                                >
                                  {rec.photoUrl ? (
                                    <img
                                      src={rec.photoUrl}
                                      alt={rec.name}
                                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                                      <span className="text-lg">📍</span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-gray-900 truncate leading-tight">{rec.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      {rec.rating && (
                                        <span className="text-[11px] text-amber-600 font-medium">★ {rec.rating}</span>
                                      )}
                                      {rec.distance && (
                                        <span className="text-[11px] text-gray-400">
                                          {rec.rating ? '· ' : ''}{rec.distance}
                                          {rec.walkMinutes ? ` · ${rec.walkMinutes} min 🚶` : ''}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* FAQ Suggestions */}
                  {showFAQs && messages.length <= 1 && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{t('faqTitle', lang)}</p>
                      {faqs.slice(0, 3).map((faq, index) => (
                        <button
                          key={index}
                          onClick={() => handleFAQClick(faq)}
                          className="w-full text-left px-3 py-2.5 text-[13px] text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors"
                        >
                          {faq.question}
                        </button>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />

                  {/* Demo Conversion Banner */}
                  <AnimatePresence>
                    {isDemoMode && showDemoBanner && (
                      <ChatDemoBanner
                        text={t('demoBannerText', lang)}
                        ctaText={t('demoBannerCta', lang)}
                      />
                    )}
                  </AnimatePresence>

                  {/* Email Collection Banner (non-blocking) */}
                  <AnimatePresence>
                    {showEmailOverlay && !emailCollected && (
                      <ChatEmailOverlay
                        propertyId={propertyId}
                        sessionId={sessionIdRef.current}
                        lang={lang}
                        translations={{
                          success: t('emailSuccess', lang),
                          prompt: t('emailPrompt', lang),
                          emailPlaceholder: t('emailPlaceholder', lang),
                          namePlaceholder: t('namePlaceholder', lang),
                          error: t('emailError', lang),
                          submit: t('emailSubmit', lang),
                          skip: t('emailSkip', lang),
                        }}
                        onCollected={() => { setEmailCollected(true); setShowEmailOverlay(false) }}
                        onDismiss={() => { setEmailDismissed(true); setShowEmailOverlay(false) }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Input */}
                <ChatInput
                  value={currentMessage}
                  onChange={setCurrentMessage}
                  onSend={sendMessage}
                  onKeyDown={handleKeyPress}
                  isLoading={isLoading}
                  placeholder={t('placeholder', lang)}
                  inputRef={inputRef}
                  hostPhone={hostContact?.phone}
                  onWhatsAppClick={handleWhatsApp}
                  whatsAppLabel={t('contactWhatsApp', lang)}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
