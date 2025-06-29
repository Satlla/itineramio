// Essential zone templates that are auto-created for new properties
export interface EssentialTemplate {
  id: string
  name: string
  description: string
  icon: string
  order: number
  category: 'arrival' | 'living' | 'departure' | 'services' | 'local'
  steps: EssentialTemplateStep[]
}

export interface EssentialTemplateStep {
  id: string
  title: string
  description: string
  media_type: 'text' | 'image' | 'video'
  media_url?: string
  thumbnail_url?: string
  content: {
    text?: string
    mediaUrl?: string
    thumbnail?: string
    duration?: number
  }
  order: number
  variables: string[] // Variables que el usuario puede personalizar
}

export const essentialTemplates: EssentialTemplate[] = [
  {
    id: 'essential-checkin',
    name: 'Check In',
    description: 'Instrucciones completas para la llegada y entrada al apartamento',
    icon: 'key',
    order: 1,
    category: 'arrival',
    steps: [
      {
        id: 'checkin-arrival',
        title: '🛬 Cómo llegar al apartamento',
        description: 'Ruta completa desde aeropuerto o estación',
        media_type: 'image',
        media_url: '/templates/images/checkin_complete_guide.png',
        thumbnail_url: '/templates/images/checkin_complete_guide.png',
        content: {
          text: '✈️ Desde el aeropuerto:\n• Toma el autobús {transport_line}\n• Baja en la parada {stop_name}\n• Camina {walking_time} minutos hasta el edificio\n\n🚂 Desde la estación:\n• {train_instructions}\n\n📍 Dirección exacta: {property_address}',
          mediaUrl: '/templates/images/checkin_complete_guide.png',
          thumbnail: '/templates/images/checkin_complete_guide.png'
        },
        order: 1,
        variables: ['{transport_line}', '{stop_name}', '{walking_time}', '{train_instructions}', '{property_address}']
      },
      {
        id: 'checkin-door-lock',
        title: '🔐 Acceso con cerradura electrónica',
        description: 'Cómo usar la cerradura digital del apartamento',
        media_type: 'video',
        media_url: '/templates/videos/door_lock_electronic.mp4',
        thumbnail_url: '/templates/images/door_lock_thumb.jpg',
        content: {
          text: '1️⃣ Acércate a la puerta del apartamento\n2️⃣ Introduce el código: {door_code}\n3️⃣ Presiona cada número (se iluminarán)\n4️⃣ Espera la luz verde de confirmación\n5️⃣ La puerta se desbloqueará automáticamente',
          mediaUrl: '/templates/videos/door_lock_electronic.mp4',
          thumbnail: '/templates/images/door_lock_thumb.jpg',
          duration: 4
        },
        order: 2,
        variables: ['{door_code}']
      },
      {
        id: 'checkin-welcome',
        title: '🏠 Bienvenida al apartamento',
        description: 'Tu hogar temporal está listo',
        media_type: 'video',
        media_url: '/templates/videos/door_welcome.mp4',
        thumbnail_url: '/templates/images/welcome_thumb.jpg',
        content: {
          text: '¡Bienvenido a tu apartamento! 🎉\n\n📍 Estás en el {apartment_floor}º piso\n🛏️ Dormitorios: {bedrooms}\n🚿 Baños: {bathrooms}\n👥 Capacidad máxima: {max_guests} personas\n\nTodo está preparado para tu estancia. ¡Disfruta!',
          mediaUrl: '/templates/videos/door_welcome.mp4',
          thumbnail: '/templates/images/welcome_thumb.jpg',
          duration: 4
        },
        order: 3,
        variables: ['{apartment_floor}', '{bedrooms}', '{bathrooms}', '{max_guests}']
      }
    ]
  },
  {
    id: 'essential-wifi',
    name: 'WiFi',
    description: 'Conexión a internet rápida y fácil',
    icon: 'wifi',
    order: 2,
    category: 'living',
    steps: [
      {
        id: 'wifi-visual-guide',
        title: '📶 Guía visual de conexión',
        description: 'Todo lo que necesitas saber sobre el WiFi',
        media_type: 'image',
        media_url: '/templates/images/wifi_setup_visual.png',
        thumbnail_url: '/templates/images/wifi_setup_visual.png',
        content: {
          text: '📡 **Datos de conexión:**\n• Red WiFi: {wifi_name}\n• Contraseña: {wifi_password}\n• Router ubicado: {router_location}\n\n📱 Compatible con todos los dispositivos\n⚡ Velocidad: Alta velocidad para streaming',
          mediaUrl: '/templates/images/wifi_setup_visual.png',
          thumbnail: '/templates/images/wifi_setup_visual.png'
        },
        order: 1,
        variables: ['{wifi_name}', '{wifi_password}', '{router_location}']
      },
      {
        id: 'wifi-instant-connect',
        title: '✨ Conexión instantánea',
        description: 'Conectar en segundos',
        media_type: 'video',
        media_url: '/templates/videos/wifi_instant.mp4',
        thumbnail_url: '/templates/images/wifi_connect_thumb.jpg',
        content: {
          text: '1️⃣ Abre la configuración WiFi\n2️⃣ Busca "{wifi_name}"\n3️⃣ Introduce la contraseña\n4️⃣ ¡Listo! Ya tienes internet\n\n🔧 Si hay problemas, reinicia el router 30 segundos',
          mediaUrl: '/templates/videos/wifi_instant.mp4',
          thumbnail: '/templates/images/wifi_connect_thumb.jpg',
          duration: 4
        },
        order: 2,
        variables: ['{wifi_name}', '{wifi_password}']
      }
    ]
  },
  {
    id: 'essential-checkout',
    name: 'Check Out',
    description: 'Instrucciones para la salida del apartamento',
    icon: 'exit',
    order: 3,
    category: 'departure',
    steps: [
      {
        id: 'checkout-cleaning',
        title: 'Limpieza antes de salir',
        description: 'Tareas básicas de limpieza',
        media_type: 'video',
        media_url: '/templates/videos/checkout_cleaning.mp4',
        thumbnail_url: '/templates/images/checkout_cleaning_thumb.jpg',
        content: {
          text: 'Antes de salir: lava los platos usados, tira la basura, cierra todas las ventanas y apaga las luces. No es necesario limpiar a fondo, solo dejar todo ordenado.',
          mediaUrl: '/templates/videos/checkout_cleaning.mp4',
          thumbnail: '/templates/images/checkout_cleaning_thumb.jpg',
          duration: 50
        },
        order: 1,
        variables: []
      },
      {
        id: 'checkout-keys',
        title: 'Entregar las llaves',
        description: 'Dónde y cómo dejar las llaves',
        media_type: 'image',
        media_url: '/templates/images/checkout_keys.jpg',
        content: {
          text: 'Deja las llaves {key_return_location}. El check-out es antes de las {checkout_time}. Si tienes algún problema, llama al {host_phone}.',
          mediaUrl: '/templates/images/checkout_keys.jpg'
        },
        order: 2,
        variables: ['{key_return_location}', '{checkout_time}', '{host_phone}']
      }
    ]
  },
  {
    id: 'essential-rules',
    name: 'Normas del apartamento',
    description: 'Reglas básicas para una estancia agradable',
    icon: 'list',
    order: 4,
    category: 'living',
    steps: [
      {
        id: 'rules-basic',
        title: 'Normas básicas',
        description: 'Reglas principales del apartamento',
        media_type: 'image',
        media_url: '/templates/images/apartment_rules.jpg',
        content: {
          text: '• No está permitido fumar en el interior\n• Respetar horario de silencio: {quiet_hours}\n• Máximo {max_guests} personas\n• No se permiten fiestas\n• Mantener limpio y ordenado\n• Respetar a los vecinos',
          mediaUrl: '/templates/images/apartment_rules.jpg'
        },
        order: 1,
        variables: ['{quiet_hours}', '{max_guests}']
      }
    ]
  },
  {
    id: 'essential-directions',
    name: 'Cómo llegar',
    description: 'Instrucciones detalladas para llegar al apartamento',
    icon: 'map-pin',
    order: 5,
    category: 'arrival',
    steps: [
      {
        id: 'directions-transport',
        title: 'Transporte público',
        description: 'Cómo llegar en transporte público',
        media_type: 'video',
        media_url: '/templates/videos/directions_transport.mp4',
        thumbnail_url: '/templates/images/directions_transport_thumb.jpg',
        content: {
          text: 'Desde el aeropuerto: {airport_instructions}\nDesde la estación de tren: {train_instructions}\nDesde el centro de la ciudad: {city_center_instructions}',
          mediaUrl: '/templates/videos/directions_transport.mp4',
          thumbnail: '/templates/images/directions_transport_thumb.jpg',
          duration: 60
        },
        order: 1,
        variables: ['{airport_instructions}', '{train_instructions}', '{city_center_instructions}']
      }
    ]
  },
  {
    id: 'essential-ac',
    name: 'Aire acondicionado',
    description: 'Cómo usar la climatización',
    icon: 'thermometer',
    order: 6,
    category: 'living',
    steps: [
      {
        id: 'ac-usage',
        title: 'Uso del aire acondicionado',
        description: 'Controlar la temperatura del apartamento',
        media_type: 'video',
        media_url: '/templates/videos/ac_remote_tutorial.mp4',
        thumbnail_url: '/templates/images/ac_remote_thumb.jpg',
        content: {
          text: 'El mando del aire acondicionado está {ac_remote_location}. Temperatura recomendada: {recommended_temp}°C. Para encender presiona POWER, para cambiar temperatura usa ▲▼.',
          mediaUrl: '/templates/videos/ac_remote_tutorial.mp4',
          thumbnail: '/templates/images/ac_remote_thumb.jpg',
          duration: 35
        },
        order: 1,
        variables: ['{ac_remote_location}', '{recommended_temp}']
      }
    ]
  },
  {
    id: 'essential-city-info',
    name: 'Información de la ciudad',
    description: 'Lugares de interés y servicios útiles',
    icon: 'info',
    order: 7,
    category: 'local',
    steps: [
      {
        id: 'city-attractions',
        title: 'Lugares de interés',
        description: 'Qué visitar en la ciudad',
        media_type: 'image',
        media_url: '/templates/images/city_attractions.jpg',
        content: {
          text: 'Lugares imprescindibles:\n• {attraction_1}\n• {attraction_2}\n• {attraction_3}\n\nRestaurantes recomendados:\n• {restaurant_1}\n• {restaurant_2}',
          mediaUrl: '/templates/images/city_attractions.jpg'
        },
        order: 1,
        variables: ['{attraction_1}', '{attraction_2}', '{attraction_3}', '{restaurant_1}', '{restaurant_2}']
      }
    ]
  },
  {
    id: 'essential-parking',
    name: 'Aparcamiento',
    description: 'Dónde y cómo aparcar',
    icon: 'car',
    order: 8,
    category: 'arrival',
    steps: [
      {
        id: 'parking-location',
        title: 'Dónde aparcar',
        description: 'Opciones de aparcamiento disponibles',
        media_type: 'video',
        media_url: '/templates/videos/parking_demo.mp4',
        thumbnail_url: '/templates/images/parking_thumb.jpg',
        content: {
          text: 'Parking más cercano: {parking_location}\nCoste: {parking_cost}\nDistancia andando: {walking_distance}\nHorario: {parking_hours}',
          mediaUrl: '/templates/videos/parking_demo.mp4',
          thumbnail: '/templates/images/parking_thumb.jpg',
          duration: 45
        },
        order: 1,
        variables: ['{parking_location}', '{parking_cost}', '{walking_distance}', '{parking_hours}']
      }
    ]
  },
  {
    id: 'essential-transport',
    name: 'Transporte público',
    description: 'Cómo moverse por la ciudad',
    icon: 'bus',
    order: 9,
    category: 'local',
    steps: [
      {
        id: 'transport-info',
        title: 'Moverse por la ciudad',
        description: 'Transporte público disponible',
        media_type: 'image',
        media_url: '/templates/images/transport_map.jpg',
        content: {
          text: 'Estación más cercana: {nearest_station}\nLíneas útiles: {useful_lines}\nApp recomendada: {transport_app}\nPrecio del billete: {ticket_price}',
          mediaUrl: '/templates/images/transport_map.jpg'
        },
        order: 1,
        variables: ['{nearest_station}', '{useful_lines}', '{transport_app}', '{ticket_price}']
      }
    ]
  },
  {
    id: 'essential-kitchen',
    name: 'Cocina y Electrodomésticos',
    description: 'Cómo usar vitrocerámica y electrodomésticos',
    icon: 'kitchen',
    order: 10,
    category: 'living',
    steps: [
      {
        id: 'kitchen-cooktop',
        title: '🔥 Vitrocerámica de inducción',
        description: 'Desbloquear y usar la placa de cocción',
        media_type: 'video',
        media_url: '/templates/videos/cooktop_unlock.mp4',
        thumbnail_url: '/templates/images/cooktop_thumb.jpg',
        content: {
          text: '🔒 **Cómo desbloquear la vitrocerámica:**\n\n1️⃣ Busca el botón con el símbolo de candado 🔒\n2️⃣ Mantén pulsado durante 3 segundos\n3️⃣ El icono cambiará a desbloqueado 🔓\n4️⃣ Las zonas de cocción se iluminarán en azul\n5️⃣ ¡Ya puedes cocinar!\n\n⚠️ Al terminar, se bloquea automáticamente por seguridad',
          mediaUrl: '/templates/videos/cooktop_unlock.mp4',
          thumbnail: '/templates/images/cooktop_thumb.jpg',
          duration: 4
        },
        order: 1,
        variables: []
      },
      {
        id: 'kitchen-qr-help',
        title: '📱 Video tutorial con QR',
        description: 'Escanea para ver tutorial completo',
        media_type: 'video',
        media_url: '/templates/videos/qr_tutorial.mp4',
        thumbnail_url: '/templates/images/qr_tutorial_thumb.jpg',
        content: {
          text: '📲 **Tutorial paso a paso:**\n\nEncontrarás un código QR junto a la vitrocerámica. Escanéalo con tu móvil para ver un video tutorial completo.\n\n✨ El tutorial te mostrará:\n• Cómo desbloquear la vitrocerámica\n• Cómo seleccionar temperatura\n• Cómo usar los diferentes programas\n• Consejos de seguridad\n\n📱 Compatible con cualquier app de cámara',
          mediaUrl: '/templates/videos/qr_tutorial.mp4',
          thumbnail: '/templates/images/qr_tutorial_thumb.jpg',
          duration: 4
        },
        order: 2,
        variables: []
      }
    ]
  }
]

// Helper function to get template by ID
export const getEssentialTemplate = (id: string): EssentialTemplate | undefined => {
  return essentialTemplates.find(template => template.id === id)
}

// Helper function to get templates by category
export const getTemplatesByCategory = (category: EssentialTemplate['category']): EssentialTemplate[] => {
  return essentialTemplates.filter(template => template.category === category)
}

// Variables that users can customize across templates
export const commonVariables = {
  // Contact info
  '{host_phone}': 'Teléfono del anfitrión',
  '{host_name}': 'Nombre del anfitrión',
  '{host_email}': 'Email del anfitrión',
  
  // Property details
  '{apartment_floor}': 'Piso del apartamento',
  '{keybox_code}': 'Código de la caja de seguridad',
  '{key_return_location}': 'Dónde dejar las llaves',
  '{checkout_time}': 'Hora límite de check-out',
  
  // WiFi
  '{wifi_name}': 'Nombre de la red WiFi',
  '{wifi_password}': 'Contraseña del WiFi',
  '{router_location}': 'Ubicación del router',
  
  // Transport
  '{transport_line}': 'Línea de transporte público',
  '{stop_name}': 'Nombre de la parada',
  '{travel_time}': 'Tiempo de viaje',
  '{walking_time}': 'Tiempo caminando',
  '{airport_instructions}': 'Instrucciones desde el aeropuerto',
  '{train_instructions}': 'Instrucciones desde la estación',
  '{city_center_instructions}': 'Instrucciones desde el centro',
  
  // Climate
  '{ac_remote_location}': 'Ubicación del mando del AC',
  '{recommended_temp}': 'Temperatura recomendada',
  
  // Rules
  '{quiet_hours}': 'Horario de silencio',
  '{max_guests}': 'Máximo número de huéspedes',
  
  // Local info
  '{attraction_1}': 'Atracción turística 1',
  '{attraction_2}': 'Atracción turística 2',
  '{attraction_3}': 'Atracción turística 3',
  '{restaurant_1}': 'Restaurante recomendado 1',
  '{restaurant_2}': 'Restaurante recomendado 2',
  
  // Parking
  '{parking_location}': 'Ubicación del parking',
  '{parking_cost}': 'Coste del parking',
  '{walking_distance}': 'Distancia caminando',
  '{parking_hours}': 'Horario del parking',
  
  // Public transport
  '{nearest_station}': 'Estación más cercana',
  '{useful_lines}': 'Líneas útiles',
  '{transport_app}': 'App de transporte',
  '{ticket_price}': 'Precio del billete'
}