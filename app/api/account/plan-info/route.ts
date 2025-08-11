import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    
    // Count active properties
    const propertiesCount = await prisma.property.count({
      where: { 
        hostId: decoded.userId,
        status: 'ACTIVE'
      }
    })
    
    // Calculate plan info
    let currentPlan = 'Gratuito'
    let monthlyFee = 0
    
    if (propertiesCount > 1) {
      const additionalProperties = propertiesCount - 1
      // Check if user has 10+ properties for Business plan
      if (propertiesCount >= 10) {
        currentPlan = 'Business'
        monthlyFee = (propertiesCount - 1) * 2 // €2/property for additional ones
      } else {
        currentPlan = 'Growth'
        monthlyFee = additionalProperties * 2.5 // €2.50/property for additional ones
      }
    }
    
    // Get next billing date (first day of next month)
    const now = new Date()
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    return NextResponse.json({
      currentPlan,
      propertiesCount,
      monthlyFee,
      nextBillingDate: nextBillingDate.toISOString(),
      planDescription: getPlanDescription(currentPlan, propertiesCount)
    })
  } catch (error) {
    console.error('Error fetching plan info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getPlanDescription(plan: string, count: number) {
  switch (plan) {
    case 'Gratuito':
      return '1 propiedad incluida'
    case 'Growth':
      return `${count} propiedades (1 gratuita + ${count - 1} adicionales)`
    case 'Business':
      return `${count} propiedades con descuento por volumen`
    default:
      return ''
  }
}