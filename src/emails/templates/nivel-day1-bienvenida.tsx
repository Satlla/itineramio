/** @jsxImportSource react */
import * as React from 'react'

interface NivelDay1EmailProps {
  name: string
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'profesional'
}

// Contenido personalizado por nivel
const NIVEL_CONTENT: Record<string, {
  saludo: string
  mensaje: string
  recurso1: { title: string; url: string; desc: string }
  recurso2: { title: string; url: string; desc: string }
  recurso3: { title: string; url: string; desc: string }
}> = {
  principiante: {
    saludo: '¡Bienvenido al mundo del alquiler vacacional!',
    mensaje: 'Estás en el momento perfecto. Los primeros 6 meses definen tu éxito futuro. Estos recursos te ayudarán a empezar con el pie derecho:',
    recurso1: {
      title: 'Guía: Los 10 Errores Fatales del Principiante',
      url: 'https://www.itineramio.com/blog/errores-principiantes-airbnb',
      desc: 'Evita los errores más comunes que frenan a los nuevos anfitriones'
    },
    recurso2: {
      title: 'Guía: Tu Primer Mes como Anfitrión',
      url: 'https://www.itineramio.com/blog/primer-mes-anfitrion-airbnb',
      desc: 'Día a día de qué hacer antes, durante y después de cada reserva'
    },
    recurso3: {
      title: 'Template: Manual Básico para Huéspedes',
      url: 'https://www.itineramio.com/recursos/manual-básico',
      desc: 'Descargable listo para personalizar en 10 minutos'
    }
  },
  intermedio: {
    saludo: 'Ya tienes experiencia. Hora de optimizar.',
    mensaje: 'Estás en la fase de crecimiento. Has superado los errores básicos, ahora toca aumentar ingresos y reducir tiempo:',
    recurso1: {
      title: 'Artículo: Automatización que Realmente Funciona',
      url: 'https://www.itineramio.com/blog/automatización-airbnb-stack-completo',
      desc: 'El stack completo de herramientas para anfitriones intermedios'
    },
    recurso2: {
      title: 'Caso: Optimización de Apartamentos en Valencia',
      url: 'https://www.itineramio.com/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa',
      desc: 'Cómo Laura optimizó pricing y operaciones (caso ilustrativo)'
    },
    recurso3: {
      title: 'Guía: RevPAR vs Ocupación',
      url: 'https://www.itineramio.com/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
      desc: 'Deja de optimizar la métrica equivocada'
    }
  },
  avanzado: {
    saludo: 'Eres un veterano. Hora de escalar.',
    mensaje: 'Tienes la operación dominada. Ahora el desafío es escalar sin quemarte o perder calidad:',
    recurso1: {
      title: 'Artículo: Del Modo Bombero al Modo CEO',
      url: 'https://www.itineramio.com/blog/modo-bombero-a-ceo-escalar-airbnb',
      desc: 'El framework para reducir significativamente tus horas de trabajo'
    },
    recurso2: {
      title: 'Framework: Delegación Sin Perder Control',
      url: 'https://www.itineramio.com/recursos/framework-delegacion',
      desc: 'Cómo crear sistemas que funcionen sin ti'
    },
    recurso3: {
      title: 'Caso: Cómo Gestionar Múltiples Propiedades',
      url: 'https://www.itineramio.com/blog/caso-david-15-propiedades',
      desc: 'Caso ilustrativo de escalado eficiente'
    }
  },
  profesional: {
    saludo: 'Eres un profesional. Hora de dominar.',
    mensaje: 'Tienes un portfolio sólido. Ahora el enfoque es optimización avanzada y ventajas competitivas:',
    recurso1: {
      title: 'Artículo: Revenue Management Avanzado',
      url: 'https://www.itineramio.com/blog/revenue-management-avanzado',
      desc: 'Estrategias de pricing que usan solo el top 5%'
    },
    recurso2: {
      title: 'Framework: Multi-Property Operations',
      url: 'https://www.itineramio.com/recursos/multi-property-ops',
      desc: 'Sistema completo para gestionar 10+ propiedades'
    },
    recurso3: {
      title: 'Comunidad: Red de Profesionales',
      url: 'https://www.itineramio.com/academia',
      desc: 'Accede a casos reales y networking con otros pros'
    }
  }
}

export default function NivelDay1Email({ name, nivel }: NivelDay1EmailProps) {
  const content = NIVEL_CONTENT[nivel]

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

      <h2 style={{ color: '#1f2937', fontSize: '22px', marginTop: '20px', marginBottom: '15px' }}>
        {content.saludo}
      </h2>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        {content.mensaje}
      </p>

      {/* Recursos */}
      <div style={{ marginTop: '30px' }}>
        {/* Recurso 1 */}
        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#047857', fontSize: '18px', marginTop: 0, marginBottom: '8px' }}>
            📚 {content.recurso1.title}
          </h3>
          <p style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
            {content.recurso1.desc}
          </p>
          <a
            href={content.recurso1.url}
            style={{
              display: 'inline-block',
              background: '#10b981',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Leer ahora →
          </a>
        </div>

        {/* Recurso 2 */}
        <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#1e40af', fontSize: '18px', marginTop: 0, marginBottom: '8px' }}>
            🎯 {content.recurso2.title}
          </h3>
          <p style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
            {content.recurso2.desc}
          </p>
          <a
            href={content.recurso2.url}
            style={{
              display: 'inline-block',
              background: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Ver recurso →
          </a>
        </div>

        {/* Recurso 3 */}
        <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#92400e', fontSize: '18px', marginTop: 0, marginBottom: '8px' }}>
            ⚡ {content.recurso3.title}
          </h3>
          <p style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
            {content.recurso3.desc}
          </p>
          <a
            href={content.recurso3.url}
            style={{
              display: 'inline-block',
              background: '#f59e0b',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Descargar →
          </a>
        </div>
      </div>

      {/* CTA Test */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '25px',
        borderRadius: '12px',
        margin: '30px 0',
        textAlign: 'center'
      }}>
        <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '10px', marginTop: 0 }}>
          💡 ¿Quieres contenido AÚN más personalizado?
        </h3>
        <p style={{ fontSize: '15px', marginBottom: '20px', opacity: 0.95 }}>
          Haz nuestro test de 2 minutos y descubre tu perfil operativo único. Recibirás guías específicas para tu tipo de anfitrión.
        </p>
        <a
          href="https://www.itineramio.com/host-profile/test"
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#667eea',
            padding: '12px 30px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Hacer el test (2 min)
        </a>
      </div>

      {/* Cierre */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginTop: '30px' }}>
        Mañana te envío más contenido relevante para tu nivel.
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
          Itineramio - Recursos para anfitriones de todos los niveles
        </p>
        <p style={{ marginTop: '10px' }}>
          <a href="https://www.itineramio.com" style={{ color: '#2563eb', textDecoration: 'none' }}>
            itineramio.com
          </a>
        </p>
      </div>
    </div>
  )
}

// Subject line helper
export function getNivelDay1Subject(nivel: string): string {
  const subjects: Record<string, string> = {
    principiante: '🌱 Tus primeros recursos como anfitrión',
    intermedio: '🚀 3 recursos para optimizar tu alojamiento',
    avanzado: '⭐ Recursos para escalar sin quemarte',
    profesional: '🏆 Contenido avanzado para profesionales'
  }
  return subjects[nivel] || '📚 Tus recursos personalizados'
}
