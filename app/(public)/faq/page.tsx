'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  HelpCircle,
  User,
  Home,
  FileText,
  CreditCard,
  Globe,
  Settings,
  MessageCircle,
  Zap
} from 'lucide-react'

interface FAQ {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  name: string
  icon: React.ReactNode
  faqs: FAQ[]
}

const faqCategories: FAQCategory[] = [
  {
    id: 'account',
    name: 'Registro y Cuenta',
    icon: <User className="w-5 h-5" />,
    faqs: [
      {
        question: '¿Cómo me registro en Itineramio?',
        answer: 'Entra en itineramio.com y haz clic en "Crear cuenta". Puedes registrarte con tu email o directamente con Google. El proceso toma menos de 1 minuto.'
      },
      {
        question: '¿Necesito tarjeta de crédito para registrarme?',
        answer: 'No. No pedimos tarjeta de crédito para crear tu cuenta. Puedes probar todas las funcionalidades durante 15 días sin compromiso.'
      },
      {
        question: '¿Cómo recupero mi contraseña?',
        answer: 'En la pantalla de login, haz clic en "¿Olvidaste tu contraseña?". Te enviaremos un enlace para crear una nueva contraseña.'
      },
      {
        question: '¿Puedo cambiar mi email después de registrarme?',
        answer: 'Sí, puedes cambiar tu email desde Configuración > Cuenta. Te enviaremos un email de verificación a la nueva dirección para confirmar el cambio.'
      },
      {
        question: '¿Mis datos están seguros?',
        answer: 'Sí. Usamos encriptación SSL, cumplimos con GDPR y nunca compartimos tus datos con terceros. Tu seguridad es nuestra prioridad.'
      }
    ]
  },
  {
    id: 'properties',
    name: 'Propiedades',
    icon: <Home className="w-5 h-5" />,
    faqs: [
      {
        question: '¿Cómo creo mi primera propiedad?',
        answer: 'Después de registrarte, haz clic en "Nueva Propiedad" en el dashboard. Sigue el asistente de 3 pasos: información básica, ubicación y datos de contacto.'
      },
      {
        question: '¿Cuántas propiedades puedo crear?',
        answer: 'Ilimitadas. Durante el periodo de prueba puedes crear hasta 3 propiedades. Después, el número depende del plan que elijas.'
      },
      {
        question: '¿Qué tipos de propiedad soporta Itineramio?',
        answer: 'Apartamentos, casas, habitaciones, villas, estudios, áticos, chalets, hostales, hoteles boutique y cualquier alojamiento turístico.'
      },
      {
        question: '¿Puedo editar la propiedad después de crearla?',
        answer: 'Sí, puedes editar toda la información en cualquier momento desde el dashboard.'
      },
      {
        question: '¿Puedo duplicar una propiedad existente?',
        answer: 'Actualmente puedes copiar zonas y pasos entre propiedades del mismo conjunto para ahorrar tiempo.'
      }
    ]
  },
  {
    id: 'manuals',
    name: 'Manuales Digitales',
    icon: <FileText className="w-5 h-5" />,
    faqs: [
      {
        question: '¿Qué es una zona?',
        answer: 'Una zona es una sección temática de tu manual. Por ejemplo: "WiFi", "Check-in", "Electrodomésticos", "Normas de la casa".'
      },
      {
        question: '¿Qué es un paso?',
        answer: 'Un paso es una instrucción individual dentro de una zona. Por ejemplo, en la zona "WiFi" podrías tener: Paso 1: "Busca la red MiWiFi", Paso 2: "La contraseña es 12345".'
      },
      {
        question: '¿Cómo publico mi manual?',
        answer: 'Una vez tengas al menos una zona con contenido, haz clic en "Publicar" en el dashboard de la propiedad.'
      },
      {
        question: '¿Los cambios se aplican en tiempo real?',
        answer: 'Sí, cualquier cambio que hagas es visible instantáneamente para los huéspedes sin necesidad de volver a publicar.'
      },
      {
        question: '¿El manual funciona sin descargar ninguna app?',
        answer: 'Correcto, es una web app. El huésped escanea el QR y accede directamente desde su navegador sin instalar nada.'
      }
    ]
  },
  {
    id: 'guests',
    name: 'Acceso de Huéspedes',
    icon: <MessageCircle className="w-5 h-5" />,
    faqs: [
      {
        question: '¿Cómo acceden los huéspedes al manual?',
        answer: 'Escanean el código QR con la cámara de su móvil o acceden mediante el enlace único de la propiedad. No necesitan app ni registro.'
      },
      {
        question: '¿Funciona con iPhone y Android?',
        answer: 'Sí, compatible con todos los smartphones modernos (iOS 11+ y Android 8+).'
      },
      {
        question: '¿En qué idioma ve el manual el huésped?',
        answer: 'Detectamos el idioma del navegador del huésped automáticamente. Si tienes traducciones configuradas, verá su idioma preferido.'
      },
      {
        question: '¿Pueden acceder varios huéspedes a la vez?',
        answer: 'Sí, no hay límite de accesos simultáneos al manual.'
      },
      {
        question: '¿El enlace caduca?',
        answer: 'No, el enlace es permanente mientras tu propiedad esté publicada.'
      }
    ]
  },
  {
    id: 'translations',
    name: 'Traducciones',
    icon: <Globe className="w-5 h-5" />,
    faqs: [
      {
        question: '¿Puedo traducir mi manual a varios idiomas?',
        answer: 'Sí, Itineramio soporta traducciones automáticas e IA para más de 50 idiomas.'
      },
      {
        question: '¿Cómo funcionan las traducciones automáticas?',
        answer: 'Puedes activar la traducción automática con un clic. Usamos IA avanzada que entiende el contexto de alojamientos turísticos.'
      },
      {
        question: '¿Puedo editar las traducciones automáticas?',
        answer: 'Sí, todas las traducciones son editables manualmente para ajustar cualquier detalle.'
      },
      {
        question: '¿Qué idiomas están disponibles?',
        answer: 'Español, inglés, francés, alemán, italiano, portugués, chino, japonés, árabe, y muchos más. Más de 50 idiomas disponibles.'
      },
      {
        question: '¿Las traducciones tienen coste adicional?',
        answer: 'El número de traducciones incluidas depende de tu plan. Consulta la página de precios para más detalles.'
      }
    ]
  },
  {
    id: 'billing',
    name: 'Precios y Facturación',
    icon: <CreditCard className="w-5 h-5" />,
    faqs: [
      {
        question: '¿Cuánto cuesta Itineramio?',
        answer: 'Tenemos planes desde 9€/mes para hosts pequeños hasta planes Business para agencias. Consulta nuestra página de precios para ver todas las opciones.'
      },
      {
        question: '¿Hay periodo de prueba?',
        answer: 'Sí, ofrecemos 15 días de prueba con acceso completo a todas las funcionalidades sin necesidad de tarjeta de crédito.'
      },
      {
        question: '¿Puedo cancelar en cualquier momento?',
        answer: 'Sí, puedes cancelar tu suscripción en cualquier momento sin penalización. No hay permanencia mínima.'
      },
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex) a través de Stripe, la plataforma de pagos más segura.'
      },
      {
        question: '¿Emiten factura?',
        answer: 'Sí, generamos facturas automáticamente cada mes que puedes descargar desde tu panel de facturación.'
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Integraciones',
    icon: <Settings className="w-5 h-5" />,
    faqs: [
      {
        question: '¿Se integra con Airbnb?',
        answer: 'Puedes conectar tu cuenta de Airbnb para importar automáticamente los datos de tus propiedades y sincronizar información.'
      },
      {
        question: '¿Funciona con otras plataformas de alquiler?',
        answer: 'Sí, además de Airbnb, trabajamos con Booking.com, Vrbo, y otras plataformas principales del sector.'
      },
      {
        question: '¿Tiene API?',
        answer: 'Sí, ofrecemos API para desarrolladores y agencias que quieran integrar Itineramio en sus sistemas.'
      },
      {
        question: '¿Se puede integrar con WhatsApp?',
        answer: 'Sí, puedes configurar un botón de WhatsApp directo para que los huéspedes te contacten fácilmente.'
      },
      {
        question: '¿Hay integración con Google Analytics?',
        answer: 'Sí, puedes conectar Google Analytics para obtener estadísticas detalladas de las visitas a tus manuales.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set())

  // Filter FAQs based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories

    const query = searchQuery.toLowerCase()
    return faqCategories
      .map(category => ({
        ...category,
        faqs: category.faqs.filter(
          faq =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.faqs.length > 0)
  }, [searchQuery])

  const toggleQuestion = (questionId: string) => {
    const newOpen = new Set(openQuestions)
    if (newOpen.has(questionId)) {
      newOpen.delete(questionId)
    } else {
      newOpen.add(questionId)
    }
    setOpenQuestions(newOpen)
  }

  const totalQuestions = faqCategories.reduce((sum, cat) => sum + cat.faqs.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Itineramio
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-6">
              <HelpCircle className="w-5 h-5 text-violet-600" />
              <span className="text-violet-700 font-medium">Centro de Ayuda</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Preguntas Frecuentes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Encuentra respuestas rápidas a las preguntas más comunes sobre Itineramio
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en las preguntas frecuentes..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              />
            </div>

            <p className="text-sm text-gray-500 mt-4">
              {totalQuestions} preguntas organizadas en {faqCategories.length} categorías
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Category Pills */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredCategories
              .filter(cat => !activeCategory || cat.id === activeCategory)
              .map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{category.name}</h2>
                      <p className="text-sm text-gray-500">{category.faqs.length} preguntas</p>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="divide-y divide-gray-100">
                    {category.faqs.map((faq, index) => {
                      const questionId = `${category.id}-${index}`
                      const isOpen = openQuestions.has(questionId)

                      return (
                        <div key={questionId}>
                          <button
                            onClick={() => toggleQuestion(questionId)}
                            className="w-full px-6 py-4 text-left flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900">{faq.question}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-4 text-gray-600">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600 mb-4">
                No hay preguntas que coincidan con "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-violet-600 hover:text-violet-700 font-medium"
              >
                Ver todas las preguntas
              </button>
            </div>
          )}

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 text-center text-white"
          >
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-2">¿No encuentras lo que buscas?</h3>
            <p className="text-violet-100 mb-6">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/help"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-violet-600 font-semibold rounded-lg hover:bg-violet-50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Centro de Ayuda
              </Link>
              <a
                href="mailto:hola@itineramio.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-400 transition-colors"
              >
                Contactar Soporte
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
