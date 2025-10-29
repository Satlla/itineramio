const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('👥 Usuarios en la base de datos:');
    console.log('=====================================');
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Nombre: ${user.name}`);
        console.log(`   Admin: ${user.isAdmin ? '✅' : '❌'}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Creado: ${user.createdAt.toLocaleDateString()}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();