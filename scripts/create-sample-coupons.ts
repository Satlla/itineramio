import { prisma } from '../src/lib/prisma'

async function createSampleCoupons() {
  try {
    console.log('🎁 Creating sample coupons and custom plans...')
    
    // 1. Cupones de lanzamiento y campañas
    const campaignCoupons = [
      {
        code: 'LAUNCH50',
        name: 'Oferta de Lanzamiento',
        description: '50% descuento en tu primer año - Solo por tiempo limitado!',
        type: 'PERCENTAGE',
        discountPercent: 50,
        maxUses: 1000,
        maxUsesPerUser: 1,
        validUntil: new Date('2024-12-31'),
        isPublic: true,
        campaignSource: 'LAUNCH',
        applicableToPlans: ['STANDARD']
      },
      {
        code: 'SUMMER25',
        name: 'Verano 2024',
        description: '25% descuento en cualquier plan de 6+ meses',
        type: 'PERCENTAGE',
        discountPercent: 25,
        maxUses: 500,
        maxUsesPerUser: 1,
        minDuration: 6,
        validUntil: new Date('2024-09-30'),
        isPublic: true,
        campaignSource: 'INSTAGRAM',
        applicableToPlans: ['STANDARD']
      },
      {
        code: 'BLACKFRIDAY',
        name: 'Black Friday',
        description: '3 meses completamente GRATIS!',
        type: 'FREE_MONTHS',
        freeMonths: 3,
        maxUses: 200,
        maxUsesPerUser: 1,
        validFrom: new Date('2024-11-25'),
        validUntil: new Date('2024-11-30'),
        isPublic: true,
        campaignSource: 'EMAIL',
        applicableToPlans: ['STANDARD']
      }
    ]

    // 2. Cupones de redes sociales
    const socialCoupons = [
      {
        code: 'INSTAGRAM2024',
        name: 'Instagram Followers',
        description: '30% descuento para seguidores de Instagram',
        type: 'PERCENTAGE',
        discountPercent: 30,
        maxUses: 300,
        campaignSource: 'INSTAGRAM',
        isPublic: false,
        applicableToPlans: ['STANDARD']
      },
      {
        code: 'TIKTOK50',
        name: 'TikTok Viral',
        description: '6 meses al 50% - Solo para TikTok!',
        type: 'PERCENTAGE',
        discountPercent: 50,
        maxUses: 100,
        minDuration: 6,
        campaignSource: 'TIKTOK',
        isPublic: false,
        applicableToPlans: ['STANDARD']
      },
      {
        code: 'YOUTUBE100',
        name: 'YouTube Promo',
        description: 'Plan especial: 100 propiedades por €500/mes',
        type: 'CUSTOM_PLAN',
        maxUses: 10,
        campaignSource: 'YOUTUBE',
        isPublic: false,
        applicableToPlans: ['ENTERPRISE']
      }
    ]

    // 3. Cupones de referidos (estos se generan automáticamente, pero creamos ejemplos)
    const referralCoupons = [
      {
        code: 'FRIEND6M',
        name: 'Referido Amigo',
        description: '6 meses gratis por cada amigo que refieras',
        type: 'FREE_MONTHS',
        freeMonths: 6,
        maxUsesPerUser: 10, // Acumulables
        campaignSource: 'REFERRAL',
        isPublic: false,
        applicableToPlans: ['STANDARD']
      },
      {
        code: 'VIP12M',
        name: 'VIP Referral',
        description: '12 meses gratis para usuarios VIP',
        type: 'FREE_MONTHS',
        freeMonths: 12,
        maxUses: 50,
        maxUsesPerUser: 1,
        campaignSource: 'REFERRAL',
        isPublic: false,
        applicableToPlans: ['STANDARD']
      }
    ]

    // Crear todos los cupones
    const allCoupons = [...campaignCoupons, ...socialCoupons, ...referralCoupons]
    
    for (const couponData of allCoupons) {
      const coupon = await prisma.coupon.create({
        data: couponData
      })
      console.log(`✅ Created coupon: ${coupon.code} - ${coupon.name}`)
    }

    // 4. Planes personalizados para hoteles
    const customPlans = [
      {
        name: 'Hotel Boutique',
        description: 'Plan especial para hoteles boutique hasta 20 habitaciones',
        pricePerProperty: 4.50,
        minProperties: 5,
        maxProperties: 20,
        isForHotels: true,
        maxZonesPerProperty: 8, // Baño, cama, minibar, balcón, etc.
        features: ['priority_support', 'custom_branding', 'analytics_reports'],
        restrictions: { max_zones_per_property: 8, hotel_mode: true }
      },
      {
        name: 'Hotel Premium',
        description: 'Plan para cadenas hoteleras 20-100 habitaciones',
        pricePerProperty: 3.50,
        minProperties: 20,
        maxProperties: 100,
        isForHotels: true,
        maxZonesPerProperty: 12,
        features: ['priority_support', 'custom_branding', 'api_access', 'white_label'],
        restrictions: { max_zones_per_property: 12, hotel_mode: true, api_enabled: true }
      },
      {
        name: 'Hostel Económico',
        description: 'Plan básico para hostels y albergues',
        pricePerProperty: 2.00,
        minProperties: 5,
        maxProperties: 50,
        isForHotels: true,
        maxZonesPerProperty: 5, // Básico: cama, baño, cocina, común
        features: ['basic_support'],
        restrictions: { max_zones_per_property: 5, basic_features_only: true }
      },
      {
        name: 'Aparthotel Suite',
        description: 'Plan para aparthoteles con suites amplias',
        pricePerProperty: 6.00,
        minProperties: 3,
        maxProperties: 30,
        isForHotels: false,
        maxZonesPerProperty: 15, // Suite completa con todas las zonas
        features: ['priority_support', 'custom_branding', 'extended_zones'],
        restrictions: { max_zones_per_property: 15, suite_mode: true }
      },
      {
        name: 'Enterprise Unlimited',
        description: 'Plan empresarial sin límites',
        pricePerProperty: 2.50,
        minProperties: 50,
        maxProperties: null, // Ilimitado
        isForHotels: false,
        maxZonesPerProperty: null, // Sin límite
        features: ['24_7_support', 'custom_branding', 'api_access', 'white_label', 'dedicated_manager'],
        restrictions: { unlimited: true },
        requiresApproval: true
      }
    ]

    for (const planData of customPlans) {
      const plan = await prisma.customPlan.create({
        data: planData
      })
      console.log(`🏨 Created custom plan: ${plan.name} - €${plan.pricePerProperty}/prop`)
    }

    console.log('🎉 Sample coupons and custom plans created successfully!')
    console.log('')
    console.log('🔥 CUPONES CREADOS:')
    console.log('├── LAUNCH50 (50% desc. primer año)')
    console.log('├── SUMMER25 (25% desc. 6+ meses)') 
    console.log('├── BLACKFRIDAY (3 meses gratis)')
    console.log('├── INSTAGRAM2024 (30% desc.)')
    console.log('├── TIKTOK50 (50% desc. 6 meses)')
    console.log('├── YOUTUBE100 (plan especial)')
    console.log('├── FRIEND6M (6 meses gratis)')
    console.log('└── VIP12M (12 meses gratis)')
    console.log('')
    console.log('🏨 PLANES PERSONALIZADOS:')
    console.log('├── Hotel Boutique (€4.50/prop)')
    console.log('├── Hotel Premium (€3.50/prop)')
    console.log('├── Hostel Económico (€2.00/prop)')
    console.log('├── Aparthotel Suite (€6.00/prop)')
    console.log('└── Enterprise Unlimited (€2.50/prop)')
    
  } catch (error) {
    console.error('❌ Error creating coupons:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleCoupons()