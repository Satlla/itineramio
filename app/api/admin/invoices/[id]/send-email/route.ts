import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../../../../src/lib/admin-auth';
import { sendEmail, emailTemplates } from '../../../../../../../src/lib/email';

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
        },
        subscription: {
          include: {
            plan: true
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

    // Generate invoice email content
    const emailContent = emailTemplates.invoiceNotification({
      userName: invoice.user.name || 'Cliente',
      invoiceNumber: invoice.invoiceNumber,
      amount: Number(invoice.finalAmount).toFixed(2),
      dueDate: new Date(invoice.dueDate).toLocaleDateString('es-ES'),
      status: invoice.status,
      isPaid: invoice.status === 'paid',
      paidDate: invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString('es-ES') : undefined,
      paymentMethod: invoice.paymentMethod || undefined,
      downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'}/api/invoices/${invoice.id}/download`
    });

    // Send email
    await sendEmail({
      to: invoice.user.email,
      subject: `Factura ${invoice.invoiceNumber} - Itineramio`,
      html: emailContent
    });

    // Log activity
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    });
    
    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminUser.id,
          action: 'invoice_sent',
          targetType: 'invoice',
          targetId: invoiceId,
          description: `Sent invoice ${invoice.invoiceNumber} via email`,
          metadata: { 
            invoiceNumber: invoice.invoiceNumber,
            userEmail: invoice.user.email,
            amount: invoice.finalAmount.toNumber()
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully'
    });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}