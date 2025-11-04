// Quiz Academia Itineramio - 20 preguntas
// Distribución: FUNDAMENTOS (8 × 3pts = 24), OPTIMIZACIÓN (8 × 4pts = 32), AVANZADO (4 × 11pts = 44)
// Niveles: BASIC (0-50), INTERMEDIATE (51-79), ADVANCED (80-100)

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  partialPoints?: number // Para respuestas parcialmente correctas
}

export interface QuizQuestion {
  id: number
  category: 'FUNDAMENTOS' | 'OPTIMIZACIÓN' | 'AVANZADO'
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
  points: number
  question: string
  type: 'single-choice' | 'multiple-choice' | 'scale'
  options: QuizOption[]
  explanation?: string
}

export const quizQuestions: QuizQuestion[] = [
  // ============================================
  // FUNDAMENTOS (8 preguntas × 3pts = 24pts)
  // ============================================
  {
    id: 1,
    category: 'FUNDAMENTOS',
    difficulty: 'BASIC',
    points: 3,
    question: 'Un huésped rompe la vitrocerámica de tu cocina y te ofrece pagarlo por WhatsApp "para hacerlo más rápido". ¿Qué debes hacer?',
    type: 'single-choice',
    options: [
      {
        id: 'q1-a',
        text: 'Aceptar el pago por WhatsApp, es más cómodo',
        isCorrect: false
      },
      {
        id: 'q1-b',
        text: 'Agradecerle amablemente su predisposición pero derivarlo al chat de Airbnb',
        isCorrect: true
      },
      {
        id: 'q1-c',
        text: 'Ignorar el daño, es solo una vitrocerámica',
        isCorrect: false
      },
      {
        id: 'q1-d',
        text: 'Reportarlo directamente a Airbnb sin hablar con el huésped',
        isCorrect: false
      }
    ],
    explanation: 'Siempre debes usar el chat de Airbnb para cualquier pago o resolución, ya que seguramente recibirás un pago injustificado por transferencia y en Airbnb el balance de ingresos tendrá correlación. Además, si surge algún imprevisto quedará todo reflejado en la plataforma y podrás defenderte.'
  },
  {
    id: 2,
    category: 'FUNDAMENTOS',
    difficulty: 'BASIC',
    points: 3,
    question: 'Un huésped se queja de que "faltaba champú" y te deja 4★ aunque sí lo había. ¿Qué deberías haber hecho y qué debes hacer ahora?',
    type: 'multiple-choice',
    options: [
      {
        id: 'q2-a',
        text: 'Ignorar el comentario, las reseñas no se eliminan',
        isCorrect: false
      },
      {
        id: 'q2-b',
        text: 'Debes siempre enviarle un mensaje a su llegada o a la mañana siguiente (si haces check in presencial) y asegurarte de que todo está de su agrado. En estancias largas también es conveniente preguntar a mitad de estancia si necesita ropa de cama adicional, algún consumible, etc.',
        isCorrect: true
      },
      {
        id: 'q2-c',
        text: 'Responder de forma profesional públicamente a la reseña y aprovechar tanto para agradecer su feedback como para destacar elementos de tu apartamento como por ejemplo que también dejas papel higiénico, ropa de cama, gel y por supuesto champú. Así tus huéspedes no solo verán tu amabilidad sino detectarán que el huésped seguramente tuvo un error o despiste',
        isCorrect: true
      },
      {
        id: 'q2-d',
        text: 'Rellenar el formulario de disputa de reseñas inmediatamente',
        isCorrect: false
      }
    ],
    explanation: 'Puede costarte pocos euros pero la experiencia será de 10. Un mensaje de cortesía al día siguiente permite corregir pequeños problemas antes de que se conviertan en reseñas negativas. Si la reseña ya se publicó, responde profesionalmente destacando lo que sí ofreces.'
  },
  {
    id: 3,
    category: 'FUNDAMENTOS',
    difficulty: 'BASIC',
    points: 3,
    question: 'Has creado un logo para tu negocio. ¿Puedes ponerlo como marca de agua en las fotos de tu anuncio?',
    type: 'single-choice',
    options: [
      {
        id: 'q3-a',
        text: 'Sí, ayuda a construir marca',
        isCorrect: false
      },
      {
        id: 'q3-b',
        text: 'No, el algoritmo lo penaliza reduciendo tu visibilidad',
        isCorrect: true
      },
      {
        id: 'q3-c',
        text: 'Sí, si eres Superhost',
        isCorrect: false
      },
      {
        id: 'q3-d',
        text: 'Solo en las fotos interiores',
        isCorrect: false
      }
    ],
    explanation: 'Airbnb penaliza las fotos con marcas de agua, así que es mejor publicar imágenes limpias.'
  },
  {
    id: 4,
    category: 'FUNDAMENTOS',
    difficulty: 'BASIC',
    points: 3,
    question: 'Un huésped deja el aire acondicionado encendido todo el día y sube mucho la factura de la luz. ¿Puedes reclamar ese consumo extra a través de AirCover?',
    type: 'single-choice',
    options: [
      {
        id: 'q4-a',
        text: 'Sí, AirCover cubre consumos extraordinarios',
        isCorrect: false
      },
      {
        id: 'q4-b',
        text: 'No, AirCover NO cubre consumos de electricidad, agua o gas',
        isCorrect: true
      },
      {
        id: 'q4-c',
        text: 'Sí, si lo documentas con facturas',
        isCorrect: false
      },
      {
        id: 'q4-d',
        text: 'Solo si está reflejado en las normas de la casa',
        isCorrect: false
      }
    ],
    explanation: 'AirCover protege frente a daños a la propiedad pero excluye consumos excesivos de servicios básicos.'
  },
  {
    id: 5,
    category: 'FUNDAMENTOS',
    difficulty: 'BASIC',
    points: 3,
    question: 'Reclamas 200€ por daños y el huésped te deja 1★ por venganza. ¿Qué puedes hacer?',
    type: 'single-choice',
    options: [
      {
        id: 'q5-a',
        text: 'Nada, asumir la evaluación',
        isCorrect: false
      },
      {
        id: 'q5-b',
        text: 'Solicitar a Airbnb que elimine la reseña por "venganza"',
        isCorrect: true
      },
      {
        id: 'q5-c',
        text: 'Responder públicamente explicando la situación',
        isCorrect: false
      },
      {
        id: 'q5-d',
        text: 'Llamar a Airbnb para que penalicen al huésped',
        isCorrect: false
      }
    ],
    explanation: 'Airbnb puede eliminar una reseña si es claramente represalia tras una reclamación documentada.'
  },
  {
    id: 6,
    category: 'FUNDAMENTOS',
    difficulty: 'BASIC',
    points: 3,
    question: 'Un huésped te envía su número de teléfono por el chat de Airbnb y te pide que le llames "para coordinar la llegada". ¿Qué riesgo corres si lo llamas?',
    type: 'single-choice',
    options: [
      {
        id: 'q6-a',
        text: 'Ninguno, es normal coordinar por teléfono',
        isCorrect: false
      },
      {
        id: 'q6-b',
        text: 'Hay maneras de enviar el teléfono por el chat de Airbnb, pero el algoritmo puede detectarlo como intercambio de contactos y saltar una alerta, incluso podrían penalizarte o cerrar tu anuncio',
        isCorrect: true
      },
      {
        id: 'q6-c',
        text: 'Solo hay riesgo si tú compartes tu número primero',
        isCorrect: false
      },
      {
        id: 'q6-d',
        text: 'No hay problema tras la confirmación de reserva',
        isCorrect: false
      }
    ],
    explanation: 'Aunque hay maneras de compartir el teléfono por el chat de Airbnb, el algoritmo está diseñado para detectar intercambio de contactos y puede penalizarte severamente, incluso cerrando tu anuncio temporalmente.'
  },
  {
    id: 7,
    category: 'FUNDAMENTOS',
    difficulty: 'BASIC',
    points: 3,
    question: 'Un huésped te pide dejar el alojamiento a las 15:00 en vez de a las 11:00 porque su vuelo sale tarde. La siguiente reserva entra a las 16:00. ¿Cómo debes gestionarlo?',
    type: 'single-choice',
    options: [
      {
        id: 'q7-a',
        text: 'Aceptar sin cargo, es un favor pequeño',
        isCorrect: false
      },
      {
        id: 'q7-b',
        text: 'Rechazar siempre',
        isCorrect: false
      },
      {
        id: 'q7-c',
        text: 'Explicarle que necesitas tiempo para limpiar y desinfectar el alojamiento, ofrecerle una alternativa como dejar las maletas durante el tiempo que estimes oportuno (por ejemplo cuando el equipo de limpieza está limpiando) u ofrecerle una consigna de maletas cerca del alojamiento con un descuento por ser huésped de tu alojamiento',
        isCorrect: true
      },
      {
        id: 'q7-d',
        text: 'Aceptar solo si el huésped tiene buenas valoraciones',
        isCorrect: false
      }
    ],
    explanation: 'Los check-outs tardíos afectan a tu equipo de limpieza y a la siguiente reserva. La mejor práctica es ser empático pero firme con los horarios, ofreciendo alternativas prácticas como guardar las maletas mientras se limpia o usar una consigna cercana con descuento.'
  },
  {
    id: 8,
    category: 'FUNDAMENTOS',
    difficulty: 'BASIC',
    points: 3,
    question: '¿Qué cinco requisitos oficiales exige Airbnb para ser Superhost?',
    type: 'multiple-choice',
    options: [
      {
        id: 'q8-a',
        text: 'Responder al 90% o más de las consultas',
        isCorrect: true
      },
      {
        id: 'q8-b',
        text: 'Aceptar al menos el 88% de las solicitudes',
        isCorrect: true
      },
      {
        id: 'q8-c',
        text: 'Tener al menos 10 reservas (o 3 estancias de 100 noches) en el último año',
        isCorrect: true
      },
      {
        id: 'q8-d',
        text: 'Mantener una puntuación media ≥4,8★',
        isCorrect: true
      },
      {
        id: 'q8-e',
        text: 'No cancelar reservas (0%)',
        isCorrect: true
      },
      {
        id: 'q8-f',
        text: 'Activar Instant Book',
        isCorrect: false
      }
    ],
    explanation: 'Estos cinco criterios son obligatorios; Instant Book no es requisito, aunque mejora la visibilidad.'
  },

  // ============================================
  // OPTIMIZACIÓN (8 preguntas × 4pts = 32pts)
  // ============================================
  {
    id: 9,
    category: 'OPTIMIZACIÓN',
    difficulty: 'INTERMEDIATE',
    points: 4,
    question: '¿Cómo NO se puede calcular la tarifa de mascotas en Airbnb?',
    type: 'single-choice',
    options: [
      {
        id: 'q9-a',
        text: 'Tarifa fija por reserva',
        isCorrect: false
      },
      {
        id: 'q9-b',
        text: 'Tarifa porcentual sobre el total de la reserva',
        isCorrect: true
      },
      {
        id: 'q9-c',
        text: 'Tarifa fija por mascota',
        isCorrect: false
      },
      {
        id: 'q9-d',
        text: 'Tarifa fija por mascota y por noche',
        isCorrect: false
      }
    ],
    explanation: 'Airbnb permite fijar la tarifa de mascota como importe por reserva, por mascota, por noche o por mascota y noche. No existe una tarifa porcentual sobre el total.'
  },
  {
    id: 10,
    category: 'OPTIMIZACIÓN',
    difficulty: 'INTERMEDIATE',
    points: 4,
    question: '¿Cuál de estos títulos es mejor según las recomendaciones de Airbnb?',
    type: 'single-choice',
    options: [
      {
        id: 'q10-a',
        text: '¡Apartamento increíble! ¡Oferta única!',
        isCorrect: false
      },
      {
        id: 'q10-b',
        text: 'Luminoso loft con terraza en el centro de Sevilla',
        isCorrect: true
      },
      {
        id: 'q10-c',
        text: 'La mejor casa de Sevilla, fantástico 100% garantizado',
        isCorrect: false
      },
      {
        id: 'q10-d',
        text: 'Apartamento',
        isCorrect: false
      }
    ],
    explanation: 'Un título debe ser descriptivo y realista, no usar superlativos exagerados y medir menos de 50 caracteres.'
  },
  {
    id: 11,
    category: 'OPTIMIZACIÓN',
    difficulty: 'INTERMEDIATE',
    points: 4,
    question: '¿Cuántas fotos recomiendan como mínimo y por qué?',
    type: 'single-choice',
    options: [
      {
        id: 'q11-a',
        text: '5, para ir rápido',
        isCorrect: false
      },
      {
        id: 'q11-b',
        text: '10, una por estancia',
        isCorrect: false
      },
      {
        id: 'q11-c',
        text: '20 o más, porque el algoritmo valora variedad y calidad',
        isCorrect: true
      },
      {
        id: 'q11-d',
        text: 'No hay recomendación',
        isCorrect: false
      }
    ],
    explanation: 'Invertir en al menos 20 fotos de calidad mejora la percepción del anuncio y el posicionamiento.'
  },
  {
    id: 12,
    category: 'OPTIMIZACIÓN',
    difficulty: 'INTERMEDIATE',
    points: 4,
    question: '¿Cuántos días tienes para abrir una reclamación de daños tras la salida del huésped?',
    type: 'single-choice',
    options: [
      {
        id: 'q12-a',
        text: '7 días',
        isCorrect: false
      },
      {
        id: 'q12-b',
        text: '14 días',
        isCorrect: true
      },
      {
        id: 'q12-c',
        text: '30 días',
        isCorrect: false
      },
      {
        id: 'q12-d',
        text: 'No hay límite',
        isCorrect: false
      }
    ],
    explanation: 'Airbnb establece un plazo de 14 días para iniciar el caso en el Centro de Resoluciones.'
  },
  {
    id: 13,
    category: 'OPTIMIZACIÓN',
    difficulty: 'INTERMEDIATE',
    points: 4,
    question: '¿Cuál es la principal ventaja de ofrecer a tus huéspedes un manual digital (guía de bienvenida) y una tarjeta de Wi-Fi?',
    type: 'single-choice',
    options: [
      {
        id: 'q13-a',
        text: 'Decorar la casa',
        isCorrect: false
      },
      {
        id: 'q13-b',
        text: 'Reducir consultas y llamadas porque toda la información está accesible',
        isCorrect: true
      },
      {
        id: 'q13-c',
        text: 'Cobrar más sin mejorar nada',
        isCorrect: false
      },
      {
        id: 'q13-d',
        text: 'No tiene utilidad',
        isCorrect: false
      }
    ],
    explanation: 'Una guía completa reduce preguntas frecuentes y mejora la experiencia del huésped.'
  },
  {
    id: 14,
    category: 'OPTIMIZACIÓN',
    difficulty: 'INTERMEDIATE',
    points: 4,
    question: 'Si gestionas tu anuncio de Airbnb a través de un software de gestión de propiedades (PMS) u hotelería profesional, ¿qué comisión cobra Airbnb al anfitrión por reserva?',
    type: 'single-choice',
    options: [
      {
        id: 'q14-a',
        text: 'Aproximadamente 3%',
        isCorrect: false
      },
      {
        id: 'q14-b',
        text: 'Aproximadamente 15,5%',
        isCorrect: true
      },
      {
        id: 'q14-c',
        text: 'Entre 14,1% y 16,5%',
        isCorrect: false
      },
      {
        id: 'q14-d',
        text: '0% (Airbnb lo factura al huésped)',
        isCorrect: false
      }
    ],
    explanation: 'Los anfitriones que usan un PMS o se consideran "hotelería tradicional" pagan una tarifa única al anfitrión de alrededor del 15,5% (16% en Brasil) a partir de 2025.'
  },
  {
    id: 15,
    category: 'OPTIMIZACIÓN',
    difficulty: 'INTERMEDIATE',
    points: 4,
    question: 'En el modelo de comisión compartida (antes de que se implante el 15,5%), ¿cuánto cobra Airbnb al anfitrión y cuánto al huésped?',
    type: 'single-choice',
    options: [
      {
        id: 'q15-a',
        text: '10% al anfitrión y 10% al huésped',
        isCorrect: false
      },
      {
        id: 'q15-b',
        text: '3% al anfitrión y entre 14,1% y 16,5% al huésped',
        isCorrect: true
      },
      {
        id: 'q15-c',
        text: '5% al anfitrión y 5% al huésped',
        isCorrect: false
      },
      {
        id: 'q15-d',
        text: '0% al anfitrión y 20% al huésped',
        isCorrect: false
      }
    ],
    explanation: 'En el modelo compartido, el anfitrión paga un 3% sobre el importe (4% en Brasil) y el huésped paga aproximadamente entre 14,1% y 16,5% de la suma de noche más tarifas.'
  },
  {
    id: 16,
    category: 'OPTIMIZACIÓN',
    difficulty: 'INTERMEDIATE',
    points: 4,
    question: '¿Qué herramientas son útiles para gestionar de manera eficiente múltiples alojamientos?',
    type: 'multiple-choice',
    options: [
      {
        id: 'q16-a',
        text: 'Software de gestión de propiedades (PMS) con gestor de canales integrado',
        isCorrect: true
      },
      {
        id: 'q16-b',
        text: 'Herramientas de pricing dinámico y automatización de tarifas',
        isCorrect: true
      },
      {
        id: 'q16-c',
        text: 'Aplicaciones para coordinar la limpieza y tareas del personal',
        isCorrect: true
      },
      {
        id: 'q16-d',
        text: 'Publicar anuncios en redes sociales personales',
        isCorrect: false
      }
    ],
    explanation: 'Un PMS permite sincronizar calendarios y reservas en múltiples plataformas, las herramientas de pricing dinámico (como PriceLabs) ajustan tarifas en función de la demanda, y las apps de coordinación de limpieza ayudan a automatizar tareas. Publicar en redes sociales no es un sistema de gestión profesional.'
  },

  // ============================================
  // AVANZADO (4 preguntas × 11pts = 44pts)
  // ============================================
  {
    id: 17,
    category: 'AVANZADO',
    difficulty: 'ADVANCED',
    points: 11,
    question: '¿Qué elementos de seguridad son obligatorios o recomendables para tu alojamiento turístico?',
    type: 'multiple-choice',
    options: [
      {
        id: 'q17-a',
        text: 'Detector de humo',
        isCorrect: true
      },
      {
        id: 'q17-b',
        text: 'Extintor',
        isCorrect: true
      },
      {
        id: 'q17-c',
        text: 'Plan de evacuación o indicaciones de salida de emergencia',
        isCorrect: true
      },
      {
        id: 'q17-d',
        text: 'Conexión Wi-Fi y televisión por cable',
        isCorrect: false
      }
    ],
    explanation: 'La normativa exige detector de humo, extintor y plan de evacuación. El Wi-Fi es un servicio, no un requisito de seguridad.'
  },
  {
    id: 18,
    category: 'AVANZADO',
    difficulty: 'ADVANCED',
    points: 11,
    question: '¿Qué porcentaje aproximado de tus ingresos deberías reservar para cubrir gastos operativos y comisiones?',
    type: 'single-choice',
    options: [
      {
        id: 'q18-a',
        text: '5%-10%',
        isCorrect: false
      },
      {
        id: 'q18-b',
        text: '15%-20%',
        isCorrect: false
      },
      {
        id: 'q18-c',
        text: '30%-40%',
        isCorrect: true
      },
      {
        id: 'q18-d',
        text: 'Más del 50%',
        isCorrect: false
      }
    ],
    explanation: 'Entre un 30% y un 40% de los ingresos se destinan a gastos (limpieza, suministros, comisiones).'
  },
  {
    id: 19,
    category: 'AVANZADO',
    difficulty: 'ADVANCED',
    points: 11,
    question: 'Compara agosto (31 días, 90% de ocupación a 100€/noche) y septiembre (30 días, 60% de ocupación a 150€/noche). ¿Cuál fue más rentable?',
    type: 'single-choice',
    options: [
      {
        id: 'q19-a',
        text: 'Agosto: 2.790€',
        isCorrect: false
      },
      {
        id: 'q19-b',
        text: 'Septiembre: 2.700€',
        isCorrect: false
      },
      {
        id: 'q19-c',
        text: 'Prácticamente igual, solo 90€ de diferencia',
        isCorrect: true
      },
      {
        id: 'q19-d',
        text: 'Agosto porque más ocupación = mejor ranking',
        isCorrect: false
      }
    ],
    explanation: 'Agosto genera 2.790€ (31 × 0,9 × 100) y septiembre 2.700€ (30 × 0,6 × 150); la diferencia es mínima.'
  },
  {
    id: 20,
    category: 'AVANZADO',
    difficulty: 'ADVANCED',
    points: 11,
    question: 'Activas "Reserva inmediata" y tus reservas suben un 40%, pero recibes un huésped conflictivo. ¿Cómo minimizar riesgos al usar Instant Book?',
    type: 'single-choice',
    options: [
      {
        id: 'q20-a',
        text: 'No usar Instant Book nunca',
        isCorrect: false
      },
      {
        id: 'q20-b',
        text: 'No se puede filtrar, es un riesgo asumido',
        isCorrect: false
      },
      {
        id: 'q20-c',
        text: 'Configurar filtros para aceptar solo huéspedes con reseñas positivas y verificación de identidad',
        isCorrect: true
      },
      {
        id: 'q20-d',
        text: 'Contratar un seguro adicional obligatorio',
        isCorrect: false
      }
    ],
    explanation: 'Al activar Instant Book puedes aplicar filtros (huéspedes con verificación ID y valoraciones positivas) para reducir los riesgos.'
  }
]

// Función para calcular el nivel según la puntuación
export function calculateLevel(score: number): {
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
  badge: string
  color: string
  message: string
  recommendations: string[]
} {
  if (score >= 80) {
    return {
      level: 'ADVANCED',
      badge: '🏆',
      color: 'from-yellow-400 to-orange-500',
      message: '¡Impresionante! Ya dominas Airbnb. Nuestro curso te dará las últimas estrategias y el certificado oficial que te diferenciará de la competencia.',
      recommendations: [
        'Acceso directo a Módulos 3 y 4 (Gestión Avanzada)',
        'Contenido exclusivo de monetización y escalado',
        'Fast-track para certificación Superhost'
      ]
    }
  } else if (score >= 51) {
    return {
      level: 'INTERMEDIATE',
      badge: '🏠',
      color: 'from-blue-400 to-cyan-500',
      message: '¡Ya tienes experiencia! Pero aún hay técnicas avanzadas que pueden multiplicar tus ingresos. Descubre los secretos de los Superhosts.',
      recommendations: [
        'Resumen rápido del Módulo 1 (puedes saltarlo)',
        'Enfoque en Módulos 2 y 3 (Optimización y Pricing)',
        'Casos de estudio de hosts que aumentaron 40% sus ingresos'
      ]
    }
  } else {
    return {
      level: 'BASIC',
      badge: '🌱',
      color: 'from-green-400 to-emerald-500',
      message: '¡Perfecto momento para empezar! Tienes las bases pero hay mucho por descubrir. Nuestro curso te llevará de 0 a Superhost paso a paso.',
      recommendations: [
        'Empieza por el Módulo 1 completo (Fundamentos)',
        'Videos introductorios y guías descargables',
        'Checklist de primeros pasos para tu primera propiedad'
      ]
    }
  }
}

// Función para calcular puntuación de una respuesta
export function calculateQuestionScore(
  question: QuizQuestion,
  selectedAnswers: string[]
): number {
  if (question.type === 'single-choice') {
    const selectedOption = question.options.find(opt => opt.id === selectedAnswers[0])
    if (!selectedOption) return 0

    if (selectedOption.isCorrect) {
      return question.points
    } else if (selectedOption.partialPoints) {
      return selectedOption.partialPoints
    }
    return 0
  }

  if (question.type === 'multiple-choice') {
    const correctOptions = question.options.filter(opt => opt.isCorrect)
    const selectedCorrect = selectedAnswers.filter(id =>
      correctOptions.some(opt => opt.id === id)
    ).length

    const totalCorrect = correctOptions.length
    const percentage = selectedCorrect / totalCorrect

    // Penalizar por respuestas incorrectas seleccionadas
    const incorrectSelected = selectedAnswers.filter(id =>
      !correctOptions.some(opt => opt.id === id)
    ).length

    if (incorrectSelected > 0) {
      return 0 // Si selecciona alguna incorrecta, 0 puntos
    }

    // Puntuación proporcional
    if (percentage === 1) return question.points // Todas correctas
    if (percentage >= 0.8) return Math.floor(question.points * 0.7) // 80%+ = 70% puntos
    if (percentage >= 0.6) return Math.floor(question.points * 0.5) // 60%+ = 50% puntos
    return 0
  }

  return 0
}
