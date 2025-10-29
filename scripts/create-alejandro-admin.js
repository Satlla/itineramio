const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAlejandroAdmin() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'alejandrosatlla@gmail.com' }
    });

    if (existingUser) {
      // Update existing user to be admin
      const updatedUser = await prisma.user.update({
        where: { email: 'alejandrosatlla@gmail.com' },
        data: {
          isAdmin: true,
          isActive: true,
          status: 'ACTIVE',
          name: existingUser.name || 'Alejandro Satlla'
        }
      });
      console.log('✅ Usuario actualizado como admin:', updatedUser.email);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: 'alejandrosatlla@gmail.com',
          name: 'Alejandro Satlla',
          password: hashedPassword,
          isAdmin: true,
          isActive: true,
          status: 'ACTIVE',
          emailVerified: new Date(),
          role: 'HOST'
        }
      });
      
      console.log('✅ Usuario admin creado:', newUser.email);
      console.log('🔑 Contraseña temporal: admin123');
    }

    // Assign Premium plan
    const premiumPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'Premium' }
    });

    if (premiumPlan) {
      // Check for existing subscription
      const user = await prisma.user.findUnique({
        where: { email: 'alejandrosatlla@gmail.com' },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' }
          }
        }
      });

      if (user && user.subscriptions.length === 0) {
        await prisma.userSubscription.create({
          data: {
            userId: user.id,
            planId: premiumPlan.id,
            status: 'ACTIVE',
            startDate: new Date(),
            createdBy: 'system'
          }
        });
        console.log('✅ Plan Premium asignado');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAlejandroAdmin();