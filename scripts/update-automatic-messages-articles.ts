/**
 * Script to update automatic messages blog articles with correct author
 * This combines the templates from create-automatic-messages-articles.ts
 * with the instructions already added by fix-*-instructions.ts
 *
 * Run with: npx tsx scripts/update-automatic-messages-articles.ts
 */

import { prisma } from '../src/lib/prisma'

async function updateArticles() {
  console.log('📝 Updating automatic messages blog articles...\n')

  try {
    // Update Airbnb article
    const airbnbArticle = await prisma.blogPost.findUnique({
      where: { slug: 'mensajes-automaticos-airbnb' }
    })

    if (airbnbArticle) {
      await prisma.blogPost.update({
        where: { slug: 'mensajes-automaticos-airbnb' },
        data: {
          authorName: 'Alejandro Satlla',
          coverImage: 'https://images.unsplash.com/photo-1586227740560-8cf2732c1531?w=1200&h=630&fit=crop',
          coverImageAlt: 'Persona configurando mensajes automáticos en Airbnb en su ordenador'
        }
      })
      console.log('✅ Airbnb article updated:')
      console.log('   - Author changed to: Alejandro Satlla')
      console.log('   - Cover image added')
    } else {
      console.log('⚠️  Airbnb article not found')
    }

    // Update Booking article
    const bookingArticle = await prisma.blogPost.findUnique({
      where: { slug: 'mensajes-automaticos-booking' }
    })

    if (bookingArticle) {
      await prisma.blogPost.update({
        where: { slug: 'mensajes-automaticos-booking' },
        data: {
          authorName: 'Alejandro Satlla',
          coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=630&fit=crop',
          coverImageAlt: 'Vista de pantalla de la extranet de Booking.com con mensajes automáticos'
        }
      })
      console.log('✅ Booking article updated:')
      console.log('   - Author changed to: Alejandro Satlla')
      console.log('   - Cover image added')
    } else {
      console.log('⚠️  Booking article not found')
    }

    console.log('\n🎉 Articles updated successfully!')
    console.log('\n📍 Local URLs:')
    console.log(`   → http://localhost:3000/blog/mensajes-automaticos-airbnb`)
    console.log(`   → http://localhost:3000/blog/mensajes-automaticos-booking`)
    console.log('\n📍 Production URLs (after deployment):')
    console.log(`   → https://www.itineramio.com/blog/mensajes-automaticos-airbnb`)
    console.log(`   → https://www.itineramio.com/blog/mensajes-automaticos-booking`)

  } catch (error) {
    console.error('❌ Error updating articles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateArticles()
