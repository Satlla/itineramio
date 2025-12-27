import { NextRequest, NextResponse } from 'next/server';
import { resolveProperty } from '../../../../../src/lib/slug-resolver';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const property = await resolveProperty(identifier);
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error resolving property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}