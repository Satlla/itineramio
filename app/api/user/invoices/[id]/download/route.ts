import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { verifyToken } from '../../../../../../src/lib/auth'

function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const authUser = verifyToken(token)
    return authUser.userId
  } catch (error) {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            companyName: true,
            billingAddress: true,
            billingCity: true,
            billingCountry: true,
            billingPostalCode: true,
            vatNumber: true
          }
        },
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Get billing info
    let billingInfo = null
    try {
      billingInfo = await prisma.billingInfo.findUnique({
        where: { userId }
      })
    } catch (error) {
      // Table might not exist yet, use fallback
    }

    // Generate HTML invoice
    const html = generateInvoiceHTML(invoice, billingInfo || {
      companyName: invoice.user.companyName,
      email: invoice.user.email,
      address: invoice.user.billingAddress,
      city: invoice.user.billingCity,
      postalCode: invoice.user.billingPostalCode,
      country: invoice.user.billingCountry
    })

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="factura-${invoice.invoiceNumber}.html"`
      }
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Error al generar factura' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any, billingInfo: any): string {
  const customerName = billingInfo.companyName || billingInfo.tradeName || `${billingInfo.firstName} ${billingInfo.lastName}` || invoice.user.name

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
            padding: 40px 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 48px;
        }

        .logo {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            font-weight: bold;
        }

        .company-info h1 {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 4px;
        }

        .company-info p {
            color: #6b7280;
            font-size: 14px;
        }

        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 48px;
            margin-bottom: 48px;
            padding-bottom: 48px;
            border-bottom: 2px solid #e5e7eb;
        }

        .section-title {
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
        }

        .customer-info p,
        .invoice-info p {
            margin-bottom: 4px;
            font-size: 14px;
        }

        .customer-info .name {
            font-weight: 600;
            font-size: 16px;
            color: #111827;
            margin-bottom: 8px;
        }

        .invoice-info {
            text-align: right;
        }

        .invoice-info .highlight {
            font-weight: 600;
            color: #111827;
        }

        .items-table {
            width: 100%;
            margin-bottom: 40px;
        }

        .items-table th {
            text-align: left;
            padding: 16px 0;
            border-bottom: 2px solid #e5e7eb;
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .items-table th:last-child {
            text-align: right;
        }

        .items-table td {
            padding: 20px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .items-table td:last-child {
            text-align: right;
            font-weight: 600;
        }

        .item-title {
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
        }

        .item-description {
            font-size: 14px;
            color: #6b7280;
        }

        .discount-row td {
            color: #059669;
        }

        .total-section {
            background: #f9fafb;
            padding: 32px;
            border-radius: 12px;
            margin-bottom: 48px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .total-label {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
        }

        .total-amount {
            font-size: 36px;
            font-weight: bold;
            color: #111827;
        }

        .paid-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: #d1fae5;
            color: #065f46;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 16px;
        }

        .footer {
            text-align: center;
            padding-top: 40px;
            border-top: 2px solid #e5e7eb;
        }

        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .container {
                box-shadow: none;
                border-radius: 0;
            }
        }

        @media (max-width: 640px) {
            .container {
                padding: 32px 24px;
            }

            .invoice-details {
                grid-template-columns: 1fr;
                gap: 32px;
            }

            .invoice-info {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">I</div>
            <div class="company-info">
                <h1>Itineramio</h1>
                <p>Gestión de Alojamientos Turísticos</p>
            </div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <div class="customer-section">
                <p class="section-title">Facturado a</p>
                <p class="name">${customerName}</p>
                <p>${billingInfo.email || invoice.user.email}</p>
                ${billingInfo.address ? `<p>${billingInfo.address}</p>` : ''}
                ${billingInfo.city ? `<p>${billingInfo.city}, ${billingInfo.postalCode || ''}</p>` : ''}
                ${billingInfo.country ? `<p>${billingInfo.country}</p>` : ''}
            </div>

            <div class="invoice-info">
                <p class="section-title">Detalles de Factura</p>
                <p>Número: <span class="highlight">${invoice.invoiceNumber}</span></p>
                <p>Fecha: <span class="highlight">${new Date(invoice.createdAt).toLocaleDateString('es-ES')}</span></p>
                <p>Vencimiento: <span class="highlight">${new Date(invoice.dueDate).toLocaleDateString('es-ES')}</span></p>
                ${invoice.paidDate ? `<p>Pagado: <span class="highlight" style="color: #059669;">${new Date(invoice.paidDate).toLocaleDateString('es-ES')}</span></p>` : ''}
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Importe</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="item-title">${invoice.subscription?.plan?.name || 'Suscripción'}</div>
                        <div class="item-description">Período de facturación</div>
                    </td>
                    <td>€${Number(invoice.amount).toFixed(2)}</td>
                </tr>
                ${Number(invoice.discountAmount) > 0 ? `
                <tr class="discount-row">
                    <td>
                        <div class="item-title">Descuento</div>
                    </td>
                    <td>-€${Number(invoice.discountAmount).toFixed(2)}</td>
                </tr>
                ` : ''}
            </tbody>
        </table>

        <!-- Total -->
        <div class="total-section">
            <div class="total-row">
                <span class="total-label">Total</span>
                <span class="total-amount">€${Number(invoice.finalAmount).toFixed(2)}</span>
            </div>
            ${invoice.status === 'PAID' ? `
            <div class="paid-badge">
                <span>✓</span>
                <span>Pagado</span>
            </div>
            ` : ''}
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Gracias por confiar en Itineramio</p>
            <p>Si tienes alguna pregunta, contacta con info@itineramio.com</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}
