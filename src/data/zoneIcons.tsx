import React from 'react'
import { 
  ChefHat, 
  Utensils, 
  Coffee, 
  Microwave,
  Bed, 
  Lamp, 
  Fan,
  Bath, 
  ShowerHead as Shower, 
  Droplets,
  Sofa, 
  Tv, 
  Volume2,
  DoorOpen, 
  Key, 
  Shield,
  Trees, 
  Car, 
  Bike,
  Shirt as Washing, 
  Zap, 
  Refrigerator,
  Wifi, 
  Phone, 
  MapPin,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Lock,
  Camera,
  Lightbulb,
  Radio,
  Gamepad2,
  Book,
  Wine,
  UtensilsCrossed,
  Armchair,
  Shirt,
  Scissors,
  Flower,
  Waves,
  Mountain,
  Building,
  Home,
  Archive,
  Package,
  Settings,
  Wrench,
  HardHat,
  Gauge,
  Battery,
  PlugZap,
  Flame,
  Snowflake,
  Umbrella,
  Cloud,
  CloudRain,
  Timer,
  Clock,
  Calendar,
  Bell,
  BellOff,
  AlertTriangle,
  Info,
  HelpCircle,
  FileText,
  ClipboardList,
  CheckCircle,
  XCircle,
  Trash2,
  Recycle,
  Heart,
  Star,
  Flag,
  Bookmark,
  Tag,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Wallet,
  DollarSign,
  Euro,
  Banknote,
  Receipt,
  Calculator,
  Briefcase,
  Folder,
  FolderOpen,
  Inbox,
  Send,
  Mail,
  MessageSquare,
  MessagesSquare,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Music,
  Film,
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Disc,
  Album,
  Image,
  // Additional icons that exist in lucide-react
  Apple,
  Circle,
  QrCode,
  Fingerprint,
  Users,
  Monitor,
  Laptop,
  Tablet,
  Router,
  Satellite,
  HardDrive,
  // Travel and vacation icons
  Plane,
  Luggage,
  Briefcase as Suitcase,
  FileText as Passport,  
  Globe,
  Compass,
  Map,
  Camera as PhotoCamera,
  Ship,
  Zap as Train,
  Car as Bus,
  Car as Taxi,
  Circle as ParkingCircle,
  Navigation,
  Building as Hotel,
  Trees as PalmTree,
  Umbrella as Beach,
  CloudSun,
  CloudSnow,
  Sun as Sunset,
  Sun as Sunrise,
  // House and room icons
  DoorOpen as Door,
  DoorOpen as DoorClosed,
  Package as Window,
  Package as Blinds,
  Package as Balcony,
  Package as Stairs,
  Package as Elevator,
  // Appliances and amenities
  Coffee as CoffeeCup,
  Package as Oven,
  Package as Dishwasher,
  Snowflake as Freezer,
  Flame as Heater,
  Wind as AirVent,
  Printer,
  Package as Iron,
  Lock as Safe,
  CreditCard as AccessCard,
  // Aliased icons for non-existent ones
  Flame as Pizza, // Using Flame instead of Pizza for oven
  Coffee as Soup, // Using Coffee instead of Soup for hot beverages
  Package as Beef, // Using Package instead of Beef for food items
  Waves as Fish, // Using Waves instead of Fish for sea/water
  Coffee as Beer, // Using Coffee instead of Beer for beverages
  Wine as Bottle, // Using Wine instead of Bottle
  Coffee as Tea, // Using Coffee instead of Tea
  Bed as BedDouble, // Using Bed instead of BedDouble
  Bed as BedSingle, // Using Bed instead of BedSingle
  Package as Pillow, // Using Package instead of Pillow
  Armchair as Chair, // Using Armchair instead of Chair
  Archive as Desk, // Using Archive instead of Desk
  Flame as Candle, // Using Flame instead of Candle
  Lightbulb as Flashlight, // Using Lightbulb instead of Flashlight
  Clock as AlarmClock, // Using Clock instead of AlarmClock
  Heart as Stethoscope, // Using Heart instead of Stethoscope for medical
  Circle as Pill, // Using Circle instead of Pill
  Archive as Table, // Using Archive instead of Table
  Camera as Projector, // Using Camera instead of Projector
  Gamepad2 as Joystick, // Using Gamepad2 instead of Joystick
  Book as Library, // Using Book instead of Library
  FileText as Newspaper, // Using FileText instead of Newspaper
  Users as Accessibility, // Using Users instead of Accessibility
  Trees as Palmtree, // Using Trees instead of Palmtree
  Flower as Cactus, // Using Flower instead of Cactus
  Mountain as Tent, // Using Mountain instead of Tent
  Flame as Campfire, // Using Flame instead of Campfire
  Shield as Fence, // Using Shield instead of Fence
  Car as Sailboat, // Using Car instead of Sailboat
  Phone as Smartphone, // Using Phone instead of Smartphone
  Radio as SatelliteIcon, // Using Radio instead of Satellite
  Building as Construction, // Using Building instead of Construction
  Wrench as Hammer, // Using Wrench instead of Hammer
  Circle as Dice1, // Using Circle instead of Dice1
  Star as Trophy, // Using Star instead of Trophy
  Package as Gift, // Using Package instead of Gift
  Star as PartyPopper, // Using Star instead of PartyPopper
  Heart as Dumbbell, // Using Heart instead of Dumbbell
  Star as Sparkles, // Using Star instead of Sparkles
  Circle as Brain, // Using Circle instead of Brain
  FileText as Pen, // Using FileText instead of Pen
  Heart as Dog, // Using Heart instead of Dog
  Heart as Cat, // Using Heart instead of Cat
  Flower as Bird, // Using Flower instead of Bird
  Flower as Rabbit, // Using Flower instead of Rabbit
  Waves as FishIcon // Using Waves instead of FishIcon
} from 'lucide-react'
import { ZoneIcon } from '@/types/zones'

export const ZONE_ICONS: ZoneIcon[] = [
  // Cocina
  {
    id: 'kitchen-main',
    name: 'Cocina',
    icon: ChefHat,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'utensils',
    name: 'Utensilios',
    icon: Utensils,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'utensils-crossed',
    name: 'Cubiertos',
    icon: UtensilsCrossed,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'coffee',
    name: 'Cafetera',
    icon: Coffee,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'microwave',
    name: 'Microondas',
    icon: Microwave,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'refrigerator',
    name: 'Refrigerador',
    icon: Refrigerator,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'wine',
    name: 'Vinoteca',
    icon: Wine,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },

  // Dormitorio
  {
    id: 'bed',
    name: 'Cama',
    icon: Bed,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'lamp',
    name: 'Lámpara',
    icon: Lamp,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'lightbulb',
    name: 'Iluminación',
    icon: Lightbulb,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'fan',
    name: 'Ventilador',
    icon: Fan,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'armchair',
    name: 'Sillón',
    icon: Armchair,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'shirt',
    name: 'Armario',
    icon: Shirt,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },

  // Baño
  {
    id: 'bath',
    name: 'Bañera',
    icon: Bath,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },
  {
    id: 'shower',
    name: 'Ducha',
    icon: Shower,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },
  {
    id: 'droplets',
    name: 'Toallas',
    icon: Droplets,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },
  {
    id: 'toilet',
    name: 'Inodoro',
    icon: Bath, // Using Bath as placeholder for toilet
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },
  {
    id: 'scissors',
    name: 'Secador',
    icon: Scissors,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },

  // Sala de estar
  {
    id: 'sofa',
    name: 'Sofá',
    icon: Sofa,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'tv',
    name: 'Televisión',
    icon: Tv,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'volume',
    name: 'Sistema de sonido',
    icon: Volume2,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'radio',
    name: 'Radio',
    icon: Radio,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'gamepad',
    name: 'Videojuegos',
    icon: Gamepad2,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'book',
    name: 'Biblioteca',
    icon: Book,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },

  // Acceso y seguridad
  {
    id: 'door',
    name: 'Puerta principal',
    icon: DoorOpen,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'key',
    name: 'Llaves',
    icon: Key,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'shield',
    name: 'Alarma',
    icon: Shield,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'camera',
    name: 'Cámaras',
    icon: Camera,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'lock',
    name: 'Caja fuerte',
    icon: Lock,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },

  // Exterior
  {
    id: 'trees',
    name: 'Jardín',
    icon: Trees,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'car',
    name: 'Parking',
    icon: Car,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'bike',
    name: 'Bicicletas',
    icon: Bike,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'flower',
    name: 'Terraza',
    icon: Flower,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'waves',
    name: 'Piscina',
    icon: Waves,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'mountain',
    name: 'Barbacoa',
    icon: Mountain,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'building',
    name: 'Trastero',
    icon: Building,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },

  // Servicios
  {
    id: 'washing',
    name: 'Lavadora',
    icon: Washing,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'wifi',
    name: 'WiFi',
    icon: Wifi,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'thermometer',
    name: 'Calefacción',
    icon: Thermometer,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'sun',
    name: 'Persianas',
    icon: Sun,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'moon',
    name: 'Cortinas',
    icon: Moon,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'wind',
    name: 'Aire acondicionado',
    icon: Wind,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'zap',
    name: 'Cuadro eléctrico',
    icon: Zap,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },

  // Información general
  {
    id: 'info',
    name: 'Información',
    icon: Info,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'phone',
    name: 'Contactos',
    icon: Phone,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'location',
    name: 'Ubicación',
    icon: MapPin,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'archive',
    name: 'Documentos',
    icon: Archive,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'package',
    name: 'Suministros',
    icon: Package,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'settings',
    name: 'Normas',
    icon: Settings,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },

  // Special/Custom icons
  {
    id: 'pizza',
    name: 'Horno',
    icon: Pizza,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'soup',
    name: 'Sopa',
    icon: Soup,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'beef',
    name: 'Carne',
    icon: Beef,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'fish',
    name: 'Pescado',
    icon: Fish,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'beer',
    name: 'Cerveza',
    icon: Beer,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'bottle',
    name: 'Bebidas',
    icon: Bottle,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'tea',
    name: 'Té',
    icon: Tea,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'bed-double',
    name: 'Cama doble',
    icon: BedDouble,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'bed-single',
    name: 'Cama individual',
    icon: BedSingle,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'pillow',
    name: 'Almohadas',
    icon: Pillow,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'chair',
    name: 'Silla',
    icon: Chair,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'desk',
    name: 'Escritorio',
    icon: Desk,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'candle',
    name: 'Velas',
    icon: Candle,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'flashlight',
    name: 'Linterna',
    icon: Flashlight,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'alarm-clock',
    name: 'Despertador',
    icon: AlarmClock,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'stethoscope',
    name: 'Botiquín',
    icon: Stethoscope,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },
  {
    id: 'pill',
    name: 'Medicamentos',
    icon: Pill,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },
  {
    id: 'table',
    name: 'Mesa',
    icon: Table,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'projector',
    name: 'Proyector',
    icon: Projector,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'joystick',
    name: 'Mando',
    icon: Joystick,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'library',
    name: 'Librería',
    icon: Library,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'newspaper',
    name: 'Revistas',
    icon: Newspaper,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'accessibility',
    name: 'Accesibilidad',
    icon: Accessibility,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'palmtree',
    name: 'Zona tropical',
    icon: Palmtree,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'cactus',
    name: 'Plantas',
    icon: Cactus,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'tent',
    name: 'Zona camping',
    icon: Tent,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'campfire',
    name: 'Fogata',
    icon: Campfire,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'fence',
    name: 'Valla',
    icon: Fence,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'sailboat',
    name: 'Embarcadero',
    icon: Sailboat,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'sunrise',
    name: 'Amanecer',
    icon: Sunrise,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    icon: Sunset,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'printer',
    name: 'Impresora',
    icon: Printer,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    icon: Smartphone,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'satellite',
    name: 'Satélite',
    icon: SatelliteIcon,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'construction',
    name: 'Construcción',
    icon: Construction,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'hammer',
    name: 'Herramientas',
    icon: Hammer,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'dice1',
    name: 'Juegos',
    icon: Dice1,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'trophy',
    name: 'Trofeos',
    icon: Trophy,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'gift',
    name: 'Regalos',
    icon: Gift,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'party-popper',
    name: 'Fiestas',
    icon: PartyPopper,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'dumbbell',
    name: 'Gimnasio',
    icon: Dumbbell,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'sparkles',
    name: 'Limpieza',
    icon: Sparkles,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'brain',
    name: 'Zona estudio',
    icon: Brain,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'pen',
    name: 'Material oficina',
    icon: Pen,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'dog',
    name: 'Mascotas',
    icon: Dog,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'cat',
    name: 'Gatos',
    icon: Cat,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'bird',
    name: 'Pájaros',
    icon: Bird,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'rabbit',
    name: 'Conejos',
    icon: Rabbit,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'fish-icon',
    name: 'Acuario',
    icon: FishIcon,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  
  // Additional commonly used icons
  {
    id: 'template',
    name: 'Plantilla',
    icon: FileText,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'kitchen',
    name: 'Cocina General',
    icon: ChefHat,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'bathroom',
    name: 'Baño General',
    icon: Bath,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },
  {
    id: 'bedroom',
    name: 'Dormitorio General',
    icon: Bed,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'ac',
    name: 'Aire Acondicionado',
    icon: Wind,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'parking',
    name: 'Parking',
    icon: Car,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'checkin',
    name: 'Check-in',
    icon: DoorOpen,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkout',
    name: 'Check-out',
    icon: DoorOpen,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'laundry',
    name: 'Lavandería',
    icon: Shirt,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },

  // =================== TRAVEL & VACATION ICONS ===================
  {
    id: 'travel-plane',
    name: 'Avión',
    icon: Plane,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-luggage',
    name: 'Equipaje',
    icon: Luggage,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-suitcase',
    name: 'Maleta',
    icon: Suitcase,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-passport',
    name: 'Pasaporte',
    icon: Passport,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-globe',
    name: 'Mundo',
    icon: Globe,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-compass',
    name: 'Brújula',
    icon: Compass,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-map',
    name: 'Mapa',
    icon: Map,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-camera',
    name: 'Cámara de Fotos',
    icon: PhotoCamera,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-ship',
    name: 'Barco',
    icon: Ship,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-train',
    name: 'Tren',
    icon: Train,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-bus',
    name: 'Autobús',
    icon: Bus,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-taxi',
    name: 'Taxi',
    icon: Taxi,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-parking',
    name: 'Parking',
    icon: ParkingCircle,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-navigation',
    name: 'Navegación',
    icon: Navigation,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'travel-hotel',
    name: 'Hotel',
    icon: Hotel,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },

  // =================== NATURE & WEATHER ICONS ===================
  {
    id: 'nature-sun',
    name: 'Sol',
    icon: Sun,
    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'nature-palm',
    name: 'Palmera',
    icon: PalmTree,
    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'nature-beach',
    name: 'Playa',
    icon: Beach,
    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'nature-cloudsun',
    name: 'Parcialmente Nublado',
    icon: CloudSun,
    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'nature-cloudsnow',
    name: 'Nieve',
    icon: CloudSnow,
    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'nature-sunset',
    name: 'Atardecer',
    icon: Sunset,
    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'nature-sunrise',
    name: 'Amanecer',
    icon: Sunrise,
    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },

  // =================== HOUSE & ACCESS ICONS ===================
  {
    id: 'house-door',
    name: 'Puerta',
    icon: Door,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'house-door-closed',
    name: 'Puerta Cerrada',
    icon: DoorClosed,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'house-window',
    name: 'Ventana',
    icon: Window,
    category: { id: 'general', name: 'General', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'house-blinds',
    name: 'Persianas',
    icon: Blinds,
    category: { id: 'general', name: 'General', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'house-balcony',
    name: 'Balcón',
    icon: Balcony,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'house-stairs',
    name: 'Escaleras',
    icon: Stairs,
    category: { id: 'general', name: 'General', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'house-elevator',
    name: 'Ascensor',
    icon: Elevator,
    category: { id: 'general', name: 'General', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'house-keys',
    name: 'Llaves',
    icon: Key,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },

  // =================== APPLIANCES & AMENITIES ===================
  {
    id: 'appliance-coffee',
    name: 'Café',
    icon: CoffeCup,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'appliance-oven',
    name: 'Horno',
    icon: Oven,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'appliance-dishwasher',
    name: 'Lavavajillas',
    icon: Dishwasher,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'appliance-freezer',
    name: 'Congelador',
    icon: Freezer,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'appliance-heater',
    name: 'Calefactor',
    icon: Heater,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'appliance-airvent',
    name: 'Ventilación',
    icon: AirVent,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'appliance-printer',
    name: 'Impresora',
    icon: Printer,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'appliance-iron',
    name: 'Plancha',
    icon: Iron,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'appliance-safe',
    name: 'Caja Fuerte',
    icon: Safe,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'appliance-keycard',
    name: 'Tarjeta de Acceso',
    icon: AccessCard,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  }
]