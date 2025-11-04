'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quizData, setQuizData] = useState<any>(null)

  // Check for quiz results on mount
  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults')
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults)
        setQuizData(results)
        // Pre-fill email from quiz
        if (results.email) {
          setFormData(prev => ({ ...prev, email: results.email }))
        }
      } catch (err) {
        console.error('Error parsing quiz results:', err)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Include quiz data if available
      const requestData = {
        ...formData,
        quizData: quizData || undefined
      }

      const res = await fetch('/api/academy/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear la cuenta')
        setLoading(false)
        return
      }

      // Clear quiz data from sessionStorage after successful registration
      if (quizData) {
        sessionStorage.removeItem('quizResults')
      }

      // Registro exitoso - redirigir al curso
      router.push('/academia/curso')
    } catch (err) {
      setError('Error de conexión. Por favor, intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/academia" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Academia Itineramio
            </h1>
          </Link>
          <p className="text-gray-600">
            Crea tu cuenta y comienza tu camino a Superhost
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-red-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Crear cuenta
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre completo */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Tu nombre completo"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Se mostrará en tu diploma al finalizar el curso
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Creando cuenta...</span>
              ) : (
                <>
                  <span>Crear cuenta</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/academia/login" className="text-red-600 hover:text-red-700 font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Al crear una cuenta, aceptas nuestros{' '}
          <Link href="/terms" className="text-red-600 hover:underline">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="text-red-600 hover:underline">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  )
}
