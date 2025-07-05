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
        error: 'Datos de reseña inválidos'
      }, { status: 400 })
    }

    // Check if user already reviewed this zone/property
    const existingReview = await prisma.review.findFirst({
      where: {
        propertyId,
        zoneId: zoneId || null,
        userEmail: userEmail || null,
        reviewType
      }
    })

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
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

      // Send notification to property owner about updated review
      await sendReviewNotification(updatedReview, 'updated')

      return NextResponse.json({
        success: true,
        data: updatedReview,
        message: 'Reseña actualizada correctamente'
      })
    } else {
      // Create new review
      const newReview = await prisma.review.create({
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

      // Send notification to property owner about new review
      await sendReviewNotification(newReview, 'created')

      return NextResponse.json({
        success: true,
        data: newReview,
        message: 'Reseña creada correctamente'
      })
    }
    
  } catch (error) {
    console.error('Error creating/updating review:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al procesar la reseña'
    }, { status: 500 })
  }
}

// Helper function to send notifications to property owner
async function sendReviewNotification(review: any, action: 'created' | 'updated') {
  try {
    const notificationData = {
      userId: review.property.hostId,
      type: 'review' as const,
      title: action === 'created' ? 'Nueva reseña recibida' : 'Reseña actualizada',
      message: review.zoneId 
        ? `${review.userName} ha ${action === 'created' ? 'dejado' : 'actualizado'} una reseña (${review.rating}★) en la zona "${review.zone?.name}" de ${review.property.name}`
        : `${review.userName} ha ${action === 'created' ? 'dejado' : 'actualizado'} una reseña general (${review.rating}★) de ${review.property.name}`,
      read: false,
      propertyId: review.propertyId,
      zoneId: review.zoneId,
      reviewId: review.id,
      actionUrl: `/properties/${review.propertyId}/reviews`,
      metadata: {
        rating: review.rating,
        isPublic: review.isPublic,
        hasComment: !!review.comment
      }
    }

    // Create notification in database
    await prisma.notification.create({
      data: notificationData
    })

    console.log(`✅ Review notification sent to host: ${review.property.hostId}`)
  } catch (error) {
    console.error('Error sending review notification:', error)
  }
}