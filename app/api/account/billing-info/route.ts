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
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        companyName: true,
        billingAddress: true,
        billingCity: true,
        billingCountry: true,
        billingPostalCode: true,
        vatNumber: true,
        referralCode: true,
        affiliateCommission: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Generate referral code if doesn't exist
    if (!user.referralCode) {
      const referralCode = `REF${decoded.userId.slice(-6).toUpperCase()}`
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { referralCode }
      })
      user.referralCode = referralCode
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching billing info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    const body = await request.json()
    
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        companyName: body.companyName || null,
        billingAddress: body.billingAddress || null,
        billingCity: body.billingCity || null,
        billingCountry: body.billingCountry || null,
        billingPostalCode: body.billingPostalCode || null,
        vatNumber: body.vatNumber || null
      },
      select: {
        companyName: true,
        billingAddress: true,
        billingCity: true,
        billingCountry: true,
        billingPostalCode: true,
        vatNumber: true
      }
    })
    
    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Error updating billing info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}