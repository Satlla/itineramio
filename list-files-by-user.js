const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Listando archivos por usuario...\n');

  // Get all users with media files
  const users = await prisma.user.findMany({
    include: {
      mediaItems: true
    }
  });

  for (const user of users) {
    if (!user.mediaItems || user.mediaItems.length === 0) continue;

    const totalSize = user.mediaItems.reduce((sum, f) => sum + (f.size || 0), 0);

    console.log('═'.repeat(60));
    console.log(`👤 ${user.name || 'Sin nombre'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Archivos: ${user.mediaItems.length}`);
    console.log(`   Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n   Archivos:');
    user.mediaItems.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file.originalName} (${((file.size || 0) / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`      URL: ${file.url}`);
    });
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error:', e);
  await prisma.$disconnect();
});
