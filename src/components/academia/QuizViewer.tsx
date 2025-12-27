'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  Play,
  Target,
  Award,
  ChevronRight,
  Flame
} from 'lucide-react'
import confetti from 'canvas-confetti'

export interface Question {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
  options: string[]
  correctAnswer: number
  explanation?: string
  points: number
}

interface Answer {
  questionId: string
  selectedAnswer: number
}

interface Props {
  quizId: string
  moduleId: string
  questions: Question[]
  passingScore: number
  timeLimit?: number
  maxAttempts?: number
  previousAttempts?: number
  previousBestScore?: number
  onComplete: (score: number, passed: boolean) => void
}

type QuizState = 'start' | 'taking' | 'results'

export default function QuizViewer({
  quizId,
  moduleId,
  questions,
  passingScore,
  timeLimit,
  maxAttempts,
  previousAttempts = 0,
  previousBestScore,
  onComplete
}: Props) {
  const [state, setState] = useState<QuizState>('start')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : 0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [passed, setPassed] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const answeredCount = answers.length
  const progress = (answeredCount / questions.length) * 100

  // Timer
  useEffect(() => {
    if (state === 'taking' && timeLimit && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [state, timeRemaining, timeLimit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setState('taking')
    setStartTime(new Date())
    setAnswers([])
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
  }

  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex)
  }

  const handleNext = () => {
    if (selectedOption === null) return

    // Guardar respuesta
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedOption
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    // Si es la última pregunta, enviar
    if (isLastQuestion) {
      submitQuiz(updatedAnswers)
    } else {
      // Siguiente pregunta
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
    }
  }

  const handleAutoSubmit = useCallback(() => {
    submitQuiz(answers)
  }, [answers])

  const submitQuiz = async (finalAnswers: Answer[]) => {
    const timeSpent = startTime
      ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      : 0

    try {
      const response = await fetch(`/api/academia/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          timeSpent
        })
      })

      if (response.ok) {
        const data = await response.json()
        setScore(data.score)
        setCorrectCount(data.correctAnswers)
        setPassed(data.passed)
        setState('results')

        // Confetti si aprobó
        if (data.passed) {
          triggerConfetti()
        }

        // Callback
        onComplete(data.score, data.passed)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
  }

  const triggerConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  const handleRetry = () => {
    setState('start')
    setAnswers([])
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setTimeRemaining(timeLimit ? timeLimit * 60 : 0)
    setShowReview(false)
  }

  const canRetake = !maxAttempts || previousAttempts < maxAttempts

  // Pantalla de inicio
  if (state === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full mb-4">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Examen del Módulo
            </h1>
            <p className="text-lg text-gray-600">
              Demuestra lo que has aprendido
            </p>
          </div>

          {/* Información del quiz */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-600" />
                <span className="text-gray-700 font-medium">Preguntas</span>
              </div>
              <span className="text-gray-900 font-bold">{questions.length}</span>
            </div>

            {timeLimit && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700 font-medium">Tiempo límite</span>
                </div>
                <span className="text-gray-900 font-bold">{timeLimit} minutos</span>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-violet-600" />
                <span className="text-gray-700 font-medium">Nota mínima</span>
              </div>
              <span className="text-gray-900 font-bold">{passingScore}%</span>
            </div>

            {maxAttempts && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700 font-medium">Intentos</span>
                </div>
                <span className="text-gray-900 font-bold">
                  {previousAttempts} / {maxAttempts}
                </span>
              </div>
            )}
          </div>

          {/* Intentos anteriores */}
          {previousBestScore !== undefined && previousBestScore > 0 && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Mejor puntuación anterior</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{previousBestScore}%</p>
            </div>
          )}

          {/* Botón de inicio */}
          {canRetake ? (
            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Comenzar Examen
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-800 font-semibold">
                Has alcanzado el número máximo de intentos
              </p>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // Tomando el quiz
  if (state === 'taking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header fijo */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">
                  Pregunta {currentQuestionIndex + 1} de {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {answeredCount} respondidas
                </span>
              </div>

              {timeLimit && (
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-600'}`} />
                  <span className={`font-mono font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Pregunta */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {currentQuestionIndex + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentQuestion.question}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {currentQuestion.type === 'MULTIPLE_CHOICE' ? 'Selección múltiple' : 'Verdadero/Falso'}
                        {' • '}
                        {currentQuestion.points} {currentQuestion.points === 1 ? 'punto' : 'puntos'}
                      </p>
                    </div>
                  </div>

                  {/* Opciones */}
                  <div className="space-y-3">
                    {currentQuestion.type === 'TRUE_FALSE' ? (
                      // Verdadero/Falso
                      <>
                        <button
                          onClick={() => handleSelectOption(0)}
                          className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left font-medium ${
                            selectedOption === 0
                              ? 'border-green-500 bg-green-50 text-green-900'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className={selectedOption === 0 ? 'text-green-600' : 'text-gray-400'} />
                            <span className="text-lg">Verdadero</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleSelectOption(1)}
                          className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left font-medium ${
                            selectedOption === 1
                              ? 'border-red-500 bg-red-50 text-red-900'
                              : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <XCircle className={selectedOption === 1 ? 'text-red-600' : 'text-gray-400'} />
                            <span className="text-lg">Falso</span>
                          </div>
                        </button>
                      </>
                    ) : (
                      // Multiple Choice
                      currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectOption(index)}
                          className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedOption === index
                              ? 'border-violet-500 bg-violet-50 text-violet-900'
                              : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedOption === index
                                  ? 'border-violet-600 bg-violet-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedOption === index && (
                                <div className="w-3 h-3 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="text-lg font-medium flex-1">{option}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Botón siguiente */}
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={selectedOption === null}
                    className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all duration-300 ${
                      selectedOption === null
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {isLastQuestion ? 'Finalizar Examen' : 'Siguiente'}
                    {isLastQuestion ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  // Resultados
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-8 ${
            passed
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-red-500 to-pink-600'
          }`}
        >
          <div className="text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6"
            >
              {passed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {passed ? '¡Aprobado!' : 'No Aprobado'}
            </h1>

            <div className="mb-6">
              <div className="text-7xl md:text-8xl font-bold mb-2">{score}%</div>
              <p className="text-xl opacity-90">
                {correctCount} de {questions.length} correctas
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {!showReview ? (
                <>
                  <button
                    onClick={() => setShowReview(true)}
                    className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Ver Respuestas
                  </button>
                  {!passed && canRetake && (
                    <button
                      onClick={handleRetry}
                      className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reintentar
                    </button>
                  )}
                  {passed && (
                    <button
                      onClick={() => window.location.href = `/academia/modulo/${moduleId}`}
                      className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      Continuar
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowReview(false)}
                  className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Ocultar Respuestas
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Review de respuestas */}
        {showReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {questions.map((question, index) => {
              const userAnswer = answers.find((a) => a.questionId === question.id)
              const isCorrect = userAnswer?.selectedAnswer === question.correctAnswer

              return (
                <div
                  key={question.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {index + 1}. {question.question}
                      </h3>

                      {/* Respuesta del usuario */}
                      {userAnswer && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Tu respuesta:</p>
                          <p
                            className={`font-medium ${
                              isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {question.type === 'TRUE_FALSE'
                              ? userAnswer.selectedAnswer === 0
                                ? 'Verdadero'
                                : 'Falso'
                              : question.options[userAnswer.selectedAnswer]}
                          </p>
                        </div>
                      )}

                      {/* Respuesta correcta */}
                      {!isCorrect && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Respuesta correcta:</p>
                          <p className="font-medium text-green-700">
                            {question.type === 'TRUE_FALSE'
                              ? question.correctAnswer === 0
                                ? 'Verdadero'
                                : 'Falso'
                              : question.options[question.correctAnswer]}
                          </p>
                        </div>
                      )}

                      {/* Explicación */}
                      {question.explanation && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Explicación:
                          </p>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
