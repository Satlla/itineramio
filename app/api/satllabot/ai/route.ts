import { NextRequest, NextResponse } from 'next/server'
import { verifyPanelToken, getPanelTokenFromCookies } from '../../../../src/lib/satllabot-auth'

export async function POST(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
  }

  const body = await request.json()
  const { question, context } = body

  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'question requerida' }, { status: 400 })
  }

  const contextText = context
    ? `\n\nContexto actual:\n${JSON.stringify(context, null, 2)}`
    : ''

  const systemPrompt = 'Eres un asistente de gestión de apartamentos turísticos. Analiza los datos proporcionados y responde en español de forma concisa y accionable.'

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: question + contextText,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('[ai]', err)
    return NextResponse.json({ error: 'Error al consultar IA' }, { status: 500 })
  }

  const data = await response.json()
  const answer = data.content?.[0]?.text || 'Sin respuesta'

  return NextResponse.json({ answer })
}
