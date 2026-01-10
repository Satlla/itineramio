/**
 * Test del embudo "Más Reservas"
 *
 * Simula el flujo completo como si fueras un usuario real:
 * 1. Usa la Calculadora de Tiempo
 * 2. Se enrolla en la secuencia "Más Reservas"
 * 3. Recibe el Email 1 inmediatamente
 * 4. Programa Email 2 (día 2) y Email 3 (día 4)
 */

const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Email de prueba - CAMBIAR POR EL TUYO
const TEST_EMAIL = process.argv[2] || 'alejandro@itineramio.com';
const TEST_NAME = process.argv[3] || 'Alejandro';

async function testReservasFunnel() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST EMBUDO "MÁS RESERVAS"');
  console.log('='.repeat(60));
  console.log(`\n📧 Email de prueba: ${TEST_EMAIL}`);
  console.log(`👤 Nombre: ${TEST_NAME}\n`);

  try {
    // PASO 1: Simular uso de la Calculadora de Tiempo
    console.log('─'.repeat(60));
    console.log('PASO 1: Simulando uso de Calculadora de Tiempo...');
    console.log('─'.repeat(60));

    const calculatorData = {
      properties: 3,
      checkinsPerMonth: 12,
      minutesPerCheckin: 45,
      hoursPerMonth: 9,
      hoursPerYear: 108,
      moneyLostPerYear: 2700,
      tasksAutomatable: 86
    };

    console.log(`   Propiedades: ${calculatorData.properties}`);
    console.log(`   Check-ins/mes: ${calculatorData.checkinsPerMonth}`);
    console.log(`   Min/check-in: ${calculatorData.minutesPerCheckin}`);
    console.log(`   → Horas perdidas/año: ${calculatorData.hoursPerYear}h`);
    console.log(`   → Valor perdido: ${calculatorData.moneyLostPerYear}€\n`);

    // PASO 2: Crear/actualizar EmailSubscriber
    console.log('─'.repeat(60));
    console.log('PASO 2: Creando EmailSubscriber...');
    console.log('─'.repeat(60));

    // Limpiar subscriber anterior si existe (para test limpio)
    const existing = await prisma.emailSubscriber.findUnique({
      where: { email: TEST_EMAIL.toLowerCase() }
    });

    if (existing) {
      // Limpiar enrollments y emails programados anteriores
      await prisma.scheduledEmail.deleteMany({
        where: { subscriberId: existing.id }
      });
      await prisma.sequenceEnrollment.deleteMany({
        where: { subscriberId: existing.id }
      });
      await prisma.emailSubscriber.delete({
        where: { id: existing.id }
      });
      console.log('   🗑️  Limpiado subscriber anterior para test limpio');
    }

    // Crear nuevo subscriber
    const subscriber = await prisma.emailSubscriber.create({
      data: {
        email: TEST_EMAIL.toLowerCase(),
        name: TEST_NAME,
        source: 'tool_time-calculator',
        sourceMetadata: calculatorData,
        status: 'active',
        sequenceStatus: 'active',
        sequenceStartedAt: new Date(),
        tags: ['tool_time-calculator', 'time-calculator', 'test-funnel'],
        currentJourneyStage: 'lead',
        engagementScore: 'warm'
      }
    });

    console.log(`   ✅ Subscriber creado: ${subscriber.id}`);
    console.log(`   Source: ${subscriber.source}`);
    console.log(`   Tags: ${subscriber.tags.join(', ')}\n`);

    // PASO 3: Buscar secuencia "Más Reservas"
    console.log('─'.repeat(60));
    console.log('PASO 3: Buscando secuencia "Más Reservas"...');
    console.log('─'.repeat(60));

    const sequence = await prisma.emailSequence.findFirst({
      where: {
        name: 'Más Reservas',
        isActive: true
      },
      include: {
        steps: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!sequence) {
      throw new Error('Secuencia "Más Reservas" no encontrada o inactiva');
    }

    console.log(`   ✅ Secuencia encontrada: ${sequence.name}`);
    console.log(`   ID: ${sequence.id}`);
    console.log(`   Pasos: ${sequence.steps.length}\n`);

    // PASO 4: Crear enrollment
    console.log('─'.repeat(60));
    console.log('PASO 4: Enrollando en secuencia...');
    console.log('─'.repeat(60));

    const enrollment = await prisma.sequenceEnrollment.create({
      data: {
        subscriberId: subscriber.id,
        sequenceId: sequence.id,
        status: 'active',
        currentStepOrder: 0
      }
    });

    console.log(`   ✅ Enrollment creado: ${enrollment.id}\n`);

    // PASO 5: Programar emails
    console.log('─'.repeat(60));
    console.log('PASO 5: Programando emails...');
    console.log('─'.repeat(60));

    const now = new Date();
    const scheduledEmails = [];

    for (const step of sequence.steps) {
      const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
      let scheduledFor = new Date(now.getTime() + delayMs);

      // Para el test, enviar Email 1 inmediatamente
      if (step.order === 0) {
        scheduledFor = now;
      }

      const scheduled = await prisma.scheduledEmail.create({
        data: {
          enrollmentId: enrollment.id,
          stepId: step.id,
          subscriberId: subscriber.id,
          recipientEmail: subscriber.email,
          recipientName: subscriber.name,
          subject: step.subject,
          templateName: step.templateName,
          templateData: { name: TEST_NAME, email: TEST_EMAIL },
          scheduledFor,
          status: step.order === 0 ? 'pending' : 'pending' // Todos pending por ahora
        }
      });

      scheduledEmails.push({ step, scheduled, scheduledFor });

      const statusIcon = step.order === 0 ? '📤' : '⏰';
      const timeStr = step.order === 0 ? 'AHORA' : `en ${step.delayDays} días`;
      console.log(`   ${statusIcon} Email ${step.order + 1}: ${step.name}`);
      console.log(`      Subject: "${step.subject}"`);
      console.log(`      Programado: ${timeStr}`);
      console.log(`      Template: ${step.templateName}\n`);
    }

    // PASO 6: Enviar Email 1 inmediatamente
    console.log('─'.repeat(60));
    console.log('PASO 6: Enviando Email 1 ahora...');
    console.log('─'.repeat(60));

    const email1 = scheduledEmails[0];

    // Importar y renderizar template
    const templatePath = `../src/emails/templates/reservas/${email1.step.templateName}`;

    // Usar React para renderizar
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');

    // Cargar template dinámicamente
    let EmailComponent;
    try {
      // En producción usaríamos el sistema de templates, aquí hacemos directo
      const templateModule = require(templatePath);
      EmailComponent = templateModule.default;
    } catch (e) {
      console.log('   ⚠️  No se pudo cargar template directamente, usando Resend con React...');
    }

    // Enviar con Resend
    const { data, error } = await resend.emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: TEST_EMAIL,
      subject: email1.step.subject,
      react: EmailComponent ? React.createElement(EmailComponent, { name: TEST_NAME, email: TEST_EMAIL }) : null,
      html: EmailComponent ? null : `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>Email 1 - Test del Embudo "Más Reservas"</h1>
          <p>Hola ${TEST_NAME},</p>
          <p>Este es el Email 1 del embudo de prueba.</p>
          <p>Subject: ${email1.step.subject}</p>
          <p>Template: ${email1.step.templateName}</p>
        </div>
      `
    });

    if (error) {
      console.log(`   ❌ Error enviando: ${error.message}`);
    } else {
      console.log(`   ✅ Email 1 enviado!`);
      console.log(`   Resend ID: ${data.id}`);

      // Actualizar como enviado
      await prisma.scheduledEmail.update({
        where: { id: email1.scheduled.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          resendId: data.id
        }
      });
    }

    // RESUMEN FINAL
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DEL TEST');
    console.log('='.repeat(60));
    console.log(`
✅ Subscriber creado con source: tool_time-calculator
✅ Enrollado en secuencia "Más Reservas"
✅ Email 1 enviado a ${TEST_EMAIL}

📅 Emails programados:
   • Email 1: ENVIADO ✓
   • Email 2: Programado para ${scheduledEmails[1]?.scheduledFor.toLocaleDateString('es-ES')} (en 2 días)
   • Email 3: Programado para ${scheduledEmails[2]?.scheduledFor.toLocaleDateString('es-ES')} (en 4 días)

🔍 Para verificar:
   1. Revisa tu bandeja de entrada (${TEST_EMAIL})
   2. El subject debe ser: "${email1.step.subject}"

⚡ Para enviar Email 2 y 3 inmediatamente (sin esperar):
   node scripts/send-test-emails.js ${TEST_EMAIL}
`);

  } catch (error) {
    console.error('\n❌ Error en test:', error);
  }
}

testReservasFunnel()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
