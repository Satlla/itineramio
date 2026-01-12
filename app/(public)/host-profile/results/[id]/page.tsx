'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Mail, CheckCircle2, Award, AlertCircle, BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import ResultCard from '@/components/host-profile/ResultCard'
import { archetypeDescriptions, dimensionLabels, type Archetype, type Dimension } from '@/data/hostProfileQuestions'

// Mapeo de arquetipos a slugs de lead magnets (deben coincidir con src/data/lead-magnets.ts)
const archetypeToSlug: Record<Archetype, string> = {
  ESTRATEGA: 'estratega-5-kpis',
  SISTEMATICO: 'organizador-47-tareas',
  DIFERENCIADOR: 'diferenciador-storytelling',
  EJECUTOR: 'ejecutor-modo-ceo',
  RESOLUTOR: 'resolutor-27-crisis',
  EXPERIENCIAL: 'experiencial-corazon-escalable',
  EQUILIBRADO: 'equilibrado-versatil-excepcional',
  IMPROVISADOR: 'improvisador-kit-anti-caos'
}

interface TestResult {
  id: string
  archetype: Archetype
  topStrength: string
  criticalGap: string
  scores: {
    scoreHospitalidad: number
    scoreComunicacion: number
    scoreOperativa: number
    scoreCrisis: number
    scoreData: number
    scoreLimites: number
    scoreMkt: number
    scoreBalance: number
  }
  email?: string | null
}

// Blog recommendations por arquetipo
const blogRecommendations: Record<Archetype, Array<{
  title: string
  description: string
  url: string
}>> = {
  ESTRATEGA: [
    {
      title: 'Cómo optimizar tu RevPAR con pricing dinámico',
      description: 'Aprende a maximizar ingresos ajustando precios según demanda',
      url: '/blog/revpar-pricing-dinamico'
    },
    {
      title: 'Análisis de competencia: herramientas esenciales',
      description: 'Las mejores herramientas para monitorizar a tu competencia',
      url: '/blog/analisis-competencia'
    }
  ],
  SISTEMATICO: [
    {
      title: 'Crea protocolos efectivos para tu equipo',
      description: 'Guía completa para documentar y sistematizar operaciones',
      url: '/blog/protocolos-operativos'
    },
    {
      title: 'Automatización: ahorra tiempo sin perder calidad',
      description: 'Qué tareas automatizar y cuáles mantener manuales',
      url: '/blog/automatizacion-efectiva'
    }
  ],
  DIFERENCIADOR: [
    {
      title: 'Cómo destacar en un mercado saturado',
      description: 'Estrategias de diferenciación para vacation rentals',
      url: '/blog/diferenciacion-mercado'
    },
    {
      title: 'Gestión de reseñas: convierte críticas en oportunidades',
      description: 'Cómo responder a reseñas y mejorar tu reputación',
      url: '/blog/gestion-reseñas'
    }
  ],
  EJECUTOR: [
    {
      title: 'Evita el burnout: delega sin perder control',
      description: 'Estrategias para crecer sin comprometer tu salud',
      url: '/blog/evitar-burnout'
    },
    {
      title: 'Rotación eficiente: maximiza ocupación',
      description: 'Cómo reducir tiempos muertos entre reservas',
      url: '/blog/rotacion-eficiente'
    }
  ],
  RESOLUTOR: [
    {
      title: 'Planes de contingencia: qué incluir',
      description: 'Prepárate para emergencias antes de que ocurran',
      url: '/blog/planes-contingencia'
    },
    {
      title: 'De la queja a la reseña 5 estrellas',
      description: 'Cómo convertir problemas en oportunidades de mejora',
      url: '/blog/recuperacion-servicio'
    }
  ],
  EXPERIENCIAL: [
    {
      title: 'Personalización que enamora huéspedes',
      description: 'Ideas de toques personales que generan reseñas increíbles',
      url: '/blog/personalizacion-experiencia'
    },
    {
      title: 'Sistematiza la hospitalidad sin perder la magia',
      description: 'Cómo escalar sin perder el toque personal',
      url: '/blog/sistematizar-hospitalidad'
    }
  ],
  EQUILIBRADO: [
    {
      title: 'Crece estratégicamente sin perder balance',
      description: 'Cómo expandir tu negocio de forma sostenible',
      url: '/blog/crecimiento-sostenible'
    },
    {
      title: 'Experimenta con nuevas estrategias',
      description: 'Testing A/B para alojamientos vacacionales',
      url: '/blog/testing-estrategias'
    }
  ],
  IMPROVISADOR: [
    {
      title: 'Crea sistemas sin perder flexibilidad',
      description: 'Estructura básica que te permite seguir adaptándote',
      url: '/blog/sistemas-flexibles'
    },
    {
      title: 'Herramientas digitales que realmente funcionan',
      description: 'PMS y automatizaciones para hosts desorganizados',
      url: '/blog/herramientas-improvisadores'
    }
  ]
}

export default function ResultsPage() {
  const params = useParams()
  const id = params.id as string

  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailSaved, setEmailSaved] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/host-profile/result/${id}`)

        if (!response.ok) {
          throw new Error('No se pudo cargar el resultado')
        }

        const data = await response.json()
        setResult(data)

        // Si ya tiene email guardado
        if (data.email) {
          setEmailSaved(true)
        }
      } catch (err) {
        console.error('Error loading result:', err)
        setError('No se pudo cargar tu resultado. Por favor, verifica el enlace.')
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [id])

  const handleSaveEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Por favor ingresa un email válido')
      return
    }

    setSavingEmail(true)

    try {
      const response = await fetch(`/api/host-profile/save-email`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resultId: id,
          email,
          emailConsent: true
        })
      })

      if (!response.ok) {
        throw new Error('Error al guardar email')
      }

      setEmailSaved(true)
    } catch (error) {
      console.error('Error saving email:', error)
      alert('Error al guardar tu email. Por favor intenta de nuevo.')
    } finally {
      setSavingEmail(false)
    }
  }

  const handleShare = (platform: 'facebook' | 'linkedin' | 'twitter' | 'whatsapp') => {
    const url = window.location.href
    const text = `Acabo de descubrir mi Perfil Operativo como anfitrión: ${archetypeDescriptions[result!.archetype].name}. ¿Cuál es el tuyo?`

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando tus resultados...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/host-profile/test"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Realizar test nuevamente
          </a>
        </div>
      </div>
    )
  }

  const archetypeInfo = archetypeDescriptions[result.archetype]
  const scores = {
    HOSPITALIDAD: result.scores.scoreHospitalidad,
    COMUNICACION: result.scores.scoreComunicacion,
    OPERATIVA: result.scores.scoreOperativa,
    CRISIS: result.scores.scoreCrisis,
    DATA: result.scores.scoreData,
    LIMITES: result.scores.scoreLimites,
    MKT: result.scores.scoreMkt,
    BALANCE: result.scores.scoreBalance
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tu Perfil Operativo
          </h1>
          <p className="text-xl text-gray-600">
            Descubre tus fortalezas y áreas de mejora como anfitrión
          </p>
        </motion.div>

        {/* Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <ResultCard
            archetype={result.archetype}
            topStrength={result.topStrength}
            criticalGap={result.criticalGap}
            scores={scores}
          />
        </motion.div>

        {/* Share Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Comparte tu resultado
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Comparte tu perfil con otros anfitriones y descubre el suyo
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 px-6 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 px-6 py-3 bg-[#0A66C2] hover:bg-[#095196] text-white font-semibold rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 px-6 py-3 bg-[#1DA1F2] hover:bg-[#1A8CD8] text-white font-semibold rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Twitter
              </button>

              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lead Magnet CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Guía Personalizada · 100% Gratis</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para llevar tu perfil al siguiente nivel?
              </h3>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Hemos preparado una guía específica para anfitriones como tú:
                <span className="font-bold"> {archetypeInfo.name}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              <h4 className="font-bold text-xl mb-3">📚 Tu guía incluye:</h4>
              <ul className="space-y-2">
                {archetypeInfo.name === 'Estratega' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>5 KPIs esenciales para maximizar tu RevPAR</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Dashboard Excel + Calculadora de RevPAN</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Benchmarks reales del sector</span>
                    </li>
                  </>
                )}
                {archetypeInfo.name === 'Sistemático' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>47 tareas automatizables priorizadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Excel con las 47 tareas + Template de SOPs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Ahorra 25-30 horas al mes</span>
                    </li>
                  </>
                )}
                {/* Otros arquetipos siguen el mismo patrón */}
                {!['Estratega', 'Sistemático'].includes(archetypeInfo.name) && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Contenido práctico y accionable</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Plantillas y recursos descargables</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Estrategias específicas para tu perfil</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="text-center">
              <a
                href={`/recursos/${archetypeToSlug[result.archetype]}`}
                className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold text-lg py-4 px-8 rounded-xl hover:bg-gray-100 transition-all shadow-xl"
              >
                <BookOpen className="w-6 h-6" />
                Descargar mi guía personalizada gratis
                <ArrowRight className="w-6 h-6" />
              </a>
              <p className="text-sm text-white/70 mt-4">
                Sin spam · Descarga inmediata · Prueba 15 días sin compromiso
              </p>
            </div>
          </div>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {/* Strengths */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900">Fortalezas</h3>
            </div>
            <ul className="space-y-3">
              {archetypeInfo.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <h3 className="text-2xl font-bold text-gray-900">Riesgos</h3>
            </div>
            <ul className="space-y-3">
              {archetypeInfo.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-xl p-8 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Recomendaciones</h3>
          <ul className="space-y-3">
            {archetypeInfo.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">
                  {index + 1}
                </div>
                <span className="text-gray-800 font-medium">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Blog Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-900">Artículos recomendados para ti</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {blogRecommendations[result.archetype].map((article, index) => (
              <a
                key={index}
                href={article.url}
                className="block p-6 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all group"
              >
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {article.title}
                </h4>
                <p className="text-gray-600 text-sm">{article.description}</p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Email Capture */}
        {!emailSaved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-center text-white"
          >
            <Mail className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">Guarda tu resultado</h3>
            <p className="text-lg mb-6 opacity-90">
              Recibe un resumen detallado en tu email y accede a contenido exclusivo personalizado
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-6 py-4 rounded-xl text-gray-900 text-lg font-medium placeholder-gray-400"
              />
              <button
                onClick={handleSaveEmail}
                disabled={savingEmail}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {savingEmail ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              No spam. Solo contenido valioso para mejorar como anfitrión.
            </p>
          </motion.div>
        )}

        {emailSaved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Email guardado!
            </h3>
            <p className="text-gray-600">
              Te hemos enviado un resumen detallado. Revisa tu bandeja de entrada.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
