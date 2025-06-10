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
  Sun as Sunrise, // Using Sun instead of Sunrise
  Moon as Sunset, // Using Moon instead of Sunset
  FileText as Printer, // Using FileText instead of Printer
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
    name: 'Luz',
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
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'shower',
    name: 'Ducha',
    icon: Shower,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'droplets',
    name: 'Agua',
    icon: Droplets,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'thermometer',
    name: 'Calentador',
    icon: Thermometer,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'scissors',
    name: 'Aseo Personal',
    icon: Scissors,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },

  // Salón
  {
    id: 'sofa',
    name: 'Sofá',
    icon: Sofa,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'tv',
    name: 'Televisión',
    icon: Tv,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'volume',
    name: 'Sistema de Audio',
    icon: Volume2,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'radio',
    name: 'Radio',
    icon: Radio,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'gamepad',
    name: 'Videojuegos',
    icon: Gamepad2,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'book',
    name: 'Librería',
    icon: Book,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },

  // Entrada
  {
    id: 'door',
    name: 'Puerta Principal',
    icon: DoorOpen,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'key',
    name: 'Llaves',
    icon: Key,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'lock',
    name: 'Cerradura',
    icon: Lock,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'shield',
    name: 'Seguridad',
    icon: Shield,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'camera',
    name: 'Cámara',
    icon: Camera,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'home',
    name: 'Recibidor',
    icon: Home,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },

  // Exterior
  {
    id: 'trees',
    name: 'Jardín',
    icon: Trees,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'car',
    name: 'Parking',
    icon: Car,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'bike',
    name: 'Bicicletas',
    icon: Bike,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'flower',
    name: 'Terraza',
    icon: Flower,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'waves',
    name: 'Piscina',
    icon: Waves,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'mountain',
    name: 'Vista',
    icon: Mountain,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'building',
    name: 'Edificio',
    icon: Building,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },

  // Electrodomésticos
  {
    id: 'washing',
    name: 'Lavadora',
    icon: Washing,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'wind',
    name: 'Aire Acondicionado',
    icon: Wind,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'sun',
    name: 'Calefacción',
    icon: Sun,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'moon',
    name: 'Persiana',
    icon: Moon,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'zap',
    name: 'Vitrocerámica',
    icon: Zap,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'plug',
    name: 'Enchufe',
    icon: PlugZap,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },

  // Servicios
  {
    id: 'wifi',
    name: 'WiFi',
    icon: Wifi,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'phone',
    name: 'Teléfono',
    icon: Phone,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'mappin',
    name: 'Ubicación',
    icon: MapPin,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'archive',
    name: 'Almacenamiento',
    icon: Archive,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'package',
    name: 'Paquetes',
    icon: Package,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'settings',
    name: 'Configuración',
    icon: Settings,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'wrench',
    name: 'Mantenimiento',
    icon: Wrench,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'hardhat',
    name: 'Obras',
    icon: HardHat,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'gauge',
    name: 'Medidores',
    icon: Gauge,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'battery',
    name: 'Energía',
    icon: Battery,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },

  // Más iconos de cocina
  {
    id: 'pizza',
    name: 'Horno',
    icon: Pizza,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'soup',
    name: 'Estufa',
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
    id: 'fish-food',
    name: 'Pescado',
    icon: Fish,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'carrot',
    name: 'Verduras',
    icon: Apple,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'apple',
    name: 'Frutas',
    icon: Apple,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'beer',
    name: 'Bebidas',
    icon: Beer,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'bottle',
    name: 'Botellas',
    icon: Bottle,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'tea',
    name: 'Té e Infusiones',
    icon: Tea,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },

  // Más iconos de dormitorio
  {
    id: 'bed-double',
    name: 'Cama Doble',
    icon: BedDouble,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'bed-single',
    name: 'Cama Individual',
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
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'flashlight',
    name: 'Linterna',
    icon: Flashlight,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'alarm-clock',
    name: 'Despertador',
    icon: AlarmClock,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },

  // Más iconos de baño
  {
    id: 'towel',
    name: 'Toallas',
    icon: Shirt,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'soap',
    name: 'Jabón',
    icon: Circle,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'flame-bath',
    name: 'Agua Caliente',
    icon: Flame,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'snowflake-bath',
    name: 'Agua Fría',
    icon: Snowflake,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'stethoscope',
    name: 'Botiquín',
    icon: Stethoscope,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },
  {
    id: 'pill',
    name: 'Medicinas',
    icon: Pill,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    color: 'text-cyan-600'
  },

  // Más iconos de salón
  {
    id: 'table',
    name: 'Mesa',
    icon: Table,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'monitor',
    name: 'Monitor',
    icon: Monitor,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'projector',
    name: 'Proyector',
    icon: Projector,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'film',
    name: 'Entretenimiento',
    icon: Film,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'joystick',
    name: 'Consola de Juegos',
    icon: Joystick,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'library',
    name: 'Biblioteca',
    icon: Library,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'newspaper',
    name: 'Periódicos',
    icon: Newspaper,
    category: { id: 'living', name: 'Salón', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },

  // Más iconos de entrada
  {
    id: 'bell-entrance',
    name: 'Timbre',
    icon: Bell,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'qr-code',
    name: 'Código QR',
    icon: QrCode,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'fingerprint',
    name: 'Huella Digital',
    icon: Fingerprint,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'accessibility',
    name: 'Accesibilidad',
    icon: Accessibility,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'mail',
    name: 'Buzón',
    icon: Mail,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },
  {
    id: 'umbrella',
    name: 'Paraguas',
    icon: Umbrella,
    category: { id: 'entrance', name: 'Entrada', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },

  // Más iconos de exterior
  {
    id: 'palmtree',
    name: 'Palmeras',
    icon: Palmtree,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'cactus',
    name: 'Cactus',
    icon: Cactus,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'tent',
    name: 'Zona de Camping',
    icon: Tent,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'campfire',
    name: 'Hoguera',
    icon: Campfire,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'fence',
    name: 'Valla',
    icon: Fence,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'sailboat',
    name: 'Embarcadero',
    icon: Sailboat,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'sunrise',
    name: 'Vista al Amanecer',
    icon: Sunrise,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },
  {
    id: 'sunset',
    name: 'Vista al Atardecer',
    icon: Sunset,
    category: { id: 'outdoor', name: 'Exterior', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    color: 'text-emerald-600'
  },

  // Más iconos de electrodomésticos
  {
    id: 'printer',
    name: 'Impresora',
    icon: Printer,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'laptop',
    name: 'Ordenador Portátil',
    icon: Laptop,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'tablet',
    name: 'Tablet',
    icon: Tablet,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'smartphone-device',
    name: 'Teléfono Móvil',
    icon: Smartphone,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'router',
    name: 'Router WiFi',
    icon: Router,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'satellite',
    name: 'Antena Satelital',
    icon: SatelliteIcon,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },
  {
    id: 'hard-drive',
    name: 'Almacenamiento',
    icon: HardDrive,
    category: { id: 'appliances', name: 'Electrodomésticos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    color: 'text-indigo-600'
  },

  // Más iconos de servicios
  {
    id: 'recycle',
    name: 'Reciclaje',
    icon: Recycle,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'trash',
    name: 'Basura',
    icon: Trash2,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'construction',
    name: 'En Construcción',
    icon: Construction,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'hammer',
    name: 'Herramientas',
    icon: Hammer,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'calculator',
    name: 'Calculadora',
    icon: Calculator,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'calendar-service',
    name: 'Calendario',
    icon: Calendar,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'clock-service',
    name: 'Reloj',
    icon: Clock,
    category: { id: 'utilities', name: 'Servicios', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },

  // Nueva categoría: Entretenimiento
  {
    id: 'music-entertainment',
    name: 'Música',
    icon: Music,
    category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    color: 'text-pink-600'
  },
  {
    id: 'headphones-entertainment',
    name: 'Auriculares',
    icon: Headphones,
    category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    color: 'text-pink-600'
  },
  {
    id: 'dice',
    name: 'Juegos de Mesa',
    icon: Dice1,
    category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    color: 'text-pink-600'
  },
  {
    id: 'trophy-entertainment',
    name: 'Trofeos',
    icon: Trophy,
    category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    color: 'text-pink-600'
  },
  {
    id: 'gift',
    name: 'Regalos',
    icon: Gift,
    category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    color: 'text-pink-600'
  },
  {
    id: 'party',
    name: 'Fiesta',
    icon: PartyPopper,
    category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    color: 'text-pink-600'
  },

  // Nueva categoría: Bienestar
  {
    id: 'dumbbell',
    name: 'Gimnasio',
    icon: Dumbbell,
    category: { id: 'wellness', name: 'Bienestar', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'heart-wellness',
    name: 'Salud',
    icon: Heart,
    category: { id: 'wellness', name: 'Bienestar', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'spa',
    name: 'Spa',
    icon: Sparkles,
    category: { id: 'wellness', name: 'Bienestar', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'meditation',
    name: 'Meditación',
    icon: Brain,
    category: { id: 'wellness', name: 'Bienestar', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },

  // Nueva categoría: Trabajo
  {
    id: 'briefcase-work',
    name: 'Oficina',
    icon: Briefcase,
    category: { id: 'work', name: 'Trabajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'folder-work',
    name: 'Documentos',
    icon: Folder,
    category: { id: 'work', name: 'Trabajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'pen-work',
    name: 'Escritura',
    icon: Pen,
    category: { id: 'work', name: 'Trabajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'clipboard-work',
    name: 'Lista de Tareas',
    icon: ClipboardList,
    category: { id: 'work', name: 'Trabajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },

  // Nueva categoría: Mascotas
  {
    id: 'dog-pet',
    name: 'Perro',
    icon: Dog,
    category: { id: 'pets', name: 'Mascotas', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'cat-pet',
    name: 'Gato',
    icon: Cat,
    category: { id: 'pets', name: 'Mascotas', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'bird-pet',
    name: 'Ave',
    icon: Bird,
    category: { id: 'pets', name: 'Mascotas', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'rabbit-pet',
    name: 'Conejo',
    icon: Rabbit,
    category: { id: 'pets', name: 'Mascotas', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },
  {
    id: 'fish-pet',
    name: 'Pez',
    icon: FishIcon,
    category: { id: 'pets', name: 'Mascotas', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    color: 'text-amber-600'
  },

  // Nueva categoría: Check-out e Información
  {
    id: 'checkout',
    name: 'Check-out',
    icon: Calendar,
    category: { id: 'checkout', name: 'Check-out', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkout-instructions',
    name: 'Instrucciones de Salida',
    icon: ClipboardList,
    category: { id: 'checkout', name: 'Check-out', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkout-keys',
    name: 'Devolución de Llaves',
    icon: Key,
    category: { id: 'checkout', name: 'Check-out', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkout-cleaning',
    name: 'Limpieza Final',
    icon: CheckCircle,
    category: { id: 'checkout', name: 'Check-out', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkout-time',
    name: 'Hora de Salida',
    icon: Clock,
    category: { id: 'checkout', name: 'Check-out', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkout-feedback',
    name: 'Valoración',
    icon: Star,
    category: { id: 'checkout', name: 'Check-out', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },

  // Nueva categoría: Información General
  {
    id: 'info-general',
    name: 'Información General',
    icon: Info,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-help',
    name: 'Ayuda',
    icon: HelpCircle,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-contact',
    name: 'Contacto',
    icon: Phone,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-emergency',
    name: 'Emergencias',
    icon: AlertTriangle,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-rules',
    name: 'Normas de la Casa',
    icon: FileText,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-transport',
    name: 'Transporte',
    icon: Car,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-tourism',
    name: 'Turismo y Ocio',
    icon: MapPin,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-restaurants',
    name: 'Restaurantes',
    icon: Utensils,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-shopping',
    name: 'Compras',
    icon: ShoppingBag,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-medical',
    name: 'Asistencia Médica',
    icon: Heart,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-banking',
    name: 'Bancos y Cajeros',
    icon: CreditCard,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },
  {
    id: 'info-pharmacy',
    name: 'Farmacia',
    icon: Circle,
    category: { id: 'information', name: 'Información', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    color: 'text-slate-600'
  },

  // Nueva categoría: Check-in
  {
    id: 'checkin',
    name: 'Check-in',
    icon: DoorOpen,
    category: { id: 'checkin', name: 'Check-in', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'checkin-welcome',
    name: 'Bienvenida',
    icon: Heart,
    category: { id: 'checkin', name: 'Check-in', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'checkin-keys',
    name: 'Recogida de Llaves',
    icon: Key,
    category: { id: 'checkin', name: 'Check-in', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'checkin-time',
    name: 'Hora de Llegada',
    icon: Clock,
    category: { id: 'checkin', name: 'Check-in', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'checkin-parking',
    name: 'Parking',
    icon: Car,
    category: { id: 'checkin', name: 'Check-in', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'checkin-luggage',
    name: 'Equipaje',
    icon: Package,
    category: { id: 'checkin', name: 'Check-in', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },

  // Nueva categoría: Problemas/Averías
  {
    id: 'problem-report',
    name: 'Reportar Problema',
    icon: AlertTriangle,
    category: { id: 'problems', name: 'Problemas', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'problem-electricity',
    name: 'Problemas Eléctricos',
    icon: Zap,
    category: { id: 'problems', name: 'Problemas', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'problem-water',
    name: 'Problemas de Agua',
    icon: Droplets,
    category: { id: 'problems', name: 'Problemas', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'problem-heating',
    name: 'Calefacción/Aire',
    icon: Thermometer,
    category: { id: 'problems', name: 'Problemas', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'problem-internet',
    name: 'Problemas de Internet',
    icon: Wifi,
    category: { id: 'problems', name: 'Problemas', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'problem-appliances',
    name: 'Electrodomésticos',
    icon: Settings,
    category: { id: 'problems', name: 'Problemas', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'problem-maintenance',
    name: 'Mantenimiento',
    icon: Wrench,
    category: { id: 'problems', name: 'Problemas', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  }
]