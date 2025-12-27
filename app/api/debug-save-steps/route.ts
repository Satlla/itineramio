import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔍 DEBUG - Request body received:')
    console.log(JSON.stringify(body, null, 2))
    
    if (body.steps) {
      console.log('🔍 DEBUG - Steps analysis:')
      body.steps.forEach((step: any, index: number) => {
        console.log(`Step ${index + 1}:`)
        console.log(`  - Type: ${step.type}`)
        console.log(`  - Title: ${JSON.stringify(step.title)}`)
        console.log(`  - Content: ${JSON.stringify(step.content)}`)
        console.log(`  - Has title.es: ${!!step.title?.es}`)
        console.log(`  - Title.es value: "${step.title?.es || 'EMPTY'}"`)
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug data logged to console',
      receivedSteps: body.steps?.length || 0
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}