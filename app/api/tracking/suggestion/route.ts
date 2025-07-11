import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, suggestion, timestamp } = await request.json()

    // Validate required fields
    if (!propertyId || !suggestion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get property with owner information
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: {
          include: {
            notificationPrefs: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Save suggestion to database
    await prisma.trackingEvent.create({
      data: {
        type: 'SUGGESTION',
        propertyId,
        metadata: {
          suggestion,
          timestamp: timestamp || new Date(),
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        },
        timestamp: new Date(timestamp),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    })

    // Send notifications to property owner
    await sendSuggestionNotification(property, suggestion)

    return NextResponse.json({
      success: true,
      message: 'Suggestion submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to submit suggestion' },
      { status: 500 }
    )
  }
}

// Helper function to send suggestion notifications
async function sendSuggestionNotification(property: any, suggestion: string) {
  try {
    if (!property.host) return

    const user = property.host
    const prefs = user.notificationPrefs

    // Create in-app notification (if enabled)
    if (!prefs || prefs.inAppSuggestions) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'suggestion',
          title: 'Nueva sugerencia recibida',
          message: `Has recibido una nueva sugerencia para mejorar el manual de ${property.name}`,
          read: false,
          data: {
            propertyId: property.id,
            suggestion: suggestion.substring(0, 100) + (suggestion.length > 100 ? '...' : ''),
            actionUrl: `/properties/${property.id}/zones`
          }
        }
      })
    }

    // Send email notification (if enabled)
    if (!prefs || prefs.emailSuggestions) {
      await sendSuggestionEmail(property, suggestion, user)
    }
  } catch (error) {
    console.error('Error sending suggestion notification:', error)
  }
}

// Helper function to send email notifications for suggestions
async function sendSuggestionEmail(property: any, suggestion: string, user: any) {
  try {
    const emailData = {
      to: user.email,
      hostName: user.name,
      propertyName: property.name,
      propertyId: property.id,
      suggestion,
      guestInfo: null // Anonymous suggestion from public view
    }

    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/emails/suggestion-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    })
  } catch (error) {
    console.error('Error sending suggestion email:', error)
  }
}