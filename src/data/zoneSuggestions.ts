export interface ZoneSuggestion {
  title: string
  description: string
  suggestions: {
    icon: string
    title: string
    description: string
  }[]
  examples: string[]
}

export const zoneSuggestions: Record<string, ZoneSuggestion> = {
  'check in': {
    title: 'Sugerencias para Check In',
    description: 'El Check In es la primera impresión de tus huéspedes. Hazlo claro y acogedor.',
    suggestions: [
      {
        icon: 'map-pin',
        title: 'Dirección completa',
        description: 'Incluye la dirección exacta con referencias visuales claras'
      },
      {
        icon: 'message-circle',
        title: 'Mensaje de bienvenida',
        description: 'Un texto cálido que haga sentir bienvenidos a tus huéspedes'
      },
      {
        icon: 'video',
        title: 'Video de entrada',
        description: 'Si tienes entrada autónoma, graba un video mostrando cómo entrar'
      },
      {
        icon: 'key',
        title: 'Acceso y códigos',
        description: 'Explica cómo obtener las llaves o códigos de acceso'
      },
      {
        icon: 'lock',
        title: 'Caja de seguridad',
        description: 'Si usas caja fuerte, indica ubicación y código'
      }
    ],
    examples: [
      'Paso 1: Dirección - Calle Example 123, 3º izquierda',
      'Paso 2: Al llegar, busca la puerta verde junto a la farmacia',
      'Paso 3: El código del portal es 1234#',
      'Paso 4: La llave está en la caja de seguridad junto a la puerta',
      'Paso 5: ¡Bienvenido! Si necesitas algo, no dudes en contactarme'
    ]
  },
  
  'check out': {
    title: 'Sugerencias para Check Out',
    description: 'Un check out claro evita problemas y asegura que todo quede en orden.',
    suggestions: [
      {
        icon: 'clock',
        title: 'Hora límite',
        description: 'Especifica claramente hasta qué hora pueden quedarse'
      },
      {
        icon: 'thermometer',
        title: 'Apagar climatización',
        description: 'Recuerda apagar aire acondicionado o calefacción'
      },
      {
        icon: 'home',
        title: 'Cerrar ventanas',
        description: 'Importante para la seguridad y el ahorro energético'
      },
      {
        icon: 'key',
        title: 'Devolución de llaves',
        description: 'Indica dónde y cómo devolver las llaves'
      },
      {
        icon: 'message-square',
        title: 'Avisar al salir',
        description: 'Pide que te avisen cuando se vayan'
      }
    ],
    examples: [
      'Paso 1: Check out antes de las 11:00 AM',
      'Paso 2: Apaga el aire acondicionado y la calefacción',
      'Paso 3: Cierra todas las ventanas',
      'Paso 4: Deja las llaves en la caja de seguridad',
      'Paso 5: Envíame un mensaje cuando salgas. ¡Gracias!'
    ]
  },
  
  'wifi': {
    title: 'Sugerencias para WiFi',
    description: 'La conexión a internet es esencial para la mayoría de huéspedes.',
    suggestions: [
      {
        icon: 'wifi',
        title: 'Nombre de la red',
        description: 'Indica el nombre exacto de tu red WiFi'
      },
      {
        icon: 'lock',
        title: 'Contraseña',
        description: 'Proporciona la contraseña completa y correcta'
      },
      {
        icon: 'router',
        title: 'Ubicación del router',
        description: 'Por si necesitan reiniciarlo'
      },
      {
        icon: 'signal',
        title: 'Zonas con mejor señal',
        description: 'Indica dónde hay mejor cobertura'
      }
    ],
    examples: [
      'Paso 1: Red WiFi: MiCasa_5G',
      'Paso 2: Contraseña: ContraseñaSegura123!',
      'Paso 3: El router está en el salón, junto a la TV',
      'Paso 4: La mejor señal está en salón y habitación principal'
    ]
  },
  
  'emergencias': {
    title: 'Sugerencias para Teléfonos de Emergencia',
    description: 'Información vital que puede salvar vidas. Mantenla actualizada.',
    suggestions: [
      {
        icon: 'phone',
        title: 'Emergencias generales',
        description: 'El 112 funciona en toda Europa'
      },
      {
        icon: 'shield',
        title: 'Policía',
        description: 'Incluye policía nacional y local'
      },
      {
        icon: 'heart',
        title: 'Emergencias médicas',
        description: 'Hospital más cercano y centro de salud'
      },
      {
        icon: 'user',
        title: 'Contacto del anfitrión',
        description: 'Tu teléfono para urgencias'
      },
      {
        icon: 'building',
        title: 'Servicios del edificio',
        description: 'Portero, mantenimiento, etc.'
      }
    ],
    examples: [
      'Paso 1: Emergencias (todos los servicios): 112',
      'Paso 2: Policía Nacional: 091 | Policía Local: 092',
      'Paso 3: Hospital más cercano: Hospital General - 915 123 456',
      'Paso 4: Mi teléfono (urgencias): +34 600 123 456',
      'Paso 5: Portería del edificio: 915 987 654'
    ]
  },
  
  'normas de la casa': {
    title: 'Sugerencias para Normas de la Casa',
    description: 'Establece reglas claras para evitar malentendidos.',
    suggestions: [
      {
        icon: 'volume-x',
        title: 'Horarios de silencio',
        description: 'Especifica horas de descanso'
      },
      {
        icon: 'users',
        title: 'Número de huéspedes',
        description: 'Límite de personas permitidas'
      },
      {
        icon: 'cigarette',
        title: 'Política de fumadores',
        description: '¿Se permite fumar? ¿Dónde?'
      },
      {
        icon: 'dog',
        title: 'Mascotas',
        description: 'Si permites mascotas y condiciones'
      },
      {
        icon: 'party-popper',
        title: 'Fiestas y eventos',
        description: 'Tu política sobre reuniones'
      }
    ],
    examples: [
      'Paso 1: Horario de silencio: 22:00 - 08:00',
      'Paso 2: Máximo 4 huéspedes (los registrados)',
      'Paso 3: No fumar en interior. Permitido en terraza',
      'Paso 4: No se permiten mascotas',
      'Paso 5: No están permitidas las fiestas'
    ]
  },
  
  'parking': {
    title: 'Sugerencias para Parking',
    description: 'Facilita el aparcamiento a tus huéspedes con instrucciones claras.',
    suggestions: [
      {
        icon: 'car',
        title: 'Ubicación exacta',
        description: 'Dirección del parking o plaza'
      },
      {
        icon: 'ticket',
        title: 'Sistema de acceso',
        description: 'Tarjeta, mando, código...'
      },
      {
        icon: 'map',
        title: 'Cómo llegar',
        description: 'Ruta desde la calle al parking'
      },
      {
        icon: 'euro',
        title: 'Coste',
        description: 'Si tiene coste adicional'
      },
      {
        icon: 'ruler',
        title: 'Restricciones',
        description: 'Altura máxima, tipo de vehículo'
      }
    ],
    examples: [
      'Paso 1: Plaza nº 15 en sótano -1',
      'Paso 2: Usa el mando que está en la entrada',
      'Paso 3: Entrada por Calle Paralela, 45',
      'Paso 4: Incluido en el precio del alojamiento',
      'Paso 5: Altura máxima: 2.10m'
    ]
  },
  
  'transporte': {
    title: 'Sugerencias para Transporte Público',
    description: 'Ayuda a tus huéspedes a moverse por la ciudad.',
    suggestions: [
      {
        icon: 'train',
        title: 'Metro más cercano',
        description: 'Estación, línea y dirección'
      },
      {
        icon: 'bus',
        title: 'Paradas de autobús',
        description: 'Líneas útiles y destinos'
      },
      {
        icon: 'map-pin',
        title: 'Cómo llegar al centro',
        description: 'La ruta más rápida al centro'
      },
      {
        icon: 'plane',
        title: 'Desde/hasta aeropuerto',
        description: 'Mejores opciones de transporte'
      },
      {
        icon: 'credit-card',
        title: 'Tarjetas y billetes',
        description: 'Dónde comprar y precios'
      }
    ],
    examples: [
      'Paso 1: Metro Sol (Línea 1) a 5 min andando',
      'Paso 2: Bus 27 y 45 en la esquina - van al centro',
      'Paso 3: Para ir al centro: Metro línea 1, 3 paradas',
      'Paso 4: Desde aeropuerto: Metro línea 8 + transbordo',
      'Paso 5: Compra billetes en la máquina del metro'
    ]
  },
  
  'climatización': {
    title: 'Sugerencias para Climatización',
    description: 'Explica claramente cómo usar los sistemas de climatización.',
    suggestions: [
      {
        icon: 'wind',
        title: 'Aire acondicionado',
        description: 'Cómo encender y regular'
      },
      {
        icon: 'thermometer',
        title: 'Calefacción',
        description: 'Sistema y funcionamiento'
      },
      {
        icon: 'remote',
        title: 'Mando a distancia',
        description: 'Ubicación y funciones'
      },
      {
        icon: 'clock',
        title: 'Horarios',
        description: 'Si hay restricciones'
      },
      {
        icon: 'droplets',
        title: 'Modo eco',
        description: 'Uso responsable'
      }
    ],
    examples: [
      'Paso 1: Mando del aire en el cajón de la mesilla',
      'Paso 2: Botón ON/OFF - Temperatura con + y -',
      'Paso 3: Modo frío (copo de nieve) / Calor (sol)',
      'Paso 4: Por favor, apagar al salir del apartamento',
      'Paso 5: Temperatura recomendada: 22-24°C'
    ]
  },
  
  'cómo llegar': {
    title: 'Sugerencias para Cómo Llegar',
    description: 'Guía a tus huéspedes desde su punto de llegada hasta tu alojamiento.',
    suggestions: [
      {
        icon: 'plane',
        title: 'Desde el aeropuerto',
        description: 'Rutas y opciones de transporte'
      },
      {
        icon: 'train',
        title: 'Desde la estación',
        description: 'Tren o autobús principal'
      },
      {
        icon: 'car',
        title: 'En coche',
        description: 'Ruta y dónde aparcar'
      },
      {
        icon: 'map',
        title: 'Referencias visuales',
        description: 'Puntos de referencia cercanos'
      },
      {
        icon: 'navigation',
        title: 'Link Google Maps',
        description: 'Enlace directo a la ubicación'
      }
    ],
    examples: [
      'Paso 1: Desde aeropuerto: Metro L8 hasta Nuevos Ministerios',
      'Paso 2: Cambiar a L10 dirección Puerta del Sur',
      'Paso 3: Bajar en Príncipe Pío (4 paradas)',
      'Paso 4: Salida Cuesta de San Vicente',
      'Paso 5: Edificio blanco junto a farmacia (2 min)'
    ]
  },
  
  'recomendaciones': {
    title: 'Sugerencias para Recomendaciones',
    description: 'Comparte tus lugares favoritos y consejos locales.',
    suggestions: [
      {
        icon: 'utensils',
        title: 'Restaurantes',
        description: 'Tus favoritos cerca'
      },
      {
        icon: 'coffee',
        title: 'Cafeterías',
        description: 'Para desayunar o merendar'
      },
      {
        icon: 'shopping-bag',
        title: 'Supermercados',
        description: 'Dónde hacer la compra'
      },
      {
        icon: 'star',
        title: 'Lugares de interés',
        description: 'Qué visitar en la zona'
      },
      {
        icon: 'heart',
        title: 'Joyas ocultas',
        description: 'Sitios especiales poco conocidos'
      }
    ],
    examples: [
      'Paso 1: Restaurante Casa Pepe - Comida casera excelente',
      'Paso 2: Café Central - Mejor café del barrio (desayunos)',
      'Paso 3: Supermercado Día a 2 minutos andando',
      'Paso 4: Parque del Retiro a 10 min en metro',
      'Paso 5: Mercado de San Miguel - Tapas increíbles'
    ]
  },
  
  'basura': {
    title: 'Sugerencias para Basura y Reciclaje',
    description: 'Ayuda a mantener el espacio limpio y a reciclar correctamente.',
    suggestions: [
      {
        icon: 'trash',
        title: 'Ubicación contenedores',
        description: 'Dónde están los cubos'
      },
      {
        icon: 'recycle',
        title: 'Separación residuos',
        description: 'Qué va en cada contenedor'
      },
      {
        icon: 'clock',
        title: 'Horarios',
        description: 'Cuándo sacar la basura'
      },
      {
        icon: 'package',
        title: 'Bolsas de basura',
        description: 'Dónde encontrarlas'
      },
      {
        icon: 'leaf',
        title: 'Orgánico',
        description: 'Si hay contenedor marrón'
      }
    ],
    examples: [
      'Paso 1: Contenedores en la calle, saliendo a la derecha',
      'Paso 2: Amarillo: plásticos | Azul: papel | Verde: vidrio',
      'Paso 3: Gris: resto de residuos | Marrón: orgánico',
      'Paso 4: Bolsas de basura bajo el fregadero',
      'Paso 5: Por favor, baja la basura antes de salir'
    ]
  }
}