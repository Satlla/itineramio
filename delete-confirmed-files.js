const { del } = require('@vercel/blob');

// Files confirmed for deletion
const filesToDelete = [
  // alejandrosatlla@gmail.com files (2)
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/upload-1765305119167-eoszr32ka-10D862AC-B992-461F-8EA0-51F2DB32CC3E.mov',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/upload-1765710242066-emv9ekzpx-IMG_2405.mov',
  // Orphaned files (11)
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/0a5d92dc-fa7b-4609-a101-6891c897e1ed-Captura%20de%20pantalla%202025-09-23%20a%20las%207.30.43.png',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/25674a5e-3b4c-4f73-8aa4-45a6bb9f32cf-Captura%20de%20pantalla%202025-07-25%20a%20las%2018.59.37.png',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/27294f97-dd34-45b0-96d7-adf1dea27ea0-IMG_1422.jpeg',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/7c881656-132b-4d58-b05d-ba56e890b008-IMG_1424.jpeg',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/81f349a3-b9db-498b-970c-89a4f6475e13-Captura%20de%20pantalla%202025-09-23%20a%20las%207.30.43.png',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/9f4e0aee-c1d9-4963-93a3-642065036f81-Captura%20de%20pantalla%202025-09-23%20a%20las%207.32.12.png',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/b4207020-1979-4427-a2c4-d0d3136c78a5-Captura%20de%20pantalla%202025-09-23%20a%20las%207.33.45.png',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/b7c247be-fc19-405e-9f63-ba24e64a59c2-Captura%20de%20pantalla%202025-07-25%20a%20las%2018.59.37.png',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/eeab7ea7-7033-492c-93a5-3547665df103-Captura%20de%20pantalla%202025-09-23%20a%20las%207.31.02.png',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/upload-1763628749362-q5uoo7wsm-IMG_8695.MOV',
  'https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/upload-1765713242632-yh2tjhf41-IMG_1841.mov',
];

async function main() {
  console.log('🗑️ Eliminando archivos confirmados...\n');

  let deleted = 0;
  let errors = 0;

  for (const url of filesToDelete) {
    const filename = url.split('/').pop();
    try {
      await del(url);
      deleted++;
      console.log(`✅ ${deleted}. Eliminado: ${decodeURIComponent(filename)}`);
    } catch (error) {
      errors++;
      console.error(`❌ Error eliminando ${filename}:`, error.message);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 RESULTADO:');
  console.log(`   Eliminados: ${deleted}`);
  console.log(`   Errores: ${errors}`);
  console.log('═══════════════════════════════════════');
}

main().catch(console.error);
