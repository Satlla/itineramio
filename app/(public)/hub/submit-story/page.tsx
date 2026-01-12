'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Send,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react'

export default function SubmitStoryPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    authorCompany: '',
    authorRole: '',
    storyTitle: '',
    storyDescription: '',
    challenge: '',
    solution: '',
    results: '',
    propertyType: '',
    propertyCount: '',
    location: '',
    useItineramio: false,
    allowContact: false
  })

  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // TODO: Implementar upload real de imágenes
    // Por ahora solo simulamos
    const newImages = Array.from(files).map(file => URL.createObjectURL(file))
    setImages(prev => [...prev, ...newImages].slice(0, 3)) // Máximo 3 imágenes
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/knowledge/submit-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al enviar historia')
      }

      setSubmitted(true)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar historia')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Historia Recibida!
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Gracias por compartir tu caso de éxito. Nuestro equipo revisará tu historia y
            te contactaremos pronto si la seleccionamos para publicarla en nuestro Centro de Conocimiento.
          </p>

          <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">¿Qué sigue?</h3>
            <ul className="text-left text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">1️⃣</span>
                <span>Revisaremos tu historia en las próximas 48 horas</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2️⃣</span>
                <span>Si la seleccionamos, te contactaremos para confirmar detalles</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3️⃣</span>
                <span>Editaremos el contenido (tú apruebas antes de publicar)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4️⃣</span>
                <span>¡Tu historia aparecerá en el Centro de Conocimiento!</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/casos-de-exito"
              className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
            >
              Ver casos de éxito
            </Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  authorName: '',
                  authorEmail: '',
                  authorCompany: '',
                  authorRole: '',
                  storyTitle: '',
                  storyDescription: '',
                  challenge: '',
                  solution: '',
                  results: '',
                  propertyType: '',
                  propertyCount: '',
                  location: '',
                  useItineramio: false,
                  allowContact: false
                })
                setImages([])
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Enviar Otra Historia
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/hub" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Hub
            </Link>
            <Link href="/" className="text-2xl font-bold text-violet-600">
              Itineramio
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Comparte tu Caso de Éxito
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ¿Has superado un desafío en la gestión de tus apartamentos? ¡Tu experiencia puede ayudar a otros!
            Comparte tu historia y aparece en nuestro Centro de Conocimiento.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-8 mb-12 border-2 border-violet-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Por qué compartir tu historia?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                ✨
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Visibilidad</h4>
                <p className="text-sm text-gray-600">Miles de gestores leerán tu experiencia</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                🤝
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Networking</h4>
                <p className="text-sm text-gray-600">Conecta con otros profesionales</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                💡
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Ayuda</h4>
                <p className="text-sm text-gray-600">Tu conocimiento ayuda a la comunidad</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Información del Autor */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre ti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  required
                  placeholder="Ej: María García"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="authorEmail"
                  value={formData.authorEmail}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa/Nombre comercial
                </label>
                <input
                  type="text"
                  name="authorCompany"
                  value={formData.authorCompany}
                  onChange={handleChange}
                  placeholder="Ej: Apartamentos Del Sol"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu rol
                </label>
                <select
                  name="authorRole"
                  value={formData.authorRole}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                >
                  <option value="">Selecciona...</option>
                  <option value="owner">Propietario</option>
                  <option value="manager">Property Manager</option>
                  <option value="host">Anfitrión</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información de Propiedades */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tus propiedades</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de propiedad
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                >
                  <option value="">Selecciona...</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="villa">Villa</option>
                  <option value="room">Habitación</option>
                  <option value="mixed">Mixto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de propiedades
                </label>
                <input
                  type="number"
                  name="propertyCount"
                  value={formData.propertyCount}
                  onChange={handleChange}
                  min="1"
                  placeholder="Ej: 5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ej: Madrid, España"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Historia */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tu historia</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de tu historia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="storyTitle"
                  value={formData.storyTitle}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Cómo automaticé el check-in y reduje incidencias en un 70%"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
                <p className="text-sm text-gray-500 mt-1">Sé específico y orientado a resultados</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resumen breve <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="storyDescription"
                  value={formData.storyDescription}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Resume tu caso en 2-3 líneas..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuál era el desafío o problema? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="challenge"
                  value={formData.challenge}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe la situación inicial, el problema que enfrentabas, por qué era importante resolverlo..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué solución implementaste? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="solution"
                  value={formData.solution}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Explica paso a paso qué hiciste, qué herramientas usaste, cómo lo implementaste..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué resultados obtuviste? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="results"
                  value={formData.results}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Comparte métricas específicas: % de mejora, ahorro de tiempo, aumento de reviews, reducción de incidencias..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Imágenes (opcional)</h2>
            <p className="text-gray-600 mb-4">Máximo 3 imágenes que ilustren tu historia</p>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 3 && (
              <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-600">Click para subir imágenes</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="useItineramio"
                checked={formData.useItineramio}
                onChange={handleChange}
                className="mt-1 w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <span className="text-gray-700">
                Uso Itineramio para gestionar mis propiedades
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="allowContact"
                checked={formData.allowContact}
                onChange={handleChange}
                className="mt-1 w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <span className="text-gray-700">
                Acepto que me contacten para más detalles sobre mi historia
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Revisaremos tu historia y te contactaremos en 48h
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>{submitting ? 'Enviando...' : 'Enviar Historia'}</span>
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
