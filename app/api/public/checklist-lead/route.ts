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

    // Build checklist HTML for email — branded Itineramio style
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

    // Send email with branded PDF-style checklist
    await sendEmail({
      to: normalizedEmail,
      subject: 'Tu checklist de compras para tu alojamiento — Itineramio',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <!-- Header branded -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 32px 24px; text-align: center; border-radius: 0 0 16px 16px;">
            <img src="https://www.itineramio.com/isotipo-gradient.svg" alt="Itineramio" width="32" height="18" style="filter: brightness(0) invert(1); margin-bottom: 12px;" />
            <h1 style="font-size: 22px; font-weight: 300; color: #fff; margin: 0 0 4px;">Tu checklist de compras</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0;">Personalizado para ${name}</p>
          </div>

          <!-- Checklist -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 13px; color: #999; margin-bottom: 24px;">Imprime este checklist o úsalo desde el móvil. Marca cada item cuando lo tengas.</p>
            ${checklistHtml}
          </div>

          <!-- CTA -->
          <div style="padding: 24px; margin: 0 24px 24px; background: #fafafa; border-radius: 12px; text-align: center;">
            <p style="font-size: 14px; color: #555; margin: 0 0 12px;">¿Ya tienes todo? Crea una guía digital para que tu huésped sepa dónde está cada cosa.</p>
            <a href="https://www.itineramio.com/landing-tes" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">Crea tu guía digital gratis</a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 16px 24px 24px; border-top: 1px solid #f0f0f0;">
            <p style="font-size: 11px; color: #ccc; margin: 0;">itineramio.com</p>
          </div>
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
