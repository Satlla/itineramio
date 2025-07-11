import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, rating, comment, timestamp } = await request.json()

    // Validate required fields
    if (!propertyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid rating' },
        { status: 400 }
      )
    }

    // Create evaluation through the evaluations API
    const evaluationData = {
      propertyId,
      zoneId: null, // No zone for property evaluations
      rating,
      comment: comment || null,
      userEmail: null, // Anonymous evaluation
      userName: 'Huésped anónimo',
      reviewType: 'property',
      isPublic: false // Keep private by default
    }

    // Call the evaluations API to create the evaluation and trigger notifications
    const evaluationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/evaluations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationData)
    })

    const evaluationResult = await evaluationResponse.json()

    if (!evaluationResponse.ok) {
      console.error('Error creating property evaluation:', evaluationResult)
      return NextResponse.json(
        { error: evaluationResult.error || 'Failed to create property evaluation' },
        { status: 500 }
      )
    }

    console.log('⭐ PROPERTY_RATED: Evaluation created and notifications sent', {
      propertyId,
      rating,
      comment,
      timestamp: timestamp || new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Property rating tracked and evaluation created successfully',
      evaluation: evaluationResult.data
    })
  } catch (error) {
    console.error('Error tracking property rating:', error)
    return NextResponse.json(
      { error: 'Failed to track property rating' },
      { status: 500 }
    )
  }
}