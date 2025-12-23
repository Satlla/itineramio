import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/marketing/health
 *
 * Returns real-time health status of marketing funnels:
 * - Leads today by source
 * - Email queue status
 * - Sequence health
 * - Alerts
 */
export async function GET() {
  try {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // ========== LEADS TODAY ==========
    const recentSubscribers = await prisma.emailSubscriber.findMany({
      where: { createdAt: { gte: last24h } },
      select: { source: true, archetype: true }
    })

    const leadsBySource: Record<string, number> = {}
    for (const sub of recentSubscribers) {
      leadsBySource[sub.source] = (leadsBySource[sub.source] || 0) + 1
    }

    // ========== EMAIL QUEUE ==========
    const emailStats = await prisma.scheduledEmail.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const emailQueue: Record<string, number> = {
      pending: 0,
      sending: 0,
      sent: 0,
      failed: 0
    }

    for (const stat of emailStats) {
      emailQueue[stat.status] = stat._count.status
    }

    // Emails sent today
    const sentToday = await prisma.scheduledEmail.count({
      where: {
        status: 'sent',
        sentAt: { gte: last24h }
      }
    })

    // Failed emails by template
    const failedByTemplate = await prisma.scheduledEmail.groupBy({
      by: ['templateName'],
      where: { status: 'failed' },
      _count: { templateName: true }
    })

    // ========== SEQUENCES ==========
    const sequences = await prisma.emailSequence.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        triggerEvent: true,
        subscribersEnrolled: true,
        subscribersActive: true,
        subscribersCompleted: true
      }
    })

    const activeEnrollments = await prisma.sequenceEnrollment.count({
      where: { status: 'active' }
    })

    // ========== SOAP OPERA ==========
    const soapOperaStats = await prisma.emailSubscriber.groupBy({
      by: ['soapOperaStatus'],
      _count: { soapOperaStatus: true }
    })

    const soapOpera: Record<string, number> = {}
    for (const stat of soapOperaStats) {
      if (stat.soapOperaStatus) {
        soapOpera[stat.soapOperaStatus] = stat._count.soapOperaStatus
      }
    }

    // ========== WEEKLY SUMMARY ==========
    const weeklySubscribers = await prisma.emailSubscriber.count({
      where: { createdAt: { gte: last7d } }
    })

    const weeklyEmails = await prisma.scheduledEmail.count({
      where: {
        status: 'sent',
        sentAt: { gte: last7d }
      }
    })

    // ========== ALERTS ==========
    const alerts: { level: 'error' | 'warning' | 'info', message: string }[] = []

    // Check for failed emails
    if (emailQueue.failed > 5) {
      alerts.push({ level: 'error', message: `${emailQueue.failed} emails fallidos - revisar templates` })
    } else if (emailQueue.failed > 0) {
      alerts.push({ level: 'warning', message: `${emailQueue.failed} emails fallidos` })
    }

    // Check for no leads in 24h
    if (recentSubscribers.length === 0) {
      alerts.push({ level: 'warning', message: 'No hay leads nuevos en las últimas 24h' })
    }

    // Check for inactive sequences
    const inactiveSequences = sequences.filter(s => !s.isActive)
    if (inactiveSequences.length > 0) {
      alerts.push({
        level: 'warning',
        message: `${inactiveSequences.length} secuencia(s) inactiva(s): ${inactiveSequences.map(s => s.name).join(', ')}`
      })
    }

    // Check pending emails stuck
    const oldPending = await prisma.scheduledEmail.count({
      where: {
        status: 'pending',
        scheduledFor: { lt: new Date(now.getTime() - 2 * 60 * 60 * 1000) }
      }
    })
    if (oldPending > 0) {
      alerts.push({ level: 'warning', message: `${oldPending} emails pending hace más de 2h` })
    }

    // Good news
    if (alerts.length === 0) {
      alerts.push({ level: 'info', message: 'Todo funcionando correctamente' })
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      leads: {
        today: recentSubscribers.length,
        bySource: leadsBySource,
        weekly: weeklySubscribers,
        dailyAverage: (weeklySubscribers / 7).toFixed(1)
      },
      emails: {
        queue: emailQueue,
        sentToday,
        sentWeekly: weeklyEmails,
        failedByTemplate: failedByTemplate.map(t => ({
          template: t.templateName,
          count: t._count.templateName
        }))
      },
      sequences: {
        list: sequences,
        activeEnrollments,
        soapOpera
      },
      alerts
    })

  } catch (error) {
    console.error('Error fetching marketing health:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching marketing health' },
      { status: 500 }
    )
  }
}
