import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../src/lib/prisma';
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../../src/lib/admin-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const { id: invoiceId } = await params;

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invoice not found' 
      }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot cancel a paid invoice' 
      }, { status: 400 });
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invoice is already cancelled' 
      }, { status: 400 });
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'CANCELLED'
      }
    });

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'invoice_cancelled',
      targetType: 'invoice',
      targetId: invoiceId,
      description: `Cancelled invoice ${invoice.invoiceNumber}`,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.finalAmount.toNumber(),
        userEmail: invoice.user.email
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Invoice cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling invoice:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}