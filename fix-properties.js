const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const integration = await prisma.gmailIntegration.findFirst();
  const userId = integration.userId;

  console.log('=== PASO 1: Quitar alias incorrecto de White Coast Suite 104 ===\n');

  const whiteCoast104 = await prisma.property.findFirst({
    where: { hostId: userId, name: { contains: 'White Coast Suite 104' } },
    include: { billingConfig: true }
  });

  if (whiteCoast104?.billingConfig) {
    await prisma.propertyBillingConfig.update({
      where: { id: whiteCoast104.billingConfig.id },
      data: { airbnbNames: [] }
    });
    console.log('✓ Quitado alias de White Coast Suite 104');
  }

  console.log('\n=== PASO 2: Crear propiedad TRAIN STATION LOFT WITH TERRACE ===\n');

  // Verificar si ya existe
  let trainStation = await prisma.property.findFirst({
    where: {
      hostId: userId,
      name: 'TRAIN STATION LOFT WITH TERRACE'
    },
    include: { billingConfig: true }
  });

  if (!trainStation) {
    trainStation = await prisma.property.create({
      data: {
        name: 'TRAIN STATION LOFT WITH TERRACE',
        slug: 'train-station-loft-with-terrace-' + Date.now(),
        description: 'Propiedad importada desde Airbnb',
        type: 'APARTMENT',
        city: 'Alicante',
        state: '',
        country: 'España',
        street: '',
        postalCode: '',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 4,
        status: 'DRAFT',
        isPublished: false,
        hostId: userId,
        hostContactName: '',
        hostContactPhone: '',
        hostContactEmail: '',
        hostContactLanguage: 'es'
      }
    });
    console.log('✓ Creada propiedad TRAIN STATION LOFT WITH TERRACE');
  } else {
    console.log('✓ Ya existe TRAIN STATION LOFT WITH TERRACE');
  }

  // Crear o actualizar billingConfig
  let trainStationConfig = await prisma.propertyBillingConfig.findUnique({
    where: { propertyId: trainStation.id }
  });

  if (!trainStationConfig) {
    trainStationConfig = await prisma.propertyBillingConfig.create({
      data: {
        propertyId: trainStation.id,
        airbnbNames: ['TRAIN STATION LOFT WITH TERRACE'],
        incomeReceiver: 'OWNER',
        commissionType: 'PERCENTAGE',
        commissionValue: 15,
        cleaningFeeRecipient: 'MANAGER'
      }
    });
    console.log('✓ Creado billingConfig para TRAIN STATION');
  } else {
    await prisma.propertyBillingConfig.update({
      where: { id: trainStationConfig.id },
      data: { airbnbNames: ['TRAIN STATION LOFT WITH TERRACE'] }
    });
    console.log('✓ Actualizado billingConfig para TRAIN STATION');
  }

  console.log('\n=== PASO 3: Mover reservas a la propiedad correcta ===\n');

  // Mover reservas de White Coast Suite 104 a TRAIN STATION
  if (whiteCoast104?.billingConfig) {
    const movedReservations = await prisma.reservation.updateMany({
      where: { billingConfigId: whiteCoast104.billingConfig.id },
      data: { billingConfigId: trainStationConfig.id }
    });
    console.log(`✓ Movidas ${movedReservations.count} reservas a TRAIN STATION`);
  }

  console.log('\n=== RESULTADO FINAL ===\n');

  const properties = await prisma.property.findMany({
    where: { hostId: userId },
    include: {
      billingConfig: {
        include: {
          _count: { select: { reservations: true } }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Filtrar solo propiedades con reservas o con billingConfig
  const activeProperties = properties.filter(p =>
    p.billingConfig?._count?.reservations > 0 ||
    p.billingConfig?.airbnbNames?.length > 0
  );

  console.log('Propiedades activas con reservas:\n');
  for (const p of activeProperties) {
    const count = p.billingConfig?._count?.reservations || 0;
    const aliases = p.billingConfig?.airbnbNames?.join(', ') || '-';
    console.log(`📍 ${p.name}`);
    console.log(`   Reservas: ${count}`);
    console.log(`   Alias Airbnb: ${aliases}`);
    console.log('');
  }

  // Mostrar reservas
  console.log('=== RESERVAS ===\n');
  const reservations = await prisma.reservation.findMany({
    where: { userId },
    include: {
      billingConfig: {
        include: { property: { select: { name: true } } }
      }
    },
    orderBy: { checkIn: 'asc' }
  });

  for (const r of reservations) {
    console.log(`${r.confirmationCode} - ${r.guestName}`);
    console.log(`   Propiedad: ${r.billingConfig.property.name}`);
    console.log(`   Check-in: ${r.checkIn.toISOString().split('T')[0]}`);
    console.log('');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
