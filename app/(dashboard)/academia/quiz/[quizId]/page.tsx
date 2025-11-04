'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import QuizViewer, { Question } from '@/src/components/academia/QuizViewer'
import { Loader2 } from 'lucide-react'

interface QuizData {
  id: string
  moduleId: string
  title: string
  description: string | null
  passingScore: number
  timeLimit: number | null
  maxAttempts: number | null
  points: number
  questions: Question[]
  previousAttempts: number
  previousBestScore: number | null
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/academia/quiz/${quizId}`)

        if (!response.ok) {
          throw new Error('No se pudo cargar el examen')
        }

        const data = await response.json()
        setQuiz(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el examen')
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId])

  const handleComplete = (score: number, passed: boolean) => {
    // El componente QuizViewer ya manejó el submit
    // Aquí podríamos hacer alguna acción adicional si es necesario
    console.log('Quiz completed:', { score, passed })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Cargando examen...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Examen no encontrado'}</p>
          <button
            onClick={() => router.push('/academia/dashboard')}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <QuizViewer
      quizId={quiz.id}
      moduleId={quiz.moduleId}
      questions={quiz.questions}
      passingScore={quiz.passingScore}
      timeLimit={quiz.timeLimit || undefined}
      maxAttempts={quiz.maxAttempts || undefined}
      previousAttempts={quiz.previousAttempts}
      previousBestScore={quiz.previousBestScore || undefined}
      onComplete={handleComplete}
    />
  )
}
