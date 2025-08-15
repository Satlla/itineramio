// CalendarReservation type (temporarily inline)
interface CalendarReservation {
  id: string
  propertyId: string
  source: string
  checkIn: Date
  checkOut: Date
  guestName: string
  guestEmail?: string | null
  guestPhone?: string | null
  guests: number
  status: string
}

interface ICalEvent {
  uid?: string
  summary?: string
  dtstart?: string
  dtend?: string
  description?: string
  location?: string
}

interface ParsedReservation {
  externalId?: string
  iCalUid?: string
  guestName: string
  checkIn: Date
  checkOut: Date
  nights: number
  guestCount?: number
  guestPhone?: string
  guestEmail?: string
  totalPrice?: number
  notes?: string
  rawICalData: any
}

export class ICalParser {
  
  /**
   * Parse iCal string content into reservation objects
   */
  static parseICalString(icalContent: string, source: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'OTHER' = 'OTHER'): ParsedReservation[] {
    try {
      const events = this.extractEvents(icalContent)
      return events.map(event => this.parseEvent(event, source)).filter(Boolean) as ParsedReservation[]
    } catch (error) {
      console.error('Error parsing iCal content:', error)
      return []
    }
  }

  /**
   * Fetch and parse iCal from URL
   */
  static async fetchAndParseICal(url: string, source: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'OTHER' = 'OTHER'): Promise<ParsedReservation[]> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Itineramio Calendar Sync/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const icalContent = await response.text()
      return this.parseICalString(icalContent, source)
    } catch (error) {
      console.error(`Error fetching iCal from ${url}:`, error)
      throw error
    }
  }

  /**
   * Extract individual events from iCal content
   */
  private static extractEvents(icalContent: string): ICalEvent[] {
    const events: ICalEvent[] = []
    const lines = icalContent.split(/\r?\n/)
    
    let currentEvent: ICalEvent | null = null
    let currentProperty = ''
    let currentValue = ''
    
    for (let line of lines) {
      // Handle line continuations
      if (line.startsWith(' ') || line.startsWith('\t')) {
        currentValue += line.substring(1)
        continue
      }
      
      // Process previous property if exists
      if (currentProperty && currentEvent) {
        this.setEventProperty(currentEvent, currentProperty, currentValue)
      }
      
      // Start new event
      if (line.trim() === 'BEGIN:VEVENT') {
        currentEvent = {}
        currentProperty = ''
        currentValue = ''
        continue
      }
      
      // End current event
      if (line.trim() === 'END:VEVENT' && currentEvent) {
        events.push(currentEvent)
        currentEvent = null
        currentProperty = ''
        currentValue = ''
        continue
      }
      
      // Parse property line
      if (currentEvent && line.includes(':')) {
        const colonIndex = line.indexOf(':')
        currentProperty = line.substring(0, colonIndex).trim()
        currentValue = line.substring(colonIndex + 1).trim()
      }
    }
    
    return events
  }

  /**
   * Set property on event object
   */
  private static setEventProperty(event: ICalEvent, property: string, value: string) {
    // Remove parameters from property name (e.g., "DTSTART;VALUE=DATE" becomes "DTSTART")
    const cleanProperty = property.split(';')[0].toUpperCase()
    
    switch (cleanProperty) {
      case 'UID':
        event.uid = value
        break
      case 'SUMMARY':
        event.summary = this.unescapeText(value)
        break
      case 'DTSTART':
        event.dtstart = value
        break
      case 'DTEND':
        event.dtend = value
        break
      case 'DESCRIPTION':
        event.description = this.unescapeText(value)
        break
      case 'LOCATION':
        event.location = this.unescapeText(value)
        break
    }
  }

  /**
   * Parse individual event into reservation object
   */
  private static parseEvent(event: ICalEvent, source: string): ParsedReservation | null {
    if (!event.dtstart || !event.dtend) {
      return null
    }
    
    try {
      const checkIn = this.parseICalDate(event.dtstart)
      const checkOut = this.parseICalDate(event.dtend)
      
      if (!checkIn || !checkOut) {
        return null
      }
      
      // Calculate nights
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      
      if (nights <= 0) {
        return null
      }
      
      // Extract guest information from summary/description
      const guestInfo = this.extractGuestInfo(event, source)
      
      return {
        externalId: event.uid,
        iCalUid: event.uid,
        guestName: guestInfo.guestName || 'Huésped Desconocido',
        checkIn,
        checkOut,
        nights,
        guestCount: guestInfo.guestCount,
        guestPhone: guestInfo.guestPhone,
        guestEmail: guestInfo.guestEmail,
        totalPrice: guestInfo.totalPrice,
        notes: event.description,
        rawICalData: event
      }
    } catch (error) {
      console.error('Error parsing event:', error)
      return null
    }
  }

  /**
   * Parse iCal date string to JavaScript Date
   */
  private static parseICalDate(dateString: string): Date | null {
    try {
      // Remove timezone info for simplicity (YYYYMMDD or YYYYMMDDTHHMMSSZ)
      let cleanDate = dateString.replace(/[TZ]/g, '').split(';')[0]
      
      // Handle date-only format (YYYYMMDD)
      if (cleanDate.length === 8) {
        const year = parseInt(cleanDate.substr(0, 4))
        const month = parseInt(cleanDate.substr(4, 2)) - 1 // Month is 0-indexed
        const day = parseInt(cleanDate.substr(6, 2))
        return new Date(year, month, day)
      }
      
      // Handle datetime format (YYYYMMDDTHHMMSS)
      if (cleanDate.length >= 14) {
        const year = parseInt(cleanDate.substr(0, 4))
        const month = parseInt(cleanDate.substr(4, 2)) - 1
        const day = parseInt(cleanDate.substr(6, 2))
        const hour = parseInt(cleanDate.substr(8, 2))
        const minute = parseInt(cleanDate.substr(10, 2))
        const second = parseInt(cleanDate.substr(12, 2))
        return new Date(year, month, day, hour, minute, second)
      }
      
      return null
    } catch (error) {
      console.error('Error parsing iCal date:', dateString, error)
      return null
    }
  }

  /**
   * Extract guest information from event summary/description
   */
  private static extractGuestInfo(event: ICalEvent, source: string): {
    guestName?: string
    guestCount?: number
    guestPhone?: string
    guestEmail?: string
    totalPrice?: number
  } {
    const summary = event.summary || ''
    const description = event.description || ''
    const combined = `${summary} ${description}`.toLowerCase()
    
    const result: any = {}
    
    // Extract guest name from summary (common format: "Guest Name (Platform)")
    if (summary) {
      const nameMatch = summary.match(/^([^(]+)/)
      if (nameMatch) {
        result.guestName = nameMatch[1].trim()
      }
    }
    
    // Extract guest count
    const guestCountMatch = combined.match(/(\d+)\s*(guest|guests|huésped|huéspedes|persona|personas)/i)
    if (guestCountMatch) {
      result.guestCount = parseInt(guestCountMatch[1])
    }
    
    // Extract phone (basic patterns)
    const phoneMatch = combined.match(/(\+?\d{1,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/g)
    if (phoneMatch && phoneMatch[0]) {
      result.guestPhone = phoneMatch[0].trim()
    }
    
    // Extract email
    const emailMatch = combined.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    if (emailMatch) {
      result.guestEmail = emailMatch[0]
    }
    
    // Extract price (basic patterns)
    const priceMatch = combined.match(/(\$|€|£|USD|EUR|GBP)\s?(\d+(?:[.,]\d{2})?)/i) || 
                     combined.match(/(\d+(?:[.,]\d{2})?)\s?(\$|€|£|USD|EUR|GBP)/i)
    if (priceMatch) {
      const priceString = priceMatch[2] || priceMatch[1]
      const price = parseFloat(priceString.replace(',', '.'))
      if (!isNaN(price)) {
        result.totalPrice = price
      }
    }
    
    return result
  }

  /**
   * Unescape iCal text (handle \n, \, etc.)
   */
  private static unescapeText(text: string): string {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')
  }

  /**
   * Detect the likely source platform from iCal content or URL
   */
  static detectSource(icalContent: string, url?: string): 'AIRBNB' | 'BOOKING' | 'VRBO' | 'OTHER' {
    const content = icalContent.toLowerCase()
    const urlLower = url?.toLowerCase() || ''
    
    if (urlLower.includes('airbnb') || content.includes('airbnb')) {
      return 'AIRBNB'
    }
    
    if (urlLower.includes('booking') || content.includes('booking.com')) {
      return 'BOOKING'
    }
    
    if (urlLower.includes('vrbo') || content.includes('vrbo')) {
      return 'VRBO'
    }
    
    return 'OTHER'
  }

  /**
   * Validate iCal URL format
   */
  static isValidICalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol) && 
             (url.includes('ical') || url.includes('calendar') || url.endsWith('.ics'))
    } catch {
      return false
    }
  }
}