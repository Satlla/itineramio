/**
 * SCRIPT DE BACKUP COMPLETO DE BASE DE DATOS
 *
 * Este script hace un backup completo de todas las tablas de la base de datos
 * usando Prisma. Genera un archivo JSON con todos los datos.
 *
 * Uso: npx tsx scripts/backup-database.ts
 */

import { prisma } from '../src/lib/prisma'
import fs from 'fs'
import path from 'path'

interface BackupData {
  metadata: {
    timestamp: string
    date: string
    version: string
    tablesIncluded: string[]
    totalRecords: number
  }
  data: {
    users: any[]
    properties: any[]
    zones: any[]
    steps: any[]
    subscriptions: any[]
    subscriptionRequests: any[]
    hostProfileTests: any[]
    emailSubscribers: any[]
    emailSequences: any[]
    emailSequenceSteps: any[]
    sequenceEnrollments: any[]
    scheduledEmails: any[]
  }
}

async function backupDatabase() {
  console.log('🔄 Iniciando backup de base de datos...\n')

  try {
    // Obtener todos los datos
    console.log('📊 Extrayendo datos de las tablas...')

    // Obtener datos sin relaciones complejas para evitar errores
    const users = await prisma.user.findMany()
    console.log(`✓ Users: ${users.length} registros`)

    const properties = await prisma.property.findMany()
    console.log(`✓ Properties: ${properties.length} registros`)

    const zones = await prisma.zone.findMany()
    console.log(`✓ Zones: ${zones.length} registros`)

    const steps = await prisma.step.findMany()
    console.log(`✓ Steps: ${steps.length} registros`)

    const subscriptions = await prisma.userSubscription.findMany()
    console.log(`✓ User Subscriptions: ${subscriptions.length} registros`)

    const subscriptionRequests = await prisma.subscriptionRequest.findMany()
    console.log(`✓ Subscription Requests: ${subscriptionRequests.length} registros`)

    const hostProfileTests = await prisma.hostProfileTest.findMany()
    console.log(`✓ Host Profile Tests: ${hostProfileTests.length} registros`)

    const emailSubscribers = await prisma.emailSubscriber.findMany()
    console.log(`✓ Email Subscribers: ${emailSubscribers.length} registros`)

    const emailSequences = await prisma.emailSequence.findMany()
    console.log(`✓ Email Sequences: ${emailSequences.length} registros`)

    const emailSequenceSteps = await prisma.emailSequenceStep.findMany()
    console.log(`✓ Email Sequence Steps: ${emailSequenceSteps.length} registros`)

    const sequenceEnrollments = await prisma.sequenceEnrollment.findMany()
    console.log(`✓ Sequence Enrollments: ${sequenceEnrollments.length} registros`)

    const scheduledEmails = await prisma.scheduledEmail.findMany()
    console.log(`✓ Scheduled Emails: ${scheduledEmails.length} registros`)

    // Calcular totales
    const totalRecords = users.length + properties.length + zones.length +
                        steps.length + subscriptions.length + subscriptionRequests.length +
                        hostProfileTests.length + emailSubscribers.length + emailSequences.length +
                        emailSequenceSteps.length + sequenceEnrollments.length + scheduledEmails.length

    // Crear objeto de backup
    const backup: BackupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
        version: '1.0',
        tablesIncluded: [
          'users',
          'properties',
          'zones',
          'steps',
          'userSubscriptions',
          'subscriptionRequests',
          'hostProfileTests',
          'emailSubscribers',
          'emailSequences',
          'emailSequenceSteps',
          'sequenceEnrollments',
          'scheduledEmails'
        ],
        totalRecords
      },
      data: {
        users,
        properties,
        zones,
        steps,
        subscriptions,
        subscriptionRequests,
        hostProfileTests,
        emailSubscribers,
        emailSequences,
        emailSequenceSteps,
        sequenceEnrollments,
        scheduledEmails
      }
    }

    // Generar nombre de archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup_${timestamp}.json`
    const filepath = path.join(process.cwd(), 'backups', 'database', filename)

    // Guardar backup
    console.log(`\n💾 Guardando backup...`)
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))

    // Calcular tamaño del archivo
    const stats = fs.statSync(filepath)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)

    // Crear también un backup comprimido (solo metadata + counts para verificación rápida)
    const summaryFilename = `backup_summary_${timestamp}.json`
    const summaryFilepath = path.join(process.cwd(), 'backups', 'database', summaryFilename)

    const summary = {
      ...backup.metadata,
      counts: {
        users: users.length,
        properties: properties.length,
        zones: zones.length,
        steps: steps.length,
        subscriptions: subscriptions.length,
        subscriptionRequests: subscriptionRequests.length,
        hostProfileTests: hostProfileTests.length,
        emailSubscribers: emailSubscribers.length,
        emailSequences: emailSequences.length,
        emailSequenceSteps: emailSequenceSteps.length,
        sequenceEnrollments: sequenceEnrollments.length,
        scheduledEmails: scheduledEmails.length
      },
      backupFile: filename
    }

    fs.writeFileSync(summaryFilepath, JSON.stringify(summary, null, 2))

    // Crear log del backup
    const logFilename = `backup_log_${timestamp}.txt`
    const logFilepath = path.join(process.cwd(), 'backups', 'logs', logFilename)

    const logContent = `
========================================
BACKUP DE BASE DE DATOS - ITINERAMIO
========================================

Fecha: ${backup.metadata.date}
Timestamp: ${backup.metadata.timestamp}

RESUMEN:
--------
Total de registros: ${totalRecords}

DESGLOSE POR TABLA:
-------------------
✓ Users: ${users.length}
✓ Properties: ${properties.length}
✓ Zones: ${zones.length}
✓ Steps: ${steps.length}
✓ User Subscriptions: ${subscriptions.length}
✓ Subscription Requests: ${subscriptionRequests.length}
✓ Host Profile Tests: ${hostProfileTests.length}
✓ Email Subscribers: ${emailSubscribers.length}
✓ Email Sequences: ${emailSequences.length}
✓ Email Sequence Steps: ${emailSequenceSteps.length}
✓ Sequence Enrollments: ${sequenceEnrollments.length}
✓ Scheduled Emails: ${scheduledEmails.length}

ARCHIVOS GENERADOS:
------------------
✓ Backup completo: ${filename} (${fileSizeMB} MB)
✓ Resumen: ${summaryFilename}
✓ Log: ${logFilename}

UBICACIÓN:
----------
${filepath}

========================================
BACKUP COMPLETADO EXITOSAMENTE ✅
========================================
`
    fs.writeFileSync(logFilepath, logContent)

    // Mostrar resumen
    console.log('\n' + '='.repeat(50))
    console.log('✅ BACKUP COMPLETADO EXITOSAMENTE')
    console.log('='.repeat(50))
    console.log(`\n📁 Archivos generados:`)
    console.log(`   • Backup completo: ${filename}`)
    console.log(`   • Tamaño: ${fileSizeMB} MB`)
    console.log(`   • Total de registros: ${totalRecords}`)
    console.log(`\n📍 Ubicación:`)
    console.log(`   ${filepath}`)
    console.log(`\n📋 Log guardado en:`)
    console.log(`   ${logFilepath}`)
    console.log('\n' + '='.repeat(50))
    console.log('\n💡 TIP: Guarda este backup en un lugar seguro (Google Drive, disco externo, etc.)')
    console.log('💡 TIP: Este backup se puede restaurar usando el script de restauración\n')

  } catch (error) {
    console.error('\n❌ ERROR durante el backup:', error)

    // Guardar log de error
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }

    const errorFilename = `backup_error_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const errorFilepath = path.join(process.cwd(), 'backups', 'logs', errorFilename)
    fs.writeFileSync(errorFilepath, JSON.stringify(errorLog, null, 2))

    console.error(`\n📝 Log de error guardado en: ${errorFilepath}`)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar backup
backupDatabase()
