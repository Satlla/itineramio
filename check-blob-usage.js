const { list } = require('@vercel/blob');

async function main() {
  console.log('📊 Analizando uso de Vercel Blob Storage...\n');

  let cursor;
  const allBlobs = [];

  do {
    const result = await list({ cursor, limit: 1000 });
    allBlobs.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor);

  console.log(`Total de archivos: ${allBlobs.length}`);

  // Calculate total size
  const totalSize = allBlobs.reduce((sum, b) => sum + b.size, 0);
  console.log(`Espacio total usado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Límite Hobby plan: 1024 MB`);
  console.log(`Espacio disponible: ${(1024 - totalSize / 1024 / 1024).toFixed(2)} MB\n`);

  // Group by file type
  const byType = {};
  allBlobs.forEach(blob => {
    const ext = blob.pathname.split('.').pop()?.toLowerCase() || 'unknown';
    if (!byType[ext]) {
      byType[ext] = { count: 0, size: 0 };
    }
    byType[ext].count++;
    byType[ext].size += blob.size;
  });

  console.log('📁 Por tipo de archivo:');
  Object.entries(byType)
    .sort((a, b) => b[1].size - a[1].size)
    .forEach(([ext, data]) => {
      console.log(`  .${ext}: ${data.count} archivos, ${(data.size / 1024 / 1024).toFixed(2)} MB`);
    });

  // Show largest files
  console.log('\n📦 Top 20 archivos más grandes:');
  allBlobs
    .sort((a, b) => b.size - a.size)
    .slice(0, 20)
    .forEach((blob, i) => {
      console.log(`  ${i + 1}. ${blob.pathname} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
    });
}

main().catch(console.error);
