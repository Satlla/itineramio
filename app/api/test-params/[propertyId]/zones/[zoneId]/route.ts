import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; zoneId: string }> }
) {
  try {
    const resolvedParams = await params
    
    return NextResponse.json({
      success: true,
      url: request.url,
      params: resolvedParams,
      paramsKeys: Object.keys(resolvedParams),
      message: 'This is a test endpoint to check parameter parsing'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      url: request.url
    })
  }
}