'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'

// Safe localStorage/sessionStorage helpers — survive Safari private mode
function safeGetItem(storage: 'local' | 'session', key: string): string | null {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage
    return store.getItem(key)
  } catch {
    return null
  }
}
function safeSetItem(storage: 'local' | 'session', key: string, value: string): void {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage
    store.setItem(key, value)
  } catch {
    // ignore — chat state simply won't persist in this session
  }
}

// Simple markdown renderer — replaces react-markdown to avoid Safari/v10 ESM issues
function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let remaining = text
  let k = 0
  while (remaining.length > 0) {
    // Bold **text** — [^*]+ allows any char except asterisk (handles spaces, accents, etc.)
    const bold = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*/)
    if (bold && bold[2].trim()) {
      if (bold[1]) result.push(<React.Fragment key={`${keyPrefix}-t${k++}`}>{bold[1]}</React.Fragment>)
      result.push(<strong key={`${keyPrefix}-b${k++}`} className="font-bold text-gray-900">{bold[2]}</strong>)
      remaining = remaining.slice(bold[0].length)
      continue
    }
    // Link [text](url) — greedy URL capture handles query params and tokens
    // Uses [^)]* but stops at last ) to handle nested parens in some URLs
    const link = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]*(?:\([^)]*\)[^)]*)*)\)/)
    if (link) {
      if (link[1]) result.push(<React.Fragment key={`${keyPrefix}-t${k++}`}>{link[1]}</React.Fragment>)
      const url = link[3]
      // Detect video by path segment before query string
      const pathPart = url.split('?')[0].split('#')[0]
      const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(pathPart)
      if (isVideo) {
        result.push(
          <video key={`${keyPrefix}-v${k++}`} src={url} controls playsInline
            className="rounded-lg w-full max-h-48 mt-1 mb-1 bg-black"
            style={{ display: 'block' }}
          />
        )
      } else {
        result.push(<a key={`${keyPrefix}-l${k++}`} href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline break-all">{link[2]}</a>)
      }
      remaining = remaining.slice(link[0].length)
      continue
    }
    // Italic *text* — only single asterisks, not touching bold
    const italic = remaining.match(/^([\s\S]*?)\*([^*]+)\*/)
    if (italic && italic[2].trim()) {
      if (italic[1]) result.push(<React.Fragment key={`${keyPrefix}-t${k++}`}>{italic[1]}</React.Fragment>)
      result.push(<em key={`${keyPrefix}-i${k++}`}>{italic[2]}</em>)
      remaining = remaining.slice(italic[0].length)
      continue
    }
    result.push(<React.Fragment key={`${keyPrefix}-t${k++}`}>{remaining}</React.Fragment>)
    break
  }
  return result
}

function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // HR
    if (/^[-*_]{3,}$/.test(line.trim())) {
      nodes.push(<hr key={i} className="border-gray-200 my-1" />)
      i++; continue
    }
    // Bullet list
    if (/^[-•]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-•]\s/, ''))
        i++
      }
      nodes.push(<ul key={`ul-${i}`} className="list-disc pl-4 my-1 space-y-0.5">{items.map((it, j) => <li key={`ul-${i}-${j}-${it.slice(0,8)}`}>{parseInline(it, `ul-${i}-${j}`)}</li>)}</ul>)
      continue
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      nodes.push(<ol key={`ol-${i}`} className="list-decimal pl-4 my-1 space-y-0.5">{items.map((it, j) => <li key={`ol-${i}-${j}-${it.slice(0,8)}`}>{parseInline(it, `ol-${i}-${j}`)}</li>)}</ol>)
      continue
    }
    // Empty line
    if (line.trim() === '') {
      if (nodes.length > 0) nodes.push(<div key={`br-${i}`} className="h-1" />)
      i++; continue
    }
    // Normal paragraph
    nodes.push(<p key={i} className="mb-0.5">{parseInline(line, `p-${i}`)}</p>)
    i++
  }
  return <>{nodes}</>
}
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

// Serializer seguro: maneja ciclos y Dates para evitar el crash de JSON.stringify
function safeStringify(obj: unknown): string {
  const seen = new WeakSet()
  return JSON.stringify(obj, (_key, value) => {
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
    }
    return value
  })
}

interface MediaItem {
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption?: string
  stepText?: string
  stepIndex?: number
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
  hostPhoto?: string | null
  hostName?: string | null
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
    rateLimited: 'Has enviado demasiados mensajes esta hora. Por favor, espera un momento o contacta directamente con el anfitrión.',
    rateLimitedDaily: 'Has alcanzado el límite de mensajes por hoy. Por favor, contacta directamente con el anfitrión.',
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
  hostPhoto,
  hostName,
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

  // Session tracking — restore from localStorage if available
  const storageKey = `chatbot-${propertyId}${zoneId ? `-${zoneId}` : ''}`
  const sessionIdRef = useRef<string>('')
  if (!sessionIdRef.current) {
    const saved = typeof window !== 'undefined' ? safeGetItem('local', `${storageKey}-session`) : null
    sessionIdRef.current = saved || generateSessionId()
  }
  const userMessageCountRef = useRef(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeControllerRef = useRef<AbortController | null>(null)

  const [lang, setLang] = useState<'es' | 'en' | 'fr'>(language || 'es')
  const prevLangRef = useRef<string>(language || 'es')

  // Sync lang when parent changes language prop — reset chat on language change
  useEffect(() => {
    if (!language) return
    if (language === prevLangRef.current) return
    prevLangRef.current = language
    setLang(language as 'es' | 'en' | 'fr')

    // Clear old messages and show welcome in new language
    const welcomeKey = isDemoMode ? 'demoWelcome' : (zoneId && zoneName ? 'welcomeZone' : 'welcomeProperty')
    const welcomeContent = t(welcomeKey, language as 'es' | 'en' | 'fr', { propertyName, zoneName: zoneName || '' })
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date()
    }])
    setShowFAQs(true)
    // Clear persisted messages so they don't restore in old language
    safeSetItem('local', `${storageKey}-messages`, '')
  }, [language])

  // Check if chatbot is enabled for this property (beta restriction)
  useEffect(() => {
    fetch('/api/chatbot/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
      .then(res => res.json().then(data => setIsEnabled(data.enabled === true)).catch(() => setIsEnabled(false)))
      .catch(() => setIsEnabled(false)) // Network error → hide (chatbot en modo restringido)
  }, [propertyId])

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      try {
        const toSave = messages.filter(m => !m.typing).map(m => ({
          id: m.id,
          role: m.role,
          content: typeof m.content === 'string' ? m.content : '',
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
          media: Array.isArray(m.media) ? m.media.map(item => ({
            type: item.type,
            url: item.url,
            caption: item.caption
          })) : undefined
        }))
        safeSetItem('local', `${storageKey}-messages`, JSON.stringify(toSave))
        safeSetItem('local', `${storageKey}-session`, sessionIdRef.current)
      } catch { /* ignore serialization errors — chat history simply won't persist */ }
    }
  }, [messages, storageKey])

  const trackEvent = async (event: string, data: any) => {
    try {
      await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify({ event, data })
      })
    } catch (error) {
      // tracking error suppressed
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

  // Listen for demo onboarding requesting to open the chatbot
  useEffect(() => {
    if (!isDemoMode) return
    const handler = () => {
      setIsOpen(true)
      setShowWelcomeBubble(false)
    }
    window.addEventListener('demo:open-chatbot', handler)
    return () => window.removeEventListener('demo:open-chatbot', handler)
  }, [isDemoMode])

  // Show welcome bubble after 3 seconds (only once per session, only if chat not already opened)
  useEffect(() => {
    if (isEnabled !== true || isOpen) return
    const welcomeKey = `chatbot-welcome-${propertyId}`
    const alreadyShown = typeof window !== 'undefined' && safeGetItem('session', welcomeKey)
    if (alreadyShown) return

    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowWelcomeBubble(true)
        if (typeof window !== 'undefined') {
          safeSetItem('session', welcomeKey, '1')
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

  const initializeChat = () => {
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const saved = safeGetItem('local', `${storageKey}-messages`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as any[]
          if (parsed.length > 0) {
            const restored = parsed.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: typeof m.content === 'string' ? m.content : '',
              timestamp: new Date(m.timestamp),
              media: m.media
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
    // Strip invisible/zero-width chars that iOS keyboards inject (e.g. \u200B zero-width space)
    // These pass trim() but render as empty bubbles.
    const messageText = (overrideMessage || currentMessage)
      .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060]/g, '')
      .trim()
    if (!messageText || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    // Cancelar cualquier llamada anterior en curso
    if (activeControllerRef.current) {
      activeControllerRef.current.abort()
      activeControllerRef.current = null
    }

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
    activeControllerRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 55000)

    // Tracks how much of the CURRENT message has been streamed (for error recovery)
    let currentStreamedChars = 0

    const isDev = process.env.NODE_ENV === 'development'
    const diagLog = (step: string, data?: any) => {
      if (!isDev) return
      fetch('/api/chatbot/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `[DIAG] ${step}`, serverError: JSON.stringify(data).slice(0, 300), componentStack: 'diag', ua: navigator.userAgent, url: window.location.href }),
      }).catch(() => {})
    }

    try {
      const body: Record<string, any> = {
        message: userMessage.content,
        propertyId,
        propertyName,
        language: lang,
        conversationHistory: messages
          .filter(m => !m.typing)
          .slice(-6)
          .map(m => ({ role: m.role, content: m.content.slice(0, 400) })),
        sessionId: sessionIdRef.current
      }
      if (zoneId) body.zoneId = zoneId
      if (zoneName) body.zoneName = zoneName

      diagLog('before-fetch', { msgLen: userMessage.content.length, propertyId, msgChars: [...userMessage.content].map(c => c.charCodeAt(0)).slice(0,10) })

      let response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(body),
        signal: controller.signal,
        cache: 'no-store' as RequestCache,
      })

      diagLog('after-fetch', { status: response.status, contentType: response.headers.get('content-type') })

      if (response.status === 429) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.limitType === 'daily' ? 'rate_limited_daily' : 'rate_limited')
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        const err = new Error('api_error') as Error & { serverError?: string; serverStatus?: number }
        err.serverError = errBody.error || JSON.stringify(errBody).slice(0, 200)
        err.serverStatus = response.status
        throw err
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
          let streamCompletedNormally = false
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                streamCompletedNormally = true
                break
              }

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
                    currentStreamedChars = streamedContent.length
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
          } finally {
            if (!streamCompletedNormally) {
              // Aborted/errored: cancel the stream
              try { reader.cancel() } catch { /* ignore */ }
            }
            // Always release the reader lock AND cancel the body so the HTTP
            // connection is fully returned to the pool. releaseLock() alone is
            // not enough in some Chrome/Safari versions — the response.body stays
            // "busy" and causes the next fetch to the same endpoint to fail.
            try { reader.releaseLock() } catch { /* ignore */ }
            try { response.body?.cancel() } catch { /* ignore */ }
          }
        }

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
        // Non-streaming JSON response (iOS path or fallback)
        const data = await response.json()

        // If the server returned an error JSON instead of a response, throw it
        if (data.error && !data.response) {
          throw new Error(data.limitType === 'daily' ? 'rate_limited_daily' : data.limitType === 'hourly' ? 'rate_limited' : 'api_error')
        }

        // Guarantee content is always a string — ReactMarkdown throws on null/undefined
        const responseText: string = typeof data.response === 'string' ? data.response : t('errorMessage', lang)

        trackEvent('chatbot_interaction', {
          zoneId, propertyId, zoneName, propertyName,
          type: 'message', query: userMessage.content,
          response: responseText, language: lang
        })

        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing)
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: responseText,
            timestamp: new Date(),
            media: data.media || undefined,
            recommendations: data.recommendations || undefined,
          }
          return [...filtered, assistantMessage]
        })
      }

    } catch (error: any) {
      // Remote logging for mobile debugging (no DevTools)
      try {
        fetch('/api/chatbot/error-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: `sendMessage catch: ${error?.name}: ${error?.message}`,
            serverError: error?.serverError || null,
            serverStatus: error?.serverStatus || null,
            stack: error?.stack?.slice(0, 300),
            componentStack: 'sendMessage',
            ua: navigator.userAgent,
            url: window.location.href,
          }),
        }).catch(() => {})
      } catch {}

      const isAbort = error?.name === 'AbortError'
      const isRateLimited = error?.message === 'rate_limited'
      const isRateLimitedDaily = error?.message === 'rate_limited_daily'

      // Only keep partial response if THIS message already streamed content
      const hasPartialResponse = isAbort && currentStreamedChars > 20

      if (hasPartialResponse) {
        // Partial content exists — just remove typing indicator, don't add error
        setMessages(prev => prev.filter(m => !m.typing))
      } else {
        const errMsg = isRateLimitedDaily ? t('rateLimitedDaily', lang) : isRateLimited ? t('rateLimited', lang) : t('errorBanner', lang)
        const chatMsg = isRateLimitedDaily ? t('rateLimitedDaily', lang) : isRateLimited ? t('rateLimited', lang) : t('errorMessage', lang)
        setError(errMsg)

        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing)
          const errorMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: chatMsg,
            timestamp: new Date()
          }
          return [...filtered, errorMsg]
        })
      }
    } finally {
      clearTimeout(timeout)
      activeControllerRef.current = null // liberar ref siempre
      setIsLoading(false)
    }
  }

  const handleFAQClick = (faq: FAQ) => {
    setShowFAQs(false)
    sendMessage(faq.question)
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

  // Don't render chatbot until explicitly enabled (null = loading, false = disabled)
  if (isEnabled !== true) return null

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
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="relative w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
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
            inputPlaceholder={t('placeholder', lang)}
            lang={lang}
            className={className ? className.replace(/bottom-\d+/, 'bottom-40').replace(/sm:bottom-\d+/, 'sm:bottom-28') : 'bottom-40 right-4 sm:bottom-28 sm:right-6'}
            onSuggestionClick={handleWelcomeSuggestion}
            onDismiss={() => setShowWelcomeBubble(false)}
            onCustomMessage={handleWelcomeSuggestion}
            onLanguageChange={setLang}
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
            className={`fixed z-50 overflow-hidden flex flex-col
              max-sm:inset-0 max-sm:rounded-none
              sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200
              ${isMinimized
                ? 'sm:w-[380px] sm:h-16'
                : 'sm:w-[380px] sm:h-[600px]'
              } ${className || 'sm:bottom-6 sm:right-6'}`}
            style={{ background: '#f8f9fc' }}
          >
            {/* Header */}
            <div className="flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #111827 100%)' }}>
              <div className="px-5 py-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      {hostPhoto ? (
                        <img
                          src={hostPhoto}
                          alt={hostName || propertyName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-gray-900 rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] text-white/50 font-semibold uppercase tracking-[0.15em]">
                          {hostName ? hostName : t('header', lang)}
                        </p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>AI</span>
                      </div>
                      <h3 className="font-semibold text-sm leading-snug mt-0.5 text-white line-clamp-1">{propertyName}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-3">
                    <button
                      onClick={handleMinimize}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                    >
                      {isMinimized ? <Maximize2 className="w-4 h-4 text-white/60" /> : <Minimize2 className="w-4 h-4 text-white/60" />}
                    </button>
                    {/* Mobile: prominent close button */}
                    <button
                      onClick={handleClose}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors sm:hidden"
                      style={{ background: 'rgba(255,255,255,0.12)' }}
                    >
                      <ChevronDown className="w-4 h-4 text-white" />
                      <span className="text-xs font-medium text-white">Cerrar</span>
                    </button>
                    {/* Desktop: icon only */}
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-xl transition-colors hidden sm:block"
                      style={{ background: 'rgba(255,255,255,0.12)' }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 relative min-h-0" style={{ background: '#f8f9fc' }}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[85%] ${
                          message.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        {message.role === 'user' ? (
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5 bg-gray-800">
                            <User className="w-3 h-3 text-white" />
                          </div>
                        ) : hostPhoto ? (
                          <img
                            src={hostPhoto}
                            alt={hostName || propertyName}
                            className="w-6 h-6 rounded-lg object-cover flex-shrink-0 mb-0.5"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div>
                          <div
                            className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                              message.role === 'user'
                                ? 'bg-gray-900 text-white rounded-2xl rounded-br-md'
                                : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm'
                            }`}
                          >
                            {message.typing ? (
                              <div className="flex items-center gap-2 py-0.5">
                                <span className="flex gap-1">
                                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                                <span className="text-gray-400 text-[12px]">{message.content}</span>
                              </div>
                            ) : (
                              <div className="chatbot-markdown text-[13px] leading-relaxed">
                                <SimpleMarkdown content={typeof message.content === 'string' ? message.content : ''} />
                              </div>
                            )}
                          </div>

                          {/* Rich Media — step cards with text + image/video */}
                          {message.media && message.media.length > 0 && (
                            <div className="mt-2 space-y-2 max-w-[280px]">
                              {message.media.map((item, idx) => (
                                <div key={item.url || idx} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                                  {/* Step header: number + instruction text */}
                                  {(item.stepIndex != null || item.stepText) && (
                                    <div className="px-3 pt-2.5 pb-1.5">
                                      {item.stepIndex != null && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold mr-1.5 align-middle">
                                          {item.stepIndex}
                                        </span>
                                      )}
                                      {item.stepText && (
                                        <span className="text-[12px] text-gray-700 leading-snug">
                                          <SimpleMarkdown content={item.stepText} />
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {/* Media */}
                                  {item.type === 'IMAGE' ? (
                                    <img
                                      src={item.url}
                                      alt={item.caption || ''}
                                      loading="lazy"
                                      className="w-full h-auto max-h-44 object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={item.url}
                                      controls
                                      preload="metadata"
                                      playsInline
                                      className="w-full max-h-48"
                                    />
                                  )}
                                  {/* Caption (step title) below media */}
                                  {item.caption && !item.stepText && (
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
                                  key={rec.mapsUrl || rec.name || idx}
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
                  {showFAQs && messages.length <= 1 && faqs.length > 0 && (
                    <div className="space-y-2 mt-1">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest pl-1">{t('faqTitle', lang)}</p>
                      {faqs.slice(0, 2).map((faq, index) => (
                        <button
                          key={faq.question || index}
                          onClick={() => handleFAQClick(faq)}
                          className="w-full text-left px-3.5 py-2.5 text-[13px] text-gray-700 bg-white hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 rounded-xl border border-gray-200 shadow-sm transition-all duration-150 flex items-center gap-2.5 group"
                        >
                          <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] bg-violet-50 group-hover:bg-violet-100">💬</span>
                          <span className="flex-1">{faq.question}</span>
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
