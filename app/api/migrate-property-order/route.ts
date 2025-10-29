import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  // MIGRATION DISABLED: The order field was removed from both zones and properties tables
  // This endpoint is no longer needed and should not be used
  
  return NextResponse.json({
    success: false,
    error: 'Migration endpoint disabled. The order field has been removed from the schema.'
  }, { status: 410 }) // 410 Gone - indicates that the resource is no longer available
}