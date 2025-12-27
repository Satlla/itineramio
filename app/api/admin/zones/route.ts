import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../src/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    
    // Build where clause
    const where: any = {};
    
    if (propertyId) {
      where.propertyId = propertyId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get zones with pagination
    const zones = await prisma.zone.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true
          }
        },
        _count: {
          select: {
            steps: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Get total count for pagination
    const totalCount = await prisma.zone.count({ where });
    
    return NextResponse.json({
      success: true,
      data: zones,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching zones:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}