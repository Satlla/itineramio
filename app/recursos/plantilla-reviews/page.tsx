'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Download, Mail, Phone, User, ArrowLeft, Check, Loader2, QrCode, Globe } from 'lucide-react'
import { fbEvents } from '@/components/analytics/FacebookPixel'
import { PrioritySelector } from '@/components/forms/PrioritySelector'

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
]

// Translations for the preview
const translations: Record<string, {
  accommodation: string
  templateTitle: string
  templateSubtitle: string
  context: string
  contextBold: string
  beforeRating: string
  beforeRatingText: string
  scaleTitle: string
  stars5: string
  stars4: string
  stars3: string
  stars2: string
  stars1: string
  transparencyNote: string
  needHelp: string
  contactUs: string
  whatYouGet: string
  item1: string
  item2: string
  item3: string
  item4: string
}> = {
  es: {
    accommodation: 'Alojamiento',
    templateTitle: 'Guía rápida de reseñas',
    templateSubtitle: 'Tu opinión ayuda a futuros viajeros y nos permite mejorar.',
    context: 'En Airbnb, las estrellas se interpretan distinto.',
    contextBold: '5 estrellas',
    beforeRating: 'Antes de valorar',
    beforeRatingText: 'Si algo no estuvo perfecto, cuéntanoslo. La mayoría de incidencias se resuelven rápido.',
    scaleTitle: 'Escala orientativa',
    stars5: 'Todo según lo descrito, experiencia buena.',
    stars4: 'Algún aspecto importante no cumplió expectativas.',
    stars3: 'Varios problemas relevantes afectaron la estancia.',
    stars2: 'Incidencias graves o deficiencias importantes.',
    stars1: 'Experiencia inaceptable.',
    transparencyNote: 'Valora con honestidad. Esta guía solo aclara el significado habitual de las estrellas.',
    needHelp: '¿Necesitas ayuda?',
    contactUs: 'Escríbenos y lo resolvemos.',
    whatYouGet: '¿Qué recibirás?',
    item1: 'Plantilla PDF lista para imprimir',
    item2: 'Tu nombre de alojamiento personalizado',
    item3: 'Código QR de tu WhatsApp',
    item4: 'Diseño profesional A4'
  },
  en: {
    accommodation: 'Accommodation',
    templateTitle: 'Quick review guide',
    templateSubtitle: 'Your feedback helps future travelers and allows us to improve.',
    context: 'On Airbnb, stars are interpreted differently.',
    contextBold: '5 stars',
    beforeRating: 'Before rating',
    beforeRatingText: 'If something wasn\'t perfect, let us know. Most issues can be resolved quickly.',
    scaleTitle: 'Rating guide',
    stars5: 'Everything as described, good experience.',
    stars4: 'An important aspect didn\'t meet expectations.',
    stars3: 'Several relevant issues affected the stay.',
    stars2: 'Serious issues or significant deficiencies.',
    stars1: 'Unacceptable experience.',
    transparencyNote: 'Please rate honestly. This guide only clarifies the usual meaning of stars.',
    needHelp: 'Need help?',
    contactUs: 'Message us and we\'ll resolve it.',
    whatYouGet: 'What you\'ll receive?',
    item1: 'Print-ready PDF template',
    item2: 'Your personalized accommodation name',
    item3: 'Your WhatsApp QR code',
    item4: 'Professional A4 design'
  },
  fr: {
    accommodation: 'Hébergement',
    templateTitle: 'Guide rapide des avis',
    templateSubtitle: 'Votre avis aide les futurs voyageurs et nous permet de nous améliorer.',
    context: 'Sur Airbnb, les étoiles sont interprétées différemment.',
    contextBold: '5 étoiles',
    beforeRating: 'Avant de noter',
    beforeRatingText: 'Si quelque chose n\'était pas parfait, dites-le nous. La plupart des problèmes peuvent être résolus rapidement.',
    scaleTitle: 'Guide de notation',
    stars5: 'Tout conforme à la description, bonne expérience.',
    stars4: 'Un aspect important n\'a pas répondu aux attentes.',
    stars3: 'Plusieurs problèmes importants ont affecté le séjour.',
    stars2: 'Problèmes graves ou déficiences importantes.',
    stars1: 'Expérience inacceptable.',
    transparencyNote: 'Veuillez noter honnêtement. Ce guide clarifie uniquement le sens habituel des étoiles.',
    needHelp: 'Besoin d\'aide?',
    contactUs: 'Écrivez-nous et nous résoudrons le problème.',
    whatYouGet: 'Que recevrez-vous?',
    item1: 'Modèle PDF prêt à imprimer',
    item2: 'Votre nom d\'hébergement personnalisé',
    item3: 'Votre code QR WhatsApp',
    item4: 'Design professionnel A4'
  },
  de: {
    accommodation: 'Unterkunft',
    templateTitle: 'Schneller Bewertungsleitfaden',
    templateSubtitle: 'Ihr Feedback hilft zukünftigen Reisenden und ermöglicht uns, uns zu verbessern.',
    context: 'Bei Airbnb werden Sterne anders interpretiert.',
    contextBold: '5 Sterne',
    beforeRating: 'Vor der Bewertung',
    beforeRatingText: 'Wenn etwas nicht perfekt war, lassen Sie es uns wissen. Die meisten Probleme können schnell gelöst werden.',
    scaleTitle: 'Bewertungsleitfaden',
    stars5: 'Alles wie beschrieben, gute Erfahrung.',
    stars4: 'Ein wichtiger Aspekt entsprach nicht den Erwartungen.',
    stars3: 'Mehrere relevante Probleme beeinträchtigten den Aufenthalt.',
    stars2: 'Ernsthafte Probleme oder erhebliche Mängel.',
    stars1: 'Inakzeptable Erfahrung.',
    transparencyNote: 'Bitte bewerten Sie ehrlich. Dieser Leitfaden verdeutlicht nur die übliche Bedeutung der Sterne.',
    needHelp: 'Brauchen Sie Hilfe?',
    contactUs: 'Schreiben Sie uns und wir lösen es.',
    whatYouGet: 'Was erhalten Sie?',
    item1: 'Druckfertige PDF-Vorlage',
    item2: 'Ihr personalisierter Unterkunftsname',
    item3: 'Ihr WhatsApp QR-Code',
    item4: 'Professionelles A4-Design'
  },
  it: {
    accommodation: 'Alloggio',
    templateTitle: 'Guida rapida alle recensioni',
    templateSubtitle: 'Il tuo feedback aiuta i futuri viaggiatori e ci permette di migliorare.',
    context: 'Su Airbnb, le stelle vengono interpretate diversamente.',
    contextBold: '5 stelle',
    beforeRating: 'Prima di valutare',
    beforeRatingText: 'Se qualcosa non era perfetto, faccelo sapere. La maggior parte dei problemi può essere risolta rapidamente.',
    scaleTitle: 'Guida alla valutazione',
    stars5: 'Tutto come descritto, buona esperienza.',
    stars4: 'Un aspetto importante non ha soddisfatto le aspettative.',
    stars3: 'Diversi problemi rilevanti hanno influenzato il soggiorno.',
    stars2: 'Problemi gravi o carenze significative.',
    stars1: 'Esperienza inaccettabile.',
    transparencyNote: 'Per favore valuta onestamente. Questa guida chiarisce solo il significato abituale delle stelle.',
    needHelp: 'Hai bisogno di aiuto?',
    contactUs: 'Scrivici e lo risolveremo.',
    whatYouGet: 'Cosa riceverai?',
    item1: 'Modello PDF pronto per la stampa',
    item2: 'Il nome del tuo alloggio personalizzato',
    item3: 'Il tuo codice QR WhatsApp',
    item4: 'Design professionale A4'
  },
  pt: {
    accommodation: 'Alojamento',
    templateTitle: 'Guia rápido de avaliações',
    templateSubtitle: 'Sua opinião ajuda futuros viajantes e nos permite melhorar.',
    context: 'No Airbnb, as estrelas são interpretadas de forma diferente.',
    contextBold: '5 estrelas',
    beforeRating: 'Antes de avaliar',
    beforeRatingText: 'Se algo não estava perfeito, nos avise. A maioria dos problemas pode ser resolvida rapidamente.',
    scaleTitle: 'Guia de avaliação',
    stars5: 'Tudo como descrito, boa experiência.',
    stars4: 'Um aspecto importante não atendeu às expectativas.',
    stars3: 'Vários problemas relevantes afetaram a estadia.',
    stars2: 'Problemas graves ou deficiências significativas.',
    stars1: 'Experiência inaceitável.',
    transparencyNote: 'Por favor, avalie com honestidade. Este guia apenas esclarece o significado habitual das estrelas.',
    needHelp: 'Precisa de ajuda?',
    contactUs: 'Escreva-nos e resolveremos.',
    whatYouGet: 'O que você receberá?',
    item1: 'Modelo PDF pronto para imprimir',
    item2: 'Seu nome de alojamento personalizado',
    item3: 'Seu código QR do WhatsApp',
    item4: 'Design profissional A4'
  }
}

export default function PlantillaReviewsPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    teléfono: '',
    email: '',
    idioma: 'es',
    prioridades: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/recursos/plantilla-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar')
      }

      // Facebook Pixel Lead event
      fbEvents.lead({
        content_name: 'Plantilla Reviews',
        content_category: 'recurso-gratuito',
        value: 0,
        currency: 'EUR'
      })

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  // Get translations for current language
  const t = translations[formData.idioma] || translations.es

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove spaces and special chars, keep + and digits
    return phone.replace(/[^\d+]/g, '')
  }

  const whatsappUrl = formData.teléfono
    ? `https://wa.me/${formatPhoneForWhatsApp(formData.teléfono)}?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20mi%20estancia`
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a herramientas
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">Plantilla Personalizable</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Guía Rápida de Reseñas
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plantilla PRO para educar a tus huéspedes sobre el sistema de valoraciones de Airbnb.
            Personaliza con el nombre de tu alojamiento y QR de WhatsApp.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Personaliza tu plantilla
            </h2>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Enviado!
                </h3>
                <p className="text-gray-600 mb-4">
                  Revisa tu correo electrónico. Te hemos enviado la plantilla personalizada con tu QR de WhatsApp.
                </p>
                <p className="text-sm text-gray-500">
                  Si no lo ves, revisa la carpeta de spam.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Tu nombre o nombre del alojamiento
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: María García o Apartamento Sol"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono de WhatsApp (con prefijo)
                  </label>
                  <input
                    type="tel"
                    value={formData.teléfono}
                    onChange={(e) => setFormData({ ...formData, teléfono: e.target.value })}
                    placeholder="Ej: +34 612 345 678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Incluye el prefijo del país (ej: +34 para España)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Tu email (donde enviamos la plantilla)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Idioma de la plantilla
                  </label>
                  <select
                    value={formData.idioma}
                    onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Elige el idioma en el que tus huéspedes leerán la plantilla
                  </p>
                </div>

                {/* Selector de prioridades */}
                <PrioritySelector
                  selected={formData.prioridades}
                  onChange={(prioridades) => setFormData({ ...formData, prioridades })}
                />

                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-rose-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Recibir plantilla por email
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Al enviar, aceptas recibir la plantilla y ocasionalmente contenido útil para anfitriones.
                  Sin spam, puedes darte de baja en cualquier momento.
                </p>
              </form>
            )}
          </div>

          {/* Preview - Diseño idéntico a la plantilla de descarga */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Vista previa de la plantilla
            </h3>

            <div className="bg-white border border-gray-200 shadow-sm">
              {/* Header con nombre del alojamiento */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{t.accommodation}</p>
                <p className="text-base font-semibold text-gray-900 mb-2">{formData.nombre || 'Tu Alojamiento'}</p>
                <h4 className="text-lg font-semibold text-gray-900">{t.templateTitle}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{t.templateSubtitle}</p>
              </div>

              {/* Contexto */}
              <div className="px-5 py-2.5 bg-gray-50">
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {t.context} <strong className="text-gray-900">{t.contextBold}</strong> = {t.stars5.toLowerCase()}
                </p>
              </div>

              {/* Antes de valorar */}
              <div className="px-5 py-2.5 border-b border-gray-100">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-900 mb-0.5">{t.beforeRating}</p>
                <p className="text-[11px] text-gray-600">
                  {t.beforeRatingText}
                </p>
              </div>

              {/* Escala de estrellas */}
              <div className="px-5 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-900 mb-1.5">{t.scaleTitle}</p>
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-1 w-16 text-gray-900">★★★★★</td>
                      <td className="py-1 text-gray-600">{t.stars5}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1 w-16"><span className="text-gray-900">★★★★</span><span className="text-gray-300">★</span></td>
                      <td className="py-1 text-gray-600">{t.stars4}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1 w-16"><span className="text-gray-900">★★★</span><span className="text-gray-300">★★</span></td>
                      <td className="py-1 text-gray-600">{t.stars3}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1 w-16"><span className="text-gray-900">★★</span><span className="text-gray-300">★★★</span></td>
                      <td className="py-1 text-gray-600">{t.stars2}</td>
                    </tr>
                    <tr>
                      <td className="py-1 w-16"><span className="text-gray-900">★</span><span className="text-gray-300">★★★★</span></td>
                      <td className="py-1 text-gray-600">{t.stars1}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Nota de transparencia */}
              <div className="px-5 py-1.5 bg-gray-50 border-t border-gray-100">
                <p className="text-[9px] text-gray-400 italic">
                  {t.transparencyNote}
                </p>
              </div>

              {/* Caja de contacto */}
              <div className="px-5 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-900 mb-0.5">{t.needHelp}</p>
                    <p className="text-[11px] text-gray-600 mb-0.5">{t.contactUs}</p>
                    <p className="text-sm font-medium text-gray-900">{formData.teléfono || '+34 600 000 000'}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center">
                      {formData.teléfono ? (
                        <QrCode className="w-10 h-10 text-gray-400" />
                      ) : (
                        <span className="text-[8px] text-gray-400 text-center">QR</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 text-sm mb-2">
                {t.whatYouGet}
              </h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>✓ {t.item1}</li>
                <li>✓ {t.item2}</li>
                <li>✓ {t.item3}</li>
                <li>✓ {t.item4}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Article link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">
            ¿Quieres saber más sobre el sistema de estrellas de Airbnb?
          </p>
          <Link
            href="/blog/plantilla-significado-estrellas-airbnb-huéspedes"
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Lee el artículo completo →
          </Link>
        </div>
      </div>
    </div>
  )
}
