const { list } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Analizando archivos huérfanos en Vercel Blob...\n');

  // Get all blobs
  let cursor;
  const allBlobs = [];
  do {
    const result = await list({ cursor, limit: 1000 });
    allBlobs.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor);

  console.log(`Total archivos en Blob: ${allBlobs.length}`);

  // Get all URLs referenced in MediaLibrary
  const mediaItems = await prisma.mediaLibrary.findMany({
    select: { url: true, userId: true }
  });
  const mediaUrls = new Set(mediaItems.map(m => m.url));
  console.log(`Archivos en MediaLibrary: ${mediaUrls.size}`);

  // Get all URLs referenced in Steps
  const steps = await prisma.step.findMany({
    select: {
      content: true,
      zones: {
        select: {
          property: {
            select: {
              hostId: true,
              host: { select: { email: true, name: true } }
            }
          }
        }
      }
    }
  });

  const stepUrls = new Map(); // url -> owner info
  steps.forEach(step => {
    const content = step.content;
    if (content && typeof content === 'object') {
      const mediaUrl = content.mediaUrl;
      if (mediaUrl && mediaUrl.includes('blob.vercel-storage.com')) {
        const owner = step.zones?.property?.host;
        stepUrls.set(mediaUrl, {
          email: owner?.email || 'unknown',
          name: owner?.name || 'unknown'
        });
      }
    }
  });
  console.log(`URLs en Steps: ${stepUrls.size}`);

  // Find orphaned blobs
  const orphaned = [];
  const usedByIsrael = [];
  const usedByOthers = [];

  for (const blob of allBlobs) {
    const isInMediaLibrary = mediaUrls.has(blob.url);
    const stepOwner = stepUrls.get(blob.url);

    if (!isInMediaLibrary && !stepOwner) {
      orphaned.push(blob);
    } else if (stepOwner) {
      if (stepOwner.email === 'israel66637@gmail.com') {
        usedByIsrael.push({ blob, owner: stepOwner });
      } else {
        usedByOthers.push({ blob, owner: stepOwner });
      }
    }
  }

  // Report
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📁 ARCHIVOS USADOS POR ISRAEL (NO TOCAR):');
  console.log('═══════════════════════════════════════════════════════════════');
  const israelSize = usedByIsrael.reduce((sum, x) => sum + x.blob.size, 0);
  console.log(`Total: ${usedByIsrael.length} archivos, ${(israelSize / 1024 / 1024).toFixed(2)} MB`);
  usedByIsrael.forEach((x, i) => {
    console.log(`  ${i + 1}. ${x.blob.pathname} (${(x.blob.size / 1024 / 1024).toFixed(2)} MB)`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📁 ARCHIVOS USADOS POR OTROS USUARIOS:');
  console.log('═══════════════════════════════════════════════════════════════');
  const othersSize = usedByOthers.reduce((sum, x) => sum + x.blob.size, 0);
  console.log(`Total: ${usedByOthers.length} archivos, ${(othersSize / 1024 / 1024).toFixed(2)} MB`);
  usedByOthers.forEach((x, i) => {
    console.log(`  ${i + 1}. ${x.blob.pathname} (${(x.blob.size / 1024 / 1024).toFixed(2)} MB) - ${x.owner.email}`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🗑️ ARCHIVOS HUÉRFANOS (candidatos a eliminar):');
  console.log('═══════════════════════════════════════════════════════════════');
  const orphanedSize = orphaned.reduce((sum, x) => sum + x.size, 0);
  console.log(`Total: ${orphaned.length} archivos, ${(orphanedSize / 1024 / 1024).toFixed(2)} MB`);
  orphaned.forEach((blob, i) => {
    console.log(`  ${i + 1}. ${blob.pathname} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Archivos de Israel (PROTEGIDOS): ${usedByIsrael.length} (${(israelSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Archivos de otros usuarios: ${usedByOthers.length} (${(othersSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Archivos huérfanos (eliminar): ${orphaned.length} (${(orphanedSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`\nEspacio que se liberaría: ${(orphanedSize / 1024 / 1024).toFixed(2)} MB`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error:', e);
  await prisma.$disconnect();
});
