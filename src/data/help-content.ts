/**
 * Base de datos de contenido de ayuda searchable
 * Centro de Ayuda Itineramio - 500+ preguntas organizadas por categorías
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
  // ============================================
  // SECCIÓN 1: PRIMEROS PASOS (25 preguntas)
  // ============================================

  // Registro y cuenta
  {
    id: 'pp-1',
    type: 'faq',
    title: '¿Cómo me registro en Itineramio?',
    description: 'Pasos para crear tu cuenta de anfitrión',
    content: 'Ve a itineramio.com y haz clic en "Registrarse" o "Empezar gratis". Introduce tu email y crea una contraseña segura. Recibirás un email de verificación que debes confirmar para activar tu cuenta.',
    tags: ['registro', 'crear cuenta', 'nuevo usuario', 'empezar', 'signup', 'alta'],
    url: '/help#registro',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-2',
    type: 'faq',
    title: '¿Por qué no recibo el email de verificación?',
    description: 'Soluciones si no llega el correo de confirmación',
    content: 'Revisa tu carpeta de spam o correo no deseado. Asegúrate de haber escrito correctamente tu email. Si no llega en 5 minutos, solicita un nuevo email desde la página de login. También verifica que tu bandeja no esté llena.',
    tags: ['email', 'verificación', 'correo', 'spam', 'no llega', 'confirmación'],
    url: '/help#email-verificacion',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-3',
    type: 'faq',
    title: '¿Cómo verifico mi cuenta?',
    description: 'Proceso de verificación del email',
    content: 'Abre el email de Itineramio que recibiste al registrarte y haz clic en el botón "Verificar email" o el enlace de confirmación. Serás redirigido automáticamente a tu dashboard ya logueado.',
    tags: ['verificar', 'confirmar', 'email', 'cuenta', 'activar'],
    url: '/help#verificar-cuenta',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-4',
    type: 'faq',
    title: '¿Cómo inicio sesión en mi cuenta?',
    description: 'Acceder a tu dashboard de Itineramio',
    content: 'Ve a itineramio.com/login e introduce tu email y contraseña. Si marcas "Recordarme", mantendrás la sesión activa durante 30 días. También puedes acceder directamente a itineramio.com/main si ya tienes sesión.',
    tags: ['login', 'iniciar sesión', 'acceder', 'entrar', 'dashboard'],
    url: '/help#login',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-5',
    type: 'faq',
    title: '¿Qué hago si olvidé mi contraseña?',
    description: 'Recuperar acceso a tu cuenta',
    content: 'En la página de login, haz clic en "¿Olvidaste tu contraseña?". Introduce tu email y recibirás un enlace para crear una nueva contraseña. El enlace expira en 24 horas por seguridad.',
    tags: ['contraseña', 'olvidé', 'recuperar', 'restablecer', 'password', 'reset'],
    url: '/help#recuperar-contrasena',
    category: 'Primeros Pasos'
  },

  // Dashboard y navegación
  {
    id: 'pp-6',
    type: 'faq',
    title: '¿Qué es el dashboard y cómo funciona?',
    description: 'Entender el panel de control principal',
    content: 'El dashboard es tu centro de control. Desde aquí ves todas tus propiedades, accedes a las estadísticas, gestionas tu cuenta y creas nuevos manuales. El menú lateral te permite navegar entre las diferentes secciones.',
    tags: ['dashboard', 'panel', 'control', 'inicio', 'principal', 'menú'],
    url: '/help#dashboard',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-7',
    type: 'faq',
    title: '¿Cómo navego entre las diferentes secciones?',
    description: 'Usar el menú de navegación',
    content: 'Usa el menú lateral izquierdo para moverte entre secciones: Propiedades, Analíticas, Cuenta, etc. En móvil, el menú se oculta y aparece con el icono de hamburguesa (☰) en la esquina superior.',
    tags: ['navegar', 'menú', 'secciones', 'moverse', 'lateral', 'móvil'],
    url: '/help#navegacion',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-8',
    type: 'faq',
    title: '¿Cómo creo mi primer manual digital?',
    description: 'Guía paso a paso para crear tu primer manual',
    content: 'Primero, crea una propiedad desde el dashboard (botón "+ Nueva propiedad"). Dale un nombre a tu alojamiento. Luego ve a "Zonas" y añade las áreas de tu propiedad (WiFi, check-in, cocina, etc.). Para cada zona, crea pasos con instrucciones detalladas.',
    tags: ['manual', 'crear', 'primero', 'inicio', 'tutorial', 'propiedad', 'zonas', 'pasos'],
    url: '/help#crear-manual',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-9',
    type: 'faq',
    title: '¿Cuánto tiempo se tarda en crear un manual completo?',
    description: 'Tiempo estimado para configurar tu manual',
    content: 'Un manual básico con 5-6 zonas (WiFi, check-in, cocina, baño, normas) se puede crear en 15-30 minutos. Si añades fotos y videos a cada paso, cuenta con 1-2 horas. Una vez creado, los cambios son instantáneos.',
    tags: ['tiempo', 'duración', 'crear', 'rápido', 'minutos', 'horas'],
    url: '/help#tiempo-crear',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-10',
    type: 'faq',
    title: '¿Necesito conocimientos técnicos para usar Itineramio?',
    description: 'Facilidad de uso de la plataforma',
    content: 'No, Itineramio está diseñado para ser muy fácil de usar. Si sabes usar WhatsApp o redes sociales, puedes crear un manual digital. Todo funciona con arrastrar y soltar, sin necesidad de programar ni conocimientos técnicos.',
    tags: ['fácil', 'técnico', 'conocimientos', 'sencillo', 'intuitivo', 'usar'],
    url: '/help#facilidad-uso',
    category: 'Primeros Pasos'
  },

  // Primera propiedad
  {
    id: 'pp-11',
    type: 'faq',
    title: '¿Qué información necesito para crear mi propiedad?',
    description: 'Datos básicos para empezar',
    content: 'Solo necesitas: nombre de la propiedad (ej: "Apartamento Centro Madrid"), dirección (opcional pero recomendada), y tu número de WhatsApp para que los huéspedes te contacten. El resto se puede añadir después.',
    tags: ['información', 'datos', 'propiedad', 'nombre', 'dirección', 'whatsapp'],
    url: '/help#info-propiedad',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-12',
    type: 'faq',
    title: '¿Puedo ver un ejemplo de manual antes de crear el mío?',
    description: 'Manuales de demostración',
    content: 'Sí, en nuestra página principal puedes ver demos interactivas de manuales reales. También al crear tu cuenta, te sugerimos plantillas prediseñadas para diferentes tipos de alojamiento (apartamento, casa rural, habitación).',
    tags: ['ejemplo', 'demo', 'ver', 'plantilla', 'muestra', 'modelo'],
    url: '/help#ejemplo-manual',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-13',
    type: 'faq',
    title: '¿Qué zonas debería incluir en mi manual?',
    description: 'Zonas recomendadas para empezar',
    content: 'Las zonas más importantes son: 1) Check-in/Llegada (cómo entrar), 2) WiFi (conexión a internet), 3) Cocina (electrodomésticos), 4) Baño (agua caliente, secador), 5) Normas de la casa. Luego puedes añadir: calefacción, terraza, parking, etc.',
    tags: ['zonas', 'recomendadas', 'incluir', 'importantes', 'básicas', 'empezar'],
    url: '/help#zonas-recomendadas',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-14',
    type: 'faq',
    title: '¿Cómo sé si mi manual está listo para compartir?',
    description: 'Verificar que el manual está completo',
    content: 'Tu manual está listo cuando: tiene al menos una zona con pasos, has añadido tu número de WhatsApp, y has probado el enlace tú mismo. Ve a "Vista previa" para ver exactamente lo que verán tus huéspedes antes de compartirlo.',
    tags: ['listo', 'completo', 'compartir', 'verificar', 'revisar', 'publicar'],
    url: '/help#manual-listo',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-15',
    type: 'faq',
    title: '¿Puedo crear el manual desde mi móvil?',
    description: 'Usar Itineramio en dispositivos móviles',
    content: 'Sí, Itineramio funciona perfectamente en móviles y tablets. Puedes crear y editar tu manual desde cualquier dispositivo con navegador web. No necesitas descargar ninguna app, todo funciona online.',
    tags: ['móvil', 'tablet', 'celular', 'smartphone', 'app', 'dispositivo'],
    url: '/help#crear-desde-movil',
    category: 'Primeros Pasos'
  },

  // Primeras configuraciones
  {
    id: 'pp-16',
    type: 'faq',
    title: '¿Cómo configuro mi número de WhatsApp?',
    description: 'Añadir teléfono de contacto para huéspedes',
    content: 'Ve a tu propiedad > Configuración o edita la propiedad. Introduce tu número de WhatsApp con el código de país (ej: +34 612345678). Este número aparecerá en el botón de contacto que ven tus huéspedes en el manual.',
    tags: ['whatsapp', 'teléfono', 'contacto', 'número', 'configurar', 'móvil'],
    url: '/help#configurar-whatsapp',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-17',
    type: 'faq',
    title: '¿Cómo añado una foto a mi propiedad?',
    description: 'Subir imagen de portada',
    content: 'En la edición de tu propiedad, busca la sección de imagen o foto de portada. Haz clic para subir una imagen desde tu dispositivo. Formatos aceptados: JPG, PNG. Tamaño máximo: 10MB. Se recomienda una foto horizontal de buena calidad.',
    tags: ['foto', 'imagen', 'portada', 'subir', 'añadir', 'propiedad'],
    url: '/help#foto-propiedad',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-18',
    type: 'faq',
    title: '¿Qué es la vista previa y cómo la uso?',
    description: 'Ver el manual como lo ven los huéspedes',
    content: 'La vista previa te muestra exactamente cómo verán el manual tus huéspedes. Búscala en el botón "Ver manual" o "Vista previa" en tu propiedad. Úsala siempre antes de compartir para asegurarte de que todo se ve correctamente.',
    tags: ['vista previa', 'preview', 'ver', 'huésped', 'comprobar', 'revisar'],
    url: '/help#vista-previa',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-19',
    type: 'faq',
    title: '¿Puedo deshacer cambios si me equivoco?',
    description: 'Revertir modificaciones accidentales',
    content: 'Los cambios se guardan automáticamente, pero siempre puedes editar de nuevo para corregir. Si eliminas algo importante por error, contacta con soporte rápidamente y podemos ayudarte a recuperarlo en algunos casos.',
    tags: ['deshacer', 'revertir', 'error', 'cambios', 'recuperar', 'equivocación'],
    url: '/help#deshacer-cambios',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-20',
    type: 'faq',
    title: '¿Los cambios que hago se guardan automáticamente?',
    description: 'Guardado automático de modificaciones',
    content: 'Sí, todos los cambios se guardan automáticamente cuando sales de un campo o haces clic en guardar. Verás un indicador de "Guardado" o "Guardando..." en la pantalla. No necesitas hacer nada especial para guardar tu trabajo.',
    tags: ['guardar', 'automático', 'cambios', 'guardar cambios', 'autosave'],
    url: '/help#guardado-automatico',
    category: 'Primeros Pasos'
  },

  // Ayuda y soporte inicial
  {
    id: 'pp-21',
    type: 'faq',
    title: '¿Dónde encuentro ayuda si tengo dudas?',
    description: 'Recursos de soporte disponibles',
    content: 'Tienes varias opciones: 1) Este Centro de Ayuda con búsqueda, 2) Email a hola@itineramio.com, 3) WhatsApp de soporte, 4) Blog con tutoriales y guías detalladas. Respondemos en menos de 24 horas.',
    tags: ['ayuda', 'soporte', 'dudas', 'contacto', 'asistencia', 'preguntas'],
    url: '/help#obtener-ayuda',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-22',
    type: 'faq',
    title: '¿Hay tutoriales en video para aprender?',
    description: 'Recursos de aprendizaje visual',
    content: 'Sí, tenemos videos tutoriales en nuestro blog y canal de YouTube. Cubren desde crear tu primer manual hasta funciones avanzadas. También encontrarás guías paso a paso con capturas de pantalla en nuestra sección de recursos.',
    tags: ['video', 'tutorial', 'aprender', 'youtube', 'visual', 'guía'],
    url: '/help#tutoriales-video',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-23',
    type: 'faq',
    title: '¿Puedo probar Itineramio gratis?',
    description: 'Período de prueba gratuito',
    content: 'Sí, ofrecemos 15 días de prueba con todas las funcionalidades. No necesitas tarjeta de crédito para empezar. Durante la prueba puedes crear propiedades, zonas, compartir manuales y probar todo sin limitaciones.',
    tags: ['gratis', 'prueba', 'trial', 'gratuito', 'días', 'probar'],
    url: '/help#prueba-gratis',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-24',
    type: 'faq',
    title: '¿Qué pasa cuando termina mi período de prueba?',
    description: 'Después de los 15 días gratuitos',
    content: 'Al terminar la prueba, tus manuales seguirán visibles pero no podrás editarlos. Para continuar, elige un plan de pago. No perdemos tu trabajo: todo lo que creaste durante la prueba se mantiene y podrás seguir usándolo al suscribirte.',
    tags: ['prueba', 'termina', 'después', 'plan', 'suscripción', 'continuar'],
    url: '/help#fin-prueba',
    category: 'Primeros Pasos'
  },
  {
    id: 'pp-25',
    type: 'faq',
    title: '¿Puedo cambiar el idioma de la interfaz de Itineramio?',
    description: 'Idioma del panel de administración',
    content: 'Actualmente la interfaz de administración está en español. Sin embargo, tus manuales pueden estar en múltiples idiomas (español, inglés, francés) para que tus huéspedes internacionales los vean en su idioma preferido.',
    tags: ['idioma', 'interfaz', 'español', 'cambiar', 'administración', 'panel'],
    url: '/help#idioma-interfaz',
    category: 'Primeros Pasos'
  },

  // ============================================
  // SECCIÓN 2: GESTIÓN DE PROPIEDADES (30 preguntas)
  // ============================================

  // Crear propiedades
  {
    id: 'gp-1',
    type: 'faq',
    title: '¿Cómo creo una nueva propiedad?',
    description: 'Añadir un nuevo alojamiento a tu cuenta',
    content: 'Desde el dashboard, haz clic en "+ Nueva propiedad" o "Añadir propiedad". Introduce el nombre (ej: "Ático Gran Vía"), opcionalmente la dirección, y guarda. Ya puedes empezar a añadir zonas y crear el manual.',
    tags: ['crear', 'nueva', 'propiedad', 'añadir', 'alojamiento', 'apartamento'],
    url: '/help#crear-propiedad',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-2',
    type: 'faq',
    title: '¿Cuántas propiedades puedo tener?',
    description: 'Límite de propiedades por plan',
    content: 'Depende de tu plan: Basic permite 1 propiedad, Host hasta 3, Superhost hasta 10, y Business ilimitadas. Puedes ver tu límite actual en la sección de cuenta y cambiar de plan si necesitas más propiedades.',
    tags: ['cuántas', 'límite', 'propiedades', 'máximo', 'plan', 'número'],
    url: '/help#limite-propiedades',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-3',
    type: 'faq',
    title: '¿Cómo edito el nombre de mi propiedad?',
    description: 'Cambiar el título del alojamiento',
    content: 'Ve a la propiedad que quieres editar y haz clic en el icono de edición (lápiz) o en "Editar propiedad". Modifica el nombre en el campo correspondiente y guarda los cambios. El cambio se refleja inmediatamente en el manual.',
    tags: ['editar', 'nombre', 'cambiar', 'título', 'modificar', 'propiedad'],
    url: '/help#editar-nombre-propiedad',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-4',
    type: 'faq',
    title: '¿Cómo cambio la descripción de mi propiedad?',
    description: 'Modificar la descripción del alojamiento',
    content: 'Entra en la edición de tu propiedad y busca el campo "Descripción". Escribe un texto breve y atractivo sobre tu alojamiento. Esta descripción aparece en la parte superior del manual que ven tus huéspedes.',
    tags: ['descripción', 'cambiar', 'texto', 'información', 'editar', 'propiedad'],
    url: '/help#cambiar-descripcion',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-5',
    type: 'faq',
    title: '¿Cómo añado la dirección de mi propiedad?',
    description: 'Configurar la ubicación del alojamiento',
    content: 'En la edición de propiedad, encuentra el campo de dirección. Introduce la dirección completa (calle, número, ciudad, código postal). Esta información ayuda a los huéspedes a llegar y puede mostrarse en el manual.',
    tags: ['dirección', 'ubicación', 'añadir', 'calle', 'ciudad', 'localización'],
    url: '/help#anadir-direccion',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-6',
    type: 'faq',
    title: '¿Puedo eliminar una propiedad?',
    description: 'Borrar un alojamiento de tu cuenta',
    content: 'Sí, ve a la propiedad > Configuración > Eliminar propiedad. Esta acción es irreversible: se borrarán todas las zonas, pasos y estadísticas. Los QR impresos dejarán de funcionar. Te pediremos confirmación antes de eliminar.',
    tags: ['eliminar', 'borrar', 'propiedad', 'quitar', 'suprimir', 'baja'],
    url: '/help#eliminar-propiedad',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-7',
    type: 'faq',
    title: '¿Cómo activo o desactivo una propiedad?',
    description: 'Pausar temporalmente un manual',
    content: 'En la configuración de la propiedad encontrarás un interruptor para activar/desactivar. Cuando está desactivada, el manual no es accesible para los huéspedes (verán un mensaje de "no disponible"). Útil cuando no alquilas temporalmente.',
    tags: ['activar', 'desactivar', 'pausar', 'ocultar', 'temporal', 'disponible'],
    url: '/help#activar-desactivar-propiedad',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-8',
    type: 'faq',
    title: '¿Puedo duplicar una propiedad existente?',
    description: 'Copiar configuración a un nuevo alojamiento',
    content: 'Sí, muy útil si tienes propiedades similares. Ve a la propiedad original > opciones > "Duplicar". Se creará una copia con todas las zonas y pasos. Luego solo modifica lo que sea diferente (nombre, fotos específicas, etc.).',
    tags: ['duplicar', 'copiar', 'clonar', 'plantilla', 'similar', 'repetir'],
    url: '/help#duplicar-propiedad',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-9',
    type: 'faq',
    title: '¿Cómo organizo mis propiedades si tengo varias?',
    description: 'Gestionar múltiples alojamientos',
    content: 'Desde el dashboard verás todas tus propiedades en tarjetas. Puedes crear grupos para organizarlas (ej: "Apartamentos Madrid", "Casas rurales"). También puedes buscar por nombre si tienes muchas propiedades.',
    tags: ['organizar', 'varias', 'múltiples', 'grupos', 'ordenar', 'gestionar'],
    url: '/help#organizar-propiedades',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-10',
    type: 'faq',
    title: '¿Qué son los grupos de propiedades?',
    description: 'Agrupar alojamientos relacionados',
    content: 'Los grupos te permiten organizar propiedades relacionadas bajo un mismo nombre (ej: todas las de una misma ciudad o edificio). Facilita la gestión cuando tienes muchos alojamientos y quieres encontrarlos rápidamente.',
    tags: ['grupos', 'agrupar', 'categorías', 'organización', 'conjunto', 'colección'],
    url: '/help#grupos-propiedades',
    category: 'Gestión de Propiedades'
  },

  // Configuración avanzada de propiedades
  {
    id: 'gp-11',
    type: 'faq',
    title: '¿Puedo añadir el nombre de la propiedad en varios idiomas?',
    description: 'Traducir el nombre del alojamiento',
    content: 'Sí, en la edición de propiedad verás pestañas para ES (español), EN (inglés) y FR (francés). Escribe el nombre en cada idioma. Si un huésped ve el manual en inglés, verá el nombre traducido automáticamente.',
    tags: ['nombre', 'idiomas', 'traducir', 'inglés', 'francés', 'multiidioma'],
    url: '/help#nombre-multiidioma',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-12',
    type: 'faq',
    title: '¿Cómo añado una imagen de portada a mi propiedad?',
    description: 'Foto principal del alojamiento',
    content: 'En la edición de propiedad, busca el área de imagen de portada. Haz clic para subir o arrastra una foto. Esta imagen aparece en la cabecera del manual. Usa una foto atractiva de tu propiedad, preferiblemente horizontal.',
    tags: ['imagen', 'portada', 'foto', 'principal', 'cabecera', 'subir'],
    url: '/help#imagen-portada',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-13',
    type: 'faq',
    title: '¿Qué tipo de propiedades puedo crear?',
    description: 'Tipos de alojamientos soportados',
    content: 'Itineramio funciona para cualquier tipo de alojamiento: apartamentos, casas, villas, habitaciones, casas rurales, hostales, hoteles boutique, autocaravanas, barcos, etc. La estructura de zonas se adapta a cualquier espacio.',
    tags: ['tipo', 'propiedad', 'apartamento', 'casa', 'villa', 'rural', 'habitación'],
    url: '/help#tipos-propiedad',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-14',
    type: 'faq',
    title: '¿Puedo tener propiedades en diferentes ciudades o países?',
    description: 'Gestionar alojamientos en múltiples ubicaciones',
    content: 'Sí, puedes tener propiedades en cualquier lugar del mundo. Cada una tiene su propia configuración, idiomas y dirección. No hay restricciones geográficas. Es ideal para anfitriones con propiedades en diferentes destinos.',
    tags: ['ciudades', 'países', 'diferentes', 'ubicaciones', 'internacional', 'mundial'],
    url: '/help#propiedades-multiples-ubicaciones',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-15',
    type: 'faq',
    title: '¿Cómo veo las estadísticas de mi propiedad?',
    description: 'Acceder a las analíticas del alojamiento',
    content: 'Desde tu propiedad, haz clic en el botón "Analíticas" (icono de gráfico violeta). Verás visitas al manual, zonas más consultadas, tiempo de uso, valoraciones de huéspedes y más. Los datos se actualizan en tiempo real.',
    tags: ['estadísticas', 'analíticas', 'visitas', 'métricas', 'datos', 'gráficos'],
    url: '/help#estadisticas-propiedad',
    category: 'Gestión de Propiedades'
  },

  // Enlace y acceso al manual
  {
    id: 'gp-16',
    type: 'faq',
    title: '¿Dónde encuentro el enlace de mi manual?',
    description: 'Obtener la URL para compartir',
    content: 'En tu propiedad, busca el botón "Compartir" o "Copiar enlace". El enlace tiene el formato: itineramio.com/g/CODIGO-UNICO. Este es el enlace que compartes con tus huéspedes por WhatsApp, email, o en tu anuncio.',
    tags: ['enlace', 'link', 'URL', 'compartir', 'copiar', 'dirección'],
    url: '/help#enlace-manual',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-17',
    type: 'faq',
    title: '¿Puedo personalizar la URL de mi manual?',
    description: 'Tener un enlace personalizado',
    content: 'Los enlaces se generan automáticamente con un código único. Sin embargo, puedes crear un enlace corto memorable usando servicios como bit.ly si lo necesitas. El enlace original siempre funcionará aunque crees uno corto.',
    tags: ['URL', 'personalizar', 'enlace', 'custom', 'link', 'corto'],
    url: '/help#personalizar-url',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-18',
    type: 'faq',
    title: '¿Qué pasa si comparto el enlace y luego cambio algo?',
    description: 'Cambios después de compartir',
    content: 'No te preocupes, el enlace siempre muestra la versión más actualizada de tu manual. Si cambias algo (añades zona, corriges texto, etc.), los huéspedes verán los cambios inmediatamente sin necesidad de enviar un nuevo enlace.',
    tags: ['cambios', 'actualizar', 'enlace', 'tiempo real', 'modificar', 'después'],
    url: '/help#cambios-despues-compartir',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-19',
    type: 'faq',
    title: '¿Puedo ver el manual como lo ven mis huéspedes?',
    description: 'Vista previa del manual',
    content: 'Sí, usa el botón "Ver manual" o "Vista previa" en tu propiedad. Se abrirá exactamente como lo verán tus huéspedes. Pruébalo en móvil y ordenador para asegurarte de que todo se ve bien antes de compartir.',
    tags: ['ver', 'manual', 'preview', 'vista previa', 'huésped', 'probar'],
    url: '/help#ver-como-huesped',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-20',
    type: 'faq',
    title: '¿El enlace de mi manual caduca?',
    description: 'Duración del enlace del manual',
    content: 'No, el enlace de tu manual nunca caduca mientras tu cuenta esté activa y la propiedad no esté eliminada. Los códigos QR que imprimas seguirán funcionando indefinidamente. Solo cambiaría si eliminas y recreas la propiedad.',
    tags: ['caduca', 'expira', 'enlace', 'duración', 'permanente', 'validez'],
    url: '/help#enlace-caducidad',
    category: 'Gestión de Propiedades'
  },

  // Problemas con propiedades
  {
    id: 'gp-21',
    type: 'faq',
    title: '¿Por qué mi propiedad aparece como "inactiva"?',
    description: 'Propiedad desactivada',
    content: 'Una propiedad puede estar inactiva porque: 1) La desactivaste manualmente, 2) Tu período de prueba terminó, 3) Hay un problema con tu suscripción. Revisa la configuración de la propiedad y tu estado de cuenta.',
    tags: ['inactiva', 'desactivada', 'no funciona', 'problema', 'estado', 'activar'],
    url: '/help#propiedad-inactiva',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-22',
    type: 'faq',
    title: '¿Puedo recuperar una propiedad eliminada?',
    description: 'Restaurar un alojamiento borrado',
    content: 'Desafortunadamente, una vez eliminada una propiedad, no se puede recuperar automáticamente. Por eso pedimos doble confirmación antes de eliminar. Si la eliminaste por error muy recientemente, contacta con soporte urgentemente.',
    tags: ['recuperar', 'eliminada', 'borrada', 'restaurar', 'deshacer', 'volver'],
    url: '/help#recuperar-propiedad-eliminada',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-23',
    type: 'faq',
    title: '¿Por qué no puedo crear más propiedades?',
    description: 'Límite de propiedades alcanzado',
    content: 'Has alcanzado el límite de tu plan actual. Verás un mensaje indicando cuántas propiedades tienes vs. cuántas permite tu plan. Para crear más, debes actualizar a un plan superior desde la sección de cuenta/suscripción.',
    tags: ['límite', 'máximo', 'crear', 'más', 'plan', 'actualizar'],
    url: '/help#limite-propiedades-alcanzado',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-24',
    type: 'faq',
    title: '¿Puedo transferir una propiedad a otra cuenta?',
    description: 'Mover propiedad entre cuentas',
    content: 'Actualmente no hay opción automática para transferir propiedades entre cuentas. Si necesitas hacerlo (ej: vendiste el alojamiento), contacta con soporte y evaluaremos la mejor solución para tu caso.',
    tags: ['transferir', 'mover', 'otra cuenta', 'cambiar', 'propietario', 'ceder'],
    url: '/help#transferir-propiedad',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-25',
    type: 'faq',
    title: '¿Cómo ordeno mis propiedades en el dashboard?',
    description: 'Cambiar el orden de visualización',
    content: 'Por defecto se muestran por fecha de creación (más recientes primero). Puedes usar la búsqueda para encontrar rápidamente una propiedad específica. Los grupos también ayudan a organizar propiedades relacionadas.',
    tags: ['ordenar', 'orden', 'dashboard', 'lista', 'visualización', 'organizar'],
    url: '/help#ordenar-propiedades',
    category: 'Gestión de Propiedades'
  },

  // Configuraciones adicionales
  {
    id: 'gp-26',
    type: 'faq',
    title: '¿Cómo cambio el teléfono de WhatsApp de mi propiedad?',
    description: 'Actualizar número de contacto',
    content: 'Ve a tu propiedad > Editar > busca el campo de WhatsApp. Borra el número actual e introduce el nuevo con código de país (ej: +34 612345678). Guarda los cambios. El botón de contacto en el manual mostrará el nuevo número.',
    tags: ['whatsapp', 'teléfono', 'cambiar', 'número', 'contacto', 'actualizar'],
    url: '/help#cambiar-whatsapp',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-27',
    type: 'faq',
    title: '¿Puedo usar diferentes números de WhatsApp para cada propiedad?',
    description: 'Distintos contactos por alojamiento',
    content: 'Sí, cada propiedad tiene su propia configuración de WhatsApp. Útil si diferentes personas gestionan diferentes propiedades, o si tienes líneas separadas para cada alojamiento.',
    tags: ['diferentes', 'whatsapp', 'propiedad', 'número', 'separado', 'individual'],
    url: '/help#diferentes-whatsapp',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-28',
    type: 'faq',
    title: '¿Cómo pongo mi propiedad en modo vacaciones?',
    description: 'Pausar temporalmente el alojamiento',
    content: 'Desactiva la propiedad desde su configuración. El manual mostrará un mensaje de "temporalmente no disponible". Cuando vuelvas a alquilar, simplemente reactívala. No pierdes ninguna configuración ni contenido.',
    tags: ['vacaciones', 'pausar', 'temporal', 'desactivar', 'modo', 'pausa'],
    url: '/help#modo-vacaciones',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-29',
    type: 'faq',
    title: '¿Puedo ver el historial de cambios de mi propiedad?',
    description: 'Registro de modificaciones',
    content: 'Actualmente no hay un historial detallado de cambios. Puedes ver cuándo se creó la propiedad y la última modificación. Para cambios importantes, te recomendamos llevar un registro propio o duplicar antes de hacer cambios grandes.',
    tags: ['historial', 'cambios', 'registro', 'modificaciones', 'versiones', 'log'],
    url: '/help#historial-cambios',
    category: 'Gestión de Propiedades'
  },
  {
    id: 'gp-30',
    type: 'faq',
    title: '¿Cómo exporto la información de mi propiedad?',
    description: 'Descargar datos del alojamiento',
    content: 'Actualmente puedes copiar manualmente el contenido o hacer capturas de pantalla. Estamos trabajando en una función de exportación a PDF. Para datos de analíticas, puedes ver los gráficos y anotarlos para tus informes.',
    tags: ['exportar', 'descargar', 'backup', 'copia', 'datos', 'PDF'],
    url: '/help#exportar-propiedad',
    category: 'Gestión de Propiedades'
  },

  // ============================================
  // SECCIÓN 3: ZONAS DEL MANUAL (40 preguntas)
  // ============================================

  // Crear zonas
  {
    id: 'zm-1',
    type: 'faq',
    title: '¿Qué es una zona en Itineramio?',
    description: 'Concepto de zonas en el manual digital',
    content: 'Una zona es un área o tema de tu propiedad que quieres explicar a tus huéspedes. Por ejemplo: WiFi, cocina, baño, check-in, normas, terraza. Cada zona contiene pasos con instrucciones específicas.',
    tags: ['zona', 'qué es', 'área', 'sección', 'concepto', 'definición'],
    url: '/help#que-es-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-2',
    type: 'faq',
    title: '¿Cómo creo una nueva zona?',
    description: 'Añadir una zona a tu manual',
    content: 'Ve a tu propiedad > Zonas > botón "+ Nueva zona" o "Añadir zona". Elige un nombre (ej: "Cocina"), selecciona un icono, y guarda. Luego podrás añadir pasos con instrucciones dentro de esa zona.',
    tags: ['crear', 'nueva', 'zona', 'añadir', 'agregar'],
    url: '/help#crear-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-3',
    type: 'faq',
    title: '¿Cuántas zonas puedo crear?',
    description: 'Límite de zonas por propiedad',
    content: 'No hay límite de zonas. Puedes crear tantas como necesites para tu propiedad. Sin embargo, recomendamos entre 5 y 15 zonas para mantener el manual organizado y fácil de navegar para los huéspedes.',
    tags: ['cuántas', 'límite', 'zonas', 'máximo', 'número'],
    url: '/help#limite-zonas',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-4',
    type: 'faq',
    title: '¿Qué zonas debería crear para mi apartamento?',
    description: 'Zonas recomendadas para apartamentos',
    content: 'Para un apartamento típico: Check-in/Llegada, WiFi, Cocina, Baño, Dormitorio, Climatización (aire/calefacción), Normas de la casa, Check-out/Salida. Añade zonas extra según tu propiedad: terraza, parking, lavadora, etc.',
    tags: ['apartamento', 'zonas', 'recomendadas', 'cuáles', 'típicas'],
    url: '/help#zonas-apartamento',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-5',
    type: 'faq',
    title: '¿Qué zonas debería crear para una casa rural?',
    description: 'Zonas recomendadas para casas rurales',
    content: 'Para casa rural: Llegada y acceso, WiFi, Cocina, Baños, Chimenea/Estufa, Jardín/Exterior, Piscina (si hay), Barbacoa, Animales (si hay), Actividades cercanas, Normas, Emergencias. Adapta según tu propiedad.',
    tags: ['casa rural', 'zonas', 'recomendadas', 'campo', 'rural'],
    url: '/help#zonas-casa-rural',
    category: 'Zonas del Manual'
  },

  // Editar y gestionar zonas
  {
    id: 'zm-6',
    type: 'faq',
    title: '¿Cómo edito el nombre de una zona?',
    description: 'Cambiar el título de una zona',
    content: 'Haz clic en la zona que quieres editar, luego en el icono de lápiz o "Editar". Modifica el nombre y guarda. El cambio se refleja inmediatamente en el manual que ven tus huéspedes.',
    tags: ['editar', 'nombre', 'zona', 'cambiar', 'título', 'modificar'],
    url: '/help#editar-nombre-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-7',
    type: 'faq',
    title: '¿Cómo elimino una zona?',
    description: 'Borrar una zona del manual',
    content: 'En la lista de zonas, busca el icono de papelera o la opción "Eliminar" en el menú de la zona. Se eliminará la zona y todos sus pasos. Esta acción no se puede deshacer, así que confirma antes de eliminar.',
    tags: ['eliminar', 'borrar', 'zona', 'quitar', 'suprimir'],
    url: '/help#eliminar-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-8',
    type: 'faq',
    title: '¿Cómo cambio el orden de las zonas?',
    description: 'Reordenar zonas en el manual',
    content: 'Arrastra las zonas hacia arriba o abajo para cambiar su orden. Usa el icono de 6 puntos (⋮⋮) o el área de arrastre. El orden que configures es el que verán tus huéspedes al abrir el manual.',
    tags: ['orden', 'ordenar', 'zonas', 'mover', 'arrastrar', 'posición'],
    url: '/help#ordenar-zonas',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-9',
    type: 'faq',
    title: '¿Puedo ocultar una zona temporalmente?',
    description: 'Desactivar una zona sin eliminarla',
    content: 'Sí, algunas zonas tienen un toggle de visibilidad. Si lo desactivas, la zona no aparecerá en el manual pero no se borra. Útil para zonas estacionales (ej: piscina en invierno) o en renovación.',
    tags: ['ocultar', 'zona', 'temporal', 'desactivar', 'invisible', 'esconder'],
    url: '/help#ocultar-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-10',
    type: 'faq',
    title: '¿Puedo duplicar una zona?',
    description: 'Copiar una zona existente',
    content: 'Sí, si tienes zonas similares puedes duplicar una y luego modificar los detalles. Busca la opción "Duplicar" en el menú de la zona. Se copiará con todos sus pasos.',
    tags: ['duplicar', 'copiar', 'zona', 'clonar', 'repetir'],
    url: '/help#duplicar-zona',
    category: 'Zonas del Manual'
  },

  // Iconos de zonas
  {
    id: 'zm-11',
    type: 'faq',
    title: '¿Cómo cambio el icono de una zona?',
    description: 'Personalizar el icono visual',
    content: 'Al crear o editar una zona, verás un selector de iconos. Haz clic para ver todos los disponibles: WiFi, cocina, cama, ducha, llave, coche, etc. Elige el que mejor represente la zona.',
    tags: ['icono', 'zona', 'cambiar', 'imagen', 'símbolo', 'visual'],
    url: '/help#cambiar-icono-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-12',
    type: 'faq',
    title: '¿Qué iconos hay disponibles para las zonas?',
    description: 'Catálogo de iconos disponibles',
    content: 'Tenemos más de 50 iconos: WiFi, llave, cocina, nevera, microondas, lavadora, cama, ducha, aire acondicionado, calefacción, TV, parking, piscina, jardín, barbacoa, mascota, emergencia, normas, y muchos más.',
    tags: ['iconos', 'disponibles', 'catálogo', 'lista', 'cuáles', 'símbolos'],
    url: '/help#iconos-disponibles',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-13',
    type: 'faq',
    title: '¿Puedo subir mi propio icono personalizado?',
    description: 'Usar iconos propios',
    content: 'Actualmente usamos una biblioteca de iconos predefinidos para mantener la coherencia visual. No es posible subir iconos propios, pero nuestra colección cubre la mayoría de necesidades de alojamientos turísticos.',
    tags: ['icono', 'personalizado', 'propio', 'subir', 'custom'],
    url: '/help#icono-personalizado',
    category: 'Zonas del Manual'
  },

  // Zonas en múltiples idiomas
  {
    id: 'zm-14',
    type: 'faq',
    title: '¿Puedo traducir el nombre de las zonas?',
    description: 'Zonas en varios idiomas',
    content: 'Sí, al editar una zona verás pestañas de idiomas (ES, EN, FR). Escribe el nombre en cada idioma: "Cocina" en español, "Kitchen" en inglés, "Cuisine" en francés. Los huéspedes verán el nombre en su idioma.',
    tags: ['traducir', 'zona', 'idioma', 'nombre', 'inglés', 'francés'],
    url: '/help#traducir-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-15',
    type: 'faq',
    title: '¿Qué pasa si no traduzco una zona?',
    description: 'Zonas sin traducción',
    content: 'Si un huésped ve el manual en inglés pero no has traducido la zona, verá el nombre en español (el idioma por defecto). Recomendamos traducir al menos las zonas principales para huéspedes internacionales.',
    tags: ['traducción', 'falta', 'idioma', 'español', 'defecto'],
    url: '/help#zona-sin-traduccion',
    category: 'Zonas del Manual'
  },

  // Tipos de zonas especiales
  {
    id: 'zm-16',
    type: 'faq',
    title: '¿Cómo creo una zona de WiFi?',
    description: 'Configurar zona para conexión a internet',
    content: 'Crea una zona llamada "WiFi" con el icono de WiFi. Añade un paso con el nombre de la red y otro con la contraseña. Tip: escribe la contraseña claramente para que puedan copiarla fácilmente.',
    tags: ['wifi', 'zona', 'internet', 'contraseña', 'red', 'conexión'],
    url: '/help#zona-wifi',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-17',
    type: 'faq',
    title: '¿Cómo creo una zona de check-in?',
    description: 'Instrucciones de llegada',
    content: 'Crea una zona "Check-in" o "Llegada". Incluye pasos con: dirección exacta, cómo llegar (transporte público, parking), dónde están las llaves o código de entrada, y qué hacer al llegar. Añade fotos de la fachada y entrada.',
    tags: ['check-in', 'llegada', 'zona', 'entrada', 'llaves', 'acceso'],
    url: '/help#zona-checkin',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-18',
    type: 'faq',
    title: '¿Cómo creo una zona de normas de la casa?',
    description: 'Reglas para huéspedes',
    content: 'Crea una zona "Normas" o "Reglas de la casa". Añade pasos para cada norma importante: horarios de silencio, política de mascotas, prohibición de fiestas, reciclaje, etc. Sé claro pero amable en el tono.',
    tags: ['normas', 'reglas', 'zona', 'casa', 'prohibiciones', 'políticas'],
    url: '/help#zona-normas',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-19',
    type: 'faq',
    title: '¿Cómo creo una zona de check-out?',
    description: 'Instrucciones de salida',
    content: 'Crea una zona "Check-out" o "Salida". Incluye: hora de salida, qué hacer con las llaves, si deben dejar sábanas/toallas en algún lugar, qué electrodomésticos apagar, y cómo cerrar. Mantén las instrucciones simples.',
    tags: ['check-out', 'salida', 'zona', 'dejar', 'llaves', 'final'],
    url: '/help#zona-checkout',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-20',
    type: 'faq',
    title: '¿Cómo creo una zona de emergencias?',
    description: 'Información de seguridad y emergencias',
    content: 'Crea una zona "Emergencias" con icono de alerta. Incluye: números de emergencia (112, policía local), ubicación del extintor y botiquín, hospital más cercano, tu teléfono para urgencias, y protocolos básicos de seguridad.',
    tags: ['emergencias', 'zona', 'seguridad', 'urgencias', 'teléfonos', 'ayuda'],
    url: '/help#zona-emergencias',
    category: 'Zonas del Manual'
  },

  // Zonas de electrodomésticos y equipamiento
  {
    id: 'zm-21',
    type: 'faq',
    title: '¿Cómo explico el funcionamiento de la cocina?',
    description: 'Zona de cocina y electrodomésticos',
    content: 'Crea una zona "Cocina". Añade pasos para: encender vitrocerámica/gas, usar horno y microondas, cafetera, lavavajillas, dónde están utensilios y vajilla. Sube fotos de los electrodomésticos mostrando los botones importantes.',
    tags: ['cocina', 'electrodomésticos', 'horno', 'vitrocerámica', 'cafetera'],
    url: '/help#zona-cocina',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-22',
    type: 'faq',
    title: '¿Cómo explico el aire acondicionado?',
    description: 'Zona de climatización',
    content: 'Crea una zona "Aire acondicionado" o "Climatización". Explica: cómo encender/apagar, dónde está el mando, qué temperatura recomienadas, si hay modos especiales (eco, noche). Una foto del mando con flechas ayuda mucho.',
    tags: ['aire acondicionado', 'clima', 'mando', 'temperatura', 'enfriar'],
    url: '/help#zona-aire-acondicionado',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-23',
    type: 'faq',
    title: '¿Cómo explico la calefacción?',
    description: 'Instrucciones de calefacción',
    content: 'Crea una zona "Calefacción". Explica el tipo (radiadores, suelo radiante, estufa), cómo encenderla, dónde está el termostato, temperatura recomendada, y cualquier precaución. Si es gas, incluye instrucciones de seguridad.',
    tags: ['calefacción', 'radiador', 'termostato', 'calentar', 'estufa'],
    url: '/help#zona-calefaccion',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-24',
    type: 'faq',
    title: '¿Cómo explico el funcionamiento del baño?',
    description: 'Zona de baño y agua caliente',
    content: 'Crea una zona "Baño". Incluye: cómo funciona la ducha (grifo, mampara), agua caliente (si tarda, si hay que encender calentador), dónde están toallas extra, secador de pelo, y cómo funciona el WC si tiene particularidades.',
    tags: ['baño', 'ducha', 'agua caliente', 'toallas', 'grifo'],
    url: '/help#zona-bano',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-25',
    type: 'faq',
    title: '¿Cómo explico la lavadora?',
    description: 'Instrucciones de lavadora/secadora',
    content: 'Crea una zona "Lavadora" o inclúyelo en "Electrodomésticos". Explica: dónde está, cómo encenderla, qué programa usar para ropa normal, dónde poner detergente (indícalo si proporcionas), y dónde tender.',
    tags: ['lavadora', 'ropa', 'lavar', 'detergente', 'secadora'],
    url: '/help#zona-lavadora',
    category: 'Zonas del Manual'
  },

  // Zonas de exteriores
  {
    id: 'zm-26',
    type: 'faq',
    title: '¿Cómo creo una zona de piscina?',
    description: 'Instrucciones de uso de la piscina',
    content: 'Crea una zona "Piscina". Incluye: horarios de uso, normas (ducha antes, sin cristales), profundidad, si hay que activar bomba/depuradora, dónde están flotadores/tumbonas, y precauciones de seguridad con niños.',
    tags: ['piscina', 'zona', 'normas', 'baño', 'verano', 'seguridad'],
    url: '/help#zona-piscina',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-27',
    type: 'faq',
    title: '¿Cómo creo una zona de terraza o jardín?',
    description: 'Espacios exteriores',
    content: 'Crea una zona "Terraza" o "Jardín". Incluye: cómo usar el mobiliario exterior, dónde está la sombrilla, si hay riego automático que deben respetar, normas de ruido para vecinos, y cómo funciona la iluminación exterior.',
    tags: ['terraza', 'jardín', 'exterior', 'patio', 'balcón'],
    url: '/help#zona-terraza',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-28',
    type: 'faq',
    title: '¿Cómo creo una zona de barbacoa?',
    description: 'Instrucciones de uso de barbacoa',
    content: 'Crea una zona "Barbacoa". Explica: tipo (gas, carbón, eléctrica), cómo encenderla, dónde está el combustible, normas de limpieza después de usar, y precauciones de seguridad. Incluye foto mostrando los controles.',
    tags: ['barbacoa', 'parrilla', 'gas', 'carbón', 'exterior'],
    url: '/help#zona-barbacoa',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-29',
    type: 'faq',
    title: '¿Cómo creo una zona de parking?',
    description: 'Información de aparcamiento',
    content: 'Crea una zona "Parking" o "Aparcamiento". Incluye: ubicación exacta de la plaza, cómo acceder (mando, código), dimensiones si es ajustado, normas del garaje comunitario, y alternativas de parking cercano si no hay plaza incluida.',
    tags: ['parking', 'aparcamiento', 'garaje', 'coche', 'plaza'],
    url: '/help#zona-parking',
    category: 'Zonas del Manual'
  },

  // Zonas informativas
  {
    id: 'zm-30',
    type: 'faq',
    title: '¿Cómo creo una zona de recomendaciones locales?',
    description: 'Restaurantes y sitios de interés',
    content: 'Crea una zona "Recomendaciones" o "Qué ver". Añade pasos con tus sugerencias: restaurantes favoritos, supermercados cercanos, transporte público, atracciones turísticas, playas, etc. Los huéspedes lo agradecen mucho.',
    tags: ['recomendaciones', 'restaurantes', 'zona', 'turismo', 'local'],
    url: '/help#zona-recomendaciones',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-31',
    type: 'faq',
    title: '¿Cómo creo una zona de transporte?',
    description: 'Información de cómo moverse',
    content: 'Crea una zona "Transporte" o "Cómo llegar". Incluye: paradas de metro/bus cercanas, líneas útiles, taxis (números o apps), alquiler de coches/bicis, y cómo llegar desde aeropuerto/estación. Muy útil para turistas.',
    tags: ['transporte', 'metro', 'bus', 'taxi', 'cómo llegar'],
    url: '/help#zona-transporte',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-32',
    type: 'faq',
    title: '¿Cómo creo una zona sobre basura y reciclaje?',
    description: 'Instrucciones de reciclaje',
    content: 'Crea una zona "Basura" o "Reciclaje". Explica: dónde están los contenedores (dentro y fuera), qué va en cada uno (orgánico, plástico, papel, vidrio), horarios de recogida si aplica, y dónde dejar la basura al hacer check-out.',
    tags: ['basura', 'reciclaje', 'contenedor', 'residuos', 'ecología'],
    url: '/help#zona-basura',
    category: 'Zonas del Manual'
  },

  // Organización y mejores prácticas
  {
    id: 'zm-33',
    type: 'faq',
    title: '¿En qué orden debería poner las zonas?',
    description: 'Orden óptimo de las zonas',
    content: 'Recomendamos: 1) Check-in primero (lo primero que necesitan), 2) WiFi (lo más consultado), 3) Zonas de uso diario (cocina, baño), 4) Extras (terraza, piscina), 5) Normas, 6) Check-out último. Pero adapta según tu propiedad.',
    tags: ['orden', 'zonas', 'organizar', 'primero', 'secuencia'],
    url: '/help#orden-zonas',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-34',
    type: 'faq',
    title: '¿Cuántos pasos debería tener cada zona?',
    description: 'Cantidad ideal de pasos por zona',
    content: 'Depende de la complejidad. Una zona simple como WiFi puede tener 1-2 pasos. Una cocina completa puede tener 5-10 pasos. En general, entre 3 y 8 pasos por zona es ideal. Si tienes más de 10, considera dividir en subzonas.',
    tags: ['pasos', 'cuántos', 'zona', 'cantidad', 'ideal'],
    url: '/help#cantidad-pasos',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-35',
    type: 'faq',
    title: '¿Puedo mover pasos de una zona a otra?',
    description: 'Reorganizar pasos entre zonas',
    content: 'Actualmente, para mover un paso a otra zona, debes crear el paso nuevo en la zona destino y eliminar el original. Copia el contenido antes de eliminar. Estamos trabajando en hacer esto más fácil con arrastrar y soltar.',
    tags: ['mover', 'pasos', 'zona', 'otra', 'reorganizar', 'cambiar'],
    url: '/help#mover-pasos-zona',
    category: 'Zonas del Manual'
  },

  // Problemas con zonas
  {
    id: 'zm-36',
    type: 'faq',
    title: '¿Por qué mi zona no aparece en el manual?',
    description: 'Zona invisible para huéspedes',
    content: 'Posibles causas: 1) La zona está desactivada/oculta, 2) La zona no tiene pasos (zonas vacías no se muestran), 3) No has guardado los cambios, 4) Hay un error de carga. Revisa la configuración de la zona y añade al menos un paso.',
    tags: ['zona', 'no aparece', 'invisible', 'problema', 'oculta'],
    url: '/help#zona-no-aparece',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-37',
    type: 'faq',
    title: '¿Puedo recuperar una zona que eliminé por error?',
    description: 'Restaurar zona borrada',
    content: 'Lamentablemente, una zona eliminada no se puede recuperar automáticamente. Tendrás que crearla de nuevo. Por eso pedimos confirmación antes de eliminar. Consejo: si tienes zonas complejas, duplica antes de hacer cambios grandes.',
    tags: ['recuperar', 'zona', 'eliminada', 'borrada', 'restaurar'],
    url: '/help#recuperar-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-38',
    type: 'faq',
    title: '¿Por qué tarda en cargar mi zona con muchas fotos?',
    description: 'Zona lenta por imágenes',
    content: 'Zonas con muchas imágenes grandes pueden tardar más en cargar. Recomendamos: optimizar las fotos antes de subirlas (máximo 1-2 MB cada una), no subir más de 5-10 fotos por zona, y usar formatos JPG comprimidos.',
    tags: ['lenta', 'cargar', 'fotos', 'imágenes', 'pesada', 'optimizar'],
    url: '/help#zona-lenta-fotos',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-39',
    type: 'faq',
    title: '¿Puedo ver cuántas veces se ha consultado cada zona?',
    description: 'Estadísticas por zona',
    content: 'Sí, en las analíticas de tu propiedad verás un ranking de zonas más visitadas. Así sabes qué zonas consultan más tus huéspedes (WiFi suele ser la #1) y cuáles podrían necesitar mejoras o más visibilidad.',
    tags: ['estadísticas', 'zona', 'visitas', 'analíticas', 'consultas'],
    url: '/help#estadisticas-zona',
    category: 'Zonas del Manual'
  },
  {
    id: 'zm-40',
    type: 'faq',
    title: '¿Puedo compartir solo una zona específica?',
    description: 'Enviar enlace de una sola zona',
    content: 'Sí, cada zona tiene su propio código QR y enlace único. Ve a la zona > "Compartir" o "QR" para obtener el enlace directo. Útil para poner en la nevera el QR de cocina, o junto a la TV el QR de entretenimiento.',
    tags: ['compartir', 'zona', 'específica', 'enlace', 'individual', 'QR'],
    url: '/help#compartir-zona-especifica',
    category: 'Zonas del Manual'
  },

  // ============================================
  // SECCIÓN 4: PASOS E INSTRUCCIONES (35 preguntas)
  // ============================================

  // Crear y editar pasos
  {
    id: 'pi-1',
    type: 'faq',
    title: '¿Qué es un paso en Itineramio?',
    description: 'Concepto de pasos en las zonas',
    content: 'Un paso es una instrucción individual dentro de una zona. Por ejemplo, en la zona "Cocina" puedes tener pasos como: "Cómo encender la vitrocerámica", "Cómo usar el horno", "Dónde están los utensilios". Cada paso puede tener texto, fotos y videos.',
    tags: ['paso', 'qué es', 'instrucción', 'concepto', 'definición'],
    url: '/help#que-es-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-2',
    type: 'faq',
    title: '¿Cómo añado un nuevo paso a una zona?',
    description: 'Crear una nueva instrucción',
    content: 'Abre la zona donde quieres añadir el paso. Haz clic en "+ Nuevo paso" o "Añadir paso". Escribe un título descriptivo y el contenido de la instrucción. Puedes añadir fotos y videos. Guarda cuando termines.',
    tags: ['añadir', 'paso', 'crear', 'nuevo', 'instrucción'],
    url: '/help#añadir-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-3',
    type: 'faq',
    title: '¿Cómo edito un paso existente?',
    description: 'Modificar una instrucción',
    content: 'Haz clic en el paso que quieres editar. Se abrirá el editor donde puedes modificar el título, contenido, fotos y videos. Los cambios se guardan cuando haces clic en "Guardar" o automáticamente según la configuración.',
    tags: ['editar', 'paso', 'modificar', 'cambiar', 'actualizar'],
    url: '/help#editar-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-4',
    type: 'faq',
    title: '¿Cómo elimino un paso?',
    description: 'Borrar una instrucción',
    content: 'Abre el paso y busca el botón de eliminar (papelera) o la opción "Eliminar paso" en el menú. Confirma la eliminación. El paso y todo su contenido (fotos, videos) se borrarán permanentemente.',
    tags: ['eliminar', 'paso', 'borrar', 'quitar', 'suprimir'],
    url: '/help#eliminar-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-5',
    type: 'faq',
    title: '¿Cómo cambio el orden de los pasos?',
    description: 'Reordenar instrucciones',
    content: 'Arrastra los pasos hacia arriba o abajo usando el área de arrastre (icono de 6 puntos ⋮⋮). El orden que configures es el que verán tus huéspedes. Pon primero las instrucciones más importantes o las que deben seguirse en secuencia.',
    tags: ['orden', 'pasos', 'ordenar', 'mover', 'reorganizar'],
    url: '/help#ordenar-pasos',
    category: 'Pasos e Instrucciones'
  },

  // Contenido de los pasos
  {
    id: 'pi-6',
    type: 'faq',
    title: '¿Qué debería escribir en el título de un paso?',
    description: 'Mejores títulos para instrucciones',
    content: 'Usa títulos cortos y descriptivos que indiquen la acción: "Cómo encender la TV", "Contraseña del WiFi", "Dónde dejar las llaves". El huésped debería saber de qué trata el paso solo leyendo el título.',
    tags: ['título', 'paso', 'escribir', 'nombre', 'descriptivo'],
    url: '/help#titulo-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-7',
    type: 'faq',
    title: '¿Qué tan largo debería ser el contenido de un paso?',
    description: 'Longitud ideal de instrucciones',
    content: 'Sé conciso pero completo. Idealmente 2-5 frases. Si necesitas más, considera dividir en varios pasos. Los huéspedes suelen leer en móvil, así que textos cortos y claros funcionan mejor que párrafos largos.',
    tags: ['largo', 'contenido', 'paso', 'longitud', 'texto', 'breve'],
    url: '/help#longitud-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-8',
    type: 'faq',
    title: '¿Puedo usar formato en el texto (negrita, listas)?',
    description: 'Formateo del contenido',
    content: 'Sí, puedes usar formato básico: negrita para resaltar información importante, listas numeradas para secuencias de acciones, y listas con viñetas para opciones. Esto hace las instrucciones más fáciles de seguir.',
    tags: ['formato', 'negrita', 'listas', 'texto', 'estilo'],
    url: '/help#formato-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-9',
    type: 'faq',
    title: '¿Puedo añadir emojis al contenido?',
    description: 'Usar emojis en instrucciones',
    content: 'Sí, puedes usar emojis para hacer las instrucciones más visuales y amigables: 📶 para WiFi, 🔑 para llaves, ⚠️ para advertencias, ✅ para confirmaciones. Úsalos con moderación para no sobrecargar el texto.',
    tags: ['emojis', 'iconos', 'paso', 'visual', 'símbolos'],
    url: '/help#emojis-paso',
    category: 'Pasos e Instrucciones'
  },

  // Fotos en pasos
  {
    id: 'pi-10',
    type: 'faq',
    title: '¿Cómo añado una foto a un paso?',
    description: 'Subir imagen a una instrucción',
    content: 'Al editar un paso, busca el área de imagen o el botón "Añadir foto". Haz clic para subir desde tu dispositivo o arrastra la imagen. Formatos aceptados: JPG, PNG. Tamaño máximo recomendado: 5MB.',
    tags: ['foto', 'imagen', 'paso', 'añadir', 'subir'],
    url: '/help#foto-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-11',
    type: 'faq',
    title: '¿Cuántas fotos puedo añadir a un paso?',
    description: 'Límite de imágenes por paso',
    content: 'Puedes añadir varias fotos por paso, pero recomendamos 1-3 imágenes para mantener la carga rápida. Si necesitas mostrar muchas imágenes, considera dividir en varios pasos o crear una galería.',
    tags: ['cuántas', 'fotos', 'límite', 'imágenes', 'máximo'],
    url: '/help#limite-fotos-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-12',
    type: 'faq',
    title: '¿Qué tipo de fotos debería usar?',
    description: 'Consejos para buenas imágenes',
    content: 'Usa fotos claras, bien iluminadas, que muestren exactamente lo que explicas. Para electrodomésticos, fotografía los botones de cerca. Para ubicaciones, muestra el contexto. Evita fotos borrosas o muy oscuras.',
    tags: ['fotos', 'consejos', 'calidad', 'imagen', 'tipo'],
    url: '/help#consejos-fotos',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-13',
    type: 'faq',
    title: '¿Puedo eliminar o cambiar una foto?',
    description: 'Modificar imágenes de un paso',
    content: 'Sí, al editar el paso verás las fotos con un botón de eliminar (X o papelera). Elimina la foto actual y sube una nueva si quieres cambiarla. Los cambios se reflejan inmediatamente en el manual.',
    tags: ['eliminar', 'foto', 'cambiar', 'imagen', 'reemplazar'],
    url: '/help#cambiar-foto-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-14',
    type: 'faq',
    title: '¿Las fotos se optimizan automáticamente?',
    description: 'Compresión de imágenes',
    content: 'Sí, Itineramio optimiza las fotos automáticamente para que carguen rápido en móviles. Aun así, recomendamos subir fotos de tamaño razonable (menos de 5MB) para mejor rendimiento.',
    tags: ['optimizar', 'fotos', 'compresión', 'automático', 'tamaño'],
    url: '/help#optimizar-fotos',
    category: 'Pasos e Instrucciones'
  },

  // Videos en pasos
  {
    id: 'pi-15',
    type: 'faq',
    title: '¿Cómo añado un video a un paso?',
    description: 'Incluir video en una instrucción',
    content: 'Al editar un paso, busca la opción de añadir video. Puedes subir un video directamente o pegar un enlace de YouTube/Vimeo. Los videos son muy útiles para explicar procesos complejos como encender una chimenea.',
    tags: ['video', 'añadir', 'paso', 'youtube', 'subir'],
    url: '/help#video-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-16',
    type: 'faq',
    title: '¿Qué formatos de video puedo subir?',
    description: 'Tipos de video aceptados',
    content: 'Puedes subir videos en formato MP4 (recomendado), MOV, o WebM. También puedes insertar videos de YouTube o Vimeo pegando el enlace. Tamaño máximo para subir directamente: 100MB.',
    tags: ['formato', 'video', 'mp4', 'youtube', 'tipo'],
    url: '/help#formato-video',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-17',
    type: 'faq',
    title: '¿Cuánto debería durar un video?',
    description: 'Duración ideal de videos',
    content: 'Los videos cortos funcionan mejor: 15-60 segundos idealmente. Si necesitas más, considera dividir en varios videos o pasos. Los huéspedes suelen preferir videos breves que van al grano.',
    tags: ['duración', 'video', 'largo', 'corto', 'tiempo'],
    url: '/help#duracion-video',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-18',
    type: 'faq',
    title: '¿Puedo grabar videos con mi móvil?',
    description: 'Videos caseros para instrucciones',
    content: 'Sí, videos grabados con móvil funcionan perfectamente. Consejos: graba en horizontal, asegura buena iluminación, habla claro si incluyes voz, y mantén el móvil estable (usa trípode si puedes).',
    tags: ['grabar', 'video', 'móvil', 'casero', 'celular'],
    url: '/help#grabar-video-movil',
    category: 'Pasos e Instrucciones'
  },

  // Traducciones de pasos
  {
    id: 'pi-19',
    type: 'faq',
    title: '¿Cómo traduzco un paso a otros idiomas?',
    description: 'Pasos en múltiples idiomas',
    content: 'Al editar un paso, verás pestañas de idiomas (ES, EN, FR). Escribe el título y contenido en cada idioma. Los huéspedes verán automáticamente el paso en su idioma seleccionado.',
    tags: ['traducir', 'paso', 'idioma', 'inglés', 'francés'],
    url: '/help#traducir-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-20',
    type: 'faq',
    title: '¿Las fotos y videos también necesitan traducción?',
    description: 'Medios en diferentes idiomas',
    content: 'Las fotos y videos son universales, no necesitan traducción. Sin embargo, si el video tiene audio o texto en español, considera tener versiones en otros idiomas o usar videos sin texto/audio que se entiendan visualmente.',
    tags: ['fotos', 'videos', 'traducción', 'idioma', 'universal'],
    url: '/help#medios-traduccion',
    category: 'Pasos e Instrucciones'
  },

  // Mejores prácticas para pasos
  {
    id: 'pi-21',
    type: 'faq',
    title: '¿Cómo escribo instrucciones claras?',
    description: 'Consejos para buenas instrucciones',
    content: 'Usa lenguaje simple y directo. Escribe en segunda persona ("Pulsa el botón", "Gira a la derecha"). Numera los pasos si hay secuencia. Incluye advertencias si es necesario ("No uses metal en el microondas"). Prueba siguiendo tus propias instrucciones.',
    tags: ['escribir', 'instrucciones', 'claras', 'consejos', 'redacción'],
    url: '/help#instrucciones-claras',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-22',
    type: 'faq',
    title: '¿Debería incluir advertencias o precauciones?',
    description: 'Avisos de seguridad en pasos',
    content: 'Sí, siempre que haya riesgo o algo importante que recordar: "⚠️ Cuidado: el agua caliente tarda 30 segundos", "Importante: apagar el gas después de usar", "No dejar la puerta abierta (el gato podría escapar)".',
    tags: ['advertencia', 'precaución', 'seguridad', 'aviso', 'importante'],
    url: '/help#advertencias-pasos',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-23',
    type: 'faq',
    title: '¿Cuándo es mejor usar foto vs video?',
    description: 'Elegir entre imagen y video',
    content: 'Usa foto para: mostrar ubicaciones, botones, códigos, información estática. Usa video para: procesos con varios pasos, movimientos específicos (cómo girar una llave especial), demostraciones de electrodomésticos complejos.',
    tags: ['foto', 'video', 'elegir', 'cuándo', 'diferencia'],
    url: '/help#foto-vs-video',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-24',
    type: 'faq',
    title: '¿Cómo hago que los huéspedes encuentren la información importante?',
    description: 'Destacar información clave',
    content: 'Usa negrita para datos importantes (contraseñas, códigos). Pon la información crucial al principio del paso. Usa emojis para llamar la atención (📍 para ubicación, ⚠️ para advertencias). Evita párrafos largos.',
    tags: ['destacar', 'importante', 'información', 'resaltar', 'negrita'],
    url: '/help#destacar-informacion',
    category: 'Pasos e Instrucciones'
  },

  // Problemas con pasos
  {
    id: 'pi-25',
    type: 'faq',
    title: '¿Por qué mi paso no se guarda?',
    description: 'Problemas al guardar instrucciones',
    content: 'Posibles causas: 1) Conexión a internet inestable, 2) El contenido es demasiado largo, 3) Hay un error en la imagen/video. Intenta guardar sin medios primero, luego añádelos. Revisa tu conexión y recarga la página.',
    tags: ['guardar', 'paso', 'no funciona', 'error', 'problema'],
    url: '/help#paso-no-guarda',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-26',
    type: 'faq',
    title: '¿Por qué la foto no se sube?',
    description: 'Error al subir imagen',
    content: 'Revisa: 1) El archivo es JPG o PNG, 2) Tamaño menor a 10MB, 3) Tienes conexión estable. Si sigue fallando, intenta optimizar la imagen (reducir tamaño) o usar otro navegador. Contacta soporte si persiste.',
    tags: ['foto', 'no sube', 'error', 'imagen', 'subir'],
    url: '/help#foto-no-sube',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-27',
    type: 'faq',
    title: '¿Por qué el video no se reproduce?',
    description: 'Problemas con video en paso',
    content: 'Si es video subido: verifica el formato (MP4 recomendado) y que pese menos de 100MB. Si es YouTube/Vimeo: asegúrate de que el video sea público. Si es privado o con restricciones, no funcionará en el manual.',
    tags: ['video', 'no reproduce', 'error', 'youtube', 'problema'],
    url: '/help#video-no-reproduce',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-28',
    type: 'faq',
    title: '¿Puedo recuperar un paso eliminado?',
    description: 'Restaurar instrucción borrada',
    content: 'No, una vez eliminado un paso no se puede recuperar automáticamente. Por eso pedimos confirmación. Consejo: si tienes pasos complejos con mucho contenido, copia el texto en un documento antes de hacer cambios grandes.',
    tags: ['recuperar', 'paso', 'eliminado', 'borrado', 'restaurar'],
    url: '/help#recuperar-paso',
    category: 'Pasos e Instrucciones'
  },

  // Pasos avanzados
  {
    id: 'pi-29',
    type: 'faq',
    title: '¿Puedo duplicar un paso?',
    description: 'Copiar una instrucción existente',
    content: 'Sí, si tienes pasos similares puedes duplicar uno y modificar los detalles. Busca la opción "Duplicar" en el menú del paso. El nuevo paso aparecerá debajo del original.',
    tags: ['duplicar', 'paso', 'copiar', 'clonar', 'repetir'],
    url: '/help#duplicar-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-30',
    type: 'faq',
    title: '¿Puedo usar el mismo paso en varias zonas?',
    description: 'Reutilizar instrucciones',
    content: 'Actualmente cada paso pertenece a una zona. Si necesitas la misma instrucción en varias zonas, debes crear el paso en cada una. Puedes copiar y pegar el contenido manualmente entre pasos.',
    tags: ['mismo', 'paso', 'varias', 'zonas', 'reutilizar'],
    url: '/help#paso-varias-zonas',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-31',
    type: 'faq',
    title: '¿Cómo sé qué pasos consultan más mis huéspedes?',
    description: 'Estadísticas de pasos',
    content: 'En las analíticas de tu propiedad puedes ver las zonas más consultadas. Las estadísticas a nivel de paso individual están disponibles en planes avanzados. Si una zona tiene muchas visitas, sus pasos también la tienen.',
    tags: ['estadísticas', 'paso', 'visitas', 'consultan', 'analíticas'],
    url: '/help#estadisticas-pasos',
    category: 'Pasos e Instrucciones'
  },

  // Contenido especial
  {
    id: 'pi-32',
    type: 'faq',
    title: '¿Puedo añadir enlaces a un paso?',
    description: 'Links en instrucciones',
    content: 'Sí, puedes incluir enlaces en el texto del paso. Escribe la URL completa y se convertirá en link clicable. Útil para: enlazar a restaurantes, mapas de Google, instrucciones del fabricante, etc.',
    tags: ['enlaces', 'links', 'URL', 'paso', 'web'],
    url: '/help#enlaces-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-33',
    type: 'faq',
    title: '¿Puedo añadir un número de teléfono clicable?',
    description: 'Teléfonos de contacto en pasos',
    content: 'Sí, escribe el número con formato internacional (+34 612345678) y en móviles se podrá hacer clic para llamar directamente. Útil para: número de emergencias, taxi local, tu teléfono de contacto.',
    tags: ['teléfono', 'llamar', 'número', 'clicable', 'contacto'],
    url: '/help#telefono-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-34',
    type: 'faq',
    title: '¿Cómo añado la ubicación de Google Maps a un paso?',
    description: 'Mapas en instrucciones',
    content: 'Copia el enlace de Google Maps de la ubicación que quieres compartir y pégalo en el paso. Los huéspedes podrán hacer clic y abrir el mapa directamente. Muy útil para: dirección del alojamiento, supermercados, parking.',
    tags: ['google maps', 'mapa', 'ubicación', 'enlace', 'dirección'],
    url: '/help#maps-paso',
    category: 'Pasos e Instrucciones'
  },
  {
    id: 'pi-35',
    type: 'faq',
    title: '¿Cómo hago un paso con contraseña del WiFi copiable?',
    description: 'Contraseña fácil de copiar',
    content: 'Escribe la contraseña en una línea separada y en negrita: **MiContraseña123**. Los huéspedes podrán seleccionarla fácilmente para copiar. Tip: evita caracteres confusos (0 vs O, l vs 1) o especifica "cero, no letra O".',
    tags: ['wifi', 'contraseña', 'copiar', 'password', 'clave'],
    url: '/help#password-copiable',
    category: 'Pasos e Instrucciones'
  },

  // ============================================
  // SECCIÓN 5: CÓDIGOS QR (45 preguntas)
  // ============================================

  // Conceptos básicos de QR
  {
    id: 'qr-1',
    type: 'faq',
    title: '¿Qué es un código QR y cómo funciona?',
    description: 'Explicación básica de los códigos QR',
    content: 'Un código QR es un código de barras bidimensional que los móviles pueden escanear con la cámara. Al escanearlo, abre automáticamente un enlace web. En Itineramio, cada QR lleva directamente a tu manual o a una zona específica.',
    tags: ['qr', 'código', 'qué es', 'funciona', 'escanear', 'básico'],
    url: '/help#que-es-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-2',
    type: 'faq',
    title: '¿Cómo generan los huéspedes para escanear el QR?',
    description: 'Cómo escanean los huéspedes',
    content: 'Los huéspedes solo necesitan abrir la cámara de su móvil y apuntar al QR. En iPhones y Android modernos, la cámara detecta el QR automáticamente y muestra un enlace para abrir. No necesitan ninguna app especial.',
    tags: ['escanear', 'qr', 'móvil', 'cámara', 'huésped', 'abrir'],
    url: '/help#escanear-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-3',
    type: 'faq',
    title: '¿Los códigos QR se generan automáticamente?',
    description: 'Generación automática de QR',
    content: 'Sí, Itineramio genera automáticamente un código QR para tu manual completo y uno para cada zona. No necesitas hacer nada especial: al crear una propiedad o zona, el QR está listo para usar.',
    tags: ['generar', 'automático', 'qr', 'crear', 'código'],
    url: '/help#qr-automatico',
    category: 'Códigos QR'
  },

  // Tipos de QR
  {
    id: 'qr-4',
    type: 'faq',
    title: '¿Cuál es la diferencia entre QR del manual y QR de zona?',
    description: 'Tipos de códigos QR disponibles',
    content: 'El QR del manual lleva a la página principal con todas las zonas listadas. El QR de zona lleva directamente a esa zona específica. Usa el QR general en la entrada, y QRs de zona en cada ubicación (cocina, baño, etc.).',
    tags: ['qr', 'manual', 'zona', 'diferencia', 'tipos', 'específico'],
    url: '/help#tipos-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-5',
    type: 'faq',
    title: '¿Dónde encuentro el código QR de mi manual completo?',
    description: 'Obtener QR del manual',
    content: 'Ve a tu propiedad y busca el botón "QR" o "Código QR" en la barra de acciones. Se abrirá una vista con el QR del manual completo que puedes descargar o imprimir directamente.',
    tags: ['encontrar', 'qr', 'manual', 'descargar', 'dónde'],
    url: '/help#qr-manual-completo',
    category: 'Códigos QR'
  },
  {
    id: 'qr-6',
    type: 'faq',
    title: '¿Dónde encuentro el código QR de una zona específica?',
    description: 'Obtener QR de zona',
    content: 'Abre la zona que quieres compartir y busca el icono de QR o la opción "Código QR" en el menú de la zona. Cada zona tiene su propio QR único que lleva directamente a esa sección del manual.',
    tags: ['qr', 'zona', 'específica', 'encontrar', 'individual'],
    url: '/help#qr-zona',
    category: 'Códigos QR'
  },

  // Descargar e imprimir QR
  {
    id: 'qr-7',
    type: 'faq',
    title: '¿Cómo descargo el código QR?',
    description: 'Guardar QR en tu dispositivo',
    content: 'Al ver el QR, busca el botón "Descargar" o "Guardar imagen". El QR se descargará como imagen PNG de alta calidad. También puedes hacer clic derecho y "Guardar imagen como..." en ordenador.',
    tags: ['descargar', 'qr', 'guardar', 'imagen', 'png'],
    url: '/help#descargar-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-8',
    type: 'faq',
    title: '¿Cómo imprimo el código QR?',
    description: 'Imprimir QR para colocar en propiedad',
    content: 'Descarga el QR primero, luego imprímelo desde cualquier programa de imágenes o documentos. Recomendamos imprimir en papel de buena calidad o plastificarlo para que dure más. Tamaño mínimo: 3x3 cm.',
    tags: ['imprimir', 'qr', 'papel', 'código', 'físico'],
    url: '/help#imprimir-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-9',
    type: 'faq',
    title: '¿Qué tamaño debería tener el QR impreso?',
    description: 'Tamaño recomendado para impresión',
    content: 'Mínimo 3x3 cm para que se escanee bien. Recomendamos 5x5 cm o más grande para mejor visibilidad. Si lo pones lejos (en una pared), hazlo más grande. Un QR de 10x10 cm se ve bien desde 1-2 metros.',
    tags: ['tamaño', 'qr', 'imprimir', 'centímetros', 'grande', 'pequeño'],
    url: '/help#tamano-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-10',
    type: 'faq',
    title: '¿En qué formato se descarga el QR?',
    description: 'Formato de archivo del QR',
    content: 'Los QR se descargan en formato PNG con fondo transparente o blanco. Este formato mantiene la calidad al imprimir y es compatible con cualquier programa de edición o impresión.',
    tags: ['formato', 'qr', 'png', 'archivo', 'imagen'],
    url: '/help#formato-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-11',
    type: 'faq',
    title: '¿Puedo imprimir varios QR en una sola hoja?',
    description: 'Imprimir múltiples QR',
    content: 'Sí, descarga los QR que necesites y usa Word, Canva o cualquier editor para colocarlos en una hoja. Puedes crear una hoja con todos los QR de las zonas etiquetados para tenerlos organizados.',
    tags: ['varios', 'qr', 'hoja', 'múltiples', 'imprimir', 'organizar'],
    url: '/help#varios-qr-hoja',
    category: 'Códigos QR'
  },

  // Dónde colocar los QR
  {
    id: 'qr-12',
    type: 'faq',
    title: '¿Dónde debería colocar el código QR del manual?',
    description: 'Ubicación ideal para QR principal',
    content: 'Coloca el QR del manual completo en: la entrada (para que lo vean al llegar), junto a las llaves, en la nevera, o en un marco en el salón. Que sea visible y accesible desde el primer momento.',
    tags: ['colocar', 'qr', 'dónde', 'ubicación', 'entrada', 'visible'],
    url: '/help#donde-qr-manual',
    category: 'Códigos QR'
  },
  {
    id: 'qr-13',
    type: 'faq',
    title: '¿Dónde coloco el QR de la zona WiFi?',
    description: 'Ubicación para QR de WiFi',
    content: 'El QR de WiFi funciona muy bien junto al router, en el escritorio de trabajo, o en la mesita del salón. Algunos anfitriones lo ponen en un pequeño cartel tipo "Conéctate al WiFi" con el QR.',
    tags: ['wifi', 'qr', 'dónde', 'colocar', 'router', 'internet'],
    url: '/help#donde-qr-wifi',
    category: 'Códigos QR'
  },
  {
    id: 'qr-14',
    type: 'faq',
    title: '¿Dónde coloco el QR de la zona cocina?',
    description: 'Ubicación para QR de cocina',
    content: 'Pégalo en la nevera, en un armario a la altura de los ojos, o junto a los electrodomésticos más complicados (horno, vitrocerámica). Así los huéspedes lo tienen a mano cuando necesitan ayuda cocinando.',
    tags: ['cocina', 'qr', 'dónde', 'nevera', 'electrodomésticos'],
    url: '/help#donde-qr-cocina',
    category: 'Códigos QR'
  },
  {
    id: 'qr-15',
    type: 'faq',
    title: '¿Dónde coloco el QR del aire acondicionado?',
    description: 'Ubicación para QR de climatización',
    content: 'Pega el QR junto al mando del aire/calefacción, en la pared cerca del termostato, o en el propio aparato. Es donde los huéspedes mirarán cuando no sepan cómo funciona.',
    tags: ['aire', 'acondicionado', 'qr', 'dónde', 'termostato', 'mando'],
    url: '/help#donde-qr-aire',
    category: 'Códigos QR'
  },
  {
    id: 'qr-16',
    type: 'faq',
    title: '¿Dónde coloco el QR del baño?',
    description: 'Ubicación para QR de baño',
    content: 'Colócalo en el interior de la puerta del baño o junto al espejo. Si tienes instrucciones específicas para la ducha (agua caliente, mampara especial), ponlo cerca de la ducha.',
    tags: ['baño', 'qr', 'dónde', 'ducha', 'puerta'],
    url: '/help#donde-qr-bano',
    category: 'Códigos QR'
  },
  {
    id: 'qr-17',
    type: 'faq',
    title: '¿Puedo poner QR en zonas exteriores?',
    description: 'QR para terraza, piscina, jardín',
    content: 'Sí, pero protégelos del sol y la lluvia. Usa fundas plásticas, plastifica el QR, o colócalo bajo techo. Para piscinas, un cartel plastificado junto a la entrada de la zona de baño funciona muy bien.',
    tags: ['exterior', 'qr', 'terraza', 'piscina', 'jardín', 'proteger'],
    url: '/help#qr-exterior',
    category: 'Códigos QR'
  },

  // Diseño y personalización de QR
  {
    id: 'qr-18',
    type: 'faq',
    title: '¿Puedo personalizar el diseño del código QR?',
    description: 'Cambiar colores o estilo del QR',
    content: 'Actualmente los QR se generan en formato estándar (negro sobre blanco) para máxima compatibilidad. Puedes añadir tu logo o marco alrededor al editarlo en programas como Canva, manteniendo el QR sin modificar.',
    tags: ['personalizar', 'qr', 'diseño', 'color', 'estilo'],
    url: '/help#personalizar-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-19',
    type: 'faq',
    title: '¿Puedo añadir mi logo al código QR?',
    description: 'Logo en el centro del QR',
    content: 'Puedes añadir un logo pequeño en el centro usando editores externos, pero ten cuidado: si el logo es muy grande puede impedir que el QR se escanee. Recomendamos que el logo no ocupe más del 10% del QR.',
    tags: ['logo', 'qr', 'centro', 'marca', 'personalizar'],
    url: '/help#logo-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-20',
    type: 'faq',
    title: '¿Cómo hago que el QR sea más bonito para mi propiedad?',
    description: 'Ideas creativas para QR',
    content: 'Crea un marco bonito alrededor con tu estilo (Canva tiene plantillas). Añade texto como "Escanea para instrucciones" o "Manual del apartamento". Imprímelo en papel de calidad o hazlo en material duradero.',
    tags: ['bonito', 'qr', 'diseño', 'creativo', 'marco', 'decorar'],
    url: '/help#qr-bonito',
    category: 'Códigos QR'
  },
  {
    id: 'qr-21',
    type: 'faq',
    title: '¿Qué texto debería poner junto al código QR?',
    description: 'Instrucciones junto al QR',
    content: 'Texto sugerido: "Escanea con tu móvil", "Manual de la casa", "¿Dudas? Escanea aquí", "Instrucciones de [zona]". En varios idiomas si tienes huéspedes internacionales: "Scan for instructions".',
    tags: ['texto', 'qr', 'instrucciones', 'etiqueta', 'cartel'],
    url: '/help#texto-qr',
    category: 'Códigos QR'
  },

  // Materiales y durabilidad
  {
    id: 'qr-22',
    type: 'faq',
    title: '¿En qué material debería imprimir el QR?',
    description: 'Mejores materiales para QR físico',
    content: 'Opciones: 1) Papel normal plastificado (económico), 2) Vinilo adhesivo (para pegar en superficies), 3) PVC o metacrilato (duradero y elegante), 4) Pegatinas profesionales. Elige según tu presupuesto y estilo.',
    tags: ['material', 'qr', 'imprimir', 'vinilo', 'plástico', 'pegatina'],
    url: '/help#material-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-23',
    type: 'faq',
    title: '¿Cómo hago que el QR dure más tiempo?',
    description: 'Proteger QR impreso',
    content: 'Plastifícalo o usa funda transparente. Evita exposición directa al sol que decolora el papel. Para exteriores, usa materiales resistentes al agua. Revisa periódicamente que siga escaneable.',
    tags: ['durar', 'qr', 'proteger', 'plastificar', 'resistente'],
    url: '/help#qr-duradero',
    category: 'Códigos QR'
  },
  {
    id: 'qr-24',
    type: 'faq',
    title: '¿Puedo encargar QR impresos profesionalmente?',
    description: 'Impresión profesional de QR',
    content: 'Sí, muchas imprentas online hacen pegatinas, placas o carteles con QR. Sube la imagen del QR y elige el formato. También hay servicios especializados en señalética para alojamientos turísticos.',
    tags: ['profesional', 'qr', 'imprenta', 'encargar', 'placa'],
    url: '/help#qr-profesional',
    category: 'Códigos QR'
  },

  // Funcionamiento y enlaces
  {
    id: 'qr-25',
    type: 'faq',
    title: '¿Qué pasa si cambio el contenido del manual?',
    description: 'Cambios después de imprimir QR',
    content: 'El QR sigue funcionando perfectamente. El código apunta a una URL fija, y esa URL siempre muestra la versión más actual de tu manual. No necesitas reimprimir los QR cuando actualizas contenido.',
    tags: ['cambiar', 'contenido', 'qr', 'actualizar', 'reimprimir'],
    url: '/help#qr-cambios-contenido',
    category: 'Códigos QR'
  },
  {
    id: 'qr-26',
    type: 'faq',
    title: '¿El código QR caduca o deja de funcionar?',
    description: 'Validez del QR en el tiempo',
    content: 'No, los QR de Itineramio no caducan mientras tu cuenta esté activa y la propiedad exista. Un QR que imprimas hoy seguirá funcionando dentro de años. Solo cambiaría si eliminas y recreas la propiedad.',
    tags: ['caducar', 'qr', 'funcionar', 'tiempo', 'validez', 'expirar'],
    url: '/help#qr-caduca',
    category: 'Códigos QR'
  },
  {
    id: 'qr-27',
    type: 'faq',
    title: '¿Puedo ver cuántas veces se ha escaneado mi QR?',
    description: 'Estadísticas de escaneos',
    content: 'Sí, en las analíticas de tu propiedad puedes ver las visitas al manual. Cada vez que alguien escanea el QR y abre el manual, cuenta como una visita. Verás estadísticas por día, zona más visitada, etc.',
    tags: ['estadísticas', 'qr', 'escaneos', 'visitas', 'cuántas'],
    url: '/help#estadisticas-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-28',
    type: 'faq',
    title: '¿Funciona el QR sin conexión a internet?',
    description: 'QR offline',
    content: 'Para escanear el QR solo se necesita la cámara. Pero para ver el manual, el huésped necesita conexión a internet (WiFi o datos). El manual es una página web que requiere conexión para cargar.',
    tags: ['offline', 'qr', 'internet', 'sin conexión', 'wifi'],
    url: '/help#qr-offline',
    category: 'Códigos QR'
  },

  // Problemas con QR
  {
    id: 'qr-29',
    type: 'faq',
    title: '¿Por qué mi código QR no escanea?',
    description: 'QR no funciona al escanear',
    content: 'Posibles causas: 1) QR muy pequeño (mínimo 3x3cm), 2) Poca luz o brillo en pantalla, 3) QR dañado o borroso, 4) Cámara sucia. Prueba: aumentar tamaño, mejorar iluminación, reimprimir en mejor calidad.',
    tags: ['no escanea', 'qr', 'problema', 'no funciona', 'error'],
    url: '/help#qr-no-escanea',
    category: 'Códigos QR'
  },
  {
    id: 'qr-30',
    type: 'faq',
    title: '¿Por qué el QR lleva a una página de error?',
    description: 'QR con enlace roto',
    content: 'Puede que: 1) La propiedad esté desactivada, 2) Hayas eliminado la propiedad o zona, 3) Haya un problema temporal del servidor. Verifica que la propiedad esté activa. Si persiste, contacta soporte.',
    tags: ['error', 'qr', 'página', 'enlace', 'roto', 'no funciona'],
    url: '/help#qr-error',
    category: 'Códigos QR'
  },
  {
    id: 'qr-31',
    type: 'faq',
    title: '¿Qué hago si el huésped no puede escanear el QR?',
    description: 'Alternativas cuando falla el escaneo',
    content: 'Ofrece alternativas: 1) El enlace escrito debajo del QR, 2) Envíales el enlace por WhatsApp, 3) Ten una copia impresa del manual básico. Algunos móviles antiguos necesitan app de escaneo.',
    tags: ['huésped', 'qr', 'no puede', 'alternativa', 'escanear'],
    url: '/help#huesped-no-escanea',
    category: 'Códigos QR'
  },
  {
    id: 'qr-32',
    type: 'faq',
    title: '¿El QR funciona con cualquier móvil?',
    description: 'Compatibilidad de dispositivos',
    content: 'Sí, funciona con iPhone (iOS 11+) y Android (versión 8+) usando la cámara nativa. Móviles más antiguos pueden necesitar una app de escaneo QR gratuita. El 99% de smartphones actuales lo escanean sin problemas.',
    tags: ['móvil', 'qr', 'compatible', 'iphone', 'android', 'funciona'],
    url: '/help#qr-compatibilidad',
    category: 'Códigos QR'
  },
  {
    id: 'qr-33',
    type: 'faq',
    title: '¿Puedo regenerar el código QR si hay problemas?',
    description: 'Obtener nuevo QR',
    content: 'El QR está vinculado a la URL de tu propiedad/zona, que no cambia. Puedes volver a descargarlo desde el panel. Si sospechas que hay un problema con el QR físico, simplemente reimprímelo desde el original digital.',
    tags: ['regenerar', 'qr', 'nuevo', 'reimprimir', 'descargar'],
    url: '/help#regenerar-qr',
    category: 'Códigos QR'
  },

  // Usos creativos del QR
  {
    id: 'qr-34',
    type: 'faq',
    title: '¿Puedo poner el QR en el mensaje de bienvenida de Airbnb?',
    description: 'QR en plataformas de reserva',
    content: 'Es mejor compartir el enlace directamente (texto), ya que las plataformas de mensajería no siempre muestran bien las imágenes QR. Copia el enlace del manual y pégalo en tu mensaje de bienvenida.',
    tags: ['airbnb', 'qr', 'mensaje', 'bienvenida', 'enlace'],
    url: '/help#qr-airbnb',
    category: 'Códigos QR'
  },
  {
    id: 'qr-35',
    type: 'faq',
    title: '¿Puedo incluir el QR en mi anuncio de Airbnb/Booking?',
    description: 'QR en descripción del anuncio',
    content: 'Puedes mencionarlo en la descripción ("Tendrás acceso a un manual digital con QR"), pero no puedes subir imagen del QR. Es mejor enviar el enlace o QR después de confirmar la reserva.',
    tags: ['anuncio', 'qr', 'airbnb', 'booking', 'descripción'],
    url: '/help#qr-anuncio',
    category: 'Códigos QR'
  },
  {
    id: 'qr-36',
    type: 'faq',
    title: '¿Puedo poner el QR en las llaves o llavero?',
    description: 'QR en llavero',
    content: 'Sí, hay servicios que hacen llaveros con QR grabado. También puedes imprimir una etiqueta pequeña y pegarla al llavero. Asegúrate de que el QR sea lo suficientemente grande para escanearse (mínimo 2x2cm).',
    tags: ['llavero', 'qr', 'llaves', 'etiqueta', 'grabar'],
    url: '/help#qr-llavero',
    category: 'Códigos QR'
  },
  {
    id: 'qr-37',
    type: 'faq',
    title: '¿Puedo crear una tarjeta de bienvenida con el QR?',
    description: 'Tarjeta de bienvenida con QR',
    content: 'Excelente idea. Crea una tarjeta con: mensaje de bienvenida, WiFi y contraseña, QR del manual, y tu contacto. Déjala en un lugar visible como la entrada o mesita. Canva tiene plantillas para esto.',
    tags: ['tarjeta', 'bienvenida', 'qr', 'imprimir', 'diseño'],
    url: '/help#tarjeta-bienvenida-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-38',
    type: 'faq',
    title: '¿Puedo poner QR en electrodomésticos directamente?',
    description: 'QR pegado en aparatos',
    content: 'Sí, muy recomendable. Pega el QR de la zona cocina en el microondas, el de climatización en el aire acondicionado, etc. Usa pegatinas pequeñas o cinta transparente. El huésped tiene la ayuda justo donde la necesita.',
    tags: ['electrodomésticos', 'qr', 'pegar', 'aparato', 'pegatina'],
    url: '/help#qr-electrodomesticos',
    category: 'Códigos QR'
  },

  // Múltiples propiedades y QR
  {
    id: 'qr-39',
    type: 'faq',
    title: '¿Cada propiedad tiene su propio QR?',
    description: 'QR únicos por propiedad',
    content: 'Sí, cada propiedad tiene un QR único que lleva a su manual específico. Si tienes 5 propiedades, tendrás 5 QRs diferentes para los manuales principales, más los QRs de cada zona dentro de cada propiedad.',
    tags: ['propiedad', 'qr', 'único', 'diferente', 'cada'],
    url: '/help#qr-cada-propiedad',
    category: 'Códigos QR'
  },
  {
    id: 'qr-40',
    type: 'faq',
    title: '¿Puedo tener un QR que lleve a todas mis propiedades?',
    description: 'QR global para múltiples propiedades',
    content: 'Actualmente cada QR lleva a una propiedad específica. Si gestionas varias y quieres un punto de entrada único, podrías crear una página web simple con enlaces a todos tus manuales.',
    tags: ['todas', 'propiedades', 'qr', 'global', 'múltiples'],
    url: '/help#qr-todas-propiedades',
    category: 'Códigos QR'
  },
  {
    id: 'qr-41',
    type: 'faq',
    title: '¿Cómo organizo los QR si tengo muchas zonas?',
    description: 'Gestionar múltiples QR',
    content: 'Crea un documento maestro con todos los QR etiquetados (propiedad + zona). Guarda los archivos con nombres claros: "QR-ApartamentoCentro-Cocina.png". Así sabrás exactamente cuál imprimir cuando necesites.',
    tags: ['organizar', 'qr', 'muchos', 'zonas', 'gestionar'],
    url: '/help#organizar-qr',
    category: 'Códigos QR'
  },

  // Seguridad y privacidad del QR
  {
    id: 'qr-42',
    type: 'faq',
    title: '¿Es seguro el código QR? ¿Puede acceder cualquiera?',
    description: 'Seguridad del enlace QR',
    content: 'El QR lleva a una URL pública de tu manual. Cualquiera que tenga el enlace o escanee el QR puede ver el contenido. Por eso, no incluyas información muy sensible (códigos de alarma, etc.) en el manual.',
    tags: ['seguro', 'qr', 'privacidad', 'acceso', 'público'],
    url: '/help#seguridad-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-43',
    type: 'faq',
    title: '¿Puedo proteger el QR con contraseña?',
    description: 'QR con acceso restringido',
    content: 'Actualmente los manuales son de acceso público para facilitar el uso a los huéspedes. Si necesitas información protegida, considera enviarla por mensaje privado en lugar de ponerla en el manual público.',
    tags: ['contraseña', 'qr', 'proteger', 'privado', 'restringido'],
    url: '/help#qr-contrasena',
    category: 'Códigos QR'
  },
  {
    id: 'qr-44',
    type: 'faq',
    title: '¿Qué información NO debería poner accesible por QR?',
    description: 'Información sensible',
    content: 'Evita poner en el manual público: códigos de alarma, contraseñas de cajas fuertes, información personal detallada, códigos de acceso a zonas comunes del edificio. Esa info es mejor enviarla directamente al huésped.',
    tags: ['sensible', 'información', 'qr', 'evitar', 'privado'],
    url: '/help#info-sensible-qr',
    category: 'Códigos QR'
  },
  {
    id: 'qr-45',
    type: 'faq',
    title: '¿Puedo desactivar un QR si ya no quiero que funcione?',
    description: 'Desactivar acceso por QR',
    content: 'Si desactivas la propiedad, el QR mostrará un mensaje de "no disponible". Si eliminas la propiedad, el QR dejará de funcionar completamente. No hay opción de desactivar QRs individuales sin afectar el manual.',
    tags: ['desactivar', 'qr', 'eliminar', 'dejar', 'funcionar'],
    url: '/help#desactivar-qr',
    category: 'Códigos QR'
  },

  // ============================================
  // SECCIÓN 6: COMPARTIR EL MANUAL (40 preguntas)
  // ============================================

  // Formas de compartir
  {
    id: 'cm-1',
    type: 'faq',
    title: '¿Cómo comparto el manual con mis huéspedes?',
    description: 'Formas de enviar el manual',
    content: 'Tienes varias opciones: 1) Copia el enlace del manual y envíalo por WhatsApp/email, 2) Descarga el QR y colócalo en la propiedad, 3) Incluye el enlace en tu mensaje de bienvenida de Airbnb/Booking. El método más efectivo es enviar el enlace junto con la confirmación de reserva.',
    tags: ['compartir', 'manual', 'enviar', 'huésped', 'enlace'],
    url: '/help#compartir-manual',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-2',
    type: 'faq',
    title: '¿Dónde encuentro el enlace de mi manual?',
    description: 'Obtener URL del manual',
    content: 'En el panel de tu propiedad, busca el botón "Compartir" o "Enlace". También puedes ir a la vista previa del manual y copiar la URL de la barra del navegador. El enlace tiene formato: itineramio.com/guide/[tu-id-propiedad].',
    tags: ['enlace', 'url', 'link', 'copiar', 'encontrar', 'manual'],
    url: '/help#enlace-manual',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-3',
    type: 'faq',
    title: '¿Puedo personalizar la URL de mi manual?',
    description: 'URL personalizada',
    content: 'La URL se genera automáticamente con un identificador único. Algunos planes permiten crear un slug personalizado más fácil de recordar, como itineramio.com/guide/mi-apartamento-centro.',
    tags: ['url', 'personalizar', 'slug', 'enlace', 'personalizada'],
    url: '/help#url-personalizada',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-4',
    type: 'faq',
    title: '¿Cuándo es el mejor momento para enviar el manual?',
    description: 'Timing para compartir',
    content: 'El mejor momento es al confirmar la reserva, no al llegar. Así el huésped puede revisar las instrucciones antes de viajar y llegar preparado. Envía un recordatorio 1-2 días antes del check-in con el enlace de nuevo.',
    tags: ['cuándo', 'enviar', 'momento', 'reserva', 'confirmar'],
    url: '/help#cuando-enviar-manual',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-5',
    type: 'faq',
    title: '¿Puedo enviar solo una zona específica?',
    description: 'Compartir zona individual',
    content: 'Sí, cada zona tiene su propio enlace y QR. Esto es útil para enviar instrucciones específicas: "Aquí tienes cómo funciona el aire acondicionado" con el link directo a esa zona. Muy práctico para resolver dudas puntuales.',
    tags: ['zona', 'específica', 'individual', 'compartir', 'enviar'],
    url: '/help#enviar-zona-especifica',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-6',
    type: 'faq',
    title: '¿Cómo obtengo el enlace de una zona específica?',
    description: 'URL de zona individual',
    content: 'Abre la zona en el editor o en la vista previa. La URL del navegador mostrará el enlace directo a esa zona. También puedes usar el botón "Compartir zona" o descargar el QR específico de esa zona.',
    tags: ['enlace', 'zona', 'url', 'específica', 'obtener'],
    url: '/help#enlace-zona',
    category: 'Compartir el Manual'
  },

  // Compartir por plataformas
  {
    id: 'cm-7',
    type: 'faq',
    title: '¿Cómo comparto el manual en Airbnb?',
    description: 'Integración con Airbnb',
    content: 'En Airbnb, pega el enlace del manual en: 1) Tu mensaje de confirmación automático, 2) Las instrucciones de llegada, 3) El apartado "Manual de la casa" de tu anuncio. La forma más efectiva es incluirlo en el mensaje que se envía al confirmar.',
    tags: ['airbnb', 'compartir', 'mensaje', 'plataforma', 'integrar'],
    url: '/help#compartir-airbnb',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-8',
    type: 'faq',
    title: '¿Cómo comparto el manual en Booking.com?',
    description: 'Integración con Booking',
    content: 'En Booking, incluye el enlace en: 1) Los mensajes automáticos post-reserva, 2) Las instrucciones de llegada en el extranet, 3) La descripción de la propiedad. Booking permite mensajes programados donde puedes incluir el link.',
    tags: ['booking', 'compartir', 'mensaje', 'plataforma', 'integrar'],
    url: '/help#compartir-booking',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-9',
    type: 'faq',
    title: '¿Cómo comparto el manual en Vrbo/HomeAway?',
    description: 'Integración con Vrbo',
    content: 'En Vrbo, añade el enlace en las instrucciones de llegada y en los mensajes automáticos de confirmación. También puedes incluirlo en la descripción del anuncio mencionando que tienen acceso a un manual digital.',
    tags: ['vrbo', 'homeaway', 'compartir', 'plataforma'],
    url: '/help#compartir-vrbo',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-10',
    type: 'faq',
    title: '¿Puedo compartir el manual por WhatsApp?',
    description: 'Envío por WhatsApp',
    content: 'Sí, es una de las formas más efectivas. Copia el enlace y pégalo en un mensaje de WhatsApp. El huésped podrá abrirlo directamente desde la conversación. También puedes enviar la imagen del QR por WhatsApp.',
    tags: ['whatsapp', 'compartir', 'enviar', 'mensaje', 'enlace'],
    url: '/help#compartir-whatsapp',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-11',
    type: 'faq',
    title: '¿Puedo compartir el manual por email?',
    description: 'Envío por correo electrónico',
    content: 'Sí, incluye el enlace en cualquier email. Puedes crear una plantilla de email de bienvenida con el enlace del manual. Algunos anfitriones envían un email específico solo con el acceso al manual digital.',
    tags: ['email', 'correo', 'compartir', 'enviar', 'plantilla'],
    url: '/help#compartir-email',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-12',
    type: 'faq',
    title: '¿Puedo compartir el manual por SMS?',
    description: 'Envío por mensaje de texto',
    content: 'Sí, el enlace funciona perfectamente por SMS. Es útil para huéspedes que quizás no tengan WhatsApp o para enviar un recordatorio rápido antes del check-in.',
    tags: ['sms', 'mensaje', 'texto', 'compartir', 'enviar'],
    url: '/help#compartir-sms',
    category: 'Compartir el Manual'
  },

  // Mensajes y plantillas
  {
    id: 'cm-13',
    type: 'faq',
    title: '¿Cómo escribo un buen mensaje de bienvenida con el manual?',
    description: 'Redactar mensaje de bienvenida',
    content: 'Un buen mensaje incluye: 1) Saludo personalizado, 2) Confirmación de fechas, 3) Enlace al manual con texto "Aquí tienes toda la información de la casa", 4) Instrucciones de check-in resumidas, 5) Tu contacto. Sé breve y directo.',
    tags: ['mensaje', 'bienvenida', 'escribir', 'plantilla', 'texto'],
    url: '/help#mensaje-bienvenida',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-14',
    type: 'faq',
    title: '¿Tienes ejemplos de mensajes para enviar el manual?',
    description: 'Plantillas de mensajes',
    content: 'Ejemplo: "¡Hola [nombre]! Gracias por reservar. Aquí tienes el manual digital de la casa con todas las instrucciones: [enlace]. Revísalo antes de llegar para que tu estancia sea perfecta. ¡Cualquier duda, escríbeme!"',
    tags: ['ejemplo', 'plantilla', 'mensaje', 'texto', 'modelo'],
    url: '/help#ejemplo-mensaje',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-15',
    type: 'faq',
    title: '¿Debo enviar el enlace en español o en el idioma del huésped?',
    description: 'Idioma del mensaje',
    content: 'El mensaje envíalo en el idioma del huésped si puedes. El manual se adapta automáticamente al idioma del navegador del huésped, así que el enlace es el mismo pero verán el contenido en su idioma si está traducido.',
    tags: ['idioma', 'mensaje', 'traducir', 'inglés', 'español'],
    url: '/help#idioma-mensaje',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-16',
    type: 'faq',
    title: '¿Puedo programar el envío automático del manual?',
    description: 'Automatizar envío',
    content: 'Itineramio no envía mensajes directamente, pero puedes usar las automatizaciones de Airbnb/Booking o herramientas como Hospitable, Your Porter, o Guesty que permiten programar mensajes con el enlace de tu manual.',
    tags: ['automático', 'programar', 'envío', 'automatizar'],
    url: '/help#envio-automatico',
    category: 'Compartir el Manual'
  },

  // Acceso y visibilidad
  {
    id: 'cm-17',
    type: 'faq',
    title: '¿Necesitan los huéspedes crear cuenta para ver el manual?',
    description: 'Acceso sin registro',
    content: 'No, el manual es público y no requiere registro ni login. Cualquiera con el enlace puede verlo directamente. Esto facilita que los huéspedes accedan sin barreras.',
    tags: ['cuenta', 'registro', 'acceso', 'login', 'público'],
    url: '/help#acceso-sin-cuenta',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-18',
    type: 'faq',
    title: '¿El manual funciona sin internet?',
    description: 'Acceso offline',
    content: 'El manual necesita conexión a internet para cargar. Una vez cargado, puede verse aunque la conexión sea lenta. Si el huésped no tiene datos, necesitará WiFi. Por eso es importante que las instrucciones de WiFi estén accesibles de otra forma también.',
    tags: ['offline', 'internet', 'conexión', 'sin red', 'wifi'],
    url: '/help#manual-offline',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-19',
    type: 'faq',
    title: '¿El enlace del manual caduca?',
    description: 'Validez del enlace',
    content: 'No, el enlace no caduca mientras tu cuenta esté activa y la propiedad exista. Un enlace que compartas hoy seguirá funcionando indefinidamente. Solo dejaría de funcionar si eliminas la propiedad.',
    tags: ['caducar', 'enlace', 'validez', 'expirar', 'permanente'],
    url: '/help#enlace-caduca',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-20',
    type: 'faq',
    title: '¿Puedo ver quién ha accedido al manual?',
    description: 'Estadísticas de acceso',
    content: 'Sí, en las analíticas de tu propiedad puedes ver: número de visitas, zonas más consultadas, tiempo de uso, y dispositivos. No se identifica a usuarios individuales, pero sí ves la actividad agregada.',
    tags: ['estadísticas', 'visitas', 'acceso', 'analíticas', 'quien'],
    url: '/help#ver-accesos',
    category: 'Compartir el Manual'
  },

  // QR físico vs digital
  {
    id: 'cm-21',
    type: 'faq',
    title: '¿Es mejor compartir por enlace o por QR?',
    description: 'Enlace vs código QR',
    content: 'Depende del momento: ANTES de llegar, usa el enlace (más fácil de clicar desde el móvil). CUANDO estén en la propiedad, el QR físico es más práctico porque está ahí donde lo necesitan. Lo ideal es usar ambos.',
    tags: ['enlace', 'qr', 'mejor', 'comparar', 'cuándo'],
    url: '/help#enlace-vs-qr',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-22',
    type: 'faq',
    title: '¿Debo poner QR físico si ya envié el enlace?',
    description: 'QR además del enlace',
    content: 'Sí, recomendamos ambos. El QR físico sirve como recordatorio visual y es más práctico cuando el huésped está delante del electrodoméstico con una duda. Muchos huéspedes pierden o no guardan el mensaje con el enlace.',
    tags: ['qr', 'físico', 'además', 'enlace', 'ambos'],
    url: '/help#qr-ademas-enlace',
    category: 'Compartir el Manual'
  },

  // Compartir con otros
  {
    id: 'cm-23',
    type: 'faq',
    title: '¿Puedo compartir el manual con mi equipo de limpieza?',
    description: 'Acceso para personal',
    content: 'Sí, el enlace es público y puedes compartirlo con quien necesites: limpiadores, mantenimiento, co-anfitriones. Así todos tienen acceso a las mismas instrucciones y saben cómo funciona todo.',
    tags: ['equipo', 'limpieza', 'compartir', 'personal', 'colaboradores'],
    url: '/help#compartir-equipo',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-24',
    type: 'faq',
    title: '¿Puedo compartir el manual con mi co-anfitrión?',
    description: 'Acceso para co-hosts',
    content: 'Sí, hay dos opciones: 1) Comparte el enlace público del manual para que lo vean, 2) Invítalos a tu cuenta de Itineramio como colaboradores para que puedan editar. La segunda opción les da más control.',
    tags: ['co-anfitrión', 'cohost', 'compartir', 'colaborador', 'equipo'],
    url: '/help#compartir-coanfitrion',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-25',
    type: 'faq',
    title: '¿Puedo tener varios usuarios gestionando el mismo manual?',
    description: 'Múltiples editores',
    content: 'Sí, puedes invitar colaboradores a tu cuenta que tendrán acceso para ver y editar las propiedades que les asignes. Cada uno con su propio login. Ideal para gestores con equipos.',
    tags: ['usuarios', 'múltiples', 'colaboradores', 'equipo', 'gestionar'],
    url: '/help#multiples-usuarios',
    category: 'Compartir el Manual'
  },

  // Problemas al compartir
  {
    id: 'cm-26',
    type: 'faq',
    title: '¿Por qué el huésped dice que no puede abrir el enlace?',
    description: 'Problemas con el enlace',
    content: 'Posibles causas: 1) Enlace mal copiado (verifica que esté completo), 2) Problemas de conexión del huésped, 3) Navegador muy antiguo. Prueba enviar el enlace de nuevo completo o envía el QR como imagen.',
    tags: ['problema', 'enlace', 'no abre', 'error', 'huésped'],
    url: '/help#problema-enlace',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-27',
    type: 'faq',
    title: '¿Por qué el enlace se ve cortado en el mensaje?',
    description: 'Enlace truncado',
    content: 'Algunos sistemas de mensajería cortan URLs largas. Soluciones: 1) Usa un acortador de enlaces (bit.ly, tinyurl), 2) Pon el enlace en una línea separada, 3) En email, usa un hipervínculo con texto descriptivo.',
    tags: ['cortado', 'enlace', 'truncado', 'mensaje', 'largo'],
    url: '/help#enlace-cortado',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-28',
    type: 'faq',
    title: '¿Puedo usar un acortador de enlaces?',
    description: 'URLs cortas',
    content: 'Sí, puedes usar bit.ly, tinyurl u otros acortadores. Esto hace el enlace más manejable y algunos acortadores te dan estadísticas de clics. Asegúrate de probar el enlace corto antes de enviarlo.',
    tags: ['acortador', 'bitly', 'url', 'corto', 'enlace'],
    url: '/help#acortador-enlaces',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-29',
    type: 'faq',
    title: '¿El huésped ve lo mismo que yo en el editor?',
    description: 'Vista del huésped',
    content: 'El huésped ve la versión pública del manual, que es diferente al editor. La vista pública es más limpia, optimizada para móvil, y solo muestra el contenido (no las herramientas de edición). Usa "Vista previa" para ver exactamente lo que verá el huésped.',
    tags: ['vista', 'huésped', 'diferente', 'editor', 'público'],
    url: '/help#vista-huesped',
    category: 'Compartir el Manual'
  },

  // Privacidad y seguridad
  {
    id: 'cm-30',
    type: 'faq',
    title: '¿Es seguro compartir el enlace públicamente?',
    description: 'Seguridad del enlace público',
    content: 'El enlace es público, así que cualquiera con él puede ver el contenido. No incluyas información muy sensible (códigos de alarma, contraseñas de cajas fuertes). Para info sensible, envíala directamente al huésped por mensaje privado.',
    tags: ['seguro', 'público', 'privacidad', 'compartir', 'sensible'],
    url: '/help#seguridad-enlace',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-31',
    type: 'faq',
    title: '¿Puedo ocultar información sensible del manual público?',
    description: 'Proteger información',
    content: 'No hay forma de proteger partes del manual con contraseña. La estrategia recomendada es: poner en el manual solo info general, y enviar la info sensible (códigos, contraseñas) por mensaje privado a cada huésped.',
    tags: ['ocultar', 'sensible', 'proteger', 'información', 'privado'],
    url: '/help#ocultar-info-sensible',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-32',
    type: 'faq',
    title: '¿Qué información NO debería poner en el manual?',
    description: 'Información a evitar',
    content: 'Evita incluir: códigos de alarma, contraseñas de cajas fuertes, códigos de portales de vecinos, información personal detallada. Esta información es mejor enviarla solo al huésped confirmado por mensaje privado.',
    tags: ['evitar', 'información', 'sensible', 'no poner', 'seguridad'],
    url: '/help#info-no-incluir',
    category: 'Compartir el Manual'
  },

  // Desactivar y controlar acceso
  {
    id: 'cm-33',
    type: 'faq',
    title: '¿Puedo desactivar temporalmente el acceso al manual?',
    description: 'Desactivar manual',
    content: 'Sí, puedes desactivar la propiedad desde su configuración. Cuando está desactivada, el enlace mostrará un mensaje de "no disponible". Puedes reactivarla cuando quieras y el mismo enlace volverá a funcionar.',
    tags: ['desactivar', 'temporal', 'acceso', 'pausar', 'ocultar'],
    url: '/help#desactivar-manual',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-34',
    type: 'faq',
    title: '¿Qué pasa si elimino la propiedad? ¿El enlace sigue funcionando?',
    description: 'Eliminar propiedad',
    content: 'No, si eliminas la propiedad, el enlace dejará de funcionar permanentemente y mostrará error. Si solo quieres pausar temporalmente, usa la opción de desactivar en lugar de eliminar.',
    tags: ['eliminar', 'propiedad', 'enlace', 'funcionar', 'borrar'],
    url: '/help#eliminar-propiedad-enlace',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-35',
    type: 'faq',
    title: '¿Puedo cambiar el enlace del manual si lo he compartido mucho?',
    description: 'Cambiar URL',
    content: 'El enlace está vinculado al ID de tu propiedad y no se puede cambiar directamente. Si necesitas un enlace nuevo, tendrías que crear una nueva propiedad (perdiendo las estadísticas). Mejor opción: si usaste QRs, simplemente reimprímelos.',
    tags: ['cambiar', 'enlace', 'nuevo', 'url', 'diferente'],
    url: '/help#cambiar-enlace',
    category: 'Compartir el Manual'
  },

  // Compartir múltiples propiedades
  {
    id: 'cm-36',
    type: 'faq',
    title: '¿Cómo gestiono los enlaces si tengo muchas propiedades?',
    description: 'Organizar múltiples enlaces',
    content: 'Crea un documento maestro con todos los enlaces etiquetados por propiedad. También puedes usar un acortador personalizado (bit.ly/mi-apartamento-centro). Mantén este documento actualizado y accesible para ti y tu equipo.',
    tags: ['muchas', 'propiedades', 'organizar', 'enlaces', 'gestionar'],
    url: '/help#organizar-enlaces',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-37',
    type: 'faq',
    title: '¿Puedo crear una página con todos mis manuales?',
    description: 'Página índice de manuales',
    content: 'Itineramio no tiene una página índice automática, pero puedes crear una página web simple o documento con los enlaces a todos tus manuales. Útil si quieres un punto de entrada único para gestores con muchas propiedades.',
    tags: ['página', 'índice', 'todos', 'manuales', 'lista'],
    url: '/help#pagina-todos-manuales',
    category: 'Compartir el Manual'
  },

  // Huéspedes que no usan el manual
  {
    id: 'cm-38',
    type: 'faq',
    title: '¿Qué hago si el huésped no mira el manual?',
    description: 'Huéspedes que no consultan',
    content: 'Algunos huéspedes no lo consultarán hasta tener una duda. Para aumentar el uso: 1) Menciónalo varias veces (confirmación, recordatorio, check-in), 2) Pon QRs visibles en la propiedad, 3) Cuando pregunten algo, responde con el enlace a la zona relevante.',
    tags: ['no mira', 'huésped', 'manual', 'usar', 'consultar'],
    url: '/help#huesped-no-usa-manual',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-39',
    type: 'faq',
    title: '¿Cómo hago que los huéspedes usen más el manual?',
    description: 'Aumentar uso del manual',
    content: 'Estrategias: 1) Envíalo temprano y menciona beneficios específicos, 2) Pon QRs junto a cada electrodoméstico, 3) En tu mensaje, destaca que "tiene todo lo que necesitas", 4) Cuando pregunten, responde con el link específico para educarlos.',
    tags: ['aumentar', 'uso', 'manual', 'huéspedes', 'tips'],
    url: '/help#aumentar-uso-manual',
    category: 'Compartir el Manual'
  },
  {
    id: 'cm-40',
    type: 'faq',
    title: '¿Cómo respondo a preguntas enviando el link del manual?',
    description: 'Responder con enlaces',
    content: 'Cuando un huésped pregunta algo que está en el manual, responde amablemente con el enlace directo: "¡Claro! Aquí tienes las instrucciones detalladas: [enlace a zona específica]". Esto resuelve su duda y les enseña a usar el manual.',
    tags: ['responder', 'pregunta', 'enlace', 'link', 'zona'],
    url: '/help#responder-con-enlace',
    category: 'Compartir el Manual'
  },

  // ============================================
  // SECCIÓN 7: IDIOMAS Y TRADUCCIONES (30 preguntas)
  // ============================================

  // Conceptos básicos de idiomas
  {
    id: 'id-1',
    type: 'faq',
    title: '¿En qué idiomas puedo crear mi manual?',
    description: 'Idiomas disponibles',
    content: 'Itineramio soporta español, inglés y francés. Puedes crear contenido en los tres idiomas para el mismo manual. El huésped verá automáticamente el idioma de su navegador si está disponible.',
    tags: ['idiomas', 'español', 'inglés', 'francés', 'disponibles'],
    url: '/help#idiomas-disponibles',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-2',
    type: 'faq',
    title: '¿Cómo funciona el sistema multiidioma?',
    description: 'Sistema de traducciones',
    content: 'Cada zona y paso puede tener contenido en varios idiomas. Cuando un huésped accede al manual, el sistema detecta el idioma de su navegador y muestra la versión correspondiente. Si no hay traducción, muestra el idioma por defecto (español).',
    tags: ['multiidioma', 'sistema', 'funciona', 'traducciones'],
    url: '/help#sistema-multiidioma',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-3',
    type: 'faq',
    title: '¿Es obligatorio traducir el manual?',
    description: 'Necesidad de traducir',
    content: 'No es obligatorio, pero muy recomendable si tienes huéspedes internacionales. Un manual solo en español puede ser difícil para huéspedes que no hablan el idioma. Las traducciones mejoran la experiencia y reducen preguntas.',
    tags: ['obligatorio', 'traducir', 'necesario', 'recomendable'],
    url: '/help#obligatorio-traducir',
    category: 'Idiomas y Traducciones'
  },

  // Crear contenido multiidioma
  {
    id: 'id-4',
    type: 'faq',
    title: '¿Cómo añado traducciones a mi manual?',
    description: 'Proceso de traducción',
    content: 'Al editar una zona o paso, verás pestañas o campos para cada idioma (ES, EN, FR). Escribe el contenido en español primero, luego cambia a la pestaña del otro idioma y escribe la traducción. Guarda y el contenido estará en ambos idiomas.',
    tags: ['añadir', 'traducir', 'cómo', 'proceso', 'pestañas'],
    url: '/help#anadir-traducciones',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-5',
    type: 'faq',
    title: '¿Dónde escribo la versión en inglés de mi manual?',
    description: 'Escribir en inglés',
    content: 'En el editor de cada zona o paso, busca las pestañas de idioma (ES/EN/FR) en la parte superior o junto al campo de texto. Haz clic en "EN" para cambiar a inglés y escribe tu contenido en ese idioma.',
    tags: ['inglés', 'english', 'dónde', 'escribir', 'pestaña'],
    url: '/help#escribir-ingles',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-6',
    type: 'faq',
    title: '¿Tengo que traducir TODO el manual?',
    description: 'Alcance de traducciones',
    content: 'No necesariamente. Puedes traducir solo las zonas más importantes (WiFi, check-in, normas). Si una zona no tiene traducción, el huésped verá la versión en español. Prioriza las zonas que más consultan los huéspedes.',
    tags: ['todo', 'traducir', 'parcial', 'priorizar', 'importante'],
    url: '/help#traducir-todo',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-7',
    type: 'faq',
    title: '¿Las fotos y videos necesitan traducción?',
    description: 'Medios y traducciones',
    content: 'No, las fotos y videos son universales y se muestran igual en todos los idiomas. Solo el texto necesita traducción. Por eso, un manual con muchas fotos es más fácil de entender internacionalmente.',
    tags: ['fotos', 'videos', 'traducir', 'medios', 'universal'],
    url: '/help#medios-traduccion',
    category: 'Idiomas y Traducciones'
  },

  // Detección automática
  {
    id: 'id-8',
    type: 'faq',
    title: '¿Cómo sabe el manual qué idioma mostrar al huésped?',
    description: 'Detección de idioma',
    content: 'El manual detecta automáticamente el idioma configurado en el navegador del huésped. Si su navegador está en inglés, verá la versión inglesa (si existe). Si no hay traducción disponible, muestra español por defecto.',
    tags: ['detectar', 'automático', 'navegador', 'idioma', 'mostrar'],
    url: '/help#detectar-idioma',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-9',
    type: 'faq',
    title: '¿Puede el huésped cambiar el idioma manualmente?',
    description: 'Selector de idioma',
    content: 'Sí, el manual tiene un selector de idioma visible para el huésped. Pueden cambiar entre los idiomas disponibles en cualquier momento, independientemente del idioma de su navegador.',
    tags: ['cambiar', 'idioma', 'selector', 'huésped', 'manual'],
    url: '/help#cambiar-idioma-manual',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-10',
    type: 'faq',
    title: '¿Dónde está el botón para cambiar idioma en el manual?',
    description: 'Ubicación selector idioma',
    content: 'El selector de idioma suele estar en la parte superior del manual, cerca del menú o en el header. Muestra banderas o códigos de idioma (ES, EN, FR). El huésped solo ve los idiomas para los que hay contenido.',
    tags: ['botón', 'selector', 'idioma', 'dónde', 'ubicación'],
    url: '/help#boton-idioma',
    category: 'Idiomas y Traducciones'
  },

  // Problemas con traducciones
  {
    id: 'id-11',
    type: 'faq',
    title: '¿Por qué el huésped ve el manual en español si es inglés?',
    description: 'Fallback a español',
    content: 'Posibles razones: 1) No has añadido la traducción en inglés, 2) La traducción de esa zona específica no existe, 3) El navegador del huésped está configurado en español. Verifica que las traducciones estén guardadas.',
    tags: ['español', 'inglés', 'problema', 'no muestra', 'fallback'],
    url: '/help#problema-idioma',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-12',
    type: 'faq',
    title: '¿Por qué algunas zonas aparecen traducidas y otras no?',
    description: 'Traducciones incompletas',
    content: 'Cada zona se traduce independientemente. Si algunas aparecen en inglés y otras en español, es porque no has completado todas las traducciones. Revisa zona por zona y añade el contenido en el idioma que falta.',
    tags: ['parcial', 'incompleto', 'algunas', 'traducir', 'faltan'],
    url: '/help#traducciones-incompletas',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-13',
    type: 'faq',
    title: '¿Se guardan automáticamente las traducciones?',
    description: 'Guardado de traducciones',
    content: 'Las traducciones se guardan cuando guardas la zona o paso. Asegúrate de hacer clic en "Guardar" después de escribir en cada idioma. Si cambias de pestaña sin guardar, puedes perder el contenido.',
    tags: ['guardar', 'automático', 'traducciones', 'perder'],
    url: '/help#guardar-traducciones',
    category: 'Idiomas y Traducciones'
  },

  // Traducción automática
  {
    id: 'id-14',
    type: 'faq',
    title: '¿Itineramio traduce automáticamente mi contenido?',
    description: 'Traducción automática',
    content: 'Actualmente no hay traducción automática integrada. Necesitas escribir o pegar el contenido traducido manualmente. Puedes usar Google Translate o ChatGPT para ayudarte y luego revisar el resultado.',
    tags: ['automática', 'traducción', 'google', 'translate', 'IA'],
    url: '/help#traduccion-automatica',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-15',
    type: 'faq',
    title: '¿Cómo puedo traducir rápidamente mi manual?',
    description: 'Tips para traducir rápido',
    content: 'Opciones: 1) Usa Google Translate o DeepL para obtener una base, luego revisa, 2) Usa ChatGPT para traducir manteniendo contexto, 3) Contrata un traductor freelance. Lo importante es revisar que tenga sentido en contexto.',
    tags: ['rápido', 'traducir', 'tips', 'google', 'deepl', 'chatgpt'],
    url: '/help#traducir-rapido',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-16',
    type: 'faq',
    title: '¿Puedo copiar y pegar traducciones de Google Translate?',
    description: 'Usar traductor externo',
    content: 'Sí, puedes copiar de cualquier traductor y pegarlo en Itineramio. Recomendamos revisar el resultado porque los traductores automáticos a veces cometen errores, especialmente con términos técnicos de alojamiento.',
    tags: ['google', 'translate', 'copiar', 'pegar', 'traductor'],
    url: '/help#copiar-traduccion',
    category: 'Idiomas y Traducciones'
  },

  // Buenas prácticas
  {
    id: 'id-17',
    type: 'faq',
    title: '¿Qué idiomas debería priorizar?',
    description: 'Priorizar idiomas',
    content: 'Depende de tu mercado. Si recibes muchos turistas internacionales, inglés es esencial. Francés es útil si tienes huéspedes de Francia, Bélgica o Canadá. Revisa de dónde vienen tus reservas para decidir.',
    tags: ['priorizar', 'idiomas', 'cuáles', 'importante', 'mercado'],
    url: '/help#priorizar-idiomas',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-18',
    type: 'faq',
    title: '¿Qué zonas son más importantes de traducir?',
    description: 'Zonas prioritarias traducción',
    content: 'Prioriza: 1) WiFi (todos lo necesitan), 2) Check-in/llegada, 3) Normas de la casa, 4) Emergencias y contacto, 5) Electrodomésticos complicados. Estas son las que más consultan y donde más dudas surgen.',
    tags: ['zonas', 'importantes', 'traducir', 'priorizar', 'cuáles'],
    url: '/help#zonas-traducir',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-19',
    type: 'faq',
    title: '¿Debo usar español formal o informal en las traducciones?',
    description: 'Tono de las traducciones',
    content: 'Usa un tono amigable pero claro. En español, el "tú" funciona bien para crear cercanía. En inglés es más neutro. Lo importante es ser consistente en todo el manual y que las instrucciones sean fáciles de seguir.',
    tags: ['formal', 'informal', 'tono', 'estilo', 'tú', 'usted'],
    url: '/help#tono-traducciones',
    category: 'Idiomas y Traducciones'
  },

  // Casos especiales
  {
    id: 'id-20',
    type: 'faq',
    title: '¿Cómo traduzco términos técnicos de electrodomésticos?',
    description: 'Términos técnicos',
    content: 'Para electrodomésticos, usa términos simples y universales. "Vitrocerámica" en inglés es "ceramic cooktop" o simplemente "stove". Si no estás seguro, usa fotos que muestren claramente los botones y controles.',
    tags: ['técnicos', 'términos', 'electrodomésticos', 'traducir'],
    url: '/help#terminos-tecnicos',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-21',
    type: 'faq',
    title: '¿Cómo manejo las diferencias culturales en las traducciones?',
    description: 'Diferencias culturales',
    content: 'Ten en cuenta que algunas cosas varían por cultura: horarios de comidas, normas de ruido, uso de agua. Adapta el contenido si es necesario. Por ejemplo, explicar que en España se cena tarde puede ser útil para turistas.',
    tags: ['cultural', 'diferencias', 'adaptar', 'traducciones'],
    url: '/help#diferencias-culturales',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-22',
    type: 'faq',
    title: '¿Qué hago con direcciones y teléfonos en otros idiomas?',
    description: 'Datos de contacto multiidioma',
    content: 'Direcciones y teléfonos son universales, no necesitan traducción. Asegúrate de incluir el código de país en teléfonos (+34 para España). Para direcciones, el formato estándar funciona internacionalmente.',
    tags: ['dirección', 'teléfono', 'contacto', 'internacional'],
    url: '/help#datos-contacto-idioma',
    category: 'Idiomas y Traducciones'
  },

  // Gestión de traducciones
  {
    id: 'id-23',
    type: 'faq',
    title: '¿Cómo sé qué zonas me falta traducir?',
    description: 'Ver estado traducciones',
    content: 'Revisa cada zona manualmente cambiando entre pestañas de idioma. Si al cambiar a inglés el campo está vacío o muestra el texto en español, falta la traducción. Algunas versiones muestran indicadores de completitud.',
    tags: ['falta', 'traducir', 'estado', 'revisar', 'verificar'],
    url: '/help#estado-traducciones',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-24',
    type: 'faq',
    title: '¿Puedo exportar las traducciones para editarlas fuera?',
    description: 'Exportar traducciones',
    content: 'Actualmente no hay función de exportar/importar traducciones. El contenido se edita directamente en la plataforma. Si necesitas trabajar offline, copia el texto a un documento, edítalo, y luego pégalo de vuelta.',
    tags: ['exportar', 'importar', 'traducciones', 'offline', 'editar'],
    url: '/help#exportar-traducciones',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-25',
    type: 'faq',
    title: '¿Cómo actualizo una traducción existente?',
    description: 'Editar traducción',
    content: 'Ve a la zona o paso que quieres actualizar, cambia a la pestaña del idioma correspondiente, modifica el texto, y guarda. El proceso es igual que crear la traducción por primera vez.',
    tags: ['actualizar', 'editar', 'modificar', 'traducción', 'existente'],
    url: '/help#actualizar-traduccion',
    category: 'Idiomas y Traducciones'
  },

  // Preguntas sobre idiomas específicos
  {
    id: 'id-26',
    type: 'faq',
    title: '¿Puedo añadir más idiomas además de español, inglés y francés?',
    description: 'Más idiomas',
    content: 'Actualmente el sistema soporta español, inglés y francés. Si necesitas otros idiomas (alemán, italiano, portugués, etc.), contacta con soporte para conocer planes de expansión o alternativas.',
    tags: ['más', 'idiomas', 'alemán', 'italiano', 'portugués', 'otros'],
    url: '/help#mas-idiomas',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-27',
    type: 'faq',
    title: '¿Puedo crear el manual solo en inglés?',
    description: 'Solo inglés',
    content: 'Sí, puedes crear contenido solo en el idioma que prefieras. No es obligatorio tener español. Si tu mercado es principalmente angloparlante, puedes escribir todo en inglés y dejar los demás idiomas vacíos.',
    tags: ['solo', 'inglés', 'único', 'idioma', 'principal'],
    url: '/help#solo-ingles',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-28',
    type: 'faq',
    title: '¿Cuál es el idioma por defecto del manual?',
    description: 'Idioma por defecto',
    content: 'El español es el idioma por defecto. Si un huésped tiene un navegador en un idioma no soportado (ej: alemán), verá el contenido en español. Por eso es importante tener el español completo aunque tu público sea internacional.',
    tags: ['defecto', 'principal', 'idioma', 'fallback', 'español'],
    url: '/help#idioma-defecto',
    category: 'Idiomas y Traducciones'
  },

  // Vista previa y pruebas
  {
    id: 'id-29',
    type: 'faq',
    title: '¿Cómo pruebo cómo se ve mi manual en otro idioma?',
    description: 'Previsualizar idioma',
    content: 'Usa la vista previa del manual y cambia el idioma con el selector. También puedes abrir el enlace público y usar el selector de idioma como lo haría un huésped. Verifica que todo el texto se vea correcto.',
    tags: ['probar', 'previsualizar', 'idioma', 'ver', 'vista previa'],
    url: '/help#probar-idioma',
    category: 'Idiomas y Traducciones'
  },
  {
    id: 'id-30',
    type: 'faq',
    title: '¿Cómo verifico que todas las traducciones están bien?',
    description: 'Revisar traducciones',
    content: 'Revisa el manual completo en cada idioma: 1) Abre la vista previa, 2) Cambia a cada idioma, 3) Navega por todas las zonas, 4) Verifica que no haya mezcla de idiomas ni texto faltante. Pide a alguien nativo que lo revise si es posible.',
    tags: ['verificar', 'revisar', 'comprobar', 'traducciones', 'calidad'],
    url: '/help#verificar-traducciones',
    category: 'Idiomas y Traducciones'
  },

  // ============================================
  // SECCIÓN 8: WHATSAPP Y CONTACTO (25 preguntas)
  // ============================================

  // Configuración de WhatsApp
  {
    id: 'wa-1',
    type: 'faq',
    title: '¿Cómo configuro WhatsApp en mi manual?',
    description: 'Configurar número de WhatsApp',
    content: 'Ve a la configuración de tu propiedad y busca el campo de WhatsApp. Introduce tu número con el código de país (ej: +34612345678). Este número aparecerá como botón de contacto en el manual para que los huéspedes puedan escribirte.',
    tags: ['whatsapp', 'configurar', 'número', 'contacto', 'cómo'],
    url: '/help#configurar-whatsapp',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-2',
    type: 'faq',
    title: '¿En qué formato debo poner el número de WhatsApp?',
    description: 'Formato correcto del número',
    content: 'Usa el formato internacional con código de país: +34612345678 (España). Sin espacios ni guiones. El + es importante. Si pones el número mal, el botón de WhatsApp no funcionará correctamente.',
    tags: ['formato', 'número', 'whatsapp', '+34', 'internacional'],
    url: '/help#formato-whatsapp',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-3',
    type: 'faq',
    title: '¿Puedo usar un número de WhatsApp Business?',
    description: 'WhatsApp Business',
    content: 'Sí, funciona igual que un WhatsApp personal. Usar WhatsApp Business es incluso recomendable porque puedes configurar respuestas automáticas, catálogo, y estadísticas de mensajes.',
    tags: ['business', 'whatsapp', 'empresa', 'profesional'],
    url: '/help#whatsapp-business',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-4',
    type: 'faq',
    title: '¿Dónde aparece el botón de WhatsApp en el manual?',
    description: 'Ubicación del botón',
    content: 'El botón de WhatsApp aparece de forma destacada en el manual, generalmente en el header, footer, o como botón flotante. Los huéspedes lo ven fácilmente cuando necesitan contactarte.',
    tags: ['botón', 'whatsapp', 'dónde', 'ubicación', 'visible'],
    url: '/help#boton-whatsapp',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-5',
    type: 'faq',
    title: '¿Puedo tener diferentes números de WhatsApp para cada propiedad?',
    description: 'Múltiples números',
    content: 'Sí, cada propiedad puede tener su propio número de WhatsApp. Esto es útil si tienes diferentes co-anfitriones o quieres separar la comunicación por propiedad. Configúralo en cada propiedad individualmente.',
    tags: ['diferentes', 'números', 'propiedad', 'múltiples', 'separar'],
    url: '/help#whatsapp-por-propiedad',
    category: 'WhatsApp y Contacto'
  },

  // Cómo funciona el contacto
  {
    id: 'wa-6',
    type: 'faq',
    title: '¿Qué pasa cuando un huésped hace clic en WhatsApp?',
    description: 'Funcionamiento del botón',
    content: 'Se abre WhatsApp directamente con tu número preconfigurado. El huésped puede escribirte inmediatamente sin necesidad de guardar tu número. En móvil abre la app, en escritorio abre WhatsApp Web.',
    tags: ['clic', 'whatsapp', 'abrir', 'funciona', 'huésped'],
    url: '/help#clic-whatsapp',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-7',
    type: 'faq',
    title: '¿Puedo añadir un mensaje predeterminado en WhatsApp?',
    description: 'Mensaje automático',
    content: 'Algunos planes permiten configurar un mensaje predeterminado que aparece cuando el huésped abre el chat. Por ejemplo: "Hola, soy huésped de [nombre propiedad] y tengo una duda sobre...". Revisa la configuración de tu propiedad.',
    tags: ['mensaje', 'predeterminado', 'automático', 'plantilla'],
    url: '/help#mensaje-whatsapp',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-8',
    type: 'faq',
    title: '¿Se registra cuántos huéspedes hacen clic en WhatsApp?',
    description: 'Estadísticas de clics',
    content: 'Sí, en las analíticas de tu propiedad puedes ver cuántas veces se ha hecho clic en el botón de WhatsApp. Esto te da una idea de cuántos huéspedes te han contactado a través del manual.',
    tags: ['estadísticas', 'clics', 'whatsapp', 'registro', 'analíticas'],
    url: '/help#estadisticas-whatsapp',
    category: 'WhatsApp y Contacto'
  },

  // Cambiar y gestionar WhatsApp
  {
    id: 'wa-9',
    type: 'faq',
    title: '¿Cómo cambio el número de WhatsApp de mi propiedad?',
    description: 'Modificar número',
    content: 'Ve a la configuración de tu propiedad, busca el campo de WhatsApp, borra el número actual y escribe el nuevo. Guarda los cambios. El nuevo número estará activo inmediatamente en el manual.',
    tags: ['cambiar', 'número', 'whatsapp', 'modificar', 'actualizar'],
    url: '/help#cambiar-whatsapp',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-10',
    type: 'faq',
    title: '¿Puedo quitar el botón de WhatsApp del manual?',
    description: 'Ocultar WhatsApp',
    content: 'Sí, simplemente deja el campo de WhatsApp vacío en la configuración. Si no hay número configurado, el botón no aparecerá en el manual. Puedes añadirlo de nuevo cuando quieras.',
    tags: ['quitar', 'ocultar', 'whatsapp', 'eliminar', 'botón'],
    url: '/help#ocultar-whatsapp',
    category: 'WhatsApp y Contacto'
  },

  // Otros métodos de contacto
  {
    id: 'wa-11',
    type: 'faq',
    title: '¿Puedo añadir otros métodos de contacto además de WhatsApp?',
    description: 'Otros contactos',
    content: 'Sí, puedes incluir email, teléfono de llamadas, o cualquier otro contacto en el contenido de tus zonas. Por ejemplo, en una zona de "Contacto/Emergencias" puedes listar todos los métodos para comunicarse contigo.',
    tags: ['email', 'teléfono', 'contacto', 'otros', 'métodos'],
    url: '/help#otros-contactos',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-12',
    type: 'faq',
    title: '¿Cómo añado mi email de contacto en el manual?',
    description: 'Email de contacto',
    content: 'Crea una zona de "Contacto" o añade tu email en las zonas relevantes. Escríbelo como texto clicable (contacto@ejemplo.com) para que los huéspedes puedan hacer clic y abrir su app de correo.',
    tags: ['email', 'correo', 'añadir', 'contacto'],
    url: '/help#email-contacto',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-13',
    type: 'faq',
    title: '¿Puedo añadir un teléfono para llamadas además de WhatsApp?',
    description: 'Teléfono de llamadas',
    content: 'Sí, puedes incluir un número de teléfono en el contenido de tus zonas. Escríbelo con formato clicable (tel:+34612345678) en HTML o simplemente como texto. En zona de emergencias es muy recomendable.',
    tags: ['teléfono', 'llamadas', 'contacto', 'emergencia'],
    url: '/help#telefono-llamadas',
    category: 'WhatsApp y Contacto'
  },

  // Emergencias y contactos especiales
  {
    id: 'wa-14',
    type: 'faq',
    title: '¿Cómo creo una zona de emergencias con todos los contactos?',
    description: 'Zona de emergencias',
    content: 'Crea una zona llamada "Emergencias" o "Contacto de emergencia". Incluye: tu WhatsApp/teléfono, 112 (emergencias Europa), policía local, hospital más cercano, y cualquier contacto de mantenimiento urgente.',
    tags: ['emergencias', 'zona', 'contactos', 'urgente', '112'],
    url: '/help#zona-emergencias',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-15',
    type: 'faq',
    title: '¿Debo incluir el número de emergencias 112 en el manual?',
    description: 'Número de emergencias',
    content: 'Muy recomendable, especialmente para turistas extranjeros que quizás no conozcan los números de emergencia locales. El 112 funciona en toda Europa. Añádelo en tu zona de emergencias.',
    tags: ['112', 'emergencias', 'número', 'incluir', 'seguridad'],
    url: '/help#numero-112',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-16',
    type: 'faq',
    title: '¿Qué contactos de emergencia debería incluir?',
    description: 'Lista de contactos urgentes',
    content: 'Incluye: 1) Tu WhatsApp/teléfono, 2) 112 (emergencias), 3) Policía local, 4) Hospital/centro de salud cercano, 5) Fontanero/electricista de urgencias si tienes, 6) Cerrajero 24h. Mejor prevenir que curar.',
    tags: ['contactos', 'emergencia', 'lista', 'incluir', 'urgente'],
    url: '/help#lista-emergencias',
    category: 'WhatsApp y Contacto'
  },

  // Problemas con WhatsApp
  {
    id: 'wa-17',
    type: 'faq',
    title: '¿Por qué el botón de WhatsApp no funciona?',
    description: 'WhatsApp no abre',
    content: 'Posibles causas: 1) Número mal formateado (debe ser +34612345678), 2) Campo vacío, 3) El huésped no tiene WhatsApp instalado. Verifica el formato del número y pruébalo tú mismo desde el manual.',
    tags: ['no funciona', 'whatsapp', 'problema', 'error', 'botón'],
    url: '/help#whatsapp-no-funciona',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-18',
    type: 'faq',
    title: '¿Qué pasa si el huésped no tiene WhatsApp?',
    description: 'Huésped sin WhatsApp',
    content: 'No todos tienen WhatsApp, especialmente algunos turistas. Por eso es bueno tener alternativas: incluye también tu email o teléfono de llamadas en el manual. En el mensaje de confirmación, ofrece ambas opciones.',
    tags: ['sin whatsapp', 'alternativa', 'huésped', 'contacto'],
    url: '/help#sin-whatsapp',
    category: 'WhatsApp y Contacto'
  },

  // Buenas prácticas de comunicación
  {
    id: 'wa-19',
    type: 'faq',
    title: '¿Cuándo debería contactarme el huésped por WhatsApp?',
    description: 'Cuándo usar WhatsApp',
    content: 'El manual debería resolver la mayoría de dudas. WhatsApp es para: emergencias, problemas no cubiertos en el manual, dudas específicas, o confirmar llegada. Puedes indicar esto en tu zona de contacto.',
    tags: ['cuándo', 'contactar', 'whatsapp', 'uso', 'recomendado'],
    url: '/help#cuando-contactar',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-20',
    type: 'faq',
    title: '¿Cómo indico mis horarios de disponibilidad?',
    description: 'Horarios de respuesta',
    content: 'En tu zona de contacto, indica tus horarios: "Respondo mensajes de 9:00 a 21:00. Para emergencias fuera de horario, llama al [número]". Esto gestiona expectativas y evita frustración.',
    tags: ['horarios', 'disponibilidad', 'respuesta', 'indicar'],
    url: '/help#horarios-contacto',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-21',
    type: 'faq',
    title: '¿Cómo respondo a preguntas que ya están en el manual?',
    description: 'Redirigir al manual',
    content: 'Responde amablemente enviando el link directo a la zona: "¡Claro! Aquí tienes toda la info: [enlace]". Esto resuelve su duda y les enseña a usar el manual para futuras preguntas.',
    tags: ['responder', 'manual', 'enlace', 'redirigir'],
    url: '/help#responder-con-manual',
    category: 'WhatsApp y Contacto'
  },

  // Privacidad y seguridad
  {
    id: 'wa-22',
    type: 'faq',
    title: '¿Es seguro poner mi número de WhatsApp en el manual público?',
    description: 'Privacidad del número',
    content: 'El manual es público, así que cualquiera con el enlace puede ver tu número. Si te preocupa, usa un número de WhatsApp Business separado de tu personal, o usa una línea dedicada para el alquiler.',
    tags: ['seguro', 'privacidad', 'número', 'público', 'whatsapp'],
    url: '/help#privacidad-whatsapp',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-23',
    type: 'faq',
    title: '¿Debería usar un número separado para mis propiedades?',
    description: 'Número dedicado',
    content: 'Es recomendable si tienes varias propiedades o quieres separar vida personal y trabajo. Puedes usar WhatsApp Business en un teléfono con doble SIM, o tener un móvil dedicado al alquiler.',
    tags: ['separado', 'número', 'dedicado', 'personal', 'business'],
    url: '/help#numero-separado',
    category: 'WhatsApp y Contacto'
  },

  // Automatización
  {
    id: 'wa-24',
    type: 'faq',
    title: '¿Puedo automatizar respuestas de WhatsApp?',
    description: 'Respuestas automáticas',
    content: 'Con WhatsApp Business puedes configurar: mensaje de ausencia (fuera de horario), mensaje de bienvenida (primera vez que escriben), y respuestas rápidas (plantillas guardadas). Muy útil para gestores con muchas propiedades.',
    tags: ['automatizar', 'respuestas', 'whatsapp business', 'plantillas'],
    url: '/help#automatizar-whatsapp',
    category: 'WhatsApp y Contacto'
  },
  {
    id: 'wa-25',
    type: 'faq',
    title: '¿Cómo integro WhatsApp con mi sistema de gestión?',
    description: 'Integración con PMS',
    content: 'Herramientas como Hospitable, Guesty, o Your Porter permiten integrar mensajes de WhatsApp con tu gestión de reservas. Así puedes enviar el manual automáticamente y gestionar comunicación desde un solo lugar.',
    tags: ['integrar', 'pms', 'gestión', 'hospitable', 'guesty'],
    url: '/help#integracion-whatsapp',
    category: 'WhatsApp y Contacto'
  },

  // Recursos descargables (mantenemos los originales)
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
  // ============================================
  // SECCIÓN 9: PERSONALIZACIÓN (30 preguntas)
  // ============================================

  // Colores y branding
  {
    id: 'pe-1',
    type: 'faq',
    title: '¿Puedo personalizar los colores de mi manual?',
    description: 'Personalizar colores',
    content: 'Sí, puedes cambiar el color principal del manual para que combine con tu marca. Busca la opción de "Personalización" o "Colores" en la configuración de tu propiedad. El color se aplica a botones, iconos y elementos destacados.',
    tags: ['colores', 'personalizar', 'tema', 'marca', 'diseño'],
    url: '/help#personalizar-colores',
    category: 'Personalización'
  },
  {
    id: 'pe-2',
    type: 'faq',
    title: '¿Cómo cambio el color principal del manual?',
    description: 'Cambiar color principal',
    content: 'Ve a configuración de la propiedad > Personalización > Color. Puedes elegir de una paleta predefinida o introducir tu código de color HEX (#FFFFFF). El cambio se aplica inmediatamente en la vista previa.',
    tags: ['color', 'cambiar', 'principal', 'hex', 'paleta'],
    url: '/help#cambiar-color',
    category: 'Personalización'
  },
  {
    id: 'pe-3',
    type: 'faq',
    title: '¿Puedo añadir mi logo al manual?',
    description: 'Añadir logo',
    content: 'Sí, puedes subir tu logo para que aparezca en el header del manual. Recomendamos un logo en formato PNG con fondo transparente, de al menos 200px de ancho. El logo da un toque profesional y ayuda al branding.',
    tags: ['logo', 'añadir', 'marca', 'imagen', 'header'],
    url: '/help#anadir-logo',
    category: 'Personalización'
  },
  {
    id: 'pe-4',
    type: 'faq',
    title: '¿Qué tamaño debe tener el logo?',
    description: 'Tamaño del logo',
    content: 'Recomendamos: ancho mínimo 200px, máximo 500px. Formato PNG o JPG. Si es PNG con fondo transparente, quedará mejor integrado. El sistema redimensiona automáticamente, pero sube una imagen de buena calidad.',
    tags: ['logo', 'tamaño', 'dimensiones', 'formato', 'png'],
    url: '/help#tamano-logo',
    category: 'Personalización'
  },
  {
    id: 'pe-5',
    type: 'faq',
    title: '¿Puedo usar diferentes colores para cada propiedad?',
    description: 'Colores por propiedad',
    content: 'Sí, cada propiedad tiene su propia configuración de personalización. Puedes tener un manual azul para un apartamento y verde para otro. Útil si gestionas propiedades de diferentes dueños o marcas.',
    tags: ['diferentes', 'colores', 'propiedad', 'cada', 'marca'],
    url: '/help#colores-por-propiedad',
    category: 'Personalización'
  },

  // Imagen de portada
  {
    id: 'pe-6',
    type: 'faq',
    title: '¿Cómo cambio la imagen de portada de mi manual?',
    description: 'Cambiar portada',
    content: 'Ve a la configuración de tu propiedad y busca "Imagen de portada" o "Cover image". Sube una foto atractiva de tu propiedad. Esta imagen aparece al principio del manual y da la primera impresión.',
    tags: ['portada', 'imagen', 'cover', 'cambiar', 'foto'],
    url: '/help#cambiar-portada',
    category: 'Personalización'
  },
  {
    id: 'pe-7',
    type: 'faq',
    title: '¿Qué tipo de imagen es mejor para la portada?',
    description: 'Imagen de portada ideal',
    content: 'Usa una foto horizontal (landscape) de buena calidad. Idealmente el salón, terraza, o vista exterior. Evita fotos oscuras o muy recargadas. La imagen debe transmitir el carácter de tu alojamiento.',
    tags: ['portada', 'foto', 'mejor', 'recomendada', 'horizontal'],
    url: '/help#portada-ideal',
    category: 'Personalización'
  },
  {
    id: 'pe-8',
    type: 'faq',
    title: '¿Cuál es el tamaño recomendado para la imagen de portada?',
    description: 'Dimensiones de portada',
    content: 'Recomendamos 1200x600 píxeles o similar (proporción 2:1). Mínimo 800px de ancho. Formatos JPG o PNG. Tamaño de archivo máximo: 5MB. Imágenes más grandes se redimensionan automáticamente.',
    tags: ['tamaño', 'portada', 'dimensiones', 'píxeles', 'resolución'],
    url: '/help#tamano-portada',
    category: 'Personalización'
  },

  // Iconos
  {
    id: 'pe-9',
    type: 'faq',
    title: '¿Puedo cambiar los iconos de las zonas?',
    description: 'Cambiar iconos zonas',
    content: 'Sí, cada zona puede tener un icono diferente. Al editar una zona, busca el selector de icono. Hay una biblioteca de iconos para elegir: WiFi, cocina, baño, cama, etc. Elige el que mejor represente cada zona.',
    tags: ['iconos', 'cambiar', 'zonas', 'personalizar', 'elegir'],
    url: '/help#cambiar-iconos',
    category: 'Personalización'
  },
  {
    id: 'pe-10',
    type: 'faq',
    title: '¿Qué iconos hay disponibles?',
    description: 'Catálogo de iconos',
    content: 'Hay iconos para: WiFi, cocina, baño, dormitorio, salón, terraza, piscina, parking, check-in, normas, emergencias, basura, electrodomésticos, clima, TV, lavadora, y muchos más. El catálogo cubre las necesidades comunes.',
    tags: ['iconos', 'disponibles', 'catálogo', 'lista', 'opciones'],
    url: '/help#iconos-disponibles',
    category: 'Personalización'
  },
  {
    id: 'pe-11',
    type: 'faq',
    title: '¿Puedo subir mis propios iconos personalizados?',
    description: 'Iconos propios',
    content: 'Actualmente no es posible subir iconos personalizados, pero el catálogo es bastante completo. Si necesitas un icono específico que no está, contacta con soporte para sugerirlo.',
    tags: ['iconos', 'personalizados', 'subir', 'propios', 'custom'],
    url: '/help#iconos-personalizados',
    category: 'Personalización'
  },

  // Nombre y descripción
  {
    id: 'pe-12',
    type: 'faq',
    title: '¿Cómo cambio el nombre que aparece en el manual?',
    description: 'Cambiar nombre propiedad',
    content: 'Ve a configuración de la propiedad y edita el campo "Nombre". Usa un nombre descriptivo como "Apartamento Centro Madrid" o "Casa Rural La Encina". Este nombre aparece en el header del manual.',
    tags: ['nombre', 'cambiar', 'título', 'propiedad', 'manual'],
    url: '/help#cambiar-nombre',
    category: 'Personalización'
  },
  {
    id: 'pe-13',
    type: 'faq',
    title: '¿Puedo añadir una descripción de bienvenida?',
    description: 'Descripción de bienvenida',
    content: 'Sí, puedes añadir una descripción que aparece al principio del manual. Úsala para dar la bienvenida, explicar brevemente el alojamiento, o destacar lo más importante. Sé breve y acogedor.',
    tags: ['descripción', 'bienvenida', 'texto', 'introducción'],
    url: '/help#descripcion-bienvenida',
    category: 'Personalización'
  },
  {
    id: 'pe-14',
    type: 'faq',
    title: '¿Puedo personalizar el nombre de las zonas?',
    description: 'Nombres de zonas',
    content: 'Sí, puedes poner el nombre que quieras a cada zona. En lugar de "Cocina" puedes poner "Cocina americana" o "Kitchen". Los nombres se muestran en el menú de navegación del manual.',
    tags: ['nombre', 'zona', 'personalizar', 'cambiar', 'título'],
    url: '/help#nombres-zonas',
    category: 'Personalización'
  },

  // Orden y organización
  {
    id: 'pe-15',
    type: 'faq',
    title: '¿Cómo organizo el orden de las zonas?',
    description: 'Ordenar zonas',
    content: 'Puedes arrastrar y soltar las zonas para reordenarlas. Pon las más importantes primero: WiFi, check-in, normas. El huésped verá las zonas en el orden que tú definas.',
    tags: ['orden', 'zonas', 'organizar', 'arrastrar', 'prioridad'],
    url: '/help#ordenar-zonas',
    category: 'Personalización'
  },
  {
    id: 'pe-16',
    type: 'faq',
    title: '¿Puedo ocultar zonas sin eliminarlas?',
    description: 'Ocultar zonas',
    content: 'Sí, puedes marcar una zona como "oculta" o "borrador". La zona no aparecerá en el manual público pero se mantendrá guardada. Útil para zonas estacionales como "Piscina" en invierno.',
    tags: ['ocultar', 'zonas', 'esconder', 'borrador', 'temporal'],
    url: '/help#ocultar-zonas',
    category: 'Personalización'
  },
  {
    id: 'pe-17',
    type: 'faq',
    title: '¿Cómo agrupo zonas relacionadas?',
    description: 'Agrupar zonas',
    content: 'Puedes ordenarlas juntas y usar nombres que indiquen relación: "Cocina - Electrodomésticos", "Cocina - Utensilios". Algunas versiones permiten crear secciones o categorías para agrupar zonas.',
    tags: ['agrupar', 'zonas', 'secciones', 'categorías', 'organizar'],
    url: '/help#agrupar-zonas',
    category: 'Personalización'
  },

  // Aspecto visual
  {
    id: 'pe-18',
    type: 'faq',
    title: '¿Puedo elegir entre diferentes diseños de manual?',
    description: 'Temas de diseño',
    content: 'Actualmente hay un diseño principal optimizado para móvil. El diseño se puede personalizar con colores y logo, pero la estructura base es la misma para todos. Está diseñado para máxima usabilidad.',
    tags: ['diseño', 'tema', 'plantilla', 'layout', 'estilo'],
    url: '/help#diseno-manual',
    category: 'Personalización'
  },
  {
    id: 'pe-19',
    type: 'faq',
    title: '¿El manual se adapta a móvil automáticamente?',
    description: 'Diseño responsive',
    content: 'Sí, el manual es 100% responsive. Se adapta automáticamente a móviles, tablets y ordenadores. No necesitas hacer nada, el diseño es mobile-first porque la mayoría de huéspedes lo usan en el móvil.',
    tags: ['móvil', 'responsive', 'adaptable', 'tablet', 'ordenador'],
    url: '/help#responsive',
    category: 'Personalización'
  },

  // Contenido destacado
  {
    id: 'pe-20',
    type: 'faq',
    title: '¿Puedo destacar información importante?',
    description: 'Destacar contenido',
    content: 'Sí, usa formato de texto: negritas para lo importante, emojis para llamar atención (⚠️ 🔴), o crea una zona específica de "Importante" o "Antes de llegar". El contenido destacado se ve primero.',
    tags: ['destacar', 'importante', 'resaltar', 'negritas', 'emojis'],
    url: '/help#destacar-contenido',
    category: 'Personalización'
  },
  {
    id: 'pe-21',
    type: 'faq',
    title: '¿Puedo usar emojis en el manual?',
    description: 'Emojis en contenido',
    content: 'Sí, los emojis funcionan perfectamente y pueden hacer el manual más visual y amigable. Usa ✅ para pasos completados, ⚠️ para advertencias, 📍 para ubicaciones. No abuses, úsalos con propósito.',
    tags: ['emojis', 'iconos', 'símbolos', 'usar', 'añadir'],
    url: '/help#usar-emojis',
    category: 'Personalización'
  },
  {
    id: 'pe-22',
    type: 'faq',
    title: '¿Puedo añadir texto con formato (negritas, cursivas)?',
    description: 'Formato de texto',
    content: 'Depende del campo. En descripciones y contenido de pasos, generalmente puedes usar negritas para destacar palabras importantes. Revisa la barra de herramientas del editor para ver las opciones disponibles.',
    tags: ['formato', 'negritas', 'cursiva', 'texto', 'estilo'],
    url: '/help#formato-texto',
    category: 'Personalización'
  },

  // Información adicional
  {
    id: 'pe-23',
    type: 'faq',
    title: '¿Puedo añadir información de la zona/barrio?',
    description: 'Info del barrio',
    content: 'Sí, crea una zona de "Alrededores" o "Recomendaciones". Incluye restaurantes cercanos, supermercados, transporte público, lugares de interés. Los huéspedes lo agradecen mucho.',
    tags: ['barrio', 'zona', 'recomendaciones', 'alrededores', 'info'],
    url: '/help#info-barrio',
    category: 'Personalización'
  },
  {
    id: 'pe-24',
    type: 'faq',
    title: '¿Puedo incluir enlaces a Google Maps?',
    description: 'Enlaces Google Maps',
    content: 'Sí, pega enlaces de Google Maps directamente en el contenido. Cuando el huésped hace clic, se abre Maps con la ubicación. Muy útil para indicar dónde está la propiedad, parking, supermercado, etc.',
    tags: ['google maps', 'enlaces', 'ubicación', 'mapa', 'direcciones'],
    url: '/help#google-maps',
    category: 'Personalización'
  },
  {
    id: 'pe-25',
    type: 'faq',
    title: '¿Puedo poner horarios de check-in/check-out personalizados?',
    description: 'Horarios personalizados',
    content: 'Sí, en tu zona de check-in y check-out indica tus horarios específicos. "Check-in: a partir de las 15:00", "Check-out: antes de las 11:00". También puedes explicar opciones de early check-in si las ofreces.',
    tags: ['horarios', 'check-in', 'check-out', 'personalizar', 'horas'],
    url: '/help#horarios-checkin',
    category: 'Personalización'
  },

  // Problemas de personalización
  {
    id: 'pe-26',
    type: 'faq',
    title: '¿Por qué no se guarda mi logo?',
    description: 'Logo no guarda',
    content: 'Posibles causas: 1) Archivo muy grande (máx 2-5MB), 2) Formato no soportado (usa PNG o JPG), 3) Error de conexión al subir. Prueba con una imagen más pequeña y en formato estándar.',
    tags: ['logo', 'no guarda', 'problema', 'error', 'subir'],
    url: '/help#logo-no-guarda',
    category: 'Personalización'
  },
  {
    id: 'pe-27',
    type: 'faq',
    title: '¿Por qué el color no se aplica correctamente?',
    description: 'Color no funciona',
    content: 'Verifica que guardaste los cambios después de seleccionar el color. Refresca la página y revisa la vista previa. Si usaste código HEX, asegúrate de que sea válido (# seguido de 6 caracteres).',
    tags: ['color', 'no aplica', 'problema', 'error', 'guardar'],
    url: '/help#color-no-aplica',
    category: 'Personalización'
  },
  {
    id: 'pe-28',
    type: 'faq',
    title: '¿La personalización afecta a la velocidad del manual?',
    description: 'Rendimiento',
    content: 'No significativamente. Las imágenes se optimizan automáticamente. Un logo pesado o muchas fotos de alta resolución pueden ralentizar ligeramente la carga, pero el sistema está optimizado para ser rápido.',
    tags: ['velocidad', 'rendimiento', 'carga', 'lento', 'rápido'],
    url: '/help#rendimiento-personalizacion',
    category: 'Personalización'
  },

  // Duplicar y copiar
  {
    id: 'pe-29',
    type: 'faq',
    title: '¿Puedo copiar la personalización de una propiedad a otra?',
    description: 'Copiar personalización',
    content: 'Actualmente necesitas configurar cada propiedad individualmente. Si tienes muchas propiedades con el mismo estilo, configura una como modelo y replica manualmente los colores y logo en las demás.',
    tags: ['copiar', 'personalización', 'duplicar', 'propiedades', 'misma'],
    url: '/help#copiar-personalizacion',
    category: 'Personalización'
  },
  {
    id: 'pe-30',
    type: 'faq',
    title: '¿Puedo restablecer la personalización a los valores por defecto?',
    description: 'Restablecer valores',
    content: 'Sí, puedes eliminar el logo (dejando el campo vacío) y seleccionar el color por defecto en la paleta. Esto restaurará el aspecto estándar del manual.',
    tags: ['restablecer', 'defecto', 'valores', 'original', 'eliminar'],
    url: '/help#restablecer-personalizacion',
    category: 'Personalización'
  },

  // ============================================
  // SECCIÓN 10: AVISOS Y ALERTAS (20 preguntas)
  // ============================================

  {
    id: 'av-1',
    type: 'faq',
    title: '¿Puedo añadir avisos importantes al manual?',
    description: 'Crear avisos',
    content: 'Sí, puedes crear una zona específica para avisos importantes que aparezca destacada. Nómbrala "Importante" o "Antes de llegar" y ponla al principio. Usa emojis como ⚠️ o 🔴 para llamar la atención.',
    tags: ['avisos', 'importante', 'alertas', 'crear', 'destacar'],
    url: '/help#crear-avisos',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-2',
    type: 'faq',
    title: '¿Cómo destaco información de seguridad?',
    description: 'Info seguridad destacada',
    content: 'Crea una zona de "Seguridad" o "Emergencias" con icono de alerta. Incluye: ubicación del extintor, salidas de emergencia, número 112, tu contacto de emergencia. Ponla visible en el menú.',
    tags: ['seguridad', 'destacar', 'emergencia', 'importante'],
    url: '/help#info-seguridad',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-3',
    type: 'faq',
    title: '¿Cómo indico normas importantes que deben cumplir?',
    description: 'Normas destacadas',
    content: 'Crea una zona de "Normas de la casa" clara y directa. Lista las normas principales: horario de silencio, política de mascotas, prohibido fumar, máximo de personas. Sé claro pero amable en el tono.',
    tags: ['normas', 'reglas', 'casa', 'cumplir', 'obligatorio'],
    url: '/help#normas-destacadas',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-4',
    type: 'faq',
    title: '¿Puedo añadir advertencias sobre electrodomésticos?',
    description: 'Advertencias electrodomésticos',
    content: 'Sí, en cada zona de electrodomésticos puedes añadir advertencias específicas. Ejemplo: "⚠️ La vitrocerámica tarda en enfriarse", "No usar metal en el microondas". Previene accidentes y daños.',
    tags: ['advertencias', 'electrodomésticos', 'precaución', 'seguridad'],
    url: '/help#advertencias-electrodomesticos',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-5',
    type: 'faq',
    title: '¿Cómo aviso de obras o inconvenientes temporales?',
    description: 'Avisos temporales',
    content: 'Añade un aviso temporal al principio del manual o en la zona afectada. "⚠️ Obras en la calle hasta [fecha]". Recuerda quitarlo cuando termine. Puedes usar la función de ocultar/mostrar zonas.',
    tags: ['obras', 'temporal', 'aviso', 'inconveniente', 'transitorio'],
    url: '/help#avisos-temporales',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-6',
    type: 'faq',
    title: '¿Cómo indico que algo está roto o fuera de servicio?',
    description: 'Equipamiento fuera de servicio',
    content: 'Actualiza la zona afectada con el aviso: "🔴 Lavadora fuera de servicio hasta [fecha]". También puedes ocultar esa zona temporalmente si el equipo no está disponible. Mantén el manual actualizado.',
    tags: ['roto', 'fuera de servicio', 'averiado', 'actualizar'],
    url: '/help#fuera-servicio',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-7',
    type: 'faq',
    title: '¿Puedo poner avisos sobre mascotas o alergias?',
    description: 'Avisos mascotas/alergias',
    content: 'Sí, es importante. Si no admites mascotas, indícalo claramente. Si hay mascota en la casa, avisa por alergias. "Esta propiedad tiene un gato residente" o "Prohibidas las mascotas".',
    tags: ['mascotas', 'alergias', 'aviso', 'permitido', 'prohibido'],
    url: '/help#avisos-mascotas',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-8',
    type: 'faq',
    title: '¿Cómo aviso sobre el horario de silencio?',
    description: 'Aviso horario silencio',
    content: 'En tu zona de normas, especifica claramente: "Horario de silencio: 22:00 - 08:00". Explica que es por respeto a los vecinos. Algunos edificios tienen normas específicas que debes comunicar.',
    tags: ['silencio', 'horario', 'ruido', 'vecinos', 'normas'],
    url: '/help#horario-silencio',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-9',
    type: 'faq',
    title: '¿Cómo indico límites de consumo (agua, electricidad)?',
    description: 'Límites de consumo',
    content: 'Si tienes límites de consumo, indícalos claramente y amablemente: "Por favor, apaga las luces al salir", "Limitamos el uso del aire a temperaturas razonables". Explica el motivo (sostenibilidad, costes).',
    tags: ['consumo', 'límites', 'electricidad', 'agua', 'ahorro'],
    url: '/help#limites-consumo',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-10',
    type: 'faq',
    title: '¿Puedo añadir avisos de reciclaje y basura?',
    description: 'Avisos reciclaje',
    content: 'Sí, crea una zona de "Basura y reciclaje". Explica dónde están los contenedores, qué días pasa el camión, y cómo separar. Los turistas internacionales especialmente aprecian esta información clara.',
    tags: ['reciclaje', 'basura', 'contenedores', 'separar', 'días'],
    url: '/help#avisos-reciclaje',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-11',
    type: 'faq',
    title: '¿Cómo aviso de cargos extra (limpieza, daños)?',
    description: 'Avisos cargos extra',
    content: 'En tus normas, indica claramente: "Cargo extra de X€ por limpieza extraordinaria", "Los daños se descontarán de la fianza". Sé transparente desde el principio para evitar conflictos.',
    tags: ['cargos', 'extra', 'limpieza', 'daños', 'fianza'],
    url: '/help#cargos-extra',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-12',
    type: 'faq',
    title: '¿Cómo creo alertas visualmente llamativas?',
    description: 'Alertas visuales',
    content: 'Usa emojis de alerta: ⚠️ 🚨 🔴 ❗. Pon el texto en mayúsculas para lo más crítico. Usa negritas si el editor lo permite. Coloca las alertas al principio de la zona relevante.',
    tags: ['alertas', 'visuales', 'llamativas', 'emojis', 'destacar'],
    url: '/help#alertas-visuales',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-13',
    type: 'faq',
    title: '¿Dónde coloco los avisos más importantes?',
    description: 'Ubicación de avisos',
    content: 'Los avisos más importantes deben estar: 1) En una zona propia al principio ("Importante"), 2) Al inicio de la zona relevante, 3) En la zona de normas. Lo que está primero se ve primero.',
    tags: ['ubicación', 'avisos', 'posición', 'primero', 'visible'],
    url: '/help#ubicacion-avisos',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-14',
    type: 'faq',
    title: '¿Con qué frecuencia debo actualizar los avisos?',
    description: 'Actualizar avisos',
    content: 'Revisa los avisos: antes de cada huésped (especialmente avisos temporales), cuando cambie algo (obras, averías), estacionalmente (piscina, calefacción). Un manual desactualizado genera confusión.',
    tags: ['actualizar', 'frecuencia', 'revisar', 'mantener', 'cambios'],
    url: '/help#actualizar-avisos',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-15',
    type: 'faq',
    title: '¿Cómo aviso de zonas peligrosas en la propiedad?',
    description: 'Zonas peligrosas',
    content: 'Crea advertencias claras: "⚠️ Escaleras empinadas, cuidado de noche", "Piscina sin vigilancia, niños siempre acompañados". La seguridad del huésped es prioritaria, sé específico sobre riesgos.',
    tags: ['peligro', 'zonas', 'seguridad', 'advertencia', 'riesgo'],
    url: '/help#zonas-peligrosas',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-16',
    type: 'faq',
    title: '¿Puedo avisar sobre el clima o estación?',
    description: 'Avisos estacionales',
    content: 'Sí, añade info estacional: "En verano hace mucho calor, usa el aire", "En invierno puede helar, cuidado con el suelo mojado". Actualiza según la época para dar info relevante.',
    tags: ['clima', 'estacional', 'verano', 'invierno', 'temporada'],
    url: '/help#avisos-estacionales',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-17',
    type: 'faq',
    title: '¿Cómo indico las instrucciones de check-out importantes?',
    description: 'Avisos check-out',
    content: 'Crea una zona de "Check-out" con lista clara: "Antes de irte: 1) Deja llaves en [lugar], 2) Cierra ventanas, 3) Apaga luces y aire, 4) Saca basura". Una checklist simple evita olvidos.',
    tags: ['check-out', 'salida', 'instrucciones', 'lista', 'recordar'],
    url: '/help#avisos-checkout',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-18',
    type: 'faq',
    title: '¿Cómo aviso de parking y normas de aparcamiento?',
    description: 'Avisos parking',
    content: 'Crea zona de "Parking" con: ubicación exacta, si es gratis o de pago, horarios de zona azul, dónde NO aparcar (para evitar multas). Añade foto o enlace Google Maps de la ubicación.',
    tags: ['parking', 'aparcamiento', 'normas', 'zona azul', 'multas'],
    url: '/help#avisos-parking',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-19',
    type: 'faq',
    title: '¿Cómo comunico cambios de última hora a los huéspedes?',
    description: 'Cambios última hora',
    content: 'Para cambios urgentes: 1) Actualiza el manual inmediatamente, 2) Envía mensaje directo al huésped por WhatsApp/email, 3) No confíes solo en el manual para avisos de última hora.',
    tags: ['cambios', 'última hora', 'urgente', 'comunicar', 'actualizar'],
    url: '/help#cambios-ultima-hora',
    category: 'Avisos y Alertas'
  },
  {
    id: 'av-20',
    type: 'faq',
    title: '¿Qué avisos legales debería incluir?',
    description: 'Avisos legales',
    content: 'Incluye: número de licencia turística (obligatorio en muchas zonas), política de privacidad básica, normas de la comunidad. Cumplir con la legalidad te protege ante problemas.',
    tags: ['legal', 'licencia', 'obligatorio', 'normativa', 'privacidad'],
    url: '/help#avisos-legales',
    category: 'Avisos y Alertas'
  },

  // Recursos descargables (mantenemos los originales)
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
  // ============================================
  // SECCIÓN 11: ANALÍTICAS Y ESTADÍSTICAS (25 preguntas)
  // ============================================

  {
    id: 'an-1',
    type: 'faq',
    title: '¿Dónde veo las estadísticas de mi manual?',
    description: 'Acceder a analíticas',
    content: 'Ve a tu propiedad y busca el botón "Analíticas" o "Estadísticas". Se abrirá un panel con todas las métricas: visitas, zonas más vistas, clics en WhatsApp, valoraciones, y más.',
    tags: ['estadísticas', 'analíticas', 'métricas', 'dónde', 'ver'],
    url: '/help#ver-estadisticas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-2',
    type: 'faq',
    title: '¿Qué métricas puedo ver de mi manual?',
    description: 'Métricas disponibles',
    content: 'Puedes ver: total de visitas, visitantes únicos, zonas más consultadas, clics en WhatsApp, tiempo medio de uso, valoraciones de huéspedes, visitas por día de la semana, y más.',
    tags: ['métricas', 'disponibles', 'datos', 'información', 'estadísticas'],
    url: '/help#metricas-disponibles',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-3',
    type: 'faq',
    title: '¿Cómo sé cuántas veces se ha visitado mi manual?',
    description: 'Ver visitas totales',
    content: 'En las analíticas verás "Total de visitas" o "Views". Este número incluye todas las veces que alguien ha abierto tu manual, tanto desde el enlace como escaneando el QR.',
    tags: ['visitas', 'cuántas', 'total', 'veces', 'contador'],
    url: '/help#visitas-totales',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-4',
    type: 'faq',
    title: '¿Puedo ver qué zonas consultan más los huéspedes?',
    description: 'Zonas más visitadas',
    content: 'Sí, en las analíticas hay un ranking de zonas más visitadas. Esto te ayuda a saber qué información buscan más los huéspedes y si necesitas mejorar alguna zona poco clara.',
    tags: ['zonas', 'más visitadas', 'ranking', 'populares', 'consultan'],
    url: '/help#zonas-mas-visitadas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-5',
    type: 'faq',
    title: '¿Puedo ver cuántos huéspedes han hecho clic en WhatsApp?',
    description: 'Clics WhatsApp',
    content: 'Sí, hay una métrica específica de "Clics en WhatsApp". Te indica cuántos huéspedes han querido contactarte a través del manual. Si es muy alto, quizás necesites mejorar alguna información.',
    tags: ['whatsapp', 'clics', 'contacto', 'estadísticas', 'cuántos'],
    url: '/help#clics-whatsapp',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-6',
    type: 'faq',
    title: '¿Cómo sé cuánto tiempo pasan los huéspedes en el manual?',
    description: 'Tiempo de uso',
    content: 'Las analíticas muestran "Tiempo medio de sesión" o "Duración media". Esto se calcula desde que abren el manual hasta que lo cierran. Te indica si realmente están leyendo el contenido.',
    tags: ['tiempo', 'duración', 'sesión', 'minutos', 'uso'],
    url: '/help#tiempo-uso',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-7',
    type: 'faq',
    title: '¿Puedo ver las estadísticas por período de tiempo?',
    description: 'Filtrar por fechas',
    content: 'Sí, puedes filtrar por: últimos 7 días, último mes, últimos 3 meses, o un rango personalizado. Útil para comparar temporadas o ver el impacto de cambios que hayas hecho.',
    tags: ['período', 'fechas', 'filtrar', 'tiempo', 'rango'],
    url: '/help#estadisticas-periodo',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-8',
    type: 'faq',
    title: '¿Qué son los visitantes únicos?',
    description: 'Visitantes únicos vs totales',
    content: 'Los visitantes únicos son personas diferentes que han visitado tu manual. Las visitas totales incluyen repeticiones (si alguien entra 3 veces, cuenta 3 visitas pero 1 visitante único).',
    tags: ['únicos', 'visitantes', 'diferentes', 'personas', 'diferencia'],
    url: '/help#visitantes-unicos',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-9',
    type: 'faq',
    title: '¿Puedo ver desde qué dispositivos acceden?',
    description: 'Dispositivos de acceso',
    content: 'Algunas versiones muestran el desglose por dispositivo: móvil, tablet, ordenador. La mayoría de huéspedes usan móvil, por eso el manual está optimizado para esa experiencia.',
    tags: ['dispositivos', 'móvil', 'tablet', 'ordenador', 'acceso'],
    url: '/help#dispositivos-acceso',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-10',
    type: 'faq',
    title: '¿Las analíticas me dicen quién específicamente visitó el manual?',
    description: 'Privacidad visitantes',
    content: 'No, las analíticas son anónimas y agregadas. Ves números totales pero no identidades individuales. Esto protege la privacidad de los huéspedes mientras te da información útil.',
    tags: ['privacidad', 'anónimo', 'quién', 'identidad', 'datos'],
    url: '/help#privacidad-analiticas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-11',
    type: 'faq',
    title: '¿Puedo exportar las estadísticas?',
    description: 'Exportar datos',
    content: 'Depende del plan. Algunos planes permiten exportar datos a CSV o PDF para análisis externo. Contacta con soporte para conocer las opciones disponibles en tu plan.',
    tags: ['exportar', 'descargar', 'csv', 'pdf', 'datos'],
    url: '/help#exportar-estadisticas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-12',
    type: 'faq',
    title: '¿Cómo interpreto las valoraciones de los huéspedes?',
    description: 'Entender valoraciones',
    content: 'Las valoraciones (1-5 estrellas) indican satisfacción con el manual. Revisa los comentarios si los hay. Valoraciones bajas pueden indicar información confusa o faltante que deberías mejorar.',
    tags: ['valoraciones', 'estrellas', 'interpretar', 'feedback', 'rating'],
    url: '/help#interpretar-valoraciones',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-13',
    type: 'faq',
    title: '¿Puedo ver estadísticas de cada zona individual?',
    description: 'Analíticas por zona',
    content: 'Sí, puedes ver cuántas veces se ha visitado cada zona. Esto te ayuda a identificar qué información es más demandada y qué zonas quizás necesiten más desarrollo.',
    tags: ['zona', 'individual', 'estadísticas', 'cada', 'detalle'],
    url: '/help#estadisticas-zona',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-14',
    type: 'faq',
    title: '¿Qué día de la semana hay más visitas?',
    description: 'Patrones de visitas',
    content: 'Las analíticas muestran visitas por día de la semana. Normalmente verás picos en días de check-in (viernes, sábado). Esto te ayuda a entender cuándo los huéspedes más necesitan el manual.',
    tags: ['día', 'semana', 'patrón', 'cuándo', 'pico'],
    url: '/help#patrones-visitas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-15',
    type: 'faq',
    title: '¿Por qué tengo pocas visitas si tengo huéspedes?',
    description: 'Pocas visitas',
    content: 'Posibles causas: 1) No estás compartiendo el enlace efectivamente, 2) Los huéspedes no saben que existe, 3) El QR no es visible. Solución: envía el enlace más veces y pon QRs más visibles.',
    tags: ['pocas', 'visitas', 'pocos', 'problema', 'mejorar'],
    url: '/help#pocas-visitas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-16',
    type: 'faq',
    title: '¿Cómo mejoro las métricas de mi manual?',
    description: 'Mejorar estadísticas',
    content: 'Para más visitas: comparte el enlace más veces. Para más tiempo de uso: añade contenido útil. Para menos WhatsApp: mejora la claridad de las instrucciones. Las métricas te guían para mejorar.',
    tags: ['mejorar', 'métricas', 'aumentar', 'optimizar', 'tips'],
    url: '/help#mejorar-metricas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-17',
    type: 'faq',
    title: '¿Puedo comparar estadísticas entre propiedades?',
    description: 'Comparar propiedades',
    content: 'Si tienes varias propiedades, puedes ver las estadísticas de cada una. Compara para identificar cuál manual funciona mejor y aplicar esas mejoras a los demás.',
    tags: ['comparar', 'propiedades', 'varias', 'diferencias', 'benchmark'],
    url: '/help#comparar-propiedades',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-18',
    type: 'faq',
    title: '¿Las visitas de prueba mías cuentan en las estadísticas?',
    description: 'Visitas propias',
    content: 'Sí, tus visitas de prueba se contabilizan. Si haces muchas pruebas, esto puede inflar los números. Algunos sistemas permiten filtrar tu IP, pero en general, no te preocupes si son pocas.',
    tags: ['propias', 'visitas', 'prueba', 'contar', 'filtrar'],
    url: '/help#visitas-propias',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-19',
    type: 'faq',
    title: '¿Cada cuánto se actualizan las estadísticas?',
    description: 'Actualización datos',
    content: 'Las estadísticas se actualizan en tiempo real o casi real (pocos minutos de retraso). Cuando un huésped visita, la métrica se actualiza inmediatamente o en la siguiente actualización.',
    tags: ['actualizar', 'frecuencia', 'tiempo real', 'retraso', 'datos'],
    url: '/help#actualizacion-estadisticas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-20',
    type: 'faq',
    title: '¿Qué hago con la información de las analíticas?',
    description: 'Usar analíticas',
    content: 'Usa las analíticas para: 1) Identificar zonas populares y mejorarlas, 2) Detectar info que falta (muchos WhatsApps), 3) Saber si el manual se usa, 4) Demostrar valor del manual con datos.',
    tags: ['usar', 'analíticas', 'acciones', 'decisiones', 'información'],
    url: '/help#usar-analiticas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-21',
    type: 'faq',
    title: '¿Puedo ver el historial completo de estadísticas?',
    description: 'Historial analíticas',
    content: 'Sí, las estadísticas se guardan históricamente. Puedes ver tendencias a lo largo del tiempo, comparar meses, y ver cómo ha evolucionado el uso de tu manual desde que lo creaste.',
    tags: ['historial', 'histórico', 'tendencias', 'tiempo', 'evolución'],
    url: '/help#historial-estadisticas',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-22',
    type: 'faq',
    title: '¿Qué son las páginas por sesión?',
    description: 'Páginas por sesión',
    content: 'Indica cuántas zonas visita en promedio cada huésped. Si es alto (3-5+), significa que exploran el manual. Si es bajo (1), quizás solo buscan algo específico o el manual no les engancha.',
    tags: ['páginas', 'sesión', 'promedio', 'zonas', 'navegación'],
    url: '/help#paginas-sesion',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-23',
    type: 'faq',
    title: '¿Qué es la tasa de rebote?',
    description: 'Tasa de rebote',
    content: 'La tasa de rebote indica cuántos visitantes entran y salen sin interactuar. Una tasa alta puede indicar que la primera página no es atractiva o que no encuentran lo que buscan.',
    tags: ['rebote', 'tasa', 'bounce', 'salir', 'abandonar'],
    url: '/help#tasa-rebote',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-24',
    type: 'faq',
    title: '¿Las analíticas funcionan si el manual está desactivado?',
    description: 'Analíticas manual inactivo',
    content: 'Si el manual está desactivado, no habrá nuevas visitas que registrar. Las estadísticas históricas se mantienen, pero no se añaden nuevos datos hasta que reactives la propiedad.',
    tags: ['desactivado', 'inactivo', 'analíticas', 'historial', 'pausado'],
    url: '/help#analiticas-inactivo',
    category: 'Analíticas y Estadísticas'
  },
  {
    id: 'an-25',
    type: 'faq',
    title: '¿Puedo recibir informes de analíticas por email?',
    description: 'Informes por email',
    content: 'Depende del plan. Algunos planes incluyen informes semanales o mensuales por email con resumen de métricas. Revisa tu configuración de notificaciones o contacta soporte.',
    tags: ['informes', 'email', 'automático', 'resumen', 'notificaciones'],
    url: '/help#informes-email',
    category: 'Analíticas y Estadísticas'
  },

  // ============================================
  // SECCIÓN 12: HUÉSPEDES (35 preguntas)
  // ============================================

  {
    id: 'hu-1',
    type: 'faq',
    title: '¿Cómo ven los huéspedes mi manual?',
    description: 'Vista del huésped',
    content: 'Los huéspedes ven una versión limpia y optimizada para móvil. No ven las herramientas de edición ni tu panel de control. Solo ven el contenido: zonas, pasos, fotos, videos y botón de contacto.',
    tags: ['huésped', 'vista', 'ver', 'cómo', 'manual'],
    url: '/help#vista-huesped',
    category: 'Huéspedes'
  },
  {
    id: 'hu-2',
    type: 'faq',
    title: '¿Los huéspedes necesitan instalar alguna app?',
    description: 'Sin app necesaria',
    content: 'No, el manual funciona directamente en el navegador del móvil. No requiere descargar ninguna aplicación. Escanean el QR o abren el enlace y listo, se abre como página web.',
    tags: ['app', 'instalar', 'aplicación', 'descargar', 'navegador'],
    url: '/help#sin-app',
    category: 'Huéspedes'
  },
  {
    id: 'hu-3',
    type: 'faq',
    title: '¿Los huéspedes necesitan crear una cuenta?',
    description: 'Sin registro necesario',
    content: 'No, el acceso es directo sin registro ni login. Los huéspedes simplemente abren el enlace y ven el manual. Esto reduce la fricción y hace que más huéspedes lo usen.',
    tags: ['cuenta', 'registro', 'login', 'acceso', 'directo'],
    url: '/help#sin-registro',
    category: 'Huéspedes'
  },
  {
    id: 'hu-4',
    type: 'faq',
    title: '¿El manual funciona en cualquier móvil?',
    description: 'Compatibilidad dispositivos',
    content: 'Sí, funciona en iPhone, Android, tablets y ordenadores. Está optimizado para navegadores modernos (Chrome, Safari, Firefox). Móviles muy antiguos pueden tener limitaciones menores.',
    tags: ['móvil', 'compatible', 'iphone', 'android', 'dispositivo'],
    url: '/help#compatibilidad-movil',
    category: 'Huéspedes'
  },
  {
    id: 'hu-5',
    type: 'faq',
    title: '¿Los huéspedes pueden valorar el manual?',
    description: 'Sistema de valoraciones',
    content: 'Sí, al final del manual o después de usar una zona, los huéspedes pueden dejar una valoración (estrellas) y opcionalmente un comentario. Estas valoraciones te ayudan a mejorar.',
    tags: ['valorar', 'estrellas', 'rating', 'opinión', 'feedback'],
    url: '/help#valoraciones-huespedes',
    category: 'Huéspedes'
  },
  {
    id: 'hu-6',
    type: 'faq',
    title: '¿Puedo ver los comentarios que dejan los huéspedes?',
    description: 'Ver comentarios',
    content: 'Sí, los comentarios aparecen en tu panel de analíticas o en la sección de valoraciones. Revísalos periódicamente para identificar áreas de mejora o zonas que generan confusión.',
    tags: ['comentarios', 'ver', 'feedback', 'opiniones', 'revisar'],
    url: '/help#ver-comentarios',
    category: 'Huéspedes'
  },
  {
    id: 'hu-7',
    type: 'faq',
    title: '¿Cómo hago que más huéspedes usen el manual?',
    description: 'Aumentar uso',
    content: 'Tips: 1) Envía el enlace al confirmar reserva, 2) Envía recordatorio 1-2 días antes, 3) Pon QRs visibles en la propiedad, 4) Menciona el manual en tu mensaje de bienvenida, 5) Responde preguntas con links al manual.',
    tags: ['aumentar', 'uso', 'huéspedes', 'tips', 'más'],
    url: '/help#aumentar-uso-huespedes',
    category: 'Huéspedes'
  },
  {
    id: 'hu-8',
    type: 'faq',
    title: '¿Qué hago si un huésped tiene problemas para acceder?',
    description: 'Problemas de acceso',
    content: 'Ofrece alternativas: 1) Reenvía el enlace por email o SMS, 2) Envía una captura del QR, 3) Ten instrucciones básicas impresas de respaldo. Pregunta qué error ven para diagnosticar.',
    tags: ['problema', 'acceso', 'error', 'ayudar', 'huésped'],
    url: '/help#problemas-acceso-huesped',
    category: 'Huéspedes'
  },
  {
    id: 'hu-9',
    type: 'faq',
    title: '¿El manual funciona sin internet?',
    description: 'Uso offline',
    content: 'Se necesita internet para cargar el manual inicialmente. Una vez cargado, funciona con conexión lenta. Si no hay nada de internet, los huéspedes necesitarán WiFi o datos móviles.',
    tags: ['offline', 'internet', 'sin conexión', 'wifi', 'datos'],
    url: '/help#manual-sin-internet',
    category: 'Huéspedes'
  },
  {
    id: 'hu-10',
    type: 'faq',
    title: '¿En qué idioma ven los huéspedes el manual?',
    description: 'Idioma automático',
    content: 'El manual detecta el idioma del navegador del huésped. Si está en inglés y tienes traducción, lo verá en inglés. Si no hay traducción, verá español por defecto. También pueden cambiar idioma manualmente.',
    tags: ['idioma', 'huésped', 'automático', 'navegador', 'traducción'],
    url: '/help#idioma-huesped',
    category: 'Huéspedes'
  },
  {
    id: 'hu-11',
    type: 'faq',
    title: '¿Los huéspedes pueden guardar el manual para verlo después?',
    description: 'Guardar manual',
    content: 'Sí, pueden añadir la página a favoritos en su navegador o guardar el enlace. No hay opción de descarga offline, pero el enlace siempre funciona mientras esté activa la propiedad.',
    tags: ['guardar', 'favoritos', 'después', 'enlace', 'acceder'],
    url: '/help#guardar-manual',
    category: 'Huéspedes'
  },
  {
    id: 'hu-12',
    type: 'faq',
    title: '¿Puedo saber si un huésped específico ha visto el manual?',
    description: 'Tracking individual',
    content: 'No, las analíticas son anónimas. Ves números totales pero no puedes identificar qué huésped específico visitó el manual. Esto protege la privacidad de los usuarios.',
    tags: ['específico', 'huésped', 'tracking', 'identificar', 'privacidad'],
    url: '/help#tracking-individual',
    category: 'Huéspedes'
  },
  {
    id: 'hu-13',
    type: 'faq',
    title: '¿Cómo respondo cuando un huésped pregunta algo del manual?',
    description: 'Responder con manual',
    content: 'Responde amablemente con el enlace directo a la zona: "¡Claro! Aquí tienes toda la info: [enlace]". Esto resuelve su duda y les enseña a consultar el manual para futuras preguntas.',
    tags: ['responder', 'pregunta', 'enlace', 'huésped', 'manual'],
    url: '/help#responder-huesped',
    category: 'Huéspedes'
  },
  {
    id: 'hu-14',
    type: 'faq',
    title: '¿Qué hacer si el huésped dice que la información está mal?',
    description: 'Información incorrecta',
    content: 'Agradece el feedback y verifica. Si tiene razón, actualiza el manual inmediatamente. Si es un malentendido, explícale claramente. Usa esto como oportunidad para mejorar.',
    tags: ['error', 'incorrecto', 'feedback', 'actualizar', 'corregir'],
    url: '/help#info-incorrecta',
    category: 'Huéspedes'
  },
  {
    id: 'hu-15',
    type: 'faq',
    title: '¿Los huéspedes pueden compartir el manual con otros?',
    description: 'Compartir entre huéspedes',
    content: 'Sí, el enlace es público y pueden compartirlo con sus acompañantes. De hecho, es recomendable que todos los miembros del grupo tengan acceso para consultar cuando lo necesiten.',
    tags: ['compartir', 'otros', 'grupo', 'acompañantes', 'enlace'],
    url: '/help#compartir-otros',
    category: 'Huéspedes'
  },
  {
    id: 'hu-16',
    type: 'faq',
    title: '¿Los huéspedes pueden imprimir el manual?',
    description: 'Imprimir manual',
    content: 'Pueden usar la función de imprimir del navegador, aunque no está optimizado para ello. El manual está diseñado para uso digital. Si necesitan algo impreso, ofréceles instrucciones básicas en papel.',
    tags: ['imprimir', 'papel', 'huésped', 'descargar', 'offline'],
    url: '/help#imprimir-manual',
    category: 'Huéspedes'
  },
  {
    id: 'hu-17',
    type: 'faq',
    title: '¿Cómo sé si el huésped ha leído el manual antes de llegar?',
    description: 'Verificar lectura',
    content: 'No puedes verificar individualmente, pero las analíticas te muestran visitas en el período. Si ves visitas antes del check-in, es probable que sea tu próximo huésped revisando info.',
    tags: ['leído', 'verificar', 'antes', 'llegar', 'confirmar'],
    url: '/help#verificar-lectura',
    category: 'Huéspedes'
  },
  {
    id: 'hu-18',
    type: 'faq',
    title: '¿Qué hacer si el huésped no consulta el manual y pregunta todo?',
    description: 'Huésped no usa manual',
    content: 'Responde amablemente enviando el link específico: "Te envío el enlace donde está todo explicado". Algunos huéspedes prefieren preguntar. El manual reduce estas preguntas pero no las elimina al 100%.',
    tags: ['no usa', 'pregunta', 'todo', 'huésped', 'educar'],
    url: '/help#huesped-no-usa',
    category: 'Huéspedes'
  },
  {
    id: 'hu-19',
    type: 'faq',
    title: '¿Los huéspedes pueden sugerir mejoras al manual?',
    description: 'Sugerencias huéspedes',
    content: 'El sistema de valoraciones permite comentarios donde pueden sugerir mejoras. También pueden contactarte directamente. Anima a dar feedback: "Si echas algo en falta, cuéntamelo".',
    tags: ['sugerencias', 'mejoras', 'feedback', 'huésped', 'ideas'],
    url: '/help#sugerencias-huespedes',
    category: 'Huéspedes'
  },
  {
    id: 'hu-20',
    type: 'faq',
    title: '¿Puedo personalizar el mensaje que ven los huéspedes?',
    description: 'Mensaje personalizado',
    content: 'Sí, la descripción de bienvenida y el contenido de cada zona son totalmente personalizables. Usa un tono amigable y acogedor que refleje tu estilo como anfitrión.',
    tags: ['personalizar', 'mensaje', 'bienvenida', 'tono', 'estilo'],
    url: '/help#mensaje-personalizado',
    category: 'Huéspedes'
  },
  {
    id: 'hu-21',
    type: 'faq',
    title: '¿Los huéspedes anteriores pueden seguir accediendo al manual?',
    description: 'Acceso post-estancia',
    content: 'Sí, el enlace sigue funcionando después de que termina la estancia. Esto no suele ser un problema porque el manual solo tiene info de la propiedad, nada sensible.',
    tags: ['anterior', 'acceso', 'después', 'estancia', 'enlace'],
    url: '/help#acceso-posterior',
    category: 'Huéspedes'
  },
  {
    id: 'hu-22',
    type: 'faq',
    title: '¿El manual tiene publicidad que verán los huéspedes?',
    description: 'Sin publicidad',
    content: 'No, el manual de Itineramio no tiene publicidad. Los huéspedes ven solo tu contenido, sin anuncios ni distracciones. La experiencia es limpia y profesional.',
    tags: ['publicidad', 'anuncios', 'ads', 'sin', 'limpio'],
    url: '/help#sin-publicidad',
    category: 'Huéspedes'
  },
  {
    id: 'hu-23',
    type: 'faq',
    title: '¿Los huéspedes ven el nombre de Itineramio o solo mi marca?',
    description: 'Branding visible',
    content: 'Ven tu nombre de propiedad y logo si lo has configurado. Hay un pequeño "Powered by Itineramio" pero es discreto. El foco está en tu contenido y marca.',
    tags: ['marca', 'branding', 'itineramio', 'logo', 'visible'],
    url: '/help#branding-huesped',
    category: 'Huéspedes'
  },
  {
    id: 'hu-24',
    type: 'faq',
    title: '¿Cómo hago que el manual sea más atractivo para los huéspedes?',
    description: 'Manual atractivo',
    content: 'Tips: 1) Usa fotos de calidad, 2) Escribe de forma clara y amigable, 3) Organiza bien las zonas, 4) Añade info útil del barrio, 5) Personaliza colores y logo. Un manual cuidado da buena impresión.',
    tags: ['atractivo', 'mejorar', 'diseño', 'calidad', 'profesional'],
    url: '/help#manual-atractivo',
    category: 'Huéspedes'
  },
  {
    id: 'hu-25',
    type: 'faq',
    title: '¿Los huéspedes pueden contactar a Itineramio directamente?',
    description: 'Contacto con Itineramio',
    content: 'El botón de contacto del manual lleva a TU WhatsApp, no a Itineramio. Los huéspedes solo interactúan contigo. Si tienen problemas técnicos graves, tú puedes contactar soporte en su nombre.',
    tags: ['contactar', 'itineramio', 'soporte', 'huésped', 'directo'],
    url: '/help#contacto-itineramio',
    category: 'Huéspedes'
  },
  {
    id: 'hu-26',
    type: 'faq',
    title: '¿Qué datos recopila el manual de los huéspedes?',
    description: 'Datos recopilados',
    content: 'Se recopilan datos anónimos de uso: visitas, tiempo, zonas consultadas, dispositivo. No se recopilan datos personales identificables. Las analíticas son agregadas para proteger la privacidad.',
    tags: ['datos', 'privacidad', 'recopilar', 'información', 'huésped'],
    url: '/help#datos-recopilados',
    category: 'Huéspedes'
  },
  {
    id: 'hu-27',
    type: 'faq',
    title: '¿Puedo enviar notificaciones a los huéspedes?',
    description: 'Notificaciones push',
    content: 'Actualmente no hay sistema de notificaciones push a huéspedes. La comunicación es a través del enlace del manual y tu WhatsApp. Para avisos urgentes, contacta directamente.',
    tags: ['notificaciones', 'push', 'avisar', 'huésped', 'mensaje'],
    url: '/help#notificaciones-huespedes',
    category: 'Huéspedes'
  },
  {
    id: 'hu-28',
    type: 'faq',
    title: '¿Cómo se ve el manual en el móvil del huésped?',
    description: 'Vista móvil',
    content: 'Se ve como una web app limpia y rápida. Menú de zonas arriba o lateral, contenido scrolleable, fotos grandes, botón de WhatsApp visible. Está optimizado para usarse con el pulgar.',
    tags: ['móvil', 'vista', 'diseño', 'app', 'pantalla'],
    url: '/help#vista-movil',
    category: 'Huéspedes'
  },
  {
    id: 'hu-29',
    type: 'faq',
    title: '¿Los videos se reproducen bien en el móvil del huésped?',
    description: 'Reproducción videos',
    content: 'Sí, los videos están optimizados para reproducirse en móvil. Se cargan de forma progresiva para no gastar muchos datos. Funcionan en todos los navegadores modernos.',
    tags: ['videos', 'reproducir', 'móvil', 'cargar', 'ver'],
    url: '/help#videos-movil',
    category: 'Huéspedes'
  },
  {
    id: 'hu-30',
    type: 'faq',
    title: '¿Cómo navegan los huéspedes por las zonas?',
    description: 'Navegación zonas',
    content: 'Hay un menú con todas las zonas (normalmente arriba o en lateral). Los huéspedes hacen clic en la zona que les interesa y ven el contenido. Pueden volver al menú o pasar a la siguiente.',
    tags: ['navegar', 'zonas', 'menú', 'cómo', 'mover'],
    url: '/help#navegacion-zonas',
    category: 'Huéspedes'
  },
  {
    id: 'hu-31',
    type: 'faq',
    title: '¿Los huéspedes pueden buscar dentro del manual?',
    description: 'Búsqueda en manual',
    content: 'Pueden usar la función de búsqueda del navegador (Ctrl+F o buscar en página). El manual no tiene buscador propio, pero con un buen menú de zonas, encuentran lo que necesitan rápido.',
    tags: ['buscar', 'búsqueda', 'encontrar', 'manual', 'zonas'],
    url: '/help#busqueda-manual',
    category: 'Huéspedes'
  },
  {
    id: 'hu-32',
    type: 'faq',
    title: '¿Cómo saben los huéspedes que tienen que leer el manual?',
    description: 'Informar del manual',
    content: 'Tú les informas: 1) En el mensaje de confirmación, 2) En las instrucciones de llegada, 3) En el mensaje pre check-in. Destaca que "toda la info está en el manual digital".',
    tags: ['informar', 'avisar', 'huésped', 'manual', 'comunicar'],
    url: '/help#informar-manual',
    category: 'Huéspedes'
  },
  {
    id: 'hu-33',
    type: 'faq',
    title: '¿El manual carga rápido en conexiones lentas?',
    description: 'Velocidad de carga',
    content: 'El manual está optimizado para cargar rápido. Las imágenes se comprimen automáticamente. En conexiones muy lentas (2G) puede tardar más, pero está diseñado para funcionar en condiciones no ideales.',
    tags: ['rápido', 'cargar', 'velocidad', 'lento', 'conexión'],
    url: '/help#velocidad-carga',
    category: 'Huéspedes'
  },
  {
    id: 'hu-34',
    type: 'faq',
    title: '¿Puedo crear un manual diferente para huéspedes VIP?',
    description: 'Manual VIP',
    content: 'Actualmente cada propiedad tiene un manual. Si quieres contenido diferente para VIP, puedes crear zonas extra o una propiedad separada con contenido premium. Envía el enlace apropiado.',
    tags: ['vip', 'diferente', 'especial', 'premium', 'exclusivo'],
    url: '/help#manual-vip',
    category: 'Huéspedes'
  },
  {
    id: 'hu-35',
    type: 'faq',
    title: '¿Qué hacer si un huésped reporta un bug en el manual?',
    description: 'Reportar problemas',
    content: 'Pide detalles: qué error ven, qué dispositivo usan, captura de pantalla si es posible. Prueba tú mismo el manual. Si confirmas el problema, contacta soporte de Itineramio con la información.',
    tags: ['bug', 'error', 'problema', 'reportar', 'soporte'],
    url: '/help#reportar-bug',
    category: 'Huéspedes'
  },

  // ============================================
  // SECCIÓN 13: CUENTA Y SUSCRIPCIÓN (30 preguntas)
  // ============================================

  {
    id: 'cu-1',
    type: 'faq',
    title: '¿Cómo creo una cuenta en Itineramio?',
    description: 'Crear cuenta',
    content: 'Ve a itineramio.com y haz clic en "Registrarse". Introduce tu email, crea una contraseña, y confirma tu cuenta a través del email que recibirás. El proceso toma menos de 2 minutos.',
    tags: ['crear', 'cuenta', 'registrar', 'nueva', 'empezar'],
    url: '/help#crear-cuenta',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-2',
    type: 'faq',
    title: '¿Itineramio es gratis?',
    description: 'Precio y planes',
    content: 'Hay un período de prueba de 15 días para probar todas las funciones. Después, hay planes de pago según el número de propiedades y funciones que necesites. Revisa la página de precios para detalles.',
    tags: ['gratis', 'precio', 'coste', 'prueba', 'pago'],
    url: '/help#es-gratis',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-3',
    type: 'faq',
    title: '¿Cuánto dura la prueba gratis?',
    description: 'Período de prueba',
    content: 'La prueba dura 15 días desde que creas la cuenta. Durante este tiempo tienes acceso a todas las funciones sin restricciones. No se requiere tarjeta para empezar la prueba.',
    tags: ['prueba', 'días', 'duración', 'trial', 'gratuito'],
    url: '/help#duracion-prueba',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-4',
    type: 'faq',
    title: '¿Qué pasa cuando termina la prueba gratis?',
    description: 'Fin de prueba',
    content: 'Al terminar los 15 días, tus manuales se desactivan hasta que elijas un plan de pago. Tu contenido se guarda y se reactiva al suscribirte. No se borra nada automáticamente.',
    tags: ['termina', 'prueba', 'después', 'desactiva', 'guardar'],
    url: '/help#fin-prueba',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-5',
    type: 'faq',
    title: '¿Qué planes hay disponibles?',
    description: 'Planes disponibles',
    content: 'Hay varios planes según tus necesidades: básico para 1 propiedad, host para varias propiedades, y business para gestores profesionales. Cada plan incluye diferentes funciones y límites.',
    tags: ['planes', 'disponibles', 'opciones', 'cuáles', 'elegir'],
    url: '/help#planes-disponibles',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-6',
    type: 'faq',
    title: '¿Cómo cambio mi plan de suscripción?',
    description: 'Cambiar plan',
    content: 'Ve a Configuración > Suscripción > Cambiar plan. Puedes subir de plan en cualquier momento (se prorratea). Para bajar de plan, el cambio aplica al siguiente ciclo de facturación.',
    tags: ['cambiar', 'plan', 'upgrade', 'modificar', 'suscripción'],
    url: '/help#cambiar-plan',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-7',
    type: 'faq',
    title: '¿Cómo cancelo mi suscripción?',
    description: 'Cancelar suscripción',
    content: 'Ve a Configuración > Suscripción > Cancelar. Tu acceso continúa hasta el final del período pagado. Después, tus manuales se desactivan pero el contenido se guarda por si vuelves.',
    tags: ['cancelar', 'suscripción', 'baja', 'anular', 'parar'],
    url: '/help#cancelar-suscripcion',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-8',
    type: 'faq',
    title: '¿Qué formas de pago aceptan?',
    description: 'Métodos de pago',
    content: 'Aceptamos tarjeta de crédito/débito (Visa, Mastercard), transferencia bancaria, y Bizum. El pago es seguro y procesado a través de plataformas certificadas.',
    tags: ['pago', 'tarjeta', 'transferencia', 'bizum', 'métodos'],
    url: '/help#metodos-pago',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-9',
    type: 'faq',
    title: '¿Puedo pagar anualmente para ahorrar?',
    description: 'Pago anual',
    content: 'Sí, el pago anual tiene descuento respecto al mensual (normalmente 2 meses gratis). Si planeas usar Itineramio a largo plazo, el plan anual es más económico.',
    tags: ['anual', 'descuento', 'ahorrar', 'año', 'precio'],
    url: '/help#pago-anual',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-10',
    type: 'faq',
    title: '¿Cómo recupero mi contraseña?',
    description: 'Olvidé contraseña',
    content: 'En la página de login, haz clic en "Olvidé mi contraseña". Introduce tu email y recibirás un enlace para crear una nueva contraseña. El enlace es válido por tiempo limitado.',
    tags: ['contraseña', 'olvidé', 'recuperar', 'restablecer', 'password'],
    url: '/help#recuperar-contrasena',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-11',
    type: 'faq',
    title: '¿Cómo cambio mi email de la cuenta?',
    description: 'Cambiar email',
    content: 'Ve a Configuración > Cuenta > Email. Introduce el nuevo email y confirma el cambio. Recibirás un email de verificación en la nueva dirección que debes confirmar.',
    tags: ['email', 'cambiar', 'correo', 'cuenta', 'modificar'],
    url: '/help#cambiar-email',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-12',
    type: 'faq',
    title: '¿Puedo tener varios usuarios en una cuenta?',
    description: 'Múltiples usuarios',
    content: 'Sí, algunos planes permiten invitar colaboradores con su propio login. Puedes asignar permisos: solo ver, editar, o administrar. Ideal para equipos o gestores con personal.',
    tags: ['usuarios', 'varios', 'colaboradores', 'equipo', 'compartir'],
    url: '/help#varios-usuarios',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-13',
    type: 'faq',
    title: '¿Dónde veo mis facturas?',
    description: 'Ver facturas',
    content: 'Ve a Configuración > Facturación. Allí están todas tus facturas disponibles para descargar en PDF. También se envían automáticamente por email después de cada pago.',
    tags: ['facturas', 'ver', 'descargar', 'pdf', 'facturación'],
    url: '/help#ver-facturas',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-14',
    type: 'faq',
    title: '¿Cómo actualizo mis datos de facturación?',
    description: 'Datos facturación',
    content: 'Ve a Configuración > Facturación > Datos. Actualiza nombre/empresa, NIF/CIF, dirección fiscal. Los cambios aplican a las próximas facturas.',
    tags: ['facturación', 'datos', 'actualizar', 'nif', 'empresa'],
    url: '/help#datos-facturacion',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-15',
    type: 'faq',
    title: '¿Cómo elimino mi cuenta?',
    description: 'Eliminar cuenta',
    content: 'Contacta con soporte para solicitar la eliminación de tu cuenta. Se borrarán todos tus datos y propiedades permanentemente. Asegúrate de descargar cualquier contenido que quieras conservar antes.',
    tags: ['eliminar', 'cuenta', 'borrar', 'permanente', 'cerrar'],
    url: '/help#eliminar-cuenta',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-16',
    type: 'faq',
    title: '¿Puedo pausar mi suscripción temporalmente?',
    description: 'Pausar suscripción',
    content: 'Puedes cancelar y reactivar cuando quieras. Tu contenido se guarda aunque los manuales se desactiven. Contacta soporte si necesitas una pausa temporal sin perder nada.',
    tags: ['pausar', 'temporal', 'suspender', 'suscripción', 'vacaciones'],
    url: '/help#pausar-suscripcion',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-17',
    type: 'faq',
    title: '¿Qué pasa con mis datos si no renuevo?',
    description: 'Datos sin renovar',
    content: 'Si no renuevas, tus manuales se desactivan pero los datos se guardan durante un período (normalmente 90 días). Si vuelves después, tu contenido estará ahí esperándote.',
    tags: ['datos', 'renovar', 'guardar', 'contenido', 'perder'],
    url: '/help#datos-sin-renovar',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-18',
    type: 'faq',
    title: '¿Hay descuentos para muchas propiedades?',
    description: 'Descuentos volumen',
    content: 'Los planes para más propiedades tienen mejor precio por propiedad. Para gestores con muchas propiedades (20+), contacta con ventas para planes personalizados.',
    tags: ['descuento', 'volumen', 'muchas', 'propiedades', 'precio'],
    url: '/help#descuento-volumen',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-19',
    type: 'faq',
    title: '¿El precio incluye IVA?',
    description: 'IVA incluido',
    content: 'Los precios mostrados pueden incluir o excluir IVA según tu país. En el proceso de pago verás el desglose completo antes de confirmar, incluyendo impuestos aplicables.',
    tags: ['iva', 'impuestos', 'precio', 'incluido', 'total'],
    url: '/help#iva-incluido',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-20',
    type: 'faq',
    title: '¿Qué incluye cada plan?',
    description: 'Funciones por plan',
    content: 'Cada plan incluye diferente número de propiedades, zonas por propiedad, almacenamiento de medios, y funciones como analíticas avanzadas, personalización, o multiusuario. Revisa la comparativa en la web.',
    tags: ['incluye', 'plan', 'funciones', 'features', 'diferencias'],
    url: '/help#funciones-plan',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-21',
    type: 'faq',
    title: '¿Cómo contacto con soporte de facturación?',
    description: 'Soporte facturación',
    content: 'Para temas de facturación, escribe a facturacion@itineramio.com o usa el chat indicando que es tema de pago. Incluye tu email de cuenta y número de factura si aplica.',
    tags: ['soporte', 'facturación', 'contacto', 'ayuda', 'pago'],
    url: '/help#soporte-facturacion',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-22',
    type: 'faq',
    title: '¿Puedo cambiar de pago mensual a anual?',
    description: 'Cambiar periodicidad',
    content: 'Sí, contacta con soporte para cambiar de mensual a anual. El cambio aplica al próximo ciclo y te beneficias del descuento anual desde ese momento.',
    tags: ['mensual', 'anual', 'cambiar', 'periodicidad', 'pago'],
    url: '/help#cambiar-periodicidad',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-23',
    type: 'faq',
    title: '¿Qué pasa si falla el pago de mi tarjeta?',
    description: 'Fallo de pago',
    content: 'Si falla un pago, se reintenta automáticamente y recibes un email de aviso. Tienes algunos días de gracia para actualizar tu método de pago antes de que se desactive el servicio.',
    tags: ['fallo', 'pago', 'tarjeta', 'rechazado', 'gracia'],
    url: '/help#fallo-pago',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-24',
    type: 'faq',
    title: '¿Puedo solicitar un reembolso?',
    description: 'Política de reembolso',
    content: 'Hay una política de satisfacción. Si no estás contento en los primeros días tras pagar, contacta soporte para evaluar tu caso. Revisa las condiciones específicas en los términos de servicio.',
    tags: ['reembolso', 'devolución', 'dinero', 'cancelar', 'satisfacción'],
    url: '/help#reembolso',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-25',
    type: 'faq',
    title: '¿Cómo actualizo mi tarjeta de pago?',
    description: 'Actualizar tarjeta',
    content: 'Ve a Configuración > Facturación > Método de pago. Añade la nueva tarjeta y elimina la antigua. El próximo pago se cargará a la nueva tarjeta automáticamente.',
    tags: ['tarjeta', 'actualizar', 'pago', 'nueva', 'cambiar'],
    url: '/help#actualizar-tarjeta',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-26',
    type: 'faq',
    title: '¿Hay plan gratuito permanente?',
    description: 'Plan gratis',
    content: 'Actualmente no hay plan gratuito permanente, solo la prueba de 15 días. Los planes de pago empiezan desde precios accesibles para hacer el servicio asequible para todos los anfitriones.',
    tags: ['gratis', 'permanente', 'free', 'plan', 'básico'],
    url: '/help#plan-gratis',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-27',
    type: 'faq',
    title: '¿Mis datos están seguros?',
    description: 'Seguridad datos',
    content: 'Sí, usamos cifrado SSL, servidores seguros, y cumplimos con GDPR. Tus datos y los de tus huéspedes están protegidos. No vendemos datos a terceros.',
    tags: ['seguridad', 'datos', 'privacidad', 'protección', 'gdpr'],
    url: '/help#seguridad-datos',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-28',
    type: 'faq',
    title: '¿Puedo transferir mi cuenta a otra persona?',
    description: 'Transferir cuenta',
    content: 'Contacta con soporte para transferir la titularidad de una cuenta. Se verificará la identidad de ambas partes antes de proceder. Las suscripciones activas se mantienen.',
    tags: ['transferir', 'cuenta', 'otra persona', 'cambiar', 'titular'],
    url: '/help#transferir-cuenta',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-29',
    type: 'faq',
    title: '¿Hay programa de afiliados o referidos?',
    description: 'Programa referidos',
    content: 'Sí, hay programa de referidos. Cuando alguien se suscribe usando tu enlace, ambos recibís beneficios (descuento o crédito). Busca "Referidos" en tu panel de cuenta.',
    tags: ['referidos', 'afiliados', 'recomendar', 'descuento', 'invitar'],
    url: '/help#programa-referidos',
    category: 'Cuenta y Suscripción'
  },
  {
    id: 'cu-30',
    type: 'faq',
    title: '¿Recibiré emails de marketing de Itineramio?',
    description: 'Emails marketing',
    content: 'Recibirás emails importantes sobre tu cuenta y producto. Puedes gestionar las preferencias de comunicación en Configuración > Notificaciones para controlar qué tipo de emails recibes.',
    tags: ['emails', 'marketing', 'notificaciones', 'comunicación', 'preferencias'],
    url: '/help#emails-marketing',
    category: 'Cuenta y Suscripción'
  },

  // ============================================
  // SECCIÓN 14: SOLUCIÓN DE PROBLEMAS (40 preguntas)
  // ============================================

  {
    id: 'sp-1',
    type: 'faq',
    title: '¿Por qué no puedo iniciar sesión?',
    description: 'Problema de login',
    content: 'Verifica: 1) El email es correcto, 2) La contraseña es la correcta (usa "Olvidé contraseña" si dudas), 3) La cuenta está verificada (revisa tu email). Si persiste, contacta soporte.',
    tags: ['login', 'sesión', 'entrar', 'no puedo', 'problema'],
    url: '/help#problema-login',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-2',
    type: 'faq',
    title: '¿Por qué mi manual no se ve?',
    description: 'Manual no visible',
    content: 'Posibles causas: 1) La propiedad está desactivada, 2) El enlace es incorrecto, 3) La prueba terminó y no hay plan activo. Verifica el estado en tu panel y que el enlace sea correcto.',
    tags: ['manual', 'no se ve', 'invisible', 'error', 'problema'],
    url: '/help#manual-no-visible',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-3',
    type: 'faq',
    title: '¿Por qué los cambios no se guardan?',
    description: 'Cambios no guardados',
    content: 'Asegúrate de hacer clic en "Guardar" después de editar. Verifica tu conexión a internet. Si el problema persiste, prueba en otro navegador o limpia la caché. Contacta soporte si continúa.',
    tags: ['guardar', 'cambios', 'no guarda', 'perder', 'problema'],
    url: '/help#cambios-no-guardan',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-4',
    type: 'faq',
    title: '¿Por qué las fotos no se suben?',
    description: 'Error subida fotos',
    content: 'Verifica: 1) El archivo no supera el límite de tamaño (normalmente 5-10MB), 2) Es formato soportado (JPG, PNG), 3) Tu conexión es estable. Prueba con una imagen más pequeña.',
    tags: ['fotos', 'subir', 'error', 'no sube', 'imagen'],
    url: '/help#fotos-no-suben',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-5',
    type: 'faq',
    title: '¿Por qué el video no se reproduce?',
    description: 'Video no reproduce',
    content: 'Verifica: 1) El formato es soportado (MP4 recomendado), 2) El archivo no es muy grande, 3) El huésped tiene buena conexión. Prueba reproducirlo tú desde otro dispositivo.',
    tags: ['video', 'reproducir', 'error', 'no carga', 'problema'],
    url: '/help#video-no-reproduce',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-6',
    type: 'faq',
    title: '¿Por qué el QR no funciona al escanearlo?',
    description: 'QR no escanea',
    content: 'Verifica: 1) El QR es lo suficientemente grande, 2) No está dañado o borroso, 3) Hay buena iluminación. Prueba escanearlo tú mismo. Si no funciona, descárgalo de nuevo.',
    tags: ['qr', 'escanear', 'no funciona', 'error', 'problema'],
    url: '/help#qr-no-funciona',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-7',
    type: 'faq',
    title: '¿Por qué el botón de WhatsApp no funciona?',
    description: 'WhatsApp no abre',
    content: 'Verifica: 1) El número tiene formato correcto (+34612345678), 2) El campo no está vacío. Si el huésped no tiene WhatsApp instalado, no funcionará en su dispositivo.',
    tags: ['whatsapp', 'botón', 'no funciona', 'error', 'problema'],
    url: '/help#whatsapp-no-funciona',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-8',
    type: 'faq',
    title: '¿Por qué la página carga muy lento?',
    description: 'Carga lenta',
    content: 'Posibles causas: 1) Muchas imágenes pesadas, 2) Conexión lenta del usuario, 3) Problema temporal del servidor. Optimiza tus imágenes y reduce el número si es necesario.',
    tags: ['lento', 'carga', 'velocidad', 'tarda', 'problema'],
    url: '/help#carga-lenta',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-9',
    type: 'faq',
    title: '¿Por qué no recibo emails de Itineramio?',
    description: 'No recibe emails',
    content: 'Revisa tu carpeta de spam/correo no deseado. Añade nuestro email a tus contactos. Verifica que el email de tu cuenta sea correcto. Si persiste, contacta soporte.',
    tags: ['email', 'no recibo', 'spam', 'correo', 'problema'],
    url: '/help#no-recibe-emails',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-10',
    type: 'faq',
    title: '¿Por qué no puedo crear más propiedades?',
    description: 'Límite propiedades',
    content: 'Has alcanzado el límite de propiedades de tu plan. Para crear más, necesitas: 1) Eliminar una propiedad existente, o 2) Actualizar a un plan superior con más propiedades.',
    tags: ['propiedades', 'límite', 'crear', 'no puedo', 'plan'],
    url: '/help#limite-propiedades',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-11',
    type: 'faq',
    title: '¿Por qué no puedo añadir más zonas?',
    description: 'Límite zonas',
    content: 'Algunos planes tienen límite de zonas por propiedad. Revisa tu plan actual. Puedes: 1) Consolidar zonas existentes, 2) Actualizar tu plan para más zonas.',
    tags: ['zonas', 'límite', 'añadir', 'no puedo', 'máximo'],
    url: '/help#limite-zonas',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-12',
    type: 'faq',
    title: '¿Por qué veo un error 404?',
    description: 'Error 404',
    content: 'La página no existe. Posibles causas: 1) Enlace incorrecto, 2) La propiedad fue eliminada, 3) Error al escribir la URL. Verifica el enlace o accede desde tu panel de control.',
    tags: ['404', 'error', 'página', 'no existe', 'enlace'],
    url: '/help#error-404',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-13',
    type: 'faq',
    title: '¿Por qué veo un error 500?',
    description: 'Error 500',
    content: 'Es un error del servidor, normalmente temporal. Espera unos minutos y vuelve a intentarlo. Si persiste más de 30 minutos, contacta soporte indicando qué estabas haciendo.',
    tags: ['500', 'error', 'servidor', 'interno', 'problema'],
    url: '/help#error-500',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-14',
    type: 'faq',
    title: '¿Por qué la traducción no aparece?',
    description: 'Traducción no visible',
    content: 'Verifica: 1) Guardaste la traducción correctamente, 2) Estás viendo el manual en el idioma correcto (cambia con el selector). Si el campo de traducción está vacío, muestra español.',
    tags: ['traducción', 'no aparece', 'idioma', 'problema', 'ver'],
    url: '/help#traduccion-no-aparece',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-15',
    type: 'faq',
    title: '¿Por qué eliminé algo y sigue apareciendo?',
    description: 'Contenido no se elimina',
    content: 'Puede ser caché del navegador. Solución: 1) Refresca la página (Ctrl+F5), 2) Limpia la caché del navegador, 3) Prueba en modo incógnito. Si persiste, contacta soporte.',
    tags: ['eliminar', 'aparece', 'caché', 'borrar', 'problema'],
    url: '/help#contenido-no-elimina',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-16',
    type: 'faq',
    title: '¿Cómo limpio la caché del navegador?',
    description: 'Limpiar caché',
    content: 'En Chrome: Ctrl+Shift+Delete > Selecciona "Imágenes y archivos en caché" > Borrar datos. En Safari: Preferencias > Privacidad > Gestionar datos de sitios web. Esto soluciona muchos problemas de visualización.',
    tags: ['caché', 'limpiar', 'navegador', 'borrar', 'chrome'],
    url: '/help#limpiar-cache',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-17',
    type: 'faq',
    title: '¿Por qué las analíticas muestran cero?',
    description: 'Analíticas en cero',
    content: 'Si tu manual es nuevo o no se ha visitado, las analíticas estarán en cero. Si debería haber visitas, espera unas horas (puede haber retraso) o contacta soporte si persiste.',
    tags: ['analíticas', 'cero', 'estadísticas', 'vacío', 'problema'],
    url: '/help#analiticas-cero',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-18',
    type: 'faq',
    title: '¿Qué hago si el panel de control no carga?',
    description: 'Panel no carga',
    content: 'Prueba: 1) Refrescar la página, 2) Cerrar sesión y volver a entrar, 3) Limpiar caché, 4) Probar otro navegador. Si nada funciona, puede haber mantenimiento - espera o contacta soporte.',
    tags: ['panel', 'dashboard', 'no carga', 'problema', 'vacío'],
    url: '/help#panel-no-carga',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-19',
    type: 'faq',
    title: '¿Por qué no se envía el email de verificación?',
    description: 'Email verificación',
    content: 'El email puede tardar unos minutos. Revisa spam. Verifica que el email sea correcto. Usa "Reenviar email" si está disponible. Si no llega en 30 min, contacta soporte.',
    tags: ['verificación', 'email', 'no llega', 'confirmar', 'problema'],
    url: '/help#email-verificacion',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-20',
    type: 'faq',
    title: '¿Por qué no puedo editar una zona?',
    description: 'No puedo editar',
    content: 'Verifica: 1) Tu sesión no ha expirado (refresca o re-loguea), 2) Tienes permisos si eres colaborador, 3) No hay error de conexión. Si persiste, intenta desde otro navegador.',
    tags: ['editar', 'no puedo', 'zona', 'problema', 'bloqueo'],
    url: '/help#no-puedo-editar',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-21',
    type: 'faq',
    title: '¿Cómo reporto un bug?',
    description: 'Reportar error',
    content: 'Para reportar un bug: 1) Describe qué intentabas hacer, 2) Qué error viste (captura de pantalla ayuda), 3) Qué navegador y dispositivo usas. Envía a soporte con todos los detalles.',
    tags: ['bug', 'reportar', 'error', 'problema', 'soporte'],
    url: '/help#reportar-bug',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-22',
    type: 'faq',
    title: '¿Por qué mi sesión se cierra sola?',
    description: 'Sesión expira',
    content: 'Por seguridad, las sesiones expiran después de cierto tiempo de inactividad. Si se cierra muy rápido, verifica que no tengas problemas de conexión o cookies bloqueadas.',
    tags: ['sesión', 'cerrar', 'expira', 'automático', 'logout'],
    url: '/help#sesion-expira',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-23',
    type: 'faq',
    title: '¿Por qué no funciona en mi navegador?',
    description: 'Navegador incompatible',
    content: 'Itineramio funciona mejor en Chrome, Safari, Firefox, o Edge actualizados. Navegadores muy antiguos pueden tener problemas. Actualiza tu navegador o prueba con otro.',
    tags: ['navegador', 'compatible', 'chrome', 'safari', 'problema'],
    url: '/help#navegador-incompatible',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-24',
    type: 'faq',
    title: '¿Hay problemas conocidos actualmente?',
    description: 'Estado del servicio',
    content: 'Si experimentas problemas, revisa nuestras redes sociales o página de estado para ver si hay incidencias conocidas. Los problemas generales se comunican y se solucionan lo antes posible.',
    tags: ['estado', 'servicio', 'problemas', 'conocidos', 'incidencia'],
    url: '/help#estado-servicio',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-25',
    type: 'faq',
    title: '¿Por qué el arrastrar y soltar no funciona?',
    description: 'Drag and drop',
    content: 'En dispositivos táctiles, el arrastrar puede funcionar diferente. Mantén pulsado el elemento. En ordenador, asegúrate de hacer clic y arrastrar sin soltar. Algunos navegadores antiguos tienen limitaciones.',
    tags: ['arrastrar', 'soltar', 'ordenar', 'no funciona', 'problema'],
    url: '/help#drag-drop',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-26',
    type: 'faq',
    title: '¿Por qué no veo todos los botones/opciones?',
    description: 'Opciones no visibles',
    content: 'Puede ser: 1) Tu pantalla es pequeña (haz scroll o gira el dispositivo), 2) Tu plan no incluye esa función, 3) Bug de visualización (prueba refrescar). Contacta soporte si falta algo que deberías ver.',
    tags: ['opciones', 'botones', 'no veo', 'faltan', 'problema'],
    url: '/help#opciones-no-visibles',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-27',
    type: 'faq',
    title: '¿Por qué el texto se ve mal o cortado?',
    description: 'Texto mal formateado',
    content: 'Posibles causas: 1) Copiaste texto con formato de otro lugar (pega sin formato), 2) Bug de visualización (refresca), 3) Pantalla muy pequeña. Edita el texto para corregirlo.',
    tags: ['texto', 'formato', 'cortado', 'visualización', 'problema'],
    url: '/help#texto-mal-formato',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-28',
    type: 'faq',
    title: '¿Perdí trabajo sin guardar, puedo recuperarlo?',
    description: 'Recuperar trabajo',
    content: 'Lamentablemente, si no guardaste, el trabajo se pierde. Algunos navegadores tienen recuperación automática, pero no es fiable. Consejo: guarda frecuentemente mientras editas.',
    tags: ['perdí', 'recuperar', 'guardar', 'trabajo', 'deshacer'],
    url: '/help#recuperar-trabajo',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-29',
    type: 'faq',
    title: '¿Por qué el color del manual no coincide con lo que elegí?',
    description: 'Color incorrecto',
    content: 'Verifica que guardaste después de elegir el color. Si usaste código HEX, asegúrate de que sea válido. Limpia caché y refresca para ver los cambios actuales.',
    tags: ['color', 'incorrecto', 'diferente', 'problema', 'no coincide'],
    url: '/help#color-incorrecto',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-30',
    type: 'faq',
    title: '¿Por qué no puedo acceder a las analíticas?',
    description: 'Analíticas no accesibles',
    content: 'Verifica: 1) Tienes permisos si eres colaborador, 2) Tu plan incluye analíticas (algunos básicos no las tienen), 3) No hay error de conexión. Si deberías tenerlas, contacta soporte.',
    tags: ['analíticas', 'acceso', 'no puedo', 'ver', 'problema'],
    url: '/help#analiticas-no-accesibles',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-31',
    type: 'faq',
    title: '¿Por qué se duplicó mi contenido?',
    description: 'Contenido duplicado',
    content: 'Puede ocurrir si hiciste clic múltiples veces en guardar o crear. Simplemente elimina las copias duplicadas. Si sigue ocurriendo, puede ser un bug - reporta a soporte.',
    tags: ['duplicado', 'contenido', 'doble', 'copias', 'problema'],
    url: '/help#contenido-duplicado',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-32',
    type: 'faq',
    title: '¿Cómo contacto a soporte técnico?',
    description: 'Contactar soporte',
    content: 'Puedes contactar soporte por: 1) Email a hola@itineramio.com, 2) Chat en vivo (horario laboral), 3) Teléfono para urgencias. Incluye tu email de cuenta y descripción detallada del problema.',
    tags: ['soporte', 'contacto', 'ayuda', 'técnico', 'problema'],
    url: '/help#contactar-soporte',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-33',
    type: 'faq',
    title: '¿Por qué el manual se ve diferente en distintos dispositivos?',
    description: 'Vista diferente',
    content: 'El manual es responsive y se adapta a cada pantalla. Puede verse ligeramente diferente en móvil vs ordenador, pero el contenido es el mismo. Esto es normal y por diseño.',
    tags: ['diferente', 'dispositivo', 'responsive', 'móvil', 'ordenador'],
    url: '/help#vista-diferente',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-34',
    type: 'faq',
    title: '¿Por qué no puedo subir un video largo?',
    description: 'Video grande',
    content: 'Hay límite de tamaño para videos (normalmente 50-100MB). Para videos largos: 1) Comprime el video antes de subir, 2) Divide en clips más cortos, 3) Usa un servicio externo y enlaza.',
    tags: ['video', 'grande', 'largo', 'límite', 'tamaño'],
    url: '/help#video-grande',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-35',
    type: 'faq',
    title: '¿Por qué la app móvil no funciona?',
    description: 'App móvil',
    content: 'Itineramio funciona como web app, no hay app nativa. Accede desde el navegador de tu móvil (Chrome, Safari). Puedes añadir un acceso directo a tu pantalla de inicio para acceso rápido.',
    tags: ['app', 'móvil', 'nativa', 'navegador', 'web'],
    url: '/help#app-movil',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-36',
    type: 'faq',
    title: '¿Por qué no puedo invitar colaboradores?',
    description: 'Invitar colaboradores',
    content: 'Verifica: 1) Tu plan permite multiusuario, 2) El email del colaborador es válido, 3) No has alcanzado el límite de usuarios. Actualiza tu plan si necesitas más colaboradores.',
    tags: ['colaboradores', 'invitar', 'usuarios', 'no puedo', 'equipo'],
    url: '/help#invitar-colaboradores',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-37',
    type: 'faq',
    title: '¿Por qué se cambiaron mis configuraciones solas?',
    description: 'Configuraciones cambiadas',
    content: 'Si tienes colaboradores, pueden haber hecho cambios. Revisa quién tiene acceso. Si nadie más tiene acceso, puede ser un bug - contacta soporte con detalles de qué cambió.',
    tags: ['configuraciones', 'cambiaron', 'solas', 'problema', 'automático'],
    url: '/help#configuraciones-cambiadas',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-38',
    type: 'faq',
    title: '¿Por qué las imágenes se ven borrosas?',
    description: 'Imágenes borrosas',
    content: 'Las imágenes se comprimen para cargar rápido. Si se ven muy borrosas, sube imágenes de mayor resolución (mínimo 800px de ancho). Evita subir imágenes muy pequeñas.',
    tags: ['imágenes', 'borrosas', 'calidad', 'resolución', 'problema'],
    url: '/help#imagenes-borrosas',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-39',
    type: 'faq',
    title: '¿Por qué aparece "Propiedad no encontrada"?',
    description: 'Propiedad no encontrada',
    content: 'La propiedad puede: 1) Estar desactivada, 2) Haber sido eliminada, 3) El enlace ser incorrecto. Verifica en tu panel que la propiedad existe y está activa. Copia el enlace de nuevo.',
    tags: ['propiedad', 'no encontrada', 'error', 'enlace', 'problema'],
    url: '/help#propiedad-no-encontrada',
    category: 'Solución de Problemas'
  },
  {
    id: 'sp-40',
    type: 'faq',
    title: '¿Qué información debo dar a soporte para resolver mi problema?',
    description: 'Info para soporte',
    content: 'Para resolver rápido, incluye: 1) Tu email de cuenta, 2) Qué intentabas hacer paso a paso, 3) Qué error viste (mensaje exacto o captura), 4) Navegador y dispositivo, 5) Cuándo ocurrió.',
    tags: ['soporte', 'información', 'resolver', 'ayuda', 'detalles'],
    url: '/help#info-soporte',
    category: 'Solución de Problemas'
  },

  // Recursos descargables (mantenemos los originales)
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
]
