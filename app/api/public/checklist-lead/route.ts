import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail } from '../../../../src/lib/email'
import jsPDF from 'jspdf'
import fs from 'fs'
import path from 'path'

function generateChecklistPDF(name: string, checklist: Record<string, string[]>): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const m = 14, cw = w - m * 2
  let y = 0

  // Load logo
  let logoBase64 = ''
  try {
    const logoPath = path.join(process.cwd(), 'public/logo.png')
    const logoData = fs.readFileSync(logoPath)
    logoBase64 = 'data:image/png;base64,' + logoData.toString('base64')
  } catch {}
  const logoW = 12, logoH = logoW / 1.818

  function addHeader(isFirst = false) {
    doc.setFillColor(0, 0, 0); doc.rect(0, 0, w, 0.6, 'F')
    if (logoBase64) doc.addImage(logoBase64, 'PNG', m, 5, logoW, logoH)
    doc.setFontSize(9); doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold')
    doc.text('Itineramio', m + logoW + 2, 10)
    doc.setFontSize(8); doc.setTextColor(170, 170, 170); doc.setFont('helvetica', 'normal')
    doc.text('amenities', w - m, 10, { align: 'right' })
    doc.setDrawColor(230, 230, 230); doc.line(m, 16, w - m, 16)

    if (isFirst) {
      doc.setFontSize(20); doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold')
      doc.text('Checklist de compras', w / 2, 28, { align: 'center' })
      doc.setFontSize(9); doc.setTextColor(160, 160, 160); doc.setFont('helvetica', 'normal')
      doc.text('para tu alojamiento', w / 2, 34, { align: 'center' })
      doc.setFontSize(7); doc.setTextColor(190, 190, 190)
      doc.text(`Personalizado para ${name}  ·  itineramio.com`, w / 2, 40, { align: 'center' })
      doc.setDrawColor(235, 235, 235); doc.line(w / 2 - 18, 44, w / 2 + 18, 44)
    }
  }

  function addFooter() {
    const pH = doc.internal.pageSize.getHeight()
    doc.setDrawColor(230, 230, 230); doc.line(m, pH - 10, w - m, pH - 10)
    doc.setFontSize(6.5); doc.setTextColor(180, 180, 180); doc.setFont('helvetica', 'normal')
    doc.text('itineramio.com', m, pH - 6)
    doc.text('Checklist de compras para tu alojamiento', w - m, pH - 6, { align: 'right' })
  }

  // Header
  addHeader(true)
  y = 50

  // Two columns
  const gap = 5
  const colW = (cw - gap) / 2
  const colLeftX = m
  const colRightX = m + colW + gap

  const blocks = Object.entries(checklist).map(([zone, items]) => ({ zone, items }))
  let leftY = y, rightY = y

  for (const block of blocks) {
    const blockH = 12 + block.items.length * 6.5
    const useLeft = leftY <= rightY
    let colX = useLeft ? colLeftX : colRightX
    let cy = useLeft ? leftY : rightY

    if (cy + blockH > 278) {
      addFooter(); doc.addPage(); addHeader(false)
      leftY = 22; rightY = 22; colX = colLeftX; cy = 22
    }

    // Zone header
    doc.setFillColor(30, 30, 30)
    doc.roundedRect(colX, cy, colW, 7, 1, 1, 'F')
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    doc.text(block.zone.toUpperCase(), colX + 3, cy + 5)
    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text(`${block.items.length}`, colX + colW - 3, cy + 5, { align: 'right' })
    cy += 12

    // Items
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
    for (let i = 0; i < block.items.length; i++) {
      if (i % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(colX, cy - 2, colW, 6.5, 'F') }
      doc.setDrawColor(190, 190, 190); doc.setLineWidth(0.25)
      doc.rect(colX + 2, cy - 1.5, 3.5, 3.5)
      doc.setTextColor(40, 40, 40)
      const txt = block.items[i].length > 26 ? block.items[i].substring(0, 25) + '..' : block.items[i]
      doc.text(txt, colX + 8, cy + 1)
      cy += 6.5
    }
    cy += 4

    if (colX === colLeftX) leftY = cy; else rightY = cy
  }

  // CTA
  const ctaY = Math.max(leftY, rightY) + 6
  if (ctaY < 260) {
    doc.setDrawColor(200, 200, 200)
    doc.roundedRect(m, ctaY, cw, 16, 1.5, 1.5)
    doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.setFont('helvetica', 'normal')
    doc.text('Crea una guia digital con videos para tu alojamiento.', w / 2, ctaY + 6.5, { align: 'center' })
    doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold')
    doc.text('itineramio.com', w / 2, ctaY + 12, { align: 'center' })
  }

  addFooter()
  return Buffer.from(doc.output('arraybuffer'))
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, properties, checklist } = await request.json()
    if (!email || !name) return NextResponse.json({ error: 'Nombre y email requeridos' }, { status: 400 })

    const normalizedEmail = email.toLowerCase().trim()

    // Save lead
    await prisma.lead.create({
      data: {
        name,
        email: normalizedEmail,
        source: 'checklist-airbnb',
        propertyCount: properties || null,
        metadata: { checklist, createdAt: new Date().toISOString() },
      },
    })

    // Generate PDF
    const pdfBuffer = generateChecklistPDF(name, checklist as Record<string, string[]>)

    // Build email HTML
    const checklistHtml = Object.entries(checklist as Record<string, string[]>)
      .map(([zone, items]) => `
        <div style="margin-bottom: 20px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #f0f0f0;">
            <div style="width:8px;height:8px;border-radius:50%;background:#111;"></div>
            <h3 style="font-size:14px;font-weight:600;color:#111;margin:0;">${zone}</h3>
          </div>
          ${(items as string[]).map(item => `
            <div style="display:flex;align-items:center;gap:10px;padding:5px 0;">
              <div style="width:16px;height:16px;border-radius:50%;border:2px solid #ddd;flex-shrink:0;"></div>
              <span style="font-size:13px;color:#444;">${item}</span>
            </div>
          `).join('')}
        </div>
      `).join('')

    // Send email with PDF
    await sendEmail({
      to: normalizedEmail,
      subject: 'Tu checklist de compras — Itineramio',
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#111;padding:24px;text-align:center;border-radius:0 0 12px 12px;">
            <h1 style="font-size:20px;font-weight:300;color:#fff;margin:0 0 4px;">Tu checklist de compras</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">Personalizado para ${name} · PDF adjunto</p>
          </div>
          <div style="padding:24px;">
            <p style="font-size:13px;color:#999;margin-bottom:4px;">Tienes el PDF adjunto para imprimir. Aquí también tienes la lista:</p>
            ${checklistHtml}
          </div>
          <div style="padding:20px;margin:0 24px 24px;background:#fafafa;border-radius:8px;text-align:center;">
            <p style="font-size:13px;color:#555;margin:0 0 10px;">Crea una guía digital con videos para tu alojamiento.</p>
            <a href="https://www.itineramio.com/landing-tes" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500;">Crea tu guía digital gratis</a>
          </div>
          <div style="text-align:center;padding:12px;"><p style="font-size:10px;color:#ccc;margin:0;">itineramio.com</p></div>
        </div>
      `,
      attachments: [{
        filename: `checklist-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        content: pdfBuffer,
      }],
    }).catch(() => {})

    // Notify admin
    sendEmail({
      to: 'alejandrosatlla@gmail.com',
      subject: `Nuevo lead checklist: ${name} — ${properties || 'sin dato'} propiedades`,
      html: `<div style="font-family:sans-serif;padding:20px;"><h2 style="color:#111;">Nuevo lead Checklist</h2><table style="border-collapse:collapse;"><tr><td style="padding:4px 12px 4px 0;color:#666;">Nombre</td><td style="font-weight:600;">${name}</td></tr><tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td style="font-weight:600;">${normalizedEmail}</td></tr><tr><td style="padding:4px 12px 4px 0;color:#666;">Propiedades</td><td style="font-weight:600;">${properties || 'No indicado'}</td></tr><tr><td style="padding:4px 12px 4px 0;color:#666;">Items</td><td style="font-weight:600;">${Object.values(checklist as Record<string, string[]>).flat().length}</td></tr></table></div>`,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
