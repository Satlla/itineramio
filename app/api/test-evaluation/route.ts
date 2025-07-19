import { NextRequest, NextResponse } from 'next/server'

// GET /api/test-evaluation - Test evaluation creation
export async function GET(request: NextRequest) {
  try {
    // Get property ID from query params
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const zoneId = searchParams.get('zoneId')
    
    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId required' }, { status: 400 })
    }
    
    // Create a test evaluation
    const testEvaluation = {
      propertyId,
      zoneId: zoneId || undefined,
      rating: 4,
      comment: 'Esta es una evaluación de prueba. El manual está muy bien explicado!',
      userName: 'Usuario de Prueba',
      userEmail: 'test@example.com',
      reviewType: zoneId ? 'zone' : 'property',
      clarity: 5,
      completeness: 4,
      helpfulness: 5,
      upToDate: 4,
      guestCountry: 'España',
      guestAgeRange: '25-34',
      guestTravelType: 'Familia'
    }
    
    // Call the evaluations/create endpoint
    const response = await fetch(`${request.url.split('/api')[0]}/api/evaluations/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEvaluation)
    })
    
    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Test evaluation created',
      evaluationData: testEvaluation,
      apiResponse: result
    })
    
  } catch (error) {
    console.error('Test evaluation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create test evaluation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}