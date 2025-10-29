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
    
    const invoices = await prisma.invoice.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        amount: true,
        discountAmount: true,
        finalAmount: true,
        status: true,
        paymentMethod: true,
        dueDate: true,
        paidDate: true,
        createdAt: true,
        notes: true
      }
    })
    
    // Transform invoices to include parsed property information
    const transformedInvoices = invoices.map(invoice => {
      let properties = []
      try {
        if (invoice.notes) {
          const notesData = JSON.parse(invoice.notes)
          properties = notesData.properties || []
        }
      } catch (e) {
        // Ignore parsing errors
      }

      return {
        ...invoice,
        properties,
        amount: Number(invoice.amount),
        discountAmount: Number(invoice.discountAmount),
        finalAmount: Number(invoice.finalAmount)
      }
    })
    
    return NextResponse.json(transformedInvoices)
  } catch (error) {
    console.error('Error fetching user invoices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}