import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth';
import { sendEmail, emailTemplates } from '../../../../../../src/lib/email';

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
    
    const { paymentMethod, paymentReference, paidDate } = await request.json();
    const { id: invoiceId } = await params;

    if (!paymentMethod) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment method is required' 
      }, { status: 400 });
    }

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
        error: 'Invoice is already paid' 
      }, { status: 400 });
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot mark a cancelled invoice as paid' 
      }, { status: 400 });
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paymentMethod,
        paymentReference: paymentReference || null,
        paidDate: paidDate ? new Date(paidDate) : new Date()
      }
    });

    // Send payment confirmation email AND invoice notification
    try {
      // 1. Send payment confirmation email
      const paymentEmailContent = emailTemplates.paymentConfirmation({
        userName: invoice.user.name || 'Cliente',
        invoiceNumber: invoice.invoiceNumber,
        amount: Number(invoice.finalAmount).toFixed(2),
        paymentMethod,
        paymentReference,
        paidDate: updatedInvoice.paidDate?.toLocaleDateString('es-ES') || new Date().toLocaleDateString('es-ES')
      });

      await sendEmail({
        to: invoice.user.email,
        subject: `Pago confirmado - Factura ${invoice.invoiceNumber}`,
        html: paymentEmailContent
      });

      // 2. Send updated invoice with payment status
      const invoiceEmailContent = emailTemplates.invoiceNotification({
        userName: invoice.user.name || 'Cliente',
        invoiceNumber: invoice.invoiceNumber,
        amount: Number(invoice.finalAmount).toFixed(2),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('es-ES'),
        status: 'PAID',
        isPaid: true,
        paidDate: updatedInvoice.paidDate?.toLocaleDateString('es-ES') || new Date().toLocaleDateString('es-ES'),
        paymentMethod,
        downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/api/invoices/${invoice.id}/download`
      });

      await sendEmail({
        to: invoice.user.email,
        subject: `Factura ${invoice.invoiceNumber} - Pagada`,
        html: invoiceEmailContent
      });
      
    } catch (emailError) {
      console.error('Error sending payment emails:', emailError);
      // Don't fail the payment process if email fails
    }

    // Log activity - find an admin user for now
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    });
    
    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminUser.id,
          action: 'invoice_paid',
          targetType: 'invoice',
          targetId: invoiceId,
          description: `Marked invoice ${invoice.invoiceNumber} as paid`,
          metadata: { 
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.finalAmount.toNumber(),
            paymentMethod,
            paymentReference,
            userEmail: invoice.user.email
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Invoice marked as paid successfully. Confirmation and invoice emails sent to customer.'
    });

  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}