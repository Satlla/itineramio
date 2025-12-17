const { list, del } = require('@vercel/blob');

async function main() {
  console.log('🔍 Buscando duplicados en Vercel Blob Storage...\n');

  let cursor;
  const allBlobs = [];

  do {
    const result = await list({ cursor, limit: 1000 });
    allBlobs.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor);

  console.log(`Total de archivos: ${allBlobs.length}`);

  // Group by original filename (extract from pathname)
  const byOriginalName = {};
  allBlobs.forEach(blob => {
    // Extract original name: upload-1764010304226-z3fs9dz7a-IMG_1505.mov -> IMG_1505.mov
    const match = blob.pathname.match(/upload-\d+-[a-z0-9]+-(.+)/i);
    const originalName = match ? match[1] : blob.pathname;

    if (!byOriginalName[originalName]) {
      byOriginalName[originalName] = [];
    }
    byOriginalName[originalName].push(blob);
  });

  // Find duplicates
  const duplicates = [];
  let savedSpace = 0;

  console.log('\n🔄 Duplicados encontrados:\n');

  for (const [name, blobs] of Object.entries(byOriginalName)) {
    if (blobs.length > 1) {
      // Sort by date, keep the most recent
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

      console.log(`📁 ${name} (${blobs.length} copias)`);
      console.log(`  ✅ Manteniendo: ${blobs[0].pathname} (${new Date(blobs[0].uploadedAt).toLocaleDateString()})`);

      // Mark others for deletion
      for (let i = 1; i < blobs.length; i++) {
        console.log(`  🗑️ Eliminar: ${blobs[i].pathname} (${(blobs[i].size / 1024 / 1024).toFixed(2)} MB)`);
        duplicates.push(blobs[i]);
        savedSpace += blobs[i].size;
      }
      console.log('');
    }
  }

  console.log('=== RESUMEN DUPLICADOS ===');
  console.log(`Duplicados a eliminar: ${duplicates.length}`);
  console.log(`Espacio a liberar: ${(savedSpace / 1024 / 1024).toFixed(2)} MB\n`);

  if (duplicates.length === 0) {
    console.log('No hay duplicados para eliminar.');
    return;
  }

  console.log('🗑️ Eliminando duplicados...\n');

  let deletedCount = 0;
  let deletedSize = 0;

  for (const blob of duplicates) {
    try {
      await del(blob.url);
      deletedCount++;
      deletedSize += blob.size;
      console.log(`  ✅ Eliminado: ${blob.pathname}`);
    } catch (error) {
      console.error(`  ❌ Error: ${blob.pathname}:`, error.message);
    }
  }

  console.log('\n=== RESULTADO ===');
  console.log(`Archivos eliminados: ${deletedCount}`);
  console.log(`Espacio liberado: ${(deletedSize / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
