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

interface ToolReviewsDay6Props {
  name?: string
}

export default function ToolReviewsDay6Negative({
  name = 'anfitrión'
}: ToolReviewsDay6Props) {
  return (
    <Html>
      <Head />
      <Preview>Plantilla gratuita: Cómo responder a reseñas negativas</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>ITINERAMIO</Text>

          <Text style={badge}>RECURSO GRATUITO</Text>

          <Heading style={heading}>
            Cómo responder a reseñas negativas
          </Heading>

          <Text style={paragraph}>
            Hola {name},
          </Text>

          <Text style={paragraph}>
            Las reseñas negativas duelen. Pero <strong>cómo respondes</strong> es
            lo que ven los futuros huéspedes. Una buena respuesta puede convertir
            una reseña de 3 estrellas en una oportunidad de mostrar tu profesionalidad.
          </Text>

          <Section style={templateBox}>
            <Text style={templateTitle}>Plantilla de respuesta profesional</Text>
            <Text style={templateText}>
              Hola [nombre del huésped],
              <br /><br />
              Gracias por tu feedback. Lamentamos que [problema específico] no
              cumpliera tus expectativas.
              <br /><br />
              [Si es algo que puedes mejorar]: Hemos tomado medidas para
              solucionarlo [describe brevemente qué has hecho].
              <br /><br />
              [Si fue un malentendido]: Nos habría encantado poder resolverlo
              durante tu estancia. Para futuras visitas, recuerda que estamos
              disponibles 24/7 a través de [WhatsApp/app].
              <br /><br />
              Gracias por ayudarnos a mejorar.
              <br />
              [Tu nombre]
            </Text>
          </Section>

          <Text style={sectionTitle}>Lo que SÍ hacer:</Text>

          <Section style={tipBox}>
            <Text style={tipText}>
              <strong>Responde rápido</strong> — Las respuestas en menos de 24h
              muestran que te importa.
            </Text>
          </Section>

          <Section style={tipBox}>
            <Text style={tipText}>
              <strong>Sé específico</strong> — Menciona el problema concreto.
              "Lamentamos el ruido del vecino" es mejor que "lamentamos las molestias".
            </Text>
          </Section>

          <Section style={tipBox}>
            <Text style={tipText}>
              <strong>Muestra acción</strong> — "Hemos instalado cortinas opacas"
              demuestra que escuchas y mejoras.
            </Text>
          </Section>

          <Text style={sectionTitle}>Lo que NO hacer:</Text>

          <Section style={errorBox}>
            <Text style={errorText}>
              <strong>Ponerte a la defensiva</strong> — "Eso no es cierto" solo
              empeora las cosas.
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorText}>
              <strong>Ignorar la reseña</strong> — El silencio dice "no me importa".
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorText}>
              <strong>Culpar al huésped</strong> — Aunque tengas razón, los futuros
              huéspedes verán un anfitrión conflictivo.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href="https://www.itineramio.com/blog/como-responder-resenas-negativas-airbnb" style={button}>
              Leer guía completa
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={paragraph}>
            Mañana te envío el último email de esta serie con una oferta especial
            para automatizar tu comunicación con huéspedes.
          </Text>

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
  margin: '0 0 16px 0',
}

const badge = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: '600' as const,
  letterSpacing: '1px',
  textAlign: 'center' as const,
  padding: '6px 12px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0 auto 16px auto',
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

const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '24px 0 12px 0',
}

const templateBox = {
  backgroundColor: '#f8f8f8',
  border: '1px solid #e5e5e5',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
}

const templateTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 12px 0',
}

const templateText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic' as const,
}

const tipBox = {
  backgroundColor: '#f0fdf4',
  padding: '12px 16px',
  margin: '8px 0',
  borderRadius: '6px',
}

const tipText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const errorBox = {
  backgroundColor: '#fef2f2',
  padding: '12px 16px',
  margin: '8px 0',
  borderRadius: '6px',
}

const errorText = {
  color: '#991b1b',
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
