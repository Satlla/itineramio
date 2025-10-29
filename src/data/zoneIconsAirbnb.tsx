import React from 'react'

// Iconos minimalistas estilo Airbnb - SVGs simples y elegantes
export const AirbnbZoneIcons = {
  // Cocina y comida
  kitchen: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M8.1 4v8c0 .6.4 1 1 1s1-.4 1-1V4h2v8c0 .6.4 1 1 1s1-.4 1-1V4h.9c.6 0 1-.4 1-1s-.4-1-1-1H7.1c-.6 0-1 .4-1 1s.4 1 1 1h1zm8.9 0c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1s1-.4 1-1V5c0-.6-.4-1-1-1z"/>
      <path d="M4 14v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6H4z"/>
    </svg>
  ),
  
  cooking: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="9" cy="9" r="2"/>
      <circle cx="15" cy="9" r="2"/>
      <circle cx="9" cy="15" r="2"/>
      <circle cx="15" cy="15" r="2"/>
      <path d="M3 3h18c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  coffee: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.38 0 2.5-1.12 2.5-2.5S19.88 5 18.5 5V3zM16 8.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V5h10v3.5z"/>
    </svg>
  ),

  microwave: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <rect x="2" y="4" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="4" y="6" width="12" height="8" rx="1"/>
      <circle cx="18" cy="8" r="1"/>
      <circle cx="18" cy="12" r="1"/>
    </svg>
  ),

  // Dormitorio
  bedroom: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M4 19v2h2v-2h12v2h2v-2h1V9c0-1.1-.9-2-2-2h-4V5c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H3c-1.1 0-2 .9-2 2v10h3zM9 5h6v2H9V5zM5 9h14v6H5V9z"/>
    </svg>
  ),

  lighting: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 14h-4v-1h4v1zm0-2h-4c-.55 0-1-.45-1-1 0-.55.45-1 1-1h4c.55 0 1 .45 1 1 0 .55-.45 1-1 1z"/>
    </svg>
  ),

  // Baño
  bathroom: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M2 12c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v3zm4-7c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zM22 12v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8H1c-.55 0-1-.45-1-1s.45-1 1-1h22c.55 0 1 .45 1 1s-.45 1-1 1h-1z"/>
    </svg>
  ),

  shower: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="8" cy="20" r="2"/>
      <circle cx="12" cy="20" r="2"/>  
      <circle cx="16" cy="20" r="2"/>
      <circle cx="8" cy="16" r="2"/>
      <circle cx="12" cy="16" r="2"/>
      <circle cx="16" cy="16" r="2"/>
      <path d="M6 2v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2H6z" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Sala de estar
  living: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM5 15V9h14v6H5z"/>
      <path d="M21 5v2H3V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2z"/>
    </svg>
  ),

  tv: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <rect x="2" y="4" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 21h8"/>
      <path d="M12 17v4"/>
    </svg>
  ),

  // Acceso y seguridad
  entrance: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
    </svg>
  ),

  keys: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="7" cy="7" r="3"/>
      <path d="M8.5 8.5l7.5 7.5"/>
      <path d="M16 16l2-2"/>
      <path d="M18 18l2-2"/>
    </svg>
  ),

  security: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
      <path d="M9 12l2 2 4-4" fill="none" stroke="white" strokeWidth="2"/>
    </svg>
  ),

  // Transporte
  parking: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 8h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4v4"/>
      <path d="M8 8v8"/>
    </svg>
  ),

  transport: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="6" cy="19" r="2"/>
      <circle cx="18" cy="19" r="2"/>
      <path d="M4 7h16l-2 9H6L4 7z"/>
      <path d="M4 7L2 3"/>
    </svg>
  ),

  // Servicios
  wifi: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9z"/>
      <path d="M5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.24 9.24 8.76 9.24 5 13z"/>
      <path d="M9 17l2 2c.69-.69 1.81-.69 2.5 0l2-2c-1.38-1.38-3.62-1.38-5 0z"/>
      <circle cx="12" cy="21" r="1"/>
    </svg>
  ),

  laundry: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="7" cy="7" r="1"/>
      <circle cx="10" cy="7" r="1"/>
    </svg>
  ),

  heating: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/>
      <path d="M8 19h8"/>
      <path d="M9 21h6"/>
    </svg>
  ),

  // Servicios especiales
  emergency: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
      <circle cx="12" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  trash: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  ),

  rules: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
      <path d="M14 2v6h6"/>
      <path d="M8 16h8"/>
      <path d="M8 12h8"/>
    </svg>
  )
}

// Mapeo de IDs a iconos para compatibilidad
export const zoneIconMapping = {
  // Cocina
  'kitchen': AirbnbZoneIcons.kitchen,
  'cooking': AirbnbZoneIcons.cooking,
  'coffee': AirbnbZoneIcons.coffee,
  'microwave': AirbnbZoneIcons.microwave,
  'refrigerator': AirbnbZoneIcons.kitchen,
  
  // Dormitorio
  'bedroom': AirbnbZoneIcons.bedroom,
  'bed': AirbnbZoneIcons.bedroom,
  'sleeping': AirbnbZoneIcons.bedroom,
  'lighting': AirbnbZoneIcons.lighting,
  'lamp': AirbnbZoneIcons.lighting,
  
  // Baño
  'bathroom': AirbnbZoneIcons.bathroom,
  'shower': AirbnbZoneIcons.shower,
  'bath': AirbnbZoneIcons.bathroom,
  'toilet': AirbnbZoneIcons.bathroom,
  
  // Sala de estar
  'living': AirbnbZoneIcons.living,
  'livingroom': AirbnbZoneIcons.living,
  'sofa': AirbnbZoneIcons.living,
  'tv': AirbnbZoneIcons.tv,
  'entertainment': AirbnbZoneIcons.tv,
  
  // Acceso
  'entrance': AirbnbZoneIcons.entrance,
  'checkin': AirbnbZoneIcons.entrance,
  'door': AirbnbZoneIcons.entrance,
  'keys': AirbnbZoneIcons.keys,
  'key': AirbnbZoneIcons.keys,
  'security': AirbnbZoneIcons.security,
  'lock': AirbnbZoneIcons.security,
  
  // Transporte
  'parking': AirbnbZoneIcons.parking,
  'car': AirbnbZoneIcons.parking,
  'transport': AirbnbZoneIcons.transport,
  'bike': AirbnbZoneIcons.transport,
  
  // Servicios
  'wifi': AirbnbZoneIcons.wifi,
  'internet': AirbnbZoneIcons.wifi,
  'laundry': AirbnbZoneIcons.laundry,
  'washing': AirbnbZoneIcons.laundry,
  'heating': AirbnbZoneIcons.heating,
  'ac': AirbnbZoneIcons.heating,
  'temperature': AirbnbZoneIcons.heating,
  
  // Servicios especiales
  'emergency': AirbnbZoneIcons.emergency,
  'help': AirbnbZoneIcons.emergency,
  'trash': AirbnbZoneIcons.trash,
  'garbage': AirbnbZoneIcons.trash,
  'recycle': AirbnbZoneIcons.trash,
  'rules': AirbnbZoneIcons.rules,
  'info': AirbnbZoneIcons.rules,
  'manual': AirbnbZoneIcons.rules
}

export default AirbnbZoneIcons