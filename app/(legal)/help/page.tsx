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
  PlayCircle,
  Newspaper,
  LifeBuoy,
  ArrowRight,
  X,
  Send,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { useSearch, UnifiedSearchResult } from '../../../src/hooks/useSearch'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<UnifiedSearchResult | null>(null)
  const { results, loading, error } = useSearch(searchQuery)

  // Estado del formulario de preguntas
  const [questionForm, setQuestionForm] = useState({
    question: '',
    email: '',
    category: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (questionForm.question.trim().length < 10) {
      setSubmitError('La pregunta debe tener al menos 10 caracteres')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/faq/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: questionForm.question.trim(),
          email: questionForm.email.trim() || null,
          category: questionForm.category || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar la pregunta')
      }

      setSubmitSuccess(true)
      setQuestionForm({ question: '', email: '', category: '' })

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al enviar la pregunta')
    } finally {
      setSubmitting(false)
    }
  }

  const questionCategories = [
    { value: '', label: 'Selecciona una categoría' },
    { value: 'propiedades', label: 'Propiedades' },
    { value: 'conjuntos', label: 'Conjuntos de propiedades' },
    { value: 'zonas', label: 'Zonas y pasos' },
    { value: 'qr', label: 'Códigos QR' },
    { value: 'traducciones', label: 'Idiomas y traducciones' },
    { value: 'medios', label: 'Fotos y videos' },
    { value: 'cuenta', label: 'Mi cuenta' },
    { value: 'facturacion', label: 'Facturación y planes' },
    { value: 'otro', label: 'Otro' }
  ]

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
        return Newspaper
      default:
        return FileText
    }
  }

  // Get Spanish label for each type
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'faq':
        return 'FAQ'
      case 'guide':
        return 'Guía'
      case 'resource':
        return 'Recurso'
      case 'tutorial':
        return 'Tutorial'
      case 'blog':
        return 'Artículo'
      default:
        return type
    }
  }

  // Get colors for source badge
  const getSourceStyles = (source: string) => {
    if (source === 'blog') {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: 'text-amber-600'
      }
    }
    // help center
    return {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      icon: 'text-violet-600'
    }
  }

  // Get icon for source
  const getSourceIcon = (source: string) => {
    return source === 'blog' ? Newspaper : LifeBuoy
  }

  const faqItems = [
    // Básico
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
    },
    // Conjuntos de propiedades
    {
      question: "¿Qué es un conjunto de propiedades?",
      answer: "Un conjunto de propiedades es una forma de agrupar múltiples propiedades bajo una misma gestión. Ideal para hoteles, edificios de apartamentos, complejos turísticos o hosts con varias propiedades en la misma zona."
    },
    {
      question: "¿Cómo creo un conjunto de propiedades?",
      answer: "Ve a tu dashboard > Conjuntos > 'Nuevo Conjunto'. Completa los 4 pasos: información básica (nombre, descripción, tipo), ubicación, contacto, y selección de propiedades para añadir."
    },
    {
      question: "¿Una propiedad puede estar en varios conjuntos?",
      answer: "No, cada propiedad solo puede pertenecer a un conjunto a la vez. Si mueves una propiedad a otro conjunto, se quitará del anterior automáticamente."
    },
    // Duplicar propiedades
    {
      question: "¿Cómo duplico una propiedad?",
      answer: "Haz clic en el menú de la propiedad (···) > 'Duplicar'. Elige cuántas copias crear, si compartir medios (fotos/videos), y si añadirlas al mismo conjunto. Las copias se nombran automáticamente."
    },
    {
      question: "¿Qué se copia al duplicar una propiedad?",
      answer: "Se copia: nombre (con número), todas las zonas, todos los pasos, traducciones, y opcionalmente los medios (fotos/videos). NO se copian: estadísticas, evaluaciones ni el historial de visitantes."
    },
    {
      question: "¿Cuántas propiedades puedo duplicar a la vez?",
      answer: "Puedes crear hasta 50 copias de una propiedad en una sola operación. Ideal para hoteles con muchas habitaciones similares. Si necesitas más, simplemente repite el proceso."
    },
    // Zonas y pasos
    {
      question: "¿Qué zonas debería incluir en mi manual?",
      answer: "Recomendamos incluir: WiFi, Check-in/out, Electrodomésticos, Calefacción/AC, Normas de la casa, Información del barrio, Contacto de emergencia, y cualquier zona específica de tu propiedad."
    },
    {
      question: "¿Puedo reordenar las zonas?",
      answer: "Sí, arrastra las zonas usando el icono de arrastre para cambiar el orden. El nuevo orden se refleja inmediatamente en el manual del huésped."
    },
    // Medios
    {
      question: "¿Qué formatos de video son compatibles?",
      answer: "Aceptamos MP4, MOV, WebM y la mayoría de formatos comunes. Los videos se comprimen automáticamente para una carga rápida en dispositivos móviles."
    },
    {
      question: "¿Hay límite de tamaño para fotos y videos?",
      answer: "Fotos: máximo 10MB por imagen. Videos: máximo 100MB por video. Recomendamos videos cortos de 30-60 segundos para instrucciones específicas."
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
                  <div className="space-y-3">
                    {/* Resumen de resultados estilo Amazon */}
                    <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{results.total}</span> {results.total === 1 ? 'resultado' : 'resultados'}
                        {results.totalBlog > 0 && results.totalHelp > 0 && (
                          <span className="text-gray-400 ml-2">
                            ({results.totalHelp} de ayuda, {results.totalBlog} del blog)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Resultados con estilo Amazon */}
                    {results.results.map((item: UnifiedSearchResult, index: number) => {
                      const TypeIcon = getTypeIcon(item.type)
                      const SourceIcon = getSourceIcon(item.source)
                      const sourceStyles = getSourceStyles(item.source)

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <div onClick={() => setSelectedItem(item)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(item)}>
                            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer hover:border-violet-300 group">
                              <div className="flex items-start gap-3">
                                {/* Icono principal */}
                                <div className={`w-10 h-10 ${sourceStyles.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <TypeIcon className={`w-5 h-5 ${sourceStyles.icon}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  {/* Línea superior: Fuente > Sección (estilo Amazon) */}
                                  <div className="flex items-center gap-1.5 mb-1 text-xs">
                                    <SourceIcon className={`w-3 h-3 ${sourceStyles.text}`} />
                                    <span className={`font-medium ${sourceStyles.text}`}>
                                      {item.sourceLabel}
                                    </span>
                                    <ChevronRight className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-500">
                                      {item.category}
                                    </span>
                                    {item.source === 'blog' && item.readTime && (
                                      <>
                                        <span className="text-gray-300 mx-1">•</span>
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <span className="text-gray-500">{item.readTime} min</span>
                                      </>
                                    )}
                                  </div>

                                  {/* Título */}
                                  <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors line-clamp-1">
                                    {item.title}
                                  </h3>

                                  {/* Descripción */}
                                  <p className="text-gray-600 text-sm line-clamp-2">
                                    {item.description}
                                  </p>

                                  {/* Tipo badge + Tags */}
                                  <div className="flex items-center flex-wrap gap-1.5 mt-2">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${sourceStyles.bg} ${sourceStyles.text} ${sourceStyles.border}`}>
                                      {getTypeLabel(item.type)}
                                    </span>
                                    {item.tags.slice(0, 3).map((tag: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Flecha */}
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                              </div>
                            </Card>
                          </div>
                        </motion.div>
                      )
                    })}

                    {/* Link para ir al blog si hay resultados del blog */}
                    {results.totalBlog > 0 && (
                      <div className="pt-2 text-center">
                        <Link
                          href={`/blog?search=${encodeURIComponent(searchQuery)}`}
                          className="text-sm text-violet-600 hover:text-violet-800 inline-flex items-center gap-1"
                        >
                          Ver todos los artículos del blog
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
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

        {/* Question Submission Form */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-violet-50 via-purple-50 to-violet-50 border-violet-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¿No encuentras tu pregunta?
              </h3>
              <p className="text-gray-600">
                Envíanos tu duda y te responderemos lo antes posible. Tu pregunta podría ayudar a otros usuarios.
              </p>
            </div>

            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Pregunta enviada!
                </h4>
                <p className="text-gray-600">
                  Te responderemos pronto. Recibirás una notificación cuando tu pregunta sea contestada.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                {/* Pregunta */}
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                    Tu pregunta *
                  </label>
                  <textarea
                    id="question"
                    rows={4}
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Escribe aquí tu pregunta... (mínimo 10 caracteres)"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    required
                    minLength={10}
                  />
                </div>

                {/* Categoría y Email en una fila */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      id="category"
                      value={questionForm.category}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                    >
                      {questionCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={questionForm.email}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Para recibir la respuesta"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Error message */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting || questionForm.question.trim().length < 10}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar pregunta
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Al enviar tu pregunta, aceptas que pueda ser publicada en nuestro centro de ayuda para beneficiar a otros usuarios.
                </p>
              </form>
            )}
          </Card>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Card className="p-6 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              ¿Prefieres hablar con nosotros directamente?
            </h3>
            <p className="text-gray-600 mb-4">
              Nuestro equipo de soporte está disponible para ayudarte.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="mailto:contacto@itineramio.com">
                <Button variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
                  <Mail className="w-4 h-4 mr-2" />
                  contacto@itineramio.com
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

      {/* Modal para contenido FAQ/Ayuda */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className={`p-6 border-b ${selectedItem.source === 'blog' ? 'bg-amber-50' : 'bg-violet-50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedItem.source === 'blog' ? 'bg-amber-100' : 'bg-violet-100'}`}>
                      {(() => {
                        const TypeIcon = getTypeIcon(selectedItem.type)
                        return <TypeIcon className={`w-6 h-6 ${selectedItem.source === 'blog' ? 'text-amber-600' : 'text-violet-600'}`} />
                      })()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${selectedItem.source === 'blog' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                          {getTypeLabel(selectedItem.type)}
                        </span>
                        <span className="text-xs text-gray-500">{selectedItem.category}</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
                {/* Descripción breve */}
                <p className="text-gray-600 mb-6 pb-4 border-b border-gray-100">
                  {selectedItem.description}
                </p>

                {/* Contenido principal */}
                <div className="prose prose-violet max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.content}
                  </div>
                </div>

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Temas relacionados:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="p-4 border-t bg-gray-50 flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                {selectedItem.source === 'blog' ? (
                  <Link
                    href={selectedItem.url}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-amber-600 hover:bg-amber-700 text-white`}
                  >
                    Leer artículo completo
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HelpCircle className="w-4 h-4" />
                    <span>¿Te fue útil esta información?</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}