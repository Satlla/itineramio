import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { jsPDF } from 'jspdf'

const resend = new Resend(process.env.RESEND_API_KEY)

// Translations for PDF content
const pdfTranslations: Record<string, {
  guideTitle: string
  mainTitle: string
  subtitle: string
  stars: { label: string; desc: string }[]
  contactTitle: string
  contactText: string
  hostLabel: string
}> = {
  es: {
    guideTitle: 'Guía para huéspedes',
    mainTitle: '¿Cómo valorar tu estancia?',
    subtitle: 'En Airbnb, menos de 5 estrellas afecta negativamente al anfitrión',
    stars: [
      { label: 'Excelente', desc: 'Todo fue perfecto' },
      { label: 'Bien, pero...', desc: 'Algo podría mejorar' },
      { label: 'Regular', desc: 'Hubo problemas' },
      { label: 'Malo', desc: 'Mala experiencia' },
      { label: 'Muy malo', desc: 'Inaceptable' },
    ],
    contactTitle: '¿Algo no fue perfecto?',
    contactText: 'Escríbeme antes de puntuar y lo solucionamos.',
    hostLabel: 'host',
  },
  en: {
    guideTitle: 'Guest Guide',
    mainTitle: 'How to rate your stay?',
    subtitle: 'On Airbnb, less than 5 stars negatively affects the host',
    stars: [
      { label: 'Excellent', desc: 'Everything was perfect' },
      { label: 'Good, but...', desc: 'Something could improve' },
      { label: 'Average', desc: 'There were problems' },
      { label: 'Bad', desc: 'Bad experience' },
      { label: 'Very bad', desc: 'Unacceptable' },
    ],
    contactTitle: 'Something wasn\'t perfect?',
    contactText: 'Message me before rating and we\'ll fix it.',
    hostLabel: 'host',
  },
  fr: {
    guideTitle: 'Guide pour les voyageurs',
    mainTitle: 'Comment évaluer votre séjour ?',
    subtitle: 'Sur Airbnb, moins de 5 étoiles affecte négativement l\'hôte',
    stars: [
      { label: 'Excellent', desc: 'Tout était parfait' },
      { label: 'Bien, mais...', desc: 'Quelque chose pourrait s\'améliorer' },
      { label: 'Moyen', desc: 'Il y a eu des problèmes' },
      { label: 'Mauvais', desc: 'Mauvaise expérience' },
      { label: 'Très mauvais', desc: 'Inacceptable' },
    ],
    contactTitle: 'Quelque chose n\'était pas parfait ?',
    contactText: 'Écrivez-moi avant de noter et nous le résoudrons.',
    hostLabel: 'hôte',
  },
  de: {
    guideTitle: 'Gästeanleitung',
    mainTitle: 'Wie bewerten Sie Ihren Aufenthalt?',
    subtitle: 'Bei Airbnb wirken sich weniger als 5 Sterne negativ auf den Gastgeber aus',
    stars: [
      { label: 'Ausgezeichnet', desc: 'Alles war perfekt' },
      { label: 'Gut, aber...', desc: 'Etwas könnte besser sein' },
      { label: 'Durchschnitt', desc: 'Es gab Probleme' },
      { label: 'Schlecht', desc: 'Schlechte Erfahrung' },
      { label: 'Sehr schlecht', desc: 'Inakzeptabel' },
    ],
    contactTitle: 'War etwas nicht perfekt?',
    contactText: 'Schreiben Sie mir vor der Bewertung und wir lösen es.',
    hostLabel: 'Gastgeber',
  },
  it: {
    guideTitle: 'Guida per gli ospiti',
    mainTitle: 'Come valutare il tuo soggiorno?',
    subtitle: 'Su Airbnb, meno di 5 stelle influisce negativamente sull\'host',
    stars: [
      { label: 'Eccellente', desc: 'Tutto era perfetto' },
      { label: 'Bene, ma...', desc: 'Qualcosa potrebbe migliorare' },
      { label: 'Nella media', desc: 'Ci sono stati problemi' },
      { label: 'Male', desc: 'Brutta esperienza' },
      { label: 'Molto male', desc: 'Inaccettabile' },
    ],
    contactTitle: 'Qualcosa non era perfetto?',
    contactText: 'Scrivimi prima di valutare e lo risolviamo.',
    hostLabel: 'host',
  },
  pt: {
    guideTitle: 'Guia para hóspedes',
    mainTitle: 'Como avaliar sua estadia?',
    subtitle: 'No Airbnb, menos de 5 estrelas afeta negativamente o anfitrião',
    stars: [
      { label: 'Excelente', desc: 'Tudo foi perfeito' },
      { label: 'Bom, mas...', desc: 'Algo poderia melhorar' },
      { label: 'Regular', desc: 'Houve problemas' },
      { label: 'Ruim', desc: 'Má experiência' },
      { label: 'Muito ruim', desc: 'Inaceitável' },
    ],
    contactTitle: 'Algo não foi perfeito?',
    contactText: 'Escreva-me antes de avaliar e resolveremos.',
    hostLabel: 'anfitrião',
  },
  nl: {
    guideTitle: 'Gastengids',
    mainTitle: 'Hoe beoordeel je je verblijf?',
    subtitle: 'Op Airbnb heeft minder dan 5 sterren een negatief effect op de host',
    stars: [
      { label: 'Uitstekend', desc: 'Alles was perfect' },
      { label: 'Goed, maar...', desc: 'Iets kon beter' },
      { label: 'Gemiddeld', desc: 'Er waren problemen' },
      { label: 'Slecht', desc: 'Slechte ervaring' },
      { label: 'Zeer slecht', desc: 'Onacceptabel' },
    ],
    contactTitle: 'Was iets niet perfect?',
    contactText: 'Stuur me een bericht voor je beoordeelt en we lossen het op.',
    hostLabel: 'host',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hostName, whatsappNumber, email, language = 'es' } = body

    // Validation
    if (!hostName || !whatsappNumber || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email no válido' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Create or update lead
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: normalizedEmail,
        source: 'plantilla-estrellas',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          name: hostName,
          email: normalizedEmail,
          source: 'plantilla-estrellas',
          metadata: { whatsappNumber },
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        }
      })
    }

    // Update or create EmailSubscriber
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    if (!existingSubscriber) {
      await prisma.emailSubscriber.create({
        data: {
          email: normalizedEmail,
          name: hostName,
          source: 'Plantilla Estrellas',
          status: 'active',
          sequenceStatus: 'active',
          sequenceStartedAt: new Date(),
          tags: ['plantilla-estrellas'],
          currentJourneyStage: 'lead',
          engagementScore: 'warm'
        }
      })
    } else {
      await prisma.emailSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          tags: {
            push: 'plantilla-estrellas'
          }
        }
      })
    }

    // Generate WhatsApp URL for QR
    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '')
    const phoneForUrl = cleanNumber.startsWith('+') ? cleanNumber.slice(1) : cleanNumber
    const whatsappUrl = `https://wa.me/${phoneForUrl}?text=Hola%20${encodeURIComponent(hostName)}%2C%20soy%20tu%20huésped`
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}&color=25D366&bgcolor=FFFFFF&format=png`

    // Fetch QR code image
    let qrImageData: string | null = null
    try {
      const qrResponse = await fetch(qrApiUrl)
      if (qrResponse.ok) {
        const qrBuffer = await qrResponse.arrayBuffer()
        qrImageData = `data:image/png;base64,${Buffer.from(qrBuffer).toString('base64')}`
      }
    } catch (e) {
      console.error('Error fetching QR:', e)
    }

    // Generate PDF
    const pdfBuffer = generateStarRatingPDF(hostName, qrImageData, language)

    // Send email with PDF attachment
    await resend.emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: normalizedEmail,
      subject: `${hostName}, tu plantilla de estrellas está lista`,
      html: generateEmailHTML(hostName),
      attachments: [
        {
          filename: `plantilla-estrellas-${hostName.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer.toString('base64'),
          contentType: 'application/pdf'
        }
      ]
    })

    console.log(`[Plantilla Estrellas] PDF enviado a ${normalizedEmail}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error en plantilla-estrellas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function generateStarRatingPDF(hostName: string, qrImageData: string | null, language: string): Buffer {
  // Get translations
  const t = pdfTranslations[language] || pdfTranslations.es

  // Create PDF in A5 landscape (perfect for printing)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Background
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  // Header bar - Airbnb style
  pdf.setFillColor(255, 56, 92) // Airbnb red
  pdf.rect(0, 0, pageWidth, 22, 'F')

  // Header text
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(t.guideTitle, 15, 14)

  // Main title
  pdf.setTextColor(34, 34, 34)
  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  pdf.text(t.mainTitle, pageWidth / 2, 38, { align: 'center' })

  // Subtitle
  pdf.setTextColor(113, 113, 113)
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.text(t.subtitle, pageWidth / 2, 46, { align: 'center' })

  // Star ratings section
  const starSymbols = ['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆', '★☆☆☆☆']
  const starData = starSymbols.map((stars, i) => ({
    stars,
    label: t.stars[i].label,
    desc: t.stars[i].desc
  }))

  let yPos = 56
  const rowHeight = 12
  const leftMargin = 20
  const boxWidth = pageWidth - 40

  starData.forEach((item, index) => {
    // Row background (alternating)
    if (index % 2 === 0) {
      pdf.setFillColor(247, 247, 247)
    } else {
      pdf.setFillColor(255, 255, 255)
    }
    pdf.roundedRect(leftMargin, yPos, boxWidth, rowHeight, 2, 2, 'F')

    // Stars (golden color)
    pdf.setTextColor(245, 158, 11)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    pdf.text(item.stars, leftMargin + 5, yPos + 8)

    // Label (bold)
    pdf.setTextColor(34, 34, 34)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text(item.label, leftMargin + 50, yPos + 8)

    // Description
    pdf.setTextColor(113, 113, 113)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`– ${item.desc}`, leftMargin + 90, yPos + 8)

    yPos += rowHeight + 2
  })

  // Contact section - WhatsApp green background
  yPos += 5
  pdf.setFillColor(220, 248, 198) // WhatsApp light green
  pdf.roundedRect(leftMargin, yPos, boxWidth, 28, 4, 4, 'F')

  // Contact text
  pdf.setTextColor(7, 94, 84) // WhatsApp dark green
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text(t.contactTitle, leftMargin + 8, yPos + 10)

  pdf.setTextColor(18, 140, 126)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(t.contactText, leftMargin + 8, yPos + 18)

  pdf.setTextColor(7, 94, 84)
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${hostName}, ${t.hostLabel}`, leftMargin + 8, yPos + 25)

  // QR Code
  if (qrImageData) {
    try {
      pdf.addImage(qrImageData, 'PNG', boxWidth - 10, yPos + 2, 24, 24)
      pdf.setTextColor(18, 140, 126)
      pdf.setFontSize(7)
      pdf.text('WhatsApp', boxWidth + 2, yPos + 28, { align: 'center' })
    } catch (e) {
      console.error('Error adding QR to PDF:', e)
    }
  }

  // Footer
  pdf.setTextColor(180, 180, 180)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Generado con itineramio.com', pageWidth / 2, pageHeight - 8, { align: 'center' })

  // Get PDF as buffer
  const pdfOutput = pdf.output('arraybuffer')
  return Buffer.from(pdfOutput)
}

function generateEmailHTML(hostName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto; padding: 40px 16px;">
    <tr>
      <td style="text-align: center; padding-bottom: 24px;">
        <p style="margin: 0; color: #717171; font-size: 13px; letter-spacing: 0.5px;">ITINERAMIO</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px 32px; border: 1px solid #DDDDDD;">
        <h1 style="margin: 0 0 20px 0; color: #222222; font-size: 24px; font-weight: 600;">
          ${hostName}, tu plantilla está lista
        </h1>

        <p style="margin: 0 0 24px 0; color: #222222; font-size: 16px; line-height: 1.6;">
          Hemos adjuntado tu plantilla personalizada en formato PDF. Imprímela y colócala en un lugar visible de tu alojamiento.
        </p>

        <div style="background: #F7F7F7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px 0; color: #222222; font-size: 14px; font-weight: 600;">
            Cómo usarla:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #717171; font-size: 14px; line-height: 1.8;">
            <li>Imprime el PDF adjunto</li>
            <li>Enmarca o plastifica la tarjeta</li>
            <li>Colócala en la entrada, salón o nevera</li>
          </ul>
        </div>

        <p style="margin: 0 0 20px 0; color: #717171; font-size: 14px; line-height: 1.6;">
          El código QR incluido permite a tus huéspedes contactarte directamente por WhatsApp si algo no fue perfecto, dándote la oportunidad de solucionarlo antes de que puntúen.
        </p>

        <p style="margin: 0; color: #222222; font-size: 16px; line-height: 1.6;">
          Un saludo,<br>
          <strong>El equipo de Itineramio</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding-top: 24px;">
        <p style="margin: 0 0 8px 0; color: #717171; font-size: 12px;">
          ¿Quieres un manual digital completo?
          <a href="https://www.itineramio.com/register" style="color: #FF385C; text-decoration: none; font-weight: 600;">Créalo gratis</a>
        </p>
        <p style="margin: 0; color: #B0B0B0; font-size: 11px;">
          <a href="https://www.itineramio.com" style="color: #B0B0B0; text-decoration: none;">itineramio.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
