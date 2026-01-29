'use client'

import { useState } from 'react'

interface Question {
  id: number
  question: string
  options: {
    label: string
    points: number
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    question: '¿Tienes un checklist de limpieza documentado que usa tu equipo?',
    options: [
      { label: 'Sí, documentado y lo usan', points: 0 },
      { label: 'Está en mi cabeza', points: 1 },
      { label: 'No tengo checklist', points: 1 }
    ]
  },
  {
    id: 2,
    question: '¿Cómo entran tus huéspedes al alojamiento?',
    options: [
      { label: 'Cerradura electrónica sincronizada', points: 0 },
      { label: 'Caja de llaves / KeyCafé', points: 1 },
      { label: 'Les doy la llave en mano', points: 2 }
    ]
  },
  {
    id: 3,
    question: '¿Tienes información del apartamento para el huésped?',
    options: [
      { label: 'Manual digital accesible desde el móvil', points: 0 },
      { label: 'PDF o documento que envío por email', points: 1 },
      { label: 'Guest book en papel', points: 1 },
      { label: 'Se lo explico en persona o por mensaje', points: 2 }
    ]
  },
  {
    id: 4,
    question: '¿Usas mensajes automáticos en Airbnb/Booking?',
    options: [
      { label: 'Sí, todo automatizado', points: 0 },
      { label: 'Algunos mensajes', points: 1 },
      { label: 'No, escribo cada mensaje', points: 2 }
    ]
  },
  {
    id: 5,
    question: '¿Usas precios dinámicos automáticos?',
    options: [
      { label: 'Sí (PriceLabs, Wheelhouse, Beyond...)', points: 0 },
      { label: 'No, los pongo manualmente', points: 1 }
    ]
  },
  {
    id: 6,
    question: '¿Te preguntan lo mismo una y otra vez, incluso habiéndoselo explicado en el check-in?',
    options: [
      { label: 'Constantemente', points: 2 },
      { label: 'A veces', points: 1 },
      { label: 'Casi nunca', points: 0 }
    ]
  },
  {
    id: 7,
    question: '¿Has tenido que parar el coche, la cena o un momento personal para responder un mensaje que el huésped ya debería saber?',
    options: [
      { label: 'Sí, muchas veces', points: 2 },
      { label: 'Alguna vez', points: 1 },
      { label: 'Nunca', points: 0 }
    ]
  },
  {
    id: 8,
    question: '¿Cuántas propiedades gestionas?',
    options: [
      { label: '1-3 propiedades', points: 0 },
      { label: '4-10 propiedades', points: 0 },
      { label: 'Más de 10', points: 0 }
    ]
  }
]

type QuizStep = 'intro' | 'questions' | 'email' | 'result'

interface Result {
  level: 'ceo' | 'transition' | 'bombero'
  title: string
  emoji: string
  message: string
  recommendations: string[]
  cta: {
    text: string
    url: string
  }
}

function getResult(score: number): Result {
  if (score <= 3) {
    return {
      level: 'ceo',
      title: 'Modo CEO',
      emoji: '🟢',
      message: 'Tienes sistemas. Estás en el buen camino para escalar sin estrés.',
      recommendations: [
        'Sigue optimizando tus procesos',
        'Considera herramientas avanzadas de analytics',
        'Documenta todo para poder delegar'
      ],
      cta: {
        text: 'Lleva tus manuales al siguiente nivel',
        url: 'https://www.itineramio.com/register'
      }
    }
  } else if (score <= 7) {
    return {
      level: 'transition',
      title: 'En Transición',
      emoji: '🟡',
      message: 'Tienes algunas cosas automatizadas, pero aún dependes demasiado de ti. Pequeños cambios pueden hacer una gran diferencia.',
      recommendations: [
        'Automatiza los mensajes de check-in y check-out',
        'Crea un manual digital para eliminar preguntas repetitivas',
        'Documenta tu checklist de limpieza'
      ],
      cta: {
        text: 'Crea tu manual digital gratis',
        url: 'https://www.itineramio.com/register'
      }
    }
  } else {
    return {
      level: 'bombero',
      title: 'Modo Bombero',
      emoji: '🔴',
      message: 'Estás apagando fuegos constantemente. Tu negocio depende 100% de ti y eso no escala. Necesitas sistemas.',
      recommendations: [
        'URGENTE: Automatiza los mensajes en Airbnb/Booking',
        'Crea un manual digital para eliminar el 80% de mensajes',
        'Documenta tu checklist de limpieza para delegar',
        'Considera cerraduras electrónicas para check-in autónomo'
      ],
      cta: {
        text: 'Empieza a sistematizar hoy (es gratis)',
        url: 'https://www.itineramio.com/register'
      }
    }
  }
}

export default function BomberoQuiz() {
  const [step, setStep] = useState<QuizStep>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [email, setEmail] = useState('')
  const [propertyCount, setPropertyCount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0)

  const handleAnswer = (questionId: number, points: number, optionLabel: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: points }))

    // Save property count for segmentation
    if (questionId === 8) {
      setPropertyCount(optionLabel)
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setStep('email')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const finalResult = getResult(totalScore)

      const response = await fetch('/api/quiz/bombero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          score: totalScore,
          level: finalResult.level,
          answers,
          propertyCount
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar')
      }

      setResult(finalResult)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Intro screen
  if (step === 'intro') {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 my-8 border border-orange-200">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-5xl mb-4">🔥</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Test: ¿Estás en Modo Bombero?
          </h3>
          <p className="text-gray-600 mb-6">
            Descubre en 2 minutos si estás gestionando tu alojamiento como un CEO
            o si pasas el día apagando fuegos.
          </p>
          <button
            onClick={() => setStep('questions')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Empezar el test
          </button>
          <p className="text-sm text-gray-500 mt-4">
            7 preguntas · Resultado inmediato
          </p>
        </div>
      </div>
    )
  }

  // Questions
  if (step === 'questions') {
    const question = questions[currentQuestion]
    const progress = ((currentQuestion) / questions.length) * 100

    return (
      <div className="bg-white rounded-2xl p-8 my-8 border border-gray-200 shadow-sm">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h4 className="text-xl font-semibold text-gray-900 mb-6">
          {question.question}
        </h4>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(question.id, option.points, option.label)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Email capture
  if (step === 'email') {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 my-8 border border-orange-200">
        <div className="max-w-md mx-auto text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            ¡Test completado!
          </h3>
          <p className="text-gray-600 mb-6">
            Introduce tu email para ver tu resultado personalizado y recibir
            consejos para mejorar tu gestión.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
            />

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Ver mi resultado'}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            No spam. Solo contenido útil para gestores de alojamientos.
          </p>
        </div>
      </div>
    )
  }

  // Result
  if (step === 'result' && result) {
    return (
      <div className={`rounded-2xl p-8 my-8 border ${
        result.level === 'ceo'
          ? 'bg-green-50 border-green-200'
          : result.level === 'transition'
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="max-w-xl mx-auto">
          {/* Score header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{result.emoji}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {result.title}
            </h3>
            <p className="text-gray-600">
              {result.message}
            </p>
            <div className="mt-4 inline-block bg-white/50 px-4 py-2 rounded-full">
              <span className="text-sm text-gray-600">Tu puntuación: </span>
              <span className="font-bold text-gray-900">{totalScore} / 12</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/50 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              {result.level === 'bombero' ? '🚨 Acciones urgentes:' : '💡 Recomendaciones:'}
            </h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href={result.cta.url}
              className={`inline-block font-semibold px-8 py-3 rounded-lg transition-colors ${
                result.level === 'bombero'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : result.level === 'transition'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {result.cta.text}
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}
