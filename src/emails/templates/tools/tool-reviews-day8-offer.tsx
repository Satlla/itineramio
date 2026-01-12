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

interface ToolReviewsDay8Props {
  name?: string
  email?: string
}

export default function ToolReviewsDay8Offer({
  name = 'anfitrión',
  email = ''
}: ToolReviewsDay8Props) {
  return (
    <Html>
      <Head />
      <Preview>Última oportunidad: Automatiza tu comunicación con huéspedes</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>ITINERAMIO</Text>

          <Text style={badge}>ÚLTIMO EMAIL</Text>

          <Heading style={heading}>
            Automatiza tu comunicación con huéspedes
          </Heading>

          <Text style={paragraph}>
            Hola {name},
          </Text>

          <Text style={paragraph}>
            Durante esta semana te he compartido todo lo que sé sobre cómo
            mejorar tus reseñas. Ahora quiero hacerte una propuesta.
          </Text>

          <Section style={problemBox}>
            <Text style={problemTitle}>El problema real</Text>
            <Text style={problemText}>
              Las malas reseñas no vienen de malos alojamientos. Vienen de
              mala comunicación. Huéspedes que no saben cómo funciona la
              vitrocerámica. Que no encuentran el WiFi. Que llegan y no
              saben dónde está el parking.
            </Text>
          </Section>

          <Section style={solutionBox}>
            <Text style={solutionTitle}>La solución</Text>
            <Text style={solutionText}>
              <strong>Itineramio</strong> es un manual digital para tu alojamiento.
              Un único QR que da acceso a toda la información que tu huésped necesita:
            </Text>
            <Text style={listItem}>WiFi, instrucciones, normas de la casa</Text>
            <Text style={listItem}>Cómo usar electrodomésticos (con fotos)</Text>
            <Text style={listItem}>Recomendaciones de restaurantes y actividades</Text>
            <Text style={listItem}>Contacto directo contigo por WhatsApp</Text>
            <Text style={listItem}>Disponible en español, inglés y francés</Text>
          </Section>

          <Section style={resultBox}>
            <Text style={resultStat}>-70%</Text>
            <Text style={resultText}>
              Reducción media de mensajes de huéspedes
            </Text>
          </Section>

          <Section style={offerBox}>
            <Text style={offerTitle}>Oferta especial</Text>
            <Text style={offerText}>
              Por ser suscriptor de nuestro newsletter, tienes acceso a
              <strong> 15 días de prueba gratis</strong> sin necesidad de
              tarjeta de crédito.
            </Text>
            <Text style={offerText}>
              Además, si decides quedarte, el primer mes es a mitad de precio.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href="https://www.itineramio.com/register?utm_source=email&utm_medium=sequence&utm_campaign=tool-reviews" style={button}>
              Empezar prueba gratuita
            </Link>
            <Text style={ctaSubtext}>
              15 días gratis · Sin tarjeta · Cancela cuando quieras
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={paragraph}>
            Este es el último email de la serie. Si tienes cualquier pregunta,
            responde a este email y te contesto personalmente.
          </Text>

          <Text style={paragraph}>
            Gracias por tu tiempo y por confiar en nosotros.
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
  backgroundColor: '#7c3aed',
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

const problemBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  padding: '20px',
  margin: '24px 0',
}

const problemTitle = {
  color: '#991b1b',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px 0',
}

const problemText = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const solutionBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #22c55e',
  padding: '20px',
  margin: '24px 0',
}

const solutionTitle = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px 0',
}

const solutionText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
}

const listItem = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
  paddingLeft: '16px',
}

const resultBox = {
  backgroundColor: '#1a1a1a',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  textAlign: 'center' as const,
}

const resultStat = {
  color: '#ffffff',
  fontSize: '48px',
  fontWeight: '700' as const,
  margin: '0 0 8px 0',
}

const resultText = {
  color: '#999',
  fontSize: '14px',
  margin: '0',
}

const offerBox = {
  backgroundColor: '#faf5ff',
  border: '2px solid #7c3aed',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
}

const offerTitle = {
  color: '#7c3aed',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
}

const offerText = {
  color: '#6b21a8',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '16px 32px',
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
