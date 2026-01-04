'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Quote,
  Building2,
  MapPin,
  TrendingUp,
  Clock,
  MessageSquare,
  Users,
  ArrowRight,
  Check,
  BadgeCheck
} from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '../../../src/components/layout/Navbar'
import { Footer } from '../../../src/components/layout/Footer'

const successStories = [
  {
    id: 1,
    name: 'María García',
    role: 'Propietaria',
    location: 'Valencia, España',
    properties: 3,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    quote: 'Antes de Itineramio, pasaba horas respondiendo las mismas preguntas sobre la WiFi, el parking y los electrodomésticos. Ahora mis huéspedes tienen todo en su móvil y yo puedo disfrutar de mi tiempo libre.',
    results: {
      questionsReduced: 85,
      timesSaved: 15,
      ratingIncrease: 0.4
    },
    highlight: 'De 4.6 a 5.0 estrellas en 3 meses',
    fullStory: 'María tenía 3 apartamentos en el centro de Valencia. Cada semana recibía más de 20 mensajes con preguntas básicas. Después de implementar Itineramio, sus huéspedes encuentran toda la información antes de preguntar. Su valoración media subió de 4.6 a 5.0 estrellas en solo 3 meses.'
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    role: 'Property Manager',
    location: 'Barcelona, España',
    properties: 12,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    quote: 'Gestiono 12 propiedades y antes era imposible mantener la información actualizada en todas. Con Itineramio, actualizo una vez y se refleja instantáneamente en todos los QRs.',
    results: {
      questionsReduced: 90,
      timesSaved: 40,
      ratingIncrease: 0.3
    },
    highlight: '40 horas/mes ahorradas',
    fullStory: 'Carlos gestiona una cartera de 12 propiedades para diferentes propietarios. La inconsistencia en la información era su mayor dolor de cabeza. Con Itineramio, creó plantillas base y las personaliza para cada propiedad. Ahora ahorra 40 horas mensuales que dedica a captar nuevos clientes.'
  },
  {
    id: 3,
    name: 'Ana Martínez',
    role: 'Superhost Airbnb',
    location: 'Madrid, España',
    properties: 2,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    quote: 'Lo que más me gusta es el código QR personalizado. Lo pongo en la entrada y mis huéspedes ya tienen todo antes de entrar. Es como tener un conserje 24/7.',
    results: {
      questionsReduced: 75,
      timesSaved: 8,
      ratingIncrease: 0.2
    },
    highlight: 'Superhost durante 4 años consecutivos',
    fullStory: 'Ana es Superhost desde hace 4 años. Cuando empezó a crecer, temía perder la calidad de atención personalizada que la diferenciaba. Con Itineramio mantiene ese toque personal pero automatizado. Sus reviews destacan constantemente lo fácil que es encontrar información.'
  },
  {
    id: 4,
    name: 'Javier López',
    role: 'Inversor inmobiliario',
    location: 'Sevilla, España',
    properties: 8,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    quote: 'La analítica me permite ver qué zonas del manual visitan más mis huéspedes. Así descubrí que necesitaba mejorar las instrucciones del aire acondicionado.',
    results: {
      questionsReduced: 88,
      timesSaved: 25,
      ratingIncrease: 0.5
    },
    highlight: '+23% en reservas repetidas',
    fullStory: 'Javier tiene una cartera de 8 propiedades de alto standing en Sevilla. Usaba PDFs que nadie leía. Con Itineramio y sus analíticas, descubrió que el 80% de las consultas eran sobre el sistema domótico. Mejoró esa sección y las quejas desaparecieron. Ahora tiene un 23% más de huéspedes repetidores.'
  },
  {
    id: 5,
    name: 'Laura Sánchez',
    role: 'Co-host profesional',
    location: 'Málaga, España',
    properties: 15,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    quote: 'Mis propietarios están encantados. Les muestro las estadísticas de uso del manual y ven el valor que aporto. Varios han aumentado mi comisión por los resultados.',
    results: {
      questionsReduced: 92,
      timesSaved: 50,
      ratingIncrease: 0.4
    },
    highlight: 'Comisión aumentada en 3 propietarios',
    fullStory: 'Laura trabaja como co-host para 15 propietarios diferentes. Antes era difícil demostrar el valor de su trabajo. Con los reportes de Itineramio, muestra métricas claras: reducción de consultas, aumento de ratings, tiempo de respuesta. Tres propietarios le han aumentado la comisión tras ver los resultados.'
  }
]

const stats = [
  { value: '87%', label: 'Reducción media de consultas', icon: MessageSquare },
  { value: '4.8★', label: 'Rating medio de usuarios', icon: Star },
  { value: '25h', label: 'Horas/mes ahorradas de media', icon: Clock },
  { value: '+500', label: 'Anfitriones activos', icon: Users }
]

export default function CasosDeExitoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              Testimonios Reales
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Casos de Éxito de{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Anfitriones
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Descubre cómo otros anfitriones han transformado la experiencia de sus huéspedes y recuperado su tiempo libre.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <stat.icon className="w-8 h-8 text-violet-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {successStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}
              >
                {/* Image & Stats Side */}
                <div className="w-full lg:w-1/2">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl p-8 relative">
                    {/* Quote Icon */}
                    <Quote className="absolute top-4 right-4 w-12 h-12 text-violet-200" />

                    {/* Profile */}
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={story.avatar}
                        alt={story.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                          <BadgeCheck className="w-5 h-5 text-violet-600" />
                        </div>
                        <p className="text-gray-600">{story.role}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {story.location}
                          <span className="mx-1">•</span>
                          <Building2 className="w-4 h-4" />
                          {story.properties} propiedades
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-lg text-gray-700 italic mb-6">
                      "{story.quote}"
                    </blockquote>

                    {/* Results */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-violet-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-violet-600">-{story.results.questionsReduced}%</div>
                        <div className="text-xs text-gray-600">Consultas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-violet-600">{story.results.timesSaved}h</div>
                        <div className="text-xs text-gray-600">Ahorradas/mes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-violet-600">+{story.results.ratingIncrease}</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                    <TrendingUp className="w-4 h-4" />
                    {story.highlight}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    La historia de {story.name.split(' ')[0]}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {story.fullStory}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="text-gray-700">Implementación en menos de 1 hora</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="text-gray-700">Resultados visibles desde la primera semana</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="text-gray-700">ROI positivo en el primer mes</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para ser el próximo caso de éxito?
            </h2>
            <p className="text-xl text-violet-100 mb-8">
              Únete a más de 500 anfitriones que ya han transformado su negocio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="px-8 py-4 bg-white text-violet-600 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg flex items-center justify-center gap-2">
                  Prueba 15 días gratis
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/hub">
                <button className="px-8 py-4 bg-violet-500 text-white font-semibold rounded-xl hover:bg-violet-400 transition-all border-2 border-violet-400 flex items-center justify-center gap-2">
                  Ver recursos gratuitos
                </button>
              </Link>
            </div>
            <p className="text-violet-200 text-sm mt-6">
              Sin tarjeta de crédito • Setup en 10 minutos • Soporte incluido
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Testimonials Placeholder */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-gray-600">
              Testimonios directos de anfitriones satisfechos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Pedro M.', text: 'Mis huéspedes siempre comentan lo útil que es el manual digital. Ya no tengo que estar pendiente del móvil.' },
              { name: 'Isabel R.', text: 'Recuperé mis fines de semana. Antes respondía mensajes constantemente, ahora todo está automatizado.' },
              { name: 'Miguel A.', text: 'La mejor inversión que he hecho para mi negocio de alquiler vacacional. El ROI es increíble.' }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
