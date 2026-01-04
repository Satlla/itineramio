'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Home,
  Layers,
  FileText,
  Share2,
  QrCode,
  Wifi,
  Car,
  UtensilsCrossed,
  Thermometer,
  Sofa,
  Bed,
  ShowerHead,
  TreePine,
  ScrollText,
  Plug,
  Shield,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  ArrowRight,
  Globe,
  MessageCircle,
  Mail,
  Image,
  Video,
  Type,
  Smartphone,
  MapPin,
  Clock,
  Users,
  Star,
  HelpCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

// Types
type Language = 'es' | 'en' | 'fr'

interface Translation {
  meta: {
    title: string
    description: string
  }
  hero: {
    badge: string
    title: string
    subtitle: string
    cta: string
    watchVideo: string
    timeEstimate: string
  }
  howItWorks: {
    title: string
    subtitle: string
    steps: {
      property: { title: string; description: string }
      zones: { title: string; description: string }
      content: { title: string; description: string }
      share: { title: string; description: string }
    }
  }
  step1: {
    title: string
    subtitle: string
    description: string
    fields: {
      name: string
      description: string
      location: string
      photos: string
      contact: string
    }
    tip: string
    time: string
  }
  step2: {
    title: string
    subtitle: string
    description: string
    whatIsZone: {
      title: string
      description: string
      example: string
    }
    tip: string
  }
  zones: {
    title: string
    subtitle: string
    essential: string
    additional: string
    items: {
      [key: string]: { name: string; description: string; content: string }
    }
    additionalItems: {
      [key: string]: { name: string; description: string }
    }
  }
  step3: {
    title: string
    subtitle: string
    description: string
    contentTypes: {
      text: { title: string; description: string; tips: string[] }
      photos: { title: string; description: string; tips: string[] }
      videos: { title: string; description: string; tips: string[] }
    }
  }
  step4: {
    title: string
    subtitle: string
    description: string
    methods: {
      qr: { title: string; description: string }
      link: { title: string; description: string }
      whatsapp: { title: string; description: string }
    }
  }
  faq: {
    title: string
    items: { question: string; answer: string }[]
  }
  cta: {
    title: string
    subtitle: string
    button: string
    help: string
  }
  footer: {
    copyright: string
    links: {
      terms: string
      privacy: string
      contact: string
    }
  }
}

// Translations
const translations: Record<Language, Translation> = {
  es: {
    meta: {
      title: 'Bienvenido a Itineramio - Guía de inicio',
      description: 'Aprende a crear tu manual digital para huéspedes en 10 minutos'
    },
    hero: {
      badge: 'Guía de inicio rápido',
      title: 'Crea tu manual digital para huéspedes en 10 minutos',
      subtitle: 'Olvídate de explicar lo mismo una y otra vez. Tus huéspedes tendrán toda la información que necesitan en su móvil.',
      cta: 'Crear mi primera propiedad',
      watchVideo: 'Ver video explicativo',
      timeEstimate: '⏱️ Tiempo estimado: 10 minutos'
    },
    howItWorks: {
      title: '¿Cómo funciona Itineramio?',
      subtitle: '4 pasos simples para digitalizar tu alojamiento',
      steps: {
        property: { title: 'Crea tu propiedad', description: 'Añade los datos básicos de tu alojamiento' },
        zones: { title: 'Organiza en zonas', description: 'Divide la información por áreas (WiFi, cocina, normas...)' },
        content: { title: 'Añade contenido', description: 'Fotos, videos y texto explicativo' },
        share: { title: 'Comparte con huéspedes', description: 'QR code, link directo o WhatsApp' }
      }
    },
    step1: {
      title: 'Paso 1',
      subtitle: 'Crea tu primera propiedad',
      description: 'Una propiedad es tu alojamiento: un apartamento, casa, habitación o villa. Puedes tener varias propiedades en tu cuenta.',
      fields: {
        name: 'Nombre del alojamiento',
        description: 'Descripción breve',
        location: 'Dirección y ubicación',
        photos: 'Foto principal',
        contact: 'Datos de contacto del anfitrión'
      },
      tip: '💡 Tip: Usa el nombre que aparece en Airbnb/Booking para que tus huéspedes lo reconozcan',
      time: '⏱️ 3 minutos'
    },
    step2: {
      title: 'Paso 2',
      subtitle: 'Entiende las zonas',
      description: 'Las zonas son las secciones de tu manual digital. Cada zona agrupa instrucciones relacionadas.',
      whatIsZone: {
        title: '¿Qué es una zona?',
        description: 'Una zona es como un "capítulo" de tu guía. Agrupa información relacionada para que tus huéspedes encuentren todo fácilmente.',
        example: 'Ejemplo: La zona "WiFi" contiene el nombre de la red, contraseña, y qué hacer si no conecta.'
      },
      tip: '💡 Tip: Empieza con las zonas esenciales. Siempre puedes añadir más después.'
    },
    zones: {
      title: 'Zonas recomendadas',
      subtitle: 'Itineramio te sugiere estas zonas basadas en miles de alojamientos',
      essential: '13 Zonas esenciales',
      additional: 'Zonas adicionales',
      items: {
        checkin: { name: 'Check-In', description: 'Instrucciones de llegada', content: 'Dirección exacta, código de puerta, ubicación de llaves, instrucciones de parking' },
        checkout: { name: 'Check-Out', description: 'Instrucciones de salida', content: 'Hora de salida, dónde dejar llaves, instrucciones de basura' },
        wifi: { name: 'WiFi', description: 'Conexión a internet', content: 'Nombre de red, contraseña, QR de conexión rápida' },
        parking: { name: 'Parking', description: 'Aparcamiento', content: 'Ubicación, normas, precio si aplica' },
        kitchen: { name: 'Cocina', description: 'Electrodomésticos', content: 'Cómo usar horno, vitrocerámica, cafetera, microondas' },
        climate: { name: 'Climatización', description: 'Aire y calefacción', content: 'Uso de mandos, temperaturas recomendadas' },
        living: { name: 'Salón', description: 'Zona común', content: 'TV, Netflix/streaming, mandos a distancia' },
        bedroom: { name: 'Dormitorio', description: 'Habitaciones', content: 'Ropa de cama extra, enchufes, persianas' },
        bathroom: { name: 'Baño', description: 'Aseo', content: 'Agua caliente, secador, toallas extra' },
        outdoor: { name: 'Exterior', description: 'Jardín o terraza', content: 'Piscina, barbacoa, muebles de exterior' },
        rules: { name: 'Normas', description: 'Reglas de la casa', content: 'Horarios de silencio, mascotas, fiestas, fumar' },
        appliances: { name: 'Electrodomésticos', description: 'Aparatos', content: 'Lavadora, secadora, lavavajillas, aspiradora' },
        security: { name: 'Seguridad', description: 'Emergencias', content: 'Números de emergencia, extintores, salidas, botiquín' }
      },
      additionalItems: {
        surroundings: { name: 'Alrededores', description: 'Restaurantes, supermercados, farmacias cercanas' },
        beach: { name: 'Playas/Naturaleza', description: 'Para propiedades en costa o montaña' },
        transport: { name: 'Transporte', description: 'Cómo llegar en bus, metro, taxi' },
        experiences: { name: 'Experiencias', description: 'Tours, actividades, reservas recomendadas' },
        cleaning: { name: 'Limpieza', description: 'Dónde están productos de limpieza' },
        families: { name: 'Familias', description: 'Cuna, trona, juguetes disponibles' },
        pets: { name: 'Mascotas', description: 'Normas si permites mascotas' },
        work: { name: 'Trabajo remoto', description: 'Zona de trabajo, enchufes, escritorio' }
      }
    },
    step3: {
      title: 'Paso 3',
      subtitle: 'Añade contenido a tus zonas',
      description: 'Cada zona puede tener texto, fotos y videos. Cuanto más visual, mejor entenderán tus huéspedes.',
      contentTypes: {
        text: {
          title: 'Texto',
          description: 'Instrucciones claras y concisas',
          tips: ['Usa frases cortas', 'Incluye datos específicos (códigos, contraseñas)', 'Evita tecnicismos']
        },
        photos: {
          title: 'Fotos',
          description: 'Una imagen vale más que mil palabras',
          tips: ['Foto del electrodoméstico con flechas', 'Captura del mando a distancia', 'Foto de la ubicación de llaves']
        },
        videos: {
          title: 'Videos',
          description: 'Ideal para explicar procesos',
          tips: ['Máximo 30-60 segundos', 'Muestra el paso a paso', 'Sin necesidad de audio']
        }
      }
    },
    step4: {
      title: 'Paso 4',
      subtitle: 'Comparte con tus huéspedes',
      description: 'Tu manual está listo. Ahora tus huéspedes pueden acceder desde cualquier dispositivo.',
      methods: {
        qr: { title: 'Código QR', description: 'Imprímelo y colócalo en tu alojamiento. El huésped escanea y accede al instante.' },
        link: { title: 'Link directo', description: 'Copia el enlace y envíalo por email antes de la llegada.' },
        whatsapp: { title: 'WhatsApp', description: 'Comparte directamente con el huésped por mensaje.' }
      }
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        { question: '¿Mis huéspedes necesitan descargar una app?', answer: 'No. El manual es una página web que funciona en cualquier navegador. No necesitan instalar nada.' },
        { question: '¿Puedo tener varias propiedades?', answer: 'Sí. Puedes gestionar todas tus propiedades desde una sola cuenta. Cada una tiene su propio manual.' },
        { question: '¿En qué idiomas puedo crear el manual?', answer: 'Puedes crear contenido en español, inglés y francés. El huésped elige su idioma preferido.' },
        { question: '¿Puedo editar el manual después de publicarlo?', answer: 'Sí. Cualquier cambio se refleja inmediatamente. No necesitas volver a compartir el link.' },
        { question: '¿Cuánto cuesta Itineramio?', answer: 'Tienes 15 días de prueba gratis. Después, los planes empiezan desde 9€/mes.' },
        { question: '¿Puedo ver cómo queda antes de compartirlo?', answer: 'Sí. Tienes un botón de "Vista previa" para ver exactamente lo que verán tus huéspedes.' }
      ]
    },
    cta: {
      title: '¿Listo para empezar?',
      subtitle: 'Crea tu primer manual digital en menos de 10 minutos',
      button: 'Crear mi primera propiedad',
      help: '¿Necesitas ayuda? Escríbenos a hola@itineramio.com'
    },
    footer: {
      copyright: '© 2024 Itineramio. Todos los derechos reservados.',
      links: {
        terms: 'Términos',
        privacy: 'Privacidad',
        contact: 'Contacto'
      }
    }
  },
  en: {
    meta: {
      title: 'Welcome to Itineramio - Getting Started Guide',
      description: 'Learn how to create your digital guest manual in 10 minutes'
    },
    hero: {
      badge: 'Quick start guide',
      title: 'Create your digital guest manual in 10 minutes',
      subtitle: 'Stop explaining the same things over and over. Your guests will have all the information they need on their phone.',
      cta: 'Create my first property',
      watchVideo: 'Watch explainer video',
      timeEstimate: '⏱️ Estimated time: 10 minutes'
    },
    howItWorks: {
      title: 'How does Itineramio work?',
      subtitle: '4 simple steps to digitize your accommodation',
      steps: {
        property: { title: 'Create your property', description: 'Add basic details about your accommodation' },
        zones: { title: 'Organize into zones', description: 'Divide information by areas (WiFi, kitchen, rules...)' },
        content: { title: 'Add content', description: 'Photos, videos and explanatory text' },
        share: { title: 'Share with guests', description: 'QR code, direct link or WhatsApp' }
      }
    },
    step1: {
      title: 'Step 1',
      subtitle: 'Create your first property',
      description: 'A property is your accommodation: an apartment, house, room or villa. You can have multiple properties in your account.',
      fields: {
        name: 'Property name',
        description: 'Brief description',
        location: 'Address and location',
        photos: 'Main photo',
        contact: 'Host contact details'
      },
      tip: '💡 Tip: Use the name that appears on Airbnb/Booking so your guests recognize it',
      time: '⏱️ 3 minutes'
    },
    step2: {
      title: 'Step 2',
      subtitle: 'Understand zones',
      description: 'Zones are sections of your digital manual. Each zone groups related instructions.',
      whatIsZone: {
        title: 'What is a zone?',
        description: 'A zone is like a "chapter" of your guide. It groups related information so your guests can find everything easily.',
        example: 'Example: The "WiFi" zone contains the network name, password, and what to do if it doesn\'t connect.'
      },
      tip: '💡 Tip: Start with essential zones. You can always add more later.'
    },
    zones: {
      title: 'Recommended zones',
      subtitle: 'Itineramio suggests these zones based on thousands of accommodations',
      essential: '13 Essential zones',
      additional: 'Additional zones',
      items: {
        checkin: { name: 'Check-In', description: 'Arrival instructions', content: 'Exact address, door code, key location, parking instructions' },
        checkout: { name: 'Check-Out', description: 'Departure instructions', content: 'Checkout time, where to leave keys, trash instructions' },
        wifi: { name: 'WiFi', description: 'Internet connection', content: 'Network name, password, quick connect QR' },
        parking: { name: 'Parking', description: 'Parking', content: 'Location, rules, price if applicable' },
        kitchen: { name: 'Kitchen', description: 'Appliances', content: 'How to use oven, stovetop, coffee maker, microwave' },
        climate: { name: 'Climate Control', description: 'AC and heating', content: 'Remote control usage, recommended temperatures' },
        living: { name: 'Living Room', description: 'Common area', content: 'TV, Netflix/streaming, remote controls' },
        bedroom: { name: 'Bedroom', description: 'Bedrooms', content: 'Extra bedding, outlets, blinds' },
        bathroom: { name: 'Bathroom', description: 'Restroom', content: 'Hot water, hairdryer, extra towels' },
        outdoor: { name: 'Outdoor', description: 'Garden or terrace', content: 'Pool, barbecue, outdoor furniture' },
        rules: { name: 'Rules', description: 'House rules', content: 'Quiet hours, pets, parties, smoking' },
        appliances: { name: 'Appliances', description: 'Devices', content: 'Washer, dryer, dishwasher, vacuum' },
        security: { name: 'Security', description: 'Emergencies', content: 'Emergency numbers, extinguishers, exits, first aid' }
      },
      additionalItems: {
        surroundings: { name: 'Surroundings', description: 'Nearby restaurants, supermarkets, pharmacies' },
        beach: { name: 'Beach/Nature', description: 'For coastal or mountain properties' },
        transport: { name: 'Transport', description: 'How to get there by bus, metro, taxi' },
        experiences: { name: 'Experiences', description: 'Tours, activities, recommended bookings' },
        cleaning: { name: 'Cleaning', description: 'Where cleaning supplies are located' },
        families: { name: 'Families', description: 'Available crib, high chair, toys' },
        pets: { name: 'Pets', description: 'Rules if you allow pets' },
        work: { name: 'Remote Work', description: 'Work area, outlets, desk' }
      }
    },
    step3: {
      title: 'Step 3',
      subtitle: 'Add content to your zones',
      description: 'Each zone can have text, photos and videos. The more visual, the better your guests will understand.',
      contentTypes: {
        text: {
          title: 'Text',
          description: 'Clear and concise instructions',
          tips: ['Use short sentences', 'Include specific data (codes, passwords)', 'Avoid technical jargon']
        },
        photos: {
          title: 'Photos',
          description: 'A picture is worth a thousand words',
          tips: ['Photo of appliance with arrows', 'Screenshot of remote control', 'Photo of key location']
        },
        videos: {
          title: 'Videos',
          description: 'Ideal for explaining processes',
          tips: ['Maximum 30-60 seconds', 'Show step by step', 'No audio needed']
        }
      }
    },
    step4: {
      title: 'Step 4',
      subtitle: 'Share with your guests',
      description: 'Your manual is ready. Now your guests can access it from any device.',
      methods: {
        qr: { title: 'QR Code', description: 'Print it and place it in your accommodation. Guests scan and access instantly.' },
        link: { title: 'Direct Link', description: 'Copy the link and send it by email before arrival.' },
        whatsapp: { title: 'WhatsApp', description: 'Share directly with the guest by message.' }
      }
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'Do my guests need to download an app?', answer: 'No. The manual is a web page that works in any browser. They don\'t need to install anything.' },
        { question: 'Can I have multiple properties?', answer: 'Yes. You can manage all your properties from a single account. Each one has its own manual.' },
        { question: 'What languages can I create the manual in?', answer: 'You can create content in Spanish, English and French. Guests choose their preferred language.' },
        { question: 'Can I edit the manual after publishing?', answer: 'Yes. Any changes are reflected immediately. You don\'t need to share the link again.' },
        { question: 'How much does Itineramio cost?', answer: 'You have a 15-day free trial. After that, plans start from €9/month.' },
        { question: 'Can I see how it looks before sharing?', answer: 'Yes. You have a "Preview" button to see exactly what your guests will see.' }
      ]
    },
    cta: {
      title: 'Ready to get started?',
      subtitle: 'Create your first digital manual in less than 10 minutes',
      button: 'Create my first property',
      help: 'Need help? Email us at hola@itineramio.com'
    },
    footer: {
      copyright: '© 2024 Itineramio. All rights reserved.',
      links: {
        terms: 'Terms',
        privacy: 'Privacy',
        contact: 'Contact'
      }
    }
  },
  fr: {
    meta: {
      title: 'Bienvenue sur Itineramio - Guide de démarrage',
      description: 'Apprenez à créer votre manuel numérique pour les voyageurs en 10 minutes'
    },
    hero: {
      badge: 'Guide de démarrage rapide',
      title: 'Créez votre manuel numérique pour voyageurs en 10 minutes',
      subtitle: 'Arrêtez d\'expliquer les mêmes choses encore et encore. Vos voyageurs auront toutes les informations dont ils ont besoin sur leur téléphone.',
      cta: 'Créer ma première propriété',
      watchVideo: 'Voir la vidéo explicative',
      timeEstimate: '⏱️ Temps estimé : 10 minutes'
    },
    howItWorks: {
      title: 'Comment fonctionne Itineramio ?',
      subtitle: '4 étapes simples pour numériser votre hébergement',
      steps: {
        property: { title: 'Créez votre propriété', description: 'Ajoutez les informations de base de votre hébergement' },
        zones: { title: 'Organisez en zones', description: 'Divisez les informations par domaines (WiFi, cuisine, règles...)' },
        content: { title: 'Ajoutez du contenu', description: 'Photos, vidéos et texte explicatif' },
        share: { title: 'Partagez avec les voyageurs', description: 'QR code, lien direct ou WhatsApp' }
      }
    },
    step1: {
      title: 'Étape 1',
      subtitle: 'Créez votre première propriété',
      description: 'Une propriété est votre hébergement : un appartement, une maison, une chambre ou une villa. Vous pouvez avoir plusieurs propriétés dans votre compte.',
      fields: {
        name: 'Nom de l\'hébergement',
        description: 'Brève description',
        location: 'Adresse et emplacement',
        photos: 'Photo principale',
        contact: 'Coordonnées de l\'hôte'
      },
      tip: '💡 Conseil : Utilisez le nom qui apparaît sur Airbnb/Booking pour que vos voyageurs le reconnaissent',
      time: '⏱️ 3 minutes'
    },
    step2: {
      title: 'Étape 2',
      subtitle: 'Comprendre les zones',
      description: 'Les zones sont les sections de votre manuel numérique. Chaque zone regroupe des instructions connexes.',
      whatIsZone: {
        title: 'Qu\'est-ce qu\'une zone ?',
        description: 'Une zone est comme un "chapitre" de votre guide. Elle regroupe les informations connexes pour que vos voyageurs trouvent tout facilement.',
        example: 'Exemple : La zone "WiFi" contient le nom du réseau, le mot de passe et que faire si ça ne se connecte pas.'
      },
      tip: '💡 Conseil : Commencez par les zones essentielles. Vous pouvez toujours en ajouter d\'autres plus tard.'
    },
    zones: {
      title: 'Zones recommandées',
      subtitle: 'Itineramio vous suggère ces zones basées sur des milliers d\'hébergements',
      essential: '13 Zones essentielles',
      additional: 'Zones supplémentaires',
      items: {
        checkin: { name: 'Arrivée', description: 'Instructions d\'arrivée', content: 'Adresse exacte, code de porte, emplacement des clés, instructions de stationnement' },
        checkout: { name: 'Départ', description: 'Instructions de départ', content: 'Heure de départ, où laisser les clés, instructions pour les poubelles' },
        wifi: { name: 'WiFi', description: 'Connexion internet', content: 'Nom du réseau, mot de passe, QR de connexion rapide' },
        parking: { name: 'Parking', description: 'Stationnement', content: 'Emplacement, règles, prix si applicable' },
        kitchen: { name: 'Cuisine', description: 'Électroménager', content: 'Comment utiliser le four, la plaque, la cafetière, le micro-ondes' },
        climate: { name: 'Climatisation', description: 'AC et chauffage', content: 'Utilisation de la télécommande, températures recommandées' },
        living: { name: 'Salon', description: 'Espace commun', content: 'TV, Netflix/streaming, télécommandes' },
        bedroom: { name: 'Chambre', description: 'Chambres', content: 'Literie supplémentaire, prises, stores' },
        bathroom: { name: 'Salle de bain', description: 'Toilettes', content: 'Eau chaude, sèche-cheveux, serviettes supplémentaires' },
        outdoor: { name: 'Extérieur', description: 'Jardin ou terrasse', content: 'Piscine, barbecue, mobilier d\'extérieur' },
        rules: { name: 'Règles', description: 'Règlement intérieur', content: 'Heures de silence, animaux, fêtes, tabac' },
        appliances: { name: 'Appareils', description: 'Équipements', content: 'Lave-linge, sèche-linge, lave-vaisselle, aspirateur' },
        security: { name: 'Sécurité', description: 'Urgences', content: 'Numéros d\'urgence, extincteurs, sorties, premiers secours' }
      },
      additionalItems: {
        surroundings: { name: 'Environs', description: 'Restaurants, supermarchés, pharmacies à proximité' },
        beach: { name: 'Plage/Nature', description: 'Pour les propriétés côtières ou de montagne' },
        transport: { name: 'Transport', description: 'Comment s\'y rendre en bus, métro, taxi' },
        experiences: { name: 'Expériences', description: 'Tours, activités, réservations recommandées' },
        cleaning: { name: 'Ménage', description: 'Où se trouvent les produits de nettoyage' },
        families: { name: 'Familles', description: 'Lit bébé, chaise haute, jouets disponibles' },
        pets: { name: 'Animaux', description: 'Règles si vous acceptez les animaux' },
        work: { name: 'Télétravail', description: 'Espace de travail, prises, bureau' }
      }
    },
    step3: {
      title: 'Étape 3',
      subtitle: 'Ajoutez du contenu à vos zones',
      description: 'Chaque zone peut contenir du texte, des photos et des vidéos. Plus c\'est visuel, mieux vos voyageurs comprendront.',
      contentTypes: {
        text: {
          title: 'Texte',
          description: 'Instructions claires et concises',
          tips: ['Utilisez des phrases courtes', 'Incluez des données spécifiques (codes, mots de passe)', 'Évitez le jargon technique']
        },
        photos: {
          title: 'Photos',
          description: 'Une image vaut mille mots',
          tips: ['Photo de l\'appareil avec des flèches', 'Capture de la télécommande', 'Photo de l\'emplacement des clés']
        },
        videos: {
          title: 'Vidéos',
          description: 'Idéal pour expliquer les processus',
          tips: ['Maximum 30-60 secondes', 'Montrez étape par étape', 'Pas besoin d\'audio']
        }
      }
    },
    step4: {
      title: 'Étape 4',
      subtitle: 'Partagez avec vos voyageurs',
      description: 'Votre manuel est prêt. Maintenant vos voyageurs peuvent y accéder depuis n\'importe quel appareil.',
      methods: {
        qr: { title: 'QR Code', description: 'Imprimez-le et placez-le dans votre hébergement. Les voyageurs scannent et accèdent instantanément.' },
        link: { title: 'Lien direct', description: 'Copiez le lien et envoyez-le par email avant l\'arrivée.' },
        whatsapp: { title: 'WhatsApp', description: 'Partagez directement avec le voyageur par message.' }
      }
    },
    faq: {
      title: 'Questions fréquentes',
      items: [
        { question: 'Mes voyageurs doivent-ils télécharger une application ?', answer: 'Non. Le manuel est une page web qui fonctionne dans n\'importe quel navigateur. Ils n\'ont rien à installer.' },
        { question: 'Puis-je avoir plusieurs propriétés ?', answer: 'Oui. Vous pouvez gérer toutes vos propriétés depuis un seul compte. Chacune a son propre manuel.' },
        { question: 'Dans quelles langues puis-je créer le manuel ?', answer: 'Vous pouvez créer du contenu en espagnol, anglais et français. Les voyageurs choisissent leur langue préférée.' },
        { question: 'Puis-je modifier le manuel après publication ?', answer: 'Oui. Tous les changements sont reflétés immédiatement. Vous n\'avez pas besoin de partager à nouveau le lien.' },
        { question: 'Combien coûte Itineramio ?', answer: 'Vous avez un essai gratuit de 15 jours. Ensuite, les forfaits commencent à partir de 9€/mois.' },
        { question: 'Puis-je voir à quoi ça ressemble avant de partager ?', answer: 'Oui. Vous avez un bouton "Aperçu" pour voir exactement ce que vos voyageurs verront.' }
      ]
    },
    cta: {
      title: 'Prêt à commencer ?',
      subtitle: 'Créez votre premier manuel numérique en moins de 10 minutes',
      button: 'Créer ma première propriété',
      help: 'Besoin d\'aide ? Écrivez-nous à hola@itineramio.com'
    },
    footer: {
      copyright: '© 2024 Itineramio. Tous droits réservés.',
      links: {
        terms: 'Conditions',
        privacy: 'Confidentialité',
        contact: 'Contact'
      }
    }
  }
}

// Zone icons mapping
const zoneIcons: Record<string, any> = {
  checkin: Home,
  checkout: Home,
  wifi: Wifi,
  parking: Car,
  kitchen: UtensilsCrossed,
  climate: Thermometer,
  living: Sofa,
  bedroom: Bed,
  bathroom: ShowerHead,
  outdoor: TreePine,
  rules: ScrollText,
  appliances: Plug,
  security: Shield
}

// Zone colors
const zoneColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500'
]

export default function BienvenidoPage() {
  const [language, setLanguage] = useState<Language>('es')
  const [expandedStep, setExpandedStep] = useState<number | null>(1)
  const [expandedZone, setExpandedZone] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const t = translations[language]

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0]
    if (browserLang === 'en') setLanguage('en')
    else if (browserLang === 'fr') setLanguage('fr')
    else setLanguage('es')
  }, [])

  const copyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const zoneKeys = Object.keys(t.zones.items)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Language Selector - Fixed */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white rounded-full shadow-lg px-2 py-1">
        <Globe className="w-4 h-4 text-gray-500" />
        {(['es', 'en', 'fr'] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              language === lang
                ? 'bg-violet-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Share Button - Fixed */}
      <button
        onClick={copyPageUrl}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        {copied ? (language === 'es' ? 'Copiado' : language === 'en' ? 'Copied' : 'Copié') : (language === 'es' ? 'Copiar enlace' : language === 'en' ? 'Copy link' : 'Copier le lien')}
      </button>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4" />
            {t.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
          >
            {t.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/25"
            >
              {t.hero.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-500"
          >
            {t.hero.timeEstimate}
          </motion.p>
        </div>
      </section>

      {/* How It Works - Visual Flow */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.howItWorks.title}</h2>
            <p className="text-gray-600">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {Object.entries(t.howItWorks.steps).map(([key, step], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-gray-50 rounded-2xl p-6 h-full hover:bg-violet-50 transition-all group">
                  <div className="w-12 h-12 bg-violet-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 1: Create Property */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div
              className="p-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 1 ? null : 1)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-violet-200 text-sm">{t.step1.title}</p>
                    <h3 className="text-2xl font-bold">{t.step1.subtitle}</h3>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedStep === 1 ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {expandedStep === 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    <p className="text-gray-600">{t.step1.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(t.step1.fields).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                      <p className="text-violet-700">{t.step1.tip}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-gray-500">{t.step1.time}</span>
                      <Link
                        href="/properties/new"
                        className="inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700"
                      >
                        {t.hero.cta}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Step 2: Understand Zones */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div
              className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 2 ? null : 2)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">{t.step2.title}</p>
                    <h3 className="text-2xl font-bold">{t.step2.subtitle}</h3>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedStep === 2 ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {expandedStep === 2 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    <p className="text-gray-600">{t.step2.description}</p>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h4 className="font-semibold text-blue-900 mb-2">{t.step2.whatIsZone.title}</h4>
                      <p className="text-blue-700 mb-4">{t.step2.whatIsZone.description}</p>
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <p className="text-gray-600 italic">{t.step2.whatIsZone.example}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-yellow-700">{t.step2.tip}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Zones Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.zones.title}</h2>
            <p className="text-gray-600">{t.zones.subtitle}</p>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-6">{t.zones.essential}</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {zoneKeys.map((key, index) => {
              const zone = t.zones.items[key]
              const Icon = zoneIcons[key] || Layers
              const isExpanded = expandedZone === key

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                    isExpanded ? 'border-violet-500 shadow-lg' : 'border-gray-200 hover:border-violet-300'
                  }`}
                  onClick={() => setExpandedZone(isExpanded ? null : key)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${zoneColors[index % zoneColors.length]} rounded-lg flex items-center justify-center text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                        <p className="text-sm text-gray-500">{zone.description}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-4 bg-gray-50">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">
                              {language === 'es' ? 'Contenido sugerido:' : language === 'en' ? 'Suggested content:' : 'Contenu suggéré :'}
                            </span>{' '}
                            {zone.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-6">{t.zones.additional}</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(t.zones.additionalItems).map(([key, zone], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-violet-300 transition-all"
              >
                <h4 className="font-medium text-gray-900 mb-1">{zone.name}</h4>
                <p className="text-sm text-gray-500">{zone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 3: Add Content */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div
              className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 3 ? null : 3)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-green-200 text-sm">{t.step3.title}</p>
                    <h3 className="text-2xl font-bold">{t.step3.subtitle}</h3>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedStep === 3 ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {expandedStep === 3 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    <p className="text-gray-600">{t.step3.description}</p>

                    <div className="grid md:grid-cols-3 gap-6">
                      {Object.entries(t.step3.contentTypes).map(([key, content]) => {
                        const icons = { text: Type, photos: Image, videos: Video }
                        const Icon = icons[key as keyof typeof icons]
                        const colors = { text: 'blue', photos: 'purple', videos: 'red' }
                        const color = colors[key as keyof typeof colors]

                        return (
                          <div key={key} className={`bg-${color}-50 rounded-xl p-5 border border-${color}-200`}>
                            <div className={`w-10 h-10 bg-${color}-500 text-white rounded-lg flex items-center justify-center mb-4`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <h4 className={`font-semibold text-${color}-900 mb-2`}>{content.title}</h4>
                            <p className={`text-sm text-${color}-700 mb-4`}>{content.description}</p>
                            <ul className="space-y-2">
                              {content.tips.map((tip, i) => (
                                <li key={i} className={`text-sm text-${color}-600 flex items-start gap-2`}>
                                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Step 4: Share */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div
              className="p-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 4 ? null : 4)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-orange-200 text-sm">{t.step4.title}</p>
                    <h3 className="text-2xl font-bold">{t.step4.subtitle}</h3>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedStep === 4 ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {expandedStep === 4 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    <p className="text-gray-600">{t.step4.description}</p>

                    <div className="grid md:grid-cols-3 gap-6">
                      {Object.entries(t.step4.methods).map(([key, method]) => {
                        const icons = { qr: QrCode, link: ExternalLink, whatsapp: MessageCircle }
                        const Icon = icons[key as keyof typeof icons]

                        return (
                          <div key={key} className="bg-gray-50 rounded-xl p-5 text-center hover:bg-orange-50 transition-all">
                            <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Icon className="w-7 h-7" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{method.title}</h4>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="w-12 h-12 text-violet-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">{t.faq.title}</h2>
          </div>

          <div className="space-y-4">
            {t.faq.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-all"
                >
                  <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100"
                    >
                      <p className="p-5 text-gray-600">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.cta.title}</h2>
            <p className="text-xl text-violet-200 mb-8">{t.cta.subtitle}</p>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold hover:bg-violet-50 transition-all shadow-lg"
            >
              {t.cta.button}
              <ArrowRight className="w-5 h-5" />
            </Link>

            <p className="mt-8 text-violet-200 text-sm">
              {t.cta.help}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">{t.footer.copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="/legal/terms" className="text-sm text-gray-500 hover:text-gray-700">
              {t.footer.links.terms}
            </Link>
            <Link href="/legal/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              {t.footer.links.privacy}
            </Link>
            <a href="mailto:hola@itineramio.com" className="text-sm text-gray-500 hover:text-gray-700">
              {t.footer.links.contact}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
