/**
 * Script para probar el EMBUDO COMPLETO de conversión
 *
 * Flujo:
 * 1. Usuario completa test de personalidad
 * 2. Introduce email
 * 3. Recibe resultado (ej: ESTRATEGA)
 * 4. Se le envía lead magnet por email
 * 5. Empieza secuencia de nurturing
 * 6. Convertir a trial
 */

import { prisma } from '../src/lib/prisma'

const TEST_EMAIL = 'test-funnel@itineramio.com' // Cambia por tu email real para recibir los correos

interface TestAnswer {
  questionId: string
  answer: number
}

async function simulateUserJourney() {
  console.log('🧪 SIMULACIÓN COMPLETA DEL EMBUDO DE CONVERSIÓN\n')
  console.log('='.repeat(80))

  // PASO 1: Simular respuestas del test de personalidad
  console.log('\n📝 PASO 1: Usuario completa test de personalidad')
  console.log('URL: https://www.itineramio.com/host-profile/test\n')

  // Respuestas que dan perfil ESTRATEGA (alta en análisis y planificación)
  const testAnswers: TestAnswer[] = [
    { questionId: 'planning', answer: 5 },
    { questionId: 'analytics', answer: 5 },
    { questionId: 'automation', answer: 4 },
    { questionId: 'guest-experience', answer: 3 },
    { questionId: 'problem-solving', answer: 4 },
    { questionId: 'pricing', answer: 5 },
    { questionId: 'time-management', answer: 4 },
    { questionId: 'communication', answer: 3 },
  ]

  console.log('Respuestas del test:')
  testAnswers.forEach(a => {
    console.log(`  - ${a.questionId}: ${a.answer}/5`)
  })

  // PASO 2: Crear registro en base de datos
  console.log('\n📊 PASO 2: Guardar resultado en base de datos')

  const result = await prisma.hostProfileResult.create({
    data: {
      email: TEST_EMAIL,
      name: 'Test Usuario',
      archetype: 'ESTRATEGA',
      scores: {
        planning: 5,
        analytics: 5,
        automation: 4,
        guestExperience: 3,
        problemSolving: 4,
        pricing: 5,
        timeManagement: 4,
        communication: 3,
      },
      interests: ['pricing', 'analytics', 'automation'],
    }
  })

  console.log(`✅ Resultado guardado con ID: ${result.id}`)
  console.log(`   Perfil asignado: ${result.archetype}`)
  console.log(`   Email: ${result.email}`)

  // PASO 3: Verificar que existe el lead magnet
  console.log('\n📄 PASO 3: Verificar lead magnet disponible')

  const leadMagnetUrl = `https://www.itineramio.com/recursos/estratega-5-kpis`
  const pdfUrl = `https://www.itineramio.com/downloads/estratega-5-kpis.pdf`

  console.log(`   Landing page: ${leadMagnetUrl}`)
  console.log(`   PDF directo: ${pdfUrl}`)

  // PASO 4: Verificar emails programados
  console.log('\n📧 PASO 4: Verificar secuencia de emails')

  // Verificar si existen suscriptores con este email
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: TEST_EMAIL }
  })

  if (subscriber) {
    console.log('✅ Suscriptor encontrado en base de datos')
    console.log(`   Email: ${subscriber.email}`)
    console.log(`   Fecha suscripción: ${subscriber.createdAt}`)
  } else {
    console.log('⚠️  No encontrado en newsletterSubscriber')
    console.log('   Será creado cuando descargue el lead magnet')
  }

  // PASO 5: Secuencia de emails que debería recibir
  console.log('\n📅 PASO 5: Secuencia de emails programada')
  console.log('\n┌─────┬────────────────────────────────────────┬──────────────┐')
  console.log('│ Día │ Email                                  │ Estado       │')
  console.log('├─────┼────────────────────────────────────────┼──────────────┤')
  console.log('│  0  │ Bienvenida + PDF descarga              │ ⏳ Pendiente │')
  console.log('│  1  │ Stats: ¿Sabes cuánto pierdes?          │ ⏳ Pendiente │')
  console.log('│  3  │ 5 errores que cometen anfitriones      │ ⏳ Pendiente │')
  console.log('│  7  │ Caso de éxito real                     │ ⏳ Pendiente │')
  console.log('│ 10  │ Trial: Prueba Itineramio gratis        │ ⏳ Pendiente │')
  console.log('│ 13  │ Trial ending soon                      │ ⏳ Pendiente │')
  console.log('│ 14  │ Última oportunidad                     │ ⏳ Pendiente │')
  console.log('└─────┴────────────────────────────────────────┴──────────────┘')

  // PASO 6: URL para completar el flujo manualmente
  console.log('\n🎯 PASO 6: ACCIÓN REQUERIDA - Completa manualmente')
  console.log('\n1. Abre en tu navegador:')
  console.log(`   ${leadMagnetUrl}`)
  console.log('\n2. Introduce tu email real (para recibir los correos):')
  console.log(`   ${TEST_EMAIL}`)
  console.log('\n3. Descarga el PDF')
  console.log('\n4. Revisa tu bandeja de entrada')
  console.log('   - Debería llegar email de bienvenida en ~2 minutos')
  console.log('   - Verifica que no esté en spam')

  // PASO 7: Instrucciones para verificar
  console.log('\n✅ PASO 7: Verificación del embudo')
  console.log('\nPara verificar que todo funciona:')
  console.log('\n1. Email inmediato (Día 0):')
  console.log('   □ Llega email de bienvenida')
  console.log('   □ Subject: "Tu guía: El Manual del Estratega"')
  console.log('   □ Tiene enlace de descarga del PDF')
  console.log('   □ Tiene CTA a "Prueba Itineramio gratis"')

  console.log('\n2. Emails siguientes (Día 1-14):')
  console.log('   □ Día 1: Stats de alojamientos')
  console.log('   □ Día 3: 5 errores comunes')
  console.log('   □ Día 7: Caso de éxito')
  console.log('   □ Día 10: Recordatorio de trial')
  console.log('   □ Día 13: Urgencia (trial ending)')
  console.log('   □ Día 14: Última oportunidad')

  console.log('\n3. Conversión:')
  console.log('   □ Hace click en CTA del email')
  console.log('   □ Llega a /signup')
  console.log('   □ Se registra para trial de 15 días')
  console.log('   □ Accede al dashboard')

  // PASO 8: Dashboard de monitoreo
  console.log('\n📊 PASO 8: Monitoreo de métricas')
  console.log('\nPuedes verificar en la base de datos:')
  console.log(`
-- Ver resultados del test
SELECT id, email, archetype, "createdAt"
FROM "HostProfileResult"
WHERE email = '${TEST_EMAIL}'
ORDER BY "createdAt" DESC;

-- Ver suscriptores de newsletter
SELECT email, source, "createdAt"
FROM "NewsletterSubscriber"
WHERE email = '${TEST_EMAIL}';

-- Ver usuarios registrados
SELECT email, "createdAt", plan
FROM "User"
WHERE email = '${TEST_EMAIL}';
  `)

  // PASO 9: Resultados esperados
  console.log('\n🎯 RESULTADOS ESPERADOS')
  console.log('\n✅ Inmediato (0-5 min):')
  console.log('   - Usuario completa test')
  console.log('   - Recibe email con PDF')
  console.log('   - Descarga guía ESTRATEGA')

  console.log('\n✅ Corto plazo (1-7 días):')
  console.log('   - Recibe emails educativos')
  console.log('   - Aprende sobre métricas clave')
  console.log('   - Ve casos de éxito')

  console.log('\n✅ Medio plazo (7-14 días):')
  console.log('   - Recordatorios de trial')
  console.log('   - Urgencia creciente')
  console.log('   - Click en CTA → Registro')

  console.log('\n' + '='.repeat(80))
  console.log('\n🚀 SCRIPT COMPLETADO')
  console.log('\n📝 Resumen:')
  console.log(`   - Resultado del test creado con ID: ${result.id}`)
  console.log(`   - Perfil: ${result.archetype}`)
  console.log(`   - Email de prueba: ${TEST_EMAIL}`)
  console.log(`   - URL del resultado: https://www.itineramio.com/host-profile/results/${result.id}`)

  console.log('\n⚠️  IMPORTANTE:')
  console.log('   1. Abre la URL del resultado en tu navegador')
  console.log('   2. Usa tu email REAL para recibir los correos')
  console.log('   3. Verifica que llegan los emails en los próximos días')
  console.log('')

  return result
}

simulateUserJourney()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
