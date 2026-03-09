import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { getAuthUser } from '../../../../src/lib/auth'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'
import { sendTicketEscalatedEmail } from '../../../../src/lib/email-improved'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Simple category detection based on keywords
function detectCategory(text: string): string {
  const lower = text.toLowerCase()
  const categories: Record<string, string[]> = {
    'PROPERTIES': ['propiedad', 'property', 'alojamiento', 'apartamento', 'zone', 'zona', 'qr', 'guia', 'guide'],
    'BILLING': ['factura', 'invoice', 'pago', 'payment', 'suscripcion', 'subscription', 'plan', 'precio', 'price'],
    'GESTION': ['liquidacion', 'reserva', 'reservation', 'comision', 'commission', 'limpieza', 'cleaning', 'gmail', 'importar', 'import'],
    'ACCOUNT': ['cuenta', 'account', 'perfil', 'profile', 'contrasena', 'password', 'email'],
    'GETTING_STARTED': ['empezar', 'start', 'crear', 'create', 'como', 'how', 'primeros', 'setup'],
    'INTEGRATIONS': ['integracion', 'integration', 'api', 'pms', 'airbnb', 'booking'],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => lower.includes(kw))) return category
  }
  return 'GENERAL'
}

// Track question as FAQ (non-blocking)
async function trackFAQ(questionText: string) {
  try {
    const normalizedQuestion = questionText.trim().toLowerCase().substring(0, 80)
    if (normalizedQuestion.length < 5) return // Skip very short messages

    // Search for similar existing question
    const existing = await prisma.frequentQuestion.findFirst({
      where: {
        status: 'ACTIVE',
        question: {
          startsWith: normalizedQuestion.substring(0, 50),
          mode: 'insensitive',
        },
      },
    })

    if (existing) {
      // Increment frequency
      await prisma.frequentQuestion.update({
        where: { id: existing.id },
        data: {
          frequency: { increment: 1 },
          lastAskedAt: new Date(),
        },
      })
    } else {
      // Create new auto-detected FAQ
      const category = detectCategory(questionText)
      await prisma.frequentQuestion.create({
        data: {
          question: questionText.trim().substring(0, 500),
          category,
          isAutoDetected: true,
          frequency: 1,
          lastAskedAt: new Date(),
        },
      })
    }
  } catch (err) {
    // Non-blocking: don't fail the request if FAQ tracking fails
    console.error('Error tracking FAQ:', err)
  }
}

const SUPPORT_CHAT_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 1000 // 1 minute
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request, null, 'support-chat')
    const rateLimitResult = checkRateLimit(rateLimitKey, SUPPORT_CHAT_RATE_LIMIT)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
          }
        }
      )
    }

    // Auth is optional - visitors allowed
    const user = await getAuthUser(request)

    const body = await request.json()
    const { message, ticketId, email, subject, language = 'es' } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // If no user AND no email in body, ask for email
    if (!user && !email) {
      return NextResponse.json(
        { error: 'Email is required for non-authenticated users', code: 'EMAIL_REQUIRED' },
        { status: 400 }
      )
    }

    let ticket: { id: string; aiEnabled: boolean }

    if (ticketId) {
      // Verify ticket exists and belongs to user/email
      const existingTicket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        select: { id: true, userId: true, email: true, aiEnabled: true }
      })

      if (!existingTicket) {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        )
      }

      // Verify ownership
      if (user && existingTicket.userId !== user.userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
      if (!user && existingTicket.email !== email) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      ticket = existingTicket
    } else {
      // Create new ticket
      ticket = await prisma.supportTicket.create({
        data: {
          userId: user?.userId || null,
          email: user?.email || email,
          subject: subject || message.substring(0, 100),
          status: 'OPEN',
          priority: 'MEDIUM',
          aiEnabled: true,
          lastMessageAt: new Date(),
        },
        select: { id: true, aiEnabled: true }
      })
    }

    // Save USER message
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: 'USER',
        content: message.trim(),
      }
    })

    // Generate AI response
    let aiResponse = ''
    let aiConfidence = 1.0
    let suggestWhatsApp = false

    if (ticket.aiEnabled) {
      // Load published help articles as context
      const articles = await prisma.helpArticle.findMany({
        where: { status: 'PUBLISHED' },
        select: { title: true, content: true, category: true },
        orderBy: { order: 'asc' }
      })

      const articlesContext = articles
        .map((a) => {
          const title = typeof a.title === 'object' && a.title !== null
            ? (a.title as Record<string, string>)[language] || (a.title as Record<string, string>)['es'] || JSON.stringify(a.title)
            : String(a.title)
          const content = typeof a.content === 'object' && a.content !== null
            ? (a.content as Record<string, string>)[language] || (a.content as Record<string, string>)['es'] || JSON.stringify(a.content)
            : String(a.content)
          return `[${a.category}] ${title}\n${content}`
        })
        .join('\n\n---\n\n')

      const systemPrompt = `You are Itineramio's AI support assistant. You know EVERYTHING about the platform and help users with any question.

## ABOUT ITINERAMIO
Itineramio is a SaaS platform for vacation rental hosts with TWO independent modules:

### MODULE 1: MANUALES (Digital Guest Guides)
- Create interactive digital guidebooks for guests with zones, steps, QR codes
- Guests scan QR or visit link → see property guide with instructions
- **Zones**: Sections like Check-in, WiFi, Kitchen, House Rules, Local Recommendations
- Each zone has **Steps** (text, checklists, FAQ, multimedia)
- **QR Codes**: Unique per property and per zone, print and place in accommodation
- **Sharing**: Via QR code, direct link (itineramio.com/guide/[property]), email, WhatsApp, Airbnb/Booking messaging
- **Auto-send**: With PMS integration, guides sent automatically before check-in
- **Custom slug**: Customize property URL from Settings
- **Guest features**: Rate zones (1-5 stars), leave comments, report errors, AI chatbot
- **Analytics**: Track views, visitors, session duration, ratings, WhatsApp clicks
- **Multilingual**: Spanish, English, French auto-detected by browser language
- **AI Setup Wizard** (/ai-setup): 5-step wizard generates complete guide in ~15 minutes
- **Plans**: BASIC (1 property), HOST (3), PRO (10+), ENTERPRISE (custom)
- **Billing**: Monthly, Semestral (-10%), Yearly (-20%)

### MODULE 2: GESTION (Property Management & Invoicing)
- Financial management: reservations, liquidations, invoices
- **Price**: €8/month flat (unlimited properties), 14-day free trial
- **Setup flow**: 1) Company profile 2) Add owners/clients 3) Configure properties 4) Import reservations
- **Reservation import**: Via Gmail integration (auto-parse Airbnb/Booking emails) or CSV upload
- **Gmail Integration**: Connect Gmail → auto-detects confirmation emails → extracts guest, dates, prices → creates reservations
- **Liquidations**: Monthly settlement for owners showing income, commissions, cleaning, expenses, net amount
- **Invoices**: Professional Spanish-compliant invoices with VAT (IVA), retention (IRPF), PDF generation
- **Rectifying invoices**: For corrections to issued invoices
- **Owner portal**: Owners access via secure token link to view their earnings and documents
- **Commission types**: Percentage of revenue or fixed amount per booking
- **Cleaning fees**: Fixed per reservation or percentage, assigned to owner/manager/split
- **Spanish tax compliance**: IVA (21%), IRPF retention (0% individuals, 15% companies), CIF/NIF

### HOW TO CREATE A PROPERTY
1. Go to Dashboard → Properties → New Property
2. Enter address and details (name, type, capacity, WiFi, parking)
3. Upload photos
4. Create zones (Check-in, WiFi, Kitchen, etc.) with steps
5. Publish → share with guests via QR or link
- OR use AI Setup Wizard (/ai-setup) for automatic generation in 15 minutes

### HOW TO SHARE WITH GUESTS
1. **QR Code**: Dashboard → Property → QR Code button → print and place in property
2. **Direct link**: Copy the public URL from property card
3. **Auto-send**: Connect PMS for automatic pre-check-in delivery
4. **Messaging**: Send link via WhatsApp, email, or Airbnb/Booking chat

### GESTION WORKFLOW
1. Configure company profile (/gestion/perfil-gestor)
2. Add property owners (/gestion/clientes) - Individual (NIF) or Company (CIF)
3. Configure billing units/properties (/gestion/apartamentos) - set commissions, cleaning fees
4. Import reservations - Gmail integration or CSV upload
5. Generate monthly liquidations (/gestion/liquidaciones)
6. Create and send invoices (/gestion/facturas)

### ACCOUNT & BILLING
- Plans page: /account/plans
- Billing info: /account/billing (company, tax ID, address)
- Modules: /account/modules (activate GESTION, etc.)
- API Keys: /account/api-keys
- Referrals: /account/referrals

### TOOLS & RESOURCES (/hub/tools)
Description Generator, Pricing Calculator, Occupancy Calculator, ROI Calculator, Cleaning Checklist, WiFi Card Generator, House Rules Generator, QR Generator, Airbnb Setup Guide

### ACADEMY (/academia)
Free courses on STR management with videos, quizzes, points, achievements, certificates

### COMMON ISSUES
- **Gmail not detecting properties**: Ensure Airbnb/Booking emails are in connected Gmail, re-sync from /gestion/integraciones
- **Wrong liquidation amounts**: Click "Recalculate" button, check property billing config
- **Fix issued invoice**: Create rectifying invoice (don't edit original)
- **Cancel subscription**: /account/plans → Cancel → ends at period end, data preserved

## ADDITIONAL KNOWLEDGE BASE ARTICLES
${articlesContext || ''}

## GUIDELINES
- Answer in the SAME LANGUAGE the user writes in
- Be concise, helpful, and friendly — like a knowledgeable colleague
- Provide step-by-step instructions when explaining how to do something
- Reference specific URLs/pages when relevant (e.g., "ve a /gestion/clientes")
- If truly unsure about something very specific, suggest WhatsApp: +34 652 656 440
- NEVER say "no tengo información" about core features — you DO know the product
- Keep responses under 400 words
- Use **bold** for key actions and menu items`

      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            temperature: 0.3,
            max_tokens: 800,
          }),
        })

        if (openaiResponse.ok) {
          const data = await openaiResponse.json()
          aiResponse = data.choices?.[0]?.message?.content || ''

          // Evaluate confidence based on response content
          const lowConfidenceIndicators = [
            'no estoy seguro', 'no puedo ayudarte con', 'no tengo información',
            'no encuentro información', 'i\'m not sure', 'i cannot help',
            'i don\'t have information', 'je ne suis pas sûr',
            'no dispongo de información', 'desconozco esa funcionalidad',
            'contacta con soporte', 'contact support'
          ]
          const responseLower = aiResponse.toLowerCase()
          const hasLowConfidence = lowConfidenceIndicators.some(indicator =>
            responseLower.includes(indicator)
          )

          if (hasLowConfidence) {
            aiConfidence = 0.2
            suggestWhatsApp = true
          }
        } else {
          console.error('OpenAI API error:', openaiResponse.status, await openaiResponse.text())
          aiResponse = language === 'es'
            ? 'Lo siento, no puedo procesar tu consulta en este momento. Por favor, contacta con nosotros por WhatsApp al +34 652 656 440.'
            : 'Sorry, I cannot process your query right now. Please contact us via WhatsApp at +34 652 656 440.'
          aiConfidence = 0
          suggestWhatsApp = true
        }
      } catch (err) {
        console.error('Error calling OpenAI:', err)
        aiResponse = language === 'es'
          ? 'Lo siento, ha ocurrido un error. Por favor, contacta con nosotros por WhatsApp al +34 652 656 440.'
          : 'Sorry, an error occurred. Please contact us via WhatsApp at +34 652 656 440.'
        aiConfidence = 0
        suggestWhatsApp = true
      }

      // Save AI response
      if (aiResponse) {
        await prisma.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            sender: 'AI',
            content: aiResponse,
            aiConfidence,
          }
        })

        // Track question as FAQ (non-blocking, fire-and-forget)
        trackFAQ(message)
      }

      // If low confidence, escalate ticket + email admin
      if (aiConfidence < 0.3) {
        await prisma.supportTicket.update({
          where: { id: ticket.id },
          data: { status: 'WAITING_ADMIN' }
        })

        // Fetch recent messages for the email
        const recentMsgs = await prisma.ticketMessage.findMany({
          where: { ticketId: ticket.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { sender: true, content: true },
        })

        // Get ticket subject for email
        const ticketData = await prisma.supportTicket.findUnique({
          where: { id: ticket.id },
          select: { subject: true, email: true },
        })

        sendTicketEscalatedEmail({
          ticketId: ticket.id,
          ticketSubject: ticketData?.subject || message.substring(0, 100),
          userName: user?.email || undefined,
          userEmail: ticketData?.email || email || undefined,
          reason: 'low_confidence',
          recentMessages: recentMsgs.reverse(),
        }).catch(err => console.error('Error sending auto-escalation email:', err))
      }
    }

    // Update ticket lastMessageAt
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json({
      ticketId: ticket.id,
      message: aiResponse,
      aiConfidence,
      suggestWhatsApp,
    })
  } catch (error) {
    console.error('Error in support chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
