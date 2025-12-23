'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Target, BookOpen, ArrowRight, Sparkles, CheckCircle2, XCircle, Check, AlertTriangle, Mail, Lock } from 'lucide-react'
import { calculateLevel } from '../../../../../src/data/quiz-questions'

interface QuizResults {
  score: number
  answers: any[]
  email: string
  fullName?: string
  completedAt: string
}

export default function ResultadosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<QuizResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(true)

  useEffect(() => {
    // Get results from sessionStorage
    if (typeof window === 'undefined') return

    const storedResults = sessionStorage.getItem('quizResults')

    if (!storedResults) {
      // No results found - redirect to quiz
      router.push('/academia/quiz')
      return
    }

    let parsed
    try {
      parsed = JSON.parse(storedResults)
    } catch (error) {
      console.error('Error parsing quiz results:', error)
      router.push('/academia/quiz')
      return
    }
    setResults(parsed)

    // Check if user came from verification page
    const verified = searchParams.get('verified') === 'true'

    if (verified) {
      // User just verified their email
      setEmailVerified(true)
      setCheckingVerification(false)
      setLoading(false)
    } else {
      // Check verification status in database
      checkEmailVerification(parsed.email)
    }
  }, [router, searchParams])

  const checkEmailVerification = async (email: string) => {
    try {
      const response = await fetch('/api/academia/quiz/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      setEmailVerified(data.verified || false)
    } catch (error) {
      console.error('Error checking verification:', error)
      setEmailVerified(false)
    } finally {
      setCheckingVerification(false)
      setLoading(false)
    }
  }

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  // Show email verification screen if email is not verified
  if (!checkingVerification && !emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <Mail className="text-white" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                ¡Quiz completado!
              </h1>
              <p className="text-purple-100">
                Solo falta un último paso
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Lock className="text-blue-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Verifica tu email para ver los resultados
                </h2>
                <p className="text-gray-600 text-lg">
                  Te hemos enviado un correo electrónico a:
                </p>
                <p className="text-violet-600 font-semibold text-lg mt-2">
                  {results.email}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Revisa tu bandeja de entrada</p>
                    <p className="text-sm text-gray-600">Busca el email de verificación de Academia Itineramio</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Haz click en el enlace de verificación</p>
                    <p className="text-sm text-gray-600">El enlace te llevará directamente a tus resultados</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Descubre tu nivel y recomendaciones</p>
                    <p className="text-sm text-gray-600">Accede a tu puntuación completa y contenido personalizado</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                <p className="text-sm text-amber-900 text-center">
                  <span className="font-semibold">¿No ves el email?</span> Revisa tu carpeta de spam o correo no deseado
                </p>
              </div>

              <button
                onClick={() => checkEmailVerification(results.email)}
                className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                Ya verifiqué mi email - Ver resultados
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const levelData = calculateLevel(results.score)
  const percentage = Math.round(results.score)

  // Map level to Spanish labels
  const levelLabels = {
    'BASIC': 'Principiante',
    'INTERMEDIATE': 'Intermedio',
    'ADVANCED': 'Avanzado'
  }

  // Filter incorrect answers
  const incorrectAnswers = results.answers.filter((answer: any) => !answer.isCorrect)
  const correctCount = results.answers.length - incorrectAnswers.length

  // Define nextModules based on level
  const nextModulesMap = {
    'BASIC': [
      { icon: '📚', title: 'Fundamentos', description: 'Todo lo básico que necesitas saber' },
      { icon: '🏠', title: 'Tu primera propiedad', description: 'Cómo empezar desde cero' },
      { icon: '📸', title: 'Fotos perfectas', description: 'Atrae más huéspedes' }
    ],
    'INTERMEDIATE': [
      { icon: '📊', title: 'Pricing dinámico', description: 'Maximiza tus ingresos' },
      { icon: '⭐', title: 'Reseñas 5 estrellas', description: 'Estrategias probadas' },
      { icon: '🤖', title: 'Automatización', description: 'Ahorra tiempo y dinero' }
    ],
    'ADVANCED': [
      { icon: '💰', title: 'Revenue Management', description: 'Optimización avanzada' },
      { icon: '📈', title: 'Escalado', description: 'Gestiona múltiples propiedades' },
      { icon: '🏆', title: 'Certificación Superhost', description: 'Fast-track exclusivo' }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center"
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full mb-4">
              <Trophy className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Resultados del Quiz!
            </h1>
            <p className="text-gray-600">
              Has completado todas las preguntas
            </p>
          </div>

          {/* Score Circle */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#c026d3" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {percentage}
                </div>
                <div className="text-sm text-gray-600">de 100 puntos</div>
              </div>
            </div>
          </div>

          {/* Level Badge */}
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{levelData.badge}</span>
              <div className="text-left">
                <div className="text-sm text-gray-600">Tu nivel es</div>
                <div className="text-2xl font-bold text-gray-900">{levelLabels[levelData.level]}</div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto">
            {levelData.message}
          </p>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Target className="text-violet-600" size={28} />
            Recomendaciones personalizadas
          </h2>
          <p className="text-gray-600 mb-6">
            Basadas en tu nivel, estos son los pasos sugeridos:
          </p>

          <div className="space-y-4">
            {levelData.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-violet-50 rounded-lg"
              >
                <CheckCircle2 className="text-violet-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">{rec}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Incorrect Answers Review */}
        {incorrectAnswers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="text-red-600" size={28} />
                  Revisa tus respuestas
                </h2>
                <p className="text-gray-600">
                  Respondiste correctamente {correctCount} de {results.answers.length} preguntas.
                  Aquí puedes revisar las que fallaste:
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {incorrectAnswers.map((answer: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-6 border-2 border-red-100 bg-red-50 rounded-xl"
                >
                  {/* Question */}
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">
                    {answer.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3 mb-4">
                    {answer.options.map((option: any) => {
                      const isUserAnswer = answer.userAnswers.includes(option.id)
                      const isCorrectOption = option.isCorrect
                      const showAsCorrect = isCorrectOption
                      const showAsWrong = isUserAnswer && !isCorrectOption

                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg border-2 ${
                            showAsCorrect
                              ? 'bg-green-50 border-green-500'
                              : showAsWrong
                              ? 'bg-red-50 border-red-500'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {showAsCorrect && (
                              <Check className="text-green-600 flex-shrink-0" size={20} />
                            )}
                            {showAsWrong && (
                              <XCircle className="text-red-600 flex-shrink-0" size={20} />
                            )}
                            <span className={`flex-1 ${
                              showAsCorrect ? 'text-green-900 font-semibold' :
                              showAsWrong ? 'text-red-900 font-semibold' :
                              'text-gray-700'
                            }`}>
                              {option.text}
                            </span>
                            {showAsCorrect && (
                              <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                                Correcta
                              </span>
                            )}
                            {showAsWrong && (
                              <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                                Tu respuesta
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  {answer.explanation && (
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-blue-900">Explicación: </span>
                        {answer.explanation}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Perfect Score Message */}
        {incorrectAnswers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-6 text-center text-white"
          >
            <CheckCircle2 className="mx-auto mb-4" size={48} />
            <h2 className="text-3xl font-bold mb-2">
              ¡Puntuación perfecta!
            </h2>
            <p className="text-green-100">
              Respondiste correctamente todas las preguntas. ¡Excelente trabajo!
            </p>
          </motion.div>
        )}

        {/* Next Modules Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="text-violet-600" size={28} />
            Módulos sugeridos para ti
          </h2>
          <p className="text-gray-600 mb-6">
            Estos módulos están diseñados específicamente para tu nivel
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {nextModulesMap[levelData.level].map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 border-2 border-violet-200 rounded-xl hover:border-violet-400 transition-colors"
              >
                <div className="text-3xl mb-2">{module.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center text-white"
        >
          <Sparkles className="mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-bold mb-2">
            ¡Comienza tu aprendizaje hoy!
          </h2>
          <p className="text-violet-100 mb-6 max-w-2xl mx-auto">
            Regístrate gratis en Academia Itineramio y accede a contenido personalizado
            basado en tu nivel. Empieza a maximizar tus ingresos en Airbnb desde el primer día.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-white text-violet-600 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Crear cuenta gratis
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-violet-700 text-white rounded-lg font-semibold hover:bg-violet-800 transition-all"
            >
              Ya tengo cuenta
            </button>
          </div>

          <p className="text-sm text-violet-200 mt-4">
            Tu email: <span className="font-semibold text-white">{results.email}</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
