import { 
  Wifi, 
  Key, 
  Car, 
  Utensils, 
  Bath, 
  Bed, 
  Home, 
  MapPin,
  Phone,
  Info,
  DoorOpen,
  DoorClosed,
  Sparkles,
  Coffee,
  Tv,
  Sofa,
  Thermometer,
  Volume2,
  Calendar,
  Clock,
  AlertTriangle,
  Heart,
  Star,
  Shield,
  Users,
  Baby,
  Dog,
  TreePine,
  Umbrella,
  Sun,
  Moon,
  Lightbulb,
  Trash2,
  Recycle,
  WashingMachine,
  ShoppingBag,
  Bus,
  Train,
  Plane,
  Anchor,
  Mountain,
  Waves,
  Flower2,
  Cigarette,
  Wine,
  Music,
  Dumbbell,
  Book,
  Gamepad2,
  Camera,
  Package,
  Gift,
  CreditCard,
  Banknote,
  HelpCircle,
  Settings,
  Zap,
  Building,
  ParkingCircle,
  Navigation,
  Compass,
  Map,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Mail,
  MessageSquare,
  Bell,
  LucideIcon
} from 'lucide-react'

// Extended icon mapping for all possible zone types
export const extendedZoneIconMap: { [key: string]: LucideIcon } = {
  // Essential zones
  '📶': Wifi,
  '🔑': Key,
  '🚪': DoorOpen,
  '🚗': Car,
  'ℹ️': Info,
  '📞': Phone,
  
  // Check-in/out
  '🔓': DoorOpen,
  '🔒': DoorClosed,
  '✅': CheckCircle,
  '⏰': Clock,
  '📅': Calendar,
  
  // Amenities
  '🍽️': Utensils,
  '☕': Coffee,
  '🛁': Bath,
  '🚿': Bath,
  '🛏️': Bed,
  '🛋️': Sofa,
  '📺': Tv,
  '🌡️': Thermometer,
  '🔊': Volume2,
  '💡': Lightbulb,
  '🧺': WashingMachine,
  
  // Location
  '🏠': Home,
  '📍': MapPin,
  '🗺️': Map,
  '🧭': Compass,
  '🚏': Bus,
  '🚂': Train,
  '✈️': Plane,
  '⚓': Anchor,
  '🏔️': Mountain,
  '🌊': Waves,
  
  // Rules & Safety
  '⚠️': AlertTriangle,
  '🚭': Cigarette,
  '🍷': Wine,
  '🎵': Music,
  '👶': Baby,
  '🐕': Dog,
  '🛡️': Shield,
  '⛔': XCircle,
  
  // Services
  '🛒': ShoppingBag,
  '💳': CreditCard,
  '💵': Banknote,
  '🎁': Gift,
  '📦': Package,
  '📷': Camera,
  
  // Recreation
  '🏋️': Dumbbell,
  '📚': Book,
  '🎮': Gamepad2,
  '🌳': TreePine,
  '☂️': Umbrella,
  '☀️': Sun,
  '🌙': Moon,
  
  // Utilities
  '🗑️': Trash2,
  '♻️': Recycle,
  '⚡': Zap,
  '⚙️': Settings,
  '❓': HelpCircle,
  '📧': Mail,
  '💬': MessageSquare,
  '🔔': Bell,
  
  // Navigation
  '➡️': ChevronRight,
  '🧳': Package,
  '🏢': Building,
  '🅿️': ParkingCircle,
  '📡': Navigation,
  
  // Status
  '✨': Sparkles,
  '⭐': Star,
  '❤️': Heart,
  '⏱️': Timer,
  'ℹ': Info,
  '❗': AlertCircle,
  
  // Default fallbacks
  '🏡': Home,
  '🔷': Home,
  '🔶': Info,
  '🟦': Info,
  '🟨': AlertTriangle,
  '🟩': CheckCircle,
  '🟥': XCircle
}

// Function to get icon or fallback
export function getZoneIcon(emoji: string): LucideIcon {
  return extendedZoneIconMap[emoji] || Home
}

// Common zone types with their default icons
export const commonZoneIcons = {
  'wifi': Wifi,
  'checkin': DoorOpen,
  'checkout': DoorClosed,
  'check-in': DoorOpen,
  'check-out': DoorClosed,
  'keys': Key,
  'parking': Car,
  'info': Info,
  'information': Info,
  'kitchen': Utensils,
  'bathroom': Bath,
  'bedroom': Bed,
  'living': Sofa,
  'livingroom': Sofa,
  'terrace': Sun,
  'garden': TreePine,
  'pool': Waves,
  'rules': AlertTriangle,
  'emergency': Phone,
  'contacts': Phone,
  'transport': Bus,
  'location': MapPin,
  'amenities': Star,
  'services': CreditCard,
  'trash': Trash2,
  'recycling': Recycle,
  'laundry': WashingMachine,
  'heating': Thermometer,
  'ac': Thermometer,
  'air': Thermometer,
  'tv': Tv,
  'entertainment': Tv,
  'safety': Shield,
  'security': Shield,
  'pets': Dog,
  'smoking': Cigarette,
  'noise': Volume2,
  'children': Baby,
  'gym': Dumbbell,
  'spa': Heart,
  'restaurant': Utensils,
  'bar': Wine,
  'shop': ShoppingBag,
  'market': ShoppingBag,
  'bus': Bus,
  'train': Train,
  'metro': Train,
  'airport': Plane,
  'beach': Waves,
  'mountain': Mountain,
  'forest': TreePine,
  'city': Building,
  'downtown': Building,
  'help': HelpCircle,
  'faq': HelpCircle,
  'contact': Mail,
  'phone': Phone,
  'email': Mail,
  'message': MessageSquare,
  'notification': Bell,
  'settings': Settings,
  'general': Home,
  'other': Info,
  'more': ChevronRight
}

// Function to get icon by zone name
export function getZoneIconByName(name: string): LucideIcon {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '')
  
  // Check common zone names first
  for (const [key, icon] of Object.entries(commonZoneIcons)) {
    if (normalized.includes(key)) {
      return icon
    }
  }
  
  // Default to Home icon
  return Home
}