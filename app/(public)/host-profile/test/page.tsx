'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { questions, type Dimension } from '@/src/data/hostProfileQuestions'

interface Answer {
  questionId: number
  dimension: Dimension
  value: number
}

export default function HostProfileTestPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'M' | 'F' | 'O' | ''>('')
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((Object.keys(answers).length) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const canGoNext = answers[currentQuestion.id] !== undefined
  const canGoPrevious = currentQuestionIndex > 0

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const goToNext = () => {
    if (canGoNext && !isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else if (canGoNext && isLastQuestion) {
      // Última pregunta respondida, mostrar modal de captura de lead
      setShowLeadModal(true)
    }
  }

  const goToPrevious = () => {
    if (canGoPrevious) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Por favor responde todas las preguntas')
      return
    }

    // Validar email obligatorio
    if (!email || !email.includes('@')) {
      alert('Por favor ingresa un email válido')
      return
    }

    setIsSubmitting(true)

    try {
      const answersArray: Answer[] = questions.map(q => ({
        questionId: q.id,
        dimension: q.dimension,
        value: answers[q.id]
      }))

      const response = await fetch('/api/host-profile/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: answersArray,
          email: email,
          name: name || undefined,
          gender: gender || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Error al enviar el test')
      }

      const data = await response.json()

      // Redirigir a resultados
      router.push(`/host-profile/results/${data.resultId}`)

    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Error al procesar tu test. Por favor intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && canGoNext) {
      goToNext()
    } else if (e.key === 'ArrowLeft' && canGoPrevious) {
      goToPrevious()
    } else if (e.key >= '1' && e.key <= '5') {
      handleAnswer(parseInt(e.key))
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Test de Perfil Operativo
          </h1>
          <p className="text-gray-600 text-lg">
            Descubre tu estilo como anfitrión de alojamientos vacacionales
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(progress)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-6"
          >
            {/* Dimension Badge */}
            <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              {currentQuestion.dimension.replace('_', ' ')}
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <span className={`text-lg font-medium ${
                    answers[currentQuestion.id] === option.value
                      ? 'text-purple-900'
                      : 'text-gray-700 group-hover:text-purple-800'
                  }`}>
                    {option.label}
                  </span>
                  {answers[currentQuestion.id] === option.value && (
                    <CheckCircle2 className="w-6 h-6 text-purple-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Helper text */}
            <p className="mt-6 text-sm text-gray-500 text-center">
              Usa las teclas 1-5 o haz clic para responder
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              canGoPrevious
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
              canGoNext
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? 'Finalizar' : 'Siguiente'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                answers[q.id] !== undefined
                  ? 'bg-purple-600 text-white'
                  : index === currentQuestionIndex
                  ? 'bg-purple-200 text-purple-900 border-2 border-purple-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={`Pregunta ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {showLeadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowLeadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ingresa tu email para ver tus resultados
              </h3>
              <p className="text-gray-600 mb-6">
                Te enviaremos un análisis detallado de tu perfil operativo y recomendaciones personalizadas.
              </p>

              <div className="space-y-4 mb-6">
                {/* Email Input - REQUIRED */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 transition-colors"
                    required
                  />
                </div>

                {/* Name Input - Optional */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre (opcional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 transition-colors"
                  />
                </div>

                {/* Gender Selection - Optional */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Género (opcional)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setGender('M')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        gender === 'M'
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-purple-300 text-gray-700'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={() => setGender('F')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        gender === 'F'
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-purple-300 text-gray-700'
                      }`}
                    >
                      F
                    </button>
                    <button
                      onClick={() => setGender('O')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        gender === 'O'
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-purple-300 text-gray-700'
                      }`}
                    >
                      Otro
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Al continuar, aceptas recibir tu análisis y comunicaciones relacionadas. Puedes darte de baja en cualquier momento.
              </p>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !email}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : 'Ver mis resultados'}
              </button>

              <button
                onClick={() => setShowLeadModal(false)}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 font-medium py-2"
              >
                Volver
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
