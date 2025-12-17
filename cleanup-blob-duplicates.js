const { list, del } = require('@vercel/blob');

async function main() {
  console.log('Buscando duplicados en Vercel Blob...\n');

  let cursor;
  const allBlobs = [];

  do {
    const result = await list({ cursor, limit: 1000 });
    allBlobs.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor);

  // Agrupar por nombre de archivo original (sin el prefijo upload-timestamp-)
  const byOriginalName = {};
  allBlobs.forEach(blob => {
    // Extraer nombre original: upload-1764010304226-z3fs9dz7a-IMG_1505.mov -> IMG_1505.mov
    const match = blob.pathname.match(/upload-\d+-[a-z0-9]+-(.+)/);
    const originalName = match ? match[1] : blob.pathname;

    if (!byOriginalName[originalName]) {
      byOriginalName[originalName] = [];
    }
    byOriginalName[originalName].push(blob);
  });

  // Encontrar duplicados
  const duplicates = [];
  let savedSpace = 0;

  for (const [name, blobs] of Object.entries(byOriginalName)) {
    if (blobs.length > 1) {
      // Ordenar por fecha, mantener el más reciente
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

      console.log('Duplicado encontrado: ' + name + ' (' + blobs.length + ' copias)');
      console.log('  Manteniendo: ' + blobs[0].pathname);

      // Marcar los demás para eliminar
      for (let i = 1; i < blobs.length; i++) {
        console.log('  Eliminando: ' + blobs[i].pathname + ' (' + (blobs[i].size / 1024 / 1024).toFixed(2) + ' MB)');
        duplicates.push(blobs[i]);
        savedSpace += blobs[i].size;
      }
      console.log('');
    }
  }

  console.log('\n=== RESUMEN ===');
  console.log('Duplicados a eliminar:', duplicates.length);
  console.log('Espacio a liberar:', (savedSpace / 1024 / 1024).toFixed(2), 'MB');

  if (duplicates.length > 0) {
    console.log('\nEliminando duplicados...');

    for (const blob of duplicates) {
      try {
        await del(blob.url);
        console.log('  Eliminado: ' + blob.pathname);
      } catch (error) {
        console.error('  Error eliminando ' + blob.pathname + ':', error.message);
      }
    }

    console.log('\nLimpieza completada!');
  } else {
    console.log('\nNo hay duplicados para eliminar.');
  }
}

main().catch(console.error);
