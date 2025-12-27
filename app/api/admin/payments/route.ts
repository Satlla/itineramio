import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    // Get all invoices with user and related data
    const invoices = await prisma.invoice.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Parse notes to extract properties information
    const payments = invoices.map(invoice => {
      let properties = []
      try {
        if (invoice.notes) {
          const notesData = JSON.parse(invoice.notes)
          properties = notesData.properties || []
        }
      } catch (e) {
        // If notes parsing fails, ignore
      }

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        user: invoice.user,
        amount: Number(invoice.amount),
        discountAmount: Number(invoice.discountAmount),
        finalAmount: Number(invoice.finalAmount),
        status: invoice.status,
        paymentMethod: invoice.paymentMethod,
        paymentReference: invoice.paymentReference,
        dueDate: invoice.dueDate.toISOString(),
        paidDate: invoice.paidDate?.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
        notes: invoice.notes,
        properties
      }
    })

    // Calculate stats
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const stats = {
      pending: invoices.filter(inv => inv.status === 'PENDING').length,
      paid: invoices.filter(inv => inv.status === 'PAID').length,
      overdue: invoices.filter(inv => 
        inv.status === 'PENDING' && inv.dueDate < now
      ).length,
      totalAmount: invoices
        .filter(inv => inv.status === 'PENDING')
        .reduce((sum, inv) => sum + Number(inv.finalAmount), 0),
      thisMonth: invoices
        .filter(inv => 
          inv.status === 'PAID' && 
          inv.paidDate && 
          inv.paidDate >= thisMonthStart
        )
        .reduce((sum, inv) => sum + Number(inv.finalAmount), 0)
    }
    
    return NextResponse.json({ payments, stats })
    
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}