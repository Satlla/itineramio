import { NextRequest, NextResponse } from 'next/server';
import { resolveZone } from '../../../../../../src/lib/slug-resolver';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; zoneIdentifier: string }> }
) {
  try {
    const { propertyId, zoneIdentifier } = await params;
    const zone = await resolveZone(propertyId, zoneIdentifier);
    
    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error resolving zone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}