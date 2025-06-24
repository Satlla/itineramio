const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    // Cambia este email por el tuyo
    const email = 'demo@itineramio.com'; // ⬅️ CAMBIA ESTO
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log(`❌ Usuario con email ${email} no encontrado`);
      return;
    }
    
    // Hacer admin
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isAdmin: true,
        isActive: true
      }
    });
    
    console.log(`✅ Usuario ${email} es ahora admin`);
    
    // Crear log
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: user.id,
        action: 'admin_granted',
        targetType: 'user',
        targetId: user.id,
        description: `Admin privileges granted to ${email}`,
        metadata: {}
      }
    });
    
    console.log('✅ Log de actividad creado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();