'use client'

import React from 'react'

// Airbnb-style minimalist zone icons
export const ZoneIcons = {
  // Essential zones
  wifi: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 18.5c-1.5-2-3-3.5-3-5.5a3 3 0 116 0c0 2-1.5 3.5-3 5.5z" />
      <path d="M8.5 8.5a7.5 7.5 0 1115 0c0 3-2 5-3.5 7.5" />
      <path d="M3.5 8.5a7.5 7.5 0 017.5-7.5" />
    </svg>
  ),
  
  checkIn: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a4 4 0 018 0v4" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  ),
  
  checkOut: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a4 4 0 018 0v4" />
      <path d="M12 14v4" />
      <path d="M9 17l3 3 3-3" />
    </svg>
  ),
  
  directions: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v6" />
      <path d="M12 16l4-4-4-4" />
    </svg>
  ),
  
  info: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" />
    </svg>
  ),
  
  // Amenities
  kitchen: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M3 11h18" />
      <circle cx="8" cy="9" r="0.5" fill="currentColor" />
      <circle cx="12" cy="9" r="0.5" fill="currentColor" />
      <circle cx="16" cy="9" r="0.5" fill="currentColor" />
      <rect x="8" y="14" width="8" height="4" rx="1" />
    </svg>
  ),
  
  washer: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="3" strokeDasharray="2 1" />
      <circle cx="7" cy="6" r="0.5" fill="currentColor" />
      <circle cx="10" cy="6" r="0.5" fill="currentColor" />
    </svg>
  ),
  
  aircon: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="8" width="18" height="6" rx="2" />
      <path d="M6 14v4m0 0l-2 2m2-2l2 2" />
      <path d="M12 14v5" />
      <path d="M18 14v4m0 0l-2 2m2-2l2 2" />
    </svg>
  ),
  
  heating: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2l2 4-2 4 2 4-2 4 2 4" />
      <path d="M8 6l1.5 3-1.5 3 1.5 3-1.5 3" />
      <path d="M16 6l1.5 3-1.5 3 1.5 3-1.5 3" />
    </svg>
  ),
  
  tv: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="2" y="7" width="20" height="12" rx="2" />
      <path d="M7 22h10" />
      <path d="M12 19v3" />
    </svg>
  ),
  
  // Rules & Safety
  rules: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  ),
  
  trash: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6" />
      <circle cx="8" cy="12" r="0.5" fill="currentColor" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
      <circle cx="16" cy="12" r="0.5" fill="currentColor" />
    </svg>
  ),
  
  parking: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 17V7h4a3 3 0 010 6H9" />
    </svg>
  ),
  
  emergency: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8v4" />
      <path d="M8 12h8" />
    </svg>
  ),
  
  phone: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  
  // Local & Experiences
  transport: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="6" width="18" height="10" rx="2" />
      <path d="M8 16v2" />
      <path d="M16 16v2" />
      <circle cx="7" cy="11" r="1" />
      <circle cx="17" cy="11" r="1" />
      <path d="M3 10h18" />
    </svg>
  ),
  
  restaurants: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M3 2v7a3 3 0 006 0V2" />
      <path d="M6 2v20" />
      <path d="M21 2v10a5 5 0 01-5 5v5" />
    </svg>
  ),
  
  shopping: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" />
      <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  
  beach: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2C7 2 3 6 3 11c0 4 3 7 5 9 1 1 2 2 4 2s3-1 4-2c2-2 5-5 5-9 0-5-4-9-9-9z" />
      <path d="M12 2v20" />
      <path d="M12 8c-2 0-4 1-4 3s2 3 4 3" />
    </svg>
  ),
  
  tourism: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 22s-8-4-8-11a8 8 0 0116 0c0 7-8 11-8 11z" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  )
}

// Helper function to get icon component
export function getZoneIcon(iconId: string) {
  const iconMap: Record<string, keyof typeof ZoneIcons> = {
    'wifi': 'wifi',
    'wi-fi': 'wifi',
    'internet': 'wifi',
    'door': 'checkIn',
    'check-in': 'checkIn',
    'entrada': 'checkIn',
    'exit': 'checkOut',
    'check-out': 'checkOut',
    'salida': 'checkOut',
    'map-pin': 'directions',
    'location': 'directions',
    'navigation': 'directions',
    'info': 'info',
    'information': 'info',
    'kitchen': 'kitchen',
    'cocina': 'kitchen',
    'vitroceramica': 'kitchen',
    'washing': 'washer',
    'lavadora': 'washer',
    'washing-machine': 'washer',
    'thermometer': 'aircon',
    'air-conditioning': 'aircon',
    'climatizacion': 'aircon',
    'heating': 'heating',
    'calefaccion': 'heating',
    'tv': 'tv',
    'television': 'tv',
    'list': 'rules',
    'rules': 'rules',
    'normas': 'rules',
    'trash': 'trash',
    'basura': 'trash',
    'reciclaje': 'trash',
    'car': 'parking',
    'parking': 'parking',
    'aparcamiento': 'parking',
    'phone': 'phone',
    'telefono': 'phone',
    'contacto': 'phone',
    'emergency': 'emergency',
    'emergencia': 'emergency',
    'bus': 'transport',
    'transport': 'transport',
    'transporte': 'transport',
    'utensils': 'restaurants',
    'restaurant': 'restaurants',
    'restaurantes': 'restaurants',
    'shopping-bag': 'shopping',
    'shopping': 'shopping',
    'compras': 'shopping',
    'sun': 'beach',
    'beach': 'beach',
    'playa': 'beach',
    'camera': 'tourism',
    'tourism': 'tourism',
    'turismo': 'tourism'
  }
  
  const iconKey = iconMap[iconId.toLowerCase()] || 'info'
  return ZoneIcons[iconKey] || ZoneIcons.info
}