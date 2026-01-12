'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Translations for the download page
const translations: Record<string, {
  pageTitle: string
  pageSubtitle: string
  downloadPdf: string
  accommodation: string
  templateTitle: string
  templateSubtitle: string
  context: string
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
  createdWith: string
  whatsappMessage: string
}> = {
  es: {
    pageTitle: 'Guía Rápida de Reseñas',
    pageSubtitle: 'Formato A5 - Guarda como PDF o imprime',
    downloadPdf: 'Descargar PDF',
    accommodation: 'Alojamiento',
    templateTitle: 'Guía rápida de reseñas',
    templateSubtitle: 'Tu opinión ayuda a futuros viajeros y nos permite mejorar.',
    context: 'En Airbnb, las estrellas se interpretan distinto. <strong>5 estrellas</strong> = la estancia fue buena y cumplió lo prometido.',
    beforeRating: 'Antes de valorar',
    beforeRatingText: 'Si algo no estuvo perfecto, cuéntanoslo. La mayoría de incidencias se resuelven rápido.',
    scaleTitle: 'Escala orientativa',
    stars5: 'Todo según lo descrito, experiencia buena.',
    stars4: 'Algún aspecto importante no cumplió expectativas.',
    stars3: 'Varios problemas relevantes afectaron la estancia.',
    stars2: 'Incidencias graves o deficiencias importantes.',
    stars1: 'Experiencia inaceptable (seguridad, higiene, veracidad).',
    transparencyNote: 'Valora con honestidad. Esta guía solo aclara el significado habitual de las estrellas.',
    needHelp: '¿Necesitas ayuda?',
    contactUs: 'Escríbenos y lo resolvemos.',
    createdWith: 'Creado con',
    whatsappMessage: 'Hola, tengo una pregunta sobre mi estancia'
  },
  en: {
    pageTitle: 'Quick Review Guide',
    pageSubtitle: 'A5 format - Save as PDF or print',
    downloadPdf: 'Download PDF',
    accommodation: 'Accommodation',
    templateTitle: 'Quick review guide',
    templateSubtitle: 'Your feedback helps future travelers and allows us to improve.',
    context: 'On Airbnb, stars are interpreted differently. <strong>5 stars</strong> = the stay was good and delivered as promised.',
    beforeRating: 'Before rating',
    beforeRatingText: 'If something wasn\'t perfect, let us know. Most issues can be resolved quickly.',
    scaleTitle: 'Rating guide',
    stars5: 'Everything as described, good experience.',
    stars4: 'An important aspect didn\'t meet expectations.',
    stars3: 'Several relevant issues affected the stay.',
    stars2: 'Serious issues or significant deficiencies.',
    stars1: 'Unacceptable experience (safety, hygiene, accuracy).',
    transparencyNote: 'Please rate honestly. This guide only clarifies the usual meaning of stars.',
    needHelp: 'Need help?',
    contactUs: 'Message us and we\'ll resolve it.',
    createdWith: 'Created with',
    whatsappMessage: 'Hi, I have a question about my stay'
  },
  fr: {
    pageTitle: 'Guide Rapide des Avis',
    pageSubtitle: 'Format A5 - Enregistrez en PDF ou imprimez',
    downloadPdf: 'Télécharger PDF',
    accommodation: 'Hébergement',
    templateTitle: 'Guide rapide des avis',
    templateSubtitle: 'Votre avis aide les futurs voyageurs et nous permet de nous améliorer.',
    context: 'Sur Airbnb, les étoiles sont interprétées différemment. <strong>5 étoiles</strong> = le séjour était bon et conforme aux promesses.',
    beforeRating: 'Avant de noter',
    beforeRatingText: 'Si quelque chose n\'était pas parfait, dites-le nous. La plupart des problèmes peuvent être résolus rapidement.',
    scaleTitle: 'Guide de notation',
    stars5: 'Tout conforme à la description, bonne expérience.',
    stars4: 'Un aspect important n\'a pas répondu aux attentes.',
    stars3: 'Plusieurs problèmes importants ont affecté le séjour.',
    stars2: 'Problèmes graves ou déficiences importantes.',
    stars1: 'Expérience inacceptable (sécurité, hygiène, exactitude).',
    transparencyNote: 'Veuillez noter honnêtement. Ce guide clarifie uniquement le sens habituel des étoiles.',
    needHelp: 'Besoin d\'aide?',
    contactUs: 'Écrivez-nous et nous résoudrons le problème.',
    createdWith: 'Créé avec',
    whatsappMessage: 'Bonjour, j\'ai une question concernant mon séjour'
  },
  de: {
    pageTitle: 'Schneller Bewertungsleitfaden',
    pageSubtitle: 'A5-Format - Als PDF speichern oder drucken',
    downloadPdf: 'PDF herunterladen',
    accommodation: 'Unterkunft',
    templateTitle: 'Schneller Bewertungsleitfaden',
    templateSubtitle: 'Ihr Feedback hilft zukünftigen Reisenden und ermöglicht uns, uns zu verbessern.',
    context: 'Bei Airbnb werden Sterne anders interpretiert. <strong>5 Sterne</strong> = der Aufenthalt war gut und wie versprochen.',
    beforeRating: 'Vor der Bewertung',
    beforeRatingText: 'Wenn etwas nicht perfekt war, lassen Sie es uns wissen. Die meisten Probleme können schnell gelöst werden.',
    scaleTitle: 'Bewertungsleitfaden',
    stars5: 'Alles wie beschrieben, gute Erfahrung.',
    stars4: 'Ein wichtiger Aspekt entsprach nicht den Erwartungen.',
    stars3: 'Mehrere relevante Probleme beeinträchtigten den Aufenthalt.',
    stars2: 'Ernsthafte Probleme oder erhebliche Mängel.',
    stars1: 'Inakzeptable Erfahrung (Sicherheit, Hygiene, Genauigkeit).',
    transparencyNote: 'Bitte bewerten Sie ehrlich. Dieser Leitfaden verdeutlicht nur die übliche Bedeutung der Sterne.',
    needHelp: 'Brauchen Sie Hilfe?',
    contactUs: 'Schreiben Sie uns und wir lösen es.',
    createdWith: 'Erstellt mit',
    whatsappMessage: 'Hallo, ich habe eine Frage zu meinem Aufenthalt'
  },
  it: {
    pageTitle: 'Guida Rapida alle Recensioni',
    pageSubtitle: 'Formato A5 - Salva come PDF o stampa',
    downloadPdf: 'Scarica PDF',
    accommodation: 'Alloggio',
    templateTitle: 'Guida rapida alle recensioni',
    templateSubtitle: 'Il tuo feedback aiuta i futuri viaggiatori e ci permette di migliorare.',
    context: 'Su Airbnb, le stelle vengono interpretate diversamente. <strong>5 stelle</strong> = il soggiorno è stato buono e conforme alle promesse.',
    beforeRating: 'Prima di valutare',
    beforeRatingText: 'Se qualcosa non era perfetto, faccelo sapere. La maggior parte dei problemi può essere risolta rapidamente.',
    scaleTitle: 'Guida alla valutazione',
    stars5: 'Tutto come descritto, buona esperienza.',
    stars4: 'Un aspetto importante non ha soddisfatto le aspettative.',
    stars3: 'Diversi problemi rilevanti hanno influenzato il soggiorno.',
    stars2: 'Problemi gravi o carenze significative.',
    stars1: 'Esperienza inaccettabile (sicurezza, igiene, accuratezza).',
    transparencyNote: 'Per favore valuta onestamente. Questa guida chiarisce solo il significato abituale delle stelle.',
    needHelp: 'Hai bisogno di aiuto?',
    contactUs: 'Scrivici e lo risolveremo.',
    createdWith: 'Creato con',
    whatsappMessage: 'Ciao, ho una domanda sul mio soggiorno'
  },
  pt: {
    pageTitle: 'Guia Rápido de Avaliações',
    pageSubtitle: 'Formato A5 - Salve como PDF ou imprima',
    downloadPdf: 'Baixar PDF',
    accommodation: 'Alojamento',
    templateTitle: 'Guia rápido de avaliações',
    templateSubtitle: 'Sua opinião ajuda futuros viajantes e nos permite melhorar.',
    context: 'No Airbnb, as estrelas são interpretadas de forma diferente. <strong>5 estrelas</strong> = a estadia foi boa e cumpriu o prometido.',
    beforeRating: 'Antes de avaliar',
    beforeRatingText: 'Se algo não estava perfeito, nos avise. A maioria dos problemas pode ser resolvida rapidamente.',
    scaleTitle: 'Guia de avaliação',
    stars5: 'Tudo como descrito, boa experiência.',
    stars4: 'Um aspecto importante não atendeu às expectativas.',
    stars3: 'Vários problemas relevantes afetaram a estadia.',
    stars2: 'Problemas graves ou deficiências significativas.',
    stars1: 'Experiência inaceitável (segurança, higiene, precisão).',
    transparencyNote: 'Por favor, avalie com honestidade. Este guia apenas esclarece o significado habitual das estrelas.',
    needHelp: 'Precisa de ajuda?',
    contactUs: 'Escreva-nos e resolveremos.',
    createdWith: 'Criado com',
    whatsappMessage: 'Olá, tenho uma pergunta sobre minha estadia'
  }
}

function PlantillaContent() {
  const searchParams = useSearchParams()
  const nombre = searchParams.get('nombre') || 'Tu Alojamiento'
  // Support both 'telefono' (without accent) and 'teléfono' (with accent) for compatibility
  const teléfono = searchParams.get('telefono') || searchParams.get('teléfono') || '+34 600 000 000'
  const lang = searchParams.get('lang') || 'es'

  // Get translations (fallback to Spanish)
  const t = translations[lang] || translations.es

  const whatsappPhone = teléfono.replace(/[^\d+]/g, '').replace('+', '')
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(t.whatsappMessage)}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}&bgcolor=ffffff&color=222222`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con botón - se oculta al imprimir */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900">{t.pageTitle}</h1>
            <p className="text-sm text-gray-500">{t.pageSubtitle}</p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t.downloadPdf}
          </button>
        </div>
      </div>

      {/* Plantilla - optimizada para impresión A5 */}
      <div className="max-w-[148mm] mx-auto p-6 print:p-0">
        <div className="bg-white border border-gray-200 print:border-gray-300 shadow-sm print:shadow-none">

          {/* Header con nombre + título en una fila */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{t.accommodation}</p>
            <p className="text-lg font-semibold text-gray-900 mb-3">{nombre}</p>
            <h2 className="text-xl font-semibold text-gray-900">{t.templateTitle}</h2>
            <p className="text-xs text-gray-500 mt-1">{t.templateSubtitle}</p>
          </div>

          {/* Contexto - más compacto */}
          <div className="px-6 py-3 bg-gray-50">
            <p className="text-xs text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.context }} />
          </div>

          {/* Antes de valorar - compacto */}
          <div className="px-6 py-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-900 mb-1">{t.beforeRating}</p>
            <p className="text-xs text-gray-600">
              {t.beforeRatingText}
            </p>
          </div>

          {/* Escala de estrellas - compacta */}
          <div className="px-6 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-900 mb-2">{t.scaleTitle}</p>

            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 w-20 text-sm text-gray-900">★★★★★</td>
                  <td className="py-1.5 text-gray-600">{t.stars5}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 w-20 text-sm"><span className="text-gray-900">★★★★</span><span className="text-gray-300">★</span></td>
                  <td className="py-1.5 text-gray-600">{t.stars4}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 w-20 text-sm"><span className="text-gray-900">★★★</span><span className="text-gray-300">★★</span></td>
                  <td className="py-1.5 text-gray-600">{t.stars3}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 w-20 text-sm"><span className="text-gray-900">★★</span><span className="text-gray-300">★★★</span></td>
                  <td className="py-1.5 text-gray-600">{t.stars2}</td>
                </tr>
                <tr>
                  <td className="py-1.5 w-20 text-sm"><span className="text-gray-900">★</span><span className="text-gray-300">★★★★</span></td>
                  <td className="py-1.5 text-gray-600">{t.stars1}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Nota de transparencia - una línea */}
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 italic">
              {t.transparencyNote}
            </p>
          </div>

          {/* Caja de contacto - compacta */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-900 mb-1">{t.needHelp}</p>
                <p className="text-xs text-gray-600 mb-1">{t.contactUs}</p>
                <p className="text-sm font-medium text-gray-900">{teléfono}</p>
              </div>
              <div className="flex-shrink-0">
                <img src={qrCodeUrl} alt="QR WhatsApp" className="w-16 h-16" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer - se oculta al imprimir */}
        <div className="print:hidden mt-4 text-center">
          <p className="text-xs text-gray-500">
            {t.createdWith} <a href="https://www.itineramio.com" className="text-gray-700 hover:underline">Itineramio</a>
          </p>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A5;
            margin: 8mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}

export default function DescargarPlantillaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando plantilla...</p>
      </div>
    }>
      <PlantillaContent />
    </Suspense>
  )
}
