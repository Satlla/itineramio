import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      propertyId, 
      zoneId, 
      rating, 
      comment, 
      userEmail,
      userName,
      reviewType, // 'zone' or 'property'
      isPublic = false 
    } = body

    // Validate required fields
    if (!propertyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: 'Datos de evaluación inválidos'
      }, { status: 400 })
    }

    // Check if user already evaluated this zone/property
    const existingEvaluation = await prisma.review.findFirst({
      where: {
        propertyId,
        zoneId: zoneId || null,
        userEmail: userEmail || null,
        reviewType
      }
    })

    if (existingEvaluation) {
      // Update existing evaluation
      const updatedEvaluation = await prisma.review.update({
        where: { id: existingEvaluation.id },
        data: {
          rating,
          comment: comment || null,
          isPublic,
          updatedAt: new Date()
        },
        include: {
          zone: {
            select: {
              name: true,
              icon: true
            }
          },
          property: {
            select: {
              name: true,
              hostId: true
            }
          }
        }
      })

      // Send notification to property owner about updated evaluation
      await sendEvaluationNotification(updatedEvaluation, 'updated')

      return NextResponse.json({
        success: true,
        data: updatedEvaluation,
        message: 'Evaluación actualizada correctamente'
      })
    } else {
      // Create new evaluation
      const newEvaluation = await prisma.review.create({
        data: {
          propertyId,
          zoneId: zoneId || null,
          rating,
          comment: comment || null,
          userEmail: userEmail || null,
          userName: userName || 'Usuario anónimo',
          reviewType,
          isPublic,
          createdAt: new Date()
        },
        include: {
          zone: {
            select: {
              name: true,
              icon: true
            }
          },
          property: {
            select: {
              name: true,
              hostId: true
            }
          }
        }
      })

      // Send notification to property owner about new evaluation
      await sendEvaluationNotification(newEvaluation, 'created')

      return NextResponse.json({
        success: true,
        data: newEvaluation,
        message: 'Evaluación creada correctamente'
      })
    }
    
  } catch (error) {
    console.error('Error creating/updating evaluation:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al procesar la evaluación'
    }, { status: 500 })
  }
}

// Helper function to send notifications to property owner
async function sendEvaluationNotification(evaluation: any, action: 'created' | 'updated') {
  try {
    const notificationData = {
      userId: evaluation.property.hostId,
      type: 'evaluation',
      title: action === 'created' ? 'Nueva evaluación recibida' : 'Evaluación actualizada',
      message: evaluation.zoneId 
        ? `${evaluation.userName} ha ${action === 'created' ? 'dejado' : 'actualizado'} una evaluación (${evaluation.rating}★) en la zona "${evaluation.zone?.name}" de ${evaluation.property.name}`
        : `${evaluation.userName} ha ${action === 'created' ? 'dejado' : 'actualizado'} una evaluación general (${evaluation.rating}★) de ${evaluation.property.name}`,
      read: false,
      data: {
        propertyId: evaluation.propertyId,
        zoneId: evaluation.zoneId,
        evaluationId: evaluation.id,
        actionUrl: `/properties/${evaluation.propertyId}/evaluations`,
        rating: evaluation.rating,
        isPublic: evaluation.isPublic,
        hasComment: !!evaluation.comment
      }
    }

    // Create notification in database
    await prisma.notification.create({
      data: notificationData
    })

    console.log(`✅ Evaluation notification sent to host: ${evaluation.property.hostId}`)
  } catch (error) {
    console.error('Error sending evaluation notification:', error)
  }
}