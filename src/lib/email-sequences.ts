/**
 * Email Sequences - Sistema de secuencias automatizadas con Resend
 *
 * Este sistema permite:
 * - Crear secuencias de emails automatizadas
 * - Inscribir subscribers en secuencias basadas en triggers
 * - Programar envíos con delays y condiciones
 * - Trackear engagement (opens, clicks, bounces)
 */

import { prisma } from './prisma'
import { Resend } from 'resend'
import * as React from 'react'

// Lazy template loader - imports templates on demand
// This avoids build issues while still working in production
async function getEmailTemplate(templateName: string): Promise<React.FC<any> | null> {
  try {
    switch (templateName) {
      case 'welcome-test.tsx':
        return (await import('../emails/templates/welcome-test')).default
      case 'sequence-day2-personalized.tsx':
        return (await import('../emails/templates/sequence-day2-personalized')).default
      case 'sequence-day3-mistakes.tsx':
        return (await import('../emails/templates/sequence-day3-mistakes')).default
      case 'sequence-day7-case-study.tsx':
        return (await import('../emails/templates/sequence-day7-case-study')).default
      case 'sequence-day10-trial.tsx':
        return (await import('../emails/templates/sequence-day10-trial')).default
      case 'sequence-day14-urgency.tsx':
        return (await import('../emails/templates/sequence-day14-urgency')).default
      case 'nivel-day1-bienvenida.tsx':
        return (await import('../emails/templates/nivel-day1-bienvenida')).default
      case 'nivel-day2-mejores-practicas.tsx':
        return (await import('../emails/templates/nivel-day2-mejores-practicas')).default
      case 'nivel-day3-test-cta.tsx':
        return (await import('../emails/templates/nivel-day3-test-cta')).default
      case 'nivel-day5-caso-estudio.tsx':
        return (await import('../emails/templates/nivel-day5-caso-estudio')).default
      case 'nivel-day7-recurso-avanzado.tsx':
        return (await import('../emails/templates/nivel-day7-recurso-avanzado')).default
      case 'onboarding-day1-stats.tsx':
        return (await import('../emails/templates/onboarding-day1-stats')).default
      case 'lead-magnet-download.tsx':
        return (await import('../emails/templates/lead-magnet-download')).default
      case 'welcome-qr.tsx':
        return (await import('../emails/templates/welcome-qr')).default
      // Tool: Checklist de Limpieza templates
      case 'tool-checklist-day0-delivery':
        return (await import('../emails/templates/tools/tool-checklist-day0-delivery')).default
      case 'tool-checklist-day2-mistakes':
        return (await import('../emails/templates/tools/tool-checklist-day2-mistakes')).default
      case 'tool-checklist-day4-resource':
        return (await import('../emails/templates/tools/tool-checklist-day4-resource')).default
      case 'tool-checklist-day6-test':
        return (await import('../emails/templates/tools/tool-checklist-day6-test')).default
      case 'tool-checklist-day8-offer':
        return (await import('../emails/templates/tools/tool-checklist-day8-offer')).default
      // Tool: Calculadora de Precios templates
      case 'tool-pricing-day0-delivery':
        return (await import('../emails/templates/tools/tool-pricing-day0-delivery')).default
      case 'tool-pricing-day2-mistakes':
        return (await import('../emails/templates/tools/tool-pricing-day2-mistakes')).default
      case 'tool-pricing-day4-resource':
        return (await import('../emails/templates/tools/tool-pricing-day4-resource')).default
      case 'tool-pricing-day6-test':
        return (await import('../emails/templates/tools/tool-pricing-day6-test')).default
      case 'tool-pricing-day8-offer':
        return (await import('../emails/templates/tools/tool-pricing-day8-offer')).default
      // Tool: Tarjeta WiFi templates
      case 'tool-wifi-day0-delivery':
        return (await import('../emails/templates/tools/tool-wifi-day0-delivery')).default
      case 'tool-wifi-day2-mistakes':
        return (await import('../emails/templates/tools/tool-wifi-day2-mistakes')).default
      case 'tool-wifi-day4-resource':
        return (await import('../emails/templates/tools/tool-wifi-day4-resource')).default
      case 'tool-wifi-day6-test':
        return (await import('../emails/templates/tools/tool-wifi-day6-test')).default
      case 'tool-wifi-day8-offer':
        return (await import('../emails/templates/tools/tool-wifi-day8-offer')).default
      // Tool: Generador de QR templates
      case 'tool-qr-day0-delivery':
        return (await import('../emails/templates/tools/tool-qr-day0-delivery')).default
      case 'tool-qr-day2-mistakes':
        return (await import('../emails/templates/tools/tool-qr-day2-mistakes')).default
      case 'tool-qr-day4-resource':
        return (await import('../emails/templates/tools/tool-qr-day4-resource')).default
      case 'tool-qr-day6-test':
        return (await import('../emails/templates/tools/tool-qr-day6-test')).default
      case 'tool-qr-day8-offer':
        return (await import('../emails/templates/tools/tool-qr-day8-offer')).default
      // Tool: Plantilla Reviews templates
      case 'tool-reviews-day0-delivery':
        return (await import('../emails/templates/tools/tool-reviews-day0-delivery')).default
      case 'tool-reviews-day2-mistakes':
        return (await import('../emails/templates/tools/tool-reviews-day2-mistakes')).default
      case 'tool-reviews-day4-case':
        return (await import('../emails/templates/tools/tool-reviews-day4-case')).default
      case 'tool-reviews-day6-negative':
        return (await import('../emails/templates/tools/tool-reviews-day6-negative')).default
      case 'tool-reviews-day8-offer':
        return (await import('../emails/templates/tools/tool-reviews-day8-offer')).default
      // Tool: Calculadora de ROI templates
      case 'tool-roi-day0-delivery':
        return (await import('../emails/templates/tools/tool-roi-day0-delivery')).default
      case 'tool-roi-day2-mistakes':
        return (await import('../emails/templates/tools/tool-roi-day2-mistakes')).default
      case 'tool-roi-day4-resource':
        return (await import('../emails/templates/tools/tool-roi-day4-resource')).default
      case 'tool-roi-day6-test':
        return (await import('../emails/templates/tools/tool-roi-day6-test')).default
      case 'tool-roi-day8-offer':
        return (await import('../emails/templates/tools/tool-roi-day8-offer')).default
      // Tool: Generador de Normas templates
      case 'tool-house-rules-day0-delivery':
        return (await import('../emails/templates/tools/tool-house-rules-day0-delivery')).default
      case 'tool-house-rules-day2-mistakes':
        return (await import('../emails/templates/tools/tool-house-rules-day2-mistakes')).default
      case 'tool-house-rules-day4-prearrivals':
        return (await import('../emails/templates/tools/tool-house-rules-day4-prearrivals')).default
      case 'tool-house-rules-day6-violations':
        return (await import('../emails/templates/tools/tool-house-rules-day6-violations')).default
      case 'tool-house-rules-day8-offer':
        return (await import('../emails/templates/tools/tool-house-rules-day8-offer')).default
      default:
        console.error(`[EMAIL TEMPLATES] Unknown template: ${templateName}`)
        return null
    }
  } catch (error) {
    console.error(`[EMAIL TEMPLATES] Failed to load template ${templateName}:`, error)
    return null
  }
}

// Lazy initialization to avoid build errors when RESEND_API_KEY is not set
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set - email sending will fail at runtime')
    }
    _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  }
  return _resend
}

// ============================================
// TYPES
// ============================================

export type TriggerEvent =
  | 'SUBSCRIBER_CREATED'
  | 'TEST_COMPLETED'
  | 'BLOG_DOWNLOAD'
  | 'QUIZ_COMPLETED'
  | 'COURSE_ENROLLED'

export type EmailEventType =
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'unsubscribed'

// ============================================
// ENROLLMENT - Inscribir subscribers en secuencias
// ============================================

/**
 * Inscribe un subscriber en todas las secuencias que correspondan
 * basadas en el trigger event y la segmentación
 */
export async function enrollSubscriberInSequences(
  subscriberId: string,
  triggerEvent: TriggerEvent,
  metadata?: {
    archetype?: string
    source?: string
    tags?: string[]
  }
) {
  console.log(`[EMAIL SEQUENCES] Enrolling subscriber ${subscriberId} for trigger: ${triggerEvent}`)

  // Buscar el subscriber
  const subscriber = await prisma.emailSubscriber.findUnique({
    where: { id: subscriberId }
  })

  if (!subscriber) {
    console.error(`[EMAIL SEQUENCES] Subscriber ${subscriberId} not found`)
    return { success: false, error: 'Subscriber not found' }
  }

  if (subscriber.status !== 'active') {
    console.log(`[EMAIL SEQUENCES] Subscriber ${subscriberId} is not active, skipping enrollment`)
    return { success: false, error: 'Subscriber not active' }
  }

  // Buscar secuencias activas que correspondan
  const allSequences = await prisma.emailSequence.findMany({
    where: {
      isActive: true,
      triggerEvent
    },
    include: {
      steps: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { priority: 'desc' } // Mayor prioridad primero
  })

  // Filtrar secuencias que apliquen según segmentación
  const sequences = allSequences.filter((seq) => {
    // Si la secuencia tiene targetTags, verificar que el subscriber tenga al menos uno
    if (seq.targetTags && seq.targetTags.length > 0) {
      const subscriberTags = metadata?.tags || subscriber.tags || []
      const hasMatchingTag = seq.targetTags.some((tag: string) => subscriberTags.includes(tag))
      if (!hasMatchingTag) return false
    }

    // Si la secuencia tiene targetArchetype, verificar que coincida
    if (seq.targetArchetype) {
      const arch = metadata?.archetype || subscriber.archetype
      if (seq.targetArchetype !== arch) return false
    }

    // Si la secuencia tiene targetSource, verificar que coincida
    if (seq.targetSource) {
      const src = metadata?.source || subscriber.source
      if (seq.targetSource !== src) return false
    }

    // Si no tiene ningún target específico, aplica a todos
    if (!seq.targetArchetype && !seq.targetSource && (!seq.targetTags || seq.targetTags.length === 0)) {
      return true
    }

    // Si llegamos aquí, al menos un criterio coincidió
    return true
  })

  console.log(`[EMAIL SEQUENCES] Found ${sequences.length} matching sequences`)

  const enrollments = []

  for (const sequence of sequences) {
    // Verificar si ya está inscrito
    const existing = await prisma.sequenceEnrollment.findUnique({
      where: {
        subscriberId_sequenceId: {
          subscriberId,
          sequenceId: sequence.id
        }
      }
    })

    if (existing) {
      console.log(`[EMAIL SEQUENCES] Subscriber already enrolled in sequence ${sequence.name}`)
      continue
    }

    // Crear enrollment
    const enrollment = await prisma.sequenceEnrollment.create({
      data: {
        subscriberId,
        sequenceId: sequence.id,
        status: 'active',
        currentStepOrder: 0
      }
    })

    // Actualizar stats de la secuencia
    await prisma.emailSequence.update({
      where: { id: sequence.id },
      data: {
        subscribersEnrolled: { increment: 1 },
        subscribersActive: { increment: 1 }
      }
    })

    console.log(`[EMAIL SEQUENCES] Enrolled in sequence: ${sequence.name}`)

    // Programar los emails de esta secuencia
    await scheduleSequenceEmails(enrollment.id, sequence, subscriber)

    enrollments.push(enrollment)
  }

  return {
    success: true,
    enrollments,
    message: `Enrolled in ${enrollments.length} sequence(s)`
  }
}

// ============================================
// SCHEDULING - Programar emails de una secuencia
// ============================================

/**
 * Programa todos los emails de una secuencia para un enrollment
 */
async function scheduleSequenceEmails(
  enrollmentId: string,
  sequence: any, // EmailSequence con steps
  subscriber: any // EmailSubscriber
) {
  console.log(`[EMAIL SEQUENCES] Scheduling emails for enrollment ${enrollmentId}`)

  const now = new Date()
  let previousScheduledTime = now

  for (const step of sequence.steps) {
    // Calcular cuándo enviar
    const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000)
    let scheduledFor = new Date(previousScheduledTime.getTime() + delayMs)

    // Si especifica hora del día, ajustar
    if (step.sendAtHour !== null && step.sendAtHour !== undefined) {
      scheduledFor.setHours(step.sendAtHour, 0, 0, 0)

      // Si la hora ya pasó hoy, programar para mañana
      if (scheduledFor < now) {
        scheduledFor.setDate(scheduledFor.getDate() + 1)
      }
    }

    // Determinar subject (dinámico para día 2 personalizado y emails por nivel)
    let emailSubject = step.subject
    let templateData = step.templateData || {}

    // Si es el email del día 2 personalizado, usar subject y datos según arquetipo
    if (step.templateName === 'sequence-day2-personalized.tsx' && subscriber.archetype) {
      // Importar la función que obtiene el subject por arquetipo
      const { getDay2Subject } = await import('../emails/templates/sequence-day2-personalized')
      emailSubject = getDay2Subject(subscriber.archetype as any)
      templateData = { ...templateData, archetype: subscriber.archetype }
    }

    // Emails personalizados por nivel (TOFU funnel)
    const nivelFromTags = subscriber.tags?.find((tag: string) => tag.startsWith('nivel_'))?.replace('nivel_', '') as
      | 'principiante'
      | 'intermedio'
      | 'avanzado'
      | 'profesional'
      | undefined

    if (step.templateName === 'nivel-day1-bienvenida.tsx' && nivelFromTags) {
      const { getNivelDay1Subject } = await import('../emails/templates/nivel-day1-bienvenida')
      emailSubject = getNivelDay1Subject(nivelFromTags)
      templateData = { ...templateData, nivel: nivelFromTags }
    }

    if (step.templateName === 'nivel-day2-mejores-practicas.tsx' && nivelFromTags) {
      const { getNivelDay2Subject } = await import('../emails/templates/nivel-day2-mejores-practicas')
      emailSubject = getNivelDay2Subject(nivelFromTags)
      templateData = { ...templateData, nivel: nivelFromTags }
    }

    if (step.templateName === 'nivel-day3-test-cta.tsx' && nivelFromTags) {
      const { getNivelDay3Subject } = await import('../emails/templates/nivel-day3-test-cta')
      emailSubject = getNivelDay3Subject(nivelFromTags)
      templateData = { ...templateData, nivel: nivelFromTags }
    }

    if (step.templateName === 'nivel-day5-caso-estudio.tsx' && nivelFromTags) {
      const { getNivelDay5Subject } = await import('../emails/templates/nivel-day5-caso-estudio')
      emailSubject = getNivelDay5Subject(nivelFromTags)
      templateData = { ...templateData, nivel: nivelFromTags }
    }

    if (step.templateName === 'nivel-day7-recurso-avanzado.tsx' && nivelFromTags) {
      const { getNivelDay7Subject } = await import('../emails/templates/nivel-day7-recurso-avanzado')
      emailSubject = getNivelDay7Subject(nivelFromTags)
      templateData = { ...templateData, nivel: nivelFromTags }
    }

    // Tool templates: pass sourceMetadata for personalization
    if (step.templateName.startsWith('tool-pricing') && subscriber.sourceMetadata) {
      templateData = { ...templateData, pricingData: subscriber.sourceMetadata }
    }
    if (step.templateName.startsWith('tool-qr') && subscriber.sourceMetadata) {
      templateData = { ...templateData, qrData: subscriber.sourceMetadata }
    }
    if (step.templateName.startsWith('tool-house-rules') && subscriber.sourceMetadata) {
      templateData = { ...templateData, rulesData: subscriber.sourceMetadata }
    }

    // Crear scheduled email
    await prisma.scheduledEmail.create({
      data: {
        enrollmentId,
        stepId: step.id,
        subscriberId: subscriber.id,
        recipientEmail: subscriber.email,
        recipientName: subscriber.name,
        subject: emailSubject,
        templateName: step.templateName,
        templateData,
        scheduledFor,
        status: 'pending'
      }
    })

    console.log(`[EMAIL SEQUENCES] Scheduled: ${step.name} for ${scheduledFor.toISOString()}`)

    // Actualizar para el siguiente email
    previousScheduledTime = scheduledFor
  }

  return { success: true }
}

// ============================================
// SENDING - Procesar y enviar emails programados
// ============================================

/**
 * Procesa y envía emails programados que estén listos
 * Esta función se ejecuta en el cron job
 *
 * DAILY LIMIT: Máximo 1 email de nurturing por usuario por día
 * (Los emails de entrega inmediata - step.order === 0 - no cuentan para el límite)
 */
export async function processScheduledEmails(limit: number = 50) {
  console.log(`[EMAIL SEQUENCES] Processing scheduled emails (limit: ${limit})`)

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  // Buscar emails listos para enviar
  const scheduledEmails = await prisma.scheduledEmail.findMany({
    where: {
      status: 'pending',
      scheduledFor: { lte: now }
    },
    include: {
      enrollment: {
        include: {
          sequence: true
        }
      },
      step: true
    },
    orderBy: { scheduledFor: 'asc' },
    take: limit
  })

  console.log(`[EMAIL SEQUENCES] Found ${scheduledEmails.length} emails to send`)

  const results = []
  // Track which subscribers already received a nurturing email today (in this batch)
  const subscribersSentToday = new Set<string>()

  for (const scheduledEmail of scheduledEmails) {
    const subscriberId = scheduledEmail.subscriberId
    const isDeliveryEmail = scheduledEmail.step?.order === 0

    // Check if this subscriber already received a nurturing email today
    // (Delivery emails - order 0 - are exempt from daily limit)
    if (!isDeliveryEmail) {
      // Check in database
      const alreadySentToday = await prisma.scheduledEmail.findFirst({
        where: {
          subscriberId,
          status: 'sent',
          sentAt: { gte: todayStart },
          step: {
            order: { gt: 0 } // Only count nurturing emails (not delivery)
          }
        }
      })

      if (alreadySentToday || subscribersSentToday.has(subscriberId)) {
        // Reschedule for tomorrow at the same hour
        const tomorrow = new Date(scheduledEmail.scheduledFor)
        tomorrow.setDate(tomorrow.getDate() + 1)

        await prisma.scheduledEmail.update({
          where: { id: scheduledEmail.id },
          data: { scheduledFor: tomorrow }
        })

        console.log(`[EMAIL SEQUENCES] Daily limit reached for ${subscriberId}, rescheduled to ${tomorrow.toISOString()}`)
        continue
      }
    }

    // Verificar condiciones del step
    if (scheduledEmail.step.requiresPreviousOpen || scheduledEmail.step.requiresPreviousClick) {
      const canSend = await checkStepConditions(scheduledEmail)
      if (!canSend) {
        console.log(`[EMAIL SEQUENCES] Conditions not met for ${scheduledEmail.id}, skipping`)

        // Cancelar este email
        await prisma.scheduledEmail.update({
          where: { id: scheduledEmail.id },
          data: { status: 'cancelled' }
        })
        continue
      }
    }

    // Verificar que el enrollment siga activo
    if (scheduledEmail.enrollment.status !== 'active') {
      console.log(`[EMAIL SEQUENCES] Enrollment inactive, cancelling email ${scheduledEmail.id}`)
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmail.id },
        data: { status: 'cancelled' }
      })
      continue
    }

    // Enviar el email
    const result = await sendScheduledEmail(scheduledEmail)
    results.push(result)

    // Mark this subscriber as having received a nurturing email today
    if (!isDeliveryEmail && result.success) {
      subscribersSentToday.add(subscriberId)
    }
  }

  return {
    success: true,
    processed: scheduledEmails.length,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    rescheduled: scheduledEmails.length - results.length
  }
}

/**
 * Verifica si se cumplen las condiciones para enviar un email
 */
async function checkStepConditions(scheduledEmail: any): Promise<boolean> {
  const step = scheduledEmail.step

  // Buscar el email anterior en la secuencia
  const previousStep = await prisma.emailSequenceStep.findFirst({
    where: {
      sequenceId: step.sequenceId,
      order: step.order - 1
    }
  })

  if (!previousStep) {
    // Es el primer email, no hay condiciones
    return true
  }

  // Buscar el scheduled email anterior
  const previousEmail = await prisma.scheduledEmail.findFirst({
    where: {
      enrollmentId: scheduledEmail.enrollmentId,
      stepId: previousStep.id
    }
  })

  if (!previousEmail) {
    return false
  }

  // Verificar condiciones
  if (step.requiresPreviousOpen && !previousEmail.openedAt) {
    return false
  }

  if (step.requiresPreviousClick && !previousEmail.clickedAt) {
    return false
  }

  return true
}

/**
 * Envía un email programado usando Resend
 */
async function sendScheduledEmail(scheduledEmail: any) {
  console.log(`[EMAIL SEQUENCES] Sending email ${scheduledEmail.id} to ${scheduledEmail.recipientEmail}`)

  // Marcar como "sending"
  await prisma.scheduledEmail.update({
    where: { id: scheduledEmail.id },
    data: {
      status: 'sending',
      sendAttempts: { increment: 1 }
    }
  })

  try {
    // Get template using lazy loader (handles bundling correctly)
    const EmailComponent = await getEmailTemplate(scheduledEmail.templateName)

    if (!EmailComponent) {
      throw new Error(`Template not found or failed to load: ${scheduledEmail.templateName}`)
    }

    // Renderizar el template con los datos
    const emailHtml = EmailComponent({
      name: scheduledEmail.recipientName || 'Anfitrión',
      ...scheduledEmail.templateData
    })

    // Enviar con Resend
    const { data, error } = await getResend().emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: scheduledEmail.recipientEmail,
      subject: scheduledEmail.subject,
      react: emailHtml,
      tags: [
        {
          name: 'sequence_id',
          value: scheduledEmail.enrollment.sequenceId
        },
        {
          name: 'step_id',
          value: scheduledEmail.stepId
        },
        {
          name: 'enrollment_id',
          value: scheduledEmail.enrollmentId
        }
      ]
    })

    if (error) {
      throw error
    }

    // Actualizar como enviado
    await prisma.scheduledEmail.update({
      where: { id: scheduledEmail.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        resendId: data?.id || null
      }
    })

    // Actualizar stats del step
    await prisma.emailSequenceStep.update({
      where: { id: scheduledEmail.stepId },
      data: {
        emailsSent: { increment: 1 }
      }
    })

    // Actualizar stats del enrollment
    await prisma.sequenceEnrollment.update({
      where: { id: scheduledEmail.enrollmentId },
      data: {
        emailsSent: { increment: 1 }
      }
    })

    // Actualizar subscriber
    await prisma.emailSubscriber.update({
      where: { id: scheduledEmail.subscriberId },
      data: {
        emailsSent: { increment: 1 },
        lastEmailSentAt: new Date()
      }
    })

    console.log(`[EMAIL SEQUENCES] Email sent successfully: ${data?.id}`)

    return { success: true, emailId: data?.id }

  } catch (error: any) {
    console.error(`[EMAIL SEQUENCES] Error sending email:`, error)

    // Marcar como fallido
    await prisma.scheduledEmail.update({
      where: { id: scheduledEmail.id },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorMessage: error.message || 'Unknown error'
      }
    })

    return { success: false, error: error.message }
  }
}

// ============================================
// TRACKING - Trackear eventos de email
// ============================================

/**
 * Registra un evento de email (open, click, bounce, etc.)
 */
export async function trackEmailEvent(
  resendId: string,
  eventType: EmailEventType,
  metadata?: {
    url?: string
    reason?: string
  }
) {
  console.log(`[EMAIL SEQUENCES] Tracking event: ${eventType} for ${resendId}`)

  // Buscar el scheduled email por resendId
  const scheduledEmail = await prisma.scheduledEmail.findUnique({
    where: { resendId }
  })

  if (!scheduledEmail) {
    console.error(`[EMAIL SEQUENCES] Email not found for resendId: ${resendId}`)
    return { success: false, error: 'Email not found' }
  }

  const now = new Date()

  // Actualizar el scheduled email según el tipo de evento
  const updateData: any = {}

  switch (eventType) {
    case 'delivered':
      updateData.deliveredAt = now
      // Actualizar stats
      await prisma.emailSequenceStep.update({
        where: { id: scheduledEmail.stepId },
        data: { emailsDelivered: { increment: 1 } }
      })
      await prisma.emailSubscriber.update({
        where: { id: scheduledEmail.subscriberId },
        data: { emailsDelivered: { increment: 1 } }
      })
      break

    case 'opened':
      if (!scheduledEmail.openedAt) {
        updateData.openedAt = now
        // Actualizar stats (solo primera vez)
        await prisma.emailSequenceStep.update({
          where: { id: scheduledEmail.stepId },
          data: { emailsOpened: { increment: 1 } }
        })
        await prisma.sequenceEnrollment.update({
          where: { id: scheduledEmail.enrollmentId },
          data: { emailsOpened: { increment: 1 } }
        })
        await prisma.emailSubscriber.update({
          where: { id: scheduledEmail.subscriberId },
          data: {
            emailsOpened: { increment: 1 },
            lastEmailOpenedAt: now,
            lastEngagement: now
          }
        })
      }
      break

    case 'clicked':
      if (!scheduledEmail.clickedAt) {
        updateData.clickedAt = now
        // Actualizar stats
        await prisma.emailSequenceStep.update({
          where: { id: scheduledEmail.stepId },
          data: { emailsClicked: { increment: 1 } }
        })
        await prisma.sequenceEnrollment.update({
          where: { id: scheduledEmail.enrollmentId },
          data: { emailsClicked: { increment: 1 } }
        })
        await prisma.emailSubscriber.update({
          where: { id: scheduledEmail.subscriberId },
          data: {
            emailsClicked: { increment: 1 },
            lastEmailClickedAt: now,
            lastEngagement: now
          }
        })
      }
      break

    case 'bounced':
      updateData.bouncedAt = now
      // Actualizar stats
      await prisma.emailSequenceStep.update({
        where: { id: scheduledEmail.stepId },
        data: { emailsBounced: { increment: 1 } }
      })
      await prisma.emailSubscriber.update({
        where: { id: scheduledEmail.subscriberId },
        data: {
          emailsBounced: { increment: 1 },
          bouncedAt: now,
          status: 'bounced' // Marcar como bounced
        }
      })
      // Pausar el enrollment para no seguir enviando
      await prisma.sequenceEnrollment.update({
        where: { id: scheduledEmail.enrollmentId },
        data: {
          status: 'paused',
          pausedAt: now
        }
      })
      break

    case 'complained':
      updateData.complainedAt = now
      // Marcar como unsubscribed
      await prisma.emailSubscriber.update({
        where: { id: scheduledEmail.subscriberId },
        data: {
          status: 'unsubscribed',
          unsubscribedAt: now,
          unsubscribeReason: 'spam_complaint'
        }
      })
      // Desactivar enrollment
      await prisma.sequenceEnrollment.update({
        where: { id: scheduledEmail.enrollmentId },
        data: {
          status: 'unsubscribed',
          unsubscribedAt: now
        }
      })
      break

    case 'unsubscribed':
      updateData.unsubscribedAt = now
      // Marcar como unsubscribed
      await prisma.emailSubscriber.update({
        where: { id: scheduledEmail.subscriberId },
        data: {
          status: 'unsubscribed',
          unsubscribedAt: now
        }
      })
      // Desactivar enrollment
      await prisma.sequenceEnrollment.update({
        where: { id: scheduledEmail.enrollmentId },
        data: {
          status: 'unsubscribed',
          unsubscribedAt: now
        }
      })
      break
  }

  // Actualizar el scheduled email
  await prisma.scheduledEmail.update({
    where: { id: scheduledEmail.id },
    data: updateData
  })

  return { success: true }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Obtiene estadísticas de una secuencia
 */
export async function getSequenceStats(sequenceId: string) {
  const sequence = await prisma.emailSequence.findUnique({
    where: { id: sequenceId },
    include: {
      steps: {
        orderBy: { order: 'asc' }
      },
      enrollments: {
        where: {
          status: 'active'
        }
      }
    }
  })

  if (!sequence) {
    return null
  }

  // Calcular métricas
  const totalEnrolled = sequence.subscribersEnrolled
  const activeEnrollments = sequence.subscribersActive
  const completedEnrollments = sequence.subscribersCompleted

  const stepStats = sequence.steps.map(step => ({
    name: step.name,
    sent: step.emailsSent,
    delivered: step.emailsDelivered,
    opened: step.emailsOpened,
    clicked: step.emailsClicked,
    bounced: step.emailsBounced,
    openRate: step.emailsDelivered > 0 ? (step.emailsOpened / step.emailsDelivered * 100).toFixed(2) : 0,
    clickRate: step.emailsDelivered > 0 ? (step.emailsClicked / step.emailsDelivered * 100).toFixed(2) : 0
  }))

  return {
    name: sequence.name,
    totalEnrolled,
    activeEnrollments,
    completedEnrollments,
    completionRate: totalEnrolled > 0 ? (completedEnrollments / totalEnrolled * 100).toFixed(2) : 0,
    stepStats
  }
}
