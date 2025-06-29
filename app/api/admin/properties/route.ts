import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdmin } from '../../../../src/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const properties = await prisma.property.findMany({
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        zones: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedProperties = properties.map(property => ({
      id: property.id,
      name: property.name,
      address: property.street,
      city: property.city,
      country: property.country,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      isPublished: property.isPublished,
      createdAt: property.createdAt.toISOString(),
      host: property.host,
      zones: property.zones
    }));

    return NextResponse.json({
      success: true,
      properties: formattedProperties,
      total: formattedProperties.length,
      published: formattedProperties.filter(p => p.isPublished).length
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}