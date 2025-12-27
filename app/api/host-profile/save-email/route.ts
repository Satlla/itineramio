import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SaveEmailRequest {
  resultId: string
  email: string
  name?: string
  emailConsent: boolean
}

export async function PATCH(request: NextRequest) {
  try {
    const body: SaveEmailRequest = await request.json()

    if (!body.resultId || !body.email) {
      return NextResponse.json(
        { error: 'Result ID y email son requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Update the test result with email
    const updated = await prisma.hostProfileTest.update({
      where: { id: body.resultId },
      data: {
        email: body.email,
        name: body.name || null,
        emailConsent: body.emailConsent
      }
    })

    // TODO: Aquí podrías enviar un email con los resultados usando un servicio como SendGrid, Resend, etc.
    // Por ejemplo:
    // await sendResultEmail({
    //   to: body.email,
    //   archetype: updated.archetype,
    //   resultUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/host-profile/results/${updated.id}`
    // })

    return NextResponse.json({
      success: true,
      message: 'Email guardado correctamente'
    })

  } catch (error) {
    console.error('Error saving email:', error)
    return NextResponse.json(
      { error: 'Error al guardar email' },
      { status: 500 }
    )
  }
}
