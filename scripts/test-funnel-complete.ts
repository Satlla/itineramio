/**
 * Script de prueba completa del embudo de email marketing
 *
 * Este script simula el flujo completo de un usuario:
 * 1. Completa el test de personalidad
 * 2. Recibe email Day 0 con token de descarga
 * 3. Valida el token y simula descarga del PDF
 * 4. Verifica el tracking de engagement
 *
 * USO:
 * npx tsx scripts/test-funnel-complete.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  step: string
  success: boolean
  data?: any
  error?: string
}

const results: TestResult[] = []

function logStep(step: string, success: boolean, data?: any, error?: string) {
  results.push({ step, success, data, error })
  const emoji = success ? '✅' : '❌'
  console.log(`${emoji} ${step}`)
  if (data) console.log('   📊', JSON.stringify(data, null, 2))
  if (error) console.log('   ⚠️', error)
  console.log('')
}

async function testCompleteFunnel() {
  console.log('🚀 INICIANDO PRUEBA COMPLETA DEL EMBUDO\n')
  console.log('=' .repeat(60))
  console.log('')

  const testEmail = `test-funnel-${Date.now()}@test.com`
  const testName = 'Usuario Test'
  const testGender = 'masculino'

  let testId: string | null = null
  let subscriberId: string | null = null
  let downloadToken: string | null = null

  try {
    // =================================================================
    // PASO 1: SIMULAR COMPLETACIÓN DEL TEST
    // =================================================================
    console.log('📝 PASO 1: Simulando completación del test de personalidad\n')

    const testData = {
      name: testName,
      email: testEmail,
      gender: testGender,
      answers: {
        question1: 'a',
        question2: 'a',
        question3: 'a',
        question4: 'a',
        question5: 'a',
        question6: 'a',
        question7: 'a',
        question8: 'a',
        question9: 'a',
        question10: 'a',
        question11: 'a',
        question12: 'a',
        question13: 'a',
        question14: 'a',
        question15: 'a',
        question16: 'a'
      }
    }

    // Simular llamada al endpoint
    console.log('   → Enviando respuestas del test...')
    const submitResponse = await fetch('http://localhost:3000/api/host-profile/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    if (!submitResponse.ok) {
      const error = await submitResponse.text()
      throw new Error(`Error al enviar test: ${submitResponse.status} - ${error}`)
    }

    const submitResult = await submitResponse.json()
    testId = submitResult.testId
    const archetype = submitResult.archetype

    logStep(
      'Test completado y guardado en BD',
      true,
      {
        testId,
        archetype,
        email: testEmail,
        name: testName
      }
    )

    // =================================================================
    // PASO 2: VERIFICAR CREACIÓN DEL SUBSCRIBER
    // =================================================================
    console.log('👤 PASO 2: Verificando creación del EmailSubscriber\n')

    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { email: testEmail }
    })

    if (!subscriber) {
      throw new Error('Subscriber no fue creado en la base de datos')
    }

    subscriberId = subscriber.id

    logStep(
      'EmailSubscriber creado correctamente',
      true,
      {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
        archetype: subscriber.archetype,
        currentJourneyStage: subscriber.currentJourneyStage,
        engagementScore: subscriber.engagementScore,
        emailsSent: subscriber.emailsSent,
        lastEmailSentAt: subscriber.lastEmailSentAt
      }
    )

    // =================================================================
    // PASO 3: VERIFICAR ENVÍO DEL EMAIL DÍA 0
    // =================================================================
    console.log('📧 PASO 3: Verificando envío del Email Día 0\n')

    if (subscriber.emailsSent === 0) {
      throw new Error('Email Day 0 no fue enviado (emailsSent = 0)')
    }

    if (!subscriber.lastEmailSentAt) {
      throw new Error('lastEmailSentAt no está actualizado')
    }

    logStep(
      'Email Día 0 enviado exitosamente',
      true,
      {
        emailsSent: subscriber.emailsSent,
        lastEmailSentAt: subscriber.lastEmailSentAt,
        timeSinceEmail: `${Math.round((Date.now() - subscriber.lastEmailSentAt.getTime()) / 1000)} segundos`
      }
    )

    // =================================================================
    // PASO 4: GENERAR Y VALIDAR TOKEN DE DESCARGA
    // =================================================================
    console.log('🔐 PASO 4: Generando y validando token de descarga\n')

    // Importar las funciones de tokens
    const { generateDownloadToken, validateDownloadToken } = await import('../src/lib/tokens')

    // Mapear arquetipo a slug del lead magnet
    const archetypeToSlug: Record<string, string> = {
      'ESTRATEGA': 'estratega-5-kpis',
      'SISTEMÁTICO': 'sistematico-47-tareas',
      'DIFERENCIADOR': 'diferenciador-storytelling',
      'EJECUTOR': 'ejecutor-modo-ceo',
      'RESOLUTOR': 'resolutor-27-crisis',
      'EXPERIENCIAL': 'experiencial-corazon-escalable',
      'EQUILIBRADO': 'equilibrado-versatil-excepcional',
      'IMPROVISADOR': 'improvisador-kit-anti-caos'
    }

    const leadMagnetSlug = archetypeToSlug[archetype] || 'estratega-5-kpis'
    downloadToken = generateDownloadToken(subscriberId, leadMagnetSlug)

    logStep(
      'Token de descarga generado',
      true,
      {
        subscriberId,
        leadMagnetSlug,
        token: downloadToken,
        tokenLength: downloadToken.length
      }
    )

    // Validar el token
    const validation = validateDownloadToken(downloadToken)

    if (!validation.valid) {
      throw new Error(`Token inválido: ${validation.error}`)
    }

    logStep(
      'Token validado correctamente',
      true,
      {
        valid: validation.valid,
        subscriberId: validation.subscriberId,
        leadMagnetSlug: validation.leadMagnetSlug
      }
    )

    // =================================================================
    // PASO 5: SIMULAR DESCARGA DEL PDF
    // =================================================================
    console.log('📥 PASO 5: Simulando descarga del PDF\n')

    const downloadUrl = `http://localhost:3000/recursos/${leadMagnetSlug}/download?token=${downloadToken}`
    console.log(`   → URL de descarga: ${downloadUrl}`)

    const downloadResponse = await fetch(downloadUrl)

    if (!downloadResponse.ok) {
      throw new Error(`Error en descarga: ${downloadResponse.status}`)
    }

    logStep(
      'Página de descarga accedida correctamente',
      true,
      {
        status: downloadResponse.status,
        contentType: downloadResponse.headers.get('content-type')
      }
    )

    // =================================================================
    // PASO 6: VERIFICAR TRACKING DE ENGAGEMENT
    // =================================================================
    console.log('📊 PASO 6: Verificando actualización de tracking\n')

    // Esperar un momento para que se actualice la BD
    await new Promise(resolve => setTimeout(resolve, 1000))

    const updatedSubscriber = await prisma.emailSubscriber.findUnique({
      where: { id: subscriberId }
    })

    if (!updatedSubscriber) {
      throw new Error('Subscriber no encontrado después de descarga')
    }

    const trackingChecks = {
      downloadedGuide: updatedSubscriber.downloadedGuide === true,
      journeyStage: updatedSubscriber.currentJourneyStage === 'guide_downloaded',
      engagementScore: updatedSubscriber.engagementScore === 'hot',
      lastEngagement: updatedSubscriber.lastEngagement !== null
    }

    const allTrackingCorrect = Object.values(trackingChecks).every(check => check)

    logStep(
      'Tracking de engagement actualizado',
      allTrackingCorrect,
      {
        downloadedGuide: updatedSubscriber.downloadedGuide,
        currentJourneyStage: updatedSubscriber.currentJourneyStage,
        engagementScore: updatedSubscriber.engagementScore,
        lastEngagement: updatedSubscriber.lastEngagement,
        checks: trackingChecks
      }
    )

    // =================================================================
    // PASO 7: VERIFICAR ARCHIVOS PDF EXISTEN
    // =================================================================
    console.log('📄 PASO 7: Verificando existencia de PDFs\n')

    const fs = await import('fs')
    const path = await import('path')

    const pdfPath = path.join(process.cwd(), 'public', 'downloads', `${leadMagnetSlug}.pdf`)
    const pdfExists = fs.existsSync(pdfPath)

    if (pdfExists) {
      const stats = fs.statSync(pdfPath)
      logStep(
        'PDF existe y está accesible',
        true,
        {
          path: pdfPath,
          size: `${(stats.size / 1024).toFixed(2)} KB`,
          created: stats.birthtime
        }
      )
    } else {
      logStep(
        'PDF no encontrado',
        false,
        { path: pdfPath },
        'El archivo PDF no existe en el sistema'
      )
    }

    // =================================================================
    // RESUMEN FINAL
    // =================================================================
    console.log('=' .repeat(60))
    console.log('\n📋 RESUMEN DE LA PRUEBA\n')

    const totalSteps = results.length
    const successfulSteps = results.filter(r => r.success).length
    const failedSteps = results.filter(r => !r.success).length

    console.log(`Total de pasos: ${totalSteps}`)
    console.log(`✅ Exitosos: ${successfulSteps}`)
    console.log(`❌ Fallidos: ${failedSteps}`)
    console.log(`Tasa de éxito: ${((successfulSteps / totalSteps) * 100).toFixed(1)}%\n`)

    if (failedSteps === 0) {
      console.log('🎉 ¡EMBUDO FUNCIONANDO PERFECTAMENTE!')
      console.log('\n✨ El flujo completo funciona de extremo a extremo:')
      console.log('   1. Test completado → ✅')
      console.log('   2. Subscriber creado → ✅')
      console.log('   3. Email Día 0 enviado → ✅')
      console.log('   4. Token generado y validado → ✅')
      console.log('   5. Descarga funcionando → ✅')
      console.log('   6. Engagement trackeado → ✅')
      console.log('   7. PDF disponible → ✅')
    } else {
      console.log('⚠️ HAY PASOS QUE NECESITAN ATENCIÓN\n')
      results.filter(r => !r.success).forEach(r => {
        console.log(`❌ ${r.step}`)
        if (r.error) console.log(`   Error: ${r.error}`)
      })
    }

    // =================================================================
    // CLEANUP (OPCIONAL)
    // =================================================================
    console.log('\n🧹 LIMPIEZA DE DATOS DE PRUEBA\n')
    console.log('¿Deseas eliminar los datos de prueba creados? (presiona Ctrl+C para cancelar)')
    console.log(`   - EmailSubscriber: ${testEmail}`)
    console.log(`   - HostProfileTest: ${testId}`)
    console.log('\nEsperando 5 segundos antes de eliminar...')

    await new Promise(resolve => setTimeout(resolve, 5000))

    if (subscriberId) {
      await prisma.emailSubscriber.delete({ where: { id: subscriberId } })
      console.log('✅ EmailSubscriber eliminado')
    }

    if (testId) {
      await prisma.hostProfileTest.delete({ where: { id: testId } })
      console.log('✅ HostProfileTest eliminado')
    }

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:\n')
    console.error(error)

    if (error instanceof Error) {
      logStep(
        'Error fatal en la prueba',
        false,
        undefined,
        error.message
      )
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la prueba
testCompleteFunnel()
