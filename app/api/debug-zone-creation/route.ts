import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔍 Debug Zone Creation - Received data:', JSON.stringify(body, null, 2))
    console.log('🔍 Field types:', {
      name: typeof body.name,
      description: typeof body.description, 
      icon: typeof body.icon,
      color: typeof body.color,
      status: typeof body.status
    })
    console.log('🔍 Field values:', {
      name: body.name,
      description: body.description,
      icon: body.icon,
      color: body.color,
      status: body.status
    })
    
    // Validation checks
    const issues = []
    
    if (!body.name) issues.push('Missing name field')
    if (!body.icon) issues.push('Missing icon field')
    if (typeof body.name !== 'string') issues.push('Name is not a string')
    if (typeof body.icon !== 'string') issues.push('Icon is not a string')
    if (body.name && body.name.trim().length === 0) issues.push('Name is empty string')
    if (body.icon && body.icon.trim().length === 0) issues.push('Icon is empty string')
    
    return NextResponse.json({
      success: true,
      receivedData: body,
      fieldTypes: {
        name: typeof body.name,
        description: typeof body.description,
        icon: typeof body.icon,
        color: typeof body.color,
        status: typeof body.status
      },
      validationIssues: issues,
      wouldPass: issues.length === 0
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}