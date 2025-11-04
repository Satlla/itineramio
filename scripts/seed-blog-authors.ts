/**
 * Script para crear autores ficticios para el blog
 * Crea un equipo de redacción diverso y profesional
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const blogAuthors = [
  {
    name: 'Laura Martínez',
    email: 'laura.martinez@itineramio.com',
    role: 'CONTENT_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Experta en marketing de contenidos para alojamientos turísticos',
    specialty: 'SEO y estrategia de contenidos'
  },
  {
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@itineramio.com',
    role: 'TECH_WRITER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Especialista en automatización y tecnología para propiedades',
    specialty: 'Automatización y tecnología'
  },
  {
    name: 'María González',
    email: 'maria.gonzalez@itineramio.com',
    role: 'LEGAL_WRITER',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Asesora legal especializada en legislación turística',
    specialty: 'Legal y normativa'
  },
  {
    name: 'Javier Sánchez',
    email: 'javier.sanchez@itineramio.com',
    role: 'INDUSTRY_EXPERT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Consultor con +15 años en gestión hotelera y alquileres vacacionales',
    specialty: 'Gestión hotelera y revenue management'
  },
  {
    name: 'Ana Torres',
    email: 'ana.torres@itineramio.com',
    role: 'DATA_ANALYST',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    bio: 'Analista de datos especializada en tendencias del sector turístico',
    specialty: 'Análisis de datos y tendencias'
  },
  {
    name: 'David Fernández',
    email: 'david.fernandez@itineramio.com',
    role: 'OPERATIONS_EXPERT',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    bio: 'Experto en operaciones y optimización de procesos',
    specialty: 'Operaciones y eficiencia'
  },
  {
    name: 'Elena Ruiz',
    email: 'elena.ruiz@itineramio.com',
    role: 'DESIGN_WRITER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    bio: 'Diseñadora de interiores especializada en alojamientos turísticos',
    specialty: 'Diseño de interiores y experiencia de huésped'
  },
  {
    name: 'Equipo Itineramio',
    email: 'equipo@itineramio.com',
    role: 'TEAM',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop',
    bio: 'Contenido creado por el equipo completo de Itineramio',
    specialty: 'Contenido colaborativo'
  }
]

async function main() {
  console.log('🎭 Creando autores ficticios para el blog...\n')

  let created = 0
  let skipped = 0

  for (const author of blogAuthors) {
    try {
      // Verificar si el usuario ya existe
      const existing = await prisma.user.findUnique({
        where: { email: author.email }
      })

      if (existing) {
        console.log(`⏭️  ${author.name} - Ya existe (${author.email})`)
        skipped++
        continue
      }

      // Crear el usuario
      const user = await prisma.user.create({
        data: {
          email: author.email,
          name: author.name,
          avatar: author.avatar,
          role: 'CONTENT_CREATOR', // Rol especial para autores del blog
          isAdmin: false,
          status: 'ACTIVE',
          notes: `${author.bio}\n\nEspecialidad: ${author.specialty}`,
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`✅ ${author.name} - Creado exitosamente`)
      console.log(`   📧 ${author.email}`)
      console.log(`   🎯 ${author.specialty}`)
      console.log(`   🆔 ${user.id}\n`)
      created++

    } catch (error) {
      console.error(`❌ Error creando ${author.name}:`, error)
    }
  }

  console.log('\n📊 Resumen:')
  console.log(`   ✅ Creados: ${created}`)
  console.log(`   ⏭️  Omitidos (ya existían): ${skipped}`)
  console.log(`   📝 Total: ${blogAuthors.length}\n`)

  console.log('💡 Próximos pasos:')
  console.log('   1. Ve al panel de administración del blog')
  console.log('   2. Edita o crea artículos')
  console.log('   3. En el campo "Autor", podrás ver estos nombres')
  console.log('   4. Las fotos de perfil aparecerán automáticamente\n')
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
