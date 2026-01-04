// Onboarding Center - Articles Database
// Centro de documentación completo para Itineramio

export interface OnboardingArticle {
  id: string
  slug: string
  category: string
  categorySlug: string
  title: string
  description: string
  content: ArticleSection[]
  relatedArticles?: string[] // IDs of related articles
  readingTime: number // in minutes
  views?: number
  likes?: number // Users who found it helpful
  dislikes?: number // Users who didn't find it helpful
  order: number
  keywords: string[]
  lastUpdated: string
}

export interface ArticleSection {
  type: 'heading' | 'paragraph' | 'steps' | 'tip' | 'warning' | 'image' | 'video' | 'note' | 'list'
  content?: string
  items?: string[]
  level?: number // for headings: 2, 3, 4
  src?: string // for images/videos
  alt?: string
  caption?: string
}

export interface OnboardingCategory {
  slug: string
  name: string
  description: string
  icon: string
  order: number
  color: string
}

// Categories
export const onboardingCategories: OnboardingCategory[] = [
  {
    slug: 'empezar',
    name: 'Empezar',
    description: 'Primeros pasos con Itineramio',
    icon: 'Rocket',
    order: 1,
    color: 'violet'
  },
  {
    slug: 'propiedades',
    name: 'Propiedades',
    description: 'Gestiona tus alojamientos',
    icon: 'Home',
    order: 2,
    color: 'blue'
  },
  {
    slug: 'conjuntos',
    name: 'Conjuntos',
    description: 'Agrupa varias propiedades',
    icon: 'Layers',
    order: 3,
    color: 'purple'
  },
  {
    slug: 'zonas',
    name: 'Zonas',
    description: 'Organiza la información',
    icon: 'LayoutGrid',
    order: 4,
    color: 'green'
  },
  {
    slug: 'contenido',
    name: 'Contenido',
    description: 'Añade texto, fotos y videos',
    icon: 'FileText',
    order: 5,
    color: 'orange'
  },
  {
    slug: 'compartir',
    name: 'Compartir',
    description: 'QR, links y WhatsApp',
    icon: 'Share2',
    order: 6,
    color: 'pink'
  },
  {
    slug: 'estadisticas',
    name: 'Estadísticas',
    description: 'Analiza las visitas',
    icon: 'BarChart3',
    order: 7,
    color: 'cyan'
  },
  {
    slug: 'cuenta',
    name: 'Mi cuenta',
    description: 'Perfil y configuración',
    icon: 'User',
    order: 8,
    color: 'slate'
  },
  {
    slug: 'facturacion',
    name: 'Facturación',
    description: 'Planes, pagos y facturas',
    icon: 'CreditCard',
    order: 9,
    color: 'emerald'
  },
  {
    slug: 'avisos',
    name: 'Avisos',
    description: 'Comunicaciones para huéspedes',
    icon: 'Bell',
    order: 10,
    color: 'amber'
  }
]

// Articles
export const onboardingArticles: OnboardingArticle[] = [
  // ============================================
  // EMPEZAR
  // ============================================
  {
    id: 'crear-cuenta',
    slug: 'crear-cuenta',
    category: 'Empezar',
    categorySlug: 'empezar',
    title: 'Cómo crear una cuenta en Itineramio',
    description: 'Aprende a registrarte y activar tu cuenta en menos de 2 minutos.',
    readingTime: 2,
    order: 1,
    keywords: ['crear cuenta', 'registrarse', 'registro', 'nueva cuenta', 'sign up'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Crear una cuenta en Itineramio es rápido y sencillo. Sigue estos pasos para empezar a crear manuales digitales para tus huéspedes.' },
      { type: 'heading', content: 'Pasos para crear tu cuenta', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a itineramio.com y haz clic en "Registrarse" en la esquina superior derecha.',
          'Introduce tu nombre, email y una contraseña segura.',
          'Haz clic en "Crear cuenta".',
          'Revisa tu bandeja de entrada y haz clic en el enlace de verificación.',
          '¡Listo! Ya puedes acceder a tu panel de control.'
        ]
      },
      { type: 'tip', content: 'Usa el mismo email que tienes en Airbnb o Booking para mantener todo organizado.' },
      { type: 'heading', content: '¿No recibes el email de verificación?', level: 2 },
      {
        type: 'list',
        items: [
          'Revisa tu carpeta de spam o correo no deseado.',
          'Asegúrate de que escribiste bien tu email.',
          'Espera unos minutos, a veces tarda un poco.',
          'Si sigue sin llegar, haz clic en "Reenviar email" en la página de verificación.'
        ]
      },
      { type: 'note', content: 'Al verificar tu email, se activa automáticamente tu periodo de prueba de 15 días con acceso completo.' }
    ],
    relatedArticles: ['verificar-email', 'primeros-pasos', 'crear-primera-propiedad']
  },
  {
    id: 'verificar-email',
    slug: 'verificar-email',
    category: 'Empezar',
    categorySlug: 'empezar',
    title: 'Verificar tu dirección de email',
    description: 'Por qué es importante verificar tu email y cómo hacerlo.',
    readingTime: 1,
    order: 2,
    keywords: ['verificar', 'email', 'correo', 'confirmar', 'activar cuenta'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'La verificación de email es necesaria para activar tu cuenta y empezar a usar Itineramio.' },
      { type: 'heading', content: '¿Por qué verificar el email?', level: 2 },
      {
        type: 'list',
        items: [
          'Confirma que eres el propietario del email.',
          'Activa tu periodo de prueba de 15 días.',
          'Te permite recibir notificaciones importantes.',
          'Protege tu cuenta de accesos no autorizados.'
        ]
      },
      { type: 'heading', content: 'Cómo verificar tu email', level: 2 },
      {
        type: 'steps',
        items: [
          'Abre tu bandeja de entrada.',
          'Busca el email de "Itineramio" con asunto "Confirma tu cuenta".',
          'Haz clic en el botón "Confirmar mi cuenta".',
          'Serás redirigido automáticamente a tu panel de control.'
        ]
      },
      { type: 'warning', content: 'El enlace de verificación expira en 24 horas. Si caduca, solicita uno nuevo desde la página de login.' }
    ],
    relatedArticles: ['crear-cuenta', 'primeros-pasos']
  },
  {
    id: 'primeros-pasos',
    slug: 'primeros-pasos',
    category: 'Empezar',
    categorySlug: 'empezar',
    title: 'Primeros pasos en Itineramio',
    description: 'Guía rápida para configurar tu primera propiedad y compartirla con huéspedes.',
    readingTime: 5,
    order: 3,
    keywords: ['primeros pasos', 'empezar', 'guía', 'inicio', 'tutorial'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Bienvenido a Itineramio. En esta guía te explicamos cómo configurar todo en menos de 10 minutos.' },
      { type: 'heading', content: 'Resumen de lo que harás', level: 2 },
      {
        type: 'steps',
        items: [
          'Crear tu primera propiedad (2 min)',
          'Añadir zonas con información útil (5 min)',
          'Generar el código QR (1 min)',
          'Compartir con tus huéspedes (1 min)'
        ]
      },
      { type: 'heading', content: 'Paso 1: Crea tu primera propiedad', level: 2 },
      { type: 'paragraph', content: 'Una propiedad es tu alojamiento: un apartamento, casa, habitación o villa. Desde tu panel de control:' },
      {
        type: 'steps',
        items: [
          'Haz clic en "Crear nueva propiedad".',
          'Escribe el nombre (el mismo que usas en Airbnb/Booking).',
          'Añade la dirección completa.',
          'Sube una foto principal.',
          'Guarda los cambios.'
        ]
      },
      { type: 'heading', content: 'Paso 2: Personaliza las zonas esenciales', level: 2 },
      { type: 'paragraph', content: 'Cuando creas una propiedad, Itineramio genera automáticamente las zonas esenciales con plantillas predefinidas. Estas zonas son:' },
      {
        type: 'list',
        items: [
          'Check-in: Instrucciones de llegada, código de puerta, llaves.',
          'WiFi: Nombre de red y contraseña.',
          'Normas: Horarios de silencio, basura, mascotas.',
          'Check-out: Hora de salida, dónde dejar llaves.',
          'Contacto: Datos del anfitrión para emergencias.',
          'Y más zonas útiles según el tipo de alojamiento.'
        ]
      },
      { type: 'tip', content: 'Las plantillas vienen con textos de ejemplo que solo tienes que personalizar con los datos de tu alojamiento. Puedes modificar, eliminar o añadir nuevas zonas en cualquier momento.' },
      { type: 'heading', content: 'Traducción automática en 3 idiomas', level: 3 },
      { type: 'paragraph', content: 'Todas las zonas vienen traducidas automáticamente en Español, Francés e Inglés. Tus huéspedes verán el manual en su idioma preferido.' },
      { type: 'warning', content: 'Importante: Cuando modifiques el contenido de una zona en tu idioma principal, recuerda traducir los cambios a los otros idiomas para mantener la coherencia. Puedes hacerlo desde el botón "Traducciones" dentro de cada zona.' },
      { type: 'heading', content: 'Paso 3: Activa y comparte tu propiedad', level: 2 },
      { type: 'paragraph', content: 'Antes de compartir, asegúrate de que tu propiedad esté activa para que los huéspedes puedan verla.' },
      { type: 'heading', content: 'Activar tu propiedad', level: 3 },
      {
        type: 'steps',
        items: [
          'Entra en tu propiedad.',
          'Si ves un banner amarillo en la parte superior que dice "Propiedad inactiva", haz clic en "Activar propiedad".',
          'Una vez activa, tus huéspedes ya podrán ver tu guía digital.'
        ]
      },
      { type: 'heading', content: 'Formas de compartir', level: 3 },
      { type: 'paragraph', content: 'Tienes varias formas de enviar tu manual a los huéspedes:' },
      {
        type: 'list',
        items: [
          'Código QR: Descárgalo e imprímelo para colocarlo en tu alojamiento.',
          'Enlace directo: Copia la URL y pégala en tu mensaje de Airbnb/Booking.',
          'WhatsApp: Envía el enlace directamente al móvil del huésped.',
          'Enlace a zona específica: Comparte solo una sección, como el check-in.'
        ]
      },
      { type: 'heading', content: 'Cómo copiar el enlace o compartir una zona específica', level: 3 },
      {
        type: 'steps',
        items: [
          'Entra en tu propiedad.',
          'Pulsa en los tres puntos (⋮) en la parte superior derecha.',
          'Selecciona "Copiar URL" para copiar el enlace completo.',
          'Para compartir una zona específica (ej: Check-in), entra en esa zona y pulsa en los tres puntos > "Copiar URL de esta zona".',
          'Pega el enlace en tu mensaje al huésped.'
        ]
      },
      { type: 'tip', content: 'Añade el enlace a tu plantilla de mensaje automático en Airbnb/Booking. Así cada huésped recibirá el manual automáticamente con su reserva.' },
      { type: 'note', content: 'El código QR y el enlace siempre apuntan a la misma URL. Si actualizas el contenido de tu manual, no necesitas generar un nuevo QR ni cambiar el enlace.' }
    ],
    relatedArticles: ['crear-primera-propiedad', 'que-es-una-zona', 'imprimir-qr']
  },
  {
    id: 'panel-de-control',
    slug: 'panel-de-control',
    category: 'Empezar',
    categorySlug: 'empezar',
    title: 'Conoce tu panel de control',
    description: 'Descubre todas las secciones de tu dashboard y para qué sirve cada una.',
    readingTime: 4,
    order: 4,
    keywords: ['panel', 'dashboard', 'control', 'inicio', 'navegación', 'estadísticas', 'analíticas'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'El panel de control (Dashboard) es tu centro de operaciones en Itineramio. Desde aquí gestionas todas tus propiedades y tienes acceso a las analíticas en tiempo real para saber cómo funcionan tus alojamientos.' },
      { type: 'heading', content: 'Dashboard: Analíticas en tiempo real', level: 2 },
      { type: 'paragraph', content: 'Nada más entrar al Dashboard verás un resumen completo del rendimiento de todas tus propiedades:' },
      {
        type: 'list',
        items: [
          'Minutos ahorrados: El tiempo que has ahorrado gracias a que tus huéspedes consultan el manual en lugar de llamarte.',
          'Vistas totales: Número de veces que tus huéspedes han visitado tus manuales.',
          'Zonas vistas: Total de zonas consultadas por todos tus huéspedes (WiFi, Check-in, Normas, etc.).',
          'Propiedades activas/inactivas: De un vistazo sabes cuántas propiedades están publicadas y visibles.'
        ]
      },
      { type: 'tip', content: 'Los minutos ahorrados se calculan automáticamente. Cada consulta al manual equivale a una posible llamada o mensaje que no has tenido que responder.' },
      { type: 'heading', content: 'Actividad reciente', level: 2 },
      { type: 'paragraph', content: 'En la sección de actividad reciente puedes ver:' },
      {
        type: 'list',
        items: [
          'Evaluaciones recibidas: Cuando un huésped valora tu manual, aparece aquí.',
          'Nuevas visitas: Quién ha consultado tus propiedades recientemente.',
          'Cambios en tus propiedades: Historial de las últimas modificaciones.'
        ]
      },
      { type: 'heading', content: 'Tus propiedades', level: 2 },
      { type: 'paragraph', content: 'Verás todas tus propiedades en formato de tarjetas. Cada tarjeta muestra:' },
      {
        type: 'list',
        items: [
          'Foto y nombre de la propiedad.',
          'Estado: Activa (verde) o Inactiva (gris).',
          'Número de zonas configuradas.',
          'Vistas recientes.'
        ]
      },
      { type: 'heading', content: 'Conjuntos', level: 2 },
      { type: 'paragraph', content: 'Si tienes varias propiedades, puedes agruparlas en Conjuntos para gestionarlas más fácilmente. En el Dashboard verás los conjuntos que tienes creados y cuántas propiedades incluye cada uno.' },
      { type: 'note', content: '¿No sabes qué es un Conjunto? Lee nuestro artículo "¿Qué es un conjunto y para qué sirve?" en la sección de Conjuntos del centro de ayuda.' },
      { type: 'heading', content: 'Menú de navegación', level: 2 },
      { type: 'paragraph', content: 'Desde el menú lateral puedes acceder a:' },
      {
        type: 'list',
        items: [
          'Propiedades: Lista completa de todos tus alojamientos.',
          'Conjuntos: Gestión de grupos de propiedades.',
          'Cuenta: Tu perfil, email y contraseña.',
          'Facturación: Plan actual, facturas y métodos de pago.'
        ]
      },
      { type: 'heading', content: 'Accesos rápidos', level: 2 },
      { type: 'paragraph', content: 'En la parte superior encontrarás:' },
      {
        type: 'list',
        items: [
          'Botón "Nueva propiedad" para crear rápidamente.',
          'Icono de notificaciones para ver alertas y evaluaciones.',
          'Tu foto de perfil para acceder a configuración y cerrar sesión.'
        ]
      }
    ],
    relatedArticles: ['primeros-pasos', 'crear-primera-propiedad', 'que-es-conjunto']
  },

  // ============================================
  // PROPIEDADES
  // ============================================
  {
    id: 'crear-primera-propiedad',
    slug: 'crear-propiedad',
    category: 'Propiedades',
    categorySlug: 'propiedades',
    title: 'Cómo crear una propiedad',
    description: 'Guía paso a paso para añadir tu primer alojamiento a Itineramio.',
    readingTime: 3,
    order: 1,
    keywords: ['crear propiedad', 'nueva propiedad', 'añadir', 'alojamiento', 'apartamento'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Una propiedad en Itineramio representa un alojamiento: puede ser un apartamento, casa, habitación, villa o cualquier tipo de hospedaje.' },
      { type: 'heading', content: 'Pasos para crear una propiedad', level: 2 },
      {
        type: 'steps',
        items: [
          'Desde tu panel de control, haz clic en "Crear nueva propiedad" o en el botón "+" en la esquina.',
          'Introduce el nombre de tu propiedad. Usa el mismo nombre que aparece en Airbnb/Booking para que tus huéspedes lo reconozcan.',
          'Añade una descripción breve (opcional pero recomendado).',
          'Introduce la dirección completa del alojamiento.',
          'Sube una foto principal que represente tu propiedad.',
          'Añade tus datos de contacto como anfitrión (teléfono, WhatsApp).',
          'Haz clic en "Crear propiedad".'
        ]
      },
      { type: 'tip', content: 'La foto principal es lo primero que verán tus huéspedes. Elige una imagen clara y atractiva de tu alojamiento.' },
      { type: 'heading', content: '¿Qué información es obligatoria?', level: 2 },
      {
        type: 'list',
        items: [
          'Nombre de la propiedad (obligatorio)',
          'Dirección (recomendado para que aparezca el mapa)',
          'Foto principal (muy recomendado)'
        ]
      },
      { type: 'note', content: 'Puedes editar todos estos datos después. No te preocupes si no tienes todo listo ahora.' }
    ],
    relatedArticles: ['editar-propiedad', 'cambiar-titulo-propiedad', 'subir-foto-principal']
  },
  {
    id: 'editar-propiedad',
    slug: 'editar-propiedad',
    category: 'Propiedades',
    categorySlug: 'propiedades',
    title: 'Cómo editar una propiedad',
    description: 'Modifica el nombre, descripción, fotos y datos de contacto de tu propiedad.',
    readingTime: 2,
    order: 2,
    keywords: ['editar', 'modificar', 'cambiar', 'propiedad', 'actualizar'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes editar cualquier información de tu propiedad en cualquier momento. Los cambios se reflejan inmediatamente.' },
      { type: 'heading', content: 'Cómo acceder a la edición', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu panel de control.',
          'Haz clic en la propiedad que quieres editar.',
          'Haz clic en "Editar propiedad" o en el icono del lápiz.',
          'Modifica los campos que necesites.',
          'Haz clic en "Guardar cambios".'
        ]
      },
      { type: 'heading', content: '¿Qué puedes editar?', level: 2 },
      {
        type: 'list',
        items: [
          'Nombre de la propiedad',
          'Descripción',
          'Dirección y ubicación',
          'Foto principal',
          'Datos de contacto del anfitrión',
          'Configuración de idiomas'
        ]
      },
      { type: 'tip', content: 'Los cambios se actualizan en tiempo real. No necesitas volver a compartir el QR ni el enlace.' }
    ],
    relatedArticles: ['cambiar-titulo-propiedad', 'cambiar-telefono-anfitrion', 'subir-foto-principal']
  },
  {
    id: 'cambiar-titulo-propiedad',
    slug: 'cambiar-titulo',
    category: 'Propiedades',
    categorySlug: 'propiedades',
    title: 'Cómo cambiar el título de una propiedad',
    description: 'Modifica el nombre que aparece en tu manual digital.',
    readingTime: 1,
    order: 3,
    keywords: ['cambiar título', 'nombre', 'renombrar', 'propiedad'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'El título de tu propiedad es lo primero que ven tus huéspedes. Puedes cambiarlo cuando quieras.' },
      { type: 'heading', content: 'Pasos para cambiar el título', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu panel de control.',
          'Haz clic en la propiedad.',
          'Haz clic en "Editar propiedad".',
          'Modifica el campo "Nombre".',
          'Haz clic en "Guardar cambios".'
        ]
      },
      { type: 'tip', content: 'Usa el mismo nombre que tienes en Airbnb o Booking. Así tus huéspedes lo reconocerán fácilmente.' }
    ],
    relatedArticles: ['editar-propiedad', 'crear-primera-propiedad']
  },
  {
    id: 'cambiar-telefono-anfitrion',
    slug: 'cambiar-telefono-anfitrion',
    category: 'Propiedades',
    categorySlug: 'propiedades',
    title: 'Cómo cambiar el teléfono del anfitrión',
    description: 'Actualiza el número de contacto que aparece en tu manual.',
    readingTime: 1,
    order: 4,
    keywords: ['teléfono', 'contacto', 'anfitrión', 'whatsapp', 'número'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'El teléfono del anfitrión aparece en tu manual para que los huéspedes puedan contactarte en caso de emergencia.' },
      { type: 'heading', content: 'Cómo cambiar el teléfono', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Editar propiedad".',
          'Busca el campo "Teléfono de contacto" o "WhatsApp".',
          'Introduce el nuevo número con el prefijo del país (+34 para España).',
          'Guarda los cambios.'
        ]
      },
      { type: 'tip', content: 'Si usas WhatsApp Business, introduce ese número. Los huéspedes podrán escribirte directamente.' }
    ],
    relatedArticles: ['editar-propiedad']
  },
  {
    id: 'eliminar-propiedad',
    slug: 'eliminar-propiedad',
    category: 'Propiedades',
    categorySlug: 'propiedades',
    title: 'Cómo eliminar una propiedad',
    description: 'Borra una propiedad que ya no necesitas de tu cuenta.',
    readingTime: 2,
    order: 5,
    keywords: ['eliminar', 'borrar', 'quitar', 'propiedad', 'delete'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'warning', content: 'Eliminar una propiedad es permanente. Se borrarán todas las zonas, contenido y estadísticas asociadas.' },
      { type: 'heading', content: 'Cómo eliminar una propiedad', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu panel de control.',
          'Haz clic en la propiedad que quieres eliminar.',
          'Haz clic en "Configuración" o en el icono de engranaje.',
          'Desplázate hasta encontrar "Eliminar propiedad".',
          'Confirma que quieres eliminarla escribiendo el nombre.',
          'Haz clic en "Eliminar definitivamente".'
        ]
      },
      { type: 'note', content: 'Si solo quieres ocultar la propiedad temporalmente, puedes desactivarla en lugar de eliminarla.' }
    ],
    relatedArticles: ['editar-propiedad', 'crear-primera-propiedad']
  },
  {
    id: 'subir-foto-principal',
    slug: 'foto-principal',
    category: 'Propiedades',
    categorySlug: 'propiedades',
    title: 'Cómo subir o cambiar la foto principal',
    description: 'Añade una imagen atractiva que represente tu alojamiento.',
    readingTime: 2,
    order: 6,
    keywords: ['foto', 'imagen', 'principal', 'portada', 'subir'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'La foto principal es la primera impresión de tu propiedad. Elige una imagen clara y representativa.' },
      { type: 'heading', content: 'Cómo subir la foto principal', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad y haz clic en "Editar".',
          'Busca la sección "Foto principal".',
          'Haz clic en "Subir imagen" o arrastra la imagen.',
          'Espera a que se suba (puede tardar unos segundos).',
          'Guarda los cambios.'
        ]
      },
      { type: 'heading', content: 'Recomendaciones para la foto', level: 2 },
      {
        type: 'list',
        items: [
          'Usa una imagen horizontal (16:9 o similar).',
          'Buena iluminación, preferiblemente de día.',
          'Muestra el exterior o el salón principal.',
          'Tamaño recomendado: al menos 1200px de ancho.',
          'Formatos: JPG, PNG o WebP.'
        ]
      }
    ],
    relatedArticles: ['editar-propiedad', 'subir-fotos-zona']
  },

  // ============================================
  // CONJUNTOS
  // ============================================
  {
    id: 'que-es-conjunto',
    slug: 'que-es-un-conjunto',
    category: 'Conjuntos',
    categorySlug: 'conjuntos',
    title: '¿Qué es un conjunto y para qué sirve?',
    description: 'Entiende qué son los conjuntos, cuándo usarlos y cómo crearlos paso a paso.',
    readingTime: 4,
    order: 1,
    keywords: ['conjunto', 'grupo', 'agrupar', 'varias propiedades', 'portfolio', 'edificio', 'hotel'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'Un conjunto es una forma de agrupar varias propiedades bajo un mismo nombre o marca. Es útil si gestionas múltiples alojamientos en un mismo edificio, hotel o complejo.' },
      { type: 'heading', content: '¿Cuándo usar conjuntos?', level: 2 },
      {
        type: 'list',
        items: [
          'Tienes varios apartamentos en el mismo edificio.',
          'Gestionas un hotel o complejo de apartamentos.',
          'Quieres organizar tus alojamientos por zona o ciudad.',
          'Tienes una marca o empresa de alquileres.',
          'Gestionas propiedades de diferentes dueños pero quieres tenerlas organizadas.'
        ]
      },
      { type: 'heading', content: 'Tipos de conjunto', level: 2 },
      { type: 'paragraph', content: 'Al crear un conjunto puedes elegir qué tipo es:' },
      {
        type: 'list',
        items: [
          'Edificio: Para apartamentos en un mismo edificio.',
          'Hotel: Para habitaciones de hotel.',
          'Complejo: Para villas o bungalows en un resort.',
          'Empresa: Para agrupar todas las propiedades de tu negocio.',
          'Otro: Para cualquier otra agrupación.'
        ]
      },
      { type: 'heading', content: 'Ejemplo práctico', level: 2 },
      { type: 'paragraph', content: 'Imagina que tienes 5 apartamentos en Madrid. Puedes crear un conjunto llamado "Apartamentos Madrid Centro" y añadir las 5 propiedades. Esto te permite:' },
      {
        type: 'list',
        items: [
          'Ver estadísticas globales de todas las propiedades.',
          'Compartir un único enlace con todas.',
          'Organizar mejor tu panel de control.',
          'Los huéspedes ven que pertenecen a un grupo profesional.'
        ]
      },
      { type: 'heading', content: 'Cómo acceder a Conjuntos', level: 2 },
      { type: 'paragraph', content: 'Desde tu panel de control (Dashboard) en itineramio.com/main tienes un enlace directo a la sección de Conjuntos. También puedes ir directamente a:' },
      { type: 'note', content: 'URL directa: itineramio.com/properties/groups' },
      { type: 'heading', content: 'Cómo crear un conjunto', level: 2 },
      {
        type: 'steps',
        items: [
          'Entra en tu Dashboard (itineramio.com/main).',
          'Haz clic en la tarjeta "Conjuntos" del dashboard. En móvil, usa el menú (☰) → "Mis Propiedades" y luego accede a Conjuntos, o ve directamente a itineramio.com/properties/groups.',
          'Haz clic en "Crear nuevo conjunto" o el botón "+".',
          'Rellena los datos del conjunto:',
          '   - Nombre: Un nombre descriptivo (ej: "Hotel Playa Sol", "Edificio Gran Vía").',
          '   - Tipo: Selecciona si es un edificio, hotel, complejo, empresa u otro.',
          '   - Imagen: Sube una foto o logo que represente al conjunto.',
          '   - Dirección: La dirección principal del edificio o complejo.',
          '   - Descripción (opcional): Una breve descripción del conjunto.',
          'Haz clic en "Crear conjunto".'
        ]
      },
      { type: 'tip', content: 'Si solo tienes 1-2 propiedades, probablemente no necesitas conjuntos. Puedes empezar sin ellos y crearlos más adelante cuando crezcas.' },
      { type: 'heading', content: '¿Qué pasa después de crear el conjunto?', level: 2 },
      { type: 'paragraph', content: 'Una vez creado el conjunto, podrás:' },
      {
        type: 'list',
        items: [
          'Añadir propiedades existentes al conjunto.',
          'Crear nuevas propiedades directamente dentro del conjunto.',
          'Ver estadísticas globales de todo el conjunto.',
          'Compartir el conjunto con un único enlace.'
        ]
      }
    ],
    relatedArticles: ['crear-conjunto', 'agregar-propiedad-conjunto', 'panel-de-control']
  },
  {
    id: 'crear-conjunto',
    slug: 'crear-conjunto',
    category: 'Conjuntos',
    categorySlug: 'conjuntos',
    title: 'Cómo crear un conjunto',
    description: 'Crea un grupo para organizar varias propiedades.',
    readingTime: 2,
    order: 2,
    keywords: ['crear conjunto', 'nuevo conjunto', 'grupo', 'crear grupo'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Crear un conjunto te permite agrupar propiedades relacionadas y gestionarlas de forma más eficiente.' },
      { type: 'heading', content: 'Pasos para crear un conjunto', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu panel de control (itineramio.com/main).',
          'Haz clic en la tarjeta "Conjuntos". En móvil: menú (☰) → "Mis Propiedades" → Conjuntos, o usa la URL directa itineramio.com/properties/groups.',
          'Haz clic en "Crear nuevo conjunto".',
          'Escribe un nombre descriptivo (ej: "Apartamentos Playa").',
          'Opcionalmente, añade una descripción y logo.',
          'Haz clic en "Crear".'
        ]
      },
      { type: 'note', content: 'Una vez creado el conjunto, podrás añadir propiedades existentes o crear nuevas directamente en él.' }
    ],
    relatedArticles: ['que-es-conjunto', 'agregar-propiedad-conjunto']
  },
  {
    id: 'agregar-propiedad-conjunto',
    slug: 'agregar-propiedad-a-conjunto',
    category: 'Conjuntos',
    categorySlug: 'conjuntos',
    title: 'Cómo agregar una propiedad a un conjunto',
    description: 'Añade propiedades existentes a un conjunto de forma sencilla.',
    readingTime: 2,
    order: 3,
    keywords: ['agregar', 'añadir', 'propiedad', 'conjunto', 'mover'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'La forma más sencilla de añadir propiedades a un conjunto es desde el propio conjunto. Allí verás todas tus propiedades disponibles y podrás seleccionar cuáles quieres incluir.' },
      { type: 'heading', content: 'Cómo añadir propiedades a un conjunto', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu Dashboard (itineramio.com/main).',
          'Accede a Conjuntos: desde la tarjeta del dashboard, o en móvil: menú (☰) → "Mis Propiedades" → Conjuntos.',
          'Abre el conjunto donde quieres añadir propiedades.',
          'Haz clic en "Añadir propiedad" o el botón "+".',
          'Verás un listado con todas tus propiedades disponibles.',
          'Selecciona las propiedades que quieres añadir al conjunto.',
          'Confirma la selección.'
        ]
      },
      { type: 'tip', content: 'Puedes añadir varias propiedades a la vez seleccionándolas del listado.' },
      { type: 'heading', content: '¿Qué propiedades aparecen en la lista?', level: 2 },
      { type: 'paragraph', content: 'En el listado aparecerán todas las propiedades que:' },
      {
        type: 'list',
        items: [
          'No pertenecen a ningún conjunto todavía.',
          'O pertenecen a otro conjunto (se moverán al nuevo).'
        ]
      },
      { type: 'note', content: 'Una propiedad solo puede pertenecer a un conjunto a la vez. Si la añades a un nuevo conjunto, se quitará del anterior automáticamente.' }
    ],
    relatedArticles: ['que-es-conjunto', 'crear-conjunto', 'quitar-propiedad-conjunto']
  },
  {
    id: 'quitar-propiedad-conjunto',
    slug: 'quitar-propiedad-de-conjunto',
    category: 'Conjuntos',
    categorySlug: 'conjuntos',
    title: 'Cómo quitar una propiedad de un conjunto',
    description: 'Elimina una propiedad de un conjunto sin borrarla.',
    readingTime: 1,
    order: 4,
    keywords: ['quitar', 'eliminar', 'sacar', 'propiedad', 'conjunto'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'Puedes quitar una propiedad de un conjunto sin eliminarla. La propiedad simplemente quedará como independiente, fuera de cualquier conjunto.' },
      { type: 'heading', content: 'Cómo quitar una propiedad del conjunto', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu Dashboard (itineramio.com/main).',
          'Accede a Conjuntos: desde la tarjeta del dashboard, o en móvil: menú (☰) → "Mis Propiedades" → Conjuntos.',
          'Abre el conjunto del que quieres quitar la propiedad.',
          'Busca la propiedad en el listado.',
          'Haz clic en el icono de quitar o en los tres puntos (⋮) junto a la propiedad.',
          'Selecciona "Quitar del conjunto".',
          'Confirma la acción.'
        ]
      },
      { type: 'tip', content: 'La propiedad NO se elimina, solo se desvincula del conjunto. Seguirá apareciendo en tu listado de propiedades independientes.' },
      { type: 'note', content: 'La propiedad, sus zonas, contenido y estadísticas se mantienen intactos. Solo cambia su organización.' }
    ],
    relatedArticles: ['agregar-propiedad-conjunto', 'eliminar-conjunto']
  },
  {
    id: 'eliminar-conjunto',
    slug: 'eliminar-conjunto',
    category: 'Conjuntos',
    categorySlug: 'conjuntos',
    title: 'Cómo eliminar un conjunto',
    description: 'Borra un conjunto sin perder las propiedades.',
    readingTime: 1,
    order: 5,
    keywords: ['eliminar', 'borrar', 'conjunto', 'grupo'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Al eliminar un conjunto, las propiedades que contenía NO se eliminan. Simplemente quedan como propiedades independientes.' },
      { type: 'heading', content: 'Cómo eliminar un conjunto', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a Conjuntos: desde la tarjeta del dashboard, o en móvil: menú (☰) → "Mis Propiedades" → Conjuntos.',
          'Haz clic en el conjunto que quieres eliminar.',
          'Haz clic en "Configuración" o el icono de engranaje.',
          'Haz clic en "Eliminar conjunto".',
          'Confirma la acción.'
        ]
      },
      { type: 'tip', content: 'Si quieres eliminar también las propiedades, hazlo antes de eliminar el conjunto.' }
    ],
    relatedArticles: ['crear-conjunto', 'quitar-propiedad-conjunto']
  },

  // ============================================
  // ZONAS
  // ============================================
  {
    id: 'que-es-zona',
    slug: 'que-es-una-zona',
    category: 'Zonas',
    categorySlug: 'zonas',
    title: '¿Qué es una zona?',
    description: 'Entiende el concepto de zonas y cómo organizar la información de tu propiedad.',
    readingTime: 2,
    order: 1,
    keywords: ['zona', 'sección', 'área', 'capítulo', 'organizar'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Una zona es como un "capítulo" de tu manual digital. Cada zona agrupa información relacionada para que tus huéspedes encuentren todo fácilmente.' },
      { type: 'heading', content: 'Ejemplos de zonas', level: 2 },
      {
        type: 'list',
        items: [
          'WiFi: Nombre de red, contraseña, QR de conexión.',
          'Check-in: Dirección, código de puerta, llaves.',
          'Cocina: Cómo usar electrodomésticos.',
          'Normas: Horarios de silencio, basura, mascotas.',
          'Alrededores: Restaurantes, supermercados cercanos.'
        ]
      },
      { type: 'heading', content: '¿Por qué usar zonas?', level: 2 },
      {
        type: 'list',
        items: [
          'Organización clara para el huésped.',
          'Fácil de navegar en el móvil.',
          'Puedes añadir texto, fotos y videos en cada zona.',
          'Ves estadísticas de qué zonas visitan más.'
        ]
      },
      { type: 'tip', content: 'Empieza con las zonas esenciales: WiFi, Check-in, Normas y Check-out. Luego añade más según necesites.' }
    ],
    relatedArticles: ['crear-zona', 'zonas-recomendadas', 'ordenar-zonas']
  },
  {
    id: 'crear-zona',
    slug: 'crear-zona',
    category: 'Zonas',
    categorySlug: 'zonas',
    title: 'Cómo crear una zona',
    description: 'Añade una nueva sección a tu manual digital.',
    readingTime: 2,
    order: 2,
    keywords: ['crear zona', 'nueva zona', 'añadir zona', 'sección'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Crear zonas es la forma de estructurar la información de tu propiedad.' },
      { type: 'heading', content: 'Pasos para crear una zona', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Zonas" en el menú lateral o en "Añadir zona".',
          'Elige un tipo de zona de la lista (WiFi, Cocina, etc.) o crea una personalizada.',
          'Escribe un título para la zona.',
          'Añade el contenido: texto, fotos o videos.',
          'Guarda la zona.'
        ]
      },
      { type: 'heading', content: 'Tipos de zona predefinidos', level: 2 },
      { type: 'paragraph', content: 'Itineramio te ofrece plantillas con iconos y estructura para:' },
      {
        type: 'list',
        items: [
          'Check-in / Check-out',
          'WiFi',
          'Cocina',
          'Climatización (aire/calefacción)',
          'Baño',
          'Normas de la casa',
          'Parking',
          'Y muchas más...'
        ]
      },
      { type: 'tip', content: 'Usa las plantillas predefinidas para empezar más rápido. Puedes personalizarlas después.' }
    ],
    relatedArticles: ['que-es-zona', 'editar-zona', 'zonas-recomendadas']
  },
  {
    id: 'editar-zona',
    slug: 'editar-zona',
    category: 'Zonas',
    categorySlug: 'zonas',
    title: 'Cómo editar una zona',
    description: 'Modifica el título, contenido y orden de tus zonas.',
    readingTime: 2,
    order: 3,
    keywords: ['editar zona', 'modificar', 'cambiar', 'actualizar zona'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes editar cualquier zona en cualquier momento. Los cambios se reflejan inmediatamente en el manual.' },
      { type: 'heading', content: 'Cómo editar una zona', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Zonas".',
          'Haz clic en la zona que quieres editar.',
          'Modifica el título, contenido, fotos o videos.',
          'Haz clic en "Guardar".'
        ]
      },
      { type: 'heading', content: '¿Qué puedes editar?', level: 2 },
      {
        type: 'list',
        items: [
          'Título de la zona',
          'Icono',
          'Texto y descripciones',
          'Fotos y videos',
          'Orden de los elementos dentro de la zona'
        ]
      }
    ],
    relatedArticles: ['crear-zona', 'eliminar-zona', 'ordenar-zonas']
  },
  {
    id: 'eliminar-zona',
    slug: 'eliminar-zona',
    category: 'Zonas',
    categorySlug: 'zonas',
    title: 'Cómo eliminar una zona',
    description: 'Borra una zona que ya no necesitas.',
    readingTime: 1,
    order: 4,
    keywords: ['eliminar zona', 'borrar zona', 'quitar zona'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'warning', content: 'Eliminar una zona borra todo su contenido (texto, fotos, videos). Esta acción no se puede deshacer.' },
      { type: 'heading', content: 'Cómo eliminar una zona', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Zonas".',
          'Busca la zona que quieres eliminar.',
          'Haz clic en el icono de papelera o en "Eliminar".',
          'Confirma la acción.'
        ]
      },
      { type: 'tip', content: 'Si solo quieres ocultar la zona temporalmente, puedes desactivarla en lugar de eliminarla.' }
    ],
    relatedArticles: ['editar-zona', 'crear-zona']
  },
  {
    id: 'ordenar-zonas',
    slug: 'ordenar-zonas',
    category: 'Zonas',
    categorySlug: 'zonas',
    title: 'Cómo ordenar las zonas',
    description: 'Cambia el orden en que aparecen las zonas en tu manual.',
    readingTime: 1,
    order: 5,
    keywords: ['ordenar', 'reordenar', 'mover', 'zonas', 'orden'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'El orden de las zonas determina cómo verán la información tus huéspedes. Pon las más importantes primero.' },
      { type: 'heading', content: 'Cómo ordenar las zonas', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Zonas".',
          'Arrastra las zonas usando el icono de 6 puntos (⋮⋮) a la izquierda.',
          'Suelta en la posición deseada.',
          'El orden se guarda automáticamente.'
        ]
      },
      { type: 'heading', content: 'Orden recomendado', level: 2 },
      {
        type: 'list',
        items: [
          '1. Check-in (lo primero que necesitan)',
          '2. WiFi (muy solicitado)',
          '3. Normas importantes',
          '4. Cocina y electrodomésticos',
          '5. Otros (baño, climatización...)',
          '6. Check-out (al final)'
        ]
      }
    ],
    relatedArticles: ['crear-zona', 'zonas-mas-visitadas']
  },
  {
    id: 'zonas-recomendadas',
    slug: 'zonas-recomendadas',
    category: 'Zonas',
    categorySlug: 'zonas',
    title: 'Zonas recomendadas para tu manual',
    description: 'Lista de zonas esenciales y adicionales para un manual completo.',
    readingTime: 3,
    order: 6,
    keywords: ['zonas recomendadas', 'esenciales', 'importantes', 'sugeridas'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Basándonos en miles de propiedades, estas son las zonas que más valoran los huéspedes.' },
      { type: 'heading', content: 'Zonas esenciales (las 5 imprescindibles)', level: 2 },
      {
        type: 'list',
        items: [
          'Check-in: Instrucciones de llegada, código de puerta, ubicación de llaves, parking.',
          'WiFi: Nombre de red, contraseña. Incluso puedes añadir un QR de conexión directa.',
          'Normas de la casa: Horarios de silencio, basura, mascotas, fiestas, fumar.',
          'Electrodomésticos: Cómo usar lavadora, horno, cafetera, microondas.',
          'Check-out: Hora de salida, dónde dejar llaves, instrucciones de limpieza básica.'
        ]
      },
      { type: 'heading', content: 'Zonas muy recomendadas', level: 2 },
      {
        type: 'list',
        items: [
          'Climatización: Uso de aire acondicionado y calefacción.',
          'Parking: Dónde aparcar, normas, precio si aplica.',
          'Seguridad: Números de emergencia, extintores, salidas.',
          'Alrededores: Restaurantes, supermercados, farmacias cercanas.'
        ]
      },
      { type: 'heading', content: 'Zonas adicionales (según tu propiedad)', level: 2 },
      {
        type: 'list',
        items: [
          'Piscina/Jardín: Si tienes exterior.',
          'TV/Streaming: Netflix, contraseñas, mandos.',
          'Transporte: Cómo llegar en bus/metro/taxi.',
          'Experiencias: Tours, actividades recomendadas.',
          'Trabajo remoto: Si tienes zona de oficina.'
        ]
      }
    ],
    relatedArticles: ['crear-zona', 'zonas-mas-visitadas']
  },
  {
    id: 'zonas-mas-visitadas',
    slug: 'zonas-mas-visitadas',
    category: 'Zonas',
    categorySlug: 'zonas',
    title: 'Ver qué zonas visitan más tus huéspedes',
    description: 'Analiza las estadísticas para saber qué información buscan más.',
    readingTime: 2,
    order: 7,
    keywords: ['estadísticas', 'visitas', 'zonas populares', 'analytics'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Itineramio te muestra qué zonas visitan más tus huéspedes. Esto te ayuda a mejorar tu manual.' },
      { type: 'heading', content: 'Cómo ver las estadísticas de zonas', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Estadísticas" en el menú.',
          'Verás un gráfico con las zonas más visitadas.',
          'También puedes ver el tiempo promedio de lectura.'
        ]
      },
      { type: 'heading', content: '¿Qué hacer con esta información?', level: 2 },
      {
        type: 'list',
        items: [
          'Si WiFi es muy visitada: Asegúrate de que la info esté clara y actualizada.',
          'Si una zona tiene pocas visitas: Quizás el título no es claro o no es relevante.',
          'Zonas con mucho tiempo: Los huéspedes necesitan más detalle, considera añadir fotos.'
        ]
      },
      { type: 'tip', content: 'Las zonas de Check-in y WiFi suelen ser las más visitadas. ¡Asegúrate de tenerlas perfectas!' }
    ],
    relatedArticles: ['ordenar-zonas', 'ver-estadisticas']
  },

  // ============================================
  // CONTENIDO
  // ============================================
  {
    id: 'añadir-texto-zona',
    slug: 'añadir-texto',
    category: 'Contenido',
    categorySlug: 'contenido',
    title: 'Cómo añadir texto a una zona',
    description: 'Escribe instrucciones claras para tus huéspedes.',
    readingTime: 2,
    order: 1,
    keywords: ['texto', 'escribir', 'instrucciones', 'contenido'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'El texto es la base de tu manual. Escribe instrucciones claras y concisas.' },
      { type: 'heading', content: 'Cómo añadir texto', level: 2 },
      {
        type: 'steps',
        items: [
          'Abre la zona donde quieres añadir texto.',
          'Haz clic en "Añadir contenido" o en el área de texto.',
          'Escribe tus instrucciones.',
          'Usa el editor para dar formato (negrita, listas, etc.).',
          'Guarda los cambios.'
        ]
      },
      { type: 'heading', content: 'Consejos para escribir bien', level: 2 },
      {
        type: 'list',
        items: [
          'Usa frases cortas y directas.',
          'Incluye datos específicos (códigos, contraseñas exactas).',
          'Evita tecnicismos que el huésped no entienda.',
          'Usa listas para pasos secuenciales.',
          'Destaca lo importante en negrita.'
        ]
      },
      { type: 'tip', content: 'Ejemplo malo: "El aire está en la pared". Ejemplo bueno: "El mando del aire acondicionado está en la mesita del salón. Pulsa MODE para cambiar entre frío/calor."' }
    ],
    relatedArticles: ['subir-fotos-zona', 'subir-videos-zona']
  },
  {
    id: 'subir-fotos-zona',
    slug: 'subir-fotos',
    category: 'Contenido',
    categorySlug: 'contenido',
    title: 'Cómo subir fotos a una zona',
    description: 'Añade imágenes para que tus huéspedes entiendan mejor las instrucciones.',
    readingTime: 2,
    order: 2,
    keywords: ['fotos', 'imágenes', 'subir', 'galería'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Una imagen vale más que mil palabras. Las fotos ayudan a los huéspedes a encontrar y usar las cosas.' },
      { type: 'heading', content: 'Cómo subir fotos', level: 2 },
      {
        type: 'steps',
        items: [
          'Abre la zona donde quieres añadir fotos.',
          'Haz clic en "Añadir imagen" o en el icono de foto.',
          'Selecciona la imagen de tu dispositivo o arrástrala.',
          'Espera a que se suba.',
          'Opcionalmente, añade una descripción.',
          'Guarda los cambios.'
        ]
      },
      { type: 'heading', content: 'Ideas de fotos útiles', level: 2 },
      {
        type: 'list',
        items: [
          'Foto del mando de TV/aire con los botones señalados.',
          'Foto de la ubicación de las llaves.',
          'Foto del código de la puerta.',
          'Foto de cómo separar la basura.',
          'Foto de la ubicación del WiFi (router).',
          'Foto de los electrodomésticos.'
        ]
      },
      { type: 'tip', content: 'Puedes añadir flechas o círculos a las fotos antes de subirlas para señalar cosas importantes.' }
    ],
    relatedArticles: ['añadir-texto-zona', 'subir-videos-zona']
  },
  {
    id: 'subir-videos-zona',
    slug: 'subir-videos',
    category: 'Contenido',
    categorySlug: 'contenido',
    title: 'Cómo subir videos a una zona',
    description: 'Graba tutoriales cortos para explicar procesos complicados.',
    readingTime: 2,
    order: 3,
    keywords: ['videos', 'vídeos', 'subir', 'tutorial', 'grabación'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Los videos son perfectos para explicar cosas que requieren varios pasos, como usar la lavadora o abrir la puerta.' },
      { type: 'heading', content: 'Cómo subir videos', level: 2 },
      {
        type: 'steps',
        items: [
          'Abre la zona donde quieres añadir el video.',
          'Haz clic en "Añadir video" o en el icono de video.',
          'Selecciona el archivo de video (MP4 recomendado).',
          'Espera a que se suba y procese.',
          'Guarda los cambios.'
        ]
      },
      { type: 'heading', content: 'Consejos para buenos videos', level: 2 },
      {
        type: 'list',
        items: [
          'Duración: 30-60 segundos máximo.',
          'Graba en horizontal.',
          'Buena iluminación.',
          'No necesitas audio (los subtítulos ayudan más).',
          'Muestra el proceso paso a paso.',
          'Graba lento para que se vea bien.'
        ]
      },
      { type: 'heading', content: 'Ideas de videos útiles', level: 2 },
      {
        type: 'list',
        items: [
          'Cómo abrir la puerta principal.',
          'Cómo usar la lavadora.',
          'Cómo encender el aire/calefacción.',
          'Cómo funciona la cafetera.',
          'Dónde aparcar el coche.'
        ]
      }
    ],
    relatedArticles: ['añadir-texto-zona', 'subir-fotos-zona']
  },
  {
    id: 'editar-contenido',
    slug: 'editar-contenido',
    category: 'Contenido',
    categorySlug: 'contenido',
    title: 'Cómo editar el contenido de una zona',
    description: 'Modifica texto, fotos y videos ya existentes.',
    readingTime: 1,
    order: 4,
    keywords: ['editar', 'modificar', 'contenido', 'actualizar'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes editar cualquier contenido en cualquier momento. Los cambios se reflejan inmediatamente.' },
      { type: 'heading', content: 'Cómo editar contenido', level: 2 },
      {
        type: 'steps',
        items: [
          'Abre la zona que contiene el contenido.',
          'Haz clic en el texto, foto o video que quieres editar.',
          'Realiza los cambios necesarios.',
          'Guarda los cambios.'
        ]
      },
      { type: 'heading', content: 'Eliminar contenido', level: 2 },
      { type: 'paragraph', content: 'Para eliminar una foto, video o bloque de texto:' },
      {
        type: 'steps',
        items: [
          'Pasa el ratón sobre el elemento.',
          'Haz clic en el icono de papelera.',
          'Confirma la eliminación.'
        ]
      }
    ],
    relatedArticles: ['añadir-texto-zona', 'subir-fotos-zona']
  },

  // ============================================
  // COMPARTIR
  // ============================================
  {
    id: 'codigo-qr',
    slug: 'codigo-qr',
    category: 'Compartir',
    categorySlug: 'compartir',
    title: 'Cómo generar el código QR de tu propiedad',
    description: 'Crea un QR que tus huéspedes escanean para ver el manual.',
    readingTime: 2,
    order: 1,
    keywords: ['qr', 'código qr', 'generar', 'crear qr'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'El código QR permite a tus huéspedes acceder al manual con solo escanear desde su móvil. No necesitan instalar ninguna app.' },
      { type: 'heading', content: 'Cómo generar tu QR', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Compartir" en el menú superior.',
          'Verás tu código QR generado automáticamente.',
          'Haz clic en "Descargar QR" para guardarlo como imagen.'
        ]
      },
      { type: 'heading', content: '¿Qué hacer con el QR?', level: 2 },
      {
        type: 'list',
        items: [
          'Imprímelo y colócalo en la entrada.',
          'Ponlo en la nevera o una zona visible.',
          'Inclúyelo en tu mensaje de bienvenida.',
          'Añádelo a un marco o soporte.'
        ]
      },
      { type: 'tip', content: 'El QR siempre apunta a la misma URL. Si cambias el contenido del manual, no necesitas generar un QR nuevo.' }
    ],
    relatedArticles: ['imprimir-qr', 'compartir-link', 'compartir-whatsapp']
  },
  {
    id: 'imprimir-qr',
    slug: 'imprimir-qr',
    category: 'Compartir',
    categorySlug: 'compartir',
    title: 'Cómo imprimir el código QR',
    description: 'Descarga e imprime tu QR en alta calidad.',
    readingTime: 2,
    order: 2,
    keywords: ['imprimir', 'qr', 'descargar', 'pdf', 'alta calidad'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes descargar tu QR en alta resolución para imprimirlo y colocarlo en tu propiedad.' },
      { type: 'heading', content: 'Cómo descargar el QR', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Compartir".',
          'Haz clic en "Descargar QR" o "Descargar PNG".',
          'Se descargará una imagen de alta resolución.',
          'Abre la imagen e imprímela.'
        ]
      },
      { type: 'heading', content: 'Consejos de impresión', level: 2 },
      {
        type: 'list',
        items: [
          'Tamaño recomendado: mínimo 5x5 cm.',
          'Usa papel de buena calidad.',
          'Puedes plastificarlo para mayor durabilidad.',
          'Colócalo en un lugar bien iluminado.',
          'Asegúrate de que sea fácil de escanear (sin reflejos).'
        ]
      },
      { type: 'heading', content: 'Ideas de dónde colocarlo', level: 2 },
      {
        type: 'list',
        items: [
          'En la puerta de entrada (interior).',
          'En la nevera con un imán.',
          'En la mesita del salón.',
          'En un marco junto al recibidor.',
          'En el llavero de las llaves.'
        ]
      }
    ],
    relatedArticles: ['codigo-qr', 'compartir-link']
  },
  {
    id: 'compartir-link',
    slug: 'compartir-link',
    category: 'Compartir',
    categorySlug: 'compartir',
    title: 'Cómo compartir el link directo',
    description: 'Copia y envía el enlace de tu manual por email o mensaje.',
    readingTime: 1,
    order: 3,
    keywords: ['link', 'enlace', 'url', 'compartir', 'copiar'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Cada propiedad tiene un enlace único que puedes compartir por cualquier medio.' },
      { type: 'heading', content: 'Cómo copiar el link', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Compartir".',
          'Verás tu link único (algo como itineramio.com/p/tu-propiedad).',
          'Haz clic en "Copiar enlace".',
          'Pégalo donde quieras enviarlo.'
        ]
      },
      { type: 'heading', content: 'Dónde usar el link', level: 2 },
      {
        type: 'list',
        items: [
          'En tu mensaje automático de Airbnb/Booking.',
          'En el email de confirmación de reserva.',
          'En tu mensaje de bienvenida por WhatsApp.',
          'En tu firma de email.'
        ]
      },
      { type: 'tip', content: 'Añade el link a tu plantilla de mensaje automático en Airbnb. Así se envía solo a cada huésped.' }
    ],
    relatedArticles: ['codigo-qr', 'compartir-whatsapp']
  },
  {
    id: 'compartir-whatsapp',
    slug: 'compartir-whatsapp',
    category: 'Compartir',
    categorySlug: 'compartir',
    title: 'Cómo compartir por WhatsApp',
    description: 'Envía tu manual directamente al móvil del huésped.',
    readingTime: 1,
    order: 4,
    keywords: ['whatsapp', 'enviar', 'compartir', 'mensaje'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes enviar el enlace de tu manual directamente por WhatsApp al huésped.' },
      { type: 'heading', content: 'Cómo compartir por WhatsApp', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Compartir".',
          'Haz clic en el botón de WhatsApp.',
          'Se abrirá WhatsApp con el enlace listo para enviar.',
          'Selecciona el contacto o pega el enlace en un chat.'
        ]
      },
      { type: 'heading', content: 'Mensaje sugerido', level: 2 },
      { type: 'paragraph', content: 'Puedes usar este mensaje tipo:' },
      { type: 'note', content: '"¡Hola! Te envío el manual digital de la propiedad. Aquí encontrarás todo lo que necesitas: WiFi, check-in, normas, etc. [ENLACE]"' }
    ],
    relatedArticles: ['compartir-link', 'codigo-qr']
  },

  // ============================================
  // ESTADÍSTICAS
  // ============================================
  {
    id: 'ver-estadisticas',
    slug: 'ver-estadisticas',
    category: 'Estadísticas',
    categorySlug: 'estadisticas',
    title: 'Cómo ver las estadísticas de tu propiedad',
    description: 'Analiza visitas, zonas populares y comportamiento de huéspedes.',
    readingTime: 2,
    order: 1,
    keywords: ['estadísticas', 'analytics', 'visitas', 'datos'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Itineramio te muestra estadísticas detalladas de cómo los huéspedes usan tu manual.' },
      { type: 'heading', content: 'Cómo acceder a las estadísticas', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Estadísticas" en el menú.',
          'Verás un panel con toda la información.'
        ]
      },
      { type: 'heading', content: '¿Qué puedes ver?', level: 2 },
      {
        type: 'list',
        items: [
          'Número de visitas totales.',
          'Visitas por día/semana/mes.',
          'Zonas más visitadas.',
          'Tiempo promedio en cada zona.',
          'Evaluaciones de huéspedes.',
          'Dispositivos usados (móvil/tablet/pc).'
        ]
      },
      { type: 'tip', content: 'Si una zona tiene muchas visitas, asegúrate de que la información esté completa y actualizada.' }
    ],
    relatedArticles: ['zonas-mas-visitadas', 'evaluaciones-huespedes']
  },
  {
    id: 'evaluaciones-huespedes',
    slug: 'evaluaciones',
    category: 'Estadísticas',
    categorySlug: 'estadisticas',
    title: 'Ver evaluaciones de huéspedes',
    description: 'Consulta las valoraciones que dejan los huéspedes en cada zona.',
    readingTime: 2,
    order: 2,
    keywords: ['evaluaciones', 'valoraciones', 'feedback', 'opiniones'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Los huéspedes pueden valorar cada zona de tu manual. Esto te ayuda a mejorar la información.' },
      { type: 'heading', content: 'Cómo ver las evaluaciones', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad.',
          'Haz clic en "Estadísticas".',
          'Busca la sección "Evaluaciones".',
          'Verás las puntuaciones y comentarios.'
        ]
      },
      { type: 'heading', content: '¿Qué hacer con las evaluaciones?', level: 2 },
      {
        type: 'list',
        items: [
          'Zonas con baja puntuación: Revisa y mejora el contenido.',
          'Comentarios negativos: Identifica qué falta o no está claro.',
          'Zonas bien valoradas: Úsalas como referencia para otras.',
          'Sin evaluaciones: Anima a los huéspedes a dejar feedback.'
        ]
      }
    ],
    relatedArticles: ['ver-estadisticas', 'zonas-mas-visitadas']
  },

  // ============================================
  // CUENTA
  // ============================================
  {
    id: 'cambiar-email',
    slug: 'cambiar-email',
    category: 'Mi cuenta',
    categorySlug: 'cuenta',
    title: 'Cómo cambiar tu email',
    description: 'Actualiza la dirección de correo asociada a tu cuenta.',
    readingTime: 2,
    order: 1,
    keywords: ['email', 'correo', 'cambiar', 'cuenta'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes cambiar el email de tu cuenta en cualquier momento.' },
      { type: 'heading', content: 'Cómo cambiar tu email', level: 2 },
      {
        type: 'steps',
        items: [
          'Haz clic en tu foto de perfil (esquina superior derecha).',
          'Selecciona "Mi cuenta" o "Configuración".',
          'Busca la sección "Email".',
          'Introduce tu nuevo email.',
          'Confirma con tu contraseña actual.',
          'Recibirás un email de verificación en la nueva dirección.',
          'Haz clic en el enlace para confirmar.'
        ]
      },
      { type: 'warning', content: 'Hasta que no confirmes el nuevo email, seguirás usando el anterior.' }
    ],
    relatedArticles: ['cambiar-contraseña', 'cambiar-nombre']
  },
  {
    id: 'cambiar-contraseña',
    slug: 'cambiar-contraseña',
    category: 'Mi cuenta',
    categorySlug: 'cuenta',
    title: 'Cómo cambiar tu contraseña',
    description: 'Actualiza tu contraseña por una más segura.',
    readingTime: 1,
    order: 2,
    keywords: ['contraseña', 'password', 'cambiar', 'seguridad'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Cambiar tu contraseña regularmente mejora la seguridad de tu cuenta.' },
      { type: 'heading', content: 'Cómo cambiar tu contraseña', level: 2 },
      {
        type: 'steps',
        items: [
          'Haz clic en tu foto de perfil.',
          'Selecciona "Mi cuenta".',
          'Busca la sección "Contraseña".',
          'Introduce tu contraseña actual.',
          'Introduce la nueva contraseña (mínimo 8 caracteres).',
          'Confirma la nueva contraseña.',
          'Haz clic en "Guardar".'
        ]
      },
      { type: 'tip', content: 'Usa una contraseña única con letras, números y símbolos.' }
    ],
    relatedArticles: ['cambiar-email', 'recuperar-contraseña']
  },
  {
    id: 'recuperar-contraseña',
    slug: 'recuperar-contraseña',
    category: 'Mi cuenta',
    categorySlug: 'cuenta',
    title: 'Recuperar contraseña olvidada',
    description: 'Restablece tu contraseña si no la recuerdas.',
    readingTime: 2,
    order: 3,
    keywords: ['recuperar', 'olvidé', 'contraseña', 'restablecer'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Si olvidaste tu contraseña, puedes restablecerla fácilmente.' },
      { type: 'heading', content: 'Cómo recuperar tu contraseña', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a la página de login (itineramio.com/login).',
          'Haz clic en "¿Olvidaste tu contraseña?".',
          'Introduce tu email.',
          'Haz clic en "Enviar enlace".',
          'Revisa tu email (también spam).',
          'Haz clic en el enlace del email.',
          'Introduce tu nueva contraseña.'
        ]
      },
      { type: 'note', content: 'El enlace de recuperación expira en 1 hora por seguridad.' }
    ],
    relatedArticles: ['cambiar-contraseña', 'cambiar-email']
  },
  {
    id: 'cambiar-nombre',
    slug: 'cambiar-nombre',
    category: 'Mi cuenta',
    categorySlug: 'cuenta',
    title: 'Cómo cambiar tu nombre',
    description: 'Actualiza el nombre que aparece en tu perfil.',
    readingTime: 1,
    order: 4,
    keywords: ['nombre', 'perfil', 'cambiar', 'cuenta'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Tu nombre aparece en tu perfil y en las comunicaciones con huéspedes.' },
      { type: 'heading', content: 'Cómo cambiar tu nombre', level: 2 },
      {
        type: 'steps',
        items: [
          'Haz clic en tu foto de perfil.',
          'Selecciona "Mi cuenta".',
          'Busca el campo "Nombre".',
          'Modifícalo.',
          'Guarda los cambios.'
        ]
      }
    ],
    relatedArticles: ['cambiar-email']
  },
  {
    id: 'eliminar-cuenta',
    slug: 'eliminar-cuenta',
    category: 'Mi cuenta',
    categorySlug: 'cuenta',
    title: 'Cómo eliminar tu cuenta',
    description: 'Borra tu cuenta y todos los datos asociados.',
    readingTime: 2,
    order: 5,
    keywords: ['eliminar', 'borrar', 'cuenta', 'darse de baja'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'warning', content: 'Eliminar tu cuenta es permanente. Se borrarán todas tus propiedades, zonas, estadísticas y datos. Esta acción NO se puede deshacer.' },
      { type: 'heading', content: 'Cómo eliminar tu cuenta', level: 2 },
      {
        type: 'steps',
        items: [
          'Haz clic en tu foto de perfil.',
          'Selecciona "Mi cuenta".',
          'Desplázate hasta "Eliminar cuenta".',
          'Lee las advertencias.',
          'Escribe "ELIMINAR" para confirmar.',
          'Introduce tu contraseña.',
          'Haz clic en "Eliminar cuenta definitivamente".'
        ]
      },
      { type: 'note', content: 'Si tienes una suscripción activa, se cancelará automáticamente.' }
    ],
    relatedArticles: ['cancelar-suscripcion']
  },

  // ============================================
  // FACTURACIÓN
  // ============================================
  {
    id: 'ver-planes',
    slug: 'planes',
    category: 'Facturación',
    categorySlug: 'facturacion',
    title: 'Planes y precios de Itineramio',
    description: 'Conoce los planes disponibles y qué incluye cada uno.',
    readingTime: 3,
    order: 1,
    keywords: ['planes', 'precios', 'suscripción', 'premium'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Itineramio ofrece diferentes planes según el número de propiedades que gestiones.' },
      { type: 'heading', content: 'Planes disponibles', level: 2 },
      {
        type: 'list',
        items: [
          'Basic (1-2 propiedades): Ideal para empezar.',
          'Host (3-5 propiedades): Para hosts profesionales.',
          'Superhost (6-15 propiedades): Para gestores con varias propiedades.',
          'Business (16+ propiedades): Para empresas y property managers.'
        ]
      },
      { type: 'heading', content: 'Qué incluyen todos los planes', level: 2 },
      {
        type: 'list',
        items: [
          'Propiedades ilimitadas según el plan.',
          'Zonas ilimitadas por propiedad.',
          'Código QR personalizado.',
          'Estadísticas de visitas.',
          'Soporte por email.',
          'Actualizaciones gratuitas.'
        ]
      },
      { type: 'heading', content: 'Periodo de prueba', level: 2 },
      { type: 'paragraph', content: 'Todos los usuarios nuevos tienen 15 días de prueba con acceso completo. No se requiere tarjeta de crédito.' },
      { type: 'tip', content: 'Puedes cambiar de plan en cualquier momento. El cambio se aplica inmediatamente.' }
    ],
    relatedArticles: ['cambiar-plan', 'ver-facturas']
  },
  {
    id: 'cambiar-plan',
    slug: 'cambiar-plan',
    category: 'Facturación',
    categorySlug: 'facturacion',
    title: 'Cómo cambiar de plan',
    description: 'Actualiza tu suscripción a un plan superior o inferior.',
    readingTime: 2,
    order: 2,
    keywords: ['cambiar plan', 'upgrade', 'downgrade', 'suscripción'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes cambiar de plan en cualquier momento. El cambio se aplica inmediatamente.' },
      { type: 'heading', content: 'Cómo cambiar tu plan', level: 2 },
      {
        type: 'steps',
        items: [
          'Haz clic en tu foto de perfil.',
          'Selecciona "Facturación".',
          'Verás tu plan actual.',
          'Haz clic en "Cambiar plan".',
          'Selecciona el nuevo plan.',
          'Confirma el cambio.',
          'Si es un upgrade, se te cobrará la diferencia prorrateada.'
        ]
      },
      { type: 'heading', content: '¿Qué pasa con lo que ya pagué?', level: 2 },
      {
        type: 'list',
        items: [
          'Upgrade (plan superior): Pagas solo la diferencia del tiempo restante.',
          'Downgrade (plan inferior): El cambio se aplica al final del periodo actual.'
        ]
      }
    ],
    relatedArticles: ['ver-planes', 'cancelar-suscripcion']
  },
  {
    id: 'ver-facturas',
    slug: 'ver-facturas',
    category: 'Facturación',
    categorySlug: 'facturacion',
    title: 'Cómo ver y descargar facturas',
    description: 'Accede a tu historial de facturas y descárgalas en PDF.',
    readingTime: 2,
    order: 3,
    keywords: ['facturas', 'historial', 'descargar', 'pdf'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Todas tus facturas están disponibles en tu panel de facturación.' },
      { type: 'heading', content: 'Cómo ver tus facturas', level: 2 },
      {
        type: 'steps',
        items: [
          'Haz clic en tu foto de perfil.',
          'Selecciona "Facturación".',
          'Desplázate hasta "Historial de facturas".',
          'Verás una lista con todas tus facturas.',
          'Haz clic en "Descargar PDF" para guardarla.'
        ]
      },
      { type: 'heading', content: 'Datos fiscales', level: 2 },
      { type: 'paragraph', content: 'Si necesitas que las facturas incluyan datos fiscales de tu empresa:' },
      {
        type: 'steps',
        items: [
          'Ve a "Facturación".',
          'Haz clic en "Datos fiscales".',
          'Introduce el nombre de la empresa, NIF/CIF y dirección.',
          'Guarda los cambios.',
          'Las futuras facturas incluirán estos datos.'
        ]
      }
    ],
    relatedArticles: ['cambiar-plan', 'cambiar-metodo-pago']
  },
  {
    id: 'cambiar-metodo-pago',
    slug: 'cambiar-metodo-pago',
    category: 'Facturación',
    categorySlug: 'facturacion',
    title: 'Cómo cambiar el método de pago',
    description: 'Actualiza tu tarjeta de crédito o método de pago.',
    readingTime: 2,
    order: 4,
    keywords: ['método pago', 'tarjeta', 'crédito', 'actualizar'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes actualizar tu tarjeta de crédito en cualquier momento.' },
      { type: 'heading', content: 'Cómo cambiar tu método de pago', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a "Facturación".',
          'Busca la sección "Método de pago".',
          'Haz clic en "Cambiar tarjeta".',
          'Introduce los datos de la nueva tarjeta.',
          'Haz clic en "Guardar".',
          'La nueva tarjeta se usará para futuros pagos.'
        ]
      },
      { type: 'note', content: 'Los pagos se procesan de forma segura a través de Stripe. Itineramio no almacena los datos de tu tarjeta.' }
    ],
    relatedArticles: ['ver-facturas', 'cancelar-suscripcion']
  },
  {
    id: 'cancelar-suscripcion',
    slug: 'cancelar-suscripcion',
    category: 'Facturación',
    categorySlug: 'facturacion',
    title: 'Cómo cancelar tu suscripción',
    description: 'Cancela tu plan y qué sucede con tus datos.',
    readingTime: 2,
    order: 5,
    keywords: ['cancelar', 'suscripción', 'baja', 'anular'],
    lastUpdated: '2025-01-03',
    content: [
      { type: 'paragraph', content: 'Puedes cancelar tu suscripción en cualquier momento. Seguirás teniendo acceso hasta el final del periodo pagado.' },
      { type: 'heading', content: 'Cómo cancelar tu suscripción', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a "Facturación".',
          'Busca tu plan actual.',
          'Haz clic en "Cancelar suscripción".',
          'Confirma la cancelación.',
          'Tu plan seguirá activo hasta la fecha de vencimiento.'
        ]
      },
      { type: 'heading', content: '¿Qué pasa después de cancelar?', level: 2 },
      {
        type: 'list',
        items: [
          'Seguirás teniendo acceso hasta el final del periodo pagado.',
          'Tus propiedades y datos se mantienen.',
          'Después de la fecha de vencimiento, tus propiedades se pausarán.',
          'Puedes reactivar tu suscripción en cualquier momento.'
        ]
      },
      { type: 'note', content: 'Si cancelas y quieres volver, tus datos seguirán ahí. Solo tendrás que elegir un plan nuevo.' }
    ],
    relatedArticles: ['cambiar-plan', 'eliminar-cuenta']
  },

  // ============================================
  // AVISOS
  // ============================================
  {
    id: 'que-son-avisos',
    slug: 'que-son-avisos',
    category: 'Avisos',
    categorySlug: 'avisos',
    title: 'Qué son los avisos y para qué sirven',
    description: 'Aprende a comunicar información importante a tus huéspedes con el sistema de avisos.',
    readingTime: 3,
    order: 1,
    keywords: ['avisos', 'anuncios', 'comunicación', 'huéspedes', 'notificaciones'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'Los avisos son mensajes destacados que aparecen en tu manual digital para comunicar información importante a tus huéspedes. Son perfectos para situaciones temporales o permanentes que quieras resaltar.' },
      { type: 'heading', content: '¿Cuándo usar avisos?', level: 2 },
      {
        type: 'list',
        items: [
          'Obras o ruidos en el edificio o zona',
          'Servicios temporalmente no disponibles (WiFi, ascensor, etc.)',
          'Cambios en horarios de check-in/check-out',
          'Información sobre aparcamiento',
          'Eventos especiales en la zona',
          'Cualquier información que quieras destacar'
        ]
      },
      { type: 'heading', content: 'Características de los avisos', level: 2 },
      {
        type: 'list',
        items: [
          'Multiidioma: Se muestran en español, inglés y francés automáticamente',
          'Categorías: Organiza tus avisos por tipo (aparcamiento, limpieza, obras, etc.)',
          'Prioridades: Urgente, Alta o Normal según la importancia',
          'Programables: Establece fechas de inicio y fin',
          'Activar/Desactivar: Controla cuándo son visibles'
        ]
      },
      { type: 'tip', content: 'Los avisos con prioridad "Urgente" aparecen destacados en rojo para que los huéspedes no se los pierdan.' },
      { type: 'heading', content: '¿Dónde aparecen los avisos?', level: 2 },
      { type: 'paragraph', content: 'Los avisos aparecen en la parte superior de tu manual digital, antes del contenido de las zonas. Así te aseguras de que los huéspedes los vean nada más entrar.' }
    ],
    relatedArticles: ['crear-aviso', 'usar-plantillas-avisos']
  },
  {
    id: 'crear-aviso',
    slug: 'crear-aviso',
    category: 'Avisos',
    categorySlug: 'avisos',
    title: 'Cómo crear un aviso',
    description: 'Guía paso a paso para crear avisos y comunicarte con tus huéspedes.',
    readingTime: 3,
    order: 2,
    keywords: ['crear', 'aviso', 'nuevo', 'añadir', 'mensaje'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'Crear un aviso es muy sencillo. Sigue estos pasos para comunicar información importante a tus huéspedes.' },
      { type: 'heading', content: 'Pasos para crear un aviso', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a tu propiedad y haz clic en "Avisos" en el menú lateral.',
          'Haz clic en el botón "+ Nuevo aviso".',
          'Escribe el título del aviso (en español, se traduce automáticamente).',
          'Escribe el mensaje con los detalles.',
          'Selecciona una categoría (Aparcamiento, Limpieza, Obras, etc.).',
          'Elige la prioridad (Normal, Alta o Urgente).',
          'Opcionalmente, establece fechas de inicio y fin.',
          'Haz clic en "Guardar aviso".'
        ]
      },
      { type: 'heading', content: 'Campos del aviso', level: 2 },
      {
        type: 'list',
        items: [
          'Título: Breve y descriptivo (ej: "Sin plaza de aparcamiento")',
          'Mensaje: Detalles completos de la situación',
          'Categoría: Ayuda a organizar y mostrar el icono correcto',
          'Prioridad: Determina cómo se destaca el aviso',
          'Fechas: Para avisos temporales (obras, eventos, etc.)'
        ]
      },
      { type: 'tip', content: 'Usa títulos cortos y claros. El mensaje es donde puedes dar todos los detalles.' },
      { type: 'warning', content: 'Los avisos con prioridad "Urgente" deben usarse solo para situaciones realmente importantes para no perder su efectividad.' }
    ],
    relatedArticles: ['que-son-avisos', 'usar-plantillas-avisos', 'editar-aviso']
  },
  {
    id: 'usar-plantillas-avisos',
    slug: 'usar-plantillas-avisos',
    category: 'Avisos',
    categorySlug: 'avisos',
    title: 'Cómo usar las plantillas de avisos',
    description: 'Ahorra tiempo usando plantillas predefinidas para los avisos más comunes.',
    readingTime: 2,
    order: 3,
    keywords: ['plantillas', 'templates', 'predefinidos', 'rápido', 'ejemplos'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'Itineramio incluye plantillas predefinidas para los avisos más comunes. Están ya traducidas a español, inglés y francés para que no tengas que escribir nada.' },
      { type: 'heading', content: 'Plantillas disponibles', level: 2 },
      {
        type: 'list',
        items: [
          'Check-in temprano no disponible',
          'Check-out tardío no disponible',
          'Sin custodia de equipajes',
          'Sin plaza de aparcamiento',
          'Sin conexión WiFi',
          'Servicio temporalmente no disponible',
          'Obras en el edificio',
          'Ruidos en la zona'
        ]
      },
      { type: 'heading', content: 'Cómo usar una plantilla', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a "Avisos" en tu propiedad.',
          'Haz clic en "+ Nuevo aviso".',
          'Verás las plantillas disponibles en la parte superior.',
          'Haz clic en la plantilla que quieras usar.',
          'El título y mensaje se rellenan automáticamente.',
          'Personaliza si lo necesitas.',
          'Guarda el aviso.'
        ]
      },
      { type: 'tip', content: 'Puedes modificar el texto de la plantilla antes de guardar si necesitas añadir detalles específicos.' }
    ],
    relatedArticles: ['crear-aviso', 'editar-aviso']
  },
  {
    id: 'editar-aviso',
    slug: 'editar-aviso',
    category: 'Avisos',
    categorySlug: 'avisos',
    title: 'Cómo editar un aviso existente',
    description: 'Aprende a modificar avisos ya creados para actualizar la información.',
    readingTime: 2,
    order: 4,
    keywords: ['editar', 'modificar', 'cambiar', 'actualizar', 'aviso'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'Puedes editar cualquier aviso en cualquier momento para actualizar la información o corregir errores.' },
      { type: 'heading', content: 'Pasos para editar un aviso', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a "Avisos" en tu propiedad.',
          'Encuentra el aviso que quieres editar.',
          'Haz clic en el icono de lápiz (editar).',
          'Modifica los campos que necesites.',
          'Haz clic en "Guardar cambios".'
        ]
      },
      { type: 'heading', content: 'Activar o desactivar un aviso', level: 2 },
      { type: 'paragraph', content: 'No necesitas eliminar un aviso para que deje de mostrarse. Puedes simplemente desactivarlo y volver a activarlo cuando lo necesites.' },
      {
        type: 'steps',
        items: [
          'Ve a "Avisos" en tu propiedad.',
          'Encuentra el aviso.',
          'Haz clic en el interruptor de "Activo".',
          'El aviso dejará de mostrarse pero no se eliminará.'
        ]
      },
      { type: 'tip', content: 'Desactivar es mejor que eliminar si piensas que vas a necesitar el aviso de nuevo en el futuro.' }
    ],
    relatedArticles: ['crear-aviso', 'eliminar-aviso']
  },
  {
    id: 'eliminar-aviso',
    slug: 'eliminar-aviso',
    category: 'Avisos',
    categorySlug: 'avisos',
    title: 'Cómo eliminar un aviso',
    description: 'Aprende a eliminar avisos que ya no necesitas.',
    readingTime: 1,
    order: 5,
    keywords: ['eliminar', 'borrar', 'quitar', 'aviso'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'Si un aviso ya no es relevante y no lo vas a necesitar en el futuro, puedes eliminarlo permanentemente.' },
      { type: 'heading', content: 'Pasos para eliminar un aviso', level: 2 },
      {
        type: 'steps',
        items: [
          'Ve a "Avisos" en tu propiedad.',
          'Encuentra el aviso que quieres eliminar.',
          'Haz clic en el icono de papelera (eliminar).',
          'Confirma la eliminación.',
          'El aviso se eliminará permanentemente.'
        ]
      },
      { type: 'warning', content: 'Esta acción no se puede deshacer. Si crees que vas a necesitar el aviso de nuevo, considera desactivarlo en lugar de eliminarlo.' },
      { type: 'tip', content: 'Recuerda: desactivar un aviso lo oculta pero lo mantiene guardado. Eliminar lo borra definitivamente.' }
    ],
    relatedArticles: ['editar-aviso', 'crear-aviso']
  },
  {
    id: 'programar-avisos',
    slug: 'programar-avisos',
    category: 'Avisos',
    categorySlug: 'avisos',
    title: 'Cómo programar fechas en los avisos',
    description: 'Configura fechas de inicio y fin para que los avisos se muestren automáticamente.',
    readingTime: 2,
    order: 6,
    keywords: ['programar', 'fechas', 'inicio', 'fin', 'temporal', 'automático'],
    lastUpdated: '2025-01-04',
    content: [
      { type: 'paragraph', content: 'Los avisos pueden tener fechas de inicio y fin. Esto es muy útil para situaciones temporales como obras, eventos o restricciones por fechas.' },
      { type: 'heading', content: 'Cuándo usar fechas', level: 2 },
      {
        type: 'list',
        items: [
          'Obras en el edificio (del 15 al 30 de enero)',
          'Evento especial en la zona (festival, concierto, etc.)',
          'Restricciones de tráfico temporales',
          'Cierre temporal de servicios',
          'Cualquier situación con fecha conocida de fin'
        ]
      },
      { type: 'heading', content: 'Cómo configurar las fechas', level: 2 },
      {
        type: 'steps',
        items: [
          'Crea o edita un aviso.',
          'Activa la opción "Programar fechas".',
          'Selecciona la fecha de inicio.',
          'Selecciona la fecha de fin.',
          'Guarda el aviso.',
          'El aviso solo se mostrará entre esas fechas.'
        ]
      },
      { type: 'tip', content: 'Si solo pones fecha de inicio, el aviso se mostrará desde esa fecha hasta que lo desactives manualmente.' },
      { type: 'note', content: 'Si no configuras ninguna fecha, el aviso se mostrará inmediatamente y hasta que lo desactives o elimines.' }
    ],
    relatedArticles: ['crear-aviso', 'editar-aviso']
  }
]

// Helper function to get article by slug
export function getArticleBySlug(categorySlug: string, articleSlug: string): OnboardingArticle | undefined {
  return onboardingArticles.find(
    article => article.categorySlug === categorySlug && article.slug === articleSlug
  )
}

// Helper function to get articles by category
export function getArticlesByCategory(categorySlug: string): OnboardingArticle[] {
  return onboardingArticles
    .filter(article => article.categorySlug === categorySlug)
    .sort((a, b) => a.order - b.order)
}

// Helper function to get category by slug
export function getCategoryBySlug(slug: string): OnboardingCategory | undefined {
  return onboardingCategories.find(cat => cat.slug === slug)
}

// Helper function to search articles
export function searchArticles(query: string): OnboardingArticle[] {
  const lowerQuery = query.toLowerCase()
  return onboardingArticles.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.description.toLowerCase().includes(lowerQuery) ||
    article.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
  )
}

// Get popular articles (for now based on order, later can be based on actual views)
export function getPopularArticles(limit: number = 6): OnboardingArticle[] {
  return onboardingArticles
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit)
}

// Get related articles
export function getRelatedArticles(articleId: string): OnboardingArticle[] {
  const article = onboardingArticles.find(a => a.id === articleId)
  if (!article || !article.relatedArticles) return []

  return article.relatedArticles
    .map(id => onboardingArticles.find(a => a.id === id))
    .filter((a): a is OnboardingArticle => a !== undefined)
}
