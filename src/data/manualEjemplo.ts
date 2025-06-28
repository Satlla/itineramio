// Manual de ejemplo que se crea automáticamente para inspirar a los usuarios
export interface ManualStep {
  id: string
  order: number
  title: string
  description: string
  content: {
    type: 'text' | 'image' | 'video' | 'card_wifi' | 'checklist' | 'link' | 'discount'
    text?: string
    mediaUrl?: string
    thumbnail?: string
    duration?: number
    linkUrl?: string
    linkText?: string
    discountCode?: string
    wifiData?: {
      ssid: string
      password: string
      speed: string
    }
    checklistItems?: string[]
  }
  variables: string[] // Variables que el usuario puede personalizar
}

export interface ManualZone {
  id: string
  name: string
  description: string
  icon: string
  order: number
  steps: ManualStep[]
}

export const manualEjemploZones: ManualZone[] = [
  {
    id: 'ejemplo-checkin',
    name: 'Check In',
    description: '✨ Ejemplo de llegada y entrada perfecta',
    icon: 'key',
    order: 1,
    steps: [
      {
        id: 'checkin-direccion',
        order: 1,
        title: '📍 Llegada a la propiedad',
        description: 'Cómo llegar a tu apartamento',
        content: {
          type: 'text',
          text: '🚶‍♂️ **Tu destino:**\n\n📍 Dirígete hacia la Calle {direccion} número {numero} en {ciudad}\n\n🚌 **Desde el aeropuerto:**\n• Toma el autobús C6 hasta "Puerta del Mar"\n• Son 25 minutos de trayecto\n• Camina 5 minutos hasta el edificio\n\n🚕 **En taxi:** 15 minutos desde el aeropuerto'
        },
        variables: ['{direccion}', '{numero}', '{ciudad}']
      },
      {
        id: 'checkin-puerta',
        order: 2,
        title: '🏠 Localiza tu apartamento',
        description: 'Encuentra la puerta correcta',
        content: {
          type: 'image',
          text: '👀 **Busca este número en la puerta:**\n\nTu apartamento está en el {piso}º piso. El número debe estar visible en la puerta principal.',
          mediaUrl: '/templates/images/numero-puerta-ejemplo.jpg',
          thumbnail: '/templates/images/numero-puerta-ejemplo.jpg'
        },
        variables: ['{piso}']
      },
      {
        id: 'checkin-codigo',
        order: 3,
        title: '🔐 Acceso con código de seguridad',
        description: 'Abre la puerta con tu código personal',
        content: {
          type: 'video',
          text: '🔢 **Tu código de acceso:** {codigo_acceso}\n\n1️⃣ Presiona cada número en la cerradura\n2️⃣ Espera la luz verde ✅\n3️⃣ La puerta se abrirá automáticamente\n\n🔒 **Importante:** La puerta se bloquea automáticamente al cerrar',
          mediaUrl: '/templates/videos/codigo-puerta-ejemplo.mp4',
          thumbnail: '/templates/images/codigo-puerta-thumb.jpg',
          duration: 4
        },
        variables: ['{codigo_acceso}']
      },
      {
        id: 'checkin-bienvenida',
        order: 4,
        title: '🎉 ¡Bienvenido a casa!',
        description: 'Tu hogar temporal está listo',
        content: {
          type: 'video',
          text: '🏡 **¡Ya estás en casa!**\n\n✨ Todo está preparado para tu estancia:\n• Dormitorios: {dormitorios}\n• Baños: {banos}\n• Capacidad: {huespedes} personas\n• WiFi súper rápido incluido\n\n📱 Explora las siguientes secciones para conocer todos los servicios',
          mediaUrl: '/templates/videos/bienvenida-apartamento.mp4',
          thumbnail: '/templates/images/bienvenida-thumb.jpg',
          duration: 4
        },
        variables: ['{dormitorios}', '{banos}', '{huespedes}']
      }
    ]
  },
  {
    id: 'ejemplo-wifi',
    name: 'WiFi',
    description: '📶 Internet súper rápido y fácil',
    icon: 'wifi',
    order: 2,
    steps: [
      {
        id: 'wifi-datos',
        order: 1,
        title: '📶 Conexión súper rápida',
        description: 'Datos de conexión y velocidad premium',
        content: {
          type: 'card_wifi',
          text: '🚀 **Internet de alta velocidad:**\n\n📡 Red WiFi: {wifi_name}\n🔐 Contraseña: {wifi_password}\n⚡ Velocidad: 1GB - ¡Perfecta para streaming 4K!\n\n📱 Compatible con todos los dispositivos\n🎬 Netflix, YouTube, videollamadas... ¡Todo fluido!',
          wifiData: {
            ssid: '{wifi_name}',
            password: '{wifi_password}',
            speed: '1GB'
          }
        },
        variables: ['{wifi_name}', '{wifi_password}']
      },
      {
        id: 'wifi-qr',
        order: 2,
        title: '📱 Conexión automática con QR',
        description: 'Conectar en segundos escaneando código',
        content: {
          type: 'image',
          text: '📲 **¡Conexión instantánea!**\n\n1️⃣ Dirígete al salón principal\n2️⃣ Verás un código QR junto al TV\n3️⃣ Escanéalo con tu cámara\n4️⃣ ¡Conectado automáticamente!\n\n🔧 **¿Problemas?** Reinicia el router (está en el armario del recibidor) durante 30 segundos',
          mediaUrl: '/templates/images/huesped-qr-wifi.jpg',
          thumbnail: '/templates/images/huesped-qr-wifi.jpg'
        },
        variables: []
      }
    ]
  },
  {
    id: 'ejemplo-checkout',
    name: 'Check Out',
    description: '🚪 Salida rápida y sin complicaciones',
    icon: 'exit',
    order: 3,
    steps: [
      {
        id: 'checkout-preparacion',
        order: 1,
        title: '🧹 Preparación para la salida',
        description: 'Lista de tareas antes de irte',
        content: {
          type: 'checklist',
          text: '✅ **Lista de salida (2 minutos):**\n\nAntes de irte, por favor:',
          checklistItems: [
            '🪟 Cierra todas las ventanas',
            '❄️ Apaga el aire acondicionado',
            '💡 Apaga todas las luces',
            '🔐 Deja las llaves en {lugar_llaves}',
            '🚮 Tira la basura en el contenedor del portal',
            '🔒 Cierra bien la puerta al salir'
          ]
        },
        variables: ['{lugar_llaves}']
      },
      {
        id: 'checkout-aviso',
        order: 2,
        title: '📱 Avisa a tu anfitrión',
        description: 'Confirma tu salida para el servicio de limpieza',
        content: {
          type: 'text',
          text: '💬 **Último paso:**\n\nUna vez terminado el proceso, envía un mensaje a tu anfitrión:\n\n📞 **Teléfono:** {telefono_anfitrion}\n📧 **Email:** {email_anfitrion}\n\n💬 **Mensaje sugerido:**\n"¡Hola! Ya he salido del apartamento. Todo perfecto, muchas gracias 😊"\n\n🧽 Esto permite enviar el equipo de limpieza lo antes posible para el siguiente huésped'
        },
        variables: ['{telefono_anfitrion}', '{email_anfitrion}']
      }
    ]
  },
  {
    id: 'ejemplo-equipaje',
    name: 'Equipaje',
    description: '🧳 Deja tus maletas de forma segura',
    icon: 'luggage',
    order: 4,
    steps: [
      {
        id: 'equipaje-problema',
        order: 1,
        title: '🧳 ¿Llegaste temprano?',
        description: 'Solución para equipaje antes del check-in',
        content: {
          type: 'text',
          text: '⏰ **¿Check-in más tarde pero ya estás en la ciudad?**\n\n¡No te preocupes! Tenemos la solución perfecta:\n\n🏪 **Lockers seguros** a solo 2 minutos caminando\n🔒 **Máxima seguridad** con códigos personales\n💰 **Precios desde 3€** por día\n📱 **Reserva online** en segundos\n\n👥 **Perfecto para:**\n• Llegadas anticipadas\n• Vuelos nocturnos\n• Salidas tardías'
        },
        variables: []
      },
      {
        id: 'equipaje-reserva',
        order: 2,
        title: '🔗 Reserva tu locker',
        description: 'Proceso súper fácil online',
        content: {
          type: 'link',
          text: '🌐 **Reserva en 3 clics:**\n\n1️⃣ Entra en la web oficial\n2️⃣ Elige el tamaño de maleta\n3️⃣ Selecciona las horas que necesitas\n4️⃣ ¡Recibe tu código por WhatsApp!\n\n📍 **Ubicación:** A 150 metros del apartamento\n⏰ **Disponible:** 24/7 todos los días',
          linkUrl: 'https://www.lockers-alicante.com',
          linkText: '🔗 Reservar Locker Ahora'
        },
        variables: []
      },
      {
        id: 'equipaje-descuento',
        order: 3,
        title: '💰 Descuento especial',
        description: '15% OFF para huéspedes de Itineramio',
        content: {
          type: 'discount',
          text: '🎉 **¡Oferta exclusiva para ti!**\n\n💸 **15% de descuento** en cualquier reserva\n\n🎫 **Código:** ITINERAMIO15\n⏱️ **Válido:** Durante toda tu estancia\n💝 **Aplicable:** A cualquier tamaño de locker\n\n💡 **Tip:** Úsalo también para tu equipaje de salida si tu vuelo es tarde',
          discountCode: 'ITINERAMIO15'
        },
        variables: []
      }
    ]
  }
]

// Variables globales que se pueden personalizar
export const variablesGlobales = {
  // Datos de la propiedad
  '{direccion}': 'Calle de ejemplo',
  '{numero}': '123',
  '{ciudad}': 'tu ciudad',
  '{piso}': '2',
  '{codigo_acceso}': '1234',
  '{dormitorios}': '2',
  '{banos}': '1',
  '{huespedes}': '4',
  
  // WiFi
  '{wifi_name}': 'WiFi_Apartamento',
  '{wifi_password}': 'password123',
  
  // Check out
  '{lugar_llaves}': 'mesa del recibidor',
  '{telefono_anfitrion}': '+34 600 000 000',
  '{email_anfitrion}': 'host@ejemplo.com'
}

// Helper para reemplazar variables en el texto
export const reemplazarVariables = (texto: string, variables: Record<string, string> = {}) => {
  let textoFinal = texto
  
  // Primero usar variables personalizadas del usuario
  Object.entries(variables).forEach(([variable, valor]) => {
    textoFinal = textoFinal.replace(new RegExp(variable, 'g'), valor)
  })
  
  // Luego usar variables globales para las que no se personalizaron
  Object.entries(variablesGlobales).forEach(([variable, valor]) => {
    textoFinal = textoFinal.replace(new RegExp('\\' + variable, 'g'), valor)
  })
  
  return textoFinal
}