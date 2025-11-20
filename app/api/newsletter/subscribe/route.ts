import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { enrollSubscriberInSequences } from '../../../../src/lib/email-sequences'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'unknown', tags = [] } = body

    // Validar email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim()

    // Verificar si ya existe
    const existing = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    if (existing) {
      // Si ya está suscrito y activo
      if (existing.status === 'active') {
        return NextResponse.json(
          { message: 'Ya estás suscrito', alreadySubscribed: true },
          { status: 200 }
        )
      }

      // Si estaba unsubscribed, reactivar
      if (existing.status === 'unsubscribed') {
        await prisma.emailSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            status: 'active',
            unsubscribedAt: null,
            source,
            tags
          }
        })

        return NextResponse.json({
          success: true,
          message: '¡Bienvenido de vuelta! Suscripción reactivada'
        })
      }
    }

    // Crear nuevo suscriptor
    const newSubscriber = await prisma.emailSubscriber.create({
      data: {
        email: normalizedEmail,
        status: 'active',
        source,
        tags
      }
    })

    console.log(`✅ New newsletter subscriber: ${normalizedEmail} (source: ${source})`)

    // Enrollar automáticamente en secuencias según el source
    await enrollSubscriberInSequences(
      newSubscriber.id,
      'SUBSCRIBER_CREATED',
      {
        source,
        tags
      }
    )

    return NextResponse.json({
      success: true,
      message: '¡Genial! Revisa tu email para confirmar la suscripción'
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}

// Endpoint para unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    await prisma.emailSubscriber.update({
      where: { email: normalizedEmail },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Te hemos dado de baja correctamente'
    })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la baja' },
      { status: 500 }
    )
  }
}
