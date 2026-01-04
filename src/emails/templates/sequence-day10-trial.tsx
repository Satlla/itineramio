/** @jsxImportSource react */
import * as React from 'react'
import { EmailArchetype } from '@/lib/resend'

interface Day10TrialEmailProps {
  name: string
  gender?: 'M' | 'F' | 'O'
  archetype: EmailArchetype
}

// Beneficios específicos por arquetipo
const ARCHETYPE_BENEFITS: Record<EmailArchetype, {
  mainBenefit: string
  features: string[]
  timeframe: string
}> = {
  ESTRATEGA: {
    mainBenefit: 'Dashboard automatizado con tus KPIs críticos',
    features: [
      'RevPAR, ADR y ocupación en tiempo real',
      'Integración con Airbnb, Booking y tu PMS',
      'Alertas cuando tus métricas bajan del objetivo',
      'Reportes automáticos cada lunes a las 9am'
    ],
    timeframe: 'Configúralo en 20 minutos, ahorra 8 horas semanales'
  },
  SISTEMATICO: {
    mainBenefit: 'Todos tus SOPs en un solo lugar, digitales y ejecutables',
    features: [
      'Checklists digitales para limpieza y mantenimiento',
      'Seguimiento automático de cumplimiento',
      'Onboarding de nuevo personal en 4 días vs 3 semanas',
      'Auditorías automáticas de calidad'
    ],
    timeframe: 'Migra tus procesos en 1 hora, escala sin fricción'
  },
  DIFERENCIADOR: {
    mainBenefit: 'Templates de storytelling que convierten 2x más',
    features: [
      'Biblioteca de descripciones persuasivas por tipo de propiedad',
      'Mensajes personalizados automáticos basados en perfil del huésped',
      'A/B testing de descripciones sin esfuerzo',
      'Análisis de qué keywords generan más reservas'
    ],
    timeframe: 'Reescribe tus listings en 30 minutos, duplica conversión'
  },
  EJECUTOR: {
    mainBenefit: 'Automatización completa de tareas operativas repetitivas',
    features: [
      'Mensajes automáticos en cada etapa del guest journey',
      'Coordinación automática de limpieza y check-ins',
      'Delega operaciones sin perder control',
      'Dashboard móvil para gestionar desde cualquier lugar'
    ],
    timeframe: 'Ahorra 35 horas semanales, gestiona el doble de propiedades'
  },
  RESOLUTOR: {
    mainBenefit: 'Playbooks de crisis que tu equipo puede ejecutar sin ti',
    features: [
      'Scripts pre-aprobados para las 27 situaciones más comunes',
      'Matriz de compensación automática por tipo de problema',
      'Escalamiento automático solo cuando es crítico',
      'Tracking de resolución y satisfacción post-crisis'
    ],
    timeframe: 'Duerme tranquilo, tu equipo maneja el 80% sin llamarte'
  },
  EXPERIENCIAL: {
    mainBenefit: 'Escala tu toque personal sin perder la magia',
    features: [
      'Menú de sorpresas personalizables por tipo de huésped',
      'Videos de entrenamiento para replicar tu hospitalidad',
      'Templates de mensajes cálidos con merge fields',
      'Tracking de qué detalles generan más menciones positivas'
    ],
    timeframe: 'Tu equipo replica tu hospitalidad en cada propiedad'
  },
  EQUILIBRADO: {
    mainBenefit: 'Identifica y fortalece tu métrica más débil en 90 días',
    features: [
      'Diagnóstico automático de tu dimensión con mayor oportunidad',
      'Plan de acción enfocado en 1 métrica a la vez',
      'Benchmarking contra competencia en tu mercado',
      'Alertas cuando alcanzas top 10% en cada dimensión'
    ],
    timeframe: 'De "bueno en todo" a "excelente en lo que importa"'
  },
  IMPROVISADOR: {
    mainBenefit: 'Estructura que libera tu creatividad, no que la mata',
    features: [
      'Automatiza solo lo repetitivo (mensajes, coordinación)',
      'Recetas base que puedes customizar según la situación',
      'Sistema de captura de tus mejores "hacks"',
      'Flexibilidad para improvisar donde realmente importa'
    ],
    timeframe: 'Reduce caos operativo en 70%, libera energía para crear'
  }
}

export default function Day10TrialEmail({ name, archetype }: Day10TrialEmailProps) {
  const benefits = ARCHETYPE_BENEFITS[archetype]

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#7c3aed', fontSize: '28px', marginBottom: '10px', fontWeight: 'bold' }}>
          Itineramio
        </h1>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 20px' }}>
        <h2 style={{ color: '#111827', fontSize: '24px', marginBottom: '16px', lineHeight: '1.3' }}>
          {name}, tienes 15 días para probarlo
        </h2>

        <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
          Durante los últimos 10 días te he mostrado:
        </p>

        <ul style={{ color: '#374151', fontSize: '15px', lineHeight: '1.8', marginBottom: '30px', paddingLeft: '20px' }}>
          <li>Los 3 errores más comunes del {archetype}</li>
          <li>Cómo otro {archetype} los superó con resultados medibles</li>
          <li>Estrategias específicas para tu perfil</li>
        </ul>

        <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          Ahora es tu turno de <strong>experimentar</strong> en lugar de solo leer.
        </p>

        {/* Main Benefit */}
        <div style={{ backgroundColor: '#7c3aed', borderRadius: '12px', padding: '32px', marginBottom: '30px', textAlign: 'center' }}>
          <h3 style={{ color: '#ffffff', fontSize: '22px', marginTop: 0, marginBottom: '12px', fontWeight: 'bold' }}>
            Para {archetype}s como tú:
          </h3>
          <p style={{ color: '#e9d5ff', fontSize: '18px', lineHeight: '1.4', margin: 0, fontWeight: '500' }}>
            {benefits.mainBenefit}
          </p>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#111827', fontSize: '18px', marginBottom: '16px', fontWeight: 'bold' }}>
            Lo que obtienes:
          </h3>
          {benefits.features.map((feature, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              <span style={{ color: '#15803d', fontWeight: 'bold', marginRight: '8px' }}>✓</span>
              <span style={{ color: '#374151', fontSize: '15px', lineHeight: '1.6' }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Timeframe */}
        <div style={{ backgroundColor: '#fef3c7', borderRadius: '12px', padding: '20px', marginBottom: '40px', border: '2px solid #fbbf24' }}>
          <p style={{ color: '#92400e', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
            Resultado esperado:
          </p>
          <p style={{ color: '#78350f', fontSize: '15px', textAlign: 'center', margin: 0 }}>
            {benefits.timeframe}
          </p>
        </div>

        {/* No Risk */}
        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '24px', marginBottom: '30px', border: '1px solid #86efac' }}>
          <h3 style={{ color: '#15803d', fontSize: '18px', marginTop: 0, marginBottom: '16px', fontWeight: 'bold' }}>
            Sin riesgo, 100% reversible
          </h3>
          <ul style={{ color: '#166534', fontSize: '14px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
            <li>No requiere tarjeta de crédito</li>
            <li>15 días completos de prueba</li>
            <li>Acceso completo a todas las funcionalidades</li>
            <li>Soporte prioritario durante la prueba</li>
          </ul>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <a
            href="https://www.itineramio.com/register"
            style={{
              display: 'inline-block',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              padding: '18px 48px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '18px'
            }}
          >
            Comenzar mi prueba de 15 días
          </a>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '16px', marginBottom: 0 }}>
            Toma 2 minutos activar tu cuenta
          </p>
        </div>

        {/* Signature */}
        <p style={{ color: '#374151', fontSize: '15px', marginTop: '30px', marginBottom: '10px' }}>
          Nos vemos dentro,<br />
          <strong>Alejandro</strong><br />
          <span style={{ color: '#6b7280', fontSize: '13px' }}>Founder @ Itineramio</span>
        </p>

        <p style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic' }}>
          PD: Si tienes dudas sobre si Itineramio es para ti, responde este email con tus preguntas. Te respondo personalmente en menos de 24 horas.
        </p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '30px', marginTop: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
        <p style={{ marginBottom: '10px' }}>
          <a href="https://www.itineramio.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>
            Itineramio
          </a>
          {' · '}
          <a href="https://www.itineramio.com/blog" style={{ color: '#7c3aed', textDecoration: 'none' }}>
            Blog
          </a>
          {' · '}
          <a href="https://www.itineramio.com/recursos" style={{ color: '#7c3aed', textDecoration: 'none' }}>
            Recursos
          </a>
        </p>
        <p style={{ margin: '10px 0' }}>
          <a href="{{unsubscribe}}" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '11px' }}>
            Cancelar suscripción
          </a>
        </p>
        <p style={{ margin: 0 }}>
          © 2025 Itineramio. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
