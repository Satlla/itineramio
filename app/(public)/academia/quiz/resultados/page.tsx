'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Target, BookOpen, ArrowRight, Sparkles, CheckCircle2, XCircle, Check, AlertTriangle } from 'lucide-react'
import { calculateLevel } from '../../../../../src/data/quiz-questions'

interface QuizResults {
  score: number
  answers: any[]
  email: string
  completedAt: string
}

export default function ResultadosPage() {
  const router = useRouter()
  const [results, setResults] = useState<QuizResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get results from sessionStorage
    const storedResults = sessionStorage.getItem('quizResults')

    if (!storedResults) {
      // No results found - redirect to quiz
      router.push('/academia/quiz')
      return
    }

    const parsed = JSON.parse(storedResults)
    setResults(parsed)
    setLoading(false)
  }, [router])

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
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
              onClick={() => router.push('/academia/registro')}
              className="px-8 py-4 bg-white text-violet-600 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Crear cuenta gratis
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => router.push('/academia/login')}
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
