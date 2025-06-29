import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdmin } from '../../../../src/lib/auth';

// Generate invoice number format: INV-YYYY-XXXX
async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  
  // Get the latest invoice number for this year
  const latestInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}-`
      }
    },
    orderBy: {
      invoiceNumber: 'desc'
    }
  });

  let nextNumber = 1;
  if (latestInvoice) {
    const currentNumber = parseInt(latestInvoice.invoiceNumber.split('-')[2]);
    nextNumber = currentNumber + 1;
  }

  return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true
          }
        },
        subscription: {
          include: {
            plan: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      userId: invoice.userId,
      subscriptionId: invoice.subscriptionId,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount.toNumber(),
      discountAmount: invoice.discountAmount.toNumber(),
      finalAmount: invoice.finalAmount.toNumber(),
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      paymentReference: invoice.paymentReference,
      dueDate: invoice.dueDate.toISOString(),
      paidDate: invoice.paidDate?.toISOString(),
      notes: invoice.notes,
      createdAt: invoice.createdAt.toISOString(),
      user: invoice.user,
      subscription: invoice.subscription
    }));

    return NextResponse.json({
      success: true,
      invoices: formattedInvoices
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const { 
      userId,
      subscriptionId,
      amount,
      discountAmount,
      finalAmount,
      dueDate,
      paymentMethod,
      notes
    } = await request.json();

    // Validations
    if (!userId || !amount || !finalAmount || !dueDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId, amount, finalAmount and dueDate are required' 
      }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice
    const newInvoice = await prisma.invoice.create({
      data: {
        userId,
        subscriptionId: subscriptionId || null,
        invoiceNumber,
        amount: parseFloat(amount.toString()),
        discountAmount: parseFloat((discountAmount || 0).toString()),
        finalAmount: parseFloat(finalAmount.toString()),
        status: 'pending',
        dueDate: new Date(dueDate),
        paymentMethod: paymentMethod || null,
        notes: notes || null
        // createdBy removed - will implement when auth is ready
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity - find an admin user for now
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    });
    
    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminUser.id,
          action: 'invoice_created',
          targetType: 'invoice',
          targetId: newInvoice.id,
          description: `Created invoice ${invoiceNumber} for ${user.email}`,
          metadata: { 
            amount: finalAmount,
            userId,
            invoiceNumber
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        amount: newInvoice.amount.toNumber(),
        finalAmount: newInvoice.finalAmount.toNumber(),
        status: newInvoice.status,
        dueDate: newInvoice.dueDate.toISOString()
      },
      message: 'Invoice created successfully'
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}