import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/knowledge/submit-story - Recibir casos de éxito de usuarios
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      authorName,
      authorEmail,
      authorCompany,
      authorRole,
      storyTitle,
      storyDescription,
      challenge,
      solution,
      results,
      propertyType,
      propertyCount,
      location,
      useItineramio,
      allowContact,
      images
    } = body

    // Validaciones básicas
    if (!authorName || !authorEmail || !storyTitle || !storyDescription || !challenge || !solution || !results) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos'
      }, { status: 400 })
    }

    // Guardar como "UserQuestion" con tipo especial para casos de éxito
    // En el futuro podemos crear un modelo específico "SuccessStory"
    const story = await prisma.userQuestion.create({
      data: {
        question: storyTitle,
        aiResponse: JSON.stringify({
          type: 'success_story',
          authorName,
          authorEmail,
          authorCompany,
          authorRole,
          storyDescription,
          challenge,
          solution,
          results,
          propertyType,
          propertyCount,
          location,
          useItineramio,
          allowContact,
          images
        }),
        aiModel: 'user_submission',
        responseTime: 0,
        category: 'MARKETING',
        generatedArticle: false,
        wasHelpful: null
      }
    })

    // TODO: Enviar notificación por email al equipo admin
    console.log('📝 Nueva historia recibida:', story.id)

    return NextResponse.json({
      success: true,
      data: {
        id: story.id,
        message: 'Historia recibida exitosamente. Te contactaremos en 48 horas.'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al guardar historia:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al guardar historia'
    }, { status: 500 })
  }
}
