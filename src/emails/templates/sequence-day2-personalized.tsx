/** @jsxImportSource react */
import * as React from 'react'
import { EmailArchetype } from '@/lib/resend'

interface Day2PersonalizedEmailProps {
  name: string
  archetype: EmailArchetype
}

// Contenido personalizado por arquetipo
const ARCHETYPE_CONTENT: Record<EmailArchetype, {
  subject: string
  hook: string
  problem: string
  solution: string
  articleTitle: string
  articleUrl: string
  articleTeaser: string
  leadMagnetTitle: string
  leadMagnetUrl: string
  leadMagnetValue: string
  cta: string
}> = {
  ESTRATEGA: {
    subject: '📊 Los 3 KPIs que todo Estratega debe trackear',
    hook: 'Como ESTRATEGA, tu don es analizar y optimizar datos. Pero el 73% de anfitriones con tu perfil cometen este error fatal...',
    problem: 'Miden demasiadas métricas y se paralizan por análisis. Tienen dashboards llenos de números pero no saben cuál mover primero.',
    solution: 'Los Estrategas exitosos se enfocan en 3 KPIs maestros que predicen todo lo demás: RevPAR, Direct Booking Ratio, y Guest Acquisition Cost.',
    articleTitle: 'RevPAR vs Ocupación: Por Qué Mides Las Métricas Equivocadas',
    articleUrl: 'https://itineramio.com/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
    articleTeaser: 'Descubre por qué el 80% de anfitriones optimizan ocupación cuando deberían optimizar revenue. Este artículo te muestra el framework exacto de 3 KPIs que usan los top 5%.',
    leadMagnetTitle: '5 KPIs Esenciales para Estrategas',
    leadMagnetUrl: '/api/lead-magnet/download?archetype=estratega',
    leadMagnetValue: 'Dashboard Excel pre-configurado + fórmulas automáticas + benchmarks por ciudad',
    cta: 'Quiero el Dashboard de KPIs'
  },
  SISTEMATICO: {
    subject: '⚙️ 47 tareas que SÍ puedes automatizar (sin perder control)',
    hook: 'Tu perfil de SISTEMÁTICO es oro puro en este negocio. Pero déjame adivinar... ¿sientes que podrías automatizar más?',
    problem: 'Tienes SOPs perfectos en tu cabeza, pero tu equipo no los sigue. Pasas horas coordinando limpieza, check-ins y mantenimiento. Cada día repites las mismas 47 tareas.',
    solution: 'Los Sistemáticos de élite automatizan el 80% de operaciones rutinarias, manteniendo control total. Liberan 15-20 horas semanales sin sacrificar calidad.',
    articleTitle: 'Automatización Airbnb: El Stack Completo de Herramientas',
    articleUrl: 'https://itineramio.com/blog/automatizacion-airbnb-stack-completo',
    articleTeaser: 'El blueprint exacto de automatización que usan anfitriones con 10+ propiedades: PMS, pricing dinámico, comunicación automática, y coordinación de equipo. Todo integrado.',
    leadMagnetTitle: 'Checklist de 47 Tareas Automatizables',
    leadMagnetUrl: '/api/lead-magnet/download?archetype=sistematico',
    leadMagnetValue: 'Lista priorizada por impacto/esfuerzo + herramientas recomendadas + plantillas de SOPs',
    cta: 'Descargar Checklist de Automatización'
  },
  DIFERENCIADOR: {
    subject: '✨ El framework que convierte palabras en reservas',
    hook: 'Tu don de DIFERENCIADOR es único. Mientras otros copian descripciones genéricas, tú sabes crear experiencias. Pero el 89% de ese talento se pierde en las OTAs.',
    problem: 'Escribes descripciones hermosas... que nadie lee. Tu storytelling no se traduce en conversión. Tu tasa de reserva debería ser el doble de lo que es.',
    solution: 'Los Diferenciadores exitosos usan el framework S.T.O.R.Y. para estructurar su copywriting. No es arte, es ciencia. Conversión promedio: 4.8% vs 2.1% estándar.',
    articleTitle: 'Storytelling que Convierte: Cómo Escribir Descripciones que Multiplican Reservas',
    articleUrl: 'https://itineramio.com/blog/storytelling-que-convierte-descripciones-airbnb',
    articleTeaser: 'El framework S.T.O.R.Y. completo con ejemplos antes/después. Ana pasó de 58% a 92% de ocupación solo reescribiendo su descripción. Te muestro exactamente cómo.',
    leadMagnetTitle: 'Framework S.T.O.R.Y. + Templates',
    leadMagnetUrl: '/api/lead-magnet/download?archetype=diferenciador',
    leadMagnetValue: 'Plantillas de copywriting listas para personalizar + checklist de 7 errores fatales + ejemplos reales',
    cta: 'Quiero el Framework de Storytelling'
  },
  EJECUTOR: {
    subject: '🔥 Del modo bombero al modo CEO (en 30 días)',
    hook: 'Como EJECUTOR, resuelves problemas rápido. Pero estás atrapado: trabajas 60h/semana y no puedes crecer porque estás apagando fuegos 24/7.',
    problem: 'Eres el cuello de botella. Sin ti, todo se para. Tu equipo te llama para cada decisión. No delegas porque "es más rápido hacerlo yo mismo".',
    solution: 'Los Ejecutores que escalan crean sistemas que toman decisiones sin ellos. Implementan protocolos de crisis + automatización + delegación estructurada. Resultado: mismo control, 50% menos tiempo.',
    articleTitle: 'Del Modo Bombero al CEO: Cómo Escalar Sin Quemarte',
    articleUrl: 'https://itineramio.com/blog/modo-bombero-a-ceo-escalar-airbnb',
    articleTeaser: 'El plan de 30 días para pasar de 60h/semana a 30h/semana sin perder control. Incluye framework de delegación + protocolos de crisis + automatización progresiva.',
    leadMagnetTitle: 'Plan 30 Días: Bombero → CEO',
    leadMagnetUrl: '/api/lead-magnet/download?archetype=ejecutor',
    leadMagnetValue: 'Roadmap semanal + checklist de delegación + 12 protocolos de crisis + templates de SOPs',
    cta: 'Descargar Plan de Transición'
  },
  IMPROVISADOR: {
    subject: '⚡ Kit Anti-Caos: Del pánico al control (en 48 horas)',
    hook: 'Trabajas "sobre la marcha" y siempre vas apagando fuegos. El 32% de anfitriones con tu perfil abandonan en el primer año. Pero tú NO vas a ser uno de ellos.',
    problem: 'No tienes sistemas. Cada reserva es diferente. Te olvidas de enviar instrucciones. Tu limpiadora no sabe cuándo hay entrada. Trabajas en modo emergencia constante.',
    solution: 'Los Improvisadores que sobreviven implementan el Kit Anti-Caos de 3 niveles: Supervivencia (48h), Estabilidad (2 semanas), Automatización (mes 2). Sistema a prueba de olvidos.',
    articleTitle: 'Kit Anti-Caos para Anfitriones: Del Modo Reactivo al Control Total',
    articleUrl: 'https://itineramio.com/blog/kit-anti-caos-anfitriones-airbnb',
    articleTeaser: 'Miguel pasó de 51% a 73% ocupación y redujo su tiempo 67% con este sistema de 3 niveles. Incluye 5 alarmas diarias + checklists imprimibles + plan 30 días paso a paso.',
    leadMagnetTitle: 'Kit Anti-Caos Completo',
    leadMagnetUrl: '/api/lead-magnet/download?archetype=improvisador',
    leadMagnetValue: 'Checklists imprimibles + 5 alarmas configuradas + plan 30 días + plantillas de mensajes',
    cta: 'Descargar Kit Anti-Caos'
  },
  RESOLUTOR: {
    subject: '🛠️ 27 crisis resueltas en 5 minutos cada una',
    hook: 'Como RESOLUTOR, eres el héroe en emergencias. Pero estás cansado de crisis que podrías prevenir.',
    problem: 'Resuelves crisis brillantemente... pero siguen ocurriendo las mismas. No tienes tiempo de crear sistemas porque estás ocupado apagando fuegos.',
    solution: 'Los Resolutores de élite documentan cada crisis resuelta y crean protocolos automáticos. Reducen incidencias 70% en 2 meses.',
    articleTitle: 'Del Modo Bombero al CEO: Cómo Escalar Sin Quemarte',
    articleUrl: 'https://itineramio.com/blog/modo-bombero-a-ceo-escalar-airbnb',
    articleTeaser: 'El sistema completo para convertir crisis recurrentes en protocolos automáticos. Incluye los 27 problemas más comunes + soluciones paso a paso.',
    leadMagnetTitle: '27 Crisis Más Comunes (Con Soluciones)',
    leadMagnetUrl: '/api/lead-magnet/download?archetype=resolutor',
    leadMagnetValue: 'Playbook de crisis + scripts de comunicación + contactos de emergencia + checklist preventivo',
    cta: 'Descargar Playbook de Crisis'
  },
  EXPERIENCIAL: {
    subject: '💫 Cómo escalar experiencias sin perder el alma',
    hook: 'Tu don es crear momentos mágicos. Pero no puedes estar en todas partes. ¿Cómo creces sin perder ese toque personal?',
    problem: 'Tu experiencia depende de ti. No has documentado qué hace que tus huéspedes digan "WOW". Temes que al delegar pierdas la magia.',
    solution: 'Los Experienciales exitosos documentan su "receta mágica" en protocolos emocionales. Sus equipos replican la experiencia a escala.',
    articleTitle: 'Storytelling que Convierte: Cómo Escribir Descripciones que Multiplican Reservas',
    articleUrl: 'https://itineramio.com/blog/storytelling-que-convierte-descripciones-airbnb',
    articleTeaser: 'El framework para documentar y escalar experiencias memorables. De anfitrión único a equipo que entrega magia consistente.',
    leadMagnetTitle: 'Manual de Experiencia Escalable',
    leadMagnetUrl: '/api/lead-magnet/download?archetype=experiencial',
    leadMagnetValue: 'Framework de experiencia + checklist emocional + training kit para equipo',
    cta: 'Descargar Manual de Experiencia'
  },
  EQUILIBRADO: {
    subject: '🎯 Cómo ser versátil sin ser mediocre',
    hook: 'Tu perfil EQUILIBRADO es raro: eres bueno en todo, excelente en nada. Pero eso puede ser tu mayor fortaleza... o tu trampa.',
    problem: 'Saltas de táctica en táctica. Pruebas todo un poco. No dominas ninguna área lo suficiente como para destacar.',
    solution: 'Los Equilibrados exitosos eligen 1-2 áreas para dominar mientras mantienen competencia en el resto. Se vuelven "versátiles especializados".',
    articleTitle: 'RevPAR vs Ocupación: Por Qué Mides Las Métricas Equivocadas',
    articleUrl: 'https://itineramio.com/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
    articleTeaser: 'El framework para identificar dónde especializarte sin perder tu versatilidad. Estrategia completa para equilibrados.',
    leadMagnetTitle: 'Guía del Versátil Excepcional',
    leadMagnetUrl: '/api/lead-magnet/download?archetype=equilibrado',
    leadMagnetValue: 'Test de especialización + roadmap de dominio + estrategia de diferenciación',
    cta: 'Descargar Guía del Versátil'
  }
}

export default function Day2PersonalizedEmail({ name, archetype }: Day2PersonalizedEmailProps) {
  const content = ARCHETYPE_CONTENT[archetype]

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2563eb', fontSize: '24px', marginBottom: '10px' }}>
          Itineramio
        </h1>
      </div>

      {/* Saludo personalizado */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        Hola {name},
      </p>

      {/* Hook */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        {content.hook}
      </p>

      {/* Problema */}
      <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #dc2626', margin: '20px 0' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', margin: 0 }}>
          <strong>❌ El problema:</strong><br />
          {content.problem}
        </p>
      </div>

      {/* Solución */}
      <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #16a34a', margin: '20px 0' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', margin: 0 }}>
          <strong>✅ La solución:</strong><br />
          {content.solution}
        </p>
      </div>

      {/* Artículo recomendado */}
      <div style={{ background: '#f9fafb', padding: '25px', borderRadius: '8px', margin: '30px 0' }}>
        <h2 style={{ color: '#1f2937', fontSize: '18px', marginBottom: '15px' }}>
          📖 Lectura recomendada para ti:
        </h2>
        <h3 style={{ color: '#2563eb', fontSize: '20px', marginBottom: '10px', marginTop: 0 }}>
          {content.articleTitle}
        </h3>
        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#4b5563', marginBottom: '20px' }}>
          {content.articleTeaser}
        </p>
        <a
          href={content.articleUrl}
          style={{
            display: 'inline-block',
            background: '#2563eb',
            color: 'white',
            padding: '12px 30px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Leer artículo completo →
        </a>
      </div>

      {/* Lead Magnet CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        margin: '30px 0',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontSize: '22px', marginBottom: '15px', marginTop: 0 }}>
          🎁 Descarga tu guía gratuita
        </h2>
        <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '10px', marginTop: 0, fontWeight: 'normal' }}>
          {content.leadMagnetTitle}
        </h3>
        <p style={{ fontSize: '15px', marginBottom: '20px', opacity: 0.95 }}>
          {content.leadMagnetValue}
        </p>
        <a
          href={`https://itineramio.com${content.leadMagnetUrl}`}
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#667eea',
            padding: '15px 40px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          {content.cta}
        </a>
        <p style={{ fontSize: '13px', marginTop: '15px', opacity: 0.9 }}>
          ✓ Sin registro ✓ Descarga inmediata ✓ Formato PDF
        </p>
      </div>

      {/* Cierre */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        En 3 días te envío un caso de estudio de otro {archetype} que implementó estos sistemas.
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
        Por ahora, lee el artículo y descarga tu guía.
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginTop: '30px' }}>
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
          Itineramio - Herramientas para anfitriones profesionales
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

// Subject line helper para usar en el envío
export function getDay2Subject(archetype: EmailArchetype): string {
  return ARCHETYPE_CONTENT[archetype].subject
}
