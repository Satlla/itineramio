import React from 'react'
import {
  WashingMachineIcon,
  BoilerIcon,
  RangeHoodIcon,
  CeramicHobIcon,
  GasBurnerIcon,
  ToiletIcon,
  SmartLockIcon,
  CeilingFanIcon,
  JacuzziIcon,
  HotTubIcon,
  LockerIcon,
  VaultIcon,
  OvenIcon,
  DryerIcon,
  IronIcon,
  HammockIcon,
} from '@/components/ui/icons/CustomHomeIcons'
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
  // New imports — expansión masiva de iconos
  LockKeyhole,
  KeySquare,
  LampCeiling,
  LampDesk,
  LampFloor,
  GlassWater,
  RockingChair,
  VolumeX,
  CigaretteOff,
  Siren,
  LifeBuoy,
  HeartPulse,
  Stethoscope,
  ShieldAlert,
  ShieldCheck,
  ListChecks,
  ScrollText,
  ParkingMeter,
  Scale,
  Coins,
  PiggyBank,
  Ticket,
  Percent,
  Paintbrush,
  Paintbrush2,
  UserCheck,
  UsersRound,
  PersonStanding,
  Newspaper,
  SlidersHorizontal,
  Cable,
  AlarmCheck,
  AlarmClockOff,
  FileCheck,
  AlertOctagon,
  Accessibility,
  Landmark,
  Cigarette,
  DoorClosed,
  Disc2,
  Hotel,
  // Entretenimiento
  Clapperboard,
  Popcorn,
  Dices,
  MonitorPlay,
  Medal,
  // Deporte y bienestar
  MountainSnow,
  Footprints,
  Backpack,
  Swords,
  Target,
  SunSnow,
  // Trabajo
  PenLine,
  ScanLine,
  Layers,
  LayoutDashboard,
  // Comida específica
  Salad,
  Sandwich,
  EggFried,
  IceCream2,
  Martini,
  Cherry,
  Grape,
  Banana,
  Carrot,
  Croissant,
  Cookie,
  Candy,
  IceCream,
  Dessert,
  Donut,
  // Educación y cultura
  GraduationCap,
  Palette,
  BookOpen,
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
const Pill = Circle
const Table = Archive
const Joystick = Gamepad2
const Library = Book
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
const Beach = Umbrella
const Door = DoorOpen
const Window = Package
const Balcony = Package
const Stairs = Package
const Elevator = Package
const CoffeeCup = Coffee
const Dishwasher = Sparkles
const Freezer = Snowflake
const Heater = Flame
const AirVent = Wind
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
    icon: CeramicHobIcon,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'gas-burner',
    name: 'Fogones de gas',
    icon: GasBurnerIcon,
    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    color: 'text-orange-600'
  },
  {
    id: 'range-hood',
    name: 'Campana extractora',
    icon: RangeHoodIcon,
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
    name: 'WC / Inodoro',
    icon: ToiletIcon,
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
    id: 'smart-lock',
    name: 'Cerradura electrónica',
    icon: SmartLockIcon,
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
    icon: WashingMachineIcon,
    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    color: 'text-yellow-600'
  },
  {
    id: 'boiler',
    name: 'Caldera',
    icon: BoilerIcon,
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
    icon: OvenIcon,
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
    icon: IronIcon,
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
    icon: OvenIcon,
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

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE A — Fix templates: IDs usados en zoneTemplates sin entrada propia
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'door-exit',     name: 'Salida / Check-out',       icon: DoorClosed,      category: { id: 'access',   name: 'Acceso',    color: 'bg-red-100 text-red-800 border-red-200' },       color: 'text-red-600' },
  { id: 'navigation',    name: 'Cómo llegar',              icon: Navigation,      category: { id: 'travel',   name: 'Viajes',    color: 'bg-sky-100 text-sky-800 border-sky-200' },        color: 'text-sky-600' },
  { id: 'washing-machine', name: 'Lavadora',               icon: WashingMachineIcon, category: { id: 'cleaning', name: 'Limpieza',  color: 'bg-lime-100 text-lime-800 border-lime-200' },  color: 'text-lime-600' },
  { id: 'oven',          name: 'Horno',                    icon: OvenIcon,        category: { id: 'kitchen',  name: 'Cocina',    color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'rules',         name: 'Normas',                   icon: ScrollText,      category: { id: 'safety',   name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' },     color: 'text-rose-600' },
  { id: 'volume-off',    name: 'Horario de silencio',      icon: VolumeX,         category: { id: 'safety',   name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' },     color: 'text-rose-600' },
  { id: 'smoking',       name: 'Política de fumadores',    icon: Cigarette,       category: { id: 'safety',   name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' },     color: 'text-rose-600' },
  { id: 'pet',           name: 'Mascotas',                 icon: PawPrint,        category: { id: 'safety',   name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' },     color: 'text-rose-600' },
  { id: 'recycle',       name: 'Reciclaje',                icon: Recycle,         category: { id: 'cleaning', name: 'Limpieza',  color: 'bg-lime-100 text-lime-800 border-lime-200' },     color: 'text-lime-600' },
  { id: 'shopping-cart', name: 'Supermercado',             icon: ShoppingCart,    category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'restaurant',    name: 'Restaurantes',             icon: UtensilsCrossed, category: { id: 'kitchen',  name: 'Cocina',    color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'medical',       name: 'Salud / Médico',           icon: Stethoscope,     category: { id: 'safety',   name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' },     color: 'text-rose-600' },
  { id: 'landmark',      name: 'Lugares de interés',       icon: Landmark,        category: { id: 'travel',   name: 'Viajes',    color: 'bg-sky-100 text-sky-800 border-sky-200' },        color: 'text-sky-600' },
  { id: 'ticket',        name: 'Transporte / Tickets',     icon: Ticket,          category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'piggy-bank',    name: 'Ahorro / Presupuesto',     icon: PiggyBank,       category: { id: 'general',  name: 'General',   color: 'bg-gray-100 text-gray-800 border-gray-200' },      color: 'text-gray-600' },
  { id: 'discount',      name: 'Descuentos / Ofertas',     icon: Percent,         category: { id: 'general',  name: 'General',   color: 'bg-gray-100 text-gray-800 border-gray-200' },      color: 'text-gray-600' },
  { id: 'emergency',     name: 'Emergencias',              icon: Siren,           category: { id: 'safety',   name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' },     color: 'text-rose-600' },
  { id: 'first-aid',     name: 'Botiquín',                 icon: HeartPulse,      category: { id: 'safety',   name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' },     color: 'text-rose-600' },
  { id: 'electrical',    name: 'Cuadro eléctrico',         icon: PlugZap,         category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'water-off',     name: 'Llave de paso',            icon: Droplets,        category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE B — Cocina ampliada
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'kitchen-scale',   name: 'Báscula cocina',    icon: Scale,       category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'kitchen-timer',   name: 'Temporizador',      icon: Timer,       category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'kitchen-kettle',  name: 'Hervidor',          icon: GlassWater,  category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'kitchen-blender', name: 'Batidora / Licuadora', icon: Wind,     category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'kitchen-storage', name: 'Despensa / Almacén', icon: Archive,    category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'kitchen-bar',     name: 'Barra americana',   icon: Wine,        category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'kitchen-toaster', name: 'Tostadora',         icon: Flame,       category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'kitchen-water',   name: 'Agua / Hidratación', icon: GlassWater, category: { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE C — Baño ampliado
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'bathroom-mirror',   name: 'Espejo',            icon: SlidersHorizontal, category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' }, color: 'text-teal-600' },
  { id: 'bathroom-towels',   name: 'Toallas',           icon: Droplets,          category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' }, color: 'text-teal-600' },
  { id: 'bathroom-hairdryer', name: 'Secador de pelo',  icon: Wind,              category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' }, color: 'text-teal-600' },
  { id: 'bathroom-soap',     name: 'Jabón / Amenities', icon: Sparkles,          category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' }, color: 'text-teal-600' },
  { id: 'bathroom-scales',   name: 'Báscula baño',      icon: Scale,             category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' }, color: 'text-teal-600' },
  { id: 'bathroom-jacuzzi',  name: 'Jacuzzi',           icon: JacuzziIcon,       category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' }, color: 'text-teal-600' },
  { id: 'bathroom-sauna',    name: 'Sauna',             icon: Thermometer,       category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' }, color: 'text-teal-600' },
  { id: 'bathroom-hamam',    name: 'Hammam / Baño turco', icon: Cloud,           category: { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' }, color: 'text-teal-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE D — Dormitorio ampliado
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'bedroom-safe',         name: 'Caja fuerte',            icon: LockKeyhole,   category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-locker',       name: 'Taquilla / Locker',      icon: LockerIcon,    category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-ceiling-fan',  name: 'Ventilador de techo',    icon: CeilingFanIcon, category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-reading-lamp', name: 'Lámpara de lectura',     icon: LampDesk,      category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-floor-lamp',   name: 'Lámpara de pie',         icon: LampFloor,     category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-ceiling-lamp', name: 'Lámpara de techo',       icon: LampCeiling,   category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-blackout',     name: 'Persianas / Blackout',   icon: Blinds,        category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-ac',           name: 'Aire acond. habitación', icon: Wind,          category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-crib',         name: 'Cuna / Bebé',            icon: Baby,          category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-wardrobe',     name: 'Armario empotrado',      icon: Shirt,         category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },
  { id: 'bedroom-mirror',       name: 'Espejo habitación',      icon: Album,         category: { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }, color: 'text-blue-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE E — Salón ampliado
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'living-fireplace',     name: 'Chimenea',              icon: Flame,         category: { id: 'living', name: 'Salón', color: 'bg-purple-100 text-purple-800 border-purple-200' }, color: 'text-purple-600' },
  { id: 'living-speakers',      name: 'Altavoces / Sonido',   icon: Volume2,        category: { id: 'living', name: 'Salón', color: 'bg-purple-100 text-purple-800 border-purple-200' }, color: 'text-purple-600' },
  { id: 'living-rocking-chair', name: 'Mecedora / Sillón',    icon: RockingChair,   category: { id: 'living', name: 'Salón', color: 'bg-purple-100 text-purple-800 border-purple-200' }, color: 'text-purple-600' },
  { id: 'living-bar',           name: 'Bar / Minibar',        icon: Wine,           category: { id: 'living', name: 'Salón', color: 'bg-purple-100 text-purple-800 border-purple-200' }, color: 'text-purple-600' },
  { id: 'living-vinyl',         name: 'Tocadiscos / Vinilo',  icon: Disc2,          category: { id: 'living', name: 'Salón', color: 'bg-purple-100 text-purple-800 border-purple-200' }, color: 'text-purple-600' },
  { id: 'living-dining-table',  name: 'Mesa de comedor',      icon: Archive,        category: { id: 'living', name: 'Salón', color: 'bg-purple-100 text-purple-800 border-purple-200' }, color: 'text-purple-600' },
  { id: 'living-piano',         name: 'Piano / Instrumento',  icon: Music,          category: { id: 'living', name: 'Salón', color: 'bg-purple-100 text-purple-800 border-purple-200' }, color: 'text-purple-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE F — Acceso y seguridad ampliado
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'access-intercom',       name: 'Interfono',             icon: Bell,           category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-video-intercom', name: 'Videoportero',          icon: Camera,         category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-keypad',         name: 'Teclado numérico',      icon: SlidersHorizontal, category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-key-box',        name: 'Caja de llaves',        icon: KeySquare,      category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-locker',         name: 'Taquilla acceso',       icon: LockerIcon,     category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-gate',           name: 'Verja / Cancela',       icon: Shield,         category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-garage-door',    name: 'Puerta garaje',         icon: Car,            category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-code',           name: 'Código de acceso',      icon: QrCode,         category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-fingerprint',    name: 'Huella dactilar',       icon: Fingerprint,    category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-card',           name: 'Tarjeta de acceso',     icon: CreditCard,     category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-alarm',          name: 'Alarma de seguridad',   icon: ShieldAlert,    category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-cctv',           name: 'Videovigilancia',       icon: Camera,         category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },
  { id: 'access-safe',           name: 'Caja fuerte acceso',    icon: VaultIcon,      category: { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' }, color: 'text-red-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE G — Exterior ampliado
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'exterior-terrace',          name: 'Terraza',                 icon: Flower,         category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-bbq',              name: 'Barbacoa exterior',       icon: Flame,          category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-hammock',          name: 'Hamaca',                  icon: HammockIcon,    category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-sun-lounger',      name: 'Tumbonas',                icon: Umbrella,       category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-outdoor-shower',   name: 'Ducha exterior',          icon: ShowerHead,     category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-outdoor-kitchen',  name: 'Cocina exterior',         icon: ChefHat,        category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-pergola',          name: 'Pérgola / Porche',        icon: Umbrella,       category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-sea-view',         name: 'Vistas al mar',           icon: Waves,          category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-panoramic-view',   name: 'Vistas panorámicas',      icon: Mountain,       category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-city-view',        name: 'Vistas a la ciudad',      icon: Building,       category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-private-entrance', name: 'Entrada privada',         icon: DoorOpen,       category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-bicycle-storage',  name: 'Garaje bicicletas',       icon: Bike,           category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },
  { id: 'exterior-clothesline',      name: 'Tendedero exterior',      icon: Wind,           category: { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' }, color: 'text-green-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE H — NUEVA categoría: Piscina y spa
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'pool-main',      name: 'Piscina',                   icon: Waves,          category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-indoor',    name: 'Piscina cubierta',          icon: Waves,          category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-heated',    name: 'Piscina climatizada',       icon: Thermometer,    category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-infinity',  name: 'Piscina infinita',          icon: Waves,          category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-children',  name: 'Piscina infantil',          icon: Baby,           category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-jacuzzi',   name: 'Jacuzzi / Hidromasaje',     icon: JacuzziIcon,    category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-hot-tub',   name: 'Hot tub / Bañera spa',      icon: HotTubIcon,     category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-sauna',     name: 'Sauna',                     icon: Thermometer,    category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-hammam',    name: 'Hammam / Baño turco',       icon: Cloud,          category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-steam',     name: 'Sala de vapor',             icon: Cloud,          category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-lifeguard', name: 'Socorrista / Seguridad',    icon: LifeBuoy,       category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-shower',    name: 'Duchas piscina',            icon: ShowerHead,     category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-spa',       name: 'Spa / Centro de bienestar', icon: Sparkles,       category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-gym',       name: 'Gimnasio / Fitness',        icon: Dumbbell,       category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-yoga',      name: 'Yoga / Clases',             icon: PersonStanding, category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-rules',     name: 'Normas piscina',            icon: ScrollText,     category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-hours',     name: 'Horario piscina',           icon: Clock,          category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },
  { id: 'pool-towels',    name: 'Toallas piscina',           icon: Droplets,       category: { id: 'pool', name: 'Piscina y spa', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }, color: 'text-cyan-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE I — NUEVA categoría: Seguridad y normas
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'safety-rules',              name: 'Normas generales',          icon: ScrollText,    category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-house-rules',        name: 'Normas de la casa',         icon: ListChecks,    category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-quiet-hours',        name: 'Horario de silencio',       icon: VolumeX,       category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-no-smoking',         name: 'Prohibido fumar',           icon: CigaretteOff,  category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-smoking-area',       name: 'Zona de fumadores',         icon: Cigarette,     category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-pets-allowed',       name: 'Mascotas permitidas',       icon: PawPrint,      category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-no-parties',         name: 'Sin fiestas',               icon: BellOff,       category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-max-guests',         name: 'Máx. huéspedes',            icon: UsersRound,    category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-check-in-time',      name: 'Hora de check-in',          icon: Clock,         category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-check-out-time',     name: 'Hora de check-out',         icon: AlarmClockOff, category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-deposit',            name: 'Fianza / Depósito',         icon: Coins,         category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-emergency-exit',     name: 'Salida de emergencia',      icon: DoorOpen,      category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-fire-extinguisher',  name: 'Extintor',                  icon: ShieldCheck,   category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-smoke-detector',     name: 'Detector de humo',          icon: Siren,         category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-co-detector',        name: 'Detector de CO',            icon: AlertOctagon,  category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-first-aid',          name: 'Botiquín de primeros auxilios', icon: HeartPulse, category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-emergency-contacts', name: 'Contactos de emergencia',   icon: Phone,         category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-electrical-panel',   name: 'Cuadro eléctrico',          icon: PlugZap,       category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-water-shutoff',      name: 'Llave de paso del agua',    icon: Droplets,      category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-gas-shutoff',        name: 'Llave del gas',             icon: Flame,         category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-accessibility',      name: 'Accesibilidad',             icon: Accessibility, category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },
  { id: 'safety-damages',            name: 'Daños / Responsabilidad',   icon: ShieldAlert,   category: { id: 'safety', name: 'Seguridad', color: 'bg-rose-100 text-rose-800 border-rose-200' }, color: 'text-rose-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE J — NUEVA categoría: Limpieza
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'cleaning-washing-machine', name: 'Lavadora',               icon: WashingMachineIcon, category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-dryer',           name: 'Secadora',               icon: DryerIcon,          category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-iron',            name: 'Plancha de ropa',        icon: IronIcon,           category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-ironing-board',   name: 'Tabla de planchar',      icon: Archive,            category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-vacuum',          name: 'Aspiradora',             icon: Wind,               category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-supplies',        name: 'Productos de limpieza',  icon: Paintbrush,         category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-mop',             name: 'Fregona / Escoba',       icon: Paintbrush2,        category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-trash',           name: 'Basura / Contenedores',  icon: Trash2,             category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-recycle',         name: 'Reciclaje',              icon: Recycle,            category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-recycle-glass',   name: 'Reciclaje vidrio',       icon: Wine,               category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-recycle-organic', name: 'Residuos orgánicos',     icon: Leaf,               category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-schedule',        name: 'Horario de limpieza',    icon: Calendar,           category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-laundry-room',    name: 'Lavandería',             icon: Shirt,              category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-clotheshorse',    name: 'Tendedero interior',     icon: Wind,               category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-extra-towels',    name: 'Toallas extra',          icon: Droplets,           category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },
  { id: 'cleaning-extra-linen',     name: 'Ropa de cama extra',     icon: Bed,                category: { id: 'cleaning', name: 'Limpieza', color: 'bg-lime-100 text-lime-800 border-lime-200' }, color: 'text-lime-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE K — Servicios ampliados
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'services-concierge',      name: 'Conserjería / Recepción',   icon: UserCheck,   category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-breakfast',      name: 'Desayuno incluido',         icon: Coffee,      category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-airport',        name: 'Transfer aeropuerto',       icon: Plane,       category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-babysitter',     name: 'Canguro / Niñera',          icon: Baby,        category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-grocery',        name: 'Compra a domicilio',        icon: ShoppingCart, category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-chef',           name: 'Chef privado',              icon: ChefHat,     category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-newspaper',      name: 'Periódico diario',          icon: Newspaper,   category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-late-checkout',  name: 'Late check-out',            icon: Clock,       category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-early-checkin',  name: 'Early check-in',            icon: AlarmCheck,  category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-reception-24h',  name: 'Recepción 24h',             icon: Bell,        category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-wheelchair',     name: 'Acceso silla de ruedas',    icon: Accessibility, category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-ev-charger',     name: 'Cargador vehículo eléctrico', icon: PlugZap,   category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-parking-meter',  name: 'Parquímetro / Parking zona', icon: ParkingMeter, category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-bike-rental',    name: 'Alquiler bicicletas',       icon: Bike,        category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-laundry',        name: 'Servicio lavandería',       icon: Shirt,       category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },
  { id: 'services-hotel',          name: 'Hotel / Alojamiento',       icon: Hotel,       category: { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }, color: 'text-yellow-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE L — Viajes ampliados
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'travel-metro',        name: 'Metro / Suburbano',    icon: Train,    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' }, color: 'text-sky-600' },
  { id: 'travel-ferry',        name: 'Ferry / Barca',        icon: Ship,     category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' }, color: 'text-sky-600' },
  { id: 'travel-cable-car',    name: 'Teleférico / Cable',   icon: Cable,    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' }, color: 'text-sky-600' },
  { id: 'travel-cruise',       name: 'Crucero',              icon: Ship,     category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' }, color: 'text-sky-600' },
  { id: 'travel-airport-bus',  name: 'Autobús aeropuerto',   icon: Bus,      category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' }, color: 'text-sky-600' },
  { id: 'travel-hotel-nearby', name: 'Hotel cercano',        icon: Hotel,    category: { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' }, color: 'text-sky-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE M — Naturaleza ampliada
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'nature-lake',          name: 'Lago / Pantano',       icon: Waves,    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' }, color: 'text-amber-600' },
  { id: 'nature-river',         name: 'Río / Arroyo',         icon: Droplets, category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' }, color: 'text-amber-600' },
  { id: 'nature-jungle',        name: 'Selva / Bosque',       icon: Trees,    category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' }, color: 'text-amber-600' },
  { id: 'nature-national-park', name: 'Parque natural',       icon: Leaf,     category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' }, color: 'text-amber-600' },
  { id: 'nature-wildlife',      name: 'Fauna salvaje',        icon: PawPrint, category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' }, color: 'text-amber-600' },
  { id: 'nature-stargazing',    name: 'Astroturismo / Estrellas', icon: Star, category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' }, color: 'text-amber-600' },
  { id: 'nature-aurora',        name: 'Aurora boreal',        icon: Sparkles, category: { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' }, color: 'text-amber-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE N — Entretenimiento
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'ent-cinema',        name: 'Cine en casa',         icon: Clapperboard, category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-popcorn',       name: 'Palomitas / Snacks',   icon: Popcorn,      category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-projector',     name: 'Proyector',            icon: Projector,    category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-streaming',     name: 'Streaming / Smart TV', icon: MonitorPlay,  category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-gaming',        name: 'Videojuegos',          icon: Gamepad2,     category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-boardgames',    name: 'Juegos de mesa',       icon: Dices,        category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-music',         name: 'Música / Altavoces',   icon: Music,        category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-karaoke',       name: 'Karaoke',              icon: Mic,          category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-puzzle',        name: 'Puzzle / Juegos',      icon: Puzzle,       category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-books',         name: 'Biblioteca / Libros',  icon: BookOpen,     category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-trophy',        name: 'Trofeo / Premio',      icon: Trophy,       category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-medal',         name: 'Medalla',              icon: Medal,        category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-jacuzzi',       name: 'Jacuzzi',              icon: JacuzziIcon,  category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },
  { id: 'ent-hottub',        name: 'Bañera de hidromasaje', icon: HotTubIcon,  category: { id: 'entertainment', name: 'Entretenimiento', color: 'bg-pink-100 text-pink-800 border-pink-200' }, color: 'text-pink-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE O — Deporte y bienestar
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'sport-gym',         name: 'Gimnasio / Pesas',     icon: Dumbbell,     category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-yoga',        name: 'Yoga / Meditación',    icon: PersonStanding, category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-cycling',     name: 'Bicicleta / Ciclismo', icon: Bike,         category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-hiking',      name: 'Senderismo / Hiking',  icon: Backpack,     category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-swimming',    name: 'Natación',             icon: Waves,        category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-ski',         name: 'Esquí / Nieve',        icon: MountainSnow, category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-running',     name: 'Running / Footing',    icon: Footprints,   category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-archery',     name: 'Tiro con arco / Diana', icon: Target,      category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-fencing',     name: 'Esgrima / Deportes combate', icon: Swords, category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-winter',      name: 'Deportes de invierno', icon: SunSnow,      category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-sailing',     name: 'Vela / Náutica',       icon: Sailboat,     category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },
  { id: 'sport-tent',        name: 'Camping / Acampada',   icon: Tent,         category: { id: 'sport', name: 'Deporte y bienestar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }, color: 'text-emerald-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE P — Trabajo / Oficina
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'work-laptop',       name: 'Portátil / Teletrabajo', icon: Laptop,     category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-monitor',      name: 'Monitor de escritorio',  icon: Monitor,    category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-wifi',         name: 'WiFi alta velocidad',    icon: Wifi,       category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-printer',      name: 'Impresora',              icon: Printer,    category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-desk',         name: 'Escritorio / Mesa trabajo', icon: LayoutDashboard, category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-pen',          name: 'Material de escritura',  icon: PenLine,    category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-scan',         name: 'Escáner',                icon: ScanLine,   category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-layers',       name: 'Coworking / Workspace',  icon: Layers,     category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-briefcase',    name: 'Maletín / Negocios',     icon: Briefcase,  category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },
  { id: 'work-tools',        name: 'Herramientas',           icon: Hammer,     category: { id: 'work', name: 'Trabajo / Oficina', color: 'bg-slate-100 text-slate-800 border-slate-200' }, color: 'text-slate-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE Q — Gastronomía detallada
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'food-salad',        name: 'Ensalada / Vegano',    icon: Salad,       category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-sandwich',     name: 'Bocadillo / Sandwich', icon: Sandwich,    category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-egg',          name: 'Huevos / Desayuno',   icon: EggFried,    category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-icecream',     name: 'Helado',               icon: IceCream,    category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-icecream2',    name: 'Helado cono',          icon: IceCream2,   category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-cocktail',     name: 'Cóctel / Bar',         icon: Martini,     category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-cherry',       name: 'Fruta / Postre',       icon: Cherry,      category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-grape',        name: 'Uva / Vino',           icon: Grape,       category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-banana',       name: 'Fruta tropical',       icon: Banana,      category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-carrot',       name: 'Verdura / Ecológico',  icon: Carrot,      category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-croissant',    name: 'Panadería / Croissant', icon: Croissant,  category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-cookie',       name: 'Galletas / Dulces',    icon: Cookie,      category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-candy',        name: 'Caramelos / Golosinas', icon: Candy,      category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-donut',        name: 'Donut / Repostería',   icon: Donut,       category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },
  { id: 'food-dessert',      name: 'Pastelería / Postre',  icon: Dessert,     category: { id: 'food', name: 'Gastronomía', color: 'bg-orange-100 text-orange-800 border-orange-200' }, color: 'text-orange-600' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE R — Educación y cultura
  // ─────────────────────────────────────────────────────────────────────────
  { id: 'culture-education',  name: 'Educación / Formación', icon: GraduationCap, category: { id: 'culture', name: 'Cultura y educación', color: 'bg-violet-100 text-violet-800 border-violet-200' }, color: 'text-violet-600' },
  { id: 'culture-art',        name: 'Arte / Pintura',        icon: Palette,       category: { id: 'culture', name: 'Cultura y educación', color: 'bg-violet-100 text-violet-800 border-violet-200' }, color: 'text-violet-600' },
  { id: 'culture-library',    name: 'Biblioteca',            icon: BookOpen,      category: { id: 'culture', name: 'Cultura y educación', color: 'bg-violet-100 text-violet-800 border-violet-200' }, color: 'text-violet-600' },
  { id: 'culture-museum',     name: 'Museo / Galería',       icon: Landmark,      category: { id: 'culture', name: 'Cultura y educación', color: 'bg-violet-100 text-violet-800 border-violet-200' }, color: 'text-violet-600' },
  { id: 'culture-theater',    name: 'Teatro / Espectáculos', icon: Clapperboard,  category: { id: 'culture', name: 'Cultura y educación', color: 'bg-violet-100 text-violet-800 border-violet-200' }, color: 'text-violet-600' },
]