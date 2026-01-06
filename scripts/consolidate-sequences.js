/**
 * Script para consolidar las secuencias de email
 *
 * ANTES: 12 secuencias (7 tools + 5 generales)
 * DESPUÉS: 3 secuencias (Onboarding Universal, Post-Test, Academia)
 *
 * Ejecutar con: DATABASE_URL="..." node scripts/consolidate-sequences.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Secuencias a DESACTIVAR (pero no eliminar, por si acaso)
const sequencesToDeactivate = [
  'Tool: Checklist de Limpieza',
  'Tool: Calculadora de Precios',
  'Tool: Tarjeta WiFi',
  'Tool: Generador de QR',
  'Tool: Calculadora de ROI',
  'Tool: Plantilla Reviews',
  'tool-house-rules',
  'Onboarding por Nivel',
  'Post-Trial Nurturing'
];

// Secuencias a MANTENER activas
const sequencesToKeep = [
  'Post-Test Nurturing',      // TEST_COMPLETED
  'Academia: Quiz Completado', // QUIZ_COMPLETED
  'Onboarding Genérico'        // SUBSCRIBER_CREATED (será el universal)
];

async function consolidateSequences() {
  console.log('\n========================================');
  console.log('🔄 CONSOLIDACIÓN DE SECUENCIAS');
  console.log('========================================\n');

  // 1. Desactivar secuencias redundantes
  console.log('1️⃣ Desactivando secuencias redundantes...\n');

  for (const name of sequencesToDeactivate) {
    const seq = await prisma.emailSequence.findFirst({
      where: { name }
    });

    if (seq) {
      await prisma.emailSequence.update({
        where: { id: seq.id },
        data: { isActive: false }
      });
      console.log(`   ❌ Desactivada: ${name}`);
    } else {
      console.log(`   ⚠️  No encontrada: ${name}`);
    }
  }

  // 2. Configurar Onboarding Genérico como universal
  console.log('\n2️⃣ Configurando Onboarding Universal...\n');

  const onboardingGenerico = await prisma.emailSequence.findFirst({
    where: { name: 'Onboarding Genérico' }
  });

  if (onboardingGenerico) {
    await prisma.emailSequence.update({
      where: { id: onboardingGenerico.id },
      data: {
        name: 'Onboarding Universal',
        description: 'Secuencia principal para TODOS los nuevos subscribers. Contenido de valor genérico + CTA al test de personalidad.',
        targetSource: null,  // Sin filtro de source = catch-all
        targetTags: [],      // Sin filtro de tags
        targetArchetype: null,
        priority: 1,         // Prioridad baja (otras secuencias tienen preferencia)
        isActive: true
      }
    });
    console.log('   ✅ Onboarding Genérico → Onboarding Universal');
    console.log('   📌 targetSource: null (catch-all)');
    console.log('   📌 priority: 1 (baja)');
  }

  // 3. Verificar que Post-Test y Academia están activas
  console.log('\n3️⃣ Verificando secuencias principales...\n');

  for (const name of sequencesToKeep) {
    const seq = await prisma.emailSequence.findFirst({
      where: {
        OR: [
          { name },
          { name: 'Onboarding Universal' } // El renombrado
        ]
      }
    });

    if (seq) {
      if (seq.isActive) {
        console.log(`   ✅ Activa: ${seq.name} (trigger: ${seq.triggerEvent})`);
      } else {
        await prisma.emailSequence.update({
          where: { id: seq.id },
          data: { isActive: true }
        });
        console.log(`   🔄 Reactivada: ${seq.name}`);
      }
    }
  }

  // 4. Mostrar resumen final
  console.log('\n========================================');
  console.log('📊 ESTADO FINAL');
  console.log('========================================\n');

  const allSequences = await prisma.emailSequence.findMany({
    include: {
      steps: true,
      enrollments: { where: { status: 'active' } }
    },
    orderBy: { isActive: 'desc' }
  });

  const active = allSequences.filter(s => s.isActive);
  const inactive = allSequences.filter(s => s.isActive === false);

  console.log(`✅ ACTIVAS (${active.length}):`);
  for (const seq of active) {
    console.log(`   📧 ${seq.name}`);
    console.log(`      Trigger: ${seq.triggerEvent}`);
    console.log(`      Source: ${seq.targetSource || 'TODOS'}`);
    console.log(`      Inscritos activos: ${seq.enrollments.length}`);
    console.log(`      Pasos: ${seq.steps.length}`);
  }

  console.log(`\n❌ DESACTIVADAS (${inactive.length}):`);
  for (const seq of inactive) {
    console.log(`   ${seq.name} (${seq.subscribersEnrolled} inscritos históricos)`);
  }

  // 5. Calcular ahorro
  const templatesBefore = allSequences.reduce((acc, s) => acc + s.steps.length, 0);
  const templatesActive = active.reduce((acc, s) => acc + s.steps.length, 0);

  console.log('\n📈 MEJORAS:');
  console.log(`   Secuencias: ${allSequences.length} → ${active.length} activas`);
  console.log(`   Templates a mantener: ${templatesBefore} → ${templatesActive}`);
  console.log(`   Complejidad reducida: ${Math.round((1 - active.length/allSequences.length) * 100)}%`);

  console.log('\n========================================');
  console.log('✨ Consolidación completada');
  console.log('========================================\n');
}

consolidateSequences()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
