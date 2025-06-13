'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff,
  ChevronLeft,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../src/providers/AuthProvider'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  })

  const [messages, setMessages] = useState({
    success: '',
    info: '',
    warning: ''
  })

  // Handle URL parameters for messages
  useEffect(() => {
    const verified = searchParams.get('verified')
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (verified === 'true') {
      setMessages(prev => ({
        ...prev,
        success: '¡Email verificado exitosamente! Ya puedes iniciar sesión.'
      }))
    } else if (error) {
      setErrors(prev => ({
        ...prev,
        general: decodeURIComponent(error)
      }))
    } else if (message) {
      setMessages(prev => ({
        ...prev,
        info: decodeURIComponent(message)
      }))
    }
  }, [searchParams])

  // Demo credentials for testing
  const demoCredentials = {
    email: 'demo@itineramio.com',
    password: 'Demo1234'
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: ''
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors(prev => ({ ...prev, general: '' }))
    
    try {
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          // Redirect to verification page with email
          router.push(`/verify-required?email=${encodeURIComponent(data.email)}`)
          return
        }
        
        setErrors(prev => ({
          ...prev,
          general: data.error || 'Error en el login'
        }))
        return
      }
      
      // Success - redirect to dashboard
      router.push('/main')
      
    } catch (error) {
      console.error('Login error:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: 'Error de conexión. Inténtalo de nuevo.' 
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    // Limpiar error general también
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }))
    }
  }

  const fillDemoCredentials = () => {
    setFormData(demoCredentials)
    setErrors({ email: '', password: '', general: '' })
  }

  const resendVerificationEmail = async () => {
    if (!formData.email) {
      setErrors(prev => ({
        ...prev,
        email: 'Ingresa tu email para reenviar la verificación'
      }))
      return
    }

    setResendingEmail(true)
    setMessages({ success: '', info: '', warning: '' })
    setErrors(prev => ({ ...prev, general: '' }))

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(prev => ({
          ...prev,
          success: 'Email de verificación enviado. Revisa tu bandeja de entrada.'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          general: data.error || 'Error al enviar email de verificación'
        }))
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: 'Error de conexión. Inténtalo de nuevo.'
      }))
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Itineramio
              </span>
            </motion.div>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-gray-600">
                Inicia sesión en tu cuenta de Itineramio
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Demo:</span> Usa estas credenciales para probar
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Email: demo@itineramio.com</div>
                    <div>Contraseña: Demo1234</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fillDemoCredentials}
                    className="mt-2 h-8 px-3 text-xs"
                  >
                    Rellenar automáticamente
                  </Button>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {messages.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-green-700">{messages.success}</span>
                </div>
              </div>
            )}

            {/* Info Message */}
            {messages.info && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">{messages.info}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resendVerificationEmail}
                    disabled={resendingEmail}
                    className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700"
                  >
                    {resendingEmail ? 'Enviando...' : 'Reenviar email'}
                  </Button>
                </div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="pl-10"
                    error={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    error={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-600">Recordarme</span>
                </label>
                
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-violet-600 hover:text-violet-500 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="font-medium text-violet-600 hover:text-violet-500">
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Features reminder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <div className="bg-white/80 rounded-lg p-4 text-sm text-gray-600">
              <span className="font-medium text-violet-600">✨ Primer manual gratis</span> + Solo €5 por manual adicional
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center"><div className="text-center"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600">Cargando...</p></div></div>}>
      <LoginContent />
    </Suspense>
  )
}