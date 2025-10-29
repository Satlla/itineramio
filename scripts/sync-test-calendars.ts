import { prisma } from '../src/lib/prisma'
import { ICalParser } from '../src/lib/ical-parser'

async function syncTestCalendars() {
  try {
    console.log('🔄 Starting initial calendar sync with real Airbnb data...\n')
    
    // Get all properties with calendar sync configured
    const properties = await prisma.property.findMany({
      where: {
        calendarSync: {
          isNot: null
        }
      },
      include: {
        calendarSync: true
      }
    })
    
    console.log(`📊 Found ${properties.length} properties with calendar sync configured\n`)
    
    const now = new Date()
    let totalReservations = 0
    
    for (const property of properties) {
      if (!property.calendarSync) continue
      
      try {
        console.log(`🏠 Syncing: ${property.name}`)
        
        const syncConfig = property.calendarSync
        let propertyReservations = 0
        
        // Sync Airbnb calendar
        if (syncConfig.airbnbICalUrl) {
          try {
            console.log(`  📅 Fetching Airbnb calendar...`)
            
            const reservations = await ICalParser.fetchAndParseICal(
              syncConfig.airbnbICalUrl, 
              'AIRBNB'
            )
            
            console.log(`  📋 Found ${reservations.length} reservations`)
            
            // Save each reservation
            for (const reservation of reservations) {
              try {
                // Check if reservation already exists
                const existing = await prisma.calendarReservation.findFirst({
                  where: {
                    propertyId: property.id,
                    iCalUid: reservation.iCalUid
                  }
                })
                
                if (!existing) {
                  await prisma.calendarReservation.create({
                    data: {
                      propertyId: property.id,
                      source: 'AIRBNB',
                      externalId: reservation.externalId,
                      iCalUid: reservation.iCalUid,
                      guestName: reservation.guestName,
                      checkIn: reservation.checkIn,
                      checkOut: reservation.checkOut,
                      nights: reservation.nights,
                      guestCount: reservation.guestCount,
                      guestPhone: reservation.guestPhone,
                      guestEmail: reservation.guestEmail,
                      totalPrice: reservation.totalPrice,
                      notes: reservation.notes,
                      rawICalData: reservation.rawICalData,
                      syncedAt: now,
                      status: 'CONFIRMED'
                    }
                  })
                  propertyReservations++
                  totalReservations++
                }
              } catch (error) {
                console.error(`    ❌ Error saving reservation: ${error}`)
              }
            }
            
            console.log(`  ✅ Saved ${propertyReservations} new reservations`)
            
          } catch (error) {
            console.error(`  ❌ Error syncing Airbnb: ${error}`)
          }
        }
        
        // Update sync status
        await prisma.propertyCalendarSync.update({
          where: { propertyId: property.id },
          data: {
            lastSyncAt: now,
            lastSyncStatus: 'SUCCESS',
            lastSyncCount: propertyReservations
          }
        })
        
        // Log sync
        await prisma.calendarSyncLog.create({
          data: {
            propertyId: property.id,
            source: 'AIRBNB',
            status: 'SUCCESS',
            reservationsSynced: propertyReservations,
            reservationsAdded: propertyReservations,
            reservationsUpdated: 0,
            reservationsRemoved: 0
          }
        })
        
      } catch (error) {
        console.error(`❌ Error syncing ${property.name}:`, error)
      }
      
      console.log('') // Empty line
    }
    
    console.log(`🎉 Sync completed!`)
    console.log(`📊 Total reservations synced: ${totalReservations}`)
    console.log('\n🚀 Ready to test!')
    console.log('1. Go to: http://localhost:3000/calendar')
    console.log('2. Login with your admin account')
    console.log('3. You should see all your Airbnb reservations!')
    
  } catch (error) {
    console.error('❌ Error during sync:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncTestCalendars()