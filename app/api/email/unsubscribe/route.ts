import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * POST /api/email/unsubscribe
 *
 * Cancela la suscripción de un email
 *
 * Body:
 * {
 *   email: string (required)
 *   reason?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, reason } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar a unsubscribed
    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        unsubscribeReason: reason || 'No especificado',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Has sido dado de baja correctamente'
    })

  } catch (error) {
    console.error('Error al dar de baja:', error)
    return NextResponse.json(
      { error: 'Error al procesar la baja' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email/unsubscribe?email=xxx
 *
 * Página de confirmación de baja (para usar en links de emails)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return new Response(
        '<html><body><h1>Error</h1><p>Email no especificado</p></body></html>',
        { headers: { 'Content-Type': 'text/html' }, status: 400 }
      )
    }

    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email }
    })

    if (!subscriber) {
      return new Response(
        '<html><body><h1>Error</h1><p>Email no encontrado</p></body></html>',
        { headers: { 'Content-Type': 'text/html' }, status: 404 }
      )
    }

    // Dar de baja automáticamente
    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        unsubscribeReason: 'Clic en link de email',
        updatedAt: new Date()
      }
    })

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Baja completada - Itineramio</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          h1 { color: #111827; }
          p { color: #6b7280; line-height: 1.6; }
          .success { color: #059669; font-size: 48px; }
          a {
            color: #7c3aed;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="success">✓</div>
        <h1>Baja completada</h1>
        <p>
          Has sido dado de baja de la lista de emails de Itineramio.<br>
          No recibirás más correos de nuestra parte.
        </p>
        <p style="margin-top: 40px;">
          ¿Cambiaste de opinión? <a href="/api/email/subscribe?email=${encodeURIComponent(email)}">Volver a suscribirme</a>
        </p>
        <p style="margin-top: 40px; font-size: 14px;">
          <a href="https://itineramio.com">← Volver a Itineramio</a>
        </p>
      </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )

  } catch (error) {
    console.error('Error en unsubscribe:', error)
    return new Response(
      '<html><body><h1>Error</h1><p>Error al procesar la baja</p></body></html>',
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    )
  }
}
