'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  Target,
  AlertCircle,
  RotateCcw,
  ChevronRight,
  Flame
} from 'lucide-react'

interface Question {
  id: string
  question: string
  type: string
  options: string[]
  correctAnswer: number
  explanation: string
  points: number
  order: number
}

interface QuizInterfaceProps {
  quiz: {
    id: string
    title: string
    description: string
    passingScore: number
    timeLimit: number
    maxAttempts: number | null
    points: number
    questions: Question[]
  }
  module: {
    slug: string
    title: string
    courseTitle: string
  }
  attempts: {
    count: number
    canRetake: boolean
    hasPassed: boolean
    bestScore?: number
    recentAttempts: Array<{
      score: number
      passed: boolean
      startedAt: string
    }>
  }
  userId: string
  userName: string
}

type QuizState = 'intro' | 'taking' | 'results'

export default function QuizInterface({
  quiz,
  module,
  attempts,
  userId,
  userName
}: QuizInterfaceProps) {
  const router = useRouter()
  const [state, setState] = useState<QuizState>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null))
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60) // Convert minutes to seconds
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<{
    score: number
    passed: boolean
    totalPoints: number
    earnedPoints: number
    answers: Array<{
      questionId: string
      userAnswer: number | null
      correctAnswer: number
      isCorrect: boolean
      explanation: string
    }>
  } | null>(null)

  // Timer countdown
  useEffect(() => {
    if (state !== 'taking') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          submitQuiz() // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Start quiz
  const startQuiz = async () => {
    try {
      const res = await fetch('/api/academy/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al iniciar el examen')
        return
      }

      setAttemptId(data.attemptId)
      setState('taking')
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert('Error de conexión. Por favor, intenta de nuevo.')
    }
  }

  // Submit quiz
  const submitQuiz = async () => {
    if (isSubmitting || !attemptId) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/academy/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers: answers.map((answer, index) => ({
            questionId: quiz.questions[index].id,
            selectedAnswer: answer
          }))
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al enviar el examen')
        setIsSubmitting(false)
        return
      }

      setResults(data)
      setState('results')
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Select answer
  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  // Navigate questions
  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const answeredCount = answers.filter(a => a !== null).length
  const allAnswered = answeredCount === quiz.questions.length

  // Intro screen
  if (state === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Link
              href="/academia/curso"
              className="flex items-center space-x-2 text-red-100 hover:text-white transition-colors mb-4 sm:mb-6"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Volver al curso</span>
            </Link>

            <h1 className="text-2xl sm:text-4xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-red-100 text-sm sm:text-base">{module.title}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Instrucciones del Examen</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">{quiz.description}</p>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">Tiempo</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{quiz.timeLimit} min</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">Para Aprobar</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{quiz.passingScore}%</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">Puntos</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{quiz.points} pts</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Detalles:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{quiz.questions.length} preguntas de opción múltiple</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Tiempo límite: {quiz.timeLimit} minutos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {quiz.maxAttempts === null
                      ? 'Intentos ilimitados'
                      : `Máximo ${quiz.maxAttempts} intentos`}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Necesitas {quiz.passingScore}% para aprobar</span>
                </li>
              </ul>
            </div>

            {/* Attempts history */}
            {attempts.count > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Tus Intentos:</h3>
                <div className="space-y-2">
                  {attempts.recentAttempts.map((attempt, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        attempt.passed ? 'bg-green-50 border border-green-200' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {attempt.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                          {new Date(attempt.startedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <span className={`font-semibold ${attempt.passed ? 'text-green-600' : 'text-gray-600'}`}>
                        {Math.round(attempt.score)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {attempts.hasPassed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">¡Ya has aprobado este examen!</p>
                    <p className="text-sm text-green-700">
                      Mejor puntuación: {Math.round(attempts.bestScore || 0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!attempts.canRetake && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-red-900">
                    Has alcanzado el número máximo de intentos ({quiz.maxAttempts})
                  </p>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={startQuiz}
                disabled={!attempts.canRetake}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>{attempts.count > 0 ? 'Intentar de Nuevo' : 'Comenzar Examen'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                href="/academia/curso"
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Taking quiz
  if (state === 'taking') {
    const question = quiz.questions[currentQuestion]
    const isLastQuestion = currentQuestion === quiz.questions.length - 1

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header with timer */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">{quiz.title}</h2>
                <p className="text-sm text-gray-400">{module.title}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  timeLeft < 60 ? 'bg-red-600' : 'bg-gray-700'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>
                Pregunta {currentQuestion + 1} de {quiz.questions.length}
              </span>
              <span>
                {answeredCount} de {quiz.questions.length} respondidas
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-red-600 rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-800 rounded-xl p-8 mb-8">
                <div className="flex items-start space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold">{currentQuestion + 1}</span>
                  </div>
                  <h3 className="text-2xl font-semibold flex-1 pt-2">{question.question}</h3>
                </div>

                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full text-left p-5 rounded-lg border-2 transition-all ${
                        answers[currentQuestion] === index
                          ? 'border-red-500 bg-red-900/30'
                          : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion] === index
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-600'
                        }`}>
                          {answers[currentQuestion] === index && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-lg">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Anterior</span>
                </button>

                <div className="text-gray-400 text-sm">
                  {answers[currentQuestion] === null && 'Selecciona una respuesta'}
                </div>

                {isLastQuestion ? (
                  <button
                    onClick={submitQuiz}
                    disabled={!allAnswered || isSubmitting}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
                  >
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Examen'}</span>
                    <CheckCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <span>Siguiente</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Question navigator */}
              <div className="mt-8 bg-gray-800 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-4">NAVEGACIÓN DE PREGUNTAS</h4>
                <div className="grid grid-cols-10 gap-2">
                  {quiz.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        index === currentQuestion
                          ? 'bg-red-600 text-white'
                          : answers[index] !== null
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Results screen
  if (state === 'results' && results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`py-12 ${results.passed ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-gray-600 to-gray-700'} text-white`}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                results.passed ? 'bg-green-500' : 'bg-gray-500'
              }`}
            >
              {results.passed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </motion.div>

            <h1 className="text-4xl font-bold mb-2">
              {results.passed ? '¡Felicidades!' : 'Sigue Intentando'}
            </h1>
            <p className="text-xl mb-6">
              {results.passed
                ? `Has aprobado el examen con ${Math.round(results.score)}%`
                : `Has obtenido ${Math.round(results.score)}%. Necesitas ${quiz.passingScore}% para aprobar.`}
            </p>

            {results.passed && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">+{quiz.points} puntos</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Score breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resultados Detallados</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Puntuación</div>
                <div className="text-3xl font-bold text-blue-600">{Math.round(results.score)}%</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Correctas</div>
                <div className="text-3xl font-bold text-green-600">
                  {results.answers.filter(a => a.isCorrect).length} / {quiz.questions.length}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Puntos</div>
                <div className="text-3xl font-bold text-purple-600">
                  {results.earnedPoints} / {results.totalPoints}
                </div>
              </div>
            </div>

            {/* Review answers */}
            <h3 className="font-semibold text-gray-900 mb-4">Revisión de Respuestas:</h3>
            <div className="space-y-6">
              {results.answers.map((answer, index) => {
                const question = quiz.questions[index]
                return (
                  <div
                    key={question.id}
                    className={`border-2 rounded-lg p-6 ${
                      answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      {answer.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Pregunta {index + 1}: {question.question}
                        </h4>

                        {answer.userAnswer !== null && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Tu respuesta: </span>
                            <span className={`font-medium ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {question.options[answer.userAnswer]}
                            </span>
                          </div>
                        )}

                        {!answer.isCorrect && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Respuesta correcta: </span>
                            <span className="font-medium text-green-700">
                              {question.options[answer.correctAnswer]}
                            </span>
                          </div>
                        )}

                        {answer.explanation && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <p className="text-sm text-gray-700">{answer.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/academia/curso"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Volver al Curso</span>
              <ChevronRight className="w-5 h-5" />
            </Link>

            {!results.passed && attempts.canRetake && (
              <button
                onClick={() => {
                  setAnswers(new Array(quiz.questions.length).fill(null))
                  setCurrentQuestion(0)
                  setTimeLeft(quiz.timeLimit * 60)
                  setResults(null)
                  setState('intro')
                  router.refresh()
                }}
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reintentar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
