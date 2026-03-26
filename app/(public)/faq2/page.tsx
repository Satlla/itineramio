'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Inter, Manrope } from 'next/font/google'
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

const inter   = Inter({ subsets: ['latin'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], weight: ['300','400','600','700','800'], display: 'swap', variable: '--font-manrope' })

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

export default function FAQ2Page() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set())

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
    <div className={`${inter.className} ${manrope.variable} min-h-screen bg-white text-[#111]`}
      style={{ WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>

      {/* Header */}
      <header className="border-b bg-white" style={{ borderColor:'rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} className="object-contain"/>
              <span className="font-semibold text-[15px] text-[#111]">Itineramio</span>
            </Link>
            <Link href="/" className="inline-flex items-center text-[#666] hover:text-[#111] transition-colors text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Ambient gradient */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div
            animate={{ opacity:[0.6,1,0.6], scale:[0.97,1.03,0.97] }}
            transition={{ repeat:Infinity, duration:6, ease:'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[80%]"
            style={{ background:'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,58,237,0.10) 0%, transparent 70%)' }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm text-violet-700 font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse"/>
              <HelpCircle className="w-4 h-4" />
              <span>Centro de Ayuda</span>
            </div>

            <h1 className="mb-4 tracking-tight leading-[1.06]"
              style={{ fontSize:'clamp(2.2rem, 5vw, 3.8rem)', fontFamily:'var(--font-manrope)', fontWeight:600, color:'#111' }}>
              Preguntas Frecuentes
            </h1>
            <p className="text-base text-[#555] font-normal mb-10 max-w-xl mx-auto leading-relaxed">
              Encuentra respuestas rápidas a las preguntas más comunes sobre Itineramio
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en las preguntas frecuentes..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border rounded-[14px] outline-none text-[#111] text-sm transition-all"
                style={{
                  borderColor: 'rgba(0,0,0,0.08)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
              />
            </div>

            <p className="text-[12px] text-[#aaa] mt-4">
              {totalQuestions} preguntas organizadas en {faqCategories.length} categorías
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Category Pills */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-2 mb-10 justify-center">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-[#7c3aed] text-white'
                    : 'bg-[#f5f3f0] text-[#555] hover:bg-[#ebe9e6]'
                }`}
              >
                Todas
              </button>
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors inline-flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'bg-[#7c3aed] text-white'
                      : 'bg-[#f5f3f0] text-[#555] hover:bg-[#ebe9e6]'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Categories */}
          <div className="space-y-4">
            {filteredCategories
              .filter(cat => !activeCategory || cat.id === activeCategory)
              .map((category, ci) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.05, duration: 0.35, ease: [0.25,0.1,0.25,1] }}
                  className="bg-white rounded-[20px] overflow-hidden border border-black/[0.06]"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  {/* Category Header */}
                  <div className="px-6 py-4 flex items-center gap-3 border-b border-black/[0.05]"
                    style={{ backgroundColor: '#f5f3f0' }}>
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[#555]"
                      style={{ backgroundColor: '#f0efed' }}>
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#111] text-[14px]">{category.name}</h2>
                      <p className="text-[11px] text-[#aaa]">{category.faqs.length} preguntas</p>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="divide-y divide-black/[0.05]">
                    {category.faqs.map((faq, index) => {
                      const questionId = `${category.id}-${index}`
                      const isOpen = openQuestions.has(questionId)

                      return (
                        <div key={questionId}>
                          <button
                            onClick={() => toggleQuestion(questionId)}
                            className="w-full px-6 py-4 text-left flex items-start justify-between gap-4 transition-colors hover:bg-[#fafaf9]"
                          >
                            <span className="font-medium text-[#111] text-[14px] leading-snug">{faq.question}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-[#aaa] flex-shrink-0 mt-0.5 transition-transform duration-200 ${
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
                                transition={{ duration: 0.2, ease: [0.25,0.1,0.25,1] }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-5 text-[#555] text-[14px] leading-relaxed">
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
              <Search className="w-12 h-12 mx-auto mb-4" style={{ color:'#ddd' }} />
              <h3 className="text-[16px] font-semibold text-[#111] mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-[#555] text-sm mb-4">
                No hay preguntas que coincidan con &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-violet-600 hover:text-violet-700 font-medium text-sm"
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
            className="mt-12 rounded-[20px] p-8 text-center"
            style={{ backgroundColor: '#111' }}
          >
            <HelpCircle className="w-10 h-10 mx-auto mb-4" style={{ color:'#555' }} />
            <h3 className="text-[22px] font-semibold text-white mb-2"
              style={{ fontFamily:'var(--font-manrope)' }}>
              ¿No encuentras lo que buscas?
            </h3>
            <p className="mb-8 text-sm leading-relaxed" style={{ color:'#888' }}>
              Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#111] font-semibold rounded-full text-sm hover:bg-[#f5f3f0] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Centro de Ayuda
              </Link>
              <a
                href="mailto:hola@itineramio.com"
                className="inline-flex items-center justify-center px-6 py-3 font-semibold rounded-full text-sm text-white transition-colors"
                style={{ backgroundColor:'#7c3aed' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6d28d9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#7c3aed')}
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
