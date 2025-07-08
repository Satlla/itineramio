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

    // For public reviews, name and email are required
    if (isPublic && (!userName || !userEmail)) {
      return NextResponse.json({
        success: false,
        error: 'Para evaluaciones públicas, el nombre y correo electrónico son obligatorios'
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
          isApproved: false, // Always requires approval
          emailSent: false,
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

      // Send email notification for zone evaluations (they affect overall property rating)
      if (reviewType === 'zone' && !newEvaluation.emailSent) {
        await sendZoneEvaluationEmail(newEvaluation)
      }

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
    if (!evaluation.property?.hostId) {
      return
    }
    
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
  } catch (error) {
    console.error('Error sending evaluation notification:', error)
    // Don't throw the error, just log it so the main operation continues
  }
}

// Helper function to send email notifications for zone evaluations
async function sendZoneEvaluationEmail(evaluation: any) {
  try {
    if (!evaluation.property?.hostContactEmail || !evaluation.zone) {
      return
    }

    // Get host information
    const host = await prisma.property.findFirst({
      where: { id: evaluation.propertyId },
      select: {
        hostContactName: true,
        hostContactEmail: true,
        name: true
      }
    })

    if (!host?.hostContactEmail) {
      return
    }

    // Send email notification
    const emailData = {
      to: host.hostContactEmail,
      hostName: host.hostContactName || 'Anfitrión',
      propertyName: host.name,
      propertyId: evaluation.propertyId,
      guestName: evaluation.userName,
      guestEmail: evaluation.userEmail,
      zoneName: evaluation.zone.name,
      rating: evaluation.rating,
      comment: evaluation.comment,
      evaluationId: evaluation.id
    }

    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/emails/zone-evaluation-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    })

    if (emailResponse.ok) {
      // Mark email as sent
      await prisma.review.update({
        where: { id: evaluation.id },
        data: { emailSent: true }
      })
    }

    console.log(`✅ Zone evaluation email sent to: ${host.hostContactEmail}`)
  } catch (error) {
    console.error('Error sending zone evaluation email:', error)
    // Don't throw the error, just log it so the main operation continues
  }
}