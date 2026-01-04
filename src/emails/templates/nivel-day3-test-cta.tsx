/** @jsxImportSource react */
import * as React from 'react'

interface NivelDay3EmailProps {
  name: string
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'profesional'
}

// Hooks personalizados por nivel
const NIVEL_HOOKS: Record<string, {
  problema: string
  ejemplos: string[]
  solucion: string
}> = {
  principiante: {
    problema: '¿Por qué hay principiantes que triunfan en 3 meses y otros abandonan al año?',
    ejemplos: [
      'Laura empezó sin experiencia y en 6 meses tenía su operación optimizada',
      'Carlos también empezó de cero pero abandonó después de 8 meses de pérdidas',
      'Ambos tenían apartamentos similares en la misma ciudad'
    ],
    solucion: 'La diferencia no es el apartamento, la ubicación o la suerte. Es conocer tu perfil operativo y trabajar desde tus fortalezas.'
  },
  intermedio: {
    problema: '¿Por qué algunos anfitriones estancan en 70% de ocupación y otros llegan al 95%?',
    ejemplos: [
      'Tienes buenas reviews, fotos profesionales, respondes rápido',
      'Pero tus vecinos con peor puntuación tienen más reservas',
      'O ganan más dinero con menos ocupación que tú'
    ],
    solucion: 'El problema no es hacer más cosas. Es hacer LAS COSAS CORRECTAS para tu tipo de anfitrión.'
  },
  avanzado: {
    problema: '¿Por qué algunos escalan a 15 propiedades sin equipo y otros se queman con 3?',
    ejemplos: [
      'Conoces anfitriones con 10+ propiedades que trabajan 20h/semana',
      'Tú tienes 3-5 propiedades y trabajas 50h/semana apagando fuegos',
      'Ambos generan ingresos similares pero uno tiene vida y el otro no'
    ],
    solucion: 'La diferencia está en diseñar sistemas que se alinean con tu perfil operativo, no copiar lo que funciona para otros.'
  },
  profesional: {
    problema: '¿Por qué el top 5% sigue creciendo mientras el resto se estanca?',
    ejemplos: [
      'Tienes experiencia, portfolio sólido, operaciones rodadas',
      'Pero sientes que has llegado a un techo',
      'Mientras ves a otros profesionales duplicar su portfolio cada año'
    ],
    solucion: 'El siguiente nivel no viene de hacer más, sino de alinear tu estrategia con tu perfil operativo único.'
  }
}

export default function NivelDay3Email({ name, nivel }: NivelDay3EmailProps) {
  const content = NIVEL_HOOKS[nivel]

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
        Déjame hacerte una pregunta importante:
      </p>

      {/* Hook Question */}
      <div style={{
        background: '#fef3c7',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        borderLeft: '4px solid #f59e0b'
      }}>
        <h2 style={{ color: '#92400e', fontSize: '20px', marginTop: 0, marginBottom: '15px' }}>
          {content.problema}
        </h2>
        <ul style={{ color: '#78350f', fontSize: '15px', lineHeight: '1.8', paddingLeft: '20px' }}>
          {content.ejemplos.map((ejemplo, idx) => (
            <li key={idx}>{ejemplo}</li>
          ))}
        </ul>
      </div>

      {/* Solution */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginTop: '25px' }}>
        <strong>{content.solucion}</strong>
      </p>

      {/* Explanation */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginTop: '20px' }}>
        Después de analizar a cientos de anfitriones, descubrimos que hay <strong>8 perfiles operativos</strong> diferentes. Cada uno tiene:
      </p>

      <div style={{ marginTop: '20px' }}>
        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '6px', marginBottom: '12px' }}>
          <p style={{ fontSize: '15px', color: '#166534', margin: 0 }}>
            ✅ <strong>Fortalezas naturales</strong> que puedes potenciar
          </p>
        </div>
        <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '6px', marginBottom: '12px' }}>
          <p style={{ fontSize: '15px', color: '#1e40af', margin: 0 }}>
            💡 <strong>Puntos ciegos</strong> que debes compensar
          </p>
        </div>
        <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '6px', marginBottom: '12px' }}>
          <p style={{ fontSize: '15px', color: '#991b1b', margin: 0 }}>
            ⚠️ <strong>Trampas comunes</strong> que debes evitar
          </p>
        </div>
      </div>

      {/* Social Proof */}
      <div style={{
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '30px',
        borderLeft: '3px solid #6366f1'
      }}>
        <p style={{ fontSize: '15px', color: '#374151', fontStyle: 'italic', marginBottom: '10px' }}>
          "Cuando descubrí que soy un ESTRATEGA, todo cambió. Dejé de intentar ser perfecto operacionalmente (mi punto débil) y me enfoqué en optimización de pricing (mi fuerte). Pasé de 800€/mes a 1,340€/mes en el mismo apartamento."
        </p>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          — Laura M., Barcelona
        </p>
      </div>

      {/* Big CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        margin: '40px 0',
        textAlign: 'center'
      }}>
        <h3 style={{ color: 'white', fontSize: '24px', marginBottom: '15px', marginTop: 0 }}>
          Descubre tu Perfil Operativo en 2 Minutos
        </h3>
        <p style={{ fontSize: '16px', marginBottom: '25px', opacity: 0.95, lineHeight: '1.6' }}>
          Test gratuito de 10 preguntas. Al finalizar recibirás:
        </p>
        <ul style={{
          textAlign: 'left',
          fontSize: '15px',
          lineHeight: '1.8',
          maxWidth: '400px',
          margin: '0 auto 25px auto',
          opacity: 0.95
        }}>
          <li>Tu perfil operativo detallado</li>
          <li>Tus fortalezas y puntos ciegos</li>
          <li>Estrategias específicas para tu perfil</li>
          <li>Guía PDF personalizada descargable</li>
        </ul>
        <a
          href="https://www.itineramio.com/host-profile/test"
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#667eea',
            padding: '16px 40px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
          }}
        >
          Hacer el Test Ahora (2 min) →
        </a>
        <p style={{ fontSize: '13px', marginTop: '15px', opacity: 0.8 }}>
          ⏱️ Más de 2,000 anfitriones ya lo han hecho
        </p>
      </div>

      {/* Why Now */}
      <div style={{
        background: '#fffbeb',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#92400e', fontSize: '18px', marginTop: 0, marginBottom: '10px' }}>
          ⚡ ¿Por qué hacerlo ahora?
        </h3>
        <p style={{ fontSize: '15px', color: '#78350f', margin: 0 }}>
          Cada día que operas sin conocer tu perfil, estás dejando dinero sobre la mesa. Los anfitriones que alinean su estrategia con su perfil aumentan ingresos entre un 25% y un 68% en los primeros 6 meses.
        </p>
      </div>

      {/* Cierre */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        Nos vemos dentro del test,
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
          Itineramio - Descubre tu perfil operativo único
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
export function getNivelDay3Subject(nivel: string): string {
  const subjects: Record<string, string> = {
    principiante: '❓ ¿Por qué algunos triunfan en 3 meses y otros abandonan?',
    intermedio: '🤔 El secreto de los que llegan al 95% de ocupación',
    avanzado: '💡 ¿Por qué algunos escalan a 15 propiedades sin equipo?',
    profesional: '🎯 Qué separa el top 5% del resto (no es lo que piensas)'
  }
  return subjects[nivel] || '🔍 Descubre tu perfil operativo'
}
