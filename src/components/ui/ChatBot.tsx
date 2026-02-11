'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Phone,
  ChevronDown,
  AlertCircle,
  Loader2,
  Minimize2,
  Maximize2
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  typing?: boolean
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

export default function ChatBot({
  propertyId,
  zoneId,
  zoneName,
  propertyName,
  language = 'es',
  hostContact,
  className = ''
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFAQs, setShowFAQs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const lang = language || 'es'

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

  const initializeChat = () => {
    const welcomeKey = zoneId && zoneName ? 'welcomeZone' : 'welcomeProperty'
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

  const handleOpen = () => {
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

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)
    setError(null)
    setShowFAQs(false)

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      content: t('typing', lang),
      timestamp: new Date(),
      typing: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const body: Record<string, any> = {
        message: userMessage.content,
        propertyId,
        propertyName,
        language: lang,
        conversationHistory: messages.filter(m => !m.typing).slice(-10)
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
      })

      if (response.status === 429) {
        throw new Error('rate_limited')
      }

      if (!response.ok) {
        throw new Error('api_error')
      }

      const data = await response.json()

      // Track chatbot interaction
      trackEvent('chatbot_interaction', {
        zoneId,
        propertyId,
        zoneName,
        propertyName,
        type: 'message',
        query: userMessage.content,
        response: data.response,
        language: lang
      })

      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        return [...filtered, assistantMessage]
      })

    } catch (error: any) {
      console.error('Chatbot error:', error)

      const isRateLimited = error?.message === 'rate_limited'
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleFAQClick = (faq: FAQ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: faq.question,
      timestamp: new Date()
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: faq.answer,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setShowFAQs(false)
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

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className={`fixed w-14 h-14 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${className || 'bottom-6 right-6'}`}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden ${
              isMinimized ? 'w-80 h-16' : 'w-80 h-96'
            } ${className || 'bottom-6 right-6'}`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t('header', lang)}</h3>
                  <p className="text-xs opacity-90">{propertyName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMinimize}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-72 overflow-y-auto p-4 space-y-4">
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
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {message.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        </div>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm ${
                            message.role === 'user'
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.typing ? (
                            <div className="flex items-center space-x-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>{message.content}</span>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* FAQ Suggestions */}
                  {showFAQs && messages.length <= 1 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">{t('faqTitle', lang)}</p>
                      {faqs.slice(0, 3).map((faq, index) => (
                        <button
                          key={index}
                          onClick={() => handleFAQClick(faq)}
                          className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
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
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('placeholder', lang)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim() || isLoading}
                      className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>

                  {hostContact?.phone && (
                    <div className="mt-2 flex justify-center">
                      <button
                        onClick={handleWhatsApp}
                        className="flex items-center space-x-1 text-xs text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{t('contactWhatsApp', lang)}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
