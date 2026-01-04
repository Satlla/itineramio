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

interface ToolReviewsDay0Props {
  name?: string
  propertyName?: string
}

export default function ToolReviewsDay0Delivery({
  name = 'anfitrión',
  propertyName = 'tu alojamiento'
}: ToolReviewsDay0Props) {
  return (
    <Html>
      <Head />
      <Preview>Tu Guía Rápida de Reseñas está lista para descargar</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>ITINERAMIO</Text>

          <Heading style={heading}>
            Tu plantilla de reseñas está lista
          </Heading>

          <Text style={paragraph}>
            Hola {name},
          </Text>

          <Text style={paragraph}>
            Gracias por descargar la <strong>Guía Rápida de Reseñas</strong>. Esta plantilla
            te ayudará a educar a tus huéspedes sobre cómo funciona el sistema de
            valoraciones en Airbnb.
          </Text>

          <Section style={tipBox}>
            <Text style={tipTitle}>Por qué es importante</Text>
            <Text style={tipText}>
              El 73% de los huéspedes no sabe que 4 estrellas en Airbnb significa
              "algo salió mal". Con esta guía, tus huéspedes entenderán que 5 estrellas
              = "todo según lo esperado".
            </Text>
          </Section>

          <Text style={paragraph}>
            <strong>Cómo usar tu plantilla:</strong>
          </Text>

          <Text style={listItem}>1. Descarga e imprime en A4</Text>
          <Text style={listItem}>2. Enmarca o plastifica para mayor durabilidad</Text>
          <Text style={listItem}>3. Colócala en un lugar visible (entrada, salón, mesita)</Text>
          <Text style={listItem}>4. El QR permite a huéspedes contactarte directamente</Text>

          <Section style={ctaSection}>
            <Link href="https://www.itineramio.com/recursos/plantilla-reviews" style={button}>
              Descargar mi plantilla
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={paragraph}>
            En los próximos días te enviaré más consejos para mejorar tus reseñas
            y mantener tu rating por encima de 4.8.
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

const tipBox = {
  backgroundColor: '#f8f8f8',
  borderLeft: '4px solid #1a1a1a',
  padding: '16px 20px',
  margin: '24px 0',
}

const tipTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px 0',
}

const tipText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const listItem = {
  color: '#444',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
  paddingLeft: '8px',
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
