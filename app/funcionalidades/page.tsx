'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Sparkles,
  MessageSquare,
  QrCode,
  Share2,
  Clock,
  Heart,
  Zap,
  Home,
  Video,
  Wifi,
  Star,
  Copy,
  FolderOpen,
  Building2,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Lightbulb,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Play,
  Tv,
  Wind,
  Car,
  Coffee,
  MessageCircle,
  ThumbsUp,
  Link as LinkIcon,
  Printer,
  Users,
  Layers
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'

const features = [
  {
    id: 'mensajes-automaticos',
    icon: MessageSquare,
    title: 'Mensajes Automatizados',
    subtitle: 'Comunicación perfecta desde el primer momento',
    description: 'Genera mensajes prediseñados con el enlace de tu manual para enviar a tus huéspedes a través de Airbnb, Booking o cualquier plataforma. Solo te faltará entregarles el código de acceso el día del check-in.',
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      'Plantillas de mensajes pre-escritas',
      'Enlace único para cada propiedad',
      'Compatible con todas las plataformas OTA',
      'Información disponible antes del check-in'
    ]
  },
  {
    id: 'todo-en-uno',
    icon: Layers,
    title: 'Todo en un Solo Lugar',
    subtitle: 'Deja volar tu imaginación',
    description: 'Crea el manual perfecto con TODO lo que tus huéspedes necesitan saber. Desde dónde aparcar, hasta cómo funciona cada electrodoméstico. Sin límites, sin restricciones.',
    gradient: 'from-violet-500 to-purple-500',
    features: [
      'Parkings cercanos y dónde aparcar',
      'Normas del alojamiento',
      'Instrucciones de electrodomésticos',
      'Recomendaciones de la ciudad',
      'Dónde dejar las maletas',
      'Instrucciones de check-in/check-out',
      'Tips locales y restaurantes',
      'Todo lo que puedas imaginar'
    ]
  },
  {
    id: 'whatsapp-directo',
    icon: MessageCircle,
    title: 'WhatsApp Directo',
    subtitle: 'Soporte instantáneo, siempre disponible',
    description: 'Tus huéspedes pueden contactarte directamente por WhatsApp con un solo click. Además, sabrás de qué apartamento te escriben para ofrecerles mejor atención.',
    gradient: 'from-green-500 to-emerald-500',
    features: [
      'Acceso directo al propietario/gestor',
      'Identificación automática del apartamento',
      'Respuesta rápida y eficiente',
      'El huésped se siente arropado 24/7'
    ]
  },
  {
    id: 'zonas-especificas',
    icon: Share2,
    title: 'Comparte Zonas Específicas',
    subtitle: 'El poder está en los detalles',
    description: '¿Te escriben a las 10 PM porque no saben cómo va la vitrocerámica? No te preocupes. Envía solo el enlace de esa zona específica y ahorra tiempo mientras disfrutas tu cena.',
    gradient: 'from-orange-500 to-red-500',
    features: [
      'Enlaces individuales por zona',
      'Envío rápido sin buscar información',
      'Videos específicos por elemento',
      'Ahorra tiempo en consultas repetitivas'
    ]
  },
  {
    id: 'qr-imprimibles',
    icon: QrCode,
    title: 'Códigos QR Imprimibles',
    subtitle: 'Acceso instantáneo con la cámara',
    description: 'Imprime pegatinas QR para cada elemento de tu alojamiento. Tus huéspedes simplemente escanean con su cámara y acceden directamente a las instrucciones.',
    gradient: 'from-pink-500 to-rose-500',
    features: [
      'QR por elemento (TV, WiFi, vitro...)',
      'Escaneo directo con la cámara',
      'Sin apps adicionales necesarias',
      'Pegatinas descargables y listas para imprimir'
    ]
  },
  {
    id: 'conjuntos',
    icon: Building2,
    title: 'Agrupa en Conjuntos',
    subtitle: 'Gestión centralizada de múltiples propiedades',
    description: '¿Tienes varios apartamentos en el mismo edificio o complejo? Agrúpalos en conjuntos y gestiona todo desde un solo lugar de manera más eficiente.',
    gradient: 'from-indigo-500 to-blue-500',
    features: [
      'Organización por conjuntos/edificios',
      'Panel centralizado de gestión',
      'Información compartida entre propiedades',
      'Perfecto para gestores profesionales'
    ]
  },
  {
    id: 'duplicacion',
    icon: Copy,
    title: 'Duplica Apartamentos',
    subtitle: 'Más rápido que nunca',
    description: '¿Tienes apartamentos iguales? Duplica uno cuantas veces quieras. Si hay alguna diferencia específica, edita solo esa parte. Ahorra espacio compartiendo videos entre apartamentos.',
    gradient: 'from-teal-500 to-cyan-500',
    features: [
      'Duplicación con un click',
      'Edición individual de diferencias',
      'Videos compartidos entre propiedades',
      'Ahorro de espacio y tiempo'
    ]
  },
  {
    id: 'evaluaciones',
    icon: Star,
    title: 'Recibe Evaluaciones',
    subtitle: 'Mejora continua con feedback real',
    description: 'Permite que tus huéspedes valoren tu manual y dejen comentarios. Conoce qué funciona y qué puedes mejorar para ofrecer la mejor experiencia.',
    gradient: 'from-yellow-500 to-amber-500',
    features: [
      'Sistema de valoraciones integrado',
      'Comentarios de huéspedes',
      'Insights para mejorar',
      'Demuestra tu compromiso con la calidad'
    ]
  }
]

const benefits = [
  {
    icon: Clock,
    title: 'Ahorra hasta 2.5 horas/mes',
    description: 'Por cada propiedad en consultas repetitivas'
  },
  {
    icon: TrendingUp,
    title: 'Mejores valoraciones',
    description: 'Huéspedes más informados = mejores reviews'
  },
  {
    icon: Shield,
    title: 'Menos problemas',
    description: 'Previene situaciones incómodas con información clara'
  },
  {
    icon: Heart,
    title: 'Experiencia premium',
    description: 'Tus huéspedes se sienten cuidados y atendidos'
  }
]

const useCases = [
  {
    situation: 'Es sábado noche, cenas con tu pareja...',
    problem: 'Te escriben que no saben cómo funciona la vitrocerámica',
    solution: 'Envías solo el enlace de la vitro en 5 segundos',
    result: 'Sigues disfrutando tu cena sin interrupciones',
    icon: Wind
  },
  {
    situation: 'Un huésped acaba de llegar...',
    problem: 'No encuentra el parking más cercano',
    solution: 'Ya tiene toda la información en el manual',
    result: 'Sin llamadas de última hora, check-in perfecto',
    icon: Car
  },
  {
    situation: 'Son las 11 PM de un viernes...',
    problem: '¿Cómo conectar la TV a Netflix?',
    solution: 'Escanea el QR de la TV y ve el video tutorial',
    result: 'Resuelto sin tu intervención',
    icon: Tv
  },
  {
    situation: 'Un huésped busca recomendaciones...',
    problem: 'Quiere saber los mejores restaurantes cercanos',
    solution: 'Todo está en la sección de recomendaciones',
    result: 'Experiencia local auténtica sin esfuerzo',
    icon: Coffee
  }
]

function AnimatedIcon({ icon: Icon, className = '' }: { icon: any, className?: string }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <Icon className={className} />
    </motion.div>
  )
}

function FeatureSection({ feature, index }: { feature: typeof features[0], index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const IconComponent = feature.icon

  return (
    <motion.section
      ref={ref}
      id={feature.id}
      className={`py-20 sm:py-32 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
          {/* Icon & Title Side */}
          <motion.div
            className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}
            initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.gradient} p-4 mb-6`}>
              <AnimatedIcon icon={IconComponent} className="w-full h-full text-white" />
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {feature.title}
            </h2>
            <p className="text-xl text-violet-600 font-semibold mb-6">
              {feature.subtitle}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {feature.description}
            </p>

            <div className="space-y-3 mb-8">
              {feature.features.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start space-x-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link href="/properties/new">
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                  <Home className="w-5 h-5 mr-2" />
                  Crear Mi Primera Propiedad
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}
            initial={{ x: index % 2 === 0 ? 50 : -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className={`relative bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 shadow-2xl`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {feature.features.slice(0, 4).map((_, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: idx * 0.3
                      }}
                    >
                      <div className="w-12 h-12 bg-white/30 rounded-lg mb-2"></div>
                      <div className="w-full h-2 bg-white/30 rounded"></div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <IconComponent className="w-8 h-8 text-violet-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default function FuncionalidadesPage() {
  const { scrollYProgress } = useScroll()
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              duration: 0.8
            }}
            className="inline-block mb-8"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <AnimatedIcon icon={Sparkles} className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl font-bold text-white mb-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Una Nueva Forma de
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Hospitalidad
            </span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Descubre cómo Itineramio revoluciona la experiencia de tus huéspedes con
            manuales digitales inteligentes, accesibles y completamente personalizables.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link href="/properties/new">
              <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl">
                <Home className="w-5 h-5 mr-2" />
                Crear Mi Primera Propiedad
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => document.getElementById('mensajes-automaticos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Funcionalidades
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {[
              { value: '2.5h', label: 'Ahorradas/mes' },
              { value: '24/7', label: 'Disponibilidad' },
              { value: '100%', label: 'Digital' },
              { value: '∞', label: 'Posibilidades' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Sections */}
      {features.map((feature, index) => (
        <React.Fragment key={feature.id}>
          <FeatureSection feature={feature} index={index} />

          {/* Intermediate CTA after 4th feature */}
          {index === 3 && (
            <section className="py-20 sm:py-32 bg-gradient-to-r from-violet-600 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10"></div>

              <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="inline-block mb-8"
                >
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                <motion.h2
                  className="text-3xl sm:text-5xl font-bold text-white mb-6"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  ¿Convencido? ¡Es tu momento!
                </motion.h2>

                <motion.p
                  className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Crea tu primera propiedad ahora y descubre cómo Itineramio
                  transforma la experiencia de tus huéspedes
                </motion.p>

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Link href="/properties/new">
                    <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 text-xl px-10 py-7 shadow-2xl transform hover:scale-105 transition-all">
                      <Home className="w-6 h-6 mr-2" />
                      Crear Mi Primera Propiedad
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                </motion.div>

                <motion.p
                  className="mt-6 text-white/70 text-sm"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  Solo toma 5 minutos. No necesitas tarjeta de crédito.
                </motion.p>
              </div>
            </section>
          )}
        </React.Fragment>
      ))}

      {/* Use Cases Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Situaciones Reales, Soluciones Reales
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Después de más de 5 años perfeccionando este modelo, sabemos que funciona.
              Aquí tienes ejemplos reales de cómo Itineramio te salva el día.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, idx) => {
              const IconComponent = useCase.icon
              return (
                <motion.div
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-violet-400 mb-1">SITUACIÓN</div>
                      <div className="text-white font-medium">{useCase.situation}</div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-red-400 mb-1">PROBLEMA</div>
                      <div className="text-gray-300">{useCase.problem}</div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-green-400 mb-1">SOLUCIÓN ITINERAMIO</div>
                      <div className="text-gray-300">{useCase.solution}</div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-yellow-400 mb-1">RESULTADO</div>
                      <div className="text-white font-medium">{useCase.result}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Empieza a Ahorrar Tiempo y Dinero
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los beneficios van mucho más allá de la tecnología
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => {
              const IconComponent = benefit.icon
              return (
                <motion.div
                  key={idx}
                  className="text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AnimatedIcon icon={IconComponent} className="w-10 h-10 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            ¿Listo para Transformar tu Hospitalidad?
          </motion.h2>

          <motion.p
            className="text-xl text-white/90 mb-12 leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Únete a los anfitriones que ya están ahorrando tiempo, mejorando sus valoraciones
            y ofreciendo experiencias inolvidables a sus huéspedes.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/properties/new">
              <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl">
                <Home className="w-5 h-5 mr-2" />
                Crear Mi Primera Propiedad
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Registrarme
              </Button>
            </Link>
          </motion.div>

          <motion.p
            className="mt-8 text-white/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            Sin compromisos. Cancela cuando quieras.
          </motion.p>
        </div>
      </section>
    </div>
  )
}
