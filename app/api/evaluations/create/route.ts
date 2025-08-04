import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail, emailTemplates } from '../../../../src/lib/email-improved'
import { createNotification } from '../../../../src/lib/notifications'

// POST /api/evaluations/create - Create evaluation (from public widget)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      propertyId, 
      zoneId, 
      rating, 
      comment, 
      userName = 'Usuario anónimo', 
      userEmail,
      reviewType = 'zone',
      isPublic = false,
      clarity,
      completeness,
      helpfulness,
      upToDate,
      improvementSuggestions,
      guestAgeRange,
      guestCountry,
      guestTravelType
    } = body

    // Validate required fields
    if (!propertyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Property ID y rating son requeridos (1-5 estrellas)' },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        hostId: true,
        hostContactName: true,
        hostContactEmail: true,
        name: true,
        host: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    // Get client IP for tracking
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    if (reviewType === 'zone' && zoneId) {
      // For zone evaluations, create both a ZoneRating (private) and optionally a Review (can be public)
      
      // Check if zone exists
      const zone = await prisma.zone.findUnique({
        where: { id: zoneId },
        select: { id: true, name: true, propertyId: true }
      })

      if (!zone || zone.propertyId !== propertyId) {
        return NextResponse.json(
          { error: 'Zona no encontrada' },
          { status: 404 }
        )
      }

      // Create ZoneRating (always private, for host improvement feedback)
      await prisma.zoneRating.create({
        data: {
          zoneId,
          overallRating: rating,
          clarity: clarity || rating,
          completeness: completeness || rating,
          helpfulness: helpfulness || rating,
          upToDate: upToDate || rating,
          feedback: comment,
          improvementSuggestions,
          language: 'es',
          guestAgeRange,
          guestCountry,
          guestTravelType,
          ipAddress: ip,
          visibleToHost: true,
          visibleToGuests: false
        }
      })

      // If there's a comment or the user wants it public, also create a Review
      if (comment || isPublic) {
        await prisma.review.create({
          data: {
            propertyId,
            zoneId,
            rating,
            comment,
            userName,
            userEmail,
            reviewType: 'zone',
            isPublic: false, // Always start private, host can make it public
            isApproved: false
          }
        })
      }

      // Create notification for host about zone evaluation
      try {
        await createNotification({
          userId: property.hostId,
          type: 'evaluation',
          title: 'Nueva evaluación de zona',
          message: `Recibiste una nueva evaluación para la zona "${typeof zone.name === 'string' ? zone.name : (zone.name as any)?.es || 'Zona'}" con ${rating} estrellas`,
          data: {
            zoneId: zone.id,
            zoneName: zone.name,
            propertyId: property.id,
            propertyName: property.name,
            rating,
            feedback: comment,
            userName,
            improvementSuggestions
          }
        })
      } catch (notificationError) {
        console.warn('Could not create notification:', notificationError)
      }

      // Send email notification to property owner (check preferences first)
      try {
        // Get user notification preferences from database
        const userWithPrefs = await prisma.user.findUnique({
          where: { id: property.hostId },
          select: { notificationPreferences: true }
        })
        
        let shouldSendEmail = true // Default to sending emails
        
        if (userWithPrefs?.notificationPreferences) {
          const prefs = userWithPrefs.notificationPreferences as any
          shouldSendEmail = prefs.emailNotifications?.zoneEvaluations !== false
        }
        
        const hostEmail = property.host?.email || property.hostContactEmail
        if (hostEmail && shouldSendEmail) {
          const zoneName = typeof zone.name === 'string' ? zone.name : (zone.name as any)?.es || 'Zona'
          const propertyName = typeof property.name === 'string' ? property.name : (property.name as any)?.es || 'Propiedad'
          
          await sendEmail({
            to: hostEmail,
            subject: `Nueva evaluación de zona: ${rating} estrellas - ${propertyName}`,
            html: emailTemplates.zoneEvaluationNotification(
              propertyName,
              zoneName,
              rating,
              comment
            )
          })
          console.log('✅ Email notification sent for zone evaluation')
        } else if (!shouldSendEmail) {
          console.log('📧 Email notification skipped - user has disabled evaluation emails')
        }
      } catch (emailError) {
        console.error('❌ Error sending email notification:', emailError)
        // Continue without email - evaluation still saved
      }

      // Update zone's average rating
      const allRatings = await prisma.zoneRating.findMany({
        where: { zoneId },
        select: { overallRating: true }
      })

      const avgRating = allRatings.reduce((sum, r) => sum + r.overallRating, 0) / allRatings.length
      
      await prisma.zone.update({
        where: { id: zoneId },
        data: { avgRating }
      })

      // Update property's overall rating including zone ratings
      const allPropertyReviews = await prisma.review.findMany({
        where: { 
          propertyId,
          reviewType: 'property'
        },
        select: { rating: true }
      })

      const allPropertyZoneRatings = await prisma.zoneRating.findMany({
        where: {
          zone: {
            propertyId: propertyId
          }
        },
        select: { overallRating: true }
      })

      // Combine property reviews and zone ratings for overall property rating
      const allPropertyRatings = [
        ...allPropertyReviews.map(r => r.rating),
        ...allPropertyZoneRatings.map(r => r.overallRating)
      ]

      if (allPropertyRatings.length > 0) {
        const propertyAvgRating = allPropertyRatings.reduce((sum, r) => sum + r, 0) / allPropertyRatings.length
        
        await prisma.propertyAnalytics.upsert({
          where: { propertyId },
          create: {
            propertyId,
            overallRating: propertyAvgRating,
            totalRatings: allPropertyRatings.length
          },
          update: {
            overallRating: propertyAvgRating,
            totalRatings: allPropertyRatings.length
          }
        })
      }

    } else {
      // For property evaluations (full manual evaluation)
      const review = await prisma.review.create({
        data: {
          propertyId,
          rating,
          comment,
          userName,
          userEmail,
          reviewType: 'property',
          isPublic: false, // Always start private, host can make it public
          isApproved: false
        }
      })

      // Create notification for host about manual evaluation
      try {
        await createNotification({
          userId: property.hostId,
          type: 'evaluation',
          title: 'Nueva evaluación del manual',
          message: `${userName} evaluó tu manual completo con ${rating} estrellas${comment ? ': "' + comment.substring(0, 50) + '..."' : ''}`,
          data: {
            reviewId: review.id,
            propertyId: property.id,
            propertyName: property.name,
            rating,
            comment,
            userName,
            canBePublic: isPublic
          }
        })
      } catch (notificationError) {
        console.warn('Could not create notification:', notificationError)
      }

      // Send email notification to property owner (check preferences first)
      try {
        // Get user notification preferences from database
        const userWithPrefs = await prisma.user.findUnique({
          where: { id: property.hostId },
          select: { notificationPreferences: true }
        })
        
        let shouldSendEmail = true // Default to sending emails
        
        if (userWithPrefs?.notificationPreferences) {
          const prefs = userWithPrefs.notificationPreferences as any
          shouldSendEmail = prefs.emailNotifications?.propertyEvaluations !== false
        }
        
        const hostEmail = property.host?.email || property.hostContactEmail
        if (hostEmail && shouldSendEmail) {
          const propertyName = typeof property.name === 'string' ? property.name : (property.name as any)?.es || 'Propiedad'
          
          await sendEmail({
            to: hostEmail,
            subject: `Nueva evaluación del manual: ${rating} estrellas - ${propertyName}`,
            html: emailTemplates.zoneEvaluationNotification(
              propertyName,
              'Manual completo',
              rating,
              comment
            )
          })
          console.log('✅ Email notification sent for property evaluation')
        } else if (!shouldSendEmail) {
          console.log('📧 Email notification skipped - user has disabled property evaluation emails')
        }
      } catch (emailError) {
        console.error('❌ Error sending email notification:', emailError)
        // Continue without email - evaluation still saved
      }

      // Update property's average rating
      const allReviews = await prisma.review.findMany({
        where: { 
          propertyId,
          reviewType: 'property'
        },
        select: { rating: true }
      })

      if (allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        
        await prisma.propertyAnalytics.upsert({
          where: { propertyId },
          create: {
            propertyId,
            overallRating: avgRating,
            totalRatings: allReviews.length
          },
          update: {
            overallRating: avgRating,
            totalRatings: allReviews.length
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluación enviada correctamente. El propietario recibirá una notificación.',
      data: {
        rating,
        type: reviewType
      }
    })

  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json(
      { error: 'Error al enviar la evaluación' },
      { status: 500 }
    )
  }
}