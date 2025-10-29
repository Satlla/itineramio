import { prisma } from '../src/lib/prisma'

const testProperties = [
  {
    name: 'LuxRoom',
    description: 'Habitación de lujo en el centro de Madrid',
    city: 'Madrid',
    type: 'Habitación',
    icalUrl: 'https://www.airbnb.es/calendar/ical/13892128.ics?s=ce39d8f8bc3a8f413801de7ee000fd32'
  },
  {
    name: 'MiniLuxRoom',
    description: 'Habitación pequeña pero elegante',
    city: 'Madrid', 
    type: 'Habitación',
    icalUrl: 'https://www.airbnb.es/calendar/ical/36270986.ics?s=ca54ea4e88039163a559c05f6ba79f3b'
  },
  {
    name: 'Casa Azul',
    description: 'Casa completa con jardín',
    city: 'Madrid',
    type: 'Casa',
    icalUrl: 'https://www.airbnb.es/calendar/ical/37529478.ics?s=f24b8bdc5bb448fc517b06f2d7793ccc'
  },
  {
    name: 'Hemnes Room',
    description: 'Habitación estilo nórdico',
    city: 'Madrid',
    type: 'Habitación',
    icalUrl: 'https://www.airbnb.es/calendar/ical/843603684025968145.ics?s=c47b95d57cbaafc032770e537167559f'
  },
  {
    name: 'Industrial Loft',
    description: 'Loft de estilo industrial',
    city: 'Madrid',
    type: 'Loft',
    icalUrl: 'https://www.airbnb.es/calendar/ical/918100433578650063.ics?s=b560c9a1c12002d86f1d72626a94e8db'
  }
]

async function createTestPropertiesWithCalendar() {
  try {
    console.log('🏠 Creating test properties with calendar sync...\n')
    
    // First, find an admin user to own these properties
    let testUser = await prisma.user.findFirst({
      where: { isAdmin: true }
    })
    
    if (!testUser) {
      console.log('📝 Creating test user...')
      testUser = await prisma.user.create({
        data: {
          email: 'test@itineramio.com',
          name: 'Test User',
          password: 'test123',
          role: 'HOST',
          status: 'ACTIVE',
          isAdmin: true
        }
      })
    }
    
    console.log(`👤 Using user: ${testUser.name} (${testUser.email})`)
    
    // Create property set for grouping
    console.log('📦 Creating property set...')
    const propertySet = await prisma.propertySet.create({
      data: {
        hostId: testUser.id,
        name: 'Propiedades de Prueba Madrid',
        description: 'Conjunto de propiedades para probar el calendario',
        street: 'Calle Gran Vía, 1',
        city: 'Madrid',
        state: 'Madrid',
        country: 'España',
        postalCode: '28013',
        type: 'MIXED',
        hostContactName: testUser.name,
        hostContactPhone: '+34 600 000 000',
        hostContactEmail: testUser.email,
        status: 'ACTIVE'
      }
    })
    
    console.log(`📦 Created property set: ${propertySet.name}\n`)
    
    // Create properties with calendar sync
    for (const prop of testProperties) {
      try {
        console.log(`🏠 Creating property: ${prop.name}`)
        
        // Create property
        const property = await prisma.property.create({
          data: {
            hostId: testUser.id,
            propertySetId: propertySet.id,
            name: prop.name,
            description: prop.description,
            street: 'Calle Gran Vía, 1',
            city: prop.city,
            state: 'Madrid',
            country: 'España',
            postalCode: '28013',
            type: prop.type,
            bedrooms: 1,
            bathrooms: 1,
            maxGuests: 2,
            status: 'ACTIVE',
            hostContactName: testUser.name,
            hostContactPhone: '+34 600 000 000',
            hostContactEmail: testUser.email,
            isPublished: true,
            publishedAt: new Date()
          }
        })
        
        // Create calendar sync configuration
        await prisma.propertyCalendarSync.create({
          data: {
            propertyId: property.id,
            airbnbICalUrl: prop.icalUrl,
            syncEnabled: true,
            syncInterval: 10 // 10 minutes
          }
        })
        
        console.log(`✅ Created: ${property.name} with calendar sync`)
        
      } catch (error) {
        console.error(`❌ Error creating ${prop.name}:`, error)
      }
    }
    
    console.log('\n🎉 Test properties created successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Run: npm run dev')
    console.log('2. Login with: test@itineramio.com / test123')
    console.log('3. Go to: http://localhost:3000/calendar')
    console.log('4. Click "Sincronizar" to fetch real Airbnb data!')
    
  } catch (error) {
    console.error('❌ Error creating test properties:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPropertiesWithCalendar()