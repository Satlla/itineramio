import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Predefined zone translations
const zoneTranslations: Record<string, { es: string; en: string; fr: string }> = {
  // Standard zones
  'check in': { es: 'Check In', en: 'Check In', fr: 'Enregistrement' },
  'wifi': { es: 'WiFi', en: 'WiFi', fr: 'WiFi' },
  'check out': { es: 'Check Out', en: 'Check Out', fr: 'Départ' },
  'cómo llegar': { es: 'Cómo Llegar', en: 'How to Get Here', fr: 'Comment Arriver' },
  'como llegar': { es: 'Cómo Llegar', en: 'How to Get Here', fr: 'Comment Arriver' },
  'normas de la casa': { es: 'Normas de la Casa', en: 'House Rules', fr: 'Règles de la Maison' },
  'parking': { es: 'Parking', en: 'Parking', fr: 'Parking' },
  'climatización': { es: 'Climatización', en: 'Climate Control', fr: 'Climatisation' },
  'climatizacion': { es: 'Climatización', en: 'Climate Control', fr: 'Climatisation' },
  'teléfonos de emergencia': { es: 'Teléfonos de Emergencia', en: 'Emergency Contacts', fr: 'Contacts d\'Urgence' },
  'telefonos de emergencia': { es: 'Teléfonos de Emergencia', en: 'Emergency Contacts', fr: 'Contacts d\'Urgence' },
  'transporte público': { es: 'Transporte Público', en: 'Public Transport', fr: 'Transports en Commun' },
  'transporte publico': { es: 'Transporte Público', en: 'Public Transport', fr: 'Transports en Commun' },
  'recomendaciones': { es: 'Recomendaciones', en: 'Recommendations', fr: 'Recommandations' },
  'basura y reciclaje': { es: 'Basura y Reciclaje', en: 'Trash & Recycling', fr: 'Poubelles et Recyclage' },

  // Additional common zones
  'cocina': { es: 'Cocina', en: 'Kitchen', fr: 'Cuisine' },
  'baño': { es: 'Baño', en: 'Bathroom', fr: 'Salle de Bain' },
  'bano': { es: 'Baño', en: 'Bathroom', fr: 'Salle de Bain' },
  'dormitorio': { es: 'Dormitorio', en: 'Bedroom', fr: 'Chambre' },
  'salón': { es: 'Salón', en: 'Living Room', fr: 'Salon' },
  'salon': { es: 'Salón', en: 'Living Room', fr: 'Salon' },
  'terraza': { es: 'Terraza', en: 'Terrace', fr: 'Terrasse' },
  'piscina': { es: 'Piscina', en: 'Pool', fr: 'Piscine' },
  'jardín': { es: 'Jardín', en: 'Garden', fr: 'Jardin' },
  'jardin': { es: 'Jardín', en: 'Garden', fr: 'Jardin' },
  'lavandería': { es: 'Lavandería', en: 'Laundry', fr: 'Buanderie' },
  'lavanderia': { es: 'Lavandería', en: 'Laundry', fr: 'Buanderie' },
  'gimnasio': { es: 'Gimnasio', en: 'Gym', fr: 'Salle de Sport' },
  'garaje': { es: 'Garaje', en: 'Garage', fr: 'Garage' },
  'entrada': { es: 'Entrada', en: 'Entrance', fr: 'Entrée' },
  'seguridad': { es: 'Seguridad', en: 'Security', fr: 'Sécurité' },
  'electrodomésticos': { es: 'Electrodomésticos', en: 'Appliances', fr: 'Électroménager' },
  'electrodomesticos': { es: 'Electrodomésticos', en: 'Appliances', fr: 'Électroménager' },
  'tv': { es: 'TV', en: 'TV', fr: 'TV' },
  'televisión': { es: 'Televisión', en: 'Television', fr: 'Télévision' },
  'television': { es: 'Televisión', en: 'Television', fr: 'Télévision' },
  'aire acondicionado': { es: 'Aire Acondicionado', en: 'Air Conditioning', fr: 'Climatisation' },
  'calefacción': { es: 'Calefacción', en: 'Heating', fr: 'Chauffage' },
  'calefaccion': { es: 'Calefacción', en: 'Heating', fr: 'Chauffage' },
  'servicios cercanos': { es: 'Servicios Cercanos', en: 'Nearby Services', fr: 'Services à Proximité' },
  'contacto': { es: 'Contacto', en: 'Contact', fr: 'Contact' },
  'información general': { es: 'Información General', en: 'General Information', fr: 'Informations Générales' },
  'informacion general': { es: 'Información General', en: 'General Information', fr: 'Informations Générales' },
}

// Description translations
const descriptionTranslations: Record<string, { es: string; en: string; fr: string }> = {
  'proceso de entrada al apartamento': {
    es: 'Proceso de entrada al apartamento',
    en: 'Apartment check-in process',
    fr: 'Processus d\'enregistrement à l\'appartement'
  },
  'información de conexión a internet': {
    es: 'Información de conexión a internet',
    en: 'Internet connection information',
    fr: 'Informations de connexion internet'
  },
  'instrucciones para la salida': {
    es: 'Instrucciones para la salida',
    en: 'Check-out instructions',
    fr: 'Instructions de départ'
  },
  'direcciones desde aeropuerto, estación y ubicación exacta': {
    es: 'Direcciones desde aeropuerto, estación y ubicación exacta',
    en: 'Directions from airport, station and exact location',
    fr: 'Itinéraire depuis l\'aéroport, la gare et localisation exacte'
  },
  'reglas y políticas del apartamento': {
    es: 'Reglas y políticas del apartamento',
    en: 'Apartment rules and policies',
    fr: 'Règles et politiques de l\'appartement'
  },
  'información sobre aparcamiento': {
    es: 'Información sobre aparcamiento',
    en: 'Parking information',
    fr: 'Informations sur le stationnement'
  },
  'aire acondicionado y calefacción': {
    es: 'Aire acondicionado y calefacción',
    en: 'Air conditioning and heating',
    fr: 'Climatisation et chauffage'
  },
  'contactos importantes y anfitrión': {
    es: 'Contactos importantes y anfitrión',
    en: 'Important contacts and host',
    fr: 'Contacts importants et hôte'
  },
  'metro, autobús y opciones de movilidad': {
    es: 'Metro, autobús y opciones de movilidad',
    en: 'Metro, bus and mobility options',
    fr: 'Métro, bus et options de mobilité'
  },
  'restaurantes, tiendas y lugares de interés': {
    es: 'Restaurantes, tiendas y lugares de interés',
    en: 'Restaurants, shops and points of interest',
    fr: 'Restaurants, boutiques et points d\'intérêt'
  },
  'cómo y dónde desechar la basura': {
    es: 'Cómo y dónde desechar la basura',
    en: 'How and where to dispose of trash',
    fr: 'Comment et où jeter les déchets'
  },
}

async function migrateZoneTranslations() {
  console.log('🔄 Starting zone translation migration...\n')

  // Get all zones
  const zones = await prisma.zone.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      property: {
        select: {
          name: true
        }
      }
    }
  })

  console.log(`📊 Found ${zones.length} zones to check\n`)

  let migratedCount = 0
  let skippedCount = 0
  let customCount = 0

  for (const zone of zones) {
    // Get current name
    let currentName: string
    let needsNameMigration = false

    if (typeof zone.name === 'string') {
      currentName = zone.name
      needsNameMigration = true
    } else if (zone.name && typeof zone.name === 'object') {
      const nameObj = zone.name as any
      // Check if it already has EN and FR translations
      if (nameObj.en && nameObj.fr) {
        skippedCount++
        continue // Already migrated
      }
      currentName = nameObj.es || nameObj.en || ''
      needsNameMigration = true
    } else {
      skippedCount++
      continue
    }

    // Find translation for this zone
    const nameLower = currentName.toLowerCase().trim()
    const translation = zoneTranslations[nameLower]

    let newName: { es: string; en: string; fr: string }

    if (translation) {
      newName = translation
    } else {
      // For custom zones, keep Spanish name and use it for all languages
      // User can edit later
      newName = {
        es: currentName,
        en: currentName, // Keep original for now
        fr: currentName  // Keep original for now
      }
      customCount++
    }

    // Handle description
    let newDescription: { es: string; en: string; fr: string } | null = null
    if (zone.description) {
      let currentDesc: string
      if (typeof zone.description === 'string') {
        currentDesc = zone.description
      } else if (zone.description && typeof zone.description === 'object') {
        const descObj = zone.description as any
        currentDesc = descObj.es || ''
      } else {
        currentDesc = ''
      }

      const descLower = currentDesc.toLowerCase().trim()
      const descTranslation = descriptionTranslations[descLower]

      if (descTranslation) {
        newDescription = descTranslation
      } else if (currentDesc) {
        newDescription = {
          es: currentDesc,
          en: currentDesc,
          fr: currentDesc
        }
      }
    }

    // Update zone
    const updateData: any = { name: newName }
    if (newDescription) {
      updateData.description = newDescription
    }

    await prisma.zone.update({
      where: { id: zone.id },
      data: updateData
    })

    console.log(`✅ Migrated: "${currentName}" → ES: "${newName.es}" | EN: "${newName.en}" | FR: "${newName.fr}"`)
    migratedCount++
  }

  console.log('\n📊 Migration Summary:')
  console.log(`   ✅ Migrated: ${migratedCount} zones`)
  console.log(`   ⏭️  Skipped (already done): ${skippedCount} zones`)
  console.log(`   📝 Custom zones (kept original): ${customCount} zones`)
  console.log('\n✨ Migration complete!')
}

migrateZoneTranslations()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
