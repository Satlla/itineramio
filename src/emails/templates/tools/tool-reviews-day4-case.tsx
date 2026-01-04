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

interface ToolReviewsDay4Props {
  name?: string
}

export default function ToolReviewsDay4Case({
  name = 'anfitrión'
}: ToolReviewsDay4Props) {
  return (
    <Html>
      <Head />
      <Preview>Caso real: De 4.2 a 4.9 estrellas en 3 meses</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>ITINERAMIO</Text>

          <Heading style={heading}>
            De 4.2 a 4.9 estrellas en 3 meses
          </Heading>

          <Text style={paragraph}>
            Hola {name},
          </Text>

          <Text style={paragraph}>
            Hoy quiero contarte el caso de <strong>María</strong>, una anfitriona
            de Valencia que estaba a punto de perder su status de SuperHost.
          </Text>

          <Section style={storyBox}>
            <Text style={storyTitle}>El problema</Text>
            <Text style={storyText}>
              María tenía un apartamento precioso en el centro de Valencia.
              Pero su rating había caído a 4.2 estrellas. Las quejas más
              comunes: "difícil encontrar el piso", "no sabía usar la vitro",
              "el WiFi iba lento".
            </Text>
          </Section>

          <Section style={storyBox}>
            <Text style={storyTitle}>El diagnóstico</Text>
            <Text style={storyText}>
              El apartamento estaba perfecto. El problema era la <strong>comunicación</strong>.
              María enviaba un PDF de 3 páginas con instrucciones que nadie leía.
              Los huéspedes llegaban perdidos y la bombardeaban con mensajes.
            </Text>
          </Section>

          <Section style={storyBox}>
            <Text style={storyTitle}>La solución</Text>
            <Text style={storyText}>
              María implementó 3 cambios simples:
            </Text>
            <Text style={listItem}>1. Manual digital con QR (en vez de PDF)</Text>
            <Text style={listItem}>2. Instrucciones con fotos paso a paso</Text>
            <Text style={listItem}>3. Mensaje automático pre-llegada con la info clave</Text>
          </Section>

          <Section style={resultBox}>
            <Text style={resultTitle}>El resultado</Text>
            <Text style={resultStat}>4.2 → 4.9</Text>
            <Text style={resultText}>
              En 3 meses pasó de 4.2 a 4.9 estrellas. Los mensajes de huéspedes
              bajaron un 70%. Y recuperó su status de SuperHost.
            </Text>
          </Section>

          <Section style={quoteBox}>
            <Text style={quoteText}>
              "Lo que más me sorprendió es que no tuve que cambiar nada del apartamento.
              Solo cómo comunicaba las cosas."
            </Text>
            <Text style={quoteAuthor}>— María, Valencia</Text>
          </Section>

          <Text style={paragraph}>
            ¿Quieres conseguir resultados similares?
          </Text>

          <Section style={blogBox}>
            <Text style={blogTitle}>📚 Lectura recomendada</Text>
            <Text style={blogText}>
              <strong>Manual Digital Apartamento Turístico: Guía Completa 2026</strong><br />
              Descubre cómo los mejores anfitriones organizan toda la información de su alojamiento en un solo lugar.
            </Text>
            <Link href="https://www.itineramio.com/blog/manual-digital-apartamento-turistico-guia-completa?utm_source=email&utm_medium=sequence&utm_campaign=tool-reviews" style={blogLink}>
              Leer artículo →
            </Link>
          </Section>

          <Section style={ctaSection}>
            <Link href="https://www.itineramio.com/register?utm_source=email&utm_medium=sequence&utm_campaign=tool-reviews" style={button}>
              Crear mi manual digital gratis
            </Link>
            <Text style={ctaSubtext}>
              15 días de prueba. Sin tarjeta de crédito.
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

const storyBox = {
  backgroundColor: '#f8f8f8',
  padding: '20px',
  margin: '16px 0',
  borderRadius: '8px',
}

const storyTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const storyText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const listItem = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '4px 0',
  paddingLeft: '8px',
}

const resultBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #22c55e',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  textAlign: 'center' as const,
}

const resultTitle = {
  color: '#166534',
  fontSize: '12px',
  fontWeight: '600' as const,
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const resultStat = {
  color: '#166534',
  fontSize: '36px',
  fontWeight: '700' as const,
  margin: '0 0 8px 0',
}

const resultText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const quoteBox = {
  borderLeft: '4px solid #1a1a1a',
  paddingLeft: '20px',
  margin: '24px 0',
}

const quoteText = {
  color: '#444',
  fontSize: '16px',
  fontStyle: 'italic' as const,
  lineHeight: '1.6',
  margin: '0 0 8px 0',
}

const quoteAuthor = {
  color: '#888',
  fontSize: '14px',
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

const blogBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const blogTitle = {
  color: '#0369a1',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px 0',
}

const blogText = {
  color: '#0c4a6e',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px 0',
}

const blogLink = {
  color: '#0369a1',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'none',
}
