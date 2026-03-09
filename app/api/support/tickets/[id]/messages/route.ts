import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'
import { checkRateLimit, getRateLimitKey } from '../../../../../../src/lib/rate-limit'

const MESSAGE_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 1000
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    // Rate limit
    const rateLimitKey = getRateLimitKey(request, authResult.userId, 'support-message')
    const rateLimitResult = checkRateLimit(rateLimitKey, MESSAGE_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { content, language = 'es' } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Verify ticket belongs to user
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, userId: true, aiEnabled: true }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    if (ticket.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Save USER message
    const userMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: 'USER',
        content: content.trim(),
      }
    })

    const newMessages = [userMessage]

    // If AI is enabled, generate AI response
    if (ticket.aiEnabled) {
      // Load conversation history
      const history = await prisma.ticketMessage.findMany({
        where: { ticketId: ticket.id, isInternal: false },
        orderBy: { createdAt: 'asc' },
        take: 20, // Limit history
      })

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
          const articleContent = typeof a.content === 'object' && a.content !== null
            ? (a.content as Record<string, string>)[language] || (a.content as Record<string, string>)['es'] || JSON.stringify(a.content)
            : String(a.content)
          return `[${a.category}] ${title}\n${articleContent}`
        })
        .join('\n\n---\n\n')

      const systemPrompt = `You are Itineramio's AI support assistant. Itineramio is a SaaS platform that helps vacation rental hosts create digital guidebooks for their guests.

Use the following knowledge base articles to answer user questions accurately:

${articlesContext || 'No articles available yet.'}

Guidelines:
- Be concise, helpful, and friendly
- Answer in the same language the user writes in
- If you cannot find the answer in the knowledge base, honestly say so
- If you can't help, suggest contacting us via WhatsApp at +34 652 656 440
- Do not invent features or capabilities that are not mentioned in the articles
- Keep responses under 500 words`

      const conversationMessages = history.map(msg => ({
        role: msg.sender === 'USER' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }))

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
              ...conversationMessages,
            ],
            temperature: 0.3,
            max_tokens: 800,
          }),
        })

        if (openaiResponse.ok) {
          const data = await openaiResponse.json()
          const aiResponseText = data.choices?.[0]?.message?.content || ''

          // Evaluate confidence
          const lowConfidenceIndicators = [
            'no estoy seguro', 'no puedo', 'no tengo información',
            'no encuentro', 'i\'m not sure', 'i cannot', 'i don\'t have',
            'je ne suis pas sûr', 'contacta', 'whatsapp',
            'no dispongo', 'no sé', 'desconozco'
          ]
          const responseLower = aiResponseText.toLowerCase()
          const hasLowConfidence = lowConfidenceIndicators.some(indicator =>
            responseLower.includes(indicator)
          )
          const aiConfidence = hasLowConfidence ? 0.2 : 1.0

          if (aiResponseText) {
            const aiMessage = await prisma.ticketMessage.create({
              data: {
                ticketId: ticket.id,
                sender: 'AI',
                content: aiResponseText,
                aiConfidence,
              }
            })
            newMessages.push(aiMessage)

            // Escalate if low confidence
            if (aiConfidence < 0.3) {
              await prisma.supportTicket.update({
                where: { id: ticket.id },
                data: { status: 'WAITING_ADMIN' }
              })
            }
          }
        }
      } catch (err) {
        console.error('Error calling OpenAI for follow-up:', err)
        // Silently fail AI - user message was already saved
      }
    }

    // Update lastMessageAt
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json({ messages: newMessages })
  } catch (error) {
    console.error('Error adding message to ticket:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    )
  }
}
