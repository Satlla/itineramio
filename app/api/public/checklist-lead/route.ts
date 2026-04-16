import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { sendEmail } from '../../../../src/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, properties, checklist } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Nombre y email requeridos' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Save lead
    const lead = await prisma.lead.create({
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

    // Build checklist HTML for email
    const checklistHtml = Object.entries(checklist as Record<string, string[]>)
      .map(([zone, items]) => `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; color: #111; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 6px;">${zone}</h3>
          ${(items as string[]).map(item => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
              <span style="color: #7c3aed; font-size: 14px;">&#9744;</span>
              <span style="font-size: 14px; color: #444;">${item}</span>
            </div>
          `).join('')}
        </div>
      `).join('')

    // Send email to user
    await sendEmail({
      to: normalizedEmail,
      subject: 'Tu checklist de compras para Airbnb — Itineramio',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 300; color: #111;">Tu checklist de compras para <span style="color: #7c3aed;">Airbnb</span></h1>
            <p style="color: #999; font-size: 14px;">Aquí tienes tu lista personalizada, ${name}.</p>
          </div>
          ${checklistHtml}
          <div style="margin-top: 32px; padding: 20px; background: #f5f3ff; border-radius: 12px; text-align: center;">
            <p style="font-size: 14px; color: #555; margin-bottom: 12px;">¿Ya tienes todo comprado? El siguiente paso es que tu huésped sepa dónde está cada cosa.</p>
            <a href="https://www.itineramio.com/landing-tes" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">Conoce Itineramio</a>
          </div>
          <p style="text-align: center; margin-top: 24px; font-size: 11px; color: #ccc;">Itineramio — itineramio.com</p>
        </div>
      `,
    }).catch(() => {})

    // Notify admin
    sendEmail({
      to: 'alejandrosatlla@gmail.com',
      subject: `Nuevo lead checklist: ${name} — ${properties || 'sin dato'} propiedades`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; padding: 20px;">
          <h2 style="color: #7c3aed;">Nuevo lead de Checklist Airbnb</h2>
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
