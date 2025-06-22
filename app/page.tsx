'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Anfitriona de Airbnb",
    property: "Villa Costa Brava",
    location: "Barcelona, España",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=100&h=100&fit=crop&crop=face",
    comment: "Desde que uso Itineramio, mis huéspedes no me llaman constantemente. Todo está explicado de forma visual y clara. ¡Es un cambio radical!",
    rating: 5
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Propietario de apartamentos",
    property: "Apartamentos Sevilla Center",
    location: "Sevilla, España",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    comment: "Con 8 apartamentos era imposible estar disponible 24/7. Ahora con los códigos QR de Itineramio, cada huésped tiene toda la información al instante.",
    rating: 5
  },
  {
    id: 3,
    name: "Ana Martín",
    role: "Gestora inmobiliaria",
    property: "Edificio Turístico Málaga",
    location: "Málaga, España",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    comment: "Gestiono 25 propiedades y Itineramio me ha ahorrado horas semanales. Los manuales multiidioma son perfectos para turistas internacionales.",
    rating: 5
  },
  {
    id: 4,
    name: "David López",
    role: "Anfitrión Airbnb",
    property: "Casa Rural Valencia",
    location: "Valencia, España",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    comment: "Los huéspedes valoran muchísimo tener toda la información organizada. Mi rating ha subido desde que implementé Itineramio.",
    rating: 5
  },
  {
    id: 5,
    name: "Laura Fernández",
    role: "Propietaria de apartamento",
    property: "Loft Moderno Madrid",
    location: "Madrid, España",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    comment: "La integración con WhatsApp es genial. Solo me escriben para emergencias reales, no para preguntar dónde está el WiFi.",
    rating: 5
  }
]

export default function HomePage() {
  const router = useRouter()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          // User is logged in, redirect to dashboard
          router.push('/main')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }
    
    checkAuth()
  }, [router])

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const scrollToTestimonials = () => {
    document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mobile Optimized */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Itineramio</span>
          </div>
          
          {/* Mobile: Only Login Button */}
          <div className="block sm:hidden">
            <Link 
              href="/login"
              className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Desktop: Both Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link 
              href="/register"
              className="px-4 py-2 rounded-lg border border-violet-600 text-violet-600 hover:bg-violet-50 transition-colors"
            >
              Registrarse
            </Link>
            <Link 
              href="/login"
              className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Crea manuales digitales para tus{' '}
              <span className="text-violet-600">propiedades</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Reduce las consultas de tus huéspedes con manuales interactivos y códigos QR. 
              Perfecto para Airbnb y alquileres vacacionales.
            </p>
            
            {/* Mobile Register Button */}
            <div className="mb-12">
              <Link 
                href="/register"
                className="bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors inline-block"
              >
                Regístrate gratis
              </Link>
            </div>
          </div>

          {/* Apple-style Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-violet-100 via-purple-50 to-blue-100 rounded-3xl p-8 sm:p-16 overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5"></div>
              <div className="absolute top-10 left-10 w-32 h-32 bg-violet-200/30 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl"></div>
              
              {/* Person with Phone - Centered */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Person Silhouette */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full relative">
                    {/* Head shape */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-20 sm:w-20 sm:h-24 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full"></div>
                  </div>
                  
                  {/* Phone in hand */}
                  <div className="absolute -right-8 top-8 sm:-right-12 sm:top-12">
                    <div className="w-16 h-28 sm:w-20 sm:h-32 bg-gray-900 rounded-2xl shadow-2xl transform rotate-12 relative border-2 border-gray-700">
                      {/* Phone screen */}
                      <div className="absolute inset-1 bg-white rounded-xl overflow-hidden">
                        <div className="h-full bg-gradient-to-b from-violet-50 to-white p-1">
                          {/* Mini app interface */}
                          <div className="h-2 bg-violet-600 rounded-sm mb-1"></div>
                          <div className="space-y-1">
                            <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-1 bg-violet-300 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Zone Cards */}
                <div className="relative w-full max-w-lg">
                  {/* Zone Card 1 - Check-in */}
                  <div className="absolute -top-4 -left-4 sm:-left-8 bg-white rounded-xl shadow-xl p-3 sm:p-4 transform -rotate-12 border border-gray-100 z-20">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🗝️</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">Check-in</div>
                        <div className="text-xs text-gray-500">Código: 1234</div>
                      </div>
                    </div>
                  </div>

                  {/* Zone Card 2 - WiFi */}
                  <div className="absolute -top-2 -right-4 sm:-right-8 bg-white rounded-xl shadow-xl p-3 sm:p-4 transform rotate-12 border border-gray-100 z-20">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">📶</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">WiFi</div>
                        <div className="text-xs text-gray-500">Casa_2024</div>
                      </div>
                    </div>
                  </div>

                  {/* Zone Card 3 - Kitchen */}
                  <div className="absolute top-12 -left-2 sm:-left-6 bg-white rounded-xl shadow-xl p-3 sm:p-4 transform -rotate-6 border border-gray-100 z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🍳</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">Cocina</div>
                        <div className="text-xs text-gray-500">Instrucciones</div>
                      </div>
                    </div>
                  </div>

                  {/* Zone Card 4 - Parking */}
                  <div className="absolute top-16 -right-2 sm:-right-6 bg-white rounded-xl shadow-xl p-3 sm:p-4 transform rotate-6 border border-gray-100 z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🚗</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">Parking</div>
                        <div className="text-xs text-gray-500">Plaza 15</div>
                      </div>
                    </div>
                  </div>

                  {/* Central Phone Mockup */}
                  <div className="mx-auto w-48 h-80 sm:w-56 sm:h-96 bg-gray-900 rounded-3xl shadow-2xl relative border-4 border-gray-800">
                    {/* Screen */}
                    <div className="absolute inset-2 bg-white rounded-2xl overflow-hidden">
                      <div className="h-full bg-gradient-to-b from-violet-50 to-white p-4">
                        {/* Status bar */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-xs text-gray-600">9:41</div>
                          <div className="flex space-x-1">
                            <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* App content */}
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-gray-900">Villa Costa Brava</h3>
                          <p className="text-xs text-gray-500">Manual del apartamento</p>
                        </div>
                        
                        {/* Zone list */}
                        <div className="space-y-2">
                          {['Check-in', 'WiFi', 'Cocina', 'Parking', 'Check-out'].map((zone, index) => (
                            <div key={zone} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center space-x-2">
                              <div className="w-6 h-6 bg-violet-100 rounded flex items-center justify-center">
                                <span className="text-xs">{index + 1}</span>
                              </div>
                              <span className="text-xs font-medium text-gray-900">{zone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Home indicator */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link 
                href="/register"
                className="bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors flex-1"
              >
                Regístrate gratis
              </Link>
              <button 
                onClick={scrollToTestimonials}
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex-1"
              >
                Ver testimonios
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              ✨ Primer manual gratis • Solo €5 por manual adicional
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Todo lo que necesitas
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Acceso vía QR</h3>
              <p className="text-gray-600">
                Los huéspedes escanean el código QR y acceden al manual instantáneamente
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiidioma</h3>
              <p className="text-gray-600">
                Traduce automáticamente tu manual a múltiples idiomas
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">WhatsApp integrado</h3>
              <p className="text-gray-600">
                Botón directo para que te contacten cuando necesiten ayuda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Lo que dicen nuestros anfitriones
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Miles de propietarios confían en Itineramio para mejorar la experiencia de sus huéspedes
          </p>
          
          {/* Testimonial Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img 
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-violet-100"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-center sm:text-left">
                    {/* Quote */}
                    <div className="mb-6">
                      <div className="text-4xl text-violet-200 mb-2">"</div>
                      <p className="text-lg sm:text-xl text-gray-700 leading-relaxed italic">
                        {testimonials[currentTestimonial].comment}
                      </p>
                    </div>
                    
                    {/* Author Info */}
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-violet-600 font-medium mb-1">
                        {testimonials[currentTestimonial].role}
                      </p>
                      <p className="text-gray-500 text-sm mb-2">
                        {testimonials[currentTestimonial].property}
                      </p>
                      <p className="text-gray-400 text-sm mb-3">
                        📍 {testimonials[currentTestimonial].location}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex justify-center sm:justify-start space-x-1">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-lg">⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Precios transparentes
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Sin suscripciones. Solo pagas por lo que usas.
          </p>
          
          <div className="bg-white border-2 border-violet-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Pago por manual</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-violet-600">Gratis</span>
              <span className="text-gray-600 ml-2">primer manual</span>
            </div>
            <div className="mb-8">
              <span className="text-2xl font-bold text-gray-900">€5</span>
              <span className="text-gray-600 ml-2">por manual adicional</span>
            </div>
            <Link 
              href="/register"
              className="block w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors"
            >
              Regístrate gratis
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-violet-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para mejorar la experiencia de tus huéspedes?
          </h2>
          <p className="text-xl text-violet-100 mb-8">
            Únete a miles de propietarios que ya usan Itineramio
          </p>
          <Link 
            href="/register"
            className="bg-white text-violet-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Regístrate gratis ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">I</span>
                </div>
                <span className="text-xl font-bold">Itineramio</span>
              </div>
              <p className="text-gray-400">
                Crea manuales digitales interactivos para propiedades de alquiler vacacional.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Características</a></li>
                <li><a href="#" className="hover:text-white">Precios</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white">Términos</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Itineramio. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}