/** @jsxImportSource react */
import * as React from 'react'
import { EmailArchetype } from '@/lib/resend'

interface Day3MistakesEmailProps {
  name: string
  archetype: EmailArchetype
}

// Contenido específico por arquetipo
const ARCHETYPE_CONTENT: Record<EmailArchetype, {
  emoji: string
  mistakes: Array<{ title: string; description: string; solution: string }>
  quickWin: string
}> = {
  ESTRATEGA: {
    emoji: '🎯',
    mistakes: [
      {
        title: 'Error #1: Obsesionarse con métricas vanidosas',
        description: 'Muchos Estrategas rastrean 20+ KPIs pero ignoran los 3 que realmente importan: RevPAR, ADR y tiempo de respuesta.',
        solution: 'Enfócate en: (1) RevPAR como métrica principal, (2) ADR para optimizar pricing, (3) Tiempo de respuesta para conversión.'
      },
      {
        title: 'Error #2: Análisis paralítico',
        description: 'Pasas tanto tiempo analizando datos que pierdes oportunidades de acción inmediata.',
        solution: 'Regla 80/20: Si tienes 80% de certeza con los datos actuales, actúa. La perfección es enemiga del progreso.'
      },
      {
        title: 'Error #3: No automatizar el reporting',
        description: 'Pierdes 3-5 horas semanales generando reportes manuales que podrían ser automáticos.',
        solution: 'Usa dashboards automatizados. Tu tiempo vale más creando estrategia que copiando datos a Excel.'
      }
    ],
    quickWin: 'Crea un dashboard simple con tus 3 KPIs principales. No necesitas software caro, un Google Sheets con fórmulas básicas te ahorrará 4 horas/semana.'
  },
  SISTEMATICO: {
    emoji: '⚙️',
    mistakes: [
      {
        title: 'Error #1: Sobre-documentar procesos básicos',
        description: 'Tienes un SOP de 15 páginas para hacer check-in, cuando 5 bullet points serían suficientes.',
        solution: 'Regla: Si un proceso toma menos de 10 minutos, documéntalo en máximo 1 página. Guarda la profundidad para procesos críticos.'
      },
      {
        title: 'Error #2: Perfeccionar antes de implementar',
        description: 'Esperas tener el sistema "perfecto" antes de usarlo, perdiendo meses de eficiencia.',
        solution: 'Lanza el sistema al 70% de perfección. Itera basándote en uso real, no en teoría.'
      },
      {
        title: 'Error #3: No medir la adopción de tus sistemas',
        description: 'Creas procesos que nadie sigue porque nunca verificas si tu equipo los usa.',
        solution: 'Implementa check-ins semanales: "¿Qué proceso no estás usando? ¿Por qué?" Simplifica lo que no funciona.'
      }
    ],
    quickWin: 'Identifica tu proceso más caótico (limpieza, check-in, mantenimiento). Crea un checklist de 7 pasos máximo. Úsalo 3 veces. Ajusta. Repite.'
  },
  DIFERENCIADOR: {
    emoji: '✨',
    mistakes: [
      {
        title: 'Error #1: Diferenciarte solo por experiencias caras',
        description: 'Crees que destacar requiere inversión. Los mejores diferenciadores son gratis: storytelling, personalización, sorpresas.',
        solution: 'El 80% de tu diferenciación debe ser comunicación (fotos, descripción, mensajes), no comodidades físicas.'
      },
      {
        title: 'Error #2: No cuantificar tu diferenciación',
        description: 'Dices "experiencia única" pero no mides si realmente genera más reservas o mejores reseñas.',
        solution: 'Rastrea: (1) Menciones en reseñas, (2) Tasa de conversión en mensajes, (3) ADR vs competencia. Si no mejora números, no funciona.'
      },
      {
        title: 'Error #3: Contar tu historia, no la del huésped',
        description: 'Tu descripción habla de ti ("Mi abuelo construyó esta casa...") en vez del huésped ("Despertarás con vistas al mar...").',
        solution: 'Regla del espejo: Relee tu listing. ¿Habla más de ti o del huésped? El 80% debe pintar SU experiencia futura.'
      }
    ],
    quickWin: 'Reescribe las primeras 3 líneas de tu descripción usando solo segunda persona ("Imaginarás...", "Disfrutarás...", "Te sentirás..."). Verás un aumento en conversión.'
  },
  EJECUTOR: {
    emoji: '⚡',
    mistakes: [
      {
        title: 'Error #1: Resolver urgencias antes de eliminarlas',
        description: 'Eres tan bueno apagando fuegos que nunca instalas detectores de humo.',
        solution: 'Por cada urgencia resuelta, pregunta: "¿Cómo evito que esto vuelva a pasar?" Dedica 20% de tu tiempo a prevención.'
      },
      {
        title: 'Error #2: Creer que delegar toma más tiempo',
        description: 'Resuelves todo tú porque "explicarlo toma más tiempo". En 6 meses pierdes 40 horas por no haber invertido 2.',
        solution: 'Regla 5-5-5: Si una tarea toma 5 minutos y la haces 5 veces al mes, documéntala. En 5 meses habrás ahorrado 10 horas.'
      },
      {
        title: 'Error #3: No diferenciar urgente de importante',
        description: 'Todo se siente urgente. Terminas el día agotado sin avanzar en lo estratégico.',
        solution: 'Matriz Eisenhower cada mañana: 2 tareas importantes-no-urgentes ANTES del email. Protege tus primeras 2 horas.'
      }
    ],
    quickWin: 'Lista las 5 tareas que más repites. Graba un Loom de 3 minutos explicando cada una. Próxima vez, envía el video en vez de hacerla tú.'
  },
  RESOLUTOR: {
    emoji: '🛠️',
    mistakes: [
      {
        title: 'Error #1: No tener playbooks de crisis',
        description: 'Eres excelente resolviendo, pero cada crisis la inventas desde cero. Terminas exhausto.',
        solution: 'Documenta las 10 crisis más comunes con scripts palabra por palabra. Próxima vez ejecutas, no piensas.'
      },
      {
        title: 'Error #2: Resolver solo los síntomas',
        description: 'El aire acondicionado falla cada verano. Lo reparas cada vez en vez de reemplazarlo.',
        solution: 'Regla de los 3: Si una crisis se repite 3 veces, el problema es sistémico. Invierte en solución definitiva, no en parches.'
      },
      {
        title: 'Error #3: No escalar tu recuperación de servicio',
        description: 'Conviertes quejas en reseñas 5 estrellas, pero solo cuando estás disponible. Sin ti, el equipo falla.',
        solution: 'Crea una "Matriz de compensación": Si pasa X, ofreces Y. Tu equipo toma decisiones sin esperarte.'
      }
    ],
    quickWin: 'Escribe un documento: "Las 5 crisis más probables y exactamente qué decir/hacer". Compártelo con tu equipo. Duerme mejor.'
  },
  EXPERIENCIAL: {
    emoji: '❤️',
    mistakes: [
      {
        title: 'Error #1: Personalización que no escala',
        description: 'Envías mensajes únicos a cada huésped. Con 20 propiedades sería imposible.',
        solution: 'Crea 5 templates personalizables: aniversario, familia con niños, viaje de trabajo, mascotas, primera vez. Personaliza el 20%, no el 100%.'
      },
      {
        title: 'Error #2: Medir solo satisfacción, no rentabilidad',
        description: 'Tienes 4.95 estrellas pero tu ADR es 15% menor que competencia. La hospitalidad también es negocio.',
        solution: 'Rastrea tu "Premium por Experiencia": ¿Cuánto más pagarían huéspedes por tu toque? Si no lo sabes, estás regalando valor.'
      },
      {
        title: 'Error #3: No documentar tu magia',
        description: 'Tu hospitalidad vive en tu cabeza. Sin ti, la experiencia se desmorona.',
        solution: 'Graba videos cortos: "Cómo personalizo mensajes", "Qué detalles añado al welcome basket". Tu equipo replica tu toque.'
      }
    ],
    quickWin: 'Crea un "Menú de Sorpresas" con 10 toques personales (nota escrita, recomendación local, upgrade). Tu equipo elige 2 por huésped. Escalas sin perder alma.'
  },
  EQUILIBRADO: {
    emoji: '⚖️',
    mistakes: [
      {
        title: 'Error #1: Ser bueno en todo, excelente en nada',
        description: 'Tu versatilidad es tu fortaleza, pero también tu debilidad. No destacas en ninguna área.',
        solution: 'Elige 1 dimensión donde serás top 10%. Hospitalidad, pricing, automatización... Una. El resto mantén en 80%.'
      },
      {
        title: 'Error #2: Cambiar de enfoque cada mes',
        description: 'Este mes optimizas pricing. El próximo, experiencia. Nunca terminas nada.',
        solution: 'Regla de los 90 días: Elige UN objetivo trimestral. Ignora el resto. Lograr 1 cosa > empezar 5.'
      },
      {
        title: 'Error #3: No aprovechar tu visión 360°',
        description: 'Ves conexiones que otros no ven, pero no las capitalizas.',
        solution: 'Tu superpoder es integración. Conecta tus sistemas: CRM → Pricing → Comunicación. Tú ves cómo encaja todo.'
      }
    ],
    quickWin: 'Identifica tu métrica más débil (ocupa percentil <50 vs mercado). Dedica 90 días solo a eso. Ignora el resto. Conviértete en especialista temporal.'
  },
  IMPROVISADOR: {
    emoji: '🎨',
    mistakes: [
      {
        title: 'Error #1: Confundir flexibilidad con desorganización',
        description: 'Crees que la estructura mata creatividad. En realidad, la estructura LIBERA creatividad.',
        solution: 'Automatiza lo repetitivo (mensajes, check-in, limpieza) para tener MÁS tiempo improvisando en lo que importa (experiencias, ventas).'
      },
      {
        title: 'Error #2: No capturar tus mejores ideas',
        description: 'Tienes ideas brillantes que funcionan... una vez. Después las olvidas.',
        solution: 'Nota de voz de 30 segundos después de cada "hack" exitoso. Fin de mes: convierte tus 5 mejores en procesos.'
      },
      {
        title: 'Error #3: Reinventar la rueda cada día',
        description: 'Resuelves el mismo problema 10 formas diferentes porque no tienes sistema base.',
        solution: 'Crea "recetas base" para tus 10 tareas más frecuentes. Improvisa encima, no desde cero. Ahorras 30% de energía mental.'
      }
    ],
    quickWin: 'Identifica las 3 tareas que ODIAS más. Automatízalas completamente (Zapier, templates, herramientas). Libera energía para lo que SÍ disfrutas.'
  }
}

export const Day3MistakesEmail: React.FC<Day3MistakesEmailProps> = ({
  name,
  archetype
}) => {
  const content = ARCHETYPE_CONTENT[archetype]

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
            <h2 style={{
              color: '#111827',
              fontSize: '22px',
              marginBottom: '16px',
              lineHeight: '1.3'
            }}>
              {content.emoji} Hola {name},
            </h2>

            <p style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              Como <strong>{archetype}</strong>, tienes fortalezas increíbles. Pero después de analizar a cientos de anfitriones como tú, he identificado 3 patrones que te están frenando.
            </p>

            <p style={{
              color: '#6b7280',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '30px',
              fontStyle: 'italic'
            }}>
              La buena noticia: Son fáciles de corregir una vez que los ves.
            </p>

            {/* Mistakes */}
            {content.mistakes.map((mistake, index) => (
              <div key={index} style={{
                marginBottom: '32px',
                borderLeft: '4px solid #7c3aed',
                paddingLeft: '20px'
              }}>
                <h3 style={{
                  color: '#dc2626',
                  fontSize: '18px',
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}>
                  {mistake.title}
                </h3>

                <p style={{
                  color: '#374151',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  marginBottom: '12px'
                }}>
                  <strong>El problema:</strong> {mistake.description}
                </p>

                <div style={{
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #86efac'
                }}>
                  <p style={{
                    color: '#166534',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    <strong>✅ La solución:</strong> {mistake.solution}
                  </p>
                </div>
              </div>
            ))}

            {/* Quick Win Section */}
            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              padding: '24px',
              marginTop: '40px',
              marginBottom: '40px',
              border: '2px solid #fbbf24'
            }}>
              <h3 style={{
                color: '#92400e',
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                ⚡ Quick Win para esta semana:
              </h3>
              <p style={{
                color: '#78350f',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: 0
              }}>
                {content.quickWin}
              </p>
            </div>

            {/* CTA */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              padding: '28px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#111827',
                fontSize: '20px',
                marginTop: 0,
                marginBottom: '16px'
              }}>
                ¿Cansado de estos errores?
              </h3>
              <p style={{
                color: '#374151',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                Itineramio automatiza exactamente los procesos donde los {archetype}s suelen fallar.<br />
                Pruébalo gratis durante 15 días.
              </p>

              <a
                href="https://www.itineramio.com/register"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Empezar prueba gratuita →
              </a>

              <p style={{
                color: '#9ca3af',
                fontSize: '13px',
                marginTop: '16px',
                marginBottom: 0
              }}>
                No requiere tarjeta de crédito
              </p>
            </div>

            {/* Signature */}
            <p style={{
              color: '#374151',
              fontSize: '15px',
              marginTop: '30px',
              marginBottom: '10px'
            }}>
              Un abrazo,<br />
              <strong>Alejandro</strong><br />
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Founder @ Itineramio</span>
            </p>

            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              PD: ¿Cuál de estos 3 errores te resonó más? Responde a este email, leo todos los mensajes personalmente.
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
              © {new Date().getFullYear()} Itineramio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default Day3MistakesEmail
