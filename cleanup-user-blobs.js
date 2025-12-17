const { del } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_EMAIL = 'alejandrosatlla@gmail.com';

async function main() {
  console.log(`\n🔍 Buscando archivos de: ${TARGET_EMAIL}\n`);

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL }
  });

  if (!user) {
    console.log('❌ Usuario no encontrado');
    return;
  }

  console.log(`✅ Usuario encontrado: ${user.id} (${user.name || user.email})`);

  // Find all media files for this user
  const mediaFiles = await prisma.mediaLibrary.findMany({
    where: { userId: user.id }
  });

  console.log(`📁 Archivos encontrados: ${mediaFiles.length}`);

  if (mediaFiles.length === 0) {
    console.log('No hay archivos para eliminar.');
    return;
  }

  // Calculate total size
  const totalSize = mediaFiles.reduce((sum, f) => sum + (f.size || 0), 0);
  console.log(`💾 Espacio total a liberar: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

  // Show files to be deleted
  console.log('Archivos a eliminar:');
  mediaFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file.originalName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  });

  console.log('\n🗑️ Eliminando archivos...\n');

  let deletedCount = 0;
  let deletedSize = 0;
  let errorCount = 0;

  for (const file of mediaFiles) {
    try {
      // Only delete from Vercel Blob if URL is from blob storage
      if (file.url && file.url.includes('blob.vercel-storage.com')) {
        await del(file.url);
        console.log(`  ✅ Blob eliminado: ${file.originalName}`);
      }

      // Delete from database
      await prisma.mediaLibrary.delete({
        where: { id: file.id }
      });

      deletedCount++;
      deletedSize += file.size || 0;
      console.log(`  ✅ DB eliminado: ${file.originalName}`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error eliminando ${file.originalName}:`, error.message);
    }
  }

  console.log('\n=== RESUMEN ===');
  console.log(`Archivos eliminados: ${deletedCount}`);
  console.log(`Errores: ${errorCount}`);
  console.log(`Espacio liberado: ${(deletedSize / 1024 / 1024).toFixed(2)} MB`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
