/** @jsxImportSource react */
import * as React from 'react'

interface NivelDay5EmailProps {
  name: string
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'profesional'
}

// Casos de estudio por nivel
const NIVEL_CASOS: Record<string, {
  titulo: string
  persona: {
    nombre: string
    ubicacion: string
    situacion: string
  }
  problema: string
  antes: Array<{ label: string; value: string }>
  solucion: {
    intro: string
    acciones: Array<{ emoji: string; title: string; desc: string }>
  }
  despues: Array<{ label: string; value: string }>
  resultado: string
  leccion: string
  ctaText: string
}> = {
  principiante: {
    titulo: 'De Cero a Primera Reserva en 48 Horas',
    persona: {
      nombre: 'Ana',
      ubicacion: 'Valencia',
      situacion: 'Primera vez como anfitriona, apartamento heredado'
    },
    problema: 'Publicó su anuncio en Airbnb pero después de 2 semanas: 0 reservas, 150 visitas, 3 consultas sin conversión.',
    antes: [
      { label: 'Reservas', value: '0 en 2 semanas' },
      { label: 'Visitas al anuncio', value: '150' },
      { label: 'Tasa de conversión', value: '0%' },
      { label: 'Reviews', value: '0 (cuenta nueva)' }
    ],
    solucion: {
      intro: 'Ana hizo 3 cambios basados en su perfil de principiante:',
      acciones: [
        {
          emoji: '📸',
          title: 'Fotos profesionales vía Airbnb (150€)',
          desc: 'Contrató fotógrafo a través de la plataforma. Airbnb detectó la mejora y le dio boost en búsquedas.'
        },
        {
          emoji: '💰',
          title: 'Precio inicial 30% por debajo del mercado',
          desc: 'Mercado: 85€/noche. Ana puso 59€/noche durante el primer mes para conseguir reviews rápido.'
        },
        {
          emoji: '⚡',
          title: 'Respuesta instantánea activada',
          desc: 'Configuró respuestas rápidas y activó notificaciones. Tiempo de respuesta: menos de 30 min.'
        }
      ]
    },
    despues: [
      { label: 'Primera reserva', value: 'A las 48h del cambio' },
      { label: 'Reservas primer mes', value: '8 (24 noches)' },
      { label: 'Reviews conseguidas', value: '7 de 5★' },
      { label: 'Precio actual', value: '82€/noche (↑39%)' }
    ],
    resultado: 'Después de conseguir 7 reviews de 5★, Ana subió el precio gradualmente. Ahora está al nivel del mercado con 85% de ocupación.',
    leccion: 'Los principiantes necesitan momentum. Precio bajo inicial + fotos profesionales + respuesta rápida = reviews. Una vez tienes reviews, subes precio.',
    ctaText: '¿Todavía no has hecho el test de perfil? Descubre tu estrategia personalizada'
  },
  intermedio: {
    titulo: 'De 800€/mes a 1,340€/mes en el Mismo Apartamento',
    persona: {
      nombre: 'Laura',
      ubicacion: 'Barcelona',
      situacion: '18 meses como anfitriona, 2 apartamentos'
    },
    problema: '"Tengo el 90% de ocupación pero gano menos de lo que debería. Mis vecinos con menos ocupación ganan más que yo."',
    antes: [
      { label: 'Ocupación', value: '90%' },
      { label: 'Precio promedio', value: '65€/noche' },
      { label: 'Ingresos mensuales', value: '1,755€ brutos' },
      { label: 'RevPAR', value: '58.5€' }
    ],
    solucion: {
      intro: 'Laura optimizó 3 elementos clave:',
      acciones: [
        {
          emoji: '📊',
          title: 'Pricing dinámico basado en eventos',
          desc: 'Identificó 15 eventos anuales en BCN. Subió precios 40-60% esas fechas. Resultado: +380€ en un solo fin de semana (Mobile World Congress).'
        },
        {
          emoji: '📸',
          title: 'Actualización de fotos profesionales',
          desc: 'Renovó fotos (300€ vía Airbnb). Pasó de 6 fotos básicas a 40 profesionales con exteriores y walking map. Boost inmediato en algoritmo.'
        },
        {
          emoji: '🏠',
          title: 'Pequeñas mejoras de alto impacto',
          desc: 'Cerraduras Yacan con telefonillo (900€), amenities premium (50€/mes). Justificó subida de precio base de 65€ a 75€.'
        }
      ]
    },
    despues: [
      { label: 'Ocupación', value: '88%' },
      { label: 'Precio promedio', value: '85€/noche' },
      { label: 'Ingresos mensuales', value: '2,244€ brutos' },
      { label: 'RevPAR', value: '74.8€' }
    ],
    resultado: 'Incremento de 489€/mes (+27.8%) con 2% menos de ocupación. ROI de la inversión: recuperado en 3 meses.',
    leccion: 'Los intermedios deben dejar de optimizar ocupación y empezar a optimizar RevPAR. Menos huéspedes de mayor valor = más ingresos con menos trabajo.',
    ctaText: '¿Eres ESTRATEGA como Laura? Descúbrelo en el test'
  },
  avanzado: {
    titulo: 'De 8 a 15 Propiedades Sin Contratar a Nadie',
    persona: {
      nombre: 'David',
      ubicacion: 'Madrid',
      situacion: '3 años de experiencia, 8 propiedades gestionadas'
    },
    problema: 'Trabajaba 55h/semana apagando fuegos. Cada nueva propiedad multiplicaba el caos. No podía crecer sin perder calidad o contratar equipo (sin margen para ello).',
    antes: [
      { label: 'Propiedades', value: '8' },
      { label: 'Horas/semana', value: '55h' },
      { label: 'Emergencias/mes', value: '12-15' },
      { label: 'Ingresos netos', value: '4,200€/mes' }
    ],
    solucion: {
      intro: 'David implementó 3 sistemas antes de crecer:',
      acciones: [
        {
          emoji: '📋',
          title: 'SOPs documentados para TODO',
          desc: 'Creó 8 procedimientos: limpieza, check-in, mantenimiento preventivo, emergencias. Notion con checklist y videos. Cualquiera puede ejecutarlos.'
        },
        {
          emoji: '🤖',
          title: 'Automatización completa de comunicación',
          desc: 'Mensajes automáticos: confirmación, instrucciones, check-out, review. Solo responde consultas específicas. Reduce 15h/semana.'
        },
        {
          emoji: '👥',
          title: 'Red de freelancers con SOPs',
          desc: 'Contrató freelancers por tarea (limpieza, pequeño mantenimiento) siguiendo sus SOPs. Sin empleados fijos, solo costes variables.'
        }
      ]
    },
    despues: [
      { label: 'Propiedades', value: '15' },
      { label: 'Horas/semana', value: '30h' },
      { label: 'Emergencias/mes', value: '3-4' },
      { label: 'Ingresos netos', value: '8,100€/mes' }
    ],
    resultado: 'Casi duplicó propiedades, casi duplicó ingresos, trabajando 45% menos tiempo. Las emergencias bajaron porque el mantenimiento preventivo (ahora documentado) funciona.',
    leccion: 'Los avanzados no necesitan crecer para ganar más. Necesitan sistemas para poder crecer sin caos. Primero sistemas, después crecimiento.',
    ctaText: '¿Listo para sistematizar? Descubre tu perfil operativo'
  },
  profesional: {
    titulo: 'De 12 Propiedades Estancadas a 25 con Revenue Management',
    persona: {
      nombre: 'Carlos',
      ubicacion: 'Málaga',
      situacion: '5+ años, portfolio de 12 propiedades, estancado 2 años'
    },
    problema: 'Tenía operaciones rodadas pero sentía que había tocado techo. No sabía cómo duplicar sin duplicar problemas. Competencia nueva con precios agresivos.',
    antes: [
      { label: 'Propiedades', value: '12' },
      { label: 'RevPAR promedio', value: '68€' },
      { label: 'Ocupación promedio', value: '78%' },
      { label: 'Ingresos netos', value: '11,500€/mes' }
    ],
    solucion: {
      intro: 'Carlos implementó estrategias del top 5%:',
      acciones: [
        {
          emoji: '🎯',
          title: 'Segmentación de portfolio por estrategia',
          desc: '4 propiedades Flagship (precio alto, experiencia premium). 8 propiedades Volume (ocupación alta, precio medio). KPIs diferentes para cada segmento.'
        },
        {
          emoji: '📈',
          title: 'Revenue management predictivo',
          desc: 'Herramienta de pricing que analiza eventos, competencia, históricos. Ajusta precios 30-60 días antes. Captura demanda antes que la competencia.'
        },
        {
          emoji: '🤝',
          title: 'Negociación con proveedores por volumen',
          desc: 'Limpieza: de 35€ a 28€/servicio. Amenities: 40% descuento por compra anual. Mantenimiento: contrato anual con 20% descuento.'
        }
      ]
    },
    despues: [
      { label: 'Propiedades', value: '25 (+13 en 18 meses)' },
      { label: 'RevPAR promedio', value: '82€ (+20.5%)' },
      { label: 'Ocupación promedio', value: '81%' },
      { label: 'Ingresos netos', value: '28,400€/mes' }
    ],
    resultado: 'Más que duplicó el portfolio Y aumentó RevPAR. Los ahorros en proveedores financiaron parte del crecimiento. Mismo equipo operativo (sistemas escalables).',
    leccion: 'Los profesionales deben dejar de gestionar propiedades y empezar a gestionar un portfolio. Estrategias diferenciadas, pricing avanzado, economías de escala.',
    ctaText: 'Descubre si eres ESTRATEGA, EJECUTOR o SISTEMÁTICO'
  }
}

export default function NivelDay5Email({ name, nivel }: NivelDay5EmailProps) {
  const caso = NIVEL_CASOS[nivel]

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2563eb', fontSize: '24px', marginBottom: '10px' }}>
          Itineramio
        </h1>
      </div>

      {/* Saludo */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        Hola {name},
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        Hoy quiero compartir un caso real de alguien en tu misma situación:
      </p>

      {/* Título del caso */}
      <h2 style={{ color: '#1f2937', fontSize: '24px', marginTop: '25px', marginBottom: '20px', textAlign: 'center' }}>
        {caso.titulo}
      </h2>

      {/* Persona */}
      <div style={{
        background: '#f0fdf4',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '25px'
      }}>
        <p style={{ fontSize: '16px', color: '#166534', marginBottom: '8px' }}>
          <strong>{caso.persona.nombre}</strong> - {caso.persona.ubicacion}
        </p>
        <p style={{ fontSize: '15px', color: '#15803d', margin: 0 }}>
          {caso.persona.situacion}
        </p>
      </div>

      {/* Problema */}
      <h3 style={{ color: '#dc2626', fontSize: '18px', marginBottom: '12px' }}>
        ❌ El Problema
      </h3>
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginBottom: '25px' }}>
        {caso.problema}
      </p>

      {/* Antes */}
      <h3 style={{ color: '#ea580c', fontSize: '18px', marginBottom: '15px' }}>
        📊 Situación Inicial
      </h3>
      <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        {caso.antes.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', color: '#7c2d12' }}>{item.label}:</span>
            <strong style={{ fontSize: '15px', color: '#9a3412' }}>{item.value}</strong>
          </div>
        ))}
      </div>

      {/* Solución */}
      <h3 style={{ color: '#2563eb', fontSize: '18px', marginBottom: '12px' }}>
        💡 La Solución
      </h3>
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginBottom: '20px' }}>
        {caso.solucion.intro}
      </p>
      <div style={{ marginBottom: '25px' }}>
        {caso.solucion.acciones.map((accion, idx) => (
          <div
            key={idx}
            style={{
              background: '#eff6ff',
              padding: '18px',
              borderRadius: '8px',
              marginBottom: '12px',
              borderLeft: '4px solid #3b82f6'
            }}
          >
            <h4 style={{ color: '#1e40af', fontSize: '16px', marginTop: 0, marginBottom: '8px' }}>
              {accion.emoji} {accion.title}
            </h4>
            <p style={{ fontSize: '15px', color: '#1e3a8a', margin: 0 }}>
              {accion.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Después */}
      <h3 style={{ color: '#059669', fontSize: '18px', marginBottom: '15px' }}>
        ✅ Resultados
      </h3>
      <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        {caso.despues.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', color: '#065f46' }}>{item.label}:</span>
            <strong style={{ fontSize: '15px', color: '#047857' }}>{item.value}</strong>
          </div>
        ))}
      </div>

      {/* Resultado final */}
      <div style={{
        background: '#fef3c7',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '25px',
        borderLeft: '4px solid #f59e0b'
      }}>
        <p style={{ fontSize: '16px', color: '#78350f', margin: 0 }}>
          <strong>📈 Resultado:</strong> {caso.resultado}
        </p>
      </div>

      {/* Lección */}
      <div style={{
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h4 style={{ color: '#374151', fontSize: '16px', marginTop: 0, marginBottom: '10px' }}>
          💎 La Lección Clave
        </h4>
        <p style={{ fontSize: '15px', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
          {caso.leccion}
        </p>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '25px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '12px', marginTop: 0 }}>
          {caso.ctaText}
        </h3>
        <p style={{ fontSize: '15px', marginBottom: '20px', opacity: 0.95 }}>
          2 minutos para conocer tu perfil y recibir tu estrategia personalizada
        </p>
        <a
          href="https://itineramio.com/host-profile/test"
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#667eea',
            padding: '14px 32px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Hacer el Test (2 min) →
        </a>
      </div>

      {/* Cierre */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        En 2 días te envío más contenido relevante.
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        Un abrazo,<br />
        <strong>El equipo de Itineramio</strong>
      </p>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        marginTop: '40px',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <p>
          Itineramio - Casos reales de anfitriones como tú
        </p>
        <p style={{ marginTop: '10px' }}>
          <a href="https://itineramio.com" style={{ color: '#2563eb', textDecoration: 'none' }}>
            itineramio.com
          </a>
        </p>
      </div>
    </div>
  )
}

// Subject line helper
export function getNivelDay5Subject(nivel: string): string {
  const subjects: Record<string, string> = {
    principiante: '🚀 Caso real: De 0 a primera reserva en 48 horas',
    intermedio: '📊 Caso Laura: +540€/mes en el mismo apartamento',
    avanzado: '⭐ Caso David: De 8 a 15 propiedades sin contratar',
    profesional: '🏆 Caso Carlos: De 12 a 25 propiedades con revenue management'
  }
  return subjects[nivel] || '📈 Caso de éxito: anfitrión como tú'
}
