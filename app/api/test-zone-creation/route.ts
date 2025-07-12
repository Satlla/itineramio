import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId') || 'cmd01rd660003jr047ahyxxqt'
    
    console.log('🧪 Testing zone creation for property:', propertyId)
    
    // Test with a simple zone
    const testZoneData = {
      name: 'Test WiFi Zone',
      description: 'Test description for WiFi',
      icon: 'wifi',
      color: 'bg-gray-100',
      status: 'ACTIVE'
    }
    
    console.log('🧪 Sending test zone data:', testZoneData)
    
    // Make the actual API call
    const zoneResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://www.itineramio.com'}/api/properties/${propertyId}/zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('Cookie') || ''
      },
      body: JSON.stringify(testZoneData)
    })
    
    const zoneResult = await zoneResponse.json()
    
    console.log('🧪 Zone creation response:', {
      status: zoneResponse.status,
      ok: zoneResponse.ok,
      result: zoneResult
    })
    
    return NextResponse.json({
      success: true,
      testData: testZoneData,
      apiResponse: {
        status: zoneResponse.status,
        ok: zoneResponse.ok,
        result: zoneResult
      }
    })
    
  } catch (error) {
    console.error('Test zone creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}