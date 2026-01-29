import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface ToolReviewsDay2Props {
  name?: string
  email?: string
}

export default function ToolReviewsDay2Mistakes({
  name = 'anfitrión',
  email = ''
}: ToolReviewsDay2Props) {
  return (
    <Html>
      <Head />
      <Preview>Por qué te ponen 4 estrellas cuando "todo fue perfecto"</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>ITINERAMIO</Text>

          <Heading style={heading}>
            Por qué te ponen 4 estrellas cuando "todo fue perfecto"
          </Heading>

          <Text style={paragraph}>
            Hola {name},
          </Text>

          <Text style={paragraph}>
            ¿Te ha pasado? El huésped te dice que todo estuvo genial,
            que volverá seguro... y luego te deja 4 estrellas.
          </Text>

          <Text style={paragraph}>
            La realidad es que <strong>las 5 estrellas no se ganan con lo grande,
            sino con los pequeños detalles</strong>. Después de analizar cientos de propiedades,
            estos son los errores más comunes:
          </Text>

          <Section style={errorBox}>
            <Text style={errorNumber}>1</Text>
            <Text style={errorTitle}>Escatimar en la cama</Text>
            <Text style={errorText}>
              Si solo te quedas con una idea: <strong>en la cama NO se ahorra</strong>.
              Un mal colchón = reseña negativa garantizada. Un buen colchón =
              "Dormí como en un hotel de lujo" en tu reseña.
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorNumber}>2</Text>
            <Text style={errorTitle}>Sábanas de colores</Text>
            <Text style={errorText}>
              Las sábanas blancas no son casualidad: parecen de hotel, se pueden
              blanquear, transmiten limpieza absoluta y se reemplazan fácil si se manchan.
              Mínimo 300 hilos de algodón.
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorNumber}>3</Text>
            <Text style={errorTitle}>No tener cargadores en las mesillas</Text>
            <Text style={errorText}>
              Un huésped que puede cargar su móvil cómodamente desde la cama es un
              huésped feliz. Parece tonto, pero aparece constantemente en las reseñas.
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorNumber}>4</Text>
            <Text style={errorTitle}>Check-in confuso</Text>
            <Text style={errorText}>
              El huésped llega cansado del viaje. Si el check-in es complicado o tiene
              que llamarte para preguntar, empiezas con -1 estrella mental.
            </Text>
          </Section>

          <Section style={tipBox}>
            <Text style={tipTitle}>Detalle que aparece en el 40% de reseñas de 5 estrellas</Text>
            <Text style={tipText}>
              Agua fría en la nevera a la llegada + nota de bienvenida con el nombre del huésped.
              Coste: menos de 2€. Impacto: enorme. "Se nota que cuidan cada detalle."
            </Text>
          </Section>

          <Text style={paragraph}>
            Ahora que tienes la plantilla de reviews, el siguiente paso es <strong>automatizar
            las tareas que te quitan tiempo</strong>. Si dedicas menos horas a lo repetitivo,
            tendrás más energía para los detalles que generan 5 estrellas:
          </Text>

          <Section style={ctaSection}>
            <Link href="https://www.itineramio.com/blog/automatizacion-airbnb-recupera-8-horas-semanales" style={button}>
              Recuperar 8 horas a la semana →
            </Link>
            <Text style={ctaSubtext}>
              Mensajes automáticos, check-in sin contacto, limpieza programada...
              todo lo que puedes automatizar hoy.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={signature}>
            Un saludo,<br />
            El equipo de Itineramio
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            <Link href={`https://www.itineramio.com/api/email/unsubscribe?email=${encodeURIComponent(email || "")}`} style={footerLink}>
              Cancelar suscripción
            </Link>
            {' · '}
            <Link href="https://www.itineramio.com" style={footerLink}>
              itineramio.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const logo = {
  color: '#999',
  fontSize: '11px',
  fontWeight: '600' as const,
  letterSpacing: '2px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600' as const,
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
}

const paragraph = {
  color: '#444',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}

const errorBox = {
  backgroundColor: '#fff8f8',
  borderLeft: '4px solid #e53935',
  padding: '16px 20px',
  margin: '16px 0',
  position: 'relative' as const,
}

const errorNumber = {
  color: '#e53935',
  fontSize: '24px',
  fontWeight: '700' as const,
  margin: '0 0 4px 0',
}

const errorTitle = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: '600' as const,
  margin: '0 0 8px 0',
}

const errorText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const tipBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #22c55e',
  padding: '16px 20px',
  margin: '24px 0',
}

const tipTitle = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px 0',
}

const tipText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '14px 28px',
  textDecoration: 'none',
}

const ctaSubtext = {
  color: '#888',
  fontSize: '13px',
  margin: '12px 0 0 0',
}

const hr = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const signature = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const footer = {
  color: '#999',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
}

const footerLink = {
  color: '#999',
  textDecoration: 'underline',
}
