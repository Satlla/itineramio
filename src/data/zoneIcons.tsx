import React from 'react'
import {
  // Kitchen
  ChefHat,
  Utensils,
  UtensilsCrossed,
  Coffee,
  Microwave,
  Refrigerator,
  Wine,
  Flame,
  Pizza,
  Beef,
  Fish,
  Beer,
  Soup,
  // Bathroom
  Bath,
  ShowerHead,
  Droplets,
  Scissors,
  // Bedroom
  Bed,
  BedDouble,
  BedSingle,
  Lamp,
  Fan,
  Lightbulb,
  Armchair,
  Shirt,
  // Living room
  Sofa,
  Tv,
  Volume2,
  Radio,
  Gamepad2,
  Book,
  Projector,
  // Access & Security
  DoorOpen,
  Key,
  KeyRound,
  Shield,
  Camera,
  Lock,
  Fingerprint,
  QrCode,
  // Exterior & Nature
  Trees,
  TreePine,
  Car,
  Bike,
  Flower,
  Flower2,
  Waves,
  Mountain,
  Building,
  Sailboat,
  Tent,
  Anchor,
  Leaf,
  // Travel
  Plane,
  Luggage,
  BaggageClaim,
  Globe,
  Compass,
  Map,
  Ship,
  Train,
  Bus,
  Navigation,
  // Services & Home
  Wifi,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Zap,
  Snowflake,
  Dumbbell,
  Sparkles,
  Umbrella,
  Cloud,
  CloudRain,
  CloudSun,
  CloudSnow,
  Blinds,
  Printer,
  // Pets
  Dog,
  Cat,
  PawPrint,
  // Kids & Fun
  Baby,
  Puzzle,
  // Nature / Weather
  Sunrise,
  Sunset,
  // General
  Home,
  Archive,
  Package,
  Settings,
  Info,
  Phone,
  MapPin,
  MapPinned,
  Wrench,
  HardHat,
  Gauge,
  Battery,
  PlugZap,
  Timer,
  Clock,
  Calendar,
  Bell,
  BellOff,
  AlertTriangle,
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
  Apple,
  Circle,
  Users,
  Monitor,
  Laptop,
  Tablet,
  Router,
  Satellite,
  HardDrive,
  Mailbox,
} from 'lucide-react'
import { ZoneIcon } from '@/types/zones'

// Legacy aliases — keeps existing ZONE_ICONS entries working
const Shower = ShowerHead
const Washing = Shirt
const Bottle = Wine
const Tea = Coffee
const Pillow = Package
const Chair = Armchair
const Desk = Archive
const Candle = Flame
const Flashlight = Lightbulb
const AlarmClock = Clock
const Stethoscope = Heart
const Pill = Circle
const Table = Archive
const Joystick = Gamepad2
const Library = Book
const Newspaper = FileText
const Accessibility = Users
const Palmtree = TreePine
const PalmTree = TreePine
const Cactus = Flower2
const Campfire = Flame
const Fence = Shield
const Bird = Flower2
const Rabbit = Flower2
const FishIcon = Fish
const Construction = Building
const Hammer = Wrench
const Dice1 = Circle
const Trophy = Star
const Gift = Package
const PartyPopper = Star
const Brain = Circle
const Pen = FileText
const Smartphone = Phone
const SatelliteIcon = Satellite
const Suitcase = Briefcase
const Passport = FileText
const PhotoCamera = Camera
const ParkingCircle = Circle
const Hotel = Building
const Beach = Umbrella
const Door = DoorOpen
const DoorClosed = DoorOpen
const Window = Package
const Balcony = Package
const Stairs = Package
const Elevator = Package
const CoffeeCup = Coffee
const Oven = Package
const Dishwasher = Sparkles
const Freezer = Snowflake
const Heater = Flame
const AirVent = Wind
const Iron = Package
const Safe = Lock
const AccessCard = CreditCard
const Taxi = Car

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
  {
    id: 'cooktop',
    name: 'Vitrocerámica',
    icon: Flame,
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
    icon: CoffeeCup,
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
  },

  // =================== CHECK-IN / ACCESO DIGITAL ===================
  {
    id: 'checkin-online',
    name: 'Check-in Online',
    icon: Monitor,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkin-qr',
    name: 'Check-in QR',
    icon: QrCode,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkin-digital',
    name: 'Acceso Digital',
    icon: Fingerprint,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkin-app',
    name: 'App Check-in',
    icon: Smartphone,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'checkin-tablet',
    name: 'Tablet Check-in',
    icon: Tablet,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },

  // =================== COCINA COMPLETA ===================
  {
    id: 'vitroceramica',
    name: 'Vitrocerámica',
    icon: Flame,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'horno',
    name: 'Horno',
    icon: Oven,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'lavavajillas',
    name: 'Lavavajillas',
    icon: Dishwasher,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'congelador',
    name: 'Congelador',
    icon: Freezer,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },

  // =================== SERVICIOS EXTRA ===================
  {
    id: 'ascensor',
    name: 'Ascensor',
    icon: Elevator,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'escaleras',
    name: 'Escaleras',
    icon: Stairs,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'balcony',
    name: 'Balcón',
    icon: Balcony,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'window',
    name: 'Ventanas',
    icon: Window,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'portero',
    name: 'Portero / Intercomuni.',
    icon: Speaker,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: Hotel,
    category: { id: 'general', name: 'Información general', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    color: 'text-gray-600'
  },
  {
    id: 'beach-umbrella',
    name: 'Sombrilla playa',
    icon: Beach,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'snowflake',
    name: 'Congelación / Frío',
    icon: Snowflake,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },

  // =================== NUEVOS ICONOS ===================

  // Barbacoa / parrilla
  {
    id: 'barbacoa',
    name: 'Barbacoa',
    icon: Beef,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'parrilla',
    name: 'Parrilla',
    icon: Flame,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },

  // Mascotas
  {
    id: 'paw-print',
    name: 'Mascotas (general)',
    icon: PawPrint,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },

  // Consigna / equipaje
  {
    id: 'baggage-claim',
    name: 'Consigna equipaje',
    icon: BaggageClaim,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },

  // Niños
  {
    id: 'baby',
    name: 'Bebé / Cuna',
    icon: Baby,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'puzzle',
    name: 'Juguetes / Niños',
    icon: Puzzle,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },

  // Naturaleza
  {
    id: 'tree-pine',
    name: 'Pino / Bosque',
    icon: TreePine,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'flower2',
    name: 'Flores',
    icon: Flower2,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'leaf',
    name: 'Naturaleza',
    icon: Leaf,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'anchor',
    name: 'Puerto / Muelle',
    icon: Anchor,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },

  // Llave digital
  {
    id: 'key-round',
    name: 'Llave digital',
    icon: KeyRound,
    category: { id: 'access', name: 'Acceso y seguridad', color: 'bg-red-100 text-red-800 border-red-200' },
    color: 'text-red-600'
  },

  // Ubicación exacta
  {
    id: 'map-pinned',
    name: 'Cómo llegar',
    icon: MapPinned,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },

  // Transporte real
  {
    id: 'train',
    name: 'Tren',
    icon: Train,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },
  {
    id: 'bus',
    name: 'Autobús',
    icon: Bus,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },

  // Cocina - iconos reales
  {
    id: 'pizza-real',
    name: 'Pizza / Horno pizza',
    icon: Pizza,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'soup-real',
    name: 'Olla / Sopas',
    icon: Soup,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'fish-real',
    name: 'Pescado / Frutos del mar',
    icon: Fish,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'beer-real',
    name: 'Cerveza',
    icon: Beer,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },

  // Barco / vela
  {
    id: 'sailboat-real',
    name: 'Velero / Embarcación',
    icon: Sailboat,
    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    color: 'text-sky-600'
  },

  // Laptop / trabajo
  {
    id: 'laptop',
    name: 'Área de trabajo',
    icon: Laptop,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },

  // Ducha (ShowerHead real)
  {
    id: 'shower-head',
    name: 'Ducha',
    icon: ShowerHead,
    category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    color: 'text-teal-600'
  },

  // Lavavajillas (Sparkles real)
  {
    id: 'dishwasher',
    name: 'Lavavajillas',
    icon: Sparkles,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },

  // Cama doble/individual reales
  {
    id: 'bed-double-real',
    name: 'Cama de matrimonio',
    icon: BedDouble,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },
  {
    id: 'bed-single-real',
    name: 'Cama individual',
    icon: BedSingle,
    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    color: 'text-blue-600'
  },

  // Proyector real
  {
    id: 'projector-real',
    name: 'Proyector / Home cinema',
    icon: Projector,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },

  // Cascos / auriculares
  {
    id: 'headphones',
    name: 'Auriculares',
    icon: Headphones,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },

  // Música
  {
    id: 'music',
    name: 'Música / Altavoces',
    icon: Music,
    category: { id: 'living', name: 'Sala de estar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    color: 'text-purple-600'
  },

  // Perros / gatos reales
  {
    id: 'dog-real',
    name: 'Perros',
    icon: Dog,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
  {
    id: 'cat-real',
    name: 'Gatos',
    icon: Cat,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },

  // Gimnasio real
  {
    id: 'dumbbell-real',
    name: 'Gimnasio / Pesas',
    icon: Dumbbell,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },

  // Tent real
  {
    id: 'tent-real',
    name: 'Zona camping',
    icon: Tent,
    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    color: 'text-green-600'
  },
]