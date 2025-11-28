/**
 * Base de datos de contenido de ayuda searchable
 * Incluye: FAQs, guías, recursos, tutoriales
 */

export interface HelpContent {
  id: string
  type: 'faq' | 'guide' | 'resource' | 'tutorial' | 'blog'
  title: string
  description: string
  content: string
  tags: string[]
  url: string
  category: string
}

export const HELP_CONTENT: HelpContent[] = [
  // FAQs
  {
    id: 'faq-1',
    type: 'faq',
    title: '¿Cómo creo mi primer manual digital?',
    description: 'Guía paso a paso para crear tu primer manual en Itineramio',
    content: 'Primero, crea una propiedad en tu dashboard. Luego añade zonas (como WiFi, check-in, etc.) y para cada zona crea pasos con instrucciones detalladas. Puedes incluir texto, imágenes y videos.',
    tags: ['manual', 'crear', 'primero', 'inicio', 'tutorial', 'dashboard', 'propiedad', 'zonas', 'pasos'],
    url: '/help#faq-1',
    category: 'Primeros Pasos'
  },
  {
    id: 'faq-2',
    type: 'faq',
    title: '¿Cómo funcionan los códigos QR?',
    description: 'Explicación sobre la generación y uso de códigos QR',
    content: 'Cada zona genera automáticamente un código QR único. Los huéspedes lo escanean con su móvil y acceden directamente a las instrucciones de esa zona específica.',
    tags: ['qr', 'código', 'escanear', 'zona', 'automático', 'huésped', 'móvil'],
    url: '/help#faq-2',
    category: 'Códigos QR'
  },
  {
    id: 'faq-3',
    type: 'faq',
    title: '¿Puedo personalizar el diseño del manual?',
    description: 'Opciones de personalización disponibles',
    content: 'Sí, puedes personalizar colores, iconos y agregar tu logo. También puedes organizar las zonas según tus necesidades específicas.',
    tags: ['personalizar', 'diseño', 'colores', 'logo', 'iconos', 'organizar', 'zonas'],
    url: '/help#faq-3',
    category: 'Personalización'
  },
  {
    id: 'faq-4',
    type: 'faq',
    title: '¿Es compatible con todos los dispositivos?',
    description: 'Compatibilidad multiplataforma',
    content: 'Absolutamente. Los manuales están optimizados para móviles, tablets y ordenadores. No requieren apps adicionales.',
    tags: ['compatible', 'dispositivos', 'móvil', 'tablet', 'ordenador', 'app', 'optimizado'],
    url: '/help#faq-4',
    category: 'Compatibilidad'
  },
  {
    id: 'faq-5',
    type: 'faq',
    title: '¿Cómo actualizo la información?',
    description: 'Proceso de actualización de contenido',
    content: 'Los cambios se aplican en tiempo real. Cuando actualizas información en tu dashboard, todos los códigos QR muestran automáticamente el contenido actualizado.',
    tags: ['actualizar', 'información', 'tiempo real', 'cambios', 'dashboard', 'qr', 'contenido'],
    url: '/help#faq-5',
    category: 'Gestión de Contenido'
  },
  {
    id: 'faq-6',
    type: 'faq',
    title: '¿Qué pasa si mis huéspedes no hablan español?',
    description: 'Soporte multiidioma',
    content: 'Itineramio soporta múltiples idiomas. Puedes crear contenido en español, inglés y francés para el mismo manual.',
    tags: ['idiomas', 'multiidioma', 'español', 'inglés', 'francés', 'huéspedes', 'internacional'],
    url: '/help#faq-6',
    category: 'Idiomas'
  },

  // Guías rápidas
  {
    id: 'guide-wifi',
    type: 'guide',
    title: 'Cómo configurar zona WiFi',
    description: 'Tutorial para crear una zona de WiFi con código QR',
    content: 'Crear una zona WiFi es muy simple. Ve a Propiedades > Zonas > Nueva Zona. Selecciona el icono WiFi, añade el nombre de tu red y contraseña. El código QR se genera automáticamente para que tus huéspedes accedan fácilmente.',
    tags: ['wifi', 'zona', 'crear', 'qr', 'red', 'contraseña', 'internet', 'conexión'],
    url: '/help#guide-wifi',
    category: 'Guías Rápidas'
  },
  {
    id: 'guide-checkin',
    type: 'guide',
    title: 'Instrucciones de Check-in',
    description: 'Cómo crear instrucciones de check-in efectivas',
    content: 'Para el check-in, crea una zona dedicada con pasos claros: dirección exacta, cómo llegar, dónde encontrar las llaves, código de acceso. Añade fotos de la entrada para facilitar la llegada.',
    tags: ['check-in', 'llegada', 'llaves', 'acceso', 'entrada', 'direccion', 'instrucciones'],
    url: '/help#guide-checkin',
    category: 'Guías Rápidas'
  },

  // Recursos descargables
  {
    id: 'resource-estratega',
    type: 'resource',
    title: 'El Manual del Estratega - 5 KPIs',
    description: 'Guía completa para hosts que buscan optimizar métricas',
    content: 'Descarga la guía completa sobre los 5 KPIs esenciales para gestionar tu alojamiento como un profesional. Incluye plantillas y ejemplos reales.',
    tags: ['kpi', 'métricas', 'estratega', 'optimizar', 'gestión', 'profesional', 'guía'],
    url: '/recursos/estratega-5-kpis',
    category: 'Recursos Descargables'
  },
  {
    id: 'resource-sistematico',
    type: 'resource',
    title: 'Las 47 Tareas del Sistemático',
    description: 'Checklist completo para operaciones sistemáticas',
    content: 'Descarga el checklist de las 47 tareas esenciales para tener un alojamiento impecable. Perfecto para hosts organizados que no quieren dejar nada al azar.',
    tags: ['checklist', 'tareas', 'sistemático', 'organización', 'operaciones', 'limpieza'],
    url: '/recursos/sistematico-47-tareas',
    category: 'Recursos Descargables'
  },

  // Tutoriales
  {
    id: 'tutorial-primeros-pasos',
    type: 'tutorial',
    title: 'Primeros pasos en Itineramio',
    description: 'Tutorial completo para nuevos usuarios',
    content: 'Aprende a usar Itineramio desde cero: crear cuenta, añadir tu primera propiedad, configurar zonas, generar QRs y compartir con tus huéspedes. Video tutorial incluido.',
    tags: ['tutorial', 'primeros pasos', 'inicio', 'cuenta', 'propiedad', 'configurar', 'video'],
    url: '/help#tutorial-primeros-pasos',
    category: 'Tutoriales'
  },
  {
    id: 'tutorial-qr-avanzado',
    type: 'tutorial',
    title: 'Uso avanzado de códigos QR',
    description: 'Maximiza el potencial de los códigos QR',
    content: 'Descubre trucos avanzados: dónde colocar los QRs, cómo imprimirlos, ideas creativas de ubicación, y cómo trackear su uso para mejorar la experiencia del huésped.',
    tags: ['qr', 'avanzado', 'trucos', 'imprimir', 'colocar', 'tracking', 'experiencia'],
    url: '/help#tutorial-qr-avanzado',
    category: 'Tutoriales'
  },
  {
    id: 'tutorial-multiidioma',
    type: 'tutorial',
    title: 'Crear manuales multiidioma',
    description: 'Guía para configurar múltiples idiomas',
    content: 'Aprende a crear manuales en varios idiomas para atraer huéspedes internacionales. Sistema de detección automática de idioma incluido.',
    tags: ['multiidioma', 'idiomas', 'internacional', 'traducir', 'español', 'inglés', 'francés'],
    url: '/help#tutorial-multiidioma',
    category: 'Tutoriales'
  },

  // Solución de problemas
  {
    id: 'troubleshoot-qr-no-funciona',
    type: 'guide',
    title: 'El código QR no funciona',
    description: 'Soluciones cuando un QR no escanea correctamente',
    content: 'Si el QR no escanea: 1) Verifica que tenga buen contraste, 2) Asegúrate de que sea lo suficientemente grande (mínimo 3x3 cm), 3) Prueba con diferentes apps de escaneo, 4) Re-genera el código desde el dashboard.',
    tags: ['qr', 'problema', 'no funciona', 'escanear', 'solución', 'troubleshooting', 'error'],
    url: '/help#troubleshoot-qr',
    category: 'Solución de Problemas'
  },
  {
    id: 'troubleshoot-login',
    type: 'guide',
    title: 'No puedo iniciar sesión',
    description: 'Recuperación de acceso a la cuenta',
    content: 'Si no puedes acceder: 1) Verifica tu email, 2) Usa "Olvidé mi contraseña", 3) Revisa tu carpeta de spam para el email de verificación, 4) Contacta soporte si persiste el problema.',
    tags: ['login', 'sesión', 'acceso', 'contraseña', 'problema', 'cuenta', 'recuperar'],
    url: '/help#troubleshoot-login',
    category: 'Solución de Problemas'
  },

  // Integraciones
  {
    id: 'integration-airbnb',
    type: 'guide',
    title: 'Integración con Airbnb',
    description: 'Cómo compartir tu manual con huéspedes de Airbnb',
    content: 'Comparte tu manual de Itineramio con huéspedes de Airbnb de forma automática. Incluye el enlace en tu mensaje de bienvenida o en las instrucciones de la casa.',
    tags: ['airbnb', 'integración', 'compartir', 'mensaje', 'bienvenida', 'huésped'],
    url: '/help#integration-airbnb',
    category: 'Integraciones'
  },
  {
    id: 'integration-booking',
    type: 'guide',
    title: 'Integración con Booking.com',
    description: 'Usar Itineramio con reservas de Booking',
    content: 'Facilita la estancia de tus huéspedes de Booking compartiendo el manual digital. Añade el enlace en el email de confirmación o en tu perfil de la plataforma.',
    tags: ['booking', 'integración', 'compartir', 'reservas', 'confirmación', 'perfil'],
    url: '/help#integration-booking',
    category: 'Integraciones'
  },
]
