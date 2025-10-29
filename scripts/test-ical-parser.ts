import { ICalParser } from '../src/lib/ical-parser'

const testUrls = [
  {
    name: 'LuxRoom',
    url: 'https://www.airbnb.es/calendar/ical/13892128.ics?s=ce39d8f8bc3a8f413801de7ee000fd32'
  },
  {
    name: 'MiniLuxRoom', 
    url: 'https://www.airbnb.es/calendar/ical/36270986.ics?s=ca54ea4e88039163a559c05f6ba79f3b'
  },
  {
    name: 'Casa Azul',
    url: 'https://www.airbnb.es/calendar/ical/37529478.ics?s=f24b8bdc5bb448fc517b06f2d7793ccc'
  },
  {
    name: 'Hemnes Room',
    url: 'https://www.airbnb.es/calendar/ical/843603684025968145.ics?s=c47b95d57cbaafc032770e537167559f'
  },
  {
    name: 'Industrial Loft',
    url: 'https://www.airbnb.es/calendar/ical/918100433578650063.ics?s=b560c9a1c12002d86f1d72626a94e8db'
  }
]

async function testICalParsing() {
  console.log('🧪 Testing iCal Parser with real Airbnb data...\n')
  
  for (const property of testUrls) {
    try {
      console.log(`📅 Testing: ${property.name}`)
      console.log(`📍 URL: ${property.url}`)
      
      // Test if URL is valid
      const isValid = ICalParser.isValidICalUrl(property.url)
      console.log(`✅ URL Valid: ${isValid}`)
      
      if (!isValid) {
        console.log('❌ Invalid URL format\n')
        continue
      }
      
      // Fetch and parse
      const reservations = await ICalParser.fetchAndParseICal(property.url, 'AIRBNB')
      
      console.log(`📊 Found ${reservations.length} reservations`)
      
      if (reservations.length > 0) {
        console.log('📋 Sample reservations:')
        reservations.slice(0, 3).forEach((res, index) => {
          console.log(`  ${index + 1}. ${res.guestName}`)
          console.log(`     📅 ${res.checkIn.toLocaleDateString('es-ES')} → ${res.checkOut.toLocaleDateString('es-ES')} (${res.nights} noches)`)
          if (res.guestCount) console.log(`     👥 ${res.guestCount} huéspedes`)
          if (res.totalPrice) console.log(`     💰 €${res.totalPrice}`)
          console.log(`     🔑 UID: ${res.iCalUid?.substring(0, 20)}...`)
        })
      }
      
      console.log(`\n`)
      
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.log(`\n`)
    }
  }
  
  console.log('🎉 Test completed!')
}

testICalParsing().catch(console.error)