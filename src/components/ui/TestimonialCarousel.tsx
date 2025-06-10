'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  location: string
  content: string
  rating: number
  avatar: string
  avatarImage: string
  savings: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "María González",
    role: "Anfitriona Airbnb",
    location: "Madrid, España",
    content: "Desde que uso Itineramio, las consultas de mis huéspedes se han reducido un 80%. Ya no tengo que buscar videos en mi galería para explicar cómo funciona la lavadora. Simplemente escanean el QR y ya saben todo.",
    rating: 5,
    avatar: "MG",
    avatarImage: "https://images.unsplash.com/photo-1494790108755-2616b612b8c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
    savings: "80% menos consultas"
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    role: "Propietario de apartamentos turísticos",
    location: "Barcelona, España",
    content: "Mis huéspedes ya no me llaman preguntando cómo cambiar el aire acondicionado de calor a frío. Un simple video en el QR del salón resuelve todo. ¡Es una maravilla!",
    rating: 5,
    avatar: "CR",
    avatarImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    savings: "90% menos llamadas"
  },
  {
    id: 3,
    name: "Ana López",
    role: "Gestora de alojamientos",
    location: "Valencia, España",
    content: "Automaticé completamente la estancia de mis huéspedes. Subo el manual a mis mensajes automáticos y saben desde cómo hacer check-in hasta dónde aparcar. Es increíble.",
    rating: 5,
    avatar: "AL",
    avatarImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    savings: "100% automatizado"
  },
  {
    id: 4,
    name: "José Martín",
    role: "Anfitrión de casa rural",
    location: "Sevilla, España",
    content: "Ya no explico por teléfono cómo desbloquear la vitrocerámica. Con Itineramio, cada electrodoméstico tiene su QR con instrucciones claras. Mis huéspedes están encantados.",
    rating: 5,
    avatar: "JM",
    avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
    savings: "70% menos explicaciones"
  },
  {
    id: 5,
    name: "Laura Fernández",
    role: "Propietaria de villa",
    location: "Málaga, España",
    content: "Tengo una villa con muchos equipos y sistemas. Antes era un caos explicar todo. Ahora cada zona tiene su manual digital y todo funciona perfecto.",
    rating: 5,
    avatar: "LF",
    avatarImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80",
    savings: "85% menos tiempo explicando"
  },
  {
    id: 6,
    name: "Roberto Silva",
    role: "Anfitrión profesional",
    location: "Bilbao, España",
    content: "La lavadora, la cafetera, el horno... todo tiene su QR. Mis huéspedes pueden usar cualquier electrodoméstico sin necesidad de llamarme. Es fantástico.",
    rating: 5,
    avatar: "RS",
    avatarImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
    savings: "95% autonomía huéspedes"
  },
  {
    id: 7,
    name: "Carmen Torres",
    role: "Gestora de apartamentos",
    location: "Granada, España",
    content: "Itineramio ha revolucionado mi negocio. Los huéspedes acceden al manual desde mis mensajes automáticos y tienen toda la información que necesitan al instante.",
    rating: 5,
    avatar: "CT",
    avatarImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1288&q=80",
    savings: "Manual 100% digital"
  },
  {
    id: 8,
    name: "Pedro Jiménez",
    role: "Anfitrión urbano",
    location: "Zaragoza, España",
    content: "Desde el check-in hasta las instrucciones de parking, todo está en el manual digital. Ya no tengo que estar disponible 24/7 para resolver dudas básicas.",
    rating: 5,
    avatar: "PJ",
    avatarImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
    savings: "24/7 sin consultas"
  },
  {
    id: 9,
    name: "Isabel Moreno",
    role: "Propietaria de loft",
    location: "San Sebastián, España",
    content: "Mi loft tiene equipos modernos que pueden ser complicados. Con los QR de Itineramio, hasta los huéspedes menos tecnológicos los usan sin problemas.",
    rating: 5,
    avatar: "IM",
    avatarImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80",
    savings: "0% problemas técnicos"
  },
  {
    id: 10,
    name: "Miguel Castillo",
    role: "Anfitrión de casas completas",
    location: "Salamanca, España",
    content: "Tengo 5 propiedades y Itineramio ha sido un salvavidas. Cada una tiene su manual personalizado y ya no recibo consultas repetitivas. Increíble eficiencia.",
    rating: 5,
    avatar: "MC",
    avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
    savings: "5 propiedades automatizadas"
  }
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros anfitriones
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 10,000 anfitriones han automatizado sus alojamientos y reducido sus consultas hasta un 90%
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-violet-200">
                <Quote className="w-16 h-16" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Rating */}
                <div className="flex items-center mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8 font-medium">
                  "{currentTestimonial.content}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={currentTestimonial.avatarImage}
                        alt={currentTestimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-violet-200 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {currentTestimonial.name}
                      </div>
                      <div className="text-gray-600">
                        {currentTestimonial.role}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentTestimonial.location}
                      </div>
                    </div>
                  </div>

                  {/* Savings Badge */}
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm">
                    {currentTestimonial.savings}
                  </div>
                </div>
              </div>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600 to-purple-600" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-violet-600 transition-colors z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-violet-600 transition-colors z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-violet-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-violet-600 mb-2">80%</div>
            <div className="text-gray-600">Reducción promedio de consultas</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-violet-600 mb-2">24/7</div>
            <div className="text-gray-600">Disponibilidad sin intervención</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-violet-600 mb-2">10k+</div>
            <div className="text-gray-600">Anfitriones satisfechos</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}