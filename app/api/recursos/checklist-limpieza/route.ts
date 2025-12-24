import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { enrollSubscriberInSequences } from '@/lib/email-sequences'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ChecklistSection {
  title: string
  items: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, propertyName, propertyAddress, sections, style } = body

    if (!name || !email || !sections) {
      return NextResponse.json(
        { error: 'Nombre, email y secciones son obligatorios' },
        { status: 400 }
      )
    }

    // URL de descarga con parámetros
    const downloadParams = new URLSearchParams({
      nombre: propertyName || 'Mi Propiedad',
      direccion: propertyAddress || '',
      secciones: JSON.stringify(sections)
    })
    const downloadUrl = `https://www.itineramio.com/recursos/checklist-limpieza/descargar?${downloadParams.toString()}`

    // Save lead to database
    try {
      await prisma.leadMagnetDownload.create({
        data: {
          email,
          leadMagnetSlug: 'checklist-limpieza',
          metadata: { name, propertyName, propertyAddress, style, sectionsCount: sections.length }
        }
      })
    } catch (dbError) {
      console.error('Error saving lead:', dbError)
    }

    // Create or update EmailSubscriber for tool-specific nurturing sequence
    let subscriber = null
    try {
      const normalizedEmail = email.toLowerCase().trim()
      const toolTags = ['tool_checklist-limpieza', 'herramienta', 'operaciones']

      subscriber = await prisma.emailSubscriber.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          name,
          source: 'tool_checklist-limpieza',
          status: 'active',
          tags: toolTags,
          // NO asignamos archetype - lo descubriremos cuando haga el test
          currentJourneyStage: 'lead',
          engagementScore: 'warm'
        },
        update: {
          // Solo añadir tag si no existe
          tags: {
            push: 'tool_checklist-limpieza'
          },
          updatedAt: new Date()
        }
      })

      console.log(`[EmailSubscriber] Created/updated for ${normalizedEmail} from tool_checklist-limpieza`)

      // Enroll in TOOL-SPECIFIC sequences (not archetype-based)
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        source: 'tool_checklist-limpieza',
        tags: toolTags
      })

      console.log(`[EmailSubscriber] Enrolled ${normalizedEmail} in sequences`)
    } catch (subscriberError) {
      console.error('Error creating subscriber:', subscriberError)
    }

    // Generate sections HTML for email
    const sectionsHtml = (sections as ChecklistSection[]).map(section => `
      <tr>
        <td style="padding: 16px 28px 8px 28px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">${section.title}</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${section.items.map(item => `
              <tr>
                <td style="padding: 6px 0; vertical-align: top;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 24px; vertical-align: top;">
                        <div style="width: 16px; height: 16px; border: 2px solid #d1d5db; border-radius: 3px; margin-top: 2px;"></div>
                      </td>
                      <td style="padding-left: 8px; vertical-align: top;">
                        <span style="font-size: 13px; color: #374151; line-height: 1.4;">${item}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    `).join('')

    // Count total tasks
    const totalTasks = (sections as ChecklistSection[]).reduce((acc, s) => acc + s.items.length, 0)

    // Send email
    const emailResult = await resend.emails.send({
      from: 'Itineramio <recursos@itineramio.com>',
      to: email,
      subject: `Tu Checklist de Limpieza - ${propertyName || 'Profesional'}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <!-- Email Header -->
          <tr>
            <td style="padding: 0 0 32px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Itineramio</p>
              <h1 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Tu Checklist de Limpieza</h1>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">Hola ${name}, aquí tienes tu checklist personalizado listo para imprimir.</p>
            </td>
          </tr>

          <!-- ========== CHECKLIST IMPRIMIBLE ========== -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e0e0e0;">

                <!-- Header con nombre del alojamiento -->
                <tr>
                  <td style="padding: 28px 28px 0 28px; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);">
                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.8);">Checklist de Limpieza</p>
                    <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 600; color: #ffffff;">${propertyName || 'Mi Propiedad'}</p>
                    ${propertyAddress ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.9);">📍 ${propertyAddress}</p>` : ''}
                    <p style="margin: 12px 0 20px 0; font-size: 12px; color: rgba(255,255,255,0.7);">${totalTasks} tareas</p>
                  </td>
                </tr>

                <!-- Instrucciones -->
                <tr>
                  <td style="padding: 20px 28px; background: #f0f9ff; border-bottom: 1px solid #e0f2fe;">
                    <p style="margin: 0; font-size: 13px; color: #0369a1; line-height: 1.5;">
                      <strong>Cómo usar:</strong> Imprime este checklist y marca cada tarea completada. Perfecto para entregar a tu equipo de limpieza.
                    </p>
                  </td>
                </tr>

                <!-- Secciones del Checklist -->
                ${sectionsHtml}

                <!-- Espacio para notas -->
                <tr>
                  <td style="padding: 20px 28px; border-top: 1px solid #f0f0f0;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Notas adicionales</p>
                    <div style="border: 1px dashed #d1d5db; border-radius: 6px; padding: 16px; min-height: 60px;">
                      <p style="margin: 0; font-size: 11px; color: #9ca3af;">Espacio para anotaciones...</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer de la plantilla -->
                <tr>
                  <td style="padding: 16px 28px; background: #fafafa; border-top: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 11px; color: #9ca3af;">Fecha: _______________</p>
                        </td>
                        <td style="text-align: right;">
                          <p style="margin: 0; font-size: 11px; color: #9ca3af;">Firma: _______________</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
          <!-- ========== FIN CHECKLIST ========== -->

          <!-- Botón de descarga -->
          <tr>
            <td align="center" style="padding: 28px 0 0 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">
                Descargar PDF
              </a>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #888;">Haz clic para abrir y guardar como PDF</p>
            </td>
          </tr>

          <!-- Instrucciones de impresión -->
          <tr>
            <td style="padding: 32px 0 24px 0;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Cómo imprimir tu checklist</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">1. Abre el enlace de descarga</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">2. Guarda como PDF (Cmd/Ctrl + P → Guardar como PDF)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">3. Imprime en A4 y plastifica para mayor durabilidad</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #666;">4. Deja una copia visible para tu equipo de limpieza</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Blog -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <a href="https://www.itineramio.com/blog" style="display: inline-block; border: 2px solid #e5e7eb; color: #374151; padding: 12px 24px; text-decoration: none; font-weight: 500; font-size: 13px; border-radius: 6px;">
                Más recursos gratuitos
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                <a href="https://www.itineramio.com" style="color: #666; text-decoration: none;">itineramio.com</a> · Herramientas para anfitriones profesionales
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    })

    console.log('Resend result:', JSON.stringify(emailResult, null, 2))

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: emailResult.error.message || 'Error enviando email'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: emailResult.data?.id })
  } catch (error) {
    console.error('Error generating checklist:', error)
    return NextResponse.json(
      { error: 'Error al generar el checklist' },
      { status: 500 }
    )
  }
}
