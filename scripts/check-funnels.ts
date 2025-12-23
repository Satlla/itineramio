#!/usr/bin/env npx tsx
/**
 * Diagnóstico de Embudos de Marketing
 *
 * Uso: npm run check:funnels
 *
 * Muestra estado de:
 * - Leads últimas 24h por fuente
 * - Emails (pending, sent, failed)
 * - Secuencias activas
 * - Alertas de problemas
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
}

function log(message: string) {
  console.log(message)
}

function header(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}\n`)
}

function success(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`)
}

function warning(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
}

function error(message: string) {
  console.log(`${colors.red}🔴 ${message}${colors.reset}`)
}

function info(message: string) {
  console.log(`${colors.blue}📊 ${message}${colors.reset}`)
}

async function checkFunnels() {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  console.log(`\n${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.bright}${colors.magenta}║        DIAGNÓSTICO DE EMBUDOS - ITINERAMIO                 ║${colors.reset}`)
  console.log(`${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════════╝${colors.reset}`)
  console.log(`${colors.white}Ejecutado: ${now.toLocaleString('es-ES')}${colors.reset}`)

  // ========== LEADS ÚLTIMAS 24H ==========
  header('LEADS ÚLTIMAS 24 HORAS')

  const recentSubscribers = await prisma.emailSubscriber.findMany({
    where: { createdAt: { gte: last24h } },
    select: { source: true, email: true, archetype: true }
  })

  const recentHostProfiles = await prisma.hostProfileTest.count({
    where: { createdAt: { gte: last24h } }
  })

  const recentQuizLeads = await prisma.quizLead.count({
    where: { createdAt: { gte: last24h } }
  })

  // Group by source
  const bySource: Record<string, number> = {}
  for (const sub of recentSubscribers) {
    bySource[sub.source] = (bySource[sub.source] || 0) + 1
  }

  const totalLeads = recentSubscribers.length
  info(`Leads totales: ${colors.bright}${totalLeads}${colors.reset}`)

  if (totalLeads > 0) {
    console.log(`\n   Por fuente:`)
    const sortedSources = Object.entries(bySource).sort((a, b) => b[1] - a[1])
    for (const [source, count] of sortedSources) {
      const bar = '█'.repeat(Math.min(count, 20))
      console.log(`   ${colors.cyan}├─${colors.reset} ${source}: ${colors.bright}${count}${colors.reset} ${colors.blue}${bar}${colors.reset}`)
    }
  }

  console.log(`\n   Otros registros:`)
  console.log(`   ${colors.cyan}├─${colors.reset} Host Profile Tests: ${recentHostProfiles}`)
  console.log(`   ${colors.cyan}└─${colors.reset} Quiz Leads: ${recentQuizLeads}`)

  // ========== ESTADO DE EMAILS ==========
  header('ESTADO DE EMAILS')

  const emailStats = await prisma.scheduledEmail.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  const emailCounts: Record<string, number> = {
    pending: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    cancelled: 0
  }

  for (const stat of emailStats) {
    emailCounts[stat.status] = stat._count.status
  }

  console.log(`   ${colors.yellow}⏳${colors.reset} Pending:   ${emailCounts.pending}`)
  console.log(`   ${colors.blue}📤${colors.reset} Sending:   ${emailCounts.sending}`)
  console.log(`   ${colors.green}✅${colors.reset} Sent:      ${emailCounts.sent}`)
  console.log(`   ${colors.red}❌${colors.reset} Failed:    ${emailCounts.failed}`)

  // Emails sent in last 24h
  const sentLast24h = await prisma.scheduledEmail.count({
    where: {
      status: 'sent',
      sentAt: { gte: last24h }
    }
  })
  console.log(`\n   Enviados últimas 24h: ${colors.bright}${sentLast24h}${colors.reset}`)

  // Failed emails by template
  if (emailCounts.failed > 0) {
    const failedByTemplate = await prisma.scheduledEmail.groupBy({
      by: ['templateName'],
      where: { status: 'failed' },
      _count: { templateName: true }
    })
    console.log(`\n   ${colors.red}Templates con fallos:${colors.reset}`)
    for (const t of failedByTemplate) {
      console.log(`   ${colors.red}├─${colors.reset} ${t.templateName}: ${t._count.templateName}`)
    }
  }

  // ========== SECUENCIAS ACTIVAS ==========
  header('SECUENCIAS DE EMAIL')

  const sequences = await prisma.emailSequence.findMany({
    select: {
      name: true,
      isActive: true,
      triggerEvent: true,
      subscribersEnrolled: true,
      subscribersActive: true,
      subscribersCompleted: true
    }
  })

  for (const seq of sequences) {
    const status = seq.isActive
      ? `${colors.green}●${colors.reset} ACTIVA`
      : `${colors.red}○${colors.reset} INACTIVA`
    console.log(`   ${status} ${seq.name}`)
    console.log(`      Trigger: ${seq.triggerEvent}`)
    console.log(`      Enrolled: ${seq.subscribersEnrolled} | Active: ${seq.subscribersActive} | Completed: ${seq.subscribersCompleted}`)
    console.log('')
  }

  // Active enrollments
  const activeEnrollments = await prisma.sequenceEnrollment.count({
    where: { status: 'active' }
  })
  info(`Total enrollments activos: ${activeEnrollments}`)

  // ========== SOAP OPERA STATUS ==========
  header('SOAP OPERA FUNNEL')

  const soapOperaStats = await prisma.emailSubscriber.groupBy({
    by: ['soapOperaStatus'],
    _count: { soapOperaStatus: true }
  })

  for (const stat of soapOperaStats) {
    if (stat.soapOperaStatus) {
      const icon = stat.soapOperaStatus === 'completed' ? '✅' :
                   stat.soapOperaStatus === 'active' ? '🔄' :
                   stat.soapOperaStatus === 'pending' ? '⏳' : '⏸️'
      console.log(`   ${icon} ${stat.soapOperaStatus}: ${stat._count.soapOperaStatus}`)
    }
  }

  // ========== ALERTAS ==========
  header('ALERTAS')

  const alerts: { level: 'error' | 'warning' | 'success', message: string }[] = []

  // Check for failed emails
  if (emailCounts.failed > 5) {
    alerts.push({ level: 'error', message: `${emailCounts.failed} emails fallidos - revisar templates` })
  } else if (emailCounts.failed > 0) {
    alerts.push({ level: 'warning', message: `${emailCounts.failed} emails fallidos` })
  }

  // Check for no leads in 24h
  if (totalLeads === 0) {
    alerts.push({ level: 'warning', message: 'No hay leads nuevos en las últimas 24h' })
  }

  // Check for inactive sequences
  const inactiveSequences = sequences.filter(s => !s.isActive)
  if (inactiveSequences.length > 0) {
    alerts.push({ level: 'warning', message: `${inactiveSequences.length} secuencias inactivas: ${inactiveSequences.map(s => s.name).join(', ')}` })
  }

  // Check for subscribers without enrollments
  const subscribersWithoutEnrollment = await prisma.$queryRaw<{count: bigint}[]>`
    SELECT COUNT(*) as count FROM email_subscribers es
    WHERE es.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM sequence_enrollments se WHERE se."subscriberId" = es.id
    )
    AND es."soapOperaStatus" IS NULL
  `
  const orphanCount = Number(subscribersWithoutEnrollment[0]?.count || 0)
  if (orphanCount > 0) {
    alerts.push({ level: 'warning', message: `${orphanCount} subscribers sin enrollment ni soap opera` })
  }

  // Check pending emails stuck
  const oldPending = await prisma.scheduledEmail.count({
    where: {
      status: 'pending',
      scheduledFor: { lt: new Date(now.getTime() - 2 * 60 * 60 * 1000) } // older than 2h
    }
  })
  if (oldPending > 0) {
    alerts.push({ level: 'warning', message: `${oldPending} emails pending hace más de 2h - revisar cron` })
  }

  // Display alerts
  if (alerts.length === 0) {
    success('Sin problemas detectados')
  } else {
    for (const alert of alerts) {
      if (alert.level === 'error') error(alert.message)
      else if (alert.level === 'warning') warning(alert.message)
      else success(alert.message)
    }
  }

  // ========== RESUMEN 7 DÍAS ==========
  header('RESUMEN ÚLTIMOS 7 DÍAS')

  const weeklySubscribers = await prisma.emailSubscriber.count({
    where: { createdAt: { gte: last7d } }
  })

  const weeklyEmails = await prisma.scheduledEmail.count({
    where: {
      status: 'sent',
      sentAt: { gte: last7d }
    }
  })

  console.log(`   📈 Nuevos subscribers: ${weeklySubscribers}`)
  console.log(`   📧 Emails enviados: ${weeklyEmails}`)
  console.log(`   📊 Promedio diario: ${(weeklySubscribers / 7).toFixed(1)} leads/día`)

  // ========== FIN ==========
  console.log(`\n${colors.bright}${colors.magenta}════════════════════════════════════════════════════════════${colors.reset}\n`)

  await prisma.$disconnect()
}

// Run
checkFunnels().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
