/** @jsxImportSource react */
import * as React from 'react'

interface NivelDay7EmailProps {
  name: string
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'profesional'
}

// Contenido avanzado por nivel
const NIVEL_ADVANCED: Record<string, {
  titulo: string
  intro: string
  recursos: Array<{
    emoji: string
    title: string
    desc: string
    url: string
    tipo: string
  }>
  problema: string
  solucionItineramio: {
    titulo: string
    beneficios: string[]
  }
  precioContext: string
}> = {
  principiante: {
    titulo: 'Recursos Avanzados para Acelerar tu Curva de Aprendizaje',
    intro: 'Ya tienes lo básico. Ahora te comparto recursos que te ahorrarán 6 meses de prueba-error:',
    recursos: [
      {
        emoji: '📚',
        title: 'Guía Completa: Tu Primer Mes como Anfitrión',
        desc: 'Checklist día a día de qué hacer en tus primeros 30 días. Con plantillas descargables.',
        url: 'https://itineramio.com/blog/primer-mes-anfitrion-airbnb',
        tipo: 'Artículo'
      },
      {
        emoji: '🎓',
        title: 'Curso: Fundamentos de Pricing para Principiantes',
        desc: 'Cómo poner el precio correcto según temporada, ocupación y competencia.',
        url: 'https://itineramio.com/academia',
        tipo: 'Curso'
      },
      {
        emoji: '💬',
        title: 'Comunidad: Grupo de Anfitriones Principiantes',
        desc: 'Resuelve dudas con otros que están empezando. Nadie te juzga, todos aprendemos.',
        url: 'https://itineramio.com/academia',
        tipo: 'Comunidad'
      }
    ],
    problema: 'El problema es que la mayoría de principiantes aprenden a golpes. Cada error cuesta dinero y reputación.',
    solucionItineramio: {
      titulo: 'Itineramio Academia: Aprende de los que ya pasaron por ahí',
      beneficios: [
        'Cursos paso a paso para cada etapa (setup, primeras reservas, optimización)',
        'Plantillas y checklists descargables',
        'Comunidad privada de anfitriones (resuelve dudas en minutos)',
        'Manual digital actualizado mensualmente',
        'Desde 29€/mes (menos que una noche de pérdidas por error)'
      ]
    },
    precioContext: 'Un solo error evitado paga el plan del año completo.'
  },
  intermedio: {
    titulo: 'Herramientas para Desbloquear tu Potencial de Ingresos',
    intro: 'Estás en el punto donde pequeños ajustes generan grandes resultados. Estos recursos te llevan al siguiente nivel:',
    recursos: [
      {
        emoji: '📊',
        title: 'Artículo: RevPAR vs Ocupación',
        desc: 'Deja de optimizar la métrica equivocada y enfócate en lo que realmente importa.',
        url: 'https://itineramio.com/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
        tipo: 'Artículo'
      },
      {
        emoji: '🤖',
        title: 'Guía: Stack de Automatización Completo',
        desc: 'Las 7 herramientas que reducen significativamente tu tiempo operativo.',
        url: 'https://itineramio.com/blog/automatizacion-airbnb-stack-completo',
        tipo: 'Guía'
      },
      {
        emoji: '💡',
        title: 'Caso: Optimización en Valencia',
        desc: 'Cómo Laura optimizó pricing y operaciones (caso ilustrativo).',
        url: 'https://itineramio.com/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa',
        tipo: 'Caso de estudio'
      }
    ],
    problema: 'Muchos intermedios se estancan porque siguen usando estrategias de principiante (precio bajo, ocupación alta, trabajo manual).',
    solucionItineramio: {
      titulo: 'Itineramio Plan HOST: Optimización Continua',
      beneficios: [
        'Manual digital con estrategias de pricing dinámico',
        'Calculadora de RevPAR y métricas avanzadas',
        'Templates de automatización (mensajes, procesos, SOPs)',
        'Acceso a casos de estudio ilustrativos',
        '29€/mes - Inversión accesible que se recupera fácilmente'
      ]
    },
    precioContext: 'Un pequeño aumento en tu RevPAR puede pagar el plan varias veces.'
  },
  avanzado: {
    titulo: 'Sistemas para Escalar Sin Quemarte',
    intro: 'Ya dominas la operación. Ahora necesitas sistemas que te permitan crecer sin multiplicar el caos:',
    recursos: [
      {
        emoji: '📋',
        title: 'Framework: Del Modo Bombero al Modo CEO',
        desc: 'Cómo reducir significativamente tu tiempo trabajando más estratégicamente.',
        url: 'https://itineramio.com/blog/modo-bombero-a-ceo-escalar-airbnb',
        tipo: 'Framework'
      },
      {
        emoji: '👥',
        title: 'Guía: Delegación Sin Perder Control',
        desc: 'Cómo crear sistemas que funcionen sin ti. SOPs, checklists, KPIs.',
        url: 'https://itineramio.com/recursos/framework-delegacion',
        tipo: 'Guía'
      },
      {
        emoji: '📈',
        title: 'Caso: Escalado Eficiente de Propiedades',
        desc: 'Caso ilustrativo de cómo escalar sin perder control operativo.',
        url: 'https://itineramio.com/blog/caso-david-15-propiedades',
        tipo: 'Caso de estudio'
      }
    ],
    problema: 'El mayor error de los avanzados es intentar crecer antes de tener sistemas. Más propiedades sin sistemas = más caos.',
    solucionItineramio: {
      titulo: 'Itineramio Academia: Sistemas Escalables',
      beneficios: [
        'Biblioteca completa de SOPs editables (limpieza, mantenimiento, check-in, emergencias)',
        'Framework de delegación paso a paso',
        'Comunidad de anfitriones avanzados (networking, casos, soporte)',
        'Templates de herramientas (dashboard de KPIs, calculadora ROI, etc.)',
        'Plan SUPERHOST: 39€/mes - Inversión que se paga sola'
      ]
    },
    precioContext: 'El tiempo ahorrado con buenos sistemas justifica la inversión rápidamente.'
  },
  profesional: {
    titulo: 'Optimización de Portfolio para Profesionales',
    intro: 'Con múltiples propiedades, necesitas estrategias avanzadas. Estos recursos son oro:',
    recursos: [
      {
        emoji: '🎯',
        title: 'Artículo: Revenue Management Avanzado',
        desc: 'Estrategias de pricing predictivo que usan los profesionales.',
        url: 'https://itineramio.com/blog/revenue-management-avanzado',
        tipo: 'Artículo'
      },
      {
        emoji: '📊',
        title: 'Framework: Multi-Property Operations',
        desc: 'Sistema completo para gestionar múltiples propiedades con eficiencia.',
        url: 'https://itineramio.com/recursos/multi-property-ops',
        tipo: 'Framework'
      },
      {
        emoji: '🤝',
        title: 'Comunidad: Red de Profesionales',
        desc: 'Networking con otros gestores de portfolio. Colaboraciones y aprendizaje.',
        url: 'https://itineramio.com/academia',
        tipo: 'Comunidad'
      }
    ],
    problema: 'Los profesionales tienen un problema único: necesitan insights de otros profesionales con experiencia similar.',
    solucionItineramio: {
      titulo: 'Itineramio Academia - Nivel Profesional',
      beneficios: [
        'Casos de estudio ilustrativos de portfolios de múltiples propiedades',
        'Comunidad privada de profesionales (networking de alto nivel)',
        'Consultorías mensuales en grupo con expertos',
        'Biblioteca de recursos avanzados (revenue management, expansión, legal)',
        'Plan BUSINESS: Diseñado para portfolios profesionales'
      ]
    },
    precioContext: 'Para portfolios grandes, pequeñas mejoras de eficiencia tienen un impacto significativo.'
  }
}

export default function NivelDay7Email({ name, nivel }: NivelDay7EmailProps) {
  const content = NIVEL_ADVANCED[nivel]

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
        Llevamos una semana compartiendo recursos. Hoy quiero darte acceso a contenido más avanzado.
      </p>

      <h2 style={{ color: '#1f2937', fontSize: '22px', marginTop: '20px', marginBottom: '15px' }}>
        {content.titulo}
      </h2>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        {content.intro}
      </p>

      {/* Recursos */}
      <div style={{ marginTop: '30px' }}>
        {content.recursos.map((recurso, idx) => (
          <div
            key={idx}
            style={{
              background: '#f9fafb',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px',
              borderLeft: '4px solid #6366f1'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ color: '#1f2937', fontSize: '17px', margin: 0 }}>
                {recurso.emoji} {recurso.title}
              </h3>
              <span style={{
                background: '#e0e7ff',
                color: '#4338ca',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {recurso.tipo}
              </span>
            </div>
            <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '12px' }}>
              {recurso.desc}
            </p>
            <a
              href={recurso.url}
              style={{
                color: '#4f46e5',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Ver recurso →
            </a>
          </div>
        ))}
      </div>

      {/* Problema común */}
      <div style={{
        background: '#fef2f2',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '30px',
        borderLeft: '4px solid #ef4444'
      }}>
        <p style={{ fontSize: '15px', color: '#991b1b', margin: 0 }}>
          <strong>⚠️ El problema:</strong> {content.problema}
        </p>
      </div>

      {/* Solución Itineramio */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginTop: '40px'
      }}>
        <h3 style={{ color: 'white', fontSize: '22px', marginTop: 0, marginBottom: '15px' }}>
          {content.solucionItineramio.titulo}
        </h3>
        <ul style={{
          fontSize: '15px',
          lineHeight: '1.8',
          marginBottom: '20px',
          paddingLeft: '20px'
        }}>
          {content.solucionItineramio.beneficios.map((beneficio, idx) => (
            <li key={idx}>{beneficio}</li>
          ))}
        </ul>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <p style={{ fontSize: '14px', margin: 0, opacity: 0.95 }}>
            💡 <strong>ROI:</strong> {content.precioContext}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <a
            href="https://itineramio.com/funcionalidades"
            style={{
              display: 'inline-block',
              background: 'white',
              color: '#667eea',
              padding: '14px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              marginRight: '12px',
              marginBottom: '10px'
            }}
          >
            Ver Planes y Precios
          </a>
          <a
            href="https://itineramio.com/academia"
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              border: '2px solid white',
              marginBottom: '10px'
            }}
          >
            Explorar Academia
          </a>
        </div>
        <p style={{ fontSize: '13px', textAlign: 'center', marginTop: '15px', opacity: 0.8 }}>
          Prueba 15 días incluidos • Cancela cuando quieras
        </p>
      </div>

      {/* Alternativa */}
      <div style={{
        background: '#f0fdf4',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '25px'
      }}>
        <h4 style={{ color: '#166534', fontSize: '16px', marginTop: 0, marginBottom: '10px' }}>
          🎯 ¿Todavía explorando?
        </h4>
        <p style={{ fontSize: '15px', color: '#15803d', marginBottom: '15px' }}>
          Si aún no estás listo para un plan, te recomiendo hacer nuestro test de perfil operativo. Es gratuito y te dará insights valiosos sobre tu estilo como anfitrión.
        </p>
        <a
          href="https://itineramio.com/host-profile/test"
          style={{
            display: 'inline-block',
            background: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Hacer el Test (2 min) →
        </a>
      </div>

      {/* Cierre */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginTop: '30px' }}>
        Sea cual sea tu decisión, espero que esta semana de emails te haya sido útil.
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        Seguirás recibiendo contenido gratuito en tu email. Y si decides dar el paso, estaré encantado de verte dentro de la Academia.
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
          {' · '}
          <a href="https://itineramio.com/blog" style={{ color: '#2563eb', textDecoration: 'none' }}>
            Blog
          </a>
          {' · '}
          <a href="https://itineramio.com/academia" style={{ color: '#2563eb', textDecoration: 'none' }}>
            Academia
          </a>
        </p>
      </div>
    </div>
  )
}

// Subject line helper
export function getNivelDay7Subject(nivel: string): string {
  const subjects: Record<string, string> = {
    principiante: '🎓 Recursos avanzados para acelerar tu aprendizaje',
    intermedio: '🚀 Herramientas para romper el techo de los 1,500€/mes',
    avanzado: '📋 Sistemas para escalar sin quemarte',
    profesional: '🏆 Optimización de portfolio para el top 5%'
  }
  return subjects[nivel] || '💎 Recursos avanzados para tu nivel'
}
