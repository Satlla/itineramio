'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Sparkles, Clock, Mail, User, AlertCircle } from 'lucide-react'
import { quizQuestions, calculateQuestionScore, type QuizQuestion } from '@/data/quiz-questions'
import { isDisposableEmail } from '@/lib/disposable-emails'

export default function QuizPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string[]>>({})
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [showEmailCapture, setShowEmailCapture] = useState(true) // Start with email capture
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(20 * 60) // 20 minutes in seconds
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)

  const currentQuestion = quizStarted ? quizQuestions[currentQuestionIndex] : null
  const progress = quizStarted ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100 : 0
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1
  const hasAnswer = currentQuestion ? answers[currentQuestion.id]?.length > 0 : false

  // Timer countdown effect
  useEffect(() => {
    if (!quizStarted || isSubmitting || showTimeoutModal) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowTimeoutModal(true)
          handleSubmit() // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, isSubmitting, showTimeoutModal])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timeRemaining > 600) return 'text-green-600' // > 10 min
    if (timeRemaining > 300) return 'text-yellow-600' // > 5 min
    return 'text-red-600' // < 5 min
  }

  const handleAnswer = (optionId: string) => {
    if (!currentQuestion) return
    const question = currentQuestion

    if (question.type === 'single-choice') {
      setAnswers(prev => ({
        ...prev,
        [question.id]: [optionId]
      }))
    } else if (question.type === 'multiple-choice') {
      setAnswers(prev => {
        const current = prev[question.id] || []
        const isSelected = current.includes(optionId)

        return {
          ...prev,
          [question.id]: isSelected
            ? current.filter(id => id !== optionId)
            : [...current, optionId]
        }
      })
    }
  }

  const handleStartQuiz = async () => {
    // Reset previous errors
    setEmailError('')

    // Basic validation
    if (!email || !fullName) {
      setEmailError('Por favor completa todos los campos')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido')
      return
    }

    // Check for disposable email
    if (isDisposableEmail(email)) {
      setEmailError('No se permiten emails temporales o desechables. Por favor usa un email real.')
      return
    }

    // Check if email has already taken the quiz (server-side validation)
    setIsValidatingEmail(true)
    try {
      const response = await fetch('/api/academia/quiz/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.alreadyTaken) {
        setEmailError('Este email ya ha realizado el quiz. Solo se permite un intento por usuario.')
        setIsValidatingEmail(false)
        return
      }

      if (!response.ok) {
        setEmailError('Error al validar email. Por favor intenta nuevamente.')
        setIsValidatingEmail(false)
        return
      }

      // All validation passed - start quiz
      setIsValidatingEmail(false)
      setShowEmailCapture(false)
      setQuizStarted(true)
    } catch (error) {
      console.error('Email validation error:', error)
      setEmailError('Error de conexión. Por favor intenta nuevamente.')
      setIsValidatingEmail(false)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Calcular puntuación total
    let totalScore = 0
    const answerDetails: any[] = []

    quizQuestions.forEach(question => {
      const userAnswers = answers[question.id] || []
      const score = calculateQuestionScore(question, userAnswers)
      totalScore += score

      // Determine which answers are correct/incorrect
      const correctOptionIds = question.options.filter(opt => opt.isCorrect).map(opt => opt.id)
      const isCorrect = score === question.points

      answerDetails.push({
        questionId: question.id,
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        userAnswers,
        correctAnswers: correctOptionIds,
        score,
        maxScore: question.points,
        isCorrect,
        options: question.options,
        explanation: question.explanation,
        type: question.type
      })
    })

    // Guardar en sessionStorage para la página de resultados
    sessionStorage.setItem('quizResults', JSON.stringify({
      score: totalScore,
      answers: answerDetails,
      email: email,
      fullName: fullName,
      completedAt: new Date().toISOString(),
      timeElapsed: 20 * 60 - timeRemaining // Time spent in seconds
    }))

    // Guardar en base de datos (sin usuario aún) y enviar email con resultados
    try {
      await fetch('/api/academia/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          score: totalScore,
          answers: answerDetails,
          timeElapsed: 20 * 60 - timeRemaining
        })
      })
    } catch (error) {
      console.error('Error saving quiz:', error)
    }

    // Redirigir a resultados
    router.push('/academia/quiz/resultados')
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FUNDAMENTOS': return 'from-green-500 to-emerald-600'
      case 'OPTIMIZACIÓN': return 'from-blue-500 to-cyan-600'
      case 'AVANZADO': return 'from-purple-500 to-pink-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header - Only show when quiz has started */}
      {quizStarted && (
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Academia Itineramio
                </h1>
                <p className="text-sm text-purple-200">
                  Pregunta {currentQuestionIndex + 1} de {quizQuestions.length}
                </p>
              </div>
              <div className="flex items-center gap-6">
                {/* Timer */}
                <div className="text-right bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                  <div className={`text-xl font-bold flex items-center gap-2 ${getTimerColor() === 'text-red-600' ? 'text-red-400' : getTimerColor() === 'text-yellow-600' ? 'text-yellow-400' : 'text-green-400'}`}>
                    <Clock size={20} />
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-purple-200 mt-1">Tiempo restante</div>
                </div>
                {/* Progress */}
                <div className="text-right bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                  <div className="text-xl font-bold text-white">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-xs text-purple-200 mt-1">Completado</div>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/20">
              <motion.div
                className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 h-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Timeout Modal */}
      <AnimatePresence>
        {showTimeoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="text-red-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Tiempo agotado!
                </h2>
                <p className="text-gray-600 mb-6">
                  Se acabó el tiempo para completar el quiz. Tus respuestas hasta el momento han sido guardadas.
                </p>
                <button
                  onClick={() => router.push('/academia/quiz/resultados')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Ver mis resultados
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <AnimatePresence mode="wait">
          {showEmailCapture ? (
            // Email Capture Form - START OF QUIZ
            <motion.div
              key="email-capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              {/* Decorative blobs */}
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                      <Sparkles className="text-white" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                      ¿Cuánto sabes sobre Airbnb?
                    </h2>
                    <p className="text-purple-100 text-lg">
                      Descubre tu nivel de conocimiento sobre hosting profesional
                    </p>
                  </div>
                </div>

                <div className="p-8">
                  {/* Info Badge */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl mb-8">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">20 minutos • 20 preguntas</p>
                      <p className="text-xs text-amber-700">Tu nivel se determinará al finalizar</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
                          <User size={14} className="text-violet-600" />
                        </div>
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre completo"
                        className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-gray-900 placeholder-gray-400"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
                          <Mail size={14} className="text-violet-600" />
                        </div>
                        Email profesional
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setEmailError('')
                        }}
                        placeholder="tu@email.com"
                        className={`w-full px-5 py-4 bg-white border-2 rounded-xl focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${
                          emailError
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:ring-violet-500 focus:border-violet-500'
                        }`}
                      />
                    </div>

                    {emailError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                      >
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-red-700 font-medium">{emailError}</p>
                      </motion.div>
                    )}

                    <button
                      onClick={handleStartQuiz}
                      disabled={!email || !fullName || isValidatingEmail}
                      className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative z-10">
                        {isValidatingEmail ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2 inline-block"></div>
                            Validando email...
                          </>
                        ) : (
                          <>
                            Comenzar Quiz
                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>

                    <p className="text-xs text-gray-500 text-center pt-2">
                      🔒 Tus datos están protegidos. Recibirás tus resultados por email.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : quizStarted && currentQuestion ? (
            // Question Card
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="relative"
            >
              {/* Decorative elements */}
              <div className="absolute -top-2 -left-2 w-64 h-64 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-2 -right-2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${getCategoryColor(currentQuestion.category)} p-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{currentQuestion.category === 'FUNDAMENTOS' ? '📚' : currentQuestion.category === 'OPTIMIZACIÓN' ? '⚡' : '🚀'}</span>
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-medium">{currentQuestion.category}</p>
                        <p className="text-white text-lg font-bold">{currentQuestion.points} puntos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/90 text-sm">Pregunta</p>
                      <p className="text-white text-2xl font-bold">{currentQuestionIndex + 1}/{quizQuestions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {/* Question */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                    {currentQuestion.question}
                  </h2>

                  {/* Multiple choice indicator */}
                  {currentQuestion.type === 'multiple-choice' && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Check className="text-white" size={16} />
                      </div>
                      <p className="text-sm text-blue-900 font-semibold">
                        Pregunta de opción múltiple - Selecciona todas las correctas
                      </p>
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentQuestion.id]?.includes(option.id)
                      const isMultiple = currentQuestion.type === 'multiple-choice'

                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer(option.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${
                            isSelected
                              ? 'border-violet-600 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg shadow-violet-200/50'
                              : 'border-gray-200 hover:border-violet-300 bg-white hover:shadow-md'
                          }`}
                        >
                          {/* Selected indicator gradient */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5"></div>
                          )}

                          <div className="flex items-center gap-4 relative z-10">
                            {/* Letter badge */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-violet-100 group-hover:text-violet-600'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>

                            <span className={`flex-1 text-base leading-relaxed transition-all ${
                              isSelected ? 'font-semibold text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                            }`}>
                              {option.text}
                            </span>

                            {/* Check indicator */}
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-violet-600 bg-violet-600 scale-110'
                                : 'border-gray-300 group-hover:border-violet-300'
                            }`}>
                              {isSelected && (
                                <Check className="text-white" size={16} strokeWidth={3} />
                              )}
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Navigation */}
        {quizStarted && !showEmailCapture && (
          <div className="flex items-center justify-between mt-8 gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-white/40 rounded-2xl font-bold text-white hover:bg-white/90 hover:text-violet-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!hasAnswer || isSubmitting}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Calculando resultados...
                  </>
                ) : isLastQuestion ? (
                  <>
                    <span className="hidden sm:inline">Ver Resultados</span>
                    <span className="sm:hidden">Resultados</span>
                    <Sparkles size={24} className="group-hover:scale-110 transition-transform" />
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Siguiente Pregunta</span>
                    <span className="sm:hidden">Siguiente</span>
                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
