'use client'

import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Minus, Crown, Check, ArrowRight, Sparkles, Zap, Shield, Trophy, Star, BarChart3, DollarSign, Calendar, Rocket } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { StructuredData } from '../src/components/StructuredData'
import { Navbar } from '../src/components/layout/Navbar'

// Animation variants for reusable animations
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
}

// Animated Section Wrapper
const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Superhost Airbnb",
    property: "3 Apartamentos Barcelona",
    location: "Barcelona, España",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=100&h=100&fit=crop&crop=face",
    comment: "Se acabaron las llamadas a las 3 AM. Antes me despertaban 5-6 veces por semana preguntando wifi, parking, llaves... Con Itineramio duermo tranquila.",
    rating: 5,
    feature: "Reducción de consultas"
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Property Manager",
    property: "15 Apartamentos Costa del Sol",
    location: "Málaga, España",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    comment: "Recuperé 25 horas al mes que dedico a conseguir más propiedades. Los huéspedes aman la experiencia organizada.",
    rating: 5,
    feature: "Ahorro de tiempo"
  },
  {
    id: 3,
    name: "Ana Martín",
    role: "Host independiente",
    property: "8 Propiedades Turísticas",
    location: "Sevilla, España",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    comment: "Lo que más me costaba era crear manuales profesionales. Con Itineramio en 10 minutos tengo guías que parecen de hotel 5 estrellas.",
    rating: 5,
    feature: "Manuales profesionales"
  },
  {
    id: 4,
    name: "Javier Ruiz",
    role: "Host Airbnb",
    property: "5 Villas en Ibiza",
    location: "Ibiza, España",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    comment: "Los códigos QR personalizados son un game-changer. Cada propiedad tiene su identidad y los huéspedes lo valoran muchísimo en las reviews.",
    rating: 5,
    feature: "Códigos QR personalizados"
  },
  {
    id: 5,
    name: "Laura Sánchez",
    role: "Superhost",
    property: "12 Apartamentos Madrid",
    location: "Madrid, España",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    comment: "El check-in automático ha transformado mi negocio. Ahora puedo gestionar 12 propiedades sin necesidad de estar presente físicamente.",
    rating: 5,
    feature: "Check-in automático"
  },
  {
    id: 6,
    name: "Diego Fernández",
    role: "Property Manager",
    property: "20 Apartamentos Valencia",
    location: "Valencia, España",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face",
    comment: "La gestión multipropiedad desde un solo panel es increíble. Antes usaba 3 herramientas diferentes, ahora todo está en Itineramio.",
    rating: 5,
    feature: "Panel centralizado"
  },
  {
    id: 7,
    name: "Isabel Torres",
    role: "Host Booking.com",
    property: "6 Casas Rurales",
    location: "Granada, España",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    comment: "Mis reviews han mejorado un 40% desde que uso Itineramio. Los huéspedes destacan lo organizados y profesionales que somos.",
    rating: 5,
    feature: "Mejora de reviews"
  },
  {
    id: 8,
    name: "Roberto Gómez",
    role: "Superhost",
    property: "4 Áticos Marbella",
    location: "Marbella, España",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    comment: "El check-out digital es perfecto. Los huéspedes dejan todo organizado y recibo notificaciones automáticas cuando terminan.",
    rating: 5,
    feature: "Check-out digital"
  },
  {
    id: 9,
    name: "Patricia Morales",
    role: "Host independiente",
    property: "2 Apartamentos Bilbao",
    location: "Bilbao, España",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    comment: "La app es súper intuitiva. Mis padres, que no son muy tecnológicos, pueden gestionar las reservas sin problema alguno.",
    rating: 5,
    feature: "Interfaz intuitiva"
  },
  {
    id: 10,
    name: "Miguel Ángel Pérez",
    role: "Property Manager",
    property: "25 Propiedades Canarias",
    location: "Tenerife, España",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    comment: "Las traducciones automáticas son perfectas. Tengo huéspedes de todo el mundo y todos reciben la info en su idioma.",
    rating: 5,
    feature: "Multiidioma"
  },
  {
    id: 11,
    name: "Carmen Jiménez",
    role: "Superhost Airbnb",
    property: "7 Estudios San Sebastián",
    location: "San Sebastián, España",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    comment: "Los reportes me ayudan a identificar qué propiedades necesitan mejoras. Ahora tomo decisiones basadas en datos reales.",
    rating: 5,
    feature: "Reportes y analíticas"
  },
  {
    id: 12,
    name: "Francisco López",
    role: "Host Vrbo",
    property: "10 Cabañas Pirineos",
    location: "Huesca, España",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
    comment: "La integración con mi sistema de reservas existente fue perfecta. En menos de 1 hora estaba todo funcionando.",
    rating: 5,
    feature: "Fácil integración"
  }
]

// Pricing tiers configuration - ACTUALIZADO según src/config/plans.ts
const PRICING_TIERS = [
  { min: 1, max: 2, name: 'BASIC', price: 9 },
  { min: 3, max: 10, name: 'HOST', price: 29 },
  { min: 11, max: 25, name: 'SUPERHOST', price: 69 },
  { min: 26, max: 50, name: 'BUSINESS', price: 99 }
]

const PLAN_DETAILS = [
  {
    name: 'BASIC',
    displayName: 'Basic',
    maxProps: 2,
    price: 9,
    recommended: true,
    description: 'Perfecto para comenzar'
  },
  {
    name: 'HOST',
    displayName: 'Host',
    maxProps: 10,
    price: 29,
    recommended: false,
    description: 'Múltiples propiedades'
  },
  {
    name: 'SUPERHOST',
    displayName: 'Superhost',
    maxProps: 25,
    price: 69,
    recommended: false,
    description: 'Gestores profesionales'
  },
  {
    name: 'BUSINESS',
    displayName: 'Business',
    maxProps: 50,
    price: 99,
    recommended: false,
    description: 'Soluciones enterprise'
  }
]

export default function LandingPage() {
  const router = useRouter()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [propertyCount, setPropertyCount] = useState(1)

  // Parallax scroll effect - DISABLED to prevent hero from disappearing
  // const { scrollY } = useScroll()
  // const heroY = useTransform(scrollY, [0, 500], [0, 150])
  // const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  // Calculate current tier and price
  const getCurrentTier = (count: number) => {
    return PRICING_TIERS.find(tier => count >= tier.min && count <= tier.max) || PRICING_TIERS[0]
  }

  const currentTier = getCurrentTier(propertyCount)
  const totalPrice = currentTier.price

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated) {
            router.push('/main')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [router])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      <StructuredData />

      {/* Unified Navigation */}
      <Navbar />

      {/* Hero Section - with parallax */}
      <section className="relative pt-28 sm:pt-36 md:pt-32 pb-0 sm:pb-6 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          className="max-w-7xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6 sm:space-y-8"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-full border border-violet-500/20">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">Plataforma #1 de manuales digitales para Airbnb</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-[1.05] tracking-tight"
              >
                <span className="block mb-2">Manuales digitales</span>
                <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  para Airbnb y alquileres
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-xl"
              >
                <span className="font-bold text-gray-900">Crea guías digitales con WiFi, códigos, instrucciones y recomendaciones.</span> Todo en un QR que escanean tus huéspedes. Adiós a las llamadas y mensajes repetitivos.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-full text-base sm:text-lg font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-all group"
                  >
                    Empezar gratis
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Link href="/funcionalidades">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-full text-base sm:text-lg font-semibold hover:border-gray-300 hover:shadow-lg transition-all">
                      Explorar Funcionalidades
                    </button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200"
              >
                <motion.div variants={scaleIn}>
                  <div className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">86%</div>
                  <div className="text-gray-600 text-sm mt-1">menos consultas</div>
                </motion.div>
                <motion.div variants={scaleIn}>
                  <div className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">8h</div>
                  <div className="text-gray-600 text-sm mt-1">ahorradas/semana</div>
                </motion.div>
                <motion.div variants={scaleIn}>
                  <div className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">5s</div>
                  <div className="text-gray-600 text-sm mt-1">check-in QR</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Hero Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/videos/no-calls.mp4" type="video/mp4" />
                </video>

                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-lg rounded-full shadow-lg border border-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-900">0 llamadas esta semana</span>
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* NEW: Enterprise Features Section - Property Sets & Announcements */}
      <section className="py-24 px-6 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-full border border-violet-500/20 mb-6"
            >
              <Rocket className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-900">Nuevas funcionalidades empresariales</span>
            </motion.div>

            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Gestiona <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">decenas de alojamientos</span> con un solo cambio
            </h2>
            <p className="text-xl text-gray-600">
              Si gestionas múltiples propiedades, tenemos funcionalidades que te ahorrarán horas cada semana
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Property Sets Feature */}
            <AnimatedSection>
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-violet-100 h-full"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Conjuntos de Propiedades
                </h3>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  <span className="font-semibold text-gray-900">¿Tienes 10, 20 o 50 apartamentos?</span> Agrúpalos en conjuntos y <span className="bg-yellow-100 px-2 py-1 rounded">edita todos a la vez</span>.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Un cambio, 50 propiedades actualizadas</div>
                      <div className="text-sm text-gray-600">Modifica zonas, avisos e instrucciones en todas tus propiedades simultáneamente</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Control granular</div>
                      <div className="text-sm text-gray-600">Elige si quieres aplicar cambios a todo el conjunto, propiedades específicas o solo una</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Perfecto para edificios completos</div>
                      <div className="text-sm text-gray-600">Ideal para hoteles, aparthoteles, complejos turísticos y edificios enteros</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                  <div className="text-sm text-violet-900 font-medium mb-2">Caso de uso real:</div>
                  <div className="text-sm text-gray-600 italic">
                    "Cambié las instrucciones del WiFi en mis 20 apartamentos en menos de 30 segundos. Antes tardaba 2 horas."
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>

            {/* Announcements Feature */}
            <AnimatedSection>
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-orange-100 h-full"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Sistema de Avisos Inteligente
                </h3>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  <span className="font-semibold text-gray-900">¿Obras en el edificio? ¿Cambio de horarios?</span> Crea avisos importantes que verán todos tus huéspedes <span className="bg-yellow-100 px-2 py-1 rounded">al instante</span>.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Avisos urgentes para todas las propiedades</div>
                      <div className="text-sm text-gray-600">Comunica cortes de agua, obras, cambios de normativa al instante</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Fechas de vigencia</div>
                      <div className="text-sm text-gray-600">Programa inicio y fin de cada aviso, se activan y desactivan automáticamente</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Destacados con iconos y colores</div>
                      <div className="text-sm text-gray-600">Avisos urgentes con estilo visual impactante que llaman la atención</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <div className="text-sm text-orange-900 font-medium mb-2">Caso de uso real:</div>
                  <div className="text-sm text-gray-600 italic">
                    "Hubo un corte de agua en todo el edificio. Publiqué un aviso y TODOS los huéspedes lo vieron antes de que me llamaran. Cero quejas."
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>

          {/* Stats for Enterprise Features */}
          <AnimatedSection className="mt-16">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Diseñado para property managers profesionales
                </h3>
                <p className="text-gray-600">
                  Funcionalidades que los competidores cobran extra (o no tienen)
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
                  <div className="text-sm text-gray-600">Menos tiempo gestionando</div>
                  <div className="text-xs text-gray-500 mt-2">vs actualizar propiedad por propiedad</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                  <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-sm text-gray-600">Propiedades soportadas</div>
                  <div className="text-xs text-gray-500 mt-2">En un solo conjunto</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
                  <div className="text-4xl font-bold text-violet-600 mb-2">30s</div>
                  <div className="text-sm text-gray-600">Actualización masiva</div>
                  <div className="text-xs text-gray-500 mt-2">Lo que antes tomaba horas</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* "Adiós a perder el tiempo" Section */}
      <AnimatedSection className="pt-2 pb-4 sm:py-12 bg-gradient-to-b from-white to-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/host-preocupado.mp4" type="video/mp4" />
                </video>
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-3xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Automatiza todo</span>
              </div>

              <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                Adiós a perder el tiempo
              </h2>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  <span className="font-semibold text-gray-900">¿Cansado de repetir lo mismo?</span> Cada huésped pregunta dónde está el WiFi, cómo funciona el aire acondicionado, o dónde aparcar. Con Itineramio, crea una guía completa una sola vez.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Todo en un QR.</span> Tus huéspedes escanean el código y acceden a toda la información que necesitan, cuando la necesitan. Sin esperar respuestas. Sin molestarte.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Recupera tu tiempo.</span> Los anfitriones que usan Itineramio ahorran un promedio de 8 horas semanales. Tiempo que puedes dedicar a crecer tu negocio o simplemente descansar.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* "Cómo funciona" Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100 mb-6"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Súper sencillo</span>
            </motion.div>

            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Cómo funciona
            </h2>
            <p className="text-xl text-gray-600">
              Crea tu manual digital en minutos. Sin complicaciones técnicas.
            </p>
          </AnimatedSection>

          <div className="space-y-32">
            {/* Step 1 */}
            <AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="order-2 lg:order-1"
                >
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 relative group">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    >
                      <source src="/videos/famili-check-in.mp4" type="video/mp4" />
                    </video>
                  </div>
                </motion.div>

                <div className="order-1 lg:order-2 space-y-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl text-white text-2xl font-bold shadow-lg">
                    1
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    Crea tu propiedad
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Añade tu alojamiento a Itineramio. Es tan simple como rellenar un formulario: nombre, dirección, y listo. Tardarás menos de 2 minutos.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Step 2 - WiFi */}
            <AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white text-2xl font-bold shadow-lg">
                    2
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    Organiza por zonas
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Divide tu guía en zonas: WiFi, Cocina, Baño, Parking... Cada zona puede tener instrucciones, fotos, videos y links útiles.
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50 relative group"
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  >
                    <source src="/videos/wifi.mp4" type="video/mp4" />
                  </video>
                </motion.div>
              </div>
            </AnimatedSection>

            {/* Step 3 - Washing Machine */}
            <AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="order-2 lg:order-1 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 relative group"
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  >
                    <source src="/videos/washing-machine.mp4" type="video/mp4" />
                  </video>
                </motion.div>

                <div className="order-1 lg:order-2 space-y-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl text-white text-2xl font-bold shadow-lg">
                    3
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    Añade instrucciones
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Explica paso a paso cómo usar cada cosa. Puedes añadir texto, imágenes, videos, o lo que necesites. Hazlo tan detallado como quieras.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Step 4 - Vitro */}
            <AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl text-white text-2xl font-bold shadow-lg">
                    4
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    Personaliza todo
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Añade tu toque personal. Cambialos colores, añade tu logo, personaliza los mensajes. Haz que la guía refleje el estilo de tu alojamiento.
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-50 to-red-50 relative group"
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  >
                    <source src="/videos/vitro.mp4" type="video/mp4" />
                  </video>
                </motion.div>
              </div>
            </AnimatedSection>

            {/* Step 5 - Control Panel - Full Width Centered */}
            <AnimatedSection className="lg:col-span-2">
              <div className="max-w-5xl mx-auto">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative flex items-center justify-center shadow-2xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10"></div>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative text-center p-12 max-w-3xl z-10"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-6 flex items-center justify-center"
                    >
                      <Trophy className="w-20 h-20 text-yellow-400" strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      Un panel para controlarlo todo
                    </h3>
                    <p className="text-xl text-gray-600">
                      La guía de tu apartamento te llevará unos minutos. Si es extensa entre videos, probablemente te lleve una hora, pero ya no tendrás que volver a responder siempre a las mismas preguntas.
                    </p>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-center mt-12 max-w-3xl mx-auto"
                >
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">
                    Tu panel de control completo
                  </h3>
                  <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
                    >
                      <span className="font-semibold text-gray-900 text-xl inline-flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        Itineramio Places:
                      </span> Los mejores lugares de la ciudad recomendados por anfitriones como tú. Con solo unos clicks ¡PAM! tu manual creado.
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                      className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
                    >
                      Evita que te sigan preguntando dónde pueden ir a comer o cenar, o si el arroz de X restaurante está bueno.
                      <span className="font-semibold text-gray-900"> Crea zonas, recomienda o importa zonas de otros anfitriones.</span>
                      <span className="text-sm text-orange-600"> (Próximamente)</span>
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
                    >
                      <span className="font-semibold text-gray-900 text-xl inline-flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                        Recibe reseñas
                      </span> de tu apartamento para mejorar tu guía. Tus huéspedes pueden evaluar cada zona para que sepas si las instrucciones están bien.
                    </motion.p>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Blog Resources Section - Internal Linking */}
      <section className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-violet-50 rounded-full border border-blue-100 mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Recursos gratuitos</span>
            </motion.div>

            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Aprende más sobre gestión de alojamientos
            </h2>
            <p className="text-xl text-gray-600">
              Guías, plantillas y recursos gratuitos para anfitriones como tú
            </p>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Article 1: Manual Digital */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Link href="/blog/manual-digital-apartamento-turistico-guia-completa">
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border border-violet-100 hover:shadow-2xl transition-all h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                    Manual Digital: Guía Completa 2025
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Crea manuales digitales profesionales que eliminan el 86% de consultas. Incluye plantilla descargable gratis.
                  </p>
                  <div className="flex items-center text-violet-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Leer guía <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Article 2: Check-in Remoto */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Link href="/blog/plantilla-check-in-remoto-airbnb">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 hover:shadow-2xl transition-all h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    Plantilla Check-in Remoto
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Reduce incidencias 67% con check-in automatizado. Descarga plantilla Word + PDF lista para usar.
                  </p>
                  <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Descargar plantilla <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Article 3: VUT Madrid */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Link href="/blog/vut-madrid-2025-requisitos-normativa-checklist">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100 hover:shadow-2xl transition-all h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    VUT Madrid 2025: Requisitos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Guía completa de la nueva normativa VUT Madrid. Manual digital obligatorio desde enero. Evita multas de €30,000.
                  </p>
                  <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Ver requisitos <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* CTA to Blog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link href="/blog">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-full text-lg font-semibold hover:shadow-xl transition-all group"
              >
                Ver todos los artículos
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-100 mb-6"
            >
              <Crown className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Precios transparentes</span>
            </motion.div>

            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Precio simple y justo
            </h2>
            <p className="text-xl text-gray-600">
              Paga solo por lo que uses. Sin tarifas ocultas. Sin sorpresas.
            </p>
          </AnimatedSection>

          {/* Interactive Calculator */}
          <AnimatedSection>
            <div className="max-w-4xl mx-auto mb-16">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-8 sm:p-10 bg-white rounded-3xl border-2 border-gray-200 shadow-xl relative overflow-hidden"
              >
                {/* Trust Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200"
                >
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">15 días de prueba</span>
                </motion.div>

                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
                  Calcula tu precio
                </h3>
                <p className="text-gray-600 text-center mb-8">
                  Ajusta el número de propiedades y descubre tu plan ideal
                </p>

                {/* Slider Section */}
                <div className="mb-8">
                  <motion.div
                    key={propertyCount}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-6"
                  >
                    <div className="text-7xl sm:text-8xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {propertyCount}
                    </div>
                    <div className="text-xl text-gray-500 mt-2">
                      {propertyCount === 1 ? 'propiedad' : 'propiedades'}
                    </div>
                  </motion.div>

                  {/* Slider */}
                  <div className="px-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={propertyCount}
                      onChange={(e) => setPropertyCount(parseInt(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-violet-200 via-purple-200 to-pink-200 rounded-full appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right,
                          rgb(139, 92, 246) 0%,
                          rgb(168, 85, 247) ${((propertyCount - 1) / 49) * 100}%,
                          rgb(229, 231, 235) ${((propertyCount - 1) / 49) * 100}%,
                          rgb(229, 231, 235) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2 px-1">
                      <span>1</span>
                      <span>25</span>
                      <span>50+</span>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <motion.div
                  key={`${currentTier.name}-${totalPrice}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-8 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-violet-500/20 mb-6"
                >
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white mb-4">
                    {currentTier.name}
                  </div>
                  <div className="text-5xl sm:text-6xl font-bold text-gray-900 mb-2">
                    €{totalPrice}
                    <span className="text-2xl text-gray-500 font-normal">/mes</span>
                  </div>
                  <div className="text-gray-600 mb-4">
                    Hasta {currentTier.max} {currentTier.max === 1 ? 'propiedad' : 'propiedades'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Solo €{(totalPrice / propertyCount).toFixed(2)} por propiedad al mes
                  </div>
                </motion.div>

                {/* ROI Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-3 gap-4 mb-6"
                >
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-2xl font-bold text-green-600">4.5h</div>
                    <div className="text-xs text-gray-600 mt-1">Ahorradas por reserva</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">98%</div>
                    <div className="text-xs text-gray-600 mt-1">Satisfacción</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="text-2xl font-bold text-amber-600">-65%</div>
                    <div className="text-xs text-gray-600 mt-1">Consultas menos</div>
                  </div>
                </motion.div>

                {/* CTA */}
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-full font-bold text-lg bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all"
                  >
                    Probar gratis 15 días
                  </motion.button>
                </Link>
                <p className="text-center text-sm text-gray-500 mt-3">
                  No requiere tarjeta de crédito • Prueba 15 días sin compromiso
                </p>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Social Proof Stats */}
          <AnimatedSection>
            <div className="max-w-5xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    500+
                  </div>
                  <div className="text-sm text-gray-600">Anfitriones activos</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    12K+
                  </div>
                  <div className="text-sm text-gray-600">Guías creadas</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    4.9/5
                  </div>
                  <div className="text-sm text-gray-600">Valoración media</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    24/7
                  </div>
                  <div className="text-sm text-gray-600">Soporte disponible</div>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Money-back Guarantee */}
          <AnimatedSection>
            <div className="max-w-3xl mx-auto mb-16">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl border-2 border-green-200 shadow-xl text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Garantía de satisfacción 100%
                </h3>
                <p className="text-gray-700 text-lg">
                  Si en los primeros 30 días no estás satisfecho, te devolvemos tu dinero. Sin preguntas.
                </p>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Pricing Plans Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {PLAN_DETAILS.map((plan, index) => {
              const isCurrentPlan = currentTier.name === plan.name
              return (
              <motion.div
                key={plan.name}
                variants={scaleIn}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  z: 50
                }}
                style={{ perspective: 1000 }}
                className={`relative p-8 rounded-3xl border-2 ${
                  isCurrentPlan
                    ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 border-transparent text-white'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } shadow-xl transition-all`}
              >
                {isCurrentPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold rounded-full"
                  >
                    Recomendado
                  </motion.div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`}>
                    {plan.displayName}
                  </h3>
                  <Crown className={`w-6 h-6 ${isCurrentPlan ? 'text-white' : 'text-gray-400'}`} />
                </div>

                <div className="mb-6">
                  <div className={`text-5xl font-bold ${isCurrentPlan ? 'text-white' : 'text-gray-900'}`}>
                    €{plan.price}
                    <span className={`text-xl font-normal ${isCurrentPlan ? 'text-white/80' : 'text-gray-500'}`}>
                      /mes
                    </span>
                  </div>
                  <div className={`text-sm mt-2 ${isCurrentPlan ? 'text-white/80' : 'text-gray-500'}`}>
                    €{(plan.price / plan.maxProps).toFixed(2)} por propiedad
                  </div>
                </div>

                <div className={`text-base mb-6 ${isCurrentPlan ? 'text-white/90' : 'text-gray-600'}`}>
                  <div className="font-medium mb-2">Hasta {plan.maxProps} {plan.maxProps === 1 ? 'propiedad' : 'propiedades'}</div>
                  <div className={`text-sm space-y-1 ${isCurrentPlan ? 'text-white/70' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Semestral: €{(plan.price * 6 * 0.9).toFixed(0)} <span className="font-semibold">(-10%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Anual: €{(plan.price * 12 * 0.8).toFixed(0)} <span className="font-semibold">(-20%)</span>
                    </div>
                  </div>
                </div>

                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 rounded-full font-semibold transition-all ${
                      isCurrentPlan
                        ? 'bg-white text-violet-600 hover:shadow-lg'
                        : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/30'
                    }`}
                  >
                    Empezar ahora
                  </motion.button>
                </Link>

                <div className="mt-8 space-y-3">
                  {['Guías ilimitadas', 'Zonas ilimitadas', 'QR personalizados', 'Analytics básicos'].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <Check className={`w-5 h-5 ${plan.recommended ? 'text-white' : 'text-green-500'}`} />
                      <span className={`text-sm ${plan.recommended ? 'text-white/90' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600">
              Más de 500 anfitriones confían en Itineramio cada día
            </p>
          </AnimatedSection>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-gray-50 to-white p-12 rounded-3xl shadow-2xl border border-gray-100"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <motion.img
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-yellow-400 text-2xl"
                        >
                          ★
                        </motion.span>
                      ))}
                    </div>

                    <p className="text-xl text-gray-700 mb-6 leading-relaxed italic">
                      "{testimonials[currentTestimonial].comment}"
                    </p>

                    <div>
                      <div className="font-bold text-gray-900 text-lg">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-gray-600">
                        {testimonials[currentTestimonial].role} · {testimonials[currentTestimonial].property}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {testimonials[currentTestimonial].location}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation */}
              <div className="flex justify-center items-center space-x-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevTestimonial}
                  className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>

                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentTestimonial
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 w-8'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTestimonial}
                  className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-8 flex items-center justify-center"
            >
              <Rocket className="w-20 h-20 text-white" strokeWidth={1.5} />
            </motion.div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Empieza hoy mismo
            </h2>

            <p className="text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Únete a cientos de anfitriones que ya recuperaron su tiempo y duermen tranquilos
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-12 py-5 bg-white text-violet-600 rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-white/30 transition-all group"
              >
                Crear cuenta gratis
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>

            <p className="mt-8 text-white/80 text-sm">
              Sin tarjeta de crédito. Primera propiedad gratis para siempre.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">I</span>
                </div>
                <span className="text-2xl font-semibold">Itineramio</span>
              </div>
              <p className="text-gray-400 text-sm">
                Manuales digitales interactivos para alojamientos turísticos
              </p>
            </div>

            {/* Producto */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Producto</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/#how-it-works" className="hover:text-white transition-colors">Cómo funciona</Link></li>
                <li><Link href="/#pricing" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Empezar gratis</Link></li>
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Soporte</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="mailto:hola@itineramio.com" className="hover:text-white transition-colors">Contacto</a></li>
                <li><Link href="/legal/billing" className="hover:text-white transition-colors">Facturación y Reembolsos</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-white transition-colors">Política de Cookies</Link></li>
                <li><Link href="/legal/legal-notice" className="hover:text-white transition-colors">Aviso Legal</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Itineramio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
