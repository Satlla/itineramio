const { list } = require('@vercel/blob');

async function main() {
  console.log('Verificando Vercel Blob storage...\n');

  let totalSize = 0;
  let totalFiles = 0;
  let cursor;
  const allBlobs = [];

  do {
    const result = await list({ cursor, limit: 1000 });
    allBlobs.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor);

  totalFiles = allBlobs.length;
  totalSize = allBlobs.reduce((sum, blob) => sum + blob.size, 0);

  console.log('Resumen:');
  console.log('  Total archivos:', totalFiles);
  console.log('  Tamano total:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('  Limite: 1024 MB (1GB)');
  console.log('  Usado:', ((totalSize / 1024 / 1024 / 1024) * 100).toFixed(1) + '%');

  const sorted = allBlobs.sort((a, b) => b.size - a.size);
  console.log('\nTop 10 archivos mas grandes:');
  sorted.slice(0, 10).forEach((blob, i) => {
    console.log('  ' + (i+1) + '. ' + (blob.size / 1024 / 1024).toFixed(2) + ' MB - ' + blob.pathname);
  });
}

main().catch(console.error);
