'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Itineramio</span>
          </div>
          <div className="flex items-center space-x-3">
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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Crea manuales digitales para tus{' '}
            <span className="text-violet-600">propiedades</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Reduce las consultas de tus huéspedes con manuales interactivos y códigos QR. 
            Perfecto para Airbnb y alquileres vacacionales.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors"
            >
              Comenzar gratis
            </Link>
            <Link 
              href="/login"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Ver demo
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            ✨ Primer manual gratis • Solo €5 por manual adicional
          </p>
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

      {/* Pricing */}
      <section className="py-20">
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
              Comenzar gratis
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
            Comenzar gratis ahora
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