'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Book,
  Video,
  Search,
  ChevronRight,
  ExternalLink,
  Users,
  Zap,
  Shield,
  Clock,
  Loader2,
  FileText,
  BookOpen,
  Download,
  PlayCircle
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { useSearch } from '../../../src/hooks/useSearch'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { results, loading, error } = useSearch(searchQuery)

  // Get icon for each type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'faq':
        return HelpCircle
      case 'guide':
        return BookOpen
      case 'resource':
        return Download
      case 'tutorial':
        return PlayCircle
      case 'blog':
        return FileText
      default:
        return FileText
    }
  }

  // Get Spanish label for each type
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'faq':
        return 'Preguntas Frecuentes'
      case 'guide':
        return 'Guías'
      case 'resource':
        return 'Recursos'
      case 'tutorial':
        return 'Tutoriales'
      case 'blog':
        return 'Blog'
      default:
        return type
    }
  }

  const faqItems = [
    {
      question: "¿Cómo creo mi primer manual digital?",
      answer: "Primero, crea una propiedad en tu dashboard. Luego añade zonas (como WiFi, check-in, etc.) y para cada zona crea pasos con instrucciones detalladas. Puedes incluir texto, imágenes y videos."
    },
    {
      question: "¿Cómo funcionan los códigos QR?",
      answer: "Cada zona genera automáticamente un código QR único. Los huéspedes lo escanean con su móvil y acceden directamente a las instrucciones de esa zona específica."
    },
    {
      question: "¿Puedo personalizar el diseño del manual?",
      answer: "Sí, puedes personalizar colores, iconos y agregar tu logo. También puedes organizar las zonas según tus necesidades específicas."
    },
    {
      question: "¿Es compatible con todos los dispositivos?",
      answer: "Absolutamente. Los manuales están optimizados para móviles, tablets y ordenadores. No requieren apps adicionales."
    },
    {
      question: "¿Cómo actualizo la información?",
      answer: "Los cambios se aplican en tiempo real. Cuando actualizas información en tu dashboard, todos los códigos QR muestran automáticamente el contenido actualizado."
    },
    {
      question: "¿Qué pasa si mis huéspedes no hablan español?",
      answer: "Itineramio soporta múltiples idiomas. Puedes crear contenido en español, inglés y francés para el mismo manual."
    }
  ]

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Chat en vivo",
      description: "Respuesta inmediata durante horario laboral",
      action: "Iniciar chat",
      available: "Lun-Vie 9:00-18:00 CET",
      href: "#chat"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Respuesta en menos de 24 horas",
      action: "Enviar email",
      available: "contacto@itineramio.com",
      href: "mailto:contacto@itineramio.com"
    },
    {
      icon: Phone,
      title: "Teléfono",
      description: "Soporte directo para casos urgentes",
      action: "Llamar ahora",
      available: "+34 652 656 440",
      href: "tel:+34652656440"
    }
  ]

  const quickLinks = [
    {
      icon: Book,
      title: "Guía de inicio rápido",
      description: "Tutorial paso a paso para comenzar",
      href: "#quick-start"
    },
    {
      icon: Video,
      title: "Videos tutoriales",
      description: "Aprende visualmente cómo usar Itineramio",
      href: "#tutorials"
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Conecta con otros anfitriones",
      href: "#community"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Centro de Ayuda
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Encuentra respuestas rápidas a tus preguntas o ponte en contacto con nuestro equipo de soporte
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-violet-600 w-5 h-5 animate-spin" />
            )}
            <input
              type="text"
              placeholder="Busca en nuestras guías de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                {error && (
                  <Card className="p-4 bg-red-50 border-red-200">
                    <p className="text-red-600 text-center">{error}</p>
                  </Card>
                )}

                {!loading && !error && results.total === 0 && (
                  <Card className="p-6 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      No se encontraron resultados para &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Intenta con otras palabras clave o contacta con soporte
                    </p>
                  </Card>
                )}

                {!loading && !error && results.total > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <p className="text-sm text-gray-600">
                        {results.total} {results.total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                      </p>
                    </div>

                    {results.results.map((item, index) => {
                      const Icon = getTypeIcon(item.type)
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link href={item.url}>
                            <Card className="p-5 hover:shadow-lg transition-all cursor-pointer hover:border-violet-300">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-violet-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                                      {getTypeLabel(item.type)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {item.category}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-violet-600">
                                    {item.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm line-clamp-2">
                                    {item.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {item.tags.slice(0, 5).map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Support Channels */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            ¿Necesitas ayuda inmediata?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <channel.icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {channel.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {channel.description}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {channel.available}
                  </p>
                  <Link href={channel.href}>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">
                      {channel.action}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Recursos Útiles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Link href={link.href}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                        <link.icon className="w-5 h-5 text-violet-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {link.title}
                    </h3>
                    <p className="text-gray-600">
                      {link.description}
                    </p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <HelpCircle className="w-5 h-5 text-violet-600 mr-2" />
                    {item.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="p-8 bg-gradient-to-r from-violet-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo de soporte está aquí para ayudarte. No dudes en contactarnos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="mailto:contacto@itineramio.com">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar Soporte
                </Button>
              </Link>
              <Link href="/main">
                <Button variant="outline">
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}