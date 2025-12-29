const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        CORRIGIENDO TARGETSOURCE PARA COINCIDIR CON LEADS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Mapping of sequence names to correct source values (what forms actually send)
  const corrections = [
    { name: 'Tool: Generador de QR', targetSource: 'qr-generator' },
    { name: 'Tool: Tarjeta WiFi', targetSource: 'wifi-card' },
    { name: 'Tool: Checklist de Limpieza', targetSource: 'cleaning-checklist' },
    { name: 'Tool: Calculadora de Precios', targetSource: 'pricing-calculator' },
    { name: 'Tool: Calculadora de ROI', targetSource: 'roi-calculator' },
    { name: 'tool-house-rules', targetSource: 'house-rules-generator' },
    // plantilla-reviews is already correct
  ];

  for (const correction of corrections) {
    const updated = await prisma.emailSequence.updateMany({
      where: { name: correction.name },
      data: { targetSource: correction.targetSource }
    });
    if (updated.count > 0) {
      console.log('✅ ' + correction.name + ' -> ' + correction.targetSource);
    }
  }

  // Verify final state
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                       ESTADO FINAL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const sequences = await prisma.emailSequence.findMany({
    where: { name: { startsWith: 'Tool' } },
    select: { name: true, targetSource: true },
    orderBy: { name: 'asc' }
  });

  // Also get house-rules
  const houseRules = await prisma.emailSequence.findFirst({
    where: { name: 'tool-house-rules' },
    select: { name: true, targetSource: true }
  });

  if (houseRules) sequences.push(houseRules);

  sequences.forEach(s => {
    console.log('✅ ' + s.name + ' -> ' + s.targetSource);
  });

  await prisma.$disconnect();
  console.log('\n✅ Correcciones completadas');
}

main().catch(console.error);
