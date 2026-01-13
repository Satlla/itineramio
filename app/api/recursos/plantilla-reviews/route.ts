import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { enrollSubscriberInSequences } from '@/lib/email-sequences'

// Lazy initialization to avoid build errors
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}

function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2)
  }
  if (!cleaned.startsWith('+') && cleaned.length === 9) {
    cleaned = '+34' + cleaned
  }
  return cleaned.replace('+', '')
}

// Translations for the template
const translations: Record<string, {
  emailSubject: string
  emailHeader: string
  emailSubheader: string
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
  support: string
  supportText: string
  downloadPdf: string
  downloadHint: string
  howToUse: string
  step1: string
  step2: string
  step3: string
  step4: string
  readArticle: string
  footer: string
  whatsappMessage: string
}> = {
  es: {
    emailSubject: 'Tu Guía Rápida de Reseñas - Plantilla PRO',
    emailHeader: 'Tu plantilla PRO está lista',
    emailSubheader: 'aquí tienes tu Guía Rápida de Reseñas personalizada.',
    accommodation: 'Alojamiento',
    templateTitle: 'Guía rápida de reseñas',
    templateSubtitle: 'Tu opinión ayuda a futuros viajeros y nos permite mejorar.',
    context: 'En Airbnb, las estrellas suelen interpretarse de forma distinta a la escala tradicional. En general, <strong>5 estrellas</strong> significa que la estancia fue buena y que el alojamiento cumplió lo prometido.',
    beforeRating: 'Antes de valorar',
    beforeRatingText: 'Si algo no ha estado perfecto, por favor cuéntanoslo. La mayoría de incidencias (Wi-Fi, climatización, ruido, reposición) se resuelven rápido si lo sabemos a tiempo.',
    scaleTitle: 'Escala orientativa',
    stars5: 'Todo estuvo según lo descrito y la experiencia fue buena.',
    stars4: 'Hubo algún aspecto importante que no cumplió expectativas.',
    stars3: 'Hubo varios problemas relevantes que afectaron la estancia.',
    stars2: 'La experiencia tuvo incidencias graves o deficiencias importantes.',
    stars1: 'Experiencia inaceptable (seguridad, higiene o veracidad).',
    transparencyNote: 'Valora con total honestidad. Esta guía solo pretende aclarar el significado habitual de las estrellas en la plataforma.',
    support: 'Soporte',
    supportText: 'Si necesitas algo durante tu estancia, escríbenos y lo resolvemos lo antes posible.',
    downloadPdf: 'Descargar PDF',
    downloadHint: 'Haz clic para abrir tu plantilla y guardarla como PDF',
    howToUse: 'Cómo usar tu plantilla',
    step1: '1. Guarda como PDF (Cmd/Ctrl + P → Guardar como PDF)',
    step2: '2. Imprime en A4 o tamaño carta',
    step3: '3. Enmarca o plastifica para mayor durabilidad',
    step4: '4. Colócala en un lugar visible del alojamiento',
    readArticle: 'Leer artículo completo',
    footer: 'Herramientas para anfitriones',
    whatsappMessage: 'Hola, tengo una pregunta sobre mi estancia'
  },
  en: {
    emailSubject: 'Your Quick Review Guide - PRO Template',
    emailHeader: 'Your PRO template is ready',
    emailSubheader: 'here is your personalized Quick Review Guide.',
    accommodation: 'Accommodation',
    templateTitle: 'Quick review guide',
    templateSubtitle: 'Your feedback helps future travelers and allows us to improve.',
    context: 'On Airbnb, stars are often interpreted differently than the traditional scale. Generally, <strong>5 stars</strong> means the stay was good and the accommodation delivered as promised.',
    beforeRating: 'Before rating',
    beforeRatingText: 'If something wasn\'t perfect, please let us know. Most issues (Wi-Fi, climate control, noise, supplies) can be resolved quickly if we know in time.',
    scaleTitle: 'Rating guide',
    stars5: 'Everything was as described and the experience was good.',
    stars4: 'There was an important aspect that didn\'t meet expectations.',
    stars3: 'There were several relevant issues that affected the stay.',
    stars2: 'The experience had serious issues or significant deficiencies.',
    stars1: 'Unacceptable experience (safety, hygiene, or accuracy).',
    transparencyNote: 'Please rate honestly. This guide only aims to clarify the usual meaning of stars on the platform.',
    support: 'Support',
    supportText: 'If you need anything during your stay, message us and we\'ll resolve it as soon as possible.',
    downloadPdf: 'Download PDF',
    downloadHint: 'Click to open your template and save as PDF',
    howToUse: 'How to use your template',
    step1: '1. Save as PDF (Cmd/Ctrl + P → Save as PDF)',
    step2: '2. Print on A4 or letter size',
    step3: '3. Frame or laminate for durability',
    step4: '4. Place it in a visible spot in your accommodation',
    readArticle: 'Read full article',
    footer: 'Tools for hosts',
    whatsappMessage: 'Hi, I have a question about my stay'
  },
  fr: {
    emailSubject: 'Votre Guide Rapide des Avis - Modèle PRO',
    emailHeader: 'Votre modèle PRO est prêt',
    emailSubheader: 'voici votre Guide Rapide des Avis personnalisé.',
    accommodation: 'Hébergement',
    templateTitle: 'Guide rapide des avis',
    templateSubtitle: 'Votre avis aide les futurs voyageurs et nous permet de nous améliorer.',
    context: 'Sur Airbnb, les étoiles sont souvent interprétées différemment de l\'échelle traditionnelle. En général, <strong>5 étoiles</strong> signifie que le séjour était bon et que l\'hébergement a tenu ses promesses.',
    beforeRating: 'Avant de noter',
    beforeRatingText: 'Si quelque chose n\'était pas parfait, veuillez nous le dire. La plupart des problèmes (Wi-Fi, climatisation, bruit, fournitures) peuvent être résolus rapidement si nous le savons à temps.',
    scaleTitle: 'Guide de notation',
    stars5: 'Tout était conforme à la description et l\'expérience était bonne.',
    stars4: 'Un aspect important n\'a pas répondu aux attentes.',
    stars3: 'Plusieurs problèmes importants ont affecté le séjour.',
    stars2: 'L\'expérience a eu des problèmes graves ou des déficiences importantes.',
    stars1: 'Expérience inacceptable (sécurité, hygiène ou exactitude).',
    transparencyNote: 'Veuillez noter honnêtement. Ce guide vise uniquement à clarifier la signification habituelle des étoiles sur la plateforme.',
    support: 'Support',
    supportText: 'Si vous avez besoin de quoi que ce soit pendant votre séjour, écrivez-nous et nous résoudrons le problème dès que possible.',
    downloadPdf: 'Télécharger PDF',
    downloadHint: 'Cliquez pour ouvrir votre modèle et l\'enregistrer en PDF',
    howToUse: 'Comment utiliser votre modèle',
    step1: '1. Enregistrer en PDF (Cmd/Ctrl + P → Enregistrer en PDF)',
    step2: '2. Imprimer en A4 ou format lettre',
    step3: '3. Encadrer ou plastifier pour plus de durabilité',
    step4: '4. Placez-le dans un endroit visible de votre hébergement',
    readArticle: 'Lire l\'article complet',
    footer: 'Outils pour les hôtes',
    whatsappMessage: 'Bonjour, j\'ai une question concernant mon séjour'
  },
  de: {
    emailSubject: 'Ihr Schneller Bewertungsleitfaden - PRO Vorlage',
    emailHeader: 'Ihre PRO-Vorlage ist fertig',
    emailSubheader: 'hier ist Ihr personalisierter Schneller Bewertungsleitfaden.',
    accommodation: 'Unterkunft',
    templateTitle: 'Schneller Bewertungsleitfaden',
    templateSubtitle: 'Ihr Feedback hilft zukünftigen Reisenden und ermöglicht uns, uns zu verbessern.',
    context: 'Bei Airbnb werden Sterne oft anders interpretiert als bei der traditionellen Skala. Im Allgemeinen bedeutet <strong>5 Sterne</strong>, dass der Aufenthalt gut war und die Unterkunft das Versprechen gehalten hat.',
    beforeRating: 'Vor der Bewertung',
    beforeRatingText: 'Wenn etwas nicht perfekt war, lassen Sie es uns bitte wissen. Die meisten Probleme (WLAN, Klimaanlage, Lärm, Vorräte) können schnell gelöst werden, wenn wir rechtzeitig informiert werden.',
    scaleTitle: 'Bewertungsleitfaden',
    stars5: 'Alles war wie beschrieben und die Erfahrung war gut.',
    stars4: 'Ein wichtiger Aspekt entsprach nicht den Erwartungen.',
    stars3: 'Mehrere relevante Probleme beeinträchtigten den Aufenthalt.',
    stars2: 'Die Erfahrung hatte ernsthafte Probleme oder erhebliche Mängel.',
    stars1: 'Inakzeptable Erfahrung (Sicherheit, Hygiene oder Genauigkeit).',
    transparencyNote: 'Bitte bewerten Sie ehrlich. Dieser Leitfaden soll nur die übliche Bedeutung der Sterne auf der Plattform verdeutlichen.',
    support: 'Support',
    supportText: 'Wenn Sie während Ihres Aufenthalts etwas benötigen, schreiben Sie uns und wir lösen es so schnell wie möglich.',
    downloadPdf: 'PDF herunterladen',
    downloadHint: 'Klicken Sie, um Ihre Vorlage zu öffnen und als PDF zu speichern',
    howToUse: 'So verwenden Sie Ihre Vorlage',
    step1: '1. Als PDF speichern (Cmd/Ctrl + P → Als PDF speichern)',
    step2: '2. Auf A4 oder Letter-Format drucken',
    step3: '3. Einrahmen oder laminieren für mehr Haltbarkeit',
    step4: '4. An einem sichtbaren Ort in Ihrer Unterkunft platzieren',
    readArticle: 'Vollständigen Artikel lesen',
    footer: 'Tools für Gastgeber',
    whatsappMessage: 'Hallo, ich habe eine Frage zu meinem Aufenthalt'
  },
  it: {
    emailSubject: 'La Tua Guida Rapida alle Recensioni - Modello PRO',
    emailHeader: 'Il tuo modello PRO è pronto',
    emailSubheader: 'ecco la tua Guida Rapida alle Recensioni personalizzata.',
    accommodation: 'Alloggio',
    templateTitle: 'Guida rapida alle recensioni',
    templateSubtitle: 'Il tuo feedback aiuta i futuri viaggiatori e ci permette di migliorare.',
    context: 'Su Airbnb, le stelle vengono spesso interpretate diversamente dalla scala tradizionale. In generale, <strong>5 stelle</strong> significa che il soggiorno è stato buono e l\'alloggio ha mantenuto le promesse.',
    beforeRating: 'Prima di valutare',
    beforeRatingText: 'Se qualcosa non era perfetto, faccelo sapere. La maggior parte dei problemi (Wi-Fi, climatizzazione, rumore, forniture) può essere risolta rapidamente se lo sappiamo in tempo.',
    scaleTitle: 'Guida alla valutazione',
    stars5: 'Tutto era come descritto e l\'esperienza è stata buona.',
    stars4: 'C\'era un aspetto importante che non ha soddisfatto le aspettative.',
    stars3: 'Diversi problemi rilevanti hanno influenzato il soggiorno.',
    stars2: 'L\'esperienza ha avuto problemi gravi o carenze significative.',
    stars1: 'Esperienza inaccettabile (sicurezza, igiene o accuratezza).',
    transparencyNote: 'Per favore valuta onestamente. Questa guida mira solo a chiarire il significato abituale delle stelle sulla piattaforma.',
    support: 'Supporto',
    supportText: 'Se hai bisogno di qualcosa durante il tuo soggiorno, scrivici e lo risolveremo il prima possibile.',
    downloadPdf: 'Scarica PDF',
    downloadHint: 'Clicca per aprire il tuo modello e salvarlo come PDF',
    howToUse: 'Come usare il tuo modello',
    step1: '1. Salva come PDF (Cmd/Ctrl + P → Salva come PDF)',
    step2: '2. Stampa in formato A4 o lettera',
    step3: '3. Incornicia o plastifica per maggiore durata',
    step4: '4. Posizionalo in un punto visibile del tuo alloggio',
    readArticle: 'Leggi l\'articolo completo',
    footer: 'Strumenti per host',
    whatsappMessage: 'Ciao, ho una domanda sul mio soggiorno'
  },
  pt: {
    emailSubject: 'Seu Guia Rápido de Avaliações - Modelo PRO',
    emailHeader: 'Seu modelo PRO está pronto',
    emailSubheader: 'aqui está seu Guia Rápido de Avaliações personalizado.',
    accommodation: 'Alojamento',
    templateTitle: 'Guia rápido de avaliações',
    templateSubtitle: 'Sua opinião ajuda futuros viajantes e nos permite melhorar.',
    context: 'No Airbnb, as estrelas são frequentemente interpretadas de forma diferente da escala tradicional. Em geral, <strong>5 estrelas</strong> significa que a estadia foi boa e o alojamento cumpriu o prometido.',
    beforeRating: 'Antes de avaliar',
    beforeRatingText: 'Se algo não estava perfeito, por favor nos avise. A maioria dos problemas (Wi-Fi, climatização, ruído, suprimentos) pode ser resolvida rapidamente se soubermos a tempo.',
    scaleTitle: 'Guia de avaliação',
    stars5: 'Tudo estava como descrito e a experiência foi boa.',
    stars4: 'Houve um aspecto importante que não atendeu às expectativas.',
    stars3: 'Vários problemas relevantes afetaram a estadia.',
    stars2: 'A experiência teve problemas graves ou deficiências significativas.',
    stars1: 'Experiência inaceitável (segurança, higiene ou precisão).',
    transparencyNote: 'Por favor, avalie com honestidade. Este guia visa apenas esclarecer o significado habitual das estrelas na plataforma.',
    support: 'Suporte',
    supportText: 'Se precisar de algo durante sua estadia, escreva-nos e resolveremos o mais rápido possível.',
    downloadPdf: 'Baixar PDF',
    downloadHint: 'Clique para abrir seu modelo e salvar como PDF',
    howToUse: 'Como usar seu modelo',
    step1: '1. Salvar como PDF (Cmd/Ctrl + P → Salvar como PDF)',
    step2: '2. Imprimir em A4 ou tamanho carta',
    step3: '3. Emoldurar ou plastificar para maior durabilidade',
    step4: '4. Coloque em um local visível do seu alojamento',
    readArticle: 'Ler artigo completo',
    footer: 'Ferramentas para anfitriões',
    whatsappMessage: 'Olá, tenho uma pergunta sobre minha estadia'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[plantilla-reviews] Received body:', JSON.stringify(body))

    const { nombre, teléfono, email, idioma = 'es', prioridades = [] } = body
    console.log('[plantilla-reviews] Destructured:', { nombre, teléfono, email, idioma, hasTelefono: !!teléfono })

    if (!nombre || !teléfono || !email) {
      console.log('[plantilla-reviews] Validation failed - missing fields')
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    // Get translations for the selected language (fallback to Spanish)
    const t = translations[idioma] || translations.es

    // Convert priorities to tags (prefix with 'interes-' for clarity)
    const priorityTags = (prioridades as string[]).map((p: string) => `interes-${p}`)

    const whatsappPhone = formatPhoneForWhatsApp(teléfono)
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(t.whatsappMessage)}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(whatsappUrl)}&bgcolor=ffffff&color=222222`

    // URL de descarga con parámetros (usar 'telefono' sin tilde para evitar problemas de encoding)
    const downloadUrl = `https://www.itineramio.com/recursos/plantilla-reviews/descargar?nombre=${encodeURIComponent(nombre)}&telefono=${encodeURIComponent(teléfono)}&lang=${idioma}`

    // Save lead to database
    try {
      await prisma.lead.create({
        data: {
          name: nombre,
          email,
          source: 'plantilla-reviews',
          metadata: {
            teléfono,
            whatsappPhone,
            prioridades: prioridades as string[]
          }
        }
      })
      console.log(`[Lead] Created for ${email} from plantilla-reviews with priorities: ${(prioridades as string[]).join(', ') || 'none'}`)
    } catch (dbError) {
      console.error('Error saving lead:', dbError)
    }

    // Create or update EmailSubscriber for nurturing sequence
    let subscriber = null
    try {
      const normalizedEmail = email.toLowerCase().trim()
      const baseTags = ['tool_plantilla-reviews', 'recurso-gratuito', ...priorityTags]

      subscriber = await prisma.emailSubscriber.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          name: nombre,
          source: 'tool_plantilla-reviews',
          status: 'active',
          tags: baseTags,
          archetype: 'SISTEMATICO' // Default archetype for reviews template users
        },
        update: {
          // Add new tags
          tags: {
            push: baseTags
          },
          updatedAt: new Date()
        }
      })

      console.log(`[EmailSubscriber] Created/updated for ${normalizedEmail} from tool_plantilla-reviews with tags: ${baseTags.join(', ')}`)

      // Enroll in nurturing sequences
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        archetype: subscriber.archetype || 'SISTEMATICO',
        source: 'tool_plantilla-reviews',
        tags: ['tool_plantilla-reviews', 'recurso-gratuito']
      })

      console.log(`[EmailSubscriber] Enrolled ${normalizedEmail} in sequences`)
    } catch (subscriberError) {
      console.error('Error creating subscriber:', subscriberError)
    }

    // Send email
    const emailResult = await getResend().emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: email,
      subject: t.emailSubject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

          <!-- Email Header -->
          <tr>
            <td style="padding: 0 0 32px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Itineramio</p>
              <h1 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">${t.emailHeader}</h1>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">${nombre}, ${t.emailSubheader}</p>
            </td>
          </tr>

          <!-- ========== PLANTILLA PRO IMPRIMIBLE ========== -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e0e0e0;">

                <!-- Header con nombre del alojamiento -->
                <tr>
                  <td style="padding: 28px 28px 0 28px;">
                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">${t.accommodation}</p>
                    <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${nombre}</p>
                  </td>
                </tr>

                <!-- Título principal -->
                <tr>
                  <td style="padding: 24px 28px 0 28px; border-bottom: 1px solid #f0f0f0;">
                    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">${t.templateTitle}</h2>
                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #666; line-height: 1.5;">${t.templateSubtitle}</p>
                  </td>
                </tr>

                <!-- Contexto -->
                <tr>
                  <td style="padding: 20px 28px; background: #fafafa;">
                    <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.6;">${t.context}</p>
                  </td>
                </tr>

                <!-- CTA suave -->
                <tr>
                  <td style="padding: 20px 28px; border-bottom: 1px solid #f0f0f0;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">${t.beforeRating}</p>
                    <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.5;">${t.beforeRatingText}</p>
                  </td>
                </tr>

                <!-- Escala de estrellas -->
                <tr>
                  <td style="padding: 20px 28px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">${t.scaleTitle}</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <!-- 5 estrellas -->
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; color: #1a1a1a; letter-spacing: 1px;">★★★★★</span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">${t.stars5}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- 4 estrellas -->
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; letter-spacing: 1px;"><span style="color: #1a1a1a;">★★★★</span><span style="color: #ddd;">★</span></span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">${t.stars4}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- 3 estrellas -->
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; letter-spacing: 1px;"><span style="color: #1a1a1a;">★★★</span><span style="color: #ddd;">★★</span></span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">${t.stars3}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- 2 estrellas -->
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; letter-spacing: 1px;"><span style="color: #1a1a1a;">★★</span><span style="color: #ddd;">★★★</span></span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">${t.stars2}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- 1 estrella -->
                      <tr>
                        <td style="padding: 10px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 90px; vertical-align: top;">
                                <span style="font-size: 14px; letter-spacing: 1px;"><span style="color: #1a1a1a;">★</span><span style="color: #ddd;">★★★★</span></span>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; color: #333;">${t.stars1}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Nota de transparencia -->
                <tr>
                  <td style="padding: 16px 28px; background: #fafafa; border-top: 1px solid #f0f0f0;">
                    <p style="margin: 0; font-size: 11px; color: #888; line-height: 1.5; font-style: italic;">${t.transparencyNote}</p>
                  </td>
                </tr>

                <!-- Caja de contacto -->
                <tr>
                  <td style="padding: 24px 28px; border-top: 1px solid #e0e0e0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">${t.support}</p>
                          <p style="margin: 0 0 12px 0; font-size: 12px; color: #666; line-height: 1.4;">${t.supportText}</p>
                          <p style="margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 500;">${teléfono}</p>
                        </td>
                        <td style="width: 90px; text-align: right; vertical-align: top;">
                          <img src="${qrCodeUrl}" alt="QR WhatsApp" width="80" height="80" style="display: block;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
          <!-- ========== FIN PLANTILLA ========== -->

          <!-- Botón de descarga -->
          <tr>
            <td align="center" style="padding: 28px 0 0 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">
                ${t.downloadPdf}
              </a>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #888;">${t.downloadHint}</p>
            </td>
          </tr>

          <!-- Instrucciones -->
          <tr>
            <td style="padding: 32px 0 24px 0;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${t.howToUse}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">${t.step1}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">${t.step2}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">${t.step3}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">${t.step4}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <a href="https://www.itineramio.com/blog/plantilla-significado-estrellas-airbnb-huéspedes" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 500; font-size: 13px;">
                ${t.readArticle}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                <a href="https://www.itineramio.com" style="color: #666; text-decoration: none;">itineramio.com</a> · ${t.footer}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    })

    console.log('[plantilla-reviews] Resend result:', JSON.stringify(emailResult, null, 2))

    if (emailResult.error) {
      console.log('[plantilla-reviews] Resend error:', emailResult.error)
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: emailResult.error.message || 'Error enviando email'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: emailResult.data?.id })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Error al generar la plantilla' },
      { status: 500 }
    )
  }
}
