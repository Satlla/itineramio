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
  zoneId: string
  zoneName: string
  propertyName: string
  language?: 'es' | 'en' | 'fr'
  hostContact?: {
    name: string
    phone: string
    email: string
  }
}

interface FAQ {
  question: string
  answer: string
  category: string
}

const defaultFAQs: FAQ[] = [
  {
    question: "¿Cómo puedo contactar al anfitrión?",
    answer: "Puedes contactar al anfitrión a través del teléfono o email proporcionado en la información de contacto.",
    category: "contacto"
  },
  {
    question: "¿Dónde está la Wi-Fi?",
    answer: "La información de Wi-Fi se encuentra generalmente en la zona de bienvenida o recepción. Busca las instrucciones específicas en los pasos de la zona correspondiente.",
    category: "servicios"
  },
  {
    question: "¿Cómo funciona el check-in?",
    answer: "Las instrucciones de check-in están detalladas en la zona de acceso. Sigue los pasos numerados para completar tu llegada.",
    category: "proceso"
  },
  {
    question: "¿Hay parking disponible?",
    answer: "La información sobre parking está disponible en las instrucciones específicas de la propiedad. Revisa las zonas de acceso o servicios.",
    category: "servicios"
  }
]

export default function ChatBot({ 
  propertyId, 
  zoneId, 
  zoneName, 
  propertyName, 
  language = 'es',
  hostContact 
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
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `¡Hola! Soy tu asistente virtual para ${propertyName}. Estoy aquí para ayudarte con cualquier pregunta sobre ${zoneName} y tu estancia. ¿En qué puedo ayudarte?`,
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
      content: 'Escribiendo...',
      timestamp: new Date(),
      typing: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          propertyId,
          zoneId,
          zoneName,
          propertyName,
          language,
          conversationHistory: messages.filter(m => !m.typing).slice(-10) // Last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Error al procesar tu consulta')
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
        language
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

    } catch (error) {
      console.error('Chatbot error:', error)
      setError('Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.')
      
      // Remove typing indicator and add error message
      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Lo siento, hubo un error técnico. Por favor, intenta de nuevo o contacta directamente al anfitrión.',
          timestamp: new Date()
        }
        return [...filtered, errorMessage]
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
      const message = encodeURIComponent(`Hola, tengo una consulta sobre ${propertyName} - ${zoneName}`)
      window.open(`https://wa.me/${hostContact.phone.replace(/[^\d]/g, '')}?text=${message}`, '_blank')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-50 flex items-center justify-center"
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
            className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden ${
              isMinimized ? 'w-80 h-16' : 'w-80 h-96'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Asistente IA</h3>
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
                      <p className="text-xs text-gray-500 font-medium">Preguntas frecuentes:</p>
                      {defaultFAQs.slice(0, 3).map((faq, index) => (
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
                        placeholder="Escribe tu pregunta..."
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
                        <span>Contactar por WhatsApp</span>
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