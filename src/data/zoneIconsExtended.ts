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
  Package,
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
  FileText,
  ChefHat,
  ShowerHead,
  Microwave,
  Snowflake,
  Wind,
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
  '🧺': Package,
  
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

// Icon ID mappings (used in database - MUST match what ElementSelector/ZoneIconDisplay use)
export const iconIdMapping: { [key: string]: LucideIcon } = {
  // Essential icons stored in DB
  'wifi': Wifi,
  'key': Key,
  'exit': DoorClosed,
  'door': DoorOpen,
  'door-exit': DoorClosed,
  'car': Car,
  'kitchen': ChefHat,
  'kitchen-main': ChefHat,
  'thermometer': Thermometer,
  'phone': Phone,
  'map-pin': MapPin,
  'navigation': Navigation,
  'info': Info,
  'home': Home,
  'bath': Bath,
  'bed': Bed,
  'tv': Tv,
  'washing': Package,
  'washing-machine': Package,
  'dishwasher': ChefHat,
  'coffee': Coffee,
  'oven': Microwave,
  'microwave': Microwave,
  'cooktop': ChefHat,
  'cooking': ChefHat,
  'wind': Wind,
  'rules': FileText,
  'volume-off': Volume2,
  'smoking': Cigarette,
  'pet': Dog,
  'recycle': Recycle,
  'train': Train,
  'shopping-cart': ShoppingBag,
  'beach': Waves,
  'pool': Waves,
  'waves': Waves,
  'gym': Dumbbell,
  'alarm': Phone,
  'emergency': Phone,
  'entrance': DoorOpen,
  'parking': ParkingCircle,
  'heating': Thermometer,
  'ac': Snowflake,
  'refrigerator': Package,
  'laundry': Package,
  'living': Sofa,
  'sofa': Sofa,
  'bedroom': Bed,
  'bathroom': ShowerHead,
  'shower': ShowerHead,
  'security': Shield,
  'keys': Key,
  'transport': Bus,
  'flower': Flower2,
  'trees': TreePine,
  'mountain': Mountain,
  'utensils': Utensils,
  'list': FileText,
  'trash': Trash2,
  'package': Package,
  'entertainment': Tv,
  // Airbnb style icon IDs
  'door-open': DoorOpen,
  'door-closed': DoorClosed
}

// Common zone types with their default icons - IMPROVED MAPPING
export const commonZoneIcons: { [key: string]: LucideIcon } = {
  // Check-in / Check-out (más específicos)
  'check in': Key,
  'check-in': Key,
  'checkin': Key,
  'entrada': Key,
  'llegada': Key,
  'arrival': Key,
  'acceso': Key,
  'llaves': Key,
  'keys': Key,
  
  'check out': DoorClosed,
  'check-out': DoorClosed,
  'checkout': DoorClosed,
  'salida': DoorClosed,
  'departure': DoorClosed,
  
  // WiFi / Internet
  'wifi': Wifi,
  'wi-fi': Wifi,
  'internet': Wifi,
  'conexion': Wifi,
  'conexión': Wifi,
  'password': Wifi,
  'contraseña': Wifi,
  
  // Parking específico
  'parking': ParkingCircle,
  'aparcamiento': ParkingCircle,
  'garaje': ParkingCircle,
  'garage': ParkingCircle,
  'coche': Car,
  'auto': Car,
  'vehiculo': Car,
  
  // Información básica
  'info': Info,
  'information': Info,
  'informacion': Info,
  'basica': Info,
  'basic': Info,
  'apartamento': Home,
  'apartment': Home,
  'documento': FileText,
  'document': FileText,
  'manual': Book,
  'guia': Book,
  'guide': Book,
  'instrucciones': FileText,
  'instructions': FileText,
  'detalles': Info,
  'details': Info,
  'importante': AlertCircle,
  'important': AlertCircle,
  'bienvenida': Heart,
  'welcome': Heart,
  // Cocina con icono específico
  'kitchen': ChefHat,
  'cocina': ChefHat,
  'comida': Utensils,
  'food': Utensils,
  'restaurante': Utensils,
  'electrodomesticos': Microwave,
  
  // Baño con icono específico  
  'bathroom': ShowerHead,
  'baño': ShowerHead,
  'aseo': Bath,
  'ducha': ShowerHead,
  'shower': ShowerHead,
  'wc': Bath,
  
  // Dormitorio
  'bedroom': Bed,
  'dormitorio': Bed,
  'habitacion': Bed,
  'habitación': Bed,
  'room': Bed,
  'cuarto': Bed,
  
  // Sala de estar
  'living': Sofa,
  'livingroom': Sofa,
  'salon': Sofa,
  'sala': Sofa,
  'terrace': Sun,
  'terraza': Sun,
  'balcon': Sun,
  'balcony': Sun,
  'garden': TreePine,
  'jardin': TreePine,
  'pool': Waves,
  'piscina': Waves,
  'emergencia': Phone,
  'contacts': Phone,
  'contactos': Phone,
  'transport': Bus,
  'transporte': Bus,
  'location': MapPin,
  'ubicacion': MapPin,
  'direccion': MapPin,
  'address': MapPin,
  'amenities': Star,
  'comodidades': Star,
  'servicios': CreditCard,
  'services': CreditCard,
  'trash': Trash2,
  'basura': Trash2,
  'residuos': Trash2,
  'recycling': Recycle,
  'reciclaje': Recycle,
  'laundry': Package,
  'lavanderia': Package,
  'lavadora': Package,
  // Climatización con iconos más específicos
  'heating': Thermometer,
  'calefaccion': Thermometer,
  'calefacción': Thermometer,
  'ac': Snowflake,
  'aire': Snowflake,
  'aire acondicionado': Snowflake,
  'acondicionado': Snowflake,
  'climatizacion': Wind,
  'climatización': Wind,
  'clima': Wind,
  'tv': Tv,
  'television': Tv,
  'entretenimiento': Tv,
  'entertainment': Tv,
  'safety': Shield,
  'seguridad': Shield,
  'security': Shield,
  'pets': Dog,
  'mascotas': Dog,
  'animales': Dog,
  'smoking': Cigarette,
  'fumar': Cigarette,
  'tabaco': Cigarette,
  'noise': Volume2,
  'ruido': Volume2,
  'sonido': Volume2,
  'children': Baby,
  'niños': Baby,
  'bebes': Baby,
  'gym': Dumbbell,
  'gimnasio': Dumbbell,
  'ejercicio': Dumbbell,
  'spa': Heart,
  'relajacion': Heart,
  'restaurant': Utensils,
  'bar': Wine,
  'bebidas': Wine,
  'shop': ShoppingBag,
  'tienda': ShoppingBag,
  'compras': ShoppingBag,
  'market': ShoppingBag,
  'mercado': ShoppingBag,
  'bus': Bus,
  'autobus': Bus,
  'train': Train,
  'tren': Train,
  'metro': Train,
  'airport': Plane,
  'aeropuerto': Plane,
  'beach': Waves,
  'playa': Waves,
  'mountain': Mountain,
  'montaña': Mountain,
  'forest': TreePine,
  'bosque': TreePine,
  'city': Building,
  'ciudad': Building,
  'downtown': Building,
  'centro': Building,
  'help': HelpCircle,
  'ayuda': HelpCircle,
  'faq': HelpCircle,
  'preguntas': HelpCircle,
  'contact': Mail,
  'contacto': Mail,
  'phone': Phone,
  'telefono': Phone,
  'email': Mail,
  'correo': Mail,
  'message': MessageSquare,
  'mensaje': MessageSquare,
  'notification': Bell,
  'notificacion': Bell,
  'settings': Settings,
  'configuracion': Settings,
  'ajustes': Settings,
  'general': Home,
  'other': Info,
  'otro': Info,
  'otros': Info,
  'more': ChevronRight,
  'mas': ChevronRight,
  // Emergencias con iconos más específicos
  'emergencias': Phone,
  'emergency': Phone,
  'emergency contacts': Phone,
  'contactos emergencia': Phone,
  'telefonos emergencia': Phone,
  'emergency phones': Phone,
  
  // Normas con icono de lista
  'normas': FileText,
  'normas casa': FileText,
  'normas de la casa': FileText,
  'house rules': FileText,
  'reglas': FileText,
  'reglas casa': FileText,
  'rules': FileText,
  'recomendaciones': Star,
  'recommendations': Star,
  'llegar': MapPin,
  'como llegar': MapPin,
  'directions': MapPin,
  'housrules': AlertTriangle,
  'telefonos': Phone
}

// Function to get icon by zone name or icon ID - IMPROVED VERSION
export function getZoneIconByName(name: string): LucideIcon {
  const normalizedName = name.toLowerCase().trim()

  // FIRST: Try direct iconId mapping (for icons stored in database)
  if (iconIdMapping[normalizedName]) {
    return iconIdMapping[normalizedName]
  }

  // Then try exact match in common zone names
  if (commonZoneIcons[normalizedName]) {
    return commonZoneIcons[normalizedName]
  }
  
  // Try exact match but with common variations
  const variations = [
    normalizedName,
    normalizedName.replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n'),
    normalizedName.replace(/\s+/g, ''),
    normalizedName.replace(/\s+/g, '-'),
    normalizedName.replace(/-/g, ' ')
  ]
  
  for (const variation of variations) {
    if (commonZoneIcons[variation]) {
      return commonZoneIcons[variation]
    }
  }
  
  // Smart matching - check if the name contains specific keywords (order matters)
  const smartMatches = [
    // Most specific first
    { keywords: ['check in', 'checkin', 'entrada', 'llegada', 'llaves', 'acceso'], icon: Key },
    { keywords: ['check out', 'checkout', 'salida'], icon: DoorClosed },
    { keywords: ['wifi', 'internet', 'conexion', 'contraseña'], icon: Wifi },
    { keywords: ['parking', 'aparcamiento', 'garaje'], icon: ParkingCircle },
    { keywords: ['cocina', 'kitchen'], icon: ChefHat },
    { keywords: ['baño', 'bathroom', 'ducha', 'shower'], icon: ShowerHead },
    { keywords: ['aire', 'climatizacion', 'ac'], icon: Snowflake },
    { keywords: ['calefaccion', 'heating'], icon: Thermometer },
    { keywords: ['emergencias', 'emergency'], icon: Phone },
    { keywords: ['normas', 'rules', 'reglas'], icon: FileText },
    { keywords: ['dormitorio', 'bedroom', 'habitacion'], icon: Bed },
    { keywords: ['salon', 'living', 'sala'], icon: Sofa },
    { keywords: ['basura', 'trash'], icon: Trash2 },
    { keywords: ['lavadora', 'laundry'], icon: Package },
    { keywords: ['transporte', 'transport'], icon: Bus },
    { keywords: ['recomendaciones', 'recommendations'], icon: Star }
  ]
  
  for (const match of smartMatches) {
    if (match.keywords.some(keyword => normalizedName.includes(keyword))) {
      return match.icon
    }
  }
  
  // Default to Info for informational zones
  if (normalizedName.includes('info') || normalizedName.includes('informacion') || normalizedName.includes('importante')) {
    return Info
  }
  
  // Default to Home icon
  return Home
}