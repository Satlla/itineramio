import React from 'react'
import { 
  // Essential icons
  Key,
  DoorOpen,
  Wifi,
  Car,
  Navigation,
  Info,
  
  // Amenities icons
  Thermometer,
  Wind,
  Shirt as WashingMachine,
  Tv,
  Coffee,
  ChefHat,
  Microwave,
  Flame,
  
  // Rules icons
  ScrollText,
  VolumeX,
  CigaretteOff,
  PawPrint,
  Recycle,
  
  // Local icons
  Train,
  ShoppingCart,
  UtensilsCrossed,
  Pill,
  Landmark,
  
  // Savings icons
  Ticket,
  PiggyBank,
  Tag,
  
  // Emergency icons
  AlertTriangle,
  Heart,
  Zap,
  Droplets,
  
  // Generic icons
  Circle,
  LucideIcon
} from 'lucide-react'

// Icon mapping for zone templates
export const zoneIconMap: Record<string, LucideIcon> = {
  // Essential
  'key': Key,
  'door-exit': DoorOpen,
  'wifi': Wifi,
  'car': Car,
  'navigation': Navigation,
  'info': Info,
  
  // Amenities
  'thermometer': Thermometer,
  'wind': Wind,
  'washing-machine': WashingMachine,
  'dishwasher': ChefHat, // Using ChefHat as placeholder
  'coffee': Coffee,
  'tv': Tv,
  'oven': Flame,
  'microwave': Microwave,
  'cooktop': Flame,
  
  // Rules
  'rules': ScrollText,
  'volume-off': VolumeX,
  'smoking': CigaretteOff,
  'pet': PawPrint,
  'recycle': Recycle,
  
  // Local
  'train': Train,
  'shopping-cart': ShoppingCart,
  'restaurant': UtensilsCrossed,
  'medical': Pill,
  'landmark': Landmark,
  
  // Savings
  'ticket': Ticket,
  'piggy-bank': PiggyBank,
  'discount': Tag,
  
  // Emergency
  'emergency': AlertTriangle,
  'first-aid': Heart,
  'electrical': Zap,
  'water-off': Droplets,
}

// Get icon component by ID
export function getZoneIcon(iconId: string): LucideIcon {
  return zoneIconMap[iconId] || Circle
}

// Render zone icon with consistent styling
export function ZoneIcon({ 
  iconId, 
  className = "w-5 h-5",
  strokeWidth = 1.5 
}: { 
  iconId: string
  className?: string
  strokeWidth?: number
}) {
  const IconComponent = getZoneIcon(iconId)
  
  return (
    <IconComponent 
      className={className} 
      strokeWidth={strokeWidth}
    />
  )
}