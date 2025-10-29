// Manual de ejemplo SIMPLE Y FUNCIONAL
export const manualEjemploSimple = [
  {
    id: 'checkin',
    name: 'Check In',
    description: 'Entrada al apartamento',
    icon: 'key',
    order: 1,
    steps: [
      {
        title: 'Tu código de acceso',
        content: 'Tu código es dinámico y personal. Te lo enviaremos cuando esté listo el apartamento.',
        type: 'TEXT',
        order: 1
      },
      {
        title: 'Horario de entrada',
        content: 'Check-in disponible desde las 16:00h. Si necesitas entrar antes, contáctanos.',
        type: 'TEXT', 
        order: 2
      },
      {
        title: 'Cómo abrir la puerta',
        content: 'Introduce el código en el teclado. Espera el pitido. Gira el pomo con luz verde.',
        type: 'VIDEO',
        mediaUrl: '/templates/videos/check-in.mp4',
        order: 3
      },
      {
        title: 'Problemas con el acceso',
        content: 'Contacta con Alex: +34 XXX XXX XXX. Describe qué ocurre exactamente.',
        type: 'TEXT',
        order: 4
      }
    ]
  },
  {
    id: 'wifi',
    name: 'WiFi',
    description: 'Conexión a internet',
    icon: 'wifi',
    order: 2,
    steps: [
      {
        title: 'Datos de conexión',
        content: 'Red: MiWiFi_5G | Contraseña: 12345678',
        type: 'TEXT',
        order: 1
      },
      {
        title: 'Cómo conectarte',
        content: 'Busca la red en tu dispositivo. Introduce la contraseña. Listo!',
        type: 'TEXT',
        order: 2
      }
    ]
  }
]