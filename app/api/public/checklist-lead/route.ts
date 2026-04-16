import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail } from '../../../../src/lib/email'
import jsPDF from 'jspdf'

function generateChecklistPDF(name: string, checklist: Record<string, string[]>): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  let y = 20

  // Header — violet bar
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 0, w, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'normal')
  doc.text('Checklist de compras', w / 2, 18, { align: 'center' })
  doc.setFontSize(11)
  doc.text(`Personalizado para ${name}`, w / 2, 26, { align: 'center' })
  doc.setFontSize(9)
  doc.setTextColor(200, 200, 255)
  doc.text('itineramio.com', w / 2, 33, { align: 'center' })

  y = 48

  // Zones
  const entries = Object.entries(checklist)
  for (const [zone, items] of entries) {
    // Check if we need a new page
    if (y + 12 + items.length * 7 > 280) {
      doc.addPage()
      y = 20
    }

    // Zone header
    doc.setFillColor(124, 58, 237)
    doc.circle(18, y + 1, 2, 'F')
    doc.setTextColor(17, 17, 17)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(zone, 24, y + 3)
    y += 4
    doc.setDrawColor(230, 230, 230)
    doc.line(14, y, w - 14, y)
    y += 6

    // Items
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    for (const item of items) {
      if (y > 275) { doc.addPage(); y = 20 }
      // Empty circle checkbox
      doc.setDrawColor(200, 200, 200)
      doc.circle(18, y, 2.5)
      doc.setTextColor(68, 68, 68)
      doc.text(item, 24, y + 1)
      y += 7
    }

    y += 6
  }

  // Footer on last page
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(230, 230, 230)
  doc.line(14, pageH - 20, w - 14, pageH - 20)
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text('itineramio.com — Guía digital para tu alojamiento turístico', w / 2, pageH - 14, { align: 'center' })

  // CTA bar at bottom
  doc.setFillColor(245, 243, 255)
  doc.roundedRect(14, pageH - 45, w - 28, 20, 4, 4, 'F')
  doc.setFontSize(9)
  doc.setTextColor(85, 85, 85)
  doc.text('¿Ya tienes todo? Crea una guía digital con videos para tu alojamiento.', w / 2, pageH - 36, { align: 'center' })
  doc.setTextColor(124, 58, 237)
  doc.setFont('helvetica', 'bold')
  doc.text('itineramio.com/landing-tes', w / 2, pageH - 30, { align: 'center' })

  return Buffer.from(doc.output('arraybuffer'))
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, properties, checklist } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Nombre y email requeridos' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Save lead
    await prisma.lead.create({
      data: {
        name,
        email: normalizedEmail,
        source: 'checklist-airbnb',
        propertyCount: properties || null,
        metadata: {
          checklist,
          createdAt: new Date().toISOString(),
        },
      },
    })

    // Generate PDF
    const pdfBuffer = generateChecklistPDF(name, checklist as Record<string, string[]>)

    // Build email HTML
    const checklistHtml = Object.entries(checklist as Record<string, string[]>)
      .map(([zone, items]) => `
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #7c3aed;"></div>
            <h3 style="font-size: 15px; font-weight: 600; color: #111; margin: 0;">${zone}</h3>
          </div>
          ${(items as string[]).map(item => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 6px 0;">
              <div style="width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ddd; flex-shrink: 0;"></div>
              <span style="font-size: 14px; color: #444;">${item}</span>
            </div>
          `).join('')}
        </div>
      `).join('')

    // Send email with PDF attached
    await sendEmail({
      to: normalizedEmail,
      subject: 'Tu checklist de compras para tu alojamiento — Itineramio',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 32px 24px; text-align: center; border-radius: 0 0 16px 16px;">
            <h1 style="font-size: 22px; font-weight: 300; color: #fff; margin: 0 0 4px;">Tu checklist de compras</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0;">Personalizado para ${name}</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 13px; color: #999; margin-bottom: 8px;">Tienes el PDF adjunto para imprimir. Aquí también tienes la lista:</p>
            ${checklistHtml}
          </div>
          <div style="padding: 24px; margin: 0 24px 24px; background: #fafafa; border-radius: 12px; text-align: center;">
            <p style="font-size: 14px; color: #555; margin: 0 0 12px;">¿Ya tienes todo? Crea una guía digital para que tu huésped sepa dónde está cada cosa.</p>
            <a href="https://www.itineramio.com/landing-tes" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: #fff; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 600;">Crea tu guía digital gratis</a>
          </div>
          <div style="text-align: center; padding: 16px 24px 24px; border-top: 1px solid #f0f0f0;">
            <p style="font-size: 11px; color: #ccc; margin: 0;">itineramio.com</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: `checklist-alojamiento-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    }).catch(() => {})

    // Notify admin
    sendEmail({
      to: 'alejandrosatlla@gmail.com',
      subject: `Nuevo lead checklist: ${name} — ${properties || 'sin dato'} propiedades`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; padding: 20px;">
          <h2 style="color: #7c3aed;">Nuevo lead de Checklist</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Nombre</td><td style="font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Email</td><td style="font-weight: 600;">${normalizedEmail}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Propiedades</td><td style="font-weight: 600;">${properties || 'No indicado'}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Items</td><td style="font-weight: 600;">${Object.values(checklist as Record<string, string[]>).flat().length} seleccionados</td></tr>
          </table>
        </div>
      `,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
