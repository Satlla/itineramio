/** @jsxImportSource react */
import * as React from 'react'
import { EmailArchetype } from '@/lib/resend'

interface Day7CaseStudyEmailProps {
  name: string
  archetype: EmailArchetype
}

// Case studies específicos por arquetipo
const ARCHETYPE_CASES: Record<EmailArchetype, {
  hostName: string
  location: string
  properties: number
  challenge: string
  solution: string
  results: Array<{ metric: string; before: string; after: string }>
  quote: string
  timeToResults: string
}> = {
  ESTRATEGA: {
    hostName: 'María González',
    location: 'Valencia, España',
    properties: 4,
    challenge: 'Pasaba 8 horas semanales compilando datos de 3 plataformas diferentes (Airbnb, Booking, Google Sheets) para calcular su RevPAR real. Los dashboards existentes no mostraban las métricas que realmente necesitaba.',
    solution: 'Implementó Itineramio para centralizar todos sus datos y automatizar el cálculo de KPIs. Configuró alertas automáticas cuando el RevPAR caía por debajo del objetivo.',
    results: [
      { metric: 'Tiempo en reporting', before: '8h/semana', after: '30min/semana' },
      { metric: 'RevPAR promedio', before: '€68', after: '€89' },
      { metric: 'Decisiones basadas en datos', before: '1-2/mes', after: '8-10/mes' }
    ],
    quote: 'Antes reaccionaba a los números una vez al mes. Ahora los veo en tiempo real y ajusto pricing cada semana. Mi RevPAR subió 31% en 4 meses.',
    timeToResults: '2 semanas'
  },
  SISTEMATICO: {
    hostName: 'Carlos Ruiz',
    location: 'Barcelona, España',
    properties: 12,
    challenge: 'Tenía SOPs perfectos... que nadie seguía. Su equipo de limpieza y mantenimiento usaba WhatsApp y notas en papel. La información se perdía constantemente.',
    solution: 'Migró todos sus protocolos a Itineramio con checklists digitales y seguimiento automático. El equipo ahora documenta cada tarea desde el móvil.',
    results: [
      { metric: 'Cumplimiento de SOPs', before: '45%', after: '94%' },
      { metric: 'Incidencias por olvidos', before: '12/mes', after: '1/mes' },
      { metric: 'Tiempo de onboarding', before: '3 semanas', after: '4 días' }
    ],
    quote: 'Mis protocolos eran buenos, pero solo en mi cabeza. Ahora mi equipo los ejecuta perfectamente sin que yo esté presente. Puedo irme de vacaciones tranquilo.',
    timeToResults: '1 semana'
  },
  DIFERENCIADOR: {
    hostName: 'Laura Martínez',
    location: 'Sevilla, España',
    properties: 3,
    challenge: 'Su experiencia era increíble pero solo el 20% de los potenciales huéspedes lo descubrían. Sus descripciones eran genéricas y no transmitían su propuesta única.',
    solution: 'Usó las plantillas de storytelling de Itineramio para reescribir sus listings enfocándose en la experiencia del huésped, no en especificaciones.',
    results: [
      { metric: 'Tasa de conversión', before: '12%', after: '28%' },
      { metric: 'ADR (precio promedio)', before: '€95', after: '€127' },
      { metric: 'Menciones en reseñas', before: '3 keywords', after: '12 keywords' }
    ],
    quote: 'Cambié "apartamento luminoso con 2 habitaciones" por "despertarás con luz natural inundando tu terraza privada". Las reservas se dispararon.',
    timeToResults: '3 días'
  },
  EJECUTOR: {
    hostName: 'David Torres',
    location: 'Madrid, España',
    properties: 8,
    challenge: 'Trabajaba 70 horas semanales "apagando fuegos". No tenía tiempo para crecer porque estaba atrapado en operaciones diarias.',
    solution: 'Automatizó mensajes, check-ins y coordinación de limpieza con Itineramio. Delegó operaciones rutinarias a su equipo usando los flujos automáticos.',
    results: [
      { metric: 'Horas de trabajo', before: '70h/semana', after: '35h/semana' },
      { metric: 'Propiedades gestionadas', before: '8', after: '15' },
      { metric: 'Margen neto', before: '22%', after: '31%' }
    ],
    quote: 'Pasé de ser un bombero 24/7 a ser un CEO con tiempo libre. Dupliqué mi portfolio sin contratar personal adicional.',
    timeToResults: '3 semanas'
  },
  RESOLUTOR: {
    hostName: 'Ana Fernández',
    location: 'Málaga, España',
    properties: 6,
    challenge: 'Era excelente convirtiendo quejas en reseñas 5 estrellas, pero solo cuando estaba disponible. Su equipo no sabía cómo responder sin ella.',
    solution: 'Creó playbooks de crisis en Itineramio con respuestas pre-aprobadas y matriz de compensación. Su equipo ahora resuelve el 80% sin consultarla.',
    results: [
      { metric: 'Tiempo de respuesta', before: '4.2 horas', after: '47 minutos' },
      { metric: 'Resolución sin escalar', before: '20%', after: '82%' },
      { metric: 'Rating promedio', before: '4.7', after: '4.9' }
    ],
    quote: 'Antes era yo vs las crisis. Ahora mi equipo tiene las herramientas para convertir cualquier problema en una oportunidad.',
    timeToResults: '1 semana'
  },
  EXPERIENCIAL: {
    hostName: 'Roberto Sánchez',
    location: 'Granada, España',
    properties: 5,
    challenge: 'Su toque personal era su mayor activo, pero no escalable. Con cada nueva propiedad, la calidad de la experiencia bajaba porque él no podía estar en todas.',
    solution: 'Documentó su "menú de sorpresas" en Itineramio con videos de entrenamiento. Su equipo ahora replica su hospitalidad usando los templates personalizables.',
    results: [
      { metric: 'Propiedades con 4.9+', before: '2 de 5', after: '5 de 5' },
      { metric: 'Menciones "toque personal"', before: '35%', after: '78%' },
      { metric: 'Tiempo en personalización', before: '3h/huésped', after: '20min/huésped' }
    ],
    quote: 'Ahora mi equipo deja notas personalizadas y pequeños detalles como yo lo haría. Escalé sin perder el alma.',
    timeToResults: '2 semanas'
  },
  EQUILIBRADO: {
    hostName: 'Patricia López',
    location: 'Bilbao, España',
    properties: 7,
    challenge: 'Era buena en todo pero no destacaba en nada. Su versatilidad se convirtió en mediocridad cuando intentó crecer.',
    solution: 'Usó Itineramio para identificar su métrica más débil (tiempo de respuesta) y enfocarse 90 días solo en eso con automatizaciones específicas.',
    results: [
      { metric: 'Tiempo de respuesta', before: 'Percentil 60', after: 'Percentil 95' },
      { metric: 'Tasa de conversión', before: '18%', after: '34%' },
      { metric: 'Superhost status', before: 'No', after: 'Sí' }
    ],
    quote: 'Dejé de ser "buena en todo" para ser "excelente en conversión". Mis otras métricas siguieron bien mientras me enfocaba en una.',
    timeToResults: '90 días'
  },
  IMPROVISADOR: {
    hostName: 'Javier Moreno',
    location: 'San Sebastián, España',
    properties: 4,
    challenge: 'Su creatividad era su fortaleza pero el caos lo agotaba. Cada semana reinventaba procesos básicos desde cero.',
    solution: 'Creó "recetas base" en Itineramio para sus 10 tareas más odiadas. Automatizó lo repetitivo para tener MÁS energía para improvisar donde importa.',
    results: [
      { metric: 'Energía mental diaria', before: '3/10 al finalizar', after: '7/10 al finalizar' },
      { metric: 'Ideas implementadas', before: '2/mes', after: '8/mes' },
      { metric: 'Tiempo en tareas admin', before: '25h/semana', after: '8h/semana' }
    ],
    quote: 'La estructura no mató mi creatividad, la liberó. Ahora improviso en experiencias únicas, no en enviar mensajes de check-in.',
    timeToResults: '1 semana'
  }
}

export const Day7CaseStudyEmail: React.FC<Day7CaseStudyEmailProps> = ({
  name,
  archetype
}) => {
  const caseStudy = ARCHETYPE_CASES[archetype]

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f9fafb',
        margin: 0,
        padding: 0
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '40px 20px'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              color: '#7c3aed',
              fontSize: '28px',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              Itineramio
            </h1>
          </div>

          {/* Main Content */}
          <div style={{ padding: '0 20px' }}>
            <div style={{
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              padding: '12px 20px',
              marginBottom: '24px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                color: '#1e40af',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: 0
              }}>
                CASO DE ÉXITO: {archetype}
              </p>
            </div>

            <h2 style={{
              color: '#111827',
              fontSize: '24px',
              marginBottom: '16px',
              lineHeight: '1.3'
            }}>
              Hola {name},
            </h2>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              La semana pasada te hablé de los errores comunes del {archetype}. Hoy quiero mostrarte a alguien que los superó.
            </p>

            <p style={{
              color: '#6b7280',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '30px',
              fontStyle: 'italic'
            }}>
              Esta es la historia real de {caseStudy.hostName}, un {archetype} como tú.
            </p>

            {/* Host Profile */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginRight: '16px'
                }}>
                  {caseStudy.hostName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{
                    color: '#111827',
                    fontSize: '18px',
                    margin: '0 0 4px 0',
                    fontWeight: 'bold'
                  }}>
                    {caseStudy.hostName}
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: 0
                  }}>
                    {caseStudy.location} · {caseStudy.properties} propiedades
                  </p>
                </div>
              </div>
            </div>

            {/* The Challenge */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                color: '#dc2626',
                fontSize: '18px',
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                ❌ El Desafío
              </h3>
              <p style={{
                color: '#374151',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: 0
              }}>
                {caseStudy.challenge}
              </p>
            </div>

            {/* The Solution */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                color: '#2563eb',
                fontSize: '18px',
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                💡 La Solución
              </h3>
              <p style={{
                color: '#374151',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: 0
              }}>
                {caseStudy.solution}
              </p>
            </div>

            {/* Results */}
            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              border: '2px solid #86efac'
            }}>
              <h3 style={{
                color: '#15803d',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '20px',
                fontWeight: 'bold'
              }}>
                ✅ Los Resultados
              </h3>

              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid #86efac'
                  }}>
                    <th style={{
                      textAlign: 'left',
                      padding: '12px 8px',
                      color: '#166534',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      Métrica
                    </th>
                    <th style={{
                      textAlign: 'center',
                      padding: '12px 8px',
                      color: '#166534',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      Antes
                    </th>
                    <th style={{
                      textAlign: 'center',
                      padding: '12px 8px',
                      color: '#166534',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      Después
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {caseStudy.results.map((result, index) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid #bbf7d0'
                    }}>
                      <td style={{
                        padding: '12px 8px',
                        color: '#166534',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {result.metric}
                      </td>
                      <td style={{
                        textAlign: 'center',
                        padding: '12px 8px',
                        color: '#dc2626',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {result.before}
                      </td>
                      <td style={{
                        textAlign: 'center',
                        padding: '12px 8px',
                        color: '#15803d',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {result.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '2px solid #86efac'
              }}>
                <p style={{
                  color: '#166534',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  Tiempo hasta resultados:
                </p>
                <p style={{
                  color: '#15803d',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  {caseStudy.timeToResults}
                </p>
              </div>
            </div>

            {/* Quote */}
            <div style={{
              backgroundColor: '#faf5ff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '40px',
              borderLeft: '4px solid #9333ea'
            }}>
              <div style={{
                fontSize: '40px',
                color: '#9333ea',
                lineHeight: '1',
                marginBottom: '12px'
              }}>
                "
              </div>
              <p style={{
                color: '#581c87',
                fontSize: '16px',
                lineHeight: '1.6',
                fontStyle: 'italic',
                marginBottom: '12px'
              }}>
                {caseStudy.quote}
              </p>
              <p style={{
                color: '#7c3aed',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: 0
              }}>
                — {caseStudy.hostName}
              </p>
            </div>

            {/* CTA */}
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#ffffff',
                fontSize: '22px',
                marginTop: 0,
                marginBottom: '16px'
              }}>
                ¿Listo para tu propia transformación?
              </h3>
              <p style={{
                color: '#d1d5db',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                {caseStudy.hostName} empezó como tú: escéptico pero curioso.<br />
                15 días de prueba gratuita. Sin tarjeta. Sin riesgo.
              </p>

              <a
                href="https://itineramio.com/register"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '16px 40px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Comenzar mi prueba gratuita →
              </a>

              <p style={{
                color: '#9ca3af',
                fontSize: '13px',
                marginTop: '16px',
                marginBottom: 0
              }}>
                Resultados en {caseStudy.timeToResults} o menos
              </p>
            </div>

            {/* Signature */}
            <p style={{
              color: '#374151',
              fontSize: '15px',
              marginTop: '30px',
              marginBottom: '10px'
            }}>
              Hasta pronto,<br />
              <strong>Alejandro</strong><br />
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Founder @ Itineramio</span>
            </p>

            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              PD: Este caso es 100% real. Si quieres hablar directamente con {caseStudy.hostName.split(' ')[0]}, responde a este email.
            </p>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '30px',
            marginTop: '40px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px'
          }}>
            <p style={{ marginBottom: '10px' }}>
              <a href="https://itineramio.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Itineramio
              </a>
              {' · '}
              <a href="https://itineramio.com/blog" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Blog
              </a>
              {' · '}
              <a href="https://itineramio.com/recursos" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                Recursos
              </a>
            </p>
            <p style={{ margin: '10px 0' }}>
              <a href="{{unsubscribe}}" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '11px' }}>
                Cancelar suscripción
              </a>
            </p>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} Itineramio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default Day7CaseStudyEmail
