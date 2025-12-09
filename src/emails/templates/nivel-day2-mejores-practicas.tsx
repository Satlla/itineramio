/** @jsxImportSource react */
import * as React from 'react'

interface NivelDay2EmailProps {
  name: string
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'profesional'
}

// Mejores prácticas por nivel
const NIVEL_PRACTICES: Record<string, {
  titulo: string
  intro: string
  practices: Array<{
    emoji: string
    title: string
    desc: string
    consejo: string
  }>
  warning: {
    title: string
    desc: string
  }
}> = {
  principiante: {
    titulo: 'Las 3 Mejores Prácticas que Marcan la Diferencia',
    intro: 'He visto a cientos de principiantes. Los que triunfan hacen estas 3 cosas desde el día 1:',
    practices: [
      {
        emoji: '⚡',
        title: 'Responde en menos de 1 hora',
        desc: 'El algoritmo de Airbnb premia la velocidad de respuesta. Cada minuto cuenta.',
        consejo: 'Activa las notificaciones push. Usa respuestas rápidas predefinidas para las 5 preguntas más comunes.'
      },
      {
        emoji: '📸',
        title: 'Invierte en fotos profesionales YA',
        desc: 'No es un gasto, es una inversión. Las fotos profesionales aumentan reservas un 40%.',
        consejo: 'Si contratas por Airbnb, el algoritmo lo detecta y te da boost extra. 150€ que se pagan solos en 2 semanas.'
      },
      {
        emoji: '🎯',
        title: 'Precio bajo al principio = reviews rápido',
        desc: 'Las primeras 3-5 reviews son CRÍTICAS. Sin ellas, no existes.',
        consejo: 'Empieza 20-30% por debajo del mercado durante el primer mes. Una vez tengas 5 reviews de 5★, sube el precio.'
      }
    ],
    warning: {
      title: '❌ El error fatal del 90% de principiantes',
      desc: 'Poner precio "normal" desde el día 1. Sin reviews, nadie te reserva. Sin reservas, no consigues reviews. Es un círculo vicioso. Rompe el círculo con precio bajo inicial.'
    }
  },
  intermedio: {
    titulo: 'Cómo Pasar de "Funciona" a "Optimizado"',
    intro: 'Ya tienes experiencia. Ahora toca pulir los detalles que separan el 70% de ocupación del 90%:',
    practices: [
      {
        emoji: '📊',
        title: 'Trackea RevPAR, no ocupación',
        desc: 'Ocupación alta no significa ingresos altos. RevPAR (Revenue Per Available Room) es la métrica real.',
        consejo: 'Calcula: (Ingresos totales / Noches disponibles). Si tu RevPAR es bajo con ocupación alta, estás regalando dinero.'
      },
      {
        emoji: '🤖',
        title: 'Automatiza las tareas repetitivas',
        desc: 'Si pasas más de 10h/semana en tareas manuales, estás perdiendo dinero.',
        consejo: 'Prioriza: 1) Mensajes automáticos (check-in, check-out), 2) Pricing dinámico, 3) Cerraduras inteligentes. En ese orden.'
      },
      {
        emoji: '⭐',
        title: 'Reviews de 5★ no son suficientes',
        desc: 'Necesitas reviews LARGAS con keywords específicas que mejoren tu SEO interno.',
        consejo: 'Pide feedback específico: "¿Qué fue lo que más te gustó del apartamento?" en vez de "¿Nos dejas una review?"'
      }
    ],
    warning: {
      title: '⚠️ La trampa del anfitrión intermedio',
      desc: 'Optimizar ocupación en vez de ingresos. Puedes tener 95% de ocupación y ganar menos que alguien con 70% si tu precio es bajo. Enfócate en RevPAR, no en noches ocupadas.'
    }
  },
  avanzado: {
    titulo: 'Estrategias para Escalar Sin Quemarte',
    intro: 'Tienes la operación bajo control. Ahora el desafío es crecer sin perder calidad ni cordura:',
    practices: [
      {
        emoji: '📋',
        title: 'Documenta TODO en SOPs',
        desc: 'Si no está documentado, no se puede delegar. Si no se puede delegar, no puedes escalar.',
        consejo: 'Crea SOPs (Standard Operating Procedures) para: limpieza, check-in, mantenimiento, emergencias. Usa Notion o Google Docs con checklist.'
      },
      {
        emoji: '👥',
        title: 'Delega tareas operativas, no estratégicas',
        desc: 'Tú debes enfocarte en: pricing, marketing, expansión. Delega: limpieza, mensajes, mantenimiento.',
        consejo: 'Contrata freelancers por tarea (ej: responder mensajes 2h/día) antes de contratar full-time. Es más flexible y económico.'
      },
      {
        emoji: '💰',
        title: 'Diversifica fuentes de reservas',
        desc: 'Depender 100% de Airbnb es arriesgado. Booking.com, directo, corporativo.',
        consejo: 'Objetivo: máximo 70% de una sola plataforma. Crea web propia con motor de reservas para capturar directo (0% comisión).'
      }
    ],
    warning: {
      title: '🔥 El síndrome del "modo bombero"',
      desc: 'Trabajar 60h/semana apagando fuegos. Cada emergencia te consume. Sin sistemas, cada nueva propiedad multiplica el caos. Documenta primero, crece después.'
    }
  },
  profesional: {
    titulo: 'Optimización Avanzada para Profesionales',
    intro: 'Con múltiples propiedades, los pequeños detalles se multiplican. Aquí está lo que separa el 5% top:',
    practices: [
      {
        emoji: '🎯',
        title: 'Segmenta tu portfolio por estrategia',
        desc: 'No todas las propiedades deben seguir la misma estrategia de pricing.',
        consejo: 'Flagship (precio alto, experiencia premium) vs Volume (ocupación alta, precio medio). Cada una con métricas diferentes.'
      },
      {
        emoji: '📈',
        title: 'Revenue management predictivo',
        desc: 'No reacciones al mercado, anticípate. Usa datos históricos para predecir demanda.',
        consejo: 'Analiza: eventos locales, patrones estacionales, competencia. Ajusta precios 30-60 días antes, no el día anterior.'
      },
      {
        emoji: '🤝',
        title: 'Negocia con proveedores',
        desc: 'Con volumen tienes poder de negociación. Úsalo.',
        consejo: 'Limpieza, mantenimiento, amenities, seguros. Negocia descuentos por volumen. Un 10% de ahorro en limpieza = miles al año.'
      }
    ],
    warning: {
      title: '📉 El error del profesional experimentado',
      desc: 'Confiar solo en la experiencia pasada. El mercado de alquiler vacacional cambia cada 6 meses. Algoritmos nuevos, competencia nueva, huéspedes nuevos. Lo que funcionaba en 2022 puede no funcionar en 2025.'
    }
  }
}

export default function NivelDay2Email({ name, nivel }: NivelDay2EmailProps) {
  const content = NIVEL_PRACTICES[nivel]

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
        Ayer te envié algunos recursos. Hoy quiero compartir algo más práctico:
      </p>

      <h2 style={{ color: '#1f2937', fontSize: '22px', marginTop: '20px', marginBottom: '15px' }}>
        {content.titulo}
      </h2>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        {content.intro}
      </p>

      {/* Practices */}
      <div style={{ marginTop: '30px' }}>
        {content.practices.map((practice, idx) => (
          <div
            key={idx}
            style={{
              background: '#f9fafb',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px',
              borderLeft: '4px solid #2563eb'
            }}
          >
            <h3 style={{ color: '#1f2937', fontSize: '18px', marginTop: 0, marginBottom: '10px' }}>
              {practice.emoji} {practice.title}
            </h3>
            <p style={{ fontSize: '15px', color: '#374151', marginBottom: '10px' }}>
              {practice.desc}
            </p>
            <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '6px' }}>
              <p style={{ fontSize: '14px', color: '#0369a1', margin: 0, fontWeight: '500' }}>
                💡 <strong>Consejo práctico:</strong> {practice.consejo}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Box */}
      <div style={{
        background: '#fef2f2',
        border: '2px solid #ef4444',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '30px'
      }}>
        <h3 style={{ color: '#dc2626', fontSize: '18px', marginTop: 0, marginBottom: '10px' }}>
          {content.warning.title}
        </h3>
        <p style={{ fontSize: '15px', color: '#991b1b', margin: 0 }}>
          {content.warning.desc}
        </p>
      </div>

      {/* CTA */}
      <div style={{
        background: '#f0fdf4',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '16px', color: '#166534', marginBottom: '15px' }}>
          <strong>¿Quieres contenido AÚN más específico?</strong>
        </p>
        <p style={{ fontSize: '15px', color: '#166534', marginBottom: '20px' }}>
          Mañana te cuento cómo descubrir tu perfil operativo único.
        </p>
      </div>

      {/* Cierre */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginTop: '30px' }}>
        Espero que estos consejos te sean útiles. Mañana más.
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
          Itineramio - Tu aliado en alquiler vacacional
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
export function getNivelDay2Subject(nivel: string): string {
  const subjects: Record<string, string> = {
    principiante: '⚡ Las 3 cosas que hacen TODOS los principiantes exitosos',
    intermedio: '📊 De "funciona" a "optimizado": tu siguiente nivel',
    avanzado: '🚀 Cómo escalar sin quemarte (estrategias probadas)',
    profesional: '🎯 Optimización avanzada: lo que separa el 5% top'
  }
  return subjects[nivel] || '💡 Mejores prácticas para tu nivel'
}
